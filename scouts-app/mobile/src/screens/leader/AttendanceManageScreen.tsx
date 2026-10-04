import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useMembersStore } from '../../store/membersStore';
import { useAuthStore } from '../../store/authStore';
import { EventType, Member } from '../../types';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { saveAttendanceToFirestore, fetchAttendanceFromFirestore } from '../../services/firebaseService';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';
import { exportAttendanceReport } from '../../utils/reportExportUtils';

const EVENT_OPTIONS: { id: EventType; title: string; icon: string; subtitle: string }[] = [
  { id: 'SCOUTING_DAY', title: 'اليوم الكشفي (الأعضاء)', icon: '⛺', subtitle: 'حضور وماليات الأطفال' },
  { id: 'SCOUTING_DAY_LEADERS' as any, title: 'اليوم الكشفي (القادة والجوالة)', icon: '⚜️', subtitle: 'حضور القادة والجوالة باليوم' },
  { id: 'LEADERS_MEETING', title: 'اجتماع القادة والجوالة', icon: '🗣️', subtitle: 'غياب اجتماعات القادة' },
  { id: 'CAMP', title: 'المعسكر الكشفي', icon: '🏕️', subtitle: 'المعسكرات الكشفية' },
  { id: 'BIBLE_STUDY', title: 'درس الكتاب والتثقيف', icon: '📖', subtitle: 'المناهج والأنشطة الروحية' },
];

const MemberRowItem = React.memo(
  ({
    member,
    currentStatus,
    onQuickMark,
  }: {
    member: Member;
    currentStatus: string;
    onQuickMark: (member: Member, status: 'PRESENT' | 'ABSENT' | 'EXCUSED') => void;
  }) => {
    return (
      <View style={styles.memberRow}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View style={styles.memberSubRow}>
            <Text style={styles.memberCodeBadge}>{member.code}</Text>
            <Text style={styles.memberSquadBadge}>فرقة {member.squadName}</Text>
            <Text style={styles.scarfIcon}>
              {member.scarfStatus === 'RECEIVED' ? '<ctrl42>' : member.scarfStatus === 'WITHDRAWN' ? '⚠️' : '❌'}
            </Text>
          </View>
        </View>

        {/* 3 Status Buttons */}
        <View style={styles.statusButtonsGroup}>
          <TouchableOpacity
            style={[styles.statusBtn, currentStatus === 'PRESENT' && styles.statusBtnPresentActive]}
            onPress={() => onQuickMark(member, 'PRESENT')}
          >
            <Text style={[styles.statusBtnText, currentStatus === 'PRESENT' && styles.statusBtnTextActive]}>
              حاضر
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusBtn, currentStatus === 'EXCUSED' && styles.statusBtnExcusedActive]}
            onPress={() => onQuickMark(member, 'EXCUSED')}
          >
            <Text style={[styles.statusBtnText, currentStatus === 'EXCUSED' && styles.statusBtnTextActive]}>
              معتذر
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusBtn, currentStatus === 'ABSENT' && styles.statusBtnAbsentActive]}
            onPress={() => onQuickMark(member, 'ABSENT')}
          >
            <Text style={[styles.statusBtnText, currentStatus === 'ABSENT' && styles.statusBtnTextActive]}>
              غائب
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

export const AttendanceManageScreen = ({ navigation }: { navigation?: any }) => {
  const { members, loadMembersFromFirestore } = useMembersStore();
  const { records, markAttendance, getAttendanceStats } = useAttendanceStore();
  const currentUser = useAuthStore((s) => s.user);

  const [selectedEvent, setSelectedEvent] = useState<EventType>('SCOUTING_DAY');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Default filter to current section leader's sector if assigned
  const defaultSquadFilter = currentUser?.sectionName && currentUser.sectionName !== 'الكل'
    ? currentUser.sectionName 
    : 'ALL';

  const [selectedSquadFilter, setSelectedSquadFilter] = useState<string>(defaultSquadFilter);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    async function init() {
      setLoadingMembers(true);
      await loadMembersFromFirestore();
      try {
        const firestoreRecords = await fetchAttendanceFromFirestore(selectedDate);
        firestoreRecords.forEach((r) => markAttendance(r));
      } catch (e) {
        console.warn('Error fetching attendance from firestore:', e);
      } finally {
        setLoadingMembers(false);
      }
    }
    init();
  }, [selectedDate]);

  // QR Scanner modal state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedCodeInput, setScannedCodeInput] = useState('');

  // Fingerprint Excel import modal state
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelTextData, setExcelTextData] = useState('');

  // Excuse modal state
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [targetMember, setTargetMember] = useState<Member | null>(null);
  const [excuseText, setExcuseText] = useState('');

  const stats = useMemo(
    () => getAttendanceStats(selectedDate, selectedEvent),
    [getAttendanceStats, selectedDate, selectedEvent, records]
  );

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSquad = selectedSquadFilter === 'ALL' || m.squadName === selectedSquadFilter;

      // If taking leaders attendance
      if (selectedEvent === ('SCOUTING_DAY_LEADERS' as any) || selectedEvent === 'LEADERS_MEETING') {
        const isLeader = m.squadName === 'قادة' || m.squadName === 'جوالة' || (m as any).role === 'LEADER' || (m as any).role === 'JOWALAH';
        return matchSearch && isLeader;
      }

      return matchSearch && matchSquad;
    });
  }, [members, searchQuery, selectedSquadFilter, selectedEvent]);

  const getMemberStatus = useCallback(
    (memberId: string) => {
      const record = records.find(
        (r) => r.memberId === memberId && r.date === selectedDate && r.eventType === selectedEvent
      );
      return record?.status || 'ABSENT';
    },
    [records, selectedDate, selectedEvent]
  );

  const handleQuickMark = useCallback(
    (member: Member, status: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
      if (status === 'EXCUSED') {
        setTargetMember(member);
        setExcuseText('');
        setShowExcuseModal(true);
        return;
      }

      const attendanceRecord = {
        id: `${member.id}_${selectedDate}_${selectedEvent}`,
        memberId: member.id,
        memberName: member.name,
        memberCode: member.code,
        date: selectedDate,
        eventType: selectedEvent,
        status,
        recordedBy: currentUser?.name || 'رئيس القطاع المسؤول',
        timestamp: new Date().toISOString(),
      };

      // 1. Save locally (immediate UI update)
      markAttendance(attendanceRecord);

      // 2. Sync to Firestore in background
      saveAttendanceToFirestore(attendanceRecord).catch((e) =>
        console.warn('Attendance sync error:', e)
      );
    },
    [selectedDate, selectedEvent, markAttendance, currentUser]
  );

  const handleSaveExcuse = () => {
    if (!targetMember) return;
    const attRec = {
      id: `${targetMember.id}_${selectedDate}_${selectedEvent}`,
      memberId: targetMember.id,
      memberName: targetMember.name,
      memberCode: targetMember.code,
      date: selectedDate,
      eventType: selectedEvent,
      status: 'EXCUSED' as const,
      excuseReason: excuseText || 'عذر مسبق معتمد من رئيس القطاع',
      recordedBy: currentUser?.name || 'رئيس القطاع المسؤول',
      timestamp: new Date().toISOString(),
    };
    markAttendance(attRec);
    saveAttendanceToFirestore(attRec);
    setShowExcuseModal(false);
    setTargetMember(null);
  };

  const handleSimulateQRScan = () => {
    if (!scannedCodeInput.trim()) {
      Alert.alert('تنبيه', 'من فضلك أدخل أو امسح كود الكشاف QR');
      return;
    }
    const cleanCode = scannedCodeInput.trim().toLowerCase();
    const found = members.find((m) => m.code.toLowerCase() === cleanCode);
    if (found) {
      const attRec = {
        id: `${found.id}_${selectedDate}_${selectedEvent}`,
        memberId: found.id,
        memberName: found.name,
        memberCode: found.code,
        date: selectedDate,
        eventType: selectedEvent,
        status: 'PRESENT' as const,
        recordedBy: 'قارئ الباركود / QR Scanner',
        timestamp: new Date().toISOString(),
      };
      markAttendance(attRec);
      saveAttendanceToFirestore(attRec);

      Alert.alert('تم بنجاح ✅', `تم تسجيل حضور: ${found.name} (${found.squadName})`);
      setScannedCodeInput('');
      setShowScannerModal(false);
    } else {
      Alert.alert('غير موجود ❌', `لم يتم العثور على عضو بالكود: ${scannedCodeInput}`);
    }
  };

  // Process Excel/CSV text from fingerprint device
  const handleProcessFingerprintExcel = async () => {
    if (!excelTextData.trim()) {
      Alert.alert('تنبيه', 'يرجى لصق بيانات أو أرقام البصمة من شيت الأكسيل أولاً');
      return;
    }

    const lines = excelTextData.split('\n');
    let markedCount = 0;

    for (const line of lines) {
      const cleanLine = line.trim().toLowerCase();
      if (!cleanLine) continue;

      // Extract codes matching JS-2026-xxx or digits
      const matchedMember = members.find((m) => {
        return cleanLine.includes(m.code.toLowerCase()) || cleanLine.includes(m.name.toLowerCase());
      });

      if (matchedMember) {
        const attRec = {
          id: `${matchedMember.id}_${selectedDate}_${selectedEvent}`,
          memberId: matchedMember.id,
          memberName: matchedMember.name,
          memberCode: matchedMember.code,
          date: selectedDate,
          eventType: selectedEvent,
          status: 'PRESENT' as const,
          recordedBy: 'جهاز البصمة (Fingerprint Excel)',
          timestamp: new Date().toISOString(),
        };

        markAttendance(attRec);
        await saveAttendanceToFirestore(attRec);
        markedCount++;
      }
    }

    setShowExcelModal(false);
    setExcelTextData('');
    Alert.alert('تم بنجاح ✅', `تم استيراد ومطابقة ${markedCount} سجل بصمة بنجاح إلى قاعدة بيانات فايربيس! 🎉`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.headerTitle}>سجل التحضير والغياب الذكي 📋</Text>
        {currentUser?.sectionName ? (
          <Text style={styles.headerUserTag}>
            رئيس قطاع: {currentUser.sectionName} 👑
          </Text>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Event Selector using Horizontal Card Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1️⃣ اختر الفعالية أو نوع الاجتماع</Text>
          <IconCardSelector
            options={EVENT_OPTIONS}
            selectedId={selectedEvent}
            onSelect={(id) => setSelectedEvent(id as EventType)}
          />
        </View>

        {/* Date & Stats Bar */}
        <View style={styles.statsCard}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>📅 تاريخ التحضير والغياب:</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{selectedDate}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.statNum, { color: '#166534' }]}>{stats.present}</Text>
              <Text style={[styles.statTitle, { color: '#166534' }]}>حاضر ✅</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.statNum, { color: '#991B1B' }]}>{stats.absent}</Text>
              <Text style={[styles.statTitle, { color: '#991B1B' }]}>غائب ❌</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.statNum, { color: '#92400E' }]}>{stats.excused}</Text>
              <Text style={[styles.statTitle, { color: '#92400E' }]}>معتذر ⚠️</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.statNum, { color: '#5B21B6' }]}>{stats.total}</Text>
              <Text style={[styles.statTitle, { color: '#5B21B6' }]}>الكل 👥</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions (QR Scanner, Fingerprint Excel, Leader/Jawala Toggle, Export) */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.scannerBtn} onPress={() => setShowScannerModal(true)}>
            <Text style={styles.scannerBtnText}>📷 مسح كود QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.excelBtn} onPress={() => setShowExcelModal(true)}>
            <Text style={styles.excelBtnText}>📊 شيت البصمة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.excelBtn, { backgroundColor: '#059669', marginHorizontal: 2 }]}
            onPress={() => exportAttendanceReport(records, selectedDate)}
          >
            <Text style={styles.excelBtnText}>📥 تصدير الكشف</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.leaderToggleBtn,
              (selectedEvent === ('SCOUTING_DAY_LEADERS' as any) || selectedEvent === 'LEADERS_MEETING') && styles.leaderToggleBtnActive,
            ]}
            onPress={() => {
              if (selectedEvent === ('SCOUTING_DAY_LEADERS' as any) || selectedEvent === 'LEADERS_MEETING') {
                setSelectedEvent('SCOUTING_DAY');
                setSelectedSquadFilter('ALL');
              } else {
                setSelectedEvent('SCOUTING_DAY_LEADERS' as any);
                setSelectedSquadFilter('ALL');
              }
            }}
          >
            <Text
              style={[
                styles.leaderToggleBtnText,
                (selectedEvent === ('SCOUTING_DAY_LEADERS' as any) || selectedEvent === 'LEADERS_MEETING') && styles.leaderToggleBtnTextActive,
              ]}
            >
              {selectedEvent === ('SCOUTING_DAY_LEADERS' as any) || selectedEvent === 'LEADERS_MEETING'
                ? '👥 غياب الأطفال'
                : '⚜️ غياب القادة'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 ابحث بالاسم أو كود العضوية..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.squadFilterScroll}>
            {['ALL', 'براعم', 'أشبال', 'زهرات', 'كشاف', 'مرشدات', 'متقدم', 'رائدات', 'جوالة', 'قادة'].map((sq) => (
              <TouchableOpacity
                key={sq}
                style={[styles.squadChip, selectedSquadFilter === sq && styles.squadChipActive]}
                onPress={() => setSelectedSquadFilter(sq)}
              >
                <Text style={[styles.squadChipText, selectedSquadFilter === sq && styles.squadChipTextActive]}>
                  {sq === 'ALL' ? 'جميع الفرق' : sq}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Members Roster & Attendance Toggles */}
        <View style={styles.rosterCard}>
          <Text style={styles.sectionTitle}>قائمة الأعضاء والقادة ({filteredMembers.length})</Text>

          {loadingMembers ? (
            <ActivityIndicator size="large" color="#8B0000" style={{ marginVertical: 20 }} />
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <MemberRowItem
                key={member.id}
                member={member}
                currentStatus={getMemberStatus(member.id)}
                onQuickMark={handleQuickMark}
              />
            ))
          ) : (
            <Text style={styles.emptyRosterText}>لا يوجد أعضاء مطابقون للفلتر الحالي</Text>
          )}
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showScannerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📷 ماسح الـ QR والباركود الكشفي</Text>
            <Text style={styles.modalSubtitle}>
              وجّه الكاميرا نحو كارت الكشاف أو أدخل كود العضوية للتحضير الفوري:
            </Text>

            <View style={styles.scannerBox}>
              <Text style={styles.scannerIcon}>📸</Text>
              <Text style={styles.scannerTip}>الكاميرا نشطة لقراءة بطاقات الـ QR الكشفية</Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="أو اكتب الكود (مثال: JS-2026-448)"
              placeholderTextColor="#888"
              value={scannedCodeInput}
              onChangeText={setScannedCodeInput}
              autoCapitalize="characters"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSimulateQRScan}>
                <Text style={styles.modalConfirmBtnText}>تسجيل الحضور ✅</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowScannerModal(false)}>
                <Text style={styles.modalCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fingerprint Excel Text Modal */}
      <Modal visible={showExcelModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📊 استيراد بيانات جهاز البصمة Excel</Text>
            <Text style={styles.modalSubtitle}>
              انسخ والصق نصوص شيت الأكسيل المصدر من جهاز البصمة للتحضير الفوري:
            </Text>

            <TextInput
              style={[styles.modalInput, { height: 140, textAlignVertical: 'top' }]}
              placeholder="انسخ والصق بيانات شيت الأكسيل أو أكواد البصمة هنا..."
              placeholderTextColor="#888"
              value={excelTextData}
              onChangeText={setExcelTextData}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleProcessFingerprintExcel}>
                <Text style={styles.modalConfirmBtnText}>تفريغ واستيراد البصمة 📥</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowExcelModal(false)}>
                <Text style={styles.modalCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Excuse Details Modal */}
      <Modal visible={showExcuseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⚠️ تسجيل اعتذار</Text>
            <Text style={styles.modalSubtitle}>الكشاف / القائد: {targetMember?.name}</Text>

            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="اكتب سبب الاعتذار (مثال: ظرف عائلي، امتحانات، وعكة صحية)..."
              placeholderTextColor="#888"
              value={excuseText}
              onChangeText={setExcuseText}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSaveExcuse}>
                <Text style={styles.modalConfirmBtnText}>حفظ العذر 💾</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowExcuseModal(false)}>
                <Text style={styles.modalCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} currentRoute="Attendance" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  header: {
    backgroundColor: '#8B0000',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerSubtitle: { color: '#D4A359', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  headerUserTag: { color: '#E5E7EB', fontSize: 11, marginTop: 4 },
  content: { padding: 16, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#8B0000', marginBottom: 12, textAlign: 'right' },
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  dateRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateLabel: { fontSize: 13, fontWeight: 'bold', color: '#444' },
  dateBadge: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  statsGrid: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  statBox: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNum: { fontSize: 18, fontWeight: 'bold' },
  statTitle: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  actionButtonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scannerBtn: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 6,
    elevation: 3,
  },
  scannerBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  excelBtn: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 3,
  },
  excelBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  leaderToggleBtn: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 4,
    elevation: 3,
  },
  leaderToggleBtnActive: { backgroundColor: '#D97706' },
  leaderToggleBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  leaderToggleBtnTextActive: { color: '#FFF' },
  searchSection: { marginBottom: 16 },
  searchInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    textAlign: 'right',
    color: '#333',
    marginBottom: 10,
  },
  squadFilterScroll: { flexDirection: 'row-reverse' },
  squadChip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  squadChipActive: { backgroundColor: '#8B0000', borderColor: '#8B0000' },
  squadChipText: { fontSize: 12, color: '#666', fontWeight: '600' },
  squadChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  rosterCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  emptyRosterText: {
    textAlign: 'center',
    color: '#9CA3AF',
    paddingVertical: 20,
    fontSize: 12,
  },
  memberRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberInfo: { flex: 1, marginLeft: 8, alignItems: 'flex-end' },
  memberName: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', textAlign: 'right' },
  memberSubRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  memberCodeBadge: {
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  memberSquadBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  scarfIcon: { fontSize: 14 },
  statusButtonsGroup: { flexDirection: 'row-reverse' },
  statusBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 4,
  },
  statusBtnPresentActive: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  statusBtnExcusedActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  statusBtnAbsentActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  statusBtnText: { fontSize: 12, color: '#4B5563', fontWeight: 'bold' },
  statusBtnTextActive: { color: '#FFF' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#8B0000', marginBottom: 6 },
  modalSubtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 16 },
  scannerBox: {
    width: '100%',
    height: 110,
    backgroundColor: '#111827',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#D4A359',
    borderStyle: 'dashed',
  },
  scannerIcon: { fontSize: 36, marginBottom: 6 },
  scannerTip: { color: '#9CA3AF', fontSize: 11 },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
    marginBottom: 16,
    backgroundColor: '#FAF7F2',
  },
  modalBtnRow: { flexDirection: 'row-reverse', width: '100%', justifyContent: 'space-between' },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  modalConfirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  modalCancelBtnText: { color: '#374151', fontWeight: 'bold', fontSize: 13 },
});
