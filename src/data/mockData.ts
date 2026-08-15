import {
  Product,
  Customer,
  Supplier,
  Expense,
  Sale,
  Purchase,
  AppNotification,
  ActivityLog,
  Category,
  Brand,
  TeamMember,
  Employee,
  PayrollPayment,
  SalaryAdjustment,
  CustomerLoyaltySettings,
  AuditLogEntry,
} from '../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Grocery & Staples', description: 'Daily essential grocery items', productCount: 0 },
  { id: 'cat-2', name: 'Honey & Organic Food', description: 'Pure honey, nuts, and organic foods', productCount: 0 },
  { id: 'cat-3', name: 'Electronics & Gadgets', description: 'Mobiles, accessories, and tech items', productCount: 0 },
  { id: 'cat-4', name: 'Fashion & Clothing', description: 'Apparel, shirts, sarees, and shoes', productCount: 0 },
  { id: 'cat-5', name: 'Pharmacy & Health', description: 'Medicines, supplements, and wellness', productCount: 0 },
];

export const initialBrands: Brand[] = [
  { id: 'brand-1', name: 'Sundarban Organic', description: 'Pure natural products' },
  { id: 'brand-2', name: 'Pran Foods', description: 'Consumer packaged food' },
  { id: 'brand-3', name: 'Samsung', description: 'Consumer electronics' },
  { id: 'brand-4', name: 'Aarong Ethnic', description: 'Premium lifestyle and apparel' },
  { id: 'brand-5', name: 'Square Pharma', description: 'Pharmaceuticals' },
];

export const initialProducts: Product[] = [];

export const initialCustomers: Customer[] = [];

export const initialSuppliers: Supplier[] = [];

export const initialExpenses: Expense[] = [];

export const initialSales: Sale[] = [];

export const initialPurchases: Purchase[] = [];

export const initialNotifications: AppNotification[] = [];

export const initialActivityLogs: ActivityLog[] = [];

export const initialTeamMembers: TeamMember[] = [];

export const initialEmployees: Employee[] = [];

export const initialSalaryAdjustments: SalaryAdjustment[] = [];

export const initialPayrollPayments: PayrollPayment[] = [];

export const defaultLoyaltySettings: CustomerLoyaltySettings = {
  enabled: true,
  pointsPerAmount: 100, // 1 point per ৳100 (or $100)
  rewardThreshold: 50, // 50 points to unlock reward
  rewardDiscountValue: 50, // ৳50 discount when redeemed
};

export const initialAuditLogs: AuditLogEntry[] = [];

