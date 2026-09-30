import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { useMembersStore } from '../../store/membersStore';
import { useAuthStore } from '../../store/authStore';
import { IconCardSelector, SelectorOption } from '../../components/ui/IconCardSelector';
import { saveFollowUpToFirestore, fetchFollowUpsFromFirestore } from '../../services/firebaseService';
import { Member } from '../../types';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';

type VisitType = 'PHONE' | 'HOME_VISIT' | 'OCCASION';

export const FollowUpScreen = ({ navigation }: { navigation?: any }) => {
  const { members, loadMembersFromFirestore } = useMembersStore();
  const currentUser = useAuthStore((s) => s.user);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const [visitType, setVisitType] = useState<VisitType>('HOME_VISIT');
  const [primaryLeader, setPrimaryLeader] = useState(currentUser?.name || 'القائد المسؤول');
  const [coLeaders, setCoLeaders] = useState('');
  const [occasionReason, setOccasionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadMembersFromFirestore();
    loadFollowUpHistory();
  }, []);

  useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [members]);

  const loadFollowUpHistory = async () => {
    setLoadingHistory(true);
    try {
      const records = await fetchFollowUpsFromFirestore();
      if (records && records.length > 0) {
        setHistory(records);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.warn('Error loading follow-ups:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const visitOptions: SelectorOption<VisitType>[] = [
    { value: 'PHONE', label: 'مكالمة تليفون', icon: '📞' },
    { value: 'HOME_VISIT', label: 'زيارة منزلية', icon: '🏠' },
    { value: 'OCCASION', label: 'مناسبة / إصابة', icon: '🎈' },
  ];

  const handleSaveFollowUp = async () => {
    if (!selectedMember) {
      Alert.alert('تنبيه', 'يرجى اختيار الكشاف المراد تسجيل الافتقاد له');
      return;
    }
    if (!notes.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة ملاحظات الافتقاد وتقرير الزيارة');
      return;
    }

    setSaving(true);
    const typeLabel = visitType === 'PHONE' ? 'مكالمة هاتفية' : visitType === 'HOME_VISIT' ? 'زيارة منزلية' : 'مناسبة / إصابة';
    const newEntry = {
      id: `fu_${Date.now()}`,
      memberId: selectedMember.id,
      memberCode: selectedMember.code,
      memberName: selectedMember.name,
      squad: `فرقة ${selectedMember.squadName}`,
      visitType,
      visitTypeLabel: typeLabel,
      occasionReason: visitType === 'OCCASION' ? occasionReason : '',
      leader: primaryLeader + (coLeaders.trim() ? ` و (${coLeaders})` : ''),
      date: new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      notes: notes.trim(),
    };

    const success = await saveFollowUpToFirestore(newEntry);
    setSaving(false);

    if (success) {
      setHistory([newEntry, ...history]);
      setNotes('');
      setOccasionReason('');
      Alert.alert('تم بنجاح ✅', 'تم تسجيل تقرير الافتقاد وحفظه في السجل المركزي للمجموعة الكشفية! 📋');
    } else {
      // Still update locally
      setHistory([newEntry, ...history]);
      setNotes('');
      Alert.alert('تم الحفظ محلياً ⚠️', 'تم حفظ التقرير محلياً وتعذر المزامنة مؤقتاً.');
    }
  };

  const filteredMemberList = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.code.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 80 }]}>
        {/* Header Banner */}
        <View style={styles.header}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>مؤشرات الرعاية والافتقاد</Text>
          </View>
          <Text style={styles.headerTitle}>منظومة الرعاية والافتقاد الكشفي</Text>
          <Text style={styles.headerSub}>متابعة المخدومين، الزيارات الأسرية، ورعاية الحالات الخاصة</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{history.length}</Text>
              <Text style={styles.statLbl}>إجمالي الافتقادات</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{members.length}</Text>
              <Text style={styles.statLbl}>الكشافين المقيدين</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>
                {history.filter((h) => h.visitType === 'OCCASION').length}
              </Text>
              <Text style={styles.statLbl}>حالات ومناسبات</Text>
            </View>
          </View>
        </View>

        {/* New Follow-Up Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>تسجيل تقرير افتقاد كشفي جديد</Text>

          <Text style={styles.inputLabel}>اختر المخدوم الكشفي *</Text>
          {selectedMember ? (
            <TouchableOpacity 
              style={styles.memberBox}
              onPress={() => setShowMemberPicker(!showMemberPicker)}
            >
              <Text style={styles.memberBoxName}>👦 {selectedMember.name}</Text>
              <Text style={styles.memberBoxSub}>فرقة {selectedMember.squadName} ({selectedMember.code}) - اضغط للتغيير 🔄</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.memberBoxEmpty}
              onPress={() => setShowMemberPicker(true)}
            >
              <Text style={styles.memberBoxEmptyText}>⚠️ اضغط هنا لاختيار الكشاف من القائمة</Text>
            </TouchableOpacity>
          )}

          {showMemberPicker && (
            <View style={styles.pickerContainer}>
              <TextInput
                style={styles.pickerSearch}
                placeholder="🔍 ابحث عن الكشاف بالاسم أو الكود..."
                placeholderTextColor="#888"
                value={memberSearch}
                onChangeText={setMemberSearch}
              />
              <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                {filteredMemberList.length > 0 ? (
                  filteredMemberList.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        setSelectedMember(m);
                        setShowMemberPicker(false);
                      }}
                    >
                      <Text style={styles.pickerItemName}>{m.name}</Text>
                      <Text style={styles.pickerItemSub}>فرقة {m.squadName} • {m.code}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.pickerEmpty}>لا يوجد أعضاء متطابقين مع البحث</Text>
                )}
              </ScrollView>
            </View>
          )}

          <Text style={styles.inputLabel}>الخادم الأساسي المكلف بالتقرير *</Text>
          <TextInput
            style={styles.input}
            value={primaryLeader}
            onChangeText={setPrimaryLeader}
          />

          <Text style={styles.inputLabel}>الخدام المشاركون في الافتقاد (اختياري)</Text>
          <TextInput
            style={styles.input}
            value={coLeaders}
            onChangeText={setCoLeaders}
            placeholder="مثال: الخادم مينا، الخادم كيرلس"
          />

          {/* Visit Type Horizontal Icon Card Selector */}
          <IconCardSelector
            label="نوع الافتقاد المعتمد *"
            options={visitOptions}
            selectedValue={visitType}
            onSelect={(val) => setVisitType(val as VisitType)}
          />

          {visitType === 'OCCASION' && (
            <>
              <Text style={styles.inputLabel}>تفاصيل المناسبة أو الحالة (عملية/إصابة/مرض/نجاح) *</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: إجراء عملية جراحية، تكريم مدرسي، عزاء..."
                value={occasionReason}
                onChangeText={setOccasionReason}
              />
            </>
          )}

          <Text style={styles.inputLabel}>ملاحظات الزيارة ومحاور التقرير الكشفي *</Text>
          <TextInput
            style={[styles.input, { height: 90 }]}
            placeholder="اكتب خلاصة الزيارة مع الأسرة، والاتفاق على القداس والأنشطة..."
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSaveFollowUp} 
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>💾 حفظ واعتماد تقرير الافتقاد</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* History Stream */}
        <Text style={styles.sectionHeading}>سجل وتقارير الافتقاد السابقة ({history.length})</Text>
        {loadingHistory ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator color="#8B0000" size="small" />
            <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>جاري تحميل سجلات الافتقاد...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardIcon}>📋</Text>
            <Text style={styles.emptyCardTitle}>لا توجد تقارير افتقاد مسجلة حتى الآن</Text>
            <Text style={styles.emptyCardSub}>استخدم النموذج أعلاه لتسجيل أول تقرير زيارة أو مكالمة هاتفية.</Text>
          </View>
        ) : (
          history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyTopRow}>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>
                    {item.visitType === 'PHONE' ? '📞' : item.visitType === 'HOME_VISIT' ? '🏠' : '🎈'} {item.visitTypeLabel}
                  </Text>
                </View>
                <View style={styles.historyNameCol}>
                  <Text style={styles.historyName}>{item.memberName}</Text>
                  <Text style={styles.historySquad}>{item.squad}</Text>
                </View>
              </View>
              <Text style={styles.historyNotes}>{item.notes}</Text>
              {item.occasionReason ? (
                <Text style={{ fontSize: 11, color: '#92400E', fontWeight: 'bold', textAlign: 'right', marginBottom: 4 }}>
                  📌 المناسبة: {item.occasionReason}
                </Text>
              ) : null}
              <View style={styles.historyFooter}>
                <Text style={styles.historyLeader}>👤 {item.leader}</Text>
                <Text style={styles.historyDate}>⏱️ {item.date}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <BottomNavBar navigation={navigation} currentRoute="FollowUp" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  badgePill: {
    backgroundColor: 'rgba(212, 163, 89, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 6,
  },
  badgePillText: {
    color: '#D4A359',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#F3F4F6',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    color: '#D4A359',
    fontSize: 17,
    fontWeight: 'bold',
  },
  statLbl: {
    color: '#F3F4F6',
    fontSize: 10,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 14,
    textAlign: 'right',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    textAlign: 'right',
  },
  memberBox: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  memberBoxName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  memberBoxSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  memberBoxEmpty: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  memberBoxEmptyText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D4A359',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  pickerSearch: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 8,
  },
  pickerScroll: {
    maxHeight: 160,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'flex-end',
  },
  pickerItemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pickerItemSub: {
    fontSize: 11,
    color: '#8B0000',
    marginTop: 2,
  },
  pickerEmpty: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    paddingVertical: 12,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 14,
    textAlign: 'right',
  },
  saveBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'right',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyNameCol: {
    alignItems: 'flex-end',
  },
  historyName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  historySquad: {
    fontSize: 11,
    color: '#8B0000',
    marginTop: 1,
  },
  historyBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  historyBadgeText: {
    color: '#8B0000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyNotes: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    textAlign: 'right',
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
  },
  historyFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  historyLeader: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  emptyCardIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  emptyCardSub: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
