'use client';

/**
 * FormField component - Reusable form field with icon, label, and validation
 * Supports both single-line and multiline input types with error display
 */

import React, { ReactNode } from 'react';
import { IconProps } from '../icons';

/**
 * Props interface for FormField component
 */
interface FormFieldProps {
    /** Unique identifier for the input field */
    id: string;
    /** Field label text */
    label: string;
    /** Input field type - 'text', 'email', 'tel', or 'textarea' */
    type: 'text' | 'email' | 'tel' | 'textarea';
    /** Current field value */
    value: string;
    /** Placeholder text for the input */
    placeholder?: string;
    /** Icon component to display on the left side */
    icon: React.ComponentType<IconProps>;
    /** Error message to display below the field */
    error?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Callback function when field value changes */
    onChange: (value: string) => void;
    /** Callback function when field loses focus */
    onBlur?: () => void;
    /** Additional CSS classes for the container */
    className?: string;
}

/**
 * FormField component that renders a complete form field with icon, label, input, and error display
 */
export const FormField: React.FC<FormFieldProps> = ({
    id,
    label,
    type,
    value,
    placeholder,
    icon: Icon,
    error,
    required = false,
    onChange,
    onBlur,
    className = '',
}) => {
    /**
     * Handles input change events
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(event.target.value);
    };

    /**
     * Handles input blur events
     */
    const handleBlur = () => {
        if (onBlur) {
            onBlur();
        }
    };

    /**
     * Determines if the field has an error state
     */
    const hasError = Boolean(error);

    /**
     * Base input classes for styling
     */
    const inputBaseClasses = `
        w-full
        pl-12
        pr-4
        py-3
        border
        rounded-lg
        text-gray-900
        placeholder-gray-500
        focus:outline-none
        focus:ring-2
        focus:ring-green-500
        focus:border-transparent
        transition-colors
        duration-200
    `;

    /**
     * Error state classes
     */
    const errorClasses = hasError
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 hover:border-gray-400';

    /**
     * Combined input classes
     */
    const inputClasses = `${inputBaseClasses} ${errorClasses}`;

    /**
     * Renders the appropriate input element based on type
     */
    const renderInput = (): ReactNode => {
        if (type === 'textarea') {
            return (
                <textarea
                    id={id}
                    value={value}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={required}
                    rows={4}
                    className={`${inputClasses} resize-none`}
                    aria-describedby={hasError ? `${id}-error` : undefined}
                    aria-invalid={hasError}
                />
            );
        }

        return (
            <input
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
                onBlur={handleBlur}
                required={required}
                className={inputClasses}
                aria-describedby={hasError ? `${id}-error` : undefined}
                aria-invalid={hasError}
            />
        );
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Field Label */}
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-2"
            >
                {label}
                {required && (
                    <span className="text-red-500 ml-1" aria-label="required">
                        *
                    </span>
                )}
            </label>

            {/* Input Container with Icon */}
            <div className="relative">
                {/* Icon */}
                <div className="absolute left-3 top-3 flex items-center pointer-events-none">
                    <Icon
                        size={20}
                        className={`${hasError ? 'text-red-500' : 'text-gray-400'}`}
                        color="currentColor"
                    />
                </div>

                {/* Input Field */}
                {renderInput()}
            </div>

            {/* Error Message */}
            {hasError && (
                <p
                    id={`${id}-error`}
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}
        </div>
    );
};