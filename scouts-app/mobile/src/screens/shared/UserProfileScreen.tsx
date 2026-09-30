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
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useMembersStore } from '../../store/membersStore';
import { isValidPassword } from '../../utils/validation';
import { saveUserToFirestore } from '../../services/firebaseService';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';

export const UserProfileScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  // Change Password Modal & State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [passError, setPassError] = useState('');

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

      {/* Account Details Card */}
      <Text style={styles.sectionHeader}>البيانات الشخصية المسجلة</Text>
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

      {/* Security Actions */}
      <Text style={styles.sectionHeader}>إعدادات الأمان والحساب</Text>
      <View style={styles.actionsCard}>
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
    </ScrollView>
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
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#D4A359',
  },
  avatarText: {
    fontSize: 36,
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'right',
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
    marginBottom: 16,
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
    marginBottom: 10,
    width: '100%',
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
    marginTop: 6,
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
