import { apiClient, setAuthToken } from './apiClient';
import { Member, SubscriptionRecord } from '../types';
import { 
  fetchMembersFromFirestore, 
  saveMemberToFirestore, 
  saveSubscriptionToFirestore, 
  fetchAllSubscriptionsFromFirestore 
} from './firebaseService';

// ─── 1. Authentication ────────────────────────────────────────────────────────

export async function loginWithBackendApi(email: string, pass: string): Promise<{
  success: boolean;
  token?: string;
  userId?: string;
  email?: string;
  message?: string;
  isOffline?: boolean;
}> {
  const result = await apiClient.post('/Auth/Login', { email, password: pass });
  if (result.success && result.data?.token) {
    setAuthToken(result.data.token);
    return {
      success: true,
      token: result.data.token,
      userId: result.data.userId,
      email: result.data.email,
    };
  }
  return {
    success: false,
    message: result.message || 'بيانات الدخول غير صحيحة',
    isOffline: result.isOffline,
  };
}

// ─── 2. Members Management ───────────────────────────────────────────────────

export async function fetchAllMembersHybrid(): Promise<Member[]> {
  // 1. Try .NET Web API
  const result = await apiClient.get('/Member/All-Member');
  if (result.success && result.data?.members) {
    console.log('✅ Loaded members from .NET Web API');
    return result.data.members.map((m: any) => ({
      id: m.id || `m_${m.shortId}`,
      code: m.code,
      name: m.name,
      gender: m.gender || 'MALE',
      scarfStatus: m.scarfStatus || 'RECEIVED',
      birthDate: m.birthDate ? m.birthDate.split('T')[0] : '2012-01-01',
      gradeLevel: m.schoolGrade || 'PREP_1',
      squadName: m.squadName || 'كشاف',
      phone: m.phone || '',
      guardianPhone: m.guardianPhone || '',
      region: m.address || '',
      buildingNo: m.buildingNo || '',
      street: m.street || '',
      addressDescription: m.address || '',
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  }

  // 2. Fallback to Firebase
  console.log('🔄 Fallback: Fetching members from Firebase Cloud Firestore');
  return fetchMembersFromFirestore();
}

export async function fetchMemberCredentialsHybrid(code: string): Promise<{
  success: boolean;
  email?: string;
  password?: string;
  message?: string;
}> {
  const result = await apiClient.get(`/Member/credentials/${code}`);
  if (result.success && result.data) {
    return {
      success: true,
      email: result.data.email,
      password: result.data.password,
    };
  }
  return {
    success: false,
    message: result.message || 'تعذر جلب بيانات الحساب المعتمدة',
  };
}

// ─── 3. Subscriptions & Financials ───────────────────────────────────────────

export async function createSubscriptionHybrid(record: SubscriptionRecord): Promise<boolean> {
  // 1. Save to .NET Backend API if available
  const result = await apiClient.post('/Subscriptions', record);
  if (result.success) {
    console.log('✅ Subscription saved to .NET Backend API');
  }

  // 2. Always save to Firebase for real-time visibility
  return saveSubscriptionToFirestore(record);
}

export async function fetchSubscriptionsHybrid(): Promise<SubscriptionRecord[]> {
  const result = await apiClient.get('/Subscriptions');
  if (result.success && Array.isArray(result.data)) {
    return result.data;
  }
  return fetchAllSubscriptionsFromFirestore();
}
