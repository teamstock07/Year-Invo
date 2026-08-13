export type Language = 'en' | 'bn' | 'hi' | 'ar' | 'es' | 'fr';
export type ThemeMode = 'light' | 'dark';
export type UserRole = 'Owner' | 'Manager' | 'Staff' | 'Accountant' | 'PlatformOwner';
export type SubscriptionPlan = 'Starter' | 'Tier2' | 'Lifetime' | 'Free' | 'Pro' | 'Business';

export interface UserProfile {
  id: string;
  brandName: string;
  ownerName: string;
  mobile: string;
  email: string;
  password?: string;
  businessType: string;
  country: string;
  preferredLanguage?: Language;
  currency: string; // e.g. "৳" or "$" or "€"
  timeZone: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus?: 'active' | 'pending' | 'suspended' | 'blocked' | 'deleted' | 'cancelled' | 'expired';
  pendingPlan?: SubscriptionPlan;
  cancelledAt?: string;
  cancelledBy?: string;
  previousPlan?: SubscriptionPlan;
  status?: 'active' | 'suspended' | 'blocked' | 'deleted';
  storeAddress?: string;
  affiliateCode?: string;
  affiliateProgram?: string;
  avatarUrl?: string;
  logoUrl?: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  createdAt: string;
  lastLogin?: string;
  notes?: string;

  // Paddle Subscription details
  paddleCustomerId?: string;
  paddleSubscriptionId?: string;
  paddlePriceId?: string;
  billingCycle?: 'monthly' | 'yearly';
  paymentProvider?: string;
  paymentRegion?: 'international' | 'bangladesh';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  brandName: string;
  currentPlan: SubscriptionPlan;
  requestedPlan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: string;
  paymentRegion?: 'international' | 'bangladesh';
  paymentProvider?: string;
  currency?: string;
  transactionId?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  requestDate: string;
  reviewedDate?: string;
  approvedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  previousPlan?: SubscriptionPlan;
  previousStatus?: string;
  notes?: string;

  // Paddle Subscription details
  paddleCustomerId?: string;
  paddleSubscriptionId?: string;
  paddlePriceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  buyingPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockAlert: number;
  unit: string; // Piece, KG, Liter, Box, Packet, etc.
  expiryDate?: string;
  description?: string;
  imageUrl?: string;
  status: 'active' | 'low' | 'out_of_stock' | 'expired' | 'damaged';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
  discount?: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  total: number;
  image?: string;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  changeAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'bKash/Mobile' | 'Due/Credit' | 'Split';
  cashierName: string;
  date: string; // ISO date string
  note?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  buyingPrice: number;
  quantity: number;
  unit: string;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'Cash' | 'Bank' | 'Mobile';
  date: string;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dueAmount: number;
  totalSpent: number;
  lifetimePurchasesCount: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  mobile: string;
  email?: string;
  address?: string;
  dueAmount: number;
  totalPurchasesCount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'Rent' | 'Electricity' | 'Salary' | 'Internet' | 'Transport' | 'Marketing' | 'Packaging' | 'Office Expense' | 'Miscellaneous';
  amount: number;
  date: string;
  note?: string;
  attachmentName?: string;
  paymentMethod: 'Cash' | 'Bank' | 'Mobile';
}

export interface Income {
  id: string;
  title: string;
  category: 'Investment' | 'Asset Sale' | 'Services' | 'Refund' | 'Other';
  amount: number;
  date: string;
  note?: string;
}

export interface DueCollection {
  id: string;
  type: 'customer' | 'supplier';
  entityId: string;
  entityName: string;
  amountPaid: number;
  previousDue: number;
  remainingDue: number;
  date: string;
  paymentMethod: string;
  note?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'addition' | 'reduction' | 'damage_writeoff' | 'audit_correction';
  quantity: number;
  reason: string;
  date: string;
  adjustedBy: string;
}

export interface AppNotification {
  id: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  type: 'low_stock' | 'expired' | 'due' | 'subscription' | 'report' | 'system';
  date: string;
  read: boolean;
  linkTab?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actionBn: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface QrPaymentSettings {
  localPaymentEnabled?: boolean;
  paymentMethod?: string;
  paymentNumber?: string;
  receiverName?: string;
  storeName?: string;
  transactionIdInstruction?: string;
  qrEnabled: boolean;
  qrProvider: string;
  qrImageUrl: string;
  accountName?: string;
  accountNumber?: string;
  updatedAt?: string;
}

export interface BangladeshMethodConfig {
  enabled: boolean;
  number: string;
}

export interface BangladeshPaymentConfig {
  enabled: boolean;
  methods: {
    bkash: BangladeshMethodConfig;
    nagad: BangladeshMethodConfig;
    rocket: BangladeshMethodConfig;
  };
  receiverName: string;
  storeName: string;
  transactionIdInstruction: string;
}

export interface OwnerPaymentSettings {
  localPaymentEnabled: boolean;
  paymentMethod: string;
  paymentNumber: string;
  receiverName: string;
  storeName: string;
  transactionIdInstruction: string;
  bangladesh?: BangladeshPaymentConfig;
  qrEnabled?: boolean;
  qrProvider?: string;
  qrImageUrl?: string;
  accountName?: string;
  accountNumber?: string;
  updatedAt?: string;
}

export interface BusinessSettings {
  logoUrl: string;
  brandName: string;
  siteLogoUrl?: string;
  siteBrandName?: string;
  siteSubBrandName?: string;
  currency: string; // e.g., "৳" or "$"
  currencyPosition: 'prefix' | 'suffix';
  timeZone: string;
  taxRatePercent: number;
  receiptHeader: string;
  receiptFooter: string;
  language: Language;
  theme: ThemeMode;
  autoBackup: boolean;
  paymentSettings?: OwnerPaymentSettings;
}
