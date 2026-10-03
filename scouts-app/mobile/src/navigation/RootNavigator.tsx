import React, { useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthGuard } from '../components/auth/AuthGuard';
import { NotificationBanner } from '../components/ui/NotificationBanner';
import { useNotificationStore } from '../store/notificationStore';
import { subscribeToNotifications, checkAndTriggerEventReminders } from '../services/firebaseService';

// Operational & Internal Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { RoleSelectScreen } from '../screens/auth/RoleSelectScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { ChildHomeScreen } from '../screens/child/ChildHomeScreen';
import { ParentHomeScreen } from '../screens/parent/ParentHomeScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { FollowUpScreen } from '../screens/leader/FollowUpScreen';
import { SubscriptionsScreen } from '../screens/shared/SubscriptionsScreen';
import { AttendanceManageScreen } from '../screens/leader/AttendanceManageScreen';
import { CurriculaScreen } from '../screens/shared/CurriculaScreen';
import { ChatRoomsScreen } from '../screens/shared/ChatRoomsScreen';
import { MemoriesScreen } from '../screens/shared/MemoriesScreen';
import { InventoryRequestScreen } from '../screens/shared/InventoryRequestScreen';
import { RoomReservationScreen } from '../screens/shared/RoomReservationScreen';
import { ScoutingPlanScreen } from '../screens/shared/ScoutingPlanScreen';
import { UserProfileScreen } from '../screens/shared/UserProfileScreen';

// Public Showcase Screens
import { PublicHomeScreen } from '../screens/public/PublicHomeScreen';
import { AboutUsScreen } from '../screens/public/AboutUsScreen';
import { ActivitiesScreen } from '../screens/public/ActivitiesScreen';
import { PublicGalleryScreen } from '../screens/public/PublicGalleryScreen';
import { ContactUsScreen } from '../screens/public/ContactUsScreen';

export const navigationRef = createNavigationContainerRef<any>();
const Stack = createStackNavigator();

// ─── Guarded Screen Components ─────────────────────────────────────────────
const ProtectedChildHome = (props: any) => (
  <AuthGuard navigation={props.navigation} requireAuth={true}>
    <ChildHomeScreen {...props} />
  </AuthGuard>
);

const ProtectedParentHome = (props: any) => (
  <AuthGuard navigation={props.navigation} requireAuth={true}>
    <ParentHomeScreen {...props} />
  </AuthGuard>
);

const ProtectedAdminDashboard = (props: any) => (
  <AuthGuard
    navigation={props.navigation}
    requireAuth={true}
    allowedRoles={['ADMIN', 'GROUP_MANAGER']}
  >
    <AdminDashboardScreen {...props} />
  </AuthGuard>
);

const ProtectedAttendance = (props: any) => (
  <AuthGuard
    navigation={props.navigation}
    requireAuth={true}
    allowedRoles={['ADMIN', 'LEADER', 'SECTION_LEADER', 'JOWALAH', 'GROUP_MANAGER']}
  >
    <AttendanceManageScreen {...props} />
  </AuthGuard>
);

const ProtectedFollowUp = (props: any) => (
  <AuthGuard
    navigation={props.navigation}
    requireAuth={true}
    allowedRoles={['ADMIN', 'LEADER', 'SECTION_LEADER', 'JOWALAH', 'GROUP_MANAGER']}
  >
    <FollowUpScreen {...props} />
  </AuthGuard>
);

const ProtectedSubscriptions = (props: any) => (
  <AuthGuard navigation={props.navigation} requireAuth={true}>
    <SubscriptionsScreen {...props} />
  </AuthGuard>
);

const ProtectedCurricula = (props: any) => (
  <AuthGuard navigation={props.navigation} requireAuth={true}>
    <CurriculaScreen {...props} />
  </AuthGuard>
);

const ProtectedChatRooms = (props: any) => (
  <AuthGuard navigation={props.navigation} requireAuth={true}>
    <ChatRoomsScreen {...props} />
  </AuthGuard>
);

const ProtectedMemories = (props: any) => (
  <AuthGuard navigation={props.navigation} requireAuth={true}>
    <MemoriesScreen {...props} />
  </AuthGuard>
);

const ProtectedInventoryRequest = (props: any) => (
  <AuthGuard
    navigation={props.navigation}
    requireAuth={true}
    allowedRoles={['ADMIN', 'LEADER', 'SECTION_LEADER', 'JOWALAH', 'GROUP_MANAGER']}
  >
    <InventoryRequestScreen {...props} />
  </AuthGuard>
);

const ProtectedRoomReservation = (props: any) => (
  <AuthGuard
    navigation={props.navigation}
    requireAuth={true}
    allowedRoles={['ADMIN', 'LEADER', 'SECTION_LEADER', 'JOWALAH', 'GROUP_MANAGER']}
  >
    <RoomReservationScreen {...props} />
  </AuthGuard>
);

const ProtectedScoutingPlan = (props: any) => (
  <AuthGuard navigation={props.navigation} requireAuth={true}>
    <ScoutingPlanScreen {...props} />
  </AuthGuard>
);

const ProtectedUserProfile = (props: any) => (
  <AuthGuard navigation={props.navigation} requireAuth={true}>
    <UserProfileScreen {...props} />
  </AuthGuard>
);

export function RootNavigator() {
  const lastProcessedIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Check & trigger automated 1-day before and same-day party reminders
    checkAndTriggerEventReminders().catch((e) => console.warn('Reminders check note:', e));

    // Subscribe to Firestore Real-time Notifications
    const unsubscribe = subscribeToNotifications((notifs) => {
      if (notifs && notifs.length > 0) {
        const latest = notifs[0];
        if (latest.id && latest.id !== lastProcessedIdRef.current) {
          lastProcessedIdRef.current = latest.id;
          useNotificationStore.getState().showBanner({
            id: latest.id,
            title: latest.title || 'تنبيه جديد 🔔',
            body: latest.body || 'يوجد إشعار جديد في منظومة الكشافة',
            type: latest.type || 'SYSTEM',
            roomId: latest.roomId,
            senderName: latest.senderName,
          });
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <NotificationBanner navigationRef={navigationRef} />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#8B0000' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitleAlign: 'center',
        }}
      >
        {/* Auth & Gateway */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RoleSelect"
          component={RoleSelectScreen}
          options={{ title: 'انضم لأسرة الكشافة' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'استمارة قيد عضو جديد' }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ title: 'استعادة كلمة السر' }}
        />

        {/* Public Showcase Screens */}
        <Stack.Screen
          name="PublicHome"
          component={PublicHomeScreen}
          options={{ title: 'مجموعة جنود المسيح الكشفية' }}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUsScreen}
          options={{ title: 'من نحن ورسالتنا' }}
        />
        <Stack.Screen
          name="Activities"
          component={ActivitiesScreen}
          options={{ title: 'الأنشطة والفعاليات' }}
        />
        <Stack.Screen
          name="PublicGallery"
          component={PublicGalleryScreen}
          options={{ title: 'معرض الصور والفيديوهات' }}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
          options={{ title: 'تواصل مع القيادة' }}
        />

        {/* Role Home Dashboards (Guarded) */}
        <Stack.Screen
          name="ChildHome"
          component={ProtectedChildHome}
          options={{ title: 'جنود المسيح الكشفية' }}
        />
        <Stack.Screen
          name="ParentHome"
          component={ProtectedParentHome}
          options={{ title: 'متابعة أولياء الأمور' }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={ProtectedAdminDashboard}
          options={{ title: 'لوحة القيادة الإدارية' }}
        />

        {/* Scout Operations & Shared Modules (Guarded) */}
        <Stack.Screen
          name="FollowUp"
          component={ProtectedFollowUp}
          options={{ title: 'سجل الافتقاد والمتابعة' }}
        />
        <Stack.Screen
          name="Subscriptions"
          component={ProtectedSubscriptions}
          options={{ title: 'الاشتراكات والماليات' }}
        />
        <Stack.Screen
          name="Attendance"
          component={ProtectedAttendance}
          options={{ title: 'سجل التحضير والغياب الذكي' }}
        />
        <Stack.Screen
          name="Curricula"
          component={ProtectedCurricula}
          options={{ title: 'المناهج والمسابقات الروحية' }}
        />
        <Stack.Screen
          name="ChatRooms"
          component={ProtectedChatRooms}
          options={{ title: 'غرف التواصل والدردشة' }}
        />
        <Stack.Screen
          name="Memories"
          component={ProtectedMemories}
          options={{ title: 'أرشيف الذكريات والمعسكرات' }}
        />
        <Stack.Screen
          name="InventoryRequest"
          component={ProtectedInventoryRequest}
          options={{ title: 'إدارة واستعارة العهدة' }}
        />
        <Stack.Screen
          name="RoomReservation"
          component={ProtectedRoomReservation}
          options={{ title: 'جدول حجز قاعات الكنيسة' }}
        />
        <Stack.Screen
          name="ScoutingPlan"
          component={ProtectedScoutingPlan}
          options={{ title: 'الخطة السنوية الكشفية' }}
        />
        <Stack.Screen
          name="UserProfile"
          component={ProtectedUserProfile}
          options={{ title: 'الملف الشخصي والحساب' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

