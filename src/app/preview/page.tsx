'use client';

/**
 * PDF Preview Screen Component
 * Displays user form data in PDF-like layout with navigation and download functionality
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormContext } from '../../context/FormContext';
import { Button } from '../../components/Button';
import { ChevronLeftIcon, DownloadIcon } from '../../icons';
import { generateAndDownloadPDF } from '../../utils/pdfGenerator';

export default function PreviewPage() {
    const router = useRouter();
    const { formData } = useFormContext();

    /**
     * Redirect to form if no data is available
     * This handles cases where users navigate directly to preview page
     */
    useEffect(() => {
        // Check if required form data is missing
        if (!formData.name || !formData.email || !formData.phoneNumber) {
            console.warn('Missing required form data, redirecting to form');
            try {
                router.replace('/');
            } catch (error) {
                console.error('Navigation error during redirect:', error);
                window.location.href = '/';
            }
        }
    }, [formData, router]);

    /**
     * Handles back navigation to the form screen with error handling
     */
    const handleBack = () => {
        try {
            router.push('/');
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback: try window.location if router fails
            window.location.href = '/';
        }
    };

    /**
     * Handles PDF download from preview screen
     */
    const handleDownloadPDF = async () => {
        try {
            await generateAndDownloadPDF(formData);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            // TODO: Add user-friendly error handling
        }
    };

    return (
        <div className="min-h-screen bg-white px-4 py-6">
            <div className="max-w-md mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
                        aria-label="Go back to form"
                    >
                        <ChevronLeftIcon size={24} className="mr-1" color="#374151" />
                    </button>
                </div>

                {/* PDF Preview Container */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                    {/* Document Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-xl font-bold text-black mb-3">
                            User Details
                        </h1>
                        <div className="w-16 h-0.5 bg-black mx-auto"></div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="mb-6">
                        <h2 className="text-base font-bold text-black mb-4">
                            Personal Information
                        </h2>
                        <div className="space-y-3 pl-4">
                            <div className="flex flex-col">
                                <span className="font-semibold text-black text-sm">Name:</span>
                                <span className="text-gray-700 text-sm mt-1">{formData.name}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-black text-sm">Email:</span>
                                <span className="text-gray-700 text-sm mt-1">{formData.email}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-black text-sm">Phone Number:</span>
                                <span className="text-gray-700 text-sm mt-1">{formData.phoneNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information Section */}
                    <div className="mb-6">
                        <h2 className="text-base font-bold text-black mb-4">
                            Professional Information
                        </h2>
                        <div className="pl-4">
                            <div className="flex flex-col">
                                <span className="font-semibold text-black text-sm">Position:</span>
                                <span className="text-gray-700 text-sm mt-1">
                                    {formData.position || 'Not specified'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {formData.description.trim() && (
                        <div className="mb-6">
                            <h2 className="text-base font-bold text-black mb-4">
                                Description
                            </h2>
                            <div className="pl-4">
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {formData.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-8 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400">
                            Generated on {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Download Button */}
                <div className="w-full">
                    <Button
                        variant="primary"
                        icon={DownloadIcon}
                        onClick={handleDownloadPDF}
                        className="w-full py-3 text-base font-medium"
                    >
                        Download PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}