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
 * Matching strategy:
 * 1. Exact match on product.sku or product.barcode or product.id (case-insensitive)
 * 2. Formatted string fallback (e.g., SKU:XXXX|NAME:... or SKU:XXXX)
 * 3. JSON fallback (e.g., {"sku":"XXXX"})
 */
export function findProductByCode(products: Product[], rawCode: string): Product | undefined {
  const code = normalizeCode(rawCode);
  if (!code) return undefined;

  const lower = code.toLowerCase();

  // 1. Primary: Exact match on SKU or Barcode or ID (case-insensitive)
  let match = products.find((p) => {
    const sku = (p.sku || '').trim().toLowerCase();
    const barcode = (p.barcode || '').trim().toLowerCase();
    const id = (p.id || '').trim().toLowerCase();
    return sku === lower || barcode === lower || id === lower;
  });
  if (match) return match;

  // 2. Secondary: If QR code contains formatted string with "SKU:"
  if (code.includes('SKU:')) {
    const extracted = code.match(/SKU:\s*([^|\r\n]+)/i);
    if (extracted && extracted[1]) {
      const skuVal = extracted[1].trim().toLowerCase();
      match = products.find((p) => {
        const sku = (p.sku || '').trim().toLowerCase();
        const barcode = (p.barcode || '').trim().toLowerCase();
        return sku === skuVal || barcode === skuVal;
      });
      if (match) return match;
    }
  }

  // 3. Secondary: JSON payload
  if (code.startsWith('{') && code.endsWith('}')) {
    try {
      const parsed = JSON.parse(code);
      const targetSku = (parsed.sku || parsed.barcode || parsed.id || '').toString().trim().toLowerCase();
      if (targetSku) {
        match = products.find((p) => {
          const sku = (p.sku || '').trim().toLowerCase();
          const barcode = (p.barcode || '').trim().toLowerCase();
          return sku === targetSku || barcode === targetSku;
        });
        if (match) return match;
      }
    } catch (_) {}
  }

  return undefined;
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
