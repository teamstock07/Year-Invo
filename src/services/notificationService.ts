import { AppNotification, Customer, Language, Product, Sale, NotificationType, NotificationPriority } from '../types';

export interface GenerateNotificationsParams {
  products: Product[];
  customers: Customer[];
  sales?: Sale[];
  manualNotifications?: AppNotification[];
  readMap?: Record<string, boolean>;
  formatCurrency?: (amount: number) => string;
  language?: Language;
  storeId?: string;
}

const DEFAULT_MIN_STOCK_THRESHOLD = 5;

/**
 * Priority weighting for sorting: Critical (3) > Warning (2) > Info (1)
 */
export const PRIORITY_WEIGHT: Record<NotificationPriority, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

/**
 * Multi-language strings dictionary for Notification System
 */
const NOTIF_STRINGS: Record<
  Language,
  {
    titles: Record<string, string>;
    types: Record<string, string>;
    priorities: Record<NotificationPriority, string>;
  }
> = {
  en: {
    titles: {
      out_of_stock: 'Out of Stock',
      low_stock: 'Low Stock',
      expiring_soon: 'Expiring Soon',
      expired: 'Expired Product',
      pending_due: 'Pending Payment',
      overdue_due: 'Overdue Payment',
      subscription: 'Subscription Alert',
      system: 'System Notification',
      report: 'Business Report',
      due: 'Pending Payment',
    },
    types: {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
    },
    priorities: {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
    },
  },
  bn: {
    titles: {
      out_of_stock: 'স্টক শেষ',
      low_stock: 'কম স্টক',
      expiring_soon: 'মেয়াদ শেষ হওয়ার পথে',
      expired: 'মেয়াদ শেষ',
      pending_due: 'বকেয়া পেমেন্ট',
      overdue_due: 'মেয়াদোত্তীর্ণ বকেয়া',
      subscription: 'সাবস্ক্রিপশন বার্তা',
      system: 'সিস্টেম বার্তা',
      report: 'বিজনেস রিপোর্ট',
      due: 'বকেয়া পেমেন্ট',
    },
    types: {
      critical: 'জরুরি',
      warning: 'সতর্কতা',
      info: 'তথ্য',
    },
    priorities: {
      critical: 'জরুরি',
      warning: 'সতর্কতা',
      info: 'তথ্য',
    },
  },
  hi: {
    titles: {
      out_of_stock: 'स्टॉक खत्म',
      low_stock: 'कम स्टॉक',
      expiring_soon: 'जल्द समाप्त होने वाला',
      expired: 'समाप्त उत्पाद',
      pending_due: 'लंबित भुगतान',
      overdue_due: 'अतिदेय भुगतान',
      subscription: 'सदस्यता सूचना',
      system: 'सिस्टम सूचना',
      report: 'व्यापार रिपोर्ट',
      due: 'लंबित भुगतान',
    },
    types: {
      critical: 'गंभीर',
      warning: 'चेतावनी',
      info: 'सूचना',
    },
    priorities: {
      critical: 'गंभीर',
      warning: 'चेतावनी',
      info: 'सूचना',
    },
  },
  ar: {
    titles: {
      out_of_stock: 'نفد المخزون',
      low_stock: 'مخزون منخفض',
      expiring_soon: 'ينتهي قريباً',
      expired: 'منتج منتهي الصلاحية',
      pending_due: 'دفعة معلقة',
      overdue_due: 'دفعة متأخرة',
      subscription: 'تنبيه الاشتراك',
      system: 'إشعار النظام',
      report: 'تقرير الأعمال',
      due: 'دفعة معلقة',
    },
    types: {
      critical: 'حرج',
      warning: 'تحذير',
      info: 'معلومات',
    },
    priorities: {
      critical: 'حرج',
      warning: 'تحذير',
      info: 'معلومات',
    },
  },
  es: {
    titles: {
      out_of_stock: 'Agotado',
      low_stock: 'Stock Bajo',
      expiring_soon: 'Por Caducar',
      expired: 'Producto Caducado',
      pending_due: 'Pago Pendiente',
      overdue_due: 'Pago Vencido',
      subscription: 'Alerta de Suscripción',
      system: 'Notificación del Sistema',
      report: 'Informe Comercial',
      due: 'Pago Pendiente',
    },
    types: {
      critical: 'Crítico',
      warning: 'Advertencia',
      info: 'Información',
    },
    priorities: {
      critical: 'Crítico',
      warning: 'Advertencia',
      info: 'Información',
    },
  },
  fr: {
    titles: {
      out_of_stock: 'Rupture de Stock',
      low_stock: 'Stock Faible',
      expiring_soon: 'Expire Bientôt',
      expired: 'Produit Expiré',
      pending_due: 'Paiement en Attente',
      overdue_due: 'Paiement en Retard',
      subscription: 'Alerte Abonnement',
      system: 'Notification Système',
      report: 'Rapport Commercial',
      due: 'Paiement en Attente',
    },
    types: {
      critical: 'Critique',
      warning: 'Avertissement',
      info: 'Information',
    },
    priorities: {
      critical: 'Critique',
      warning: 'Avertissement',
      info: 'Information',
    },
  },
};

/**
 * Format a localized title for any notification type
 */
export function getLocalizedTitle(type: string, lang: Language = 'en'): string {
  const langTable = NOTIF_STRINGS[lang] || NOTIF_STRINGS.en;
  return langTable.titles[type] || NOTIF_STRINGS.en.titles[type] || 'Notification';
}

/**
 * Format localized content (Title & Message) for a notification item dynamically
 */
export function getNotificationContent(
  notif: AppNotification,
  lang: Language = 'en',
  formatCurrencyFn?: (amount: number) => string
): { title: string; message: string } {
  const meta = notif.meta || {};
  const productName = meta.productName || 'Product';
  const stock = meta.stock ?? 0;
  const threshold = meta.threshold ?? DEFAULT_MIN_STOCK_THRESHOLD;
  const diffDays = meta.diffDays ?? 0;
  const expiryDate = meta.expiryDate || '';
  const customerName = meta.customerName || 'Customer';
  const dueAmount = meta.dueAmount ?? 0;
  const formattedDue = formatCurrencyFn ? formatCurrencyFn(dueAmount) : `৳${dueAmount}`;

  const title = getLocalizedTitle(notif.type, lang);

  let message = notif.message;

  switch (notif.type) {
    case 'out_of_stock':
      if (lang === 'bn') {
        message = `"${productName}" পণ্যটির স্টক শেষ হয়ে গেছে।`;
      } else if (lang === 'hi') {
        message = `उत्पाद "${productName}" का स्टॉक खत्म हो गया है।`;
      } else if (lang === 'ar') {
        message = `المنتج "${productName}" نفد من المخزون تماماً.`;
      } else if (lang === 'es') {
        message = `El producto "${productName}" está completamente agotado.`;
      } else if (lang === 'fr') {
        message = `Le produit "${productName}" est en rupture de stock.`;
      } else {
        message = `Product "${productName}" is out of stock.`;
      }
      break;

    case 'low_stock':
      if (lang === 'bn') {
        message = `"${productName}" এর স্টক শেষের পথে (মাত্র ${stock} / ${threshold} টি অবশিষ্ট)।`;
      } else if (lang === 'hi') {
        message = `उत्पाद "${productName}" का स्टॉक कम है (केवल ${stock} / ${threshold} शेष)।`;
      } else if (lang === 'ar') {
        message = `مخزون المنتج "${productName}" منخفض (${stock} / ${threshold} متبقي).`;
      } else if (lang === 'es') {
        message = `El producto "${productName}" tiene poco stock (${stock} / ${threshold} restantes).`;
      } else if (lang === 'fr') {
        message = `Le produit "${productName}" est en stock faible (${stock} / ${threshold} restants).`;
      } else {
        message = `Product "${productName}" is running low on stock (${stock} / ${threshold} left).`;
      }
      break;

    case 'expiring_soon': {
      const daysText = diffDays === 0 ? 'today' : `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      if (lang === 'bn') {
        message = `"${productName}" এর মেয়াদ ${diffDays === 0 ? 'আজকেই' : `${diffDays} দিনের মধ্যে`} শেষ হবে (${expiryDate})।`;
      } else if (lang === 'hi') {
        message = `उत्पाद "${productName}" ${diffDays === 0 ? 'आज' : `${diffDays} दिनों में`} समाप्त होगा (${expiryDate})।`;
      } else if (lang === 'ar') {
        message = `المنتج "${productName}" سينتهي ${diffDays === 0 ? 'اليوم' : `خلال ${diffDays} أيام`} (${expiryDate}).`;
      } else if (lang === 'es') {
        message = `El producto "${productName}" caducará ${diffDays === 0 ? 'hoy' : `en ${diffDays} días`} (${expiryDate}).`;
      } else if (lang === 'fr') {
        message = `Le produit "${productName}" expirera ${diffDays === 0 ? "aujourd'hui" : `dans ${diffDays} jours`} (${expiryDate}).`;
      } else {
        message = `Product "${productName}" will expire ${diffDays === 0 ? 'today' : `in ${daysText}`} (${expiryDate}).`;
      }
      break;
    }

    case 'expired':
      if (lang === 'bn') {
        message = `"${productName}" পণ্যটির মেয়াদ ${expiryDate} তারিখে শেষ হয়েছে।`;
      } else if (lang === 'hi') {
        message = `उत्पाद "${productName}" ${expiryDate} को समाप्त हो चुका है।`;
      } else if (lang === 'ar') {
        message = `انتهت صلاحية المنتج "${productName}" بتاريخ ${expiryDate}.`;
      } else if (lang === 'es') {
        message = `El producto "${productName}" ha caducado el ${expiryDate}.`;
      } else if (lang === 'fr') {
        message = `Le produit "${productName}" a expiré le ${expiryDate}.`;
      } else {
        message = `Product "${productName}" has expired on ${expiryDate}.`;
      }
      break;

    case 'pending_due':
    case 'due':
      if (lang === 'bn') {
        message = `গ্রাহক "${customerName}" এর ${formattedDue} বকেয়া রয়েছে।`;
      } else if (lang === 'hi') {
        message = `ग्राहक "${customerName}" का ${formattedDue} भुगतान लंबित है।`;
      } else if (lang === 'ar') {
        message = `العميل "${customerName}" لديه دفعة معلقة بقيمة ${formattedDue}.`;
      } else if (lang === 'es') {
        message = `El cliente "${customerName}" tiene un pago pendiente de ${formattedDue}.`;
      } else if (lang === 'fr') {
        message = `Le client "${customerName}" a un paiement en attente de ${formattedDue}.`;
      } else {
        message = `Customer "${customerName}" has a pending payment of ${formattedDue}.`;
      }
      break;

    case 'overdue_due':
      if (lang === 'bn') {
        message = `গ্রাহক "${customerName}" এর ${formattedDue} বকেয়ার মেয়াদ উত্তীর্ণ হয়েছে।`;
      } else if (lang === 'hi') {
        message = `ग्राहक "${customerName}" का ${formattedDue} अतिदेय भुगतान है।`;
      } else if (lang === 'ar') {
        message = `العميل "${customerName}" لديه دفعة متأخرة بقيمة ${formattedDue}.`;
      } else if (lang === 'es') {
        message = `El cliente "${customerName}" tiene un pago vencido de ${formattedDue}.`;
      } else if (lang === 'fr') {
        message = `Le client "${customerName}" a un paiement en retard de ${formattedDue}.`;
      } else {
        message = `Customer "${customerName}" has an overdue payment of ${formattedDue}.`;
      }
      break;

    default:
      if (lang === 'bn' && notif.messageBn) {
        message = notif.messageBn;
      }
      break;
  }

  return { title, message };
}

/**
 * Sort notifications: Critical -> Warning -> Info, then Unread before Read, then Newest first
 */
export function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => {
    // 1. Unread first
    if (!a.read && b.read) return -1;
    if (a.read && !b.read) return 1;

    // 2. Priority weight (Critical > Warning > Info)
    const weightA = PRIORITY_WEIGHT[a.priority] || 1;
    const weightB = PRIORITY_WEIGHT[b.priority] || 1;
    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // 3. Newest date/createdAt first
    const timeA = new Date(a.createdAt || a.date).getTime() || 0;
    const timeB = new Date(b.createdAt || b.date).getTime() || 0;
    return timeB - timeA;
  });
}

/**
 * Pure generator function to re-evaluate conditions and build active notifications
 */
export function generateSystemNotifications({
  products = [],
  customers = [],
  sales = [],
  manualNotifications = [],
  readMap = {},
  formatCurrency,
  language = 'en',
}: GenerateNotificationsParams): AppNotification[] {
  const generated: AppNotification[] = [];
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayIsoDate = today.toISOString().split('T')[0];

  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;
  let pendingDueCount = 0;
  let overdueDueCount = 0;

  // 1. PRODUCTS EVALUATION: Low stock, Out of Stock, Expiry
  products.forEach((p) => {
    if (!p || !p.id) return;

    const threshold = p.minStockAlert && p.minStockAlert > 0 ? p.minStockAlert : DEFAULT_MIN_STOCK_THRESHOLD;
    const currentStock = typeof p.currentStock === 'number' ? p.currentStock : 0;

    // A. Out of Stock (Critical)
    if (currentStock <= 0) {
      outOfStockCount++;
      const id = `out_of_stock_${p.id}`;
      const isRead = Boolean(readMap[id]);
      const notif: AppNotification = {
        id,
        type: 'out_of_stock',
        priority: 'critical',
        title: 'Out of Stock',
        titleBn: 'স্টক শেষ',
        message: `Product "${p.name}" is out of stock.`,
        messageBn: `"${p.name}" পণ্যটির স্টক শেষ হয়ে গেছে।`,
        date: todayIsoDate,
        createdAt: p.createdAt || today.toISOString(),
        read: isRead,
        entityId: p.id,
        entityType: 'product',
        linkTab: 'stock',
        meta: {
          productName: p.name,
          stock: currentStock,
          threshold,
        },
      };
      generated.push(notif);
    }
    // B. Low Stock (Warning)
    else if (currentStock <= threshold) {
      lowStockCount++;
      const id = `low_stock_${p.id}`;
      const isRead = Boolean(readMap[id]);
      const notif: AppNotification = {
        id,
        type: 'low_stock',
        priority: 'warning',
        title: 'Low Stock',
        titleBn: 'কম স্টক',
        message: `Product "${p.name}" is running low on stock (${currentStock} / ${threshold} left).`,
        messageBn: `"${p.name}" এর স্টক শেষের পথে (মাত্র ${currentStock} / ${threshold} টি অবশিষ্ট)।`,
        date: todayIsoDate,
        createdAt: p.createdAt || today.toISOString(),
        read: isRead,
        entityId: p.id,
        entityType: 'product',
        linkTab: 'stock',
        meta: {
          productName: p.name,
          stock: currentStock,
          threshold,
        },
      };
      generated.push(notif);
    }

    // C. Expiration Date Check (Expired vs. Expiring Soon)
    if (p.expiryDate && p.expiryDate.trim()) {
      const expParts = p.expiryDate.trim().split('-');
      if (expParts.length === 3) {
        const expYear = parseInt(expParts[0], 10);
        const expMonth = parseInt(expParts[1], 10) - 1;
        const expDay = parseInt(expParts[2], 10);
        const expTime = new Date(expYear, expMonth, expDay).getTime();

        if (!isNaN(expTime)) {
          const diffMs = expTime - todayMidnight;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          // Expired (Critical)
          if (diffDays < 0) {
            expiredCount++;
            const id = `expired_${p.id}_${p.expiryDate}`;
            const isRead = Boolean(readMap[id]);
            const notif: AppNotification = {
              id,
              type: 'expired',
              priority: 'critical',
              title: 'Expired Product',
              titleBn: 'মেয়াদ শেষ',
              message: `Product "${p.name}" has expired on ${p.expiryDate}.`,
              messageBn: `"${p.name}" পণ্যটির মেয়াদ ${p.expiryDate} তারিখে শেষ হয়েছে।`,
              date: todayIsoDate,
              createdAt: p.createdAt || today.toISOString(),
              read: isRead,
              entityId: p.id,
              entityType: 'product',
              linkTab: 'expired',
              meta: {
                productName: p.name,
                expiryDate: p.expiryDate,
                diffDays,
              },
            };
            generated.push(notif);
          }
          // Expiring Soon (Warning, <= 30 days)
          else if (diffDays <= 30) {
            expiringCount++;
            const id = `expiring_soon_${p.id}_${p.expiryDate}`;
            const isRead = Boolean(readMap[id]);
            const daysText = diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
            const notif: AppNotification = {
              id,
              type: 'expiring_soon',
              priority: 'warning',
              title: 'Expiring Soon',
              titleBn: 'মেয়াদ শেষ হওয়ার পথে',
              message: `Product "${p.name}" will expire ${daysText} (${p.expiryDate}).`,
              messageBn: `"${p.name}" এর মেয়াদ ${diffDays === 0 ? 'আজকেই' : `${diffDays} দিনের মধ্যে`} শেষ হবে (${p.expiryDate})।`,
              date: todayIsoDate,
              createdAt: p.createdAt || today.toISOString(),
              read: isRead,
              entityId: p.id,
              entityType: 'product',
              linkTab: 'expired',
              meta: {
                productName: p.name,
                expiryDate: p.expiryDate,
                diffDays,
              },
            };
            generated.push(notif);
          }
        }
      }
    }
  });

  // 2. CUSTOMERS EVALUATION: Pending Dues & Overdue Balances
  customers.forEach((c) => {
    if (!c || !c.id) return;
    const dueAmount = typeof c.dueAmount === 'number' ? c.dueAmount : 0;
    if (dueAmount <= 0) return;

    // Check if any sale for this customer is older than 30 days or marked overdue
    const customerSales = sales.filter((s) => s.customerId === c.id && s.dueAmount > 0);
    let isOverdue = false;
    let overdueDays = 0;

    for (const s of customerSales) {
      if (s.date) {
        const saleTime = new Date(s.date).getTime();
        if (!isNaN(saleTime)) {
          const daysOld = Math.floor((todayMidnight - saleTime) / (1000 * 60 * 60 * 24));
          if (daysOld >= 30) {
            isOverdue = true;
            overdueDays = Math.max(overdueDays, daysOld);
            break;
          }
        }
      }
    }

    const formattedAmount = formatCurrency ? formatCurrency(dueAmount) : `৳${dueAmount}`;

    if (isOverdue) {
      overdueDueCount++;
      const id = `overdue_due_${c.id}`;
      const isRead = Boolean(readMap[id]);
      const notif: AppNotification = {
        id,
        type: 'overdue_due',
        priority: 'critical',
        title: 'Overdue Payment',
        titleBn: 'মেয়াদোত্তীর্ণ বকেয়া',
        message: `Customer "${c.name}" has an overdue payment of ${formattedAmount}.`,
        messageBn: `গ্রাহক "${c.name}" এর ${formattedAmount} বকেয়ার মেয়াদ উত্তীর্ণ হয়েছে।`,
        date: todayIsoDate,
        createdAt: c.createdAt || today.toISOString(),
        read: isRead,
        entityId: c.id,
        entityType: 'customer',
        linkTab: 'due',
        meta: {
          customerName: c.name,
          dueAmount,
          phone: c.phone,
          overdueDays,
        },
      };
      generated.push(notif);
    } else {
      pendingDueCount++;
      const id = `pending_due_${c.id}`;
      const isRead = Boolean(readMap[id]);
      const notif: AppNotification = {
        id,
        type: 'pending_due',
        priority: 'info',
        title: 'Pending Payment',
        titleBn: 'বকেয়া পেমেন্ট',
        message: `Customer "${c.name}" has a pending payment of ${formattedAmount}.`,
        messageBn: `গ্রাহক "${c.name}" এর ${formattedAmount} বকেয়া রয়েছে।`,
        date: todayIsoDate,
        createdAt: c.createdAt || today.toISOString(),
        read: isRead,
        entityId: c.id,
        entityType: 'customer',
        linkTab: 'due',
        meta: {
          customerName: c.name,
          dueAmount,
          phone: c.phone,
        },
      };
      generated.push(notif);
    }
  });

  // 3. COMBINE WITH MANUAL/SYSTEM NOTIFICATIONS (Subscription, System Announcements)
  const manualNotifs = manualNotifications
    .filter((m) => {
      // Exclude stale auto-generated notifications that might have been saved in state
      return (
        !m.id.startsWith('low_stock_') &&
        !m.id.startsWith('out_of_stock_') &&
        !m.id.startsWith('expiring_soon_') &&
        !m.id.startsWith('expired_') &&
        !m.id.startsWith('pending_due_') &&
        !m.id.startsWith('overdue_due_')
      );
    })
    .map((m) => ({
      ...m,
      read: Boolean(readMap[m.id] || m.read),
    }));

  const allNotifications = [...generated, ...manualNotifs];
  const sorted = sortNotifications(allNotifications);

  // 4. DEVELOPMENT DEBUG LOGGING (Requirement 27)
  if (
    typeof window !== 'undefined' &&
    (Boolean((import.meta as any)?.env?.DEV) || window.location.hostname === 'localhost')
  ) {
    console.log(
      `%c[NOTIFICATION DEBUG]%c Checked conditions: Out of Stock (${outOfStockCount}), Low Stock (${lowStockCount}), Expiring Soon (${expiringCount}), Expired (${expiredCount}), Pending Due (${pendingDueCount}), Overdue (${overdueDueCount}). Total: ${sorted.length} active (${sorted.filter((n) => !n.read).length} unread).`,
      'color: #ff5c01; font-weight: bold;',
      'color: inherit;'
    );
  }

  return sorted;
}
