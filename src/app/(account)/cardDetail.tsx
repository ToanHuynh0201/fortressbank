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
import { CaretLeft } from 'phosphor-react-native';
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

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <View style={styles.iconContainer}>
          <CaretLeft size={16} color={colors.neutral.neutral5} weight="regular" style={styles.icon} />
        </View>
      </View>
      <View style={styles.divider} />
    </View>
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
          <InfoRow label="Name" value={cardData.name} />
          <InfoRow label="Card number" value={cardData.cardNumber} />
          <InfoRow label="Valid from" value={cardData.validFrom} />
          <InfoRow label="Good thru" value={cardData.goodThru} />
          <InfoRow label="Available balance" value={cardData.availableBalance} />
        </View>

        {/* Delete Card Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteCard}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Delete card</Text>
        </TouchableOpacity>
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
    paddingTop: 24,
    paddingBottom: 120,
  },
  infoSection: {
    marginBottom: 295,
  },
  infoRow: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#979797',
    marginBottom: 0,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  value: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.primary.primary1,
    flex: 1,
  },
  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    transform: [{ rotate: '180deg' }],
  },
  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginTop: 12,
  },
  deleteButton: {
    height: 44,
    backgroundColor: colors.neutral.neutral6,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4267',
  },
  deleteButtonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#FF4267',
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
