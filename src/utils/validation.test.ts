/**
 * Unit tests for form validation utilities
 * Tests all validation functions with various input scenarios
 */

import { describe, it, expect } from 'vitest';
import {
    validateName,
    validateEmail,
    validatePhoneNumber,
    validateFormData,
    isFormValid
} from './validation';

describe('validateName', () => {
    it('should return undefined for valid names', () => {
        expect(validateName('John Doe')).toBeUndefined();
        expect(validateName('Jane')).toBeUndefined();
        expect(validateName('Mary Jane Smith')).toBeUndefined();
        expect(validateName('Al')).toBeUndefined(); // Minimum 2 characters
    });

    it('should return error for empty or whitespace-only names', () => {
        expect(validateName('')).toBe('Name is required');
        expect(validateName('   ')).toBe('Name is required');
        expect(validateName('\t\n')).toBe('Name is required');
    });

    it('should return error for names shorter than 2 characters', () => {
        expect(validateName('A')).toBe('Name must be at least 2 characters long');
        expect(validateName(' B ')).toBe('Name must be at least 2 characters long');
    });

    it('should handle names with special characters', () => {
        expect(validateName("O'Connor")).toBeUndefined();
        expect(validateName('Jean-Pierre')).toBeUndefined();
        expect(validateName('José María')).toBeUndefined();
    });
});

describe('validateEmail', () => {
    it('should return undefined for valid email addresses', () => {
        expect(validateEmail('user@example.com')).toBeUndefined();
        expect(validateEmail('test.email@domain.co.uk')).toBeUndefined();
        expect(validateEmail('user+tag@example.org')).toBeUndefined();
        expect(validateEmail('firstname.lastname@company.com')).toBeUndefined();
        expect(validateEmail('user123@test-domain.net')).toBeUndefined();
    });

    it('should return error for empty or whitespace-only emails', () => {
        expect(validateEmail('')).toBe('Email is required');
        expect(validateEmail('   ')).toBe('Email is required');
        expect(validateEmail('\t\n')).toBe('Email is required');
    });

    it('should return error for invalid email formats', () => {
        expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
        expect(validateEmail('user@')).toBe('Please enter a valid email address');
        expect(validateEmail('@domain.com')).toBe('Please enter a valid email address');
        expect(validateEmail('user@domain')).toBe('Please enter a valid email address');
        expect(validateEmail('user.domain.com')).toBe('Please enter a valid email address');
        expect(validateEmail('user@domain.')).toBe('Please enter a valid email address');
        expect(validateEmail('user@.domain.com')).toBe('Please enter a valid email address');
    });

    it('should handle emails with whitespace by trimming', () => {
        expect(validateEmail('  user@example.com  ')).toBeUndefined();
        expect(validateEmail('\ttest@domain.org\n')).toBeUndefined();
    });
});

describe('validatePhoneNumber', () => {
    it('should return undefined for valid phone numbers with at least 10 digits', () => {
        expect(validatePhoneNumber('1234567890')).toBeUndefined();
        expect(validatePhoneNumber('12345678901')).toBeUndefined(); // 11 digits
        expect(validatePhoneNumber('123456789012')).toBeUndefined(); // 12 digits
    });

    it('should return undefined for formatted phone numbers with at least 10 digits', () => {
        expect(validatePhoneNumber('(123) 456-7890')).toBeUndefined();
        expect(validatePhoneNumber('123-456-7890')).toBeUndefined();
        expect(validatePhoneNumber('123.456.7890')).toBeUndefined();
        expect(validatePhoneNumber('+1 (123) 456-7890')).toBeUndefined();
        expect(validatePhoneNumber('+44 20 7946 0958')).toBeUndefined();
        expect(validatePhoneNumber('123 456 7890')).toBeUndefined();
    });

    it('should return error for empty or whitespace-only phone numbers', () => {
        expect(validatePhoneNumber('')).toBe('Phone number is required');
        expect(validatePhoneNumber('   ')).toBe('Phone number is required');
        expect(validatePhoneNumber('\t\n')).toBe('Phone number is required');
    });

    it('should return error for phone numbers with fewer than 10 digits', () => {
        expect(validatePhoneNumber('123456789')).toBe('Phone number must contain at least 10 digits');
        expect(validatePhoneNumber('123-456-789')).toBe('Phone number must contain at least 10 digits');
        expect(validatePhoneNumber('(123) 456-789')).toBe('Phone number must contain at least 10 digits');
        expect(validatePhoneNumber('abc-def-ghij')).toBe('Phone number must contain at least 10 digits'); // No digits
    });

    it('should handle phone numbers with mixed characters', () => {
        expect(validatePhoneNumber('Call me at 123-456-7890')).toBeUndefined(); // Contains 10 digits
        expect(validatePhoneNumber('Phone: (555) 123-4567')).toBeUndefined(); // Contains 10 digits
    });
});

describe('validateFormData', () => {
    it('should return empty errors object for valid form data', () => {
        const validData = {
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '(123) 456-7890'
        };

        const errors = validateFormData(validData);
        expect(errors).toEqual({});
    });

    it('should return errors for all invalid fields', () => {
        const invalidData = {
            name: '',
            email: 'invalid-email',
            phoneNumber: '123'
        };

        const errors = validateFormData(invalidData);
        expect(errors).toEqual({
            name: 'Name is required',
            email: 'Please enter a valid email address',
            phoneNumber: 'Phone number must contain at least 10 digits'
        });
    });

    it('should return errors only for invalid fields', () => {
        const mixedData = {
            name: 'John Doe', // Valid
            email: 'invalid-email', // Invalid
            phoneNumber: '1234567890' // Valid
        };

        const errors = validateFormData(mixedData);
        expect(errors).toEqual({
            email: 'Please enter a valid email address'
        });
    });

    it('should handle edge cases', () => {
        const edgeData = {
            name: 'Al', // Minimum valid length
            email: 'a@b.co', // Minimum valid email
            phoneNumber: '1234567890' // Minimum valid digits
        };

        const errors = validateFormData(edgeData);
        expect(errors).toEqual({});
    });
});

describe('isFormValid', () => {
    it('should return true for valid form data', () => {
        const validData = {
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '(123) 456-7890'
        };

        expect(isFormValid(validData)).toBe(true);
    });

    it('should return false for invalid form data', () => {
        const invalidData = {
            name: '',
            email: 'invalid-email',
            phoneNumber: '123'
        };

        expect(isFormValid(invalidData)).toBe(false);
    });

    it('should return false if any field is invalid', () => {
        const mixedData = {
            name: 'John Doe', // Valid
            email: 'invalid-email', // Invalid
            phoneNumber: '1234567890' // Valid
        };

        expect(isFormValid(mixedData)).toBe(false);
    });

    it('should return true for edge case valid data', () => {
        const edgeData = {
            name: 'Al', // Minimum valid
            email: 'a@b.co', // Minimum valid
            phoneNumber: '1234567890' // Minimum valid
        };

        expect(isFormValid(edgeData)).toBe(true);
    });
});