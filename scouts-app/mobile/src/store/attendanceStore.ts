import { create } from 'zustand';
import { AttendanceRecord, EventType } from '../types';

interface AttendanceState {
  records: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => AttendanceRecord;
  getMemberAttendanceRate: (memberId: string) => number;
  getMemberAbsenceDays: (memberIdOrCode: string) => number;
  importFromFingerprintExcel: (date: string, eventType: EventType) => number;
  getAttendanceStats: (date: string, eventType: EventType) => {
    present: number;
    absent: number;
    excused: number;
    total: number;
  };
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
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
  getMemberAbsenceDays: (memberIdOrCode) => {
    const clean = memberIdOrCode.trim().toLowerCase();
    const list = get().records.filter(
      (r) => (r.memberId.toLowerCase() === clean || r.memberCode.toLowerCase() === clean) && r.status === 'ABSENT'
    );
    return list.length;
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
