import React from 'react';
import { View, Image, Text, StyleSheet, ImageStyle } from 'react-native';
import { neutral } from '@/constants/colors';

interface UserAvatarProps {
  size?: number;
  imageUri?: string;
  initials?: string;
  backgroundColor?: string;
  textColor?: string;
  containerStyle?: ImageStyle;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 50,
  imageUri,
  initials,
  backgroundColor = neutral.neutral6,
  textColor = neutral.neutral1,
  containerStyle,
}) => {
  const avatarSize: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.avatar, avatarSize, containerStyle]}
      />
    );
  }

  if (initials) {
    return (
      <View style={[styles.avatar, avatarSize, { backgroundColor }, containerStyle]}>
        <Text style={[styles.initials, { color: textColor, fontSize: size / 2.5 }]}>
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.avatar, avatarSize, { backgroundColor }, containerStyle]} />
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
});

export default UserAvatar;
