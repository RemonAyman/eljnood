import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Role } from '../../types';

interface RoleOption {
  role: Role;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
}

export const RoleSelectScreen = ({ navigation }: any) => {
  const roles: RoleOption[] = [
    {
      role: 'CHILD',
      title: 'طفل / عضو كشفي',
      subtitle: 'للأولاد والبنات من مرحلة البراعم والأشبال حتى الكشاف والمتقدم وتحديد الفرقة.',
      badge: 'تسجيل استمارة عضوية جديدة',
      icon: '🏆'
    },
    {
      role: 'LEADER',
      title: 'قائد / جوالة',
      subtitle: 'لقادة الفرق وقادة السرايا ومساعديهم لمتابعة السريات والبرامج الروحية والافتقاد.',
      badge: 'خدمة وقيادة',
      icon: '⚜️'
    },
    {
      role: 'SECTION_LEADER',
      title: 'رئيس قطاع كشفي',
      subtitle: 'إدارة قطاعات البنين، البنات، الجوالة، واعتكاف الحجوزات والعهدات ومراجعة التعميد.',
      badge: 'إدارة وترأس قطاع',
      icon: '🛡️'
    },
    {
      role: 'PARENT',
      title: 'ولي أمر الكشاف',
      subtitle: 'لمتابعة حضور وغياب الابن، سداد الاشتراكات، والاطلاع على التواريخ والأنشطة.',
      badge: 'متابعة أسرية',
      icon: '👨‍👩‍👧'
    }
  ];

  const handleSelectRole = (roleOption: RoleOption) => {
    navigation?.navigate('Register', { role: roleOption.role });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Curved Header Banner */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerTitle}>انضم لأسرة جنود المسيح الكشفية</Text>
        <Text style={styles.headerSub}>
          اختر صفة المتابعة وبدء رحلتك الكشفية والروحية بفروات مباركة
        </Text>
      </View>

      <Text style={styles.sectionTitle}>حدد نوع الحساب المطلوب:</Text>

      {roles.map((item) => (
        <TouchableOpacity
          key={item.role}
          style={styles.roleCard}
          activeOpacity={0.8}
          onPress={() => handleSelectRole(item)}
        >
          <View style={styles.roleHeader}>
            <Text style={styles.roleIcon}>{item.icon}</Text>
            <View style={styles.roleTitleCol}>
              <Text style={styles.roleTitle}>{item.title}</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.roleSubtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={styles.loginBackBtn}
        onPress={() => navigation?.navigate('Login')}
      >
        <Text style={styles.loginBackText}>
          لديك حساب مسجل بالفعل؟ <Text style={styles.boldRed}>تسهيل الدخول</Text>
        </Text>
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
  header: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#D4A359',
    overflow: 'hidden',
    padding: 2,
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#D4A359',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 12,
    textAlign: 'right',
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  roleHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIcon: {
    fontSize: 36,
    marginLeft: 12,
  },
  roleTitleCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  badgePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  badgeText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: 'bold',
  },
  roleSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'right',
  },
  loginBackBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  loginBackText: {
    fontSize: 13,
    color: '#4B5563',
  },
  boldRed: {
    color: '#8B0000',
    fontWeight: 'bold',
  }
});
