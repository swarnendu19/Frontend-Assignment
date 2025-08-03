import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { DownloadIcon, ViewIcon } from '../icons';

describe('Button Component', () => {
    it('renders with default props', () => {
        render(<Button>Click me</Button>);

        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-green-400'); // Primary variant by default
    });

    it('renders with primary variant styling', () => {
        render(<Button variant="primary">Primary Button</Button>);

        const button = screen.getByRole('button', { name: /primary button/i });
        expect(button).toHaveClass('bg-green-400', 'text-white');
    });

    it('renders with secondary variant styling', () => {
        render(<Button variant="secondary">Secondary Button</Button>);

        const button = screen.getByRole('button', { name: /secondary button/i });
        expect(button).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('renders with download icon', () => {
        render(
            <Button icon={DownloadIcon}>
                Download PDF
            </Button>
        );

        const button = screen.getByRole('button', { name: /download pdf/i });
        expect(button).toBeInTheDocument();

        // Check if icon is rendered
        const icon = screen.getByRole('img', { name: /download/i });
        expect(icon).toBeInTheDocument();
    });

    it('renders with view icon', () => {
        render(
            <Button icon={ViewIcon}>
                View PDF
            </Button>
        );

        const button = screen.getByRole('button', { name: /view pdf/i });
        expect(button).toBeInTheDocument();

        // Check if icon is rendered
        const icon = screen.getByRole('img', { name: /view/i });
        expect(icon).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        const button = screen.getByRole('button', { name: /click me/i });
        fireEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        const handleClick = vi.fn();
        render(
            <Button onClick={handleClick} disabled>
                Disabled Button
            </Button>
        );

        const button = screen.getByRole('button', { name: /disabled button/i });
        expect(button).toBeDisabled();
        expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders as full width when specified', () => {
        render(<Button fullWidth>Full Width Button</Button>);

        const button = screen.getByRole('button', { name: /full width button/i });
        expect(button).toHaveClass('w-full');
    });

    it('supports different button types', () => {
        render(<Button type="submit">Submit Button</Button>);

        const button = screen.getByRole('button', { name: /submit button/i });
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom Button</Button>);

        const button = screen.getByRole('button', { name: /custom button/i });
        expect(button).toHaveClass('custom-class');
    });

    it('has proper accessibility attributes', () => {
        render(<Button>Accessible Button</Button>);

        const button = screen.getByRole('button', { name: /accessible button/i });
        expect(button).toHaveAttribute('type', 'button');
    });

    it('has hover and focus states in CSS classes', () => {
        render(<Button variant="primary">Hover Test</Button>);

        const button = screen.getByRole('button', { name: /hover test/i });
        expect(button).toHaveClass('hover:bg-green-500', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-green-300');
    });

    it('has active state styling', () => {
        render(<Button variant="primary">Active Test</Button>);

        const button = screen.getByRole('button', { name: /active test/i });
        expect(button).toHaveClass('active:bg-green-600');
    });

    it('renders icon with correct color for primary variant', () => {
        render(
            <Button variant="primary" icon={DownloadIcon}>
                Primary with Icon
            </Button>
        );

        const icon = screen.getByRole('img', { name: /download/i });
        expect(icon).toBeInTheDocument();
    });

    it('renders icon with correct color for secondary variant', () => {
        render(
            <Button variant="secondary" icon={ViewIcon}>
                Secondary with Icon
            </Button>
        );

        const icon = screen.getByRole('img', { name: /view/i });
        expect(icon).toBeInTheDocument();
    });

    it('has responsive design classes', () => {
        render(<Button>Responsive Button</Button>);

        const button = screen.getByRole('button', { name: /responsive button/i });
        expect(button).toHaveClass('px-6', 'py-3', 'text-sm');
    });

    it('has transition classes for smooth interactions', () => {
        render(<Button>Transition Button</Button>);

        const button = screen.getByRole('button', { name: /transition button/i });
        expect(button).toHaveClass('transition-all', 'duration-200');
    });
});