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
      <View style={[styles.avatarContainer, { width: size, height: size }]}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.avatar, avatarSize, containerStyle]}
        />
        <View style={styles.avatarBorder} />
      </View>
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
  avatarContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  initials: {
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
});

export default UserAvatar;
