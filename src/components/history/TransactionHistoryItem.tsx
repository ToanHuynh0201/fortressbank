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
import { scale, fontSize, spacing } from '@/utils/responsive';

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
  style?: any;
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
  style,
}) => {
  const scaleAnim = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    const delay = index * 50;

    setTimeout(() => {
      scaleAnim.value = withSpring(1, {
        damping: 20,
        stiffness: 100,
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 90,
      });
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnim.value },
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
    <Animated.View style={[animatedStyle, style]}>
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
            <ArrowUp size={scale(24)} color={semantic.error} weight="bold" />
          ) : (
            <ArrowDown size={scale(24)} color={semantic.success} weight="bold" />
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
    borderRadius: scale(16),
    padding: spacing(16),
    marginBottom: spacing(12),
    shadowColor: 'rgba(54, 41, 183, 0.08)',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 1,
    shadowRadius: scale(20),
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing(12),
  },
  infoContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(6),
  },
  recipient: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: fontSize(15),
    fontWeight: '600',
    lineHeight: scale(22),
    color: neutral.neutral1,
    marginRight: spacing(8),
  },
  amount: {
    fontFamily: 'Poppins',
    fontSize: fontSize(16),
    fontWeight: '700',
    lineHeight: scale(24),
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  dateTime: {
    fontFamily: 'Poppins',
    fontSize: fontSize(12),
    fontWeight: '400',
    lineHeight: scale(18),
    color: neutral.neutral3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(2),
    borderRadius: scale(8),
    gap: spacing(4),
  },
  statusDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  statusText: {
    fontFamily: 'Poppins',
    fontSize: fontSize(11),
    fontWeight: '600',
    lineHeight: scale(16),
  },
  transactionId: {
    fontFamily: 'Poppins',
    fontSize: fontSize(11),
    fontWeight: '400',
    lineHeight: scale(16),
    color: neutral.neutral4,
  },
});

export default TransactionHistoryItem;
