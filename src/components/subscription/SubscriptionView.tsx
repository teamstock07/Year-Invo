import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Crown,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';

// Price & Currency Converter Engine
const getCurrencyDetails = (currencySymbol: string) => {
  switch (currencySymbol) {
    case '৳':
      return { rate: 120, isSuffix: true, space: true, decimals: 0 };
    case '€':
      return { rate: 0.92, isSuffix: false, space: false, decimals: 2 };
    case 'د.إ':
      return { rate: 3.67, isSuffix: true, space: true, decimals: 2 };
    case '₹':
      return { rate: 83, isSuffix: false, space: false, decimals: 0 };
    case 'Rs':
      return { rate: 278, isSuffix: false, space: true, decimals: 0 };
    case '¥':
      return { rate: 150, isSuffix: false, space: false, decimals: 0 };
    case '£':
      return { rate: 0.78, isSuffix: false, space: false, decimals: 2 };
    case '﷼':
      return { rate: 3.75, isSuffix: true, space: true, decimals: 2 };
    case '$':
    default:
      return { rate: 1, isSuffix: false, space: false, decimals: 2 };
  }
};

const formatPrice = (usdAmount: number, currencySymbol: string) => {
  if (usdAmount === 0) return 'FREE';
  const { rate, isSuffix, space, decimals } = getCurrencyDetails(currencySymbol);
  const val = usdAmount * rate;
  const numStr = decimals === 0 ? Math.round(val).toLocaleString() : val.toFixed(2);
  const sep = space ? ' ' : '';
  return isSuffix ? `${numStr}${sep}${currencySymbol}` : `${currencySymbol}${numStr}`;
};

interface SubDict {
  badge: string;
  title: string;
  subtitle: string;
  monthly: string;
  yearly: string;
  discountBadge: string;
  freePlanTitle: string;
  freePlanSub: string;
  freePlanDesc: string;
  freeLifetime: string;
  proPlanTitle: string;
  proPlanSub: string;
  proPlanDesc: string;
  proSpecialOffer: string;
  proFirstMonth: string;
  proSecondMonth: string;
  proPopularBadge: string;
  premiumPlanTitle: string;
  premiumPlanSub: string;
  premiumPlanDesc: string;
  recommended: string;
  currentPlanTag: string;
  activePlanBtn: string;
  switchToFreeBtn: string;
  upgradeProBtn: string;
  upgradePremiumBtn: string;
  everythingInFreePlus: string;
  everythingInProPlus: string;
  perMonth: string;
  perYear: string;
  saveYearlyTag: string;

  // Features
  upTo10Products: string;
  upTo25Products: string;
  unlimitedProducts: string;
  upTo500Posts: string;
  unlimitedPosts: string;
  basicProductMgmt: string;
  basicStockView: string;
  customerDirectory: string;
  orderHistory: string;
  basicReportAnalysis: string;
  mobileAppAccess: string;
  basicNotifications: string;
  standardSupport: string;

  advancedStockMgmt: string;
  pdfInvoices: string;
  detailedSalesReports: string;
  advancedAnalytics: string;
  mobileAppSync: string;
  onlineOrderTracking: string;

  sellSystemEnabled: string;
  sellSystemLocked: string;
  posSystemLocked: string;
  posSystemUnlocked: string;
  qrCodeLocked: string;
  qrCodeUnlocked: string;

  barcodePrinting: string;
  purchaseSupplierMgmt: string;
  multiStoreMultiUser: string;
  cloudBackupExport: string;
  profitLossReporting: string;
  apiPrioritySupport: string;

  // Feature Matrix Header
  matrixTitle: string;
  matrixSubtitle: string;
}

const subTranslations: Record<Language, SubDict> = {
  en: {
    badge: 'Subscription Plans & Pricing',
    title: 'Choose the Right Plan for Your Store',
    subtitle: 'Unlock features to manage inventory, point-of-sale, multi-store operations, and business reports.',
    monthly: 'Monthly Billing',
    yearly: 'Yearly Billing',
    discountBadge: 'Save 25%',
    freePlanTitle: 'Free Plan',
    freePlanSub: 'Starter Access',
    freePlanDesc: 'Basic inventory and store tools for getting started.',
    freeLifetime: 'Lifetime Free',
    proPlanTitle: 'Pro Plan',
    proPlanSub: 'Growing Business',
    proPlanDesc: 'Essential tools including PDF invoices, sell system, and reports.',
    proSpecialOffer: 'First month offer, then standard rate',
    proFirstMonth: '1st Month Special',
    proSecondMonth: '2nd month onwards',
    proPopularBadge: 'MOST POPULAR',
    premiumPlanTitle: 'Premium Plan',
    premiumPlanSub: 'Unlimited Business',
    premiumPlanDesc: 'Complete POS register, multi-store management, and custom branding.',
    recommended: 'RECOMMENDED',
    currentPlanTag: 'CURRENT PLAN',
    activePlanBtn: 'Current Active Plan',
    switchToFreeBtn: 'Switch to Free Plan',
    upgradeProBtn: 'Upgrade to Pro',
    upgradePremiumBtn: 'Upgrade to Premium',
    everythingInFreePlus: 'Everything in Free Plan, plus:',
    everythingInProPlus: 'Everything in Pro Plan, plus:',
    perMonth: '/ month',
    perYear: '/ year',
    saveYearlyTag: 'Save 25% with yearly billing',

    upTo10Products: 'Up to 10 Products Catalog',
    upTo25Products: 'Up to 25 Products Catalog',
    unlimitedProducts: 'Unlimited Products & Catalog',
    upTo500Posts: 'Up to 500 Sales Transactions / mo',
    unlimitedPosts: 'Unlimited Daily Sales Entries',
    basicProductMgmt: 'Basic Product Catalog Management',
    basicStockView: 'Basic Inventory & Stock Overview',
    customerDirectory: 'Customer & Supplier Directory',
    orderHistory: 'Order & Transaction History',
    basicReportAnalysis: 'Basic Sales Performance Summary',
    mobileAppAccess: 'Mobile Web App Access',
    basicNotifications: 'System Email Notifications',
    standardSupport: 'Standard Customer Support',

    advancedStockMgmt: 'Advanced Stock & Batch Tracking',
    pdfInvoices: 'PDF Invoice Generation & Printing',
    detailedSalesReports: 'Detailed Sales & Profit Reports',
    advancedAnalytics: 'Advanced Sales Analytics Dashboard',
    mobileAppSync: 'Real-time Mobile App Synchronization',
    onlineOrderTracking: 'Online Order Status Tracking',

    sellSystemEnabled: 'Sell System Included',
    sellSystemLocked: 'Sell System Not Included',
    posSystemLocked: 'POS Register Counter Locked',
    posSystemUnlocked: 'Full POS Register Counter Unlocked',
    qrCodeLocked: 'QR Code Payments Locked',
    qrCodeUnlocked: 'QR Code Generator & Payments',

    barcodePrinting: 'Barcode Generator & Label Printing',
    purchaseSupplierMgmt: 'Purchase Orders & Supplier Management',
    multiStoreMultiUser: 'Multi-Store & Staff Permissions',
    cloudBackupExport: 'Cloud Backup & Excel/PDF Data Export',
    profitLossReporting: 'Profit & Loss Financial Reporting',
    apiPrioritySupport: '24/7 Priority Support & API Access',

    matrixTitle: 'Feature Matrix Comparison',
    matrixSubtitle: 'Detailed comparison of capabilities across Free, Pro, and Premium plans.',
  },
  bn: {
    badge: 'সাবস্ক্রিপশন প্ল্যান ও প্রাইসিং',
    title: 'আপনার দোকানের জন্য সঠিক প্ল্যান বেছে নিন',
    subtitle: 'ইনভেন্টরি, পয়েন্ট-অফ-সেল, সেলস হিস্ট্রি ও রিপোর্ট ব্যবস্থার সকল সুবিধা আনলক করুন।',
    monthly: 'মাসিক বিলিং',
    yearly: 'বার্ষিক বিলিং',
    discountBadge: '২৫% সাশ্রয়',
    freePlanTitle: 'ফ্রি প্ল্যান',
    freePlanSub: 'স্টার্টার প্যাক',
    freePlanDesc: 'নতুন ছোট ব্যবসার জন্য বেসিক ইনভেন্টরি ও স্টোর টুলস।',
    freeLifetime: 'আজীবন ফ্রি',
    proPlanTitle: 'প্রো প্ল্যান',
    proPlanSub: 'গ্রোথ প্যাক',
    proPlanDesc: 'পিডিএফ ইনভয়েস, সেলস রিপোর্ট ও ক্যাটালগ সম্বলিত প্রো সার্ভিস।',
    proSpecialOffer: 'প্রথম মাসের জন্য বিশেষ ছাড়',
    proFirstMonth: '১ম মাস অফার',
    proSecondMonth: '২য় মাস থেকে',
    proPopularBadge: 'সর্বাধিক জনপ্রিয়',
    premiumPlanTitle: 'প্রিমিয়াম প্ল্যান',
    premiumPlanSub: 'আনলিমিটেড প্যাক',
    premiumPlanDesc: 'সম্পূর্ণ POS রেজিস্ট্রেশন, মাল্টি-স্টোর ও আনলিমিটেড সার্ভিস।',
    recommended: 'পরামর্শকৃত',
    currentPlanTag: 'বর্তমান প্ল্যান',
    activePlanBtn: 'সক্রিয় প্ল্যান',
    switchToFreeBtn: 'ফ্রি প্ল্যানে যান',
    upgradeProBtn: 'প্রো প্ল্যানে আপগ্রেড করুন',
    upgradePremiumBtn: 'প্রিমিয়ামে আপগ্রেড করুন',
    everythingInFreePlus: 'ফ্রি প্ল্যানের সকল সুবিধার সাথে:',
    everythingInProPlus: 'প্রো প্ল্যানের সকল সুবিধার সাথে:',
    perMonth: '/ মাস',
    perYear: '/ বছর',
    saveYearlyTag: 'বার্ষিক বিলে ২৫% সাশ্রয় করুন',

    upTo10Products: 'সর্বোচ্চ ১০টি পণ্য ক্যাটালগ',
    upTo25Products: 'সর্বোচ্চ ২৫টি পণ্য ক্যাটালগ',
    unlimitedProducts: 'আনলিমিটেড পণ্য ও ক্যাটালগ',
    upTo500Posts: 'মাসিক ৫০০টি সেলস এন্ট্রি',
    unlimitedPosts: 'আনলিমিটেড সেলস এন্ট্রি',
    basicProductMgmt: 'প্রাথমিক পণ্য ব্যবস্থাপনা',
    basicStockView: 'প্রাথমিক স্টক ভিউ',
    customerDirectory: 'কাস্টমার ও সরবরাহকারী ডিরেক্টরি',
    orderHistory: 'অর্ডার ও লেনদেনের ইতিহাস',
    basicReportAnalysis: 'প্রাথমিক সেলস রিপোর্ট সামারি',
    mobileAppAccess: 'মোবাইল ওয়েব অ্যাপ এক্সেস',
    basicNotifications: 'সিস্টেম ইমেইল নোটিফিকেশন',
    standardSupport: 'স্ট্যান্ডার্ড কাস্টমার সাপোর্ট',

    advancedStockMgmt: 'উন্নত স্টক ও ব্যাচ ট্র্যাকিং',
    pdfInvoices: 'প্রফেশনাল PDF ইনভয়েস প্রিন্ট',
    detailedSalesReports: 'বিস্তারিত বিক্রয় ও মুনাফা রিপোর্ট',
    advancedAnalytics: 'উন্নত সেলস অ্যানালিটিক্স ড্যাশবোর্ড',
    mobileAppSync: 'রিয়েল-টাইম মোবাইল অ্যাপ সিঙ্ক',
    onlineOrderTracking: 'অনলাইন অর্ডার ট্র্যাকিং',

    sellSystemEnabled: 'সেল সিস্টেম সুবিধাসমূহ অন্তর্ভুক্ত',
    sellSystemLocked: 'সেল সিস্টেম উপলব্ধ নয়',
    posSystemLocked: 'POS কাউন্টার লক করা',
    posSystemUnlocked: 'সম্পূর্ণ POS কাউন্টার আনলকড',
    qrCodeLocked: 'QR কোড পেমেন্ট লক করা',
    qrCodeUnlocked: 'QR কোড জেনারেটর ও পেমেন্ট',

    barcodePrinting: 'বারকোড জেনারেটর ও লেবেল প্রিন্ট',
    purchaseSupplierMgmt: 'পারচেজ অর্ডার ও সরবরাহকারী ব্যবস্থাপনা',
    multiStoreMultiUser: 'মাল্টি-স্টোর চ্যানেল ও স্টাফ পারমিশন',
    cloudBackupExport: 'ক্লাউড ব্যাকআপ ও ডাটা এক্সপোর্ট',
    profitLossReporting: 'সম্পূর্ণ লাভ-ক্ষতি আর্থিক রিপোর্ট',
    apiPrioritySupport: '২৪/৭ অগ্রাধিকার সহায়তা',

    matrixTitle: 'প্ল্যান তুলনামূলক তালিকা',
    matrixSubtitle: 'ফ্রি, প্রো এবং প্রিমিয়াম প্ল্যানের ফিচার সমূহের পার্থক্য দেখুন।',
  },
  ar: {
    badge: 'خطط الاشتراك والأسعار',
    title: 'اختر الخطة المناسبة لمتجرك',
    subtitle: 'إدارة المخزون والمبيعات والتقارير المالية بسهولة.',
    monthly: 'فواتير شهرية',
    yearly: 'فواتير سنوية',
    discountBadge: 'خصم 25%',
    freePlanTitle: 'الخطة المجانية',
    freePlanSub: 'بداية مجانية',
    freePlanDesc: 'أدوات أساسية لبدء إدارة متجرك.',
    freeLifetime: 'مجاني مدى الحياة',
    proPlanTitle: 'الخطة الاحترافية',
    proPlanSub: 'الأعمال النامية',
    proPlanDesc: 'فواتير PDF وتقارير المبيعات المتقدمة.',
    proSpecialOffer: 'عرض الشهر الأول ثم السعر العادي',
    proFirstMonth: 'الشهر الأول',
    proSecondMonth: 'من الشهر الثاني',
    proPopularBadge: 'الأكثر شعبية',
    premiumPlanTitle: 'الخطة الممتازة',
    premiumPlanSub: 'بلا حدود',
    premiumPlanDesc: 'نظام نقاط البيع الكامل وإدارة الفروع المتعددة.',
    recommended: 'موصى به',
    currentPlanTag: 'الخطة الحالية',
    activePlanBtn: 'الخطة النشطة حالياً',
    switchToFreeBtn: 'التحويل للمجانية',
    upgradeProBtn: 'الترقية إلى Pro',
    upgradePremiumBtn: 'الترقية إلى Premium',
    everythingInFreePlus: 'كل شيء في الخطة المجانية بالإضافة إلى:',
    everythingInProPlus: 'كل شيء في خطة Pro بالإضافة إلى:',
    perMonth: '/ شهر',
    perYear: '/ سنة',
    saveYearlyTag: 'وفر 25% مع الاشتراك السنوي',

    upTo10Products: 'حتى 10 منتجات',
    upTo25Products: 'حتى 25 منتجاً',
    unlimitedProducts: 'منتجات غير محدودة',
    upTo500Posts: 'حتى 500 عملية شهرياً',
    unlimitedPosts: 'عمليات غير محدودة',
    basicProductMgmt: 'إدارة المنتجات الأساسية',
    basicStockView: 'عرض المخزون الأساسي',
    customerDirectory: 'دليل العملاء والموردين',
    orderHistory: 'سجل الطلبات',
    basicReportAnalysis: 'ملخص التقارير',
    mobileAppAccess: 'وصول عبر تطبيق الجوال',
    basicNotifications: 'إشعارات البريد',
    standardSupport: 'دعم العملاء',

    advancedStockMgmt: 'تتبع المخزون المتقدم',
    pdfInvoices: 'طباعة فواتير PDF',
    detailedSalesReports: 'تقارير المبيعات والأرباح',
    advancedAnalytics: 'لوحة التحليلات المتقدمة',
    mobileAppSync: 'مزامنة التطبيق',
    onlineOrderTracking: 'تتبع الطلبات',

    sellSystemEnabled: 'نظام المبيعات مفعّل',
    sellSystemLocked: 'نظام المبيعات غير متوفر',
    posSystemLocked: 'نظام نقاط البيع مغلق',
    posSystemUnlocked: 'نظام نقاط البيع كامل مفعّل',
    qrCodeLocked: 'رمز QR مغلق',
    qrCodeUnlocked: 'مولد رمز QR والدفع',

    barcodePrinting: 'طباعة الباركود والملصقات',
    purchaseSupplierMgmt: 'إدارة المشتريات والموردين',
    multiStoreMultiUser: 'فروع متعددة وصلاحيات',
    cloudBackupExport: 'نسخ احتياطي وتصدير البيانات',
    profitLossReporting: 'تقارير الأرباح والخسائر',
    apiPrioritySupport: 'دعم أولوية 24/7',

    matrixTitle: 'مقارنة خطط الاشتراك',
    matrixSubtitle: 'مقارنة بين الخطة المجانية و Pro و Premium.',
  },
  ae: {
    badge: 'خطط الاشتراك والأسعار',
    title: 'اختر الخطة المناسبة لمتجرك',
    subtitle: 'إدارة المخزون والمبيعات والتقارير المالية بسهولة.',
    monthly: 'فواتير شهرية',
    yearly: 'فواتير سنوية',
    discountBadge: 'خصم 25%',
    freePlanTitle: 'الخطة المجانية',
    freePlanSub: 'بداية مجانية',
    freePlanDesc: 'أدوات أساسية لبدء إدارة متجرك.',
    freeLifetime: 'مجاني مدى الحياة',
    proPlanTitle: 'الخطة الاحترافية',
    proPlanSub: 'الأعمال النامية',
    proPlanDesc: 'فواتير PDF وتقارير المبيعات المتقدمة.',
    proSpecialOffer: 'عرض الشهر الأول ثم السعر العادي',
    proFirstMonth: 'الشهر الأول',
    proSecondMonth: 'من الشهر الثاني',
    proPopularBadge: 'الأكثر شعبية',
    premiumPlanTitle: 'الخطة الممتازة',
    premiumPlanSub: 'بلا حدود',
    premiumPlanDesc: 'نظام نقاط البيع الكامل وإدارة الفروع المتعددة.',
    recommended: 'موصى به',
    currentPlanTag: 'الخطة الحالية',
    activePlanBtn: 'الخطة النشطة حالياً',
    switchToFreeBtn: 'التحويل للمجانية',
    upgradeProBtn: 'الترقية إلى Pro',
    upgradePremiumBtn: 'الترقية إلى Premium',
    everythingInFreePlus: 'كل شيء في الخطة المجانية بالإضافة إلى:',
    everythingInProPlus: 'كل شيء في خطة Pro بالإضافة إلى:',
    perMonth: '/ شهر',
    perYear: '/ سنة',
    saveYearlyTag: 'وفر 25% مع الاشتراك السنوي',

    upTo10Products: 'حتى 10 منتجات',
    upTo25Products: 'حتى 25 منتجاً',
    unlimitedProducts: 'منتجات غير محدودة',
    upTo500Posts: 'حتى 500 عملية شهرياً',
    unlimitedPosts: 'عمليات غير محدودة',
    basicProductMgmt: 'إدارة المنتجات الأساسية',
    basicStockView: 'عرض المخزون الأساسي',
    customerDirectory: 'دليل العملاء والموردين',
    orderHistory: 'سجل الطلبات',
    basicReportAnalysis: 'ملخص التقارير',
    mobileAppAccess: 'وصول عبر تطبيق الجوال',
    basicNotifications: 'إشعارات البريد',
    standardSupport: 'دعم العملاء',

    advancedStockMgmt: 'تتبع المخزون المتقدم',
    pdfInvoices: 'طباعة فواتير PDF',
    detailedSalesReports: 'تقارير المبيعات والأرباح',
    advancedAnalytics: 'لوحة التحليلات المتقدمة',
    mobileAppSync: 'مزامنة التطبيق',
    onlineOrderTracking: 'تتبع الطلبات',

    sellSystemEnabled: 'نظام المبيعات مفعّل',
    sellSystemLocked: 'نظام المبيعات غير متوفر',
    posSystemLocked: 'نظام نقاط البيع مغلق',
    posSystemUnlocked: 'نظام نقاط البيع كامل مفعّل',
    qrCodeLocked: 'رمز QR مغلق',
    qrCodeUnlocked: 'مولد رمز QR والدفع',

    barcodePrinting: 'طباعة الباركود والملصقات',
    purchaseSupplierMgmt: 'إدارة المشتريات والموردين',
    multiStoreMultiUser: 'فروع متعددة وصلاحيات',
    cloudBackupExport: 'نسخ احتياطي وتصدير البيانات',
    profitLossReporting: 'تقارير الأرباح والخسائر',
    apiPrioritySupport: 'دعم أولوية 24/7',

    matrixTitle: 'مقارنة خطط الاشتراك',
    matrixSubtitle: 'مقارنة بين الخطة المجانية و Pro و Premium.',
  },
  hi: {
    badge: 'सब्सक्रिप्शन प्लान और मूल्य',
    title: 'अपने स्टोर के लिए सही प्लान चुनें',
    subtitle: 'इन्वेंटरी, बिक्री केंद्र (POS) और वित्तीय रिपोर्ट को आसानी से प्रबंधित करें।',
    monthly: 'मासिक बिलिंग',
    yearly: 'वार्षिक बिलिंग',
    discountBadge: '25% छूट',
    freePlanTitle: 'फ्री प्लान',
    freePlanSub: 'स्टार्टर एक्सेस',
    freePlanDesc: 'छोटे व्यवसायों के लिए बुनियादी इन्वेंट्री टूल।',
    freeLifetime: 'जीवनभर मुफ्त',
    proPlanTitle: 'प्रो प्लान',
    proPlanSub: 'ग्रोइंग बिजनेस',
    proPlanDesc: 'PDF इनवॉइस और विस्तृत बिक्री रिपोर्ट की सुविधा।',
    proSpecialOffer: 'प्रथम माह विशेष मूल्य',
    proFirstMonth: 'पहला महीना ऑफर',
    proSecondMonth: 'दूसरे महीने से',
    proPopularBadge: 'सर्वाधिक लोकप्रिय',
    premiumPlanTitle: 'प्रीमियम प्लान',
    premiumPlanSub: 'असीमित एक्सेस',
    premiumPlanDesc: 'संपूर्ण POS और मल्टी-स्टोर प्रबंधन सुविधाएं।',
    recommended: 'अनुशंसित',
    currentPlanTag: 'वर्तमान प्लान',
    activePlanBtn: 'सक्रिय प्लान',
    switchToFreeBtn: 'फ्री प्लान पर जाएं',
    upgradeProBtn: 'प्रो में अपग्रेड करें',
    upgradePremiumBtn: 'प्रीमियम में अपग्रेड करें',
    everythingInFreePlus: 'फ्री प्लान की सभी सुविधाओं के साथ:',
    everythingInProPlus: 'प्रो प्लान की सभी सुविधाओं के साथ:',
    perMonth: '/ माह',
    perYear: '/ वर्ष',
    saveYearlyTag: 'वार्षिक बिलिंग पर 25% बचाएं',

    upTo10Products: '10 उत्पादों तक सीमित',
    upTo25Products: '25 उत्पादों तक सीमित',
    unlimitedProducts: 'असीमित उत्पाद कैटलॉग',
    upTo500Posts: '500 मासिक बिक्री प्रविष्टियां',
    unlimitedPosts: 'असीमित बिक्री प्रविष्टियां',
    basicProductMgmt: 'बुनियादी उत्पाद प्रबंधन',
    basicStockView: 'बुनियादी स्टॉक व्यू',
    customerDirectory: 'ग्राहक निर्देशिका',
    orderHistory: 'लेनदेन का इतिहास',
    basicReportAnalysis: 'बिक्री रिपोर्ट सारांश',
    mobileAppAccess: 'मोबाइल ऐप एक्सेस',
    basicNotifications: 'सिस्टम ईमेल सूचनाएं',
    standardSupport: 'मानक सहायता',

    advancedStockMgmt: 'उन्नत स्टॉक ट्रैकिंग',
    pdfInvoices: 'PDF इनवॉइस प्रिंटिंग',
    detailedSalesReports: 'विस्तृत लाभ रिपोर्ट',
    advancedAnalytics: 'उन्नत विश्लेषिकी डैशबोर्ड',
    mobileAppSync: 'मोबाइल ऐप सिंक',
    onlineOrderTracking: 'ऑनलाइन ऑर्डर ट्रैकिंग',

    sellSystemEnabled: 'बिक्री प्रणाली शामिल',
    sellSystemLocked: 'बिक्री प्रणाली उपलब्ध नहीं',
    posSystemLocked: 'POS काउंटर लॉक है',
    posSystemUnlocked: 'संपूर्ण POS काउंटर अनलॉक',
    qrCodeLocked: 'QR कोड भुगतान लॉक है',
    qrCodeUnlocked: 'QR कोड और भुगतान',

    barcodePrinting: 'बारकोड जनरेटर',
    purchaseSupplierMgmt: 'आपूर्तिकर्ता प्रबंधन',
    multiStoreMultiUser: 'मल्टी-स्टोर अनुमतियां',
    cloudBackupExport: 'डेटा बैकअप व निर्यात',
    profitLossReporting: 'लाभ-हानि वित्तीय रिपोर्ट',
    apiPrioritySupport: '24/7 प्राथमिकता सहायता',

    matrixTitle: 'फीचर तुलना तालिका',
    matrixSubtitle: 'फ्री, प्रो और प्रीमियम प्लान की विशेषताओं की तुलना करें।',
  },
  ur: {
    badge: 'سبسکرپشن پلانز اور قیمتیں',
    title: 'اپنے اسٹور کے لیے بہترین پلان منتخب کریں',
    subtitle: 'انوینٹری، POS اور رپورٹ مینجمنٹ کے لیے بہترین پلانز۔',
    monthly: 'ماہانہ بلنگ',
    yearly: 'سالانہ بلنگ',
    discountBadge: '25% بچت',
    freePlanTitle: 'فری پلان',
    freePlanSub: 'اسٹارٹر رسائی',
    freePlanDesc: 'چھوٹے کاروباروں کے لیے بنیادی ٹولز۔',
    freeLifetime: 'تاحیات مفت',
    proPlanTitle: 'پرو پلان',
    proPlanSub: 'ترقی پذیر کاروبار',
    proPlanDesc: 'پی ڈی ایف انوائسز اور سیلز رپورٹس کے ساتھ۔',
    proSpecialOffer: 'پہلے مہینے کی رعایت',
    proFirstMonth: 'پہلا مہینہ پیشکش',
    proSecondMonth: 'دوسرے مہینے سے',
    proPopularBadge: 'سب سے مقبول',
    premiumPlanTitle: 'پریمیئم پلان',
    premiumPlanSub: 'لامحدود سہولیات',
    premiumPlanDesc: 'مکمل POS اور ملٹی اسٹور مینجمنٹ۔',
    recommended: 'تجویز کردہ',
    currentPlanTag: 'موجودہ پلان',
    activePlanBtn: 'فعال پلان',
    switchToFreeBtn: 'فری پر منتقل ہوں',
    upgradeProBtn: 'پرو میں اپ گریڈ کریں',
    upgradePremiumBtn: 'پریمیئم میں اپ گریڈ کریں',
    everythingInFreePlus: 'فری پلان کی تمام سہولیات کے ساتھ:',
    everythingInProPlus: 'پرو پلان کی تمام سہولیات کے ساتھ:',
    perMonth: '/ ماہ',
    perYear: '/ سال',
    saveYearlyTag: 'سالانہ بلنگ پر 25% بچائیں',

    upTo10Products: '10 پروڈکٹس تک',
    upTo25Products: '25 پروڈکٹس تک',
    unlimitedProducts: 'لامحدود پروڈکٹس',
    upTo500Posts: '500 ماہانہ انٹریز',
    unlimitedPosts: 'لامحدود انٹریز',
    basicProductMgmt: 'بنیادی پروڈکٹ مینجمنٹ',
    basicStockView: 'بنیادی اسٹاک ویو',
    customerDirectory: 'کسٹمر ڈائرکٹری',
    orderHistory: 'لین دین کی ہسٹری',
    basicReportAnalysis: 'رپورٹ خلاصہ',
    mobileAppAccess: 'موبائل ایپ رسائی',
    basicNotifications: 'ای میل اطلاعات',
    standardSupport: 'معیاری سپورٹ',

    advancedStockMgmt: 'ترقی یافتہ اسٹاک ٹریکنگ',
    pdfInvoices: 'PDF انوائس پرنٹنگ',
    detailedSalesReports: 'تفصیلی سیلز رپورٹس',
    advancedAnalytics: 'سیلز اینالیٹکس',
    mobileAppSync: 'موبائل ایپ سنک',
    onlineOrderTracking: 'آرڈر اسٹیٹس ٹریکنگ',

    sellSystemEnabled: 'سیل سسٹم شامل ہے',
    sellSystemLocked: 'سیل سسٹم دستیاب نہیں',
    posSystemLocked: 'POS کاؤنٹر لاک ہے',
    posSystemUnlocked: 'مکمل POS کاؤنٹر انلاک',
    qrCodeLocked: 'QR کوڈ لاک ہے',
    qrCodeUnlocked: 'QR کوڈ اور ادائیگی',

    barcodePrinting: 'بارکوڈ جینیریٹر',
    purchaseSupplierMgmt: 'سپلائر مینجمنٹ',
    multiStoreMultiUser: 'ملٹی اسٹور رسائی',
    cloudBackupExport: 'کلاؤڈ بیک اپ',
    profitLossReporting: 'مالیاتی رپورٹس',
    apiPrioritySupport: '24/7 سپورٹ',

    matrixTitle: 'پلانز کا موازنہ',
    matrixSubtitle: 'فری، پرو اور پریمیئم پلان کا موازنہ۔',
  },
  fr: {
    badge: 'Offres d’Abonnement & Tarifs',
    title: 'Choisissez le forfait adapté à votre commerce',
    subtitle: 'Gérez votre inventaire, votre caisse POS et vos rapports financiers.',
    monthly: 'Facturation Mensuelle',
    yearly: 'Facturation Annuelle',
    discountBadge: '25% de réduction',
    freePlanTitle: 'Plan Gratuit',
    freePlanSub: 'Accès Débutant',
    freePlanDesc: 'Fonctionnalités de base pour démarrer votre magasin.',
    freeLifetime: 'Gratuit à vie',
    proPlanTitle: 'Plan Pro',
    proPlanSub: 'Entreprise en Croissance',
    proPlanDesc: 'Factures PDF et rapports détaillés sur les ventes.',
    proSpecialOffer: 'Offre spéciale du 1er mois',
    proFirstMonth: '1er mois spécial',
    proSecondMonth: 'À partir du 2e mois',
    proPopularBadge: 'LE PLUS POPULAIRE',
    premiumPlanTitle: 'Plan Premium',
    premiumPlanSub: 'Illimité',
    premiumPlanDesc: 'Caisse POS complète et gestion multi-magasins.',
    recommended: 'RECOMMANDÉ',
    currentPlanTag: 'PLAN ACTUEL',
    activePlanBtn: 'Plan Actif',
    switchToFreeBtn: 'Passer au Gratuit',
    upgradeProBtn: 'Passer au Pro',
    upgradePremiumBtn: 'Passer au Premium',
    everythingInFreePlus: 'Tout du plan Gratuit, plus :',
    everythingInProPlus: 'Tout du plan Pro, plus :',
    perMonth: '/ mois',
    perYear: '/ an',
    saveYearlyTag: 'Économisez 25% en facturation annuelle',

    upTo10Products: 'Jusqu’à 10 produits',
    upTo25Products: 'Jusqu’à 25 produits',
    unlimitedProducts: 'Produits illimités',
    upTo500Posts: 'Jusqu’à 500 ventes/mois',
    unlimitedPosts: 'Ventes illimitées',
    basicProductMgmt: 'Gestion des produits',
    basicStockView: 'Aperçu du stock',
    customerDirectory: 'Répertoire clients',
    orderHistory: 'Historique des commandes',
    basicReportAnalysis: 'Aperçu des rapports',
    mobileAppAccess: 'Accès application mobile',
    basicNotifications: 'Notifications e-mail',
    standardSupport: 'Support client',

    advancedStockMgmt: 'Suivi de stock avancé',
    pdfInvoices: 'Factures PDF imprimables',
    detailedSalesReports: 'Rapports de ventes détaillés',
    advancedAnalytics: 'Tableau de bord analytique',
    mobileAppSync: 'Synchronisation mobile',
    onlineOrderTracking: 'Suivi des commandes',

    sellSystemEnabled: 'Système de vente inclus',
    sellSystemLocked: 'Système de vente non inclus',
    posSystemLocked: 'Caisse POS verrouillée',
    posSystemUnlocked: 'Caisse POS déverrouillée',
    qrCodeLocked: 'Paiement QR verrouillé',
    qrCodeUnlocked: 'Générateur QR et paiements',

    barcodePrinting: 'Générateur de code-barres',
    purchaseSupplierMgmt: 'Gestion des fournisseurs',
    multiStoreMultiUser: 'Accès multi-boutiques',
    cloudBackupExport: 'Sauvegarde cloud',
    profitLossReporting: 'Rapport financier pertes & profits',
    apiPrioritySupport: 'Support prioritaire 24/7',

    matrixTitle: 'Comparatif des Fonctionnalités',
    matrixSubtitle: 'Comparez les forfaits Gratuit, Pro et Premium.',
  },
  de: {
    badge: 'Abonnements & Preise',
    title: 'Wählen Sie den passenden Tarif für Ihr Geschäft',
    subtitle: 'Verwalten Sie Inventar, POS-Kasse und Finanzen ohne Aufwand.',
    monthly: 'Monatliche Abrechnung',
    yearly: 'Jährliche Abrechnung',
    discountBadge: '25% Rabatt',
    freePlanTitle: 'Kostenloser Tarif',
    freePlanSub: 'Starter-Zugang',
    freePlanDesc: 'Grundlegende Funktionen für den Einstieg.',
    freeLifetime: 'Dauerhaft kostenlos',
    proPlanTitle: 'Pro-Tarif',
    proPlanSub: 'Wachsendes Geschäft',
    proPlanDesc: 'Inklusive PDF-Rechnungen und detaillierter Berichte.',
    proSpecialOffer: 'Sonderpreis im ersten Monat',
    proFirstMonth: '1. Monat Angebot',
    proSecondMonth: 'Ab dem 2. Monat',
    proPopularBadge: 'BELIEBTESTER TARIF',
    premiumPlanTitle: 'Premium-Tarif',
    premiumPlanSub: 'Unbegrenzt',
    premiumPlanDesc: 'Vollständige POS-Kasse und Filialverwaltung.',
    recommended: 'EMPFOHLEN',
    currentPlanTag: 'AKTUELLER TARIF',
    activePlanBtn: 'Aktiver Tarif',
    switchToFreeBtn: 'Zu Kostenlos wechseln',
    upgradeProBtn: 'Auf Pro upgraden',
    upgradePremiumBtn: 'Auf Premium upgraden',
    everythingInFreePlus: 'Alles aus Kostenlos, plus:',
    everythingInProPlus: 'Alles aus Pro, plus:',
    perMonth: '/ Monat',
    perYear: '/ Jahr',
    saveYearlyTag: '25% sparen bei jährlicher Abrechnung',

    upTo10Products: 'Bis zu 10 Produkte',
    upTo25Products: 'Bis zu 25 Produkte',
    unlimitedProducts: 'Unbegrenzte Produkte',
    upTo500Posts: 'Bis zu 500 Verkäufe/Monat',
    unlimitedPosts: 'Unbegrenzte Verkäufe',
    basicProductMgmt: 'Produktverwaltung',
    basicStockView: 'Lagerübersicht',
    customerDirectory: 'Kundenverzeichnis',
    orderHistory: 'Bestellhistorie',
    basicReportAnalysis: 'Berichtsübersicht',
    mobileAppAccess: 'Mobile Web-App',
    basicNotifications: 'E-Mail-Benachrichtigungen',
    standardSupport: 'Standard-Support',

    advancedStockMgmt: 'Erweiterte Lagerverfolgung',
    pdfInvoices: 'PDF-Rechnungsdruck',
    detailedSalesReports: 'Detaillierte Verkaufsberichte',
    advancedAnalytics: 'Analyse-Dashboard',
    mobileAppSync: 'App-Synchronisation',
    onlineOrderTracking: 'Bestellverfolgung',

    sellSystemEnabled: 'Verkaufssystem enthalten',
    sellSystemLocked: 'Verkaufssystem nicht enthalten',
    posSystemLocked: 'POS-Kasse gesperrt',
    posSystemUnlocked: 'POS-Kasse freigeschaltet',
    qrCodeLocked: 'QR-Code gesperrt',
    qrCodeUnlocked: 'QR-Code & Zahlungen',

    barcodePrinting: 'Barcode-Generator',
    purchaseSupplierMgmt: 'Lieferantenverwaltung',
    multiStoreMultiUser: 'Filialverwaltung',
    cloudBackupExport: 'Cloud-Sicherung',
    profitLossReporting: 'Gewinn- & Verlustberichte',
    apiPrioritySupport: '24/7 Prioritäts-Support',

    matrixTitle: 'Tarifvergleich',
    matrixSubtitle: 'Funktionsvergleich zwischen Kostenlos, Pro und Premium.',
  },
  es: {
    badge: 'Planes y Precios',
    title: 'Elija el plan ideal para su tienda',
    subtitle: 'Gestione su inventario, caja registradora y finanzas fácilmente.',
    monthly: 'Facturación Mensual',
    yearly: 'Facturación Anual',
    discountBadge: 'Ahorre 25%',
    freePlanTitle: 'Plan Gratuito',
    freePlanSub: 'Inicio Gratuito',
    freePlanDesc: 'Herramientas básicas para comenzar su negocio.',
    freeLifetime: 'Gratis de por vida',
    proPlanTitle: 'Plan Pro',
    proPlanSub: 'Negocio en Crecimiento',
    proPlanDesc: 'Facturas en PDF e informes detallados de ventas.',
    proSpecialOffer: 'Oferta especial del primer mes',
    proFirstMonth: 'Oferta 1.er mes',
    proSecondMonth: 'A partir del 2.º mes',
    proPopularBadge: 'MÁS POPULAR',
    premiumPlanTitle: 'Plan Premium',
    premiumPlanSub: 'Ilimitado',
    premiumPlanDesc: 'Caja POS completa y gestión multitienda.',
    recommended: 'RECOMENDADO',
    currentPlanTag: 'PLAN ACTUAL',
    activePlanBtn: 'Plan Activo',
    switchToFreeBtn: 'Cambiar a Gratuito',
    upgradeProBtn: 'Actualizar a Pro',
    upgradePremiumBtn: 'Actualizar a Premium',
    everythingInFreePlus: 'Todo lo del Plan Gratuito, más:',
    everythingInProPlus: 'Todo lo del Plan Pro, más:',
    perMonth: '/ mes',
    perYear: '/ año',
    saveYearlyTag: 'Ahorre 25% con facturación anual',

    upTo10Products: 'Hasta 10 productos',
    upTo25Products: 'Hasta 25 productos',
    unlimitedProducts: 'Productos ilimitados',
    upTo500Posts: 'Hasta 500 ventas/mes',
    unlimitedPosts: 'Ventas ilimitadas',
    basicProductMgmt: 'Gestión de productos',
    basicStockView: 'Vista de inventario',
    customerDirectory: 'Directorio de clientes',
    orderHistory: 'Historial de pedidos',
    basicReportAnalysis: 'Resumen de informes',
    mobileAppAccess: 'Acceso móvil web',
    basicNotifications: 'Notificaciones por correo',
    standardSupport: 'Soporte al cliente',

    advancedStockMgmt: 'Seguimiento de stock avanzado',
    pdfInvoices: 'Impresión de facturas PDF',
    detailedSalesReports: 'Informes detallados de ventas',
    advancedAnalytics: 'Panel de analítica',
    mobileAppSync: 'Sincronización móvil',
    onlineOrderTracking: 'Seguimiento de pedidos',

    sellSystemEnabled: 'Sistema de venta incluido',
    sellSystemLocked: 'Sistema de venta no incluido',
    posSystemLocked: 'Caja POS bloqueada',
    posSystemUnlocked: 'Caja POS desbloqueada',
    qrCodeLocked: 'Pago por QR bloqueado',
    qrCodeUnlocked: 'Código QR y pagos',

    barcodePrinting: 'Generador de códigos de barra',
    purchaseSupplierMgmt: 'Gestión de proveedores',
    multiStoreMultiUser: 'Gestión multitienda',
    cloudBackupExport: 'Copia de seguridad en la nube',
    profitLossReporting: 'Informes de pérdidas y ganancias',
    apiPrioritySupport: 'Soporte prioritario 24/7',

    matrixTitle: 'Comparativa de Planes',
    matrixSubtitle: 'Compare las funciones de los planes Gratuito, Pro y Premium.',
  },
  zh: {
    badge: '订阅计划与价格',
    title: '选择最适合您店铺的计划',
    subtitle: '全面提升您的库存、POS收银、多门店与财务管理能力。',
    monthly: '按月计费',
    yearly: '按年计费',
    discountBadge: '立省 25%',
    freePlanTitle: '免费计划',
    freePlanSub: '基础入门',
    freePlanDesc: '适合起步阶段的基本库存与店铺管理功能。',
    freeLifetime: '终身免费',
    proPlanTitle: '专业版 (Pro)',
    proPlanSub: '成长型企业',
    proPlanDesc: '包含PDF发票打印、销售系统与详细财务报告。',
    proSpecialOffer: '首月优惠价，次月恢复标准价',
    proFirstMonth: '首月特惠',
    proSecondMonth: '次月起',
    proPopularBadge: '最受欢迎',
    premiumPlanTitle: '高级版 (Premium)',
    premiumPlanSub: '无限制版本',
    premiumPlanDesc: '完整POS收银台、多门店管理与高级自定义。',
    recommended: '官方推荐',
    currentPlanTag: '当前计划',
    activePlanBtn: '当前正在使用',
    switchToFreeBtn: '切换至免费版',
    upgradeProBtn: '升级至专业版',
    upgradePremiumBtn: '升级至高级版',
    everythingInFreePlus: '包含免费计划的所有功能，外加：',
    everythingInProPlus: '包含专业计划的所有功能，外加：',
    perMonth: '/ 月',
    perYear: '/ 年',
    saveYearlyTag: '按年计费立省 25%',

    upTo10Products: '最多 10 个商品目录',
    upTo25Products: '最多 25 个商品目录',
    unlimitedProducts: '无限商品与目录',
    upTo500Posts: '每月最多 500 笔销售记录',
    unlimitedPosts: '无限销售记录',
    basicProductMgmt: '基础商品管理',
    basicStockView: '基础库存查看',
    customerDirectory: '客户与供应商目录',
    orderHistory: '订单历史记录',
    basicReportAnalysis: '销售报告摘要',
    mobileAppAccess: '移动端网页访问',
    basicNotifications: '系统邮件通知',
    standardSupport: '标准客户支持',

    advancedStockMgmt: '高级库存与批次跟踪',
    pdfInvoices: '专业 PDF 发票打印',
    detailedSalesReports: '详细销售与利润报告',
    advancedAnalytics: '高级销售分析仪表板',
    mobileAppSync: '移动端实时同步',
    onlineOrderTracking: '订单状态跟踪',

    sellSystemEnabled: '包含销售系统',
    sellSystemLocked: '不包含销售系统',
    posSystemLocked: 'POS 收银台已锁定',
    posSystemUnlocked: '完整 POS 收银台已解锁',
    qrCodeLocked: '二维码支付已锁定',
    qrCodeUnlocked: '二维码生成与支付',

    barcodePrinting: '条形码生成与打印',
    purchaseSupplierMgmt: '采购与供应商管理',
    multiStoreMultiUser: '多门店与员工权限',
    cloudBackupExport: '云端备份与数据导出',
    profitLossReporting: '损益财务报告',
    apiPrioritySupport: '24/7 优先客户支持',

    matrixTitle: '计划功能对比表',
    matrixSubtitle: '对比免费版、专业版与高级版的功能差异。',
  },
  ja: {
    badge: 'サブスクリプション料金プラン',
    title: '店舗に最適なプランをお選びください',
    subtitle: '在庫管理、POSレジ、複数店舗、財務レポートをスピーディーに拡張。',
    monthly: '月払い',
    yearly: '年払い',
    discountBadge: '25% OFF',
    freePlanTitle: 'フリープラン',
    freePlanSub: 'スターター',
    freePlanDesc: '店舗運営を始めるための基本ツール。',
    freeLifetime: '永久無料',
    proPlanTitle: 'プロプラン (Pro)',
    proPlanSub: '成長店舗向け',
    proPlanDesc: 'PDF請求書発行や詳細売上レポートを利用可能。',
    proSpecialOffer: '初月特別オファー',
    proFirstMonth: '初月特別価格',
    proSecondMonth: '2ヶ月目以降',
    proPopularBadge: '一番人気',
    premiumPlanTitle: 'プレミアム (Premium)',
    premiumPlanSub: '無制限プラン',
    premiumPlanDesc: 'フル機能POSレジと複数店舗管理システム。',
    recommended: 'おすすめ',
    currentPlanTag: '現在のプラン',
    activePlanBtn: '利用中のプラン',
    switchToFreeBtn: 'フリープランに変更',
    upgradeProBtn: 'プロプランにアップグレード',
    upgradePremiumBtn: 'プレミアムにアップグレード',
    everythingInFreePlus: 'フリープランの全機能に加え:',
    everythingInProPlus: 'プロプランの全機能に加え:',
    perMonth: '/ 月',
    perYear: '/ 年',
    saveYearlyTag: '年払いで 25% お得になります',

    upTo10Products: '最大 10 商品まで登録',
    upTo25Products: '最大 25 商品まで登録',
    unlimitedProducts: '無制限の商品カタログ',
    upTo500Posts: '月間 500 件の販売登録',
    unlimitedPosts: '無制限の販売登録',
    basicProductMgmt: '基本商品管理',
    basicStockView: '基本在庫表示',
    customerDirectory: '顧客・仕入先ディレクトリ',
    orderHistory: '注文・取引履歴',
    basicReportAnalysis: '売上レポート概要',
    mobileAppAccess: 'モバイルWebアプリ利用',
    basicNotifications: 'システムメール通知',
    standardSupport: '標準カスタマーサポート',

    advancedStockMgmt: '高度な在庫＆ロット追跡',
    pdfInvoices: 'PDF 請求書発行',
    detailedSalesReports: '詳細売上＆利益レポート',
    advancedAnalytics: '売上分析ダッシュボード',
    mobileAppSync: 'アプリ同期',
    onlineOrderTracking: '注文ステータス追跡',

    sellSystemEnabled: '販売システム利用可能',
    sellSystemLocked: '販売システム利用不可',
    posSystemLocked: 'POSレジ機能 ロック中',
    posSystemUnlocked: '完全POSレジ機能 ロック解除',
    qrCodeLocked: 'QR決済 ロック中',
    qrCodeUnlocked: 'QRコード生成＆QR決済',

    barcodePrinting: 'バーコード生成＆印刷',
    purchaseSupplierMgmt: '仕入れ・サプライヤー管理',
    multiStoreMultiUser: '複数店舗＆権限設定',
    cloudBackupExport: 'クラウドバックアップ',
    profitLossReporting: '損益財務レポート',
    apiPrioritySupport: '24/7 優先サポート',

    matrixTitle: '機能比較表',
    matrixSubtitle: 'フリー、プロ、プレミアムの機能比較。',
  },
};

export const SubscriptionView: React.FC = () => {
  const { user, updateUser, language, settings, requestSubscription } = useApp();
  const currentPlan = user?.subscriptionPlan || 'Free';
  const currencySymbol = settings.currency || '৳';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Request Modal State
  const [requestPlan, setRequestPlan] = useState<'Pro' | 'Business' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash / Nagad');
  const [transactionId, setTransactionId] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const langDict = subTranslations[language] || subTranslations['en'];

  // Plan Prices in USD base
  const prices = {
    free: { monthly: 0, yearly: 0 },
    pro: {
      monthly: 2.99,
      monthlyFirstDiscount: 1.25,
      yearlyTotal: 26.91,
      yearlyPerMonth: 2.24,
    },
    premium: {
      monthly: 5.00,
      yearlyTotal: 45.00,
      yearlyPerMonth: 3.75,
    },
  };

  const handleSelectPlan = (planName: 'Free' | 'Pro' | 'Business' | 'Premium') => {
    if (planName === 'Free') {
      updateUser({ subscriptionPlan: 'Free' });
      return;
    }
    setRequestPlan(planName === 'Premium' ? 'Business' : planName);
  };

  const handleFormSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestPlan) return;

    const amount = requestPlan === 'Pro' ? 350 : 600;

    requestSubscription({
      requestedPlan: requestPlan,
      billingCycle,
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      amount,
    });

    setRequestPlan(null);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5c01]/10 text-[#ff5c01] border border-[#ff5c01]/20 text-xs font-bold uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#ff5c01]" />
          <span>{langDict.badge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {langDict.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {langDict.subtitle}
        </p>

        {/* Status Banners */}
        {user?.subscriptionStatus === 'pending' && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              Your request to upgrade to the <strong>{user.pendingPlan} Plan</strong> is currently pending approval by the Platform Owner.
            </span>
          </div>
        )}

        {submittedSuccess && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              Subscription request submitted successfully! The platform owner will review and activate your plan.
            </span>
          </div>
        )}

        {/* Billing Toggle Switch */}
        <div className="pt-3 flex items-center justify-center">
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {langDict.monthly}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{langDict.yearly}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                billingCycle === 'yearly' ? 'bg-white text-[#ff5c01]' : 'bg-[#ff5c01]/10 text-[#ff5c01]'
              }`}>
                {langDict.discountBadge}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid (Clean, Unified 1-2 Primary Color Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* 1. FREE PLAN CARD */}
        <div
          className={`relative rounded-3xl p-6 transition-all flex flex-col justify-between bg-white dark:bg-slate-900 border ${
            currentPlan === 'Free'
              ? 'border-2 border-slate-700 dark:border-slate-500 shadow-md'
              : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {currentPlan === 'Free' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
              {langDict.currentPlanTag}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {langDict.freePlanTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {langDict.freePlanDesc}
            </p>

            <div className="my-5">
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {formatPrice(0, currencySymbol)}
              </div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                {langDict.freeLifetime}
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.sellSystemEnabled}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.upTo10Products}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.upTo500Posts}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.basicProductMgmt}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.basicStockView}</span>
              </div>

              <div className="pt-2 space-y-2 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{langDict.posSystemLocked}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{langDict.qrCodeLocked}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              disabled={currentPlan === 'Free'}
              onClick={() => handleSelectPlan('Free')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentPlan === 'Free'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700/60'
                  : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'
              }`}
            >
              {currentPlan === 'Free' ? langDict.activePlanBtn : langDict.switchToFreeBtn}
            </button>
          </div>
        </div>

        {/* 2. PRO PLAN CARD (HIGHLIGHTED POPULAR) */}
        <div
          className={`relative rounded-3xl p-6 transition-all flex flex-col justify-between bg-white dark:bg-slate-900 border-2 border-[#ff5c01] shadow-lg ring-2 ring-[#ff5c01]/10 ${
            currentPlan === 'Pro' || currentPlan === 'Tier2' ? 'ring-[#ff5c01]/30' : ''
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ff5c01] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
            {currentPlan === 'Pro' || currentPlan === 'Tier2' ? langDict.currentPlanTag : langDict.proPopularBadge}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ff5c01]" />
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {langDict.proPlanTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {langDict.proPlanDesc}
            </p>

            <div className="my-5">
              {billingCycle === 'monthly' ? (
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#ff5c01]">
                      {formatPrice(prices.pro.monthlyFirstDiscount, currencySymbol)}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      / {langDict.proFirstMonth}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                    {langDict.proSecondMonth}: {formatPrice(prices.pro.monthly, currencySymbol)} {langDict.perMonth}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                      {formatPrice(prices.pro.yearlyTotal, currencySymbol)}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{langDict.perYear}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#ff5c01] mt-0.5">
                    ({formatPrice(prices.pro.yearlyPerMonth, currencySymbol)} {langDict.perMonth}) • {langDict.saveYearlyTag}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold text-[#ff5c01]">
                {langDict.everythingInFreePlus}
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.sellSystemEnabled}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.upTo25Products}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.pdfInvoices}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.detailedSalesReports}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.advancedStockMgmt}</span>
              </div>

              <div className="pt-2 space-y-2 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{langDict.posSystemLocked}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{langDict.qrCodeLocked}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              disabled={currentPlan === 'Pro' || currentPlan === 'Tier2'}
              onClick={() => handleSelectPlan('Pro')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentPlan === 'Pro' || currentPlan === 'Tier2'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700/60'
                  : 'bg-[#ff5c01] hover:bg-[#e05100] text-white shadow-md shadow-[#ff5c01]/25'
              }`}
            >
              {currentPlan === 'Pro' || currentPlan === 'Tier2' ? langDict.activePlanBtn : langDict.upgradeProBtn}
            </button>
          </div>
        </div>

        {/* 3. PREMIUM PLAN CARD */}
        <div
          className={`relative rounded-3xl p-6 transition-all flex flex-col justify-between bg-white dark:bg-slate-900 border ${
            currentPlan === 'Premium' || currentPlan === 'Business' || currentPlan === 'Lifetime'
              ? 'border-2 border-[#ff5c01] shadow-md'
              : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#ff5c01]/60'
          }`}
        >
          {currentPlan === 'Premium' || currentPlan === 'Business' || currentPlan === 'Lifetime' ? (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#ff5c01] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
              {langDict.currentPlanTag}
            </div>
          ) : (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider border border-[#ff5c01]/30">
              {langDict.recommended}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#ff5c01]" />
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {langDict.premiumPlanTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {langDict.premiumPlanDesc}
            </p>

            <div className="my-5">
              {billingCycle === 'monthly' ? (
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                      {formatPrice(prices.premium.monthly, currencySymbol)}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{langDict.perMonth}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#ff5c01] mt-0.5">
                    Unlocks POS Register & All Features
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                      {formatPrice(prices.premium.yearlyTotal, currencySymbol)}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{langDict.perYear}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#ff5c01] mt-0.5">
                    ({formatPrice(prices.premium.yearlyPerMonth, currencySymbol)} {langDict.perMonth}) • {langDict.saveYearlyTag}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold text-[#ff5c01]">
                {langDict.everythingInProPlus}
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.unlimitedProducts}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.posSystemUnlocked}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.qrCodeUnlocked}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.barcodePrinting}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.purchaseSupplierMgmt}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.multiStoreMultiUser}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              disabled={currentPlan === 'Premium' || currentPlan === 'Business' || currentPlan === 'Lifetime'}
              onClick={() => handleSelectPlan('Premium')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentPlan === 'Premium' || currentPlan === 'Business' || currentPlan === 'Lifetime'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700/60'
                  : 'bg-[#ff5c01] hover:bg-[#e05100] text-white shadow-md shadow-[#ff5c01]/20'
              }`}
            >
              {currentPlan === 'Premium' || currentPlan === 'Business' || currentPlan === 'Lifetime'
                ? langDict.activePlanBtn
                : langDict.upgradePremiumBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Matrix Table (Clean, Professional Theme) */}
      <div className="pt-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {langDict.matrixTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {langDict.matrixSubtitle}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                <tr>
                  <th className="p-3.5 min-w-[200px]">System Features</th>
                  <th className="p-3.5 text-center min-w-[100px]">Free</th>
                  <th className="p-3.5 text-center min-w-[120px] text-[#ff5c01]">Pro ($1.25 / $2.99)</th>
                  <th className="p-3.5 text-center min-w-[120px] text-[#ff5c01]">Premium ($5.00)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-3.5 font-bold">Catalog Product Limit</td>
                  <td className="p-3.5 text-center text-slate-500">10 Products</td>
                  <td className="p-3.5 text-center font-bold">25 Products</td>
                  <td className="p-3.5 text-center font-bold text-[#ff5c01]">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Sell System & Order History</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">POS Counter Register</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">Unlocked</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">QR Code Generator & Payments</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">Unlocked</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Barcode Generator & Sticker Print</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">PDF Invoice Printing</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Purchase & Supplier Orders</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Multi-Store & Role Permissions</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PLAN UPGRADE PAYMENT REQUEST MODAL */}
      {requestPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Upgrade to {requestPlan} Plan</span>
              </h3>
              <button
                onClick={() => setRequestPlan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Submit your request for the <strong>{requestPlan} Plan ({billingCycle})</strong>. The platform owner will review your payment details and approve your upgrade.
            </p>

            <form onSubmit={handleFormSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#ff5c01] cursor-pointer"
                >
                  <option value="bKash / Nagad (Mobile Wallet)">bKash / Nagad (Mobile Wallet)</option>
                  <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Direct Admin Cash">Direct Admin Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Transaction ID / Sender Number (Optional)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TRX982347192"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-400 font-bold">Estimated Cost:</span>
                <span className="font-black text-emerald-400">
                  {requestPlan === 'Pro' ? '৳350 / month' : '৳600 / month'}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestPlan(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-lg shadow-[#ff5c01]/20"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
