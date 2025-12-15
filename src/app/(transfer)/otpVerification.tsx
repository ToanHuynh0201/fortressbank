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
import { CaretLeft, ShieldCheck } from "phosphor-react-native";
import colors from "@/constants/colors";
import { PrimaryButton, OTPInput, AlertModal } from "@/components";
import { transferService } from "@/services";

const OTPVerification = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{ txId: string }>();
	const txId = params.txId;

	const [otp, setOtp] = useState("");
	const [timer, setTimer] = useState(60);
	const [canResend, setCanResend] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
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

	// Timer countdown
	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		} else {
			setCanResend(true);
		}
	}, [timer]);

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ translateY: contentTranslateY.value }],
	}));

	const handleResendOTP = async () => {
		if (!canResend || !txId) return;

		try {
			await transferService.resendOTP(txId);
			setTimer(60);
			setCanResend(false);
			setOtp("");
			setAlertModal({
				visible: true,
				title: "OTP Sent",
				message: "A new OTP has been sent to your phone",
				variant: "success",
			});
		} catch (error: any) {
			console.error("Resend OTP error:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: error.message || "Failed to resend OTP. Please try again.",
				variant: "error",
			});
		}
	};

	const handleVerifyOTP = async () => {
		if (otp.length !== 6) {
			setAlertModal({
				visible: true,
				title: "Invalid OTP",
				message: "Please enter a 6-digit OTP",
				variant: "error",
			});
			return;
		}
		if (!txId) {
			console.log(txId);
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Transaction ID not found",
				variant: "error",
			});
			return;
		}
		setIsVerifying(true);
		try {
			// Call API to verify OTP
			const response = await transferService.verifyOTP({
				transactionId: txId,
				otpCode: otp,
			});
			if (
				response.status === "success" &&
				response.data.status === "SUCCESS"
			) {
				// Navigate to success screen with transaction details
				console.log("Transaction completed:", response.data);
				router.push("(transfer)/transferSuccess");
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: "Transaction verification failed",
					variant: "error",
				});
			}
		} catch (error: any) {
			console.error("OTP verification error:", error);
			setAlertModal({
				visible: true,
				title: "Verification Failed",
				message: error.message || "The OTP you entered is incorrect. Please try again.",
				variant: "error",
			});
			setOtp("");
		} finally {
			setIsVerifying(false);
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
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
					<Text style={styles.headerTitle}>OTP Verification</Text>
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
						<ShieldCheck
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
					<Text style={styles.title}>Enter Verification Code</Text>
					<Text style={styles.subtitle}>
						We've sent a 6-digit code to your registered phone
						number
					</Text>
					<Text style={styles.phoneNumber}>+84 *** *** **90</Text>
				</Animated.View>

				{/* OTP Input */}
				<Animated.View
					entering={FadeIn.delay(200).duration(400)}
					style={styles.otpContainer}>
					<OTPInput
						length={6}
						onComplete={(code) => setOtp(code)}
						onChangeText={(code) => setOtp(code)}
					/>
				</Animated.View>

				{/* Timer and Resend */}
				<Animated.View
					entering={FadeIn.delay(250).duration(400)}
					style={styles.timerContainer}>
					{!canResend ? (
						<Text style={styles.timerText}>
							Resend code in{" "}
							<Text style={styles.timerHighlight}>
								{formatTime(timer)}
							</Text>
						</Text>
					) : (
						<TouchableOpacity onPress={handleResendOTP}>
							<Text style={styles.resendText}>Resend OTP</Text>
						</TouchableOpacity>
					)}
				</Animated.View>

				{/* Verify Button */}
				<Animated.View
					entering={FadeIn.delay(300).duration(400)}
					style={styles.buttonContainer}>
					<PrimaryButton
						title={
							isVerifying ? "Verifying..." : "Verify & Continue"
						}
						onPress={handleVerifyOTP}
						// disabled={otp.length !== 6 || isVerifying}
					/>
				</Animated.View>

				{/* Help Text */}
				<Animated.View
					entering={FadeIn.delay(350).duration(400)}
					style={styles.helpContainer}>
					<Text style={styles.helpText}>
						Didn't receive the code?{" "}
						<Text style={styles.helpLink}>Contact Support</Text>
					</Text>
				</Animated.View>

				<AlertModal
					visible={alertModal.visible}
					title={alertModal.title}
					message={alertModal.message}
					variant={alertModal.variant}
					onClose={() => setAlertModal({ ...alertModal, visible: false })}
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
		marginBottom: 8,
	},
	phoneNumber: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "600",
		color: colors.primary.primary1,
	},
	otpContainer: {
		marginBottom: 24,
	},
	timerContainer: {
		alignItems: "center",
		marginBottom: 32,
	},
	timerText: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	timerHighlight: {
		fontWeight: "600",
		color: colors.primary.primary1,
	},
	resendText: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.primary.primary1,
		textDecorationLine: "underline",
	},
	buttonContainer: {
		marginBottom: 24,
	},
	helpContainer: {
		alignItems: "center",
	},
	helpText: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
	},
	helpLink: {
		fontWeight: "600",
		color: colors.primary.primary1,
		textDecorationLine: "underline",
	},
});

export default OTPVerification;
