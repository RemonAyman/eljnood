import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface BottomNavBarProps {
  navigation: any;
  currentRoute: string;
}

export const BottomNavBar = ({ navigation, currentRoute }: BottomNavBarProps) => {
  const user = useAuthStore((s) => s.user);

  const getNavItems = () => {
    const role = user?.role || 'SCOUT';

    if (role === 'ADMIN') {
      return [
        { key: 'AdminDashboard', label: 'الرئيسية', icon: '📊', route: 'AdminDashboard' },
        { key: 'FollowUp', label: 'الافتقاد', icon: '🤝', route: 'FollowUp' },
        { key: 'Curricula', label: 'المناهج', icon: '📚', route: 'Curricula' },
        { key: 'Memories', label: 'الذكريات', icon: '📸', route: 'Memories' },
        { key: 'ChatRooms', label: 'الشات', icon: '💬', route: 'ChatRooms' },
        { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
      ];
    }

    if (role === 'LEADER' || role === 'JOWALAH' || role === 'SECTION_LEADER' || role === 'GROUP_MANAGER') {
      return [
        { key: 'Home', label: 'الرئيسية', icon: '🏠', route: 'AdminDashboard' },
        { key: 'Attendance', label: 'الغياب', icon: '📋', route: 'Attendance' },
        { key: 'FollowUp', label: 'الافتقاد', icon: '🤝', route: 'FollowUp' },
        { key: 'Memories', label: 'الذكريات', icon: '📸', route: 'Memories' },
        { key: 'ChatRooms', label: 'الشات', icon: '💬', route: 'ChatRooms' },
        { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
      ];
    }

    if (role === 'PARENT') {
      return [
        { key: 'ParentHome', label: 'الرئيسية', icon: '🏠', route: 'ParentHome' },
        { key: 'Attendance', label: 'غياب الأبناء', icon: '📋', route: 'Attendance' },
        { key: 'Memories', label: 'الذكريات', icon: '📸', route: 'Memories' },
        { key: 'ChatRooms', label: 'الشات', icon: '💬', route: 'ChatRooms' },
        { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
      ];
    }

    // Default: CHILD / SCOUT
    return [
      { key: 'ChildHome', label: 'الرئيسية', icon: '🏠', route: 'ChildHome' },
      { key: 'Attendance', label: 'غيابي', icon: '📋', route: 'Attendance' },
      { key: 'Memories', label: 'الذكريات', icon: '📸', route: 'Memories' },
      { key: 'ChatRooms', label: 'الشات', icon: '💬', route: 'ChatRooms' },
      { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
    ];
  };

  const navItems = getNavItems();

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.key || currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.8}
              onPress={() => {
                if (currentRoute !== item.route) {
                  navigation?.navigate(item.route);
                }
              }}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{item.icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>{item.label}</Text>
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
