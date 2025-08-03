/**
 * Form validation utilities for the User Details PDF Application
 * Contains validation functions for form fields with specific business rules
 */

import { ValidationErrors } from '../types';

/**
 * Email validation regex pattern
 * Validates standard email format: user@domain.extension
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates the name field
 * @param name - The name string to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validateName = (name: string): string | undefined => {
    if (!name || name.trim().length === 0) {
        return 'Name is required';
    }

    if (name.trim().length < 2) {
        return 'Name must be at least 2 characters long';
    }

    return undefined;
};

/**
 * Validates the email field using regex pattern
 * @param email - The email string to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validateEmail = (email: string): string | undefined => {
    if (!email || email.trim().length === 0) {
        return 'Email is required';
    }

    if (!EMAIL_REGEX.test(email.trim())) {
        return 'Please enter a valid email address';
    }

    return undefined;
};

/**
 * Validates the phone number field for minimum 10 digits
 * @param phoneNumber - The phone number string to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validatePhoneNumber = (phoneNumber: string): string | undefined => {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
        return 'Phone number is required';
    }

    // Extract only digits from the phone number
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
        return 'Phone number must contain at least 10 digits';
    }

    return undefined;
};

/**
 * Validates all form fields and returns validation errors
 * @param formData - Object containing form field values
 * @returns ValidationErrors object with any validation errors
 */
export const validateFormData = (formData: {
    name: string;
    email: string;
    phoneNumber: string;
}): ValidationErrors => {
    const errors: ValidationErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) {
        errors.name = nameError;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
        errors.email = emailError;
    }

    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
        errors.phoneNumber = phoneError;
    }

    return errors;
};

/**
 * Checks if the form data is valid (no validation errors)
 * @param formData - Object containing form field values
 * @returns True if all fields are valid, false otherwise
 */
export const isFormValid = (formData: {
    name: string;
    email: string;
    phoneNumber: string;
}): boolean => {
    const errors = validateFormData(formData);
    return Object.keys(errors).length === 0;
};