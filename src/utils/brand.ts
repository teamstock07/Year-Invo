export const PRIMARY_BRAND_NAME = 'YearInvo';
export const PARENT_COMPANY = 'by Year Media';
export const MAIN_SITE_NAME = `${PRIMARY_BRAND_NAME} ${PARENT_COMPANY}`;

export const getMainSiteBrand = (customName?: string, customSub?: string) => {
  const name = customName?.trim() || PRIMARY_BRAND_NAME;
  const sub = customSub?.trim() !== undefined ? customSub.trim() : PARENT_COMPANY;
  return { name, sub, fullName: sub ? `${name} ${sub}` : name };
};

/**
 * Returns the customer's personal store name.
 * Excludes generic 'Your Store Name' placeholders.
 */
export const getCustomerStoreName = (personalBrand?: string, fallbackBusinessType?: string): string => {
  const clean = personalBrand?.trim();
  if (
    !clean ||
    clean.toLowerCase() === 'your store name' ||
    clean.toLowerCase() === 'your store' ||
    clean.toLowerCase() === 'yearinvo' ||
    clean.toLowerCase() === 'yearinvo by year media'
  ) {
    if (fallbackBusinessType && fallbackBusinessType.toLowerCase() !== 'your store name' && fallbackBusinessType.toLowerCase() !== 'general') {
      return fallbackBusinessType;
    }
    return '';
  }
  return clean;
};

/**
 * Returns full combined brand title for documents/invoices/reports:
 * e.g., "YearInvo by Year Media • My Supermarket" or "YearInvo by Year Media"
 */
export const getDisplayBrandName = (
  personalBrand?: string,
  fallbackBusinessType?: string,
  siteName?: string,
  siteSub?: string
): string => {
  const mainSite = getMainSiteBrand(siteName, siteSub).fullName;
  const storeName = getCustomerStoreName(personalBrand, fallbackBusinessType);
  return storeName ? `${mainSite} • ${storeName}` : mainSite;
};


