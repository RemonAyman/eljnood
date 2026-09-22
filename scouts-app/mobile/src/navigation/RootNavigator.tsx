import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
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

const Stack = createStackNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#8B0000' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitleAlign: 'center',
        }}
      >
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
        <Stack.Screen
          name="ChildHome"
          component={ChildHomeScreen}
          options={{ title: 'جنود المسيح الكشفية' }}
        />
        <Stack.Screen
          name="ParentHome"
          component={ParentHomeScreen}
          options={{ title: 'متابعة أولياء الأمور' }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ title: 'لوحة القيادة الإدارية' }}
        />
        <Stack.Screen
          name="FollowUp"
          component={FollowUpScreen}
          options={{ title: 'سجل الافتقاد والمتابعة' }}
        />
        <Stack.Screen
          name="Subscriptions"
          component={SubscriptionsScreen}
          options={{ title: 'الاشتراكات والماليات' }}
        />
        <Stack.Screen
          name="Attendance"
          component={AttendanceManageScreen}
          options={{ title: 'سجل التحضير والغياب الذكي' }}
        />
        <Stack.Screen
          name="Curricula"
          component={CurriculaScreen}
          options={{ title: 'المناهج والمسابقات الروحية' }}
        />
        <Stack.Screen
          name="ChatRooms"
          component={ChatRoomsScreen}
          options={{ title: 'غرف التواصل والدردشة' }}
        />
        <Stack.Screen
          name="Memories"
          component={MemoriesScreen}
          options={{ title: 'أرشيف الذكريات والمعسكرات' }}
        />
        <Stack.Screen
          name="InventoryRequest"
          component={InventoryRequestScreen}
          options={{ title: 'إدارة واستعارة العهدة' }}
        />
        <Stack.Screen
          name="RoomReservation"
          component={RoomReservationScreen}
          options={{ title: 'جدول حجز قاعات الكنيسة' }}
        />
        <Stack.Screen
          name="ScoutingPlan"
          component={ScoutingPlanScreen}
          options={{ title: 'الخطة السنوية الكشفية' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
