import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import customTabs from "../../components/common/customTabs"

const RootLayout = () => {
  return (
    <Tabs 
        tabBar={(props : any) => customTabs(props)}
        screenOptions={{headerShown: false}}>
        <Tabs.Screen name="index" options={{title: "Home"}} />
        <Tabs.Screen name="message" options={{title: "Messages"}} />
        <Tabs.Screen name="search" options={{title: "Search"}} />
        <Tabs.Screen name="setting" options={{title: "Settings"}} />
    </Tabs>
  )
}

export default RootLayout

const styles = StyleSheet.create({})