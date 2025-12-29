import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ViewStyle,
	TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bank, Eye, EyeSlash } from "phosphor-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { neutral, primary } from "@/constants/colors";
import { biometricService } from "@/services/biometricService";
import AlertModal from "@/components/common/AlertModal";
import { scale } from "@/utils/responsive";
import { typography, spacingScale, borderRadius } from "@/constants/responsive";

interface AccountCardItemProps {
	accountName: string;
	accountNumber: string;
	balance: string;
	branch: string;
	containerStyle?: ViewStyle;
}

const AccountCardItem: React.FC<AccountCardItemProps> = ({
	accountName,
	accountNumber,
	balance,
	branch,
	containerStyle,
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: '',
		message: '',
		variant: 'info' as 'info' | 'success' | 'error' | 'warning',
	});

	const toggleVisibility = async () => {
		// If showing information, just hide it
		if (isVisible) {
			setIsVisible(false);
			return;
		}

		// If not authenticated yet, require biometric authentication
		if (!hasAuthenticated) {
			try {
				// Check if biometric is available
				const isAvailable = await biometricService.isBiometricAvailable();

				if (!isAvailable) {
					setAlertModal({
						visible: true,
						title: "Biometric Not Available",
						message: "Please enable biometric authentication in your device settings to view account details.",
						variant: 'warning',
					});
					return;
				}

				// Authenticate with biometric
				const authenticated = await biometricService.authenticate();

				if (authenticated) {
					setHasAuthenticated(true);
					setIsVisible(true);
				} else {
					setAlertModal({
						visible: true,
						title: "Authentication Failed",
						message: "Please try again to view account details.",
						variant: 'error',
					});
				}
			} catch (error) {
				console.error("Biometric authentication error:", error);
				setAlertModal({
					visible: true,
					title: "Error",
					message: "Failed to authenticate. Please try again.",
					variant: 'error',
				});
			}
		} else {
			// Already authenticated, just toggle
			setIsVisible(true);
		}
	};

	const maskAccountNumber = (number: string) => {
		if (number.length <= 4) return "****";
		return "**** **** " + number.slice(-4);
	};

	const maskBalance = (bal: string) => {
		return "$ ••••••";
	};

	return (
		<Animated.View
			entering={FadeInDown.duration(400).springify()}
			style={[styles.cardWrapper, containerStyle]}>
			<LinearGradient
				colors={["#FFFFFF", "#F8F9FF"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.cardContainer}>
				{/* Decorative Elements */}
				<View style={styles.decorativeCircle1} />
				<View style={styles.decorativeCircle2} />

				{/* Card Header with Icon */}
				<View style={styles.cardHeader}>
					<View style={styles.iconContainer}>
						<Bank
							size={24}
							color={primary.primary1}
							weight="duotone"
						/>
					</View>
					<View style={styles.headerContent}>
						<Text style={styles.accountName}>{accountName}</Text>
						<Text style={styles.accountNumber}>
							{isVisible
								? accountNumber
								: maskAccountNumber(accountNumber)}
						</Text>
					</View>
					<TouchableOpacity
						onPress={toggleVisibility}
						style={styles.visibilityButton}
						activeOpacity={0.7}>
						{isVisible ? (
							<Eye
								size={20}
								color={primary.primary1}
								weight="bold"
							/>
						) : (
							<EyeSlash
								size={20}
								color={neutral.neutral3}
								weight="bold"
							/>
						)}
					</TouchableOpacity>
				</View>

				{/* Divider */}
				<View style={styles.divider} />

				{/* Balance Section */}
				<View style={styles.balanceSection}>
					<Text style={styles.balanceLabel}>Available Balance</Text>
					<Text style={styles.balanceValue}>
						{isVisible ? balance : maskBalance(balance)}
					</Text>
				</View>

				{/* Bottom Accent */}
				<View style={styles.bottomAccent} />
			</LinearGradient>

			{/* Alert Modal */}
			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	cardWrapper: {
		marginBottom: spacingScale.lg,
	},
	cardContainer: {
		backgroundColor: neutral.neutral6,
		borderRadius: borderRadius.xl,
		padding: spacingScale.lg,
		shadowColor: primary.primary1,
		shadowOffset: {
			width: 0,
			height: scale(8),
		},
		shadowOpacity: 0.12,
		shadowRadius: scale(24),
		elevation: 8,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "rgba(74, 63, 219, 0.08)",
	},
	decorativeCircle1: {
		position: "absolute",
		width: scale(120),
		height: scale(120),
		borderRadius: scale(60),
		backgroundColor: "rgba(74, 63, 219, 0.03)",
		top: scale(-40),
		right: scale(-30),
	},
	decorativeCircle2: {
		position: "absolute",
		width: scale(80),
		height: scale(80),
		borderRadius: scale(40),
		backgroundColor: "rgba(74, 63, 219, 0.02)",
		bottom: scale(-20),
		left: scale(-20),
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: spacingScale.lg,
		zIndex: 1,
	},
	iconContainer: {
		width: scale(48),
		height: scale(48),
		borderRadius: borderRadius.md,
		backgroundColor: "rgba(74, 63, 219, 0.1)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: spacingScale.md,
	},
	headerContent: {
		flex: 1,
	},
	visibilityButton: {
		width: scale(36),
		height: scale(36),
		borderRadius: scale(18),
		backgroundColor: "rgba(74, 63, 219, 0.08)",
		justifyContent: "center",
		alignItems: "center",
		marginLeft: spacingScale.sm,
	},
	accountName: {
		fontFamily: "Poppins",
		fontSize: typography.subtitle,
		fontWeight: "700",
		lineHeight: scale(24),
		color: neutral.neutral1,
		marginBottom: scale(2),
	},
	accountNumber: {
		fontFamily: "Poppins",
		fontSize: typography.bodySmall,
		fontWeight: "500",
		lineHeight: scale(20),
		color: primary.primary2,
		letterSpacing: 0.5,
	},
	divider: {
		height: 1,
		backgroundColor: "rgba(74, 63, 219, 0.1)",
		marginVertical: spacingScale.lg,
		zIndex: 1,
	},
	balanceSection: {
		zIndex: 1,
	},
	balanceLabel: {
		fontFamily: "Poppins",
		fontSize: typography.caption,
		fontWeight: "500",
		lineHeight: scale(16),
		color: "#979797",
		marginBottom: spacingScale.xs,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	balanceValue: {
		fontFamily: "Poppins",
		fontSize: typography.h1,
		fontWeight: "700",
		lineHeight: scale(36),
		color: primary.primary1,
	},
	bottomAccent: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: scale(4),
		backgroundColor: primary.primary1,
		borderBottomLeftRadius: borderRadius.xl,
		borderBottomRightRadius: borderRadius.xl,
	},
});

export default AccountCardItem;
