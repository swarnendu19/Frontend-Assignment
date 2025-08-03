/**
 * Tests for PDF Preview Page Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PreviewPage from './page';
import { useFormContext } from '../../context/FormContext';
import { generateAndDownloadPDF } from '../../utils/pdfGenerator';

const mockPush = vi.fn();
const mockFormData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '1234567890',
    position: 'Software Developer',
    description: 'Experienced developer with expertise in React and TypeScript.',
};

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush,
    })),
}));

// Mock FormContext
vi.mock('../../context/FormContext', () => ({
    useFormContext: vi.fn(() => ({
        formData: mockFormData,
    })),
}));

// Mock PDF generator
vi.mock('../../utils/pdfGenerator', () => ({
    generateAndDownloadPDF: vi.fn(),
}));

describe('PreviewPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render preview page with form data', () => {
        render(<PreviewPage />);

        // Check if title is rendered
        expect(screen.getByText('User Details')).toBeInTheDocument();

        // Check if personal information is displayed
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();

        // Check if professional information is displayed
        expect(screen.getByText('Professional Information')).toBeInTheDocument();
        expect(screen.getByText('Software Developer')).toBeInTheDocument();

        // Check if description is displayed
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Experienced developer with expertise in React and TypeScript.')).toBeInTheDocument();
    });

    it('should handle back navigation', () => {
        render(<PreviewPage />);

        const backButton = screen.getByLabelText('Go back to form');
        fireEvent.click(backButton);

        expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should handle PDF download', async () => {
        render(<PreviewPage />);

        const downloadButton = screen.getByText('Download PDF');
        fireEvent.click(downloadButton);

        expect(generateAndDownloadPDF).toHaveBeenCalledWith(mockFormData);
    });

    it('should handle empty description gracefully', () => {
        const mockUseFormContext = vi.mocked(useFormContext);
        mockUseFormContext.mockReturnValue({
            formData: {
                ...mockFormData,
                description: '',
            },
            updateFormData: vi.fn(),
            errors: {},
            setErrors: vi.fn(),
            isValid: true,
        });

        render(<PreviewPage />);

        // Description section should not be rendered when empty
        expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('should handle empty position with default text', () => {
        const mockUseFormContext = vi.mocked(useFormContext);
        mockUseFormContext.mockReturnValue({
            formData: {
                ...mockFormData,
                position: '',
            },
            updateFormData: vi.fn(),
            errors: {},
            setErrors: vi.fn(),
            isValid: true,
        });

        render(<PreviewPage />);

        expect(screen.getByText('Not specified')).toBeInTheDocument();
    });

    it('should display generation timestamp', () => {
        render(<PreviewPage />);

        expect(screen.getByText(/Generated on/)).toBeInTheDocument();
    });
});