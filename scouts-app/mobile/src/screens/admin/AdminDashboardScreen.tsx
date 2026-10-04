import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ActivityIndicator, 
  TextInput, 
  Modal 
} from 'react-native';
import { 
  seedInitialFirestoreData, 
  fetchMembersFromFirestore, 
  fetchAllSubscriptionsFromFirestore,
  fetchAttendanceFromFirestore,
  fetchFollowUpsFromFirestore,
  savePartyEventToFirestore
} from '../../services/firebaseService';
import { useMembersStore } from '../../store/membersStore';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';
import { Member } from '../../types';

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { members, loadMembersFromFirestore } = useMembersStore();
  const [seeding, setSeeding] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Financial Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueBreakdown, setRevenueBreakdown] = useState({
    annual: 0,
    festival: 0,
    wajla: 0,
    badges: 0,
  });
  const [expenses, setExpenses] = useState(0); // Real operational expenses
  const [receiptsCount, setReceiptsCount] = useState(0);

  // Attendance Metrics
  const [attendancePercent, setAttendancePercent] = useState('0%');
  const [todayPresentCount, setTodayPresentCount] = useState(0);

  // Follow-Up Metrics
  const [followUpsCount, setFollowUpsCount] = useState(0);

  // Activity Stream & Member Roster State
  const [realLogs, setRealLogs] = useState<any[]>([]);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [selectedRosterSquad, setSelectedRosterSquad] = useState('ALL');

  // Party & Event Creation Modal State
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyTitle, setPartyTitle] = useState('');
  const [partyDate, setPartyDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyTime, setPartyTime] = useState('06:00 مساءً');
  const [partyLocation, setPartyLocation] = useState('مسرح الكنيسة الكبير');
  const [partyAudience, setPartyAudience] = useState('جميع الكشافة وأولياء الأمور');
  const [partyDesc, setPartyDesc] = useState('');
  const [savingParty, setSavingParty] = useState(false);

  const handleAddPartyEvent = async () => {
    if (!partyTitle.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم الحفلة أو المناسبة');
      return;
    }

    setSavingParty(true);
    try {
      const res = await savePartyEventToFirestore({
        title: partyTitle.trim(),
        eventDate: partyDate.trim(),
        eventTime: partyTime.trim(),
        location: partyLocation.trim(),
        targetAudience: partyAudience.trim(),
        description: partyDesc.trim() || 'حفلة ومناسبة كشفية للمجموعة.',
      });

      setSavingParty(false);
      if (res.success) {
        setShowPartyModal(false);
        setPartyTitle('');
        setPartyDesc('');
        Alert.alert('تم بنجاح 🎉', res.message);
      } else {
        Alert.alert('خطأ', res.message);
      }
    } catch (e: any) {
      setSavingParty(false);
      Alert.alert('خطأ', e.message);
    }
  };

  const loadRealDashboardData = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      await loadMembersFromFirestore();

      // 1. Fetch Subscriptions & Financial Breakdown
      const subs = await fetchAllSubscriptionsFromFirestore();
      let total = 0;
      let ann = 0;
      let fest = 0;
      let waj = 0;
      let bdg = 0;

      subs.forEach((s: any) => {
        const paid = s.totalPaid || s.subtotal || 0;
        total += paid;
        if (s.annualSub) ann += 150;
        if (s.festivalSub) fest += 100;
        if (s.wajla) waj += 60;
        if (s.badges) bdg += 40;
      });

      setTotalRevenue(total);
      setReceiptsCount(subs.length);
      setRevenueBreakdown({ annual: ann, festival: fest, wajla: waj, badges: bdg });

      // 2. Fetch Today's Attendance
      const todayStr = new Date().toISOString().split('T')[0];
      const attendance = await fetchAttendanceFromFirestore(todayStr);
      if (attendance && attendance.length > 0) {
        const presentCount = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
        setTodayPresentCount(presentCount);
        const pct = Math.round((presentCount / attendance.length) * 100);
        setAttendancePercent(`${pct}%`);
      } else {
        setAttendancePercent('100%');
        setTodayPresentCount(members.length);
      }

      // 3. Fetch Follow-Ups
      const followUps = await fetchFollowUpsFromFirestore();
      setFollowUpsCount(followUps.length);

      // 4. Build Real Activity Log Stream ("مين دخل ومين خرج وسجلات النشاط")
      const logs: any[] = [];
      followUps.slice(0, 4).forEach((f: any, idx) => {
        logs.push({
          id: `fu_${idx}`,
          name: f.leader || 'القائد المسؤول',
          role: 'خدمة الافتقاد',
          action: `تسجيل افتقاد (${f.visitTypeLabel || 'زيارة'}) للكشاف: ${f.memberName}`,
          time: f.date || 'اليوم',
          icon: '🤝',
        });
      });
      subs.slice(0, 4).forEach((s: any, idx) => {
        logs.push({
          id: `sub_${idx}`,
          name: s.memberName || 'عضو كشفي',
          role: 'سداد اشتراك',
          action: `إصدار إيصال رقم ${s.receiptNumber || 'REC'} بالمبلغ (${s.totalPaid} ج.م)`,
          time: 'تم التحصيل',
          icon: '💰',
        });
      });
      setRealLogs(logs);
    } catch (e) {
      console.warn('Error fetching live dashboard metrics:', e);
    } finally {
      setLoadingMetrics(false);
    }
  }, [loadMembersFromFirestore, members.length]);

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
              loadRealDashboardData();
            } else {
              Alert.alert('❌ خطأ', result.message + '\n\nتأكد من تعديل قواعد فايربيس للسماح بالكتابة');
            }
          },
        },
      ]
    );
  }, [loadRealDashboardData]);

  const adminModules = [
    { title: 'مواعيد الحفلات والتنبيهات 🎭', subtitle: 'إضافة الحفلات والمناسبات وإرسال إشعارات فورية وتذكيرات تلقائية', icon: '🥳', action: () => setShowPartyModal(true), color: '#DC2626' },
    { title: 'سجل التحضير والـ QR', subtitle: 'متابعة حضور وانضباط كافة الفرق والقطاعات', icon: '📋', route: 'Attendance', color: '#8B0000' },
    { title: 'الخزينة والاشتراكات', subtitle: 'إصدار الإيصالات ومراجعة الدفعات والخصومات', icon: '💰', route: 'Subscriptions', color: '#1E3A8A' },
    { title: 'الافتقاد والرعاية الأسرية', subtitle: 'تقارير افتقاد المخدومين والزيارات المنزلية', icon: '🤝', route: 'FollowUp', color: '#047857' },
    { title: 'دليل الأعضاء والمستخدمين', subtitle: 'سجل المقيدين ("مين دخل ومين خرج" والبيانات)', icon: '👥', action: () => setShowRosterModal(true), color: '#7C3AED' },
    { title: 'استعارة العهدة والمهمات', subtitle: 'إدارة وتتبع استعارة الخيام والمعدات الكشفية', icon: '⛺', route: 'InventoryRequest', color: '#B45309' },
    { title: 'حجز قاعات المبنى', subtitle: 'جدول مواعيد بروفات واجتماعات قاعات الكنيسة', icon: '🏛️', route: 'RoomReservation', color: '#6D28D9' },
    { title: 'المناهج والمسابقات', subtitle: 'مناهج المهرجان والأنشطة الروحية والتثقيفية', icon: '📚', route: 'Curricula', color: '#BE185D' },
    { title: 'أرشيف الذكريات والمعسكرات', subtitle: 'معرض الصور والميديا التوثيقية للفوج الكشفي', icon: '📸', route: 'Memories', color: '#0F766E' },
    { title: 'غرف التواصل والشات', subtitle: 'دردشة وتواصل القادة وأولياء الأمور والكشافة', icon: '💬', route: 'ChatRooms', color: '#1D4ED8' },
    { title: 'الخطة الكشفية السنوية', subtitle: 'جدول التواريخ والمعسكرات الصيفية والشتوية', icon: '📅', route: 'ScoutingPlan', color: '#374151' },
    { title: 'استمارة عضو/خادم جديد', subtitle: 'تسجيل قيد عضو جديد أو قائد بالمنظومة', icon: '➕', route: 'Register', color: '#991B1B' },
    { title: 'بوابة الزوار والأنشطة العامة', subtitle: 'استعراض صفحة الكشافة العامة للزوار', icon: '🌐', route: 'PublicHome', color: '#D4A359' },
  ];

  const filteredRoster = useMemo(() => {
    return members.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(rosterSearch.toLowerCase()) || m.code.toLowerCase().includes(rosterSearch.toLowerCase());
      const matchSquad = selectedRosterSquad === 'ALL' || m.squadName === selectedRosterSquad;
      return matchSearch && matchSquad;
    });
  }, [members, rosterSearch, selectedRosterSquad]);

  const netBalance = totalRevenue - expenses;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 90 }]}>
        {/* Header Banner */}
        <View style={styles.header}>
          <View style={styles.headerLogoCircle}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>قائمة التحكم المركزية والإدارة العامة 🛡️</Text>
          <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية - الشامل لكل خدمات التطبيق</Text>

          {/* Quick Stat Bar */}
          <View style={styles.headerQuickStats}>
            <View style={styles.statChip}>
              <Text style={styles.statChipVal}>{members.length}</Text>
              <Text style={styles.statChipLbl}>أعضاء مقيدين</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipVal}>{attendancePercent}</Text>
              <Text style={styles.statChipLbl}>نسبة انضباط اليوم</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipVal}>{totalRevenue.toLocaleString('ar-EG')} ج.م</Text>
              <Text style={styles.statChipLbl}>إيرادات الخزينة</Text>
            </View>
          </View>
        </View>

        {/* Database Initialization Action Banner */}
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

        {/* ─── FINANCIAL DETAILED OVERVIEW ───────────────────────────────────────── */}
        <View style={styles.financialCard}>
          <View style={styles.finHeaderRow}>
            <TouchableOpacity style={styles.finDetailsBtn} onPress={() => navigation?.navigate('Subscriptions')}>
              <Text style={styles.finDetailsBtnText}>عرض الخزينة التفصيلية ←</Text>
            </TouchableOpacity>
            <Text style={styles.cardTitleText}>💰 تقرير الخزينة والماليات والمصروفات</Text>
          </View>

          <View style={styles.finMetricsGrid}>
            <View style={[styles.finBox, { backgroundColor: '#DEF7EC', borderColor: '#03543F' }]}>
              <Text style={[styles.finVal, { color: '#03543F' }]}>{totalRevenue.toLocaleString('ar-EG')} ج.م</Text>
              <Text style={[styles.finLbl, { color: '#03543F' }]}>إجمالي المتحصلات ({receiptsCount} إيصال)</Text>
            </View>

            <View style={[styles.finBox, { backgroundColor: '#FDE8E8', borderColor: '#991B1B' }]}>
              <Text style={[styles.finVal, { color: '#991B1B' }]}>{expenses.toLocaleString('ar-EG')} ج.م</Text>
              <Text style={[styles.finLbl, { color: '#991B1B' }]}>المصروفات والتجهيزات الكشفية</Text>
            </View>

            <View style={[styles.finBox, { backgroundColor: '#FEF3C7', borderColor: '#92400E', width: '100%', marginTop: 8 }]}>
              <Text style={[styles.finVal, { color: '#92400E', fontSize: 20 }]}>{netBalance.toLocaleString('ar-EG')} ج.م</Text>
              <Text style={[styles.finLbl, { color: '#92400E' }]}>صافي الرصيد المالي المتبقي في الخزينة الكشفية 🔑</Text>
            </View>
          </View>

          {/* Item Breakdown Summary */}
          <Text style={styles.finBreakdownHeading}>تفاصيل الإيرادات حسب بنود الخدمة:</Text>
          <View style={styles.finBreakdownRow}>
            <View style={styles.breakItem}>
              <Text style={styles.breakItemVal}>{revenueBreakdown.annual.toLocaleString('ar-EG')} ج.م</Text>
              <Text style={styles.breakItemLbl}>اشتراك سنوي 📜</Text>
            </View>
            <View style={styles.breakItem}>
              <Text style={styles.breakItemVal}>{revenueBreakdown.festival.toLocaleString('ar-EG')} ج.م</Text>
              <Text style={styles.breakItemLbl}>مهرجان الكرازة ⛺</Text>
            </View>
            <View style={styles.breakItem}>
              <Text style={styles.breakItemVal}>{revenueBreakdown.wajla.toLocaleString('ar-EG')} ج.م</Text>
              <Text style={styles.breakItemLbl}>وجلات خشبية 🧣</Text>
            </View>
            <View style={styles.breakItem}>
              <Text style={styles.breakItemVal}>{revenueBreakdown.badges.toLocaleString('ar-EG')} ج.م</Text>
              <Text style={styles.breakItemLbl}>شارات وترقيات 🏅</Text>
            </View>
          </View>
        </View>

        {/* ─── MASTER MENU & MODULES GRID ────────────────────────────────────────── */}
        <Text style={styles.sectionHeaderTitle}>قائمة التحكم الشاملة لجميع أقسام المنظومة (12 قسماً)</Text>
        
        <View style={styles.masterMenuGrid}>
          {adminModules.map((mod, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.masterMenuCard}
              activeOpacity={0.85}
              onPress={() => {
                if (mod.action) mod.action();
                else if (mod.route) navigation?.navigate(mod.route);
              }}
            >
              <View style={styles.masterMenuTop}>
                <View style={[styles.masterIconCircle, { backgroundColor: mod.color }]}>
                  <Text style={styles.masterIcon}>{mod.icon}</Text>
                </View>
                <Text style={styles.masterCardTitle}>{mod.title}</Text>
              </View>
              <Text style={styles.masterCardSub}>{mod.subtitle}</Text>
              <View style={styles.masterCardArrowRow}>
                <Text style={[styles.masterCardArrow, { color: mod.color }]}>دخول القسم ➔</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── LIVE ACTIVITY & LOG STREAM ("مين دخل ومين خرج") ────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <TouchableOpacity onPress={() => setShowRosterModal(true)}>
            <Text style={styles.seeRosterLink}>دليل المستخدمين كامل ("مين دخل") ←</Text>
          </TouchableOpacity>
          <Text style={styles.sectionHeaderTitle}>سجل الأنشطة والحركات اللحظية المباشرة</Text>
        </View>

        <View style={styles.logCard}>
          {loadingMetrics ? (
            <ActivityIndicator color="#8B0000" style={{ padding: 20 }} />
          ) : realLogs.length > 0 ? (
            realLogs.map((item) => (
              <View key={item.id} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logName}>{item.icon} {item.name} ({item.role})</Text>
                  <Text style={styles.logTime}>{item.time}</Text>
                </View>
                <Text style={styles.logAction}>{item.action}</Text>
              </View>
            ))
          ) : (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>لا توجد حركات حديثة مسجلة بعد في السجل المركزي</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ─── MEMBER ROSTER MODAL ("دليل الأعضاء والمستخدمين المسجلين") ────────────── */}
      <Modal visible={showRosterModal} transparent animationType="slide" onRequestClose={() => setShowRosterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.rosterModalBox}>
            <View style={styles.rosterModalHeader}>
              <TouchableOpacity style={styles.rosterCloseBtn} onPress={() => setShowRosterModal(false)}>
                <Text style={styles.rosterCloseText}>إغلاق ✖</Text>
              </TouchableOpacity>
              <Text style={styles.rosterModalTitle}>دليل الأعضاء والمستخدمين ({members.length}) 👥</Text>
            </View>
            <Text style={styles.rosterModalSub}>سجل المقيدين والمستخدمين الجدد والخدام ("مين دخل ومين خرج")</Text>

            <TextInput
              style={styles.rosterSearchInput}
              placeholder="🔍 ابحث بالاسم أو كود الكشاف أو رقم الهاتف..."
              placeholderTextColor="#888"
              value={rosterSearch}
              onChangeText={setRosterSearch}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.squadPillsScroll}>
              {['ALL', 'براعم', 'أشبال', 'زهرات', 'كشاف', 'مرشدات', 'متقدم', 'رائدات', 'جوالة', 'قادة'].map((sq) => (
                <TouchableOpacity
                  key={sq}
                  style={[styles.squadPill, selectedRosterSquad === sq && styles.squadPillActive]}
                  onPress={() => setSelectedRosterSquad(sq)}
                >
                  <Text style={[styles.squadPillText, selectedRosterSquad === sq && styles.squadPillTextActive]}>
                    {sq === 'ALL' ? 'الكل' : sq}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.rosterListScroll}>
              {filteredRoster.length > 0 ? (
                filteredRoster.map((m) => (
                  <View key={m.id} style={styles.rosterMemberItem}>
                    <View style={styles.rosterMemberInfo}>
                      <Text style={styles.rosterMemberName}>{m.name}</Text>
                      <View style={styles.rosterMemberSubRow}>
                        <Text style={styles.rosterCodeBadge}>{m.code}</Text>
                        <Text style={styles.rosterSquadBadge}>فرقة {m.squadName}</Text>
                        <Text style={styles.rosterPhoneText}>📱 {m.phone || m.guardianPhone || 'لا يوجد هاتف'}</Text>
                      </View>
                    </View>
                    <View style={styles.rosterDateBadge}>
                      <Text style={styles.rosterDateText}>تاريخ القيد:</Text>
                      <Text style={styles.rosterDateVal}>{m.createdAt ? m.createdAt.split('T')[0] : 'مسجل'}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyRosterText}>لا يوجد أعضاء مطابقون للبحث</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── PARTY & EVENT CREATION MODAL ────────────────────────────────────────── */}
      <Modal visible={showPartyModal} transparent animationType="slide" onRequestClose={() => setShowPartyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.rosterModalBox}>
            <View style={styles.rosterModalHeader}>
              <TouchableOpacity style={styles.rosterCloseBtn} onPress={() => setShowPartyModal(false)}>
                <Text style={styles.rosterCloseText}>إغلاق ✖</Text>
              </TouchableOpacity>
              <Text style={styles.rosterModalTitle}>🎭 إضافة حفلة ومناسبة كشفية جديدة</Text>
            </View>
            <Text style={styles.rosterModalSub}>إرسال إشعارات وتنبيهات فورية لجميع المستخدمين وتذكيرات قبلها بيوم وفي نفس اليوم</Text>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.finBreakdownHeading}>اسم الحفلة / المناسبة *</Text>
              <TextInput
                style={styles.rosterSearchInput}
                placeholder="مثال: حفل أداء الوعد وتسليم المناديل أو حفل ختام الأنشطة"
                placeholderTextColor="#888"
                value={partyTitle}
                onChangeText={setPartyTitle}
              />

              <Text style={styles.finBreakdownHeading}>تاريخ الحفلة (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.rosterSearchInput}
                placeholder="YYYY-MM-DD (مثال: 2026-10-15)"
                placeholderTextColor="#888"
                value={partyDate}
                onChangeText={setPartyDate}
              />

              <Text style={styles.finBreakdownHeading}>وقت وتوقيت الحفلة *</Text>
              <TextInput
                style={styles.rosterSearchInput}
                placeholder="مثال: 06:00 مساءً"
                placeholderTextColor="#888"
                value={partyTime}
                onChangeText={setPartyTime}
              />

              <Text style={styles.finBreakdownHeading}>المكان *</Text>
              <TextInput
                style={styles.rosterSearchInput}
                placeholder="مثال: مسرح الكنيسة الكبير / ساحة الكشافة"
                placeholderTextColor="#888"
                value={partyLocation}
                onChangeText={setPartyLocation}
              />

              <Text style={styles.finBreakdownHeading}>الفئة المستهدفة *</Text>
              <TextInput
                style={styles.rosterSearchInput}
                placeholder="مثال: جميع الكشافة وأولياء الأمور"
                placeholderTextColor="#888"
                value={partyAudience}
                onChangeText={setPartyAudience}
              />

              <Text style={styles.finBreakdownHeading}>وصف وتفاصيل الحفلة</Text>
              <TextInput
                style={[styles.rosterSearchInput, { height: 75, textAlignVertical: 'top' }]}
                placeholder="اكتب برنامج وتفاصيل الحفلة الكشفية..."
                placeholderTextColor="#888"
                value={partyDesc}
                onChangeText={setPartyDesc}
                multiline
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.seedBtn, { backgroundColor: '#8B0000', borderColor: '#8B0000', marginTop: 12 }, savingParty && { opacity: 0.6 }]}
              onPress={handleAddPartyEvent}
              disabled={savingParty}
            >
              <Text style={styles.seedBtnText}>
                {savingParty ? '⏳ جاري الحفظ وإرسال الإشعارات...' : '🚀 نشر الحفلة وإرسال الإشعار الفوري'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} currentRoute="AdminDashboard" />
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
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 4,
  },
  headerLogoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSub: {
    color: '#D4A359',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  headerQuickStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  statChip: {
    alignItems: 'center',
    flex: 1,
  },
  statChipVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statChipLbl: {
    color: '#F3F4F6',
    fontSize: 10,
    marginTop: 2,
  },
  seedBtn: {
    backgroundColor: '#7F1D1D',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#991B1B',
    alignItems: 'center',
  },
  seedBtnDisabled: {
    opacity: 0.6,
  },
  seedBtnText: {
    color: '#FEF2F2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seedBtnSub: {
    color: '#FCA5A5',
    fontSize: 10,
    marginTop: 2,
  },
  financialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#D4A359',
    elevation: 2,
  },
  finHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  finDetailsBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  finDetailsBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  finMetricsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  finBox: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 8,
  },
  finVal: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  finLbl: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  finBreakdownHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
    marginBottom: 8,
  },
  finBreakdownRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  breakItem: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  breakItemVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  breakItemLbl: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'right',
  },
  masterMenuGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  masterMenuCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#EADBC8',
    elevation: 2,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  masterMenuTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 6,
  },
  masterIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  masterIcon: {
    fontSize: 18,
  },
  masterCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  masterCardSub: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 14,
    textAlign: 'right',
    marginBottom: 8,
  },
  masterCardArrowRow: {
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 6,
  },
  masterCardArrow: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeRosterLink: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D4A359',
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
    paddingVertical: 8,
  },
  logHeader: {
    flexDirection: 'row-reverse',
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
    fontSize: 11,
    color: '#8B0000',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },

  // Modal Roster Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  rosterModalBox: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
  },
  rosterModalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rosterModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  rosterCloseBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rosterCloseText: {
    color: '#8B0000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rosterModalSub: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 2,
    marginBottom: 12,
  },
  rosterSearchInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 10,
  },
  squadPillsScroll: {
    flexDirection: 'row-reverse',
    marginBottom: 12,
  },
  squadPill: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginLeft: 6,
  },
  squadPillActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  squadPillText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  squadPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rosterListScroll: {
    maxHeight: 380,
  },
  rosterMemberItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rosterMemberInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rosterMemberName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  rosterMemberSubRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  rosterCodeBadge: {
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rosterSquadBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rosterPhoneText: {
    fontSize: 10,
    color: '#6B7280',
  },
  rosterDateBadge: {
    alignItems: 'center',
    marginLeft: 10,
  },
  rosterDateText: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  rosterDateVal: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  emptyRosterText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    paddingVertical: 20,
  },
});
