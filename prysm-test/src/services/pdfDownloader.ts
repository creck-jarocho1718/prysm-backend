/**
 * PDF Downloader Service
 * Generates real PDF files from HTML using html2pdf.js
 */

import html2pdf from 'html2pdf.js';
import { testLog } from '../config';

export interface PdfDownloadOptions {
  htmlContent: string;
  fileName: string;
  userName: string;
}

/**
 * Generate a real PDF file from HTML content
 * Returns the PDF as a Blob for download
 */
export async function generateRealPdf(options: PdfDownloadOptions): Promise<Blob> {
  const { htmlContent, fileName, userName } = options;

  testLog.pdf({ action: 'Starting real PDF generation', userName, fileName });

  return new Promise((resolve, reject) => {
    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width
    container.style.background = '#ffffff';
    document.body.appendChild(container);

    const filename = `${fileName}-${userName.replace(/\s+/g, '_')}.pdf`;

    const pdfOptions = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    html2pdf()
      .set(pdfOptions)
      .from(container)
      .outputPdf('blob')
      .then((blob: Blob) => {
        // Clean up
        document.body.removeChild(container);
        testLog.pdf({ action: 'PDF generated successfully', size: blob.size });
        resolve(blob);
      })
      .catch((error: Error) => {
        // Clean up
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        testLog.pdf({ action: 'PDF generation failed', error: error.message });
        reject(error);
      });
  });
}

/**
 * Download PDF file directly
 */
export async function downloadPdf(options: PdfDownloadOptions): Promise<void> {
  try {
    const blob = await generateRealPdf(options);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.fileName}-${options.userName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    testLog.pdf({ action: 'PDF download triggered', fileName: options.fileName });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}
