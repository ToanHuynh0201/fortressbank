import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { AppHeader } from '@/components/common';
import { NotificationItem } from '@/components/notifications';
import { primary, neutral, semantic } from '@/constants/colors';
import { useNotifications } from '@/contexts';
import { CheckCircle } from 'phosphor-react-native';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const Notification = () => {
  const { notifications, deleteNotification, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(15);

  useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    contentTranslateY.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader 
          title="Notifications" 
          showBackButton={true}
          backgroundColor={primary.primary1}
          textColor={neutral.neutral6}
        />

        <AnimatedScrollView 
          style={[styles.content, contentAnimatedStyle]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <Animated.View 
              entering={FadeIn.delay(100).duration(400)}
              style={styles.actionContainer}
            >
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={markAllAsRead}
                activeOpacity={0.8}
              >
                <CheckCircle size={20} color={neutral.neutral6} weight="bold" />
                <Text style={styles.markAllButtonText}>
                  Mark all as read ({unreadCount})
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View 
            entering={FadeIn.delay(150).duration(400)}
            style={styles.notificationsList}
          >
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                title={notification.title}
                message={notification.message}
                time={notification.time}
                isRead={notification.isRead}
                type={notification.type}
                onPress={() => markAsRead(notification.id)}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))}
          </Animated.View>
        </AnimatedScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary.primary1,
  },
  content: {
    flex: 1,
    backgroundColor: neutral.neutral6,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primary.primary1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
    shadowColor: primary.primary1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  markAllButtonText: {
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '600',
    color: neutral.neutral6,
    lineHeight: 22,
  },
  notificationsList: {
    gap: 0,
  },
});