/**
 * Tests for PDF generation utility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePDF, generateAndDownloadPDF, validateUserDetailsForPDF } from './pdfGenerator';
import { UserDetails } from '../types';

// Mock jsPDF
const mockSave = vi.fn();
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetFont = vi.fn();
const mockGetTextWidth = vi.fn().mockReturnValue(50);
const mockLine = vi.fn();
const mockSetDrawColor = vi.fn();
const mockSetLineWidth = vi.fn();
const mockSplitTextToSize = vi.fn().mockReturnValue(['Line 1', 'Line 2']);
const mockAddPage = vi.fn();

vi.mock('jspdf', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            save: mockSave,
            text: mockText,
            setFontSize: mockSetFontSize,
            setTextColor: mockSetTextColor,
            setFont: mockSetFont,
            getTextWidth: mockGetTextWidth,
            line: mockLine,
            setDrawColor: mockSetDrawColor,
            setLineWidth: mockSetLineWidth,
            splitTextToSize: mockSplitTextToSize,
            addPage: mockAddPage,
        }))
    };
});

describe('pdfGenerator', () => {
    const mockUserDetails: UserDetails = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        position: 'Software Developer',
        description: 'Experienced developer with expertise in React and TypeScript.'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validateUserDetailsForPDF', () => {
        it('should pass validation for complete user details', () => {
            expect(() => validateUserDetailsForPDF(mockUserDetails)).not.toThrow();
        });

        it('should throw error for missing name', () => {
            const invalidDetails = { ...mockUserDetails, name: '' };
            expect(() => validateUserDetailsForPDF(invalidDetails))
                .toThrow('Missing required fields: name');
        });

        it('should throw error for missing email', () => {
            const invalidDetails = { ...mockUserDetails, email: '' };
            expect(() => validateUserDetailsForPDF(invalidDetails))
                .toThrow('Missing required fields: email');
        });

        it('should throw error for missing phone number', () => {
            const invalidDetails = { ...mockUserDetails, phoneNumber: '' };
            expect(() => validateUserDetailsForPDF(invalidDetails))
                .toThrow('Missing required fields: phoneNumber');
        });

        it('should throw error for multiple missing fields', () => {
            const invalidDetails = { ...mockUserDetails, name: '', email: '' };
            expect(() => validateUserDetailsForPDF(invalidDetails))
                .toThrow('Missing required fields: name, email');
        });

        it('should allow empty position and description', () => {
            const validDetails = { ...mockUserDetails, position: '', description: '' };
            expect(() => validateUserDetailsForPDF(validDetails)).not.toThrow();
        });
    });

    describe('generatePDF', () => {
        it('should create PDF with correct structure', async () => {
            const pdf = await generatePDF(mockUserDetails);

            expect(pdf).toBeDefined();
            expect(mockText).toHaveBeenCalledWith('User Details', expect.any(Number), expect.any(Number));
            expect(mockText).toHaveBeenCalledWith('Name:', expect.any(Number), expect.any(Number));
            expect(mockText).toHaveBeenCalledWith('John Doe', expect.any(Number), expect.any(Number));
            expect(mockText).toHaveBeenCalledWith('Email:', expect.any(Number), expect.any(Number));
            expect(mockText).toHaveBeenCalledWith('john.doe@example.com', expect.any(Number), expect.any(Number));
        });

        it('should handle empty description by not adding description section', async () => {
            const userDetailsWithoutDescription = { ...mockUserDetails, description: '' };
            await generatePDF(userDetailsWithoutDescription);

            expect(mockText).not.toHaveBeenCalledWith('Description', expect.any(Number), expect.any(Number));
        });

        it('should handle empty position with default text', async () => {
            const userDetailsWithoutPosition = { ...mockUserDetails, position: '' };
            await generatePDF(userDetailsWithoutPosition);

            expect(mockText).toHaveBeenCalledWith('Not specified', expect.any(Number), expect.any(Number));
        });

        it('should set proper font styles and colors', async () => {
            await generatePDF(mockUserDetails);

            expect(mockSetFontSize).toHaveBeenCalledWith(20); // Title font size
            expect(mockSetFontSize).toHaveBeenCalledWith(14); // Section header font size
            expect(mockSetFontSize).toHaveBeenCalledWith(12); // Label font size
            expect(mockSetFontSize).toHaveBeenCalledWith(11); // Value font size

            expect(mockSetFont).toHaveBeenCalledWith('helvetica', 'bold');
            expect(mockSetFont).toHaveBeenCalledWith('helvetica', 'normal');
        });

        it('should add footer with timestamp', async () => {
            await generatePDF(mockUserDetails);

            expect(mockText).toHaveBeenCalledWith(
                expect.stringContaining('Generated on'),
                expect.any(Number),
                expect.any(Number)
            );
        });

        it('should handle multiline description', async () => {
            const userDetailsWithLongDescription = {
                ...mockUserDetails,
                description: 'This is a very long description that should be split into multiple lines'
            };

            await generatePDF(userDetailsWithLongDescription);

            expect(mockSplitTextToSize).toHaveBeenCalled();
            expect(mockText).toHaveBeenCalledWith('Line 1', expect.any(Number), expect.any(Number));
            expect(mockText).toHaveBeenCalledWith('Line 2', expect.any(Number), expect.any(Number));
        });
    });

    describe('generateAndDownloadPDF', () => {
        it('should generate and save PDF with default filename', async () => {
            await generateAndDownloadPDF(mockUserDetails);

            expect(mockSave).toHaveBeenCalledWith(
                expect.stringMatching(/john-doe-details-\d{4}-\d{2}-\d{2}\.pdf/)
            );
        });

        it('should generate and save PDF with custom filename', async () => {
            const customFilename = 'custom-filename.pdf';
            await generateAndDownloadPDF(mockUserDetails, customFilename);

            expect(mockSave).toHaveBeenCalledWith(customFilename);
        });

        it('should handle PDF generation errors gracefully', async () => {
            mockText.mockImplementationOnce(() => {
                throw new Error('PDF generation failed');
            });

            await expect(generateAndDownloadPDF(mockUserDetails))
                .rejects.toThrow('Failed to generate PDF. Please try again.');
        });
    });
});