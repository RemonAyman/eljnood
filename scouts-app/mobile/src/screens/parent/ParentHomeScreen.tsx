import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useMembersStore } from '../../store/membersStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { ScoutCardPreview } from '../../components/card_print/ScoutCardPreview';
import { fetchMemberByCodeFromFirestore, findUserOrMemberInFirestore, fetchMemberSubscriptions } from '../../services/firebaseService';
import { Member, SubscriptionRecord } from '../../types';

export const ParentHomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const getMemberAttendanceRate = useAttendanceStore((s) => s.getMemberAttendanceRate);

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [searchSonCode, setSearchSonCode] = useState('');
  const [linking, setLinking] = useState(false);

  const loadChildData = async (codeOrPhone: string) => {
    if (!codeOrPhone) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let found = await fetchMemberByCodeFromFirestore(codeOrPhone);
      if (!found) {
        const userOrMem = await findUserOrMemberInFirestore(codeOrPhone);
        if (userOrMem) {
          found = userOrMem;
        }
      }

      if (found) {
        setMember(found);
        const subs = await fetchMemberSubscriptions(found.code);
        setSubscriptions(subs);
      }
    } catch (e) {
      console.warn('Error loading child data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const target = user?.sonCode || user?.code || user?.phone || '';
    if (target) {
      loadChildData(target);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLinkSon = async () => {
    if (!searchSonCode.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال كود الكشاف أو رقم الهاتف');
      return;
    }
    setLinking(true);
    await loadChildData(searchSonCode.trim());
    setLinking(false);
  };

  const attendanceRate = member ? getMemberAttendanceRate(member.id) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة متابعة أولياء الأمور 👨‍👩‍👧</Text>
        <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية - متابعة دقيقة ومباشرة</Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>جاري جلب بيانات الكشاف من قاعدة البيانات...</Text>
        </View>
      ) : !member ? (
        <View style={styles.linkCard}>
          <Text style={styles.linkCardTitle}>ربط حساب الكشاف (الابن / الابنة) 🔗</Text>
          <Text style={styles.linkCardDesc}>
            أدخل الكود الكشفي للابن (مثال: JNOOD-001) أو رقم هاتف ولي الأمر للبحث وعرض بطاقة الكشاف وتقارير الحضور والماليات:
          </Text>
          <TextInput
            style={styles.linkInput}
            placeholder="أدخل كود الكشاف أو رقم الهاتف..."
            placeholderTextColor="#888"
            value={searchSonCode}
            onChangeText={setSearchSonCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            style={styles.linkBtn}
            onPress={handleLinkSon}
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
          {/* Child Scout ID Preview */}
          <Text style={styles.sectionTitle}>بطاقة الكشاف والفرقة الحالية</Text>
          <ScoutCardPreview member={member} />

          {/* Attendance Gauge Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>مؤشر الانضباط والحضور</Text>
            <View style={styles.gaugeRow}>
              <View style={styles.rateCircle}>
                <Text style={styles.rateText}>{attendanceRate}%</Text>
                <Text style={styles.rateSub}>
                  {attendanceRate >= 85 ? 'ممتاز' : attendanceRate >= 65 ? 'جيد جداً' : 'يحتاج متابعة'}
                </Text>
              </View>
              <View style={styles.gaugeDetails}>
                <Text style={styles.gaugeDesc}>
                  موزعة على الأيام الكشفية والمعسكرات واجتماعات درس الكتاب والتسبحة.
                </Text>
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>فرقة: {member.squadName}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>الكود: {member.code}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Financial Status Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>موقف الاشتراكات والماليات (2026)</Text>
            {subscriptions.length > 0 ? (
              subscriptions.map((sub, idx) => (
                <View key={idx} style={{ marginBottom: 10 }}>
                  <View style={styles.finRow}>
                    <Text style={styles.finLabel}>إيصال رقم: {sub.receiptNumber}</Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidText}>✓ مُسدد بالكامل</Text>
                    </View>
                  </View>
                  <Text style={styles.finDetails}>المبلغ: {sub.totalPaid || sub.subtotal} ج.م | المسدد: {sub.memberName}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptySubBox}>
                <Text style={styles.emptySubText}>لا توجد إيصالات سداد مسجلة حتى الآن لهذا الحساب.</Text>
              </View>
            )}
          </View>

          {/* Quick Chat with Leaders */}
          <TouchableOpacity 
            style={styles.contactBtn} 
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('ChatRooms')}
          >
            <Text style={styles.contactBtnText}>💬 التواصل المباشر وغرف المحادثة</Text>
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'right',
    lineHeight: 20,
    marginBottom: 16,
  },
  linkInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'right',
    color: '#1F2937',
    marginBottom: 12,
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
});
