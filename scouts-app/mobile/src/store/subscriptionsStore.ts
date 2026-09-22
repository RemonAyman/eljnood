import { create } from 'zustand';
import { SubscriptionRecord } from '../types';

export interface SubscriptionItemsInput {
  annualSub?: boolean | number;
  festivalSub?: boolean | number;
  promisePartySub?: boolean | number;
  scarfReplacement?: boolean | number;
  wajla?: boolean | number;
  badges?: boolean | number;
}

interface SubscriptionsState {
  prices: {
    annualSub: number;
    festivalSub: number;
    promisePartySub: number;
    scarfReplacement: number;
    wajla: number;
    badges: number;
  };
  discountCodes: { [code: string]: number }; // e.g. JNOOD-D10 -> 10
  records: SubscriptionRecord[];
  applyDiscountCode: (code: string, secretPin?: string) => { success: boolean; percentage: number; error?: string };
  calculateTotal: (items: SubscriptionItemsInput, discountPercentage: number) => { subtotal: number; discountAmount: number; totalPaid: number };
  addRecord: (record: Omit<SubscriptionRecord, 'id' | 'receiptNumber' | 'createdAt'>) => SubscriptionRecord;
  updatePrices: (newPrices: Partial<SubscriptionsState['prices']>) => void;
}

export const useSubscriptionsStore = create<SubscriptionsState>((set, get) => ({
  prices: {
    annualSub: 300,        // اشتراك سنوي
    festivalSub: 200,      // اشتراك مهرجان
    promisePartySub: 150,  // اشتراك حفلة الوعد
    scarfReplacement: 80,  // بدل فاقد منديل
    wajla: 50,             // وجلة
    badges: 60,            // شارات القميص الكشفي
  },
  discountCodes: {
    'JNOOD-D10': 10, 'JNOOD10': 10, 'D10': 10,
    'JNOOD-D20': 20, 'JNOOD20': 20, 'D20': 20,
    'JNOOD-D30': 30, 'JNOOD30': 30, 'D30': 30,
    'JNOOD-D40': 40, 'JNOOD40': 40, 'D40': 40,
    'JNOOD-D50': 50, 'JNOOD50': 50, 'D50': 50,
    'JNOOD-D60': 60, 'JNOOD60': 60, 'D60': 60,
    'JNOOD-D70': 70, 'JNOOD70': 70, 'D70': 70,
    'JNOOD-D80': 80, 'JNOOD80': 80, 'D80': 80,
    'JNOOD-D90': 90, 'JNOOD90': 90, 'D90': 90,
  },
  records: [],
  applyDiscountCode: (code, secretPin) => {
    const trimmed = code.trim().toUpperCase();
    const percentage = get().discountCodes[trimmed];

    if (!percentage) {
      return { success: false, percentage: 0, error: 'كود الخصم غير صالح أو غير موجود بالمنظومة' };
    }

    if (secretPin !== '1234' && secretPin !== '0000') {
      return { success: false, percentage: 0, error: 'رمز الحماية PIN غير صحيح (يتطلب تفويض مسؤول)' };
    }

    return { success: true, percentage };
  },
  calculateTotal: (items, discountPercentage) => {
    const { prices } = get();
    let subtotal = 0;

    if (items.annualSub) subtotal += prices.annualSub;
    if (items.festivalSub) subtotal += prices.festivalSub;
    if (items.promisePartySub) subtotal += prices.promisePartySub;
    if (items.scarfReplacement) subtotal += prices.scarfReplacement;
    if (items.wajla) subtotal += prices.wajla;
    if (items.badges) subtotal += prices.badges;

    const discountAmount = Math.round((subtotal * discountPercentage) / 100);
    const totalPaid = Math.max(0, subtotal - discountAmount);

    return { subtotal, discountAmount, totalPaid };
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
}));
