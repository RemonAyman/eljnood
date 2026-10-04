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
import { useAuthStore } from '../../store/authStore';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';
import { fetchCurriculaFromFirestore } from '../../services/firebaseService';

interface CurriculumItem {
  id: string;
  squadKey: string;
  category: 'SPIRITUAL' | 'SCOUTING' | 'PSYCHO_EDU' | 'FRUIT' | 'SEMINARS';
  categoryTitle: string;
  title: string;
  description: string;
  fileType: 'PDF' | 'VIDEO' | 'AUDIO' | 'IMAGE';
  downloadSize: string;
  points: number;
}

const SQUAD_TABS = [
  { id: 'BARAEM', title: 'مرحلة البراعم', icon: '🌱', subtitle: 'روضة أطفال' },
  { id: 'ASHBAL', title: 'الأشبال والزهرات', icon: '🐺', subtitle: 'ابتدائي' },
  { id: 'KASHOOF', title: 'الكشاف والمرشدات', icon: '⛺', subtitle: 'إعدادي' },
  { id: 'MOTAQADEM', title: 'المتقدم والرائدات', icon: '🔥', subtitle: 'ثانوي' },
  { id: 'JOWALAH', title: 'الجوالة والخدمة', icon: '🧭', subtitle: 'جامعي وخريجين' },
];

const CURRICULUM_DATA: CurriculumItem[] = [
  {
    id: 'c1',
    squadKey: 'BARAEM',
    category: 'SPIRITUAL',
    categoryTitle: 'روحي (الكتاب المقدس والقديسين)',
    title: 'قصص الأنبياء والآباء للبراعم',
    description: 'إصحاح يومي وتأملات مصورة ومبسطة للأطفال.',
    fileType: 'PDF',
    downloadSize: '4.2 MB',
    points: 15,
  },
  {
    id: 'c2',
    squadKey: 'BARAEM',
    category: 'FRUIT',
    categoryTitle: 'ثمر (تطبيق روحي)',
    title: 'ترنيمة وثمر الروح القدس (المحبة والفرح)',
    description: 'تسجيل صوتي تعليمي للبراعم مع كلمات الترانيم.',
    fileType: 'AUDIO',
    downloadSize: '8.5 MB',
    points: 10,
  },
  {
    id: 'c3',
    squadKey: 'ASHBAL',
    category: 'SCOUTING',
    categoryTitle: 'كشفي (عقد وريادة)',
    title: 'دليل العقد والربطات الكشفية للمبتدئين',
    description: 'فيديو شرح عملي للعقدة المربعة والوتدية والتقصيرية.',
    fileType: 'VIDEO',
    downloadSize: '24 MB',
    points: 25,
  },
  {
    id: 'c4',
    squadKey: 'ASHBAL',
    category: 'PSYCHO_EDU',
    categoryTitle: 'نفسي تربوي',
    title: 'بناء الشخصية وتطوير المهارات للأشبال',
    description: 'مخططات ورسومات توضيحية للعمل الجماعي والانضباط.',
    fileType: 'IMAGE',
    downloadSize: '3.1 MB',
    points: 20,
  },
  {
    id: 'c5',
    squadKey: 'KASHOOF',
    category: 'SEMINARS',
    categoryTitle: 'ندوات وتوعية',
    title: 'ندوة التوعية بالمخاطر والتفكير النقدي',
    description: 'ملف PDF شامل لندوة التوعية والقيادة الكشفية.',
    fileType: 'PDF',
    downloadSize: '5.8 MB',
    points: 30,
  },
  {
    id: 'c6',
    squadKey: 'KASHOOF',
    category: 'SPIRITUAL',
    categoryTitle: 'روحي (درس الكتاب والتأملات)',
    title: 'تأملات وفيديوهات الإصحاح اليومي',
    description: 'فيديو وصوتيات شرح وتأملات سفر أفسس والإصحاحات اليومية.',
    fileType: 'VIDEO',
    downloadSize: '45 MB',
    points: 35,
  },
  {
    id: 'c7',
    squadKey: 'MOTAQADEM',
    category: 'SCOUTING',
    categoryTitle: 'كشفي (ملاحة وتخيم)',
    title: 'استخدام البوصلة والخرائط الطبوغرافية',
    description: 'مخطط صور وإنفوجرافيك لتقدير المسافات والاتجاهات.',
    fileType: 'IMAGE',
    downloadSize: '4.3 MB',
    points: 40,
  },
  {
    id: 'c8',
    squadKey: 'JOWALAH',
    category: 'SEMINARS',
    categoryTitle: 'ندوات قيادية',
    title: 'حقيبة الندوات القيادية والإدارة الكنسية',
    description: 'دليل كامل للمحاضرات والندوات الخاصة بالقادة والإداريين.',
    fileType: 'PDF',
    downloadSize: '12 MB',
    points: 50,
  },
];

const LEADERBOARD = [
  { rank: '🥇', name: 'مارك بيتر موريس', squad: 'كشاف', points: 340, badge: 'كشاف متألق' },
  { rank: '🥈', name: 'مريم هاني كمال', squad: 'مرشدات', points: 315, badge: 'شارة القيادة' },
  { rank: '🥉', name: 'كيرلس عماد', squad: 'أشبال', points: 290, badge: 'بطل العقد' },
  { rank: '4', name: 'ساندي مجدي', squad: 'زهرات', points: 260, badge: 'شارة الألحان' },
  { rank: '5', name: 'ديفيد رامي', squad: 'متقدم', points: 245, badge: 'نجم التخييم' },
];

export const CurriculaScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);

  // Helper to get restricted squad key for non-admin/leader users
  const getRestrictedSquadKey = (u: any): string | null => {
    if (!u) return null;
    const isLeaderOrAdmin =
      u.role === 'ADMIN' ||
      u.role === 'LEADER' ||
      u.role === 'SECTION_LEADER' ||
      u.role === 'GROUP_MANAGER';
    if (isLeaderOrAdmin) return null; // Full access

    const section = (u.sectionName || u.squadName || '').toLowerCase();
    if (section.includes('براعم') || section.includes('baraem')) return 'BARAEM';
    if (section.includes('شبال') || section.includes('زهرات') || section.includes('ashbal')) return 'ASHBAL';
    if (section.includes('متقدم') || section.includes('رائدات') || section.includes('motaqadem')) return 'MOTAQADEM';
    if (section.includes('جوال') || section.includes('خدمة') || section.includes('jowalah') || u.role === 'JOWALAH') return 'JOWALAH';
    return 'KASHOOF'; // Default scout stage
  };

  const restrictedSquadKey = getRestrictedSquadKey(user);

  const [selectedSquad, setSelectedSquad] = useState<string>(
    restrictedSquadKey || 'KASHOOF'
  );
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [curriculaList, setCurriculaList] = useState<CurriculumItem[]>(CURRICULUM_DATA);
  const [loading, setLoading] = useState(true);

  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  React.useEffect(() => {
    if (restrictedSquadKey) {
      setSelectedSquad(restrictedSquadKey);
    }
  }, [restrictedSquadKey]);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const firestoreCurricula = await fetchCurriculaFromFirestore();
        if (firestoreCurricula && firestoreCurricula.length > 0) {
          setCurriculaList([...firestoreCurricula, ...CURRICULUM_DATA]);
        }
      } catch (e) {
        console.warn('Error loading curricula from Firestore:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectSquad = (squadId: string) => {
    if (restrictedSquadKey && squadId !== restrictedSquadKey) {
      const userSquadName = SQUAD_TABS.find((s) => s.id === restrictedSquadKey)?.title || 'مرحلتك';
      Alert.alert(
        'منع الوصول 🔒',
        `عفواً يا كشاف! أنت مسجل في (${userSquadName}). لا يحق لك الاطلاع إلا على المنهج الخاص بمرحلتك الكشفية فقط.`
      );
      return;
    }
    setSelectedSquad(squadId);
  };

  const filteredCurricula = curriculaList.filter((item) => {
    const matchSquad = item.squadKey === selectedSquad;
    const matchType = selectedTypeFilter === 'ALL' || item.fileType === selectedTypeFilter;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSquad && matchType && matchSearch;
  });

  const getFileBadge = (type: string) => {
    switch (type) {
      case 'PDF':
        return { icon: '📕', color: '#DC2626', label: 'كتاب PDF' };
      case 'VIDEO':
        return { icon: '🎥', color: '#2563EB', label: 'فيديو شرح' };
      case 'AUDIO':
        return { icon: '🎵', color: '#059669', label: 'تسجيل صوتي' };
      case 'IMAGE':
        return { icon: '🖼️', color: '#D97706', label: 'صور ومخططات' };
      default:
        return { icon: '📄', color: '#6B7280', label: 'ملف' };
    }
  };

  const handleDownload = (item: CurriculumItem) => {
    Alert.alert(
      'تحميل المنهج',
      `جاري تنزيل ملف "${item.title}" (${item.downloadSize})...\nستحصل على ${item.points} نقطة كشفية عند إتمام الدراسة!`,
      [{ text: 'تم', style: 'default' }]
    );
  };

  const handleAnswerQuiz = (qIdx: number, aIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: aIdx }));
  };

  const handleSubmitQuiz = () => {
    // Q1 correct is 1, Q2 correct is 0
    let score = 0;
    if (selectedAnswers[0] === 1) score += 50;
    if (selectedAnswers[1] === 0) score += 50;
    setQuizScore(score);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.headerTitle}>مكتبة المناهج والمسابقات الروحية 📚</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Daily Bible Verse & Meditation Banner */}
        <View style={styles.verseCard}>
          <View style={styles.verseHeader}>
            <Text style={styles.verseTag}>🕊️ الكتاب المقدس: إصحاح وقراءة اليوم</Text>
            <Text style={styles.verseRef}>أفسس ٦ (العدد ١ - ٢٤)</Text>
          </View>
          <Text style={styles.verseText}>
            «أَخِيرًا يَا إِخْوَتِي تَشَدَّدُوا فِي الرَّبِّ وَفِي شِدَّةِ قُوَّتِهِ، الْبَسُوا سِلاَحَ اللهِ الْكَامِلَ»
          </Text>
          <Text style={styles.verseMeditation}>
            💡 التأمل المرفق: فيديو شرح وتأملات بصوت القمص والخدام + مسابقة تفاعلية أسبوعية على الإصحاح!
          </Text>
        </View>

        {/* Squad Selection via Horizontal Card Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1️⃣ اختر المرحلة الكشفية</Text>

          {restrictedSquadKey ? (
            <View style={styles.accessNoticeCard}>
              <Text style={styles.accessNoticeText}>
                🔒 تم تخصيص وصولك حصرياً لمنهج ({SQUAD_TABS.find((s) => s.id === restrictedSquadKey)?.title}) بصفتك عضواً كشفياً.
              </Text>
            </View>
          ) : (
            <View style={[styles.accessNoticeCard, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
              <Text style={[styles.accessNoticeText, { color: '#166534' }]}>
                👑 صلاحية كاملة (قائد / إدارة): متاح لك تصفح مناهج كافة المراحل الكشفية.
              </Text>
            </View>
          )}

          <IconCardSelector
            options={SQUAD_TABS}
            selectedId={selectedSquad}
            onSelect={(id) => handleSelectSquad(id)}
          />
        </View>

        {/* File Type Filter & Search Bar */}
        <View style={styles.filterSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 ابحث في المناهج (روحي، كشفي، نفسي تربوي، ثمر، ندوات)..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {[
              { id: 'ALL', label: 'الكل' },
              { id: 'PDF', label: '📕 كتب PDF' },
              { id: 'VIDEO', label: '🎥 فيديوهات' },
              { id: 'AUDIO', label: '🎵 تسجيلات صوتية' },
              { id: 'IMAGE', label: '🖼️ صور ومخططات' },
            ].map((tp) => (
              <TouchableOpacity
                key={tp.id}
                style={[styles.typeChip, selectedTypeFilter === tp.id && styles.typeChipActive]}
                onPress={() => setSelectedTypeFilter(tp.id)}
              >
                <Text style={[styles.typeChipText, selectedTypeFilter === tp.id && styles.typeChipTextActive]}>
                  {tp.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Curricula List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>مناهج المرحلة ({filteredCurricula.length})</Text>

          {filteredCurricula.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>لا توجد ملفات متطابقة مع البحث الحالي</Text>
            </View>
          ) : (
            filteredCurricula.map((item) => {
              const badge = getFileBadge(item.fileType);

              return (
                <View key={item.id} style={styles.curriculumCard}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.typeBadge, { backgroundColor: badge.color }]}>
                      <Text style={styles.typeBadgeText}>
                        {badge.icon} {badge.label}
                      </Text>
                    </View>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsBadgeText}>+{item.points} نقطة ⭐</Text>
                    </View>
                  </View>

                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.fileSizeText}>💾 الحجم: {item.downloadSize}</Text>
                    <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(item)}>
                      <Text style={styles.downloadBtnText}>📥 فتح وتحميل</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Online Contest Banner */}
        <View style={styles.contestCard}>
          <View style={styles.contestHeader}>
            <Text style={styles.contestTitle}>🏆 المسابقة الكشفية الأسبوعية</Text>
            <Text style={styles.contestTimer}>تنتهي خلال ٤٨ ساعة</Text>
          </View>
          <Text style={styles.contestDesc}>
            اختبر معلوماتك في الطقوس الكنسية والتقاليد الكشفية واجمع 100 نقطة لشارتك!
          </Text>
          <TouchableOpacity style={styles.startQuizBtn} onPress={() => setShowQuizModal(true)}>
            <Text style={styles.startQuizBtnText}>🚀 ابدأ المسابقة الآن</Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard Table */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.sectionTitle}>🌟 لوحة الشرف وأبطال المناهج</Text>
          {LEADERBOARD.map((user, idx) => (
            <View key={idx} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>{user.rank}</Text>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{user.name}</Text>
                <Text style={styles.leaderBadge}>
                  {user.squad} • 🏅 {user.badge}
                </Text>
              </View>
              <View style={styles.leaderPointsBox}>
                <Text style={styles.leaderPoints}>{user.points}</Text>
                <Text style={styles.leaderPointsUnit}>نقطة</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Online Quiz Modal */}
      <Modal visible={showQuizModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎯 المسابقة الكشفية التفاعلية</Text>
            <Text style={styles.modalSubtitle}>أجب عن الأسئلة التالية لاكتساب النقاط والشارات:</Text>

            <ScrollView style={styles.quizScroll}>
              {/* Question 1 */}
              <View style={styles.questionBox}>
                <Text style={styles.questionText}>
                  ١. ما هي العقدة المستخدمة لربط حبلين متساويين في السمك؟
                </Text>
                {['عقدة الصياد', 'العقدة الأفقية (المربعة)', 'العقدة التقصيرية'].map((ans, aIdx) => (
                  <TouchableOpacity
                    key={aIdx}
                    style={[
                      styles.answerOption,
                      selectedAnswers[0] === aIdx && styles.answerOptionSelected,
                    ]}
                    onPress={() => handleAnswerQuiz(0, aIdx)}
                  >
                    <Text
                      style={[
                        styles.answerText,
                        selectedAnswers[0] === aIdx && styles.answerTextSelected,
                      ]}
                    >
                      {ans}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Question 2 */}
              <View style={styles.questionBox}>
                <Text style={styles.questionText}>
                  ٢. ما هو الشعار الكشفي العام لمرحلة الكشافة؟
                </Text>
                {['كن مستعداً', 'ابذل غاية جهدك', 'الخدمة العامة'].map((ans, aIdx) => (
                  <TouchableOpacity
                    key={aIdx}
                    style={[
                      styles.answerOption,
                      selectedAnswers[1] === aIdx && styles.answerOptionSelected,
                    ]}
                    onPress={() => handleAnswerQuiz(1, aIdx)}
                  >
                    <Text
                      style={[
                        styles.answerText,
                        selectedAnswers[1] === aIdx && styles.answerTextSelected,
                      ]}
                    >
                      {ans}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {quizScore !== null && (
                <View style={styles.scoreResultBox}>
                  <Text style={styles.scoreResultTitle}>🎉 نتيجتك: {quizScore} / 100</Text>
                  <Text style={styles.scoreResultSub}>
                    {quizScore >= 100
                      ? 'ممتاز! تم إضافة 100 نقطة إلى ملفك الكشفي 🌟'
                      : 'أداء جيد! راجع المنهج وحاول مرة أخرى لرفع درجاتك.'}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              {quizScore === null ? (
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSubmitQuiz}>
                  <Text style={styles.modalConfirmBtnText}>إرسال الإجابات 🏁</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => {
                    setShowQuizModal(false);
                    setQuizScore(null);
                    setSelectedAnswers({});
                  }}
                >
                  <Text style={styles.modalConfirmBtnText}>إغلاق</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowQuizModal(false);
                  setQuizScore(null);
                  setSelectedAnswers({});
                }}
              >
                <Text style={styles.modalCancelBtnText}>رجوع</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <BottomNavBar navigation={navigation} currentRoute="Curricula" />
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
  headerTitle: { color: '#FFF', fontSize: 19, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 90 },
  verseCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  verseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  verseTag: { fontSize: 13, fontWeight: 'bold', color: '#92400E' },
  verseRef: { fontSize: 12, fontWeight: 'bold', color: '#8B0000' },
  verseText: { fontSize: 14, fontWeight: 'bold', color: '#78350F', lineHeight: 22, textAlign: 'right', marginBottom: 6 },
  verseMeditation: { fontSize: 12, color: '#92400E', textAlign: 'right', fontStyle: 'italic' },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#8B0000', marginBottom: 12 },
  filterSection: { marginBottom: 16 },
  searchInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'right',
    color: '#333',
    marginBottom: 10,
  },
  typeScroll: { flexDirection: 'row' },
  typeChip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  typeChipActive: { backgroundColor: '#8B0000', borderColor: '#8B0000' },
  typeChipText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  typeChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  listSection: { marginBottom: 16 },
  emptyBox: { backgroundColor: '#FFF', padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: '#6B7280', fontSize: 14 },
  curriculumCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EADBC8',
    elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  pointsBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pointsBadgeText: { color: '#92400E', fontSize: 11, fontWeight: 'bold' },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', textAlign: 'right', marginBottom: 6 },
  itemDesc: { fontSize: 13, color: '#4B5563', textAlign: 'right', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  fileSizeText: { fontSize: 12, color: '#6B7280' },
  downloadBtn: { backgroundColor: '#8B0000', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  downloadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  contestCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  contestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  contestTitle: { color: '#FCD34D', fontSize: 15, fontWeight: 'bold' },
  contestTimer: { color: '#A5B4FC', fontSize: 11, fontWeight: 'bold' },
  contestDesc: { color: '#E0E7FF', fontSize: 13, textAlign: 'right', lineHeight: 20, marginBottom: 12 },
  startQuizBtn: { backgroundColor: '#F59E0B', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  startQuizBtnText: { color: '#1E1B4B', fontWeight: 'bold', fontSize: 14 },
  leaderboardCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  leaderRank: { fontSize: 18, width: 30, textAlign: 'center', fontWeight: 'bold' },
  leaderInfo: { flex: 1, marginHorizontal: 8 },
  leaderName: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', textAlign: 'right' },
  leaderBadge: { fontSize: 11, color: '#6B7280', textAlign: 'right', marginTop: 2 },
  leaderPointsBox: { alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  leaderPoints: { fontSize: 14, fontWeight: 'bold', color: '#92400E' },
  leaderPointsUnit: { fontSize: 10, color: '#92400E' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#8B0000', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 16 },
  quizScroll: { maxHeight: 350 },
  questionBox: { marginBottom: 16, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12 },
  questionText: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', textAlign: 'right', marginBottom: 10 },
  answerOption: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  answerOptionSelected: { backgroundColor: '#FEF3C7', borderColor: '#D97706' },
  answerText: { fontSize: 13, color: '#374151', textAlign: 'right' },
  answerTextSelected: { color: '#92400E', fontWeight: 'bold' },
  scoreResultBox: {
    backgroundColor: '#DCFCE7',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  scoreResultTitle: { fontSize: 16, fontWeight: 'bold', color: '#166534', marginBottom: 4 },
  scoreResultSub: { fontSize: 12, color: '#166534', textAlign: 'center' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
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
  accessNoticeCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  accessNoticeText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
