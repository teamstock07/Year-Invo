import { Request, Response, NextFunction } from 'express';
import {
  serverDb,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from './firebaseServer';

export interface AuthoritativeSubscription {
  userId: string;
  email: string;
  role: string;
  plan: 'Free' | 'Pro' | 'Premium' | 'Lifetime';
  subscriptionStatus: 'active' | 'expired' | 'pending' | 'suspended' | 'cancelled';
  isOwnerAdmin: boolean;
  startDate?: string;
  expiryDate?: string;
  trialDaysRemaining?: number;
  isTrialExpired: boolean;
  isSubscriptionExpired: boolean;
  limits: {
    maxProducts: number;
    maxStockTotal: number;
    maxSalesPerDay: number;
    isPosAllowed: boolean;
    isTeamManagementAllowed: boolean;
    isQrBarcodeAllowed: boolean;
    isMultiBranchAllowed: boolean;
    isAiInsightsAllowed: boolean;
    isPayrollAllowed: boolean;
  };
}

export function isPlatformAdmin(email?: string | null, role?: string | null): boolean {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanRole = (role || '').trim().toLowerCase();
  return (
    cleanEmail === 'teamstock07@gmail.com' ||
    cleanRole === 'platformowner' ||
    cleanRole === 'superadmin'
  );
}

/**
 * Server-authoritative fetch and evaluation of a user's subscription and active limits.
 * Reads directly from Firestore `users/{userId}`.
 */
export async function getAuthoritativeSubscription(userId: string): Promise<AuthoritativeSubscription> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required for subscription validation.');
  }

  const userRef = doc(serverDb, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // If doc not found, fallback to safe restricted Free Trial defaults
    return {
      userId,
      email: '',
      role: 'Manager',
      plan: 'Free',
      subscriptionStatus: 'active',
      isOwnerAdmin: false,
      isTrialExpired: false,
      isSubscriptionExpired: false,
      trialDaysRemaining: 15,
      limits: {
        maxProducts: 5,
        maxStockTotal: 500,
        maxSalesPerDay: 50,
        isPosAllowed: false,
        isTeamManagementAllowed: false,
        isQrBarcodeAllowed: false,
        isMultiBranchAllowed: false,
        isAiInsightsAllowed: false,
        isPayrollAllowed: false,
      },
    };
  }

  const data = userSnap.data() || {};
  const email = (data.email || '').trim().toLowerCase();
  const role = (data.role || 'Manager').trim();
  const isOwner = isPlatformAdmin(email, role);

  const rawPlan = (data.subscriptionPlan || data.subscription || 'Free').toString().trim();
  let plan: 'Free' | 'Pro' | 'Premium' | 'Lifetime' = 'Free';
  if (isOwner || /^lifetime$/i.test(rawPlan)) {
    plan = 'Lifetime';
  } else if (/^premium$/i.test(rawPlan) || /^business$/i.test(rawPlan)) {
    plan = 'Premium';
  } else if (/^pro$/i.test(rawPlan) || /^tier2$/i.test(rawPlan) || /^starter$/i.test(rawPlan)) {
    plan = 'Pro';
  } else {
    plan = 'Free';
  }

  const now = Date.now();
  let isTrialExpired = false;
  let isSubscriptionExpired = false;
  let trialDaysRemaining = 15;

  if (plan === 'Free' && !isOwner) {
    // 15-day Free Trial calculation
    const createdDateStr = data.createdAt || data.startDate || new Date().toISOString();
    const createdTime = new Date(createdDateStr).getTime();
    const elapsedDays = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
    trialDaysRemaining = Math.max(0, 15 - elapsedDays);
    if (elapsedDays > 15) {
      isTrialExpired = true;
    }
  } else if ((plan === 'Pro' || plan === 'Premium') && !isOwner) {
    // Paid plan expiration calculation
    if (data.expiryDate) {
      const expiryTime = new Date(data.expiryDate).getTime();
      if (now > expiryTime) {
        isSubscriptionExpired = true;
      }
    }
  }

  const isExpired = isTrialExpired || isSubscriptionExpired;

  // Determine active limits based on authoritative plan & status
  if (isOwner || plan === 'Lifetime') {
    return {
      userId,
      email,
      role,
      plan: 'Lifetime',
      subscriptionStatus: 'active',
      isOwnerAdmin: true,
      isTrialExpired: false,
      isSubscriptionExpired: false,
      limits: {
        maxProducts: Number.POSITIVE_INFINITY,
        maxStockTotal: Number.POSITIVE_INFINITY,
        maxSalesPerDay: Number.POSITIVE_INFINITY,
        isPosAllowed: true,
        isTeamManagementAllowed: true,
        isQrBarcodeAllowed: true,
        isMultiBranchAllowed: true,
        isAiInsightsAllowed: true,
        isPayrollAllowed: true,
      },
    };
  }

  if (isExpired) {
    // If expired, revert to locked Free tier
    return {
      userId,
      email,
      role,
      plan: 'Free',
      subscriptionStatus: 'expired',
      isOwnerAdmin: false,
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      trialDaysRemaining: 0,
      isTrialExpired,
      isSubscriptionExpired,
      limits: {
        maxProducts: 5,
        maxStockTotal: 500,
        maxSalesPerDay: 50,
        isPosAllowed: false,
        isTeamManagementAllowed: false,
        isQrBarcodeAllowed: false,
        isMultiBranchAllowed: false,
        isAiInsightsAllowed: false,
        isPayrollAllowed: false,
      },
    };
  }

  if (plan === 'Premium') {
    return {
      userId,
      email,
      role,
      plan: 'Premium',
      subscriptionStatus: (data.subscriptionStatus as any) || 'active',
      isOwnerAdmin: false,
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      isTrialExpired: false,
      isSubscriptionExpired: false,
      limits: {
        maxProducts: Number.POSITIVE_INFINITY,
        maxStockTotal: Number.POSITIVE_INFINITY,
        maxSalesPerDay: Number.POSITIVE_INFINITY,
        isPosAllowed: true,
        isTeamManagementAllowed: true,
        isQrBarcodeAllowed: true,
        isMultiBranchAllowed: true,
        isAiInsightsAllowed: true,
        isPayrollAllowed: true,
      },
    };
  }

  if (plan === 'Pro') {
    return {
      userId,
      email,
      role,
      plan: 'Pro',
      subscriptionStatus: (data.subscriptionStatus as any) || 'active',
      isOwnerAdmin: false,
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      isTrialExpired: false,
      isSubscriptionExpired: false,
      limits: {
        maxProducts: Number.POSITIVE_INFINITY,
        maxStockTotal: Number.POSITIVE_INFINITY,
        maxSalesPerDay: Number.POSITIVE_INFINITY,
        isPosAllowed: false,
        isTeamManagementAllowed: false,
        isQrBarcodeAllowed: true,
        isMultiBranchAllowed: false,
        isAiInsightsAllowed: true,
        isPayrollAllowed: true,
      },
    };
  }

  // Active Free Trial (15 days)
  return {
    userId,
    email,
    role,
    plan: 'Free',
    subscriptionStatus: 'active',
    isOwnerAdmin: false,
    startDate: data.startDate || data.createdAt,
    trialDaysRemaining,
    isTrialExpired: false,
    isSubscriptionExpired: false,
    limits: {
      maxProducts: 5,
      maxStockTotal: 500,
      maxSalesPerDay: 50,
      isPosAllowed: false,
      isTeamManagementAllowed: false,
      isQrBarcodeAllowed: false,
      isMultiBranchAllowed: false,
      isAiInsightsAllowed: false,
      isPayrollAllowed: false,
    },
  };
}

/**
 * Counts actual business metrics from Firestore subcollections for a given user
 */
export async function getUserUsageStats(userId: string): Promise<{
  productCount: number;
  totalStock: number;
  todaySalesCount: number;
}> {
  let productCount = 0;
  let totalStock = 0;
  let todaySalesCount = 0;

  try {
    const productsRef = collection(serverDb, 'users', userId, 'products');
    const prodSnap = await getDocs(productsRef);
    productCount = prodSnap.size;
    prodSnap.forEach((docSnap) => {
      const p = docSnap.data();
      const stock = Number(p.currentStock || p.stock || 0);
      if (!isNaN(stock) && stock > 0) {
        totalStock += stock;
      }
    });
  } catch (e) {
    console.warn(`[Subscription Server] Error reading products for user ${userId}:`, e);
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const salesRef = collection(serverDb, 'users', userId, 'sales');
    const salesSnap = await getDocs(salesRef);
    salesSnap.forEach((docSnap) => {
      const s = docSnap.data();
      const saleDate = (s.date || s.createdAt || '').substring(0, 10);
      if (saleDate === todayStr) {
        todaySalesCount += 1;
      }
    });
  } catch (e) {
    console.warn(`[Subscription Server] Error reading sales for user ${userId}:`, e);
  }

  return {
    productCount,
    totalStock,
    todaySalesCount,
  };
}

/**
 * GET /api/subscription/status?userId=...
 * POST /api/subscription/status { userId: "..." }
 */
export async function handleGetSubscriptionStatus(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || (req.body && req.body.userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required.' });
    }

    const sub = await getAuthoritativeSubscription(userId);
    const usage = await getUserUsageStats(userId);

    return res.json({
      success: true,
      subscription: sub,
      usage,
    });
  } catch (error: any) {
    console.error('[Subscription Status API Error]:', error);
    return res.status(500).json({
      error: error.message || 'Failed to evaluate subscription status.',
    });
  }
}

/**
 * POST /api/subscription/validate-action
 * Body: { userId, action, payload }
 * Validates whether the user's authoritative plan permits the requested business action.
 */
export async function handleValidateSubscriptionAction(req: Request, res: Response) {
  try {
    const { userId, action, payload } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required for action validation.' });
    }

    const sub = await getAuthoritativeSubscription(userId);

    // 1. POS Access & Checkout
    if (action === 'pos_access' || action === 'pos_sale' || action === 'checkout_pos') {
      if (!sub.limits.isPosAllowed) {
        return res.status(403).json({
          allowed: false,
          code: 'POS_FEATURE_LOCKED',
          plan: sub.plan,
          message: 'Point of Sale (POS) is a Premium feature. Please upgrade your subscription to Premium to use the POS register.',
          messageBn: 'পয়েন্ট অব সেল (POS) শুধুমাত্র প্রিমিয়াম (Premium) প্ল্যানের অন্তর্ভুক্ত। POS ব্যবহার করতে দয়া করে প্রিমিয়ামে আপগ্রেড করুন।',
          requiredPlan: 'Premium',
        });
      }
      return res.json({ allowed: true });
    }

    // 2. Team Member Invitation
    if (action === 'invite_team_member' || action === 'team_management') {
      if (!sub.limits.isTeamManagementAllowed) {
        return res.status(403).json({
          allowed: false,
          code: 'TEAM_MANAGEMENT_LOCKED',
          plan: sub.plan,
          message: 'Team Member Management is a Premium feature. Please upgrade your subscription to Premium to invite staff and assign custom roles.',
          messageBn: 'টিম মেম্বার ম্যানেজমেন্ট শুধুমাত্র প্রিমিয়াম (Premium) প্ল্যানের জন্য উন্মুক্ত। টিম মেম্বারদের ইনভাইট পাঠাতে দয়া করে প্রিমিয়ামে আপগ্রেড করুন।',
          requiredPlan: 'Premium',
        });
      }
      return res.json({ allowed: true });
    }

    // 3. QR Code / Barcode generation
    if (action === 'generate_qr_code' || action === 'qr_barcode') {
      if (!sub.limits.isQrBarcodeAllowed) {
        return res.status(403).json({
          allowed: false,
          code: 'QR_BARCODE_LOCKED',
          plan: sub.plan,
          message: 'Barcode & QR Code Generator requires a Pro or Premium plan. Please upgrade to create custom labels.',
          messageBn: 'বারকোড ও কিউআর কোড জেনারেটর প্রো অথবা প্রিমিয়াম প্ল্যানের সুবিধা। লেবেল তৈরি করতে দয়া করে আপগ্রেড করুন।',
          requiredPlan: 'Pro',
        });
      }
      return res.json({ allowed: true });
    }

    // 4. Product Creation & Stock Limit Validation
    if (action === 'create_product') {
      if (sub.limits.maxProducts !== Number.POSITIVE_INFINITY || sub.limits.maxStockTotal !== Number.POSITIVE_INFINITY) {
        const usage = await getUserUsageStats(userId);
        const newStock = Number(payload?.currentStock || payload?.stock || 0);

        if (usage.productCount >= sub.limits.maxProducts) {
          return res.status(403).json({
            allowed: false,
            code: 'PRODUCT_LIMIT_EXCEEDED',
            currentCount: usage.productCount,
            limit: sub.limits.maxProducts,
            message: `Free Trial plan limit reached (Max ${sub.limits.maxProducts} products). Please upgrade to Pro or Premium for unlimited product catalogue.`,
            messageBn: `ফ্রি ট্রায়াল প্ল্যানে সর্বোচ্চ ${sub.limits.maxProducts} টি প্রডাক্ট যোগ করা সম্ভব। আনলিমিটেড প্রডাক্টের জন্য প্রো বা প্রিমিয়াম প্ল্যানে আপগ্রেড করুন।`,
            requiredPlan: 'Pro',
          });
        }

        if (usage.totalStock + newStock > sub.limits.maxStockTotal) {
          return res.status(403).json({
            allowed: false,
            code: 'STOCK_LIMIT_EXCEEDED',
            currentStock: usage.totalStock,
            attemptedTotal: usage.totalStock + newStock,
            limit: sub.limits.maxStockTotal,
            message: `Free Trial stock limit exceeded (Max ${sub.limits.maxStockTotal} total units). Total would become ${usage.totalStock + newStock}. Upgrade to Pro for unlimited stock inventory.`,
            messageBn: `ফ্রি ট্রায়াল প্ল্যানের মোট স্টক লিমিট (সর্বোচ্চ ${sub.limits.maxStockTotal} ইউনিট) অতিক্রম করেছে। আনলিমিটেড ইনভেন্টরি স্টকের জন্য প্রো প্ল্যানে আপগ্রেড করুন।`,
            requiredPlan: 'Pro',
          });
        }
      }
      return res.json({ allowed: true });
    }

    // 5. Daily Sales Limit Validation
    if (action === 'create_sale') {
      if (sub.limits.maxSalesPerDay !== Number.POSITIVE_INFINITY) {
        const usage = await getUserUsageStats(userId);
        if (usage.todaySalesCount >= sub.limits.maxSalesPerDay) {
          return res.status(403).json({
            allowed: false,
            code: 'DAILY_SALES_LIMIT_EXCEEDED',
            todaySalesCount: usage.todaySalesCount,
            limit: sub.limits.maxSalesPerDay,
            message: `Daily sales limit reached on Free Trial (${sub.limits.maxSalesPerDay} sales/day). Upgrade to Pro or Premium for unlimited daily transactions.`,
            messageBn: `ফ্রি ট্রায়ালে দৈনিক বিক্রির লিমিট (${sub.limits.maxSalesPerDay} টি বিক্রি/দিন) শেষ হয়েছে। আনলিমিটেড বিক্রির জন্য প্রো বা প্রিমিয়ামে আপগ্রেড করুন।`,
            requiredPlan: 'Pro',
          });
        }
      }
      return res.json({ allowed: true });
    }

    // 6. AI Insights
    if (action === 'ai_insight' || action === 'ai_insights') {
      if (!sub.limits.isAiInsightsAllowed) {
        return res.status(403).json({
          allowed: false,
          code: 'AI_INSIGHTS_LOCKED',
          plan: sub.plan,
          message: 'AI Business Insights requires a Pro or Premium plan.',
          messageBn: 'এআই বিজনেস ইনসাইটস ব্যবহার করতে প্রো অথবা প্রিমিয়াম প্ল্যানে আপগ্রেড করুন।',
          requiredPlan: 'Pro',
        });
      }
      return res.json({ allowed: true });
    }

    // Default fallback
    return res.json({ allowed: true, plan: sub.plan });
  } catch (error: any) {
    console.error('[Subscription Action Validation Error]:', error);
    return res.status(500).json({
      allowed: false,
      error: error.message || 'Error validating subscription action.',
    });
  }
}
