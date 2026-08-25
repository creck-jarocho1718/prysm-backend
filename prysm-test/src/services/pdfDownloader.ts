/**
 * PDF Downloader Service
 * Generates real PDF files from HTML using html2canvas + jsPDF
 * Based on the mechanism that was verified to work in testing
 */

import { testLog } from '../config';

export interface PdfDownloadOptions {
  htmlContent: string;
  fileName: string;
  userName: string;
}

// Type declarations for html2canvas and jsPDF
declare const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
declare const jspdf: {
  jsPDF: new (options?: any) => jsPDFInstance;
};

interface jsPDFInstance {
  addImage(imageData: string, format: string, x: number, y: number, w: number, h: number): void;
  addPage(): void;
  save(filename: string): void;
  internal: {
    pageSize: {
      width: number;
      height: number;
    };
  };
}

// Load html2canvas and jsPDF from CDN
async function loadLibraries(): Promise<void> {
  if (typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
    return; // Already loaded
  }

  testLog.pdf({ action: 'Loading html2canvas and jsPDF from CDN' });

  // Load html2canvas
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load html2canvas'));
    document.head.appendChild(script);
  });

  // Load jsPDF
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });

  testLog.pdf({ action: 'Libraries loaded successfully' });
}

/**
 * Pre-load images and convert base64 to Blob URLs for proper rendering
 */
async function preloadImages(htmlContent: string): Promise<{ html: string; imageCount: number }> {
  const base64ImageRegex = /<img[^>]+src=["'](data:image\/[^;]+;base64,[^"']+)["'][^>]*>/gi;
  const matches = [...htmlContent.matchAll(base64ImageRegex)];

  testLog.pdf({ action: 'Preloading images', count: matches.length });

  if (matches.length === 0) {
    return { html: htmlContent, imageCount: 0 };
  }

  let processedHtml = htmlContent;
  let loadedCount = 0;

  for (const match of matches) {
    const fullMatch = match[0];
    const base64Data = match[1];

    try {
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      processedHtml = processedHtml.replace(fullMatch, fullMatch.replace(base64Data, blobUrl));
      loadedCount++;
      testLog.pdf({ action: 'Image preloaded', index: loadedCount });
    } catch (error) {
      testLog.pdf({ action: 'Failed to preload image', error: String(error) });
    }
  }

  return { html: processedHtml, imageCount: loadedCount };
}

/**
 * Generate a real PDF file from HTML content
 * Uses html2canvas + jsPDF directly (verified to work)
 */
export async function generateRealPdf(options: PdfDownloadOptions): Promise<Blob> {
  const { htmlContent, fileName, userName } = options;

  testLog.pdf({ action: 'Starting PDF generation', userName, fileName });

  // Load libraries if not already loaded
  await loadLibraries();

  // Pre-load images to ensure they render correctly
  const { html: processedHtml, imageCount } = await preloadImages(htmlContent);
  testLog.pdf({ action: 'Images preprocessed', count: imageCount });

  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container for rendering
      const container = document.createElement('div');
      container.innerHTML = processedHtml;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm';
      container.style.background = '#ffffff';
      container.style.zIndex = '-1';
      document.body.appendChild(container);

      // Wait for images to load
      const images = container.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        });
      });

      // Small delay to ensure rendering is ready
      const delay = new Promise<void>(resolve => setTimeout(resolve, 500));

      Promise.all([...imagePromises, delay]).then(async () => {
        testLog.pdf({ action: 'Rendering HTML with html2canvas' });

        try {
          // Capture HTML with html2canvas
          const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            onclone: (clonedDoc: Document) => {
              const clonedContainer = clonedDoc.body.firstChild as HTMLElement;
              if (clonedContainer) {
                clonedContainer.style.position = 'static';
              }
            }
          });

          testLog.pdf({ action: 'Canvas captured', width: canvas.width, height: canvas.height });

          // Clean up container
          document.body.removeChild(container);

          // Create PDF with jsPDF
          const { jsPDF } = (window as any).jspdf;
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          // A4 dimensions in mm
          const pageWidth = 210;
          const pageHeight = 297;

          // Calculate image dimensions to fit page
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * pageWidth) / canvas.width;

          testLog.pdf({ action: 'Creating PDF', imgWidth, imgHeight, canvasHeight: canvas.height });

          // If content is taller than one page, handle multiple pages
          if (imgHeight > pageHeight) {
            testLog.pdf({ action: 'Multi-page PDF detected' });

            const ratio = canvas.width / pageWidth;
            const pageHeightPx = pageHeight * ratio;
            let yPos = 0;
            let pageNum = 1;

            while (yPos < canvas.height) {
              if (pageNum > 1) {
                pdf.addPage();
              }

              // Create temporary canvas for this page
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = canvas.width;
              tempCanvas.height = Math.min(pageHeightPx, canvas.height - yPos);
              const tempCtx = tempCanvas.getContext('2d');
              tempCtx.drawImage(canvas, 0, yPos, canvas.width, tempCanvas.height, 0, 0, canvas.width, tempCanvas.height);

              const pageImg = tempCanvas.toDataURL('image/png');
              const pageImgHeight = (tempCanvas.height * pageWidth) / canvas.width;

              pdf.addImage(pageImg, 'PNG', 0, 0, imgWidth, pageImgHeight);
              testLog.pdf({ action: `Page ${pageNum} added`, height: tempCanvas.height });

              yPos += pageHeightPx;
              pageNum++;
            }
          } else {
            // Single page
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          }

          // Get PDF as Blob
          const pdfBlob = pdf.output('blob');

          // Clean up Blob URLs
          const blobUrls = processedHtml.match(/blob:[^"'\s]+/gi) || [];
          blobUrls.forEach(url => {
            try {
              URL.revokeObjectURL(url);
            } catch (e) {
              // Ignore errors
            }
          });

          testLog.pdf({ action: 'PDF generated successfully', size: pdfBlob.size });
          resolve(pdfBlob);

        } catch (error) {
          document.body.removeChild(container);
          throw error;
        }
      });

    } catch (error) {
      testLog.pdf({ action: 'PDF generation failed', error: String(error) });
      reject(error);
    }
  });
}

/**
 * Download PDF file directly with proper filename
 */
export async function downloadPdf(options: PdfDownloadOptions): Promise<void> {
  try {
    testLog.pdf({ action: 'Starting PDF download', fileName: options.fileName });

    const blob = await generateRealPdf(options);
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `PRYSM-Reporte-${options.userName.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    testLog.pdf({ action: 'PDF download completed', fileName: link.download });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}
