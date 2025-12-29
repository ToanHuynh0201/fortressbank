import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { primary, neutral } from '@/constants/colors';
import { scale, fontSize, spacing } from '@/utils/responsive';
import { typography, spacingScale, borderRadius, componentSizes } from '@/constants/responsive';

interface LinkTextProps {
  normalText: string;
  linkText: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
  normalTextStyle?: TextStyle;
  linkTextStyle?: TextStyle;
}

const LinkText: React.FC<LinkTextProps> = ({
  normalText,
  linkText,
  onPress,
  containerStyle,
  normalTextStyle,
  linkTextStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.normalText, normalTextStyle]}>{normalText}</Text>
      <Pressable onPress={onPress}>
        <Text style={[styles.linkText, linkTextStyle]}>{linkText}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  normalText: {
    fontSize: typography.caption,
    fontWeight: '400',
    color: neutral.neutral1,
  },
  linkText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: primary.primary1,
  },
});

export default LinkText;
