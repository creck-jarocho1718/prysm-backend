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
 * Pre-load images and convert base64 to Blob URLs for proper rendering
 */
async function preloadImages(htmlContent: string): Promise<{ html: string; imageCount: number }> {
  // Find all base64 images in the HTML
  const base64ImageRegex = /<img[^>]+src=["'](data:image\/[^;]+;base64,[^"']+)["'][^>]*>/gi;
  const matches = [...htmlContent.matchAll(base64ImageRegex)];

  testLog.pdf({ action: 'Preloading images', count: matches.length });

  if (matches.length === 0) {
    return { html: htmlContent, imageCount: 0 };
  }

  let processedHtml = htmlContent;
  let loadedCount = 0;

  // Pre-load each base64 image
  for (const match of matches) {
    const fullMatch = match[0];
    const base64Data = match[1];

    try {
      // Convert base64 to Blob
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Replace in HTML
      processedHtml = processedHtml.replace(fullMatch, fullMatch.replace(base64Data, blobUrl));
      loadedCount++;

      testLog.pdf({ action: 'Image preloaded', index: loadedCount });
    } catch (error) {
      testLog.pdf({ action: 'Failed to preload image', error: String(error) });
      // Keep original base64 if conversion fails
    }
  }

  return { html: processedHtml, imageCount: loadedCount };
}

/**
 * Generate a real PDF file from HTML content
 * Returns the PDF as a Blob for download
 */
export async function generateRealPdf(options: PdfDownloadOptions): Promise<Blob> {
  const { htmlContent, fileName, userName } = options;

  testLog.pdf({ action: 'Starting real PDF generation', userName, fileName });

  // Pre-load images to ensure they render correctly
  const { html: processedHtml, imageCount } = await preloadImages(htmlContent);
  testLog.pdf({ action: 'Images preprocessed', count: imageCount });

  return new Promise((resolve, reject) => {
    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = processedHtml;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width
    container.style.background = '#ffffff';
    document.body.appendChild(container);

    // Wait for images to be fully loaded
    const images = container.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
        }
      });
    });

    // Also add a small delay to ensure rendering is ready
    const delay = new Promise<void>(resolve => setTimeout(resolve, 100));

    Promise.all([...imagePromises, delay]).then(() => {
      testLog.pdf({ action: 'Images ready, generating PDF' });

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
          // Clean up container
          document.body.removeChild(container);

          // Clean up Blob URLs
          const blobUrls = processedHtml.match(/blob:[^"'\s]+/gi) || [];
          blobUrls.forEach(url => {
            try {
              URL.revokeObjectURL(url);
            } catch (e) {
              // Ignore errors during cleanup
            }
          });

          testLog.pdf({ action: 'PDF generated successfully', size: blob.size, imageCount });
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
