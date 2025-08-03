/**
 * Core TypeScript interfaces and types for the User Details PDF Application
 */

/**
 * Interface for user form data structure
 * Contains all fields that users can input in the form
 */
export interface UserDetails {
    name: string;
    email: string;
    phoneNumber: string;
    position: string;
    description: string;
}

/**
 * Interface for form validation errors
 * Contains error messages for fields that require validation
 */
export interface ValidationErrors {
    name?: string;
    email?: string;
    phoneNumber?: string;
}

/**
 * Interface for Form Context state management
 * Defines the shape of the context provider for global form state
 */
export interface FormContextType {
    formData: UserDetails;
    updateFormData: (data: Partial<UserDetails>) => void;
    errors: ValidationErrors;
    setErrors: (errors: ValidationErrors) => void;
    isValid: boolean;
}