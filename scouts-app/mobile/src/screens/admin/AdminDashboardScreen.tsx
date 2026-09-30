import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { 
  seedInitialFirestoreData, 
  fetchMembersFromFirestore, 
  fetchAllSubscriptionsFromFirestore,
  fetchAttendanceFromFirestore,
  fetchFollowUpsFromFirestore
} from '../../services/firebaseService';
import { useMembersStore } from '../../store/membersStore';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { members, loadMembersFromFirestore } = useMembersStore();
  const [seeding, setSeeding] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [attendancePercent, setAttendancePercent] = useState('0%');
  const [followUpsCount, setFollowUpsCount] = useState(0);
  const [realLogs, setRealLogs] = useState<any[]>([]);

  const loadRealDashboardData = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      await loadMembersFromFirestore();
      
      // 1. Fetch Subscriptions Revenue
      const subs = await fetchAllSubscriptionsFromFirestore();
      const revenueSum = subs.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
      setTotalRevenue(revenueSum);

      // 2. Fetch Today's Attendance
      const todayStr = new Date().toISOString().split('T')[0];
      const attendance = await fetchAttendanceFromFirestore(todayStr);
      if (attendance && attendance.length > 0) {
        const presentCount = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
        const pct = Math.round((presentCount / attendance.length) * 100);
        setAttendancePercent(`${pct}%`);
      } else {
        setAttendancePercent('100%');
      }

      // 3. Fetch Follow-Ups
      const followUps = await fetchFollowUpsFromFirestore();
      setFollowUpsCount(followUps.length);

      // 4. Build Real Activity Log Stream
      const logs: any[] = [];
      followUps.slice(0, 3).forEach((f: any, idx) => {
        logs.push({
          id: `fu_${idx}`,
          name: f.leader || 'القائد المسؤول',
          role: 'خدمة الافتقاد',
          action: `تسجيل افتقاد (${f.visitTypeLabel || 'زيارة'}) - ${f.memberName}`,
          time: f.date || 'اليوم',
        });
      });
      subs.slice(0, 3).forEach((s: any, idx) => {
        logs.push({
          id: `sub_${idx}`,
          name: s.memberName || 'عضو كشفي',
          role: 'سديد اشتراك',
          action: `تحصيل إيصال رقم ${s.receiptNumber || 'REC'} (${s.totalPaid} ج.م)`,
          time: 'تم الاعتماد',
        });
      });
      setRealLogs(logs);

    } catch (e) {
      console.warn('Error fetching live dashboard metrics:', e);
    } finally {
      setLoadingMetrics(false);
    }
  }, [loadMembersFromFirestore]);

  // Load real members and metrics from Firestore on mount
  useEffect(() => {
    loadRealDashboardData();
  }, [loadRealDashboardData]);

  const handleSeedFirestore = useCallback(async () => {
    Alert.alert(
      '🔥 تهيئة فايربيس',
      'سيتم إنشاء جداول البيانات الأساسية (أعضاء، مستخدمين، حضور، اشتراكات) في فايربيس للمرة الأولى. هل أنت متأكد؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تهيئة الآن 🔥',
          style: 'destructive',
          onPress: async () => {
            setSeeding(true);
            const result = await seedInitialFirestoreData();
            setSeeding(false);
            if (result.success) {
              Alert.alert('✅ تم بنجاح', result.message);
              loadRealDashboardData(); // Reload live metrics after seeding
            } else {
              Alert.alert('❌ خطأ', result.message + '\n\nتأكد من تعديل قواعد فايربيس للسماح بالكتابة');
            }
          },
        },
      ]
    );
  }, [loadRealDashboardData]);

  const metrics = [
    { title: 'إجمالي الأعضاء المقيدين', value: `${members.length} عضو`, sub: 'بيانات حقيقية من Firestore', icon: '👨‍👦' },
    { title: 'نسبة الحضور والانضباط', value: attendancePercent, sub: 'حساب لحظي مباشر', icon: '📊' },
    { title: 'إجمالي الإيرادات المحصلة', value: `${totalRevenue.toLocaleString('ar-EG')} ج.م`, sub: 'إيصالات السداد الفعلية', icon: '💰' },
    { title: 'سجلات الافتقاد المسجلة', value: `${followUpsCount} افتقاد`, sub: 'رعاية المخدومين', icon: '🤝' },
  ];

  const adminModules = [
    { title: 'التحضير والـ QR', icon: '📋', route: 'Attendance', color: '#8B0000' },
    { title: 'الاشتراكات والماليات', icon: '💰', route: 'Subscriptions', color: '#1E3A8A' },
    { title: 'سجل الافتقاد والمتابعة', icon: '🤝', route: 'FollowUp', color: '#047857' },
    { title: 'استعارة العهدة والمهمات', icon: '⛺', route: 'InventoryRequest', color: '#B45309' },
    { title: 'حجز قاعات الكنيسة', icon: '🏛️', route: 'RoomReservation', color: '#6D28D9' },
    { title: 'المناهج والمسابقات', icon: '📚', route: 'Curricula', color: '#BE185D' },
    { title: 'أرشيف الذكريات', icon: '📸', route: 'Memories', color: '#0F766E' },
    { title: 'غرف التواصل والشات', icon: '💬', route: 'ChatRooms', color: '#1D4ED8' },
    { title: 'الخطة السنوية والجدول', icon: '📅', route: 'ScoutingPlan', color: '#374151' },
    { title: 'استمارة عضو جديد', icon: '➕', route: 'Register', color: '#991B1B' },
  ];

  const activityLog = [
    { id: '1', name: 'الخادم مينا نبيل', role: 'رئيس قطاع', action: 'تسجيل غياب يوم كشفي (85 فرد)', time: 'منذ 10 دقائق', ip: '192.168.1.15' },
    { id: '2', name: 'أمين الخزينة جورج سامي', role: 'مسؤول ماليات', action: 'تحصيل إيصال REC-2026-001 (549 ج.م)', time: 'منذ 25 دقيقة', ip: '192.168.1.42' },
    { id: '3', name: 'الخادم بيتر يوسف', role: 'قائد سرية', action: 'تسجيل افتقاد طفل (زيارة منزلية)', time: 'منذ ساعة', ip: '192.168.1.88' },
    { id: '4', name: 'مدير الخدمة أستاذ جورج', role: 'Admin', action: 'تعديل جدول الأسعار (اشتراك سنوي)', time: 'منذ ساعتين', ip: '192.168.1.100' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 80 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLogoCircle}>
            <Image
              source={require('../../../assets/logo.jpeg')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>لوحة القيادة الإدارية وسجل النشاط المركزي 🛡️</Text>
          <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية - الإدارة العامة</Text>
        </View>

        {/* Firebase Initialize Button — Admin Only */}
        <TouchableOpacity
          style={[styles.seedBtn, seeding && styles.seedBtnDisabled]}
          onPress={handleSeedFirestore}
          activeOpacity={0.8}
          disabled={seeding}
        >
          <Text style={styles.seedBtnText}>
            {seeding ? '⏳ جاري تهيئة قاعدة البيانات...' : '🔥 تهيئة وزرع بيانات فايربيس (أول مرة فقط)'}
          </Text>
          <Text style={styles.seedBtnSub}>ينشئ جداول: أعضاء · مستخدمين · حضور · اشتراكات</Text>
        </TouchableOpacity>

        {/* KPI Metrics Row */}
        <Text style={styles.sectionTitle}>مؤشرات الأداء العامة</Text>

        <View style={styles.metricsGrid}>
          {metrics.map((m, idx) => (
            <View key={idx} style={styles.metricCard}>
              <Text style={styles.metricIcon}>{m.icon}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricTitle}>{m.title}</Text>
              <Text style={styles.metricSub}>{m.sub}</Text>
            </View>
          ))}
        </View>

        {/* Quick Access Modules Grid */}
        <Text style={styles.sectionTitle}>أقسام ووحدات المنظومة الكشفية (10 أقسام)</Text>
        <View style={styles.modulesGrid}>
          {adminModules.map((mod, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.moduleCard, { borderColor: mod.color }]}
              activeOpacity={0.8}
              onPress={() => navigation?.navigate(mod.route)}
            >
              <View style={[styles.moduleIconCircle, { backgroundColor: mod.color }]}>
                <Text style={styles.moduleIcon}>{mod.icon}</Text>
              </View>
              <Text style={styles.moduleTitle}>{mod.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity Log Section */}
        <Text style={styles.sectionTitle}>سجل الأنشطة والمتابعة اللحظية المباشرة (Firestore Stream)</Text>
        <View style={styles.logCard}>
          {realLogs.length > 0 ? (
            realLogs.map((item) => (
              <View key={item.id} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logName}>{item.name} ({item.role})</Text>
                  <Text style={styles.logTime}>{item.time}</Text>
                </View>
                <Text style={styles.logAction}>⚡ {item.action}</Text>
              </View>
            ))
          ) : (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>لا توجد حركات حديثة مسجلة بعد في السجل المركزي</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNavBar navigation={navigation} currentRoute="AdminDashboard" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  seedBtn: {
    backgroundColor: '#7F1D1D',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#991B1B',
    alignItems: 'center',
  },
  seedBtnDisabled: {
    opacity: 0.6,
    backgroundColor: '#B45309',
  },
  seedBtnText: {
    color: '#FEF2F2',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  seedBtnSub: {
    color: '#FCA5A5',
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
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
    marginBottom: 16,
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
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSub: {
    color: '#D4A359',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 14,
    marginBottom: 10,
    textAlign: 'right',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EADBC8',
    alignItems: 'center',
    elevation: 1,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  moduleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 2,
  },
  moduleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  moduleIcon: {
    fontSize: 22,
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 10,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  logAction: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: '600',
    marginVertical: 4,
    textAlign: 'right',
  },
  logIp: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
  },
});
