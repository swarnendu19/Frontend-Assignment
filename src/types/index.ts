
export interface UserDetails {
    name: string;
    email: string;
    phoneNumber: string;
    position: string;
    description: string;
}


export interface ValidationErrors {
    name?: string;
    email?: string;
    phoneNumber?: string;
}


export interface FormContextType {
    formData: UserDetails;
    updateFormData: (data: Partial<UserDetails>) => void;
    errors: ValidationErrors;
    setErrors: (errors: ValidationErrors) => void;
    isValid: boolean;
}