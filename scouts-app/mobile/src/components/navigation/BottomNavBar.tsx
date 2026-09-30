import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface BottomNavBarProps {
  navigation: any;
  currentRoute: string;
}

export const BottomNavBar = ({ navigation, currentRoute }: BottomNavBarProps) => {
  const user = useAuthStore((s) => s.user);

  const getHomeRoute = () => {
    if (!user) return 'Login';
    if (user.role === 'ADMIN') return 'AdminDashboard';
    if (user.role === 'PARENT') return 'ParentHome';
    return 'ChildHome';
  };

  const navItems = [
    { key: 'Home', label: 'الرئيسية', icon: '🏠', route: getHomeRoute() },
    { key: 'Curricula', label: 'المناهج والمسابقات', icon: '📚', route: 'Curricula' },
    { key: 'Attendance', label: 'الـ QR والغياب', icon: '📋', route: 'Attendance' },
    { key: 'Memories', label: 'الذكريات', icon: '📸', route: 'Memories' },
    { key: 'UserProfile', label: 'حسابي', icon: '👤', route: 'UserProfile' },
  ];

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
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
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
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  bar: {
    flexDirection: 'row-reverse',
    backgroundColor: '#8B0000',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navIconActive: {
    transform: [{ scale: 1.15 }],
  },
  navLabel: {
    fontSize: 10,
    color: '#D4A359',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
