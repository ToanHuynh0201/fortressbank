import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CaretLeft, User, CreditCard, Calendar, Wallet, Trash } from 'phosphor-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import colors from '@/constants/colors';
import { ScreenContainer } from '@/components';

interface CardDetailData {
  id: string;
  name: string;
  cardNumber: string;
  validFrom: string;
  goodThru: string;
  availableBalance: string;
}

const CardDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data - In real app, fetch based on params.id
  const cardData: CardDetailData = {
    id: '1',
    name: 'Push Puttichai',
    cardNumber: '**** **** 9018',
    validFrom: '10/15',
    goodThru: '10/20',
    availableBalance: '$10,000',
  };

  const handleDeleteCard = () => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Call API to delete card
            console.log('Deleting card...');
            router.back();
          },
        },
      ]
    );
  };

  const getIcon = (label: string) => {
    switch (label) {
      case 'Name':
        return <User size={20} color={colors.primary.primary1} weight="duotone" />;
      case 'Card number':
        return <CreditCard size={20} color={colors.primary.primary1} weight="duotone" />;
      case 'Valid from':
      case 'Good thru':
        return <Calendar size={20} color={colors.primary.primary1} weight="duotone" />;
      case 'Available balance':
        return <Wallet size={20} color={colors.primary.primary1} weight="duotone" />;
      default:
        return null;
    }
  };

  const InfoRow = ({ label, value, index }: { label: string; value: string; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400).springify()}
      style={styles.infoRow}
    >
      <View style={styles.infoRowHeader}>
        <View style={styles.iconContainer}>
          {getIcon(label)}
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <CaretLeft size={18} color={colors.primary.primary2} weight="bold" style={styles.chevron} />
      </View>
    </Animated.View>
  );

  return (
    <ScreenContainer backgroundColor={colors.neutral.neutral6}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <CaretLeft size={16} color={colors.neutral.neutral1} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Information Rows */}
        <View style={styles.infoSection}>
          <InfoRow label="Name" value={cardData.name} index={0} />
          <InfoRow label="Card number" value={cardData.cardNumber} index={1} />
          <InfoRow label="Valid from" value={cardData.validFrom} index={2} />
          <InfoRow label="Good thru" value={cardData.goodThru} index={3} />
          <InfoRow label="Available balance" value={cardData.availableBalance} index={4} />
        </View>

        {/* Delete Card Button */}
        <Animated.View entering={FadeInDown.delay(600).duration(400).springify()}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteCard}
            activeOpacity={0.7}
          >
            <Trash size={20} color="#FF4267" weight="bold" />
            <Text style={styles.deleteButtonText}>Delete card</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicator} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    height: 53,
    backgroundColor: colors.neutral.neutral6,
  },
  backButton: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.neutral.neutral1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  infoSection: {
    marginBottom: 40,
  },
  infoRow: {
    backgroundColor: colors.neutral.neutral6,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.primary.primary1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(74, 63, 219, 0.08)',
  },
  infoRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 63, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: '#979797',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 52,
  },
  value: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    color: colors.primary.primary1,
    flex: 1,
  },
  chevron: {
    transform: [{ rotate: '180deg' }],
    marginLeft: 8,
  },
  deleteButton: {
    height: 54,
    backgroundColor: colors.neutral.neutral6,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4267',
    gap: 10,
    shadowColor: '#FF4267',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  deleteButtonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    color: '#FF4267',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.neutral6,
  },
  indicator: {
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.neutral.neutral4,
  },
});

export default CardDetail;
