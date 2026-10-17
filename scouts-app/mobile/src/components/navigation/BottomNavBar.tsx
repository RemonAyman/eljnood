import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Keyboard, Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

import { useSwipeTab } from '../../context/SwipeTabContext';

interface BottomNavBarProps {
  navigation: any;
  currentRoute: string;
  isRootBar?: boolean;
}

export const BottomNavBar = ({ navigation, currentRoute, isRootBar }: BottomNavBarProps) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const swipeContext = useSwipeTab();

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardOpen(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardOpen(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // When keyboard is visible, hide bottom nav bar to prevent covering screen/inputs
  if (isKeyboardOpen) {
    return null;
  }

  // If this BottomNavBar is inside an individual screen and the root swipe container is already rendering the bar, skip rendering to prevent duplicate
  if (!isRootBar && swipeContext.isInsideSwipeContainer) {
    return null;
  }

  const getNavItems = () => {
    const role = user?.role || 'CHILD';

    if (role === 'INVENTORY_MANAGER') {
      return [
        { key: 'InventoryRequest', label: 'المخزن والعهدة', icon: '📦', route: 'InventoryRequest' },
        { key: 'RoomReservation', label: 'حجز القاعات', icon: '⛪', route: 'RoomReservation' },
        { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
      ];
    }

    if (role === 'SUBSCRIPTION_OFFICER') {
      return [
        { key: 'Subscriptions', label: 'الاشتراكات والماليات', icon: '💰', route: 'Subscriptions' },
        { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
      ];
    }

    if (role === 'ADMIN') {
      return [
        { key: 'AdminDashboard', label: 'الرئيسية', icon: '📊', route: 'AdminDashboard' },
        { key: 'Attendance', label: 'الغياب', icon: '📋', route: 'Attendance' },
        { key: 'Subscriptions', label: 'الخزينة', icon: '💰', route: 'Subscriptions' },
        { key: 'FollowUp', label: 'الافتقاد', icon: '🤝', route: 'FollowUp' },
        { key: 'ChatRooms', label: 'الشات', icon: '💬', route: 'ChatRooms' },
        { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
      ];
    }

    if (role === 'LEADER' || role === 'JOWALAH' || role === 'SECTION_LEADER' || role === 'GROUP_MANAGER') {
      return [
        { key: 'Attendance', label: 'الغياب', icon: '📋', route: 'Attendance' },
        { key: 'FollowUp', label: 'الافتقاد', icon: '🤝', route: 'FollowUp' },
        { key: 'Curricula', label: 'المناهج', icon: '📚', route: 'Curricula' },
        { key: 'Memories', label: 'الذكريات', icon: '📸', route: 'Memories' },
        { key: 'ChatRooms', label: 'الشات', icon: '💬', route: 'ChatRooms' },
        { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
      ];
    }

    if (role === 'PARENT') {
      return [
        { key: 'ParentHome', label: 'الرئيسية', icon: '🏠', route: 'ParentHome' },
        { key: 'Subscriptions', label: 'الإيصالات', icon: '💰', route: 'Subscriptions' },
        { key: 'Memories', label: 'الذكريات', icon: '📸', route: 'Memories' },
        { key: 'ChatRooms', label: 'الشات', icon: '💬', route: 'ChatRooms' },
        { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
      ];
    }

    // Default: CHILD / SCOUT
    return [
      { key: 'ChildHome', label: 'الرئيسية', icon: '🏠', route: 'ChildHome' },
      { key: 'Curricula', label: 'المناهج', icon: '📚', route: 'Curricula' },
      { key: 'Memories', label: 'الذكريات', icon: '📸', route: 'Memories' },
      { key: 'ChatRooms', label: 'الشات', icon: '💬', route: 'ChatRooms' },
      { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
    ];
  };

  const navItems = getNavItems();

  const handleNavPress = (item: any) => {
    if (!isAuthenticated) {
      Alert.alert(
        'تسجيل الدخول مطلوب 🔑',
        'يرجى تسجيل الدخول أولاً للوصول إلى هذا القسم.',
        [{ text: 'تسجيل الدخول', onPress: () => navigation?.navigate('Login') }]
      );
      return;
    }

    // 1. If inside Swipe Container and item is one of the container tabs, smoothly scroll
    if (swipeContext.isInsideSwipeContainer) {
      const handled = swipeContext.navigateToTab(item.route);
      if (handled) return;
    }

    // 2. Otherwise navigate normally
    if (currentRoute !== item.route) {
      navigation?.navigate(item.route);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.bar, isDarkMode && { backgroundColor: '#111827', borderColor: '#374151', borderWidth: 1 }]}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.key || currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.8}
              onPress={() => handleNavPress(item)}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{item.icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  bar: {
    flexDirection: 'row-reverse',
    backgroundColor: '#8B0000',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 14,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navIconActive: {
    transform: [{ scale: 1.12 }],
  },
  navLabel: {
    fontSize: 9,
    color: '#D4A359',
    fontWeight: '600',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
