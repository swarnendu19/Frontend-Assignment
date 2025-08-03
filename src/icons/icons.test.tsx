import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
    ChevronLeftIcon,
    DescriptionIcon,
    DownloadIcon,
    MailIcon,
    PhoneIcon,
    PositionIcon,
    UserIcon,
    ViewIcon
} from './index';

describe('Icon Components', () => {
    it('should render ChevronLeftIcon with default props', () => {
        const { container } = render(<ChevronLeftIcon />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('width')).toBe('24');
        expect(svg?.getAttribute('height')).toBe('24');
        expect(svg?.getAttribute('aria-label')).toBe('Chevron left');
    });

    it('should render DescriptionIcon with custom props', () => {
        const { container } = render(
            <DescriptionIcon size={32} className="test-class" color="red" />
        );
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('width')).toBe('32');
        expect(svg?.getAttribute('height')).toBe('32');
        expect(svg?.getAttribute('class')).toBe('test-class');
        expect(svg?.getAttribute('aria-label')).toBe('Description');
    });

    it('should render DownloadIcon with white default color', () => {
        const { container } = render(<DownloadIcon />);
        const svg = container.querySelector('svg');
        const path = svg?.querySelector('path');
        expect(svg).toBeTruthy();
        expect(path?.getAttribute('stroke')).toBe('white');
        expect(svg?.getAttribute('aria-label')).toBe('Download');
    });

    it('should render MailIcon', () => {
        const { container } = render(<MailIcon />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('aria-label')).toBe('Mail');
    });

    it('should render PhoneIcon', () => {
        const { container } = render(<PhoneIcon />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('aria-label')).toBe('Phone');
    });

    it('should render PositionIcon', () => {
        const { container } = render(<PositionIcon />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('aria-label')).toBe('Position');
    });

    it('should render UserIcon', () => {
        const { container } = render(<UserIcon />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute('aria-label')).toBe('User');
    });

    it('should render ViewIcon with white default color', () => {
        const { container } = render(<ViewIcon />);
        const svg = container.querySelector('svg');
        const path = svg?.querySelector('path');
        expect(svg).toBeTruthy();
        expect(path?.getAttribute('stroke')).toBe('white');
        expect(svg?.getAttribute('aria-label')).toBe('View');
    });

    it('should handle all icons with custom sizing', () => {
        const icons = [
            ChevronLeftIcon,
            DescriptionIcon,
            DownloadIcon,
            MailIcon,
            PhoneIcon,
            PositionIcon,
            UserIcon,
            ViewIcon
        ];

        icons.forEach((IconComponent) => {
            const { container } = render(<IconComponent size={48} />);
            const svg = container.querySelector('svg');
            expect(svg?.getAttribute('width')).toBe('48');
            expect(svg?.getAttribute('height')).toBe('48');
        });
    });
});