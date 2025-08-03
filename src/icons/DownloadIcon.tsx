import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
    color?: string;
}

export const DownloadIcon: React.FC<IconProps> = ({
    size = 24,
    className = '',
    color = 'white'
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 52 49"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            role="img"
            aria-label="Download"
        >
            <path
                d="M45.4052 30.8945L45.3592 38.9266C45.3531 39.9918 44.8985 41.0107 44.0953 41.7593C43.2921 42.5079 42.2061 42.9248 41.0764 42.9183L11.2572 42.7477C10.1274 42.7413 9.04635 42.312 8.25177 41.5542C7.4572 40.7965 7.01424 39.7724 7.02033 38.7073L7.06627 30.6752"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15.6434 20.6838L26.2356 30.7849L36.9427 20.8057"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M26.2357 30.7853L26.3735 6.68896"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};