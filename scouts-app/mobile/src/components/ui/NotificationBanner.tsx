import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  Vibration,
} from 'react-native';
import { useNotificationStore } from '../../store/notificationStore';

interface NotificationBannerProps {
  navigationRef?: any;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ navigationRef }) => {
  const { activeNotification, hideBanner } = useNotificationStore();
  const translateY = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (activeNotification) {
      // Vibrate on receiving notification
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 100, 50, 100]);
      }

      // Slide Down Animation
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }).start();

      // Auto hide after 6 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      hideBanner();
    });
  };

  const handlePress = () => {
    if (!activeNotification) return;

    dismiss();

    if (navigationRef) {
      if (activeNotification.type === 'CHAT') {
        navigationRef.navigate('ChatRooms');
      } else if (activeNotification.type === 'MEMORY') {
        navigationRef.navigate('Memories');
      } else if (activeNotification.type === 'SCOUTING_PLAN') {
        navigationRef.navigate('ScoutingPlan');
      } else if (activeNotification.type === 'CURRICULUM') {
        navigationRef.navigate('Curricula');
      }
    }
  };

  if (!activeNotification) return null;

  const getIcon = () => {
    switch (activeNotification.type) {
      case 'CHAT':
        return '💬';
      case 'MEMORY':
        return '📸';
      case 'SCOUTING_PLAN':
        return '📅';
      case 'CURRICULUM':
        return '📖';
      default:
        return '🔔';
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <TouchableOpacity
        style={styles.bannerCard}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* App Logo Avatar */}
        <View style={styles.logoBadge}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Content Wrapper */}
        <View style={styles.textWrap}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>
              {getIcon()} {activeNotification.title}
            </Text>
            <Text style={styles.appTag}>جنود المسيح</Text>
          </View>
          <Text style={styles.bodyText} numberOfLines={2}>
            {activeNotification.body}
          </Text>
        </View>

        {/* Dismiss Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 12,
    left: 12,
    right: 12,
    zIndex: 99999,
    elevation: 100,
  },
  bannerCard: {
    backgroundColor: '#8B0000',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D4A359',
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#D4A359',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  textWrap: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 6,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  titleText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  appTag: {
    backgroundColor: 'rgba(212, 163, 89, 0.25)',
    color: '#D4A359',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bodyText: {
    color: '#E5E7EB',
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 16,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
