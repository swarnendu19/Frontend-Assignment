import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
    color?: string;
}

export const ChevronLeftIcon: React.FC<IconProps> = ({
    size = 24,
    className = '',
    color = 'currentColor'
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 53 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            role="img"
            aria-label="Chevron left"
        >
            <path
                d="M33.125 42L19.875 28L33.125 14"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};