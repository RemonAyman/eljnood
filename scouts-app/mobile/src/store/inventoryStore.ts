import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem, InventoryRequest } from '../types';
import { saveInventoryRequestToFirestore } from '../services/firebaseService';

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  // 1. المسرح
  { id: 'th_1', categoryId: 'THEATER', name: 'كشافات إضاءة مسرحية LED', totalQuantity: 6, availableQuantity: 6, unit: 'كشاف' },
  { id: 'th_2', categoryId: 'THEATER', name: 'ميكروفونات لاسلكية للمسرح', totalQuantity: 8, availableQuantity: 8, unit: 'مايك' },
  { id: 'th_3', categoryId: 'THEATER', name: 'ستارة خلفية للمسرح الكنسي', totalQuantity: 2, availableQuantity: 2, unit: 'ستارة' },
  { id: 'th_4', categoryId: 'THEATER', name: 'لوحة ميكسر إضاءة مسرحية', totalQuantity: 1, availableQuantity: 1, unit: 'جهاز' },
  { id: 'th_5', categoryId: 'THEATER', name: 'أطقم أزياء مسرحية تاريخية', totalQuantity: 20, availableQuantity: 20, unit: 'طقم' },

  // 2. ريادي
  { id: 'sc_1', categoryId: 'SCOUT_LEADERSHIP', name: 'سواري خشبية كشفية (أخشاب أبراج)', totalQuantity: 20, availableQuantity: 20, unit: 'سارية' },
  { id: 'sc_2', categoryId: 'SCOUT_LEADERSHIP', name: 'حبال قطن كشفية 8 مم', totalQuantity: 25, availableQuantity: 25, unit: 'لفة' },
  { id: 'sc_3', categoryId: 'SCOUT_LEADERSHIP', name: 'حبال مانيلا متينة 12 مم', totalQuantity: 15, availableQuantity: 15, unit: 'لفة' },
  { id: 'sc_4', categoryId: 'SCOUT_LEADERSHIP', name: 'خيام كشفية هرمية كبيرة', totalQuantity: 10, availableQuantity: 10, unit: 'خيمة' },
  { id: 'sc_5', categoryId: 'SCOUT_LEADERSHIP', name: 'خيام قبابية متنقلة', totalQuantity: 8, availableQuantity: 8, unit: 'خيمة' },
  { id: 'sc_6', categoryId: 'SCOUT_LEADERSHIP', name: 'بلطات كشفية مع جراب أمان', totalQuantity: 5, availableQuantity: 5, unit: 'بلطة' },

  // 3. ألعاب
  { id: 'gm_1', categoryId: 'GAMES', name: 'كرات قدم أصلية مقاس 5', totalQuantity: 6, availableQuantity: 6, unit: 'كرة' },
  { id: 'gm_2', categoryId: 'GAMES', name: 'كرات طائرة للمهرجانات', totalQuantity: 5, availableQuantity: 5, unit: 'كرة' },
  { id: 'gm_3', categoryId: 'GAMES', name: 'كرات سلة للأنشطة الرياضية', totalQuantity: 4, availableQuantity: 4, unit: 'كرة' },
  { id: 'gm_4', categoryId: 'GAMES', name: 'أقماع تدريب فسفورية ملونة', totalQuantity: 30, availableQuantity: 30, unit: 'قمع' },
  { id: 'gm_5', categoryId: 'GAMES', name: 'حبل شد الحبل كبير للمعسكرات', totalQuantity: 2, availableQuantity: 2, unit: 'حبل' },
  { id: 'gm_6', categoryId: 'GAMES', name: 'أطواق هولاهوب للألعاب الحركية', totalQuantity: 15, availableQuantity: 15, unit: 'طوق' },
  { id: 'gm_7', categoryId: 'GAMES', name: 'مضارب وكرات تنس طاولة (بينج بونج)', totalQuantity: 8, availableQuantity: 8, unit: 'مضرب' },

  // 4. أدوات مطبخ
  { id: 'kt_1', categoryId: 'KITCHEN_TOOLS', name: 'حلل طهي كبيرة للمعسكرات والرحلات', totalQuantity: 8, availableQuantity: 8, unit: 'حلة' },
  { id: 'kt_2', categoryId: 'KITCHEN_TOOLS', name: 'صواني تقديم ألمنيوم مقاسات', totalQuantity: 12, availableQuantity: 12, unit: 'صينية' },
  { id: 'kt_3', categoryId: 'KITCHEN_TOOLS', name: 'أطباق طعام معسكرات ملامين متينة', totalQuantity: 80, availableQuantity: 80, unit: 'طبق' },
  { id: 'kt_4', categoryId: 'KITCHEN_TOOLS', name: 'طقم ملاعق وشوك ستانلس', totalQuantity: 100, availableQuantity: 100, unit: 'قطعة' },
  { id: 'kt_5', categoryId: 'KITCHEN_TOOLS', name: 'كاسات ومجات شاي معسكرات', totalQuantity: 70, availableQuantity: 70, unit: 'كوب' },

  // 5. أجهزة مطبخ
  { id: 'ka_1', categoryId: 'KITCHEN_APPLIANCES', name: 'مواقد غاز ميدانية ثنائية العيون', totalQuantity: 4, availableQuantity: 4, unit: 'موقد' },
  { id: 'ka_2', categoryId: 'KITCHEN_APPLIANCES', name: 'أسطوانات بوتاجاز معسكرات بمحبس أمان', totalQuantity: 5, availableQuantity: 5, unit: 'أسطوانة' },
  { id: 'ka_3', categoryId: 'KITCHEN_APPLIANCES', name: 'ثلاجة حفظ أطعمة ومشروبات متنقلة', totalQuantity: 2, availableQuantity: 2, unit: 'ثلاجة' },
  { id: 'ka_4', categoryId: 'KITCHEN_APPLIANCES', name: 'غلايات مياه كهربائية سعة 10 لتر', totalQuantity: 3, availableQuantity: 3, unit: 'غلاية' },

  // 6. صوتية ومرئية
  { id: 'av_1', categoryId: 'AUDIO_VISUAL', name: 'سماعات دي جي صوت كبرى مع الحوامل', totalQuantity: 4, availableQuantity: 4, unit: 'سماعة' },
  { id: 'av_2', categoryId: 'AUDIO_VISUAL', name: 'ميكسر صوت احترافي 8 قنوات', totalQuantity: 2, availableQuantity: 2, unit: 'ميكسر' },
  { id: 'av_3', categoryId: 'AUDIO_VISUAL', name: 'أجهزة داتا شو بروجكتور عرض عالي الدقة', totalQuantity: 3, availableQuantity: 3, unit: 'جهاز' },
  { id: 'av_4', categoryId: 'AUDIO_VISUAL', name: 'شاشات عرض بروجكتور متنقلة بحامل', totalQuantity: 3, availableQuantity: 3, unit: 'شاشة' },
  { id: 'av_5', categoryId: 'AUDIO_VISUAL', name: 'كابلات توصيل صوت XLR ومحولات', totalQuantity: 15, availableQuantity: 15, unit: 'كابل' },

  // 7. كمبيوتر ولاسلكي
  { id: 'cw_1', categoryId: 'COMPUTERS_WIRELESS', name: 'أجهزة لاسلكي موتورولا ميدانية طويلة المدى', totalQuantity: 12, availableQuantity: 12, unit: 'جهاز' },
  { id: 'cw_2', categoryId: 'COMPUTERS_WIRELESS', name: 'أجهزة لابتوب لتشغيل الفعاليات والتسجيل', totalQuantity: 3, availableQuantity: 3, unit: 'لابتوب' },
  { id: 'cw_3', categoryId: 'COMPUTERS_WIRELESS', name: 'رواتر إنترنت ميداني 4G متنقل بشريحة', totalQuantity: 2, availableQuantity: 2, unit: 'راوتر' },
  { id: 'cw_4', categoryId: 'COMPUTERS_WIRELESS', name: 'شواحن وبطاريات لاسلكي احتياطية', totalQuantity: 14, availableQuantity: 14, unit: 'بطارية' },

  // 8. أدوات مكتبية
  { id: 'st_1', categoryId: 'STATIONERY', name: 'رزم ورق فابريانو وكرتون ملون للأنشطة', totalQuantity: 20, availableQuantity: 20, unit: 'رزمة' },
  { id: 'st_2', categoryId: 'STATIONERY', name: 'علب أقلام ماركر وفلوماستر عريضة', totalQuantity: 15, availableQuantity: 15, unit: 'علبة' },
  { id: 'st_3', categoryId: 'STATIONERY', name: 'بوردات كتابة خشبية لتقييم الطوابير', totalQuantity: 25, availableQuantity: 25, unit: 'بوردة' },
  { id: 'st_4', categoryId: 'STATIONERY', name: 'دباسات ورق كبيرة وخرامات معدنية', totalQuantity: 8, availableQuantity: 8, unit: 'قطعة' },

  // 9. عدة كهربائية
  { id: 'el_1', categoryId: 'ELECTRICAL_TOOLS', name: 'بكرات كابلات كهرباء ثقيلة 50 متر', totalQuantity: 6, availableQuantity: 6, unit: 'بكرة' },
  { id: 'el_2', categoryId: 'ELECTRICAL_TOOLS', name: 'مشتركات كهرباء متعددة الفيش مع حماية', totalQuantity: 12, availableQuantity: 12, unit: 'مشترك' },
  { id: 'el_3', categoryId: 'ELECTRICAL_TOOLS', name: 'كشافات إضاءة ليلية عالية السطوع للمخيم', totalQuantity: 10, availableQuantity: 10, unit: 'كشاف' },
  { id: 'el_4', categoryId: 'ELECTRICAL_TOOLS', name: 'أجهزة فحص وقياس الجهد الكهربائي', totalQuantity: 3, availableQuantity: 3, unit: 'جهاز' },

  // 10. عدة عامة
  { id: 'gt_1', categoryId: 'GENERAL_TOOLS', name: 'صناديق عدة صيانة متكاملة (مفكات، بنس، مفاتيح)', totalQuantity: 4, availableQuantity: 4, unit: 'صندوق' },
  { id: 'gt_2', categoryId: 'GENERAL_TOOLS', name: 'شواكيش مخلب كشفية متينة', totalQuantity: 8, availableQuantity: 8, unit: 'شاكوش' },
  { id: 'gt_3', categoryId: 'GENERAL_TOOLS', name: 'مناشير خشب يدوية حادة', totalQuantity: 5, availableQuantity: 5, unit: 'منشار' },
  { id: 'gt_4', categoryId: 'GENERAL_TOOLS', name: 'أشرطة قياس متري 50 متر و30 متر', totalQuantity: 6, availableQuantity: 6, unit: 'شريط' },
];

interface InventoryState {
  items: InventoryItem[];
  requests: InventoryRequest[];
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateStock: (itemId: string, newTotal: number, newAvailable: number) => void;
  requestItem: (
    data: Omit<InventoryRequest, 'id' | 'status' | 'createdAt'>
  ) => { success: boolean; message: string; request?: InventoryRequest };
  updateRequestStatus: (requestId: string, status: InventoryRequest['status']) => void;
  setRequests: (requests: InventoryRequest[]) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: INITIAL_INVENTORY_ITEMS,
      requests: [],

      addItem: (itemData) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: `item_${Date.now()}`,
        };
        set((state) => ({ items: [newItem, ...state.items] }));
      },

      updateStock: (itemId, newTotal, newAvailable) => {
        set((state) => ({
          items: state.items.map((it) =>
            it.id === itemId
              ? { ...it, totalQuantity: newTotal, availableQuantity: Math.min(newAvailable, newTotal) }
              : it
          ),
        }));
      },

      requestItem: (data) => {
        const state = get();
        const targetItem = state.items.find(
          (it) => it.id === data.itemId || it.name.trim() === data.itemName.trim()
        );

        if (targetItem) {
          if (targetItem.availableQuantity < data.quantity) {
            return {
              success: false,
              message: `عذراً! الكمية المتاحة حالياً من (${targetItem.name}) هي ${targetItem.availableQuantity} فقط.`,
            };
          }

          // Deduct requested quantity from available stock
          const updatedItems = state.items.map((it) =>
            it.id === targetItem.id
              ? { ...it, availableQuantity: it.availableQuantity - data.quantity }
              : it
          );

          const newReq: InventoryRequest = {
            id: `req_${Date.now()}`,
            ...data,
            itemId: targetItem.id,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          };

          set({
            items: updatedItems,
            requests: [newReq, ...state.requests],
          });

          // Save to firestore asynchronously
          saveInventoryRequestToFirestore(newReq).catch((e) =>
            console.warn('Sync inventory request to firestore note:', e)
          );

          return {
            success: true,
            message: `تم حجز عدد (${data.quantity}) بنجاح، وتبقى في المخزن (${targetItem.availableQuantity - data.quantity}) قطعة متاحة.`,
            request: newReq,
          };
        } else {
          // General item not pre-listed
          const newReq: InventoryRequest = {
            id: `req_${Date.now()}`,
            ...data,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          };

          set({ requests: [newReq, ...state.requests] });
          saveInventoryRequestToFirestore(newReq).catch((e) =>
            console.warn('Sync inventory request to firestore note:', e)
          );

          return {
            success: true,
            message: 'تم إرسال الطلب لمسؤول المخزن للمراجعة.',
            request: newReq,
          };
        }
      },

      updateRequestStatus: (requestId, status) => {
        const state = get();
        const req = state.requests.find((r) => r.id === requestId);
        if (!req) return;

        let updatedItems = state.items;

        // If returned or rejected, restore available stock
        if ((status === 'RETURNED' || status === 'REJECTED') && req.status !== 'RETURNED' && req.status !== 'REJECTED') {
          if (req.itemId) {
            updatedItems = state.items.map((it) =>
              it.id === req.itemId
                ? { ...it, availableQuantity: Math.min(it.totalQuantity, it.availableQuantity + (req.quantity || 1)) }
                : it
            );
          }
        }

        const updatedRequests = state.requests.map((r) =>
          r.id === requestId ? { ...r, status } : r
        );

        set({ items: updatedItems, requests: updatedRequests });
      },

      setRequests: (requests) => set({ requests }),
    }),
    {
      name: 'jnood-inventory-store-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
