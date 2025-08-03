/**
 * Test suite for FormField component
 * Tests rendering, user interactions, validation display, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormField } from './FormField';
import { UserIcon } from '../icons';

// Mock icon component for testing
const MockIcon = ({ size, className, color }: { size?: number; className?: string; color?: string }) => (
    <div data-testid="mock-icon" data-size={size} className={className} style={{ color }}>
        Icon
    </div>
);

describe('FormField Component', () => {
    const defaultProps = {
        id: 'test-field',
        label: 'Test Field',
        type: 'text' as const,
        value: '',
        icon: MockIcon,
        onChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders with basic props', () => {
            render(<FormField {...defaultProps} />);

            expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
            expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
        });

        it('renders label with required indicator when required', () => {
            render(<FormField {...defaultProps} required />);

            expect(screen.getByText('*')).toBeInTheDocument();
            expect(screen.getByText('*')).toHaveAttribute('aria-label', 'required');
        });

        it('renders placeholder text', () => {
            const placeholder = 'Enter your text here';
            render(<FormField {...defaultProps} placeholder={placeholder} />);

            expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
        });

        it('renders with custom className', () => {
            const customClass = 'custom-form-field';
            render(<FormField {...defaultProps} className={customClass} />);

            const container = screen.getByLabelText('Test Field').closest('.custom-form-field');
            expect(container).toBeInTheDocument();
        });
    });

    describe('Input Types', () => {
        it('renders text input by default', () => {
            render(<FormField {...defaultProps} />);

            const input = screen.getByLabelText('Test Field');
            expect(input).toBeInTheDocument();
            expect(input.tagName).toBe('INPUT');
            expect(input).toHaveAttribute('type', 'text');
        });

        it('renders email input when type is email', () => {
            render(<FormField {...defaultProps} type="email" />);

            const input = screen.getByLabelText('Test Field');
            expect(input).toHaveAttribute('type', 'email');
        });

        it('renders tel input when type is tel', () => {
            render(<FormField {...defaultProps} type="tel" />);

            const input = screen.getByLabelText('Test Field');
            expect(input).toHaveAttribute('type', 'tel');
        });

        it('renders textarea when type is textarea', () => {
            render(<FormField {...defaultProps} type="textarea" />);

            const textarea = screen.getByLabelText('Test Field');
            expect(textarea.tagName).toBe('TEXTAREA');
            expect(textarea).toHaveAttribute('rows', '4');
        });
    });

    describe('User Interactions', () => {
        it('calls onChange when input value changes', () => {
            const onChange = vi.fn();
            render(<FormField {...defaultProps} onChange={onChange} />);

            const input = screen.getByLabelText('Test Field');
            fireEvent.change(input, { target: { value: 'new value' } });

            expect(onChange).toHaveBeenCalledWith('new value');
        });

        it('calls onBlur when input loses focus', () => {
            const onBlur = vi.fn();
            render(<FormField {...defaultProps} onBlur={onBlur} />);

            const input = screen.getByLabelText('Test Field');
            fireEvent.blur(input);

            expect(onBlur).toHaveBeenCalled();
        });

        it('displays current value in input', () => {
            const value = 'current value';
            render(<FormField {...defaultProps} value={value} />);

            const input = screen.getByLabelText('Test Field') as HTMLInputElement;
            expect(input.value).toBe(value);
        });

        it('handles textarea value changes', () => {
            const onChange = vi.fn();
            render(<FormField {...defaultProps} type="textarea" onChange={onChange} />);

            const textarea = screen.getByLabelText('Test Field');
            fireEvent.change(textarea, { target: { value: 'textarea content' } });

            expect(onChange).toHaveBeenCalledWith('textarea content');
        });
    });

    describe('Error Handling', () => {
        it('displays error message when error prop is provided', () => {
            const errorMessage = 'This field is required';
            render(<FormField {...defaultProps} error={errorMessage} />);

            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('applies error styling when error is present', () => {
            const errorMessage = 'This field is required';
            render(<FormField {...defaultProps} error={errorMessage} />);

            const input = screen.getByLabelText('Test Field');
            expect(input).toHaveClass('border-red-500');
        });

        it('changes icon color when error is present', () => {
            const errorMessage = 'This field is required';
            render(<FormField {...defaultProps} error={errorMessage} />);

            const icon = screen.getByTestId('mock-icon');
            expect(icon).toHaveClass('text-red-500');
        });

        it('does not display error message when no error', () => {
            render(<FormField {...defaultProps} />);

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('associates label with input using htmlFor and id', () => {
            render(<FormField {...defaultProps} />);

            const label = screen.getByText('Test Field');
            const input = screen.getByLabelText('Test Field');

            expect(label).toHaveAttribute('for', 'test-field');
            expect(input).toHaveAttribute('id', 'test-field');
        });

        it('sets aria-invalid when error is present', () => {
            const errorMessage = 'This field is required';
            render(<FormField {...defaultProps} error={errorMessage} />);

            const input = screen.getByLabelText('Test Field');
            expect(input).toHaveAttribute('aria-invalid', 'true');
        });

        it('sets aria-describedby when error is present', () => {
            const errorMessage = 'This field is required';
            render(<FormField {...defaultProps} error={errorMessage} />);

            const input = screen.getByLabelText('Test Field');
            expect(input).toHaveAttribute('aria-describedby', 'test-field-error');
        });

        it('error message has proper ARIA attributes', () => {
            const errorMessage = 'This field is required';
            render(<FormField {...defaultProps} error={errorMessage} />);

            const errorElement = screen.getByText(errorMessage);
            expect(errorElement).toHaveAttribute('role', 'alert');
            expect(errorElement).toHaveAttribute('aria-live', 'polite');
            expect(errorElement).toHaveAttribute('id', 'test-field-error');
        });

        it('sets required attribute when required prop is true', () => {
            render(<FormField {...defaultProps} required />);

            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('required');
        });
    });

    describe('Icon Integration', () => {
        it('renders icon with default props', () => {
            render(<FormField {...defaultProps} />);

            const icon = screen.getByTestId('mock-icon');
            expect(icon).toHaveAttribute('data-size', '20');
            expect(icon).toHaveClass('text-gray-400');
        });

        it('renders icon with error styling when error is present', () => {
            const errorMessage = 'Error message';
            render(<FormField {...defaultProps} error={errorMessage} />);

            const icon = screen.getByTestId('mock-icon');
            expect(icon).toHaveClass('text-red-500');
        });

        it('works with real icon components', () => {
            render(<FormField {...defaultProps} icon={UserIcon} />);

            // Should render without errors and contain SVG
            const svg = screen.getByRole('img', { name: 'User' });
            expect(svg).toBeInTheDocument();
        });
    });

    describe('Styling and Layout', () => {
        it('applies focus styles correctly', () => {
            render(<FormField {...defaultProps} />);

            const input = screen.getByLabelText('Test Field');
            expect(input).toHaveClass('focus:ring-2', 'focus:ring-green-500', 'focus:border-transparent');
        });

        it('applies hover styles correctly', () => {
            render(<FormField {...defaultProps} />);

            const input = screen.getByLabelText('Test Field');
            expect(input).toHaveClass('hover:border-gray-400');
        });

        it('textarea has resize-none class', () => {
            render(<FormField {...defaultProps} type="textarea" />);

            const textarea = screen.getByLabelText('Test Field');
            expect(textarea).toHaveClass('resize-none');
        });
    });
});