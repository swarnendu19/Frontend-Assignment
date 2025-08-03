import React from 'react';
import { IconProps } from '../icons';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary';

/**
 * Button component props interface
 */
export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    icon?: React.ComponentType<IconProps>;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    fullWidth?: boolean;
}

/**
 * Reusable Button component with consistent styling and icon support
 * Supports different variants and responsive design
 */
export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    icon: Icon,
    disabled = false,
    type = 'button',
    className = '',
    fullWidth = false
}) => {
    // Base button styles
    const baseStyles = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Variant-specific styles
    const variantStyles = {
        primary: 'bg-green-400 hover:bg-green-500 text-white focus:ring-green-300 active:bg-green-600',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300 active:bg-gray-300'
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combine all styles
    const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={buttonStyles}
        >
            {Icon && (
                <Icon
                    size={20}
                    color={variant === 'primary' ? 'white' : '#374151'}
                />
            )}
            {children}
        </button>
    );
};