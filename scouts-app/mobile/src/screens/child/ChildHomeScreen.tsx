import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useMembersStore } from '../../store/membersStore';
import { ScoutCardPreview } from '../../components/card_print/ScoutCardPreview';
import { fetchMemberByCodeFromFirestore, findUserOrMemberInFirestore, fetchMemberSubscriptions } from '../../services/firebaseService';
import { Member, SubscriptionRecord } from '../../types';

export const ChildHomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const getMemberByCode = useMembersStore((s) => s.getMemberByCode);
  
  const [member, setMember] = useState<Member | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const identifier = user?.code || user?.email || user?.phone;
        if (identifier) {
          let found = getMemberByCode(identifier);
          if (!found) {
            found = await fetchMemberByCodeFromFirestore(identifier);
          }
          if (!found) {
            found = await findUserOrMemberInFirestore(identifier);
          }

          if (found) {
            const memberObj: Member = {
              id: found.id || 'm_current',
              code: found.code || user?.code || 'JNOOD-MEMBER',
              name: found.name || user?.name || 'عضو الكشافة',
              gender: (found.gender as any) || 'MALE',
              scarfStatus: (found.scarfStatus as any) || 'RECEIVED',
              birthDate: found.birthDate || '2015-01-01',
              gradeLevel: (found.gradeLevel as any) || 'PREP_1',
              squadName: (found.squadName as any) || 'كشاف',
              phone: found.phone || user?.phone || '',
              guardianPhone: found.guardianPhone || user?.guardianPhone || '',
              createdAt: found.createdAt || new Date().toISOString(),
            };
            setMember(memberObj);

            // Load receipts
            const subs = await fetchMemberSubscriptions(memberObj.code);
            setSubscriptions(subs);
          } else {
            // Build temporary preview member from user profile
            setMember({
              id: user?.id || 'user_child',
              code: user?.code || 'JNOOD-MEMBER',
              name: user?.name || 'كشاف جنود المسيح',
              gender: 'MALE',
              scarfStatus: 'RECEIVED',
              birthDate: '2014-01-01',
              gradeLevel: 'PREP_1',
              squadName: 'كشاف',
              guardianPhone: user?.guardianPhone || '',
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn('Error loading child home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const categories = [
    { title: 'الروحانية', icon: '✝️' },
    { title: 'العمل الجماعي', icon: '🤝' },
    { title: 'الأنشطة الكشفية', icon: '⚜️' },
    { title: 'خدمة المجتمع', icon: '❤️' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.topHeaderTitleRow}>
          <Image
            source={require('../../../assets/logo.jpeg')}
            style={styles.topLogoImage}
            resizeMode="contain"
          />
          <Text style={styles.topTitle}>مجموعة جنود المسيح الكشفية</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Curved Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroSubText}>معاً نخدم ونبني</Text>
        <Text style={styles.heroTitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.heroDesc}>
          نُعد مجموعة مبدعة من الشباب القادرين على خدمة المجتمع والوطن بروح المحبة والعطاء الكشفي.
        </Text>

        <View style={styles.heroBtnRow}>
          <TouchableOpacity 
            style={styles.heroPrimaryBtn}
            onPress={() => navigation?.navigate('Curricula')}
          >
            <Text style={styles.heroPrimaryText}>المناهج الكشفية ←</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.heroOutlineBtn}
            onPress={() => navigation?.navigate('ScoutingPlan')}
          >
            <Text style={styles.heroOutlineText}>خطة الأيام 📅</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Category Icons Grid */}
      <View style={styles.categoriesRow}>
        {categories.map((cat, idx) => (
          <TouchableOpacity key={idx} style={styles.categoryCard} activeOpacity={0.8}>
            <View style={styles.iconCircle}>
              <Text style={styles.catIcon}>{cat.icon}</Text>
            </View>
            <Text style={styles.catTitle}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Digital Scouting Card Preview */}
      <Text style={styles.sectionTitle}>بطاقة الكشاف الرقمية والكود</Text>
      {member && (
        <ScoutCardPreview 
          member={member} 
          onPrint={() => navigation?.navigate('Subscriptions')}
        />
      )}

      {/* Official Receipts History in Scout Account */}
      <Text style={styles.sectionTitle}>سجل إيصالات الاشتراكات والرسوم المعتمدة 🧾</Text>
      {subscriptions.length > 0 ? (
        subscriptions.map((sub, idx) => (
          <View key={idx} style={styles.receiptCard}>
            <View style={styles.receiptTopRow}>
              <View style={styles.receiptBadge}>
                <Text style={styles.receiptBadgeText}>تم السداد بنجاح ✅</Text>
              </View>
              <Text style={styles.receiptNum}>رقم الإيصال: {sub.receiptNumber}</Text>
            </View>
            <Text style={styles.receiptMemberName}>{sub.memberName} - فرقة {member?.squadName || 'كشاف'}</Text>
            <Text style={styles.receiptItemsSummary}>
              {sub.annualSub ? '• اشتراك سنوي ' : ''}
              {sub.festivalSub ? '• اشتراك مهرجان ' : ''}
              {sub.wajla ? '• وجلة ' : ''}
              {sub.badges ? '• شارات ' : ''}
              {sub.discountPercentage > 0 ? `(خصم ${sub.discountPercentage}%)` : ''}
            </Text>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptBottomRow}>
              <Text style={styles.receiptTotalPaid}>المبلغ المسدد: {sub.totalPaid || sub.subtotal} ج.م</Text>
              <Text style={styles.receiptDate}>{sub.createdAt ? sub.createdAt.split('T')[0] : '2026-09-22'}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyReceiptsCard}>
          <Text style={styles.emptyReceiptsIcon}>🧾</Text>
          <Text style={styles.emptyReceiptsTitle}>لا توجد إيصالات سداد مسجلة حتى الآن</Text>
          <Text style={styles.emptyReceiptsSub}>سيظهر الإيصال هنا فور اعتماده وسداده لدى مسؤول الخزينة الكشفية.</Text>
        </View>
      )}

      {/* Quick Navigation Buttons */}
      <View style={styles.quickGrid}>
        <TouchableOpacity 
          style={styles.gridCard}
          onPress={() => navigation?.navigate('Attendance')}
        >
          <Text style={styles.gridIcon}>🏁</Text>
          <Text style={styles.gridTitle}>الغياب والـ QR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridCard}
          onPress={() => navigation?.navigate('ChatRooms')}
        >
          <Text style={styles.gridIcon}>💬</Text>
          <Text style={styles.gridTitle}>الشات رومز</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridCard}
          onPress={() => navigation?.navigate('Curricula')}
        >
          <Text style={styles.gridIcon}>📚</Text>
          <Text style={styles.gridTitle}>المناهج والمسابقات</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gridCard}
          onPress={() => navigation?.navigate('Memories')}
        >
          <Text style={styles.gridIcon}>📷</Text>
          <Text style={styles.gridTitle}>خزانة الذكريات</Text>
        </TouchableOpacity>
      </View>

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
  topHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuBtn: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 22,
    color: '#8B0000',
  },
  topHeaderTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  topLogoImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#D4A359',
  },
  topTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  bellBtn: {
    padding: 8,
  },
  bellIcon: {
    fontSize: 20,
  },
  heroBanner: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  heroSubText: {
    color: '#D4A359',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  heroDesc: {
    color: '#F3F4F6',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroBtnRow: {
    flexDirection: 'row-reverse',
  },
  heroPrimaryBtn: {
    backgroundColor: '#D4A359',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginLeft: 10,
  },
  heroPrimaryText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 13,
  },
  heroOutlineBtn: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  heroOutlineText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  categoriesRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  categoryCard: {
    alignItems: 'center',
    width: '23%',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catIcon: {
    fontSize: 22,
  },
  catTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'right',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#D4A359',
    elevation: 2,
  },
  receiptTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  receiptBadgeText: {
    color: '#03543F',
    fontSize: 10,
    fontWeight: 'bold',
  },
  receiptNum: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  receiptMemberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  receiptItemsSummary: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'right',
    marginVertical: 4,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  receiptBottomRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotalPaid: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  receiptDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  emptyReceiptsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyReceiptsIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyReceiptsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  emptyReceiptsSub: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});
