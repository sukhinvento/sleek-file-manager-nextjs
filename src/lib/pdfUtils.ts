import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  quality?: number;
}

/**
 * Generates a PDF from a React component/HTML element
 * @param element - The HTML element to convert to PDF
 * @param options - PDF generation options
 * @returns Promise that resolves when PDF is generated
 */
export async function generatePDF(
  element: HTMLElement,
  options: PDFOptions
): Promise<void> {
  const {
    filename,
    orientation = 'portrait',
    format = 'a4',
    quality = 2,
  } = options;

  try {
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    
    // PDF dimensions (A4)
    const pdfWidth = format === 'a4' ? 210 : 216; // mm
    const pdfHeight = format === 'a4' ? 297 : 279; // mm
    
    // Calculate image dimensions to fit PDF
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Generates and downloads PDF from element
 * @param elementId - ID of the element to convert
 * @param filename - Name of the PDF file
 */
export async function downloadPDFFromElement(
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  await generatePDF(element, { filename });
}

/**
 * Print the invoice using browser's print dialog
 */
export function printInvoice(): void {
  window.print();
}
