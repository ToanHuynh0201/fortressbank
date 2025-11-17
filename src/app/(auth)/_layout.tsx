import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';

const RootLayout = () => {
  return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 400,
        }}>
            <Stack.Screen 
                name="signIn" 
                options={{
                    title: "Sign In",
                    animation: 'fade',
                    animationDuration: 400,
                }} 
            />
            <Stack.Screen 
                name="signUp" 
                options={{
                    title: "Sign Up",
                    animation: 'fade',
                    animationDuration: 400,
                }} 
            />
            <Stack.Screen 
                name="forgotPassword" 
                options={{
                    title: "Forgot Password",
                    animation: 'fade',
                    animationDuration: 400,
                }} 
            />
            <Stack.Screen 
                name="changePassword" 
                options={{
                    title: "Change Password",
                    animation: 'fade',
                    animationDuration: 400,
                }} 
            />
        </Stack>
    );
}

export default RootLayout

const styles = StyleSheet.create({})