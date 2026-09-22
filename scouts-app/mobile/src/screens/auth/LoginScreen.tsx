import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert 
} from 'react-native';
import { useAuthStore } from '../../store/authStore';

export const LoginScreen = ({ navigation }: any) => {
  const setUser = useAuthStore((s) => s.setUser);
  const setPinUnlocked = useAuthStore((s) => s.setPinUnlocked);

  const [identifier, setIdentifier] = useState('JS-2026-448');
  const [password, setPassword] = useState('123456');
  
  // Secret PIN Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const handleLogin = () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال كود الكشاف/البريد وكلمة المرور');
      return;
    }

    setUser({
      id: 'user_1',
      name: 'بيتر يوسف فايز',
      code: identifier,
      role: 'CHILD',
      phone: '01012345678',
      guardianPhone: '01229876543'
    });

    navigation?.navigate('ChildHome');
  };

  const handleVerifyPin = () => {
    if (pinInput === '1234' || pinInput === '0000') {
      setPinUnlocked(true);
      setShowPinModal(false);
      Alert.alert('نجاح', 'تم تفعيل صلاحيات أمين الصندوق والخصومات بنجاح! 🔑');
    } else {
      Alert.alert('أخطاء', 'الرمز السري غير صحيح');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Curved Header Banner */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>⚜️</Text>
        </View>
        <Text style={styles.groupTitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.churchSub}>كنيسة السيدة العذراء مريم - الفوج الكشفي الأول</Text>
        <View style={styles.sloganTag}>
          <Text style={styles.sloganText}>مستعد دائماً للخدمة والتفوق</Text>
        </View>
      </View>

      {/* Login Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>تسجيل الدخول للكشافة</Text>
        <Text style={styles.cardSub}>أهلاً بعودتك يا بطل، أدخل بياناتك للمتابعة</Text>

        <Text style={styles.inputLabel}>كود الكشاف أو البريد *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: JS-2026-448 أو name@scouts.org"
          value={identifier}
          onChangeText={setIdentifier}
        />

        <View style={styles.passwordRow}>
          <Text style={styles.inputLabel}>كلمة المرور *</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('ResetPassword')}>
            <Text style={styles.forgotLink}>نسيت كلمة السر؟</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.loginBtnText}>تسجيل الدخول إلى حسابك ←</Text>
        </TouchableOpacity>

        {/* Manager Secret PIN Section */}
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.pinTriggerBtn}
          onPress={() => setShowPinModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.pinTriggerTitle}>🔑 رمز PIN الخاص بالقادة وأمناء الصندوق</Text>
          <Text style={styles.pinTriggerSub}>تفعيل صلاحيات الخزينة ومسؤولي العهدة والخصومات</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity 
          style={styles.registerLinkContainer}
          onPress={() => navigation?.navigate('RoleSelect')}
        >
          <Text style={styles.registerLinkText}>
            ليس لديك حساب كشفي؟ <Text style={styles.boldRed}>سجل الآن وانضم للفرقة</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Secret PIN Modal */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>رمز PIN السري للمدير الخزينة 🔑</Text>
            <Text style={styles.modalSub}>أدخل الرمز السري المكون من 4 أرقام لتفعيل الخصومات</Text>
            
            <TextInput
              style={styles.pinInput}
              placeholder="••••"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pinInput}
              onChangeText={setPinInput}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setShowPinModal(false)}
              >
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={handleVerifyPin}
              >
                <Text style={styles.confirmBtnText}>تأكيد الرمز</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
  },
  groupTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  churchSub: {
    color: '#D4A359',
    fontSize: 12,
    marginTop: 4,
  },
  sloganTag: {
    backgroundColor: 'rgba(212, 163, 89, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  sloganText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
  },
  cardSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'right',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 14,
    textAlign: 'right',
  },
  passwordRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    color: '#8B0000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  pinTriggerBtn: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D4A359',
  },
  pinTriggerTitle: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  pinTriggerSub: {
    color: '#B45309',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
  registerLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 13,
    color: '#4B5563',
  },
  boldRed: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  pinInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 16,
    fontSize: 24,
    letterSpacing: 10,
    textAlign: 'center',
    width: 140,
    paddingVertical: 8,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  confirmBtn: {
    backgroundColor: '#8B0000',
    marginLeft: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});
