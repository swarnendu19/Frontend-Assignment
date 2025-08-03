'use client';

/**
 * PDF Preview Screen Component
 * Displays user form data in PDF-like layout with navigation and download functionality
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFormContext } from '../../context/FormContext';
import { Button } from '../../components/Button';
import { ChevronLeftIcon, DownloadIcon } from '../../icons';
import { generateAndDownloadPDF } from '../../utils/pdfGenerator';

export default function PreviewPage() {
    const router = useRouter();
    const { formData } = useFormContext();

    /**
     * Handles back navigation to the form screen
     */
    const handleBack = () => {
        router.push('/');
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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        aria-label="Go back to form"
                    >
                        <ChevronLeftIcon size={20} className="mr-2" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                </div>

                {/* PDF Preview Container */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    {/* Document Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-blue-600 mb-2">
                            User Details
                        </h1>
                        <div className="w-24 h-0.5 bg-blue-600 mx-auto"></div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-blue-600 mb-4">
                            Personal Information
                        </h2>
                        <div className="space-y-3 ml-4">
                            <div className="flex">
                                <span className="font-semibold text-gray-600 w-32">Name:</span>
                                <span className="text-gray-800">{formData.name}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold text-gray-600 w-32">Email:</span>
                                <span className="text-gray-800">{formData.email}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold text-gray-600 w-32">Phone Number:</span>
                                <span className="text-gray-800">{formData.phoneNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-blue-600 mb-4">
                            Professional Information
                        </h2>
                        <div className="ml-4">
                            <div className="flex">
                                <span className="font-semibold text-gray-600 w-32">Position:</span>
                                <span className="text-gray-800">
                                    {formData.position || 'Not specified'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {formData.description.trim() && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-blue-600 mb-4">
                                Description
                            </h2>
                            <div className="ml-4">
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {formData.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-12 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400">
                            Generated on {new Date().toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Download Button */}
                <div className="text-center">
                    <Button
                        variant="primary"
                        icon={DownloadIcon}
                        onClick={handleDownloadPDF}
                        className="px-8"
                    >
                        Download PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}