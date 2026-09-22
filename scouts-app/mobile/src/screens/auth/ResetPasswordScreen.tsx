import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert 
} from 'react-native';

export const ResetPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [identifier, setIdentifier] = useState('JS-2026-448');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOtp = () => {
    if (!identifier.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الكود أو رقم الموبايل المسجل');
      return;
    }
    setStep(2);
  };

  const handleVerifyOtp = () => {
    if (otpCode.length < 4) {
      Alert.alert('تنبيه', 'يرجى إدخال رمز التحقق المكون من 4 أرقام');
      return;
    }
    setStep(3);
  };

  const handleSaveNewPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('تنبيه', 'كلمة السر يجب أن تكون 6 أحرف أو أكثر');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('أخطاء', 'كلمتا السر غير متطابقتين');
      return;
    }
    setStep(4);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>رحلة استعادة كلمة السر 🔑</Text>
        <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية - منظومة أمان الكشافة</Text>
      </View>

      {/* Progress Stepper */}
      <View style={styles.stepperContainer}>
        <View style={[styles.stepDot, step >= 1 && styles.activeDot]}>
          <Text style={styles.dotText}>1</Text>
        </View>
        <View style={[styles.stepLine, step >= 2 && styles.activeLine]} />
        <View style={[styles.stepDot, step >= 2 && styles.activeDot]}>
          <Text style={styles.dotText}>2</Text>
        </View>
        <View style={[styles.stepLine, step >= 3 && styles.activeLine]} />
        <View style={[styles.stepDot, step >= 3 && styles.activeDot]}>
          <Text style={styles.dotText}>3</Text>
        </View>
      </View>

      {/* STEP 1: Identification */}
      {step === 1 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>الخطوة ١: تحديد الحساب الكشفي</Text>
          <Text style={styles.stepSub}>
            أدخل كود الطفل/العضو الكشفي أو رقم موبايل ولي الأمر المسجل لاستلام رمز التحقق السريع
          </Text>

          <Text style={styles.inputLabel}>كود الكشاف أو رقم الموبايل *</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: JS-2026-448 أو 0122XXXXXXX"
            value={identifier}
            onChangeText={setIdentifier}
          />

          <TouchableOpacity style={styles.mainBtn} onPress={handleSendOtp} activeOpacity={0.8}>
            <Text style={styles.mainBtnText}>إرسال رمز التحقق OTP 📩</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: OTP Verification */}
      {step === 2 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>الخطوة ٢: كود التحقق السريع</Text>
          <Text style={styles.stepSub}>
            تم إرسال رمز أمان مكون من 4 أرقام عبر SMS إلى رقم موبايل ولي الأمر المسجل (***0122)
          </Text>

          {/* OTP Code Display Boxes */}
          <View style={styles.otpRow}>
            <TextInput
              style={styles.otpInput}
              placeholder="9"
              keyboardType="number-pad"
              maxLength={4}
              value={otpCode}
              onChangeText={setOtpCode}
            />
          </View>

          <Text style={styles.timerText}>⏱️ إعادة الإرسال بعد 00:59</Text>

          <TouchableOpacity style={styles.mainBtn} onPress={handleVerifyOtp} activeOpacity={0.8}>
            <Text style={styles.mainBtnText}>تأكيد كود التحقق 🔑</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3: New Password */}
      {step === 3 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>الخطوة ٣: تعيين كلمة المرور الجديدة</Text>
          <Text style={styles.stepSub}>
            يرجى اختيار كلمة سر قوية للحفاظ على بيانات شاراتك وسجلات الكشاف
          </Text>

          <Text style={styles.inputLabel}>كلمة السر الجديدة *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={styles.inputLabel}>تأكيد كلمة السر الجديدة *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.mainBtn} onPress={handleSaveNewPassword} activeOpacity={0.8}>
            <Text style={styles.mainBtnText}>حفظ كلمة السر الجديدة 💾</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 4: Success Modal */}
      {step === 4 && (
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>تم تغيير كلمة السر بنجاح!</Text>
          <Text style={styles.successSub}>
            تم تحديث كلمة المرور الخاصة بحسابك في كشافة الكنيسة. يمكنك الآن تسجيل الدخول مباشرة ببياناتك الجديدة.
          </Text>

          <TouchableOpacity 
            style={styles.mainBtn} 
            onPress={() => navigation?.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.mainBtnText}>الانتقال لشاشة الدخول المباشر 🚀</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 16,
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
  stepperContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    backgroundColor: '#8B0000',
  },
  dotText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: '#E5E7EB',
  },
  activeLine: {
    backgroundColor: '#8B0000',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
  },
  stepSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
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
  otpRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  otpInput: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 16,
    fontSize: 28,
    letterSpacing: 10,
    textAlign: 'center',
    width: 160,
    paddingVertical: 10,
  },
  timerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 14,
  },
  mainBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4A359',
  },
  successIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
  }
});
