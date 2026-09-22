import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { IconCardSelector, SelectorOption } from '../../components/ui/IconCardSelector';
import { Gender, ScarfStatus, GradeLevel } from '../../types';
import { calculateSquad } from '../../utils/squadCalculator';
import { useMembersStore } from '../../store/membersStore';
import { validateRegisterForm } from '../../utils/validation';

const FieldError = ({ message }: { message?: string }) =>
  message ? <Text style={styles.fieldError}>{message}</Text> : null;

export const RegisterScreen = ({ navigation }: any) => {
  const addMember = useMembersStore((s) => s.addMember);

  const [name, setName] = useState('');
  const [code, setCode] = useState(`JS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [gender, setGender] = useState<Gender>('MALE');
  const [scarfStatus, setScarfStatus] = useState<ScarfStatus>('RECEIVED');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('PREP_1');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [addressDescription, setAddressDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate squad automatically
  const calculatedSquad = calculateSquad(gradeLevel, gender);

  // Options for Gender Selector
  const genderOptions: SelectorOption<Gender>[] = [
    { value: 'MALE', label: 'ذكر (بنين)', icon: '♂️' },
    { value: 'FEMALE', label: 'أنثى (بنات)', icon: '♀️' }
  ];

  // Options for Scarf Status Selector (استلم المنديل | لم يستلم | مسحوب)
  const scarfOptions: SelectorOption<ScarfStatus>[] = [
    { value: 'RECEIVED', label: 'استلم المنديل', icon: '🧣', badgeText: 'مكتمل' },
    { value: 'NOT_RECEIVED', label: 'لم يستلم المنديل', icon: '❌', badgeText: 'جديد' },
    { value: 'WITHDRAWN', label: 'مسحوب المنديل', icon: '⚠️', badgeText: 'موقوف' }
  ];

  // Options for Grade Selector
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

  const handleSubmit = useCallback(() => {
    const { valid, errors: formErrors } = validateRegisterForm({ name, code, guardianPhone, phone });
    setErrors(formErrors);
    if (!valid) {
      Alert.alert('تنبيه', 'يرجى تصحيح الأخطاء المُشار إليها في النموذج');
      return;
    }

    addMember({
      name,
      code,
      gender,
      scarfStatus,
      birthDate: '2012-01-01',
      gradeLevel,
      squadName: calculatedSquad,
      phone,
      guardianPhone,
      region,
      street,
      buildingNo,
      addressDescription
    });

    Alert.alert('نجاح', `تم تسجيل الكشاف بنجاح ورُبط بفرقة (${calculatedSquad})!`, [
      { text: 'حسناً', onPress: () => navigation?.navigate('Login') }
    ]);
  }, [name, code, gender, scarfStatus, gradeLevel, guardianPhone, phone, region, street, buildingNo, addressDescription, calculatedSquad, addMember, navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>استمارة قيد عضو كشفي جديد</Text>
        <Text style={styles.headerSub}>مجموعة جنود المسيح الكشفية - كنيسة العذراء مريم</Text>
      </View>

      {/* Squad Auto-Calculation Live Preview Card */}
      <View style={styles.squadPreviewCard}>
        <Text style={styles.previewTitle}>الفرقة المستحقة أوتوماتيكياً:</Text>
        <View style={styles.squadBadgeRow}>
          <Text style={styles.squadBadgeIcon}>⚜️</Text>
          <Text style={styles.squadBadgeText}>فرقة {calculatedSquad}</Text>
        </View>
        <Text style={styles.previewSub}>
          تتحول أوتوماتيكياً بناءً على السنة الدراسية والنوع
        </Text>
      </View>

      {/* 1. البيانات الشخصية */}
      <Text style={styles.sectionHeader}>١. البيانات الشخصية الإجبارية</Text>

      <Text style={styles.inputLabel}>الاسم الرباعي للكشاف *</Text>
      <TextInput
        style={[styles.input, errors.name ? styles.inputError : null]}
        placeholder="أدخل الاسم الرباعي"
        value={name}
        onChangeText={(t) => { setName(t); if (errors.name) setErrors(e => ({ ...e, name: '' })); }}
        textAlign="right"
      />
      <FieldError message={errors.name} />

      <Text style={styles.inputLabel}>الكود الكشفي المخصص *</Text>
      <TextInput
        style={[styles.input, styles.readOnlyInput, errors.code ? styles.inputError : null]}
        value={code}
        editable={false}
      />
      <FieldError message={errors.code} />

      {/* Gender Icon Card Selector */}
      <IconCardSelector
        label="النوع *"
        options={genderOptions}
        selectedValue={gender}
        onSelect={(val) => setGender(val as Gender)}
      />

      {/* Scarf Status Icon Card Selector */}
      <IconCardSelector
        label="حالة المنديل الكشفي *"
        options={scarfOptions}
        selectedValue={scarfStatus}
        onSelect={(val) => setScarfStatus(val as ScarfStatus)}
      />

      {/* Grade Level Selector */}
      <IconCardSelector
        label="المرحلة الدراسية الحالية *"
        options={gradeOptions}
        selectedValue={gradeLevel}
        onSelect={(val) => setGradeLevel(val as GradeLevel)}
      />

      {/* 2. بيانات التواصل والعنوان */}
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

      <Text style={styles.inputLabel}>رقم موبايل الكشاف [اختياري]</Text>
      <TextInput
        style={[styles.input, errors.phone ? styles.inputError : null]}

        placeholder="010XXXXXXXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.inputLabel}>المنطقة [اختياري]</Text>
      <TextInput
        style={styles.input}
        placeholder="مثال: حي الجمهورية"
        value={region}
        onChangeText={setRegion}
      />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.inputLabel}>الشارع [اختياري]</Text>
          <TextInput
            style={styles.input}
            placeholder="اسم الشارع"
            value={street}
            onChangeText={setStreet}
          />
        </View>
        <View style={[styles.flex1, { marginLeft: 10 }]}>
          <Text style={styles.inputLabel}>رقم العمارة [اختياري]</Text>
          <TextInput
            style={styles.input}
            placeholder="رقم العمارة"
            value={buildingNo}
            onChangeText={setBuildingNo}
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>وصف تفصيلي للمكان [اختياري]</Text>
      <TextInput
        style={[styles.input, { height: 70 }]}
        placeholder="تفاصيل إضافية للعنوان"
        multiline
        value={addressDescription}
        onChangeText={setAddressDescription}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
        <Text style={styles.submitBtnText}>اعتماد وقيد الكشاف وإصدار الكارنيه ←</Text>
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
  squadPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D4A359',
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 20,
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
    marginBottom: 12,
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
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    marginTop: -8,
  },
});
