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
		borderRadius: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 8,
	},
	cardGradient: {
		borderRadius: 16,
		padding: 20,
		minHeight: 200,
		overflow: "hidden",
	},
	decorativeCircle1: {
		position: "absolute",
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: "rgba(255, 255, 255, 0.05)",
		top: -50,
		right: -40,
	},
	decorativeCircle2: {
		position: "absolute",
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "rgba(255, 255, 255, 0.03)",
		bottom: -30,
		left: -30,
	},
	cardTypeBadge: {
		position: "absolute",
		top: 16,
		right: 16,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
		zIndex: 2,
	},
	cardTypeText: {
		fontFamily: "Poppins",
		fontSize: 10,
		fontWeight: "700",
		color: neutral.neutral6,
		letterSpacing: 0.5,
	},
	statusBadge: {
		position: "absolute",
		top: 16,
		left: 16,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		zIndex: 2,
	},
	statusText: {
		fontFamily: "Poppins",
		fontSize: 10,
		fontWeight: "700",
		color: neutral.neutral6,
		letterSpacing: 0.5,
	},
	chipContainer: {
		marginBottom: 24,
		marginTop: 32,
		zIndex: 1,
	},
	chip: {
		width: 48,
		height: 36,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: 8,
		padding: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	chipInner: {
		width: "100%",
		height: "100%",
		borderRadius: 5,
		borderWidth: 1.5,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	cardNumber: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "700",
		lineHeight: 28,
		color: neutral.neutral6,
		letterSpacing: 2.5,
		marginBottom: 24,
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
		fontSize: 9,
		fontWeight: "600",
		lineHeight: 12,
		color: "rgba(255, 255, 255, 0.7)",
		textTransform: "uppercase",
		marginBottom: 6,
		letterSpacing: 0.5,
	},
	cardDetailValue: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "700",
		lineHeight: 20,
		color: neutral.neutral6,
	},
	cardLogoContainer: {
		position: "absolute",
		bottom: 20,
		right: 20,
		flexDirection: "row",
		alignItems: "center",
	},
	cardLogoCircle1: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		marginRight: -10,
	},
	cardLogoCircle2: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(255, 255, 255, 0.25)",
	},
	eyeButton: {
		position: "absolute",
		top: 16,
		right: 100,
		padding: 8,
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		borderRadius: 8,
		zIndex: 3,
	},
});

export default CardItem;
