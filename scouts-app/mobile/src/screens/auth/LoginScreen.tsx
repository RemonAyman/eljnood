import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase.config';
import { useAuthStore } from '../../store/authStore';
import { validateLoginForm, isValidOTP, ValidationMessages } from '../../utils/validation';

// ─── Inline error component ───────────────────────────────────────────────────
const FieldError = ({ message }: { message?: string }) =>
  message ? <Text style={styles.fieldError}>{message}</Text> : null;

import { findUserOrMemberInFirestore } from '../../services/firebaseService';

export const LoginScreen = ({ navigation }: any) => {
  const setUser = useAuthStore((s) => s.setUser);
  const setPinUnlocked = useAuthStore((s) => s.setPinUnlocked);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Secret PIN Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleLogin = useCallback(async () => {
    const { valid, errors: formErrors } = validateLoginForm(identifier, password);
    setErrors(formErrors);
    if (!valid) return;

    setLoading(true);
    const cleanId = identifier.trim().toLowerCase();

    // 1. Check if it's the official Admin credentials
    if (cleanId === 'admin@scouts.org' && password.trim() === 'admin123') {
      setUser({
        id: 'admin_1',
        name: 'القائد العام / مدير الخدمة',
        code: 'ADMIN-001',
        role: 'ADMIN',
        phone: '01000000001',
        guardianPhone: '01000000001',
      });
      setLoading(false);
      navigation?.navigate('AdminDashboard');
      return;
    }

    // 2. Try Firebase Auth (if user entered email)
    let authUid = '';
    if (cleanId.includes('@')) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanId, password.trim());
        authUid = userCredential.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase auth attempt note:', authErr.message);
      }
    }

    // 3. Search Firestore for real user or member record
    const realUserDoc = await findUserOrMemberInFirestore(cleanId);

    if (realUserDoc) {
      const userRole = realUserDoc.role || 'CHILD';
      const realProfile = {
        id: realUserDoc.id || realUserDoc.uid || authUid || `u_${Date.now()}`,
        name: realUserDoc.name || 'عضو مسجل',
        code: realUserDoc.code || realUserDoc.sonCode || cleanId,
        role: userRole,
        phone: realUserDoc.phone || '',
        guardianPhone: realUserDoc.guardianPhone || '',
      };

      setUser(realProfile);
      setLoading(false);

      if (userRole === 'ADMIN') {
        navigation?.navigate('AdminDashboard');
      } else if (userRole === 'PARENT') {
        navigation?.navigate('ParentHome');
      } else if (userRole === 'LEADER' || userRole === 'SECTION_LEADER' || userRole === 'JOWALAH') {
        navigation?.navigate('Attendance');
      } else {
        navigation?.navigate('ChildHome');
      }
      return;
    }

    // 4. If neither admin nor found in Firestore -> Reject login
    setLoading(false);
    Alert.alert(
      'لم يتم العثور على الحساب ❌',
      'البريد الإلكتروني أو كود الكشاف غير مسجل في قاعدة البيانات.\n\nيرجى التأكد من صحة البيانات أو الضغط على "سجل الآن وانضم للفرقة" لإنشاء حسابك الجديد.',
      [
        { text: 'تسجيل حساب جديد', onPress: () => navigation?.navigate('RoleSelect') },
        { text: 'حسناً', style: 'cancel' }
      ]
    );
  }, [identifier, password, setUser, navigation]);


  const handleVerifyPin = useCallback(() => {
    if (!isValidOTP(pinInput, 4)) {
      setPinError(ValidationMessages.invalidOTP);
      return;
    }
    if (pinInput === '1234' || pinInput === '0000') {
      setPinUnlocked(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      Alert.alert('نجاح ✅', 'تم تفعيل صلاحيات أمين الصندوق والخصومات بنجاح! 🔑');
    } else {
      setPinError(ValidationMessages.pinIncorrect);
    }
  }, [pinInput, setPinUnlocked]);

  const handleClosePin = useCallback(() => {
    setShowPinModal(false);
    setPinInput('');
    setPinError('');
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Curved Header Banner */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>⚜️</Text>
        </View>
        <Text style={styles.groupTitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.churchSub}>النظام الكشفي المركزي الموحد</Text>
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
          style={[styles.input, errors.identifier ? styles.inputError : null]}
          placeholder="مثال: JS-2026-448 أو name@scouts.org"
          value={identifier}
          onChangeText={(t) => { setIdentifier(t); if (errors.identifier) setErrors(e => ({ ...e, identifier: '' })); }}
          autoCapitalize="none"
          textAlign="right"
        />
        <FieldError message={errors.identifier} />

        <View style={styles.passwordRow}>
          <Text style={styles.inputLabel}>كلمة المرور *</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('ResetPassword')}>
            <Text style={styles.forgotLink}>نسيت كلمة السر؟</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, errors.password ? styles.inputError : null]}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={(t) => { setPassword(t); if (errors.password) setErrors(e => ({ ...e, password: '' })); }}
          textAlign="right"
        />
        <FieldError message={errors.password} />

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>
            {loading ? 'جارى تسجيل الدخول...' : 'تسجيل الدخول إلى حسابك ←'}
          </Text>
        </TouchableOpacity>

        {/* Quick Admin Helper */}
        <View style={styles.demoSection}>
          <TouchableOpacity
            style={styles.adminDemoChip}
            onPress={() => {
              setIdentifier('admin@scouts.org');
              setPassword('admin123');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.demoChipText}>👑 ملء بيانات الأدمن العام (admin@scouts.org)</Text>
          </TouchableOpacity>
        </View>

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
        {/* Quick Barcode Attendance Banner from Stitch design */}
        <TouchableOpacity
          style={styles.quickAttendanceBtn}
          onPress={() => navigation?.navigate('Attendance')}
          activeOpacity={0.85}
        >
          <Text style={styles.quickAttendanceIcon}>📷</Text>
          <View style={styles.quickAttendanceTextWrap}>
            <Text style={styles.quickAttendanceTitle}>حاضر في طابور الصباح؟</Text>
            <Text style={styles.quickAttendanceSub}>تحضير سريع ومباشر بمسح الباركود</Text>
          </View>
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

        {/* Public Showcase Gateway Link */}
        <TouchableOpacity
          style={styles.publicPortalBtn}
          onPress={() => navigation?.navigate('PublicHome')}
          activeOpacity={0.85}
        >
          <Text style={styles.publicPortalText}>
            🌐 تعرف على المجموعة والأنشطة العامة (بوابة الزوار) ➔
          </Text>
        </TouchableOpacity>
      </View>

      {/* Secret PIN Modal */}
      <Modal visible={showPinModal} transparent animationType="fade" onRequestClose={handleClosePin}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>رمز PIN السري للمدير الخزينة 🔑</Text>
            <Text style={styles.modalSub}>أدخل الرمز السري المكون من 4 أرقام لتفعيل الخصومات</Text>

            <TextInput
              style={[styles.pinInput, pinError ? styles.pinInputError : null]}
              placeholder="••••"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pinInput}
              onChangeText={(t) => { setPinInput(t); if (pinError) setPinError(''); }}
            />
            {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={handleClosePin}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleVerifyPin}>
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
    marginBottom: 4,
    textAlign: 'right',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 10,
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
  loginBtnDisabled: {
    backgroundColor: '#B45309',
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  demoSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 8,
  },
  demoChipsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoChip: {
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  adminDemoChip: {
    backgroundColor: '#FEF2F2',
    borderColor: '#8B0000',
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
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
  quickAttendanceBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  quickAttendanceIcon: {
    fontSize: 24,
    marginLeft: 10,
  },
  quickAttendanceTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  quickAttendanceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  quickAttendanceSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  registerLinkContainer: {
    marginTop: 18,
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
  publicPortalBtn: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  publicPortalText: {
    fontSize: 12,
    color: '#D4A359',
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
    marginBottom: 8,
  },
  pinInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  pinErrorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
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
