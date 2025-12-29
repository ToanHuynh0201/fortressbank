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
import { scale, fontSize, spacing } from '@/utils/responsive';

const OTPVerification = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{ transactionId: string }>();
	const transactionId = params.transactionId;

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
		console.log("OTP confirm:", transactionId);
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
		if (!canResend || !transactionId) return;

		try {
			await transferService.resendOTP(transactionId);
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
				message:
					error.message || "Failed to resend OTP. Please try again.",
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
		if (!transactionId) {
			console.log(transactionId);
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
			console.log("Verifying OTP with data:", {
				transactionId: transactionId,
				otpCode: otp,
			});
			// Call API to verify OTP
			const response = await transferService.verifyOTP({
				transactionId: transactionId,
				otpCode: otp,
			});
			console.log("OTP verification response:", response);
			console.log("Response code:", response.code);
			console.log("Transaction status:", response.data?.status);

			// Check if transaction is completed successfully
			// Accept if status is COMPLETED OR if code is 1000 with valid data
			const isCompleted = response.data?.status === "COMPLETED";
			const isSuccessCode = response.code === 1000 && response.data;

			if (isCompleted || isSuccessCode) {
				// Navigate to success screen with transaction details
				console.log("Transaction completed:", response.data);
				router.push("(transfer)/transferSuccess");
			} else {
				// Log detailed error info
				console.error("Verification failed - Code:", response.code, "Status:", response.data?.status);
				setAlertModal({
					visible: true,
					title: "Error",
					message: response.message || "Transaction verification failed",
					variant: "error",
				});
			}
		} catch (error: any) {
			console.error("OTP verification error:", error);
			console.error("Error response:", error.response?.data);

			// Extract error message from response
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"The OTP you entered is incorrect. Please try again.";

			setAlertModal({
				visible: true,
				title: "Verification Failed",
				message: errorMessage,
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
							size={scale(24)}
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
						title="Verify & Continue"
						onPress={handleVerifyOTP}
						loading={isVerifying}
						loadingText="Verifying..."
						disabled={otp.length !== 6}
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
					onClose={() =>
						setAlertModal({ ...alertModal, visible: false })
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
		marginBottom: spacing(8),
	},
	phoneNumber: {
		fontFamily: "Poppins",
		fontSize: fontSize(16),
		fontWeight: "600",
		color: colors.primary.primary1,
	},
	otpContainer: {
		marginBottom: spacing(24),
	},
	timerContainer: {
		alignItems: "center",
		marginBottom: spacing(32),
	},
	timerText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	timerHighlight: {
		fontWeight: "600",
		color: colors.primary.primary1,
	},
	resendText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "600",
		color: colors.primary.primary1,
		textDecorationLine: "underline",
	},
	buttonContainer: {
		marginBottom: spacing(24),
	},
	helpContainer: {
		alignItems: "center",
	},
	helpText: {
		fontFamily: "Poppins",
		fontSize: fontSize(13),
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
