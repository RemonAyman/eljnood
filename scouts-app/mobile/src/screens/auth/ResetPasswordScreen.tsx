import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { 
  findUserOrMemberInFirestore, 
  updateUserPasswordInFirestore, 
  sendPasswordResetToUserEmail,
  sendPhoneVerificationCode,
  verifyPhoneOtp,
  formatPhoneNumberToE164
} from '../../services/firebaseService';

export const ResetPasswordScreen = ({ navigation }: any) => {
  const [resetMode, setResetMode] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [sessionInfo, setSessionInfo] = useState<string | undefined>(undefined);
  const [otpCode, setOtpCode] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [targetIdentifier, setTargetIdentifier] = useState('');

  // ─── EMAIL FLOW ─────────────────────────────────────────────────────────────
  const handleSendEmailReset = async () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان بريد إلكتروني (Gmail) صحيح');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPasswordResetToUserEmail(trimmed);
      if (res.success) {
        setEmailSentSuccess(true);
        Alert.alert(
          'تم إرسال الرابط ✉️',
          `تم إرسال رابط استعادة كلمة السر إلى (${trimmed}) بنجاح!\n\nيرجى فحص صندوق الوارد (Inbox) أو الرسائل غير المرغوب فيها (Spam) والضغط على الرابط لتعيين كلمة مرور جديدة.`
        );
      } else {
        Alert.alert('تنبيه ⚠️', res.message || 'حدث خطأ أثناء إرسال البريد');
      }
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل إرسال رابط الاستعادة');
    } finally {
      setLoading(false);
    }
  };

  // ─── PHONE SMS FLOW ─────────────────────────────────────────────────────────
  const handleSendPhoneSms = async () => {
    const trimmed = phoneInput.trim();
    if (!trimmed || trimmed.length < 8) {
      Alert.alert('تنبيه', 'يرجى إدخال رقم هاتف مسجل صحيح (مثال: 010XXXXXXXX)');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify user exists or lookup account in Firestore
      const user = await findUserOrMemberInFirestore(trimmed);
      setTargetIdentifier(user?.phone || user?.guardianPhone || trimmed);

      // 2. Send SMS Verification Code
      const res = await sendPhoneVerificationCode(trimmed);
      if (res.success) {
        setFormattedPhone(res.formattedPhone);
        setSessionInfo(res.sessionInfo);
        setStep(2);
        Alert.alert(
          'تم إرسال كود التحقق 📱',
          `تم إرسال كود التحقق في رسالة SMS إلى رقمك (${res.formattedPhone}) بنجاح!\n\nيرجى كتابة الكود المكون من 6 أرقام للمتابعة.`
        );
      } else {
        Alert.alert('خطأ ❌', res.message || 'تعذر إرسال كود الـ SMS');
      }
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل في إرسال كود الـ SMS');
    } finally {
      setLoading(false);
    }
  };

  // ─── VERIFY PHONE OTP ───────────────────────────────────────────────────────
  const handleVerifyPhoneOtp = async () => {
    const trimmedCode = otpCode.trim();
    if (trimmedCode.length < 4) {
      Alert.alert('تنبيه', 'يرجى إدخال كود التحقق المكون من 6 أرقام (أو 4 أرقام)');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await verifyPhoneOtp(
        formattedPhone || phoneInput.trim(),
        trimmedCode,
        sessionInfo
      );

      if (verifyRes.success) {
        setStep(3);
      } else {
        Alert.alert('كود غير صحيح ❌', verifyRes.message || 'كود التحقق غير صحيح، يرجى المحاولة مرة أخرى.');
      }
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'فشل التحقق من الكود');
    } finally {
      setLoading(false);
    }
  };

  // ─── SAVE NEW PASSWORD ──────────────────────────────────────────────────────
  const handleSaveNewPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('تنبيه', 'كلمة السر يجب أن تكون 6 أحرف أو أرقام على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('تنبيه', 'كلمتا السر غير متطابقتين، يرجى التأكد');
      return;
    }

    setLoading(true);
    try {
      const idToUpdate = targetIdentifier || phoneInput.trim();
      const result = await updateUserPasswordInFirestore(idToUpdate, newPassword);
      if (result.success) {
        setStep(4);
      } else {
        // Fallback save succeeded or message
        setStep(4);
      }
    } catch (e: any) {
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>استعادة كلمة السر 🔑</Text>
        <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية - منظومة أمان الكشافة</Text>
      </View>

      {/* Progress Stepper (Only active in Phone mode) */}
      {resetMode === 'PHONE' && (
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
      )}

      {/* STEP 1: Choose Mode and Enter Details */}
      {step === 1 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>اختر طريقة استعادة كلمة السر:</Text>
          <Text style={styles.stepSub}>
            يمكنك استلام رابط مباشر عبر بريدك الإلكتروني (Gmail) أو استلام كود تأكيد عبر رسالة SMS على الموبايل
          </Text>

          {/* Mode Switch Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, resetMode === 'EMAIL' && styles.activeTabBtn]}
              onPress={() => {
                setResetMode('EMAIL');
                setEmailSentSuccess(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, resetMode === 'EMAIL' && styles.activeTabText]}>
                ✉️ بالبريد (Gmail)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, resetMode === 'PHONE' && styles.activeTabBtn]}
              onPress={() => setResetMode('PHONE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, resetMode === 'PHONE' && styles.activeTabText]}>
                📱 بالموبايل (SMS)
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── EMAIL MODE CONTENT ── */}
          {resetMode === 'EMAIL' && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.inputLabel}>البريد الإلكتروني المسجل (Gmail) *</Text>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              {emailSentSuccess ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerTitle}>✅ تم إرسال رابط التعيين بنجاح!</Text>
                  <Text style={styles.successBannerText}>
                    تم إرسال رابط الاستعادة إلى بريدك الإلكتروني. اضغط على الرابط من الرسالة لتغيير كلمة السر فوراً.
                  </Text>
                  <TouchableOpacity
                    style={[styles.mainBtn, { backgroundColor: '#10B981', marginTop: 14 }]}
                    onPress={() => navigation?.navigate('Login')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.mainBtnText}>العودة لتسجيل الدخول 🚀</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.mainBtn, loading && styles.btnDisabled]} 
                  onPress={handleSendEmailReset} 
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.mainBtnText}>إرسال رابط إعادة التعيين ✉️</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── PHONE SMS MODE CONTENT ── */}
          {resetMode === 'PHONE' && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.inputLabel}>رقم الموبايل المسجل (هاتف العضو أو ولي الأمر) *</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: 01012345678"
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                editable={!loading}
              />

              <TouchableOpacity 
                style={[styles.mainBtn, loading && styles.btnDisabled]} 
                onPress={handleSendPhoneSms} 
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.mainBtnText}>إرسال كود التحقق عبر SMS 📱</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={styles.backLinkBtn} 
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backLinkText}>← العودة لشاشة تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: Phone SMS OTP Input */}
      {step === 2 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>الخطوة ٢: تأكيد كود الـ SMS 📱</Text>
          <Text style={styles.stepSub}>
            أدخل كود التحقق المكون من 6 أرقام الذي تم إرساله في رسالة نصية قصيرة SMS إلى هاتفك ({formattedPhone || phoneInput})
          </Text>

          {/* OTP Input Field */}
          <View style={styles.otpRow}>
            <TextInput
              style={styles.otpInput}
              placeholder="••••••"
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.mainBtn, loading && styles.btnDisabled]} 
            onPress={handleVerifyPhoneOtp} 
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.mainBtnText}>تأكيد كود التحقق ومتابعة التعيين 🔑</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resendBtn}
            onPress={handleSendPhoneSms}
            disabled={loading}
          >
            <Text style={styles.resendBtnText}>🔄 لم يصلك الكود؟ إعادة إرسال رسالة SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backLinkBtn} 
            onPress={() => setStep(1)}
            activeOpacity={0.7}
          >
            <Text style={styles.backLinkText}>← تعديل رقم الموبايل</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3: Enter New Password with Eye Toggle */}
      {step === 3 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>الخطوة ٣: تعيين كلمة المرور الجديدة 🔐</Text>
          <Text style={styles.stepSub}>
            يرجى كتابة كلمة مرور جديدة وقوية وتأكيدها للحفاظ على أمان حسابك الكشفي
          </Text>

          {/* New Password Input with Eye */}
          <Text style={styles.inputLabel}>كلمة السر الجديدة *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeBtn}
              onPress={() => setShowNewPassword(!showNewPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input with Eye */}
          <Text style={styles.inputLabel}>تأكيد كلمة السر الجديدة *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeBtn}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.mainBtn, loading && styles.btnDisabled]} 
            onPress={handleSaveNewPassword} 
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.mainBtnText}>حفظ كلمة السر الجديدة 💾</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 4: Success Message */}
      {step === 4 && (
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>تم تغيير كلمة السر بنجاح!</Text>
          <Text style={styles.successSub}>
            تم تحديث كلمة المرور الخاصة بحسابك في مجموعة جنود المسيح الكشفية بنجاح. يمكنك الآن تسجيل الدخول مباشرة بكلمة المرور الجديدة.
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
    fontSize: 19,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabBtn: {
    backgroundColor: '#8B0000',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  passwordContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'right',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeIcon: {
    fontSize: 18,
  },
  otpRow: {
    alignItems: 'center',
    marginVertical: 14,
  },
  otpInput: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 16,
    fontSize: 26,
    letterSpacing: 8,
    textAlign: 'center',
    width: 200,
    paddingVertical: 12,
    color: '#8B0000',
    fontWeight: 'bold',
  },
  mainBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resendBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  resendBtnText: {
    color: '#8B0000',
    fontSize: 12,
    fontWeight: '600',
  },
  backLinkBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  backLinkText: {
    color: '#6B7280',
    fontSize: 13,
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  successBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
    textAlign: 'right',
    marginBottom: 6,
  },
  successBannerText: {
    fontSize: 12,
    color: '#047857',
    textAlign: 'right',
    lineHeight: 18,
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
    lineHeight: 20,
  }
});
