import React from 'react';
import { Button } from './Button';
import { DownloadIcon, ViewIcon } from '../icons';

/**
 * Example usage of the Button component
 * This file demonstrates all the different ways to use the Button component
 */
export const ButtonExamples: React.FC = () => {
    const handleClick = () => {
        console.log('Button clicked!');
    };

    return (
        <div className="p-8 space-y-4">
            <h2 className="text-2xl font-bold mb-6">Button Component Examples</h2>

            {/* Primary Button (Default) */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Primary Buttons</h3>
                <Button onClick={handleClick}>
                    Primary Button
                </Button>

                <Button onClick={handleClick} icon={DownloadIcon}>
                    Download PDF
                </Button>

                <Button onClick={handleClick} icon={ViewIcon}>
                    View PDF
                </Button>
            </div>

            {/* Secondary Button */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Secondary Buttons</h3>
                <Button variant="secondary" onClick={handleClick}>
                    Secondary Button
                </Button>

                <Button variant="secondary" onClick={handleClick} icon={DownloadIcon}>
                    Download (Secondary)
                </Button>
            </div>

            {/* Full Width Buttons */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Full Width Buttons</h3>
                <Button fullWidth onClick={handleClick} icon={ViewIcon}>
                    View PDF (Full Width)
                </Button>

                <Button fullWidth variant="secondary" onClick={handleClick} icon={DownloadIcon}>
                    Download PDF (Full Width)
                </Button>
            </div>

            {/* Disabled Buttons */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Disabled Buttons</h3>
                <Button disabled onClick={handleClick}>
                    Disabled Primary
                </Button>

                <Button variant="secondary" disabled onClick={handleClick}>
                    Disabled Secondary
                </Button>
            </div>

            {/* Different Button Types */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Different Types</h3>
                <Button type="submit" onClick={handleClick}>
                    Submit Button
                </Button>

                <Button type="reset" variant="secondary" onClick={handleClick}>
                    Reset Button
                </Button>
            </div>
        </div>
    );
};