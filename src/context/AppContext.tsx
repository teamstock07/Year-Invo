import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  sendPasswordResetEmail,
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
  UserRole,
} from '../types';
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
} from '../data/mockData';
import { translations } from '../i18n/translations';

interface AppContextType {
  // Auth & Profile
  user: UserProfile | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  signup: (data: Partial<UserProfile> & { password?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateUser: (data: Partial<UserProfile>) => void;

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
  updateUserPlan: (userId: string, newPlan: SubscriptionPlan) => void;
  updateUserData: (userId: string, data: Partial<UserProfile>) => void;
  refreshUsers: () => Promise<void>;

  // Subscription Approval System
  subscriptionRequests: SubscriptionRequest[];
  requestSubscription: (data: {
    requestedPlan: SubscriptionPlan;
    billingCycle: 'monthly' | 'yearly';
    paymentMethod: string;
    transactionId?: string;
    amount: number;
  }) => Promise<boolean>;
  approveSubscriptionRequest: (requestId: string) => Promise<void>;
  rejectSubscriptionRequest: (requestId: string, notes?: string) => Promise<void>;

  // Settings & Theme
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  t: (key: string) => string;

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
  }) => Sale;

  // Categories & Brands CRUD
  addCategory: (name: string, description?: string) => void;
  deleteCategory: (id: string) => void;
  addBrand: (name: string, description?: string) => void;
  deleteBrand: (id: string) => void;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  clearAllProducts: () => void;

  // Stock Actions
  adjustStock: (productId: string, quantityDelta: number, reason: string, type: 'addition' | 'reduction' | 'damage_writeoff' | 'audit_correction') => void;

  // Customers & Suppliers CRUD
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'dueAmount' | 'totalSpent' | 'lifetimePurchasesCount'>) => void;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (supp: Omit<Supplier, 'id' | 'createdAt' | 'dueAmount' | 'totalPurchasesCount'>) => void;
  deleteSupplier: (id: string) => void;
  resetAllDataToZero: () => void;
  loadSampleDemoData: () => void;

  // Expenses & Purchases
  addExpense: (exp: Omit<Expense, 'id'>) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'purchaseNo'>) => void;

  // Due Collection
  collectDue: (data: { type: 'customer' | 'supplier'; entityId: string; amountPaid: number; paymentMethod: string; note?: string }) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Backup
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Calculated Business Metrics
  metrics: {
    todaySales: number;
    todayExpense: number;
    todayBuyingCost: number;
    todayProfit: number;
    totalBalance: number;
    totalStockQty: number;
    totalInventoryCostValue: number;
    totalInventorySellingValue: number;
    totalDueCustomers: number;
    totalDueSuppliers: number;
    monthlySales: number;
    monthlyExpense: number;
    monthlyProfit: number;
    lowStockCount: number;
    expiredCount: number;
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
  // Saved language & theme
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('biz_language');
    return (saved as Language) || 'en';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('biz_theme');
    return (saved as ThemeMode) || 'dark';
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

  useEffect(() => {
    if (user) {
      localStorage.setItem('biz_user', JSON.stringify(user));
    } else {
      localStorage.setItem('biz_user', 'null');
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
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userRef);

          const userEmail = (firebaseUser.email || (docSnap.exists() ? docSnap.data()?.email : '') || '').toLowerCase();
          const isAdmin = isTeamStockAdmin(userEmail);

          if (docSnap.exists()) {
            const uData = docSnap.data();
            const roleRaw = uData.role || uData.roleName || 'Manager';
            const normalizedRole: UserRole = (isAdmin || roleRaw.toString().toLowerCase() === 'owner' || roleRaw.toString().toLowerCase() === 'admin' || roleRaw.toString().toLowerCase() === 'platformowner') ? 'Owner' : 'Manager';

            if (isAdmin && (uData.role !== 'owner' || uData.subscriptionPlan !== 'Lifetime')) {
              try {
                updateDoc(userRef, { role: 'owner', subscriptionPlan: 'Lifetime', subscription: 'lifetime' });
              } catch (e) {
                console.warn('Sync admin role notice:', e);
              }
            }

            if (uData.status === 'suspended' && !isAdmin) {
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

            const fsBrand = uData.brandName || uData.storeName || '';
            const effectiveBrandName = fsBrand && fsBrand !== 'My Store' ? fsBrand : (savedBrand || fsBrand || 'My Store');

            if (savedBrand && fsBrand !== savedBrand) {
              try {
                updateDoc(userRef, { brandName: savedBrand, storeName: savedBrand });
              } catch (e) {}
            }

            const profile: UserProfile = {
              id: firebaseUser.uid,
              brandName: effectiveBrandName,
              ownerName: uData.ownerName || uData.fullName || firebaseUser.displayName || 'Store Owner',
              mobile: uData.mobile || uData.phone || '',
              email: firebaseUser.email || uData.email || userEmail,
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
              verifiedEmail: true,
              verifiedPhone: true,
              createdAt: uData.createdAt ? (typeof uData.createdAt === 'string' ? uData.createdAt : new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
            };

            setUser(profile);
            if (profile.brandName) {
              setSettings((prev) => ({ ...prev, brandName: profile.brandName }));
            }
            if (normalizedRole === 'Owner') {
              setActiveTabState('owner');
            }
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
          const isAdmin = isTeamStockAdmin(uEmail) || uData.role === 'owner' || uData.role === 'Owner' || uData.role === 'admin' || uData.role === 'PlatformOwner';
          
          let normalizedRole: UserRole = 'Manager';
          if (isAdmin) {
            normalizedRole = 'Owner';
          } else if (uData.role === 'Staff' || uData.role === 'staff') {
            normalizedRole = 'Staff';
          } else if (uData.role === 'Accountant' || uData.role === 'accountant') {
            normalizedRole = 'Accountant';
          } else {
            normalizedRole = 'Manager';
          }

          const assignedPlan: SubscriptionPlan = isAdmin ? 'Lifetime' : ((uData.subscriptionPlan || uData.subscription || 'Free') as SubscriptionPlan);

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
            createdAt: createdDateStr,
            lastLogin: lastLoginStr,
            notes: uData.notes || '',
          });
        });
        setAllUsers(list);

        if (auth.currentUser) {
          const currentUid = auth.currentUser.uid;
          const currentInList = list.find((u) => u.id === currentUid);
          if (currentInList) {
            setUser((prev) => {
              if (!prev) return currentInList;
              if (prev.role !== currentInList.role || prev.status !== currentInList.status) {
                if (currentInList.role === 'Owner') {
                  setActiveTabState('owner');
                }
                return currentInList;
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
            transactionId: d.transactionId || '',
            amount: d.amount || 0,
            status: d.status || 'pending',
            requestDate: dateStr,
            reviewedDate: d.reviewedDate || '',
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

  // Main Data Repositories - Clean zero initialization for new system
  const isFreshVersion = localStorage.getItem('biz_fresh_zero_v2');
  if (!isFreshVersion) {
    localStorage.removeItem('biz_sales');
    localStorage.removeItem('biz_products');
    localStorage.removeItem('biz_customers');
    localStorage.removeItem('biz_suppliers');
    localStorage.removeItem('biz_expenses');
    localStorage.removeItem('biz_purchases');
    localStorage.removeItem('biz_user');
    localStorage.removeItem('biz_settings');
    localStorage.setItem('biz_fresh_zero_v2', 'true');
  }

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('biz_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('biz_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('biz_brands');
    return saved ? JSON.parse(saved) : initialBrands;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('biz_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('biz_suppliers');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('biz_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('biz_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('biz_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [dueCollections, setDueCollections] = useState<DueCollection[]>([]);

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

  // Language helper
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
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
  const login = async (emailInput: string, passInput: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !passInput) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    try {
      console.log('[Firebase Auth] Attempting signInWithEmailAndPassword...', { email: cleanEmail });
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passInput);
      const firebaseUser = userCredential.user;

      let docSnap;
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        docSnap = await getDoc(userRef);
      } catch (docErr) {
        console.warn('Could not fetch user document from Firestore directly:', docErr);
      }

      let foundUser: UserProfile;
      const isAdmin = isTeamStockAdmin(cleanEmail);

      if (docSnap && docSnap.exists()) {
        const uData = docSnap.data();
        const roleRaw = uData.role || uData.roleName || 'Manager';
        const normalizedRole: UserRole = (isAdmin || roleRaw.toString().toLowerCase() === 'owner' || roleRaw.toString().toLowerCase() === 'admin' || roleRaw.toString().toLowerCase() === 'platformowner') ? 'Owner' : 'Manager';

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
          ownerName: uData.ownerName || uData.fullName || firebaseUser.displayName || 'Store Owner',
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
          verifiedEmail: true,
          verifiedPhone: true,
          createdAt: uData.createdAt ? (typeof uData.createdAt === 'string' ? uData.createdAt : new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        };
      } else {
        foundUser = {
          id: firebaseUser.uid,
          brandName: 'My Store',
          ownerName: firebaseUser.displayName || cleanEmail.split('@')[0] || 'Store Owner',
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
          verifiedEmail: true,
          verifiedPhone: true,
          createdAt: new Date().toISOString().split('T')[0],
        };

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, {
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
            status: 'active',
            createdAt: serverTimestamp(),
          });
        } catch (setErr) {
          console.warn('Notice setting initial user document:', setErr);
        }
      }

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
      return { success: true };
    } catch (error: any) {
      console.error('Firebase Auth login error [Full Error]:', error);
      if (error && typeof error === 'object') {
        console.error('Firebase Error Code:', error.code, '| Message:', error.message, '| Full Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
      let message = 'Incorrect email or password.';
      if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is disabled in your Firebase Console. Please go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Incorrect email or password. If you have not created an account yet, please click "Need a new account? Sign Up Here" below to register.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.';
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, message };
    }
  };

  const signup = async (data: Partial<UserProfile> & { password?: string }): Promise<{ success: boolean; message?: string }> => {
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

      // 2. Prepare user document payload with required schema
      const fullName = data.ownerName || 'Store Owner';
      const storeName = data.brandName || 'My Store';
      const storeType = data.businessType || 'General Retail & Grocery';
      const phone = data.mobile || '';
      const address = data.storeAddress || '';
      const affiliateCode = data.affiliateCode || '';

      const isAdmin = isTeamStockAdmin(cleanEmail);
      const assignedRole: UserRole = isAdmin ? 'Owner' : 'Manager';
      const assignedPlan: SubscriptionPlan = isAdmin ? 'Lifetime' : 'Free';

      const userDocData = {
        uid: firebaseUser.uid,
        fullName,
        email: cleanEmail,
        storeName,
        storeType,
        phone,
        address,
        affiliateCode,
        role: isAdmin ? 'owner' : 'manager',
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

      // 3. Write document to users/{uid} in Firestore
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
        country: data.country || 'Bangladesh',
        currency: data.currency || '৳',
        timeZone: data.timeZone || 'Asia/Dhaka',
        role: assignedRole,
        subscriptionPlan: assignedPlan,
        subscriptionStatus: 'active',
        status: 'active',
        storeAddress: address,
        affiliateCode: affiliateCode,
        affiliateProgram: affiliateCode ? 'Mazbi Affiliate Program' : undefined,
        verifiedEmail: true,
        verifiedPhone: true,
        createdAt: new Date().toISOString().split('T')[0],
      };

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
      return { success: true };
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

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut notice:', e);
    }
    setUser(null);
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

  const updateUserData = (userId: string, data: Partial<UserProfile>) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (user && user.id === userId) {
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
      if (data.subscriptionPlan !== undefined) { fsData.subscriptionPlan = data.subscriptionPlan; fsData.subscription = data.subscriptionPlan.toLowerCase(); }
      if (data.status !== undefined) { fsData.status = data.status; }
      if (data.notes !== undefined) { fsData.notes = data.notes; }
      updateDoc(userRef, fsData);
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
        const isAdmin = isTeamStockAdmin(uEmail) || uData.role === 'owner' || uData.role === 'Owner' || uData.role === 'admin' || uData.role === 'PlatformOwner';
        let normalizedRole: UserRole = 'Manager';
        if (isAdmin) {
          normalizedRole = 'Owner';
        } else if (uData.role === 'Staff' || uData.role === 'staff') {
          normalizedRole = 'Staff';
        } else if (uData.role === 'Accountant' || uData.role === 'accountant') {
          normalizedRole = 'Accountant';
        } else {
          normalizedRole = 'Manager';
        }
        const assignedPlan: SubscriptionPlan = isAdmin ? 'Lifetime' : ((uData.subscriptionPlan || uData.subscription || 'Free') as SubscriptionPlan);

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

  const updateUserPlan = (userId: string, newPlan: SubscriptionPlan) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              subscriptionPlan: newPlan,
              subscriptionStatus: 'active',
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
        pendingPlan: undefined,
      });
    }
    logActivity('Directly Updated User Plan', 'ব্যবহারকারীর প্ল্যান রেনু/আপগ্রেড করা হয়েছে', `${userId} -> ${newPlan}`);
  };

  // Subscription Approval System Handlers
  const requestSubscription = async (data: {
    requestedPlan: SubscriptionPlan;
    billingCycle: 'monthly' | 'yearly';
    paymentMethod: string;
    transactionId?: string;
    amount: number;
  }): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be logged in to submit a request.');
    }

    const targetUid = user.id || user.uid || (auth.currentUser ? auth.currentUser.uid : '');
    const userEmail = user.email || (auth.currentUser ? auth.currentUser.email : '') || '';

    // Save document with exact fields required by prompt and UI
    const docData: Record<string, any> = {
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
      paymentMethod: data.paymentMethod || 'bKash',
      transactionId: data.transactionId ? String(data.transactionId).trim() : '',
      amount: typeof data.amount === 'number' ? data.amount : 0,
      status: 'pending',
      createdAt: serverTimestamp(),
      requestDate: new Date().toISOString(),
    };

    const subRequestsCollection = collection(db, 'subscriptionRequests');

    console.log('[Firestore Write Pre-check]');
    console.log('  - Firebase Project ID:', auth.app.options.projectId);
    console.log('  - Firestore Database:', '(default)');
    console.log('  - Collection Name: subscriptionRequests');
    console.log('  - Target UID:', targetUid);
    console.log('  - Write Payload:', docData);

    try {
      // 1. Write to subscriptionRequests using addDoc
      const docRef = await addDoc(subRequestsCollection, {
        ...docData,
        id: '', // Will be updated or populated below
      });

      console.log('[Firestore Write Success]');
      console.log('  - Collection Name: subscriptionRequests');
      console.log('  - Document Path:', docRef.path);
      console.log('  - Document ID:', docRef.id);

      // 2. Also set id field on document for easy client references
      try {
        await setDoc(docRef, { id: docRef.id }, { merge: true });
      } catch (idErr) {
        console.warn('Notice attaching document ID to subscriptionRequest:', idErr);
      }

      // 3. Update user's pending status in Firestore using merge: true
      if (targetUid) {
        try {
          console.log('[Firestore User Pending Status Write]');
          console.log('  - Document Path:', `users/${targetUid}`);
          const userRef = doc(db, 'users', targetUid);
          await setDoc(
            userRef,
            {
              pendingPlan: data.requestedPlan,
              subscriptionStatus: 'pending',
              uid: targetUid,
              email: userEmail,
            },
            { merge: true }
          );
          console.log('[Firestore User Pending Status Success]: users/' + targetUid);
        } catch (uErr: any) {
          console.warn('Notice updating user pending plan in Firestore:', uErr);
          if (uErr && typeof uErr === 'object') {
            console.error('[COMPLETE Firebase Error Details]:', JSON.stringify(uErr, Object.getOwnPropertyNames(uErr)));
          }
        }
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
        date: new Date().toISOString().split('T')[0],
        read: false,
        linkTab: 'subscription',
      };
      setNotifications((prev) => [notif, ...prev]);
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

    try {
      console.log('[Firestore Write Start] Approving request in "subscriptionRequests":', requestId);
      // 1. Update request status in Firestore
      const reqRef = doc(db, 'subscriptionRequests', requestId);
      await setDoc(
        reqRef,
        {
          status: 'approved',
          reviewedDate: new Date().toISOString(),
          reviewedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log('[Firestore Write Success] Approved request in "subscriptionRequests":', requestId);

      // 2. Update merchant user profile in Firestore
      if (req.userId) {
        console.log('[Firestore Write Start] Updating merchant profile in "users" collection:', req.userId);
        const userRef = doc(db, 'users', req.userId);
        await setDoc(
          userRef,
          {
            subscriptionPlan: req.requestedPlan,
            subscription: req.requestedPlan.toLowerCase(),
            subscriptionStatus: 'active',
            pendingPlan: deleteField(),
          },
          { merge: true }
        );
        console.log('[Firestore Write Success] Updated merchant profile in "users" collection:', req.userId);
      }

      // 3. Local states update
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === req.userId) {
            return {
              ...u,
              subscriptionPlan: req.requestedPlan,
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
          subscriptionPlan: req.requestedPlan,
          subscriptionStatus: 'active',
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
        date: new Date().toISOString().split('T')[0],
        read: false,
        linkTab: 'subscription',
      };
      setNotifications((prev) => [notif, ...prev]);
      logActivity('Approved Subscription Request', 'সাবস্ক্রিপশন আবেদন অনুমোদন করা হয়েছে', req.userEmail);
    } catch (error: any) {
      console.error('[Firestore Write Failure] Error approving subscription request:', error);
      if (error && typeof error === 'object') {
        console.error('[COMPLETE Firebase Error Details]:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
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
        date: new Date().toISOString().split('T')[0],
        read: false,
        linkTab: 'subscription',
      };
      setNotifications((prev) => [notif, ...prev]);
      logActivity('Rejected Subscription Request', 'সাবস্ক্রিপশন আবেদন প্রত্যাখ্যান করা হয়েছে', req.userEmail);
    } catch (error) {
      console.error('Error rejecting subscription request:', error);
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('biz_user', JSON.stringify(updated));
    if (data.brandName) {
      setSettings((prev) => {
        const next = { ...prev, brandName: data.brandName! };
        localStorage.setItem('biz_settings', JSON.stringify(next));
        return next;
      });
    }
    if (auth.currentUser) {
      const fsPayload: Record<string, any> = { ...data };
      if (data.brandName) fsPayload.storeName = data.brandName;
      updateDoc(doc(db, 'users', auth.currentUser.uid), fsPayload)
        .catch((err) => console.warn('Sync profile error:', err));
    }
    logActivity('Updated Profile', 'প্রোফাইল আপডেট করা হয়েছে');
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('biz_user', JSON.stringify(updated));
    if (data.brandName) {
      setSettings((prev) => {
        const next = { ...prev, brandName: data.brandName! };
        localStorage.setItem('biz_settings', JSON.stringify(next));
        return next;
      });
    }
    if (auth.currentUser) {
      const fsPayload: Record<string, any> = { ...data };
      if (data.brandName) fsPayload.storeName = data.brandName;
      updateDoc(doc(db, 'users', auth.currentUser.uid), fsPayload)
        .catch((err) => console.warn('Sync user error:', err));
    }
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      localStorage.setItem('biz_settings', JSON.stringify(next));
      return next;
    });
    if (newSettings.brandName) {
      setUser((prev) => {
        if (!prev) return prev;
        const updatedUser = { ...prev, brandName: newSettings.brandName! };
        localStorage.setItem('biz_user', JSON.stringify(updatedUser));
        return updatedUser;
      });
      if (auth.currentUser) {
        updateDoc(doc(db, 'users', auth.currentUser.uid), {
          brandName: newSettings.brandName,
          storeName: newSettings.brandName,
        }).catch((err) => console.warn('Sync brandName settings error:', err));
      }
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
  const checkoutPOS = (saleData: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    discount: number;
    tax: number;
    paymentMethod: 'Cash' | 'Card' | 'bKash/Mobile' | 'Due/Credit' | 'Split';
    cashReceived: number;
    note?: string;
  }): Sale => {
    const todayStr = new Date().toISOString().split('T')[0];
    const expiredItem = cart.find(
      (item) => item.product.expiryDate && item.product.expiryDate <= todayStr
    );
    if (expiredItem) {
      alert(`Expired Product (${expiredItem.product.name}). Sale is not allowed.`);
      throw new Error('This product has expired and cannot be sold.');
    }
    const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
    const taxAmount = Math.round((subtotal * saleData.tax) / 100);
    const grandTotal = Math.max(0, subtotal - saleData.discount + taxAmount);

    let paidAmount = saleData.cashReceived;
    if (saleData.paymentMethod === 'Due/Credit') {
      paidAmount = saleData.cashReceived || 0;
    } else {
      paidAmount = Math.min(saleData.cashReceived || grandTotal, grandTotal);
    }

    const dueAmount = Math.max(0, grandTotal - paidAmount);
    const changeAmount = Math.max(0, saleData.cashReceived - grandTotal);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = Date.now().toString().slice(-6);
    const randStr = Math.floor(100 + Math.random() * 900);
    const invoiceNo = `ORD-${dateStr}-${timeStr}-${randStr}`;

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      buyingPrice: item.product.buyingPrice,
      sellingPrice: item.product.sellingPrice,
      quantity: item.quantity,
      unit: item.product.unit,
      total: item.product.sellingPrice * item.quantity,
      image: item.product.image,
    }));

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      customerId: saleData.customerId,
      customerName: saleData.customerName || 'Walk-in Customer',
      customerPhone: saleData.customerPhone,
      items: saleItems,
      subtotal,
      discount: saleData.discount,
      tax: taxAmount,
      total: grandTotal,
      paidAmount,
      dueAmount,
      changeAmount,
      paymentMethod: saleData.paymentMethod,
      cashierName: user ? user.ownerName : 'Cashier',
      date: new Date().toISOString(),
      note: saleData.note,
    };

    // 1. Deduct Stock
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((c) => c.product.id === p.id);
        if (cartMatch) {
          const newStock = Math.max(0, p.currentStock - cartMatch.quantity);
          let newStatus: Product['status'] = 'active';
          if (newStock === 0) newStatus = 'out_of_stock';
          else if (newStock <= p.minStockAlert) newStatus = 'low';

          return { ...p, currentStock: newStock, status: newStatus };
        }
        return p;
      })
    );

    // 2. Update Customer Due / Total Spent
    if (saleData.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === saleData.customerId) {
            return {
              ...c,
              totalSpent: c.totalSpent + grandTotal,
              dueAmount: c.dueAmount + dueAmount,
              lifetimePurchasesCount: c.lifetimePurchasesCount + 1,
            };
          }
          return c;
        })
      );
    }

    setSales((prev) => [newSale, ...prev]);
    clearCart();
    logActivity('Completed POS Sale', 'নতুন বিক্রয় ইনভয়েস সম্পন্ন', `${invoiceNo} - Total: ৳${grandTotal}`);

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
  const addCategory = (name: string, description?: string) => {
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
    setCategories((prev) => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addBrand = (name: string, description?: string) => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const exists = brands.find((b) => b.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    const newBrand: Brand = {
      id: `brand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      description: description || '',
    };
    setBrands((prev) => [...prev, newBrand]);
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  // Product CRUD
  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'status'>) => {
    // Check product limits based on user.subscriptionPlan
    const plan = user?.subscriptionPlan || 'Free';
    const limit = (plan === 'Free' || plan === 'Starter') ? 10 : ((plan === 'Pro' || plan === 'Tier2') ? 25 : Infinity);
    if (products.length >= limit) {
      alert(`Product limit reached for ${plan} Plan (${limit} products max). Please upgrade your subscription plan to add more products!`);
      return;
    }

    // Auto add category & brand if new
    if (data.category) addCategory(data.category);
    if (data.brand) addBrand(data.brand);

    let status: Product['status'] = 'active';
    if (data.currentStock === 0) status = 'out_of_stock';
    else if (data.currentStock <= data.minStockAlert) status = 'low';

    const newProd: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      status,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProd, ...prev]);
    logActivity('Added New Product', 'নতুন পণ্য যোগ করা হয়েছে', data.name);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...updatedFields };
          let status = merged.status;
          if (merged.currentStock === 0) status = 'out_of_stock';
          else if (merged.currentStock <= merged.minStockAlert) status = 'low';
          else status = 'active';

          return { ...merged, status };
        }
        return p;
      })
    );
    logActivity('Updated Product', 'পণ্য এডিট করা হয়েছে', `ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logActivity('Deleted Product', 'পণ্য মুছে ফেলা হয়েছে', `ID: ${id}`);
  };

  const clearAllProducts = () => {
    setProducts([]);
    setCart([]);
    localStorage.setItem('biz_products', JSON.stringify([]));
    logActivity('Cleared All Products', 'সকল টেস্ট প্রোডাক্ট মুছে ফেলা হয়েছে');
  };

  // Stock Adjustment
  const adjustStock = (
    productId: string,
    quantityDelta: number,
    reason: string,
    type: 'addition' | 'reduction' | 'damage_writeoff' | 'audit_correction'
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newStock = Math.max(0, prod.currentStock + quantityDelta);
    updateProduct(productId, { currentStock: newStock });

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
    setAdjustments((prev) => [newAdj, ...prev]);
    logActivity('Stock Adjusted', 'স্টক পরিবর্তন করা হয়েছে', `${prod.name} (${quantityDelta > 0 ? '+' : ''}${quantityDelta})`);
  };

  // Customers & Suppliers
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt' | 'dueAmount' | 'totalSpent' | 'lifetimePurchasesCount'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      dueAmount: 0,
      totalSpent: 0,
      lifetimePurchasesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    logActivity('Added Customer', 'নতুন গ্রাহক যোগ করা হয়েছে', custData.name);
  };

  const updateCustomer = (id: string, custData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...custData } : c))
    );
    logActivity('Updated Customer', 'গ্রাহকের তথ্য আপডেট করা হয়েছে', `ID: ${id}`);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logActivity('Deleted Customer', 'গ্রাহক মুছে ফেলা হয়েছে', `ID: ${id}`);
  };

  const addSupplier = (suppData: Omit<Supplier, 'id' | 'createdAt' | 'dueAmount' | 'totalPurchasesCount'>) => {
    const newSupp: Supplier = {
      ...suppData,
      id: `supp-${Date.now()}`,
      dueAmount: 0,
      totalPurchasesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSuppliers((prev) => [newSupp, ...prev]);
    logActivity('Added Supplier', 'নতুন সরবরাহকারী যোগ করা হয়েছে', suppData.name);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    logActivity('Deleted Supplier', 'সরবরাহকারী মুছে ফেলা হয়েছে', `ID: ${id}`);
  };

  const resetAllDataToZero = () => {
    setProducts([]);
    setCustomers([]);
    setSuppliers([]);
    setSales([]);
    setExpenses([]);
    setPurchases([]);
    setCart([]);
    setDueCollections([]);
    setAdjustments([]);
    localStorage.setItem('biz_products', JSON.stringify([]));
    localStorage.setItem('biz_customers', JSON.stringify([]));
    localStorage.setItem('biz_suppliers', JSON.stringify([]));
    localStorage.setItem('biz_sales', JSON.stringify([]));
    localStorage.setItem('biz_expenses', JSON.stringify([]));
    localStorage.setItem('biz_purchases', JSON.stringify([]));
    logActivity('Reset All Data', 'সকল ডাটা ০ তে রিসেট করা হয়েছে');
  };

  const loadSampleDemoData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setExpenses(initialExpenses);
    setPurchases(initialPurchases);
    logActivity('Loaded Demo Data', 'স্যাম্পল ডেমো ডাটা লোড করা হয়েছে');
  };

  // Expenses & Purchases
  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    logActivity('Added Expense', 'নতুন খরচ এন্ট্রি করা হয়েছে', `${expData.title} (৳${expData.amount})`);
  };

  const addPurchase = (pData: Omit<Purchase, 'id' | 'purchaseNo'>) => {
    const purchaseNo = `PUR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newPurchase: Purchase = {
      ...pData,
      id: `pur-${Date.now()}`,
      purchaseNo,
    };

    // Auto increase stock for purchased items
    pData.items.forEach((item) => {
      const match = products.find((p) => p.id === item.productId);
      if (match) {
        updateProduct(match.id, {
          currentStock: match.currentStock + item.quantity,
          buyingPrice: item.buyingPrice,
        });
      }
    });

    // Update supplier due
    if (pData.supplierId) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === pData.supplierId) {
            return {
              ...s,
              dueAmount: s.dueAmount + pData.dueAmount,
              totalPurchasesCount: s.totalPurchasesCount + 1,
            };
          }
          return s;
        })
      );
    }

    setPurchases((prev) => [newPurchase, ...prev]);
    logActivity('Recorded Purchase', 'নতুন পারচেজ এন্ট্রি করা হয়েছে', `${purchaseNo} - Supplier: ${pData.supplierName}`);
  };

  // Due Collection
  const collectDue = (data: {
    type: 'customer' | 'supplier';
    entityId: string;
    amountPaid: number;
    paymentMethod: string;
    note?: string;
  }) => {
    if (data.type === 'customer') {
      const target = customers.find((c) => c.id === data.entityId);
      if (!target) return;

      const previousDue = target.dueAmount;
      const remainingDue = Math.max(0, previousDue - data.amountPaid);

      setCustomers((prev) =>
        prev.map((c) => (c.id === data.entityId ? { ...c, dueAmount: remainingDue } : c))
      );

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
      };
      setDueCollections((prev) => [record, ...prev]);
      logActivity('Collected Customer Due', 'গ্রাহকের বকেয়া আদায় করা হয়েছে', `${target.name}: ৳${data.amountPaid}`);
    } else {
      const target = suppliers.find((s) => s.id === data.entityId);
      if (!target) return;

      const previousDue = target.dueAmount;
      const remainingDue = Math.max(0, previousDue - data.amountPaid);

      setSuppliers((prev) =>
        prev.map((s) => (s.id === data.entityId ? { ...s, dueAmount: remainingDue } : s))
      );

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
      };
      setDueCollections((prev) => [record, ...prev]);
      logActivity('Paid Supplier Due', 'সরবরাহকারীকে বকেয়া পরিশোধ', `${target.name}: ৳${data.amountPaid}`);
    }
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
      logActivity('Imported Database Backup', 'ডাটাবেজ ব্যাকআপ ইমপোর্ট করা হয়েছে');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Calculations for Metrics
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySalesArr = sales.filter((s) => s.date.startsWith(todayStr));
  const todaySales = todaySalesArr.reduce((acc, s) => acc + s.total, 0);

  const todayBuyingCost = todaySalesArr.reduce((acc, s) => {
    const itemsBuyingTotal = s.items.reduce((sum, item) => sum + item.buyingPrice * item.quantity, 0);
    return acc + itemsBuyingTotal;
  }, 0);

  const todayExpense = expenses
    .filter((e) => e.date.startsWith(todayStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const todayProfit = Math.max(0, todaySales - todayBuyingCost - todayExpense);

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

  const monthlyProfit = Math.max(0, monthlySales - monthBuyingCost - monthlyExpense);

  const totalRevenueAllTime = sales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenseAllTime = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalBalance = Math.max(0, totalRevenueAllTime - totalExpenseAllTime);

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;

  const expiredCount = products.filter((p) => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < new Date();
  }).length;

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        updateUser: updateProfile,
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
        approveSubscriptionRequest,
        rejectSubscriptionRequest,
        settings,
        updateSettings,
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
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
        adjustStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        deleteSupplier,
        resetAllDataToZero,
        loadSampleDemoData,
        addExpense,
        addPurchase,
        collectDue,
        markNotificationRead,
        markAllNotificationsRead,
        exportDataJSON,
        importDataJSON,
        metrics: {
          todaySales,
          todayExpense,
          todayBuyingCost,
          todayProfit,
          totalBalance,
          totalStockQty,
          totalInventoryCostValue,
          totalInventorySellingValue,
          totalDueCustomers,
          totalDueSuppliers,
          monthlySales,
          monthlyExpense,
          monthlyProfit,
          lowStockCount,
          expiredCount,
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
