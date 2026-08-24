import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { getDisplayBrandName } from '../../utils/brand';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  QrCode,
  Printer,
  Sparkles,
  Tag,
  Sliders,
  Barcode,
  Search,
  Check,
  Download,
  Eye,
  X,
  FileText,
  Layers,
  Settings2,
  Copy,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  Info,
} from 'lucide-react';

export type PrintLayoutType =
  | 'a4'
  | 'thermal-50x30'
  | 'thermal-40x30'
  | 'thermal-30x20'
  | 'thermal-15x30';

interface GeneratedLabelConfig {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  sellingPrice: number;
  copies: number;
  barcodeDataUrl: string;
  qrDataUrl: string;
  codeType: 'barcode' | 'qrcode' | 'both';
  showPrice: boolean;
  showSKU: boolean;
  showBrand: boolean;
  generatedAt: number;
}

export const BarcodeGeneratorView: React.FC = () => {
  const {
    user,
    products,
    settings,
    language,
    generatedProductCodes,
    isCodeGenerated,
    getGeneratedQRCount,
    recordGeneratedQRCodes,
  } = useApp();

  const symbol = settings.currency || '৳';
  const brandName = getDisplayBrandName(settings.brandName) || user?.brandName || 'Store';

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [copiesInput, setCopiesInput] = useState<number>(24);
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode' | 'both'>('both');
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showSKU, setShowSKU] = useState<boolean>(true);
  const [showBrand, setShowBrand] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const [generatedConfig, setGeneratedConfig] = useState<GeneratedLabelConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activePrintLayout, setActivePrintLayout] = useState<PrintLayoutType>('a4');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  const totalProductsCount = products.length;
  const usedCodesCount = generatedProductCodes.length;
  const currentStock = selectedProduct
    ? selectedProduct.currentStock ?? (selectedProduct as any).stock ?? 0
    : 0;
  const alreadyGenerated = selectedProduct ? getGeneratedQRCount(selectedProduct.id) : 0;

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchFilter.toLowerCase())) ||
          (p.barcode && p.barcode.toLowerCase().includes(searchFilter.toLowerCase()))
      ),
    [products, searchFilter]
  );

  // Auto-select first product if empty
  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Core generator function: strictly generates QR with ONLY brand name
  const generateLabelData = useCallback(
    async (
      prod = selectedProduct,
      numCopies = copiesInput,
      cType = codeType,
      sPrice = showPrice,
      sSKU = showSKU,
      sBrand = showBrand
    ): Promise<GeneratedLabelConfig | null> => {
      if (!prod) return null;

      const copies = Math.max(1, Number(numCopies) || 1);
      const barcodeValue = (prod.sku || prod.barcode || prod.id || '').trim();

      let barcodeDataUrl = '';
      if (cType === 'barcode' || cType === 'both') {
        try {
          const canvas = document.createElement('canvas');
          JsBarcode(canvas, barcodeValue, {
            format: 'CODE128',
            width: 2,
            height: 55,
            displayValue: true,
            fontSize: 13,
            margin: 6,
            background: '#ffffff',
            lineColor: '#000000',
          });
          barcodeDataUrl = canvas.toDataURL('image/png');
        } catch (err) {
          console.warn('JsBarcode CODE128 error fallback to CODE39:', err);
          try {
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, barcodeValue.replace(/[^0-9A-Za-z\-]/g, '') || 'ITEM001', {
              format: 'CODE39',
              width: 1.8,
              height: 50,
              displayValue: true,
              fontSize: 12,
              margin: 6,
            });
            barcodeDataUrl = canvas.toDataURL('image/png');
          } catch (e2) {
            console.error('Failed to generate barcode image:', e2);
          }
        }
      }

      let qrDataUrl = '';
      if (cType === 'qrcode' || cType === 'both') {
        try {
          // USER DIRECTIVE: "The QR code will only contain the brand name; it will not include our air inventory or air media name."
          const qrPayload = brandName.trim();

          qrDataUrl = await QRCode.toDataURL(qrPayload, {
            width: 250,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
        } catch (err) {
          console.error('Failed to generate QR code:', err);
        }
      }

      const config: GeneratedLabelConfig = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku || prod.id.slice(0, 8),
        barcode: barcodeValue,
        sellingPrice: prod.sellingPrice || 0,
        copies,
        barcodeDataUrl,
        qrDataUrl,
        codeType: cType,
        showPrice: sPrice,
        showSKU: sSKU,
        showBrand: sBrand,
        generatedAt: Date.now(),
      };

      return config;
    },
    [selectedProduct, copiesInput, codeType, showPrice, showSKU, showBrand, brandName]
  );

  // Manual Generate Action when user clicks "Generate Barcode / QR Code"
  const handleExplicitGenerate = async () => {
    if (!selectedProduct) {
      alert(language === 'bn' ? 'দয়া করে একটি পণ্য নির্বাচন করুন।' : 'Please select a product first.');
      return;
    }
    setIsGenerating(true);
    try {
      const numCopies = Math.max(1, Number(copiesInput) || 1);
      recordGeneratedQRCodes(selectedProduct.id, numCopies);
      const config = await generateLabelData();
      if (config) {
        setGeneratedConfig(config);
        setCopiedNotification(
          language === 'bn'
            ? '✓ কোড ও লেবেল সফলভাবে তৈরি হয়েছে!'
            : '✓ Barcode & QR Code generated successfully!'
        );
        setTimeout(() => setCopiedNotification(null), 3000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Build standalone styled HTML for 100% reliable printing across popups, iframes, and new tabs
  const getPrintableHTML = (config: GeneratedLabelConfig, layout: PrintLayoutType) => {
    const isA4 = layout === 'a4';
    const is50x30 = layout === 'thermal-50x30';
    const is40x30 = layout === 'thermal-40x30';
    const is30x20 = layout === 'thermal-30x20';
    const is15x30 = layout === 'thermal-15x30';

    let pageSize = 'A4 portrait';
    let labelW = '63mm';
    let labelH = '33mm';

    if (is50x30) {
      pageSize = '50mm 30mm';
      labelW = '50mm';
      labelH = '30mm';
    } else if (is40x30) {
      pageSize = '40mm 30mm';
      labelW = '40mm';
      labelH = '30mm';
    } else if (is30x20) {
      pageSize = '30mm 20mm';
      labelW = '30mm';
      labelH = '20mm';
    } else if (is15x30) {
      pageSize = '30mm 15mm';
      labelW = '30mm';
      labelH = '15mm';
    }

    const cardsHtml = Array.from({ length: config.copies })
      .map(
        (_, i) => `
      <div class="sticker-card">
        ${
          config.showBrand
            ? `<div class="brand-text">${brandName.toUpperCase()}</div>`
            : ''
        }
        <div class="product-title">${config.productName}</div>
        
        <div class="code-zone">
          ${
            (config.codeType === 'barcode' || config.codeType === 'both') && config.barcodeDataUrl
              ? `<img src="${config.barcodeDataUrl}" class="barcode-img" alt="Barcode" />`
              : ''
          }
          ${
            (config.codeType === 'qrcode' || config.codeType === 'both') && config.qrDataUrl
              ? `<img src="${config.qrDataUrl}" class="qr-img" alt="QR" />`
              : ''
          }
        </div>

        <div class="footer-row">
          ${config.showSKU ? `<span class="sku-text">#${config.sku}</span>` : '<span></span>'}
          ${config.showPrice ? `<span class="price-text">${symbol}${config.sellingPrice}</span>` : ''}
        </div>
      </div>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Print Labels - ${config.productName}</title>
        <style>
          @page {
            size: ${pageSize};
            margin: ${isA4 ? '6mm' : '0'};
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: ${isA4 ? '6mm' : '0'};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #000000;
          }
          ${
            isA4
              ? `
            .container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-gap: 3.5mm;
              width: 100%;
            }
            .sticker-card {
              border: 1px dashed #aaaaaa;
              border-radius: 4px;
              padding: 2.5mm;
              height: 32mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              text-align: center;
              page-break-inside: avoid;
              break-inside: avoid;
              overflow: hidden;
            }
          `
              : `
            .container {
              display: block;
              width: ${labelW};
              margin: 0;
              padding: 0;
            }
            .sticker-card {
              width: ${labelW};
              height: ${labelH};
              padding: ${is30x20 || is15x30 ? '1mm' : '2mm'};
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              text-align: center;
              page-break-after: always;
              break-after: page;
              overflow: hidden;
            }
          `
          }

          .brand-text {
            font-size: ${is30x20 || is15x30 ? '7px' : '9px'};
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            width: 100%;
            border-bottom: 0.5px solid #dddddd;
            padding-bottom: 1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .product-title {
            font-size: ${is30x20 || is15x30 ? '8px' : '9.5px'};
            font-weight: 700;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            margin: 1px 0;
          }
          .code-zone {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            width: 100%;
            flex: 1;
            overflow: hidden;
          }
          .barcode-img {
            max-height: ${is30x20 || is15x30 ? '18px' : isA4 ? '36px' : '26px'};
            max-width: 95%;
            object-fit: contain;
          }
          .qr-img {
            max-height: ${is30x20 || is15x30 ? '20px' : isA4 ? '38px' : '28px'};
            max-width: ${is30x20 || is15x30 ? '20px' : isA4 ? '38px' : '28px'};
            object-fit: contain;
          }
          .footer-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            border-top: 0.5px solid #dddddd;
            padding-top: 1px;
            font-size: ${is30x20 || is15x30 ? '7px' : '8.5px'};
          }
          .sku-text {
            font-family: monospace;
            font-weight: 700;
            color: #333333;
          }
          .price-text {
            font-weight: 900;
            color: #000000;
            margin-left: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${cardsHtml}
        </div>
      </body>
      </html>
    `;
  };

  // Robust Print Handler: works in iframes, standalone tabs, and popup windows
  const triggerPrintJob = async (layout: PrintLayoutType = 'a4') => {
    setActivePrintLayout(layout);

    // If config hasn't been explicitly generated yet, generate it first
    let config = generatedConfig;
    if (!config && selectedProduct) {
      config = await generateLabelData(selectedProduct, copiesInput, codeType, showPrice, showSKU, showBrand);
      if (config) {
        setGeneratedConfig(config);
      }
    }

    if (!config) {
      alert(language === 'bn' ? 'দয়া করে পণ্য নির্বাচন করে কোড জেনারেট করুন।' : 'Please select a product and generate code first.');
      return;
    }

    if (selectedProduct) {
      recordGeneratedQRCodes(selectedProduct.id, config.copies);
    }

    // Direct browser print with custom print-standalone-container
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Download PDF file for sticker paper & thermal printers
  const handleDownloadPDF = async (layout: PrintLayoutType = activePrintLayout) => {
    let config = generatedConfig;
    if (!config && selectedProduct) {
      config = await generateLabelData(selectedProduct, copiesInput, codeType, showPrice, showSKU, showBrand);
      if (config) {
        setGeneratedConfig(config);
      }
    }

    if (!config) {
      alert('Please select a product to download label PDF.');
      return;
    }

    setIsDownloadingPdf(true);

    try {
      if (layout === 'a4') {
        // Standard A4: 210mm x 297mm (3 columns x 8 rows = 24 stickers per sheet)
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = 210;
        const pageHeight = 297;
        const marginX = 8;
        const marginY = 10;
        const cols = 3;
        const rows = 8;
        const cellWidth = (pageWidth - marginX * 2 - (cols - 1) * 3) / cols; // ~62mm
        const cellHeight = (pageHeight - marginY * 2 - (rows - 1) * 2.5) / rows; // ~32mm

        let currentCopy = 0;
        const totalCopies = config.copies;

        while (currentCopy < totalCopies) {
          if (currentCopy > 0) {
            pdf.addPage();
          }

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (currentCopy >= totalCopies) break;

              const x = marginX + c * (cellWidth + 3);
              const y = marginY + r * (cellHeight + 2.5);

              // Border outline
              pdf.setDrawColor(180, 180, 180);
              pdf.setLineWidth(0.2);
              pdf.roundedRect(x, y, cellWidth, cellHeight, 1.5, 1.5);

              let cursorY = y + 3.5;

              // Store Name
              if (config.showBrand) {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(7.5);
                pdf.setTextColor(40, 40, 40);
                pdf.text(brandName.toUpperCase().slice(0, 26), x + cellWidth / 2, cursorY, {
                  align: 'center',
                });
                cursorY += 3.2;
              }

              // Product Name
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(8.5);
              pdf.setTextColor(15, 15, 15);
              const cleanName = config.productName.slice(0, 28);
              pdf.text(cleanName, x + cellWidth / 2, cursorY, { align: 'center' });
              cursorY += 1.5;

              // Images
              if (config.codeType === 'barcode' && config.barcodeDataUrl) {
                const imgW = Math.min(cellWidth - 4, 52);
                const imgH = 14;
                pdf.addImage(
                  config.barcodeDataUrl,
                  'PNG',
                  x + (cellWidth - imgW) / 2,
                  cursorY,
                  imgW,
                  imgH
                );
                cursorY += imgH + 1.5;
              } else if (config.codeType === 'qrcode' && config.qrDataUrl) {
                const qrSize = 15;
                pdf.addImage(
                  config.qrDataUrl,
                  'PNG',
                  x + (cellWidth - qrSize) / 2,
                  cursorY,
                  qrSize,
                  qrSize
                );
                cursorY += qrSize + 1.5;
              } else if (config.codeType === 'both') {
                if (config.barcodeDataUrl && config.qrDataUrl) {
                  const qrSize = 13;
                  const barW = cellWidth - qrSize - 6;
                  const barH = 12;
                  pdf.addImage(config.qrDataUrl, 'PNG', x + 2, cursorY, qrSize, qrSize);
                  pdf.addImage(
                    config.barcodeDataUrl,
                    'PNG',
                    x + qrSize + 3,
                    cursorY + 0.5,
                    barW,
                    barH
                  );
                  cursorY += qrSize + 1.5;
                }
              }

              // Footer row
              cursorY = y + cellHeight - 2.5;
              if (config.showSKU) {
                pdf.setFont('courier', 'bold');
                pdf.setFontSize(7.5);
                pdf.setTextColor(60, 60, 60);
                pdf.text(`#${config.sku.slice(0, 14)}`, x + 3, cursorY);
              }

              if (config.showPrice) {
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(9);
                pdf.setTextColor(230, 80, 0);
                pdf.text(
                  `${symbol}${config.sellingPrice}`,
                  x + cellWidth - 3,
                  cursorY,
                  { align: 'right' }
                );
              }

              currentCopy++;
            }
          }
        }

        pdf.save(`Labels_${config.sku || 'A4'}_Sheet.pdf`);
      } else {
        // Thermal Roll Label
        let widthMm = 50;
        let heightMm = 30;

        if (layout === 'thermal-40x30') {
          widthMm = 40;
          heightMm = 30;
        } else if (layout === 'thermal-30x20') {
          widthMm = 30;
          heightMm = 20;
        } else if (layout === 'thermal-15x30') {
          widthMm = 30;
          heightMm = 15;
        }

        const pdf = new jsPDF({
          orientation: widthMm >= heightMm ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [heightMm, widthMm],
        });

        for (let i = 0; i < config.copies; i++) {
          if (i > 0) {
            pdf.addPage([heightMm, widthMm], widthMm >= heightMm ? 'landscape' : 'portrait');
          }

          let cursorY = 3;

          // Store Name
          if (config.showBrand && heightMm >= 20) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(heightMm <= 20 ? 6 : 7.5);
            pdf.text(brandName.toUpperCase().slice(0, 22), widthMm / 2, cursorY, {
              align: 'center',
            });
            cursorY += heightMm <= 20 ? 2.5 : 3.2;
          }

          // Product Name
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(heightMm <= 20 ? 7 : 8.5);
          pdf.text(config.productName.slice(0, 24), widthMm / 2, cursorY, { align: 'center' });
          cursorY += heightMm <= 20 ? 1.5 : 2;

          // Barcode or QR
          if (
            (config.codeType === 'barcode' || config.codeType === 'both') &&
            config.barcodeDataUrl
          ) {
            const barW = widthMm - 4;
            const barH = heightMm <= 20 ? 8 : 13;
            pdf.addImage(
              config.barcodeDataUrl,
              'PNG',
              (widthMm - barW) / 2,
              cursorY,
              barW,
              barH
            );
            cursorY += barH + 1;
          } else if (config.codeType === 'qrcode' && config.qrDataUrl) {
            const qrSize = heightMm <= 20 ? 11 : 16;
            pdf.addImage(
              config.qrDataUrl,
              'PNG',
              (widthMm - qrSize) / 2,
              cursorY,
              qrSize,
              qrSize
            );
            cursorY += qrSize + 1;
          }

          // Footer
          const footerY = heightMm - 1.8;
          if (config.showSKU) {
            pdf.setFont('courier', 'bold');
            pdf.setFontSize(heightMm <= 20 ? 6 : 7);
            pdf.text(`#${config.sku.slice(0, 12)}`, 2, footerY);
          }

          if (config.showPrice) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(heightMm <= 20 ? 7.5 : 9);
            pdf.text(`${symbol}${config.sellingPrice}`, widthMm - 2, footerY, {
              align: 'right',
            });
          }
        }

        pdf.save(`Thermal_Labels_${widthMm}x${heightMm}mm_${config.sku}.pdf`);
      }
    } catch (err) {
      console.error('Error generating PDF labels:', err);
      alert('Failed to generate PDF. Please use browser print instead.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const copyImageToClipboard = async (dataUrl: string, label: string) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedNotification(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedNotification(null), 2500);
    } catch (err) {
      console.warn('Clipboard write error:', err);
      setCopiedNotification('Right click the image to copy.');
      setTimeout(() => setCopiedNotification(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Dynamic Global Print Styles for fallback window.print() */}
      <style>{`
        @media print {
          @page {
            ${
              activePrintLayout === 'a4'
                ? 'size: A4 portrait; margin: 6mm;'
                : activePrintLayout === 'thermal-50x30'
                ? 'size: 50mm 30mm; margin: 0;'
                : activePrintLayout === 'thermal-40x30'
                ? 'size: 40mm 30mm; margin: 0;'
                : activePrintLayout === 'thermal-30x20'
                ? 'size: 30mm 20mm; margin: 0;'
                : 'size: 30mm 15mm; margin: 0;'
            }
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          #print-standalone-container, #print-standalone-container * {
            visibility: visible !important;
          }

          #print-standalone-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: block !important;
          }

          .no-print, .no-print * {
            display: none !important;
          }

          .print-layout-a4 {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 3.5mm !important;
            padding: 4mm !important;
            width: 100% !important;
          }

          .print-layout-a4 .label-sticker-card {
            border: 1px dashed #888888 !important;
            padding: 2.5mm !important;
            border-radius: 4px !important;
            text-align: center !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            min-height: 29mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
          }

          .print-layout-thermal {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-layout-thermal .label-sticker-card {
            border: none !important;
            border-radius: 0 !important;
            padding: 1.5mm !important;
            text-align: center !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            overflow: hidden !important;
          }

          .print-layout-thermal.thermal-50x30 .label-sticker-card {
            width: 50mm !important;
            height: 30mm !important;
          }

          .print-layout-thermal.thermal-40x30 .label-sticker-card {
            width: 40mm !important;
            height: 30mm !important;
          }

          .print-layout-thermal.thermal-30x20 .label-sticker-card {
            width: 30mm !important;
            height: 20mm !important;
          }

          .print-layout-thermal.thermal-15x30 .label-sticker-card {
            width: 30mm !important;
            height: 15mm !important;
          }
        }
      `}</style>

      {/* Floating Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ff5c01]/10 text-[#ff5c01] rounded-2xl shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {language === 'bn' ? 'বারকোড ও কিউআর কোড জেনারেটর ও প্রিন্টার' : 'Barcode & QR Code Generator & Printer'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'প্রোডাক্ট নির্বাচন করুন, কোডের ধরন পছন্দ করুন এবং A4 স্টিকার শিট অথবা থার্মাল রোল (15-30mm / 50×30mm) প্রিন্ট করুন।'
                  : 'Select a product, configure code type (Barcode, QR code with brand name, or both), and print instantly.'}
              </p>
            </div>
          </div>
        </div>

        {/* Top Print Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => triggerPrintJob('a4')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.02]"
            title="Print ready A4 sticker sheet (3 columns x 8 rows)"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'A4 শিট প্রিন্ট' : 'Print A4 Sheet'}</span>
            <span className="bg-emerald-700 px-1.5 py-0.5 rounded text-[10px]">
              {copiesInput}
            </span>
          </button>

          <button
            type="button"
            onClick={() => triggerPrintJob('thermal-50x30')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-md shadow-amber-400/20 transition-all cursor-pointer hover:scale-[1.02]"
            title="Print standard 50x30mm thermal roll sticker labels"
          >
            <Tag className="w-4 h-4" />
            <span>{language === 'bn' ? 'থার্মাল রোল (50×30)' : 'Thermal (50×30mm)'}</span>
          </button>

          <button
            type="button"
            onClick={() => triggerPrintJob('thermal-30x20')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-[1.02]"
            title="Print mini thermal label 15 to 30 mm"
          >
            <Tag className="w-4 h-4" />
            <span>{language === 'bn' ? 'থার্মাল রোল (15-30mm)' : 'Thermal (15–30mm)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span>{language === 'bn' ? 'প্রিভিউ ও পিডিএফ' : 'Preview & PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 no-print">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#ff5c01]" />
            <span>
              {language === 'bn' ? 'লেবেল জেনারেটর কনফিগারেশন' : 'Step 1: Configure & Generate Labels'}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              ✓ {usedCodesCount} / {totalProductsCount} {language === 'bn' ? 'প্রোডাক্ট প্রস্তুত' : 'Products Ready'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. Product Selector */}
          <div className="lg:col-span-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              1. {language === 'bn' ? 'পণ্য নির্বাচন করুন' : 'Select Product'}
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'পণ্য খুঁজুন...' : 'Search product or SKU...'}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-[#ff5c01]"
              />
            </div>

            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                // Reset generated state so user clicks generate explicitly
                setGeneratedConfig(null);
              }}
              className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
            >
              {filteredProducts.map((p) => {
                const hasCode = isCodeGenerated(p.id);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} — SKU: {p.sku || p.id.slice(0, 6)} ({symbol}
                    {p.sellingPrice}) {hasCode ? '✓ [Generated]' : ''}
                  </option>
                );
              })}
            </select>

            {selectedProduct && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{language === 'bn' ? 'পণ্য:' : 'Product:'}</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[180px]">
                    {selectedProduct.name}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{language === 'bn' ? 'এসকেইউ:' : 'SKU / Barcode:'}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {selectedProduct.sku || selectedProduct.barcode || selectedProduct.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{language === 'bn' ? 'মূল্য:' : 'Price:'}</span>
                  <strong className="text-[#ff5c01] font-black">
                    {symbol}{selectedProduct.sellingPrice}
                  </strong>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px]">
                  <span className="text-slate-500">{language === 'bn' ? 'দোকানের নাম (QR এ যাবে):' : 'Brand Name (In QR):'}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[160px]">
                    {brandName}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Choose What Code To Generate */}
          <div className="lg:col-span-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              2. {language === 'bn' ? 'কোডের ধরন নির্বাচন করুন' : 'Select Code to Generate'}
            </label>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setCodeType('barcode');
                  setGeneratedConfig(null);
                }}
                className={`py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  codeType === 'barcode'
                    ? 'bg-[#ff5c01] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Barcode className="w-4 h-4" />
                <span>Barcode Only</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeType('qrcode');
                  setGeneratedConfig(null);
                }}
                className={`py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  codeType === 'qrcode'
                    ? 'bg-[#ff5c01] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code Only</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeType('both');
                  setGeneratedConfig(null);
                }}
                className={`py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  codeType === 'both'
                    ? 'bg-[#ff5c01] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Both Codes</span>
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {language === 'bn'
                  ? `কিউআর কোডে শুধুমাত্র ব্র্যান্ড নেম "${brandName}" এনকোড হবে।`
                  : `QR Code will strictly contain the brand name: "${brandName}".`}
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1 flex-wrap">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => {
                    setShowPrice(e.target.checked);
                    if (generatedConfig) {
                      setGeneratedConfig({ ...generatedConfig, showPrice: e.target.checked });
                    }
                  }}
                  className="rounded text-[#ff5c01] focus:ring-[#ff5c01]"
                />
                <span>{language === 'bn' ? 'মূল্য' : 'Price'}</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSKU}
                  onChange={(e) => {
                    setShowSKU(e.target.checked);
                    if (generatedConfig) {
                      setGeneratedConfig({ ...generatedConfig, showSKU: e.target.checked });
                    }
                  }}
                  className="rounded text-[#ff5c01] focus:ring-[#ff5c01]"
                />
                <span>SKU</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBrand}
                  onChange={(e) => {
                    setShowBrand(e.target.checked);
                    if (generatedConfig) {
                      setGeneratedConfig({ ...generatedConfig, showBrand: e.target.checked });
                    }
                  }}
                  className="rounded text-[#ff5c01] focus:ring-[#ff5c01]"
                />
                <span>{language === 'bn' ? 'দোকানের নাম' : 'Store Name'}</span>
              </label>
            </div>
          </div>

          {/* 3. Number of Copies */}
          <div className="lg:col-span-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              3. {language === 'bn' ? 'স্টিকার সংখ্যা (কপি)' : 'Number of Label Copies'}
            </label>

            <div className="relative">
              <input
                type="number"
                min="1"
                max="500"
                value={copiesInput}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 1);
                  setCopiesInput(val);
                  if (generatedConfig) {
                    setGeneratedConfig({ ...generatedConfig, copies: val });
                  }
                }}
                className="w-full px-4 py-2.5 text-sm font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#ff5c01]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                {language === 'bn' ? 'কপি' : 'Labels'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[6, 12, 24, 48].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setCopiesInput(num);
                    if (generatedConfig) {
                      setGeneratedConfig({ ...generatedConfig, copies: num });
                    }
                  }}
                  className={`py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    copiesInput === num
                      ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num} {num === 24 ? '(1 Sheet)' : ''}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? '💡 ১টি A4 পেজে সাধারণত ২৪টি স্টিকার ধরে (৩×৮ গ্রিড)।'
                : '💡 Standard A4 sheet fits 24 labels (3×8 grid).'}
            </p>
          </div>
        </div>

        {/* Prominent Action Bar with Clear Generate Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Explicit Generate Button */}
          <button
            type="button"
            onClick={handleExplicitGenerate}
            disabled={isGenerating || !selectedProduct}
            className="w-full sm:w-auto px-8 py-3.5 font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer bg-gradient-to-r from-[#ff5c01] to-[#e05100] hover:from-[#e05100] hover:to-[#c44300] text-white shadow-xl shadow-[#ff5c01]/25 hover:scale-[1.02] disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-200" />
            )}
            <span>
              {isGenerating
                ? language === 'bn'
                  ? 'তৈরি হচ্ছে...'
                  : 'Generating Code...'
                : generatedConfig
                ? language === 'bn'
                  ? 'পুনরায় কোড তৈরি করুন (Regenerate)'
                  : 'Regenerate Code & Update Labels'
                : language === 'bn'
                ? 'কোড ও লেবেল তৈরি করুন (Generate Labels)'
                : 'Generate Barcode / QR Code'}
            </span>
          </button>

          {/* Quick Direct Print Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => triggerPrintJob('a4')}
              className="flex-1 sm:flex-none px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              title="Print ready A4 sticker sheet (3 columns x 8 rows)"
            >
              <Printer className="w-4 h-4" />
              <span>
                {language === 'bn'
                  ? `A4 শিট প্রিন্ট (${copiesInput}টি)`
                  : `Print A4 Sheet (${copiesInput})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => triggerPrintJob('thermal-50x30')}
              className="flex-1 sm:flex-none px-5 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs rounded-2xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              title="Print standard 50x30mm thermal roll sticker labels"
            >
              <Tag className="w-4 h-4" />
              <span>
                {language === 'bn' ? 'থার্মাল রোল (50×30)' : 'Thermal (50×30mm)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => triggerPrintJob('thermal-30x20')}
              className="flex-1 sm:flex-none px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
              title="Print mini thermal label 15 to 30 mm"
            >
              <Tag className="w-4 h-4" />
              <span>
                {language === 'bn' ? 'থার্মাল রোল (15-30mm)' : 'Thermal (15–30mm)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Standalone Printable Container — Rendered in DOM for fallback window.print */}
      <div id="print-standalone-container" className="hidden print:block">
        <div
          className={
            activePrintLayout === 'a4'
              ? 'print-layout-a4'
              : `print-layout-thermal ${activePrintLayout}`
          }
        >
          {generatedConfig &&
            Array.from({ length: generatedConfig.copies }).map((_, index) => (
              <div key={index} className="label-sticker-card">
                {generatedConfig.showBrand && (
                  <div
                    style={{
                      fontSize:
                        activePrintLayout === 'thermal-30x20' || activePrintLayout === 'thermal-15x30'
                          ? '7px'
                          : '9px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      marginBottom: '1px',
                      borderBottom: '1px solid #ddd',
                      paddingBottom: '1px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {brandName}
                  </div>
                )}

                <div
                  style={{
                    fontSize:
                      activePrintLayout === 'thermal-30x20' || activePrintLayout === 'thermal-15x30'
                        ? '8px'
                        : '10px',
                    fontWeight: 700,
                    marginBottom: '1px',
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {generatedConfig.productName}
                </div>

                {/* Barcode Image */}
                {(generatedConfig.codeType === 'barcode' || generatedConfig.codeType === 'both') &&
                  generatedConfig.barcodeDataUrl && (
                    <div style={{ margin: '1px 0', display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={generatedConfig.barcodeDataUrl}
                        alt="Barcode"
                        style={{
                          maxHeight:
                            activePrintLayout === 'thermal-30x20' || activePrintLayout === 'thermal-15x30'
                              ? '20px'
                              : activePrintLayout === 'a4'
                              ? '36px'
                              : '28px',
                          maxWidth: '96%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  )}

                {/* QR Code Image */}
                {(generatedConfig.codeType === 'qrcode' || generatedConfig.codeType === 'both') &&
                  generatedConfig.qrDataUrl && (
                    <div style={{ margin: '1px 0', display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={generatedConfig.qrDataUrl}
                        alt="QR Code"
                        style={{
                          width:
                            activePrintLayout === 'thermal-30x20' || activePrintLayout === 'thermal-15x30'
                              ? '26px'
                              : activePrintLayout === 'a4'
                              ? '40px'
                              : '32px',
                          height:
                            activePrintLayout === 'thermal-30x20' || activePrintLayout === 'thermal-15x30'
                              ? '26px'
                              : activePrintLayout === 'a4'
                              ? '40px'
                              : '32px',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  )}

                {/* Footer details */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #ddd',
                    paddingTop: '1px',
                    marginTop: '1px',
                    fontSize:
                      activePrintLayout === 'thermal-30x20' || activePrintLayout === 'thermal-15x30'
                        ? '7.5px'
                        : '9px',
                  }}
                >
                  {generatedConfig.showSKU && (
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#333' }}>
                      #{generatedConfig.sku}
                    </span>
                  )}
                  {generatedConfig.showPrice && (
                    <span
                      style={{
                        fontWeight: 900,
                        color: '#000',
                        marginLeft: 'auto',
                      }}
                    >
                      {symbol}{generatedConfig.sellingPrice}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Screen Preview Grid */}
      {generatedConfig ? (
        <div className="space-y-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {language === 'bn'
                    ? `লাইভ প্রিভিউ: ${generatedConfig.copies}টি স্টিকার প্রস্তুত`
                    : `Live Preview: ${generatedConfig.copies} Labels Ready to Print`}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {generatedConfig.codeType === 'both'
                    ? 'Barcode + Brand QR'
                    : generatedConfig.codeType === 'qrcode'
                    ? 'Brand QR Only'
                    : 'Barcode Only'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400">
                {language === 'bn' ? 'প্রিন্ট ফরম্যাট:' : 'Print Layout:'}
              </span>
              <button
                type="button"
                onClick={() => triggerPrintJob('a4')}
                className="px-3.5 py-2 text-xs font-black rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>A4 Sheet (3×8)</span>
              </button>
              <button
                type="button"
                onClick={() => triggerPrintJob('thermal-50x30')}
                className="px-3.5 py-2 text-xs font-black rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Thermal 50×30</span>
              </button>
              <button
                type="button"
                onClick={() => triggerPrintJob('thermal-30x20')}
                className="px-3.5 py-2 text-xs font-black rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 hover:bg-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Thermal 15–30mm</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="px-3.5 py-2 text-xs font-black rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'বিস্তারিত প্রিভিউ ও পিডিএফ' : 'Full Preview & PDF'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: Math.min(generatedConfig.copies, 24) }).map((_, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-center shadow-xs flex flex-col items-center justify-between space-y-1.5 transition-all hover:border-[#ff5c01] group relative"
                >
                  {generatedConfig.showBrand && (
                    <p className="font-extrabold text-[10px] text-slate-800 dark:text-slate-100 uppercase tracking-tight line-clamp-1 border-b border-slate-100 dark:border-slate-800 pb-1 w-full">
                      {brandName}
                    </p>
                  )}

                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                    {generatedConfig.productName}
                  </p>

                  {/* Barcode Image */}
                  {(generatedConfig.codeType === 'barcode' || generatedConfig.codeType === 'both') &&
                    generatedConfig.barcodeDataUrl && (
                      <div className="w-full flex justify-center py-1 overflow-hidden">
                        <img
                          src={generatedConfig.barcodeDataUrl}
                          alt="Barcode"
                          className="max-h-12 object-contain"
                        />
                      </div>
                    )}

                  {/* QR Image */}
                  {(generatedConfig.codeType === 'qrcode' || generatedConfig.codeType === 'both') &&
                    generatedConfig.qrDataUrl && (
                      <div className="w-full flex justify-center py-1">
                        <img
                          src={generatedConfig.qrDataUrl}
                          alt="QR Code"
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                    )}

                  {/* Footer */}
                  <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                    {generatedConfig.showSKU && (
                      <span className="font-mono text-slate-500 font-bold">
                        #{generatedConfig.sku}
                      </span>
                    )}

                    {generatedConfig.showPrice && (
                      <span className="font-black text-xs text-[#ff5c01] ml-auto">
                        {symbol}{generatedConfig.sellingPrice}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {generatedConfig.copies > 24 && (
              <div className="text-center pt-4 text-xs font-bold text-slate-500">
                + {generatedConfig.copies - 24}{' '}
                {language === 'bn'
                  ? 'টি আরও স্টিকার প্রিন্ট জবে যুক্ত হবে'
                  : 'more labels will be included in the print job'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-300 dark:border-slate-800 space-y-4 no-print">
          <div className="w-14 h-14 rounded-2xl bg-[#ff5c01]/10 text-[#ff5c01] flex items-center justify-center mx-auto shadow-xs">
            <Barcode className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-black text-sm text-slate-800 dark:text-slate-200">
              {language === 'bn'
                ? 'কোড জেনারেট করতে উপরের বাটনে চাপ দিন'
                : 'Ready to Generate & Print Labels'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn'
                ? 'পণ্য এবং অপশন ঠিক করে "কোড ও লেবেল তৈরি করুন" বাটনে চাপ দিলে এখানে লাইভ প্রিন্ট শিট তৈরি হবে।'
                : 'Select your product, code preferences, and click "Generate Barcode / QR Code" to prepare the printable sheets.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleExplicitGenerate}
            className="px-6 py-2.5 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-black shadow-md shadow-[#ff5c01]/20 cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {language === 'bn'
                ? 'এখনই কোড তৈরি করুন'
                : 'Generate Code Now'}
            </span>
          </button>
        </div>
      )}

      {/* Advanced Print Preview & PDF Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#ff5c01]/10 text-[#ff5c01] rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                    {language === 'bn' ? 'লেবেল প্রিন্ট ও পিডিএফ স্টুডিও' : 'Label Print & PDF Studio'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedProduct?.name} — SKU: {selectedProduct?.sku || selectedProduct?.id.slice(0, 8)} ({copiesInput} {language === 'bn' ? 'কপি' : 'copies'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Paper Format Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'bn' ? 'প্রিন্টার ও পেপার সাইজ নির্বাচন করুন:' : 'Select Printer Paper Size:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePrintLayout('a4')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePrintLayout === 'a4'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      {activePrintLayout === 'a4' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <strong className="text-xs font-black block">A4 Sticker Sheet</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      3×8 Grid (24 per sheet)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePrintLayout('thermal-50x30')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePrintLayout === 'thermal-50x30'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Tag className="w-4 h-4 text-amber-600" />
                      {activePrintLayout === 'thermal-50x30' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <strong className="text-xs font-black block">Thermal (50×30 mm)</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Standard Retail Roll
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePrintLayout('thermal-40x30')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePrintLayout === 'thermal-40x30'
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Tag className="w-4 h-4 text-purple-600" />
                      {activePrintLayout === 'thermal-40x30' && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                    <strong className="text-xs font-black block">Thermal (40×30 mm)</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Compact Retail Roll
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePrintLayout('thermal-30x20')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePrintLayout === 'thermal-30x20'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      {activePrintLayout === 'thermal-30x20' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <strong className="text-xs font-black block">Mini (15–30 mm)</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Jewelry / Mini Roll
                    </span>
                  </button>
                </div>
              </div>

              {/* Sample Render Box */}
              <div className="p-5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                <span className="text-[11px] font-bold text-slate-500 mb-3">
                  {language === 'bn' ? 'প্রিন্ট হওয়া একটি স্টিকারের নমুনা:' : 'Single Label Render Preview:'}
                </span>

                <div
                  className="bg-white text-black p-3.5 rounded-xl shadow-md border border-slate-300 flex flex-col items-center justify-between text-center"
                  style={{
                    width:
                      activePrintLayout === 'a4'
                        ? '210px'
                        : activePrintLayout === 'thermal-50x30'
                        ? '200px'
                        : activePrintLayout === 'thermal-40x30'
                        ? '170px'
                        : '140px',
                    minHeight:
                      activePrintLayout === 'thermal-30x20' ? '95px' : '110px',
                  }}
                >
                  {showBrand && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5 w-full">
                      {brandName}
                    </span>
                  )}
                  <span className="text-xs font-black text-slate-900 mt-1 line-clamp-1">
                    {selectedProduct?.name}
                  </span>

                  {/* Codes preview */}
                  {generatedConfig?.barcodeDataUrl && (codeType === 'barcode' || codeType === 'both') && (
                    <img
                      src={generatedConfig.barcodeDataUrl}
                      alt="Barcode"
                      className="max-h-11 my-1 object-contain"
                    />
                  )}

                  {generatedConfig?.qrDataUrl && (codeType === 'qrcode' || codeType === 'both') && (
                    <img
                      src={generatedConfig.qrDataUrl}
                      alt="QR"
                      className="w-14 h-14 my-1 object-contain"
                    />
                  )}

                  {!generatedConfig && (
                    <div className="my-3 text-[11px] text-slate-400 font-bold">
                      [Code will appear here upon generation]
                    </div>
                  )}

                  <div className="flex items-center justify-between w-full pt-1 border-t border-slate-200 text-[10px]">
                    {showSKU && (
                      <span className="font-mono font-bold text-slate-600">
                        #{selectedProduct?.sku || selectedProduct?.id.slice(0, 8)}
                      </span>
                    )}
                    {showPrice && (
                      <span className="font-black text-xs text-[#ff5c01] ml-auto">
                        {symbol}{selectedProduct?.sellingPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Image Copy Row */}
              {generatedConfig && (
                <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {language === 'bn' ? 'ছবি আলাদাভাবে সংরক্ষণ করুন:' : 'Copy Raw Code Images:'}
                  </span>
                  <div className="flex gap-2">
                    {generatedConfig.barcodeDataUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          copyImageToClipboard(generatedConfig.barcodeDataUrl, 'Barcode Image')
                        }
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Barcode</span>
                      </button>
                    )}
                    {generatedConfig.qrDataUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          copyImageToClipboard(generatedConfig.qrDataUrl, 'QR Code Image')
                        }
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>QR Code</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 gap-3">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(activePrintLayout)}
                  disabled={isDownloadingPdf}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-black transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>
                    {isDownloadingPdf
                      ? language === 'bn'
                        ? 'ডাউনলোড হচ্ছে...'
                        : 'Generating PDF...'
                      : language === 'bn'
                      ? 'পিডিএফ ডাউনলোড'
                      : 'Download PDF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    triggerPrintJob(activePrintLayout);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-black transition-all shadow-lg shadow-[#ff5c01]/20 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এখনই প্রিন্ট করুন' : 'Print Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Standalone print container strictly rendered for window.print() */}
      <div
        id="print-standalone-container"
        className={
          activePrintLayout === 'a4'
            ? 'print-layout-a4'
            : `print-layout-thermal ${activePrintLayout}`
        }
      >
        {generatedConfig &&
          Array.from({ length: generatedConfig.copies }).map((_, idx) => (
            <div key={idx} className="label-sticker-card">
              {generatedConfig.showBrand && (
                <div className="brand-text">{brandName.toUpperCase()}</div>
              )}
              <div className="product-title">{generatedConfig.productName}</div>
              <div className="code-zone">
                {(generatedConfig.codeType === 'barcode' || generatedConfig.codeType === 'both') &&
                  generatedConfig.barcodeDataUrl && (
                    <img
                      src={generatedConfig.barcodeDataUrl}
                      className="barcode-img"
                      alt="Barcode"
                    />
                  )}
                {(generatedConfig.codeType === 'qrcode' || generatedConfig.codeType === 'both') &&
                  generatedConfig.qrDataUrl && (
                    <img
                      src={generatedConfig.qrDataUrl}
                      className="qr-img"
                      alt="QR Code"
                    />
                  )}
              </div>
              <div className="footer-row">
                {generatedConfig.showSKU ? (
                  <span className="sku-text">#{generatedConfig.sku}</span>
                ) : (
                  <span></span>
                )}
                {generatedConfig.showPrice ? (
                  <span className="price-text">
                    {symbol}
                    {generatedConfig.sellingPrice}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
