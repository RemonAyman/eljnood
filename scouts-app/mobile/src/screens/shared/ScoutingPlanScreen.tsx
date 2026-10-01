import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { fetchScoutingPlansFromFirestore } from '../../services/firebaseService';

interface PlanEvent {
  id: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  monthName: string;
  title: string;
  type: 'CAMP' | 'SPIRITUAL' | 'WORKSHOP' | 'PARTY' | 'COMPETITION' | 'SERVICE';
  typeTitle: string;
  dateStr: string;
  targetSquads: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  description: string;
}

const QUARTER_TABS = [
  { id: 'Q1', title: 'الربع الأول (يناير - مارس)', icon: '❄️', subtitle: 'إجازة نصف العام والانطلاقة' },
  { id: 'Q2', title: 'الربع الثاني (أبريل - يونيو)', icon: '🌸', subtitle: 'أعياد القيامة وبداية الصيف' },
  { id: 'Q3', title: 'الربع الثالث (يوليو - سبتمبر)', icon: '☀️', subtitle: 'المعسكرات الكبرى والمهرجان' },
  { id: 'Q4', title: 'الربع الرابع (أكتوبر - ديسمبر)', icon: '🍂', subtitle: 'حفلات الوعد وسهرات كيهك' },
];

const SCOUTING_PLAN_DATA: PlanEvent[] = [
  {
    id: 'p1',
    quarter: 'Q1',
    monthName: 'يناير',
    title: 'معسكر الشتاء التدريبي للكشاف والمتقدم',
    type: 'CAMP',
    typeTitle: 'معسكر كشفي',
    dateStr: '٢٠ - ٢٣ يناير ٢٠٢٦',
    targetSquads: 'الكشاف • المرشدات • المتقدم',
    status: 'COMPLETED',
    description: 'تدريب على مهارات التخييم الشتوي، الطهي في الخلاء، وتنمية روح القيادة الكشفية.',
  },
  {
    id: 'p2',
    quarter: 'Q1',
    monthName: 'فبراير',
    title: 'مهرجان الكرازة والتفوق الكشفي',
    type: 'COMPETITION',
    typeTitle: 'مسابقة إيبارشية',
    dateStr: '١٢ فبراير ٢٠٢٦',
    targetSquads: 'جميع الفرق الكشفية',
    status: 'COMPLETED',
    description: 'المشاركة في المعارض والمسابقات الكشفية والروحية على مستوى الإيبارشية.',
  },
  {
    id: 'p3',
    quarter: 'Q2',
    monthName: 'أبريل',
    title: 'خلوة أسبوع الآلام والأيام الروحية',
    type: 'SPIRITUAL',
    typeTitle: 'يوم روحي',
    dateStr: '٨ - ١٢ أبريل ٢٠٢٦',
    targetSquads: 'الجوالة • القادة • المتقدم',
    status: 'COMPLETED',
    description: 'صلوات البصخة المقدسة والتأملات الروحية وإعداد القادة للخدمة الصيفية.',
  },
  {
    id: 'p4',
    quarter: 'Q2',
    monthName: 'مايو',
    title: 'حفل أداء الوعد الكشفي السنوي',
    type: 'PARTY',
    typeTitle: 'حفلة رسمية',
    dateStr: '٢٨ مايو ٢٠٢٦',
    targetSquads: 'البراعم • الأشبال • الزهرات الجدد',
    status: 'COMPLETED',
    description: 'ارتداء المنديل الكشفي وأداء قسم الكشافة وتسليم شارات الترقية بحضور كهنة الكنيسة.',
  },
  {
    id: 'p5',
    quarter: 'Q3',
    monthName: 'يوليو',
    title: 'معسكر الخلاء الصيفي السنوي (وادي النطرون)',
    type: 'CAMP',
    typeTitle: 'معسكر عام',
    dateStr: '١٥ - ١٩ يوليو ٢٠٢٦',
    targetSquads: 'جميع الفرق الكشفية',
    status: 'COMPLETED',
    description: 'المعسكر الأكبر في العام؛ ألعاب ليلية، ملاحة بالبوصلة، سمر كشفي، ونار المخيم.',
  },
  {
    id: 'p6',
    quarter: 'Q3',
    monthName: 'سبتمبر',
    title: 'دورة إعداد وتأهيل القادة الجدد (مساعد قائد طليعة)',
    type: 'WORKSHOP',
    typeTitle: 'ورشة تدريبية',
    dateStr: '٢٠ - ٢٥ سبتمبر ٢٠٢٦',
    targetSquads: 'الجوالة والقادة الجدد',
    status: 'IN_PROGRESS',
    description: 'دراسة في علم النفس التربوي، تقاليد المجموعات، الإسعافات المتقدمة، وإدارة الأنشطة.',
  },
  {
    id: 'p7',
    quarter: 'Q4',
    monthName: 'نوفمبر',
    title: 'يوم الخدمة المجتمعية ونظافة وتشجير الكنيسة',
    type: 'SERVICE',
    typeTitle: 'خدمة عامة',
    dateStr: '١٠ نوفمبر ٢٠٢٦',
    targetSquads: 'جميع الفرق الكشفية',
    status: 'UPCOMING',
    description: 'تطبيق قانون الكشافة عملياً في خدمة المجتمع وتجميل فناء ومباني الكنيسة.',
  },
  {
    id: 'p8',
    quarter: 'Q4',
    monthName: 'ديسمبر',
    title: 'سهرة كيهك والتسبحة الكشفية الكبرى',
    type: 'SPIRITUAL',
    typeTitle: 'سهرة صلاة',
    dateStr: '٢٥ ديسمبر ٢٠٢٦',
    targetSquads: 'جميع الفرق والقادة والخدام',
    status: 'UPCOMING',
    description: 'سهرة صلاة وتسبحة كيهكية حتى الصباح مع قداس إلهي وتوزيع هدايا الميلاد.',
  },
];

export const ScoutingPlanScreen = () => {
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3');
  const [eventsList, setEventsList] = useState<PlanEvent[]>(SCOUTING_PLAN_DATA);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const firestorePlans = await fetchScoutingPlansFromFirestore();
        if (firestorePlans && firestorePlans.length > 0) {
          setEventsList([...firestorePlans, ...SCOUTING_PLAN_DATA]);
        }
      } catch (e) {
        console.warn('Error loading scouting plans:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredEvents = eventsList.filter((e) => e.quarter === selectedQuarter);

  const getStatusBadge = (status: PlanEvent['status']) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'تم التنفيذ بنجاح ✅', bg: '#DCFCE7', color: '#166534' };
      case 'IN_PROGRESS':
        return { label: 'جاري التنفيذ حالياً ⏳', bg: '#FEF3C7', color: '#92400E' };
      case 'UPCOMING':
        return { label: 'قادم في الجدول 📅', bg: '#EFF6FF', color: '#1E40AF' };
    }
  };

  const handleDownloadPDF = () => {
    Alert.alert(
      'تحميل الخطة السنوية PDF',
      'جاري استخراج وثيقة الخطة السنوية العامة لمجموعة جنود المسيح الكشفية لعام 2026/2027 المعتمدة من مجلس الإدارة...',
      [{ text: 'فتح المستند 📄', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.headerTitle}>الخطة السنوية والجدول الزمني ⚜️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* PDF Export Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>وثيقة الخطة السنوية المعتمدة 📜</Text>
            <Text style={styles.bannerSubtitle}>خطة الأنشطة والمعسكرات لعام ٢٠٢٦ - ٢٠٢٧</Text>
          </View>
          <TouchableOpacity style={styles.pdfBtn} onPress={handleDownloadPDF}>
            <Text style={styles.pdfBtnText}>📥 تنزيل PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Quarter Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1️⃣ اختر الربع السنوي</Text>
          <IconCardSelector
            options={QUARTER_TABS}
            selectedId={selectedQuarter}
            onSelect={(id) => setSelectedQuarter(id)}
          />
        </View>

        {/* Timeline Events */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>فعاليات الربع ({filteredEvents.length} أنشطة)</Text>

          {filteredEvents.map((evt) => {
            const badge = getStatusBadge(evt.status);

            return (
              <View key={evt.id} style={styles.eventCard}>
                <View style={styles.eventTopRow}>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                  <View style={styles.monthBadge}>
                    <Text style={styles.monthBadgeText}>شهر {evt.monthName}</Text>
                  </View>
                </View>

                <Text style={styles.eventTitle}>{evt.title}</Text>
                <Text style={styles.eventDates}>📅 الموعد: {evt.dateStr}</Text>
                <Text style={styles.eventSquads}>👥 الفئة المستهدفة: {evt.targetSquads}</Text>
                <Text style={styles.eventDesc}>{evt.description}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  header: {
    backgroundColor: '#8B0000',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSubtitle: { color: '#D4A359', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  bannerCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextContainer: { flex: 1, marginRight: 10 },
  bannerTitle: { color: '#FCD34D', fontSize: 14, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' },
  bannerSubtitle: { color: '#E0E7FF', fontSize: 11, textAlign: 'right' },
  pdfBtn: { backgroundColor: '#D4A359', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  pdfBtnText: { color: '#1E1B4B', fontWeight: 'bold', fontSize: 12 },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#8B0000', marginBottom: 10 },
  timelineSection: { marginBottom: 16 },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EADBC8',
    elevation: 2,
  },
  eventTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: 'bold' },
  monthBadge: { backgroundColor: '#8B0000', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  monthBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  eventTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', textAlign: 'right', marginBottom: 6 },
  eventDates: { fontSize: 12, color: '#8B0000', fontWeight: 'bold', textAlign: 'right', marginBottom: 4 },
  eventSquads: { fontSize: 12, color: '#4B5563', textAlign: 'right', marginBottom: 8 },
  eventDesc: { fontSize: 13, color: '#6B7280', textAlign: 'right', lineHeight: 20 },
});
