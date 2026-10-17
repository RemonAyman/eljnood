import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { SafeHorizontalScrollView } from '../../components/ui/SafeHorizontalScrollView';
import { RoomReservation } from '../../types';
import { saveRoomReservationToFirestore, fetchRoomReservationsFromFirestore } from '../../services/firebaseService';

const CHURCH_ROOMS = [
  { id: 'UPPER_HALL', title: 'القاعة العليا', icon: '🏛️', subtitle: 'سعة كبرى مجهزة للمؤتمرات والاجتماعات' },
  { id: 'LOWER_HALL', title: 'القاعة السفلية', icon: '🏛️', subtitle: 'قاعة الأنشطة واللقاءات الفئوية' },
  { id: 'ROOF', title: 'السطوح (الروف)', icon: '☀️', subtitle: 'أنشطة الهواء الطلق والسمر الكشفي' },
  { id: 'FR_VELTAOUS_ROOM', title: 'غرفة أبونا فلتاؤوس', icon: '⛪', subtitle: 'غرفة الاجتماعات الروحية والافتفاد' },
  { id: 'POPE_SHENOUDA_ROOM', title: 'غرفة البابا شنودة', icon: '⛪', subtitle: 'قاعة المحاضرات والدروس الكنسية' },
  { id: 'NURSERY_ROOM', title: 'غرفة الحضانة', icon: '🧸', subtitle: 'أنشطة الأطفال والبراعم' },
  { id: 'MR_ROMELL_ROOM', title: 'غرفة أستاذ روميل', icon: '💼', subtitle: 'غرفة التنسيق الإداري والخدمة' },
  { id: 'MR_GEORGE_ROZEIK_ROOM', title: 'غرفة أستاذ جورج رزيق', icon: '📖', subtitle: 'غرفة إعداد الخدام والمناهج' },
  { id: 'SCOUT_LAB_ROOM', title: 'غرفة معمل الكشافة', icon: '⛺', subtitle: 'ورش الريادة والتقاليد الكشفية' },
  { id: 'TECH_LANG_LAB_ROOM', title: 'غرفة معمل التكنولوجيا واللغات', icon: '💻', subtitle: 'أجهزة الكمبيوتر والوسائط واللغات' },
];

const SERVICES_LIST = [
  'مدارس أحد',
  'ألحان',
  'فصول تقوية',
  'تسبحة',
  'درس كتاب',
  'إعلام',
  'مارش',
  'كورال',
  'مسرح',
  'كورال حركات',
  'تقديم',
  'كورسات',
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 to 23:00

export const RoomReservationScreen = ({ navigation }: any) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('SCOUT_HALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reservations, setReservations] = useState<RoomReservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Reservation Modal
  const [showModal, setShowModal] = useState(false);
  const [startHour, setStartHour] = useState<number>(10);
  const [endHour, setEndHour] = useState<number>(12);
  const [selectedService, setSelectedService] = useState(SERVICES_LIST[0]);
  const [reservedByName, setReservedByName] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchRoomReservationsFromFirestore();
        setReservations(data);
      } catch (e) {
        console.warn('Error loading reservations:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeRoomObj = CHURCH_ROOMS.find((r) => r.id === selectedRoomId);
  const activeRoomName = activeRoomObj?.title || 'القاعة الكشفية';

  const roomReservationsForDate = reservations.filter(
    (r) => r.roomName === activeRoomName && r.date === selectedDate
  );

  const isHourBooked = (hour: number) => {
    return roomReservationsForDate.find((r) => hour >= r.startHour && hour < r.endHour);
  };

  const handleOpenReserveModal = (hour: number) => {
    const booked = isHourBooked(hour);
    if (booked) {
      Alert.alert(
        'الموعد محجوز مسبقاً ⚠️',
        `هذه القاعة محجوزة في تمام الساعة ${hour}:00 لصالح (${booked.serviceName}) بواسطة: ${booked.reservedByName}`
      );
      return;
    }
    setStartHour(hour);
    setEndHour(Math.min(hour + 2, 23));
    setShowModal(true);
  };

  const handleConfirmReservation = async () => {
    if (!reservedByName.trim()) {
      Alert.alert('تنبيه', 'من فضلك أدخل اسم الخادم المسؤول عن الحجز ورقم هاتفه');
      return;
    }

    if (endHour <= startHour) {
      Alert.alert('خطأ', 'ساعة الانتهاء يجب أن تكون بعد ساعة البدء');
      return;
    }

    // Check conflict
    const conflict = roomReservationsForDate.some(
      (r) =>
        (startHour >= r.startHour && startHour < r.endHour) ||
        (endHour > r.startHour && endHour <= r.endHour) ||
        (startHour <= r.startHour && endHour >= r.endHour)
    );

    if (conflict) {
      Alert.alert('تعارض في المواعيد ❌', 'يوجد حجز آخر يتعارض مع الفترة الزمنية المحددة!');
      return;
    }

    const newRes: RoomReservation = {
      id: `res_${Date.now()}`,
      roomName: activeRoomName,
      serviceName: selectedService,
      date: selectedDate,
      startHour,
      endHour,
      reservedByName: reservedByName.trim(),
    };

    setReservations((prev) => [...prev, newRes]);
    setShowModal(false);
    setReservedByName('');

    await saveRoomReservationToFirestore(newRes);
    Alert.alert('تم الحجز بنجاح 🎉', `تم تأكيد حجز ${activeRoomName} من ${startHour}:00 إلى ${endHour}:00 وحفظه في سجل الحجوزات.`);
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerTopBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack?.() || navigation?.navigate?.('MainSwipeApp')}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>➔ رجوع</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
            <Text style={styles.headerTitle}>جدول حجز قاعات ومسارح الكنيسة 🏛️</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Room Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1️⃣ اختر القاعة أو المسرح (10 قاعات)</Text>
          <IconCardSelector
            options={CHURCH_ROOMS}
            selectedId={selectedRoomId}
            onSelect={(id) => setSelectedRoomId(id)}
          />
        </View>

        {/* Date Selector Banner */}
        <View style={styles.dateCard}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>📅 تاريخ الحجز:</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{selectedDate}</Text>
            </View>
          </View>
          <Text style={styles.roomStatusSummary}>
            📍 القاعة المختارة: <Text style={{ fontWeight: 'bold', color: '#8B0000' }}>{activeRoomName}</Text>
          </Text>
        </View>

        {/* Hourly Grid (8:00 AM - 11:00 PM) */}
        <View style={styles.gridCard}>
          <Text style={styles.sectionTitle}>⏰ الجدول الزمني المتاح (من ٨:٠٠ ص حتى ١١:٠٠ م)</Text>

          <View style={styles.hoursList}>
            {HOURS.map((hour) => {
              const booked = isHourBooked(hour);
              const formatHour = hour < 12 ? `${hour}:00 ص` : hour === 12 ? '12:00 م' : `${hour - 12}:00 م`;

              return (
                <TouchableOpacity
                  key={hour}
                  style={[styles.hourSlot, booked ? styles.hourSlotBooked : styles.hourSlotFree]}
                  onPress={() => handleOpenReserveModal(hour)}
                >
                  <View style={styles.hourTimeBox}>
                    <Text style={[styles.hourTimeText, booked && { color: '#991B1B' }]}>{formatHour}</Text>
                  </View>

                  <View style={styles.hourInfoBox}>
                    {booked ? (
                      <View>
                        <Text style={styles.bookedServiceText}>🔒 {booked.serviceName}</Text>
                        <Text style={styles.bookedByText}>المسؤول: {booked.reservedByName}</Text>
                      </View>
                    ) : (
                      <Text style={styles.freeSlotText}>🟢 متاح للحجز (اضغط للحجز)</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Reservation Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🏛️ تأكيد حجز القاعة</Text>
            <Text style={styles.modalSubtitle}>{activeRoomName}</Text>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>الخدمة الحاجزة (اختر من ١٢ خدمة):</Text>
              <SafeHorizontalScrollView style={styles.serviceScroll}>
                {SERVICES_LIST.map((srv) => (
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
              </SafeHorizontalScrollView>

              <View style={styles.hoursRangeRow}>
                <View style={styles.hourInputBlock}>
                  <Text style={styles.inputLabel}>من الساعة:</Text>
                  <View style={styles.hourBadge}>
                    <Text style={styles.hourBadgeText}>{startHour}:00</Text>
                  </View>
                </View>

                <View style={styles.hourInputBlock}>
                  <Text style={styles.inputLabel}>إلى الساعة:</Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setEndHour(Math.max(startHour + 1, endHour - 1))}
                    >
                      <Text style={styles.counterBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{endHour}:00</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setEndHour(Math.min(23, endHour + 1))}
                    >
                      <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>اسم الخادم المسؤول ورقم الهاتف:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="مثال: القائد مينا عادل (01234567890)"
                placeholderTextColor="#888"
                value={reservedByName}
                onChangeText={setReservedByName}
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmReservation}>
                <Text style={styles.modalConfirmBtnText}>تأكيد الحجز ✅</Text>
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
  headerTopBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerSubtitle: { color: '#D4A359', fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
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
  dateCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dateLabel: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  dateBadge: { backgroundColor: '#8B0000', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  dateText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  roomStatusSummary: { fontSize: 13, color: '#666', textAlign: 'right' },
  gridCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  hoursList: { marginTop: 8 },
  hourSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  hourSlotFree: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  hourSlotBooked: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  hourTimeBox: { width: 75, borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingRight: 8 },
  hourTimeText: { fontSize: 12, fontWeight: 'bold', color: '#166534' },
  hourInfoBox: { flex: 1, paddingLeft: 12 },
  freeSlotText: { fontSize: 13, color: '#15803D', fontWeight: '600', textAlign: 'right' },
  bookedServiceText: { fontSize: 13, fontWeight: 'bold', color: '#991B1B', textAlign: 'right' },
  bookedByText: { fontSize: 11, color: '#7F1D1D', textAlign: 'right', marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#8B0000', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#374151', textAlign: 'right', marginBottom: 4, marginTop: 8 },
  serviceScroll: { flexDirection: 'row', marginBottom: 12 },
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
  hoursRangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  hourInputBlock: { flex: 1, marginHorizontal: 4 },
  hourBadge: { backgroundColor: '#8B0000', padding: 10, borderRadius: 8, alignItems: 'center' },
  hourBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  counterBtn: {
    backgroundColor: '#E5E7EB',
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: { fontSize: 18, fontWeight: 'bold' },
  counterValue: { marginHorizontal: 12, fontSize: 14, fontWeight: 'bold', color: '#8B0000' },
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
