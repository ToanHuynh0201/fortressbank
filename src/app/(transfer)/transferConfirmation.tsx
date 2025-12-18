import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	withSequence,
	Easing,
	FadeInDown,
	FadeIn,
} from "react-native-reanimated";
import {
	CaretLeft,
	CheckCircle,
	User,
	Bank,
	ArrowRight,
} from "phosphor-react-native";
import colors from "@/constants/colors";
import { ScreenContainer, PrimaryButton, AlertModal } from "@/components";
import { transferService, TransferRequest } from "@/services";

const TransferConfirmation = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{
		senderAccountId: string;
		senderAccountLabel: string;
		senderAccountNumber: string;
		receiverAccountNumber: string;
		receiverAccountId?: string;
		recipientName: string;
		amount: string;
		transactionType: string;
		bankName: string;
		message: string;
	}>();

	const [isProcessing, setIsProcessing] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});

	// Animation values
	const headerOpacity = useSharedValue(0);
	const iconScale = useSharedValue(0.5);
	const iconOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);

	useEffect(() => {
		// Header animation
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});

		// Icon animation with bounce
		iconOpacity.value = withTiming(1, {
			duration: 500,
			easing: Easing.out(Easing.ease),
		});
		iconScale.value = withSequence(
			withSpring(1.1, { damping: 10, stiffness: 100 }),
			withSpring(1, { damping: 15, stiffness: 150 }),
		);

		// Content animation
		contentOpacity.value = withTiming(1, {
			duration: 500,
			easing: Easing.out(Easing.ease),
		});
	}, []);

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const iconAnimatedStyle = useAnimatedStyle(() => ({
		opacity: iconOpacity.value,
		transform: [{ scale: iconScale.value }],
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
	}));

	// Parse amount and calculate fees
	const numericAmount = parseFloat(
		params.amount?.replace(/[^0-9.]/g, "") || "0",
	);
	const transferFee = 0; // You can calculate this based on your business logic
	const totalAmount = numericAmount + transferFee;

	// Prepare transfer data for API
	const transferData: TransferRequest = {
		senderAccountId: params.senderAccountId || "",
		senderAccountNumber: params.senderAccountNumber || "",
		receiverAccountNumber: params.receiverAccountNumber || "",
		amount: numericAmount,
		transactionType:
			(params.transactionType as
				| "INTERNAL_TRANSFER"
				| "EXTERNAL_TRANSFER") || "EXTERNAL_TRANSFER",
		description: params.message || "",
	};

	const recipientInfo = {
		name: params.recipientName || "Unknown",
		accountNumber: params.receiverAccountNumber || "",
		bankName: params.bankName || "",
	};

	const senderInfo = {
		accountType: params.senderAccountLabel || "Account",
		accountNumber: params.senderAccountNumber || "",
	};

	const createTransfer = async () => {
		if (isProcessing) return;

		// Validate required fields before sending
		if (
			!transferData.senderAccountId ||
			!transferData.senderAccountNumber
		) {
			setAlertModal({
				visible: true,
				title: "Validation Error",
				message:
					"Sender account information is missing. Please go back and select an account.",
				variant: "error",
			});
			return;
		}

		if (!transferData.receiverAccountNumber) {
			setAlertModal({
				visible: true,
				title: "Validation Error",
				message:
					"Receiver account number is missing. Please go back and enter the recipient account.",
				variant: "error",
			});
			return;
		}

		if (transferData.amount <= 0) {
			setAlertModal({
				visible: true,
				title: "Validation Error",
				message: "Transfer amount must be greater than 0.",
				variant: "error",
			});
			return;
		}

		setIsProcessing(true);
		try {
			console.log("Sending transfer request:", transferData);
			// Call API to create transfer
			const response = await transferService.createTransfer(transferData);

			if (response.code === 1000 && response.data.transactionId) {
				// Navigate to PIN verification with transactionId and fromAccountId
				console.log(
					"Transaction created:",
					response.data.transactionId,
				);
				router.push({
					pathname: "(transfer)/pinVerification",
					params: {
						transactionId: response.data.transactionId,
						fromAccountId: transferData.senderAccountId,
					},
				});
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: "Failed to create transaction",
					variant: "error",
				});
			}
		} catch (error: any) {
			console.error("Transfer error:", error);
			setAlertModal({
				visible: true,
				title: "Transfer Failed",
				message:
					error.message ||
					"Unable to process transfer. Please try again.",
				variant: "error",
			});
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<ScreenContainer backgroundColor={colors.neutral.neutral6}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor="#FFFFFF"
			/>

			{/* Navigation Header */}
			<Animated.View style={[styles.header, headerAnimatedStyle]}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}>
					<View style={styles.backButtonCircle}>
						<CaretLeft
							size={20}
							color={colors.neutral.neutral1}
							weight="bold"
						/>
					</View>
				</TouchableOpacity>
				<View style={styles.headerTitleContainer}>
					<Text style={styles.headerTitle}>
						Transfer Confirmation
					</Text>
					<Text style={styles.headerSubtitle}>
						Review your transfer details
					</Text>
				</View>
			</Animated.View>

			{/* Content */}
			<View style={styles.content}>
				{/* Success Icon */}
				<Animated.View
					style={[styles.iconContainer, iconAnimatedStyle]}>
					<View style={styles.successIcon}>
						<CheckCircle
							size={48}
							color={colors.primary.primary1}
							weight="fill"
						/>
					</View>
				</Animated.View>

				{/* Title & Subtitle */}
				<Animated.View
					entering={FadeInDown.delay(100).duration(500)}
					style={styles.titleContainer}>
					<Text style={styles.title}>Review Transfer</Text>
					<Text style={styles.subtitle}>
						Please verify all details before confirming
					</Text>
				</Animated.View>

				{/* Amount Card - Highlighted */}
				<Animated.View
					entering={FadeInDown.delay(150).duration(500)}
					style={styles.amountCard}>
					<Text style={styles.amountLabel}>Transfer Amount</Text>
					<Text style={styles.amountValue}>
						$
						{numericAmount.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</Text>
				</Animated.View>

				{/* Transfer Details Card */}
				<Animated.View
					entering={FadeInDown.delay(200).duration(500)}
					style={styles.detailsCard}>
					{/* From Section */}
					<View style={styles.detailSection}>
						<View style={styles.detailHeader}>
							<Bank
								size={18}
								color={colors.primary.primary1}
								weight="bold"
							/>
							<Text style={styles.detailTitle}>From</Text>
						</View>
						<Text style={styles.detailValue}>
							{senderInfo.accountType}
						</Text>
						<Text style={styles.detailSubValue}>
							{senderInfo.accountNumber}
						</Text>
					</View>

					{/* Arrow Divider */}
					<View style={styles.arrowDivider}>
						<ArrowRight
							size={20}
							color={colors.primary.primary1}
							weight="bold"
						/>
					</View>

					{/* To Section */}
					<View style={styles.detailSection}>
						<View style={styles.detailHeader}>
							<User
								size={18}
								color={colors.primary.primary1}
								weight="bold"
							/>
							<Text style={styles.detailTitle}>To</Text>
						</View>
						<Text style={styles.detailValue}>
							{recipientInfo.name}
						</Text>
						<Text style={styles.detailSubValue}>
							{recipientInfo.accountNumber}
						</Text>
						{recipientInfo.bankName && (
							<Text style={styles.detailBankName}>
								{recipientInfo.bankName}
							</Text>
						)}
					</View>
				</Animated.View>

				{/* Summary Section */}
				<Animated.View
					entering={FadeInDown.delay(250).duration(500)}
					style={styles.summaryCard}>
					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>Transfer Fee</Text>
						<Text style={styles.summaryValue}>
							${transferFee.toFixed(2)}
						</Text>
					</View>

					<View style={styles.summaryDivider} />

					<View style={styles.summaryRow}>
						<Text style={styles.summaryTotalLabel}>
							Total Amount
						</Text>
						<Text style={styles.summaryTotalValue}>
							$
							{totalAmount.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</Text>
					</View>
				</Animated.View>

				{/* Buttons */}
				<Animated.View
					entering={FadeInDown.delay(400).duration(500)}
					style={styles.buttonsContainer}>
					<PrimaryButton
						title="Confirm Transfer"
						onPress={createTransfer}
						loading={isProcessing}
						loadingText="Processing..."
						style={styles.confirmButton}
					/>
					<TouchableOpacity
						style={styles.cancelButton}
						onPress={() => router.back()}
						disabled={isProcessing}>
						<Text style={styles.cancelButtonText}>Cancel</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>

			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 20,
		backgroundColor: colors.neutral.neutral6,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	backButton: {
		marginRight: 16,
	},
	backButtonCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitleContainer: {
		flex: 1,
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: 22,
		fontWeight: "700",
		lineHeight: 28,
		color: colors.neutral.neutral1,
		marginBottom: 2,
	},
	headerSubtitle: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		lineHeight: 18,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 20,
		justifyContent: "space-between",
	},
	iconContainer: {
		alignItems: "center",
		marginBottom: 12,
	},
	successIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
	},
	titleContainer: {
		alignItems: "center",
		marginBottom: 16,
	},
	title: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "700",
		lineHeight: 28,
		color: colors.neutral.neutral1,
		textAlign: "center",
		marginBottom: 4,
	},
	subtitle: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		lineHeight: 18,
		color: colors.neutral.neutral3,
		textAlign: "center",
	},
	amountCard: {
		backgroundColor: colors.primary.primary4,
		borderRadius: 20,
		paddingVertical: 16,
		paddingHorizontal: 20,
		alignItems: "center",
		marginBottom: 16,
		borderWidth: 2,
		borderColor: colors.primary.primary3,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 12,
		elevation: 5,
	},
	amountLabel: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "600",
		color: colors.neutral.neutral2,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	amountValue: {
		fontFamily: "Poppins",
		fontSize: 28,
		fontWeight: "700",
		color: colors.primary.primary1,
		lineHeight: 36,
	},
	detailsCard: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 20,
		padding: 18,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.06,
		shadowRadius: 12,
		elevation: 3,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	detailSection: {
		flex: 1,
	},
	detailHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
	},
	detailTitle: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	detailValue: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		lineHeight: 20,
		marginBottom: 2,
	},
	detailSubValue: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "500",
		color: colors.neutral.neutral3,
		lineHeight: 16,
	},
	detailBankName: {
		fontFamily: "Poppins",
		fontSize: 11,
		fontWeight: "600",
		color: colors.primary.primary1,
		lineHeight: 16,
		marginTop: 2,
	},
	arrowDivider: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: 8,
	},
	summaryCard: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 20,
		padding: 16,
		marginBottom: 16,
		borderWidth: 2,
		borderColor: colors.primary.primary4,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 5,
	},
	summaryDivider: {
		height: 1,
		backgroundColor: colors.neutral.neutral5,
		marginVertical: 8,
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 4,
	},
	summaryLabel: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "500",
		color: colors.neutral.neutral3,
	},
	summaryValue: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "600",
		color: colors.neutral.neutral1,
	},
	summaryTotalLabel: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "700",
		color: colors.neutral.neutral1,
	},
	summaryTotalValue: {
		fontFamily: "Poppins",
		fontSize: 18,
		fontWeight: "700",
		color: colors.primary.primary1,
	},
	buttonsContainer: {
		gap: 12,
	},
	confirmButton: {
		height: 52,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	cancelButton: {
		height: 52,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderColor: colors.neutral.neutral4,
		backgroundColor: colors.neutral.neutral6,
	},
	cancelButtonText: {
		fontFamily: "Poppins",
		fontSize: 15,
		fontWeight: "600",
		color: colors.neutral.neutral2,
	},
});

export default TransferConfirmation;
