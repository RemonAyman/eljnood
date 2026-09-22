import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert 
} from 'react-native';
import { useMembersStore } from '../../store/membersStore';
import { IconCardSelector, SelectorOption } from '../../components/ui/IconCardSelector';

type VisitType = 'PHONE' | 'HOME_VISIT' | 'OCCASION';

export const FollowUpScreen = () => {
  const members = useMembersStore((s) => s.members);

  const [selectedMember, setSelectedMember] = useState(members[0]);
  const [visitType, setVisitType] = useState<VisitType>('HOME_VISIT');
  const [primaryLeader, setPrimaryLeader] = useState('الخادم بيتر يوسف فايز');
  const [coLeaders, setCoLeaders] = useState('الخادم مينا نبيل، الخادم كيرلس سامي');
  const [occasionReason, setOccasionReason] = useState('');
  const [notes, setNotes] = useState('');

  const [history, setHistory] = useState([
    {
      id: '1',
      memberName: 'مارك أمجد شفيق',
      squad: 'طليعة النسور (كشاف)',
      visitType: 'HOME_VISIT' as VisitType,
      visitTypeLabel: 'زيارة منزلية',
      leader: 'الخادم بيتر يوسف + 2 آخرين',
      date: 'منذ يومين',
      notes: 'جلسة مشجعة مع والد الكشاف، تم مناقشة انتظام الكشاف في القداس وتأكيد حضوره معسكر الشتاء الكشفي وتكريمه على شارات الهواية.'
    },
    {
      id: '2',
      memberName: 'أثناسيوس إيهاب فخري',
      squad: 'طليعة الفرسان (أشبال)',
      visitType: 'PHONE' as VisitType,
      visitTypeLabel: 'مكالمة هاتفية',
      leader: 'الخادم مينا نبيل',
      date: '١٤ سبتمبر',
      notes: 'متابعة هاتفية للاطمئنان على استعداده للاختبارات الكشفية وتأكيد موعد درس الكتاب يوم الأحد.'
    },
    {
      id: '3',
      memberName: 'فيلوباتير سامح كمال',
      squad: 'طليعة المجد (متقدم)',
      visitType: 'OCCASION' as VisitType,
      visitTypeLabel: 'مناسبة / إصابة',
      leader: 'الخادم جورج سامي + الخادم مينا',
      date: '١٠ سبتمبر',
      notes: 'زيارة في المستشفى للاطمئنان عليه بعد إجراء جراحة بسيطة وتقديم هدية تذكارية من أسرة المجموعة الكشفية.'
    }
  ]);

  const visitOptions: SelectorOption<VisitType>[] = [
    { value: 'PHONE', label: 'مكالمة تليفون', icon: '📞' },
    { value: 'HOME_VISIT', label: 'زيارة منزلية', icon: '🏠' },
    { value: 'OCCASION', label: 'مناسبة / إصابة', icon: '🎈' },
  ];

  const handleSaveFollowUp = () => {
    if (!notes.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة ملاحظات الافتقاد وتقرير الزيارة');
      return;
    }

    const typeLabel = visitType === 'PHONE' ? 'مكالمة هاتفية' : visitType === 'HOME_VISIT' ? 'زيارة منزلية' : 'مناسبة / إصابة';
    const newEntry = {
      id: Date.now().toString(),
      memberName: selectedMember.name,
      squad: `فرقة ${selectedMember.squadName}`,
      visitType,
      visitTypeLabel: typeLabel,
      leader: `${primaryLeader} (والمشاركون)`,
      date: 'الآن',
      notes
    };

    setHistory([newEntry, ...history]);
    setNotes('');
    setOccasionReason('');
    Alert.alert('تم بنجاح', 'تم تسجيل تقرير الافتقاد وحفظه في سجل الخدمة! 📋');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>مؤشرات الرعاية والافتقاد</Text>
        </View>
        <Text style={styles.headerTitle}>منظومة الرعاية والافتقاد الكشفي</Text>
        <Text style={styles.headerSub}>متابعة المخدومين، الزيارات الأسرية، ورعاية الحالات الخاصة</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>54</Text>
            <Text style={styles.statLbl}>افتقادات الشهر</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>%91</Text>
            <Text style={styles.statLbl}>نسبة التغطية</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>05</Text>
            <Text style={styles.statLbl}>حالات خاصة</Text>
          </View>
        </View>
      </View>

      {/* New Follow-Up Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>تسجيل تقرير افتقاد كشفي جديد</Text>

        <Text style={styles.inputLabel}>اختر المخدوم الكشفي *</Text>
        <View style={styles.memberBox}>
          <Text style={styles.memberBoxName}>👦 {selectedMember.name}</Text>
          <Text style={styles.memberBoxSub}>فرقة {selectedMember.squadName} ({selectedMember.code})</Text>
        </View>

        <Text style={styles.inputLabel}>الخادم الأساسي المكلف بالتقرير *</Text>
        <TextInput
          style={styles.input}
          value={primaryLeader}
          onChangeText={setPrimaryLeader}
        />

        <Text style={styles.inputLabel}>الخدام المشاركون في الافتقاد *</Text>
        <TextInput
          style={styles.input}
          value={coLeaders}
          onChangeText={setCoLeaders}
          placeholder="أسماء الخدام المشاركين"
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

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveFollowUp} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>💾 حفظ واعتماد تقرير الافتقاد</Text>
        </TouchableOpacity>
      </View>

      {/* History Stream */}
      <Text style={styles.sectionHeading}>سجل وتقارير الافتقاد السابقة</Text>
      {history.map((item) => (
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
          <View style={styles.historyFooter}>
            <Text style={styles.historyLeader}>👤 {item.leader}</Text>
            <Text style={styles.historyDate}>⏱️ {item.date}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
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
});
