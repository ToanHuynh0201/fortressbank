import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
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
import {
	PrimaryButton,
	PINInput,
	AlertModal,
	ConfirmationModal,
} from "@/components";
import { transferService, accountService } from "@/services";
import { scale, fontSize, spacing } from '@/utils/responsive';

const PINVerification = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{
		transactionId: string;
		fromAccountId: string;
		recipientName?: string;
		amount?: string;
		bankName?: string;
	}>();
	const transactionId = params.transactionId;
	const fromAccountId = params.fromAccountId;

	const [pin, setPin] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [attempts, setAttempts] = useState(0);
	const MAX_ATTEMPTS = 3;
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});
	const [confirmModal, setConfirmModal] = useState({
		visible: false,
		title: "",
		message: "",
		onConfirm: () => {},
	});

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
			setAlertModal({
				visible: true,
				title: "Invalid PIN",
				message: "Please enter a 6-digit PIN",
				variant: "error",
			});
			return;
		}

		if (!transactionId || !fromAccountId) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Transaction information not found",
				variant: "error",
			});
			return;
		}

		if (attempts >= MAX_ATTEMPTS) {
			setAlertModal({
				visible: true,
				title: "Too Many Attempts",
				message:
					"You have exceeded the maximum number of PIN attempts. Please try again later.",
				variant: "error",
			});
			router.back();
			return;
		}

		setIsVerifying(true);
		try {
			console.log("Verifying PIN with data:", {
				fromAccountId: fromAccountId,
				transactionId: transactionId,
				pin: "******",
			});
			// First verify the account PIN
			const pinResponse = await accountService.verifyAccountPIN(
				fromAccountId,
				pin,
			);
			console.log("PIN verification response:", pinResponse);

			if (pinResponse.code === 1000 && pinResponse.data.valid === true) {
				// If PIN is correct, proceed with OTP verification
				// Navigate to OTP verification screen
				router.push({
					pathname: "(transfer)/otpVerification",
					params: {
						transactionId: transactionId,
						recipientName: params.recipientName || "",
						amount: params.amount || "",
						bankName: params.bankName || "",
					},
				});
			} else {
				setAttempts(attempts + 1);
				const remainingAttempts = MAX_ATTEMPTS - (attempts + 1);
				setAlertModal({
					visible: true,
					title: "Incorrect PIN",
					message:
						remainingAttempts > 0
							? `Incorrect PIN. You have ${remainingAttempts} attempt(s) remaining.`
							: "Maximum attempts reached. Transaction cancelled.",
					variant: "error",
				});
				setPin("");

				if (remainingAttempts === 0) {
					// Cancel the transaction
					try {
						await transferService.cancelTransaction(transactionId);
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

			setAlertModal({
				visible: true,
				title: "Verification Failed",
				message:
					remainingAttempts > 0
						? error.message ||
						  `Incorrect PIN. ${remainingAttempts} attempt(s) remaining.`
						: "Maximum attempts reached. Transaction cancelled.",
				variant: "error",
			});
			setPin("");

			if (remainingAttempts === 0) {
				// Cancel the transaction
				try {
					await transferService.cancelTransaction(transactionId);
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
		setConfirmModal({
			visible: true,
			title: "Forgot PIN",
			message:
				"Please go to Settings > Security > PIN to change your account PIN.",
			onConfirm: () => {
				setConfirmModal({ ...confirmModal, visible: false });
				router.push("/(home)/setting");
			},
		});
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
							size={scale(24)}
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
							size={scale(56)}
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
						title="Verify PIN"
						onPress={handleVerifyPIN}
						loading={isVerifying}
						loadingText="Verifying..."
						disabled={pin.length !== 6}
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

				<AlertModal
					visible={alertModal.visible}
					title={alertModal.title}
					message={alertModal.message}
					variant={alertModal.variant}
					onClose={() =>
						setAlertModal({ ...alertModal, visible: false })
					}
				/>

				<ConfirmationModal
					visible={confirmModal.visible}
					title={confirmModal.title}
					message={confirmModal.message}
					confirmText="Go to Settings"
					cancelText="Cancel"
					onConfirm={confirmModal.onConfirm}
					onCancel={() =>
						setConfirmModal({ ...confirmModal, visible: false })
					}
				/>
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
		paddingHorizontal: spacing(24),
		paddingTop: spacing(16),
		paddingBottom: spacing(24),
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	backButton: {
		width: scale(40),
		height: scale(40),
		justifyContent: "center",
		alignItems: "flex-start",
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(20),
		fontWeight: "700",
		color: colors.neutral.neutral6,
		flex: 1,
		textAlign: "center",
	},
	headerRight: {
		width: scale(40),
	},
	content: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
		borderTopLeftRadius: scale(30),
		borderTopRightRadius: scale(30),
		padding: spacing(24),
		paddingTop: spacing(40),
	},
	iconContainer: {
		alignItems: "center",
		marginBottom: spacing(32),
	},
	iconGradient: {
		width: scale(120),
		height: scale(120),
		borderRadius: scale(60),
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: scale(8) },
		shadowOpacity: 0.3,
		shadowRadius: scale(16),
		elevation: 8,
	},
	titleSection: {
		alignItems: "center",
		marginBottom: spacing(40),
	},
	title: {
		fontFamily: "Poppins",
		fontSize: fontSize(24),
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: spacing(12),
		textAlign: "center",
	},
	subtitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		lineHeight: fontSize(20),
		paddingHorizontal: spacing(20),
	},
	pinContainer: {
		marginBottom: spacing(16),
	},
	warningContainer: {
		alignItems: "center",
		marginBottom: spacing(8),
	},
	warningText: {
		fontFamily: "Poppins",
		fontSize: fontSize(13),
		fontWeight: "600",
		color: colors.semantic.error,
	},
	forgotContainer: {
		alignItems: "center",
		marginBottom: spacing(32),
	},
	forgotText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "600",
		color: colors.primary.primary1,
		textDecorationLine: "underline",
	},
	buttonContainer: {
		marginBottom: spacing(24),
	},
	noteContainer: {
		alignItems: "center",
		paddingHorizontal: spacing(20),
	},
	noteText: {
		fontFamily: "Poppins",
		fontSize: fontSize(12),
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		lineHeight: fontSize(18),
	},
});

export default PINVerification;
