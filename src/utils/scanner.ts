import { Product } from '../types';

/**
 * Normalizes scanned code strings by trimming whitespace and stripping line breaks.
 */
export function normalizeCode(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/[\r\n\t]+/g, '').trim();
}

/**
 * Searches the products array for a product matching the scanned code.
 * Supporting:
 * 1. YearInvo Structured JSON payloads (with productId, sku, barcode, storeId)
 * 2. QR code URLs or query parameter strings (e.g. ?code=..., ?sku=..., ?productId=..., ?barcode=...)
 * 3. Formatted string fallbacks (e.g. SKU:XXXX, ID:XXXX, BARCODE:XXXX, CODE:XXXX)
 * 4. Exact direct match on product.barcode, product.sku, or product.id
 * 5. Case-insensitive and trimmed barcode/QR code matching
 */
export interface ScanResult {
  product?: Product;
  error?: 'not_found' | 'different_store' | 'out_of_stock' | 'expired' | 'inactive';
}

export function findProductWithStoreCheck(
  products: Product[],
  rawCode: string,
  currentStoreId?: string
): ScanResult {
  const code = normalizeCode(rawCode);
  if (!code) return { error: 'not_found' };

  let scannedStoreId: string | undefined = undefined;
  let targetId: string | undefined = undefined;
  let targetSku: string | undefined = undefined;
  let targetBarcode: string | undefined = undefined;
  let cleanCode = code;

  // 1. Try JSON payload parsing (YearInvo QR code format or third-party POS QR)
  if ((code.startsWith('{') && code.endsWith('}')) || code.includes('"productId"') || code.includes('"sku"') || code.includes('"barcode"')) {
    try {
      const parsed = JSON.parse(code);
      if (parsed && typeof parsed === 'object') {
        if (parsed.storeId) scannedStoreId = String(parsed.storeId).trim();
        if (parsed.productId) targetId = String(parsed.productId).trim();
        if (parsed.id && !targetId) targetId = String(parsed.id).trim();
        if (parsed.sku) targetSku = String(parsed.sku).trim();
        if (parsed.barcode) targetBarcode = String(parsed.barcode).trim();
        if (parsed.code && !targetBarcode && !targetSku && !targetId) cleanCode = String(parsed.code).trim();
      }
    } catch (_) {}
  }

  // 2. Try URL / Query string parsing (e.g. https://domain.com/item?id=... or ?sku=... or ?barcode=...)
  if (!targetId && !targetSku && !targetBarcode && (code.includes('http://') || code.includes('https://') || code.includes('?'))) {
    try {
      const urlObj = new URL(code.startsWith('http') ? code : `https://dummy.com/${code}`);
      const paramId = urlObj.searchParams.get('productId') || urlObj.searchParams.get('id');
      const paramSku = urlObj.searchParams.get('sku');
      const paramBarcode = urlObj.searchParams.get('barcode') || urlObj.searchParams.get('code');
      const paramStore = urlObj.searchParams.get('storeId') || urlObj.searchParams.get('store');

      if (paramStore) scannedStoreId = paramStore.trim();
      if (paramId) targetId = paramId.trim();
      if (paramSku) targetSku = paramSku.trim();
      if (paramBarcode) targetBarcode = paramBarcode.trim();

      // Check URL path last segment if no query params found (e.g. /product/SKU-12345 or /item/890123456)
      if (!targetId && !targetSku && !targetBarcode) {
        const segments = urlObj.pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          const lastSegment = decodeURIComponent(segments[segments.length - 1]);
          if (lastSegment) {
            cleanCode = lastSegment;
          }
        }
      }
    } catch (_) {}
  }

  // 3. Try formatted prefix strings (e.g., SKU:XXXX, ID:XXXX, BARCODE:XXXX, CODE:XXXX)
  if (!targetId && !targetSku && !targetBarcode) {
    if (/SKU:\s*([^|\r\n;,]+)/i.test(code)) {
      const match = code.match(/SKU:\s*([^|\r\n;,]+)/i);
      if (match && match[1]) targetSku = match[1].trim();
    }
    if (/ID:\s*([^|\r\n;,]+)/i.test(code)) {
      const match = code.match(/ID:\s*([^|\r\n;,]+)/i);
      if (match && match[1]) targetId = match[1].trim();
    }
    if (/BARCODE:\s*([^|\r\n;,]+)/i.test(code)) {
      const match = code.match(/BARCODE:\s*([^|\r\n;,]+)/i);
      if (match && match[1]) targetBarcode = match[1].trim();
    }
    if (/CODE:\s*([^|\r\n;,]+)/i.test(code)) {
      const match = code.match(/CODE:\s*([^|\r\n;,]+)/i);
      if (match && match[1]) cleanCode = match[1].trim();
    }
  }

  // 4. Store Security Check: If scanned QR/Barcode payload explicitly designates a different store
  if (
    scannedStoreId &&
    currentStoreId &&
    scannedStoreId.toLowerCase() !== currentStoreId.toLowerCase()
  ) {
    return { error: 'different_store' };
  }

  let matched: Product | undefined = undefined;

  // Lookup Priority 1: Exact Match by Product ID
  if (targetId) {
    const tid = targetId.toLowerCase();
    matched = products.find((p) => (p.id || '').trim().toLowerCase() === tid);
  }

  // Lookup Priority 2: Exact Match by Barcode
  if (!matched && targetBarcode) {
    const tbarcode = targetBarcode.toLowerCase();
    matched = products.find((p) => (p.barcode || '').trim().toLowerCase() === tbarcode);
  }

  // Lookup Priority 3: Exact Match by SKU
  if (!matched && targetSku) {
    const tsku = targetSku.toLowerCase();
    matched = products.find((p) => (p.sku || '').trim().toLowerCase() === tsku);
  }

  // Lookup Priority 4: Direct Code search against Barcode, SKU, or Product ID (handles standard linear Barcodes, QR code strings, etc.)
  if (!matched) {
    const lower = cleanCode.toLowerCase();
    // 4a. First try matching product's stored barcode (standard 1D / 2D barcode number)
    matched = products.find((p) => (p.barcode || '').trim().toLowerCase() === lower);

    // 4b. Then try matching product SKU / QR code identifier
    if (!matched) {
      matched = products.find((p) => (p.sku || '').trim().toLowerCase() === lower);
    }

    // 4c. Then try matching internal product ID
    if (!matched) {
      matched = products.find((p) => (p.id || '').trim().toLowerCase() === lower);
    }

    // 4d. Fallback: match without leading zeros if numeric code scanned
    if (!matched && /^\d+$/.test(cleanCode)) {
      const unpadded = cleanCode.replace(/^0+/, '');
      if (unpadded && unpadded !== cleanCode) {
        matched = products.find((p) => {
          const pBarcodeUnpadded = (p.barcode || '').trim().replace(/^0+/, '');
          return pBarcodeUnpadded === unpadded;
        });
      }
    }
  }

  if (!matched) {
    return { error: 'not_found' };
  }

  // 5. Verify product ownership if product object holds store/userId
  const prodStoreId = (matched as any).storeId || (matched as any).userId;
  if (
    prodStoreId &&
    currentStoreId &&
    String(prodStoreId).toLowerCase() !== String(currentStoreId).toLowerCase()
  ) {
    return { error: 'different_store' };
  }

  return { product: matched };
}

export function findProductByCode(
  products: Product[],
  rawCode: string,
  currentStoreId?: string
): Product | undefined {
  const result = findProductWithStoreCheck(products, rawCode, currentStoreId);
  return result.product;
}

/**
 * Validates SKU uniqueness across existing products.
 */
export function isSkuUnique(products: Product[], sku: string, excludeProductId?: string): boolean {
  const normSku = normalizeCode(sku).toLowerCase();
  if (!normSku) return true;
  return !products.some(
    (p) => p.id !== excludeProductId && (p.sku || '').trim().toLowerCase() === normSku
  );
}

/**
 * Generates a stable unique SKU if none provided.
 */
export function generateUniqueSku(products: Product[]): string {
  let sku = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 1000) {
    attempts++;
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    sku = `SKU-${randomNum}`;
    isUnique = isSkuUnique(products, sku);
  }

  return sku;
}

/**
 * Generates a stable numeric barcode if needed.
 */
export function generateUniqueBarcode(products: Product[]): string {
  let barcode = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 1000) {
    attempts++;
    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    barcode = `890${randomNum}`;
    isUnique = !products.some((p) => (p.barcode || '').trim() === barcode);
  }

  return barcode;
}
