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
import { InventoryRequest, InventoryItem } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { fetchInventoryRequestsFromFirestore } from '../../services/firebaseService';

const INVENTORY_CATEGORIES = [
  { id: 'THEATER', title: 'عهدة مسرح', icon: '🎭', subtitle: 'مهمات وأدوات المسرح الكنسي' },
  { id: 'SCOUT_LEADERSHIP', title: 'عهدة ريادي', icon: '⛺', subtitle: 'أخشاب، حبال، وسواري كشفية' },
  { id: 'GAMES', title: 'عهدة ألعاب', icon: '⚽', subtitle: 'أدوات وألعاب المهرجانات والطوابير' },
  { id: 'KITCHEN_TOOLS', title: 'عهدة أدوات مطبخ', icon: '🍳', subtitle: 'قدور، أواني، وأطباق الرحلات والمعسكرات' },
  { id: 'KITCHEN_APPLIANCES', title: 'عهدة أجهزة مطبخ', icon: '🔥', subtitle: 'مواقد غاز وثلاجات ميدانية' },
  { id: 'AUDIO_VISUAL', title: 'عهدة أجهزة صوتية ومرئية', icon: '🔊', subtitle: 'سماعات، مايكات، وداتا شو' },
  { id: 'COMPUTERS_WIRELESS', title: 'عهدة أجهزة كمبيوتر ولاسلكي', icon: '📻', subtitle: 'أجهزة لاسلكي وحواسب آلي' },
  { id: 'STATIONERY', title: 'عهدة أدوات مكتبية', icon: '📝', subtitle: 'أوراق، ألوان، وبطاقات التقييم' },
  { id: 'ELECTRICAL_TOOLS', title: 'عهدة عدة كهربائية', icon: '🔌', subtitle: 'كابلات، كشافات، وموزعات طاقة' },
  { id: 'GENERAL_TOOLS', title: 'عهدة عدة', icon: '🧰', subtitle: 'مطارق، بلطات، وصناديق صيانة' },
];

const CHURCH_SERVICES = [
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
  'مجموعة جنود المسيح الكشفية',
];

export const InventoryRequestScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const isInventoryManager = user?.role === 'INVENTORY_MANAGER' || user?.role === 'ADMIN' || user?.role === 'GROUP_MANAGER';

  const items = useInventoryStore((s) => s.items);
  const requests = useInventoryStore((s) => s.requests);
  const requestItem = useInventoryStore((s) => s.requestItem);
  const updateRequestStatus = useInventoryStore((s) => s.updateRequestStatus);
  const addItem = useInventoryStore((s) => s.addItem);
  const setRequests = useInventoryStore((s) => s.setRequests);

  const [selectedCategory, setSelectedCategory] = useState<string>('GAMES');
  const [loading, setLoading] = useState(false);

  // New Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [customItemName, setCustomItemName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedService, setSelectedService] = useState(CHURCH_SERVICES[0]);
  const [requesterName, setRequesterName] = useState(user?.name || '');
  const [pickupDate, setPickupDate] = useState('2026-10-18 09:00');
  const [returnDate, setReturnDate] = useState('2026-10-20 18:00');

  // Add Item Modal (For Inventory Manager)
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('5');
  const [newItemUnit, setNewItemUnit] = useState('قطعة');

  useEffect(() => {
    async function syncFirestore() {
      try {
        const firestoreReqs = await fetchInventoryRequestsFromFirestore();
        if (firestoreReqs && firestoreReqs.length > 0) {
          setRequests(firestoreReqs);
        }
      } catch (e) {
        console.warn('Sync requests note:', e);
      }
    }
    syncFirestore();
  }, [setRequests]);

  // Filter items in currently selected category
  const categoryItems = items.filter((it) => it.categoryId === selectedCategory);

  const selectedItemObj = items.find((it) => it.id === selectedItemId);

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

  const handleOpenRequestModal = (preselectedItemId?: string) => {
    if (preselectedItemId) {
      setSelectedItemId(preselectedItemId);
    } else if (categoryItems.length > 0) {
      setSelectedItemId(categoryItems[0].id);
    }
    setQuantity(1);
    setRequesterName(user?.name || '');
    setShowRequestModal(true);
  };

  const handleCreateRequest = () => {
    const itemName = selectedItemObj ? selectedItemObj.name : customItemName.trim();

    if (!itemName) {
      Alert.alert('تنبيه', 'من فضلك اختر الصنف المطلوب أو حدد اسمه.');
      return;
    }

    if (!requesterName.trim()) {
      Alert.alert('تنبيه', 'من فضلك أدخل اسم الخادم أو القائد المسؤول.');
      return;
    }

    if (quantity <= 0) {
      Alert.alert('تنبيه', 'يرجى تحديد كمية صحيحة أكبر من 0.');
      return;
    }

    const catObj = INVENTORY_CATEGORIES.find((c) => c.id === selectedCategory);

    const result = requestItem({
      category: catObj?.title || 'عام',
      categoryId: selectedCategory,
      itemId: selectedItemObj?.id,
      itemName,
      quantity,
      serviceName: selectedService,
      requesterName: requesterName.trim(),
      pickupDatetime: pickupDate,
      returnDatetime: returnDate,
    });

    if (!result.success) {
      Alert.alert('تعذر إتمام الحجز ⚠️', result.message);
      return;
    }

    setShowRequestModal(false);
    setCustomItemName('');
    Alert.alert('تم الحجز بنجاح 🎉', result.message);
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('تنبيه', 'من فضلك أدخل اسم الصنف الجديد.');
      return;
    }
    const q = parseInt(newItemQuantity, 10) || 1;
    addItem({
      categoryId: selectedCategory,
      name: newItemName.trim(),
      totalQuantity: q,
      availableQuantity: q,
      unit: newItemUnit.trim() || 'قطعة',
    });

    setShowAddItemModal(false);
    setNewItemName('');
    setNewItemQuantity('5');
    Alert.alert('تمت الإضافة بنجاح ✅', 'تم إضافة الصنف وتحديث رصيد المخزن الكشفي.');
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
            <Text style={styles.headerTitle}>إدارة واستعارة العهدة والمخزون ⛺</Text>
          </View>
        </View>
        {isInventoryManager && (
          <View style={styles.managerBadge}>
            <Text style={styles.managerBadgeText}>🔑 وضع إدارة المخزن (مسؤول العهدة)</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Category Selector (10 Sections) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1️⃣ تصنيفات عهدة ومهمات الكشافة (10 أقسام):</Text>
          <IconCardSelector
            options={INVENTORY_CATEGORIES}
            selectedId={selectedCategory}
            onSelect={(id) => setSelectedCategory(id)}
          />
        </View>

        {/* Current Category Items & Real-time Stock Display */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>
              📋 أصناف ({INVENTORY_CATEGORIES.find((c) => c.id === selectedCategory)?.title})
            </Text>
            {isInventoryManager && (
              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => setShowAddItemModal(true)}
              >
                <Text style={styles.addItemBtnText}>+ إضافة صنف</Text>
              </TouchableOpacity>
            )}
          </View>

          {categoryItems.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد أصناف مضافة في هذا القسم حالياً.</Text>
          ) : (
            categoryItems.map((item) => {
              const isAvailable = item.availableQuantity > 0;
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNameText}>{item.name}</Text>
                    <Text style={styles.itemStockText}>
                      الإجمالي: {item.totalQuantity} {item.unit || 'قطعة'} |{' '}
                      <Text
                        style={{
                          color: isAvailable ? '#059669' : '#DC2626',
                          fontWeight: 'bold',
                        }}
                      >
                        المتاح حالياً: {item.availableQuantity}
                      </Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.requestItemBtn,
                      !isAvailable && styles.requestItemBtnDisabled,
                    ]}
                    disabled={!isAvailable}
                    onPress={() => handleOpenRequestModal(item.id)}
                  >
                    <Text style={styles.requestItemBtnText}>
                      {isAvailable ? 'حجز 📦' : 'نفذت'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {/* Trigger Request Button */}
          <TouchableOpacity
            style={styles.requestTriggerBtn}
            onPress={() => handleOpenRequestModal()}
          >
            <Text style={styles.requestTriggerBtnText}>
              📝 تقديم طلب استعارة عهدة من هذا القسم
            </Text>
          </TouchableOpacity>
        </View>

        {/* Requests Log */}
        <View style={styles.requestsCard}>
          <Text style={styles.sectionTitle}>
            سجل طلبات العهدة الجارية ({requests.length})
          </Text>

          {requests.map((req) => {
            const badge = getStatusBadge(req.status);

            return (
              <View key={req.id} style={styles.reqItem}>
                <View style={styles.reqTopRow}>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                  <Text style={styles.reqCategoryBadge}>🏷️ {req.category}</Text>
                </View>

                <Text style={styles.reqItemName}>
                  {req.itemName} - (العدد المطلوب: {req.quantity || 1})
                </Text>

                <View style={styles.reqDetailsGrid}>
                  <Text style={styles.reqDetailText}>⛪ الخدمة: {req.serviceName}</Text>
                  <Text style={styles.reqDetailText}>👤 المسؤول: {req.requesterName}</Text>
                  <Text style={styles.reqDetailText}>📤 موعد الاستلام: {req.pickupDatetime}</Text>
                  <Text style={styles.reqDetailText}>📥 موعد الإرجاع: {req.returnDatetime}</Text>
                </View>

                {/* Manager Control Actions */}
                {isInventoryManager && (
                  <View style={styles.managerActionRow}>
                    {req.status === 'PENDING' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => updateRequestStatus(req.id, 'APPROVED')}
                      >
                        <Text style={styles.actionBtnText}>موافقة ✅</Text>
                      </TouchableOpacity>
                    )}
                    {(req.status === 'PENDING' || req.status === 'APPROVED') && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
                        onPress={() => updateRequestStatus(req.id, 'DELIVERED')}
                      >
                        <Text style={styles.actionBtnText}>تم التسليم 📦</Text>
                      </TouchableOpacity>
                    )}
                    {req.status === 'DELIVERED' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#6B7280' }]}
                        onPress={() => {
                          updateRequestStatus(req.id, 'RETURNED');
                          Alert.alert('تمت الإعادة 🔄', 'تم إرجاع العهدة وإعادة الكمية لرصيد المخزن المتاح.');
                        }}
                      >
                        <Text style={styles.actionBtnText}>إرجاع للمخزن 🔄</Text>
                      </TouchableOpacity>
                    )}
                    {req.status !== 'RETURNED' && req.status !== 'REJECTED' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => updateRequestStatus(req.id, 'REJECTED')}
                      >
                        <Text style={styles.actionBtnText}>رفض ❌</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* New Request Modal */}
      <Modal visible={showRequestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📦 طلب استعارة عهدة كشفية</Text>
            <Text style={styles.modalSubtitle}>
              اختر الصنف والكمية المطلوبة بناءً على رصيد المخزن المتاح
            </Text>

            <ScrollView style={{ maxHeight: 420 }}>
              {/* Item Dropdown / Selector */}
              <Text style={styles.inputLabel}>
                اختر الصنف من عهدة ({INVENTORY_CATEGORIES.find((c) => c.id === selectedCategory)?.title}):
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                {categoryItems.map((cItem) => (
                  <TouchableOpacity
                    key={cItem.id}
                    style={[
                      styles.itemChip,
                      selectedItemId === cItem.id && styles.itemChipActive,
                    ]}
                    onPress={() => setSelectedItemId(cItem.id)}
                  >
                    <Text
                      style={[
                        styles.itemChipText,
                        selectedItemId === cItem.id && styles.itemChipTextActive,
                      ]}
                    >
                      {cItem.name} ({cItem.availableQuantity} متاح)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Quantity Stepper */}
              <View style={styles.quantityBox}>
                <Text style={styles.inputLabel}>الكمية المطلوبة (المتاح: {selectedItemObj?.availableQuantity || 0}):</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => {
                      if (selectedItemObj && quantity >= selectedItemObj.availableQuantity) {
                        Alert.alert('تنبيه', `الكمية المتاحة في المخزن هي ${selectedItemObj.availableQuantity} فقط.`);
                        return;
                      }
                      setQuantity((q) => q + 1);
                    }}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.inputLabel}>الخدمة المستعيرة:</Text>
              <SafeHorizontalScrollView style={styles.serviceScroll}>
                {CHURCH_SERVICES.map((srv) => (
                  <TouchableOpacity
                    key={srv}
                    style={[
                      styles.serviceChip,
                      selectedService === srv && styles.serviceChipActive,
                    ]}
                    onPress={() => setSelectedService(srv)}
                  >
                    <Text
                      style={[
                        styles.serviceChipText,
                        selectedService === srv && styles.serviceChipTextActive,
                      ]}
                    >
                      {srv}
                    </Text>
                  </TouchableOpacity>
                ))}
              </SafeHorizontalScrollView>

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
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleCreateRequest}
              >
                <Text style={styles.modalConfirmBtnText}>تأكيد الحجز والطلب 📤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowRequestModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Item Modal (For Manager) */}
      <Modal visible={showAddItemModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📦 إضافة صنف جديد للمخزن</Text>
            <Text style={styles.modalSubtitle}>
              القسم:{' '}
              {INVENTORY_CATEGORIES.find((c) => c.id === selectedCategory)?.title}
            </Text>

            <Text style={styles.inputLabel}>اسم الصنف / الأداة:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="مثال: كرة قدم، خيمة كشفية، كشاف مسرح..."
              value={newItemName}
              onChangeText={setNewItemName}
              textAlign="right"
            />

            <Text style={styles.inputLabel}>الكمية الكلية المتوفرة:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="مثال: 10"
              keyboardType="number-pad"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              textAlign="right"
            />

            <Text style={styles.inputLabel}>وحدة القياس / العد:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="مثال: قطعة، خيمة، لفة، طقم..."
              value={newItemUnit}
              onChangeText={setNewItemUnit}
              textAlign="right"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleAddNewItem}
              >
                <Text style={styles.modalConfirmBtnText}>إضافة للمخزن ✅</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddItemModal(false)}
              >
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
    marginBottom: 4,
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
  managerBadge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 8,
  },
  managerBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#8B0000' },
  addItemBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addItemBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginVertical: 12 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: { flex: 1, paddingRight: 8 },
  itemNameText: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', textAlign: 'right' },
  itemStockText: { fontSize: 12, color: '#6B7280', textAlign: 'right', marginTop: 2 },
  requestItemBtn: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  requestItemBtnDisabled: { backgroundColor: '#9CA3AF' },
  requestItemBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  requestTriggerBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
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
  managerActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
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
  itemChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 6,
  },
  itemChipActive: { backgroundColor: '#8B0000', borderColor: '#8B0000' },
  itemChipText: { fontSize: 12, color: '#374151' },
  itemChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  quantityBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 16,
  },
  stepBtn: {
    backgroundColor: '#8B0000',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  quantityText: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', minWidth: 30, textAlign: 'center' },
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
