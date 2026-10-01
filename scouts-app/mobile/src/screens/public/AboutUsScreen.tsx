import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

interface Goal {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const GOALS: Goal[] = [
  {
    id: '1',
    icon: '🌐',
    title: 'خدمة الكنيسة والمجتمع',
    desc: 'المشاركة الفعالة في الأنشطة الكنسية والخدمات الاجتماعية والتطوعية.',
  },
  {
    id: '2',
    icon: '👥',
    title: 'تكوين الشباب وتنمية مواهبهم',
    desc: 'اكتشاف الطاقات الشبابية وتوجيهها وصقل المهارات الفنية والقيادية.',
  },
  {
    id: '3',
    icon: '🧭',
    title: 'غرس القيم الكشفية والروحية',
    desc: 'الالتزام بوعد وقانون الكشافة والتمسك بالتعاليم المسيحية السمحة.',
  },
  {
    id: '4',
    icon: '🛡️',
    title: 'بناء قادة المستقبل',
    desc: 'إعداد كوادر قيادية قادرة على تحمل المسؤولية وإدارة الأزمات بروح المحبة.',
  },
];

export const AboutUsScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Emblem Card */}
      <View style={styles.headerCard}>
        <View style={styles.emblemBadge}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.emblemImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>من نحن؟</Text>
        <Text style={styles.subTitle}>مجموعة جنود المسيح الكشفية - الفوج الأول</Text>
      </View>

      {/* Main Bio Card */}
      <View style={styles.bioCard}>
        <Text style={styles.bioHeading}>رسالتنا ورؤيتنا الكشفية</Text>
        <Text style={styles.bioBody}>
          مجموعة جنود المسيح الكشفية هي حركة شبابية كنسية، تؤمن بأن الخدمة هي رسالة
          والعطاء هو أسلوب حياة. نسعى من خلالها إلى بناء جيل واعٍ، ملتزم، يخدم المجتمع
          بروح الإيمان والمحبة والعطاء الكشفي المستمر.
        </Text>

        <View style={styles.saintCard}>
          <Text style={styles.saintIcon}>⚔️</Text>
          <View style={styles.saintInfo}>
            <Text style={styles.saintTitle}>شفيع المجموعة: القديس موريس والكتيبة الطيبية</Text>
            <Text style={styles.saintSub}>رمز الشجاعة والأمانة والتضحية المسيحية الحية</Text>
          </View>
        </View>
      </View>

      {/* Golden Slogan Banner */}
      <View style={styles.sloganBanner}>
        <Text style={styles.sloganQuote}>«مَعاً نَكُونُ شُهُوداً لِلْمَسِيحِ فِي كُلِّ مَكَانٍ»</Text>
        <Text style={styles.sloganSub}>شعار فوج جنود المسيح الكشفي</Text>
      </View>

      {/* Strategic Goals */}
      <Text style={styles.sectionHeader}>أهدافنا الرئيسية</Text>
      {GOALS.map((goal) => (
        <View key={goal.id} style={styles.goalCard}>
          <View style={styles.goalIconBox}>
            <Text style={styles.goalIcon}>{goal.icon}</Text>
          </View>
          <View style={styles.goalContent}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalDesc}>{goal.desc}</Text>
          </View>
        </View>
      ))}

      {/* Call to Action Button */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => navigation?.navigate('RoleSelect')}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaBtnText}>انضم لأسرة الكشافة الآن ⚜️</Text>
      </TouchableOpacity>
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
  headerCard: {
    backgroundColor: '#8B0000',
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  emblemBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#D4A359',
    overflow: 'hidden',
    padding: 2,
  },
  emblemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subTitle: {
    color: '#D4A359',
    fontSize: 12,
    marginTop: 4,
  },
  bioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    elevation: 2,
  },
  bioHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
    marginBottom: 8,
  },
  bioBody: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'right',
  },
  saintCard: {
    marginTop: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  saintIcon: {
    fontSize: 26,
    marginLeft: 10,
  },
  saintInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  saintTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  saintSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  sloganBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#D4A359',
    alignItems: 'center',
    marginBottom: 18,
  },
  sloganQuote: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 4,
  },
  sloganSub: {
    fontSize: 11,
    color: '#B45309',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
    marginBottom: 12,
  },
  goalCard: {
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
  goalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#D4A359',
  },
  goalIcon: {
    fontSize: 20,
  },
  goalContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'right',
  },
  ctaBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
