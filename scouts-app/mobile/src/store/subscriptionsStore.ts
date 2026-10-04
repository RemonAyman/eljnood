import { create } from 'zustand';
import { SubscriptionRecord } from '../types';

export interface SubscriptionItemsInput {
  annualSub?: boolean | number;
  festivalSub?: boolean | number;
  promisePartySub?: boolean | number;
  scarfReplacement?: boolean | number;
  wajla?: boolean | number;
  badges?: boolean | number;
  [customKey: string]: boolean | number | undefined;
}

export interface CustomSubscriptionPriceItem {
  id: string;
  title: string;
  price: number;
  desc: string;
}

interface SubscriptionsState {
  prices: {
    annualSub: number;
    festivalSub: number;
    promisePartySub: number;
    scarfReplacement: number;
    wajla: number;
    badges: number;
    [key: string]: number;
  };
  customItems: CustomSubscriptionPriceItem[];
  discountCodes: { [code: string]: number };
  records: SubscriptionRecord[];
  applyDiscountCode: (code: string, secretPin?: string) => { success: boolean; percentage: number; error?: string };
  calculateTotal: (
    items: SubscriptionItemsInput, 
    discountPercentage: number, 
    fixedDiscountEgp?: number
  ) => { 
    subtotal: number; 
    percentDiscountAmount: number; 
    fixedDiscountEgp: number; 
    discountAmount: number; 
    totalPaid: number 
  };
  addRecord: (record: Omit<SubscriptionRecord, 'id' | 'receiptNumber' | 'createdAt'>) => SubscriptionRecord;
  updatePrices: (newPrices: Partial<SubscriptionsState['prices']>) => void;
  addCustomItem: (item: { title: string; price: number; desc?: string }) => void;
  setRecords: (records: SubscriptionRecord[]) => void;
}

export const useSubscriptionsStore = create<SubscriptionsState>((set, get) => ({
  prices: {
    annualSub: 300,        // اشتراك سنوي
    festivalSub: 200,      // اشتراك مهرجان
    promisePartySub: 150,  // اشتراك حفلة الوعد
    scarfReplacement: 80,  // بدل فاقد منديل
    wajla: 50,             // وجلة
    badges: 60,            // شارات وأوسمة القميص الكشفي
  },
  customItems: [],
  discountCodes: {
    'SCOUT10': 10, 'JNOOD10': 10, 'JNOOD-D10': 10, 'D10': 10, '10%': 10, '10': 10,
    'SCOUT20': 20, 'JNOOD20': 20, 'JNOOD-D20': 20, 'D20': 20, '20%': 20, '20': 20,
    'SCOUT30': 30, 'JNOOD30': 30, 'JNOOD-D30': 30, 'D30': 30, '30%': 30, '30': 30,
    'SCOUT40': 40, 'JNOOD40': 40, 'JNOOD-D40': 40, 'D40': 40, '40%': 40, '40': 40,
    'SCOUT50': 50, 'JNOOD50': 50, 'JNOOD-D50': 50, 'D50': 50, '50%': 50, '50': 50,
    'SCOUT60': 60, 'JNOOD60': 60, 'JNOOD-D60': 60, 'D60': 60, '60%': 60, '60': 60,
    'SCOUT70': 70, 'JNOOD70': 70, 'JNOOD-D70': 70, 'D70': 70, '70%': 70, '70': 70,
    'SCOUT80': 80, 'JNOOD80': 80, 'JNOOD-D80': 80, 'D80': 80, '80%': 80, '80': 80,
    'SCOUT90': 90, 'JNOOD90': 90, 'JNOOD-D90': 90, 'D90': 90, '90%': 90, '90': 90,
    'FULL100': 100, 'JNOOD100': 100, '100%': 100,
  },
  records: [],
  applyDiscountCode: (code, secretPin) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      return { success: false, percentage: 0, error: 'يرجى كتابة كود الخصم' };
    }

    let percentage = get().discountCodes[trimmed];
    if (!percentage && !isNaN(Number(trimmed))) {
      const num = Number(trimmed);
      if (num >= 5 && num <= 100) percentage = num;
    }

    if (!percentage) {
      return { success: false, percentage: 0, error: 'كود الخصم غير صالح أو غير موجود بالمنظومة' };
    }

    if (secretPin !== '1234' && secretPin !== '0000') {
      return { success: false, percentage: 0, error: 'رمز الحماية PIN غير صحيح (يتطلب تفويض مسؤول الخزينة)' };
    }

    return { success: true, percentage };
  },

  calculateTotal: (items, discountPercentage, fixedDiscountEgp = 0) => {
    const { prices } = get();
    let subtotal = 0;

    // Default Items
    if (items.annualSub) subtotal += prices.annualSub || 0;
    if (items.festivalSub) subtotal += prices.festivalSub || 0;
    if (items.promisePartySub) subtotal += prices.promisePartySub || 0;
    if (items.scarfReplacement) subtotal += prices.scarfReplacement || 0;
    if (items.wajla) subtotal += prices.wajla || 0;
    if (items.badges) subtotal += prices.badges || 0;

    // Custom Items
    get().customItems.forEach((c) => {
      if (items[c.id]) {
        subtotal += (prices[c.id] !== undefined ? prices[c.id] : c.price);
      }
    });

    const percentDiscountAmount = Math.round((subtotal * (discountPercentage || 0)) / 100);
    const validFixedDiscount = Math.max(0, fixedDiscountEgp || 0);
    const totalDiscountAmount = Math.min(subtotal, percentDiscountAmount + validFixedDiscount);
    const totalPaid = Math.max(0, subtotal - totalDiscountAmount);

    return { 
      subtotal, 
      percentDiscountAmount, 
      fixedDiscountEgp: validFixedDiscount, 
      discountAmount: totalDiscountAmount, 
      totalPaid 
    };
  },

  addRecord: (newRecordData) => {
    const receiptNum = `REC-2026-${String(get().records.length + 1).padStart(3, '0')}`;
    const record: SubscriptionRecord = {
      ...newRecordData,
      id: `sub_${Date.now()}`,
      receiptNumber: receiptNum,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ records: [record, ...state.records] }));
    return record;
  },

  updatePrices: (newPrices) => {
    set((state) => ({ prices: { ...state.prices, ...newPrices } }));
  },

  addCustomItem: (item) => {
    const newId = `custom_${Date.now()}`;
    const customItem: CustomSubscriptionPriceItem = {
      id: newId,
      title: item.title,
      price: item.price,
      desc: item.desc || 'بند اشتراك مخصص جديد',
    };
    set((state) => ({
      customItems: [...state.customItems, customItem],
      prices: { ...state.prices, [newId]: item.price },
    }));
  },

  setRecords: (records) => {
    set({ records });
  },
}));
