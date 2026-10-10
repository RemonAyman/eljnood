/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ⚜️ منظومة جنود المسيح الكشفية - ملف دوال الربط ومزامنة الويب (Web Client SDK)
 * ══════════════════════════════════════════════════════════════════════════════
 * هذا الملف مخصص لمطور الـ Frontend لموقع الويب (React / Next.js / Vue / Angular).
 * يتيح للموقع الربط المباشر مع نفس قاعدة بيانات تطبيق الموبايل (Firebase Cloud Firestore)
 * لمزامنة البيانات في الوقت الفعلي (Real-time Sync) بدون أي تعارض.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

// ─── 1. إعدادات الربط مع فايربيز (نفس قاعدة بيانات الموبايل بالملي) ───────────
export const firebaseConfig = {
  apiKey: "AIzaSyA7C2nkInbCsxXvbVlQhMUluvvDJpZSg3Y",
  authDomain: "eljnood.firebaseapp.com",
  projectId: "eljnood",
  storageBucket: "eljnood.firebasestorage.app",
  messagingSenderId: "365768489083",
  appId: "1:365768489083:web:13f712b6d768871fb58ade" // Web Client App ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// ─── 2. أسماء الجداول والمجموعات المشتركة مع الموبايل ──────────────────────────
export const COLLECTIONS = {
  MEMBERS: 'members',                        // سجلات قيد الأعضاء والأشبال
  USERS: 'users',                            // حسابات المستخدمين والقادة
  ATTENDANCE: 'attendance',                  // سجلات الحضور والغياب اليومي
  SUBSCRIPTIONS: 'subscriptions',            // الاشتراكات المالية والإيصالات
  CHAT_MESSAGES: 'chat_messages',            // رسائل المحادثات الفورية والوسائط
  CHAT_ROOMS: 'chat_rooms',                  // غرف الدردشة
  ROOM_RESERVATIONS: 'room_reservations',    // حجوزات قاعات الكنيسة
  INVENTORY_REQUESTS: 'inventory_requests',  // طلبات العهد والمهمات الكشفية
  FOLLOW_UPS: 'follow_ups',                  // تقارير الافتقاد والزيارات
  ABSENCE_EXCUSES: 'absence_excuses',        // أعذار الغياب المقدمة
  MEMORIES: 'memories',                      // معرض الصور وألبوم الذكريات
  CURRICULA: 'curricula',                    // المناهج والمسابقات الكشفية
  SCOUTING_PLANS: 'scouting_plans',          // الخطط السنوية والأنشطة
  PARTIES_EVENTS: 'parties_events',          // الحفلات والمعسكرات والفعاليات
  NOTIFICATIONS: 'notifications',            // التنبيهات والإشعارات العامة
  PUSH_TOKENS: 'push_tokens',                // توكن إشعارات هواتف المستخدمين
  DISCOUNT_CODES: 'discount_codes',          // كوبونات خصم الاشتراكات
} as const;

// ─── 3. الأنواع والـ Data Types المشتركة ───────────────────────────────────────
export type Role = 
  | 'CHILD'            // طفل / شبل / كشاف
  | 'LEADER'           // قائد وحدة
  | 'JOWALAH'          // عشيرة الجوالة
  | 'SECTION_LEADER'   // رئيس قطاع
  | 'GROUP_MANAGER'    // قائد عام / أمين خدمة
  | 'PARENT'           // ولي أمر
  | 'ADMIN';           // مسؤول النظام

export type SquadName = 
  | 'براعم' | 'أشبال' | 'زهرات' | 'كشاف' | 'مرشدات' | 'متقدم' | 'رائدات' | 'جوالة' | 'قادة';

export interface Member {
  id: string;
  code: string;               // كود الكشافة المميز (مثال: JS-2026-448)
  name: string;
  gender: 'MALE' | 'FEMALE';
  scarfStatus: 'RECEIVED' | 'NOT_RECEIVED' | 'WITHDRAWN';
  birthDate: string;          // YYYY-MM-DD
  gradeLevel: string;         // المرحلة الدراسية
  squadName: SquadName;       // القطاع / الفرقة
  phone?: string;
  guardianPhone: string;      // رقم ولي الأمر
  region?: string;            // العنوان / المنطقة
  avatarBase64?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;                 // docId: memberId_date_eventType
  memberId: string;
  memberName: string;
  memberCode: string;
  date: string;               // YYYY-MM-DD
  eventType: 'SCOUTING_DAY' | 'CAMP' | 'BIBLE_STUDY' | 'TASBEHA' | 'LEADERS_MEETING' | 'JOWALAH_MEETING';
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  excuseReason?: string;
  recordedBy: string;
  timestamp?: string;
}

export interface SubscriptionRecord {
  id: string;
  receiptNumber: string;      // رقم الإيصال
  memberId: string;
  memberCode: string;
  memberName: string;
  year: number;
  annualSub: boolean;
  festivalSub: boolean;
  promisePartySub: boolean;
  scarfReplacement: boolean;
  subtotal: number;
  discountPercentage: number;
  totalPaid: number;
  createdAt: string;
}

export interface ChatMessage {
  id?: string;
  roomId: string;             // GENERAL | SECTOR_كشاف | LEADERS_ROOM ...
  senderId: string;
  senderName: string;
  senderRole: Role;
  content: string;
  mediaType?: 'IMAGE' | 'AUDIO' | 'DOCUMENT';
  mediaBase64?: string;
  senderAvatar?: string;
  createdAt: string;
}

export interface PartyEvent {
  id: string;
  title: string;
  eventDate: string;          // YYYY-MM-DD
  eventTime: string;          // e.g. 06:00 مساءً
  location: string;
  targetAudience: string;
  description: string;
  createdByName?: string;
  createdAt: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. خدمات الحسابات والمصادقة (Authentication API)
// ══════════════════════════════════════════════════════════════════════════════

/** تسجيل الدخول بالبريد الإلكتروني / كود الكشاف */
export async function webLogin(identifier: string, pass: string) {
  try {
    const cleanId = identifier.trim().toLowerCase();
    let emailToAuth = cleanId;

    // إذا تم الإدخال بكود الكشاف أو الموبايل، نبحث عنه في Firestore
    if (!cleanId.includes('@')) {
      const userDoc = await findUserByIdentifier(cleanId);
      if (userDoc && userDoc.email) {
        emailToAuth = userDoc.email;
      } else {
        emailToAuth = `${cleanId}@eljnood.scouts`;
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, emailToAuth, pass);
    const profile = await fetchUserProfile(userCredential.user.uid);
    return { success: true, user: profile, firebaseUser: userCredential.user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/** جلب بيانات المستخدم الشخصية */
export async function fetchUserProfile(uid: string) {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
}

/** البحث عن مستخدم بواسطة الكود أو رقم الهاتف */
export async function findUserByIdentifier(identifier: string) {
  const cleanId = identifier.trim().toLowerCase();
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  let matched: any = null;
  snap.forEach((d) => {
    const data = d.data();
    if (
      (data.code && data.code.toLowerCase() === cleanId) ||
      (data.email && data.email.toLowerCase() === cleanId) ||
      (data.phone && data.phone === cleanId)
    ) {
      matched = { id: d.id, ...data };
    }
  });
  return matched;
}

/** تسجيل خروج */
export async function webSignOut() {
  await signOut(auth);
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. إدارة الأعضاء والكشافة (Members API)
// ══════════════════════════════════════════════════════════════════════════════

/** جلب جميع الأعضاء المقيدين */
export async function fetchAllMembers(): Promise<Member[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.MEMBERS));
  const list: Member[] = [];
  snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Member) }));
  return list;
}

/** إضافة أو تعديل عضو كشفي */
export async function upsertMember(member: Member): Promise<boolean> {
  const docId = member.code || member.id;
  await setDoc(doc(db, COLLECTIONS.MEMBERS, docId), {
    ...member,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  return true;
}

/** حذف عضو كشفي */
export async function deleteMember(memberIdOrCode: string): Promise<boolean> {
  await deleteDoc(doc(db, COLLECTIONS.MEMBERS, memberIdOrCode));
  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. إدارة الحضور والغياب (Attendance API)
// ══════════════════════════════════════════════════════════════════════════════

/** تسجيل حضور أو غياب عضو */
export async function recordAttendance(record: AttendanceRecord): Promise<boolean> {
  const docId = `${record.memberId}_${record.date}_${record.eventType}`;
  await setDoc(doc(db, COLLECTIONS.ATTENDANCE, docId), {
    ...record,
    timestamp: new Date().toISOString()
  }, { merge: true });
  return true;
}

/** جلب سجلات الحضور لتاريخ محدد أو لكل الأيام */
export async function fetchAttendance(date?: string): Promise<AttendanceRecord[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
  const list: AttendanceRecord[] = [];
  snapshot.forEach((d) => {
    const data = d.data() as AttendanceRecord;
    if (!date || data.date === date) list.push(data);
  });
  return list;
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. الاشتراكات والماليات (Subscriptions API)
// ══════════════════════════════════════════════════════════════════════════════

/** إضافة إيصال اشتراك جديد */
export async function createSubscriptionReceipt(receipt: SubscriptionRecord): Promise<boolean> {
  const docId = receipt.receiptNumber || `REC-${Date.now()}`;
  await setDoc(doc(db, COLLECTIONS.SUBSCRIPTIONS, docId), {
    ...receipt,
    createdAt: receipt.createdAt || new Date().toISOString()
  }, { merge: true });
  return true;
}

/** جلب جميع الإيصالات المالية */
export async function fetchAllSubscriptions(): Promise<SubscriptionRecord[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.SUBSCRIPTIONS));
  const list: SubscriptionRecord[] = [];
  snapshot.forEach((d) => list.push(d.data() as SubscriptionRecord));
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ══════════════════════════════════════════════════════════════════════════════
// 8. الشات اللحظي المشترك مع الموبايل (Real-time Live Chat API)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * الاشتراك في رسائل غرفة الدردشة لحظياً (WebSockets Listener)
 * يتم استدعاؤها في واجهة الويب لمزامنة الرسائل مع تطبيق الموبايل فورياً!
 */
export function subscribeToWebChatMessages(
  roomId: string,
  onNewMessages: (messages: ChatMessage[]) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.CHAT_MESSAGES), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const list: ChatMessage[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as ChatMessage;
      if (data.roomId === roomId) {
        list.push({ id: d.id, ...data });
      }
    });
    onNewMessages(list);
  });
}

/** إرسال رسالة في الشات (تصل للموبايل في نفس الثانية مع إشعار فوري) */
export async function sendWebChatMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<boolean> {
  const newMsg = {
    ...msg,
    createdAt: new Date().toISOString()
  };
  await addDoc(collection(db, COLLECTIONS.CHAT_MESSAGES), newMsg);

  // إرسال إشعار للموبايل
  await sendWebNotification({
    title: 'رسالة جديدة في الشات 💬',
    body: `${msg.senderName}: ${msg.content.slice(0, 50)}`,
    type: 'CHAT',
    senderId: msg.senderId,
    senderName: msg.senderName,
    roomId: msg.roomId,
  });

  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// 9. الفعاليات والحفلات والمعسكرات (Events & Parties API)
// ══════════════════════════════════════════════════════════════════════════════

/** جلب جميع الفعاليات القادمة */
export async function fetchEvents(): Promise<PartyEvent[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.PARTIES_EVENTS));
  const list: PartyEvent[] = [];
  snap.forEach((d) => list.push(d.data() as PartyEvent));
  return list.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
}

/** إنشاء فعالية جديدة أو حفلة */
export async function createPartyEvent(party: Omit<PartyEvent, 'id' | 'createdAt'>): Promise<string> {
  const docId = `party_${Date.now()}`;
  const fullParty: PartyEvent = {
    ...party,
    id: docId,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, COLLECTIONS.PARTIES_EVENTS, docId), fullParty);

  // إرسال إشعار فوري للموبايل
  await sendWebNotification({
    title: `🎭 فعالية جديدة: ${party.title}`,
    body: `الموعد: ${party.eventDate} - المكان: ${party.location}`,
    type: 'SYSTEM',
  });

  return docId;
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. الإشعارات المركزية المشتركة (Central Notifications & Push API)
// ══════════════════════════════════════════════════════════════════════════════

/** إرسال إشعار يظهر في الويب والموبايل معاً */
export async function sendWebNotification(notifData: {
  title: string;
  body: string;
  type: 'CHAT' | 'MEMORY' | 'SCOUTING_PLAN' | 'CURRICULUM' | 'SYSTEM' | string;
  senderId?: string;
  senderName?: string;
  roomId?: string;
  targetRole?: string;
}): Promise<boolean> {
  try {
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...notifData,
      createdAt: new Date().toISOString()
    });

    // إرسال Push Notification لأجهزة الموبايل المسجلة عبر سيرفر Expo Push
    const tokensSnap = await getDocs(collection(db, COLLECTIONS.PUSH_TOKENS));
    const tokens: string[] = [];
    tokensSnap.forEach((d) => {
      const t = d.data().token;
      if (t) tokens.push(t);
    });

    if (tokens.length > 0) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokens.map((to) => ({
          to,
          title: notifData.title,
          body: notifData.body,
          sound: 'default',
          data: notifData
        })))
      });
    }

    return true;
  } catch {
    return false;
  }
}
