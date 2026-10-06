import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { sendPasswordResetToUserEmail } from '../../services/firebaseService';

export const ResetPasswordScreen = ({ navigation }: any) => {
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // ─── EMAIL PASSWORD RESET (100% FREE VIA FIREBASE) ─────────────────────────
  const handleSendEmailReset = async () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('تنبيه ⚠️', 'يرجى إدخال عنوان بريد إلكتروني صحيح (مثال: example@gmail.com)');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPasswordResetToUserEmail(trimmed);
      if (res.success) {
        setEmailSentSuccess(true);
        Alert.alert(
          'تم إرسال الرابط ✉️',
          `تم إرسال رابط استعادة كلمة السر إلى بريدك (${trimmed}) بنجاح!\n\nيرجى فحص صندوق الوارد (Inbox) أو الرسائل غير المرغوب فيها (Spam) والضغط على الرابط المرفق لتعيين كلمة مرور جديدة.`
        );
      } else {
        Alert.alert('تنبيه ⚠️', res.message || 'حدث خطأ أثناء إرسال البريد');
      }
    } catch (e: any) {
      Alert.alert('خطأ ❌', e.message || 'فشل إرسال رابط الاستعادة');
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

      <View style={styles.stepCard}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✉️</Text>
        </View>

        <Text style={styles.stepTitle}>استعادة الحساب عبر البريد الإلكتروني</Text>
        <Text style={styles.stepSub}>
          اكتب عنوان بريدك الإلكتروني (Gmail) المسجل بحسابك، وسيصلك رابط آمن وفوري لإعادة تعيين كلمة السر بدون أي رسوم.
        </Text>

        <View style={{ marginTop: 14 }}>
          <Text style={styles.inputLabel}>البريد الإلكتروني المسجل (Gmail) *</Text>
          <TextInput
            style={styles.input}
            placeholder="name@gmail.com"
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
                تم إرسال رسالة بريد إلكتروني تحتوي على رابط تغيير كلمة المرور. يرجى فتح بريدك والضغط على الرابط لتسجيل كلمة سر جديدة.
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

        <TouchableOpacity
          style={styles.backLinkBtn}
          onPress={() => navigation?.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.backLinkText}>← العودة لشاشة تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 28,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
    textAlign: 'right',
  },
  mainBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  backLinkBtn: {
    marginTop: 20,
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
});
