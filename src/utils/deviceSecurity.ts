/**
 * Device Security & Hardware Token Fingerprinting Utility
 * Provides device identification, OS/Browser parsing, and authorization state management.
 */

export interface DeviceHardwareInfo {
  deviceId: string;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  platform: string;
  screenResolution: string;
  language: string;
  userAgent: string;
}

const DEVICE_ID_KEY = 'yearinvo_secure_device_id_v2';
const DEVICE_NAME_KEY = 'yearinvo_secure_device_name_v2';

/**
 * Detects browser name and version
 */
export function detectBrowser(ua: string): string {
  if (/edg/i.test(ua)) return 'Microsoft Edge';
  if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) return 'Google Chrome';
  if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Apple Safari';
  if (/firefox|fxios/i.test(ua)) return 'Mozilla Firefox';
  if (/opr|opera/i.test(ua)) return 'Opera';
  if (/trident/i.test(ua)) return 'Internet Explorer';
  return 'Web Browser';
}

/**
 * Detects operating system
 */
export function detectOS(ua: string): string {
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
}

/**
 * Detects device category
 */
export function detectDeviceType(): 'Desktop' | 'Mobile' | 'Tablet' {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);
  if (isTablet) return 'Tablet';
  const isMobile = /mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua);
  if (isMobile) return 'Mobile';
  return 'Desktop';
}

/**
 * Generates a high-entropy cryptographically random device fingerprint ID
 */
export function generateDeviceId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `dev_${crypto.randomUUID().replace(/-/g, '')}`;
    }
  } catch (e) {}

  // Fallback random generation
  const rand1 = Math.random().toString(36).substring(2, 12);
  const rand2 = Math.random().toString(36).substring(2, 12);
  const ts = Date.now().toString(36);
  return `dev_${ts}_${rand1}${rand2}`;
}

/**
 * Retrieves or initializes the persistent device hardware ID
 */
export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id || id.trim().length < 8) {
      id = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return generateDeviceId();
  }
}

/**
 * Generates a descriptive default device name (e.g., "Counter Chrome - Windows")
 */
export function generateDefaultDeviceName(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const browser = detectBrowser(ua);
  const os = detectOS(ua);
  const type = detectDeviceType();

  // Check if custom name was stored locally by user
  try {
    const savedName = localStorage.getItem(DEVICE_NAME_KEY);
    if (savedName && savedName.trim()) {
      return savedName.trim();
    }
  } catch (e) {}

  if (type === 'Mobile') {
    return `${os} Mobile (${browser})`;
  } else if (type === 'Tablet') {
    return `${os} Tablet (${browser})`;
  }
  return `${os} Terminal (${browser})`;
}

/**
 * Saves a local custom friendly name for this device
 */
export function setLocalDeviceName(name: string): void {
  try {
    localStorage.setItem(DEVICE_NAME_KEY, name.trim());
  } catch (e) {}
}

/**
 * Retrieves full hardware and environment details of the current client device
 */
export function getCurrentDeviceInfo(): DeviceHardwareInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const browser = detectBrowser(ua);
  const os = detectOS(ua);
  const deviceType = detectDeviceType();
  const deviceId = getOrCreateDeviceId();
  const deviceName = generateDefaultDeviceName();

  let screenResolution = '1920x1080';
  if (typeof window !== 'undefined' && window.screen) {
    screenResolution = `${window.screen.width}x${window.screen.height}`;
  }

  const language = typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en';
  const platform = typeof navigator !== 'undefined' ? (navigator.platform || os) : os;

  return {
    deviceId,
    deviceName,
    browser,
    os,
    deviceType,
    platform,
    screenResolution,
    language,
    userAgent: ua,
  };
}
