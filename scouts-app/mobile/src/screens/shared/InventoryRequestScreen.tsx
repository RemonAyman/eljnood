import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { InventoryRequest } from '../../types';

const INVENTORY_CATEGORIES = [
  { id: 'TENTS', title: 'الخيام والمظلات', icon: '⛺', subtitle: 'خيام هرمية ومظلات معسكرات' },
  { id: 'COOKING', title: 'أدوات الطهي والكانتين', icon: '🍳', subtitle: 'قدور، غاز، وأواني رحلات' },
  { id: 'DRUMS', title: 'الطبول والموسيقى', icon: '🥁', subtitle: 'طبول مسيرات كشفية وبوق' },
  { id: 'AUDIO', title: 'الصوتيات والساوند', icon: '🔊', subtitle: 'سماعات ومايكات لاسلكية' },
  { id: 'FIRST_AID', title: 'الإسعافات الأولية', icon: '🩹', subtitle: 'حقائب ميدانية ونقالات' },
  { id: 'SPORTS', title: 'الألعاب والرياضة', icon: '⚽', subtitle: 'كرات، أطواق، وأعلام' },
  { id: 'ROPES_TOOLS', title: 'الحبال والأخشاب', icon: '🪢', subtitle: 'حبال السيزال والبلطات' },
  { id: 'STATIONERY', title: 'الأدوات والمطبوعات', icon: '🎨', subtitle: 'ألوان، لوحات، وبطاقات' },
  { id: 'UNIFORMS', title: 'الزي والشارات', icon: '🧣', subtitle: 'مناديل، أوشحة، وباجات' },
  { id: 'PROJECTORS', title: 'البروجكتور والعرض', icon: '📽️', subtitle: 'داتا شو وشاشات عرض' },
];

const CHURCH_SERVICES = [
  'مجموعة جنود المسيح الكشفية',
  'خدمة مدارس الأحد (ابتدائي)',
  'اجتماع إعدادي بنين وبنات',
  'اجتماع ثانوي والجامعيين',
  'فريق كورال الملائكة',
  'فريق المسرح الكنسي',
  'خدمة أخوة الرب والقرى',
  'اجتماع الخريجين والشباب',
];

const INITIAL_REQUESTS: InventoryRequest[] = [
  {
    id: 'req_1',
    category: 'الخيام والمظلات',
    itemName: '٤ خيام استكشاف + ٢ مظلة طهي كبيرة',
    serviceName: 'مجموعة جنود المسيح الكشفية',
    requesterName: 'القائد بيتر موريس',
    pickupDatetime: '2026-10-01 08:00',
    returnDatetime: '2026-10-04 18:00',
    status: 'APPROVED',
  },
  {
    id: 'req_2',
    category: 'الطبول والموسيقى',
    itemName: '٣ طبول كشفية كبيرة + ٢ بوق نحاسي',
    serviceName: 'مجموعة جنود المسيح الكشفية',
    requesterName: 'القائد كيرلس ميشيل',
    pickupDatetime: '2026-09-25 15:00',
    returnDatetime: '2026-09-25 21:00',
    status: 'DELIVERED',
  },
  {
    id: 'req_3',
    category: 'الصوتيات والساوند',
    itemName: 'سماعة محمولة + ٢ ميكروفون لاسلكي',
    serviceName: 'خدمة مدارس الأحد (ابتدائي)',
    requesterName: 'الأستاذ عماد فريد',
    pickupDatetime: '2026-09-28 10:00',
    returnDatetime: '2026-09-28 14:00',
    status: 'PENDING',
  },
];

export const InventoryRequestScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TENTS');
  const [requests, setRequests] = useState<InventoryRequest[]>(INITIAL_REQUESTS);

  // New Request Modal
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [selectedService, setSelectedService] = useState(CHURCH_SERVICES[0]);
  const [requesterName, setRequesterName] = useState('');
  const [pickupDate, setPickupDate] = useState('2026-10-05 09:00');
  const [returnDate, setReturnDate] = useState('2026-10-07 18:00');

  const getStatusBadge = (status: InventoryRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'قيد المراجعة ⏳', bg: '#FEF3C7', color: '#92400E' };
      case 'APPROVED':
        return { label: 'تمت الموافقة ✅', bg: '#DCFCE7', color: '#166534' };
      case 'DELIVERED':
        return { label: 'تم الاستلام 📦', bg: '#DBEAFE', color: '#1E40AF' };
      case 'RETURNED':
        return { label: 'تم الإرجاع للمخزن 🔄', bg: '#F3F4F6', color: '#4B5563' };
      case 'REJECTED':
        return { label: 'مرفوض ❌', bg: '#FEE2E2', color: '#991B1B' };
    }
  };

  const handleCreateRequest = () => {
    if (!itemName.trim() || !requesterName.trim()) {
      Alert.alert('تنبيه', 'من فضلك املأ جميع الحقول المطلوبة (اسم الأداة ومقدم الطلب)');
      return;
    }

    const catObj = INVENTORY_CATEGORIES.find((c) => c.id === selectedCategory);

    const newReq: InventoryRequest = {
      id: `req_${Date.now()}`,
      category: catObj?.title || 'عام',
      itemName: itemName.trim(),
      serviceName: selectedService,
      requesterName: requesterName.trim(),
      pickupDatetime: pickupDate,
      returnDatetime: returnDate,
      status: 'PENDING',
    };

    setRequests([newReq, ...requests]);
    setShowModal(false);
    setItemName('');
    setRequesterName('');
    Alert.alert('تم بنجاح 🎉', 'تم إرسال طلب استعارة العهدة لأمين المخزن الكشفي للموافقة.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.headerTitle}>إدارة واستعارة العهدة والمهمات ⛺</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Category Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1️⃣ تصنيفات عهدة ومهمات الكشافة (10 أقسام)</Text>
          <IconCardSelector
            options={INVENTORY_CATEGORIES}
            selectedId={selectedCategory}
            onSelect={(id) => setSelectedCategory(id)}
          />
        </View>

        {/* Trigger Request Button */}
        <TouchableOpacity style={styles.requestTriggerBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.requestTriggerBtnText}>📝 تقديم طلب استعارة عهدة جديدة</Text>
        </TouchableOpacity>

        {/* Requests List */}
        <View style={styles.requestsCard}>
          <Text style={styles.sectionTitle}>سجل طلبات العهدة الحالية ({requests.length})</Text>

          {requests.map((req) => {
            const badge = getStatusBadge(req.status);

            return (
              <View key={req.id} style={styles.reqItem}>
                <View style={styles.reqTopRow}>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                  <Text style={styles.reqCategoryBadge}>🏷️ {req.category}</Text>
                </View>

                <Text style={styles.reqItemName}>{req.itemName}</Text>

                <View style={styles.reqDetailsGrid}>
                  <Text style={styles.reqDetailText}>⛪ الخدمة: {req.serviceName}</Text>
                  <Text style={styles.reqDetailText}>👤 المسؤول: {req.requesterName}</Text>
                  <Text style={styles.reqDetailText}>📤 موعد الاستلام: {req.pickupDatetime}</Text>
                  <Text style={styles.reqDetailText}>📥 موعد الإرجاع: {req.returnDatetime}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* New Request Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📦 طلب استعارة عهدة كشفية</Text>
            <Text style={styles.modalSubtitle}>سيتم إشعار مسؤول العهدة لمراجعة توفر الأدوات والموافقة</Text>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>الخدمة المستعيرة:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceScroll}>
                {CHURCH_SERVICES.map((srv) => (
                  <TouchableOpacity
                    key={srv}
                    style={[styles.serviceChip, selectedService === srv && styles.serviceChipActive]}
                    onPress={() => setSelectedService(srv)}
                  >
                    <Text style={[styles.serviceChipText, selectedService === srv && styles.serviceChipTextActive]}>
                      {srv}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>الأدوات والمهمات المطلوبة بالتفصيل:</Text>
              <TextInput
                style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
                placeholder="مثال: عدد ٥ خيام، ٢ شنطة إسعافات، ٣ بكرات حبل..."
                placeholderTextColor="#888"
                value={itemName}
                onChangeText={setItemName}
                multiline
              />

              <Text style={styles.inputLabel}>اسم الخادم / القائد المسؤول:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="الاسم ثلاثي ورقم الهاتف..."
                placeholderTextColor="#888"
                value={requesterName}
                onChangeText={setRequesterName}
              />

              <Text style={styles.inputLabel}>موعد وتاريخ الاستلام:</Text>
              <TextInput
                style={styles.modalInput}
                value={pickupDate}
                onChangeText={setPickupDate}
              />

              <Text style={styles.inputLabel}>موعد وتاريخ الإرجاع المتوقع:</Text>
              <TextInput
                style={styles.modalInput}
                value={returnDate}
                onChangeText={setReturnDate}
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCreateRequest}>
                <Text style={styles.modalConfirmBtnText}>إرسال الطلب 📤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowModal(false)}>
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
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#8B0000', marginBottom: 10 },
  requestTriggerBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  requestTriggerBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  requestsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  reqItem: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  reqTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: 'bold' },
  reqCategoryBadge: { fontSize: 12, fontWeight: 'bold', color: '#4B5563' },
  reqItemName: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', textAlign: 'right', marginBottom: 8 },
  reqDetailsGrid: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 },
  reqDetailText: { fontSize: 12, color: '#4B5563', textAlign: 'right', marginBottom: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#8B0000', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#374151', textAlign: 'right', marginBottom: 4, marginTop: 8 },
  serviceScroll: { flexDirection: 'row', marginBottom: 8 },
  serviceChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  serviceChipActive: { backgroundColor: '#8B0000', borderColor: '#8B0000' },
  serviceChipText: { fontSize: 11, color: '#4B5563' },
  serviceChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  modalInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
    marginBottom: 8,
  },
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
