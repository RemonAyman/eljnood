import { create } from 'zustand';
import { AttendanceRecord, EventType } from '../types';

interface AttendanceState {
  records: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => AttendanceRecord;
  getMemberAttendanceRate: (memberId: string) => number;
  importFromFingerprintExcel: (date: string, eventType: EventType) => number;
  getAttendanceStats: (date: string, eventType: EventType) => {
    present: number;
    absent: number;
    excused: number;
    total: number;
  };
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [
    {
      id: 'att_1',
      memberId: 'm1',
      memberCode: 'JS-2026-448',
      memberName: 'بيتر يوسف فايز',
      date: '2026-09-22',
      eventType: 'SCOUTING_DAY',
      status: 'PRESENT',
      recordedBy: 'الخادم مينا نبيل',
    },
    {
      id: 'att_2',
      memberId: 'm2',
      memberCode: 'JS-2026-449',
      memberName: 'مريم هاني كمال',
      date: '2026-09-22',
      eventType: 'SCOUTING_DAY',
      status: 'PRESENT',
      recordedBy: 'الخادم مينا نبيل',
    },
    {
      id: 'att_3',
      memberId: 'm3',
      memberCode: 'JS-2026-450',
      memberName: 'كيرلس عماد شوقي',
      date: '2026-09-22',
      eventType: 'SCOUTING_DAY',
      status: 'EXCUSED',
      excuseReason: 'مرض وعذر مسبق',
      recordedBy: 'الخادم مينا نبيل',
    },
  ],
  markAttendance: (newRecordData) => {
    const existingIndex = get().records.findIndex(
      (r) =>
        r.memberId === newRecordData.memberId &&
        r.date === newRecordData.date &&
        r.eventType === newRecordData.eventType
    );

    const record: AttendanceRecord = {
      ...newRecordData,
      id: existingIndex >= 0 ? get().records[existingIndex].id : `att_${Date.now()}_${Math.random()}`,
    };

    if (existingIndex >= 0) {
      const updated = [...get().records];
      updated[existingIndex] = record;
      set({ records: updated });
    } else {
      set((state) => ({ records: [record, ...state.records] }));
    }

    return record;
  },
  getMemberAttendanceRate: (memberId) => {
    const memberRecords = get().records.filter((r) => r.memberId === memberId);
    if (memberRecords.length === 0) return 100;
    const presentCount = memberRecords.filter((r) => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
    return Math.round((presentCount / memberRecords.length) * 100);
  },
  importFromFingerprintExcel: (date, eventType) => {
    const demoMembers = [
      { id: 'm1', name: 'بيتر يوسف فايز', code: 'JS-2026-448' },
      { id: 'm2', name: 'مريم هاني كمال', code: 'JS-2026-449' },
      { id: 'm4', name: 'ساندي مجدي رمزي', code: 'JS-2026-451' },
      { id: 'm5', name: 'ديفيد رامي موريس', code: 'JS-2026-452' },
    ];

    demoMembers.forEach((m) => {
      get().markAttendance({
        memberId: m.id,
        memberName: m.name,
        memberCode: m.code,
        date,
        eventType,
        status: 'PRESENT',
        recordedBy: 'بصمة الحضور الإلكترونية (Excel)',
      });
    });

    return demoMembers.length;
  },
  getAttendanceStats: (date, eventType) => {
    const records = get().records.filter((r) => r.date === date && r.eventType === eventType);
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const excused = records.filter((r) => r.status === 'EXCUSED').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    return {
      present,
      excused,
      absent,
      total: present + excused + absent,
    };
  },
}));
