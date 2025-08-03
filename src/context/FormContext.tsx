'use client';

/**
 * FormContext provider for global form state management
 * Manages user form data, validation errors, and provides methods for updates
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserDetails, ValidationErrors, FormContextType } from '../types';
import { isFormValid } from '../utils/validation';

/**
 * Initial form data with empty values
 */
const initialFormData: UserDetails = {
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    description: '',
};

/**
 * Initial validation errors state
 */
const initialErrors: ValidationErrors = {};

/**
 * Create the FormContext with undefined default value
 * This ensures proper error handling when context is used outside provider
 */
const FormContext = createContext<FormContextType | undefined>(undefined);

/**
 * Props interface for FormProvider component
 */
interface FormProviderProps {
    children: ReactNode;
}

/**
 * FormProvider component that wraps the application with form state management
 * Provides form data, validation errors, and update methods to child components
 */
export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
    const [formData, setFormData] = useState<UserDetails>(initialFormData);
    const [errors, setErrors] = useState<ValidationErrors>(initialErrors);

    /**
     * Updates form data with partial data object
     * Merges new data with existing form data
     * @param data - Partial UserDetails object with fields to update
     */
    const updateFormData = (data: Partial<UserDetails>) => {
        setFormData(prevData => ({
            ...prevData,
            ...data,
        }));
    };

    /**
     * Updates validation errors state
     * @param newErrors - ValidationErrors object with current validation state
     */
    const setValidationErrors = (newErrors: ValidationErrors) => {
        setErrors(newErrors);
    };

    /**
     * Computed property that determines if the form is valid
     * Uses validation utility to check required fields
     */
    const isValid = isFormValid({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
    });

    /**
     * Context value object containing all form state and methods
     */
    const contextValue: FormContextType = {
        formData,
        updateFormData,
        errors,
        setErrors: setValidationErrors,
        isValid,
    };

    return (
        <FormContext.Provider value={contextValue}>
            {children}
        </FormContext.Provider>
    );
};

/**
 * Custom hook to access FormContext
 * Provides type-safe access to form context with proper error handling
 * @returns FormContextType object with form state and methods
 * @throws Error if used outside of FormProvider
 */
export const useFormContext = (): FormContextType => {
    const context = useContext(FormContext);

    if (context === undefined) {
        throw new Error('useFormContext must be used within a FormProvider');
    }

    return context;
};