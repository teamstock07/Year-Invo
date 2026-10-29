import React from 'react';
import { useApp } from '../../context/AppContext';
import { getPlanLimits, PlanLimits } from '../../config/pricing';
import { isTeamStockAdmin } from '../../utils/brand';
import {
  Crown,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Zap,
  LayoutDashboard,
  Clock,
} from 'lucide-react';

export type PremiumFeatureKey =
  | 'isPosAllowed'
  | 'isPersonalLedgerAllowed'
  | 'isQrBarcodeAllowed'
  | 'isTeamManagementAllowed'
  | 'isPayrollAllowed'
  | 'isSmartReorderAllowed'
  | 'isAiInsightsAllowed'
  | 'isCustomerLoyaltyAllowed'
  | 'isAuditLogAllowed'
  | 'isAdvancedPermissionsAllowed';

interface PremiumFeatureGuardProps {
  featureKey: PremiumFeatureKey;
  featureNameEn: string;
  featureNameBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

export const ALL_PREMIUM_FEATURES = [
  {
    key: 'isPosAllowed',
    nameEn: 'POS & Sell',
    nameBn: 'POS ও ক্যাশ কাউন্টার বিলিং',
    descEn: 'Full counter register with quick barcode scanning, discounts & instant thermal receipt printing.',
    descBn: 'দ্রুত বারকোড স্ক্যানিং, ডিসকাউন্ট ও রসিদ প্রিন্টিংসহ ফুল ক্যাশ কাউন্টার।',
  },
  {
    key: 'isPersonalLedgerAllowed',
    nameEn: 'Personal Ledger',
    nameBn: 'ব্যক্তিগত খাতা',
    descEn: 'Independent digital ledger for personal loans and borrowing, isolated from business accounts.',
    descBn: 'ব্যক্তিগত লেনদেন ও ধার-দেনার সম্পূর্ণ স্বাধীন ডিজিটাল হিসাব খাতা।',
  },
  {
    key: 'isQrBarcodeAllowed',
    nameEn: 'Barcode & QR Code Generator',
    nameBn: 'বারকোড ও কিউআর জেনারেটর',
    descEn: 'Generate custom product barcodes, QR labels, and print in multi-format A4 sheets & thermal rolls.',
    descBn: 'পণ্যভিত্তিক কাস্টম বারকোড ও কিউআর লেবেল জেনারেটর এবং প্রিন্ট সুবিধা।',
  },
  {
    key: 'isTeamManagementAllowed',
    nameEn: 'Team Management',
    nameBn: 'টিম মেম্বার ম্যানেজমেন্ট',
    descEn: 'Invite staff members, assign branches, and manage team access seamlessly.',
    descBn: 'দোকানের কর্মী ও স্টাফ যুক্ত করুন এবং ব্রাঞ্চ অনুযায়ী দায়িত্ব বণ্টন করুন।',
  },
  {
    key: 'isPayrollAllowed',
    nameEn: 'Employee Payroll & Salaries',
    nameBn: 'কর্মচারী বেতন ও পে-রোল',
    descEn: 'Calculate monthly wages, bonuses, deductions, and print salary slips.',
    descBn: 'মাসিক বেতন হিসাব, বোনাস, কর্তন ও স্যালারি স্লিপ তৈরির সুবিধা।',
  },
  {
    key: 'isSmartReorderAllowed',
    nameEn: 'Smart Reorder',
    nameBn: 'স্মার্ট রি-অর্ডার ও স্টক প্রেডিকশন',
    descEn: 'Automated low-stock alerts with predictive supplier purchase suggestions.',
    descBn: 'স্টক ঘাটতি প্রেডিকশন এবং স্বয়ংক্রিয় রি-অর্ডার অ্যালার্ট।',
  },
  {
    key: 'isAiInsightsAllowed',
    nameEn: 'AI Business Assistant',
    nameBn: 'এআই বিজনেস অ্যাসিস্ট্যান্ট',
    descEn: 'AI-driven business analytics, sales forecasts, and financial health intelligence.',
    descBn: 'কৃত্রিম বুদ্ধিমত্তার মাধ্যমে বিক্রয় বিশ্লেষণ ও পূর্বাভাস রিপোর্ট।',
  },
  {
    key: 'isCustomerLoyaltyAllowed',
    nameEn: 'Customer Loyalty & Points',
    nameBn: 'কাস্টমার লয়ালটি ও পয়েন্ট প্রোগ্রাম',
    descEn: 'Reward regular buyers with points, discounts, and tiered customer retention programs.',
    descBn: 'গ্রাহক ধরে রাখতে রিওয়ার্ড পয়েন্ট ও ডিসকাউন্ট পলিসি।',
  },
  {
    key: 'isAuditLogAllowed',
    nameEn: 'Audit Log & Activity Tracking',
    nameBn: 'অডিট লগ ও সিস্টেম অ্যাক্টিভিটি',
    descEn: 'Complete tamper-evident log of all system edits, deletions, and staff operations.',
    descBn: 'সকল ইউজার ও স্টাফদের প্রতিটি কার্যকলাপের বিস্তারিত লগ রেকর্ড।',
  },
  {
    key: 'isAdvancedPermissionsAllowed',
    nameEn: 'Advanced Permissions & Roles',
    nameBn: 'অ্যাডভান্সড টিম পারমিশন',
    descEn: 'Granular access control across POS, inventory, reports, and financial tabs.',
    descBn: 'কাস্টম রোল তৈরি করে নির্দিষ্ট মেনু বা অ্যাকশন লক/আনলক নিয়ন্ত্রণ।',
  },
];

export const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  featureKey,
  featureNameEn,
  featureNameBn,
  descriptionEn,
  descriptionBn,
  icon: Icon = Lock,
  children,
}) => {
  const { user, language, setActiveTab } = useApp();

  const isBn = language === 'bn';
  const email = (user?.email || '').toLowerCase();
  const isSuperAdmin = isTeamStockAdmin(email) || user?.role === 'PlatformOwner';

  // Compute plan limits
  const planLimits = getPlanLimits(user?.subscriptionPlan, user?.subscriptionStatus === 'expired');

  // Check access: Super admin, Lifetime, or if the specific limit is true
  const hasAccess =
    isSuperAdmin ||
    user?.subscriptionPlan === 'Lifetime' ||
    user?.subscriptionPlan === 'Premium' ||
    user?.subscriptionPlan === 'Business' ||
    Boolean(planLimits[featureKey]);

  if (hasAccess) {
    return <>{children}</>;
  }

  const isPending = user?.subscriptionStatus === 'pending';
  const pendingPlanName = user?.pendingPlan || 'Pro';
  const isProUser = user?.subscriptionPlan === 'Pro';
  const isFreeUser = !user?.subscriptionPlan || user?.subscriptionPlan === 'Free';

  const upgradeTargetPlan = isProUser ? 'Premium' : 'Pro';
  const upgradeBtnText = isProUser
    ? (isBn ? 'প্রিমিয়ামে আপগ্রেড করুন' : 'Upgrade to Premium')
    : (isBn ? 'প্রো প্ল্যানে আপগ্রেড করুন' : 'Upgrade to Pro');

  const currentPlanName =
    user?.subscriptionPlan === 'Pro'
      ? isBn
        ? 'প্রো প্ল্যান'
        : 'Pro Plan'
      : user?.subscriptionPlan === 'Free'
      ? isBn
        ? 'ফ্রি ট্রায়াল'
        : 'Free Trial'
      : user?.subscriptionPlan || (isBn ? 'ফ্রি ট্রায়াল' : 'Free Trial');

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Pending State Banner if subscription request is awaiting approval */}
      {isPending ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 p-6 sm:p-10 shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold tracking-wider uppercase">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                {isBn ? 'আবেদনটি পেন্ডিং রয়েছে' : 'Request Pending Approval'}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Crown className="w-6 h-6 animate-pulse" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isBn ? `${featureNameBn} (অনুমোদনের অপেক্ষায়)` : `${featureNameEn} (Pending Approval)`}
                </h1>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {isBn
                  ? `আপনার ${pendingPlanName} প্ল্যানে আপগ্রেড করার আবেদনটি জমা দেওয়া হয়েছে এবং বর্তমানে পেন্ডিং রয়েছে। প্ল্যাটফর্ম ওনার (Owner Panel) থেকে এটি অ্যাক্টিভ/অনুমোদন করার সাথে সাথে এই প্যানেলটি স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে যাবে।`
                  : `Your request to upgrade to the ${pendingPlanName} Plan has been submitted and is pending review. As soon as the platform owner approves it from the Owner Panel, this feature and panel will be activated automatically.`}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                  <span>{isBn ? 'বর্তমান প্ল্যান:' : 'Current Plan:'}</span>
                  <span className="text-slate-200 font-bold">{currentPlanName}</span>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  <Clock className="w-3 h-3" />
                  <span>{isBn ? `পেন্ডিং আপগ্রেড: ${pendingPlanName}` : `Pending Plan: ${pendingPlanName}`}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => setActiveTab('subscription')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Crown className="w-4 h-4" />
                <span>{isBn ? 'আবেদনের স্ট্যাটাস দেখুন' : 'View Request Status'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{isBn ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Locked Banner */
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-amber-500/30 p-6 sm:p-10 shadow-2xl mb-8">
          {/* Glow decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold tracking-wider uppercase">
                <Crown className="w-3.5 h-3.5" />
                {isBn ? 'লক করা ফিচার' : 'Locked Feature'}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isBn ? featureNameBn : featureNameEn}
                </h1>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {isBn
                  ? descriptionBn ||
                    (isProUser
                      ? `এই ফিচারটি শুধুমাত্র প্রিমিয়াম (Premium) সাবস্ক্রিপশন প্ল্যানের অন্তর্ভুক্ত। আপনার বর্তমান প্ল্যান (${currentPlanName})-এ এটি উপলব্ধ নয়।`
                      : `এই ফিচারটি ব্যবহার করতে প্রো বা প্রিমিয়াম সাবস্ক্রিপশনে আপগ্রেড করুন। আপনার বর্তমান প্ল্যান (${currentPlanName})-এ এটি লক করা আছে।`)
                  : descriptionEn ||
                    (isProUser
                      ? `This feature is exclusively included in the Premium Plan. It is not available on your current ${currentPlanName}.`
                      : `This feature is locked on the ${currentPlanName}. Upgrade your subscription to access this and other advanced features.`)}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                  <span>{isBn ? 'আপনার বর্তমান প্ল্যান:' : 'Your Current Plan:'}</span>
                  <span className="text-amber-400 font-bold">{currentPlanName}</span>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <Lock className="w-3 h-3" />
                  <span>{isBn ? `প্রয়োজনীয় আপগ্রেড: ${upgradeTargetPlan}` : `Required Upgrade: ${upgradeTargetPlan}`}</span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => setActiveTab('subscription')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Crown className="w-4 h-4" />
                <span>{upgradeBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{isBn ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10 Premium Features Overview Box */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              {isBn ? 'প্রিমিয়াম প্ল্যানে আপনি যা যা পাচ্ছেন:' : 'Everything Included in the Premium Plan:'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isBn
                ? 'প্রো প্ল্যানের সমস্ত সুবিধার সাথে এই ১০টি শক্তিশালী ফিচার অন্তর্ভুক্ত:'
                : 'All Pro Plan core business features PLUS these 10 high-impact management tools:'}
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isBn ? 'সম্পূর্ণ নিরাপদ ও সক্রিয়' : 'Full Enterprise Suite'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_PREMIUM_FEATURES.map((item, idx) => {
            const isThisFeature = item.key === featureKey;
            return (
              <div
                key={item.key}
                className={`p-4 rounded-xl border transition-all ${
                  isThisFeature
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isThisFeature
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isThisFeature ? (
                      <Crown className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold ${
                          isThisFeature ? 'text-amber-300' : 'text-white'
                        }`}
                      >
                        {isBn ? item.nameBn : item.nameEn}
                      </h3>
                      {isThisFeature && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {isBn ? 'লক করা' : 'This Screen'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isBn ? item.descBn : item.descEn}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            {isBn
              ? 'প্ল্যান আপগ্রেড করার পর তাৎক্ষণিকভাবে সকল ফিচার আনলক হয়ে যাবে।'
              : 'Upgrading unlocks instant access across all connected devices and browsers.'}
          </div>
          <button
            onClick={() => setActiveTab('subscription')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow transition-all hover:scale-[1.02]"
          >
            <Crown className="w-4 h-4" />
            <span>{isBn ? 'প্ল্যানসমূহ দেখুন ও আপগ্রেড করুন' : 'View Plans & Upgrade'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
