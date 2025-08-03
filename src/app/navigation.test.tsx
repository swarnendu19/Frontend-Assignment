
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './page';
import PreviewPage from './preview/page';
import { FormProvider } from '../context/FormContext';

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush,
        replace: mockReplace,
    })),
}));

// Mock PDF generator
vi.mock('../utils/pdfGenerator', () => ({
    generateAndDownloadPDF: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

const renderWithFormProvider = (component: React.ReactElement) => {
    return render(
        <FormProvider>
            {component}
        </FormProvider>
    );
};

describe('Navigation Functionality', () => {
    describe('Form to Preview Navigation', () => {
        it('should navigate to preview when View PDF is clicked with valid data', async () => {
            renderWithFormProvider(<Home />);

            // Fill in required fields
            const nameInput = screen.getByRole('textbox', { name: /name/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const phoneInput = screen.getByRole('textbox', { name: /phone number/i });

            fireEvent.change(nameInput, { target: { value: 'John Doe' } });
            fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
            fireEvent.change(phoneInput, { target: { value: '1234567890' } });

            // Click View PDF button
            const viewPdfButton = screen.getByRole('button', { name: /view pdf/i });
            fireEvent.click(viewPdfButton);

            // Verify navigation was called
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/preview');
            });
        });

        it('should not navigate to preview with invalid data', async () => {
            renderWithFormProvider(<Home />);

            // Click View PDF button without filling required fields
            const viewPdfButton = screen.getByRole('button', { name: /view pdf/i });
            fireEvent.click(viewPdfButton);

            // Verify navigation was not called
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('should show loading state during navigation', async () => {
            renderWithFormProvider(<Home />);

            // Fill in required fields
            const nameInput = screen.getByRole('textbox', { name: /name/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const phoneInput = screen.getByRole('textbox', { name: /phone number/i });

            fireEvent.change(nameInput, { target: { value: 'John Doe' } });
            fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
            fireEvent.change(phoneInput, { target: { value: '1234567890' } });

            // Click View PDF button
            const viewPdfButton = screen.getByRole('button', { name: /view pdf/i });
            fireEvent.click(viewPdfButton);

            // Check for loading state
            expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });

        it('should handle navigation errors gracefully', async () => {
            // Mock router.push to throw an error
            mockPush.mockImplementationOnce(() => {
                throw new Error('Navigation failed');
            });

            // Mock window.location.href
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
            });

            renderWithFormProvider(<Home />);

            // Fill in required fields
            const nameInput = screen.getByRole('textbox', { name: /name/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const phoneInput = screen.getByRole('textbox', { name: /phone number/i });

            fireEvent.change(nameInput, { target: { value: 'John Doe' } });
            fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
            fireEvent.change(phoneInput, { target: { value: '1234567890' } });

            // Click View PDF button
            const viewPdfButton = screen.getByRole('button', { name: /view pdf/i });
            fireEvent.click(viewPdfButton);

            // Verify fallback navigation was attempted
            await waitFor(() => {
                expect(mockLocation.href).toBe('/preview');
            });
        });
    });

    describe('Preview to Form Navigation', () => {
        it('should navigate back to form when back button is clicked', async () => {
            renderWithFormProvider(<PreviewPage />);

            // Find and click back button
            const backButton = screen.getByRole('button', { name: /go back to form/i });
            fireEvent.click(backButton);

            // Verify navigation was called
            expect(mockPush).toHaveBeenCalledWith('/');
        });

        it('should handle back navigation errors gracefully', async () => {
            // Mock router.push to throw an error
            mockPush.mockImplementationOnce(() => {
                throw new Error('Navigation failed');
            });

            // Mock window.location.href
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true,
            });

            renderWithFormProvider(<PreviewPage />);

            // Find and click back button
            const backButton = screen.getByRole('button', { name: /go back to form/i });
            fireEvent.click(backButton);

            // Verify fallback navigation was attempted
            await waitFor(() => {
                expect(mockLocation.href).toBe('/');
            });
        });
    });

    describe('Data Persistence', () => {
        it('should preserve form data across navigation', async () => {
            const { rerender } = renderWithFormProvider(<Home />);

            // Fill in form data
            const nameInput = screen.getByRole('textbox', { name: /name/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const phoneInput = screen.getByRole('textbox', { name: /phone number/i });
            const positionInput = screen.getByRole('textbox', { name: /position/i });

            fireEvent.change(nameInput, { target: { value: 'John Doe' } });
            fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
            fireEvent.change(phoneInput, { target: { value: '1234567890' } });
            fireEvent.change(positionInput, { target: { value: 'Developer' } });

            // Simulate navigation to preview page
            rerender(
                <FormProvider>
                    <PreviewPage />
                </FormProvider>
            );

            // Verify data is displayed in preview
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
            expect(screen.getByText('1234567890')).toBeInTheDocument();
            expect(screen.getByText('Developer')).toBeInTheDocument();

            // Simulate navigation back to form
            rerender(
                <FormProvider>
                    <Home />
                </FormProvider>
            );

            // Verify data is preserved in form
            expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
            expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Developer')).toBeInTheDocument();
        });
    });

    describe('Route Protection', () => {
        it('should redirect to form when accessing preview without required data', async () => {
            renderWithFormProvider(<PreviewPage />);

            // Verify redirect was called due to missing required data
            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/');
            });
        });
    });
});