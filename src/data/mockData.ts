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
  Investment,
  CapitalWithdrawal,
} from '../types';

export const initialCategories: Category[] = [];

export const initialBrands: Brand[] = [];

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

export const initialInvestments: Investment[] = [];

export const initialCapitalWithdrawals: CapitalWithdrawal[] = [];

