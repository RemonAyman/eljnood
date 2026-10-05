export type Role = 'CHILD' | 'LEADER' | 'JOWALAH' | 'SECTION_LEADER' | 'GROUP_MANAGER' | 'PARENT' | 'ADMIN';

export type Gender = 'MALE' | 'FEMALE';

export type ScarfStatus = 'RECEIVED' | 'NOT_RECEIVED' | 'WITHDRAWN'; // استلم | لم يستلم | مسحوب

export type SquadName = 
  | 'براعم'
  | 'أشبال'
  | 'زهرات'
  | 'كشاف'
  | 'مرشدات'
  | 'متقدم'
  | 'رائدات'
  | 'جوالة'
  | 'قادة';

export type GradeLevel = 
  | 'KG1' | 'KG2'
  | 'GRADE_1' | 'GRADE_2' | 'GRADE_3' | 'GRADE_4' | 'GRADE_5' | 'GRADE_6'
  | 'PREP_1' | 'PREP_2' | 'PREP_3'
  | 'SEC_1' | 'SEC_2' | 'SEC_3'
  | 'COLLEGE_1' | 'COLLEGE_2' | 'COLLEGE_3' | 'COLLEGE_4'
  | 'GRADUATE';

export interface Member {
  id: string;
  code: string;
  name: string;
  gender: Gender;
  scarfStatus: ScarfStatus;
  birthDate: string;
  gradeLevel: GradeLevel;
  squadName: SquadName;
  phone?: string;
  guardianPhone: string;
  region?: string;
  buildingNo?: string;
  street?: string;
  addressDescription?: string;
  avatarBase64?: string;
  email?: string;
  createdAt: string;
}

export type EventType = 
  | 'SCOUTING_DAY' 
  | 'CAMP' 
  | 'BIBLE_STUDY' 
  | 'TASBEHA' 
  | 'LEADERS_MEETING' 
  | 'JOWALAH_MEETING' 
  | 'SECTIONS_JOINT_MEETING';

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  date: string;
  eventType: EventType;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  excuseReason?: string;
  recordedBy: string;
  timestamp?: string; // ISO string, for Firestore ordering
}

export interface SubscriptionRecord {
  id: string;
  memberId: string;
  memberCode: string;
  memberName: string;
  year: number; // 2026, 2027, 2028, 2029
  annualSub: boolean;
  festivalSub: boolean;
  promisePartySub: boolean;
  scarfReplacement: boolean;
  wajla: boolean;
  badges: boolean;
  subtotal: number;
  discountPercentage: number;
  fixedDiscountEgp?: number;
  totalPaid: number;
  receiptNumber: string;
  createdAt: string;
}

export interface FollowUpRecord {
  id: string;
  memberId: string;
  memberName: string;
  primaryLeaderId: string;
  primaryLeaderName: string;
  coLeadersNames: string[];
  visitType: 'PHONE' | 'HOME_VISIT' | 'OCCASION';
  occasionDetails?: string;
  notes: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  content: string;
  mediaBase64?: string;
  mediaType?: 'IMAGE' | 'AUDIO' | 'DOCUMENT';
  senderAvatar?: string;
  createdAt: string;
}

export interface InventoryRequest {
  id: string;
  category: string;
  itemName: string;
  serviceName: string;
  requesterName: string;
  pickupDatetime: string;
  returnDatetime: string;
  status: 'PENDING' | 'APPROVED' | 'DELIVERED' | 'RETURNED' | 'REJECTED';
}

export interface RoomReservation {
  id: string;
  roomName: string;
  serviceName: string;
  date: string;
  startHour: number; // 8 to 23
  endHour: number;
  reservedByName: string;
}
