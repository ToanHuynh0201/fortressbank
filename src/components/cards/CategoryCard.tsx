import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { scale } from '@/utils/responsive';
import { typography, spacingScale, borderRadius } from '@/constants/responsive';

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  containerStyle?: ViewStyle;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  icon,
  onPress,
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.categoryCard, containerStyle]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.categoryIcon}>{icon}</View>
      <Text style={styles.categoryTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    width: '30%',
    height: scale(100),
    borderRadius: borderRadius.lg,
    padding: spacingScale.lg,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: scale(5) },
    shadowOpacity: 1,
    shadowRadius: scale(30),
    elevation: 2,
  },
  categoryIcon: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    justifyContent: 'center',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: spacingScale.md,
    alignSelf: 'center',
  },
  categoryTitle: {
    fontSize: typography.caption,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#979797',
    lineHeight: scale(16),
    textAlign: 'center',
  },
});

export default CategoryCard;
