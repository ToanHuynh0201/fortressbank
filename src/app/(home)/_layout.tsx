import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { CustomNavBar } from "@/components/layouts"

const RootLayout = () => {
  return (
    <Tabs 
        tabBar={(props : any) => <CustomNavBar {...props} />}
        screenOptions={{headerShown: false}}>
        <Tabs.Screen name="index" options={{title: "Home"}} />
        <Tabs.Screen name="notification" options={{title: "Notifications"}} />
        <Tabs.Screen name="history" options={{title: "History"}} />
        <Tabs.Screen name="setting" options={{title: "Settings"}} />
    </Tabs>
  )
}

export default RootLayout

const styles = StyleSheet.create({})