import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { SwipeTabContext } from '../context/SwipeTabContext';
import { BottomNavBar } from '../components/navigation/BottomNavBar';

// Screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AttendanceManageScreen } from '../screens/leader/AttendanceManageScreen';
import { SubscriptionsScreen } from '../screens/shared/SubscriptionsScreen';
import { FollowUpScreen } from '../screens/leader/FollowUpScreen';
import { ChatRoomsScreen } from '../screens/shared/ChatRoomsScreen';
import { UserProfileScreen } from '../screens/shared/UserProfileScreen';
import { CurriculaScreen } from '../screens/shared/CurriculaScreen';
import { MemoriesScreen } from '../screens/shared/MemoriesScreen';
import { ChildHomeScreen } from '../screens/child/ChildHomeScreen';
import { ParentHomeScreen } from '../screens/parent/ParentHomeScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabConfig {
  key: string;
  title: string;
  icon: string;
  component: React.ComponentType<any>;
}

export const MainSwipeAppNavigator = ({ navigation, route }: any) => {
  const user = useAuthStore((s) => s.user);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);

  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [swipeEnabled, setSwipeEnabled] = useState(true);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Tab definitions by Role
  const tabs: TabConfig[] = useMemo(() => {
    const role = user?.role || 'CHILD';

    if (role === 'ADMIN' || role === 'GROUP_MANAGER') {
      return [
        { key: 'AdminDashboard', title: 'لوحة القيادة الإدارية', icon: '📊', component: AdminDashboardScreen },
        { key: 'Attendance', title: 'سجل التحضير والغياب الذكي', icon: '📋', component: AttendanceManageScreen },
        { key: 'Subscriptions', title: 'الاشتراكات والماليات', icon: '💰', component: SubscriptionsScreen },
        { key: 'FollowUp', title: 'سجل الافتقاد والمتابعة', icon: '🤝', component: FollowUpScreen },
        { key: 'ChatRooms', title: 'غرف التواصل والدردشة', icon: '💬', component: ChatRoomsScreen },
        { key: 'UserProfile', title: 'الملف الشخصي والحساب', icon: '👤', component: UserProfileScreen },
      ];
    }

    if (role === 'LEADER' || role === 'SECTION_LEADER' || role === 'JOWALAH') {
      return [
        { key: 'Attendance', title: 'سجل التحضير والغياب الذكي', icon: '📋', component: AttendanceManageScreen },
        { key: 'FollowUp', title: 'سجل الافتقاد والمتابعة', icon: '🤝', component: FollowUpScreen },
        { key: 'Curricula', title: 'المناهج والمسابقات الروحية', icon: '📚', component: CurriculaScreen },
        { key: 'Memories', title: 'أرشيف الذكريات والمعسكرات', icon: '📸', component: MemoriesScreen },
        { key: 'ChatRooms', title: 'غرف التواصل والدردشة', icon: '💬', component: ChatRoomsScreen },
        { key: 'UserProfile', title: 'الملف الشخصي والحساب', icon: '👤', component: UserProfileScreen },
      ];
    }

    if (role === 'PARENT') {
      return [
        { key: 'ParentHome', title: 'متابعة أولياء الأمور', icon: '🏠', component: ParentHomeScreen },
        { key: 'Subscriptions', title: 'الاشتراكات والإيصالات', icon: '💰', component: SubscriptionsScreen },
        { key: 'Memories', title: 'أرشيف الذكريات والمعسكرات', icon: '📸', component: MemoriesScreen },
        { key: 'ChatRooms', title: 'غرف التواصل والدردشة', icon: '💬', component: ChatRoomsScreen },
        { key: 'UserProfile', title: 'الملف الشخصي والحساب', icon: '👤', component: UserProfileScreen },
      ];
    }

    // Default: CHILD / SCOUT
    return [
      { key: 'ChildHome', title: 'جنود المسيح الكشفية', icon: '🏠', component: ChildHomeScreen },
      { key: 'Curricula', title: 'المناهج والمسابقات الروحية', icon: '📚', component: CurriculaScreen },
      { key: 'Memories', title: 'أرشيف الذكريات والمعسكرات', icon: '📸', component: MemoriesScreen },
      { key: 'ChatRooms', title: 'غرف التواصل والدردشة', icon: '💬', component: ChatRoomsScreen },
      { key: 'UserProfile', title: 'الملف الشخصي والحساب', icon: '👤', component: UserProfileScreen },
    ];
  }, [user?.role]);

  const activeTab = tabs[activeIndex] || tabs[0];

  // Navigate to tab programmatically with smooth horizontal scrolling
  const navigateToTab = useCallback(
    (targetRoute: string): boolean => {
      const idx = tabs.findIndex(
        (t) => t.key.toLowerCase() === targetRoute.toLowerCase()
      );
      if (idx !== -1) {
        setActiveIndex(idx);
        scrollRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
        return true;
      }
      return false;
    },
    [tabs]
  );

  // Initial tab support (e.g. if passed via route params)
  useEffect(() => {
    if (route?.params?.initialTab) {
      navigateToTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab, navigateToTab]);

  // Handle horizontal swipe momentum settlement
  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex >= 0 && newIndex < tabs.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Wrapped navigation so any screen can call navigation.navigate('Tab') seamlessly
  const tabKeys = useMemo(() => tabs.map((t) => t.key), [tabs]);
  const wrappedNavigation = useMemo(() => {
    return {
      ...navigation,
      navigate: (screenName: string, params?: any) => {
        if (tabKeys.includes(screenName)) {
          navigateToTab(screenName);
        } else {
          navigation.navigate(screenName, params);
        }
      },
    };
  }, [navigation, tabKeys, navigateToTab]);

  const contextValue = useMemo(
    () => ({
      activeRoute: activeTab.key,
      navigateToTab,
      isInsideSwipeContainer: true,
      swipeEnabled,
      setSwipeEnabled,
    }),
    [activeTab.key, navigateToTab, swipeEnabled, setSwipeEnabled]
  );

  return (
    <SwipeTabContext.Provider value={contextValue}>
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <StatusBar barStyle="light-content" backgroundColor="#8B0000" />

        {/* ─── Modern Unified Top Header ─── */}
        <View style={[styles.topHeader, isDarkMode && styles.topHeaderDark]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={toggleDarkMode}
              activeOpacity={0.7}
            >
              <Text style={styles.headerActionIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <View style={styles.titleRow}>
              <Text style={styles.tabIcon}>{activeTab.icon}</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {activeTab.title}
              </Text>
            </View>

            {/* Visual Dots Indicator for Swiping */}
            <View style={styles.dotsContainer}>
              {tabs.map((t, idx) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => navigateToTab(t.key)}
                  style={[
                    styles.dot,
                    idx === activeIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>جنود المسيح ⚜️</Text>
            </View>
          </View>
        </View>

        {/* ─── Facebook-style Swipeable Horizontal Pager ─── */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={swipeEnabled}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          decelerationRate="fast"
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.pager}
          contentContainerStyle={styles.pagerContent}
          keyboardShouldPersistTaps="handled"
        >
          {tabs.map((tab) => {
            const ScreenComponent = tab.component;
            return (
              <View key={tab.key} style={styles.pageItem}>
                <ScreenComponent navigation={wrappedNavigation} route={route} />
              </View>
            );
          })}
        </ScrollView>

        {/* ─── Persistent Bottom Navigation Bar (Hidden when typing to prevent covering screen) ─── */}
        {!isKeyboardVisible && (
          <BottomNavBar
            navigation={wrappedNavigation}
            currentRoute={activeTab.key}
            isRootBar={true}
          />
        )}
      </View>
    </SwipeTabContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  topHeader: {
    backgroundColor: '#8B0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 12),
    paddingBottom: 8,
    paddingHorizontal: 14,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 10,
  },
  topHeaderDark: {
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerLeft: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 16,
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#D4A359',
  },
  headerActionBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  headerActionIcon: {
    fontSize: 14,
  },
  badgePill: {
    backgroundColor: 'rgba(212, 163, 89, 0.25)',
    borderColor: '#D4A359',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: '#D4A359',
    fontWeight: 'bold',
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    flexGrow: 1,
  },
  pageItem: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
});
