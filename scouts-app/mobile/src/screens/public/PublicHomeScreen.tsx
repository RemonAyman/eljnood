import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface NewsItem {
  id: string;
  day: string;
  month: string;
  title: string;
  desc: string;
  icon: string;
}

const NEWS_DATA: NewsItem[] = [
  {
    id: '1',
    day: '15',
    month: 'أغسطس',
    title: 'مخيم الصيف الكشفي السنوي',
    desc: 'أيام مليئة بالأنشطة والمغامرات والروحانية في وادي النطرون.',
    icon: '⛺',
  },
  {
    id: '2',
    day: '10',
    month: 'أغسطس',
    title: 'لقاء روحي وتربوي للشباب',
    desc: 'معاً نقترب من الله في محبة وخدمة وبناء الشخصية المسيحية الواعية.',
    icon: '✝️',
  },
  {
    id: '3',
    day: '2',
    month: 'أغسطس',
    title: 'رحلة التحدي واستكشاف الجبال',
    desc: 'تجربة جديدة من الاعتماد على النفس والتخييم وفنون الريادة الكشفية.',
    icon: '🧗',
  },
];

const PILLARS = [
  { id: '1', title: 'خدمة المجتمع', icon: '🤝', desc: 'مبادرات وعطاء' },
  { id: '2', title: 'الأنشطة الكشفية', icon: '⚜️', desc: 'مهارات ومغامرة' },
  { id: '3', title: 'العمل الجماعي', icon: '👥', desc: 'أخوة ووحدة' },
  { id: '4', title: 'الروحانية', icon: '📖', desc: 'إيمان وصلاة' },
];

export const PublicHomeScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner with Hero */}
      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.churchBadge}>مجموعة جنود المسيح الكشفية</Text>
          <View style={styles.scoutLogoCircle}>
            <Image
              source={require('../../../assets/logo.jpeg')}
              style={styles.scoutLogoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.heroPreTitle}>معاً نَخدم ونَبني</Text>
        <Text style={styles.heroTitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.heroSub}>
          نُعدّ مجموعة مبدعة من الشباب القادر على خدمة الكنيسة والمجتمع بروح المحبة،
          والانضباط والعطاء الكشفي المستمر.
        </Text>

        <View style={styles.heroBtnRow}>
          <TouchableOpacity
            style={[styles.heroBtn, styles.primaryBtn]}
            onPress={() => navigation?.navigate('AboutUs')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>تعرف علينا ←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.heroBtn, styles.secondaryBtn]}
            onPress={() => navigation?.navigate('Activities')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>🏕️ أنشطتنا</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Login Bar */}
      <TouchableOpacity
        style={styles.loginBanner}
        onPress={() => navigation?.navigate('Login')}
        activeOpacity={0.9}
      >
        <View style={styles.loginBannerTextWrap}>
          <Text style={styles.loginBannerTitle}>لديك حساب كشفي مسجل؟</Text>
          <Text style={styles.loginBannerSub}>دخول الكشافة وأولياء الأمور والقادة</Text>
        </View>
        <View style={styles.loginBannerIconWrap}>
          <Text style={styles.loginBannerArrow}>دخول 🔑</Text>
        </View>
      </TouchableOpacity>

      {/* 4 Pillars Section */}
      <Text style={styles.sectionHeading}>ركائز الخدمة الكشفية</Text>
      <View style={styles.pillarsGrid}>
        {PILLARS.map((p) => (
          <View key={p.id} style={styles.pillarCard}>
            <Text style={styles.pillarIcon}>{p.icon}</Text>
            <Text style={styles.pillarTitle}>{p.title}</Text>
            <Text style={styles.pillarDesc}>{p.desc}</Text>
          </View>
        ))}
      </View>

      {/* Latest News & Events */}
      <View style={styles.sectionHeaderRow}>
        <TouchableOpacity onPress={() => navigation?.navigate('Activities')}>
          <Text style={styles.seeAllText}>عرض الكل ←</Text>
        </TouchableOpacity>
        <Text style={styles.sectionHeading}>أحدث الأخبار والفعاليات</Text>
      </View>

      {NEWS_DATA.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.newsCard}
          onPress={() => navigation?.navigate('Activities')}
          activeOpacity={0.8}
        >
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>{item.day}</Text>
            <Text style={styles.dateMonth}>{item.month}</Text>
          </View>

          <View style={styles.newsContent}>
            <View style={styles.newsTitleRow}>
              <Text style={styles.newsIcon}>{item.icon}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
            </View>
            <Text style={styles.newsDesc} numberOfLines={2}>
              {item.desc}
            </Text>
            <Text style={styles.readMore}>اقرأ المزيد ➔</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Quick Nav Shortcut Cards */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navCard}
          onPress={() => navigation?.navigate('PublicGallery')}
          activeOpacity={0.85}
        >
          <Text style={styles.navCardIcon}>📸</Text>
          <Text style={styles.navCardTitle}>معرض الصور</Text>
          <Text style={styles.navCardSub}>ألبوم المعسكرات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => navigation?.navigate('ContactUs')}
          activeOpacity={0.85}
        >
          <Text style={styles.navCardIcon}>📞</Text>
          <Text style={styles.navCardTitle}>تواصل معنا</Text>
          <Text style={styles.navCardSub}>المقر والهاتف</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => navigation?.navigate('RoleSelect')}
          activeOpacity={0.85}
        >
          <Text style={styles.navCardIcon}>📝</Text>
          <Text style={styles.navCardTitle}>انضم الآن</Text>
          <Text style={styles.navCardSub}>تسجيل كشاف جديد</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Verse */}
      <View style={styles.footerVerse}>
        <Text style={styles.verseText}>
          «مَعاً نَكُونُ شُهُوداً لِلْمَسِيحِ فِي كُلِّ مَكَانٍ»
        </Text>
        <Text style={styles.verseRef}>مجموعة جنود المسيح الكشفية - الفوج الأول</Text>
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
  heroCard: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  badgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  churchBadge: {
    color: '#D4A359',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(212, 163, 89, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoutLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4A359',
    overflow: 'hidden',
    padding: 2,
  },
  scoutLogoImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  heroPreTitle: {
    color: '#D4A359',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  heroSub: {
    color: '#F9FAFB',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
    opacity: 0.9,
    marginBottom: 18,
  },
  heroBtnRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  heroBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#D4A359',
  },
  primaryBtnText: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loginBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#D4A359',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  loginBannerTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  loginBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  loginBannerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  loginBannerIconWrap: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loginBannerArrow: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 12,
    textAlign: 'right',
  },
  pillarsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pillarCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  pillarIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  pillarTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  pillarDesc: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#D4A359',
    fontWeight: 'bold',
    fontSize: 12,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  dateBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#8B0000',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 54,
    marginLeft: 12,
  },
  dateDay: {
    color: '#8B0000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateMonth: {
    color: '#8B0000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newsContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  newsTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  newsIcon: {
    fontSize: 14,
  },
  newsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  newsDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'right',
    marginBottom: 4,
  },
  readMore: {
    color: '#8B0000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  navRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginVertical: 14,
  },
  navCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  navCardIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  navCardSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  footerVerse: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4A359',
    alignItems: 'center',
    marginTop: 10,
  },
  verseText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 4,
  },
  verseRef: {
    fontSize: 11,
    color: '#B45309',
  },
});
