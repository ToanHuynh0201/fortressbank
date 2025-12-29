import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { primary, neutral } from '@/constants/colors';
import { typography } from '@/constants/responsive';

interface InfoRowProps {
  label: string;
  value: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  containerStyle,
  labelStyle,
  valueStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins',
    fontSize: typography.caption,
    fontWeight: '500',
    lineHeight: 16,
    color: '#979797',
  },
  value: {
    fontFamily: 'Poppins',
    fontSize: typography.caption,
    fontWeight: '600',
    lineHeight: 16,
    color: primary.primary1,
  },
});

export default InfoRow;
