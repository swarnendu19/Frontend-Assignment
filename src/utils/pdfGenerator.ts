/**
 * PDF Generation Utility
 * Handles creation and formatting of PDF documents from user details
 */

import jsPDF from 'jspdf';
import { UserDetails } from '../types';

/**
 * Configuration for PDF layout and styling
 */
const PDF_CONFIG = {
    // Page dimensions (A4)
    pageWidth: 210,
    pageHeight: 297,

    // Margins
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    marginBottom: 20,

    // Font sizes
    titleFontSize: 20,
    sectionHeaderFontSize: 14,
    labelFontSize: 12,
    valueFontSize: 11,

    // Line heights
    titleLineHeight: 8,
    sectionLineHeight: 6,
    fieldLineHeight: 5,

    // Colors
    primaryColor: '#2563eb', // Blue for headers
    textColor: '#374151',    // Dark gray for text
    labelColor: '#6b7280',   // Medium gray for labels
} as const;

/**
 * Generates and downloads a PDF document from user details
 * @param userDetails - The user data to include in the PDF
 * @param filename - Optional filename for the PDF (defaults to generated name)
 * @throws Error if PDF generation fails
 */
export const generateAndDownloadPDF = async (
    userDetails: UserDetails,
    filename?: string
): Promise<void> => {
    try {
        const pdf = await generatePDF(userDetails);
        const finalFilename = filename || generateFilename(userDetails.name);
        pdf.save(finalFilename);
    } catch (error) {
        console.error('PDF generation failed:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};

/**
 * Generates a PDF document from user details
 * @param userDetails - The user data to include in the PDF
 * @returns jsPDF instance with the generated content
 * @throws Error if PDF generation fails
 */
export const generatePDF = async (userDetails: UserDetails): Promise<jsPDF> => {
    try {
        // Create new PDF document
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Set initial position
        let currentY = PDF_CONFIG.marginTop;

        // Add title
        currentY = addTitle(pdf, currentY);

        // Add personal information section
        currentY = addPersonalInfoSection(pdf, userDetails, currentY);

        // Add professional information section
        currentY = addProfessionalInfoSection(pdf, userDetails, currentY);

        // Add description section if provided
        if (userDetails.description.trim()) {
            currentY = addDescriptionSection(pdf, userDetails, currentY);
        }

        // Add footer
        addFooter(pdf);

        return pdf;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('PDF generation failed');
    }
};
/**
 *
 Adds the main title to the PDF
 * @param pdf - jsPDF instance
 * @param startY - Starting Y position
 * @returns New Y position after adding title
 */
const addTitle = (pdf: jsPDF, startY: number): number => {
    pdf.setFontSize(PDF_CONFIG.titleFontSize);
    pdf.setTextColor(PDF_CONFIG.primaryColor);
    pdf.setFont('helvetica', 'bold');

    const title = 'User Details';
    const titleWidth = pdf.getTextWidth(title);
    const centerX = (PDF_CONFIG.pageWidth - titleWidth) / 2;

    pdf.text(title, centerX, startY);

    // Add underline
    const lineY = startY + 2;
    pdf.setDrawColor(PDF_CONFIG.primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(centerX, lineY, centerX + titleWidth, lineY);

    return startY + PDF_CONFIG.titleLineHeight + 5;
};

/**
 * Adds personal information section to the PDF
 * @param pdf - jsPDF instance
 * @param userDetails - User data
 * @param startY - Starting Y position
 * @returns New Y position after adding section
 */
const addPersonalInfoSection = (pdf: jsPDF, userDetails: UserDetails, startY: number): number => {
    let currentY = startY;

    // Section header
    currentY = addSectionHeader(pdf, 'Personal Information', currentY);

    // Add fields
    currentY = addField(pdf, 'Name', userDetails.name, currentY);
    currentY = addField(pdf, 'Email', userDetails.email, currentY);
    currentY = addField(pdf, 'Phone Number', userDetails.phoneNumber, currentY);

    return currentY + 5; // Extra spacing after section
};

/**
 * Adds professional information section to the PDF
 * @param pdf - jsPDF instance
 * @param userDetails - User data
 * @param startY - Starting Y position
 * @returns New Y position after adding section
 */
const addProfessionalInfoSection = (pdf: jsPDF, userDetails: UserDetails, startY: number): number => {
    let currentY = startY;

    // Section header
    currentY = addSectionHeader(pdf, 'Professional Information', currentY);

    // Add position field
    currentY = addField(pdf, 'Position', userDetails.position || 'Not specified', currentY);

    return currentY + 5; // Extra spacing after section
};

/**
 * Adds description section to the PDF
 * @param pdf - jsPDF instance
 * @param userDetails - User data
 * @param startY - Starting Y position
 * @returns New Y position after adding section
 */
const addDescriptionSection = (pdf: jsPDF, userDetails: UserDetails, startY: number): number => {
    let currentY = startY;

    // Section header
    currentY = addSectionHeader(pdf, 'Description', currentY);

    // Add description with text wrapping
    currentY = addMultilineField(pdf, userDetails.description, currentY);

    return currentY + 5; // Extra spacing after section
};/**

 * Adds a section header to the PDF
 * @param pdf - jsPDF instance
 * @param title - Section title
 * @param startY - Starting Y position
 * @returns New Y position after adding header
 */
const addSectionHeader = (pdf: jsPDF, title: string, startY: number): number => {
    pdf.setFontSize(PDF_CONFIG.sectionHeaderFontSize);
    pdf.setTextColor(PDF_CONFIG.primaryColor);
    pdf.setFont('helvetica', 'bold');

    pdf.text(title, PDF_CONFIG.marginLeft, startY);

    return startY + PDF_CONFIG.sectionLineHeight;
};

/**
 * Adds a single field (label-value pair) to the PDF
 * @param pdf - jsPDF instance
 * @param label - Field label
 * @param value - Field value
 * @param startY - Starting Y position
 * @returns New Y position after adding field
 */
const addField = (pdf: jsPDF, label: string, value: string, startY: number): number => {
    const labelX = PDF_CONFIG.marginLeft + 5;
    const valueX = labelX + 40; // Fixed offset for alignment

    // Add label
    pdf.setFontSize(PDF_CONFIG.labelFontSize);
    pdf.setTextColor(PDF_CONFIG.labelColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${label}:`, labelX, startY);

    // Add value
    pdf.setFontSize(PDF_CONFIG.valueFontSize);
    pdf.setTextColor(PDF_CONFIG.textColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, valueX, startY);

    return startY + PDF_CONFIG.fieldLineHeight;
};

/**
 * Adds multiline text field to the PDF with proper text wrapping
 * @param pdf - jsPDF instance
 * @param text - Text content
 * @param startY - Starting Y position
 * @returns New Y position after adding text
 */
const addMultilineField = (pdf: jsPDF, text: string, startY: number): number => {
    const textX = PDF_CONFIG.marginLeft + 5;
    const maxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.marginLeft - PDF_CONFIG.marginRight - 5;

    pdf.setFontSize(PDF_CONFIG.valueFontSize);
    pdf.setTextColor(PDF_CONFIG.textColor);
    pdf.setFont('helvetica', 'normal');

    // Split text into lines that fit within the page width
    const lines = pdf.splitTextToSize(text, maxWidth);

    let currentY = startY;
    for (const line of lines) {
        // Check if we need a new page
        if (currentY > PDF_CONFIG.pageHeight - PDF_CONFIG.marginBottom) {
            pdf.addPage();
            currentY = PDF_CONFIG.marginTop;
        }

        pdf.text(line, textX, currentY);
        currentY += PDF_CONFIG.fieldLineHeight;
    }

    return currentY;
};

/**
 * Adds footer with generation timestamp to the PDF
 * @param pdf - jsPDF instance
 */
const addFooter = (pdf: jsPDF): void => {
    const footerY = PDF_CONFIG.pageHeight - PDF_CONFIG.marginBottom + 5;
    const timestamp = new Date().toLocaleString();

    pdf.setFontSize(8);
    pdf.setTextColor('#9ca3af'); // Light gray
    pdf.setFont('helvetica', 'normal');

    const footerText = `Generated on ${timestamp}`;
    const textWidth = pdf.getTextWidth(footerText);
    const centerX = (PDF_CONFIG.pageWidth - textWidth) / 2;

    pdf.text(footerText, centerX, footerY);
};

/**
 * Generates a filename for the PDF based on user name
 * @param name - User's name
 * @returns Formatted filename
 */
const generateFilename = (name: string): string => {
    const sanitizedName = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .trim();

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    return `${sanitizedName || 'user'}-details-${timestamp}.pdf`;
};

/**
 * Validates user details before PDF generation
 * @param userDetails - User data to validate
 * @throws Error if required fields are missing
 */
export const validateUserDetailsForPDF = (userDetails: UserDetails): void => {
    const requiredFields = ['name', 'email', 'phoneNumber'] as const;
    const missingFields: string[] = [];

    for (const field of requiredFields) {
        if (!userDetails[field] || userDetails[field].trim() === '') {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
};