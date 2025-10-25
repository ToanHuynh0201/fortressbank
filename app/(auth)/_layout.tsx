import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';

const RootLayout = () => {
  return (
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="signIn" options={{title: "Sign In"}} />
            <Stack.Screen name="signUp" options={{title: "Sign Up"}} />
        </Stack>
    );
}

export default RootLayout

const styles = StyleSheet.create({})