import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/common';
import { SettingRow } from '@/components/settings';
import { primary, neutral } from '@/constants/colors';
import { UserAvatar } from '@/components';
import { clearStorage } from '@/utils/storage';

const Setting = () => {
  const router = useRouter();

  const handlePasswordPress = () => {
    router.push('/(auth)/changePassword');
  };

  const handleTouchIDPress = () => {
    // Handle Touch ID settings
    console.log('Touch ID pressed');
  };

  const handleLanguagesPress = () => {
    // Handle language settings
    console.log('Languages pressed');
  };

  const handleAppInfoPress = () => {
    router.push('/appInformation');
  };

  const handleCustomerCarePress = () => {
    // Handle customer care
    console.log('Customer care pressed');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearStorage();
              router.replace('/(auth)/signIn');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      <AppHeader 
        title="Setting" 
        backgroundColor={primary.primary1}
        textColor={neutral.neutral6}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <UserAvatar
              imageUri="https://i.pravatar.cc/150?img=12"
              size={90}
            />
          <Text style={styles.userName}>Push Puttichai</Text>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <SettingRow 
            title="Password"
            onPress={handlePasswordPress}
          />
          <SettingRow 
            title="Touch ID"
            onPress={handleTouchIDPress}
          />
          <SettingRow 
            title="Languages"
            onPress={handleLanguagesPress}
          />
          <SettingRow 
            title="App information"
            onPress={handleAppInfoPress}
          />
          <SettingRow 
            title="Customer care"
            subtitle="19008989"
            onPress={handleCustomerCarePress}
          />
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary.primary1,
  },
  content: {
    flex: 1,
    backgroundColor: neutral.neutral6,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: neutral.neutral5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: primary.primary1,
  },
  settingsList: {
    gap: 16,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  logoutText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    color: neutral.neutral6,
  },
});