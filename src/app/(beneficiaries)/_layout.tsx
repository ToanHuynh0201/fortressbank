import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const RootLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade",
				animationDuration: 400,
			}}>
			<Stack.Screen
				name="beneficiaries"
				options={{
					title: "Beneficiaries",
					animation: "fade",
					animationDuration: 400,
				}}
			/>
			<Stack.Screen
				name="addBeneficiary"
				options={{
					title: "Add Beneficiaries",
					animation: "fade",
					animationDuration: 400,
				}}
			/>
		</Stack>
	);
};

export default RootLayout;

const styles = StyleSheet.create({});
