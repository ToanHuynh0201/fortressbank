import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	Easing,
	FadeIn,
} from "react-native-reanimated";
import { CaretLeft, LockKey } from "phosphor-react-native";
import colors from "@/constants/colors";
import { PrimaryButton, PINInput } from "@/components";
import { transferService, accountService } from "@/services";

const PINVerification = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{ txId: string; fromAccountId: string }>();
	const txId = params.txId;
	const fromAccountId = params.fromAccountId;

	const [pin, setPin] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [attempts, setAttempts] = useState(0);
	const MAX_ATTEMPTS = 3;

	const headerOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);

	useEffect(() => {
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});

		contentOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});
		contentTranslateY.value = withSpring(0, {
			damping: 20,
			stiffness: 90,
		});
	}, []);

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ translateY: contentTranslateY.value }],
	}));

	const handleVerifyPIN = async () => {
		if (pin.length !== 6) {
			Alert.alert("Invalid PIN", "Please enter a 6-digit PIN");
			return;
		}

		if (!txId || !fromAccountId) {
			Alert.alert("Error", "Transaction information not found");
			return;
		}

		if (attempts >= MAX_ATTEMPTS) {
			Alert.alert(
				"Too Many Attempts",
				"You have exceeded the maximum number of PIN attempts. Please try again later.",
			);
			router.back();
			return;
		}

		setIsVerifying(true);
		try {
			// First verify the account PIN
			const pinResponse = await accountService.verifyAccountPIN(
				fromAccountId,
				pin,
			);

			if (pinResponse.status === "success") {
				// If PIN is correct, proceed with OTP verification
				// Navigate to OTP verification screen
				router.push({
					pathname: "(transfer)/otpVerification",
					params: { txId },
				});
			} else {
				setAttempts(attempts + 1);
				const remainingAttempts = MAX_ATTEMPTS - (attempts + 1);
				Alert.alert(
					"Incorrect PIN",
					remainingAttempts > 0
						? `Incorrect PIN. You have ${remainingAttempts} attempt(s) remaining.`
						: "Maximum attempts reached. Transaction cancelled.",
				);
				setPin("");

				if (remainingAttempts === 0) {
					// Cancel the transaction
					try {
						await transferService.cancelTransaction(txId);
					} catch (error) {
						console.error("Failed to cancel transaction:", error);
					}
					router.back();
				}
			}
		} catch (error: any) {
			console.error("PIN verification error:", error);
			setAttempts(attempts + 1);
			const remainingAttempts = MAX_ATTEMPTS - (attempts + 1);

			Alert.alert(
				"Verification Failed",
				remainingAttempts > 0
					? error.message ||
							`Incorrect PIN. ${remainingAttempts} attempt(s) remaining.`
					: "Maximum attempts reached. Transaction cancelled.",
			);
			setPin("");

			if (remainingAttempts === 0) {
				// Cancel the transaction
				try {
					await transferService.cancelTransaction(txId);
				} catch (error) {
					console.error("Failed to cancel transaction:", error);
				}
				router.back();
			}
		} finally {
			setIsVerifying(false);
		}
	};

	const handleForgotPIN = () => {
		Alert.alert(
			"Forgot PIN",
			"Please go to Settings > Security > PIN to change your account PIN.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Go to Settings",
					onPress: () => {
						router.push("/(home)/setting");
					},
				},
			],
		);
	};

	return (
		<SafeAreaView
			style={styles.container}
			edges={["top"]}>
			<StatusBar
				barStyle="light-content"
				backgroundColor={colors.primary.primary1}
			/>

			{/* Enhanced Header with Gradient */}
			<LinearGradient
				colors={["#4A3FDB", "#3629B7", "#2A1F8F"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.headerGradient}>
				<Animated.View style={[styles.header, headerAnimatedStyle]}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}>
						<CaretLeft
							size={24}
							color={colors.neutral.neutral6}
							weight="bold"
						/>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>PIN Verification</Text>
					<View style={styles.headerRight} />
				</Animated.View>
			</LinearGradient>

			<Animated.View style={[styles.content, contentAnimatedStyle]}>
				{/* Icon Container */}
				<Animated.View
					entering={FadeIn.delay(100).duration(400)}
					style={styles.iconContainer}>
					<LinearGradient
						colors={[
							colors.primary.primary1,
							colors.primary.primary2,
						]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.iconGradient}>
						<LockKey
							size={56}
							color={colors.neutral.neutral6}
							weight="regular"
						/>
					</LinearGradient>
				</Animated.View>

				{/* Title Section */}
				<Animated.View
					entering={FadeIn.delay(150).duration(400)}
					style={styles.titleSection}>
					<Text style={styles.title}>Enter Your Account PIN</Text>
					<Text style={styles.subtitle}>
						Please enter your 6-digit account PIN to confirm this
						transaction
					</Text>
				</Animated.View>

				{/* PIN Input */}
				<Animated.View
					entering={FadeIn.delay(200).duration(400)}
					style={styles.pinContainer}>
					<PINInput
						length={6}
						onComplete={(code) => setPin(code)}
						onChangeText={(code) => setPin(code)}
						secureTextEntry={true}
					/>
				</Animated.View>

				{/* Attempts Warning */}
				{attempts > 0 && (
					<Animated.View
						entering={FadeIn.delay(250).duration(400)}
						style={styles.warningContainer}>
						<Text style={styles.warningText}>
							{MAX_ATTEMPTS - attempts} attempt(s) remaining
						</Text>
					</Animated.View>
				)}

				{/* Forgot PIN */}
				<Animated.View
					entering={FadeIn.delay(250).duration(400)}
					style={styles.forgotContainer}>
					<TouchableOpacity onPress={handleForgotPIN}>
						<Text style={styles.forgotText}>Forgot PIN?</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Verify Button */}
				<Animated.View
					entering={FadeIn.delay(300).duration(400)}
					style={styles.buttonContainer}>
					<PrimaryButton
						title={isVerifying ? "Verifying..." : "Verify PIN"}
						onPress={handleVerifyPIN}
						disabled={pin.length !== 6 || isVerifying}
					/>
				</Animated.View>

				{/* Security Note */}
				<Animated.View
					entering={FadeIn.delay(350).duration(400)}
					style={styles.noteContainer}>
					<Text style={styles.noteText}>
						Your PIN is encrypted and secure. Never share it with
						anyone.
					</Text>
				</Animated.View>
			</Animated.View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.primary.primary1,
	},
	headerGradient: {
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 24,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "flex-start",
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "700",
		color: colors.neutral.neutral6,
		flex: 1,
		textAlign: "center",
	},
	headerRight: {
		width: 40,
	},
	content: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		padding: 24,
		paddingTop: 40,
	},
	iconContainer: {
		alignItems: "center",
		marginBottom: 32,
	},
	iconGradient: {
		width: 120,
		height: 120,
		borderRadius: 60,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	titleSection: {
		alignItems: "center",
		marginBottom: 40,
	},
	title: {
		fontFamily: "Poppins",
		fontSize: 24,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: 12,
		textAlign: "center",
	},
	subtitle: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		lineHeight: 20,
		paddingHorizontal: 20,
	},
	pinContainer: {
		marginBottom: 16,
	},
	warningContainer: {
		alignItems: "center",
		marginBottom: 8,
	},
	warningText: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "600",
		color: colors.semantic.error,
	},
	forgotContainer: {
		alignItems: "center",
		marginBottom: 32,
	},
	forgotText: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.primary.primary1,
		textDecorationLine: "underline",
	},
	buttonContainer: {
		marginBottom: 24,
	},
	noteContainer: {
		alignItems: "center",
		paddingHorizontal: 20,
	},
	noteText: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		lineHeight: 18,
	},
});

export default PINVerification;
