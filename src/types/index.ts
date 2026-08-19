export type Language = 'en' | 'bn' | 'hi' | 'ar' | 'es' | 'fr';
export type ThemeMode = 'light' | 'dark';
export type UserRole = 'Owner' | 'Manager' | 'Staff' | 'Accountant' | 'PlatformOwner' | 'Cashier' | 'Inventory Manager' | 'Custom Role';
export type SubscriptionPlan = 'Starter' | 'Tier2' | 'Lifetime' | 'Free' | 'Pro' | 'Premium' | 'Business';
export type BillingCycle = 'monthly' | 'yearly' | 'five_year';

export type BusinessType =
  | 'Retail Shop'
  | 'Grocery'
  | 'Clothing'
  | 'Electronics'
  | 'Pharmacy'
  | 'Restaurant / Food'
  | 'Service Business'
  | 'Beauty / Salon'
  | 'Hardware'
  | 'Other';

export interface DashboardPreferences {
  dashboard?: boolean;
  quickSale: boolean;
  pos: boolean;
  products: boolean;
  categories: boolean;
  stockManagement: boolean;
  salesManagement: boolean;
  salesHistory: boolean;
  salesCalendar?: boolean;
  purchases: boolean;
  customers: boolean;
  suppliers: boolean;
  dueManagement: boolean;
  customerLoyalty: boolean;
  expenses: boolean;
  capitalInvestment?: boolean;
  reports: boolean;
  expiryManagement: boolean;
  barcode: boolean;
  notifications: boolean;
  smartReorder: boolean;
  aiAssistant: boolean;
  teamManagement: boolean;
  payroll: boolean;
  auditLog: boolean;
  storeSettings?: boolean;
  dashboardCustomization?: boolean;
  support: boolean;
}

export const defaultDashboardPreferences: DashboardPreferences = {
  dashboard: true,
  quickSale: true,
  pos: true,
  products: true,
  categories: true,
  stockManagement: true,
  salesManagement: true,
  salesHistory: true,
  salesCalendar: true,
  purchases: true,
  customers: true,
  suppliers: true,
  dueManagement: true,
  customerLoyalty: true,
  expenses: true,
  capitalInvestment: true,
  reports: true,
  expiryManagement: true,
  barcode: true,
  notifications: true,
  smartReorder: true,
  aiAssistant: true,
  teamManagement: true,
  payroll: true,
  auditLog: true,
  storeSettings: true,
  dashboardCustomization: true,
  support: true,
};

// Recommended Module Profiles based on Business Type
export const businessTypeRecommendedModules: Record<BusinessType, Partial<DashboardPreferences>> = {
  'Retail Shop': {
    quickSale: true,
    pos: true,
    products: true,
    categories: true,
    stockManagement: true,
    salesHistory: true,
    purchases: true,
    customers: true,
    suppliers: true,
    dueManagement: true,
    expenses: true,
    barcode: true,
    smartReorder: true,
    customerLoyalty: true,
    aiAssistant: true,
    teamManagement: true,
    payroll: true,
  },
  'Grocery': {
    quickSale: true,
    pos: true,
    products: true,
    categories: true,
    stockManagement: true,
    salesHistory: true,
    purchases: true,
    suppliers: true,
    dueManagement: true,
    expenses: true,
    expiryManagement: true,
    barcode: true,
    smartReorder: true,
    teamManagement: true,
    payroll: true,
  },
  'Clothing': {
    quickSale: true,
    pos: true,
    products: true,
    categories: true,
    stockManagement: true,
    salesHistory: true,
    purchases: true,
    customers: true,
    suppliers: true,
    barcode: true,
    customerLoyalty: true,
    expenses: true,
    smartReorder: true,
    payroll: true,
  },
  'Electronics': {
    quickSale: true,
    pos: true,
    products: true,
    categories: true,
    stockManagement: true,
    salesHistory: true,
    purchases: true,
    customers: true,
    suppliers: true,
    dueManagement: true,
    barcode: true,
    expenses: true,
    smartReorder: true,
    teamManagement: true,
    payroll: true,
  },
  'Pharmacy': {
    quickSale: true,
    pos: true,
    products: true,
    categories: true,
    stockManagement: true,
    salesHistory: true,
    purchases: true,
    suppliers: true,
    dueManagement: true,
    expiryManagement: true,
    barcode: true,
    smartReorder: true,
    expenses: true,
    payroll: true,
  },
  'Restaurant / Food': {
    quickSale: true,
    pos: true,
    products: true,
    categories: true,
    stockManagement: true,
    salesHistory: true,
    purchases: true,
    suppliers: true,
    expenses: true,
    customerLoyalty: true,
    teamManagement: true,
    payroll: true,
  },
  'Service Business': {
    quickSale: true,
    salesHistory: true,
    customers: true,
    dueManagement: true,
    expenses: true,
    reports: true,
    customerLoyalty: true,
    teamManagement: true,
    payroll: true,
  },
  'Beauty / Salon': {
    quickSale: true,
    pos: true,
    customers: true,
    dueManagement: true,
    expenses: true,
    customerLoyalty: true,
    teamManagement: true,
    payroll: true,
  },
  'Hardware': {
    quickSale: true,
    pos: true,
    products: true,
    categories: true,
    stockManagement: true,
    purchases: true,
    suppliers: true,
    dueManagement: true,
    barcode: true,
    smartReorder: true,
    expenses: true,
    payroll: true,
  },
  'Other': {
    ...defaultDashboardPreferences,
  },
};

// Team Roles & Granular Permissions
export type TeamRole = 'Owner' | 'Manager' | 'Cashier' | 'Inventory Manager' | 'Accountant' | 'Custom Role';

export interface TeamPermissions {
  dashboard: boolean;
  quickSale: boolean;
  pos: boolean;
  products: boolean;
  createProduct: boolean;
  editProduct: boolean;
  deleteProduct: boolean;
  categories: boolean;
  inventory: boolean;
  stockAdjustment: boolean;
  purchases: boolean;
  suppliers: boolean;
  sales: boolean;
  refund: boolean;
  salesHistory: boolean;
  customers: boolean;
  customerDue: boolean;
  expenses: boolean;
  capitalInvestment: boolean;
  profitLoss: boolean;
  reports: boolean;
  notifications: boolean;
  teamManagement: boolean;
  payroll: boolean;
  storeBranding: boolean;
  settings: boolean;
  subscription: boolean;
  paymentSettings: boolean;
  auditLog: boolean;
}

export const roleDefaultPermissions: Record<TeamRole, TeamPermissions> = {
  Owner: {
    dashboard: true,
    quickSale: true,
    pos: true,
    products: true,
    createProduct: true,
    editProduct: true,
    deleteProduct: true,
    categories: true,
    inventory: true,
    stockAdjustment: true,
    purchases: true,
    suppliers: true,
    sales: true,
    refund: true,
    salesHistory: true,
    customers: true,
    customerDue: true,
    expenses: true,
    capitalInvestment: true,
    profitLoss: true,
    reports: true,
    notifications: true,
    teamManagement: true,
    payroll: true,
    storeBranding: true,
    settings: true,
    subscription: true,
    paymentSettings: true,
    auditLog: true,
  },
  Manager: {
    dashboard: true,
    quickSale: true,
    pos: true,
    products: true,
    createProduct: true,
    editProduct: true,
    deleteProduct: false,
    categories: true,
    inventory: true,
    stockAdjustment: true,
    purchases: true,
    suppliers: true,
    sales: true,
    refund: true,
    salesHistory: true,
    customers: true,
    customerDue: true,
    expenses: true,
    capitalInvestment: true,
    profitLoss: true,
    reports: true,
    notifications: true,
    teamManagement: false,
    payroll: false,
    storeBranding: false,
    settings: false,
    subscription: false,
    paymentSettings: false,
    auditLog: true,
  },
  Cashier: {
    dashboard: true,
    quickSale: true,
    pos: true,
    products: true,
    createProduct: false,
    editProduct: false,
    deleteProduct: false,
    categories: true,
    inventory: false,
    stockAdjustment: false,
    purchases: false,
    suppliers: false,
    sales: true,
    refund: false,
    salesHistory: true,
    customers: true,
    customerDue: true,
    expenses: false,
    capitalInvestment: false,
    profitLoss: false,
    reports: false,
    notifications: true,
    teamManagement: false,
    payroll: false,
    storeBranding: false,
    settings: false,
    subscription: false,
    paymentSettings: false,
    auditLog: false,
  },
  'Inventory Manager': {
    dashboard: true,
    quickSale: false,
    pos: false,
    products: true,
    createProduct: true,
    editProduct: true,
    deleteProduct: false,
    categories: true,
    inventory: true,
    stockAdjustment: true,
    purchases: true,
    suppliers: true,
    sales: false,
    refund: false,
    salesHistory: false,
    customers: false,
    customerDue: false,
    expenses: false,
    capitalInvestment: false,
    profitLoss: false,
    reports: false,
    notifications: true,
    teamManagement: false,
    payroll: false,
    storeBranding: false,
    settings: false,
    subscription: false,
    paymentSettings: false,
    auditLog: false,
  },
  Accountant: {
    dashboard: true,
    quickSale: false,
    pos: false,
    products: false,
    createProduct: false,
    editProduct: false,
    deleteProduct: false,
    categories: false,
    inventory: false,
    stockAdjustment: false,
    purchases: true,
    suppliers: true,
    sales: false,
    refund: false,
    salesHistory: true,
    customers: true,
    customerDue: true,
    expenses: true,
    capitalInvestment: true,
    profitLoss: true,
    reports: true,
    notifications: true,
    teamManagement: false,
    payroll: true,
    storeBranding: false,
    settings: false,
    subscription: false,
    paymentSettings: false,
    auditLog: true,
  },
  'Custom Role': {
    dashboard: true,
    quickSale: true,
    pos: true,
    products: true,
    createProduct: false,
    editProduct: false,
    deleteProduct: false,
    categories: false,
    inventory: false,
    stockAdjustment: false,
    purchases: false,
    suppliers: false,
    sales: true,
    refund: false,
    salesHistory: true,
    customers: true,
    customerDue: false,
    expenses: false,
    capitalInvestment: false,
    profitLoss: false,
    reports: false,
    notifications: true,
    teamManagement: false,
    payroll: false,
    storeBranding: false,
    settings: false,
    subscription: false,
    paymentSettings: false,
    auditLog: false,
  },
};

export interface TeamMember {
  id: string;
  storeId?: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamRole;
  status: 'Active' | 'Invited' | 'Disabled';
  joinedDate: string;
  lastActive?: string;
  invitedBy?: string;
  customPermissions?: Partial<TeamPermissions>;
}

// Secure Employee Device Access Types
export type DeviceApprovalStatus = 'approved' | 'pending' | 'revoked' | 'Approved' | 'Pending' | 'Revoked';

export interface EmployeeDevice {
  id: string;
  storeId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: TeamRole | string;
  deviceId?: string;
  deviceName: string;
  deviceFingerprint?: string;
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  employeeRole?: string;
  browser?: string;
  os?: string;
  screenResolution?: string;
  deviceType?: 'Desktop' | 'Mobile' | 'Tablet' | string;
  status: DeviceApprovalStatus;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  revokedAt?: string;
  revokedBy?: string;
  rejectionReason?: string;
  revocationReason?: string;
  lastActiveAt?: string;
  notes?: string;
}

// Employee Salary & Payroll Models (SEPARATE from Team Management)
export type SalaryType = 'Monthly' | 'Weekly' | 'Daily' | 'Hourly' | 'Custom';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated' | 'Disabled';

export interface Employee {
  id: string;
  employeeId: string; // e.g. "EMP-001"
  fullName: string;
  phone: string;
  email?: string;
  jobTitle: string;
  department: string;
  role: string;
  joiningDate: string; // e.g. "2026-01-10"
  salaryType: SalaryType;
  baseSalary: number;
  currency?: string;
  status: EmployeeStatus;
  notes?: string;
  createdAt: string;
}

export interface SalaryAdjustment {
  id: string;
  employeeId: string;
  type: 'bonus' | 'commission' | 'overtime' | 'deduction' | 'advance';
  amount: number;
  currency?: string;
  reason: string;
  date: string;
  overtimeHours?: number;
  overtimeRate?: number;
  period?: string; // e.g. "2026-03"
}

export interface SalaryPaymentHistoryEntry {
  id: string;
  amount: number;
  date: string;
  method: string;
  note?: string;
  paidBy?: string;
}

export interface PayrollPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g. "March 2026" or "2026-03"
  baseSalary: number;
  bonus: number;
  overtime: number;
  deduction: number;
  advance: number;
  netSalary: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Pending' | 'Paid' | 'Partially Paid';
  paymentDate?: string;
  paymentMethod: string;
  notes?: string;
  currency: string;
  expenseReferenceId?: string; // unique ID linking to business expense so it's not double counted
  paymentHistory?: SalaryPaymentHistoryEntry[];
  createdAt: string;
}

export interface CustomerLoyaltySettings {
  enabled: boolean;
  pointsPerAmount?: number; // e.g. 1 point per 100 currency
  spendingAmountUnit?: number;
  pointRedemptionValue?: number;
  minPointsToRedeem?: number;
  rewardThreshold?: number; // e.g. 100 points
  rewardDiscountValue?: number; // e.g. 50 currency discount
  pointsExpiryDays?: number;
}

export interface SmartReorderItem {
  product?: Product;
  productId?: string;
  productName?: string;
  category?: string;
  supplierName?: string;
  currentStock: number;
  lowStockThreshold?: number;
  minStockAlert?: number;
  monthlySales?: number;
  monthlySalesVelocity?: number;
  salesVelocity?: number; // items sold per day
  recommendedReorder?: number;
  recommendedReorderQty?: number;
  estimatedCost: number;
  buyingPrice?: number;
  urgency?: 'critical' | 'high' | 'medium' | 'low' | 'normal';
  supplierId?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actionBn?: string;
  category: 'payroll' | 'team' | 'sales' | 'inventory' | 'customer' | 'settings' | 'expense' | 'device' | 'security';
  performedBy: string;
  performedByEmail?: string;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  details: string;
  timestamp: string;
  meta?: any;
}

export interface UserProfile {
  id: string;
  brandName: string;
  ownerName: string;
  fullName?: string;
  name?: string;
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
  photoUrl?: string;
  profilePhotoUrl?: string;
  logoUrl?: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  createdAt: string;
  lastLogin?: string;
  notes?: string;
  dashboardPreferences?: DashboardPreferences;

  // Subscription details
  startDate?: string;
  expiryDate?: string;
  billingPeriod?: BillingCycle;
  transactionId?: string;
  paymentMethod?: string;
  paymentProvider?: string;
  paymentRegion?: 'international' | 'bangladesh';
  paddleCustomerId?: string;
  paddleSubscriptionId?: string;
  paddlePriceId?: string;
  billingCycle?: BillingCycle;
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
  billingCycle: BillingCycle;
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
  startDate?: string;
  expiryDate?: string;
  billingPeriod?: BillingCycle;
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
  loyaltyPoints?: number;
  totalPointsEarned?: number;
  totalPointsRedeemed?: number;
  favoriteProducts?: string[];
  lastPurchaseDate?: string;
  orderCount?: number;
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

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Salary'
  | 'Transport'
  | 'Marketing'
  | 'Utilities'
  | 'Supplier Payment'
  | 'Packaging'
  | 'Office Expense'
  | 'Internet'
  | 'Other'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  date: string;
  note?: string;
  description?: string;
  attachmentName?: string;
  paymentMethod: 'Cash' | 'Bank' | 'Mobile' | string;
  expenseReferenceId?: string; // Links to payroll payment ID or supplier invoice to avoid double-counting
}

export interface Income {
  id: string;
  title: string;
  category: 'Investment' | 'Asset Sale' | 'Services' | 'Refund' | 'Other';
  amount: number;
  date: string;
  note?: string;
}

export interface Investment {
  id: string;
  amount: number;
  date: string;
  investorName: string;
  investor?: string; // alias for investorName
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Rocket' | 'Cheque' | 'Other' | string;
  note?: string;
  referenceNo?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CapitalWithdrawal {
  id: string;
  amount: number;
  date: string;
  withdrawnBy: string;
  reason?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Rocket' | 'Cheque' | 'Other' | string;
  note?: string;
  referenceNo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DueCollection {
  id: string;
  type: 'customer' | 'supplier';
  entityId: string;
  entityName: string;
  originalAmount?: number;
  amountPaid: number;
  previousDue: number;
  remainingDue: number;
  date: string;
  dueDate?: string;
  paymentMethod: string;
  note?: string;
  status?: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  collectedBy?: string;
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

export type NotificationType =
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_soon'
  | 'expired'
  | 'pending_due'
  | 'overdue_due'
  | 'due'
  | 'important_sale'
  | 'salary_due'
  | 'salary_pending'
  | 'salary_paid'
  | 'subscription'
  | 'report'
  | 'system';

export type NotificationPriority = 'critical' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  type: NotificationType;
  priority: NotificationPriority;
  date: string;
  createdAt?: string;
  read: boolean;
  resolved?: boolean;
  entityId?: string;
  entityType?: 'product' | 'customer' | 'sale' | 'subscription' | 'system';
  linkTab?: string;
  meta?: {
    productName?: string;
    stock?: number;
    threshold?: number;
    expiryDate?: string;
    diffDays?: number;
    customerName?: string;
    dueAmount?: number;
    dueDate?: string;
    [key: string]: any;
  };
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
  baseCurrency?: string; // Stored store base currency e.g. "BDT" or "USD"
  currency: string; // Active display currency e.g. "৳", "$", "BDT", "USD", "INR", "EUR", "PKR"
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
