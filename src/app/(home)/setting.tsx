import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/common';
import { SettingRow } from '@/components/settings';
import { primary, neutral } from '@/constants/colors';

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
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
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../../assets/adaptive-icon.png')}
              style={styles.avatar}
            />
          </View>
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
    width: 100,
    height: 100,
    borderRadius: 50,
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
});