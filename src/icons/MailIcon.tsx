import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
    color?: string;
}

export const MailIcon: React.FC<IconProps> = ({
    size = 24,
    className = '',
    color = 'currentColor'
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            role="img"
            aria-label="Mail"
        >
            <path
                d="M5.33329 5.3335H26.6666C28.1333 5.3335 29.3333 6.5335 29.3333 8.00016V24.0002C29.3333 25.4668 28.1333 26.6668 26.6666 26.6668H5.33329C3.86663 26.6668 2.66663 25.4668 2.66663 24.0002V8.00016C2.66663 6.5335 3.86663 5.3335 5.33329 5.3335Z"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M29.3333 8L16 17.3333L2.66663 8"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};