import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';
import { DailyBibleReading, BibleQuizQuestion } from '../../types';

const INITIAL_READING: DailyBibleReading = {
  id: 'bible_today',
  date: '2026-10-18',
  bookName: 'إنجيل متى البشير',
  chapterNumber: 5,
  title: 'الموعظة على الجبل - التطويبات ونور العالم',
  readingText: `١ وَلَمَّا رَأَى الْجُمُوعَ صَعِدَ إِلَى الْجَبَلِ، فَلَمَّا جَلَسَ تَقَدَّمَ إِلَيْهِ تَلاَمِيذُهُ.
٢ فَفَتَحَ فَاهُ وَعَلَّمَهُمْ قَائِلًا:
٣ «طُوبَى لِلْمَسَاكِينِ بِالرُّوحِ، لأَنَّ لَهُمْ مَلَكُوتَ السَّمَاوَاتِ.
٤ طُوبَى لِلْحَزَانَى، لأَنَّهُمْ يُتَعَزَّوْنَ.
٥ طُوبَى لِلْوُدَعَاءِ، لأَنَّهُمْ يَرِثُونَ الأَرْضَ.
٦ طُوبَى لِلْجِيَاعِ وَالْعِطَاشِ إِلَى الْبِرِّ، لأَنَّهُمْ يُشْبَعُونَ.
٧ طُوبَى لِلرُّحَمَاءِ، لأَنَّهُمْ يُرْحَمُونَ.
٨ طُوبَى لأَنْقِيَاءِ الْقَلْبِ، لأَنَّهُمْ يُعَايِنُونَ اللهَ.
٩ طُوبَى لِصَانِعِي السَّلاَمِ، لأَنَّهُمْ أَبْنَاءَ اللهِ يُدْعَوْنَ.
١٠ طُوبَى لِلْمَطْرُودِينَ مِنْ أَجْلِ الْبِرِّ، لأَنَّ لَهُمْ مَلَكُوتَ السَّمَاوَاتِ.
١١ طُوبَى لَكُمْ إِذَا عَيَّرُوكُمْ وَطَرَدُوكُمْ وَقَالُوا عَلَيْكُمْ كُلَّ كَلِمَةٍ شِرِّيرَةٍ، مِنْ أَجْلِي، كَاذِبِينَ.
١٢ اِفْرَحُوا وَتَهَلَّلُوا، لأَنَّ أَجْرَكُمْ عَظِيمٌ فِي السَّمَاوَاتِ.
١٣ «أَنْتُمْ مِلْحُ الأَرْضِ، وَلكِنْ إِنْ فَسَدَ الْمِلْحُ فَبِمَاذَا يُمَلَّحُ؟ لاَ يَصْلُحُ بَعْدُ لِشَيْءٍ، إِلاَّ لأَنْ يُطْرَحَ خَارِجًا وَيُدَاسَ مِنَ النَّاسِ.
١٤ أَنْتُمْ نُورُ الْعَالَمِ. لاَ يُمْكِنُ أَنْ تُخْفَى مَدِينَةٌ مَوْضُوعَةٌ عَلَى جَبَلٍ،
١٥ وَلاَ يُوقِدُونَ سِرَاجًا وَيَضَعُونَهُ تَحْتَ الْمِكْيَالِ، بَلْ عَلَى الْمَنَارَةِ فَيُضِيءُ لِجَمِيعِ الَّذِينَ فِي الْبَيْتِ.
١٦ فَلْيُضِئْ نُورُكُمْ هكَذَا قُدَّامَ النَّاسِ، لِكَيْ يَرَوْا أَعْمَالَكُمُ الْحَسَنَةَ، وَيُمَجِّدُوا أَبَاكُمُ الَّذِي فِي السَّمَاوَاتِ.`,
  meditationAudioUrl: 'https://archive.org/details/coptic-bible-meditation-sample',
  meditationVideoUrl: 'https://youtube.com',
  meditationPdfUrl: 'https://copticchurch.net/bible-study-matthew5.pdf',
  quizQuestions: [
    {
      id: 'q1',
      question: 'بماذا وُصف صانعو السلام في التطويبات؟',
      options: ['يرثون الأرض', 'أبناء الله يُدعون', 'يُعاينون الله', 'لهم ملكوت السماوات'],
      correctOptionIndex: 1,
      explanation: '«طُوبَى لِصَانِعِي السَّلاَمِ، لأَنَّهُمْ أَبْنَاءَ اللهِ يُدْعَوْنَ» (متى ٥: ٩)',
    },
    {
      id: 'q2',
      question: 'ما هو الوصف الذي أطلقه السيد المسيح على تلاميذه في الآية ١٤؟',
      options: ['ملح الأرض', 'نور العالم', 'حكمة الدهر', 'قوة الروح'],
      correctOptionIndex: 1,
      explanation: '«أَنْتُمْ نُورُ الْعَالَمِ. لاَ يُمْكِنُ أَنْ تُخْفَى مَدِينَةٌ مَوْضُوعَةٌ عَلَى جَبَلٍ» (متى ٥: ١٤)',
    },
    {
      id: 'q3',
      question: 'لماذا يجب أن يضيء نورنا قدام الناس حسب الآية ١٦؟',
      options: [
        'لكي ننال مجداً من الناس',
        'لكي يروا أعمالكم الحسنة ويمجدوا أباكم السماوي',
        'لكي نتفوق على الآخرين',
        'لكي نثبت قوتنا',
      ],
      correctOptionIndex: 1,
      explanation: '«لِكَيْ يَرَوْا أَعْمَالَكُمُ الْحَسَنَةَ، وَيُمَجِّدُوا أَبَاكُمُ الَّذِي فِي السَّمَاوَاتِ» (متى ٥: ١٦)',
    },
  ],
};

export const BibleStudyScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const isLeaderOrAdmin = user?.role === 'ADMIN' || user?.role === 'LEADER' || user?.role === 'GROUP_MANAGER';

  const [reading, setReading] = useState<DailyBibleReading>(INITIAL_READING);
  const [fontSize, setFontSize] = useState<number>(16);
  const [hasCompletedReading, setHasCompletedReading] = useState(false);
  const [activeTab, setActiveTab] = useState<'TEXT' | 'MEDITATION' | 'QUIZ'>('TEXT');

  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Edit Reading Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBook, setEditBook] = useState(reading.bookName);
  const [editChapter, setEditChapter] = useState(reading.chapterNumber.toString());
  const [editTitle, setEditTitle] = useState(reading.title);
  const [editText, setEditText] = useState(reading.readingText);

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const calculateScore = () => {
    if (!reading.quizQuestions) return 0;
    let score = 0;
    reading.quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctOptionIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleShareVerse = async () => {
    try {
      await Share.share({
        message: `✝️ إصحاح اليوم من مجموعة جنود المسيح الكشفية:\n${reading.bookName} - أصحاح ${reading.chapterNumber}\n\n«فَلْيُضِئْ نُورُكُمْ هكَذَا قُدَّامَ النَّاسِ، لِكَيْ يَرَوْا أَعْمَالَكُمُ الْحَسَنَةَ، وَيُمَجِّدُوا أَبَاكُمُ الَّذِي فِي السَّمَاوَاتِ»\n\nاقرأ الإصحاح وشارك في المسابقة اليومية عبر تطبيق جنود المسيح!`,
      });
    } catch (e) {
      console.warn('Share note:', e);
    }
  };

  const handleSaveEdit = () => {
    setReading((prev) => ({
      ...prev,
      bookName: editBook.trim(),
      chapterNumber: parseInt(editChapter, 10) || 1,
      title: editTitle.trim(),
      readingText: editText.trim(),
    }));
    setShowEditModal(false);
    Alert.alert('تم التحديث بنجاح ✅', 'تم تحديث إصحاح اليوم لجميع أفراد المجموعة.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>خطة القراءة والتأمل السنوية 📖</Text>
        <Text style={styles.headerTitle}>
          {reading.bookName} - أصحاح {reading.chapterNumber}
        </Text>
        <Text style={styles.headerTheme}>{reading.title}</Text>

        {isLeaderOrAdmin && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.editBtnText}>✏️ تعديل إصحاح اليوم</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs Row */}
      <View style={styles.tabNavRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'TEXT' && styles.tabBtnActive]}
          onPress={() => setActiveTab('TEXT')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'TEXT' && styles.tabBtnTextActive]}>
            📜 نص الإصحاح
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'MEDITATION' && styles.tabBtnActive]}
          onPress={() => setActiveTab('MEDITATION')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'MEDITATION' && styles.tabBtnTextActive]}>
            🎧 تأملات ووسائط
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'QUIZ' && styles.tabBtnActive]}
          onPress={() => setActiveTab('QUIZ')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'QUIZ' && styles.tabBtnTextActive]}>
            🏆 مسابقة الإصحاح
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* TAB 1: BIBLE TEXT */}
        {activeTab === 'TEXT' && (
          <View style={styles.card}>
            {/* Font Control & Actions */}
            <View style={styles.actionRow}>
              <View style={styles.fontControls}>
                <TouchableOpacity
                  style={styles.fontBtn}
                  onPress={() => setFontSize((s) => Math.min(26, s + 2))}
                >
                  <Text style={styles.fontBtnText}>أ+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fontBtn}
                  onPress={() => setFontSize((s) => Math.max(13, s - 2))}
                >
                  <Text style={styles.fontBtnText}>أ-</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.shareBtn} onPress={handleShareVerse}>
                <Text style={styles.shareBtnText}>مشاركة 📤</Text>
              </TouchableOpacity>
            </View>

            {/* Reading Text */}
            <Text style={[styles.bibleText, { fontSize, lineHeight: fontSize * 1.8 }]}>
              {reading.readingText}
            </Text>

            {/* Complete reading button */}
            <TouchableOpacity
              style={[
                styles.completeBtn,
                hasCompletedReading && styles.completeBtnDone,
              ]}
              onPress={() => {
                setHasCompletedReading(true);
                Alert.alert(
                  'بركة عظيمة! 🎉',
                  'عشت يا بطل! تم تسجيل إتمام قراءة إصحاح اليوم، استمر في دراسة الكلمة يومياً.'
                );
              }}
            >
              <Text style={styles.completeBtnText}>
                {hasCompletedReading
                  ? 'تمت قراءة إصحاح اليوم بنجاح ✅'
                  : '✔️ أتممت قراءة إصحاح اليوم'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: MEDITATION & MEDIA */}
        {activeTab === 'MEDITATION' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎧 التأمل الصوتي اليومي في الإصحاح</Text>
              <Text style={styles.cardDesc}>
                استمع لشرح وتأمل الآيات بصوت أباء الكنيسة وخدام التربية الكنسية
              </Text>
              <TouchableOpacity
                style={styles.mediaDownloadBtn}
                onPress={() => {
                  Alert.alert('جاري التشغيل 🎧', 'يتم تشغيل التسجيل الصوتي لتأمل الإصحاح الخامس من إنجيل متى.');
                }}
              >
                <Text style={styles.mediaBtnText}>تشغيل التأمل الصوتي 🔊</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎥 فيديو شرح وتأمل الإصحاح</Text>
              <Text style={styles.cardDesc}>
                شاهد درس كتاب مرئي مبسط يوضح خلفية الإصحاح وتطبيقاته لحياتنا الكشفية والروحية
              </Text>
              <TouchableOpacity
                style={[styles.mediaDownloadBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => {
                  Alert.alert('مشاهدة الفيديو 🎥', 'فتح رابط فيديو التأمل والشرح في متصفحك أو يوتيوب.');
                }}
              >
                <Text style={styles.mediaBtnText}>مشاهدة فيديو التأمل 🎬</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>📄 ملزمة دراسة الإصحاح (PDF)</Text>
              <Text style={styles.cardDesc}>
                تحميل كتيب تأملات الإصحاح، معاني الكلمات الصعبة، وجدول الأسئلة والتدريبات اليومية
              </Text>
              <TouchableOpacity
                style={[styles.mediaDownloadBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => {
                  Alert.alert('تحميل PDF 📥', 'جاري تحميل ملف تأمل الإصحاح PDF على هاتفك.');
                }}
              >
                <Text style={styles.mediaBtnText}>تحميل ملف التأمل PDF 📥</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 3: ONLINE QUIZ */}
        {activeTab === 'QUIZ' && (
          <View style={styles.card}>
            <View style={styles.quizHeaderRow}>
              <Text style={styles.cardTitle}>🏆 مسابقة إصحاح اليوم التفاعلية</Text>
              {quizSubmitted && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>
                    النتيجة: {calculateScore()} / {reading.quizQuestions?.length || 0}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDesc}>
              أجب عن الأسئلة التالية لاختبار فهمك واستيعابك لمعاني الإصحاح
            </Text>

            {reading.quizQuestions?.map((q, qIdx) => {
              const selectedOpt = userAnswers[q.id];
              return (
                <View key={q.id} style={styles.quizBox}>
                  <Text style={styles.questionText}>
                    {qIdx + 1}. {q.question}
                  </Text>

                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const isCorrect = quizSubmitted && optIdx === q.correctOptionIndex;
                    const isWrong = quizSubmitted && isSelected && optIdx !== q.correctOptionIndex;

                    return (
                      <TouchableOpacity
                        key={optIdx}
                        style={[
                          styles.optionBtn,
                          isSelected && styles.optionBtnSelected,
                          isCorrect && styles.optionBtnCorrect,
                          isWrong && styles.optionBtnWrong,
                        ]}
                        disabled={quizSubmitted}
                        onPress={() => handleSelectAnswer(q.id, optIdx)}
                      >
                        <Text
                          style={[
                            styles.optionBtnText,
                            isSelected && styles.optionBtnTextSelected,
                            isCorrect && styles.optionBtnTextCorrect,
                            isWrong && styles.optionBtnTextWrong,
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {quizSubmitted && q.explanation && (
                    <Text style={styles.explanationText}>
                      💡 الشاهد والشرح: {q.explanation}
                    </Text>
                  )}
                </View>
              );
            })}

            {!quizSubmitted ? (
              <TouchableOpacity
                style={styles.submitQuizBtn}
                onPress={() => {
                  if (Object.keys(userAnswers).length < (reading.quizQuestions?.length || 0)) {
                    Alert.alert('تنبيه', 'من فضلك أجب عن جميع الأسئلة أولاً.');
                    return;
                  }
                  setQuizSubmitted(true);
                  Alert.alert(
                    'تم تصحيح المسابقة 🎉',
                    `درجتك: ${calculateScore()} من ${reading.quizQuestions?.length || 0}!`
                  );
                }}
              >
                <Text style={styles.submitQuizBtnText}>تصحيح الإجابات والنتيجة 🎯</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitQuizBtn, { backgroundColor: '#4B5563' }]}
                onPress={() => {
                  setQuizSubmitted(false);
                  setUserAnswers({});
                }}
              >
                <Text style={styles.submitQuizBtnText}>إعادة المحاولة 🔄</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal (Admin / Leaders) */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>✏️ تحديث إصحاح وقراءة اليوم</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>اسم السفر:</Text>
              <TextInput
                style={styles.modalInput}
                value={editBook}
                onChangeText={setEditBook}
                textAlign="right"
              />

              <Text style={styles.inputLabel}>رقم الأصحاح:</Text>
              <TextInput
                style={styles.modalInput}
                value={editChapter}
                keyboardType="number-pad"
                onChangeText={setEditChapter}
                textAlign="right"
              />

              <Text style={styles.inputLabel}>عنوان / موضوع الإصحاح:</Text>
              <TextInput
                style={styles.modalInput}
                value={editTitle}
                onChangeText={setEditTitle}
                textAlign="right"
              />

              <Text style={styles.inputLabel}>نص الآيات والإصحاح كاملاً:</Text>
              <TextInput
                style={[styles.modalInput, { height: 140, textAlignVertical: 'top' }]}
                value={editText}
                onChangeText={setEditText}
                multiline
                textAlign="right"
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSaveEdit}>
                <Text style={styles.modalConfirmBtnText}>حفظ وتحديث 💾</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} currentRoute="BibleStudy" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  header: {
    backgroundColor: '#8B0000',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSubtitle: { color: '#D4A359', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerTheme: { color: '#F3F4F6', fontSize: 13, marginTop: 4, textAlign: 'center' },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
  },
  editBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EADBC8',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: '#8B0000' },
  tabBtnText: { fontSize: 12, fontWeight: 'bold', color: '#6B7280' },
  tabBtnTextActive: { color: '#FFF' },
  content: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  fontControls: { flexDirection: 'row', gap: 8 },
  fontBtn: {
    backgroundColor: '#F3F4F6',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontBtnText: { fontSize: 13, fontWeight: 'bold', color: '#374151' },
  shareBtn: {
    backgroundColor: '#FDF2E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  shareBtnText: { color: '#D97706', fontSize: 12, fontWeight: 'bold' },
  bibleText: {
    color: '#1F2937',
    textAlign: 'right',
    fontFamily: 'serif',
  },
  completeBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  completeBtnDone: { backgroundColor: '#059669' },
  completeBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#8B0000', textAlign: 'right', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#6B7280', textAlign: 'right', marginBottom: 14 },
  mediaDownloadBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mediaBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  quizHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: { color: '#166534', fontWeight: 'bold', fontSize: 12 },
  quizBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  questionText: { fontSize: 13, fontWeight: 'bold', color: '#1F2937', textAlign: 'right', marginBottom: 10 },
  optionBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  optionBtnSelected: { backgroundColor: '#FEF3C7', borderColor: '#D97706' },
  optionBtnCorrect: { backgroundColor: '#DCFCE7', borderColor: '#166534' },
  optionBtnWrong: { backgroundColor: '#FEE2E2', borderColor: '#991B1B' },
  optionBtnText: { fontSize: 12, color: '#374151', textAlign: 'right' },
  optionBtnTextSelected: { color: '#92400E', fontWeight: 'bold' },
  optionBtnTextCorrect: { color: '#166534', fontWeight: 'bold' },
  optionBtnTextWrong: { color: '#991B1B', fontWeight: 'bold' },
  explanationText: { fontSize: 11, color: '#059669', textAlign: 'right', marginTop: 6 },
  submitQuizBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitQuizBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#8B0000', textAlign: 'center', marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#374151', textAlign: 'right', marginBottom: 4, marginTop: 8 },
  modalInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
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
