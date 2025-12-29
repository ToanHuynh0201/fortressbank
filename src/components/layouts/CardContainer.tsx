import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { neutral } from '@/constants/colors';
import { borderRadius, spacingScale } from '@/constants/responsive';

interface CardContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  shadowColor?: string;
}

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  style,
  shadowColor = '#3629B7',
}) => {
  return (
    <View style={[styles.card, { shadowColor }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: neutral.neutral6,
    borderRadius: borderRadius.lg,
    padding: spacingScale.lg,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 5,
  },
});

export default CardContainer;
