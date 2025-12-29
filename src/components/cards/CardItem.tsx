import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ViewStyle,
	TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Eye, EyeSlash } from "phosphor-react-native";
import { neutral } from "@/constants/colors";
import type { Card } from "@/types/card";
import { biometricService } from "@/services/biometricService";
import AlertModal from "@/components/common/AlertModal";
import { scale } from "@/utils/responsive";
import { typography, spacingScale, borderRadius } from "@/constants/responsive";

interface CardItemProps {
	card: Card;
	containerStyle?: ViewStyle;
	onPress?: () => void;
}

const getCardTypeGradient = (cardType: string): [string, string, string] => {
	switch (cardType) {
		case "PHYSICAL":
			return ["#1E3A8A", "#3B82F6", "#60A5FA"];
		case "VIRTUAL":
			return ["#4A3FDB", "#6B5FE8", "#8B7FF5"];
		default:
			return ["#4A3FDB", "#6B5FE8", "#8B7FF5"];
	}
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "ACTIVE":
			return "#10B981";
		case "LOCKED":
			return "#EF4444";
		case "EXPIRED":
			return "#6B7280";
		default:
			return "#10B981";
	}
};

const formatExpiryDate = (dateString: string) => {
	// Convert from "2030-12-15" to "12/30"
	const date = new Date(dateString);
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = String(date.getFullYear()).slice(-2);
	return `${month}/${year}`;
};

// Format card number into groups of 4 digits
const formatCardNumber = (cardNumber: string) => {
	// Remove all spaces first
	const cleaned = cardNumber.replace(/\s/g, "");
	// Split into groups of 4
	const groups = cleaned.match(/.{1,4}/g) || [];
	return groups.join(" ");
};

// Mask card number (show only last 4 digits)
const maskCardNumber = (cardNumber: string) => {
	const cleaned = cardNumber.replace(/\s/g, "");
	const lastFour = cleaned.slice(-4);
	// Create masked version: •••• •••• •••• 1234
	const numberOfGroups = Math.ceil(cleaned.length / 4);
	const maskedGroups = Array(numberOfGroups - 1).fill("••••");
	maskedGroups.push(lastFour);
	return maskedGroups.join(" ");
};

const CardItem: React.FC<CardItemProps> = ({
	card,
	containerStyle,
	onPress,
}) => {
	const [showFullNumber, setShowFullNumber] = useState(false);
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: '',
		message: '',
		variant: 'info' as 'info' | 'success' | 'error' | 'warning',
	});

	const displayCardNumber = showFullNumber
		? formatCardNumber(card.cardNumber)
		: maskCardNumber(card.cardNumber);

	const handleToggleCardNumber = async () => {
		// If showing full number, just hide it
		if (showFullNumber) {
			setShowFullNumber(false);
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
						message: "Please enable biometric authentication in your device settings to view card details.",
						variant: 'warning',
					});
					return;
				}

				// Authenticate with biometric
				const authenticated = await biometricService.authenticate();

				if (authenticated) {
					setHasAuthenticated(true);
					setShowFullNumber(true);
				} else {
					setAlertModal({
						visible: true,
						title: "Authentication Failed",
						message: "Please try again to view card number.",
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
			setShowFullNumber(true);
		}
	};

	const CardContent = () => (
		<Animated.View
			entering={FadeInDown.duration(400).springify()}
			style={[styles.cardContainer, containerStyle]}>
			<LinearGradient
				colors={getCardTypeGradient(card.cardType)}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.cardGradient}>
				{/* Decorative Elements */}
				<View style={styles.decorativeCircle1} />
				<View style={styles.decorativeCircle2} />

				{/* Card Type Badge */}
				<View style={styles.cardTypeBadge}>
					<Text style={styles.cardTypeText}>{card.cardType}</Text>
				</View>

				{/* Status Badge */}
				<View
					style={[
						styles.statusBadge,
						{ backgroundColor: getStatusColor(card.status) },
					]}>
					<Text style={styles.statusText}>{card.status}</Text>
				</View>

				{/* Toggle Eye Button */}
				<TouchableOpacity
					style={styles.eyeButton}
					onPress={handleToggleCardNumber}
					activeOpacity={0.7}>
					{showFullNumber ? (
						<Eye size={20} color={neutral.neutral6} weight="bold" />
					) : (
						<EyeSlash
							size={20}
							color="rgba(255, 255, 255, 0.8)"
							weight="bold"
						/>
					)}
				</TouchableOpacity>

				{/* Chip Design */}
				<View style={styles.chipContainer}>
					<View style={styles.chip}>
						<View style={styles.chipInner} />
					</View>
				</View>

				{/* Card Number */}
				<Text style={styles.cardNumber}>{displayCardNumber}</Text>

				{/* Card Details Row */}
				<View style={styles.cardDetailsRow}>
					<View style={styles.cardDetailItem}>
						<Text style={styles.cardDetailLabel}>CARD HOLDER</Text>
						<Text style={styles.cardDetailValue}>
							{card.cardHolderName}
						</Text>
					</View>
					<View style={styles.cardDetailItem}>
						<Text style={styles.cardDetailLabel}>EXPIRES</Text>
						<Text style={styles.cardDetailValue}>
							{formatExpiryDate(card.expirationDate)}
						</Text>
					</View>
				</View>

				{/* Card Network Logo */}
				<View style={styles.cardLogoContainer}>
					<View style={styles.cardLogoCircle1} />
					<View style={styles.cardLogoCircle2} />
				</View>
			</LinearGradient>
		</Animated.View>
	);

	if (onPress) {
		return (
			<>
				<TouchableOpacity onPress={onPress} activeOpacity={0.8}>
					<CardContent />
				</TouchableOpacity>
				<AlertModal
					visible={alertModal.visible}
					title={alertModal.title}
					message={alertModal.message}
					variant={alertModal.variant}
					onClose={() => setAlertModal({ ...alertModal, visible: false })}
				/>
			</>
		);
	}

	return (
		<>
			<CardContent />
			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		borderRadius: borderRadius.lg,
		marginBottom: spacingScale.lg,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: scale(8),
		},
		shadowOpacity: 0.2,
		shadowRadius: scale(16),
		elevation: 8,
	},
	cardGradient: {
		borderRadius: borderRadius.lg,
		padding: spacingScale.lg,
		minHeight: scale(200),
		overflow: "hidden",
	},
	decorativeCircle1: {
		position: "absolute",
		width: scale(140),
		height: scale(140),
		borderRadius: scale(70),
		backgroundColor: "rgba(255, 255, 255, 0.05)",
		top: scale(-50),
		right: scale(-40),
	},
	decorativeCircle2: {
		position: "absolute",
		width: scale(100),
		height: scale(100),
		borderRadius: scale(50),
		backgroundColor: "rgba(255, 255, 255, 0.03)",
		bottom: scale(-30),
		left: scale(-30),
	},
	cardTypeBadge: {
		position: "absolute",
		top: spacingScale.lg,
		right: spacingScale.lg,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		paddingHorizontal: spacingScale.md,
		paddingVertical: spacingScale.xs,
		borderRadius: borderRadius.md,
		zIndex: 2,
	},
	cardTypeText: {
		fontFamily: "Poppins",
		fontSize: typography.tiny,
		fontWeight: "700",
		color: neutral.neutral6,
		letterSpacing: 0.5,
	},
	statusBadge: {
		position: "absolute",
		top: spacingScale.lg,
		left: spacingScale.lg,
		paddingHorizontal: spacingScale.sm,
		paddingVertical: spacingScale.xs,
		borderRadius: borderRadius.md,
		zIndex: 2,
	},
	statusText: {
		fontFamily: "Poppins",
		fontSize: typography.tiny,
		fontWeight: "700",
		color: neutral.neutral6,
		letterSpacing: 0.5,
	},
	chipContainer: {
		marginBottom: spacingScale.xl,
		marginTop: spacingScale.xxl,
		zIndex: 1,
	},
	chip: {
		width: scale(48),
		height: scale(36),
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: borderRadius.sm,
		padding: spacingScale.xs,
		justifyContent: "center",
		alignItems: "center",
	},
	chipInner: {
		width: "100%",
		height: "100%",
		borderRadius: borderRadius.xs,
		borderWidth: 1.5,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	cardNumber: {
		fontFamily: "Poppins",
		fontSize: typography.h3,
		fontWeight: "700",
		lineHeight: scale(28),
		color: neutral.neutral6,
		letterSpacing: 2.5,
		marginBottom: spacingScale.xl,
		zIndex: 1,
	},
	cardDetailsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		zIndex: 1,
	},
	cardDetailItem: {
		flex: 1,
	},
	cardDetailLabel: {
		fontFamily: "Poppins",
		fontSize: typography.tiny,
		fontWeight: "600",
		lineHeight: scale(12),
		color: "rgba(255, 255, 255, 0.7)",
		textTransform: "uppercase",
		marginBottom: spacingScale.xs,
		letterSpacing: 0.5,
	},
	cardDetailValue: {
		fontFamily: "Poppins",
		fontSize: typography.bodySmall,
		fontWeight: "700",
		lineHeight: scale(20),
		color: neutral.neutral6,
	},
	cardLogoContainer: {
		position: "absolute",
		bottom: spacingScale.lg,
		right: spacingScale.lg,
		flexDirection: "row",
		alignItems: "center",
	},
	cardLogoCircle1: {
		width: scale(32),
		height: scale(32),
		borderRadius: scale(16),
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		marginRight: scale(-10),
	},
	cardLogoCircle2: {
		width: scale(32),
		height: scale(32),
		borderRadius: scale(16),
		backgroundColor: "rgba(255, 255, 255, 0.25)",
	},
	eyeButton: {
		position: "absolute",
		top: spacingScale.lg,
		right: scale(100),
		padding: spacingScale.sm,
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		borderRadius: borderRadius.sm,
		zIndex: 3,
	},
});

export default CardItem;
