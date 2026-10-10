import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase.config';
import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';

const ExpoNotifications: any = Notifications;
const PUSH_TOKEN_STORAGE_KEY = '@scouts_device_push_token';
const EAS_PROJECT_ID = '2fe808e9-237d-4dae-9ec4-b5250ab99852';

// ─── 1. Configure Notification Handler for Foreground Behavior ─────────────
if (ExpoNotifications?.setNotificationHandler) {
  ExpoNotifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldPresentAlert: true,
      shouldPresentSound: true,
      shouldPresentBadge: true,
    }),
  });
}

// ─── 2. Register for Push Notifications ─────────────────────────────────────
export async function registerForPushNotificationsAsync(userData?: {
  id?: string;
  name?: string;
  role?: string;
  sector?: string;
}): Promise<string | null> {
  try {
    // Android Notification Channels Setup
    if (Platform.OS === 'android' && ExpoNotifications?.setNotificationChannelAsync) {
      const maxImportance = ExpoNotifications?.AndroidImportance?.MAX ?? 5;
      const highImportance = ExpoNotifications?.AndroidImportance?.HIGH ?? 4;

      await ExpoNotifications.setNotificationChannelAsync('default', {
        name: 'الإشعارات العامة',
        importance: maxImportance,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D97706',
        enableVibrate: true,
        showBadge: true,
        sound: 'default',
      });

      await ExpoNotifications.setNotificationChannelAsync('chat-messages', {
        name: 'رسائل الدردشة والمحادثات',
        importance: highImportance,
        vibrationPattern: [0, 200, 150, 200],
        lightColor: '#1E3A8A',
        enableVibrate: true,
        showBadge: true,
        sound: 'default',
      });

      await ExpoNotifications.setNotificationChannelAsync('announcements', {
        name: 'التعميمات والفعاليات الكشفية',
        importance: maxImportance,
        vibrationPattern: [0, 300, 200, 300],
        lightColor: '#059669',
        enableVibrate: true,
        showBadge: true,
        sound: 'default',
      });
    }

    if (!Device.isDevice) {
      console.log('ℹ️ Push notifications require a physical device');
      return null;
    }

    // Permission check
    const permissions = ExpoNotifications?.getPermissionsAsync
      ? await ExpoNotifications.getPermissionsAsync()
      : { status: 'granted' };
    let finalStatus = permissions.status;

    if (finalStatus !== 'granted' && ExpoNotifications?.requestPermissionsAsync) {
      const requested = await ExpoNotifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Push notification permissions not granted');
      return null;
    }

    // Retrieve Expo Push Token
    let token: string | null = null;
    if (ExpoNotifications?.getExpoPushTokenAsync) {
      const pushTokenData = await ExpoNotifications.getExpoPushTokenAsync({
        projectId: EAS_PROJECT_ID,
      });
      token = pushTokenData?.data || null;
    }

    if (!token) return null;

    // Cache locally
    await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);

    // Persist in Cloud Firestore so other users/backends can send notifications
    await saveTokenToFirestore(token, userData);

    return token;
  } catch (error: any) {
    console.warn('⚠️ Register push notifications error:', error?.message || error);
    return null;
  }
}

// ─── 3. Save Push Token to Cloud Firestore ──────────────────────────────────
export async function saveTokenToFirestore(
  token: string,
  userData?: { id?: string; name?: string; role?: string; sector?: string }
) {
  try {
    const sanitizedKey = token.replace(/[^a-zA-Z0-9_-]/g, '_');
    const tokenDocRef = doc(db, 'push_tokens', sanitizedKey);

    await setDoc(
      tokenDocRef,
      {
        token,
        userId: userData?.id || null,
        userName: userData?.name || null,
        role: userData?.role || null,
        sector: userData?.sector || null,
        platform: Platform.OS,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Also link directly on user record if user ID exists
    if (userData?.id) {
      const userRef = doc(db, 'users', userData.id);
      await setDoc(userRef, { pushToken: token, lastTokenUpdate: new Date().toISOString() }, { merge: true });
    }
  } catch (err: any) {
    console.warn('⚠️ Failed saving push token to Firestore:', err?.message);
  }
}

// ─── 4. Send Push Notification via Expo Push Service (External Delivery) ───
export async function sendPushNotificationToTokens(
  tokens: string[],
  payload: {
    title: string;
    body: string;
    data?: any;
    channelId?: string;
  }
) {
  if (!tokens || tokens.length === 0) return;

  const validTokens = tokens.filter(
    (t) => typeof t === 'string' && (t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken['))
  );

  if (validTokens.length === 0) return;

  const chunkSize = 100;
  for (let i = 0; i < validTokens.length; i += chunkSize) {
    const chunk = validTokens.slice(i, i + chunkSize);
    const messages = chunk.map((to) => ({
      to,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      channelId: payload.channelId || (payload.data?.type === 'CHAT' ? 'chat-messages' : 'default'),
      priority: 'high',
      _displayInForeground: true,
    }));

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
    } catch (e: any) {
      console.warn('⚠️ Expo push API dispatch error:', e?.message || e);
    }
  }
}

// ─── 5. Broadcast Push Notification to Target Audience ─────────────────────
export async function broadcastPushNotification(notifData: {
  title: string;
  body: string;
  type: 'CHAT' | 'MEMORY' | 'SCOUTING_PLAN' | 'CURRICULUM' | 'SYSTEM' | string;
  senderId?: string;
  roomId?: string;
  targetRole?: string;
  senderName?: string;
}) {
  try {
    const myCachedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);

    // Fetch registered push tokens from Firestore
    const tokensRef = collection(db, 'push_tokens');
    const q = query(tokensRef, limit(300));
    const snap = await getDocs(q);

    const targetTokens: string[] = [];

    snap.forEach((d) => {
      const data = d.data();
      const token = data.token;
      if (!token) return;

      // 1. Never send notification to the device that triggered/sent it
      if (myCachedToken && token === myCachedToken) return;
      if (notifData.senderId && data.userId && data.userId === notifData.senderId) return;

      // 2. Role filtering if targeted
      if (notifData.targetRole && data.role && data.role !== notifData.targetRole && data.role !== 'ADMIN') {
        return;
      }

      targetTokens.push(token);
    });

    if (targetTokens.length > 0) {
      await sendPushNotificationToTokens(targetTokens, {
        title: notifData.title,
        body: notifData.body,
        data: {
          type: notifData.type,
          roomId: notifData.roomId,
          senderId: notifData.senderId,
          senderName: notifData.senderName,
        },
        channelId: notifData.type === 'CHAT' ? 'chat-messages' : 'announcements',
      });
    }
  } catch (error: any) {
    console.warn('⚠️ Broadcast push notification error:', error?.message || error);
  }
}

// ─── 6. Present Local OS Notification (Foreground/Background Trigger) ───────
export async function scheduleLocalNotification(title: string, body: string, data?: any) {
  try {
    if (ExpoNotifications?.scheduleNotificationAsync) {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Immediate
      });
    }
  } catch (err: any) {
    console.warn('⚠️ Failed to present local notification:', err?.message);
  }
}
