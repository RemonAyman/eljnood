import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase.config';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';
import { OFFICIAL_SCOUT_ACCOUNTS } from '../../screens/auth/LoginScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  navigation: any;
  allowedRoles?: Role[];
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  navigation,
  allowedRoles,
  requireAuth = true,
}) => {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);

  const isRoleAllowed = React.useMemo(() => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  }, [user, allowedRoles]);

  const handleVerifyLogin = async () => {
    if (!emailInput.trim() || !passwordInput.trim()) {
      Alert.alert('تنبيه ⚠️', 'من فضلك أدخل البريد الإلكتروني وكلمة المرور المصرح بهما');
      return;
    }

    setLoading(true);
    let cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Resolve alias if an official account identifier was entered
    const matchedAccount = OFFICIAL_SCOUT_ACCOUNTS.find(
      (acc) =>
        acc.email.toLowerCase() === cleanEmail ||
        acc.aliases.some((a) => a.toLowerCase() === cleanEmail) ||
        acc.id.toLowerCase() === cleanEmail
    );
    if (matchedAccount) {
      cleanEmail = matchedAccount.email.toLowerCase();
    }

    try {
      // 1. Authenticate securely with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const uid = userCredential.user.uid;

      // 2. Fetch authenticated user data from Firestore
      const userDocSnap = await getDoc(doc(db, 'users', uid));
      let role: Role = matchedAccount ? matchedAccount.role : 'CHILD';
      let name = matchedAccount ? matchedAccount.name : 'مستخدم مصرح';
      let sectionName = matchedAccount?.section || 'الكل';

      if (userDocSnap.exists()) {
        const uData = userDocSnap.data();
        if (uData.role) role = uData.role as Role;
        if (uData.name) name = uData.name;
        if (uData.sectionName) sectionName = uData.sectionName;
      }

      // 3. Verify that role meets requirements
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        setLoading(false);
        Alert.alert('صلاحية غير كافية ⛔', 'هذا الحساب لا يملك الصلاحيات المطلوبة للوصول لهذا القسم.');
        return;
      }

      setUser({
        id: uid,
        name,
        email: cleanEmail,
        role,
        sectionName,
      });

      setLoading(false);
      Alert.alert('تم التحقق بنجاح 🎉', `أهلاً بك (${name}). تم تأكيد الصلاحيات بنجاح.`);
    } catch (authError: any) {
      setLoading(false);
      console.warn('AuthGuard authentication error:', authError.message);
      Alert.alert('بيانات غير صحيحة ❌', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };

  // 1. If screen requires auth and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>تسجيل الدخول مطلوب</Text>
          <Text style={styles.sub}>
            هذا القسم مخصص للفرق الكشفية والقادة فقط. يرجى تسجيل الدخول بحسابك أولاً.
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation?.navigate('Login')}
          >
            <Text style={styles.btnText}>الذهاب لصفحة تسجيل الدخول ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.navigate('PublicHome')}
          >
            <Text style={styles.backBtnText}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 2. If user is logged in but doesn't have required role
  if (allowedRoles && allowedRoles.length > 0 && !isRoleAllowed) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>🛡️</Text>
          <Text style={styles.title}>الوصول مقتصر على القادة والمشرفين</Text>
          <Text style={styles.sub}>
            رتبتك الحالية ({user?.role || 'غير محدد'}) لا تملك صلاحية الوصول المباشر لهذه الشاشة.
          </Text>
          <Text style={styles.subHint}>
            قم بتسجيل الدخول ببريدك القيادي المعتمد لتأكيد صلاحيتك:
          </Text>

          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني أو اسم المستخدم"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailInput}
            onChangeText={setEmailInput}
          />

          <TextInput
            style={styles.input}
            placeholder="كلمة المرور الخاصة بالقائد"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={passwordInput}
            onChangeText={setPasswordInput}
          />

          <TouchableOpacity style={styles.btn} onPress={handleVerifyLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>تأكيد الحساب والفتح 🔓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (user?.role === 'CHILD') navigation?.navigate('ChildHome');
              else if (user?.role === 'PARENT') navigation?.navigate('ParentHome');
              else navigation?.goBack();
            }}
          >
            <Text style={styles.backBtnText}>العودة للصفحة الرئيسية ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4A359',
    elevation: 4,
  },
  icon: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 6,
    textAlign: 'center',
  },
  sub: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  subHint: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
    marginBottom: 10,
  },
  btn: {
    width: '100%',
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  backBtn: {
    marginTop: 12,
    paddingVertical: 6,
  },
  backBtnText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
