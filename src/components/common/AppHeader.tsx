import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { neutral, primary } from '@/constants/colors';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  backgroundColor?: string;
  textColor?: string;
  containerStyle?: ViewStyle;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onBack,
  showBackButton = true,
  backgroundColor = primary.primary1,
  textColor = neutral.neutral6,
  containerStyle,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor }, containerStyle]}>
      {showBackButton ? (
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: textColor }]}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}
      <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 25,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonPlaceholder: {
    width: 40,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
});

export default AppHeader;
