import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Member, AttendanceRecord, SubscriptionRecord } from '../types';

// ─── Collections Names ────────────────────────────────────────────────────────
export const COLLECTIONS = {
  MEMBERS: 'members',
  USERS: 'users',
  ATTENDANCE: 'attendance',
  SUBSCRIPTIONS: 'subscriptions',
  CHAT_MESSAGES: 'chat_messages',
  ROOM_RESERVATIONS: 'room_reservations',
  INVENTORY_REQUESTS: 'inventory_requests',
  FOLLOW_UPS: 'follow_ups',
  ABSENCE_EXCUSES: 'absence_excuses',
} as const;

// ─── 1. Members Operations ───────────────────────────────────────────────────

/** Save or create a member in Cloud Firestore */
export async function saveMemberToFirestore(member: Member): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.MEMBERS, member.code || member.id);
    await setDoc(docRef, {
      ...member,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('✅ Member successfully saved to Firestore:', member.code);
    return true;
  } catch (error: any) {
    console.warn('⚠️ Firestore save member error (check security rules):', error.message);
    return false;
  }
}

/** Fetch all members from Cloud Firestore */
export async function fetchMembersFromFirestore(): Promise<Member[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.MEMBERS));
    const members: Member[] = [];
    snapshot.forEach((docSnap) => {
      members.push(docSnap.data() as Member);
    });
    return members;
  } catch (error: any) {
    console.warn('⚠️ Firestore fetch members error:', error.message);
    return [];
  }
}

// ─── 2. Users Operations ─────────────────────────────────────────────────────

export async function saveUserToFirestore(userData: {
  uid: string;
  name: string;
  email: string;
  role: string;
  code?: string;
  phone?: string;
  guardianPhone?: string;
  sectionName?: string;
  sectionLeaderName?: string;
  sonName?: string;
  sonCode?: string;
}): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userData.uid);
    await setDoc(docRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error: any) {
    console.warn('⚠️ Firestore save user error:', error.message);
    return false;
  }
}

/** Look up user or member in Firestore by email, code, phone, or uid */
export async function findUserOrMemberInFirestore(identifier: string): Promise<any | null> {
  try {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Search in users collection
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    let matchedUser: any = null;
    usersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const emailMatch = data.email && data.email.toLowerCase() === cleanId;
      const codeMatch = data.code && data.code.toLowerCase() === cleanId;
      const phoneMatch = data.phone && data.phone === cleanId;
      const sonCodeMatch = data.sonCode && data.sonCode.toLowerCase() === cleanId;
      if (emailMatch || codeMatch || phoneMatch || sonCodeMatch) {
        matchedUser = { id: docSnap.id, ...data };
      }
    });

    if (matchedUser) return matchedUser;

    // 2. Search in members collection
    const membersSnapshot = await getDocs(collection(db, COLLECTIONS.MEMBERS));
    let matchedMember: any = null;
    membersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const codeMatch = data.code && data.code.toLowerCase() === cleanId;
      const phoneMatch = data.phone && data.phone === cleanId;
      const guardianMatch = data.guardianPhone && data.guardianPhone === cleanId;
      if (codeMatch || phoneMatch || guardianMatch) {
        matchedMember = { id: docSnap.id, role: 'CHILD', ...data };
      }
    });

    return matchedMember;
  } catch (error: any) {
    console.warn('⚠️ findUserOrMemberInFirestore error:', error.message);
    return null;
  }
}

export async function fetchMemberByCodeFromFirestore(code: string): Promise<Member | null> {
  try {
    const cleanCode = code.trim().toLowerCase();
    const membersSnapshot = await getDocs(collection(db, COLLECTIONS.MEMBERS));
    let found: Member | null = null;
    membersSnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Member;
      if (data.code && data.code.toLowerCase() === cleanCode) {
        found = data;
      }
    });
    return found;
  } catch (error: any) {
    console.warn('⚠️ fetchMemberByCodeFromFirestore error:', error.message);
    return null;
  }
}


// ─── 3. Subscriptions & Receipts Operations ──────────────────────────────────

export async function saveSubscriptionToFirestore(record: SubscriptionRecord): Promise<boolean> {
  try {
    const docId = record.receiptNumber || `REC-${Date.now()}`;
    const docRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, docId);
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error: any) {
    console.warn('⚠️ Firestore save subscription error:', error.message);
    return false;
  }
}

export async function fetchMemberSubscriptions(memberCode: string): Promise<SubscriptionRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SUBSCRIPTIONS));
    const list: SubscriptionRecord[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as SubscriptionRecord;
      if (data.memberCode === memberCode) {
        list.push(data);
      }
    });
    return list;
  } catch (error: any) {
    console.warn('⚠️ Firestore fetch subscriptions error:', error.message);
    return [];
  }
}

export async function fetchAllSubscriptionsFromFirestore(): Promise<SubscriptionRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SUBSCRIPTIONS));
    const list: SubscriptionRecord[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as SubscriptionRecord);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.warn('⚠️ Firestore fetch all subscriptions error:', error.message);
    return [];
  }
}

// ─── 4. Real-time Chat Messages Operations ───────────────────────────────────

export function subscribeToChatMessages(
  roomId: string,
  onMessagesUpdate: (messages: any[]) => void
) {
  try {
    const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const roomMsgs: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.roomId === roomId) {
            roomMsgs.push({ id: docSnap.id, ...data });
          }
        });
        onMessagesUpdate(roomMsgs);
      },
      (error) => {
        console.warn('⚠️ Chat snapshot listener warning:', error.message);
      }
    );
  } catch (e: any) {
    console.warn('⚠️ Subscribe chat error:', e.message);
    return () => {};
  }
}

export async function sendChatMessageToFirestore(msg: {
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  mediaType?: string;
}): Promise<boolean> {
  try {
    const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
    await addDoc(messagesRef, {
      ...msg,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error: any) {
    console.warn('⚠️ Send chat message error:', error.message);
    return false;
  }
}

// ─── 5. Attendance Operations ────────────────────────────────────────────────

export async function saveAttendanceToFirestore(record: AttendanceRecord): Promise<boolean> {
  try {
    const docId = `${record.memberId}_${record.date}_${record.eventType}`;
    const docRef = doc(db, COLLECTIONS.ATTENDANCE, docId);
    await setDoc(docRef, record, { merge: true });
    return true;
  } catch (error: any) {
    console.warn('⚠️ Firestore save attendance error:', error.message);
    return false;
  }
}

export async function fetchAttendanceFromFirestore(date?: string): Promise<AttendanceRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    const list: AttendanceRecord[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as AttendanceRecord;
      if (!date || data.date === date) {
        list.push(data);
      }
    });
    return list;
  } catch (error: any) {
    console.warn('⚠️ Firestore fetch attendance error:', error.message);
    return [];
  }
}

// ─── 6. Follow-up Operations ─────────────────────────────────────────────────

export async function saveFollowUpToFirestore(followUp: any): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.FOLLOW_UPS, followUp.id || `fu_${Date.now()}`);
    await setDoc(docRef, {
      ...followUp,
      createdAt: followUp.createdAt || new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error: any) {
    console.warn('⚠️ Firestore save follow-up error:', error.message);
    return false;
  }
}

export async function fetchFollowUpsFromFirestore(): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.FOLLOW_UPS));
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (error: any) {
    console.warn('⚠️ Firestore fetch follow-ups error:', error.message);
    return [];
  }
}

// ─── 7. Room Reservations Operations ──────────────────────────────────────────

export async function saveRoomReservationToFirestore(reservation: any): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.ROOM_RESERVATIONS, reservation.id || `res_${Date.now()}`);
    await setDoc(docRef, {
      ...reservation,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error: any) {
    console.warn('⚠️ Firestore save room reservation error:', error.message);
    return false;
  }
}

export async function fetchRoomReservationsFromFirestore(): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ROOM_RESERVATIONS));
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (error: any) {
    console.warn('⚠️ Firestore fetch room reservations error:', error.message);
    return [];
  }
}

// ─── 8. Inventory Requests Operations ────────────────────────────────────────

export async function saveInventoryRequestToFirestore(request: any): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.INVENTORY_REQUESTS, request.id || `req_${Date.now()}`);
    await setDoc(docRef, {
      ...request,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error: any) {
    console.warn('⚠️ Firestore save inventory request error:', error.message);
    return false;
  }
}

export async function fetchInventoryRequestsFromFirestore(): Promise<any[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.INVENTORY_REQUESTS));
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (error: any) {
    console.warn('⚠️ Firestore fetch inventory requests error:', error.message);
    return [];
  }
}



// ─── 3. Seed Initial Data (ينشئ المجموعات والجداول فوراً في فايربيس) ─────────

export async function seedInitialFirestoreData(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Initial Members
    const sampleMembers: Member[] = [
      {
        id: 'm1',
        code: 'JS-2026-448',
        name: 'بيتر يوسف فايز',
        gender: 'MALE',
        scarfStatus: 'RECEIVED',
        birthDate: '2012-09-15',
        gradeLevel: 'PREP_1',
        squadName: 'كشاف',
        phone: '01012345678',
        guardianPhone: '01229876543',
        region: 'أسيوط - حي الجمهورية',
        buildingNo: 'عمارة الأمل 3',
        street: 'شارع الكنيسة',
        addressDescription: 'متفرع من شارع الجمهورية، الدور الثالث',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm2',
        code: 'JS-2026-449',
        name: 'كيرلس مينا شحاتة',
        gender: 'MALE',
        scarfStatus: 'NOT_RECEIVED',
        birthDate: '2015-04-10',
        gradeLevel: 'GRADE_4',
        squadName: 'أشبال',
        guardianPhone: '01223344556',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'm3',
        code: 'JS-2026-450',
        name: 'مارينا يوسف',
        gender: 'FEMALE',
        scarfStatus: 'WITHDRAWN',
        birthDate: '2011-01-20',
        gradeLevel: 'PREP_2',
        squadName: 'مرشدات',
        guardianPhone: '01099887766',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const m of sampleMembers) {
      await setDoc(doc(db, COLLECTIONS.MEMBERS, m.code), m, { merge: true });
    }

    // 2. Initial Users / Roles
    const sampleUsers = [
      {
        uid: 'admin_1',
        name: 'القائد العام / مدير الخدمة',
        email: 'admin@scouts.org',
        role: 'ADMIN',
        code: 'ADMIN-001',
        phone: '01000000001',
      },
      {
        uid: 'leader_1',
        name: 'القائد مينا نبيل',
        email: 'leader@scouts.org',
        role: 'LEADER',
        code: 'LEADER-07',
        phone: '01123456789',
      },
      {
        uid: 'parent_1',
        name: 'يوسف فايز مسعود',
        email: 'parent@scouts.org',
        role: 'PARENT',
        code: 'PARENT-448',
        phone: '01229876543',
      },
    ];

    for (const u of sampleUsers) {
      await setDoc(doc(db, COLLECTIONS.USERS, u.uid), u, { merge: true });
    }

    // 3. Initial Sample Attendance
    await setDoc(
      doc(db, COLLECTIONS.ATTENDANCE, 'sample_attendance_1'),
      {
        memberId: 'm1',
        memberName: 'بيتر يوسف فايز',
        memberCode: 'JS-2026-448',
        date: new Date().toISOString().split('T')[0],
        eventType: 'SCOUTING_DAY',
        status: 'PRESENT',
        recordedBy: 'القائد مينا (المسؤول)',
        timestamp: new Date().toISOString(),
      },
      { merge: true }
    );

    // 4. Initial Sample Subscription Record
    await setDoc(
      doc(db, COLLECTIONS.SUBSCRIPTIONS, 'REC-2026-001'),
      {
        receiptNumber: 'REC-2026-001',
        memberName: 'جورج سامي رزق',
        memberCode: 'JS-2026-102',
        squadName: 'كشاف',
        annualSub: true,
        totalAmount: 549,
        netAmount: 549,
        status: 'PAID',
        cashierName: 'أمين الخزينة جورج',
        date: new Date().toISOString(),
      },
      { merge: true }
    );

    return {
      success: true,
      message: 'تم إنشاء وتهيئة جداول فايربيس (members, users, attendance, subscriptions) بنجاح!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `خطأ في الاتصال بفايربيس: ${error.message}`,
    };
  }
}
