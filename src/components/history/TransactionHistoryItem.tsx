import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ArrowUp, ArrowDown } from 'phosphor-react-native';
import { neutral, semantic, primary } from '@/constants/colors';
import { formatDate, formatTime } from '@/utils/date';

export interface TransactionHistoryItemProps {
  id: string;
  type: 'sent' | 'received';
  recipient: string;
  amount: number;
  date: Date | string;
  transactionId: string;
  status?: 'success' | 'pending' | 'failed';
  onPress?: () => void;
  index?: number;
}

const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = ({
  type,
  recipient,
  amount,
  date,
  transactionId,
  status = 'success',
  onPress,
  index = 0,
}) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = index * 80;
    
    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withSpring(0, {
        damping: 12,
        stiffness: 100,
      });
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return semantic.success;
      case 'pending':
        return semantic.warning;
      case 'failed':
        return semantic.error;
      default:
        return semantic.success;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Completed';
    }
  };

  const dateObj = date instanceof Date ? date : new Date(date);
  const formattedDate = formatDate(dateObj, { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = formatTime(dateObj);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Icon Container */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: type === 'sent' ? '#FFF0F0' : '#F0FFF4' }
        ]}>
          {type === 'sent' ? (
            <ArrowUp size={24} color={semantic.error} weight="bold" />
          ) : (
            <ArrowDown size={24} color={semantic.success} weight="bold" />
          )}
        </View>

        {/* Transaction Info */}
        <View style={styles.infoContainer}>
          <View style={styles.topRow}>
            <Text style={styles.recipient} numberOfLines={1}>
              {type === 'sent' ? `To ${recipient}` : `From ${recipient}`}
            </Text>
            <Text style={[
              styles.amount,
              { color: type === 'sent' ? semantic.error : semantic.success }
            ]}>
              {type === 'sent' ? '-' : '+'}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View style={styles.bottomRow}>
            <Text style={styles.dateTime}>
              {formattedDate} • {formattedTime}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.transactionId} numberOfLines={1}>
            ID: {transactionId}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: neutral.neutral6,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: 'rgba(54, 41, 183, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recipient: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: neutral.neutral1,
    marginRight: 8,
  },
  amount: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTime: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: neutral.neutral3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'Poppins',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  transactionId: {
    fontFamily: 'Poppins',
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
    color: neutral.neutral4,
  },
});

export default TransactionHistoryItem;
