import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Image,
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
	User,
} from "phosphor-react-native";
import { AppHeader, ConfirmationModal, AlertModal, LoadingOverlay } from "@/components/common";
import { SettingRow, BiometricSettings } from "@/components/settings";
import { primary, neutral } from "@/constants/colors";
import { UserAvatar } from "@/components";
import { useAuth } from "@/hooks";
import { scale, fontSize, spacing } from "@/utils/responsive";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const Setting = () => {
	const router = useRouter();
	const { logout, user } = useAuth();
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [alertModal, setAlertModal] = useState({ visible: false, title: "", message: "", variant: "info" as "success" | "error" | "info" });

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

	const handleFaceIDPress = () => {
		router.push("/(auth)/updateFaceID");
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
		setIsLoggingOut(true);
		try {
			await logout();
			router.replace("/(auth)/signIn");
		} catch (error) {
			console.error("Error during logout:", error);
			setAlertModal({ visible: true, title: "Error", message: "Failed to logout. Please try again.", variant: "error" });
		} finally {
			setIsLoggingOut(false);
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
							size={scale(18)}
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
								size={scale(20)}
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
								size={scale(20)}
								color={primary.primary1}
								weight="bold"
							/>
						}
						onPress={handlePINPress}
					/>
					<SettingRow
						title="Face ID"
						subtitle="Update your face recognition"
						icon={
							<User
								size={scale(20)}
								color={primary.primary1}
								weight="bold"
							/>
						}
						onPress={handleFaceIDPress}
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
								size={scale(20)}
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
								size={scale(20)}
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

			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>

			<LoadingOverlay
				visible={isLoggingOut}
				message="Logging out..."
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
		paddingTop: spacing(20),
		paddingBottom: spacing(130),
	},
	profileCard: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: spacing(24),
		marginBottom: spacing(24),
		backgroundColor: neutral.neutral6,
		borderRadius: scale(20),
		padding: spacing(16),
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.1,
		shadowRadius: scale(12),
		elevation: 5,
		borderWidth: scale(1),
		borderColor: neutral.neutral5,
	},
	profileInfo: {
		flex: 1,
		marginLeft: spacing(16),
	},
	userName: {
		fontFamily: "Poppins",
		fontSize: fontSize(18),
		fontWeight: "700",
		lineHeight: fontSize(24),
		color: neutral.neutral1,
		marginBottom: spacing(2),
	},
	userEmail: {
		fontFamily: "Poppins",
		fontSize: fontSize(13),
		fontWeight: "500",
		lineHeight: fontSize(18),
		color: neutral.neutral3,
	},
	editButton: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		backgroundColor: primary.primary4,
		justifyContent: "center",
		alignItems: "center",
	},
	section: {
		marginBottom: spacing(12),
	},
	sectionTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "700",
		lineHeight: fontSize(20),
		color: neutral.neutral2,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: spacing(12),
		marginLeft: spacing(24),
	},
	logoutContainer: {
		paddingHorizontal: spacing(24),
		marginTop: spacing(16),
		marginBottom: spacing(8),
	},
	logoutButton: {
		backgroundColor: "#FF3B30",
		height: scale(56),
		borderRadius: scale(20),
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#FF3B30",
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.3,
		shadowRadius: scale(8),
		elevation: 6,
		gap: spacing(8),
	},
	logoutButtonPressed: {
		opacity: 0.8,
		transform: [{ scale: 0.98 }],
	},
	logoutIconContainer: {
		width: scale(24),
		height: scale(24),
		justifyContent: "center",
		alignItems: "center",
	},
	logoutText: {
		fontFamily: "Poppins",
		fontSize: fontSize(16),
		fontWeight: "700",
		color: neutral.neutral6,
	},
});
