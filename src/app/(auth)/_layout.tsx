import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';

const RootLayout = () => {
  return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
        }}>
            <Stack.Screen 
                name="signIn" 
                options={{
                    title: "Sign In",
                    animation: 'fade',
                }} 
            />
            <Stack.Screen 
                name="signUp" 
                options={{
                    title: "Sign Up",
                    animation: 'slide_from_right',
                }} 
            />
            <Stack.Screen 
                name="forgotPassword" 
                options={{
                    title: "Forgot Password",
                    animation: 'slide_from_right',
                }} 
            />
            <Stack.Screen 
                name="changePassword" 
                options={{
                    title: "Change Password",
                    animation: 'slide_from_right',
                }} 
            />
        </Stack>
    );
}

export default RootLayout

const styles = StyleSheet.create({})