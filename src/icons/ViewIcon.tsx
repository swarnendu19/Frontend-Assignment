import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
    color?: string;
}

export const ViewIcon: React.FC<IconProps> = ({
    size = 24,
    className = '',
    color = 'white'
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 43 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            role="img"
            aria-label="View"
        >
            <path
                d="M1.79163 16.5C1.79163 16.5 8.95829 5.5 21.5 5.5C34.0416 5.5 41.2083 16.5 41.2083 16.5C41.2083 16.5 34.0416 27.5 21.5 27.5C8.95829 27.5 1.79163 16.5 1.79163 16.5Z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M21.5 20.625C24.4685 20.625 26.875 18.7782 26.875 16.5C26.875 14.2218 24.4685 12.375 21.5 12.375C18.5315 12.375 16.125 14.2218 16.125 16.5C16.125 18.7782 18.5315 20.625 21.5 20.625Z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};