import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';

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
    height: 100,
    borderRadius: 15,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 2,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  categoryTitle: {
    fontSize: 12,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#979797',
    lineHeight: 16,
    textAlign: 'center',
  },
});

export default CategoryCard;
