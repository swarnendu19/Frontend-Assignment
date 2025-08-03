'use client';

/**
 * Main form screen for User Details PDF Application
 * Provides form interface with validation and PDF generation capabilities
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormContext } from '../context/FormContext';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { LoadingOverlay } from '../components/LoadingSpinner';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  PositionIcon,
  DescriptionIcon,
  ViewIcon,
  DownloadIcon
} from '../icons';
import { validateFormData } from '../utils/validation';
import { generateAndDownloadPDF, validateUserDetailsForPDF } from '../utils/pdfGenerator';

export default function Home() {
  const router = useRouter();
  const { formData, updateFormData, errors, setErrors, isValid } = useFormContext();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  /**
   * Handles form field changes and clears related errors
   */
  const handleFieldChange = (field: keyof typeof formData) => (value: string) => {
    updateFormData({ [field]: value });

    // Clear error for this field when user starts typing
    if (errors[field as keyof typeof errors]) {
      const newErrors = { ...errors };
      delete newErrors[field as keyof typeof errors];
      setErrors(newErrors);
    }
  };

  /**
   * Handles field blur events for validation
   */
  const handleFieldBlur = (field: keyof typeof formData) => () => {
    const fieldErrors = validateFormData({
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    });

    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setErrors({
        ...errors,
        [field]: fieldErrors[field as keyof typeof fieldErrors],
      });
    }
  };

  /**
   * Validates the entire form and sets errors
   */
  const validateForm = (): boolean => {
    const validationErrors = validateFormData({
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
    });

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  /**
   * Handles View PDF button click with error handling and loading state
   */
  const handleViewPDF = async () => {
    if (validateForm()) {
      setIsNavigating(true);
      try {
        router.push('/preview');
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback: try window.location if router fails
        window.location.href = '/preview';
      } finally {
        // Reset loading state after a short delay to prevent flicker
        setTimeout(() => setIsNavigating(false), 100);
      }
    }
  };

  /**
   * Handles Download PDF button click with PDF generation and download
   */
  const handleDownloadPDF = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGeneratingPDF(true);
    try {
      // Validate user details for PDF generation
      validateUserDetailsForPDF(formData);

      // Generate and download PDF
      await generateAndDownloadPDF(formData);
    } catch (error) {
      console.error('PDF generation failed:', error);

      // Show user-friendly error message
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to generate PDF. Please try again.';

      // You could implement a toast notification here
      // For now, we'll use alert as a fallback
      alert(errorMessage);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      {isNavigating && <LoadingOverlay message="Navigating to preview..." />}
      {isGeneratingPDF && <LoadingOverlay message="Generating PDF..." />}
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              User Details
            </h1>
            <p className="text-gray-600">
              Fill in your information to generate a PDF
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Name Field */}
              <FormField
                id="name"
                label="Name"
                type="text"
                value={formData.name}
                placeholder="Enter your full name"
                icon={UserIcon}
                error={errors.name}
                required
                onChange={handleFieldChange('name')}
                onBlur={handleFieldBlur('name')}
              />

              {/* Email Field */}
              <FormField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                placeholder="Enter your email address"
                icon={MailIcon}
                error={errors.email}
                required
                onChange={handleFieldChange('email')}
                onBlur={handleFieldBlur('email')}
              />

              {/* Phone Number Field */}
              <FormField
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                value={formData.phoneNumber}
                placeholder="Enter your phone number"
                icon={PhoneIcon}
                error={errors.phoneNumber}
                required
                onChange={handleFieldChange('phoneNumber')}
                onBlur={handleFieldBlur('phoneNumber')}
              />

              {/* Position Field */}
              <FormField
                id="position"
                label="Position"
                type="text"
                value={formData.position}
                placeholder="Enter your job title or position"
                icon={PositionIcon}
                onChange={handleFieldChange('position')}
              />

              {/* Description Field */}
              <FormField
                id="description"
                label="Description"
                type="textarea"
                value={formData.description}
                placeholder="Enter additional details about yourself"
                icon={DescriptionIcon}
                onChange={handleFieldChange('description')}
              />

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  variant="primary"
                  icon={ViewIcon}
                  fullWidth
                  onClick={handleViewPDF}
                  disabled={!isValid || isNavigating}
                >
                  {isNavigating ? 'Loading...' : 'View PDF'}
                </Button>

                <Button
                  variant="primary"
                  icon={DownloadIcon}
                  fullWidth
                  onClick={handleDownloadPDF}
                  disabled={!isValid || isGeneratingPDF}
                >
                  {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Fill in all required fields to generate your PDF
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
