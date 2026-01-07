import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from "react-native-reanimated";
import { Fingerprint } from "phosphor-react-native";
import {
	primary,
	neutral,
	typography,
	spacingScale,
	borderRadius,
} from "@/constants";
import { scale, fontSize, spacing } from "@/utils/responsive";
import {
	AuthLayout,
	CustomInput,
	PasswordInput,
	PrimaryButton,
	LinkText,
	DecorativeIllustration,
	AlertModal,
	ConfirmationModal,
	DeviceSwitchOTPModal,
} from "@/components";
import { useForm, useAuth } from "@/hooks";

const SignIn = () => {
	const router = useRouter();
	const {
		login,
		loginWithBiometric,
		verifyDeviceSwitchOtp,
		biometricAvailable,
		biometricEnabled,
		enableBiometric,
		checkBiometricStatus,
	} = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [isBiometricLoading, setIsBiometricLoading] = useState(false);
	const [isOtpLoading, setIsOtpLoading] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "info" as "success" | "error" | "info" | "warning",
	});
	const [enableBiometricModal, setEnableBiometricModal] = useState({
		visible: false,
	});
	const [biometricSuccessModal, setBiometricSuccessModal] = useState({
		visible: false,
	});
	const [deviceSwitchOtpModal, setDeviceSwitchOtpModal] = useState({
		visible: false,
	});

	const {
		values,
		errors,
		touched,
		handleChange,
		handleBlur,
		setTouched,
		setErrors,
	} = useForm({
		username: "",
		password: "",
	});

	const validateForm = (): boolean => {
		const newErrors: any = {};

		if (!values.username.trim()) {
			newErrors.username = "Username is required";
		}

		if (!values.password.trim()) {
			newErrors.password = "Password is required";
		} else if (values.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			setTouched({ username: true, password: true });
			return;
		}

		setIsLoading(true);

		try {
			const result = await login(values.username, values.password);

			if (result.code === 1000) {
				// Check if device switch OTP is required
				if (result.data?.requiresDeviceSwitchOtp === true) {
					// Show device switch OTP modal
					setDeviceSwitchOtpModal({ visible: true });
					return;
				}

				// Check if account was switched and biometric was cleared
				if (result.accountSwitched && biometricAvailable) {
					// Account switched - ask user if they want to enable biometric for new account
					setEnableBiometricModal({ visible: true });
				} else if (biometricAvailable && !biometricEnabled) {
					// First time login or biometric not enabled - ask to enable
					setEnableBiometricModal({ visible: true });
				} else {
					// Biometric already enabled or not available - proceed to home
					router.replace("/(home)");
				}
			} else {
				const errorMsg =
					result.error ||
					"Login failed. Please check your credentials.";
				// Show error in modal instead of inline
				setAlertModal({
					visible: true,
					title: "Login Failed",
					message: errorMsg,
					variant: "error",
				});
				setTouched({ username: true, password: true });
			}
		} catch (error: any) {
			const errorMsg =
				error.message ||
				"An unexpected error occurred. Please try again.";
			// Show error in modal instead of inline
			setAlertModal({
				visible: true,
				title: "Error",
				message: errorMsg,
				variant: "error",
			});
			setTouched({ username: true, password: true });
		} finally {
			setIsLoading(false);
		}
	};
	const handleBiometricLogin = async () => {
		setIsBiometricLoading(true);

		try {
			const result = await loginWithBiometric();

			if (result.code === 1000) {
				router.replace("/(home)");
			} else {
				const errorMsg = result.message || "Biometric login failed";
				// Show error in modal instead of inline
				setAlertModal({
					visible: true,
					title: "Biometric Login Failed",
					message: errorMsg,
					variant: "error",
				});
			}
		} catch (error: any) {
			const errorMsg = error.message || "Biometric authentication failed";
			// Show error in modal instead of inline
			setAlertModal({
				visible: true,
				title: "Error",
				message: errorMsg,
				variant: "error",
			});
		} finally {
			setIsBiometricLoading(false);
		}
	};
	const handleEnableBiometric = async () => {
		setEnableBiometricModal({ visible: false });
		try {
			const success = await enableBiometric(
				values.username,
				values.password,
			);
			if (success) {
				setBiometricSuccessModal({ visible: true });
			} else {
				router.replace("/(home)");
			}
		} catch (error) {
			console.error("Enable biometric error:", error);
			router.replace("/(home)");
		}
	};

	const handleSkipBiometric = () => {
		setEnableBiometricModal({ visible: false });
		router.replace("/(home)");
	};

	const handleBiometricSuccess = () => {
		setBiometricSuccessModal({ visible: false });
		router.replace("/(home)");
	};

	const handleVerifyDeviceSwitchOtp = async (otp: string) => {
		setIsOtpLoading(true);

		try {
			const result = await verifyDeviceSwitchOtp(
				values.username,
				values.password,
				otp,
			);

			if (result.code === 1000) {
				// Close OTP modal
				setDeviceSwitchOtpModal({ visible: false });

				// Check if account was switched and biometric was cleared
				if (result.accountSwitched && biometricAvailable) {
					// Account switched - ask user if they want to enable biometric for new account
					setEnableBiometricModal({ visible: true });
				} else if (biometricAvailable && !biometricEnabled) {
					// First time login or biometric not enabled - ask to enable
					setEnableBiometricModal({ visible: true });
				} else {
					// Biometric already enabled or not available - proceed to home
					router.replace("/(home)");
				}
			} else {
				const errorMsg = result.message || "OTP verification failed";
				// Show error in modal
				setAlertModal({
					visible: true,
					title: "Verification Failed",
					message: errorMsg,
					variant: "error",
				});
			}
		} catch (error: any) {
			const errorMsg =
				error.message || "OTP verification failed. Please try again.";
			// Show error in modal
			setAlertModal({
				visible: true,
				title: "Error",
				message: errorMsg,
				variant: "error",
			});
		} finally {
			setIsOtpLoading(false);
		}
	};

	const handleCancelDeviceSwitchOtp = () => {
		setDeviceSwitchOtpModal({ visible: false });
	};

	const isValid =
		values.username.trim() !== "" && values.password.trim().length >= 6;

	const welcomeOpacity = useSharedValue(0);
	const welcomeTranslateY = useSharedValue(30);
	const illustrationScale = useSharedValue(0.7);
	const illustrationOpacity = useSharedValue(0);
	const formOpacity = useSharedValue(0);
	const formTranslateY = useSharedValue(25);
	const fingerprintScale = useSharedValue(0.5);

	useEffect(() => {
		// Welcome section - simple fade
		welcomeOpacity.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});
		welcomeTranslateY.value = withTiming(0, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});

		// Illustration - simple fade
		illustrationOpacity.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});
		illustrationScale.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});

		// Form - simple fade
		formOpacity.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});
		formTranslateY.value = withTiming(0, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});

		// Fingerprint - simple scale
		fingerprintScale.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});
	}, []);

	const welcomeAnimatedStyle = useAnimatedStyle(() => ({
		opacity: welcomeOpacity.value,
		transform: [{ translateY: welcomeTranslateY.value }],
	}));

	const illustrationAnimatedStyle = useAnimatedStyle(() => ({
		opacity: illustrationOpacity.value,
		transform: [{ scale: illustrationScale.value }],
	}));

	const formAnimatedStyle = useAnimatedStyle(() => ({
		opacity: formOpacity.value,
		transform: [{ translateY: formTranslateY.value }],
	}));

	const fingerprintAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: fingerprintScale.value }],
	}));

	return (
		<AuthLayout
			title="Sign in"
			showBackButton={false}>
			<Animated.View
				style={[styles.welcomeSection, welcomeAnimatedStyle]}>
				<Text style={styles.title}>Welcome Back!</Text>
				<Text style={styles.subtitle}>
					Sign in to continue to your account
				</Text>
			</Animated.View>

			{/* Illustration */}
			<Animated.View
				style={[
					styles.illustrationContainer,
					illustrationAnimatedStyle,
				]}>
				<DecorativeIllustration />
			</Animated.View>

			<Animated.View style={[styles.inputContainer, formAnimatedStyle]}>
				<CustomInput
					placeholder="Username"
					value={values.username}
					onChangeText={(text) => {
						handleChange("username", text);
					}}
					onBlur={() => handleBlur("username")}
					autoCapitalize="none"
					containerStyle={styles.input}
					error={touched.username ? errors.username : undefined}
				/>

				<PasswordInput
					placeholder="Password"
					value={values.password}
					onChangeText={(text) => {
						handleChange("password", text);
					}}
					onBlur={() => handleBlur("password")}
					containerStyle={styles.input}
					error={touched.password ? errors.password : undefined}
				/>

				<TouchableOpacity
					onPress={() => router.push("/(auth)/forgotPassword")}
					activeOpacity={0.7}>
					<Text style={styles.forgotPassword}>Forgot password?</Text>
				</TouchableOpacity>
			</Animated.View>

			{/* Sign In Button */}
			<Animated.View style={formAnimatedStyle}>
				<PrimaryButton
					title="Sign In"
					onPress={handleSubmit}
					loading={isLoading}
					loadingText="Signing In..."
					disabled={!isValid}
					style={styles.signInButton}
				/>
			</Animated.View>

			{/* Divider */}
			<Animated.View style={[styles.dividerContainer, formAnimatedStyle]}>
				<View style={styles.divider} />
				<Text style={styles.dividerText}>or continue with</Text>
				<View style={styles.divider} />
			</Animated.View>

			{/* Fingerprint - Only show if biometric is available and enabled */}
			{biometricAvailable && biometricEnabled && (
				<Animated.View
					style={[
						styles.fingerprintContainer,
						fingerprintAnimatedStyle,
					]}>
					<TouchableOpacity
						style={[
							styles.fingerprint,
							isBiometricLoading && styles.fingerprintDisabled,
						]}
						activeOpacity={0.7}
						onPress={handleBiometricLogin}
						disabled={isBiometricLoading}>
						<View style={styles.fingerprintIconContainer}>
							<Fingerprint
								size={24}
								color={primary.primary1}
								weight="duotone"
							/>
						</View>
						<Text style={styles.fingerprintText}>
							{isBiometricLoading
								? "Authenticating..."
								: "Biometric Login"}
						</Text>
					</TouchableOpacity>
				</Animated.View>
			)}

			{/* Sign Up Link */}
			<Animated.View style={[styles.signUpContainer, formAnimatedStyle]}>
				<LinkText
					normalText="Don't have an account? "
					linkText="Sign Up"
					onPress={() => router.navigate("(auth)/signUp")}
				/>
			</Animated.View>

			{/* Enable Biometric Modal */}
			<ConfirmationModal
				visible={enableBiometricModal.visible}
				title="Enable Biometric Login?"
				message="Would you like to enable biometric login for faster access next time?"
				confirmText="Enable"
				cancelText="Not Now"
				onConfirm={handleEnableBiometric}
				onCancel={handleSkipBiometric}
			/>

			{/* Biometric Success Modal */}
			<AlertModal
				visible={biometricSuccessModal.visible}
				title="Success"
				message="Biometric login enabled successfully!"
				variant="success"
				onClose={handleBiometricSuccess}
			/>

			{/* Error Modal */}
			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>

			{/* Device Switch OTP Modal */}
			<DeviceSwitchOTPModal
				visible={deviceSwitchOtpModal.visible}
				onVerify={handleVerifyDeviceSwitchOtp}
				onCancel={handleCancelDeviceSwitchOtp}
				isLoading={isOtpLoading}
			/>
		</AuthLayout>
	);
};

export default SignIn;

const styles = StyleSheet.create({
	welcomeSection: {
		marginBottom: spacingScale.lg,
	},
	title: {
		fontFamily: "Poppins",
		fontSize: typography.h1,
		fontWeight: "700",
		color: primary.primary1,
		marginBottom: spacing(4),
		lineHeight: fontSize(36),
	},
	subtitle: {
		fontFamily: "Poppins",
		fontSize: typography.bodySmall,
		fontWeight: "400",
		color: neutral.neutral2,
		lineHeight: fontSize(20),
	},
	illustrationContainer: {
		alignItems: "center",
		marginBottom: spacingScale.md,
		transform: [{ scale: 0.85 }],
	},
	inputContainer: {
		marginBottom: spacingScale.lg,
	},
	input: {
		marginBottom: spacingScale.md,
	},
	forgotPassword: {
		fontFamily: "Poppins",
		fontSize: fontSize(13),
		fontWeight: "600",
		color: primary.primary1,
		textAlign: "right",
		marginTop: spacing(2),
	},
	signInButton: {
		marginBottom: spacingScale.lg,
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.3,
		shadowRadius: scale(8),
		elevation: 6,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: spacingScale.lg,
		gap: spacingScale.md,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: neutral.neutral5,
	},
	dividerText: {
		fontFamily: "Poppins",
		fontSize: typography.caption,
		fontWeight: "500",
		color: neutral.neutral3,
	},
	fingerprintContainer: {
		alignItems: "center",
		marginBottom: spacingScale.lg,
	},
	fingerprint: {
		paddingVertical: spacing(12),
		paddingHorizontal: spacingScale.xl,
		borderRadius: borderRadius.md,
		backgroundColor: primary.primary4,
		borderWidth: 2,
		borderColor: primary.primary3,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(10),
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: scale(2) },
		shadowOpacity: 0.1,
		shadowRadius: scale(8),
		elevation: 3,
	},
	fingerprintDisabled: {
		opacity: 0.6,
	},
	fingerprintIconContainer: {
		width: scale(32),
		height: scale(32),
		borderRadius: scale(16),
		backgroundColor: neutral.neutral6,
		justifyContent: "center",
		alignItems: "center",
	},
	fingerprintText: {
		fontFamily: "Poppins",
		fontSize: typography.bodySmall,
		fontWeight: "600",
		color: primary.primary1,
	},
	signUpContainer: {
		alignItems: "center",
	},
});
