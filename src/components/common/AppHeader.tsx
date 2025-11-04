import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
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
      <View style={styles.headerContent}>
        {showBackButton ? (
          <Pressable 
            style={styles.backButton} 
            onPress={handleBack}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', radius: 24 }}
          >
            <View style={styles.backButtonInner}>
              <ArrowLeft size={24} color={textColor} weight="regular" />
            </View>
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  backButtonInner: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  backButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 44,
    height: 44,
  },
});

export default AppHeader;
