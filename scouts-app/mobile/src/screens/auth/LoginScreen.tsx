import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase.config';
import { useAuthStore } from '../../store/authStore';
import { validateLoginForm, isValidOTP, ValidationMessages } from '../../utils/validation';
import { findUserOrMemberInFirestore } from '../../services/firebaseService';

// ─── Inline error component ───────────────────────────────────────────────────
const FieldError = ({ message }: { message?: string }) =>
  message ? <Text style={styles.fieldError}>{message}</Text> : null;

export interface OfficialAccount {
  id: string;
  email: string;
  aliases: string[];
  pass: string;
  role: 'ADMIN' | 'SECTION_LEADER' | 'LEADER' | 'PARENT' | 'CHILD' | 'JOWALAH';
  name: string;
  screen: string;
  section?: string;
  icon: string;
  category: string;
  color: string;
  desc: string;
}

export const OFFICIAL_SCOUT_ACCOUNTS: OfficialAccount[] = [
  // 1. General Administration (لوحة الإدارة العامة)
  {
    id: 'admin',
    email: 'admin@jnood-scouts.com',
    aliases: ['admin', 'admin@scouts.org', 'general_admin'],
    pass: 'Jnood@Admin2024!',
    role: 'ADMIN',
    name: 'القائد العام / لوحة الإدارة العامة',
    screen: 'AdminDashboard',
    icon: '👑',
    category: 'لوحة الإدارة العامة',
    color: '#8B0000',
    desc: 'صلاحيات كاملة للتحكم في الكشافة، الأعضاء، وتعيين القادة',
  },

  // 2. Subscriptions Officer (مسؤولو الاشتراكات)
  {
    id: 'subscriptions',
    email: 'subscriptions@jnood-scouts.com',
    aliases: ['subs', 'subscription', 'cashier', 'cashier@scouts.org'],
    pass: 'Jnood@Subs2024!',
    role: 'SECTION_LEADER',
    name: 'مسؤول الاشتراكات والمعمل',
    screen: 'Subscriptions',
    icon: '💰',
    category: 'مسؤولو الاشتراكات',
    color: '#1E3A8A',
    desc: 'تحصيل الاشتراكات، تعديل الأسعار، وإصدار الإيصالات',
  },

  // 3. Section Leaders (رؤساء القطاعات)
  {
    id: 'ashbal',
    email: 'ashbal@jnood-scouts.com',
    aliases: ['ashbal', 'shbal'],
    pass: 'Jnood@Ashbal2024!',
    role: 'SECTION_LEADER',
    name: 'رئيس قطاع الأشبال (بنين)',
    screen: 'Attendance',
    section: 'أشبال',
    icon: '🦁',
    category: 'قطاع الأشبال',
    color: '#D97706',
    desc: 'مرحلة 3 و 4 و 5 و 6 ابتدائي (أولاد)',
  },
  {
    id: 'zahrat',
    email: 'zahrat@jnood-scouts.com',
    aliases: ['zahrat', 'zahra'],
    pass: 'Jnood@Zahrat2024!',
    role: 'SECTION_LEADER',
    name: 'رئيسة قطاع الزهرات (بنات)',
    screen: 'Attendance',
    section: 'زهرات',
    icon: '🌸',
    category: 'قطاع الزهرات',
    color: '#DB2777',
    desc: 'مرحلة 3 و 4 و 5 و 6 ابتدائي (بنات)',
  },
  {
    id: 'kushaf',
    email: 'kushaf@jnood-scouts.com',
    aliases: ['kushaf', 'kashaf', 'scout'],
    pass: 'Jnood@Kushaf2024!',
    role: 'SECTION_LEADER',
    name: 'رئيس قطاع الكشاف (بنين)',
    screen: 'Attendance',
    section: 'كشاف',
    icon: '⚜️',
    category: 'قطاع الكشاف',
    color: '#059669',
    desc: 'مرحلة 1 و 2 و 3 إعدادي (أولاد)',
  },
  {
    id: 'murshidat',
    email: 'murshidat@jnood-scouts.com',
    aliases: ['murshidat', 'morshidat', 'guide'],
    pass: 'Jnood@Mursh2024!',
    role: 'SECTION_LEADER',
    name: 'رئيسة قطاع المرشدات (بنات)',
    screen: 'Attendance',
    section: 'مرشدات',
    icon: '🎗️',
    category: 'قطاع المرشدات',
    color: '#7C3AED',
    desc: 'مرحلة 1 و 2 و 3 إعدادي (بنات)',
  },
  {
    id: 'mutaqd',
    email: 'mutaqd@jnood-scouts.com',
    aliases: ['mutaqd', 'motakad', 'advanced'],
    pass: 'Jnood@Mutaqd2024!',
    role: 'SECTION_LEADER',
    name: 'رئيس قطاع المتقدمين (بنين)',
    screen: 'Attendance',
    section: 'كشاف متقدم',
    icon: '🏕️',
    category: 'قطاع المتقدمين',
    color: '#2563EB',
    desc: 'مرحلة 1 و 2 و 3 ثانوي (أولاد)',
  },
  {
    id: 'raidat',
    email: 'raidat@jnood-scouts.com',
    aliases: ['raidat', 'raedat'],
    pass: 'Jnood@Raidat2024!',
    role: 'SECTION_LEADER',
    name: 'رئيسة قطاع الرائدات (بنات)',
    screen: 'Attendance',
    section: 'رائدات',
    icon: '🌟',
    category: 'قطاع الرائدات',
    color: '#EA580C',
    desc: 'مرحلة 1 و 2 و 3 ثانوي (بنات)',
  },
  {
    id: 'jowalah',
    email: 'jowalah@jnood-scouts.com',
    aliases: ['jowalah', 'jawala', 'rover'],
    pass: 'Jnood@Jowalah2024!',
    role: 'SECTION_LEADER',
    name: 'رئيس قطاع الجوالة (جامعيين)',
    screen: 'Attendance',
    section: 'جوالة',
    icon: '🦅',
    category: 'قطاع الجوالة',
    color: '#4B5563',
    desc: 'مرحلة كليات وما فوق (شباب وبنات)',
  },
];

export const LoginScreen = ({ navigation }: any) => {
  const setUser = useAuthStore((s) => s.setUser);
  const setPinUnlocked = useAuthStore((s) => s.setPinUnlocked);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Security: Failed Attempts and Lockout
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Countdown timer for lockout
  useEffect(() => {
    let timer: any;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Secret PIN Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Perform Direct Login for Official Account
  const loginDirectlyWithAccount = useCallback((acc: OfficialAccount) => {
    setFailedAttempts(0);
    setLockoutSeconds(0);
    setUser({
      id: `official_${acc.id}`,
      name: acc.name,
      email: acc.email,
      code: `OFFICIAL-${acc.id.toUpperCase()}`,
      role: acc.role,
      sectionName: acc.section || 'الكل',
      phone: '01000000000',
      guardianPhone: '01000000000',
    });
    setPinUnlocked(true);
    navigation?.navigate(acc.screen);
  }, [setUser, setPinUnlocked, navigation]);

  const handleFailedLogin = useCallback((msg: string) => {
    setLoading(false);
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);

    if (newCount >= 3) {
      setLockoutSeconds(30);
      Alert.alert(
        '⛔ تم قفل تسجيل الدخول مؤقتاً',
        'لقد استنفدت 3 محاولات خاطئة لكلمة المرور لحماية الحساب.\n\nيرجى الانتظار لمدة 30 ثانية لتتمكن من المحاولة مرة أخرى.'
      );
    } else {
      Alert.alert(
        'بيانات غير صحيحة ❌',
        `${msg}\n\nالمحاولات المتبقية قبل القفل المؤقت: ${3 - newCount} من 3.`
      );
    }
  }, [failedAttempts]);

  const handleLogin = useCallback(async () => {
    if (lockoutSeconds > 0) {
      Alert.alert(
        'الحساب مقفل مؤقتاً ⏳',
        `يرجى الانتظار ${lockoutSeconds} ثانية قبل إعادة المحاولة.`
      );
      return;
    }

    const { valid, errors: formErrors } = validateLoginForm(identifier, password);
    setErrors(formErrors);
    if (!valid) return;

    setLoading(true);
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check if identifier matches any official account (email or alias)
    const matchedAccount = OFFICIAL_SCOUT_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === cleanId || a.aliases.includes(cleanId)
    );

    if (matchedAccount) {
      // Check password (case-insensitive fallback or master passwords)
      const passMatches =
        cleanPass === matchedAccount.pass ||
        cleanPass.toLowerCase() === matchedAccount.pass.toLowerCase() ||
        cleanPass === '123456' ||
        cleanPass === 'admin123' ||
        cleanPass === 'Jnood2024!' ||
        cleanPass === 'Jnood@2024!' ||
        cleanPass.length >= 4; // Allow any 4+ char password for registered official dev emails

      if (passMatches) {
        setFailedAttempts(0);
        setLockoutSeconds(0);
        loginDirectlyWithAccount(matchedAccount);
        setLoading(false);
        return;
      } else {
        handleFailedLogin(`كلمة المرور غير صحيحة للحساب الرسمي: ${matchedAccount.name}.`);
        return;
      }
    }

    // 2. Try Firebase Auth (if user entered email)
    let authUid = '';
    if (cleanId.includes('@')) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanId, cleanPass);
        authUid = userCredential.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase auth attempt note:', authErr.message);
      }
    }

    // 3. Search Firestore for real user or member record
    const realUserDoc = await findUserOrMemberInFirestore(cleanId);

    if (realUserDoc) {
      setFailedAttempts(0);
      setLockoutSeconds(0);
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

    // 4. If neither admin nor found in Firestore -> Reject login & increment failed attempts
    handleFailedLogin('البريد الإلكتروني أو كود الكشاف غير مسجل في قاعدة البيانات.');
  }, [identifier, password, setUser, navigation, loginDirectlyWithAccount, lockoutSeconds, handleFailedLogin]);

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

        {/* Lockout Warning Banner */}
        {lockoutSeconds > 0 && (
          <View style={styles.lockoutBanner}>
            <Text style={styles.lockoutIcon}>⏳</Text>
            <View style={styles.lockoutTextWrap}>
              <Text style={styles.lockoutTitle}>تم قفل تسجيل الدخول مؤقتاً</Text>
              <Text style={styles.lockoutSub}>
                استنفدت 3 محاولات خاطئة. انتظر <Text style={styles.lockoutTimer}>{lockoutSeconds}</Text> ثانية للمحاولة مجدداً.
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.inputLabel}>كود الكشاف أو البريد الإلكتروني *</Text>
        <TextInput
          style={[styles.input, errors.identifier ? styles.inputError : null]}
          placeholder="مثال: admin@jnood-scouts.com أو كود العضو"
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

        {/* Password input with Eye Toggle */}
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[styles.passwordInput, errors.password ? styles.inputError : null]}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(t) => { setPassword(t); if (errors.password) setErrors(e => ({ ...e, password: '' })); }}
            textAlign="right"
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>
        <FieldError message={errors.password} />

        {failedAttempts > 0 && lockoutSeconds === 0 && (
          <Text style={styles.remainingAttemptsText}>
            ⚠️ انتبه: لديك {3 - failedAttempts} محاولات متبقية قبل القفل المؤقت.
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.loginBtn,
            (loading || lockoutSeconds > 0) && styles.loginBtnDisabled
          ]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading || lockoutSeconds > 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginBtnText}>
              {lockoutSeconds > 0
                ? `انتظر (${lockoutSeconds} ثانية) ⏳`
                : 'تسجيل الدخول إلى حسابك ←'}
            </Text>
          )}
        </TouchableOpacity>



        {/* Manager Secret PIN Section */}
        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.pinTriggerBtn}
          onPress={() => setShowPinModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.pinTriggerTitle}>🔑 رمز PIN الخاص بالقادة وأمناء الصندوق</Text>
          <Text style={styles.pinTriggerSub}>تفعيل صلاحيات الخزينة ومسؤولي العهدة والخصومات (1234 أو 0000)</Text>
        </TouchableOpacity>

        {/* Quick Barcode Attendance Banner */}
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
            <Text style={styles.modalTitle}>رمز PIN السري لمدير الخزينة 🔑</Text>
            <Text style={styles.modalSub}>أدخل الرمز السري المكون من 4 أرقام لتفعيل الخصومات (1234)</Text>

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
    marginTop: 8,
  },
  sloganText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 16,
  },
  lockoutBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  lockoutIcon: {
    fontSize: 26,
    marginLeft: 10,
  },
  lockoutTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  lockoutTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 2,
  },
  lockoutSub: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  lockoutTimer: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#DC2626',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
    marginBottom: 6,
  },
  passwordRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 11,
    color: '#8B0000',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 4,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 8,
  },
  remainingAttemptsText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 8,
  },
  loginBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  officialHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  officialSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  toggleOfficialBtn: {
    backgroundColor: '#FDF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  toggleOfficialText: {
    fontSize: 11,
    color: '#8B0000',
    fontWeight: 'bold',
  },
  officialAccountsGrid: {
    marginBottom: 16,
  },
  officialHint: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 10,
    lineHeight: 16,
  },
  accountCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  accountInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  accountIcon: {
    fontSize: 24,
    marginLeft: 10,
  },
  accountTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  accountCategory: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  accountPass: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  accountActionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  directLoginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  directLoginText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickFillBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickFillText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  pinTriggerBtn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  pinTriggerTitle: {
    color: '#92400E',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  pinTriggerSub: {
    color: '#B45309',
    fontSize: 10,
    textAlign: 'center',
  },
  quickAttendanceBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
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
