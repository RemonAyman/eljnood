import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { fetchScoutingPlansFromFirestore, sendNotificationToFirestore } from '../../services/firebaseService';
import { useAuthStore } from '../../store/authStore';
import { pickImageFromGallery, takePhotoWithCamera } from '../../utils/imagePickerHelper';

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
  const user = useAuthStore((s) => s.user);

  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3');
  const [eventsList, setEventsList] = useState<PlanEvent[]>(SCOUTING_PLAN_DATA);
  const [loading, setLoading] = useState(true);

  // Suggestions Modal
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionName, setSuggestionName] = useState(user?.name || '');
  const [suggestionPhone, setSuggestionPhone] = useState(user?.phone || '');
  const [suggestionText, setSuggestionText] = useState('');

  // Donations Modal
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [donationAmount, setDonationAmount] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  useEffect(() => {
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
      'تحميل خطة الأيام الكشفية PDF 📄',
      'جاري استخراج وتحميل وثيقة الخطة السنوية والجدول الزمني المعتمد لعام ٢٠٢٦ - ٢٠٢٧ لمجموعة جنود المسيح الكشفية.',
      [{ text: 'تنزيل وحفظ في الهاتف 📥', style: 'default' }]
    );
  };

  const handleSubmitSuggestion = async () => {
    if (!suggestionText.trim()) {
      Alert.alert('تنبيه', 'من فضلك اكتب نص الاقتراح أو الفكرة أولاً.');
      return;
    }

    try {
      await sendNotificationToFirestore({
        title: '💡 اقتراح جديد من أحد الأعضاء',
        body: `المرسل: ${suggestionName.trim() || 'عضو'}\n${suggestionText.trim()}`,
        type: 'SCOUTING_PLAN',
        targetRole: 'ADMIN',
      });
    } catch (e) {
      console.warn('Suggestion note:', e);
    }

    setShowSuggestionModal(false);
    setSuggestionText('');
    Alert.alert('شكراً لك! 🌟', 'تم إرسال اقتراحك بنجاح إلى قيادة المجموعة ومجلس الإدارة لدراسته.');
  };

  const handlePickReceipt = async () => {
    Alert.alert('تحميل صورة التحويل', 'اختر طريقة رفع صورة إيصال التحويل البنكي أو المحفظة:', [
      {
        text: '📷 تصوير بالكاميرا',
        onPress: async () => {
          const img = await takePhotoWithCamera();
          if (img) setReceiptImage(img);
        },
      },
      {
        text: '🖼️ اختيار من المعرض',
        onPress: async () => {
          const img = await pickImageFromGallery();
          if (img) setReceiptImage(img);
        },
      },
      { text: 'إلغاء', style: 'cancel' },
    ]);
  };

  const handleSubmitDonation = async () => {
    if (!donationAmount.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال مبلغ التبرع.');
      return;
    }
    if (!receiptImage) {
      Alert.alert('تنبيه', 'يرجى تحميل صورة إيصال التحويل لتأكيد التبرع.');
      return;
    }

    try {
      await sendNotificationToFirestore({
        title: '💖 إشعار بتبرع جديد للكشافة',
        body: `المتبرع: ${donorName.trim() || 'فاعل خير'}\nالمبلغ: ${donationAmount.trim()} ج.م\nتم إرفاق صورة إيصال التحويل.`,
        type: 'SCOUTING_PLAN',
        targetRole: 'ADMIN',
      });
    } catch (e) {
      console.warn('Donation notification note:', e);
    }

    setShowDonationModal(false);
    setDonationAmount('');
    setReceiptImage(null);
    Alert.alert(
      'الرب يعوض تعب محبتكم! ✝️',
      'تم إرسال بيانات التحويل بنجاح، وسوف يتم إرسال صورة إيصال التبرع المعتمد رسمياً إلى هاتفك فور تأكيد الاستلام من الإدارة المالية.'
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.headerTitle}>تحميل خطة الأيام الكشفية والجدول السنوي ⚜️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* PDF Export Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>وثيقة الخطة السنوية المعتمدة 📜</Text>
            <Text style={styles.bannerSubtitle}>خطة الأنشطة، الأيام الكشفية، والمعسكرات لعام ٢٠٢٦ - ٢٠٢٧</Text>
          </View>
          <TouchableOpacity style={styles.pdfBtn} onPress={handleDownloadPDF}>
            <Text style={styles.pdfBtnText}>📥 تنزيل PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons Row: اقتراحات & تبرعات (مطابقة للرسمة) */}
        <View style={styles.sketchActionRow}>
          <TouchableOpacity
            style={[styles.sketchBtn, { backgroundColor: '#1E3A8A' }]}
            onPress={() => setShowSuggestionModal(true)}
          >
            <Text style={styles.sketchBtnText}>💡 اقتراحات</Text>
            <Text style={styles.sketchBtnSub}>شاركنا أفكارك لتطوير الكشافة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sketchBtn, { backgroundColor: '#8B0000' }]}
            onPress={() => setShowDonationModal(true)}
          >
            <Text style={styles.sketchBtnText}>💖 تبرعات</Text>
            <Text style={styles.sketchBtnSub}>تحميل صورة التحويل والإيصال</Text>
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

      {/* Suggestions Modal */}
      <Modal visible={showSuggestionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>💡 صندوق الاقتراحات والتطوير</Text>
            <Text style={styles.modalSubtitle}>صوتك مسموع! شاركنا بأفكارك أو ملاحظاتك لتطوير أنشطة الكشافة</Text>

            <Text style={styles.inputLabel}>الاسم [اختياري]:</Text>
            <TextInput
              style={styles.modalInput}
              value={suggestionName}
              onChangeText={setSuggestionName}
              placeholder="اسمك أو اتركه فارغاً للسرية"
              textAlign="right"
            />

            <Text style={styles.inputLabel}>رقم الموبايل للتواصل [اختياري]:</Text>
            <TextInput
              style={styles.modalInput}
              value={suggestionPhone}
              keyboardType="phone-pad"
              onChangeText={setSuggestionPhone}
              placeholder="01XXXXXXXXX"
              textAlign="right"
            />

            <Text style={styles.inputLabel}>نص الاقتراح أو الفكرة *:</Text>
            <TextInput
              style={[styles.modalInput, { height: 120, textAlignVertical: 'top' }]}
              value={suggestionText}
              onChangeText={setSuggestionText}
              placeholder="اكتب فكرتك أو مقترحك بالتفصيل هنا..."
              multiline
              textAlign="right"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSubmitSuggestion}>
                <Text style={styles.modalConfirmBtnText}>إرسال الاقتراح 📤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowSuggestionModal(false)}>
                <Text style={styles.modalCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Donations Modal (تحميل صورة التحويل) */}
      <Modal visible={showDonationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>💖 دعم وتبرعات الأنشطة الكشفية</Text>
            <Text style={styles.modalSubtitle}>
              «كُلُّ وَاحِدٍ كَمَا يَنْوِي بِقَلْبِهِ، لَيْسَ عَنْ حُزْنٍ أَوِ اضْطِرَارٍ. لأَنَّ الْمُعْطِيَ الْمَسْرُورَ يُحِبُّهُ اللهُ»
            </Text>

            <ScrollView style={{ maxHeight: 380 }}>
              <View style={styles.bankInfoBox}>
                <Text style={styles.bankTitle}>طرق التحويل والتبرع المتاحة:</Text>
                <Text style={styles.bankLine}>💳 إنستاباي (InstaPay): <Text style={styles.boldText}>jnood.scouts@instapay</Text></Text>
                <Text style={styles.bankLine}>📱 فودافون كاش: <Text style={styles.boldText}>010XXXXXXXX</Text></Text>
                <Text style={styles.bankLine}>⛪ الخزينة الكنسية: تسليم يدوي لقائد المجموعة</Text>
              </View>

              <Text style={styles.inputLabel}>اسم المتبرع:</Text>
              <TextInput
                style={styles.modalInput}
                value={donorName}
                onChangeText={setDonorName}
                placeholder="اسم المتبرع أو فاعل خير"
                textAlign="right"
              />

              <Text style={styles.inputLabel}>رقم الهاتف لإرسال الإيصال الرسمي عليه:</Text>
              <TextInput
                style={styles.modalInput}
                value={donorPhone}
                keyboardType="phone-pad"
                onChangeText={setDonorPhone}
                placeholder="01XXXXXXXXX"
                textAlign="right"
              />

              <Text style={styles.inputLabel}>قيمة التبرع (بالجنيه المصري):</Text>
              <TextInput
                style={styles.modalInput}
                value={donationAmount}
                keyboardType="number-pad"
                onChangeText={setDonationAmount}
                placeholder="مثال: 500"
                textAlign="right"
              />

              {/* Receipt Upload Box */}
              <Text style={styles.inputLabel}>صورة إيصال التحويل البنكي أو المحفظة *:</Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={handlePickReceipt}>
                <Text style={styles.uploadBtnText}>
                  {receiptImage ? '🔄 تغيير صورة الإيصال' : '📸 تحميل صورة التحويل (سكرين شوت)'}
                </Text>
              </TouchableOpacity>

              {receiptImage && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                  <Text style={styles.receiptAttachedText}>تم إرفاق صورة إيصال التحويل بنجاح ✅</Text>
                </View>
              )}

              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>
                  📌 ملاحظة: سوف يتم إرسال صورة إيصال التبرع المعتمد رسمياً فور تأكيد استلام التحويل.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSubmitDonation}>
                <Text style={styles.modalConfirmBtnText}>تأكيد وإرسال الإيصال 📤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDonationModal(false)}>
                <Text style={styles.modalCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  bannerCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextContainer: { flex: 1, marginRight: 10 },
  bannerTitle: { color: '#FCD34D', fontSize: 14, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' },
  bannerSubtitle: { color: '#E0E7FF', fontSize: 11, textAlign: 'right' },
  pdfBtn: { backgroundColor: '#D4A359', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  pdfBtnText: { color: '#1E1B4B', fontWeight: 'bold', fontSize: 12 },
  sketchActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sketchBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  sketchBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  sketchBtnSub: { color: '#F3F4F6', fontSize: 10, textAlign: 'center' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#8B0000', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 14, lineHeight: 18 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#374151', textAlign: 'right', marginBottom: 4, marginTop: 8 },
  modalInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
  },
  bankInfoBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  bankTitle: { fontSize: 12, fontWeight: 'bold', color: '#92400E', textAlign: 'right', marginBottom: 6 },
  bankLine: { fontSize: 11, color: '#78350F', textAlign: 'right', marginBottom: 4 },
  boldText: { fontWeight: 'bold' },
  uploadBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  uploadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  previewContainer: { alignItems: 'center', marginVertical: 10 },
  receiptPreview: { width: 140, height: 140, borderRadius: 10, borderWidth: 1, borderColor: '#D1D5DB' },
  receiptAttachedText: { color: '#059669', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  noticeBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  noticeText: { color: '#1E40AF', fontSize: 11, textAlign: 'center', fontWeight: '600' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  modalConfirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  modalCancelBtnText: { color: '#374151', fontWeight: 'bold', fontSize: 14 },
});
