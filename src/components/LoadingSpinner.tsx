'use client';

/**
 * Loading Spinner Component
 * Displays a loading indicator during navigation or async operations
 */

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    message?: string;
}

/**
 * LoadingSpinner component for indicating loading states
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
    message = 'Loading...'
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
                role="status"
                aria-label={message}
            />
            {message && (
                <p className="mt-2 text-sm text-gray-600">
                    {message}
                </p>
            )}
        </div>
    );
};

/**
 * Full screen loading overlay component
 */
export const LoadingOverlay: React.FC<{ message?: string }> = ({
    message = 'Loading...'
}) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <LoadingSpinner size="lg" message={message} />
        </div>
    );
};