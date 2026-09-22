import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert 
} from 'react-native';
import { useSubscriptionsStore } from '../../store/subscriptionsStore';
import { useMembersStore } from '../../store/membersStore';

export const SubscriptionsScreen = () => {
  const members = useMembersStore((s) => s.members);
  const { prices, records, applyDiscountCode, calculateTotal, addRecord } = useSubscriptionsStore();

  const [selectedMember, setSelectedMember] = useState(members[0]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  // Selected items state
  const [items, setItems] = useState({
    annualSub: true,
    festivalSub: true,
    promisePartySub: true,
    scarfReplacement: false,
    wajla: true,
    badges: true,
  });

  const [discountCodeInput, setDiscountCodeInput] = useState('JNOOD-D10');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [discountApplied, setDiscountApplied] = useState(true);

  // Secret PIN modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  const toggleItem = (key: keyof typeof items) => {
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { subtotal, discountAmount, totalPaid } = calculateTotal(items, discountApplied ? discountPercent : 0);

  const handleApplyDiscount = () => {
    setShowPinModal(true);
  };

  const verifyPinAndApply = () => {
    const res = applyDiscountCode(discountCodeInput, pinInput);
    if (res.success) {
      setDiscountPercent(res.percentage);
      setDiscountApplied(true);
      setShowPinModal(false);
      setPinInput('');
      Alert.alert('تم بنجاح', `تم تفعيل خصم ${res.percentage}% بنجاح! 🔑`);
    } else {
      Alert.alert('خطأ', res.error || 'فشل تطبيق الخصم');
    }
  };

  const handleConfirmPayment = () => {
    if (totalPaid <= 0) {
      Alert.alert('تنبيه', 'يرجى اختيار بند واحد على الأقل للتحصيل');
      return;
    }

    const newRecord = addRecord({
      memberId: selectedMember.id,
      memberCode: selectedMember.code,
      memberName: selectedMember.name,
      year: selectedYear,
      annualSub: items.annualSub,
      festivalSub: items.festivalSub,
      promisePartySub: items.promisePartySub,
      scarfReplacement: items.scarfReplacement,
      wajla: items.wajla,
      badges: items.badges,
      subtotal,
      discountPercentage: discountApplied ? discountPercent : 0,
      totalPaid,
    });

    setLastReceipt(newRecord);
    setShowReceiptModal(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>🔒 خزينة ومصروفات معتمدة</Text>
        </View>
        <Text style={styles.headerTitle}>الماليات وحساب الاشتراكات</Text>
        <Text style={styles.headerSub}>تحصيل الدفعات، الحسابات الفورية، وإصدار الإيصالات الحرارية</Text>
        
        <View style={styles.headerStatsRow}>
          <View style={styles.headerStatBox}>
            <Text style={styles.statVal}>4,250 ج.م</Text>
            <Text style={styles.statLbl}>مجموع اليوم</Text>
          </View>
          <View style={styles.headerStatBox}>
            <Text style={styles.statVal}>18 إيصال</Text>
            <Text style={styles.statLbl}>إيصالات صادرة</Text>
          </View>
          <View style={styles.headerStatBox}>
            <Text style={styles.statVal}>%84</Text>
            <Text style={styles.statLbl}>نسبة السداد</Text>
          </View>
        </View>
      </View>

      {/* Member Info & Year Selection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>بيانات الكشاف والسنة المالية</Text>
        
        {/* Selected Member Quick View */}
        <View style={styles.memberSelectRow}>
          <View style={styles.memberAvatarCircle}>
            <Text style={styles.memberAvatarText}>⚜️</Text>
          </View>
          <View style={styles.memberDetailsCol}>
            <Text style={styles.selectedMemberName}>{selectedMember.name}</Text>
            <Text style={styles.selectedMemberSub}>طليعة النسور • فرقة {selectedMember.squadName} ({selectedMember.code})</Text>
          </View>
        </View>

        {/* Year Pills (2026 - 2029) */}
        <Text style={styles.subLabel}>اختر السنة المالية للمطابقة:</Text>
        <View style={styles.yearsRow}>
          {[2026, 2027, 2028, 2029].map((year) => {
            const isSelected = selectedYear === year;
            return (
              <TouchableOpacity
                key={year}
                style={[styles.yearPill, isSelected && styles.yearPillActive]}
                onPress={() => setSelectedYear(year)}
                activeOpacity={0.8}
              >
                <Text style={[styles.yearPillText, isSelected && styles.yearPillTextActive]}>
                  {year}
                </Text>
                <Text style={[styles.yearStatus, isSelected && styles.yearStatusActive]}>
                  {year === 2026 ? '✓ مسدد' : 'غير مسدد'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Items Calculation Checklist */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>حاسبة البنود والاشتراكات المقررة</Text>

        {[
          { key: 'annualSub' as const, title: 'اشتراك سنوي كشفي', desc: 'يشمل التأمين الكشفي وشهادة العضوية', price: prices.annualSub },
          { key: 'festivalSub' as const, title: 'اشتراك مهرجان الكرازة الكشفي', desc: 'مقرر الأنشطة وتدريبات الصيفية', price: prices.festivalSub },
          { key: 'promisePartySub' as const, title: 'اشتراك حفلة الوعد الكبرى', desc: 'حضور الحفل + المشروبات وإصدار العهد', price: prices.promisePartySub },
          { key: 'scarfReplacement' as const, title: 'بدل فاقد المنديل الكشفي الحريري', desc: 'صرف استعاضة للمنديل مع الشارة الرسمية', price: prices.scarfReplacement },
          { key: 'wajla' as const, title: 'وجلة خشبية محفورة', desc: 'عقدة المنديل الرسمية محفورة باسم المجموعة', price: prices.wajla },
          { key: 'badges' as const, title: 'شارات وترقيات القميص الكشفي', desc: 'شارة الهواية والرتب المعتمدة للفوج الأول', price: prices.badges },
        ].map((item) => {
          const checked = items[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.itemRow, checked && styles.itemRowChecked]}
              onPress={() => toggleItem(item.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && <Text style={styles.checkIcon}>✓</Text>}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <View style={styles.itemPriceBadge}>
                <Text style={styles.itemPriceText}>{item.price} ج.م</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Discount Codes & Secret PIN Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>نظام الخصومات والمنح الكشفية</Text>
        <Text style={styles.subLabel}>أدخل كود الخصم (من 10% إلى 90%) مع موافقة مدير الخدمة:</Text>
        
        <View style={styles.discountInputRow}>
          <TextInput
            style={styles.discountInput}
            placeholder="مثال: JNOOD-D10"
            value={discountCodeInput}
            onChangeText={setDiscountCodeInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.applyBtn} onPress={handleApplyDiscount}>
            <Text style={styles.applyBtnText}>تطبيق الخصم</Text>
          </TouchableOpacity>
        </View>

        {discountApplied && (
          <View style={styles.discountSuccessTag}>
            <Text style={styles.discountSuccessText}>
              ✓ تم تطبيق خصم {discountPercent}% باعتماد أمين الصندوق
            </Text>
          </View>
        )}
      </View>

      {/* Live Total Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>ملخص الحساب الإجمالي المباشر</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryVal}>{subtotal} ج.م</Text>
          <Text style={styles.summaryLbl}>المجموع الإجمالي (قبل الخصم):</Text>
        </View>
        {discountApplied && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryVal, { color: '#059669' }]}>- {discountAmount} ج.م ({discountPercent}%)</Text>
            <Text style={styles.summaryLbl}>قيمة الخصم المعتمد:</Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalNetVal}>{totalPaid} ج.م</Text>
          <Text style={styles.totalNetLbl}>الصافي المطلوب تحصيله:</Text>
        </View>

        <TouchableOpacity 
          style={styles.confirmPayBtn} 
          onPress={handleConfirmPayment}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmPayBtnText}>🖨️ تأكيد السداد وطباعة الإيصال الفوري</Text>
        </TouchableOpacity>
      </View>

      {/* Secret PIN Modal */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🔑</Text>
            <Text style={styles.modalHeading}>موافقة مدير المجموعة والخزينة</Text>
            <Text style={styles.modalSubtitle}>يرجى إدخال الرمز السري (PIN) لتفعيل الخصم الخاص بالكود {discountCodeInput}:</Text>
            
            <TextInput
              style={styles.pinInputField}
              placeholder="••••"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pinInput}
              onChangeText={setPinInput}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => setShowPinModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={verifyPinAndApply}
              >
                <Text style={styles.modalBtnConfirmText}>اعتماد الخصم</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Printable Thermal Receipt Modal */}
      <Modal visible={showReceiptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptBox}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptGroup}>مجموعة جنود المسيح الكشفية</Text>
              <Text style={styles.receiptChurch}>كنيسة السيدة العذراء مريم - الفوج الأول</Text>
              <Text style={styles.receiptType}>🧾 إيصال تحصيل اشتراكات رسمي</Text>
            </View>

            <View style={styles.receiptDivider} />

            {lastReceipt && (
              <View style={styles.receiptBody}>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.receiptNumber}</Text>
                  <Text style={styles.receiptLineLbl}>رقم الإيصال:</Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.memberName}</Text>
                  <Text style={styles.receiptLineLbl}>اسم الكشاف:</Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.memberCode}</Text>
                  <Text style={styles.receiptLineLbl}>كود العضوية:</Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.year}</Text>
                  <Text style={styles.receiptLineLbl}>السنة المالية:</Text>
                </View>

                <View style={styles.receiptDivider} />

                <Text style={styles.receiptItemsTitle}>البنود المسددة:</Text>
                {lastReceipt.annualSub && <Text style={styles.receiptItem}>• اشتراك سنوي كشفي ({prices.annualSub} ج.م)</Text>}
                {lastReceipt.festivalSub && <Text style={styles.receiptItem}>• اشتراك مهرجان الكرازة ({prices.festivalSub} ج.م)</Text>}
                {lastReceipt.promisePartySub && <Text style={styles.receiptItem}>• اشتراك حفلة الوعد ({prices.promisePartySub} ج.م)</Text>}
                {lastReceipt.scarfReplacement && <Text style={styles.receiptItem}>• بدل فاقد المنديل ({prices.scarfReplacement} ج.م)</Text>}
                {lastReceipt.wajla && <Text style={styles.receiptItem}>• وجلة خشبية ({prices.wajla} ج.م)</Text>}
                {lastReceipt.badges && <Text style={styles.receiptItem}>• شارات وترقيات ({prices.badges} ج.م)</Text>}

                <View style={styles.receiptDivider} />

                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.subtotal} ج.م</Text>
                  <Text style={styles.receiptLineLbl}>الإجمالي قبل الخصم:</Text>
                </View>
                {lastReceipt.discountPercentage > 0 && (
                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineVal, { color: '#059669' }]}>%{lastReceipt.discountPercentage}</Text>
                    <Text style={styles.receiptLineLbl}>نسبة الخصم:</Text>
                  </View>
                )}
                <View style={styles.receiptLine}>
                  <Text style={[styles.receiptLineVal, styles.receiptTotalText]}>{lastReceipt.totalPaid} ج.م</Text>
                  <Text style={[styles.receiptLineLbl, styles.receiptTotalText]}>الصافي المدفوع:</Text>
                </View>

                <View style={styles.receiptFooter}>
                  <Text style={styles.receiptFooterText}>توقيع أمين الصندوق / الخزينة الكشفية</Text>
                  <Text style={styles.receiptDateText}>{new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}</Text>
                </View>
              </View>
            )}

            <View style={styles.receiptActions}>
              <TouchableOpacity 
                style={styles.receiptCloseBtn} 
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.receiptCloseBtnText}>إغلاق</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.receiptPrintBtn} 
                onPress={() => {
                  Alert.alert('طباعة', 'تم إرسال الإيصال لماكينة الطباعة الحرارية بنجاح! 🖨️');
                  setShowReceiptModal(false);
                }}
              >
                <Text style={styles.receiptPrintBtnText}>🖨️ طباعة الإيصال</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#F3F4F6',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  headerStatsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  headerStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    color: '#D4A359',
    fontSize: 16,
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
    marginBottom: 14,
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
  memberSelectRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
  },
  memberAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  memberAvatarText: {
    fontSize: 22,
  },
  memberDetailsCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  selectedMemberName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  selectedMemberSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'right',
  },
  yearsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  yearPill: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearPillActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  yearPillText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  yearPillTextActive: {
    color: '#FFFFFF',
  },
  yearStatus: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  yearStatusActive: {
    color: '#D4A359',
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderRadius: 12,
  },
  itemRowChecked: {
    backgroundColor: '#FEF2F2',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkboxChecked: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  itemDesc: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
  },
  itemPriceBadge: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4A359',
  },
  itemPriceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  discountInputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  applyBtn: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountSuccessTag: {
    backgroundColor: '#D1FAE5',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  discountSuccessText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: '#8B0000',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 12,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLbl: {
    fontSize: 13,
    color: '#4B5563',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  totalNetLbl: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalNetVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  confirmPayBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  confirmPayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  pinInputField: {
    backgroundColor: '#FAF7F2',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 16,
    fontSize: 26,
    letterSpacing: 10,
    textAlign: 'center',
    width: 140,
    paddingVertical: 8,
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  modalBtnCancelText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  modalBtnConfirm: {
    backgroundColor: '#8B0000',
    marginLeft: 8,
  },
  modalBtnConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  receiptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  receiptHeader: {
    alignItems: 'center',
  },
  receiptGroup: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  receiptChurch: {
    fontSize: 11,
    color: '#D4A359',
    marginTop: 2,
  },
  receiptType: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 6,
  },
  receiptDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  receiptBody: {
    marginVertical: 6,
  },
  receiptLine: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  receiptLineLbl: {
    fontSize: 12,
    color: '#4B5563',
  },
  receiptLineVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  receiptItemsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 4,
    textAlign: 'right',
  },
  receiptItem: {
    fontSize: 11,
    color: '#374151',
    marginVertical: 1,
    textAlign: 'right',
  },
  receiptTotalText: {
    fontSize: 15,
    color: '#8B0000',
    fontWeight: 'bold',
  },
  receiptFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  receiptFooterText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  receiptDateText: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  receiptActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  receiptCloseBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  receiptCloseBtnText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  receiptPrintBtn: {
    flex: 1.5,
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  receiptPrintBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
