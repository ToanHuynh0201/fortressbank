import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Image,
	Alert,
	Pressable,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from "react-native-reanimated";
import {
	Lock,
	Fingerprint,
	Globe,
	Info,
	Phone,
	SignOut,
	PencilSimple,
	LockKey,
} from "phosphor-react-native";
import { AppHeader, ConfirmationModal } from "@/components/common";
import { SettingRow, BiometricSettings } from "@/components/settings";
import { primary, neutral } from "@/constants/colors";
import { UserAvatar } from "@/components";
import { useAuth } from "@/hooks";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const Setting = () => {
	const router = useRouter();
	const { logout, user } = useAuth();
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const profileOpacity = useSharedValue(0);
	const profileScale = useSharedValue(0.8);
	const avatarScale = useSharedValue(0.5);
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(20);

	useEffect(() => {
		// Profile card animation - simple fade
		profileOpacity.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});
		profileScale.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});

		// Avatar animation - simple scale
		avatarScale.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});

		// Content animation - simple fade
		contentOpacity.value = withTiming(1, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});
		contentTranslateY.value = withTiming(0, {
			duration: 300,
			easing: Easing.out(Easing.ease),
		});
	}, []);

	const profileAnimatedStyle = useAnimatedStyle(() => ({
		opacity: profileOpacity.value,
		transform: [{ scale: profileScale.value }],
	}));

	const avatarAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: avatarScale.value }],
	}));
	const handlePasswordPress = () => {
		router.push("/(auth)/changePassword");
	};

	const handlePINPress = () => {
		router.push("/(auth)/changePIN");
	};

	const handleTouchIDPress = () => {
		// Handle Touch ID settings
	};

	const handleCustomerCarePress = () => {
		// Handle customer care
	};

	const handleLogoutPress = () => {
		setShowLogoutModal(true);
	};

	const handleLogoutConfirm = async () => {
		setShowLogoutModal(false);
		try {
			await logout();
			router.replace("/(auth)/signIn");
		} catch (error) {
			console.error("Error during logout:", error);
			Alert.alert("Error", "Failed to logout. Please try again.");
		}
	};

	const handleLogoutCancel = () => {
		setShowLogoutModal(false);
	};

	return (
		<SafeAreaView
			style={styles.container}
			edges={["top"]}>
			<AppHeader
				title="Setting"
				backgroundColor={primary.primary1}
				textColor={neutral.neutral6}
			/>

			<AnimatedScrollView
				style={styles.content}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}>
				{/* User Profile Card */}
				<Animated.View
					style={[styles.profileCard, profileAnimatedStyle]}>
					<Animated.View style={avatarAnimatedStyle}>
						<UserAvatar size={80} />
					</Animated.View>
					<View style={styles.profileInfo}>
						<Text style={styles.userName}>
							{user?.fullName || "Guest"}
						</Text>
						<Text style={styles.userEmail}>
							{user?.email || ""}
						</Text>
					</View>
					<TouchableOpacity style={styles.editButton}>
						<PencilSimple
							size={18}
							color={primary.primary1}
							weight="bold"
						/>
					</TouchableOpacity>
				</Animated.View>

				{/* Security Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Security</Text>

					{/* Biometric Settings */}
					<BiometricSettings />

					<SettingRow
						title="Password"
						icon={
							<Lock
								size={20}
								color={primary.primary1}
								weight="bold"
							/>
						}
						onPress={handlePasswordPress}
					/>
					<SettingRow
						title="PIN"
						icon={
							<LockKey
								size={20}
								color={primary.primary1}
								weight="bold"
							/>
						}
						onPress={handlePINPress}
					/>
				</View>

				{/* Support Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Support</Text>
					<SettingRow
						title="Customer care"
						subtitle="19008989"
						icon={
							<Phone
								size={20}
								color={primary.primary1}
								weight="bold"
							/>
						}
						onPress={handleCustomerCarePress}
					/>
				</View>

				{/* Logout Button */}
				<View style={styles.logoutContainer}>
					<Pressable
						style={({ pressed }) => [
							styles.logoutButton,
							pressed && styles.logoutButtonPressed,
						]}
						onPress={handleLogoutPress}>
						<View style={styles.logoutIconContainer}>
							<SignOut
								size={20}
								color={neutral.neutral6}
								weight="bold"
							/>
						</View>
						<Text style={styles.logoutText}>Logout</Text>
					</Pressable>
				</View>
			</AnimatedScrollView>

			<ConfirmationModal
				visible={showLogoutModal}
				title="Logout"
				message="Are you sure you want to logout from your account?"
				confirmText="Logout"
				cancelText="Cancel"
				onConfirm={handleLogoutConfirm}
				onCancel={handleLogoutCancel}
				confirmButtonVariant="danger"
			/>
		</SafeAreaView>
	);
};

export default Setting;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primary.primary1,
	},
	content: {
		flex: 1,
		backgroundColor: neutral.neutral6,
	},
	contentContainer: {
		paddingTop: 20,
		paddingBottom: 130,
	},
	profileCard: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 24,
		marginBottom: 24,
		backgroundColor: neutral.neutral6,
		borderRadius: 20,
		padding: 16,
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
		borderWidth: 1,
		borderColor: neutral.neutral5,
	},
	profileInfo: {
		flex: 1,
		marginLeft: 16,
	},
	userName: {
		fontFamily: "Poppins",
		fontSize: 18,
		fontWeight: "700",
		lineHeight: 24,
		color: neutral.neutral1,
		marginBottom: 2,
	},
	userEmail: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "500",
		lineHeight: 18,
		color: neutral.neutral3,
	},
	editButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: primary.primary4,
		justifyContent: "center",
		alignItems: "center",
	},
	section: {
		marginBottom: 12,
	},
	sectionTitle: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "700",
		lineHeight: 20,
		color: neutral.neutral2,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 12,
		marginLeft: 24,
	},
	logoutContainer: {
		paddingHorizontal: 24,
		marginTop: 16,
		marginBottom: 8,
	},
	logoutButton: {
		backgroundColor: "#FF3B30",
		height: 56,
		borderRadius: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#FF3B30",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
		gap: 8,
	},
	logoutButtonPressed: {
		opacity: 0.8,
		transform: [{ scale: 0.98 }],
	},
	logoutIconContainer: {
		width: 24,
		height: 24,
		justifyContent: "center",
		alignItems: "center",
	},
	logoutText: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "700",
		color: neutral.neutral6,
	},
});
