import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useMembersStore } from '../../store/membersStore';
import { ScoutCardPreview } from '../../components/card_print/ScoutCardPreview';

export const ChildHomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const getMemberByCode = useMembersStore((s) => s.getMemberByCode);
  
  const member = getMemberByCode(user?.code || 'JS-2026-448') || {
    id: 'm1',
    code: 'JS-2026-448',
    name: 'بيتر يوسف فايز',
    gender: 'MALE' as const,
    scarfStatus: 'RECEIVED' as const,
    birthDate: '2012-09-15',
    gradeLevel: 'PREP_1' as const,
    squadName: 'كشاف' as const,
    phone: '01012345678',
    guardianPhone: '01229876543',
    createdAt: new Date().toISOString()
  };

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
        <Text style={styles.topTitle}>مجموعة جنود المسيح الكشفية</Text>
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Curved Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroSubText}>معاً نخدم ونبني</Text>
        <Text style={styles.heroTitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.heroDesc}>
          نُعد مجموعة مبدعة من الشباب القادرين على خدمة الكنيسة والمجتمع بروح المحبة والعطاء.
        </Text>

        <View style={styles.heroBtnRow}>
          <TouchableOpacity 
            style={styles.heroPrimaryBtn}
            onPress={() => navigation?.navigate('Subscriptions')}
          >
            <Text style={styles.heroPrimaryText}>الاشتراكات والماليات ←</Text>
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
      <ScoutCardPreview 
        member={member} 
        onPrint={() => navigation?.navigate('Subscriptions')}
      />

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
  topTitle: {
    fontSize: 16,
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
  }
});
