import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/common';
import { InfoRowWithValue } from '@/components/settings';
import { primary, neutral } from '@/constants/colors';

const AppInformation = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <AppHeader 
        title="App information" 
        backgroundColor={neutral.neutral6}
        textColor={neutral.neutral1}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* App Name */}
        <Text style={styles.appName}>CaBank E-mobile Banking</Text>

        {/* Information List */}
        <View style={styles.infoList}>
          <InfoRowWithValue 
            title="Date of manufacture"
            value="     Dec 2019"
          />
          <InfoRowWithValue 
            title="Version"
            value="9.0.2"
          />
          <InfoRowWithValue 
            title="Language"
            value="English"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppInformation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neutral.neutral6,
  },
  content: {
    flex: 1,
    backgroundColor: neutral.neutral6,
  },
  contentContainer: {
    paddingTop: 40,
    paddingBottom: 32,
  },
  appName: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: neutral.neutral1,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  infoList: {
    gap: 20,
  },
});
