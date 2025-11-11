import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { ClockClockwise, Calendar } from 'phosphor-react-native';
import colors, { primary, neutral, semantic } from '@/constants/colors';
import { TransactionHistoryItem } from '@/components';

// Mock data - trong thực tế sẽ lấy từ API
const mockTransactions = [
  {
    id: 'TXN001',
    type: 'sent' as const,
    recipient: 'Capi Creative Design',
    amount: 1000,
    date: new Date('2025-11-11T10:30:00'),
    transactionId: 'TXN123456789',
    status: 'success' as const,
  },
  {
    id: 'TXN002',
    type: 'received' as const,
    recipient: 'John Doe',
    amount: 250.50,
    date: new Date('2025-11-10T14:20:00'),
    transactionId: 'TXN123456788',
    status: 'success' as const,
  },
  {
    id: 'TXN003',
    type: 'sent' as const,
    recipient: 'Sarah Williams',
    amount: 500,
    date: new Date('2025-11-09T09:15:00'),
    transactionId: 'TXN123456787',
    status: 'success' as const,
  },
  {
    id: 'TXN004',
    type: 'sent' as const,
    recipient: 'Tech Solutions Inc',
    amount: 1500,
    date: new Date('2025-11-08T16:45:00'),
    transactionId: 'TXN123456786',
    status: 'pending' as const,
  },
  {
    id: 'TXN005',
    type: 'received' as const,
    recipient: 'Michael Chen',
    amount: 750,
    date: new Date('2025-11-07T11:00:00'),
    transactionId: 'TXN123456785',
    status: 'success' as const,
  },
  {
    id: 'TXN006',
    type: 'sent' as const,
    recipient: 'Emma Thompson',
    amount: 300,
    date: new Date('2025-11-06T13:30:00'),
    transactionId: 'TXN123456784',
    status: 'success' as const,
  },
  {
    id: 'TXN007',
    type: 'received' as const,
    recipient: 'David Miller',
    amount: 2000,
    date: new Date('2025-11-05T10:00:00'),
    transactionId: 'TXN123456783',
    status: 'success' as const,
  },
  {
    id: 'TXN008',
    type: 'sent' as const,
    recipient: 'Global Services Ltd',
    amount: 850,
    date: new Date('2025-11-04T15:20:00'),
    transactionId: 'TXN123456782',
    status: 'failed' as const,
  },
];

const History = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const headerScale = useSharedValue(0.96);
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, {
      damping: 20,
      stiffness: 100,
    });
    headerOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setTransactions([...mockTransactions]);
      setRefreshing(false);
    }, 1500);
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totalSent = transactions
    .filter((t) => t.type === 'sent')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter((t) => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={primary.primary1} />

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#4A3FDB', '#3629B7', '#2A1F8F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <ClockClockwise size={28} color={neutral.neutral6} weight="bold" />
            <Text style={styles.headerTitle}>Transaction History</Text>
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Sent</Text>
              <Text style={styles.statValue}>
                ${totalSent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Received</Text>
              <Text style={styles.statValue}>
                ${totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Filter Buttons */}
        <Animated.View 
          entering={FadeIn.delay(150).duration(400)}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'sent' && styles.filterButtonActive]}
            onPress={() => setFilter('sent')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'sent' && styles.filterTextActive]}>
              Sent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'received' && styles.filterButtonActive]}
            onPress={() => setFilter('received')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'received' && styles.filterTextActive]}>
              Received
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Transactions List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primary.primary1]}
              tintColor={primary.primary1}
            />
          }
        >
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <TransactionHistoryItem
                key={transaction.id}
                {...transaction}
                index={index}
                onPress={() => {
                  // Handle transaction detail view
                  console.log('Transaction pressed:', transaction.id);
                }}
              />
            ))
          ) : (
            <Animated.View 
              entering={FadeIn.delay(200).duration(400)}
              style={styles.emptyState}
            >
              <Calendar size={64} color={neutral.neutral4} weight="thin" />
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptyMessage}>
                {filter === 'all'
                  ? 'You have no transaction history yet'
                  : `You have no ${filter} transactions`}
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary.primary1,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: neutral.neutral6,
    lineHeight: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: neutral.neutral6,
    lineHeight: 28,
  },
  content: {
    flex: 1,
    backgroundColor: neutral.neutral6,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: neutral.neutral5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: primary.primary1,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral2,
    lineHeight: 20,
  },
  filterTextActive: {
    color: neutral.neutral6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral1,
    lineHeight: 28,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '400',
    color: neutral.neutral3,
    lineHeight: 21,
    textAlign: 'center',
  },
});