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
 * 2. Exact match on product.id, product.sku, or product.barcode
 * 3. Formatted string fallbacks (e.g. SKU:XXXX, ID:XXXX)
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

  // 1. Try JSON payload parsing
  if ((code.startsWith('{') && code.endsWith('}')) || code.includes('"productId"') || code.includes('"sku"')) {
    try {
      const parsed = JSON.parse(code);
      if (parsed && typeof parsed === 'object') {
        if (parsed.storeId) scannedStoreId = String(parsed.storeId).trim();
        if (parsed.productId) targetId = String(parsed.productId).trim();
        if (parsed.id && !targetId) targetId = String(parsed.id).trim();
        if (parsed.sku) targetSku = String(parsed.sku).trim();
        if (parsed.barcode) targetBarcode = String(parsed.barcode).trim();
      }
    } catch (_) {}
  }

  // 2. Try formatted prefix strings (e.g., SKU:XXXX or ID:XXXX)
  if (!targetId && !targetSku && !targetBarcode) {
    if (code.includes('SKU:')) {
      const match = code.match(/SKU:\s*([^|\r\n]+)/i);
      if (match && match[1]) targetSku = match[1].trim();
    }
    if (code.includes('ID:')) {
      const match = code.match(/ID:\s*([^|\r\n]+)/i);
      if (match && match[1]) targetId = match[1].trim();
    }
  }

  // 3. Store Security Check: If scanned QR belongs strictly to a different store
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

  // Lookup Priority 2: Exact Match by SKU
  if (!matched && targetSku) {
    const tsku = targetSku.toLowerCase();
    matched = products.find((p) => (p.sku || '').trim().toLowerCase() === tsku);
  }

  // Lookup Priority 3: Exact Match by Barcode
  if (!matched && targetBarcode) {
    const tbarcode = targetBarcode.toLowerCase();
    matched = products.find((p) => (p.barcode || '').trim().toLowerCase() === tbarcode);
  }

  // Lookup Priority 4: Direct Raw Code search against Product ID, SKU, or Barcode
  if (!matched) {
    const lower = code.toLowerCase();
    matched = products.find((p) => {
      const id = (p.id || '').trim().toLowerCase();
      const sku = (p.sku || '').trim().toLowerCase();
      const barcode = (p.barcode || '').trim().toLowerCase();
      return id === lower || sku === lower || barcode === lower;
    });
  }

  if (!matched) {
    return { error: 'not_found' };
  }

  // 4. Verify product ownership if product object holds store/userId
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
