/**
 * Unit tests for FormContext provider
 * Tests form state management, validation, and context methods
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { FormProvider, useFormContext } from './FormContext';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';

/**
 * Test component that uses FormContext to test functionality
 */
const TestComponent: React.FC = () => {
    const { formData, updateFormData, errors, setErrors, isValid } = useFormContext();

    return (
        <div>
            <div data-testid="form-data">{JSON.stringify(formData)}</div>
            <div data-testid="errors">{JSON.stringify(errors)}</div>
            <div data-testid="is-valid">{isValid.toString()}</div>
            <button
                data-testid="update-name"
                onClick={() => updateFormData({ name: 'John Doe' })}
            >
                Update Name
            </button>
            <button
                data-testid="update-email"
                onClick={() => updateFormData({ email: 'john@example.com' })}
            >
                Update Email
            </button>
            <button
                data-testid="update-phone"
                onClick={() => updateFormData({ phoneNumber: '1234567890' })}
            >
                Update Phone
            </button>
            <button
                data-testid="set-errors"
                onClick={() => setErrors({ name: 'Name error' })}
            >
                Set Errors
            </button>
        </div>
    );
};

describe('FormContext', () => {
    it('should provide initial form data and state', () => {
        render(
            <FormProvider>
                <TestComponent />
            </FormProvider>
        );

        const formData = JSON.parse(screen.getByTestId('form-data').textContent || '{}');
        const errors = JSON.parse(screen.getByTestId('errors').textContent || '{}');
        const isValid = screen.getByTestId('is-valid').textContent;

        expect(formData).toEqual({
            name: '',
            email: '',
            phoneNumber: '',
            position: '',
            description: '',
        });
        expect(errors).toEqual({});
        expect(isValid).toBe('false'); // Form is invalid when empty
    });

    it('should update form data correctly', () => {
        render(
            <FormProvider>
                <TestComponent />
            </FormProvider>
        );

        act(() => {
            screen.getByTestId('update-name').click();
        });

        const formData = JSON.parse(screen.getByTestId('form-data').textContent || '{}');
        expect(formData.name).toBe('John Doe');
    });

    it('should update multiple fields and maintain state', () => {
        render(
            <FormProvider>
                <TestComponent />
            </FormProvider>
        );

        act(() => {
            screen.getByTestId('update-name').click();
            screen.getByTestId('update-email').click();
            screen.getByTestId('update-phone').click();
        });

        const formData = JSON.parse(screen.getByTestId('form-data').textContent || '{}');
        expect(formData.name).toBe('John Doe');
        expect(formData.email).toBe('john@example.com');
        expect(formData.phoneNumber).toBe('1234567890');
    });

    it('should update validation errors', () => {
        render(
            <FormProvider>
                <TestComponent />
            </FormProvider>
        );

        act(() => {
            screen.getByTestId('set-errors').click();
        });

        const errors = JSON.parse(screen.getByTestId('errors').textContent || '{}');
        expect(errors.name).toBe('Name error');
    });

    it('should compute isValid correctly when form has valid data', () => {
        render(
            <FormProvider>
                <TestComponent />
            </FormProvider>
        );

        act(() => {
            screen.getByTestId('update-name').click();
            screen.getByTestId('update-email').click();
            screen.getByTestId('update-phone').click();
        });

        const isValid = screen.getByTestId('is-valid').textContent;
        expect(isValid).toBe('true');
    });

    it('should throw error when useFormContext is used outside provider', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useFormContext must be used within a FormProvider');

        consoleSpy.mockRestore();
    });
});