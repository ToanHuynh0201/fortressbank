import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Switch, Alert } from "react-native";
import { Fingerprint } from "phosphor-react-native";
import { primary, neutral } from "@/constants";
import { useAuth } from "@/hooks";

export const BiometricSettings = () => {
	try {
		const {
			biometricAvailable,
			biometricEnabled,
			enableBiometric,
			disableBiometric,
			checkBiometricStatus,
		} = useAuth();
		const [isLoading, setIsLoading] = useState(false);
		const [localEnabled, setLocalEnabled] = useState(biometricEnabled);

		// Update localEnabled when biometricEnabled changes
		useEffect(() => {
			setLocalEnabled(biometricEnabled);
		}, [biometricEnabled]);

		const handleToggle = async (value: boolean) => {
			if (value) {
				// Enable biometric
				Alert.alert(
					"Enable Biometric Login",
					"You need to authenticate with your biometric and provide your login credentials to enable this feature.",
					[
						{
							text: "Cancel",
							style: "cancel",
						},
						{
							text: "Continue",
							onPress: async () => {
								// Prompt for credentials
								Alert.prompt(
									"Enter Username",
									"Please enter your username:",
									async (username) => {
										if (!username) return;

										Alert.prompt(
											"Enter Password",
											"Please enter your password:",
											async (password) => {
												if (!password) return;

												setIsLoading(true);
												try {
													const success =
														await enableBiometric(
															username,
															password,
														);
													if (success) {
														// Refresh biometric status
														await checkBiometricStatus();
														setLocalEnabled(true);
														Alert.alert(
															"Success",
															"Biometric login has been enabled successfully!",
														);
													} else {
														Alert.alert(
															"Failed",
															"Failed to enable biometric login. Please try again.",
														);
													}
												} catch (error: any) {
													Alert.alert(
														"Error",
														error.message ||
															"Failed to enable biometric login",
													);
												} finally {
													setIsLoading(false);
												}
											},
											"secure-text",
										);
									},
									"plain-text",
								);
							},
						},
					],
				);
			} else {
				// Disable biometric
				Alert.alert(
					"Disable Biometric Login",
					"Are you sure you want to disable biometric login?",
					[
						{
							text: "Cancel",
							style: "cancel",
						},
						{
							text: "Disable",
							style: "destructive",
							onPress: async () => {
								setIsLoading(true);
								try {
									const success = await disableBiometric();
									if (success) {
										// Refresh biometric status
										await checkBiometricStatus();
										setLocalEnabled(false);
										Alert.alert(
											"Success",
											"Biometric login has been disabled.",
										);
									} else {
										Alert.alert(
											"Failed",
											"Failed to disable biometric login. Please try again.",
										);
									}
								} catch (error) {
									Alert.alert(
										"Error",
										"Failed to disable biometric login",
									);
								} finally {
									setIsLoading(false);
								}
							},
						},
					],
				);
			}
		};

		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<View style={styles.iconContainer}>
						<Fingerprint
							size={20}
							color={primary.primary1}
							weight="bold"
						/>
					</View>
					<View style={styles.textContainer}>
						<Text style={styles.title}>Biometric Login</Text>
						<Text style={styles.subtitle}>
							{biometricAvailable
								? "Use fingerprint or face recognition to sign in"
								: "Not available on this device"}
						</Text>
					</View>
				</View>
				<Switch
					value={localEnabled}
					onValueChange={handleToggle}
					disabled={isLoading || !biometricAvailable}
					trackColor={{
						false: neutral.neutral4,
						true: primary.primary2,
					}}
					thumbColor={
						localEnabled ? primary.primary1 : neutral.neutral6
					}
					ios_backgroundColor={neutral.neutral4}
				/>
			</View>
		);
	} catch (error) {
		console.error("BiometricSettings render error:", error);
		return (
			<View style={styles.container}>
				<Text style={styles.title}>
					Biometric Error: {String(error)}
				</Text>
			</View>
		);
	}
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: neutral.neutral6,
		borderRadius: 16,
		paddingVertical: 16,
		paddingHorizontal: 16,
		marginHorizontal: 24,
		marginBottom: 12,
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
		borderWidth: 1,
		borderColor: neutral.neutral5,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		gap: 12,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: primary.primary4,
		justifyContent: "center",
		alignItems: "center",
	},
	textContainer: {
		flex: 1,
	},
	title: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: 2,
	},
	subtitle: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "400",
		color: neutral.neutral3,
		lineHeight: 16,
	},
});
