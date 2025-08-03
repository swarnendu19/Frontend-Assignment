/**
 * Integration tests for PDF generation with validation
 */

import { describe, it, expect, vi } from 'vitest';
import { generatePDF, validateUserDetailsForPDF } from './pdfGenerator';
import { validateFormData, isFormValid } from './validation';
import { UserDetails } from '../types';

// Mock jsPDF for integration tests
vi.mock('jspdf', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            save: vi.fn(),
            text: vi.fn(),
            setFontSize: vi.fn(),
            setTextColor: vi.fn(),
            setFont: vi.fn(),
            getTextWidth: vi.fn().mockReturnValue(50),
            line: vi.fn(),
            setDrawColor: vi.fn(),
            setLineWidth: vi.fn(),
            splitTextToSize: vi.fn().mockReturnValue(['Line 1']),
            addPage: vi.fn(),
        }))
    };
});

describe('PDF Generation Integration', () => {
    const validUserDetails: UserDetails = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        position: 'Software Developer',
        description: 'Experienced developer'
    };

    it('should generate PDF for form data that passes validation', async () => {
        // Verify form data is valid
        const validationErrors = validateFormData(validUserDetails);
        expect(Object.keys(validationErrors)).toHaveLength(0);
        expect(isFormValid(validUserDetails)).toBe(true);

        // Verify PDF validation passes
        expect(() => validateUserDetailsForPDF(validUserDetails)).not.toThrow();

        // Generate PDF
        const pdf = await generatePDF(validUserDetails);
        expect(pdf).toBeDefined();
    });

    it('should handle form data with validation errors appropriately', () => {
        const invalidUserDetails: UserDetails = {
            name: '', // Invalid - empty
            email: 'invalid-email', // Invalid - bad format
            phoneNumber: '123', // Invalid - too short
            position: 'Developer',
            description: 'Some description'
        };

        // Form validation should catch errors
        const validationErrors = validateFormData(invalidUserDetails);
        expect(validationErrors.name).toBeDefined();
        expect(validationErrors.email).toBeDefined();
        expect(validationErrors.phoneNumber).toBeDefined();
        expect(isFormValid(invalidUserDetails)).toBe(false);

        // PDF validation should also fail
        expect(() => validateUserDetailsForPDF(invalidUserDetails)).toThrow();
    });

    it('should handle optional fields correctly in both validation and PDF generation', async () => {
        const userDetailsWithOptionalFields: UserDetails = {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phoneNumber: '9876543210',
            position: '', // Optional - empty
            description: '' // Optional - empty
        };

        // Form validation should pass (position and description are optional)
        const validationErrors = validateFormData(userDetailsWithOptionalFields);
        expect(Object.keys(validationErrors)).toHaveLength(0);
        expect(isFormValid(userDetailsWithOptionalFields)).toBe(true);

        // PDF validation should pass (only name, email, phone are required)
        expect(() => validateUserDetailsForPDF(userDetailsWithOptionalFields)).not.toThrow();

        // PDF generation should work
        const pdf = await generatePDF(userDetailsWithOptionalFields);
        expect(pdf).toBeDefined();
    });
});