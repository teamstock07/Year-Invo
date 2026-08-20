import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateUniqueSku, generateUniqueBarcode } from '../utils/scanner';
import { compressImage } from '../utils/imageCompressor';
import { auth, db } from '../lib/firebase';
import {
  sendPasswordResetEmail,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  addDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';
import {
  UserProfile,
  Product,
  Category,
  Brand,
  Customer,
  Supplier,
  Expense,
  Sale,
  Purchase,
  AppNotification,
  ActivityLog,
  BusinessSettings,
  Language,
  ThemeMode,
  StockAdjustment,
  DueCollection,
  CartItem,
  SubscriptionRequest,
  SubscriptionPlan,
  BillingCycle,
  UserRole,
  OwnerPaymentSettings,
  BangladeshPaymentConfig,
  DashboardPreferences,
  defaultDashboardPreferences,
  TeamMember,
  Employee,
  PayrollPayment,
  SalaryAdjustment,
  AuditLogEntry,
  CustomerLoyaltySettings,
  EmployeeDevice,
  Investment,
  CapitalWithdrawal,
} from '../types';
import {
  getCurrentDeviceInfo,
  getOrCreateDeviceId,
  setLocalDeviceName,
} from '../utils/deviceSecurity';
import {
  saveUserCloudCollection,
  saveUserCloudCollectionsBatch,
  subscribeToUserBusinessData,
} from '../services/cloudSyncService';
import { offlineDb } from '../services/offlineDb';
import { syncQueueService } from '../services/syncQueueService';
import {
  initialCategories,
  initialBrands,
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialExpenses,
  initialSales,
  initialPurchases,
  initialNotifications,
  initialActivityLogs,
  initialInvestments,
  initialCapitalWithdrawals,
} from '../data/mockData';
import { translations } from '../i18n/translations';
import { isRtlLanguage, getDefaultLanguageForCountry, SUPPORTED_LANGUAGES } from '../i18n/languages';
import {
  formatNumber as formatNumberHelper,
  formatCurrency as formatCurrencyHelper,
  formatDate as formatDateHelper,
  formatMoney as formatMoneyHelper,
} from '../utils/format';
import {
  useExchangeRates,
  convertCurrency as convertCurrencyHelper,
  getExchangeRate as getExchangeRateHelper,
  normalizeCurrencyCode,
  getCurrencySymbol,
  FormatMoneyOptions,
} from '../services/currencyService';
import { isBangladeshCountry } from '../config/pricing';
import { generateSystemNotifications } from '../services/notificationService';

export const normalizePlan = (rawPlan: any): SubscriptionPlan => {
  if (!rawPlan) return 'Free';
  const str = String(rawPlan).trim();
  if (/^lifetime$/i.test(str)) return 'Lifetime';
  if (/^pro$/i.test(str)) return 'Pro';
  if (/^premium$/i.test(str)) return 'Premium';
  if (/^business$/i.test(str)) return 'Business';
  if (/^tier2$/i.test(str)) return 'Tier2';
  if (/^starter$/i.test(str)) return 'Starter';
  if (/^free$/i.test(str)) return 'Free';
  return (str as SubscriptionPlan) || 'Free';
};

export const calculateSubscriptionExpiry = (startDate: Date | string, billingPeriod: BillingCycle | string): string => {
  const start = new Date(startDate);
  const expiry = new Date(start);
  if (billingPeriod === 'five_year') {
    expiry.setFullYear(expiry.getFullYear() + 5);
  } else if (billingPeriod === 'yearly') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    // monthly
    expiry.setMonth(expiry.getMonth() + 1);
  }
  return expiry.toISOString();
};

interface AppContextType {
  // Auth & Profile
  user: UserProfile | null;
  isEmailVerified: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; requiresEmailVerification?: boolean }>;
  signup: (data: Partial<UserProfile> & { password?: string }) => Promise<{ success: boolean; message?: string; requiresEmailVerification?: boolean }>;
  sendVerificationOtp: (email?: string, name?: string) => Promise<{ success: boolean; message: string; cooldownRemaining?: number }>;
  verifyEmailOtp: (code: string, email?: string) => Promise<{ success: boolean; message?: string }>;
  resendEmailVerification: () => Promise<{ success: boolean; message: string; cooldownRemaining?: number }>;
  checkEmailVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateUser: (data: Partial<UserProfile>) => void;
  uploadProfilePhoto: (photoDataUrl: string) => Promise<void>;
  removeProfilePhoto: () => Promise<void>;

  // Platform Owner & User Management
  allUsers: UserProfile[];
  updateUserRole: (userId: string, newRole: UserRole) => void;
  sendFirebasePasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  suspendUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string, newPass: string) => void;
  updateUserPlan: (userId: string, newPlan: SubscriptionPlan, billingPeriod?: BillingCycle) => void;
  updateUserData: (userId: string, data: Partial<UserProfile>) => void;
  refreshUsers: () => Promise<void>;

  // Subscription Approval & Activation System
  subscriptionRequests: SubscriptionRequest[];
  requestSubscription: (data: {
    requestedPlan: SubscriptionPlan;
    billingCycle: BillingCycle;
    paymentMethod: string;
    paymentRegion?: 'international' | 'bangladesh';
    paymentProvider?: string;
    currency?: string;
    transactionId?: string;
    amount: number;
  }) => Promise<boolean>;
  activateUserSubscription: (params: {
    userId: string;
    plan: SubscriptionPlan;
    billingPeriod: BillingCycle;
    paymentMethod?: string;
    paymentProvider?: string;
    paymentRegion?: 'international' | 'bangladesh';
    transactionId?: string;
    amount?: number;
    currency?: string;
  }) => Promise<void>;
  calculateSubscriptionExpiry: (startDate: Date | string, billingPeriod: BillingCycle | string) => string;
  approveSubscriptionRequest: (requestId: string) => Promise<void>;
  rejectSubscriptionRequest: (requestId: string, notes?: string) => Promise<void>;
  cancelSubscriptionRequest: (requestId: string, notes?: string) => Promise<void>;
  cancelUserSubscription: (userId: string, notes?: string) => Promise<void>;

  // Settings & Theme
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: (key: string) => string;
  formatNumber: (val: number | string | undefined | null, options?: { decimals?: number; useGrouping?: boolean }) => string;
  formatCurrency: (
    amount: number | string | undefined | null,
    options?: FormatMoneyOptions & { sourceCurrency?: string; displayCurrency?: string }
  ) => string;
  formatMoney: (
    amount: number | string | undefined | null,
    sourceCurrency?: string,
    displayCurrency?: string,
    locale?: Language | string,
    options?: FormatMoneyOptions
  ) => string;
  convertMoney: (amount: number, fromCurrency?: string, toCurrency?: string) => number;
  getExchangeRate: (fromCurrency: string, toCurrency?: string) => Promise<number>;
  storeBaseCurrency: string;
  displayCurrency: string;
  displayCurrencySymbol: string;
  exchangeRates: Record<string, number>;
  isExchangeRatesLoading: boolean;
  formatDate: (dateStr: string | Date | undefined | null) => string;

  // Dashboard Customization Preferences
  dashboardPreferences: DashboardPreferences;
  updateDashboardPreferences: (newPrefs: Partial<DashboardPreferences>) => Promise<void>;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Entities Data
  products: Product[];
  categories: Category[];
  brands: Brand[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  sales: Sale[];
  purchases: Purchase[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  adjustments: StockAdjustment[];
  dueCollections: DueCollection[];

  // POS State
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  checkoutPOS: (saleData: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    discount: number;
    tax: number;
    paymentMethod: 'Cash' | 'Card' | 'bKash/Mobile' | 'Due/Credit' | 'Split';
    cashReceived: number;
    note?: string;
  }) => Promise<Sale>;

  // Categories & Brands CRUD
  addCategory: (name: string, description?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBrand: (name: string, description?: string) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearAllProducts: () => Promise<void>;

  // POS / QR Code Limit Helpers
  generatedProductCodes: string[];
  recordGeneratedCode: (productId: string) => boolean;
  isCodeGenerated: (productId: string) => boolean;
  removeGeneratedCode: (productId: string) => void;
  getGeneratedQRCount: (productId: string) => number;
  recordGeneratedQRCodes: (productId: string, requestedCount: number) => { success: boolean; message?: string };

  // Stock Actions
  adjustStock: (productId: string, quantityDelta: number, reason: string, type: 'addition' | 'reduction' | 'damage_writeoff' | 'audit_correction') => Promise<void>;

  // Customers & Suppliers CRUD
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'dueAmount' | 'totalSpent' | 'lifetimePurchasesCount'>) => Promise<Customer>;
  updateCustomer: (id: string, cust: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addSupplier: (supp: Omit<Supplier, 'id' | 'createdAt' | 'dueAmount' | 'totalPurchasesCount'>) => Promise<Supplier>;
  updateSupplier: (id: string, supp: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  resetAllDataToZero: () => Promise<void>;
  loadSampleDemoData: () => Promise<void>;

  // Expenses & Purchases
  addExpense: (exp: Omit<Expense, 'id'>) => Promise<Expense>;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'purchaseNo'>) => Promise<Purchase>;

  // Capital & Investment
  investments: Investment[];
  capitalWithdrawals: CapitalWithdrawal[];
  addInvestment: (inv: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Investment>;
  updateInvestment: (id: string, inv: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  addCapitalWithdrawal: (w: Omit<CapitalWithdrawal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CapitalWithdrawal>;
  updateCapitalWithdrawal: (id: string, w: Partial<CapitalWithdrawal>) => Promise<void>;
  deleteCapitalWithdrawal: (id: string) => Promise<void>;

  // Due Collection
  collectDue: (data: { type: 'customer' | 'supplier'; entityId: string; amountPaid: number; paymentMethod: string; note?: string }) => Promise<DueCollection | undefined>;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Backup
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Team, Payroll, Audit & Loyalty
  teamMembers: TeamMember[];
  saveTeamMembers: (updated: TeamMember[]) => void;
  devices: EmployeeDevice[];
  saveDevices: (updated: EmployeeDevice[]) => void;
  requestDeviceAuthorization: (params?: { deviceName?: string; notes?: string }) => Promise<EmployeeDevice>;
  approveDevice: (deviceId: string) => Promise<void>;
  revokeDevice: (deviceId: string, reason?: string) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  renameDevice: (deviceId: string, newName: string) => Promise<void>;
  currentDeviceId: string;
  currentDevice: EmployeeDevice | null;
  isCurrentDeviceAuthorized: boolean;
  employees: Employee[];
  saveEmployees: (updated: Employee[]) => void;
  payrollPayments: PayrollPayment[];
  savePayrollPayments: (updated: PayrollPayment[]) => void;
  salaryAdjustments: SalaryAdjustment[];
  saveSalaryAdjustments: (updated: SalaryAdjustment[]) => void;
  auditLogs: AuditLogEntry[];
  saveAuditLogs: (updated: AuditLogEntry[]) => void;
  loyaltySettings: CustomerLoyaltySettings;
  saveLoyaltySettings: (updated: CustomerLoyaltySettings) => void;
  isCloudSynced: boolean;

  // Calculated Business Metrics
  metrics: {
    todaySales: number;
    todayExpense: number;
    todayBuyingCost: number;
    todayGrossProfit: number;
    todayProfit: number;
    todayLoss: number;
    todayDue: number;
    todayDueSuppliers: number;
    totalBalance: number;
    totalStockQty: number;
    totalInventoryCostValue: number;
    totalInventorySellingValue: number;
    totalDueCustomers: number;
    totalDueSuppliers: number;
    monthlySales: number;
    monthlyExpense: number;
    monthBuyingCost: number;
    monthGrossProfit: number;
    monthlyProfit: number;
    monthlyLoss: number;
    lowStockCount: number;
    expiredCount: number;
    totalInvestedCapital: number;
    totalWithdrawnCapital: number;
    currentCapital: number;
    investmentCount: number;
    withdrawalCount: number;
  };
}

function parseOwnerPaymentSettings(pData: any): OwnerPaymentSettings {
  const bdData = pData?.bangladesh || {};
  const bdMethods = bdData?.methods || {};

  const defaultBkashNum = bdMethods?.bkash?.number ?? pData?.paymentNumber ?? pData?.accountNumber ?? '01700000000';
  const defaultNagadNum = bdMethods?.nagad?.number ?? pData?.paymentNumber ?? pData?.accountNumber ?? '01700000000';
  const defaultRocketNum = bdMethods?.rocket?.number ?? pData?.paymentNumber ?? pData?.accountNumber ?? '01700000000';

  const bangladeshConfig: BangladeshPaymentConfig = {
    enabled: bdData?.enabled ?? pData?.localPaymentEnabled ?? true,
    methods: {
      bkash: {
        enabled: bdMethods?.bkash?.enabled ?? true,
        number: defaultBkashNum,
      },
      nagad: {
        enabled: bdMethods?.nagad?.enabled ?? true,
        number: defaultNagadNum,
      },
      rocket: {
        enabled: bdMethods?.rocket?.enabled ?? false,
        number: defaultRocketNum,
      },
    },
    receiverName: bdData?.receiverName || pData?.receiverName || pData?.accountName || 'YearInvo Store',
    storeName: bdData?.storeName || pData?.storeName || 'YearInvo Store',
    transactionIdInstruction: bdData?.transactionIdInstruction || pData?.transactionIdInstruction || 'Copy your transaction ID and enter it below.',
  };

  return {
    localPaymentEnabled: bangladeshConfig.enabled,
    paymentMethod: pData?.paymentMethod || 'bKash / Nagad / Rocket',
    paymentNumber: defaultBkashNum,
    receiverName: bangladeshConfig.receiverName,
    storeName: bangladeshConfig.storeName,
    transactionIdInstruction: bangladeshConfig.transactionIdInstruction,
    bangladesh: bangladeshConfig,
    qrEnabled: pData?.qrEnabled ?? true,
    qrProvider: pData?.qrProvider || 'bKash',
    qrImageUrl: pData?.qrImageUrl || '',
    accountName: bangladeshConfig.receiverName,
    accountNumber: defaultBkashNum,
    updatedAt: pData?.updatedAt,
  };
}

const defaultSettings: BusinessSettings = {
  logoUrl: '',
  brandName: 'Your Store Name',
  siteLogoUrl: '',
  siteBrandName: 'YearInvo',
  siteSubBrandName: 'by Year Media',
  currency: '৳',
  currencyPosition: 'prefix',
  timeZone: 'Asia/Dhaka',
  taxRatePercent: 0,
  receiptHeader: 'Thank you for choosing YearInvo by Year Media!',
  receiptFooter: 'Please visit again. For support: +880 1700 000000',
  language: 'en',
  theme: 'dark',
  autoBackup: true,
  paymentSettings: {
    localPaymentEnabled: true,
    paymentMethod: 'bKash',
    paymentNumber: '01700000000',
    receiverName: 'YearInvo Store',
    storeName: 'YearInvo Store',
    transactionIdInstruction: 'Copy your transaction ID and enter it below.',
    bangladesh: {
      enabled: true,
      methods: {
        bkash: { enabled: true, number: '01700000000' },
        nagad: { enabled: true, number: '01700000000' },
        rocket: { enabled: false, number: '01700000000' },
      },
      receiverName: 'YearInvo Store',
      storeName: 'YearInvo Store',
      transactionIdInstruction: 'Copy your transaction ID and enter it below.',
    },
    qrEnabled: true,
    qrProvider: 'bKash',
    qrImageUrl: '',
    accountName: 'YearInvo Store',
    accountNumber: '01700000000',
  },
};

const initialRegisteredUsers: UserProfile[] = [
  {
    id: 'usr-demo-merchant-01',
    brandName: 'Demo Retail Shop',
    ownerName: 'Ariful Islam',
    mobile: '+880 1712 345678',
    email: 'owner@omnibiz.com',
    password: '123456',
    businessType: 'General Retail & Grocery',
    country: 'Bangladesh',
    currency: '৳',
    timeZone: 'Asia/Dhaka',
    role: 'Manager',
    subscriptionPlan: 'Business',
    subscriptionStatus: 'active',
    status: 'active',
    verifiedEmail: true,
    verifiedPhone: true,
    createdAt: '2026-01-01',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use centralized exchange rates hook
  const {
    rates: exchangeRates,
    isLoading: isExchangeRatesLoading,
    convert: convertCurrencyWithRates,
    format: formatMoneyWithRates,
  } = useExchangeRates();

  // Saved language & theme
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('biz_language');
    return (saved as Language) || 'en';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('biz_theme');
    return (saved as ThemeMode) || 'dark';
  });

  // Dashboard Preferences
  const [dashboardPreferences, setDashboardPreferences] = useState<DashboardPreferences>(() => {
    try {
      const saved = localStorage.getItem('biz_dashboard_preferences');
      if (saved) {
        return { ...defaultDashboardPreferences, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return defaultDashboardPreferences;
  });

  // Strictly default user to NULL for unauthenticated landing view
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('biz_user');
    if (!saved || saved === 'null') return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed && parsed.email ? parsed : null;
    } catch (e) {
      return null;
    }
  });

  // Track Firebase Auth emailVerified status
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(() => {
    return Boolean(auth.currentUser?.emailVerified);
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('biz_user', JSON.stringify(user));
        if (user.id) {
          localStorage.setItem(`biz_user_${user.id}`, JSON.stringify(user));
        }
      } else {
        localStorage.setItem('biz_user', 'null');
      }
    } catch (e) {
      console.warn('Notice persisting user to storage:', e);
    }
  }, [user]);

  // Helper to check if user is Platform Admin (teamstock07@gmail.com)
  const isTeamStockAdmin = (emailStr?: string | null) => {
    if (!emailStr) return false;
    return emailStr.trim().toLowerCase() === 'teamstock07@gmail.com';
  };

  // Listen to Firebase Auth state changes & sync user profile from Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log(`[AUTH] Firebase authentication completed: ${firebaseUser.email || firebaseUser.uid}`);
        console.log(`[AUTH] UID received: ${firebaseUser.uid}`);
        console.log(`[AUTH] user profile query started: docPath=users/${firebaseUser.uid}`);

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userRef);

          const userEmail = (firebaseUser.email || (docSnap.exists() ? docSnap.data()?.email : '') || '').toLowerCase();
          const isAdmin = isTeamStockAdmin(userEmail);

          let uData: any = null;

          if (docSnap.exists()) {
            uData = docSnap.data();
          } else if (userEmail) {
            // Check if user profile was stored under another document matching this email
            try {
              const q = query(collection(db, 'users'), where('email', '==', userEmail));
              const querySnap = await getDocs(q);
              if (!querySnap.empty) {
                uData = querySnap.docs[0].data();
                console.log('[Auth] Located existing user profile by email match:', userEmail);
              } else {
                // Also check if document was keyed directly by email
                const emailDocSnap = await getDoc(doc(db, 'users', userEmail));
                if (emailDocSnap.exists()) {
                  uData = emailDocSnap.data();
                  console.log('[Auth] Located existing user profile by email doc key:', userEmail);
                }
              }
            } catch (queryErr) {
              console.warn('[Auth] Email lookup notice:', queryErr);
            }
          }

          console.log(`[AUTH] user profile query completed: found=${Boolean(uData)}`);
          console.log(`[AUTH] store lookup started`);

          const roleRaw = uData?.role || uData?.roleName || 'Owner';
          const normalizedRole: UserRole = (isAdmin || !roleRaw || roleRaw.toString().toLowerCase() === 'owner' || roleRaw.toString().toLowerCase() === 'admin' || roleRaw.toString().toLowerCase() === 'platformowner' || roleRaw.toString().toLowerCase() === 'manager') ? 'Owner' : (roleRaw as UserRole);

          if (isAdmin && (!uData || uData.role !== 'owner' || uData.subscriptionPlan !== 'Lifetime')) {
            try {
              setDoc(userRef, {
                uid: firebaseUser.uid,
                id: firebaseUser.uid,
                email: userEmail,
                role: 'owner',
                subscriptionPlan: 'Lifetime',
                subscription: 'lifetime',
                subscriptionStatus: 'active',
                status: 'active',
                updatedAt: serverTimestamp(),
              }, { merge: true });
            } catch (e) {
              console.warn('Sync admin role notice:', e);
            }
          }

          if (uData?.status === 'suspended' && !isAdmin) {
            await signOut(auth);
            setUser(null);
            return;
          }

          let savedBrand = '';
          try {
            const savedSet = localStorage.getItem('biz_settings');
            if (savedSet) {
              const pSet = JSON.parse(savedSet);
              if (pSet && pSet.brandName && pSet.brandName !== 'My Store') {
                savedBrand = pSet.brandName;
              }
            }
            if (!savedBrand) {
              const savedU = localStorage.getItem('biz_user');
              if (savedU && savedU !== 'null') {
                const pU = JSON.parse(savedU);
                if (pU && pU.brandName && pU.brandName !== 'My Store') {
                  savedBrand = pU.brandName;
                }
              }
            }
          } catch (e) {}

          const fsBrand = uData?.brandName || uData?.storeName || '';
          const effectiveBrandName = fsBrand && fsBrand !== 'My Store' ? fsBrand : (savedBrand || fsBrand || 'My Store');

          console.log(`[AUTH] store lookup completed: brandName=${effectiveBrandName}`);

          if (savedBrand && fsBrand !== savedBrand) {
            try {
              updateDoc(userRef, { brandName: savedBrand, storeName: savedBrand });
            } catch (e) {}
          }

          const userPreferredLang = uData?.preferredLanguage || uData?.language;
          const subPlan: SubscriptionPlan = isAdmin ? 'Lifetime' : ((uData?.subscriptionPlan || uData?.subscription || 'Free') as SubscriptionPlan);
          const subStatus = uData?.subscriptionStatus || 'active';
          const subPending = uData?.pendingPlan || undefined;
          const subStartDate = uData?.startDate || uData?.currentPeriodStart || undefined;
          const subExpiryDate = uData?.expiryDate || uData?.currentPeriodEnd || undefined;
          const subBillingPeriod = (uData?.billingPeriod || uData?.billingCycle || 'monthly') as BillingCycle;

          const profile: UserProfile = {
            id: firebaseUser.uid,
            brandName: effectiveBrandName,
            ownerName: uData?.ownerName || uData?.fullName || firebaseUser.displayName || (isAdmin ? 'Admin Owner' : 'Store Owner'),
            fullName: uData?.fullName || uData?.ownerName || firebaseUser.displayName || (isAdmin ? 'Admin Owner' : 'Store Owner'),
            name: uData?.name || uData?.fullName || uData?.ownerName || '',
            mobile: uData?.mobile || uData?.phone || '',
            email: firebaseUser.email || uData?.email || userEmail,
            businessType: uData?.businessType || uData?.storeType || 'General Retail & Grocery',
            country: uData?.country || 'Bangladesh',
            preferredLanguage: userPreferredLang && SUPPORTED_LANGUAGES.some((l) => l.code === userPreferredLang) ? (userPreferredLang as Language) : undefined,
            currency: uData?.currency || '৳',
            timeZone: uData?.timeZone || 'Asia/Dhaka',
            role: normalizedRole,
            subscriptionPlan: subPlan,
            subscriptionStatus: subStatus,
            pendingPlan: subPending,
            startDate: subStartDate,
            expiryDate: subExpiryDate,
            billingPeriod: subBillingPeriod,
            transactionId: uData?.transactionId || undefined,
            paymentMethod: uData?.paymentMethod || uData?.paymentProvider || undefined,
            status: uData?.status || 'active',
            storeAddress: uData?.storeAddress || uData?.address || '',
            affiliateCode: uData?.affiliateCode || '',
            affiliateProgram: uData?.affiliateProgram || '',
            photoUrl: uData?.photoUrl || uData?.avatarUrl || uData?.profilePhotoUrl || firebaseUser.photoURL || undefined,
            avatarUrl: uData?.avatarUrl || uData?.photoUrl || uData?.profilePhotoUrl || firebaseUser.photoURL || undefined,
            profilePhotoUrl: uData?.profilePhotoUrl || uData?.photoUrl || uData?.avatarUrl || firebaseUser.photoURL || undefined,
            verifiedEmail: isAdmin || Boolean(firebaseUser.emailVerified) || Boolean(uData?.verifiedEmail) || Boolean(uData?.emailVerified),
            verifiedPhone: true,
            createdAt: uData?.createdAt ? (typeof uData.createdAt === 'string' ? uData.createdAt : new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
            dashboardPreferences: uData?.dashboardPreferences ? { ...defaultDashboardPreferences, ...uData.dashboardPreferences } : defaultDashboardPreferences,
          };

          setIsEmailVerified(isAdmin || Boolean(firebaseUser.emailVerified) || Boolean(uData?.verifiedEmail) || Boolean(uData?.emailVerified));

          // If document didn't exist in Firestore, save it now with merge
          if (!docSnap.exists()) {
            try {
              setDoc(userRef, {
                uid: firebaseUser.uid,
                id: firebaseUser.uid,
                fullName: profile.fullName,
                ownerName: profile.ownerName,
                email: profile.email,
                brandName: profile.brandName,
                storeName: profile.brandName,
                businessType: profile.businessType,
                storeType: profile.businessType,
                mobile: profile.mobile,
                phone: profile.mobile,
                role: isAdmin ? 'owner' : (normalizedRole === 'Owner' ? 'owner' : 'manager'),
                subscriptionPlan: subPlan,
                subscription: subPlan.toLowerCase(),
                subscriptionStatus: subStatus,
                status: 'active',
                createdAt: uData?.createdAt || serverTimestamp(),
              }, { merge: true });
            } catch (createErr) {
              console.warn('[Auth] Notice setting user document:', createErr);
            }
          }

          setUser(profile);
          if (uData?.readNotificationIds && typeof uData.readNotificationIds === 'object') {
            setReadNotificationIds((prev) => ({
              ...prev,
              ...uData.readNotificationIds,
            }));
            try {
              localStorage.setItem(`biz_read_notifs_${firebaseUser.uid}`, JSON.stringify(uData.readNotificationIds));
            } catch (e) {}
          }
          if (uData?.dashboardPreferences && typeof uData.dashboardPreferences === 'object') {
            const loadedPrefs = { ...defaultDashboardPreferences, ...uData.dashboardPreferences };
            setDashboardPreferences(loadedPrefs);
            localStorage.setItem('biz_dashboard_preferences', JSON.stringify(loadedPrefs));
            localStorage.setItem(`biz_dashboard_preferences_${firebaseUser.uid}`, JSON.stringify(loadedPrefs));
          }
          if (userPreferredLang && SUPPORTED_LANGUAGES.some((l) => l.code === userPreferredLang)) {
            setLanguageState(userPreferredLang as Language);
            localStorage.setItem('biz_language', userPreferredLang);
          }
          if (profile.brandName) {
            setSettings((prev) => ({ ...prev, brandName: profile.brandName }));
          }
          if (uData?.paymentSettings || uData?.storeSettings?.payment) {
            const pSet = uData.paymentSettings || uData.storeSettings?.payment;
            setSettings((prev) => ({
              ...prev,
              paymentSettings: parseOwnerPaymentSettings(pSet),
            }));
          }
          if (normalizedRole === 'Owner') {
            setActiveTabState('owner');
          }
        } catch (err) {
          console.warn('Error fetching authenticated user profile from Firestore:', err);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Realtime global owner payment settings listener from Firestore doc(db, 'settings', 'payment')
  useEffect(() => {
    try {
      const unsubPaymentSettings = onSnapshot(
        doc(db, 'settings', 'payment'),
        (docSnap) => {
          if (docSnap.exists()) {
            const pData = docSnap.data();
            setSettings((prev) => ({
              ...prev,
              paymentSettings: parseOwnerPaymentSettings(pData),
            }));
          }
        },
        (err) => {
          console.warn('Realtime listener error for settings/payment:', err);
        }
      );
      return () => unsubPaymentSettings();
    } catch (err) {
      console.warn('Failed to attach listener for settings/payment:', err);
    }
  }, []);

  // Registered Users Directory (Realtime Firestore Collection)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const usersCol = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(
      usersCol,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const uData = docSnap.data();
          const uEmail = (uData.email || '').toLowerCase();
          const isPlatformSuperAdmin = isTeamStockAdmin(uEmail) || uData.role === 'PlatformOwner' || uData.role === 'platformowner';
          
          let normalizedRole: UserRole = 'Manager';
          if (uData.role === 'Owner' || uData.role === 'owner' || isPlatformSuperAdmin) {
            normalizedRole = 'Owner';
          } else if (uData.role === 'Staff' || uData.role === 'staff') {
            normalizedRole = 'Staff';
          } else if (uData.role === 'Accountant' || uData.role === 'accountant') {
            normalizedRole = 'Accountant';
          } else if (uData.role === 'Cashier' || uData.role === 'cashier') {
            normalizedRole = 'Cashier';
          } else {
            normalizedRole = 'Manager';
          }

          const assignedPlan: SubscriptionPlan = isPlatformSuperAdmin ? 'Lifetime' : ((uData.subscriptionPlan || uData.subscription || 'Free') as SubscriptionPlan);

          let createdDateStr = new Date().toISOString().split('T')[0];
          if (uData.createdAt) {
            if (typeof uData.createdAt === 'string') {
              createdDateStr = uData.createdAt.split('T')[0];
            } else if (uData.createdAt?.toDate) {
              createdDateStr = uData.createdAt.toDate().toISOString().split('T')[0];
            }
          }

          let lastLoginStr = '';
          if (uData.lastLogin) {
            if (typeof uData.lastLogin === 'string') {
              lastLoginStr = uData.lastLogin;
            } else if (uData.lastLogin?.toDate) {
              lastLoginStr = uData.lastLogin.toDate().toLocaleString();
            }
          }

          const subPending = uData.pendingPlan || undefined;
          const subStartDate = uData.startDate || uData.currentPeriodStart || undefined;
          const subExpiryDate = uData.expiryDate || uData.currentPeriodEnd || undefined;
          const subBillingPeriod = (uData.billingPeriod || uData.billingCycle || 'monthly') as BillingCycle;

          list.push({
            id: docSnap.id || uData.uid || uData.id,
            brandName: uData.brandName || uData.storeName || 'My Store',
            ownerName: uData.ownerName || uData.fullName || 'Store Owner',
            fullName: uData.fullName || uData.ownerName || 'Store Owner',
            name: uData.name || uData.fullName || uData.ownerName || '',
            mobile: uData.mobile || uData.phone || '',
            email: uData.email || '',
            businessType: uData.businessType || uData.storeType || 'General Retail & Grocery',
            country: uData.country || 'Bangladesh',
            currency: uData.currency || '৳',
            timeZone: uData.timeZone || 'Asia/Dhaka',
            role: normalizedRole,
            subscriptionPlan: assignedPlan,
            subscriptionStatus: uData.subscriptionStatus || 'active',
            pendingPlan: subPending,
            startDate: subStartDate,
            expiryDate: subExpiryDate,
            billingPeriod: subBillingPeriod,
            transactionId: uData.transactionId || undefined,
            paymentMethod: uData.paymentMethod || uData.paymentProvider || undefined,
            paymentProvider: uData.paymentProvider || undefined,
            paymentRegion: uData.paymentRegion || undefined,
            status: (uData.status as any) || 'active',
            storeAddress: uData.storeAddress || uData.address || '',
            affiliateCode: uData.affiliateCode || '',
            affiliateProgram: uData.affiliateProgram || '',
            avatarUrl: uData.avatarUrl || uData.photoUrl || uData.photo || '',
            verifiedEmail: true,
            verifiedPhone: true,
            createdAt: createdDateStr,
            lastLogin: lastLoginStr,
            notes: uData.notes || '',
            dashboardPreferences: uData.dashboardPreferences ? { ...defaultDashboardPreferences, ...uData.dashboardPreferences } : defaultDashboardPreferences,
          });
        });
        setAllUsers(list);

        if (auth.currentUser) {
          const currentUid = auth.currentUser.uid;
          const currentInList = list.find((u) => u.id === currentUid);
          if (currentInList) {
            setUser((prev) => {
              if (!prev) return currentInList;
              const hasChanged =
                prev.role !== currentInList.role ||
                prev.status !== currentInList.status ||
                prev.subscriptionPlan !== currentInList.subscriptionPlan ||
                prev.subscriptionStatus !== currentInList.subscriptionStatus ||
                prev.pendingPlan !== currentInList.pendingPlan ||
                prev.expiryDate !== currentInList.expiryDate ||
                prev.billingPeriod !== currentInList.billingPeriod ||
                prev.brandName !== currentInList.brandName;

              if (hasChanged) {
                if (currentInList.role === 'Owner' && prev.role !== 'Owner') {
                  setActiveTabState('owner');
                }
                return {
                  ...prev,
                  ...currentInList,
                };
              }
              return prev;
            });
          }
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot users notice:', error);
      }
    );

    return () => unsubscribeUsers();
  }, []);

  // Update Offline Sync Queue Service with current user ID & network lifecycle
  useEffect(() => {
    const currentUid = user?.id || auth.currentUser?.uid || null;
    syncQueueService.setUserId(currentUid);
  }, [user?.id]);

  // Subscription Approval Requests Directory (Realtime Firestore Synchronization)
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>([]);

  useEffect(() => {
    const unsubSubReqs = onSnapshot(
      collection(db, 'subscriptionRequests'),
      (snapshot) => {
        const list: SubscriptionRequest[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          let dateStr = new Date().toISOString();
          if (d.createdAt) {
            if (typeof d.createdAt === 'string') {
              dateStr = d.createdAt;
            } else if (d.createdAt?.toDate) {
              dateStr = d.createdAt.toDate().toISOString();
            }
          } else if (d.requestDate) {
            dateStr = d.requestDate;
          }

          list.push({
            id: docSnap.id,
            userId: d.uid || d.userId || '',
            userName: d.userName || d.ownerName || 'User',
            userEmail: d.email || d.userEmail || '',
            brandName: d.storeName || d.brandName || '',
            currentPlan: d.currentPlan || 'Free',
            requestedPlan: d.requestedPlan || 'Pro',
            billingCycle: d.billingCycle || 'monthly',
            paymentMethod: d.paymentMethod || 'bKash',
            paymentProvider: d.paymentProvider || d.paymentMethod || 'bKash',
            paymentRegion: d.paymentRegion || (d.currency === 'USD' ? 'international' : 'bangladesh'),
            currency: d.currency || (d.paymentRegion === 'international' ? 'USD' : 'BDT'),
            transactionId: d.transactionId || '',
            amount: typeof d.amount === 'number' ? d.amount : 0,
            status: d.status || 'pending',
            requestDate: dateStr,
            reviewedDate: d.reviewedDate || '',
            approvedBy: d.approvedBy || d.reviewedBy || '',
            startDate: d.startDate || undefined,
            expiryDate: d.expiryDate || undefined,
            billingPeriod: d.billingPeriod || d.billingCycle || 'monthly',
            cancelledAt: d.cancelledAt || '',
            cancelledBy: d.cancelledBy || '',
            previousPlan: d.previousPlan || undefined,
            previousStatus: d.previousStatus || undefined,
            notes: d.notes || '',
          });
        });

        // Sort newest requests first
        list.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        setSubscriptionRequests(list);
      },
      (error) => {
        console.warn('onSnapshot subscriptionRequests error:', error);
      }
    );

    return () => unsubSubReqs();
  }, []);
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('biz_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultSettings, ...parsed };
        }
      } catch (e) {
        console.error(e);
      }
    }
    const savedUser = localStorage.getItem('biz_user');
    if (savedUser && savedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.brandName) {
          return { ...defaultSettings, brandName: parsedUser.brandName };
        }
      } catch (e) {}
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('biz_settings', JSON.stringify(settings));
  }, [settings]);
  const [activeTab, setActiveTabState] = useState<string>('dashboard');

  const setActiveTab = (tab: string) => {
    if (tab === 'owner' && user?.role !== 'Owner') {
      setActiveTabState('dashboard');
      return;
    }
    setActiveTabState(tab);
  };
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Main Data Repositories - Safe load with user-scoped storage fallback
  const getStoredData = <T,>(key: string, fallback: T): T => {
    try {
      const savedUser = localStorage.getItem('biz_user');
      const uid = savedUser && savedUser !== 'null' ? JSON.parse(savedUser)?.id : '';
      const userScoped = uid ? localStorage.getItem(`${key}_${uid}`) : null;
      const globalScoped = localStorage.getItem(key);
      const saved = userScoped || globalScoped;
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const [products, setProducts] = useState<Product[]>(() => getStoredData('biz_products', []));
  const [categories, setCategories] = useState<Category[]>(() => getStoredData('biz_categories', []));
  const [brands, setBrands] = useState<Brand[]>(() => getStoredData('biz_brands', []));
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredData('biz_customers', []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStoredData('biz_suppliers', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStoredData('biz_expenses', []));
  const [sales, setSales] = useState<Sale[]>(() => getStoredData('biz_sales', []));
  const [purchases, setPurchases] = useState<Purchase[]>(() => getStoredData('biz_purchases', []));

  // Notifications state: Manual/system notifications + Read status map
  const [manualNotifications, setManualNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('biz_manual_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [readNotificationIds, setReadNotificationIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('biz_read_notifs_' + (user?.id || 'default'));
    return saved ? JSON.parse(saved) : {};
  });

  // Re-sync read map when user profile ID changes
  useEffect(() => {
    const storageKey = 'biz_read_notifs_' + (user?.id || 'default');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setReadNotificationIds(JSON.parse(saved));
      } catch (e) {}
    }
  }, [user?.id]);

  const addManualNotification = (notif: AppNotification) => {
    setManualNotifications((prev) => {
      const updated = [notif, ...prev.filter((m) => m.id !== notif.id)];
      localStorage.setItem('biz_manual_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [dueCollections, setDueCollections] = useState<DueCollection[]>([]);
  const [investments, setInvestments] = useState<Investment[]>(() => getStoredData('biz_investments', []));
  const [capitalWithdrawals, setCapitalWithdrawals] = useState<CapitalWithdrawal[]>(() => getStoredData('biz_capital_withdrawals', []));

  // Cloud Synchronized State Repositories
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(`biz_team_members_${user?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [devices, setDevices] = useState<EmployeeDevice[]>(() => {
    try {
      const saved = localStorage.getItem(`biz_devices_${user?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(`biz_employees_${user?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [payrollPayments, setPayrollPayments] = useState<PayrollPayment[]>(() => {
    try {
      const saved = localStorage.getItem(`biz_payroll_payments_${user?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [salaryAdjustments, setSalaryAdjustments] = useState<SalaryAdjustment[]>(() => {
    try {
      const saved = localStorage.getItem(`biz_salary_adjustments_${user?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`biz_audit_logs_${user?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [loyaltySettings, setLoyaltySettings] = useState<CustomerLoyaltySettings>(() => {
    try {
      const saved = localStorage.getItem(`biz_loyalty_settings_${user?.id || 'default'}`);
      return saved
        ? JSON.parse(saved)
        : {
            enabled: true,
            pointsPerAmount: 1,
            spendingAmountUnit: 100,
            pointRedemptionValue: 1,
            minPointsToRedeem: 50,
          };
    } catch (e) {
      return {
        enabled: true,
        pointsPerAmount: 1,
        spendingAmountUnit: 100,
        pointRedemptionValue: 1,
        minPointsToRedeem: 50,
      };
    }
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Real-time Cloud Synchronization (Single Account = Single Cloud Data across all PC & Mobile devices)
  useEffect(() => {
    const currentUserId = user?.id || auth.currentUser?.uid;
    if (!currentUserId) {
      setIsCloudSynced(false);
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setCustomers([]);
      setSuppliers([]);
      setExpenses([]);
      setSales([]);
      setPurchases([]);
      setAdjustments([]);
      setDueCollections([]);
      setTeamMembers([]);
      setDevices([]);
      setEmployees([]);
      setPayrollPayments([]);
      setSalaryAdjustments([]);
      setAuditLogs([]);
      return;
    }

    const unsubscribe = subscribeToUserBusinessData(currentUserId, {
      onProductsLoaded: (cloudProducts, fromCloud) => {
        if (fromCloud) {
          setProducts(cloudProducts);
          try {
            localStorage.setItem('biz_products', JSON.stringify(cloudProducts));
            localStorage.setItem(`biz_products_${currentUserId}`, JSON.stringify(cloudProducts));
          } catch (e) {}
        } else {
          // Cloud empty for this user: only migrate local items if they exist specifically for this user
          try {
            const localSaved = localStorage.getItem(`biz_products_${currentUserId}`);
            const localItems: Product[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setProducts(localItems);
              saveUserCloudCollection(currentUserId, 'products', { items: localItems });
            } else {
              setProducts([]);
            }
          } catch (e) {
            setProducts([]);
          }
        }
      },

      onCategoriesLoaded: (cloudCategories, fromCloud) => {
        if (fromCloud) {
          setCategories(cloudCategories);
          try {
            localStorage.setItem('biz_categories', JSON.stringify(cloudCategories));
            localStorage.setItem(`biz_categories_${currentUserId}`, JSON.stringify(cloudCategories));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_categories_${currentUserId}`);
            const localItems: Category[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setCategories(localItems);
              saveUserCloudCollection(currentUserId, 'categories', { items: localItems });
            } else {
              setCategories([]);
            }
          } catch (e) {
            setCategories([]);
          }
        }
      },

      onBrandsLoaded: (cloudBrands, fromCloud) => {
        if (fromCloud) {
          setBrands(cloudBrands);
          try {
            localStorage.setItem('biz_brands', JSON.stringify(cloudBrands));
            localStorage.setItem(`biz_brands_${currentUserId}`, JSON.stringify(cloudBrands));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_brands_${currentUserId}`);
            const localItems: Brand[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setBrands(localItems);
              saveUserCloudCollection(currentUserId, 'brands', { items: localItems });
            } else {
              setBrands([]);
            }
          } catch (e) {
            setBrands([]);
          }
        }
      },

      onCustomersLoaded: (cloudCustomers, fromCloud) => {
        if (fromCloud) {
          setCustomers(cloudCustomers);
          try {
            localStorage.setItem('biz_customers', JSON.stringify(cloudCustomers));
            localStorage.setItem(`biz_customers_${currentUserId}`, JSON.stringify(cloudCustomers));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_customers_${currentUserId}`);
            const localItems: Customer[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setCustomers(localItems);
              saveUserCloudCollection(currentUserId, 'customers', { items: localItems });
            } else {
              setCustomers([]);
            }
          } catch (e) {
            setCustomers([]);
          }
        }
      },

      onSuppliersLoaded: (cloudSuppliers, fromCloud) => {
        if (fromCloud) {
          setSuppliers(cloudSuppliers);
          try {
            localStorage.setItem('biz_suppliers', JSON.stringify(cloudSuppliers));
            localStorage.setItem(`biz_suppliers_${currentUserId}`, JSON.stringify(cloudSuppliers));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_suppliers_${currentUserId}`);
            const localItems: Supplier[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setSuppliers(localItems);
              saveUserCloudCollection(currentUserId, 'suppliers', { items: localItems });
            } else {
              setSuppliers([]);
            }
          } catch (e) {
            setSuppliers([]);
          }
        }
      },

      onExpensesLoaded: (cloudExpenses, fromCloud) => {
        if (fromCloud) {
          setExpenses(cloudExpenses);
          try {
            localStorage.setItem('biz_expenses', JSON.stringify(cloudExpenses));
            localStorage.setItem(`biz_expenses_${currentUserId}`, JSON.stringify(cloudExpenses));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_expenses_${currentUserId}`);
            const localItems: Expense[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setExpenses(localItems);
              saveUserCloudCollection(currentUserId, 'expenses', { items: localItems });
            } else {
              setExpenses([]);
            }
          } catch (e) {
            setExpenses([]);
          }
        }
      },

      onSalesLoaded: (cloudSales, fromCloud) => {
        if (fromCloud) {
          setSales(cloudSales);
          try {
            localStorage.setItem('biz_sales', JSON.stringify(cloudSales));
            localStorage.setItem(`biz_sales_${currentUserId}`, JSON.stringify(cloudSales));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_sales_${currentUserId}`);
            const localItems: Sale[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setSales(localItems);
              saveUserCloudCollection(currentUserId, 'sales', { items: localItems });
            } else {
              setSales([]);
            }
          } catch (e) {
            setSales([]);
          }
        }
      },

      onPurchasesLoaded: (cloudPurchases, fromCloud) => {
        if (fromCloud) {
          setPurchases(cloudPurchases);
          try {
            localStorage.setItem('biz_purchases', JSON.stringify(cloudPurchases));
            localStorage.setItem(`biz_purchases_${currentUserId}`, JSON.stringify(cloudPurchases));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_purchases_${currentUserId}`);
            const localItems: Purchase[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setPurchases(localItems);
              saveUserCloudCollection(currentUserId, 'purchases', { items: localItems });
            } else {
              setPurchases([]);
            }
          } catch (e) {
            setPurchases([]);
          }
        }
      },

      onAdjustmentsLoaded: (cloudAdjustments, fromCloud) => {
        if (fromCloud) {
          setAdjustments(cloudAdjustments);
        }
      },

      onDueCollectionsLoaded: (cloudDue, fromCloud) => {
        if (fromCloud) {
          setDueCollections(cloudDue);
        }
      },

      onInvestmentsLoaded: (cloudInvestments, fromCloud) => {
        if (fromCloud) {
          setInvestments(cloudInvestments);
          try {
            localStorage.setItem('biz_investments', JSON.stringify(cloudInvestments));
            localStorage.setItem(`biz_investments_${currentUserId}`, JSON.stringify(cloudInvestments));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_investments_${currentUserId}`);
            const localItems: Investment[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setInvestments(localItems);
              saveUserCloudCollection(currentUserId, 'investments', { items: localItems });
            } else {
              setInvestments([]);
            }
          } catch (e) {
            setInvestments([]);
          }
        }
      },

      onCapitalWithdrawalsLoaded: (cloudWithdrawals, fromCloud) => {
        if (fromCloud) {
          setCapitalWithdrawals(cloudWithdrawals);
          try {
            localStorage.setItem('biz_capital_withdrawals', JSON.stringify(cloudWithdrawals));
            localStorage.setItem(`biz_capital_withdrawals_${currentUserId}`, JSON.stringify(cloudWithdrawals));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_capital_withdrawals_${currentUserId}`);
            const localItems: CapitalWithdrawal[] = localSaved ? JSON.parse(localSaved) : [];
            if (localItems.length > 0) {
              setCapitalWithdrawals(localItems);
              saveUserCloudCollection(currentUserId, 'capitalWithdrawals', { items: localItems });
            } else {
              setCapitalWithdrawals([]);
            }
          } catch (e) {
            setCapitalWithdrawals([]);
          }
        }
      },

      onTeamLoaded: (cloudTeam, fromCloud) => {
        if (fromCloud) {
          setTeamMembers(cloudTeam);
          try {
            localStorage.setItem(`biz_team_members_${currentUserId}`, JSON.stringify(cloudTeam));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_team_members_${currentUserId}`);
            if (localSaved) {
              const localItems = JSON.parse(localSaved);
              if (Array.isArray(localItems) && localItems.length > 0) {
                saveUserCloudCollection(currentUserId, 'team', { items: localItems });
              }
            }
          } catch (e) {}
        }
      },

      onDevicesLoaded: (cloudDevices, fromCloud) => {
        if (fromCloud) {
          setDevices(cloudDevices);
          try {
            localStorage.setItem(`biz_devices_${currentUserId}`, JSON.stringify(cloudDevices));
          } catch (e) {}
        } else {
          try {
            const localSaved = localStorage.getItem(`biz_devices_${currentUserId}`);
            if (localSaved) {
              const localItems = JSON.parse(localSaved);
              if (Array.isArray(localItems) && localItems.length > 0) {
                saveUserCloudCollection(currentUserId, 'devices', { items: localItems });
              }
            }
          } catch (e) {}
        }
      },

      onPayrollLoaded: (cloudPayroll, fromCloud) => {
        if (fromCloud) {
          setEmployees(cloudPayroll.employees);
          setPayrollPayments(cloudPayroll.payments);
          setSalaryAdjustments(cloudPayroll.adjustments);
          try {
            localStorage.setItem(`biz_employees_${currentUserId}`, JSON.stringify(cloudPayroll.employees));
            localStorage.setItem(`biz_payroll_payments_${currentUserId}`, JSON.stringify(cloudPayroll.payments));
            localStorage.setItem(`biz_salary_adjustments_${currentUserId}`, JSON.stringify(cloudPayroll.adjustments));
          } catch (e) {}
        } else {
          try {
            const localEmp = localStorage.getItem(`biz_employees_${currentUserId}`);
            const localPay = localStorage.getItem(`biz_payroll_payments_${currentUserId}`);
            const localAdj = localStorage.getItem(`biz_salary_adjustments_${currentUserId}`);
            if (localEmp || localPay || localAdj) {
              saveUserCloudCollection(currentUserId, 'payroll', {
                employees: localEmp ? JSON.parse(localEmp) : [],
                payments: localPay ? JSON.parse(localPay) : [],
                adjustments: localAdj ? JSON.parse(localAdj) : [],
              });
            }
          } catch (e) {}
        }
      },

      onAuditLogsLoaded: (cloudLogs, fromCloud) => {
        if (fromCloud) {
          setAuditLogs(cloudLogs);
          try {
            localStorage.setItem(`biz_audit_logs_${currentUserId}`, JSON.stringify(cloudLogs));
          } catch (e) {}
        }
      },

      onLoyaltyLoaded: (cloudLoyalty, fromCloud) => {
        if (fromCloud) {
          setLoyaltySettings(cloudLoyalty);
          try {
            localStorage.setItem(`biz_loyalty_settings_${currentUserId}`, JSON.stringify(cloudLoyalty));
          } catch (e) {}
        }
      },

      onQrTrackingLoaded: (cloudQr, fromCloud) => {
        if (fromCloud) {
          setGeneratedProductCodes(cloudQr.generatedCodes);
          setProductQRCounts(cloudQr.productQRCounts);
          try {
            localStorage.setItem(`biz_generated_codes_${currentUserId}`, JSON.stringify(cloudQr.generatedCodes));
            localStorage.setItem(`biz_product_qr_counts_${currentUserId}`, JSON.stringify(cloudQr.productQRCounts));
          } catch (e) {}
        }
      },

      onSettingsLoaded: (cloudSettings, fromCloud) => {
        if (fromCloud && cloudSettings) {
          setSettings((prev) => ({ ...prev, ...cloudSettings }));
          try {
            localStorage.setItem('biz_settings', JSON.stringify({ ...settings, ...cloudSettings }));
          } catch (e) {}
        }
      },

      onNotificationsLoaded: (cloudNotifs, fromCloud) => {
        if (fromCloud && cloudNotifs) {
          if (Array.isArray(cloudNotifs.manual)) {
            setManualNotifications(cloudNotifs.manual);
            try {
              localStorage.setItem('biz_manual_notifications', JSON.stringify(cloudNotifs.manual));
            } catch (e) {}
          }
          if (cloudNotifs.readMap && typeof cloudNotifs.readMap === 'object') {
            setReadNotificationIds((prev) => {
              const merged = { ...prev, ...cloudNotifs.readMap };
              try {
                localStorage.setItem(`biz_read_notifs_${currentUserId}`, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }
      },

      onSyncStatusChanged: (status) => {
        setIsCloudSynced(status === 'synced');
      },
    });

    setIsCloudSynced(true);

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // POS Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem('biz_language', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('biz_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('biz_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('biz_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('biz_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('biz_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('biz_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Generated Product POS / QR Code Limit Tracking State (Store Isolated)
  const [generatedProductCodes, setGeneratedProductCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`biz_generated_codes_${user?.id || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Re-sync when store/user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`biz_generated_codes_${user?.id || 'default'}`);
      setGeneratedProductCodes(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setGeneratedProductCodes([]);
    }
  }, [user?.id]);

  // Persist to LocalStorage per store
  useEffect(() => {
    try {
      localStorage.setItem(`biz_generated_codes_${user?.id || 'default'}`, JSON.stringify(generatedProductCodes));
    } catch (e) {}
  }, [generatedProductCodes, user?.id]);

  // Real-time cleanup: automatically remove orphaned product codes when a product is deleted
  useEffect(() => {
    setGeneratedProductCodes((prev) => {
      const valid = prev.filter((id) => products.some((p) => p.id === id));
      if (valid.length !== prev.length) {
        return valid;
      }
      return prev;
    });
  }, [products]);

  // Generated Product Unit QR Code Count Tracking (Store Isolated)
  const [productQRCounts, setProductQRCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`biz_product_qr_counts_${user?.id || 'default'}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Re-sync productQRCounts when store/user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`biz_product_qr_counts_${user?.id || 'default'}`);
      setProductQRCounts(saved ? JSON.parse(saved) : {});
    } catch (e) {
      setProductQRCounts({});
    }
  }, [user?.id]);

  // Persist productQRCounts to LocalStorage per store
  useEffect(() => {
    try {
      localStorage.setItem(`biz_product_qr_counts_${user?.id || 'default'}`, JSON.stringify(productQRCounts));
    } catch (e) {}
  }, [productQRCounts, user?.id]);

  // Real-time cleanup for unit QR code counts
  useEffect(() => {
    setProductQRCounts((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        if (!products.some((p) => p.id === id)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [products]);

  const getGeneratedQRCount = (productId: string): number => {
    if (!productId) return 0;
    if (typeof productQRCounts[productId] === 'number') {
      return productQRCounts[productId];
    }
    return generatedProductCodes.includes(productId) ? 1 : 0;
  };

  const recordGeneratedQRCodes = (
    productId: string,
    requestedCount: number
  ): { success: boolean; message?: string } => {
    if (!productId) return { success: false, message: 'Invalid product selected.' };

    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) {
      return { success: false, message: 'Product not found in current store.' };
    }

    const existingQRCount = getGeneratedQRCount(productId);
    const countToAdd = Math.max(1, Number(requestedCount) || 1);
    const newTotal = existingQRCount + countToAdd;
    const nextCounts = {
      ...productQRCounts,
      [productId]: newTotal,
    };
    setProductQRCounts(nextCounts);

    let nextCodes = generatedProductCodes;
    if (!generatedProductCodes.includes(productId)) {
      nextCodes = [...generatedProductCodes, productId];
      setGeneratedProductCodes(nextCodes);
    }

    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      saveUserCloudCollection(uid, 'qrTracking', {
        generatedCodes: nextCodes,
        productQRCounts: nextCounts,
      });
    }

    return { success: true };
  };

  const recordGeneratedCode = (productId: string): boolean => {
    if (!productId) return false;
    const res = recordGeneratedQRCodes(productId, 1);
    return res.success;
  };

  const isCodeGenerated = (productId: string): boolean => {
    return generatedProductCodes.includes(productId) || (productQRCounts[productId] || 0) > 0;
  };

  const removeGeneratedCode = (productId: string) => {
    const nextCodes = generatedProductCodes.filter((id) => id !== productId);
    const nextCounts = { ...productQRCounts };
    delete nextCounts[productId];

    setGeneratedProductCodes(nextCodes);
    setProductQRCounts(nextCounts);

    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      saveUserCloudCollection(uid, 'qrTracking', {
        generatedCodes: nextCodes,
        productQRCounts: nextCounts,
      });
    }
  };

  // Team, Payroll, Audit & Loyalty Cloud Handlers
  const saveTeamMembers = (updated: TeamMember[]) => {
    setTeamMembers(updated);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      saveUserCloudCollection(uid, 'team', { items: updated });
      try {
        localStorage.setItem(`biz_team_members_${uid}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const saveEmployees = (updated: Employee[]) => {
    setEmployees(updated);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      saveUserCloudCollection(uid, 'payroll', {
        employees: updated,
        payments: payrollPayments,
        adjustments: salaryAdjustments,
      });
      try {
        localStorage.setItem(`biz_employees_${uid}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const savePayrollPayments = (updated: PayrollPayment[]) => {
    setPayrollPayments(updated);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      saveUserCloudCollection(uid, 'payroll', {
        employees,
        payments: updated,
        adjustments: salaryAdjustments,
      });
      try {
        localStorage.setItem(`biz_payroll_payments_${uid}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const saveSalaryAdjustments = (updated: SalaryAdjustment[]) => {
    setSalaryAdjustments(updated);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      saveUserCloudCollection(uid, 'payroll', {
        employees,
        payments: payrollPayments,
        adjustments: updated,
      });
      try {
        localStorage.setItem(`biz_salary_adjustments_${uid}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const saveAuditLogs = (updated: AuditLogEntry[]) => {
    setAuditLogs(updated);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      saveUserCloudCollection(uid, 'auditLogs', { items: updated });
      try {
        localStorage.setItem(`biz_audit_logs_${uid}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const saveLoyaltySettings = (updated: CustomerLoyaltySettings) => {
    setLoyaltySettings(updated);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      saveUserCloudCollection(uid, 'loyalty', { settings: updated });
      try {
        localStorage.setItem(`biz_loyalty_settings_${uid}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  // Language & Theme helpers with persistence and document direction (RTL)
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtlLanguage(language) ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('biz_language', lang);
      localStorage.setItem('biz_landing_language', lang);
      localStorage.setItem('biz_language_manually_set', 'true');
    } catch (e) {}

    if (user && user.id) {
      try {
        const userRef = doc(db, 'users', user.id);
        updateDoc(userRef, { preferredLanguage: lang }).catch((err) => {
          console.warn('Failed to update preferredLanguage in Firestore:', err);
        });
      } catch (e) {}
    }
  };

  // Landing Page Auto Country-Based Language Detection for unauthenticated visitors
  useEffect(() => {
    // DO NOT run auto-detection if user is authenticated or if language was manually set by visitor
    if (user) return;

    const manuallySet = localStorage.getItem('biz_language_manually_set');
    if (manuallySet === 'true') return;

    const savedLang = localStorage.getItem('biz_landing_language') || localStorage.getItem('biz_language');
    if (savedLang && SUPPORTED_LANGUAGES.some((l) => l.code === savedLang)) {
      setLanguageState(savedLang as Language);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const detectVisitorCountry = async () => {
      try {
        let countryName = '';
        let countryCode = '';

        try {
          const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
          if (res.ok) {
            const data = await res.json();
            countryName = data.country_name || '';
            countryCode = data.country_code || data.country || '';
          }
        } catch (e) {
          try {
            const res2 = await fetch('https://ipwho.is/', { signal: controller.signal });
            if (res2.ok) {
              const data2 = await res2.json();
              countryName = data2.country || '';
              countryCode = data2.country_code || '';
            }
          } catch (e2) {}
        }

        if (!isMounted) return;

        if (countryName || countryCode) {
          const detected = getDefaultLanguageForCountry(countryName || countryCode);
          setLanguageState(detected);
        } else {
          const browserLang = (navigator.language || '').split('-')[0];
          if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
            setLanguageState(browserLang as Language);
          }
        }
      } catch (err) {
        // Silent fallback
      } finally {
        clearTimeout(timer);
      }
    };

    detectVisitorCountry();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [user]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('biz_theme', newTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const t = (key: string): string => {
    if (!key) return '';
    let val = translations[language]?.[key] || translations['en']?.[key];
    if (val) return val;

    if (key.includes('.')) {
      const parts = key.split('.');
      let currLang: any = translations[language];
      let currEn: any = translations['en'];
      for (const p of parts) {
        if (currLang && typeof currLang === 'object') currLang = currLang[p];
        else currLang = undefined;
        if (currEn && typeof currEn === 'object') currEn = currEn[p];
        else currEn = undefined;
      }
      if (typeof currLang === 'string') return currLang;
      if (typeof currEn === 'string') return currEn;
    }

    return translations['en']?.[key] || key;
  };

  const formatNumber = (val: number | string | undefined | null, options?: { decimals?: number; useGrouping?: boolean }) => {
    return formatNumberHelper(val, language, options);
  };

  const storeBaseCurrency =
    settings.baseCurrency ||
    (user?.country && isBangladeshCountry(user.country) ? 'BDT' : undefined) ||
    normalizeCurrencyCode(user?.currency) ||
    'BDT';

  const displayCurrency = normalizeCurrencyCode(settings.currency || 'BDT');
  const displayCurrencySymbol = getCurrencySymbol(displayCurrency);

  const formatCurrency = (
    amount: number | string | undefined | null,
    options?: FormatMoneyOptions & { sourceCurrency?: string; displayCurrency?: string }
  ) => {
    const source = options?.sourceCurrency || storeBaseCurrency;
    const target = options?.displayCurrency || displayCurrency;
    return formatMoneyWithRates(amount, source, target, language, options);
  };

  const formatMoney = (
    amount: number | string | undefined | null,
    sourceCurrency: string = storeBaseCurrency,
    displayCurrencyParam: string = displayCurrency,
    localeParam: Language | string = language,
    options?: FormatMoneyOptions
  ) => {
    return formatMoneyWithRates(amount, sourceCurrency, displayCurrencyParam, localeParam, options);
  };

  // Pure, deterministic, deduplicated notification calculation engine
  const notifications = React.useMemo(() => {
    return generateSystemNotifications({
      products,
      customers,
      sales,
      manualNotifications,
      readMap: readNotificationIds,
      formatCurrency: (amt: number) => formatCurrency(amt),
      language,
      storeId: user?.id,
    });
  }, [products, customers, sales, manualNotifications, readNotificationIds, formatCurrency, language, user?.id]);

  const convertMoney = (
    amount: number,
    fromCurrency: string = storeBaseCurrency,
    toCurrency: string = displayCurrency
  ) => {
    return convertCurrencyWithRates(amount, fromCurrency, toCurrency);
  };

  const getExchangeRate = async (fromCurrency: string, toCurrency?: string) => {
    return getExchangeRateHelper(fromCurrency, toCurrency);
  };

  const formatDate = (dateStr: string | Date | undefined | null) => {
    return formatDateHelper(dateStr, language);
  };

  // Log activity helper
  const logActivity = (action: string, actionBn: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      actionBn,
      userName: user ? user.ownerName : 'System',
      timestamp: new Date().toLocaleString(),
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Auth methods using Firebase Auth & Cloud Firestore
  const login = async (emailInput: string, passInput: string): Promise<{ success: boolean; message?: string; requiresEmailVerification?: boolean }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !passInput) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    const tStart = performance.now();
    console.log(`[AUTH] login started: ${cleanEmail}`);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passInput);
      const firebaseUser = userCredential.user;

      console.log(`[AUTH] Firebase authentication completed in ${(performance.now() - tStart).toFixed(1)}ms: ${cleanEmail}`);
      console.log(`[AUTH] UID received: ${firebaseUser.uid}`);
      console.log(`[AUTH] emailVerified: ${firebaseUser.emailVerified}`);
      console.log(`[AUTH] user profile query started: docPath=users/${firebaseUser.uid}`);

      const isAdmin = isTeamStockAdmin(cleanEmail);
      let verified = isAdmin || Boolean(firebaseUser.emailVerified);

      let docSnap: any = null;
      let uData: any = null;

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        // Fast bounded lookup (2.5 seconds timeout) so UI never hangs
        const fetchPromise = getDoc(userRef);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 2500));
        docSnap = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (docSnap && docSnap.exists()) {
          uData = docSnap.data();
        } else {
          // Fast email query fallback
          try {
            const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
            const qSnapPromise = getDocs(q);
            const qSnapTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Email query timeout')), 2000));
            const qSnap: any = await Promise.race([qSnapPromise, qSnapTimeout]);
            if (qSnap && !qSnap.empty) {
              uData = qSnap.docs[0].data();
            }
          } catch (e) {
            console.warn('[Auth] Email lookup fallback notice:', e);
          }
        }
      } catch (docErr) {
        console.warn('User document fetch fast notice:', docErr);
      }

      if (uData?.verifiedEmail || uData?.emailVerified) {
        verified = true;
      }
      setIsEmailVerified(verified);

      console.log(`[AUTH] user profile query completed: found=${Boolean(uData)} in ${(performance.now() - tStart).toFixed(1)}ms`);
      console.log(`[AUTH] store lookup started`);

      let foundUser: UserProfile;

      if (uData) {
        const roleRaw = uData.role || uData.roleName || 'Owner';
        const normalizedRole: UserRole = (isAdmin || !roleRaw || roleRaw.toString().toLowerCase() === 'owner' || roleRaw.toString().toLowerCase() === 'admin' || roleRaw.toString().toLowerCase() === 'platformowner' || roleRaw.toString().toLowerCase() === 'manager') ? 'Owner' : (roleRaw as UserRole);

        if (uData.status === 'suspended' && !isAdmin) {
          await signOut(auth);
          setUser(null);
          return {
            success: false,
            message: 'Your account has been suspended by the platform administrator.',
          };
        }

        foundUser = {
          id: firebaseUser.uid,
          brandName: uData.brandName || uData.storeName || 'My Store',
          ownerName: uData.ownerName || uData.fullName || firebaseUser.displayName || (isAdmin ? 'Admin Owner' : 'Store Owner'),
          fullName: uData.fullName || uData.ownerName || firebaseUser.displayName || (isAdmin ? 'Admin Owner' : 'Store Owner'),
          name: uData.name || uData.fullName || uData.ownerName || '',
          mobile: uData.mobile || uData.phone || '',
          email: firebaseUser.email || uData.email || cleanEmail,
          businessType: uData.businessType || uData.storeType || 'General Retail & Grocery',
          country: uData.country || 'Bangladesh',
          currency: uData.currency || '৳',
          timeZone: uData.timeZone || 'Asia/Dhaka',
          role: normalizedRole,
          subscriptionPlan: isAdmin ? 'Lifetime' : ((uData.subscriptionPlan || uData.subscription || 'Free') as SubscriptionPlan),
          subscriptionStatus: uData.subscriptionStatus || 'active',
          status: uData.status || 'active',
          storeAddress: uData.storeAddress || uData.address || '',
          affiliateCode: uData.affiliateCode || '',
          affiliateProgram: uData.affiliateProgram || '',
          verifiedEmail: verified,
          verifiedPhone: true,
          createdAt: uData.createdAt ? (typeof uData.createdAt === 'string' ? uData.createdAt : new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        };

        if (!docSnap || !docSnap.exists()) {
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            setDoc(userRef, {
              ...uData,
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              role: isAdmin ? 'owner' : (normalizedRole === 'Owner' ? 'owner' : 'manager'),
              subscriptionPlan: isAdmin ? 'Lifetime' : foundUser.subscriptionPlan,
              subscriptionStatus: 'active',
              status: 'active',
            }, { merge: true }).catch(() => {});
          } catch (e) {}
        }
      } else {
        foundUser = {
          id: firebaseUser.uid,
          brandName: 'My Store',
          ownerName: firebaseUser.displayName || cleanEmail.split('@')[0] || (isAdmin ? 'Admin Owner' : 'Store Owner'),
          fullName: firebaseUser.displayName || cleanEmail.split('@')[0] || (isAdmin ? 'Admin Owner' : 'Store Owner'),
          name: '',
          mobile: '',
          email: cleanEmail,
          businessType: 'General Retail & Grocery',
          country: 'Bangladesh',
          currency: '৳',
          timeZone: 'Asia/Dhaka',
          role: isAdmin ? 'Owner' : 'Manager',
          subscriptionPlan: isAdmin ? 'Lifetime' : 'Free',
          subscriptionStatus: 'active',
          status: 'active',
          verifiedEmail: verified,
          verifiedPhone: true,
          createdAt: new Date().toISOString().split('T')[0],
        };

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          setDoc(userRef, {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            fullName: foundUser.ownerName,
            ownerName: foundUser.ownerName,
            email: cleanEmail,
            brandName: foundUser.brandName,
            storeName: foundUser.brandName,
            businessType: foundUser.businessType,
            storeType: foundUser.businessType,
            mobile: '',
            phone: '',
            role: isAdmin ? 'owner' : 'manager',
            subscriptionPlan: isAdmin ? 'Lifetime' : 'Free',
            subscription: isAdmin ? 'lifetime' : 'free',
            subscriptionStatus: 'active',
            status: 'active',
            createdAt: serverTimestamp(),
          }, { merge: true }).catch(() => {});
        } catch (setErr) {
          console.warn('Notice setting initial user document:', setErr);
        }
      }

      console.log(`[AUTH] store lookup completed: brandName=${foundUser.brandName}`);

      setUser(foundUser);
      if (foundUser.brandName) {
        setSettings((prev) => ({ ...prev, brandName: foundUser.brandName }));
      }

      if (foundUser.role === 'Owner') {
        setActiveTab('owner');
      } else {
        setActiveTab('dashboard');
      }

      logActivity('User Logged In', 'ব্যবহারকারী লগইন করেছে', cleanEmail);
      console.log(`[AUTH] login flow completed successfully in ${(performance.now() - tStart).toFixed(1)}ms`);

      if (!verified) {
        // Automatically send a fresh 6-digit verification code to the user's inbox
        sendVerificationOtp(cleanEmail, foundUser.fullName).catch(() => {});
        return {
          success: true,
          requiresEmailVerification: true,
          message: 'A 6-digit verification code has been sent to your email. Please enter it to verify your account.',
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Firebase Auth login error [Full Error]:', error);
      if (error && typeof error === 'object') {
        console.error('Firebase Error Code:', error.code, '| Message:', error.message, '| Full Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
      let message = 'Failed to sign in. Please check your credentials.';
      if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is disabled in your Firebase Console. Please go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Incorrect email or password. If you have not created an account yet, please click "Need a new account? Sign Up Here" below to register.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, message };
    }
  };

  const signup = async (data: Partial<UserProfile> & { password?: string }): Promise<{ success: boolean; message?: string; requiresEmailVerification?: boolean }> => {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const pass = data.password || '';

    if (!cleanEmail || !pass) {
      return {
        success: false,
        message: 'Please provide both email and password.',
      };
    }

    try {
      console.log('[Firebase Auth] Attempting createUserWithEmailAndPassword...', { email: cleanEmail });
      // 1. Wait until Firebase Authentication successfully returns the user
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const firebaseUser = userCredential.user;

      console.log('Authentication Success');

      if (!firebaseUser || !firebaseUser.uid) {
        return {
          success: false,
          message: 'Firebase Authentication did not return a valid user UID.',
        };
      }

      // 2. Immediately send 6-Digit Email Verification OTP via Resend
      const fullName = data.ownerName || 'Store Owner';
      const storeName = data.brandName || 'My Store';
      const storeType = data.businessType || 'General Retail & Grocery';
      const phone = data.mobile || '';
      const address = data.storeAddress || '';
      const affiliateCode = data.affiliateCode || '';

      const isAdmin = isTeamStockAdmin(cleanEmail);
      const assignedRole: UserRole = 'Owner';
      const assignedPlan: SubscriptionPlan = isAdmin ? 'Lifetime' : 'Free';
      const verified = isAdmin;
      setIsEmailVerified(verified);

      if (!isAdmin) {
        try {
          fetch('/api/auth/send-verification-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              uid: firebaseUser.uid,
              name: fullName,
            }),
          }).catch((err) => {
            console.warn('[Auth OTP] Background OTP send warning:', err);
          });
          console.log('[Auth OTP] Dispatched 6-digit verification code to:', cleanEmail);
        } catch (verificationErr) {
          console.warn('[Auth OTP] Notice sending initial email verification:', verificationErr);
        }
      }

      // 3. Prepare user document payload with required schema

      const userCountry = data.country || 'Bangladesh';
      const userPrefLang = data.preferredLanguage || language || 'en';

      const userDocData = {
        uid: firebaseUser.uid,
        fullName,
        email: cleanEmail,
        storeName,
        storeType,
        phone,
        address,
        country: userCountry,
        preferredLanguage: userPrefLang,
        language: userPrefLang,
        affiliateCode,
        role: 'owner',
        subscription: isAdmin ? 'lifetime' : 'free',
        status: 'active',
        createdAt: serverTimestamp(),
        // UI field compatibility
        ownerName: fullName,
        brandName: storeName,
        businessType: storeType,
        mobile: phone,
        storeAddress: address,
        subscriptionPlan: assignedPlan,
      };

      // 4. Write document to users/{uid} in Firestore
      console.log('[Firestore Write Start] Attempting setDoc for user in "users" collection...', firebaseUser.uid);
      console.log('[Firestore Write Payload]:', userDocData);
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, userDocData);
        console.log('[Firestore Write Success] Successfully created document in "users" collection with UID:', firebaseUser.uid);
      } catch (firestoreErr: any) {
        console.error('[Firestore Write Error] Failed to write user document to "users" collection:', firestoreErr);
        if (firestoreErr && typeof firestoreErr === 'object') {
          console.error('[COMPLETE Firebase Error Details]:', JSON.stringify(firestoreErr, Object.getOwnPropertyNames(firestoreErr)));
        }
        return {
          success: false,
          message: `Firestore Write Failed: ${firestoreErr?.message || firestoreErr}`,
        };
      }

      const newUser: UserProfile = {
        id: firebaseUser.uid,
        brandName: storeName,
        ownerName: fullName,
        mobile: phone,
        email: cleanEmail,
        businessType: storeType,
        country: userCountry,
        preferredLanguage: userPrefLang as Language,
        currency: data.currency || (userCountry === 'Bangladesh' ? '৳' : '$'),
        timeZone: data.timeZone || (userCountry === 'Bangladesh' ? 'Asia/Dhaka' : 'UTC'),
        role: assignedRole,
        subscriptionPlan: assignedPlan,
        subscriptionStatus: 'active',
        storeAddress: address,
        affiliateCode,
        verifiedEmail: verified,
        verifiedPhone: true,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setLanguageState(userPrefLang as Language);
      localStorage.setItem('biz_language', userPrefLang);
      localStorage.setItem('biz_language_manually_set', 'true');
      setUser(newUser);
      if (storeName) {
        setSettings((prev) => ({ ...prev, brandName: storeName }));
      }

      if (assignedRole === 'Owner') {
        setActiveTab('owner');
      } else {
        setActiveTab('dashboard');
      }
      logActivity('User Registered Account', `নতুন অ্যাকাউন্ট তৈরি করা হয়েছে (Manager)`, cleanEmail);
      return {
        success: true,
        requiresEmailVerification: !verified,
        message: 'A 6-digit verification code has been sent to your email address.',
      };
    } catch (error: any) {
      console.error('Firebase signup error [Full Error]:', error);
      if (error && typeof error === 'object') {
        console.error('Firebase Error Code:', error.code, '| Message:', error.message, '| Full Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
      let message = error.message || 'Failed to create account.';
      if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is disabled in your Firebase Console. Please go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please log in.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      return { success: false, message };
    }
  };

  // Send / Resend 6-Digit Email Verification OTP via Resend API
  const sendVerificationOtp = async (
    targetEmail?: string,
    targetName?: string
  ): Promise<{ success: boolean; message: string; cooldownRemaining?: number }> => {
    const cleanEmail = (targetEmail || user?.email || auth.currentUser?.email || '').trim().toLowerCase();
    const displayName = targetName || user?.fullName || user?.ownerName || auth.currentUser?.displayName || 'Store Owner';
    const uid = user?.id || auth.currentUser?.uid || '';

    if (!cleanEmail) {
      return {
        success: false,
        message: 'No email address available to send verification code.',
      };
    }

    try {
      const res = await fetch('/api/auth/send-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: displayName, uid }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Failed to send verification code. Please try again.',
          cooldownRemaining: data.cooldownRemaining,
        };
      }

      return {
        success: true,
        message: data.message || `A 6-digit verification code has been sent to ${cleanEmail}.`,
      };
    } catch (err: any) {
      console.error('Error calling /api/auth/send-verification-otp:', err);
      return {
        success: false,
        message: err.message || 'Failed to reach verification server. Please check your network connection.',
      };
    }
  };

  // Verify 6-digit OTP code against server
  const verifyEmailOtp = async (
    code: string,
    targetEmail?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = (targetEmail || user?.email || auth.currentUser?.email || '').trim().toLowerCase();
    const uid = user?.id || auth.currentUser?.uid || '';

    if (!cleanEmail || !code) {
      return {
        success: false,
        message: 'Email and 6-digit verification code are required.',
      };
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code, uid }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Verification failed. Please try again.',
        };
      }

      // Mark verified in client state
      setIsEmailVerified(true);
      setUser((prev) => (prev ? { ...prev, verifiedEmail: true } : prev));
      try {
        if (user?.id) {
          const saved = localStorage.getItem('biz_user');
          if (saved) {
            const parsed = JSON.parse(saved);
            parsed.verifiedEmail = true;
            localStorage.setItem('biz_user', JSON.stringify(parsed));
          }
        }
      } catch (e) {}

      return {
        success: true,
        message: data.message || 'Email successfully verified!',
      };
    } catch (err: any) {
      console.error('Error calling /api/auth/verify-otp:', err);
      return {
        success: false,
        message: err.message || 'Network error while verifying code. Please try again.',
      };
    }
  };

  // Resend Email Verification method (reusable wrapper)
  const resendEmailVerification = async (): Promise<{ success: boolean; message: string; cooldownRemaining?: number }> => {
    return sendVerificationOtp();
  };

  // Check Email Verification Status method
  const checkEmailVerification = async (): Promise<boolean> => {
    const cleanEmail = (user?.email || auth.currentUser?.email || '').trim().toLowerCase();
    const uid = user?.id || auth.currentUser?.uid || '';
    if (!cleanEmail && !uid) return false;

    const isAdmin = isTeamStockAdmin(cleanEmail);
    if (isAdmin) {
      setIsEmailVerified(true);
      setUser((prev) => (prev ? { ...prev, verifiedEmail: true } : prev));
      return true;
    }

    // 1. Check server verification status
    try {
      const res = await fetch('/api/auth/check-verification-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, uid }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isVerified) {
          setIsEmailVerified(true);
          setUser((prev) => (prev ? { ...prev, verifiedEmail: true } : prev));
          return true;
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Also check Firebase client user reload
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          setIsEmailVerified(true);
          setUser((prev) => (prev ? { ...prev, verifiedEmail: true } : prev));
          return true;
        }
      } catch (e) {}
    }

    return isEmailVerified || Boolean(user?.verifiedEmail);
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut notice:', e);
    }
    setUser(null);
    setProducts([]);
    setSales([]);
    setCustomers([]);
    setSuppliers([]);
    setExpenses([]);
    setPurchases([]);
    setAdjustments([]);
    setDueCollections([]);
    setTeamMembers([]);
    setEmployees([]);
    setPayrollPayments([]);
    setSalaryAdjustments([]);
    setAuditLogs([]);
    setCart([]);
    setIsCloudSynced(false);
    try {
      localStorage.setItem('biz_user', 'null');
    } catch (e) {}
    logActivity('User Logged Out', 'ব্যবহারকারী লগআউট করেছে');
  };

  // Owner Panel User Management Handlers
  const updateUserRole = (userId: string, newRole: UserRole) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (user && user.id === userId) {
      setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
    }
    try {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { role: newRole });
    } catch (e) {
      console.warn('Firestore user role update notice:', e);
    }
    logActivity('Updated User Role', 'ব্যবহারকারীর রোল পরিবর্তন করা হয়েছে', `${userId} -> ${newRole}`);
  };

  const sendFirebasePasswordReset = async (emailInput: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস প্রদান করুন।' };
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: `পাসওয়ার্ড রিসেট লিংক (${cleanEmail}) ইমেইলে পাঠানো হয়েছে। আপনার ইনবক্স চেক করুন।`,
      };
    } catch (error: any) {
      console.warn('Firebase password reset notification:', error);
      return {
        success: true,
        message: `পাসওয়ার্ড রিসেট রিকোয়েস্ট প্রক্রিয়া করা হয়েছে (${cleanEmail})। আপনার ইমেইল চেক করুন।`,
      };
    }
  };

  const suspendUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u))
    );
    if (user && user.id === userId) {
      setUser(null);
    }
    try {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { status: 'suspended' });
    } catch (e) {
      console.warn('Firestore suspendUser notice:', e);
    }
    logActivity('Suspended User Account', 'ব্যবহারকারী স্থগিত করা হয়েছে', userId);
  };

  const activateUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
    try {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { status: 'active' });
    } catch (e) {
      console.warn('Firestore activateUser notice:', e);
    }
    logActivity('Activated User Account', 'ব্যবহারকারী সক্রিয় করা হয়েছে', userId);
  };

  const blockUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'blocked' } : u))
    );
    if (user && user.id === userId) {
      signOut(auth);
      setUser(null);
    }
    try {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { status: 'blocked' });
    } catch (e) {
      console.warn('Firestore blockUser notice:', e);
    }
    logActivity('Blocked User Account', 'ব্যবহারকারীর অ্যাকাউন্ট ব্লক করা হয়েছে', userId);
  };

  const unblockUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
    try {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { status: 'active' });
    } catch (e) {
      console.warn('Firestore unblockUser notice:', e);
    }
    logActivity('Unblocked User Account', 'অ্যাকাউন্ট আনব্লক করা হয়েছে', userId);
  };

  const deleteUser = (userId: string) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'deleted' } : u)));
    if (user && user.id === userId) {
      signOut(auth);
      setUser(null);
    }
    try {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { status: 'deleted' });
    } catch (e) {
      console.warn('Firestore deleteUser notice:', e);
    }
    logActivity('Deleted User Account', 'অ্যাকোউন্ট ডিঅ্যাক্টিভেট/মুছে ফেলা হয়েছে', userId);
  };

  const updateUserData = async (userId: string, data: Partial<UserProfile>) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (user && (user.id === userId || user.email === data.email)) {
      setUser((prev) => (prev ? { ...prev, ...data } : prev));
    }
    try {
      const userRef = doc(db, 'users', userId);
      const fsData: Record<string, any> = {};
      if (data.ownerName !== undefined) { fsData.ownerName = data.ownerName; fsData.fullName = data.ownerName; }
      if (data.brandName !== undefined) { fsData.brandName = data.brandName; fsData.storeName = data.brandName; }
      if (data.mobile !== undefined) { fsData.mobile = data.mobile; fsData.phone = data.mobile; }
      if (data.email !== undefined) { fsData.email = data.email; }
      if (data.businessType !== undefined) { fsData.businessType = data.businessType; fsData.storeType = data.businessType; }
      if (data.role !== undefined) { fsData.role = data.role.toLowerCase(); }
      if (data.subscriptionPlan !== undefined) {
        fsData.subscriptionPlan = data.subscriptionPlan;
        fsData.subscription = data.subscriptionPlan.toLowerCase();
        fsData.subscriptionStatus = 'active';
        fsData.pendingPlan = deleteField();
      }
      if (data.status !== undefined) { fsData.status = data.status; }
      if (data.notes !== undefined) { fsData.notes = data.notes; }
      if (data.dashboardPreferences !== undefined) {
        fsData.dashboardPreferences = data.dashboardPreferences;
        if (user && (user.id === userId || user.email === data.email)) {
          setDashboardPreferences(data.dashboardPreferences);
          localStorage.setItem('biz_dashboard_preferences', JSON.stringify(data.dashboardPreferences));
          localStorage.setItem(`biz_dashboard_preferences_${userId}`, JSON.stringify(data.dashboardPreferences));
        }
      }
      await setDoc(userRef, fsData, { merge: true });
    } catch (e) {
      console.warn('Firestore updateUserData notice:', e);
    }
    logActivity('Updated User Profile', 'ব্যবহারকারীর তথ্য পরিবর্তন করা হয়েছে', userId);
  };

  const refreshUsers = async (): Promise<void> => {
    try {
      const usersCol = collection(db, 'users');
      const snapshot = await getDocs(usersCol);
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const uData = docSnap.data();
        const uEmail = (uData.email || '').toLowerCase();
        const isPlatformSuperAdmin = isTeamStockAdmin(uEmail) || uData.role === 'PlatformOwner' || uData.role === 'platformowner';
        let normalizedRole: UserRole = 'Manager';
        if (uData.role === 'Owner' || uData.role === 'owner' || isPlatformSuperAdmin) {
          normalizedRole = 'Owner';
        } else if (uData.role === 'Staff' || uData.role === 'staff') {
          normalizedRole = 'Staff';
        } else if (uData.role === 'Accountant' || uData.role === 'accountant') {
          normalizedRole = 'Accountant';
        } else if (uData.role === 'Cashier' || uData.role === 'cashier') {
          normalizedRole = 'Cashier';
        } else {
          normalizedRole = 'Manager';
        }
        const assignedPlan: SubscriptionPlan = isPlatformSuperAdmin ? 'Lifetime' : ((uData.subscriptionPlan || uData.subscription || 'Free') as SubscriptionPlan);

        list.push({
          id: docSnap.id || uData.uid || uData.id,
          brandName: uData.brandName || uData.storeName || 'My Store',
          ownerName: uData.ownerName || uData.fullName || 'Store Owner',
          mobile: uData.mobile || uData.phone || '',
          email: uData.email || '',
          businessType: uData.businessType || uData.storeType || 'General Retail & Grocery',
          country: uData.country || 'Bangladesh',
          currency: uData.currency || '৳',
          timeZone: uData.timeZone || 'Asia/Dhaka',
          role: normalizedRole,
          subscriptionPlan: assignedPlan,
          subscriptionStatus: uData.subscriptionStatus || 'active',
          status: (uData.status as any) || 'active',
          storeAddress: uData.storeAddress || uData.address || '',
          affiliateCode: uData.affiliateCode || '',
          affiliateProgram: uData.affiliateProgram || '',
          avatarUrl: uData.avatarUrl || uData.photoUrl || uData.photo || '',
          verifiedEmail: true,
          verifiedPhone: true,
          createdAt: uData.createdAt ? (typeof uData.createdAt === 'string' ? uData.createdAt : (uData.createdAt?.toDate ? uData.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0])) : new Date().toISOString().split('T')[0],
          lastLogin: uData.lastLogin ? (typeof uData.lastLogin === 'string' ? uData.lastLogin : (uData.lastLogin?.toDate ? uData.lastLogin.toDate().toLocaleString() : '')) : '',
          notes: uData.notes || '',
          dashboardPreferences: uData.dashboardPreferences ? { ...defaultDashboardPreferences, ...uData.dashboardPreferences } : defaultDashboardPreferences,
        });
      });
      setAllUsers(list);
    } catch (e) {
      console.warn('refreshUsers error:', e);
    }
  };

  const resetUserPassword = (userId: string, newPass: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );
    try {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { password: newPass });
    } catch (e) {
      console.warn('Firestore resetUserPassword notice:', e);
    }
    logActivity('Reset User Password', 'পাসওয়ার্ড পরিবর্তন করা হয়েছে', userId);
  };

  const updateUserPlan = async (userId: string, newPlan: SubscriptionPlan, billingPeriod: BillingCycle = 'monthly') => {
    const startDate = new Date().toISOString();
    const expiryDate = newPlan === 'Lifetime' || newPlan === 'Free' ? undefined : calculateSubscriptionExpiry(startDate, billingPeriod);

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              subscriptionPlan: newPlan,
              subscriptionStatus: 'active',
              startDate,
              expiryDate,
              billingPeriod,
              pendingPlan: undefined,
            }
          : u
      )
    );
    if (user && user.id === userId) {
      setUser({
        ...user,
        subscriptionPlan: newPlan,
        subscriptionStatus: 'active',
        startDate,
        expiryDate,
        billingPeriod,
        pendingPlan: undefined,
      });
    }

    try {
      const userRef = doc(db, 'users', userId);
      const updateData: Record<string, any> = {
        subscriptionPlan: newPlan,
        subscription: newPlan.toLowerCase(),
        subscriptionStatus: 'active',
        startDate,
        billingPeriod,
        pendingPlan: deleteField(),
      };
      if (expiryDate) {
        updateData.expiryDate = expiryDate;
      } else {
        updateData.expiryDate = deleteField();
      }
      await setDoc(userRef, updateData, { merge: true });
    } catch (e) {
      console.warn('[AppContext] Failed to persist updateUserPlan to Firestore:', e);
    }

    logActivity('Directly Updated User Plan', 'ব্যবহারকারীর প্ল্যান রেনু/আপগ্রেড করা হয়েছে', `${userId} -> ${newPlan}`);
  };

  const activateUserSubscription = async (params: {
    userId: string;
    plan: SubscriptionPlan;
    billingPeriod: BillingCycle;
    paymentMethod?: string;
    paymentProvider?: string;
    paymentRegion?: 'international' | 'bangladesh';
    transactionId?: string;
    amount?: number;
    currency?: string;
  }): Promise<void> => {
    const { userId, plan, billingPeriod, paymentMethod, paymentProvider, paymentRegion, transactionId, amount, currency } = params;
    const startDate = new Date().toISOString();
    const expiryDate = plan === 'Lifetime' || plan === 'Free' ? undefined : calculateSubscriptionExpiry(startDate, billingPeriod);

    console.log(`[AppContext] Activating subscription for user ${userId}: plan=${plan}, cycle=${billingPeriod}, txId=${transactionId}`);

    // 1. Update Firestore user profile
    try {
      const userRef = doc(db, 'users', userId);
      const userDocUpdate: Record<string, any> = {
        subscriptionPlan: plan,
        subscription: plan.toLowerCase(),
        subscriptionStatus: 'active',
        startDate,
        billingPeriod,
        billingCycle: billingPeriod,
        paymentMethod: paymentMethod || paymentProvider || 'Online Payment',
        paymentProvider: paymentProvider || paymentMethod || 'Online Payment',
        paymentRegion: paymentRegion || 'international',
        transactionId: transactionId || `TX_${Date.now()}`,
        pendingPlan: deleteField(),
      };
      if (expiryDate) {
        userDocUpdate.expiryDate = expiryDate;
      } else {
        userDocUpdate.expiryDate = deleteField();
      }

      await setDoc(userRef, userDocUpdate, { merge: true });
      console.log(`[AppContext] User document updated successfully in Firestore.`);
    } catch (e) {
      console.warn('[AppContext] Error updating user in Firestore:', e);
    }

    // 2. Record approved subscription document in subscriptionRequests
    try {
      const subRequestsCollection = collection(db, 'subscriptionRequests');
      const targetUser = allUsers.find((u) => u.id === userId) || user;
      await addDoc(subRequestsCollection, {
        userId,
        uid: userId,
        userEmail: targetUser?.email || '',
        userName: targetUser?.ownerName || targetUser?.fullName || 'User',
        brandName: targetUser?.brandName || '',
        currentPlan: targetUser?.subscriptionPlan || 'Free',
        requestedPlan: plan,
        plan,
        billingCycle: billingPeriod,
        billingPeriod,
        paymentMethod: paymentMethod || paymentProvider || 'Online Payment',
        paymentProvider: paymentProvider || paymentMethod || 'Online Payment',
        paymentRegion: paymentRegion || 'international',
        currency: currency || 'USD',
        transactionId: transactionId || `TX_${Date.now()}`,
        amount: amount || 0,
        status: 'approved',
        startDate,
        expiryDate: expiryDate || '',
        requestDate: startDate,
        reviewedDate: startDate,
        approvedBy: 'Instant Payment Gateway (Paddle/Direct)',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('[AppContext] Error adding approved record to subscriptionRequests:', e);
    }

    // 3. Update local state
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              subscriptionPlan: plan,
              subscriptionStatus: 'active',
              startDate,
              expiryDate,
              billingPeriod,
              transactionId,
              paymentMethod: paymentMethod || paymentProvider,
              pendingPlan: undefined,
            }
          : u
      )
    );

    if (user && user.id === userId) {
      setUser({
        ...user,
        subscriptionPlan: plan,
        subscriptionStatus: 'active',
        startDate,
        expiryDate,
        billingPeriod,
        transactionId,
        paymentMethod: paymentMethod || paymentProvider,
        pendingPlan: undefined,
      });
    }

    // 4. Trigger user notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `${plan} Plan Activated!`,
      titleBn: `${plan} প্ল্যান সক্রিয় হয়েছে!`,
      message: `Your ${plan} subscription is active and ready to use.`,
      messageBn: `আপনার ${plan} প্ল্যান সফলভাবে সক্রিয় করা হয়েছে।`,
      type: 'subscription',
      priority: 'info',
      date: new Date().toISOString().split('T')[0],
      read: false,
      linkTab: 'subscription',
    };
    addManualNotification(notif);
    logActivity('Activated Subscription', 'সাবস্ক্রিপশন সক্রিয় করা হয়েছে', `${plan} (${billingPeriod})`);
  };

  // Subscription Approval System Handlers
  const requestSubscription = async (data: {
    requestedPlan: SubscriptionPlan;
    billingCycle: BillingCycle;
    paymentMethod: string;
    paymentRegion?: 'international' | 'bangladesh';
    paymentProvider?: string;
    currency?: string;
    transactionId?: string;
    amount: number;
  }): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be logged in to submit a request.');
    }

    const targetUid = user.id || user.uid || (auth.currentUser ? auth.currentUser.uid : '');
    const userEmail = user.email || (auth.currentUser ? auth.currentUser.email : '') || '';

    // Create a new document reference with unique ID immediately
    const docRef = doc(collection(db, 'subscriptionRequests'));

    // Save document with exact fields required by prompt and UI
    const docData: Record<string, any> = {
      id: docRef.id,
      uid: targetUid,
      userId: targetUid,
      email: userEmail,
      userEmail: userEmail,
      userName: user.ownerName || user.fullName || 'Merchant',
      storeName: user.brandName || user.storeName || 'My Store',
      brandName: user.brandName || user.storeName || 'My Store',
      currentPlan: user.subscriptionPlan || 'Free',
      requestedPlan: data.requestedPlan || 'Pro',
      billingCycle: data.billingCycle || 'monthly',
      paymentMethod: data.paymentMethod || 'PayPal / Credit Card',
      paymentRegion: data.paymentRegion || 'international',
      paymentProvider: data.paymentProvider || data.paymentMethod || 'PayPal / Credit Card',
      currency: data.currency || (data.paymentRegion === 'bangladesh' ? 'BDT' : 'USD'),
      transactionId: data.transactionId ? String(data.transactionId).trim() : '',
      amount: typeof data.amount === 'number' ? data.amount : 0,
      status: 'pending',
      createdAt: serverTimestamp(),
      requestDate: new Date().toISOString(),
    };

    console.log('[Firestore Write Pre-check]');
    console.log('  - Firebase Project ID:', auth.app.options.projectId);
    console.log('  - Collection Name: subscriptionRequests');
    console.log('  - Document ID:', docRef.id);
    console.log('  - Target UID:', targetUid);
    console.log('  - Write Payload:', docData);

    try {
      // 1. Write to subscriptionRequests with timeout so UI never hangs
      const writePromise = setDoc(docRef, docData);
      const writeTimeout = new Promise((resolve) => setTimeout(resolve, 3500));
      await Promise.race([writePromise, writeTimeout]);

      console.log('[Firestore Write Success]');
      console.log('  - Collection Name: subscriptionRequests');
      console.log('  - Document Path:', docRef.path);
      console.log('  - Document ID:', docRef.id);

      // 2. Update user's pending status in Firestore in background
      if (targetUid) {
        const userRef = doc(db, 'users', targetUid);
        setDoc(
          userRef,
          {
            pendingPlan: data.requestedPlan,
            subscriptionStatus: 'pending',
            uid: targetUid,
            email: userEmail,
          },
          { merge: true }
        ).catch((uErr) => {
          console.warn('Notice updating user pending plan in Firestore:', uErr);
        });
      }

      // 3. Local user state update
      const updatedUser: UserProfile = {
        ...user,
        pendingPlan: data.requestedPlan,
        subscriptionStatus: 'pending',
      };
      setUser(updatedUser);
      setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));

      // 4. Send user notification
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Subscription Request Submitted',
        titleBn: 'সাবস্ক্রিপশন আবেদন জমা দেওয়া হয়েছে',
        message: `Your request for the ${data.requestedPlan} Plan is pending approval by the platform owner.`,
        messageBn: `আপনার ${data.requestedPlan} প্ল্যানের আবেদন প্লাটফর্ম এডমিন অনুমোদনের অপেক্ষায় রয়েছে।`,
        type: 'subscription',
        priority: 'info',
        date: new Date().toISOString().split('T')[0],
        read: false,
        linkTab: 'subscription',
      };
      addManualNotification(notif);
      logActivity('Requested Subscription Upgrade', 'সাবস্ক্রিপশন আপগ্রেড আবেদন করা হয়েছে', data.requestedPlan);

      return true;
    } catch (error: any) {
      console.error('[Firestore Write Failure] Failed to create subscription request document in Firestore:', error);
      if (error && typeof error === 'object') {
        console.error('[COMPLETE Firebase Error Details]:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
      throw error;
    }
  };

  const approveSubscriptionRequest = async (requestId: string): Promise<void> => {
    const req = subscriptionRequests.find((r) => r.id === requestId);
    if (!req) return;

    const nowIso = new Date().toISOString();
    const ownerIdentifier = user?.ownerName || user?.email || 'Owner';
    const billingPeriod = req.billingCycle || req.billingPeriod || 'monthly';
    const startDate = nowIso;
    const expiryDate = req.requestedPlan === 'Lifetime' || req.requestedPlan === 'Free' ? undefined : calculateSubscriptionExpiry(startDate, billingPeriod);

    try {
      console.log('[Firestore Write Start] Approving request in "subscriptionRequests":', requestId);

      // 1. If user has other active/approved requests, update them to superseded/cancelled to avoid duplicate active subscriptions
      if (req.userId) {
        const otherApprovedReqs = subscriptionRequests.filter(
          (r) => r.userId === req.userId && r.id !== requestId && r.status === 'approved'
        );
        for (const oldReq of otherApprovedReqs) {
          const oldReqRef = doc(db, 'subscriptionRequests', oldReq.id);
          await setDoc(
            oldReqRef,
            {
              status: 'cancelled',
              cancelledAt: nowIso,
              cancelledBy: ownerIdentifier,
              notes: `Superseded by new approved plan (${req.requestedPlan}) on ${new Date().toLocaleDateString()}`,
            },
            { merge: true }
          );
        }
      }

      // 2. Update request status in Firestore
      const reqRef = doc(db, 'subscriptionRequests', requestId);
      const reqUpdateData: Record<string, any> = {
        status: 'approved',
        reviewedDate: nowIso,
        approvedBy: ownerIdentifier,
        reviewedAt: serverTimestamp(),
        startDate,
        billingPeriod,
        billingCycle: billingPeriod,
      };
      if (expiryDate) {
        reqUpdateData.expiryDate = expiryDate;
      }
      await setDoc(reqRef, reqUpdateData, { merge: true });
      console.log('[Firestore Write Success] Approved request in "subscriptionRequests":', requestId);

      // 3. Update merchant user profile in Firestore
      if (req.userId) {
        console.log('[Firestore Write Start] Updating merchant profile in "users" collection:', req.userId);
        const userRef = doc(db, 'users', req.userId);
        const userDocUpdate: Record<string, any> = {
          subscriptionPlan: req.requestedPlan,
          subscription: req.requestedPlan.toLowerCase(),
          subscriptionStatus: 'active',
          startDate,
          billingPeriod,
          billingCycle: billingPeriod,
          paymentMethod: req.paymentMethod || req.paymentProvider || 'Manual / Cash',
          paymentProvider: req.paymentProvider || req.paymentMethod || 'Manual / Cash',
          paymentRegion: req.paymentRegion || 'bangladesh',
          transactionId: req.transactionId || undefined,
          pendingPlan: deleteField(),
        };
        if (expiryDate) {
          userDocUpdate.expiryDate = expiryDate;
        } else {
          userDocUpdate.expiryDate = deleteField();
        }
        await setDoc(userRef, userDocUpdate, { merge: true });
        console.log('[Firestore Write Success] Updated merchant profile in "users" collection:', req.userId);
      }

      // 4. Local states update
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === req.userId) {
            return {
              ...u,
              subscriptionPlan: req.requestedPlan,
              subscriptionStatus: 'active',
              startDate,
              expiryDate,
              billingPeriod,
              transactionId: req.transactionId || u.transactionId,
              paymentMethod: req.paymentMethod || req.paymentProvider || u.paymentMethod,
              pendingPlan: undefined,
            };
          }
          return u;
        })
      );

      if (user && user.id === req.userId) {
        setUser({
          ...user,
          subscriptionPlan: req.requestedPlan,
          subscriptionStatus: 'active',
          startDate,
          expiryDate,
          billingPeriod,
          transactionId: req.transactionId || user.transactionId,
          paymentMethod: req.paymentMethod || req.paymentProvider || user.paymentMethod,
          pendingPlan: undefined,
        });
      }

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Subscription Plan Activated!',
        titleBn: 'সাবস্ক্রিপশন প্ল্যান সক্রিয় হয়েছে!',
        message: `Your request for the ${req.requestedPlan} Plan has been reviewed and APPROVED by the owner.`,
        messageBn: `আপনার ${req.requestedPlan} প্ল্যানের আবেদন অনুমোদন করা হয়েছে।`,
        type: 'subscription',
        priority: 'info',
        date: new Date().toISOString().split('T')[0],
        read: false,
        linkTab: 'subscription',
      };
      addManualNotification(notif);
      logActivity('Approved Subscription Request', 'সাবস্ক্রিপশন আবেদন অনুমোদন করা হয়েছে', req.userEmail);
    } catch (error: any) {
      console.error('[Firestore Write Failure] Error approving subscription request:', error);
      if (error && typeof error === 'object') {
        console.error('[COMPLETE Firebase Error Details]:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
    }
  };

  const cancelSubscriptionRequest = async (requestId: string, notes?: string): Promise<void> => {
    const req = subscriptionRequests.find((r) => r.id === requestId);
    if (!req) return;

    const nowIso = new Date().toISOString();
    const ownerIdentifier = user?.ownerName || user?.email || 'Owner';

    try {
      console.log('[Firestore Write Start] Cancelling subscription request:', requestId);

      // 1. Mark request as cancelled in Firestore (Preserving history!)
      const reqRef = doc(db, 'subscriptionRequests', requestId);
      await setDoc(
        reqRef,
        {
          status: 'cancelled',
          cancelledAt: nowIso,
          cancelledBy: ownerIdentifier,
          previousPlan: req.requestedPlan || req.currentPlan,
          previousStatus: req.status,
          notes: notes ? (req.notes ? `${req.notes} | Cancellation Note: ${notes}` : `Cancellation Note: ${notes}`) : req.notes,
        },
        { merge: true }
      );

      // 2. Revert merchant user profile to Free plan in Firestore (preserving account and store data)
      if (req.userId) {
        console.log('[Firestore Write Start] Reverting user profile to Free plan:', req.userId);
        const userRef = doc(db, 'users', req.userId);
        await setDoc(
          userRef,
          {
            subscriptionPlan: 'Free',
            subscription: 'free',
            subscriptionStatus: 'cancelled',
            pendingPlan: deleteField(),
            cancelledAt: nowIso,
            cancelledBy: ownerIdentifier,
            previousPlan: req.requestedPlan || req.currentPlan,
          },
          { merge: true }
        );
      }

      // 3. Update local user state
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === req.userId) {
            return {
              ...u,
              subscriptionPlan: 'Free',
              subscriptionStatus: 'cancelled',
              pendingPlan: undefined,
              cancelledAt: nowIso,
              cancelledBy: ownerIdentifier,
              previousPlan: req.requestedPlan || req.currentPlan,
            };
          }
          return u;
        })
      );

      if (user && user.id === req.userId) {
        setUser({
          ...user,
          subscriptionPlan: 'Free',
          subscriptionStatus: 'cancelled',
          pendingPlan: undefined,
          cancelledAt: nowIso,
          cancelledBy: ownerIdentifier,
          previousPlan: req.requestedPlan || req.currentPlan,
        });
      }

      // 4. Dispatch notification & activity log
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Subscription Plan Cancelled',
        titleBn: 'সাবস্ক্রিপশন বাতিল করা হয়েছে',
        message: `Your ${req.requestedPlan || req.currentPlan} Plan subscription has been cancelled by the owner and reverted to the Free Plan. All your store products, sales, and data are safely preserved.`,
        messageBn: `আপনার ${req.requestedPlan || req.currentPlan} প্ল্যানটি বাতিল করে ফ্রি প্ল্যানে ফেরত নেওয়া হয়েছে। আপনার সকল তথ্য অক্ষত রয়েছে।`,
        type: 'subscription',
        priority: 'info',
        date: new Date().toISOString().split('T')[0],
        read: false,
        linkTab: 'subscription',
      };
      addManualNotification(notif);
      logActivity('Cancelled User Subscription', 'সাবস্ক্রিপশন বাতিল করা হয়েছে', req.userEmail);
    } catch (error: any) {
      console.error('[Firestore Write Failure] Error cancelling subscription request:', error);
    }
  };

  const cancelUserSubscription = async (userId: string, notes?: string): Promise<void> => {
    const targetUser = allUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    const nowIso = new Date().toISOString();
    const ownerIdentifier = user?.ownerName || user?.email || 'Owner';

    try {
      console.log('[Firestore Write Start] Cancelling user subscription for user:', userId);

      // 1. Mark any active/approved or pending requests for this user as cancelled
      const userReqs = subscriptionRequests.filter(
        (r) => r.userId === userId && (r.status === 'approved' || r.status === 'pending')
      );

      for (const req of userReqs) {
        const reqRef = doc(db, 'subscriptionRequests', req.id);
        await setDoc(
          reqRef,
          {
            status: 'cancelled',
            cancelledAt: nowIso,
            cancelledBy: ownerIdentifier,
            previousPlan: req.requestedPlan || targetUser.subscriptionPlan,
            previousStatus: req.status,
            notes: notes ? `Cancellation Note: ${notes}` : req.notes,
          },
          { merge: true }
        );
      }

      // 2. Revert user profile in Firestore
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          subscriptionPlan: 'Free',
          subscription: 'free',
          subscriptionStatus: 'cancelled',
          pendingPlan: deleteField(),
          cancelledAt: nowIso,
          cancelledBy: ownerIdentifier,
          previousPlan: targetUser.subscriptionPlan,
        },
        { merge: true }
      );

      // 3. Local state updates
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              subscriptionPlan: 'Free',
              subscriptionStatus: 'cancelled',
              pendingPlan: undefined,
              cancelledAt: nowIso,
              cancelledBy: ownerIdentifier,
              previousPlan: targetUser.subscriptionPlan,
            };
          }
          return u;
        })
      );

      if (user && user.id === userId) {
        setUser({
          ...user,
          subscriptionPlan: 'Free',
          subscriptionStatus: 'cancelled',
          pendingPlan: undefined,
          cancelledAt: nowIso,
          cancelledBy: ownerIdentifier,
          previousPlan: targetUser.subscriptionPlan,
        });
      }

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Subscription Cancelled',
        titleBn: 'সাবস্ক্রিপশন বাতিল করা হয়েছে',
        message: `Your ${targetUser.subscriptionPlan} Plan subscription has been cancelled by the owner. You are now on the Free Plan. All your store products, sales, and business data are safely preserved.`,
        messageBn: `আপনার সাবস্ক্রিপশন বাতিল করা হয়েছে। সকল তথ্য নিরাপদ রয়েছে।`,
        type: 'subscription',
        priority: 'info',
        date: new Date().toISOString().split('T')[0],
        read: false,
        linkTab: 'subscription',
      };
      addManualNotification(notif);
      logActivity('Cancelled User Subscription', 'সাবস্ক্রিপশন বাতিল করা হয়েছে', targetUser.email);
    } catch (error: any) {
      console.error('[Firestore Write Failure] Error cancelling user subscription:', error);
    }
  };

  const rejectSubscriptionRequest = async (requestId: string, notes?: string): Promise<void> => {
    const req = subscriptionRequests.find((r) => r.id === requestId);
    if (!req) return;

    try {
      console.log('[Firestore Write Start] Rejecting request in "subscriptionRequests":', requestId);
      // 1. Update request status in Firestore
      const reqRef = doc(db, 'subscriptionRequests', requestId);
      await setDoc(
        reqRef,
        {
          status: 'rejected',
          notes: notes || '',
          reviewedDate: new Date().toISOString(),
          reviewedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log('[Firestore Write Success] Rejected request in "subscriptionRequests":', requestId);

      // 2. Update merchant user profile in Firestore
      if (req.userId) {
        console.log('[Firestore Write Start] Updating user status in "users" collection:', req.userId);
        const userRef = doc(db, 'users', req.userId);
        await setDoc(
          userRef,
          {
            subscriptionStatus: 'active',
            pendingPlan: deleteField(),
          },
          { merge: true }
        );
        console.log('[Firestore Write Success] Updated user status in "users" collection:', req.userId);
      }

      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === req.userId) {
            return {
              ...u,
              subscriptionStatus: 'active',
              pendingPlan: undefined,
            };
          }
          return u;
        })
      );

      if (user && user.id === req.userId) {
        setUser({
          ...user,
          subscriptionStatus: 'active',
          pendingPlan: undefined,
        });
      }

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Subscription Request Rejected',
        titleBn: 'সাবস্ক্রিপশন আবেদন প্রত্যাখ্যাত হয়েছে',
        message: `Your request for the ${req.requestedPlan} Plan was rejected.${notes ? ` Note: ${notes}` : ''}`,
        messageBn: `আপনার ${req.requestedPlan} প্ল্যানের আবেদন বাতিল করা হয়েছে।`,
        type: 'subscription',
        priority: 'info',
        date: new Date().toISOString().split('T')[0],
        read: false,
        linkTab: 'subscription',
      };
      addManualNotification(notif);
      logActivity('Rejected Subscription Request', 'সাবস্ক্রিপশন আবেদন প্রত্যাখ্যান করা হয়েছে', req.userEmail);
    } catch (error) {
      console.error('Error rejecting subscription request:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    let processedData = { ...data };
    if (data.photoUrl && data.photoUrl.startsWith('data:image') && data.photoUrl.length > 50000) {
      try {
        const compressed = await compressImage(data.photoUrl, { maxWidth: 320, maxHeight: 320, quality: 0.82 });
        processedData.photoUrl = compressed;
        processedData.profilePhotoUrl = compressed;
        processedData.avatarUrl = compressed;
      } catch (e) {}
    }
    const updated = { ...user, ...processedData };
    setUser(updated);
    try {
      localStorage.setItem('biz_user', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage quota notice in updateProfile:', e);
    }
    if (data.brandName) {
      setSettings((prev) => {
        const next = { ...prev, brandName: data.brandName! };
        try {
          localStorage.setItem('biz_settings', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
    if (auth.currentUser) {
      const fsPayload: Record<string, any> = { ...processedData };
      if (data.brandName) fsPayload.storeName = data.brandName;
      updateDoc(doc(db, 'users', auth.currentUser.uid), fsPayload)
        .catch((err) => console.warn('Sync profile error:', err));
    }
    logActivity('Updated Profile', 'প্রোফাইল আপডেট করা হয়েছে');
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    let processedData = { ...data };
    if (data.photoUrl && data.photoUrl.startsWith('data:image') && data.photoUrl.length > 50000) {
      try {
        const compressed = await compressImage(data.photoUrl, { maxWidth: 320, maxHeight: 320, quality: 0.82 });
        processedData.photoUrl = compressed;
        processedData.profilePhotoUrl = compressed;
        processedData.avatarUrl = compressed;
      } catch (e) {}
    }
    const updated = { ...user, ...processedData };
    setUser(updated);
    try {
      localStorage.setItem('biz_user', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage quota notice in updateUser:', e);
    }
    if (data.brandName) {
      setSettings((prev) => {
        const next = { ...prev, brandName: data.brandName! };
        try {
          localStorage.setItem('biz_settings', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
    if (auth.currentUser) {
      const fsPayload: Record<string, any> = { ...processedData };
      if (data.brandName) fsPayload.storeName = data.brandName;
      updateDoc(doc(db, 'users', auth.currentUser.uid), fsPayload)
        .catch((err) => console.warn('Sync user error:', err));
    }
  };

  const uploadProfilePhoto = async (photoInput: string | File | Blob): Promise<void> => {
    if (!user) return;
    try {
      const compressedPhoto = await compressImage(photoInput, {
        maxWidth: 320,
        maxHeight: 320,
        quality: 0.82,
        outputFormat: 'image/jpeg',
      });

      const updated = {
        ...user,
        photoUrl: compressedPhoto,
        profilePhotoUrl: compressedPhoto,
        avatarUrl: compressedPhoto,
      };
      setUser(updated);
      try {
        localStorage.setItem('biz_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage quota notice in uploadProfilePhoto:', e);
      }
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            photoUrl: compressedPhoto,
            profilePhotoUrl: compressedPhoto,
            avatarUrl: compressedPhoto,
          });
        } catch (err) {
          console.warn('Sync profile photo error:', err);
        }
      }
      logActivity('Uploaded Profile Photo', 'প্রোফাইল ছবি পরিবর্তন করা হয়েছে');
    } catch (err) {
      console.error('Error in uploadProfilePhoto:', err);
      throw err;
    }
  };

  const removeProfilePhoto = async (): Promise<void> => {
    if (!user) return;
    const updated = {
      ...user,
      photoUrl: '',
      profilePhotoUrl: '',
      avatarUrl: '',
    };
    setUser(updated);
    try {
      localStorage.setItem('biz_user', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage quota notice in removeProfilePhoto:', e);
    }
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          photoUrl: deleteField(),
          profilePhotoUrl: deleteField(),
          avatarUrl: deleteField(),
        });
      } catch (err) {
        console.warn('Remove profile photo error:', err);
      }
    }
    logActivity('Removed Profile Photo', 'প্রোফাইল ছবি মুছে ফেলা হয়েছে');
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      localStorage.setItem('biz_settings', JSON.stringify(next));
      return next;
    });

    if (auth.currentUser) {
      const fsPayload: Record<string, any> = {};
      if (newSettings.brandName) {
        fsPayload.brandName = newSettings.brandName;
        fsPayload.storeName = newSettings.brandName;
      }
      if (newSettings.paymentSettings) {
        fsPayload.paymentSettings = newSettings.paymentSettings;
        fsPayload['storeSettings.payment'] = {
          ...newSettings.paymentSettings,
          updatedAt: new Date().toISOString(),
        };
        // Also save to global platform settings doc in Firestore for all customer apps to access
        setDoc(doc(db, 'settings', 'payment'), {
          ...newSettings.paymentSettings,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch((err) => console.warn('Sync global settings/payment error:', err));
      }
      if (Object.keys(fsPayload).length > 0) {
        updateDoc(doc(db, 'users', auth.currentUser.uid), fsPayload)
          .catch((err) => console.warn('Sync settings error:', err));
      }
    }

    if (newSettings.brandName) {
      setUser((prev) => {
        if (!prev) return prev;
        const updatedUser = { ...prev, brandName: newSettings.brandName! };
        localStorage.setItem('biz_user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }
    logActivity('Settings Updated', 'সেটিংস সেভ করা হয়েছে');
  };

  // POS Cart management
  const addToCart = (product: Product) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (product.expiryDate && product.expiryDate <= todayStr) {
      alert('This product has expired and cannot be sold.');
      return;
    }
    if (product.currentStock <= 0) {
      alert(t('outOfStock'));
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          alert('Cannot add more than available stock!');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const targetItem = cart.find((i) => i.product.id === productId);
    if (targetItem && targetItem.product.expiryDate && targetItem.product.expiryDate <= todayStr) {
      alert('This product has expired and cannot be sold.');
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.currentStock;
          const validQty = Math.min(qty, maxStock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  // Complete POS sale
  const checkoutPOS = async (saleData: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    discount: number;
    tax: number;
    paymentMethod: 'Cash' | 'Card' | 'bKash/Mobile' | 'Due/Credit' | 'Split';
    cashReceived: number;
    note?: string;
  }): Promise<Sale> => {
    if (!cart || cart.length === 0) {
      throw new Error('Cart is empty. Please add products to complete the sale.');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const expiredItem = cart.find(
      (item) => item.product.expiryDate && item.product.expiryDate <= todayStr
    );
    if (expiredItem) {
      alert(`Expired Product (${expiredItem.product.name}). Sale is not allowed.`);
      throw new Error('This product has expired and cannot be sold.');
    }

    const subtotal = cart.reduce((acc, item) => {
      const price = Number(item.product.sellingPrice) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + price * qty;
    }, 0);

    const taxPercent = Number(saleData.tax) || 0;
    const taxAmount = Math.round((subtotal * taxPercent) / 100);
    const discountAmount = Math.max(0, Number(saleData.discount) || 0);
    const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);

    let paidAmount = Number(saleData.cashReceived) || 0;
    if (saleData.paymentMethod === 'Due/Credit') {
      paidAmount = Number(saleData.cashReceived) || 0;
    } else {
      paidAmount = Math.min(
        saleData.cashReceived !== undefined ? Number(saleData.cashReceived) || 0 : grandTotal,
        grandTotal
      );
    }

    const dueAmount = Math.max(0, grandTotal - paidAmount);
    const changeAmount = Math.max(0, (Number(saleData.cashReceived) || 0) - grandTotal);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = Date.now().toString().slice(-6);
    const randStr = Math.floor(100 + Math.random() * 900);
    const invoiceNo = `ORD-${dateStr}-${timeStr}-${randStr}`;

    console.log('[QUICK SALE] creating sale items', { itemCount: cart.length });
    const saleItems = cart.map((item) => {
      const buyingPrice = Number(item.product.buyingPrice) || 0;
      const sellingPrice = Number(item.product.sellingPrice) || 0;
      const quantity = Number(item.quantity) || 1;
      return {
        productId: item.product.id,
        productName: item.product.name || 'Item',
        sku: (item.product.sku || '').trim(),
        buyingPrice,
        sellingPrice,
        quantity,
        unit: item.product.unit || 'pcs',
        total: sellingPrice * quantity,
        image: item.product.image || '',
      };
    });

    console.log('[QUICK SALE] creating sale', { invoiceNo, total: grandTotal, paymentMethod: saleData.paymentMethod });
    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      invoiceNo,
      customerId: saleData.customerId || '',
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone || '',
      items: saleItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal,
      paidAmount,
      dueAmount,
      changeAmount,
      paymentMethod: saleData.paymentMethod,
      cashierName: user ? (user.ownerName || user.fullName || 'Cashier') : 'Cashier',
      date: new Date().toISOString(),
      note: saleData.note || '',
    };

    console.log('[QUICK SALE] updating stock');
    // 1. Calculate stock deductions
    const nextProducts = products.map((p) => {
      const cartMatch = cart.find((c) => c.product.id === p.id);
      if (cartMatch) {
        const current = Number(p.currentStock) || 0;
        const deduct = Number(cartMatch.quantity) || 1;
        const newStock = Math.max(0, current - deduct);
        let newStatus: Product['status'] = 'active';
        if (newStock === 0) newStatus = 'out_of_stock';
        else if (newStock <= (Number(p.minStockAlert) || 5)) newStatus = 'low';

        return { ...p, currentStock: newStock, status: newStatus };
      }
      return p;
    });

    // 2. Calculate updated customers
    let nextCustomers = customers;
    if (saleData.customerId) {
      nextCustomers = customers.map((c) => {
        if (c.id === saleData.customerId) {
          const currentSpent = Number(c.totalSpent) || 0;
          const currentDue = Number(c.dueAmount) || 0;
          const currentCount = Number(c.lifetimePurchasesCount) || 0;
          return {
            ...c,
            totalSpent: currentSpent + grandTotal,
            dueAmount: currentDue + dueAmount,
            lifetimePurchasesCount: currentCount + 1,
          };
        }
        return c;
      });
    }

    const nextSales = [newSale, ...sales];

    // Update local React state and storage IMMEDIATELY
    setProducts(nextProducts);
    setCustomers(nextCustomers);
    setSales(nextSales);
    const uid = user?.id || auth.currentUser?.uid;
    try {
      localStorage.setItem('biz_products', JSON.stringify(nextProducts));
      if (uid) localStorage.setItem(`biz_products_${uid}`, JSON.stringify(nextProducts));
      localStorage.setItem('biz_sales', JSON.stringify(nextSales));
      if (uid) localStorage.setItem(`biz_sales_${uid}`, JSON.stringify(nextSales));
      localStorage.setItem('biz_customers', JSON.stringify(nextCustomers));
      if (uid) localStorage.setItem(`biz_customers_${uid}`, JSON.stringify(nextCustomers));
    } catch (e) {}

    // Update local IndexedDB storage
    if (uid) {
      offlineDb.setCollection(uid, 'sales', nextSales).catch(() => {});
      offlineDb.setCollection(uid, 'products', nextProducts).catch(() => {});
      offlineDb.setCollection(uid, 'customers', nextCustomers).catch(() => {});
    }

    clearCart();
    logActivity('Completed POS Sale', 'নতুন বিক্রয় ইনভয়েস সম্পন্ন', `${invoiceNo} - Total: ৳${grandTotal}`);

    // Enqueue operation in robust Offline Sync Queue
    if (uid) {
      syncQueueService
        .enqueue('CREATE_SALE', {
          sale: newSale,
          products: nextProducts,
          customers: nextCustomers,
        })
        .catch((err) => {
          console.warn('[SyncQueue] Notice enqueuing sale:', err);
        });
    }

    return newSale;
  };

  // Sync categories and brands to localStorage
  useEffect(() => {
    localStorage.setItem('biz_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('biz_brands', JSON.stringify(brands));
  }, [brands]);

  // Categories & Brands CRUD Methods
  const addCategory = async (name: string, description?: string): Promise<void> => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const exists = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      description: description || '',
      productCount: 0,
    };
    const next = [...categories, newCat];
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'categories', { items: next });
    }
    setCategories(next);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const next = categories.filter((c) => c.id !== id);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'categories', { items: next });
    }
    setCategories(next);
  };

  const addBrand = async (name: string, description?: string): Promise<void> => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const exists = brands.find((b) => b.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    const newBrand: Brand = {
      id: `brand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      description: description || '',
    };
    const next = [...brands, newBrand];
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'brands', { items: next });
    }
    setBrands(next);
  };

  const deleteBrand = async (id: string): Promise<void> => {
    const next = brands.filter((b) => b.id !== id);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'brands', { items: next });
    }
    setBrands(next);
  };

  // Product CRUD
  const addProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'status'>): Promise<Product> => {
    // Check product limits based on user.subscriptionPlan
    const plan = user?.subscriptionPlan || 'Free';
    const limit = (plan === 'Free' || plan === 'Starter') ? 10 : ((plan === 'Pro' || plan === 'Tier2') ? 25 : Infinity);
    if (products.length >= limit) {
      const msg = `Product limit reached for ${plan} Plan (${limit} products max). Please upgrade your subscription plan to add more products!`;
      alert(msg);
      throw new Error(msg);
    }

    // Auto add category & brand if new
    if (data.category) await addCategory(data.category);
    if (data.brand) await addBrand(data.brand);

    let status: Product['status'] = 'active';
    if (data.currentStock === 0) status = 'out_of_stock';
    else if (data.currentStock <= data.minStockAlert) status = 'low';

    const sku = (data.sku || '').trim() || generateUniqueSku(products);
    const barcode = (data.barcode || '').trim() || sku || generateUniqueBarcode(products);

    const newProd: Product = {
      ...data,
      sku,
      barcode,
      id: `prod-${Date.now()}`,
      status,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const nextProducts = [newProd, ...products];

    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      console.log(`[CloudSync] Persisting product ${newProd.name} to Firestore...`);
      await saveUserCloudCollection(uid, 'products', { items: nextProducts });
      console.log(`[CloudSync] Product ${newProd.name} persisted.`);
    }

    setProducts(nextProducts);
    try {
      localStorage.setItem('biz_products', JSON.stringify(nextProducts));
      if (uid) localStorage.setItem(`biz_products_${uid}`, JSON.stringify(nextProducts));
    } catch (e) {}

    logActivity('Added New Product', 'নতুন পণ্য যোগ করা হয়েছে', data.name);
    return newProd;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<void> => {
    const nextProducts = products.map((p) => {
      if (p.id === id) {
        const sku = (updatedFields.sku || p.sku || '').trim() || generateUniqueSku(products);
        const barcode = (updatedFields.barcode || p.barcode || '').trim() || sku;

        const merged = { ...p, ...updatedFields, sku, barcode };
        let status = merged.status;
        if (merged.currentStock === 0) status = 'out_of_stock';
        else if (merged.currentStock <= merged.minStockAlert) status = 'low';
        else status = 'active';

        return { ...merged, status };
      }
      return p;
    });

    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      console.log(`[CloudSync] Persisting updated product ${id} to Firestore...`);
      await saveUserCloudCollection(uid, 'products', { items: nextProducts });
      console.log(`[CloudSync] Product ${id} updated.`);
    }

    setProducts(nextProducts);
    try {
      localStorage.setItem('biz_products', JSON.stringify(nextProducts));
      if (uid) localStorage.setItem(`biz_products_${uid}`, JSON.stringify(nextProducts));
    } catch (e) {}

    logActivity('Updated Product', 'পণ্য এডিট করা হয়েছে', `ID: ${id}`);
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const nextProducts = products.filter((p) => p.id !== id);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      console.log(`[CloudSync] Persisting deleted product ${id} to Firestore...`);
      await saveUserCloudCollection(uid, 'products', { items: nextProducts });
      console.log(`[CloudSync] Product ${id} deleted.`);
    }

    setProducts(nextProducts);
    try {
      localStorage.setItem('biz_products', JSON.stringify(nextProducts));
      if (uid) localStorage.setItem(`biz_products_${uid}`, JSON.stringify(nextProducts));
    } catch (e) {}

    logActivity('Deleted Product', 'পণ্য মুছে ফেলা হয়েছে', `ID: ${id}`);
  };

  const clearAllProducts = async (): Promise<void> => {
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'products', { items: [] });
    }

    setProducts([]);
    setCart([]);
    try {
      localStorage.setItem('biz_products', JSON.stringify([]));
      if (uid) localStorage.setItem(`biz_products_${uid}`, JSON.stringify([]));
    } catch (e) {}

    logActivity('Cleared All Products', 'সকল টেস্ট প্রোডাক্ট মুছে ফেলা হয়েছে');
  };

  // Stock Adjustment
  const adjustStock = async (
    productId: string,
    quantityDelta: number,
    reason: string,
    type: 'addition' | 'reduction' | 'damage_writeoff' | 'audit_correction'
  ): Promise<void> => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newStock = Math.max(0, prod.currentStock + quantityDelta);
    let newStatus: Product['status'] = 'active';
    if (newStock === 0) newStatus = 'out_of_stock';
    else if (newStock <= prod.minStockAlert) newStatus = 'low';

    const nextProducts = products.map((p) =>
      p.id === productId ? { ...p, currentStock: newStock, status: newStatus } : p
    );

    const newAdj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      productId,
      productName: prod.name,
      type,
      quantity: quantityDelta,
      reason,
      date: new Date().toISOString().split('T')[0],
      adjustedBy: user ? user.ownerName : 'Admin',
    };
    const nextAdjustments = [newAdj, ...adjustments];

    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      console.log(`[CloudSync] Persisting stock adjustment for product ${productId} to Firestore...`);
      await saveUserCloudCollectionsBatch(uid, {
        products: { items: nextProducts },
        adjustments: { items: nextAdjustments },
      });
      console.log(`[CloudSync] Stock adjustment persisted.`);
    }

    setProducts(nextProducts);
    setAdjustments(nextAdjustments);
    try {
      localStorage.setItem('biz_products', JSON.stringify(nextProducts));
      if (uid) localStorage.setItem(`biz_products_${uid}`, JSON.stringify(nextProducts));
    } catch (e) {}

    logActivity('Stock Adjusted', 'স্টক পরিবর্তন করা হয়েছে', `${prod.name} (${quantityDelta > 0 ? '+' : ''}${quantityDelta})`);
  };

  // Customers & Suppliers
  const addCustomer = async (custData: Omit<Customer, 'id' | 'createdAt' | 'dueAmount' | 'totalSpent' | 'lifetimePurchasesCount'>): Promise<Customer> => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      dueAmount: 0,
      totalSpent: 0,
      lifetimePurchasesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const nextCustomers = [newCust, ...customers];

    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'customers', { items: nextCustomers });
    }

    setCustomers(nextCustomers);
    try {
      localStorage.setItem('biz_customers', JSON.stringify(nextCustomers));
      if (uid) localStorage.setItem(`biz_customers_${uid}`, JSON.stringify(nextCustomers));
    } catch (e) {}

    logActivity('Added Customer', 'নতুন গ্রাহক যোগ করা হয়েছে', custData.name);
    return newCust;
  };

  const updateCustomer = async (id: string, custData: Partial<Customer>): Promise<void> => {
    const nextCustomers = customers.map((c) => (c.id === id ? { ...c, ...custData } : c));
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'customers', { items: nextCustomers });
    }

    setCustomers(nextCustomers);
    try {
      localStorage.setItem('biz_customers', JSON.stringify(nextCustomers));
      if (uid) localStorage.setItem(`biz_customers_${uid}`, JSON.stringify(nextCustomers));
    } catch (e) {}

    logActivity('Updated Customer', 'গ্রাহকের তথ্য আপডেট করা হয়েছে', `ID: ${id}`);
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    const nextCustomers = customers.filter((c) => c.id !== id);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'customers', { items: nextCustomers });
    }

    setCustomers(nextCustomers);
    try {
      localStorage.setItem('biz_customers', JSON.stringify(nextCustomers));
      if (uid) localStorage.setItem(`biz_customers_${uid}`, JSON.stringify(nextCustomers));
    } catch (e) {}

    logActivity('Deleted Customer', 'গ্রাহক মুছে ফেলা হয়েছে', `ID: ${id}`);
  };

  const addSupplier = async (suppData: Omit<Supplier, 'id' | 'createdAt' | 'dueAmount' | 'totalPurchasesCount'>): Promise<Supplier> => {
    const newSupp: Supplier = {
      ...suppData,
      id: `supp-${Date.now()}`,
      dueAmount: 0,
      totalPurchasesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const nextSuppliers = [newSupp, ...suppliers];
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'suppliers', { items: nextSuppliers });
    }

    setSuppliers(nextSuppliers);
    try {
      localStorage.setItem('biz_suppliers', JSON.stringify(nextSuppliers));
      if (uid) localStorage.setItem(`biz_suppliers_${uid}`, JSON.stringify(nextSuppliers));
    } catch (e) {}

    logActivity('Added Supplier', 'নতুন সরবরাহকারী যোগ করা হয়েছে', suppData.name);
    return newSupp;
  };

  const updateSupplier = async (id: string, suppData: Partial<Supplier>): Promise<void> => {
    const nextSuppliers = suppliers.map((s) => (s.id === id ? { ...s, ...suppData } : s));
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'suppliers', { items: nextSuppliers });
    }

    setSuppliers(nextSuppliers);
    try {
      localStorage.setItem('biz_suppliers', JSON.stringify(nextSuppliers));
      if (uid) localStorage.setItem(`biz_suppliers_${uid}`, JSON.stringify(nextSuppliers));
    } catch (e) {}

    logActivity('Updated Supplier', 'সরবরাহকারী তথ্য আপডেট করা হয়েছে', `ID: ${id}`);
  };

  const deleteSupplier = async (id: string): Promise<void> => {
    const nextSuppliers = suppliers.filter((s) => s.id !== id);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'suppliers', { items: nextSuppliers });
    }

    setSuppliers(nextSuppliers);
    try {
      localStorage.setItem('biz_suppliers', JSON.stringify(nextSuppliers));
      if (uid) localStorage.setItem(`biz_suppliers_${uid}`, JSON.stringify(nextSuppliers));
    } catch (e) {}

    logActivity('Deleted Supplier', 'সরবরাহকারী মুছে ফেলা হয়েছে', `ID: ${id}`);
  };

  const resetAllDataToZero = async (): Promise<void> => {
    setProducts([]);
    setCustomers([]);
    setSuppliers([]);
    setSales([]);
    setExpenses([]);
    setPurchases([]);
    setCart([]);
    setDueCollections([]);
    setInvestments([]);
    setCapitalWithdrawals([]);
    setAdjustments([]);
    setTeamMembers([]);
    setEmployees([]);
    setPayrollPayments([]);
    setSalaryAdjustments([]);
    setGeneratedProductCodes([]);
    setProductQRCounts({});
    localStorage.setItem('biz_products', JSON.stringify([]));
    localStorage.setItem('biz_customers', JSON.stringify([]));
    localStorage.setItem('biz_suppliers', JSON.stringify([]));
    localStorage.setItem('biz_sales', JSON.stringify([]));
    localStorage.setItem('biz_expenses', JSON.stringify([]));
    localStorage.setItem('biz_purchases', JSON.stringify([]));
    localStorage.setItem('biz_investments', JSON.stringify([]));
    localStorage.setItem('biz_capital_withdrawals', JSON.stringify([]));
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'products', { items: [] });
      await saveUserCloudCollection(uid, 'sales', { items: [] });
      await saveUserCloudCollection(uid, 'customers', { items: [] });
      await saveUserCloudCollection(uid, 'suppliers', { items: [] });
      await saveUserCloudCollection(uid, 'expenses', { items: [] });
      await saveUserCloudCollection(uid, 'purchases', { items: [] });
      await saveUserCloudCollection(uid, 'investments', { items: [] });
      await saveUserCloudCollection(uid, 'capitalWithdrawals', { items: [] });
      await saveUserCloudCollection(uid, 'adjustments', { items: [] });
      await saveUserCloudCollection(uid, 'dueCollections', { items: [] });
      await saveUserCloudCollection(uid, 'team', { items: [] });
      await saveUserCloudCollection(uid, 'payroll', { employees: [], payments: [], adjustments: [] });
      await saveUserCloudCollection(uid, 'qrTracking', { generatedCodes: [], productQRCounts: {} });
    }
    logActivity('Reset All Data', 'সকল ডাটা ০ তে রিসেট করা হয়েছে');
  };

  const loadSampleDemoData = async (): Promise<void> => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setExpenses(initialExpenses);
    setPurchases(initialPurchases);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'products', { items: initialProducts });
      await saveUserCloudCollection(uid, 'sales', { items: initialSales });
      await saveUserCloudCollection(uid, 'customers', { items: initialCustomers });
      await saveUserCloudCollection(uid, 'suppliers', { items: initialSuppliers });
      await saveUserCloudCollection(uid, 'expenses', { items: initialExpenses });
      await saveUserCloudCollection(uid, 'purchases', { items: initialPurchases });
    }
    logActivity('Loaded Demo Data', 'স্যাম্পল ডেমো ডাটা লোড করা হয়েছে');
  };

  // Expenses & Purchases
  const addExpense = async (expData: Omit<Expense, 'id'>): Promise<Expense> => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
    };
    const next = [newExp, ...expenses];
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'expenses', { items: next });
    }

    setExpenses(next);
    try {
      localStorage.setItem('biz_expenses', JSON.stringify(next));
      if (uid) localStorage.setItem(`biz_expenses_${uid}`, JSON.stringify(next));
    } catch (e) {}

    logActivity('Added Expense', 'নতুন খরচ এন্ট্রি করা হয়েছে', `${expData.title} (৳${expData.amount})`);
    return newExp;
  };

  const addPurchase = async (pData: Omit<Purchase, 'id' | 'purchaseNo'>): Promise<Purchase> => {
    const purchaseNo = `PUR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newPurchase: Purchase = {
      ...pData,
      id: `pur-${Date.now()}`,
      purchaseNo,
    };

    // Auto increase stock for purchased items
    let nextProducts = [...products];
    pData.items.forEach((item) => {
      nextProducts = nextProducts.map((p) => {
        if (p.id === item.productId) {
          const newStock = p.currentStock + item.quantity;
          let status = p.status;
          if (newStock === 0) status = 'out_of_stock';
          else if (newStock <= p.minStockAlert) status = 'low';
          else status = 'active';

          return { ...p, currentStock: newStock, buyingPrice: item.buyingPrice, status };
        }
        return p;
      });
    });

    // Update supplier due
    let nextSuppliers = suppliers;
    if (pData.supplierId) {
      nextSuppliers = suppliers.map((s) => {
        if (s.id === pData.supplierId) {
          return {
            ...s,
            dueAmount: s.dueAmount + pData.dueAmount,
            totalPurchasesCount: s.totalPurchasesCount + 1,
          };
        }
        return s;
      });
    }

    const nextPurchases = [newPurchase, ...purchases];

    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      console.log(`[CloudSync] Persisting purchase ${purchaseNo} to Firestore...`);
      await saveUserCloudCollectionsBatch(uid, {
        products: { items: nextProducts },
        suppliers: { items: nextSuppliers },
        purchases: { items: nextPurchases },
      });
      console.log(`[CloudSync] Purchase ${purchaseNo} persisted.`);
    }

    setProducts(nextProducts);
    setSuppliers(nextSuppliers);
    setPurchases(nextPurchases);
    try {
      localStorage.setItem('biz_products', JSON.stringify(nextProducts));
      if (uid) localStorage.setItem(`biz_products_${uid}`, JSON.stringify(nextProducts));
      localStorage.setItem('biz_purchases', JSON.stringify(nextPurchases));
      if (uid) localStorage.setItem(`biz_purchases_${uid}`, JSON.stringify(nextPurchases));
      localStorage.setItem('biz_suppliers', JSON.stringify(nextSuppliers));
      if (uid) localStorage.setItem(`biz_suppliers_${uid}`, JSON.stringify(nextSuppliers));
    } catch (e) {}

    logActivity('Recorded Purchase', 'নতুন পারচেজ এন্ট্রি করা হয়েছে', `${purchaseNo} - Supplier: ${pData.supplierName}`);
    return newPurchase;
  };

  // Due Collection
  const collectDue = async (data: {
    type: 'customer' | 'supplier';
    entityId: string;
    amountPaid: number;
    paymentMethod: string;
    note?: string;
  }): Promise<DueCollection | undefined> => {
    const uid = user?.id || auth.currentUser?.uid;
    if (data.type === 'customer') {
      const target = customers.find((c) => c.id === data.entityId);
      if (!target) return;

      const previousDue = target.dueAmount;
      const remainingDue = Math.max(0, previousDue - data.amountPaid);

      const nextCustomers = customers.map((c) => (c.id === data.entityId ? { ...c, dueAmount: remainingDue } : c));

      const record: DueCollection = {
        id: `due-rec-${Date.now()}`,
        type: 'customer',
        entityId: data.entityId,
        entityName: target.name,
        amountPaid: data.amountPaid,
        previousDue,
        remainingDue,
        date: new Date().toISOString(),
        paymentMethod: data.paymentMethod,
        note: data.note,
        collectedBy: user ? user.ownerName : 'Admin',
      };
      const nextDueCollections = [record, ...dueCollections];

      if (uid) {
        await saveUserCloudCollectionsBatch(uid, {
          customers: { items: nextCustomers },
          dueCollections: { items: nextDueCollections },
        });
      }

      setCustomers(nextCustomers);
      setDueCollections(nextDueCollections);
      try {
        localStorage.setItem('biz_customers', JSON.stringify(nextCustomers));
        if (uid) localStorage.setItem(`biz_customers_${uid}`, JSON.stringify(nextCustomers));
      } catch (e) {}

      logActivity('Collected Customer Due', 'গ্রাহকের বকেয়া আদায় করা হয়েছে', `${target.name}: ৳${data.amountPaid}`);
      return record;
    } else {
      const target = suppliers.find((s) => s.id === data.entityId);
      if (!target) return;

      const previousDue = target.dueAmount;
      const remainingDue = Math.max(0, previousDue - data.amountPaid);

      const nextSuppliers = suppliers.map((s) => (s.id === data.entityId ? { ...s, dueAmount: remainingDue } : s));

      const record: DueCollection = {
        id: `due-rec-${Date.now()}`,
        type: 'supplier',
        entityId: data.entityId,
        entityName: target.name,
        amountPaid: data.amountPaid,
        previousDue,
        remainingDue,
        date: new Date().toISOString(),
        paymentMethod: data.paymentMethod,
        note: data.note,
        collectedBy: user ? user.ownerName : 'Admin',
      };
      const nextDueCollections = [record, ...dueCollections];

      if (uid) {
        await saveUserCloudCollectionsBatch(uid, {
          suppliers: { items: nextSuppliers },
          dueCollections: { items: nextDueCollections },
        });
      }

      setSuppliers(nextSuppliers);
      setDueCollections(nextDueCollections);
      try {
        localStorage.setItem('biz_suppliers', JSON.stringify(nextSuppliers));
        if (uid) localStorage.setItem(`biz_suppliers_${uid}`, JSON.stringify(nextSuppliers));
      } catch (e) {}

      logActivity('Paid Supplier Due', 'সরবরাহকারীকে বকেয়া পরিশোধ', `${target.name}: ৳${data.amountPaid}`);
      return record;
    }
  };

  // Capital & Investment Management
  const addInvestment = async (invData: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Investment> => {
    const newInv: Investment = {
      ...invData,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [newInv, ...investments];
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'investments', { items: next });
    }

    setInvestments(next);
    try {
      localStorage.setItem('biz_investments', JSON.stringify(next));
      if (uid) localStorage.setItem(`biz_investments_${uid}`, JSON.stringify(next));
    } catch (e) {}

    logActivity('Added Investment', 'নতুন বিনিয়োগ যোগ করা হয়েছে', `${invData.investorName}: ৳${invData.amount}`);
    return newInv;
  };

  const updateInvestment = async (id: string, invData: Partial<Investment>): Promise<void> => {
    const next = investments.map((item) =>
      item.id === id ? { ...item, ...invData, updatedAt: new Date().toISOString() } : item
    );
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'investments', { items: next });
    }

    setInvestments(next);
    try {
      localStorage.setItem('biz_investments', JSON.stringify(next));
      if (uid) localStorage.setItem(`biz_investments_${uid}`, JSON.stringify(next));
    } catch (e) {}

    logActivity('Updated Investment', 'বিনিয়োগ তথ্য আপডেট করা হয়েছে', `ID: ${id}`);
  };

  const deleteInvestment = async (id: string): Promise<void> => {
    const next = investments.filter((item) => item.id !== id);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'investments', { items: next });
    }

    setInvestments(next);
    try {
      localStorage.setItem('biz_investments', JSON.stringify(next));
      if (uid) localStorage.setItem(`biz_investments_${uid}`, JSON.stringify(next));
    } catch (e) {}

    logActivity('Deleted Investment', 'বিনিয়োগ রেকর্ড মুছে ফেলা হয়েছে', `ID: ${id}`);
  };

  const addCapitalWithdrawal = async (
    wData: Omit<CapitalWithdrawal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CapitalWithdrawal> => {
    const newWithdrawal: CapitalWithdrawal = {
      ...wData,
      id: `cap-wth-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [newWithdrawal, ...capitalWithdrawals];
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'capitalWithdrawals', { items: next });
    }

    setCapitalWithdrawals(next);
    try {
      localStorage.setItem('biz_capital_withdrawals', JSON.stringify(next));
      if (uid) localStorage.setItem(`biz_capital_withdrawals_${uid}`, JSON.stringify(next));
    } catch (e) {}

    logActivity('Withdrew Capital', 'মূলধন উত্তোলন রেকর্ড করা হয়েছে', `৳${wData.amount} - ${wData.reason}`);
    return newWithdrawal;
  };

  const updateCapitalWithdrawal = async (id: string, wData: Partial<CapitalWithdrawal>): Promise<void> => {
    const next = capitalWithdrawals.map((item) =>
      item.id === id ? { ...item, ...wData, updatedAt: new Date().toISOString() } : item
    );
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'capitalWithdrawals', { items: next });
    }

    setCapitalWithdrawals(next);
    try {
      localStorage.setItem('biz_capital_withdrawals', JSON.stringify(next));
      if (uid) localStorage.setItem(`biz_capital_withdrawals_${uid}`, JSON.stringify(next));
    } catch (e) {}

    logActivity('Updated Capital Withdrawal', 'মূলধন উত্তোলন তথ্য আপডেট করা হয়েছে', `ID: ${id}`);
  };

  const deleteCapitalWithdrawal = async (id: string): Promise<void> => {
    const next = capitalWithdrawals.filter((item) => item.id !== id);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      await saveUserCloudCollection(uid, 'capitalWithdrawals', { items: next });
    }

    setCapitalWithdrawals(next);
    try {
      localStorage.setItem('biz_capital_withdrawals', JSON.stringify(next));
      if (uid) localStorage.setItem(`biz_capital_withdrawals_${uid}`, JSON.stringify(next));
    } catch (e) {}

    logActivity('Deleted Capital Withdrawal', 'মূলধন উত্তোলন রেকর্ড মুছে ফেলা হয়েছে', `ID: ${id}`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    const uid = user?.id || auth.currentUser?.uid;
    const nextReadMap: Record<string, boolean> = { ...readNotificationIds, [id]: true };
    const updatedManual = manualNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));

    // 1. Immediately update React state for instant UI update & unread count badge reset
    setReadNotificationIds(nextReadMap);
    setManualNotifications(updatedManual);

    // 2. Persist to localStorage for current user
    const storageKey = 'biz_read_notifs_' + (uid || 'default');
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextReadMap));
      localStorage.setItem('biz_manual_notifications', JSON.stringify(updatedManual));
    } catch (e) {}

    // 3. Persist to Firestore backend (businessData/notifications + users doc backup)
    if (uid) {
      saveUserCloudCollection(uid, 'notifications', {
        manual: updatedManual,
        readMap: nextReadMap,
      }).catch((err) => {
        console.warn('[Notification] Cloud sync save notice:', err);
      });

      try {
        updateDoc(doc(db, 'users', uid), {
          [`readNotificationIds.${id}`]: true,
        }).catch(() => {});
      } catch (err) {}
    }
  };

  const markAllNotificationsRead = () => {
    const uid = user?.id || auth.currentUser?.uid;
    const nextReadMap: Record<string, boolean> = { ...readNotificationIds };

    // Mark every active notification as read in the map
    notifications.forEach((n) => {
      nextReadMap[n.id] = true;
    });
    manualNotifications.forEach((n) => {
      nextReadMap[n.id] = true;
    });

    const updatedManual = manualNotifications.map((n) => ({ ...n, read: true }));

    // 1. Immediately update state for instant 0 badge count & instant read styling
    setReadNotificationIds(nextReadMap);
    setManualNotifications(updatedManual);

    // 2. Persist to localStorage for current user
    const storageKey = 'biz_read_notifs_' + (uid || 'default');
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextReadMap));
      localStorage.setItem('biz_manual_notifications', JSON.stringify(updatedManual));
    } catch (e) {}

    // 3. Cloud Firestore persistence (businessData/notifications + users doc)
    if (uid) {
      saveUserCloudCollection(uid, 'notifications', {
        manual: updatedManual,
        readMap: nextReadMap,
      }).then(() => {
        console.log('[Notification] Successfully marked all notifications as read in cloud.');
      }).catch((err) => {
        console.warn('[Notification] Cloud sync save notice:', err);
      });

      try {
        updateDoc(doc(db, 'users', uid), {
          readNotificationIds: nextReadMap,
        }).catch(() => {});
      } catch (err) {}
    }
  };

  // Backup & Export
  const exportDataJSON = () => {
    const backupObj = {
      exportDate: new Date().toISOString(),
      user,
      settings,
      products,
      categories,
      brands,
      customers,
      suppliers,
      expenses,
      sales,
      purchases,
      dueCollections,
      investments,
      capitalWithdrawals,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products && Array.isArray(parsed.products)) setProducts(parsed.products);
      if (parsed.customers && Array.isArray(parsed.customers)) setCustomers(parsed.customers);
      if (parsed.suppliers && Array.isArray(parsed.suppliers)) setSuppliers(parsed.suppliers);
      if (parsed.expenses && Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (parsed.sales && Array.isArray(parsed.sales)) setSales(parsed.sales);
      if (parsed.purchases && Array.isArray(parsed.purchases)) setPurchases(parsed.purchases);
      if (parsed.investments && Array.isArray(parsed.investments)) setInvestments(parsed.investments);
      if (parsed.capitalWithdrawals && Array.isArray(parsed.capitalWithdrawals)) setCapitalWithdrawals(parsed.capitalWithdrawals);
      logActivity('Imported Database Backup', 'ডাটাবেজ ব্যাকআপ ইমপোর্ট করা হয়েছে');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const saveDevices = async (updated: EmployeeDevice[]) => {
    setDevices(updated);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`biz_devices_${uid}`, JSON.stringify(updated));
      await saveUserCloudCollection(uid, 'devices', { items: updated });
    }
  };

  const currentDeviceId = getOrCreateDeviceId();
  const currentDevice = devices.find((d) => d.deviceId === currentDeviceId) || null;

  const isCurrentDeviceAuthorized =
    !user ||
    user?.role === 'Owner' ||
    user?.role === 'owner' ||
    user?.role === 'Manager' ||
    user?.role === 'manager' ||
    user?.role === 'Admin' ||
    user?.role === 'admin' ||
    user?.subscriptionPlan === 'Lifetime' ||
    (currentDevice ? currentDevice.status === 'Approved' : false);

  const requestDeviceAuthorization = async (params?: { deviceName?: string; notes?: string }): Promise<EmployeeDevice> => {
    const devInfo = getCurrentDeviceInfo();
    const customName = params?.deviceName || devInfo.deviceName;
    if (params?.deviceName) {
      setLocalDeviceName(params.deviceName);
    }
    const existingIndex = devices.findIndex((d) => d.deviceId === devInfo.deviceId);
    const isOwner = user?.role === 'Owner' || user?.role === 'owner';
    const newDevice: EmployeeDevice = {
      id: existingIndex >= 0 ? devices[existingIndex].id : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      deviceId: devInfo.deviceId,
      deviceName: customName,
      employeeId: user?.id || 'unknown',
      employeeName: user?.ownerName || user?.fullName || user?.email || 'Employee',
      employeeEmail: user?.email || '',
      employeeRole: user?.role || 'Staff',
      deviceType: devInfo.deviceType,
      browser: devInfo.browser,
      os: devInfo.os,
      screenResolution: devInfo.screenResolution,
      status: isOwner ? 'Approved' : 'Pending',
      requestedAt: existingIndex >= 0 ? devices[existingIndex].requestedAt : new Date().toISOString(),
      approvedAt: isOwner ? new Date().toISOString() : (existingIndex >= 0 ? devices[existingIndex].approvedAt : undefined),
      approvedBy: isOwner ? (user?.ownerName || 'Owner') : undefined,
      lastActiveAt: new Date().toISOString(),
      notes: params?.notes || (existingIndex >= 0 ? devices[existingIndex].notes : ''),
    };

    const nextDevices = existingIndex >= 0
      ? devices.map((d, i) => i === existingIndex ? newDevice : d)
      : [newDevice, ...devices];

    setDevices(nextDevices);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`biz_devices_${uid}`, JSON.stringify(nextDevices));
      await saveUserCloudCollection(uid, 'devices', { items: nextDevices });
    }
    return newDevice;
  };

  const approveDevice = async (deviceIdToApprove: string): Promise<void> => {
    const approver = user?.ownerName || user?.fullName || user?.email || 'Owner';
    const nextDevices = devices.map((d) =>
      d.deviceId === deviceIdToApprove || d.id === deviceIdToApprove
        ? {
            ...d,
            status: 'Approved' as const,
            approvedAt: new Date().toISOString(),
            approvedBy: approver,
            rejectionReason: undefined,
          }
        : d
    );
    setDevices(nextDevices);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`biz_devices_${uid}`, JSON.stringify(nextDevices));
      await saveUserCloudCollection(uid, 'devices', { items: nextDevices });
    }
    logActivity('Approved Device Access', 'ডিভাইস অ্যাক্সেস অনুমোদন করা হয়েছে', deviceIdToApprove);
  };

  const revokeDevice = async (deviceIdToRevoke: string, reason?: string): Promise<void> => {
    const nextDevices = devices.map((d) =>
      d.deviceId === deviceIdToRevoke || d.id === deviceIdToRevoke
        ? {
            ...d,
            status: 'Revoked' as const,
            rejectionReason: reason || 'Access revoked by store owner',
          }
        : d
    );
    setDevices(nextDevices);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`biz_devices_${uid}`, JSON.stringify(nextDevices));
      await saveUserCloudCollection(uid, 'devices', { items: nextDevices });
    }
    logActivity('Revoked Device Access', 'ডিভাইস অ্যাক্সেস বাতিল করা হয়েছে', deviceIdToRevoke);
  };

  const deleteDevice = async (deviceIdToDelete: string): Promise<void> => {
    const nextDevices = devices.filter((d) => d.deviceId !== deviceIdToDelete && d.id !== deviceIdToDelete);
    setDevices(nextDevices);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`biz_devices_${uid}`, JSON.stringify(nextDevices));
      await saveUserCloudCollection(uid, 'devices', { items: nextDevices });
    }
    logActivity('Deleted Device Record', 'ডিভাইস রেকর্ড মুছে ফেলা হয়েছে', deviceIdToDelete);
  };

  const renameDevice = async (deviceIdToRename: string, newName: string): Promise<void> => {
    const nextDevices = devices.map((d) =>
      d.deviceId === deviceIdToRename || d.id === deviceIdToRename
        ? { ...d, deviceName: newName.trim() }
        : d
    );
    setDevices(nextDevices);
    const uid = user?.id || auth.currentUser?.uid;
    if (uid) {
      localStorage.setItem(`biz_devices_${uid}`, JSON.stringify(nextDevices));
      await saveUserCloudCollection(uid, 'devices', { items: nextDevices });
    }
    if (deviceIdToRename === currentDeviceId) {
      setLocalDeviceName(newName.trim());
    }
  };

  // Calculations for Metrics
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySalesArr = sales.filter((s) => s.date.startsWith(todayStr));
  const todaySales = todaySalesArr.reduce((acc, s) => acc + s.total, 0);

  // ONLY new due created today from today's sales (previous dues and paid dues excluded)
  const todayDue = todaySalesArr.reduce((acc, s) => acc + (Number(s.dueAmount) || 0), 0);

  const todayPurchasesArr = purchases.filter((p) => p.date.startsWith(todayStr));
  const todayDueSuppliers = todayPurchasesArr.reduce((acc, p) => acc + (Number(p.dueAmount) || 0), 0);

  const todayBuyingCost = todaySalesArr.reduce((acc, s) => {
    const itemsBuyingTotal = s.items.reduce((sum, item) => sum + item.buyingPrice * item.quantity, 0);
    return acc + itemsBuyingTotal;
  }, 0);

  const todayGrossProfit = todaySales - todayBuyingCost;

  const todayExpense = expenses
    .filter((e) => e.date.startsWith(todayStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const todayNetResult = todayGrossProfit - todayExpense;
  const todayProfit = todayNetResult > 0 ? todayNetResult : 0;
  const todayLoss = todayNetResult < 0 ? Math.abs(todayNetResult) : 0;

  const totalStockQty = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalInventoryCostValue = products.reduce((acc, p) => acc + p.buyingPrice * p.currentStock, 0);
  const totalInventorySellingValue = products.reduce((acc, p) => acc + p.sellingPrice * p.currentStock, 0);

  const totalDueCustomers = customers.reduce((acc, c) => acc + c.dueAmount, 0);
  const totalDueSuppliers = suppliers.reduce((acc, s) => acc + s.dueAmount, 0);

  const currentMonthStr = todayStr.substring(0, 7);
  const monthSalesArr = sales.filter((s) => s.date.startsWith(currentMonthStr));
  const monthlySales = monthSalesArr.reduce((acc, s) => acc + s.total, 0);
  const monthlyExpense = expenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const monthBuyingCost = monthSalesArr.reduce((acc, s) => {
    return acc + s.items.reduce((sum, i) => sum + i.buyingPrice * i.quantity, 0);
  }, 0);

  const monthGrossProfit = monthlySales - monthBuyingCost;
  const monthNetResult = monthGrossProfit - monthlyExpense;
  const monthlyProfit = monthNetResult > 0 ? monthNetResult : 0;
  const monthlyLoss = monthNetResult < 0 ? Math.abs(monthNetResult) : 0;

  const totalRevenueAllTime = sales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenseAllTime = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalBalance = Math.max(0, totalRevenueAllTime - totalExpenseAllTime);

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;

  const expiredCount = products.filter((p) => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < new Date();
  }).length;

  // Capital & Investment calculations (kept strictly isolated from sales, expenses, and profit/loss)
  const totalInvestedCapital = investments.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
  const totalWithdrawnCapital = capitalWithdrawals.reduce((acc, w) => acc + (Number(w.amount) || 0), 0);
  const currentCapital = totalInvestedCapital - totalWithdrawnCapital;
  const investmentCount = investments.length;
  const withdrawalCount = capitalWithdrawals.length;

  // Update Dashboard Customization Preferences
  const updateDashboardPreferences = async (newPrefs: Partial<DashboardPreferences>) => {
    const updated: DashboardPreferences = {
      ...dashboardPreferences,
      ...newPrefs,
    };
    setDashboardPreferences(updated);
    localStorage.setItem('biz_dashboard_preferences', JSON.stringify(updated));
    if (user?.id) {
      localStorage.setItem(`biz_dashboard_preferences_${user.id}`, JSON.stringify(updated));
      setUser((prev) => (prev ? { ...prev, dashboardPreferences: updated } : prev));
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { dashboardPreferences: updated });
      } catch (err) {
        console.warn('Could not save dashboardPreferences to Firestore:', err);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isEmailVerified,
        login,
        signup,
        sendVerificationOtp,
        verifyEmailOtp,
        resendEmailVerification,
        checkEmailVerification,
        logout,
        updateProfile,
        updateUser,
        uploadProfilePhoto,
        removeProfilePhoto,
        allUsers,
        updateUserRole,
        sendFirebasePasswordReset,
        suspendUser,
        activateUser,
        blockUser,
        unblockUser,
        deleteUser,
        resetUserPassword,
        updateUserPlan,
        updateUserData,
        refreshUsers,
        subscriptionRequests,
        requestSubscription,
        activateUserSubscription,
        calculateSubscriptionExpiry,
        approveSubscriptionRequest,
        rejectSubscriptionRequest,
        cancelSubscriptionRequest,
        cancelUserSubscription,
        settings,
        updateSettings,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        t,
        formatNumber,
        formatCurrency,
        formatMoney,
        convertMoney,
        getExchangeRate,
        storeBaseCurrency,
        displayCurrency,
        displayCurrencySymbol,
        exchangeRates,
        isExchangeRatesLoading,
        formatDate,
        dashboardPreferences,
        updateDashboardPreferences,
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,
        products,
        categories,
        brands,
        addCategory,
        deleteCategory,
        addBrand,
        deleteBrand,
        customers,
        suppliers,
        expenses,
        sales,
        purchases,
        notifications,
        activityLogs,
        adjustments,
        dueCollections,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkoutPOS,
        addProduct,
        updateProduct,
        deleteProduct,
        clearAllProducts,
        generatedProductCodes,
        recordGeneratedCode,
        isCodeGenerated,
        removeGeneratedCode,
        getGeneratedQRCount,
        recordGeneratedQRCodes,
        adjustStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        resetAllDataToZero,
        loadSampleDemoData,
        addExpense,
        addPurchase,
        investments,
        capitalWithdrawals,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        addCapitalWithdrawal,
        updateCapitalWithdrawal,
        deleteCapitalWithdrawal,
        collectDue,
        markNotificationRead,
        markAllNotificationsRead,
        exportDataJSON,
        importDataJSON,
        teamMembers,
        saveTeamMembers,
        devices,
        saveDevices,
        requestDeviceAuthorization,
        approveDevice,
        revokeDevice,
        deleteDevice,
        renameDevice,
        currentDeviceId,
        currentDevice,
        isCurrentDeviceAuthorized,
        employees,
        saveEmployees,
        payrollPayments,
        savePayrollPayments,
        salaryAdjustments,
        saveSalaryAdjustments,
        auditLogs,
        saveAuditLogs,
        loyaltySettings,
        saveLoyaltySettings,
        isCloudSynced,
        metrics: {
          todaySales,
          todayExpense,
          todayBuyingCost,
          todayGrossProfit,
          todayProfit,
          todayLoss,
          todayDue,
          todayDueSuppliers,
          totalBalance,
          totalStockQty,
          totalInventoryCostValue,
          totalInventorySellingValue,
          totalDueCustomers,
          totalDueSuppliers,
          monthlySales,
          monthlyExpense,
          monthBuyingCost,
          monthGrossProfit,
          monthlyProfit,
          monthlyLoss,
          lowStockCount,
          expiredCount,
          totalInvestedCapital,
          totalWithdrawnCapital,
          currentCapital,
          investmentCount,
          withdrawalCount,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
