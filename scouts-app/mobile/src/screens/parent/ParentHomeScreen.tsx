import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMembersStore } from '../../store/membersStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { ScoutCardPreview } from '../../components/card_print/ScoutCardPreview';

export const ParentHomeScreen = () => {
  const getMemberByCode = useMembersStore((s) => s.getMemberByCode);
  const getMemberAttendanceRate = useAttendanceStore((s) => s.getMemberAttendanceRate);

  const member = getMemberByCode('JS-2026-448') || {
    id: 'm1',
    code: 'JS-2026-448',
    name: 'بيتر يوسف فايز',
    gender: 'MALE' as const,
    scarfStatus: 'RECEIVED' as const,
    birthDate: '2012-09-15',
    gradeLevel: 'PREP_1' as const,
    squadName: 'كشاف' as const,
    phone: '01012345678',
    guardianPhone: '01229876543',
    createdAt: new Date().toISOString()
  };

  const attendanceRate = getMemberAttendanceRate(member.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة متابعة أولياء الأمور 👨‍👩‍👧</Text>
        <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية - متابعة دقيقة ومباشرة</Text>
      </View>

      {/* Child Scout ID Preview */}
      <Text style={styles.sectionTitle}>بطاقة الكشاف والفرقة الحالية</Text>
      <ScoutCardPreview member={member} />

      {/* Attendance Gauge Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>مؤشر الانضباط والحضور</Text>
        <View style={styles.gaugeRow}>
          <View style={styles.rateCircle}>
            <Text style={styles.rateText}>{attendanceRate}%</Text>
            <Text style={styles.rateSub}>ممتاز</Text>
          </View>
          <View style={styles.gaugeDetails}>
            <Text style={styles.gaugeDesc}>
              موزعة على الأيام الكشفية والمعسكرات واجتماعات درس الكتاب والتسبحة.
            </Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>أيام كشفية: 15/15</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>درس كتاب: 4/4</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Financial Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>موقف الاشتراكات والماليات (2026)</Text>
        <View style={styles.finRow}>
          <Text style={styles.finLabel}>الاشتراك السنوي للموسم الحالي:</Text>
          <View style={styles.paidBadge}>
            <Text style={styles.paidText}>✓ مُسدد بالكامل</Text>
          </View>
        </View>
        <Text style={styles.finDetails}>إيصال رقم: REC-2026-001 | المبلغ: 549 ج.م (شامل الخصم)</Text>
      </View>

      {/* Contact Leader */}
      <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8}>
        <Text style={styles.contactBtnText}>📞 التواصل المباشر مع قائد الفرق</Text>
      </TouchableOpacity>
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
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#D4A359',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'right',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 12,
    textAlign: 'right',
  },
  gaugeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  rateCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#065F46',
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
  },
  rateSub: {
    fontSize: 10,
    color: '#065F46',
  },
  gaugeDetails: {
    flex: 1,
    marginRight: 14,
    alignItems: 'flex-end',
  },
  gaugeDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    textAlign: 'right',
  },
  tagRow: {
    flexDirection: 'row-reverse',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#8B0000',
    fontWeight: 'bold',
  },
  finRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: 'bold',
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: 'bold',
  },
  finDetails: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'right',
  },
  contactBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  }
});
