import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { IconCardSelector, SelectorOption } from '../../components/ui/IconCardSelector';
import { Gender, ScarfStatus, GradeLevel, SquadName } from '../../types';
import { calculateSquad } from '../../utils/squadCalculator';
import { useMembersStore } from '../../store/membersStore';
import { useAuthStore } from '../../store/authStore';
import { validateRegisterForm } from '../../utils/validation';
import { saveMemberToFirestore, saveUserToFirestore } from '../../services/firebaseService';

const FieldError = ({ message }: { message?: string }) =>
  message ? <Text style={styles.fieldError}>{message}</Text> : null;

type RoleType = 'CHILD' | 'PARENT' | 'LEADER';

export const RegisterScreen = ({ navigation, route }: any) => {
  const initialRole: RoleType = (route?.params?.role as RoleType) || 'CHILD';
  const [activeRole, setActiveRole] = useState<RoleType>(initialRole);

  const addMember = useMembersStore((s) => s.addMember);
  const setUser = useAuthStore((s) => s.setUser);

  // ─── Common Auth fields ───────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ─── Child Fields ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [code, setCode] = useState(`JS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [gender, setGender] = useState<Gender>('MALE');
  const [scarfStatus, setScarfStatus] = useState<ScarfStatus>('RECEIVED');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('PREP_1');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [childPhone, setChildPhone] = useState('');
  const [region, setRegion] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [addressDescription, setAddressDescription] = useState('');

  // ─── Parent Fields ────────────────────────────────────────────────────────────
  const [parentName, setParentName] = useState('');
  const [sonName, setSonName] = useState('');
  const [sonCode, setSonCode] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // ─── Leader / Jowalah Fields ──────────────────────────────────────────────────
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [servingSection, setServingSection] = useState<SquadName>('كشاف');
  const [sectionLeaderName, setSectionLeaderName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-calculated squad for Child
  const calculatedSquad = calculateSquad(gradeLevel, gender);

  const genderOptions: SelectorOption<Gender>[] = [
    { value: 'MALE', label: 'ذكر (بنين)', icon: '♂️' },
    { value: 'FEMALE', label: 'أنثى (بنات)', icon: '♀️' }
  ];

  const scarfOptions: SelectorOption<ScarfStatus>[] = [
    { value: 'RECEIVED', label: 'استلم المنديل', icon: '🧣', badgeText: 'مكتمل' },
    { value: 'NOT_RECEIVED', label: 'لم يستلم المنديل', icon: '❌', badgeText: 'جديد' },
    { value: 'WITHDRAWN', label: 'مسحوب المنديل', icon: '⚠️', badgeText: 'موقوف' }
  ];

  const gradeOptions: SelectorOption<GradeLevel>[] = [
    { value: 'KG1', label: 'KG 1', icon: '👶' },
    { value: 'KG2', label: 'KG 2', icon: '👶' },
    { value: 'GRADE_1', label: '1 ابتدائي', icon: '🎒' },
    { value: 'GRADE_2', label: '2 ابتدائي', icon: '🎒' },
    { value: 'GRADE_3', label: '3 ابتدائي', icon: '🎒' },
    { value: 'GRADE_4', label: '4 ابتدائي', icon: '🎒' },
    { value: 'GRADE_5', label: '5 ابتدائي', icon: '🎒' },
    { value: 'GRADE_6', label: '6 ابتدائي', icon: '🎒' },
    { value: 'PREP_1', label: '1 إعدادي', icon: '📖' },
    { value: 'PREP_2', label: '2 إعدادي', icon: '📖' },
    { value: 'PREP_3', label: '3 إعدادي', icon: '📖' },
    { value: 'SEC_1', label: '1 ثانوي', icon: '🏛️' },
    { value: 'SEC_2', label: '2 ثانوي', icon: '🏛️' },
    { value: 'SEC_3', label: '3 ثانوي', icon: '🏛️' },
    { value: 'COLLEGE_1', label: '1 كلية', icon: '🎓' },
    { value: 'COLLEGE_2', label: '2 كلية', icon: '🎓' },
    { value: 'COLLEGE_3', label: '3 كلية', icon: '🎓' },
    { value: 'COLLEGE_4', label: '4 كلية', icon: '🎓' },
    { value: 'GRADUATE', label: 'خريج', icon: '🏅' }
  ];

  const squadOptions: SelectorOption<SquadName>[] = [
    { value: 'براعم', label: 'براعم', icon: '🌱' },
    { value: 'أشبال', label: 'أشبال (بنين)', icon: '🦁' },
    { value: 'زهرات', label: 'زهرات (بنات)', icon: '🌸' },
    { value: 'كشاف', label: 'كشاف (بنين)', icon: '⛺' },
    { value: 'مرشدات', label: 'مرشدات (بنات)', icon: '🧭' },
    { value: 'متقدم', label: 'كشاف متقدم', icon: '🔥' },
    { value: 'رائدات', label: 'رائدات', icon: '⭐' },
    { value: 'جوالة', label: 'جوالة', icon: '🛡️' }
  ];

  const handleSubmit = useCallback(async () => {
    let validationData: any = {
      role: activeRole,
      name: activeRole === 'CHILD' ? name : activeRole === 'PARENT' ? parentName : leaderName,
      email,
      password,
      confirmPassword,
    };

    if (activeRole === 'CHILD') {
      validationData = {
        ...validationData,
        guardianPhone,
        phone: childPhone,
        code,
        addressDescription,
      };
    } else if (activeRole === 'PARENT') {
      validationData = {
        ...validationData,
        sonName,
        sonCode,
        guardianPhone: parentPhone,
      };
    } else {
      validationData = {
        ...validationData,
        phone: leaderPhone,
        sectionName: servingSection,
        sectionLeaderName,
      };
    }

    const { valid, errors: formErrors } = validateRegisterForm(validationData);
    setErrors(formErrors);
    if (!valid) {
      Alert.alert('تنبيه', 'يرجى مراجعة الحقول الإجبارية المُشار إليها بالأحمر');
      return;
    }

    setSubmitting(true);
    const uid = `u_${Date.now()}`;

    if (activeRole === 'CHILD') {
      const newMemberData = {
        name: name.trim(),
        code: code.trim(),
        gender,
        scarfStatus,
        birthDate: '2012-01-01',
        gradeLevel,
        squadName: calculatedSquad,
        phone: childPhone.trim(),
        guardianPhone: guardianPhone.trim(),
        region: region.trim(),
        street: street.trim(),
        buildingNo: buildingNo.trim(),
        addressDescription: addressDescription.trim(),
      };

      // 1. Add locally
      const localMember = addMember(newMemberData);

      // 2. Save Member & User to Firestore
      await saveMemberToFirestore(localMember);
      await saveUserToFirestore({
        uid,
        name: name.trim(),
        email: email.trim(),
        role: 'CHILD',
        code: code.trim(),
        phone: childPhone.trim(),
        guardianPhone: guardianPhone.trim(),
        sectionName: calculatedSquad,
      });

      setUser({
        id: uid,
        name: name.trim(),
        code: code.trim(),
        role: 'CHILD',
        sectionName: calculatedSquad,
        phone: childPhone.trim(),
        guardianPhone: guardianPhone.trim(),
      });

      setSubmitting(false);
      Alert.alert(
        'مرحباً بك يا بطل! 🎉',
        `تم تسجيلك بنجاح في قطاع (${calculatedSquad})\nكودك الكشفي: ${code}`,
        [{ text: 'دخول التطبيق ➔', onPress: () => navigation?.navigate('ChildHome') }]
      );
    } else if (activeRole === 'PARENT') {
      await saveUserToFirestore({
        uid,
        name: parentName.trim(),
        email: email.trim(),
        role: 'PARENT',
        phone: parentPhone.trim(),
        guardianPhone: parentPhone.trim(),
        sonName: sonName.trim(),
        sonCode: sonCode.trim(),
        sectionName: 'أشبال',
      });

      setUser({
        id: uid,
        name: parentName.trim(),
        code: sonCode.trim(),
        role: 'PARENT',
        sectionName: 'أشبال',
        phone: parentPhone.trim(),
        guardianPhone: parentPhone.trim(),
      });

      setSubmitting(false);
      Alert.alert(
        'مرحباً بك! 👨‍👩‍👦',
        `تم تسجيل حساب ولي الأمر وربطه بكود الابن (${sonCode}) بنجاح!`,
        [{ text: 'دخول لوحة المتابعة ➔', onPress: () => navigation?.navigate('ParentHome') }]
      );
    } else {
      // Leader / Jowalah
      await saveUserToFirestore({
        uid,
        name: leaderName.trim(),
        email: email.trim(),
        role: 'LEADER',
        phone: leaderPhone.trim(),
        sectionName: servingSection,
        sectionLeaderName: sectionLeaderName.trim(),
      });

      setUser({
        id: uid,
        name: leaderName.trim(),
        code: `LEADER-${Math.floor(10 + Math.random() * 90)}`,
        role: 'LEADER',
        sectionName: servingSection,
        phone: leaderPhone.trim(),
        guardianPhone: leaderPhone.trim(),
      });

      setSubmitting(false);
      Alert.alert(
        'مرحباً بك يا قائد! ⚜️',
        `تم تسجيلك كخادم في قطاع (${servingSection}) تحت إشراف القائد (${sectionLeaderName})`,
        [{ text: 'دخول المنظومة الكشفية ➔', onPress: () => navigation?.navigate('Attendance') }]
      );
    }
  }, [
    activeRole,
    name,
    code,
    gender,
    scarfStatus,
    gradeLevel,
    guardianPhone,
    childPhone,
    region,
    street,
    buildingNo,
    addressDescription,
    calculatedSquad,
    parentName,
    sonName,
    sonCode,
    parentPhone,
    leaderName,
    leaderPhone,
    servingSection,
    sectionLeaderName,
    email,
    password,
    confirmPassword,
    addMember,
    setUser,
    navigation,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Banner */}
        <View style={styles.header}>
          <View style={styles.headerLogoCircle}>
            <Image
              source={require('../../../assets/logo.jpeg')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>إنشاء حساب كشفي جديد</Text>
          <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية</Text>
        </View>

        {/* Role Switcher Tabs */}
        <View style={styles.roleTabsContainer}>
          <TouchableOpacity
            style={[styles.roleTab, activeRole === 'CHILD' && styles.roleTabActive]}
            onPress={() => { setActiveRole('CHILD'); setErrors({}); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleTabText, activeRole === 'CHILD' && styles.roleTabTextActive]}>
              ⛺ طفل / كشاف
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, activeRole === 'PARENT' && styles.roleTabActive]}
            onPress={() => { setActiveRole('PARENT'); setErrors({}); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleTabText, activeRole === 'PARENT' && styles.roleTabTextActive]}>
              👨‍👩‍👦 ولي أمر
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, activeRole === 'LEADER' && styles.roleTabActive]}
            onPress={() => { setActiveRole('LEADER'); setErrors({}); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleTabText, activeRole === 'LEADER' && styles.roleTabTextActive]}>
              ⚜️ قائد / جوالة
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── 1. CHILD REGISTRATION FORM ─────────────────────────────────────────── */}
        {activeRole === 'CHILD' && (
          <View>
            {/* Squad Auto-Calculation Live Badge */}
            <View style={styles.squadPreviewCard}>
              <Text style={styles.previewTitle}>الفرقة والقطاع المستحق تلقائياً:</Text>
              <View style={styles.squadBadgeRow}>
                <Text style={styles.squadBadgeIcon}>⚜️</Text>
                <Text style={styles.squadBadgeText}>قطاع {calculatedSquad}</Text>
              </View>
              <Text style={styles.previewSub}>
                يتحدد أوتوماتيكياً بناءً على السنة الدراسية والنوع
              </Text>
            </View>

            <Text style={styles.sectionHeader}>١. بيانات الكشاف الأساسية</Text>

            <Text style={styles.inputLabel}>الاسم الرباعي للكشاف * [إجباري]</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="مثال: بيتر يوسف فايز مسعود"
              value={name}
              onChangeText={(t) => { setName(t); if (errors.name) setErrors(e => ({ ...e, name: '' })); }}
              textAlign="right"
            />
            <FieldError message={errors.name} />

            <Text style={styles.inputLabel}>الكود الكشفي المخصص * [إجباري]</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={code}
              editable={false}
            />

            {/* Gender Selector */}
            <IconCardSelector
              label="النوع * [إجباري]"
              options={genderOptions}
              selectedValue={gender}
              onSelect={(val) => setGender(val as Gender)}
            />

            {/* Grade Level Selector */}
            <IconCardSelector
              label="السنة الدراسية * [إجباري]"
              options={gradeOptions}
              selectedValue={gradeLevel}
              onSelect={(val) => setGradeLevel(val as GradeLevel)}
            />

            {/* Scarf Status */}
            <IconCardSelector
              label="حالة المنديل الكشفي *"
              options={scarfOptions}
              selectedValue={scarfStatus}
              onSelect={(val) => setScarfStatus(val as ScarfStatus)}
            />

            <Text style={styles.sectionHeader}>٢. بيانات التواصل والعنوان</Text>

            <Text style={styles.inputLabel}>رقم موبايل ولي الأمر (واتساب) * [إجباري]</Text>
            <TextInput
              style={[styles.input, errors.guardianPhone ? styles.inputError : null]}
              placeholder="012XXXXXXXX"
              keyboardType="phone-pad"
              value={guardianPhone}
              onChangeText={(t) => { setGuardianPhone(t); if (errors.guardianPhone) setErrors(e => ({ ...e, guardianPhone: '' })); }}
              textAlign="right"
              maxLength={11}
            />
            <FieldError message={errors.guardianPhone} />

            <Text style={styles.inputLabel}>رقم موبايل الطفل [اختياري]</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              placeholder="010XXXXXXXX"
              keyboardType="phone-pad"
              value={childPhone}
              onChangeText={setChildPhone}
              textAlign="right"
              maxLength={11}
            />
            <FieldError message={errors.phone} />

            <Text style={styles.inputLabel}>المنطقة [اختياري]</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: أسيوط - حي الجمهورية"
              value={region}
              onChangeText={setRegion}
              textAlign="right"
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>الشارع [اختياري]</Text>
                <TextInput
                  style={styles.input}
                  placeholder="اسم الشارع"
                  value={street}
                  onChangeText={setStreet}
                  textAlign="right"
                />
              </View>
              <View style={[styles.flex1, { marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>رقم العمارة [اختياري]</Text>
                <TextInput
                  style={styles.input}
                  placeholder="رقم العمارة"
                  value={buildingNo}
                  onChangeText={setBuildingNo}
                  textAlign="right"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>وصف تفصيلي للعنوان * [إجباري]</Text>
            <TextInput
              style={[styles.input, { height: 60 }, errors.addressDescription ? styles.inputError : null]}
              placeholder="مثال: الدور الثالث شقة 5 بالقرب من الكنيسة"
              multiline
              value={addressDescription}
              onChangeText={(t) => { setAddressDescription(t); if (errors.addressDescription) setErrors(e => ({ ...e, addressDescription: '' })); }}
              textAlign="right"
            />
            <FieldError message={errors.addressDescription} />
          </View>
        )}

        {/* ─── 2. PARENT REGISTRATION FORM ────────────────────────────────────────── */}
        {activeRole === 'PARENT' && (
          <View>
            <Text style={styles.sectionHeader}>بيانات ولي الأمر والربط بالابن</Text>

            <Text style={styles.inputLabel}>اسم ولي الأمر بالكامل * [إجباري]</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="مثال: يوسف فايز مسعود"
              value={parentName}
              onChangeText={(t) => { setParentName(t); if (errors.name) setErrors(e => ({ ...e, name: '' })); }}
              textAlign="right"
            />
            <FieldError message={errors.name} />

            <Text style={styles.inputLabel}>اسم الابن أو الابنة الكشاف * [إجباري]</Text>
            <TextInput
              style={[styles.input, errors.sonName ? styles.inputError : null]}
              placeholder="مثال: بيتر يوسف فايز"
              value={sonName}
              onChangeText={(t) => { setSonName(t); if (errors.sonName) setErrors(e => ({ ...e, sonName: '' })); }}
              textAlign="right"
            />
            <FieldError message={errors.sonName} />

            <Text style={styles.inputLabel}>كود الكشاف الخاص بالابن * [إجباري للربط]</Text>
            <TextInput
              style={[styles.input, errors.sonCode ? styles.inputError : null]}
              placeholder="مثال: JS-2026-448"
              value={sonCode}
              onChangeText={(t) => { setSonCode(t); if (errors.sonCode) setErrors(e => ({ ...e, sonCode: '' })); }}
              textAlign="right"
              autoCapitalize="characters"
            />
            <FieldError message={errors.sonCode} />

            <Text style={styles.inputLabel}>رقم موبايل ولي الأمر (واتساب) * [إجباري]</Text>
            <TextInput
              style={[styles.input, errors.guardianPhone ? styles.inputError : null]}
              placeholder="012XXXXXXXX"
              keyboardType="phone-pad"
              value={parentPhone}
              onChangeText={(t) => { setParentPhone(t); if (errors.guardianPhone) setErrors(e => ({ ...e, guardianPhone: '' })); }}
              textAlign="right"
              maxLength={11}
            />
            <FieldError message={errors.guardianPhone} />
          </View>
        )}

        {/* ─── 3. LEADER / JOWALAH REGISTRATION FORM ─────────────────────────────── */}
        {activeRole === 'LEADER' && (
          <View>
            <Text style={styles.sectionHeader}>بيانات الخادم والقائد والقطاع</Text>

            <Text style={styles.inputLabel}>اسم الخادم / القائد بالكامل * [إجباري]</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="مثال: القائد مينا نبيل عزمي"
              value={leaderName}
              onChangeText={(t) => { setLeaderName(t); if (errors.name) setErrors(e => ({ ...e, name: '' })); }}
              textAlign="right"
            />
            <FieldError message={errors.name} />

            <Text style={styles.inputLabel}>رقم الموبايل * [إجباري]</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              placeholder="011XXXXXXXX"
              keyboardType="phone-pad"
              value={leaderPhone}
              onChangeText={(t) => { setLeaderPhone(t); if (errors.phone) setErrors(e => ({ ...e, phone: '' })); }}
              textAlign="right"
              maxLength={11}
            />
            <FieldError message={errors.phone} />

            {/* Section selection */}
            <IconCardSelector
              label="القطاع الذي يخدم فيه * [إجباري]"
              options={squadOptions}
              selectedValue={servingSection}
              onSelect={(val) => setServingSection(val as SquadName)}
            />

            <Text style={styles.inputLabel}>اسم رئيس القطاع التابع له * [إجباري]</Text>
            <TextInput
              style={[styles.input, errors.sectionLeaderName ? styles.inputError : null]}
              placeholder="مثال: القائد جورج سامي (رئيس القطاع)"
              value={sectionLeaderName}
              onChangeText={(t) => { setSectionLeaderName(t); if (errors.sectionLeaderName) setErrors(e => ({ ...e, sectionLeaderName: '' })); }}
              textAlign="right"
            />
            <FieldError message={errors.sectionLeaderName} />
          </View>
        )}

        {/* ─── COMMON ACCOUNT CREDENTIALS (Email & Password) ────────────────────── */}
        <Text style={styles.sectionHeader}>بيانات الحساب وكلمة المرور للدخول</Text>

        <Text style={styles.inputLabel}>البريد الإلكتروني * [إجباري]</Text>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="example@scouts.org"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(e => ({ ...e, email: '' })); }}
          textAlign="right"
        />
        <FieldError message={errors.email} />

        <Text style={styles.inputLabel}>كلمة المرور * [إجباري]</Text>
        <TextInput
          style={[styles.input, errors.password ? styles.inputError : null]}
          placeholder="•••••••• (6 أحرف أو أكثر)"
          secureTextEntry
          value={password}
          onChangeText={(t) => { setPassword(t); if (errors.password) setErrors(e => ({ ...e, password: '' })); }}
          textAlign="right"
        />
        <FieldError message={errors.password} />

        <Text style={styles.inputLabel}>تأكيد كلمة المرور * [إجباري]</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
          placeholder="••••••••"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(t) => { setConfirmPassword(t); if (errors.confirmPassword) setErrors(e => ({ ...e, confirmPassword: '' })); }}
          textAlign="right"
        />
        <FieldError message={errors.confirmPassword} />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? 'جارٍ تسجيل الحساب في السحابة...' : 'إنشاء الحساب الكشفي واعتماده ←'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginBackBtn}
          onPress={() => navigation?.navigate('Login')}
        >
          <Text style={styles.loginBackText}>
            لديك حساب مسجل بالفعل؟ <Text style={styles.boldRed}>تسجيل الدخول</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  header: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#D4A359',
    overflow: 'hidden',
    padding: 2,
  },
  headerLogoImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  roleTabsContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleTabActive: {
    backgroundColor: '#8B0000',
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  squadPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D4A359',
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  squadBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  squadBadgeIcon: {
    fontSize: 22,
    marginLeft: 6,
  },
  squadBadgeText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  previewSub: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 14,
    marginBottom: 10,
    textAlign: 'right',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'right',
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  row: {
    flexDirection: 'row-reverse',
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loginBackBtn: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 8,
  },
  loginBackText: {
    fontSize: 13,
    color: '#4B5563',
  },
  boldRed: {
    color: '#8B0000',
    fontWeight: 'bold',
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
    marginTop: -6,
  },
});
