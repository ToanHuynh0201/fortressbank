import React, { useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from "react-native-reanimated";
import { primary, neutral } from "@/constants";
import {
	AuthLayout,
	CustomInput,
	PasswordInput,
	PrimaryButton,
	LinkText,
	DecorativeIllustration,
} from "@/components";
import { useForm } from "@/hooks";

const SignIn = () => {
	const router = useRouter();
	const { values, handleChange, isValid } = useForm({
		email: "",
		password: "",
	});

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

	const handleSignIn = () => {
		router.replace("/(home)");
	};

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
					placeholder="Email address"
					value={values.email}
					onChangeText={(text) => handleChange("email", text)}
					keyboardType="email-address"
					autoCapitalize="none"
					containerStyle={styles.input}
				/>

				<PasswordInput
					placeholder="Password"
					value={values.password}
					onChangeText={(text) => handleChange("password", text)}
					containerStyle={styles.input}
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
					onPress={handleSignIn}
					// disabled={!values.email || !values.password}
					style={styles.signInButton}
				/>
			</Animated.View>

			{/* Divider */}
			<Animated.View style={[styles.dividerContainer, formAnimatedStyle]}>
				<View style={styles.divider} />
				<Text style={styles.dividerText}>or continue with</Text>
				<View style={styles.divider} />
			</Animated.View>

			{/* Fingerprint */}
			<Animated.View
				style={[styles.fingerprintContainer, fingerprintAnimatedStyle]}>
				<TouchableOpacity
					style={styles.fingerprint}
					activeOpacity={0.7}
					onPress={() => {
						// Handle biometric auth
						console.log("Biometric auth");
					}}>
					<View style={styles.fingerprintIconContainer}>
						<Text style={styles.fingerprintIcon}>🔐</Text>
					</View>
					<Text style={styles.fingerprintText}>Biometric Login</Text>
				</TouchableOpacity>
			</Animated.View>

			{/* Sign Up Link */}
			<Animated.View style={[styles.signUpContainer, formAnimatedStyle]}>
				<LinkText
					normalText="Don't have an account? "
					linkText="Sign Up"
					onPress={() => router.navigate("(auth)/signUp")}
				/>
			</Animated.View>
		</AuthLayout>
	);
};

export default SignIn;

const styles = StyleSheet.create({
	welcomeSection: {
		marginBottom: 28,
	},
	title: {
		fontFamily: "Poppins",
		fontSize: 28,
		fontWeight: "700",
		color: primary.primary1,
		marginBottom: 6,
		lineHeight: 36,
	},
	subtitle: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "400",
		color: neutral.neutral2,
		lineHeight: 20,
	},
	illustrationContainer: {
		alignItems: "center",
		marginBottom: 32,
	},
	inputContainer: {
		marginBottom: 20,
	},
	input: {
		marginBottom: 16,
	},
	forgotPassword: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "600",
		color: primary.primary1,
		textAlign: "right",
		marginTop: 4,
	},
	signInButton: {
		marginBottom: 20,
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		gap: 12,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: neutral.neutral5,
	},
	dividerText: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "500",
		color: neutral.neutral3,
	},
	fingerprintContainer: {
		alignItems: "center",
		marginBottom: 28,
	},
	fingerprint: {
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 16,
		backgroundColor: primary.primary4,
		borderWidth: 2,
		borderColor: primary.primary3,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	fingerprintIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: neutral.neutral6,
		justifyContent: "center",
		alignItems: "center",
	},
	fingerprintIcon: {
		fontSize: 20,
	},
	fingerprintText: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: primary.primary1,
	},
	signUpContainer: {
		alignItems: "center",
	},
});
