/**
 * Tests for the main form page PDF download functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from './page';
import { FormProvider } from '../context/FormContext';
import * as pdfGenerator from '../utils/pdfGenerator';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock PDF generator
vi.mock('../utils/pdfGenerator', () => ({
    generateAndDownloadPDF: vi.fn(),
    validateUserDetailsForPDF: vi.fn(),
}));

// Mock window.alert
const mockAlert = vi.fn();
global.alert = mockAlert;

const renderWithProvider = (component: React.ReactElement) => {
    return render(
        <FormProvider>
            {component}
        </FormProvider>
    );
};

describe('Form Page PDF Download', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state during PDF generation', async () => {
        // Mock PDF generation to take some time
        const mockGenerateAndDownloadPDF = vi.mocked(pdfGenerator.generateAndDownloadPDF);
        mockGenerateAndDownloadPDF.mockImplementation(() =>
            new Promise(resolve => setTimeout(resolve, 100))
        );

        renderWithProvider(<Home />);

        // Fill in required fields using IDs to avoid ambiguity
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(document.getElementById('phoneNumber')!, { target: { value: '1234567890' } });

        // Click Download PDF button
        const downloadButton = screen.getByRole('button', { name: /download pdf/i });
        fireEvent.click(downloadButton);

        // Should show loading state
        expect(screen.getByText('Generating PDF...')).toBeInTheDocument();
        expect(downloadButton).toHaveTextContent('Generating PDF...');
        expect(downloadButton).toBeDisabled();

        // Wait for PDF generation to complete
        await waitFor(() => {
            expect(screen.queryByText('Generating PDF...')).not.toBeInTheDocument();
        });

        expect(mockGenerateAndDownloadPDF).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '1234567890',
            position: '',
            description: '',
        });
    });

    it('should handle PDF generation errors gracefully', async () => {
        const mockGenerateAndDownloadPDF = vi.mocked(pdfGenerator.generateAndDownloadPDF);
        mockGenerateAndDownloadPDF.mockRejectedValue(new Error('PDF generation failed'));

        renderWithProvider(<Home />);

        // Fill in required fields using IDs to avoid ambiguity
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(document.getElementById('phoneNumber')!, { target: { value: '1234567890' } });

        // Click Download PDF button
        const downloadButton = screen.getByRole('button', { name: /download pdf/i });
        fireEvent.click(downloadButton);

        // Wait for error handling
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('PDF generation failed');
        });

        // Loading state should be cleared
        expect(screen.queryByText('Generating PDF...')).not.toBeInTheDocument();
        expect(downloadButton).toHaveTextContent('Download PDF');
        expect(downloadButton).not.toBeDisabled();
    });

    it('should not generate PDF when form is invalid', async () => {
        const mockGenerateAndDownloadPDF = vi.mocked(pdfGenerator.generateAndDownloadPDF);

        renderWithProvider(<Home />);

        // Don't fill in required fields - form should be invalid
        const downloadButton = screen.getByRole('button', { name: /download pdf/i });

        // Button should be disabled
        expect(downloadButton).toBeDisabled();

        // Try to click (should not work)
        fireEvent.click(downloadButton);

        // PDF generation should not be called
        expect(mockGenerateAndDownloadPDF).not.toHaveBeenCalled();
    });

    it('should validate user details before PDF generation', async () => {
        const mockValidateUserDetailsForPDF = vi.mocked(pdfGenerator.validateUserDetailsForPDF);
        const mockGenerateAndDownloadPDF = vi.mocked(pdfGenerator.generateAndDownloadPDF);

        mockValidateUserDetailsForPDF.mockImplementation(() => {
            throw new Error('Missing required fields');
        });

        renderWithProvider(<Home />);

        // Fill in required fields for form validation using IDs to avoid ambiguity
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(document.getElementById('phoneNumber')!, { target: { value: '1234567890' } });

        // Click Download PDF button
        const downloadButton = screen.getByRole('button', { name: /download pdf/i });
        fireEvent.click(downloadButton);

        // Wait for validation error
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('Missing required fields');
        });

        // PDF generation should not be called
        expect(mockGenerateAndDownloadPDF).not.toHaveBeenCalled();
    });

    it('should generate PDF with all form data', async () => {
        const mockGenerateAndDownloadPDF = vi.mocked(pdfGenerator.generateAndDownloadPDF);
        mockGenerateAndDownloadPDF.mockResolvedValue();

        renderWithProvider(<Home />);

        // Fill in all fields using IDs to avoid ambiguity
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(document.getElementById('phoneNumber')!, { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Software Engineer' } });
        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Experienced developer' } });

        // Click Download PDF button
        const downloadButton = screen.getByRole('button', { name: /download pdf/i });
        fireEvent.click(downloadButton);

        // Wait for PDF generation
        await waitFor(() => {
            expect(mockGenerateAndDownloadPDF).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                phoneNumber: '1234567890',
                position: 'Software Engineer',
                description: 'Experienced developer',
            });
        });
    });
});