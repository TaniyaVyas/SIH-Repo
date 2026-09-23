/**
 * Universal High-Fidelity Medical Document Printing Utility
 *
 * Solves the critical browser bug where React modals and GPU-accelerated pages
 * (Framer Motion transforms, .gpu-layer, fixed backdrop overlays) render blank
 * pages in window.print().
 *
 * Uses an isolated, sandboxed iframe completely detached from React's #root,
 * capturing computed stylesheets, Google fonts, SVG emblems, and forcing exact
 * color fidelity with single-page A4 geometry.
 */

export interface PrintDocumentOptions {
  title?: string;
  pageOrientation?: 'portrait' | 'landscape';
  autoClose?: boolean;
}

export const printElement = (
  elementOrId: string | HTMLElement,
  title = 'RetinaFusion 360 Document',
  options: PrintDocumentOptions = {}
): boolean => {
  const targetElement =
    typeof elementOrId === 'string'
      ? document.getElementById(elementOrId)
      : elementOrId;

  if (!targetElement) {
    console.error(`[printElement] Target element not found:`, elementOrId);
    // Fallback to window print if element is missing
    window.print();
    return false;
  }

  // Create isolated sandboxed iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error('[printElement] Failed to initialize iframe content document');
    document.body.removeChild(iframe);
    window.print();
    return false;
  }

  // Gather all active stylesheets and link tags from main document
  const headElements: string[] = [];

  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    headElements.push(link.outerHTML);
  });

  document.querySelectorAll('style').forEach((style) => {
    headElements.push(style.outerHTML);
  });

  // Clone element to prevent mutating live React state
  const clone = targetElement.cloneNode(true) as HTMLElement;

  // Remove any elements marked as no-print inside clone
  clone.querySelectorAll('.no-print, button.no-print').forEach((el) => {
    el.parentNode?.removeChild(el);
  });

  // Base Single-Page A4 Print Stylesheet
  const printSystemCss = `
    @page {
      size: A4 ${options.pageOrientation || 'portrait'};
      margin: 8mm 10mm;
    }

    * {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #FFFFFF !important;
      color: #17221C !important;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
      -webkit-font-smoothing: antialiased;
    }

    .printable-doc-root {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background: #FFFFFF !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    /* Single page height constraint: A4 is 297mm high, margins 16mm total -> ~280mm max */
    .printable-doc-root,
    .single-page-sheet {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: visible !important;
      box-shadow: none !important;
    }

    /* Force all SVGs and icons to render with full color */
    svg {
      display: inline-block !important;
      vertical-align: middle !important;
    }

    /* Hide any buttons or action rows that slipped through */
    button, .no-print, [data-no-print="true"] {
      display: none !important;
      visibility: hidden !important;
    }

    /* Normalize text sizing so everything fits on one single page */
    .p-6, .p-8, .p-10 {
      padding: 16px 20px !important;
    }
    .space-y-6 > * + * {
      margin-top: 12px !important;
    }
    .space-y-5 > * + * {
      margin-top: 10px !important;
    }
    .space-y-4 > * + * {
      margin-top: 8px !important;
    }
    .space-y-8 > * + * {
      margin-top: 14px !important;
    }

    /* Keep borders clean and light */
    .border {
      border-color: #DDE5DC !important;
    }

    /* Clean background fills */
    .bg-white {
      background-color: #FFFFFF !important;
    }
    .bg-\\[\\#F8F6EF\\] {
      background-color: #F8F6EF !important;
    }
    .bg-\\[\\#124B3A\\] {
      background-color: #124B3A !important;
      color: #FFFFFF !important;
    }
    .text-white {
      color: #FFFFFF !important;
    }
  `;

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        ${headElements.join('\n')}
        <style>
          ${printSystemCss}
        </style>
      </head>
      <body>
        <div class="printable-doc-root single-page-sheet">
          ${clone.outerHTML}
        </div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // Wait for images and fonts to be ready in iframe before calling print
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('[printElement] Print execution error:', err);
      window.print();
    } finally {
      // Clean up iframe after print dialog resolves
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  };

  // Allow DOM to parse and render fonts/images
  setTimeout(triggerPrint, 350);

  return true;
};
