import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Image 
} from 'react-native';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';
import { SafeHorizontalScrollView } from '../../components/ui/SafeHorizontalScrollView';
import { useAuthStore } from '../../store/authStore';
import { useMembersStore } from '../../store/membersStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { ScoutCardPreview } from '../../components/card_print/ScoutCardPreview';
import { 
  fetchMemberByCodeFromFirestore, 
  findUserOrMemberInFirestore, 
  fetchMemberSubscriptions,
  fetchMembersFromFirestore,
  saveUserToFirestore,
  matchesPhone
} from '../../services/firebaseService';
import { Member, SubscriptionRecord } from '../../types';

export const ParentHomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const getMemberAttendanceRate = useAttendanceStore((s) => s.getMemberAttendanceRate);

  const [loading, setLoading] = useState(true);
  const [childrenList, setChildrenList] = useState<Member[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(0);
  const [subscriptionsMap, setSubscriptionsMap] = useState<Record<string, SubscriptionRecord[]>>({});

  // Add / Link Child Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInputCode, setLinkInputCode] = useState('');
  const [linking, setLinking] = useState(false);

  // Load all linked children for this parent
  const loadParentChildren = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const parentPhone = user.guardianPhone || user.phone || '';
      const initialCode = user.code || user.sonCode || '';
      const matchedChildren: Member[] = [];

      // 1. Search all members matching guardian phone
      if (parentPhone) {
        const allMembers = await fetchMembersFromFirestore();
        allMembers.forEach((m) => {
          const matchGuardian = m.guardianPhone === parentPhone || matchesPhone(m.guardianPhone, parentPhone);
          const matchPhone = m.phone === parentPhone || matchesPhone(m.phone, parentPhone);
          if (matchGuardian || matchPhone) {
            if (!matchedChildren.some((c) => c.code === m.code)) {
              matchedChildren.push(m);
            }
          }
        });
      }

      // 2. Search initial son code if not already found
      if (initialCode && !matchedChildren.some((c) => c.code === initialCode)) {
        const found = await fetchMemberByCodeFromFirestore(initialCode);
        if (found) {
          matchedChildren.push(found);
        }
      }

      setChildrenList(matchedChildren);

      // Fetch subscriptions for all children
      const subsObj: Record<string, SubscriptionRecord[]> = {};
      for (const child of matchedChildren) {
        const subs = await fetchMemberSubscriptions(child.code);
        subsObj[child.code] = subs;
      }
      setSubscriptionsMap(subsObj);
    } catch (e) {
      console.warn('Error loading parent children:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadParentChildren();
  }, [loadParentChildren]);

  // Handle linking another child by Scout Code or Phone
  const handleLinkNewChild = async () => {
    if (!linkInputCode.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الكود الكشفي للابن أو رقم الموبايل');
      return;
    }

    setLinking(true);
    try {
      const cleanInput = linkInputCode.trim();
      let foundMember = await fetchMemberByCodeFromFirestore(cleanInput);

      if (!foundMember) {
        const userOrMem = await findUserOrMemberInFirestore(cleanInput);
        if (userOrMem && userOrMem.code) {
          foundMember = await fetchMemberByCodeFromFirestore(userOrMem.code);
        }
      }

      if (foundMember) {
        // Check if already linked
        if (childrenList.some((c) => c.code === foundMember!.code)) {
          Alert.alert('مربوط بالفعل ℹ️', `الابن (${foundMember.name}) مربوط بالفعل في حسابك!`);
        } else {
          const updatedList = [...childrenList, foundMember];
          setChildrenList(updatedList);
          setSelectedChildIndex(updatedList.length - 1);

          // Fetch subs for new child
          const subs = await fetchMemberSubscriptions(foundMember.code);
          setSubscriptionsMap((prev) => ({ ...prev, [foundMember!.code]: subs }));

          // Save link to user profile in Firestore
          if (user) {
            await saveUserToFirestore({
              uid: user.id,
              name: user.name,
              email: user.email || '',
              role: user.role,
              phone: user.phone,
              guardianPhone: user.guardianPhone,
              sonName: foundMember.name,
              sonCode: foundMember.code,
            });
          }

          Alert.alert('تم الربط بنجاح! 🎉', `تم ربط حساب الابن (${foundMember.name}) بفرقة (${foundMember.squadName}) بنجاح!`);
        }

        setShowLinkModal(false);
        setLinkInputCode('');
      } else {
        Alert.alert('غير موجود ❌', `لم يتم العثور على عضو بالكود أو الهاتف: ${cleanInput}`);
      }
    } catch (e: any) {
      Alert.alert('خطأ', `تعذر ربط الابن: ${e.message}`);
    } finally {
      setLinking(false);
    }
  };

  const activeChild = useMemo(() => {
    if (childrenList.length > 0 && selectedChildIndex < childrenList.length) {
      return childrenList[selectedChildIndex];
    }
    return null;
  }, [childrenList, selectedChildIndex]);

  const activeChildAttendanceRate = useMemo(() => {
    return activeChild ? getMemberAttendanceRate(activeChild.id) : 0;
  }, [activeChild, getMemberAttendanceRate]);

  const activeChildSubscriptions = useMemo(() => {
    return activeChild ? subscriptionsMap[activeChild.code] || [] : [];
  }, [activeChild, subscriptionsMap]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerLogoCircle}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.headerLogoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerTitle}>لوحة متابعة أولياء الأمور 👨‍👩‍👧</Text>
        <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية - متابعة الأبناء والأنشطة والماليات</Text>
      </View>

      {/* Children Selection Bar (Multi-Child Pills) */}
      <View style={styles.childrenBarCard}>
        <View style={styles.childrenBarHeader}>
          <TouchableOpacity style={styles.addChildBtn} onPress={() => setShowLinkModal(true)}>
            <Text style={styles.addChildBtnText}>➕ ربط ابن آخر</Text>
          </TouchableOpacity>
          <Text style={styles.childrenBarTitle}>أبنائك الكشافين المسجلين ({childrenList.length}):</Text>
        </View>

        {childrenList.length > 0 ? (
          <SafeHorizontalScrollView style={styles.childrenPillsScroll}>
            {childrenList.map((child, idx) => {
              const isSelected = selectedChildIndex === idx;
              return (
                <TouchableOpacity
                  key={child.id || idx}
                  style={[styles.childPill, isSelected && styles.childPillActive]}
                  onPress={() => setSelectedChildIndex(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.childPillIcon]}>
                    {child.gender === 'FEMALE' ? '🌸' : '🦁'}
                  </Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.childPillName, isSelected && styles.childPillNameActive]}>
                      {child.name.split(' ')[0]} {child.name.split(' ')[1] || ''}
                    </Text>
                    <Text style={[styles.childPillSquad, isSelected && styles.childPillSquadActive]}>
                      قطاع {child.squadName}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </SafeHorizontalScrollView>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>جاري جلب بيانات الأبناء من السحابة الكشفية...</Text>
        </View>
      ) : !activeChild ? (
        <View style={styles.linkCard}>
          <Text style={styles.linkCardTitle}>ربط حساب الكشاف (الابن / الابنة) 🔗</Text>
          <Text style={styles.linkCardDesc}>
            لم يتم العثور على أبناء كشافين مربوطين بهذا الحساب بعد. أدخل الكود الكشفي للابن (مثال: JS-2026-448) أو رقم الهاتف للربط الفوري:
          </Text>
          <TextInput
            style={styles.linkInput}
            placeholder="أدخل كود الكشاف أو رقم الهاتف..."
            placeholderTextColor="#888"
            value={linkInputCode}
            onChangeText={setLinkInputCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            style={styles.linkBtn}
            onPress={handleLinkNewChild}
            disabled={linking}
          >
            {linking ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.linkBtnText}>بحث وربط الحساب 🔍</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Active Child Scout ID Preview Card */}
          <Text style={styles.sectionTitle}>بطاقة الكشاف والفرقة الكشفية الحالية</Text>
          <ScoutCardPreview member={activeChild} />

          {/* Attendance Gauge Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>مؤشر الانضباط والحضور للابن ({activeChild.name})</Text>
            <View style={styles.gaugeRow}>
              <View style={styles.rateCircle}>
                <Text style={styles.rateText}>{activeChildAttendanceRate}%</Text>
                <Text style={styles.rateSub}>
                  {activeChildAttendanceRate >= 85 ? 'ممتاز' : activeChildAttendanceRate >= 65 ? 'جيد جداً' : 'يحتاج متابعة'}
                </Text>
              </View>
              <View style={styles.gaugeDetails}>
                <Text style={styles.gaugeDesc}>
                  نسبة التزام الحضور في الأيام الكشفية والمعسكرات وتدريبات المهرجان الكشفي.
                </Text>
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>فرقة: {activeChild.squadName}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>الكود: {activeChild.code}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Financial Status Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>موقف الاشتراكات والماليات (2026)</Text>
            {activeChildSubscriptions.length > 0 ? (
              activeChildSubscriptions.map((sub, idx) => (
                <View key={idx} style={{ marginBottom: 10 }}>
                  <View style={styles.finRow}>
                    <Text style={styles.finLabel}>إيصال رقم: {sub.receiptNumber}</Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidText}>✓ مُسدد بالكامل</Text>
                    </View>
                  </View>
                  <Text style={styles.finDetails}>
                    المبلغ: {sub.totalPaid || sub.subtotal} ج.م | المسدد: {sub.memberName}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptySubBox}>
                <Text style={styles.emptySubText}>لا توجد إيصالات سداد مسجلة حتى الآن لهذا الابن.</Text>
              </View>
            )}
          </View>

          {/* All System Modules Grid */}
          <Text style={styles.sectionTitle}>خدمات وسيستم الكشافة الكنسي (الكل) ⚜️</Text>
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 8 }}>
            {[
              { title: 'الغياب والـ QR', icon: '📋', route: 'Attendance' },
              { title: 'حجز القاعات', icon: '🏛️', route: 'RoomReservation' },
              { title: 'استعارة العهدة', icon: '⛺', route: 'InventoryRequest' },
              { title: 'المناهج والمسابقات', icon: '📚', route: 'Curricula' },
              { title: 'أرشيف الذكريات', icon: '📸', route: 'Memories' },
              { title: 'لوحة القيادة', icon: '🛡️', route: 'AdminDashboard' },
            ].map((m, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  width: '48%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  alignItems: 'center',
                }}
                onPress={() => navigation?.navigate(m.route)}
              >
                <Text style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#8B0000' }}>{m.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Chat with Leaders */}
          <TouchableOpacity 
            style={styles.contactBtn} 
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('ChatRooms')}
          >
            <Text style={styles.contactBtnText}>💬 التواصل المباشر مع قادة فرقة {activeChild.squadName}</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal to Link Additional Child */}
      <Modal visible={showLinkModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>👨‍👩‍👧</Text>
            <Text style={styles.modalTitle}>ربط ابن جديد بحساب ولي الأمر</Text>
            <Text style={styles.modalSub}>
              أدخل الكود الكشفي للابن (مثال: JS-2026-448) أو رقم الموبايل لإضافته لمتابعة الحضور والاشتراكات:
            </Text>

            <TextInput
              style={styles.linkInput}
              placeholder="مثال: JS-2026-448 أو رقم الهاتف..."
              placeholderTextColor="#888"
              value={linkInputCode}
              onChangeText={setLinkInputCode}
              autoCapitalize="characters"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => setShowLinkModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={handleLinkNewChild}
                disabled={linking}
              >
                {linking ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>ربط الحساب 🔍</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
      <BottomNavBar navigation={navigation} currentRoute="Home" />
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
    paddingBottom: 90,
  },
  header: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#D4A359',
    overflow: 'hidden',
    padding: 2,
  },
  headerLogoImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#D4A359',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  childrenBarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  childrenBarHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  childrenBarTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  addChildBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  addChildBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  childrenPillsScroll: {
    flexDirection: 'row-reverse',
  },
  childPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    gap: 6,
  },
  childPillActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  childPillIcon: {
    fontSize: 18,
  },
  childPillName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  childPillNameActive: {
    color: '#FFFFFF',
  },
  childPillSquad: {
    fontSize: 9,
    color: '#6B7280',
  },
  childPillSquadActive: {
    color: '#D4A359',
    fontWeight: 'bold',
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#D4A359',
  },
  linkCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'center',
    marginBottom: 8,
  },
  linkCardDesc: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'right',
    lineHeight: 18,
    marginBottom: 14,
  },
  linkInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    textAlign: 'right',
    color: '#1F2937',
    marginBottom: 12,
    width: '100%',
  },
  linkBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptySubBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptySubText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
    fontSize: 36,
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
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
});
