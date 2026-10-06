import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
  Switch,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { isValidPassword } from '../../utils/validation';
import { saveUserToFirestore, saveMemberToFirestore } from '../../services/firebaseService';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';
import { pickImageFromGallery, takePhotoWithCamera } from '../../utils/imagePickerHelper';
import { Role } from '../../types';

const PRESET_AVATARS = [
  '👑', '⚜️', '⛺', '🐺', '🦁', '🦅', '⛵', '🏆', '🌟', '🕊️'
];

export const UserProfileScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);

  // Edit Profile Modal & State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editGuardianPhone, setEditGuardianPhone] = useState(user?.guardianPhone || '');
  const [editSectionName, setEditSectionName] = useState(user?.sectionName || '');
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // Change Password Modal & State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [passError, setPassError] = useState('');

  // Handle Editing Profile Details
  const handleOpenEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditGuardianPhone(user?.guardianPhone || '');
    setEditSectionName(user?.sectionName || '');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الاسم بالكامل');
      return;
    }

    setLoadingEdit(true);
    try {
      const updatedProfile = {
        ...user!,
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        guardianPhone: editGuardianPhone.trim(),
        sectionName: editSectionName.trim(),
      };

      // 1. Save to Zustand Auth Store
      setUser(updatedProfile);

      // 2. Save to Firestore Users collection
      if (user?.id) {
        await saveUserToFirestore({
          uid: user.id,
          name: updatedProfile.name,
          email: updatedProfile.email || '',
          role: updatedProfile.role,
          code: updatedProfile.code,
          phone: updatedProfile.phone,
          guardianPhone: updatedProfile.guardianPhone,
          sectionName: updatedProfile.sectionName,
          avatarBase64: updatedProfile.avatarBase64,
        });
      }

      setLoadingEdit(false);
      setShowEditProfileModal(false);
      Alert.alert('نجاح ✅', 'تم تحديث البيانات الشخصية بنجاح!');
    } catch (e: any) {
      setLoadingEdit(false);
      Alert.alert('خطأ', 'تعذر تحديث البيانات: ' + e.message);
    }
  };

  // Handle Pick/Upload Base64 Image
  const handleSelectPresetAvatar = async (emoji: string) => {
    try {
      const updated = { ...user!, avatarBase64: undefined };
      setUser(updated);
      if (user?.id) {
        await saveUserToFirestore({
          uid: user.id,
          name: updated.name,
          email: updated.email || '',
          role: updated.role,
          avatarBase64: '',
        });
      }
      setShowAvatarModal(false);
    } catch (e) {
      console.warn('Avatar set error:', e);
    }
  };

  const handlePickFromGallery = async () => {
    setLoadingAvatar(true);
    try {
      const base64Data = await pickImageFromGallery({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (base64Data) {
        await saveAvatarBase64(base64Data);
      }
    } catch (e: any) {
      Alert.alert('خطأ', 'تعذر اختيار الصورة: ' + (e?.message || ''));
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handlePickFromCamera = async () => {
    setLoadingAvatar(true);
    try {
      const base64Data = await takePhotoWithCamera({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (base64Data) {
        await saveAvatarBase64(base64Data);
      }
    } catch (e: any) {
      Alert.alert('خطأ', 'تعذر التقاط الصورة: ' + (e?.message || ''));
    } finally {
      setLoadingAvatar(false);
    }
  };

  const saveAvatarBase64 = async (base64String: string) => {
    setLoadingAvatar(true);
    try {
      const updated = { ...user!, avatarBase64: base64String };
      setUser(updated);

      if (user?.id) {
        await saveUserToFirestore({
          uid: user.id,
          name: updated.name,
          email: updated.email || '',
          role: updated.role,
          code: updated.code,
          phone: updated.phone,
          guardianPhone: updated.guardianPhone,
          sectionName: updated.sectionName,
          avatarBase64: base64String,
        });
      }

      if (user?.code) {
        await saveMemberToFirestore({
          id: user.id,
          code: user.code,
          name: updated.name,
          role: updated.role as Role,
          avatarBase64: base64String,
        } as any).catch((e) => console.warn('Sync member avatar:', e));
      }

      setLoadingAvatar(false);
      setShowAvatarModal(false);
      Alert.alert('تم التحديث 📸', 'تم حفظ وتعيين صورتك الشخصية بنجاح!');
    } catch (e: any) {
      setLoadingAvatar(false);
      Alert.alert('خطأ', 'تعذر حفظ الصورة: ' + e.message);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!currentPass.trim()) {
      setPassError('يرجى إدخال كلمة السر الحالية');
      return;
    }
    if (!isValidPassword(newPass)) {
      setPassError('كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('كلمات السر الجديدة غير متطابقة');
      return;
    }

    setLoadingPass(true);
    try {
      if (user?.id) {
        await saveUserToFirestore({
          uid: user.id,
          name: user.name,
          email: user.email || '',
          role: user.role,
          password: newPass,
        });
      }
      setLoadingPass(false);
      setShowPasswordModal(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setPassError('');
      Alert.alert('نجاح ✅', 'تم تحديث كلمة السر بنجاح!');
    } catch (e: any) {
      setLoadingPass(false);
      Alert.alert('خطأ', 'تعذر تحديث كلمة السر: ' + e.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من الخروج من حسابك الكشفي؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation?.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header Profile Banner */}
        <View style={styles.profileHeaderCard}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.8}
          >
            {user?.avatarBase64 ? (
              <Image source={{ uri: user.avatarBase64 }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {user?.role === 'ADMIN'
                    ? '👑'
                    : user?.role === 'LEADER'
                    ? '⚜️'
                    : user?.role === 'PARENT'
                    ? '👨‍👩‍👧'
                    : '🏆'}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraBadgeText}>📸</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.name || 'عضو الكشافة'}</Text>
          <Text style={styles.userCode}>الكود الكشفي: {user?.code || 'OFFICIAL'}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {user?.role === 'ADMIN'
                ? 'الإدارة العامة / Admin'
                : user?.role === 'LEADER'
                ? `قائد / خادم قطاع ${user?.sectionName || ''}`
                : user?.role === 'PARENT'
                ? 'ولي أمر كشاف'
                : `عضو كشفي - قطاع ${user?.sectionName || ''}`}
            </Text>
          </View>
        </View>

        {/* Account Details Card & Edit Button */}
        <View style={styles.sectionHeaderRow}>
          <TouchableOpacity
            style={styles.editBtnHeader}
            onPress={handleOpenEditModal}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnHeaderText}>✏️ تعديل البيانات</Text>
          </TouchableOpacity>
          <Text style={styles.sectionHeader}>البيانات الشخصية المسجلة</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{user?.name || 'غير محدد'}</Text>
            <Text style={styles.infoLabel}>👤 الاسم بالكامل:</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{user?.email || 'لا يوجد بريد مسجل'}</Text>
            <Text style={styles.infoLabel}>✉️ البريد الإلكتروني:</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{user?.phone || 'غير مدخل'}</Text>
            <Text style={styles.infoLabel}>📱 رقم تليفون العضو:</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{user?.guardianPhone || 'غير مدخل'}</Text>
            <Text style={styles.infoLabel}>📞 رقم تليفون ولي الأمر:</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{user?.sectionName || 'الكل'}</Text>
            <Text style={styles.infoLabel}>⚜️ القطاع الكشفي:</Text>
          </View>
        </View>

        {/* Security & Account Settings */}
        <Text style={styles.sectionHeader}>إعدادات الأمان والحساب</Text>
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleOpenEditModal}
            activeOpacity={0.8}
          >
            <Text style={styles.actionArrow}>➔</Text>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>تعديل الملف الشخصي ✏️</Text>
              <Text style={styles.actionSub}>تحديث الاسم، البريد، رقم الهاتف، والقطاع الكشفي</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionArrow}>➔</Text>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>تغيير الصورة الشخصية (Base64) 📸</Text>
              <Text style={styles.actionSub}>رفع صورة شخصية وتخزينها في قاعدة بيانات الفايربيز</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={toggleDarkMode}
            activeOpacity={0.8}
          >
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#CBD5E1', true: '#D4A359' }}
              thumbColor={isDarkMode ? '#8B0000' : '#F8FAFC'}
            />
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>الوضع الليلي (Dark Mode) 🌙</Text>
              <Text style={styles.actionSub}>تفعيل الثيم الداكن المريح للعين أثناء الأنشطة والمعسكرات الليلية</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowPasswordModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionArrow}>➔</Text>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>تغيير كلمة السر 🔒</Text>
              <Text style={styles.actionSub}>تحديث كلمة المرور لحماية الحساب الكشفي</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation?.navigate('ResetPassword')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionArrow}>➔</Text>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>استعادة كلمة السر 🔑</Text>
              <Text style={styles.actionSub}>إعادة تعيين كلمة السر عبر البريد الإلكتروني (Gmail)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionArrow, { color: '#EF4444' }]}>➔</Text>
            <View style={styles.actionTextWrap}>
              <Text style={[styles.actionTitle, { color: '#EF4444' }]}>تسجيل الخروج 🚪</Text>
              <Text style={styles.actionSub}>الخروج من الحساب والعودة لشاشة الدخول</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>تعديل البيانات الشخصية ✏️</Text>
            <Text style={styles.modalSub}>قم بتعديل بياناتك المسجلة في المنظومة الكشفية</Text>

            <Text style={styles.fieldLabel}>الاسم بالكامل:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="الاسم بالكامل..."
              value={editName}
              onChangeText={setEditName}
              textAlign="right"
            />

            <Text style={styles.fieldLabel}>البريد الإلكتروني:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="البريد الإلكتروني..."
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              textAlign="right"
            />

            <Text style={styles.fieldLabel}>رقم تليفون العضو:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="رقم الموبايل..."
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              textAlign="right"
            />

            <Text style={styles.fieldLabel}>رقم تليفون ولي الأمر:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="رقم ولي الأمر..."
              value={editGuardianPhone}
              onChangeText={setEditGuardianPhone}
              keyboardType="phone-pad"
              textAlign="right"
            />

            <Text style={styles.fieldLabel}>القطاع الكشفي:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="مثال: الكشاف والمرشدات أو الأشبال..."
              value={editSectionName}
              onChangeText={setEditSectionName}
              textAlign="right"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowEditProfileModal(false)}
              >
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={handleSaveProfile}
                disabled={loadingEdit}
              >
                {loadingEdit ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>حفظ التغييرات ✅</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar / Picture Selector Modal */}
      <Modal visible={showAvatarModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>تغيير الصورة الشخصية 📸</Text>
            <Text style={styles.modalSub}>اختر صورة من جهازك أو شارة كشفية رمزية</Text>

            <View style={{ width: '100%', gap: 10, marginVertical: 8 }}>
              <TouchableOpacity
                style={styles.uploadFileBtn}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
                disabled={loadingAvatar}
              >
                {loadingAvatar ? (
                  <ActivityIndicator color="#8B0000" />
                ) : (
                  <Text style={styles.uploadFileBtnText}>🖼️ اختيار صورة من المعرض (Base64)</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadFileBtn, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}
                onPress={handlePickFromCamera}
                activeOpacity={0.8}
                disabled={loadingAvatar}
              >
                {loadingAvatar ? (
                  <ActivityIndicator color="#8B0000" />
                ) : (
                  <Text style={[styles.uploadFileBtnText, { color: '#92400E' }]}>📸 التقاط صورة جديدة بالكاميرا</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { textAlign: 'center', marginVertical: 10 }]}>
              أو اختر شارة رمزيّة كشفية:
            </Text>

            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((emoji, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetItem}
                  onPress={() => handleSelectPresetAvatar(emoji)}
                >
                  <Text style={styles.presetEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelBtn, { width: '100%', marginTop: 14 }]}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.cancelBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>تغيير كلمة المرور 🔒</Text>
            <Text style={styles.modalSub}>أدخل كلمة السر الحالية والجديدة لتحديث الحساب</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="كلمة السر الحالية..."
              secureTextEntry
              value={currentPass}
              onChangeText={setCurrentPass}
              textAlign="right"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="كلمة السر الجديدة (6 أحرف أو أكثر)..."
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
              textAlign="right"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="تأكيد كلمة السر الجديدة..."
              secureTextEntry
              value={confirmPass}
              onChangeText={setConfirmPass}
              textAlign="right"
            />

            {passError ? <Text style={styles.errorText}>{passError}</Text> : null}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassError('');
                }}
              >
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={handleChangePassword}
                disabled={loadingPass}
              >
                {loadingPass ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>حفظ كلمة السر ✅</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} currentRoute="UserProfile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  profileHeaderCard: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#D4A359',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#D4A359',
  },
  avatarText: {
    fontSize: 38,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D4A359',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraBadgeText: {
    fontSize: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userCode: {
    fontSize: 12,
    color: '#D4A359',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: 'rgba(212, 163, 89, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
  },
  editBtnHeader: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  editBtnHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },
  infoValue: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionArrow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginRight: 10,
  },
  actionTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    alignSelf: 'flex-end',
    marginBottom: 4,
    marginTop: 4,
  },
  modalInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 8,
    width: '100%',
  },
  uploadFileBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#D4A359',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  uploadFileBtnText: {
    color: '#92400E',
    fontWeight: 'bold',
    fontSize: 13,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 6,
  },
  presetItem: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetEmoji: {
    fontSize: 26,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
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
  },
});
