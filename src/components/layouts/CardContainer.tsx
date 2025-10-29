import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { neutral } from '@/constants/colors';

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
    borderRadius: 15,
    padding: 16,
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
