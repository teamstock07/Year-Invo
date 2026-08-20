import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { openPaddleCheckout } from '../../utils/paddleCheckout';
import { calculatePlanPricing, BillingCycle, getPlanPriceFormatted, isBangladeshCountry } from '../../config/pricing';
import {
  getExchangeRate,
  convertCurrency,
  formatCurrencyAmount,
  normalizeCurrencyCode,
} from '../../services/currencyService';
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Crown,
  Sparkles,
  Zap,
  Lock,
  Loader2,
  Globe,
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  Send,
  Check,
  Info,
  DollarSign,
} from 'lucide-react';
import {
  PAYMENT_REGIONS,
  PaymentRegionId,
  PaymentProviderConfig,
  getEnabledProviders,
  getProviderById,
} from '../../config/paymentProviders';
import {
  BkashLogo,
  NagadLogo,
  RocketLogo,
  BankTransferLogo,
  PayPalLogoComponent,
  CardLogosComponent,
  BangladeshPaymentMethodsBar,
} from '../common/PaymentLogos';

interface SubDict {
  badge: string;
  title: string;
  subtitle: string;
  monthly: string;
  sixMonths: string;
  yearly: string;
  fiveYear: string;
  discountBadge: string;
  sixMonthsDiscount: string;
  fiveYearDiscount: string;
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
  perSixMonths: string;
  perYear: string;
  perFiveYear: string;
  saveYearlyTag: string;
  saveFiveYearTag: string;

  // Features
  upTo5Products: string;
  upTo500Stock: string;
  upTo50SalesDay: string;
  upTo10Products: string;
  upTo25Products: string;
  unlimitedProducts: string;
  unlimitedStock: string;
  unlimitedSales: string;
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
  payrollIncluded: string;
  aiInsightsIncluded: string;

  sellSystemEnabled: string;
  sellSystemLocked: string;
  posSystemLocked: string;
  posSystemUnlocked: string;
  teamLocked: string;
  teamUnlocked: string;
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

const subTranslations: Record<string, SubDict> = {
  en: {
    badge: 'Subscription Plans & Pricing',
    title: 'Choose the Right Plan for Your Store',
    subtitle: 'Unlock features to manage inventory, point-of-sale, team roles, multi-store operations, and business reports.',
    monthly: '1 Month',
    sixMonths: '6 Months',
    yearly: '1 Year',
    fiveYear: '5 Years',
    discountBadge: 'Save 20%',
    sixMonthsDiscount: 'Save 15%',
    fiveYearDiscount: 'Save 25%',
    freePlanTitle: 'Free Trial',
    freePlanSub: '15 Days Trial',
    freePlanDesc: 'Explore core inventory and store management for a 15-day trial period.',
    freeLifetime: '15 Days Free Trial',
    proPlanTitle: 'Pro Plan',
    proPlanSub: 'Unlimited Inventory',
    proPlanDesc: 'Unlimited products, inventory, sales, employee payouts, and AI insights.',
    proSpecialOffer: 'Special offer, standard rate applies',
    proFirstMonth: 'Special Rate',
    proSecondMonth: 'Regular',
    proPopularBadge: 'MOST POPULAR',
    premiumPlanTitle: 'Premium Plan',
    premiumPlanSub: 'Complete POS & Team System',
    premiumPlanDesc: 'Full POS register, Team Management, QR Generator, and Multi-Branch.',
    recommended: 'RECOMMENDED',
    currentPlanTag: 'CURRENT PLAN',
    activePlanBtn: 'Current Active Plan',
    switchToFreeBtn: 'Switch to Free Trial',
    upgradeProBtn: 'Upgrade to Pro',
    upgradePremiumBtn: 'Upgrade to Premium',
    everythingInFreePlus: 'Everything in Free Trial, plus:',
    everythingInProPlus: 'Everything in Pro Plan, plus:',
    perMonth: '/ month',
    perSixMonths: '/ 6 months',
    perYear: '/ year',
    perFiveYear: '/ 5 years',
    saveYearlyTag: 'Save with 1-year billing',
    saveFiveYearTag: 'Save 25% with 5-year billing',

    upTo5Products: 'Max 5 Products in Catalog',
    upTo500Stock: 'Max 500 Total Stock Units',
    upTo50SalesDay: 'Max 50 Sales Transactions / Day',
    upTo10Products: 'Up to 10 Products Catalog',
    upTo25Products: 'Up to 25 Products Catalog',
    unlimitedProducts: 'Unlimited Products & Catalog',
    unlimitedStock: 'Unlimited Inventory Stock',
    unlimitedSales: 'Unlimited Daily Sales Transactions',
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
    payrollIncluded: 'Employee Payroll & Salary Tracking',
    aiInsightsIncluded: 'AI Business Intelligence & Forecasting',

    sellSystemEnabled: 'Sell System Included',
    sellSystemLocked: 'Sell System Not Included',
    posSystemLocked: 'POS Counter Locked (Requires Premium)',
    posSystemUnlocked: 'Full POS Register & Cash Counter',
    teamLocked: 'Team Management Locked (Requires Premium)',
    teamUnlocked: 'Team Staff Management & Roles',
    qrCodeLocked: 'QR Code Generator Locked',
    qrCodeUnlocked: 'QR Code Generator & Payments',

    barcodePrinting: 'Barcode Generator & Label Printing',
    purchaseSupplierMgmt: 'Purchase Orders & Supplier Management',
    multiStoreMultiUser: 'Multi-Store & Staff Permissions',
    cloudBackupExport: 'Cloud Backup & Excel/PDF Data Export',
    profitLossReporting: 'Profit & Loss Financial Reporting',
    apiPrioritySupport: '24/7 Priority Support & API Access',

    matrixTitle: 'Feature Matrix Comparison',
    matrixSubtitle: 'Detailed comparison of capabilities across Free Trial, Pro, and Premium plans.',
  },
  bn: {
    badge: 'সাবস্ক্রিপশন প্ল্যান ও প্রাইসিং',
    title: 'আপনার দোকানের জন্য সঠিক প্ল্যান বেছে নিন',
    subtitle: 'ইনভেন্টরি, পয়েন্ট-অফ-সেল, টিম মেম্বার, সেলস হিস্ট্রি ও রিপোর্ট ব্যবস্থার সকল সুবিধা আনলক করুন।',
    monthly: '১ মাস',
    sixMonths: '৬ মাস',
    yearly: '১ বছর',
    fiveYear: '৫ বছর',
    discountBadge: '২০% ছাড়',
    sixMonthsDiscount: '১৫% সাশ্রয়',
    fiveYearDiscount: '২৫% ছাড়',
    freePlanTitle: 'ফ্রি ট্রায়াল',
    freePlanSub: '১৫ দিনের ট্রায়াল',
    freePlanDesc: '১৫ দিনের ট্রায়াল মেয়াদে স্টোর ও ইনভেন্টরি টেস্ট করুন।',
    freeLifetime: '১৫ দিনের ফ্রি ট্রায়াল',
    proPlanTitle: 'প্রো প্ল্যান',
    proPlanSub: 'আনলিমিটেড স্টক ও সেলস',
    proPlanDesc: 'আনলিমিটেড প্রডাক্ট, আনলিমিটেড বিক্রি, কর্মচারী বেতন ও এআই ইনসাইটস।',
    proSpecialOffer: 'বিশেষ সাশ্রয়ী অফার',
    proFirstMonth: 'স্পেশাল রেট',
    proSecondMonth: 'নিয়মিত',
    proPopularBadge: 'সর্বাধিক জনপ্রিয়',
    premiumPlanTitle: 'প্রিমিয়াম প্ল্যান',
    premiumPlanSub: 'সম্পূর্ণ POS ও টিম সিস্টেম',
    premiumPlanDesc: 'সম্পূর্ণ POS ক্যাশ কাউন্টার, টিম মেম্বার ম্যানেজমেন্ট, কিউআর ও মাল্টি-ব্রাঞ্চ।',
    recommended: 'পরামর্শকৃত',
    currentPlanTag: 'বর্তমান প্ল্যান',
    activePlanBtn: 'সক্রিয় প্ল্যান',
    switchToFreeBtn: 'ফ্রি ট্রায়ালে যান',
    upgradeProBtn: 'প্রো প্ল্যানে আপগ্রেড করুন',
    upgradePremiumBtn: 'প্রিমিয়ামে আপগ্রেড করুন',
    everythingInFreePlus: 'ফ্রি ট্রায়ালের সকল সুবিধার সাথে:',
    everythingInProPlus: 'প্রো প্ল্যানের সকল সুবিধার সাথে:',
    perMonth: '/ মাস',
    perSixMonths: '/ ৬ মাস',
    perYear: '/ বছর',
    perFiveYear: '/ ৫ বছর',
    saveYearlyTag: 'বার্ষিক বিলে বিশাল সাশ্রয় করুন',
    saveFiveYearTag: '৫ বছরের বিলে ২৫% অতিরিক্ত সাশ্রয়',

    upTo5Products: 'সর্বোচ্চ ৫ টি পণ্য ক্যাটালগ',
    upTo500Stock: 'সর্বোচ্চ ৫০০ ইউনিট মোট স্টক',
    upTo50SalesDay: 'দৈনিক সর্বোচ্চ ৫০ টি বিক্রি',
    upTo10Products: 'সর্বোচ্চ ১০টি পণ্য ক্যাটালগ',
    upTo25Products: 'সর্বোচ্চ ২৫টি পণ্য ক্যাটালগ',
    unlimitedProducts: 'আনলিমিটেড পণ্য ও ক্যাটালগ',
    unlimitedStock: 'আনলিমিটেড ইনভেন্টরি স্টক',
    unlimitedSales: 'আনলিমিটেড দৈনিক বিক্রি',
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
    payrollIncluded: 'কর্মচারী বেতন ও পে-রোল ট্র্যাকিং',
    aiInsightsIncluded: 'এআই বিজনেস ইনসাইটস ও পূর্বাভাস',

    sellSystemEnabled: 'সেল সিস্টেম সুবিধাসমূহ অন্তর্ভুক্ত',
    sellSystemLocked: 'সেল সিস্টেম উপলব্ধ নয়',
    posSystemLocked: 'POS কাউন্টার লকড (প্রিমিয়াম প্রয়োজন)',
    posSystemUnlocked: 'সম্পূর্ণ POS কাউন্টার আনলকড',
    teamLocked: 'টিম ম্যানেজমেন্ট লকড (প্রিমিয়াম প্রয়োজন)',
    teamUnlocked: 'টিম মেম্বার ও রোল ম্যানেজমেন্ট',
    qrCodeLocked: 'QR কোড পেমেন্ট লক করা',
    qrCodeUnlocked: 'QR কোড জেনারেটর ও পেমেন্ট',

    barcodePrinting: 'বারকোড জেনারেটর ও লেবেল প্রিন্ট',
    purchaseSupplierMgmt: 'পারচেজ অর্ডার ও সরবরাহকারী ব্যবস্থাপনা',
    multiStoreMultiUser: 'মাল্টি-স্টোর চ্যানেল ও স্টাফ পারমিশন',
    cloudBackupExport: 'ক্লাউড ব্যাকআপ ও ডাটা এক্সপোর্ট',
    profitLossReporting: 'সম্পূর্ণ লাভ-ক্ষতি আর্থিক রিপোর্ট',
    apiPrioritySupport: '২৪/৭ অগ্রাধিকার সহায়তা',

    matrixTitle: 'প্ল্যান তুলনামূলক তালিকা',
    matrixSubtitle: 'ফ্রি ট্রায়াল, প্রো এবং প্রিমিয়াম প্ল্যানের বৈশিষ্ট্যের তুলনা দেখুন।',
  },
  ar: {
    badge: 'خطط الاشتراك والأسعار',
    title: 'اختر الخطة المناسبة لمتجرك',
    subtitle: 'إدارة المخزون والمبيعات والتقارير المالية بسهولة.',
    monthly: 'شهر واحد',
    sixMonths: '6 أشهر',
    yearly: 'سنة واحدة',
    fiveYear: '5 سنوات',
    discountBadge: 'وفر 20%',
    sixMonthsDiscount: 'وفر 15%',
    fiveYearDiscount: 'وفر 25%',
    freePlanTitle: 'تجربة مجانية',
    freePlanSub: 'تجربة 15 يوماً',
    freePlanDesc: 'أدوات أساسية لمدة 15 يوماً مجاناً.',
    freeLifetime: '15 يوماً تجربة مجانية',
    proPlanTitle: 'الخطة الاحترافية Pro',
    proPlanSub: 'مخزون ومبيعات غير محدودة',
    proPlanDesc: 'منتجات غير محدودة، فواتير PDF، رواتب الموظفين، ورؤى الذكاء الاصطناعي.',
    proSpecialOffer: 'عرض التوفير',
    proFirstMonth: 'السعر المخفض',
    proSecondMonth: 'عادي',
    proPopularBadge: 'الأكثر شعبية',
    premiumPlanTitle: 'الخطة الممتازة Premium',
    premiumPlanSub: 'نقاط بيع وفريق عمل متكامل',
    premiumPlanDesc: 'نظام نقاط البيع الكامل وإدارة الفروع المتعددة وإدارة الفريق.',
    recommended: 'موصى به',
    currentPlanTag: 'الخطة الحالية',
    activePlanBtn: 'الخطة النشطة حالياً',
    switchToFreeBtn: 'التحويل للتجربة المجانية',
    upgradeProBtn: 'الترقية إلى Pro',
    upgradePremiumBtn: 'الترقية إلى Premium',
    everythingInFreePlus: 'كل شيء في التجربة المجانية بالإضافة إلى:',
    everythingInProPlus: 'كل شيء في خطة Pro بالإضافة إلى:',
    perMonth: '/ شهر',
    perSixMonths: '/ 6 أشهر',
    perYear: '/ سنة',
    perFiveYear: '/ 5 سنوات',
    saveYearlyTag: 'وفر مع الاشتراك السنوي',
    saveFiveYearTag: 'وفر 25% مع اشتراك 5 سنوات',

    upTo5Products: 'حتى 5 منتجات',
    upTo500Stock: 'حتى 500 وحدة مخزون',
    upTo50SalesDay: 'حتى 50 عملية بيع يومياً',
    upTo10Products: 'حتى 10 منتجات',
    upTo25Products: 'حتى 25 منتجاً',
    unlimitedProducts: 'منتجات غير محدودة',
    unlimitedStock: 'مخزون غير محدود',
    unlimitedSales: 'مبيعات يومية غير محدودة',
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
    payrollIncluded: 'إدارة رواتب الموظفين',
    aiInsightsIncluded: 'رؤى الأعمال بالذكاء الاصطناعي',

    sellSystemEnabled: 'نظام المبيعات مفعّل',
    sellSystemLocked: 'نظام المبيعات غير متوفر',
    posSystemLocked: 'نظام POS مغلق (يتطلب Premium)',
    posSystemUnlocked: 'نظام نقاط البيع كامل مفعّل',
    teamLocked: 'إدارة الفريق مغلقة (تتطلب Premium)',
    teamUnlocked: 'إدارة فريق العمل والأدوار',
    qrCodeLocked: 'رمز QR مغلق',
    qrCodeUnlocked: 'مولد رمز QR والدفع',

    barcodePrinting: 'طباعة الباركود والملصقات',
    purchaseSupplierMgmt: 'إدارة المشتريات والموردين',
    multiStoreMultiUser: 'فروع متعددة وصلاحيات',
    cloudBackupExport: 'نسخ احتياطي وتصدير البيانات',
    profitLossReporting: 'تقارير الأرباح والخسائر',
    apiPrioritySupport: 'دعم أولوية 24/7',

    matrixTitle: 'مقارنة خطط الاشتراك',
    matrixSubtitle: 'مقارنة بين التجربة المجانية و Pro و Premium.',
  },
  hi: {
    badge: 'सदस्यता योजनाएं और मूल्य निर्धारण',
    title: 'अपनी दुकान के लिए सही प्लान चुनें',
    subtitle: 'इन्वेंट्री, पॉइंट-ऑफ-सेल, टीम प्रबंधन और वित्तीय रिपोर्टिंग के लिए सभी सुविधाओं को अनलॉक करें।',
    monthly: '1 माह',
    sixMonths: '6 माह',
    yearly: '1 वर्ष',
    fiveYear: '5 वर्ष',
    discountBadge: '20% छूट',
    sixMonthsDiscount: '15% छूट',
    fiveYearDiscount: '25% छूट',
    freePlanTitle: 'फ्री ट्रायल',
    freePlanSub: '15 दिनों का ट्रायल',
    freePlanDesc: '15 दिनों के परीक्षण के लिए बुनियादी इन्वेंट्री और स्टोर टूल्स।',
    freeLifetime: '15 दिन निःशुल्क परीक्षण',
    proPlanTitle: 'प्रो प्लान',
    proPlanSub: 'असीमित स्टॉक और बिक्री',
    proPlanDesc: 'असीमित उत्पाद, असीमित बिक्री, वेतन ट्रैकिंग और AI इनसाइट्स।',
    proSpecialOffer: 'विशेष ऑफर',
    proFirstMonth: 'विशेष दर',
    proSecondMonth: 'नियमित',
    proPopularBadge: 'सर्वाधिक लोकप्रिय',
    premiumPlanTitle: 'प्रीमियम प्लान',
    premiumPlanSub: 'संपूर्ण POS और टीम सिस्टम',
    premiumPlanDesc: 'पूर्ण POS काउंटर, टीम प्रबंधन, QR जनरेटर और मल्टी-ब्रांच।',
    recommended: 'अनुशंसित',
    currentPlanTag: 'वर्तमान प्लान',
    activePlanBtn: 'सक्रिय प्लान',
    switchToFreeBtn: 'फ्री ट्रायल पर जाएं',
    upgradeProBtn: 'प्रो में अपग्रेड करें',
    upgradePremiumBtn: 'प्रीमियम में अपग्रेड करें',
    everythingInFreePlus: 'फ्री ट्रायल की सभी सुविधाओं के साथ:',
    everythingInProPlus: 'प्रो प्लान की सभी सुविधाओं के साथ:',
    perMonth: '/ माह',
    perSixMonths: '/ 6 माह',
    perYear: '/ वर्ष',
    perFiveYear: '/ 5 वर्ष',
    saveYearlyTag: 'वार्षिक बिलिंग पर बचत करें',
    saveFiveYearTag: '5-वर्षीय बिलिंग पर 25% अतिरिक्त बचत',

    upTo5Products: 'अधिकतम 5 उत्पाद',
    upTo500Stock: 'अधिकतम 500 यूनिट कुल स्टॉक',
    upTo50SalesDay: 'प्रतिदिन अधिकतम 50 बिक्री',
    upTo10Products: '10 उत्पादों तक',
    upTo25Products: '25 उत्पादों तक',
    unlimitedProducts: 'असीमित उत्पाद',
    unlimitedStock: 'असीमित इन्वेंट्री स्टॉक',
    unlimitedSales: 'असीमित दैनिक लेनदेन',
    upTo500Posts: '500 मासिक लेनदेन',
    unlimitedPosts: 'असीमित लेनदेन',
    basicProductMgmt: 'बुनियादी उत्पाद प्रबंधन',
    basicStockView: 'बुनियादी स्टॉक दृश्य',
    customerDirectory: 'ग्राहक और आपूर्तिकर्ता सूची',
    orderHistory: 'ऑर्डर इतिहास',
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
    payrollIncluded: 'कर्मचारी वेतन व पे-रोल',
    aiInsightsIncluded: 'AI व्यापार विश्लेषण',

    sellSystemEnabled: 'बिक्री प्रणाली शामिल',
    sellSystemLocked: 'बिक्री प्रणाली उपलब्ध नहीं',
    posSystemLocked: 'POS काउंटर लॉक (प्रीमियम आवश्यक)',
    posSystemUnlocked: 'संपूर्ण POS काउंटर अनलॉक',
    teamLocked: 'टीम प्रबंधन लॉक (प्रीमियम आवश्यक)',
    teamUnlocked: 'टीम सदस्य व भूमिका प्रबंधन',
    qrCodeLocked: 'QR कोड लॉक है',
    qrCodeUnlocked: 'QR कोड और बारकोड जनरेटर',

    barcodePrinting: 'बारकोड जनरेटर',
    purchaseSupplierMgmt: 'आपूर्तिकर्ता प्रबंधन',
    multiStoreMultiUser: 'मल्टी-स्टोर अनुमतियां',
    cloudBackupExport: 'डेटा बैकअप व निर्यात',
    profitLossReporting: 'लाभ-हानि वित्तीय रिपोर्ट',
    apiPrioritySupport: '24/7 प्राथमिकता सहायता',

    matrixTitle: 'फीचर तुलना तालिका',
    matrixSubtitle: 'फ्री ट्रायल, प्रो और प्रीमियम प्लान की विशेषताओं की तुलना करें।',
  },
};

export const SubscriptionView: React.FC = () => {
  const { user, updateUser, language, settings, requestSubscription, activateUserSubscription, exchangeRates } = useApp();
  const currentPlan = user?.subscriptionPlan || 'Free';
  const displayCurrency = settings.currency || '৳';
  const normCurrency = normalizeCurrencyCode(displayCurrency);
  const isBDT = normCurrency === 'BDT';

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // Dual Payment System Selection State
  const [requestPlan, setRequestPlan] = useState<'Pro' | 'Business' | null>(null);
  const [activeRegion, setActiveRegion] = useState<PaymentRegionId>(isBDT ? 'bangladesh' : 'international');
  const [selectedProviderId, setSelectedProviderId] = useState<string>(isBDT ? 'bkash' : 'paddle_checkout');
  const [transactionId, setTransactionId] = useState('');
  const [intlManualMode, setIntlManualMode] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const langDict = subTranslations[language] || subTranslations['en'];

  // Calculate prices using the single source of truth with live exchange rates
  const proPricing = calculatePlanPricing('Pro', billingCycle, isBDT, displayCurrency, exchangeRates, language);
  const premiumPricing = calculatePlanPricing('Premium', billingCycle, isBDT, displayCurrency, exchangeRates, language);

  // Active Region Providers & Selection Helpers
  const rawEnabledProviders = getEnabledProviders(activeRegion);
  const bgConfig = settings.paymentSettings?.bangladesh;

  const currentEnabledProviders = rawEnabledProviders.filter((provider) => {
    if (activeRegion === 'bangladesh' && bgConfig && bgConfig.enabled && bgConfig.methods) {
      if (provider.id === 'bkash') return bgConfig.methods.bkash?.enabled;
      if (provider.id === 'nagad') return bgConfig.methods.nagad?.enabled;
      if (provider.id === 'rocket') return bgConfig.methods.rocket?.enabled;
    }
    return true;
  });

  const selectedProvider =
    currentEnabledProviders.find((p) => p.id === selectedProviderId) || currentEnabledProviders[0];

  const getBangladeshNumberForProvider = (providerId: string) => {
    if (bgConfig && bgConfig.methods) {
      if (providerId === 'bkash' && bgConfig.methods.bkash?.number) return bgConfig.methods.bkash.number;
      if (providerId === 'nagad' && bgConfig.methods.nagad?.number) return bgConfig.methods.nagad.number;
      if (providerId === 'rocket' && bgConfig.methods.rocket?.number) return bgConfig.methods.rocket.number;
    }
    return settings.paymentSettings?.paymentNumber || settings.paymentSettings?.accountNumber || selectedProvider?.instructions?.accountNumber || '01700000000';
  };

  const getPlanAmount = (
    provider: PaymentProviderConfig | undefined,
    plan: 'Pro' | 'Business' | null,
    cycle: BillingCycle
  ) => {
    if (!provider || !plan) return 0;
    const costs = provider.supportedPlans[plan];
    if (!costs) return 0;
    if (cycle === 'five_year') return costs.fiveYear || costs.five_year || costs.yearly * 4;
    return cycle === 'yearly' ? costs.yearly : costs.monthly;
  };

  const handleSelectPlan = (planName: 'Free' | 'Pro' | 'Business' | 'Premium') => {
    if (planName === 'Free') {
      updateUser({ subscriptionPlan: 'Free' });
      return;
    }
    const targetPlan = planName === 'Premium' ? 'Business' : planName;
    setRequestPlan(targetPlan);
    
    // Bangladesh stores default to local payment, international to Paddle
    const initialRegion: PaymentRegionId = isBDT ? 'bangladesh' : 'international';
    setActiveRegion(initialRegion);
    const providers = getEnabledProviders(initialRegion);
    if (providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
    setTransactionId('');
    setSubmitError(null);
  };

  const handleRegionChange = (region: PaymentRegionId) => {
    setActiveRegion(region);
    const providers = getEnabledProviders(region);
    if (providers.length > 0) {
      setSelectedProviderId(providers[0].id);
    }
  };

  const handleLaunchPaddleCheckout = async () => {
    if (!requestPlan || !user || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await openPaddleCheckout({
        plan: requestPlan,
        billingCycle,
        userId: user.id,
        userEmail: user.email,
        brandName: user.brandName,
        onSuccess: async (data: any) => {
          setIsSubmitting(false);
          const txId = data?.transaction_id || data?.id || `PADDLE_${Date.now()}`;
          try {
            await activateUserSubscription({
              userId: user.id,
              plan: requestPlan,
              billingPeriod: billingCycle,
              paymentMethod: 'Paddle Billing (Card/PayPal)',
              paymentProvider: 'Paddle',
              paymentRegion: 'international',
              transactionId: txId,
              currency: 'USD',
            });
            setRequestPlan(null);
            setSubmittedSuccess(true);
            setTimeout(() => setSubmittedSuccess(false), 7000);
          } catch (e: any) {
            console.error('[Subscription Activation Error]:', e);
          }
        },
        onClose: () => setIsSubmitting(false),
        onError: (err: any) => {
          setIsSubmitting(false);
          setSubmitError(err?.message || 'Paddle checkout encountered an error. You can submit your payment transaction reference below for manual approval.');
          setIntlManualMode(true);
        },
      });
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('[Paddle Checkout Launch Error]:', err);
      setSubmitError('Paddle automated popup was blocked or unavailable. You can enter your payment reference / transaction ID below for immediate review.');
      setIntlManualMode(true);
      setIsSubmitting(false);
    }
  };

  const handleFormSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestPlan || !selectedProvider || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const amount = getPlanAmount(selectedProvider, requestPlan, billingCycle);

      await requestSubscription({
        requestedPlan: requestPlan,
        billingCycle,
        paymentMethod: selectedProvider.name,
        paymentRegion: activeRegion,
        paymentProvider: selectedProvider.name,
        currency: selectedProvider.currency,
        transactionId: transactionId.trim() || undefined,
        amount,
      });

      setRequestPlan(null);
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 7000);
    } catch (err: any) {
      console.error('[Payment Request Submission Error]:', err);
      setSubmitError(err.message || 'Failed to submit payment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

        {user?.subscriptionStatus === 'cancelled' && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs text-center space-y-1">
            <p className="font-bold flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Your previous subscription plan was revoked / cancelled by the platform owner.</span>
            </p>
            <p className="text-[11px] text-slate-400">
              You are currently on the Free Plan. All your store products, inventory, sales history, and business data remain safely preserved.
            </p>
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

        {/* Billing Cycle Toggle (1 Month / 6 Months / 1 Year / 5 Years) */}
        <div className="pt-3 flex items-center justify-center">
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 inline-flex flex-wrap items-center justify-center gap-1">
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
              onClick={() => setBillingCycle('six_months')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'six_months'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{langDict.sixMonths}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                billingCycle === 'six_months' ? 'bg-white text-amber-700' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {langDict.sixMonthsDiscount}
              </span>
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
            <button
              type="button"
              onClick={() => setBillingCycle('five_year')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'five_year'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{langDict.fiveYear}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                billingCycle === 'five_year' ? 'bg-white text-purple-700' : 'bg-purple-500/10 text-purple-500'
              }`}>
                {langDict.fiveYearDiscount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
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
                {isBDT ? '৳০' : '$0'}
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
                <span>{langDict.upTo5Products}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.upTo500Stock}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.upTo50SalesDay}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.basicProductMgmt}</span>
              </div>

              <div className="pt-2 space-y-2 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{langDict.posSystemLocked}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{langDict.teamLocked}</span>
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

        {/* 2. PRO PLAN CARD */}
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
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#ff5c01]">
                  {proPricing.totalFormatted}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {billingCycle === 'monthly'
                    ? langDict.perMonth
                    : billingCycle === 'six_months'
                    ? langDict.perSixMonths
                    : billingCycle === 'yearly'
                    ? langDict.perYear
                    : langDict.perFiveYear}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                {billingCycle === 'monthly'
                  ? (isBDT ? '৳১০০ ১ম মাস / ৳১৫০ রিনিউ' : 'Special Intro Offer')
                  : `${proPricing.effectiveMonthlyFormatted}/mo • ${proPricing.discountPercent}% OFF`}
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold text-[#ff5c01]">
                {langDict.everythingInFreePlus}
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.unlimitedProducts}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.unlimitedStock}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.unlimitedSales}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.payrollIncluded}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.aiInsightsIncluded}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{langDict.pdfInvoices}</span>
              </div>

              <div className="pt-2 space-y-2 text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{langDict.posSystemLocked}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{langDict.teamLocked}</span>
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
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {premiumPricing.totalFormatted}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {billingCycle === 'monthly'
                    ? langDict.perMonth
                    : billingCycle === 'six_months'
                    ? langDict.perSixMonths
                    : billingCycle === 'yearly'
                    ? langDict.perYear
                    : langDict.perFiveYear}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#ff5c01] mt-0.5">
                {billingCycle === 'monthly'
                  ? (isBDT ? '৳২৫০ / মাস • সম্পূর্ণ আনলিমিটেড' : 'Full POS & Team Access')
                  : `${premiumPricing.effectiveMonthlyFormatted}/mo • ${premiumPricing.discountPercent}% OFF`}
              </p>
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
                <span>{langDict.teamUnlocked}</span>
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

      {/* Feature Matrix Table */}
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
                  <th className="p-3.5 text-center min-w-[100px]">Free (15-Day Trial)</th>
                  <th className="p-3.5 text-center min-w-[120px] text-[#ff5c01]">
                    Pro ({isBDT ? (language === 'bn' ? '৳১০০/মাস' : '৳100/mo') : (normCurrency === 'USD' ? '$1.50/mo' : `${proPricing.effectiveMonthlyFormatted}/mo`)})
                  </th>
                  <th className="p-3.5 text-center min-w-[120px] text-[#ff5c01]">
                    Premium ({isBDT ? (language === 'bn' ? '৳২৫০/মাস' : '৳250/mo') : (normCurrency === 'USD' ? '$3.50/mo' : `${premiumPricing.effectiveMonthlyFormatted}/mo`)})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-3.5 font-bold">Catalog Product Limit</td>
                  <td className="p-3.5 text-center text-slate-500 font-bold">5 Products Max</td>
                  <td className="p-3.5 text-center font-bold text-[#ff5c01]">Unlimited</td>
                  <td className="p-3.5 text-center font-bold text-[#ff5c01]">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Total Inventory Stock Capacity</td>
                  <td className="p-3.5 text-center text-slate-500 font-bold">500 Pieces Max</td>
                  <td className="p-3.5 text-center font-bold text-[#ff5c01]">Unlimited</td>
                  <td className="p-3.5 text-center font-bold text-[#ff5c01]">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Daily Sales Transactions</td>
                  <td className="p-3.5 text-center text-slate-500 font-bold">50 Sales / Day</td>
                  <td className="p-3.5 text-center font-bold text-[#ff5c01]">Unlimited</td>
                  <td className="p-3.5 text-center font-bold text-[#ff5c01]">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Quick Sale Counter & Order History</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Point of Sale (POS) Billing Register</td>
                  <td className="p-3.5 text-center text-slate-400">Locked (Premium)</td>
                  <td className="p-3.5 text-center text-slate-400">Locked (Premium)</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Barcode & QR Code Generator & Printing</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Employee Salary & Payout Management</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Purchase Orders & Supplier Ledgers</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Included</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">Included</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Team Member Management & Roles</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center text-slate-400">Locked</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">Full Access</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Reports & Profit & Loss Analytics</td>
                  <td className="p-3.5 text-center text-slate-500">Basic</td>
                  <td className="p-3.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">Standard P&L</td>
                  <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">Advanced Analytics</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PLAN UPGRADE PAYMENT SELECTION MODAL */}
      {requestPlan && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Subscription Upgrade
                  </span>
                  <span className="text-xs font-bold text-slate-400 capitalize">
                    {billingCycle === 'five_year' ? '5-Year' : billingCycle} Billing
                  </span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Upgrade to {requestPlan} Plan</span>
                </h3>
              </div>
              <button
                onClick={() => setRequestPlan(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Region Selector Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Payment Region
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-950 border border-slate-800/80 rounded-2xl">
                {PAYMENT_REGIONS.map((region) => {
                  const isActive = activeRegion === region.id;
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => handleRegionChange(region.id)}
                      className={`p-3.5 rounded-xl text-left transition-all duration-200 flex flex-col justify-between cursor-pointer border ${
                        isActive
                          ? 'bg-[#ff5c01] text-white border-[#ff5c01] shadow-lg shadow-[#ff5c01]/20'
                          : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs sm:text-sm flex items-center gap-2">
                          {region.id === 'international' ? (
                            <Globe className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                          ) : (
                            <Smartphone className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                          )}
                          <span>{region.title}</span>
                        </span>
                        {isActive && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-[11px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {region.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Select Payment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentEnabledProviders.map((provider) => {
                  const isSelected = selectedProviderId === provider.id;
                  const providerCost = getPlanAmount(provider, requestPlan, billingCycle);

                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => setSelectedProviderId(provider.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {provider.logoType === 'paddle' || provider.id === 'paddle' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[10px] tracking-wider">
                                Paddle
                              </span>
                              <CardLogosComponent />
                            </div>
                          ) : provider.logoType === 'paypal' ? (
                            <PayPalLogoComponent />
                          ) : provider.logoType === 'card' ? (
                            <CardLogosComponent />
                          ) : provider.logoType === 'bkash' ? (
                            <BkashLogo />
                          ) : provider.logoType === 'nagad' ? (
                            <NagadLogo />
                          ) : provider.logoType === 'rocket' ? (
                            <RocketLogo />
                          ) : provider.logoType === 'bank' ? (
                            <BankTransferLogo />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                              <Wallet className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                            ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-extrabold text-xs text-white block">
                            {provider.name}
                          </span>
                          <span className="font-extrabold text-xs text-emerald-400 block">
                            {provider.currencySymbol}{providerCost}{' '}
                            <span className="text-[10px] font-normal text-slate-400">
                              /{billingCycle === 'five_year' ? '5yr' : billingCycle === 'yearly' ? 'yr' : 'mo'}
                            </span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {provider.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Instructions Card (Only for Bangladesh manual payment methods) */}
            {selectedProvider && selectedProvider.region === 'bangladesh' && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#ff5c01]" />
                    <span className="text-xs font-bold text-white">
                      Payment Instructions ({selectedProvider.name})
                    </span>
                  </div>
                  {settings.paymentSettings?.storeName && (
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-amber-400 font-bold">
                      {settings.paymentSettings.storeName}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Payment Method</span>
                    <span className="font-bold text-slate-200">
                      {selectedProvider.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Payment Number</span>
                    <span className="font-mono font-extrabold text-amber-400">
                      {getBangladeshNumberForProvider(selectedProvider.id)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Receiver / Merchant Name</span>
                    <span className="font-bold text-slate-200">
                      {settings.paymentSettings?.receiverName || settings.paymentSettings?.accountName || selectedProvider.instructions?.accountName || 'YearInvo Store'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Store Name</span>
                    <span className="font-bold text-slate-200">
                      {settings.paymentSettings?.storeName || 'YearInvo Store'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Transaction ID Instruction
                  </span>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {settings.paymentSettings?.transactionIdInstruction || 'Copy your transaction ID and enter it below.'}
                  </p>
                </div>
              </div>
            )}

            {/* Transaction ID Form Submission or Paddle Checkout */}
            {activeRegion === 'international' && !intlManualMode ? (
              <div className="space-y-4 pt-1">
                {submitError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
                    {submitError}
                  </div>
                )}

                {/* Amount Summary */}
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex justify-between items-center text-xs shadow-inner">
                  <div>
                    <span className="text-slate-200 font-extrabold block text-sm">
                      {requestPlan} Plan Upgrade
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {billingCycle === 'five_year' ? '5-Year' : billingCycle} Billing • {selectedProvider?.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg text-emerald-400 block">
                      {selectedProvider?.currencySymbol}
                      {getPlanAmount(selectedProvider, requestPlan, billingCycle)}{' '}
                      <span className="text-xs font-bold text-slate-400">{selectedProvider?.currency}</span>
                    </span>
                  </div>
                </div>

                {/* Security Badge */}
                <p className="text-[11px] text-slate-400 flex items-center gap-2 justify-center py-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>256-bit SSL Encrypted • Instant Automated Activation</span>
                </p>

                {/* Primary Action Button */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIntlManualMode(true);
                      setSubmitError(null);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Or submit transaction ID / reference manually
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setRequestPlan(null)}
                      className="px-4 py-3 bg-slate-800/80 text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleLaunchPaddleCheckout}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      <span>
                        {isSubmitting
                          ? 'Opening Secure Payment...'
                          : 'Continue to Secure Payment'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmitRequest} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>3. Enter Transaction ID / Payment Reference</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Required for manual verification
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. TrxID TRX982347192 or Paddle/PayPal Invoice #"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff5c01] focus:ring-1 focus:ring-[#ff5c01]"
                  />
                </div>

                {/* Amount Summary */}
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Total Upgrade Amount:</span>
                    <span className="text-[10px] text-slate-500">
                      {requestPlan} Plan ({billingCycle === 'five_year' ? '5-Year' : billingCycle}) • {selectedProvider?.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base text-emerald-400 block">
                      {selectedProvider?.currencySymbol}
                      {getPlanAmount(selectedProvider, requestPlan, billingCycle)}{' '}
                      <span className="text-xs font-bold text-slate-400">{selectedProvider?.currency}</span>
                    </span>
                  </div>
                </div>

                {/* Security Hint */}
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    <strong>Secure Verification:</strong> Sensitive payment credentials are never stored. Subscription is verified server-side.
                  </span>
                </p>

                {/* Modal Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                  {activeRegion === 'international' ? (
                    <button
                      type="button"
                      onClick={() => setIntlManualMode(false)}
                      className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      ← Back to automated checkout
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setRequestPlan(null)}
                      className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-lg shadow-[#ff5c01]/20 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>
                        {isSubmitting
                          ? 'Submitting Request...'
                          : 'Submit Payment for Verification'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
