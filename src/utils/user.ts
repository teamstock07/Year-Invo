import { UserProfile } from '../types';

/**
 * Gets the clean account display name following the priority:
 * 1. Stored profile / display name (ownerName, fullName, or name)
 * 2. Account / Brand name
 * 3. "Account"
 * 
 * Never returns an email or Gmail username if a profile name exists.
 * The personal name itself is never translated.
 */
export const getUserDisplayName = (user: UserProfile | null | undefined): string => {
  if (!user) return 'Account';

  // 1. Stored profile/display name
  const profileName = (user.ownerName || (user as any).fullName || (user as any).name || '').trim();
  if (profileName && profileName.toLowerCase() !== 'store owner' && profileName.toLowerCase() !== 'ariful islam') {
    return profileName;
  }
  if (profileName) {
    return profileName;
  }

  // 2. Account / Brand name
  const brand = (user.brandName || '').trim();
  if (brand && brand !== 'My Store' && brand !== 'Your Store Name') {
    return brand;
  }

  // 3. Fallback
  return 'Account';
};
