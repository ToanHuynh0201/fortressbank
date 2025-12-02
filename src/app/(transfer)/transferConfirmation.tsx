import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft, Check } from "phosphor-react-native";
import colors from "@/constants/colors";
import { ScreenContainer, PrimaryButton } from "@/components";
import { createTransfer, CreateTransferRequest } from "@/lib/transactionApi";

const TransferConfirmation = () => {
	const router = useRouter();
	const [isProcessing, setIsProcessing] = useState(false);

	// TODO: Get these values from route params or context
	const transferData: CreateTransferRequest = {
		fromAccountId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
		toAccountId: "fedcba98-7654-3210-fedc-ba9876543210",
		amount: 10.0,
		type: "INTERNAL_TRANSFER",
		description: "Test transfer from Postman",
	};

	const transferDetails = [
		{ label: "To", value: "Capi Creative Design" },
		{ label: "Account", value: "0123 4567 8910 9" },
		{ label: "Amount", value: "$1,000" },
		{ label: "From", value: "VISA **** 1234" },
		{ label: "Total", value: "$1,000", highlight: true },
	];

	return (
		<ScreenContainer backgroundColor={colors.neutral.neutral6}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor="#FFFFFF"
			/>

			{/* Navigation Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}>
					<CaretLeft
						size={16}
						color={colors.neutral.neutral1}
						weight="regular"
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Confirmation</Text>
			</View>

			{/* Content */}
			<View style={styles.content}>
				{/* Success Icon */}
				<View style={styles.iconContainer}>
					<View style={styles.successIcon}>
						<Check
							size={32}
							color={colors.neutral.neutral6}
							weight="bold"
						/>
					</View>
				</View>

				{/* Title */}
				<Text style={styles.title}>Confirm Transfer</Text>

				{/* Details Card */}
				<View style={styles.detailsCard}>
					{transferDetails.map((detail, index) => (
						<View key={index}>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>
									{detail.label}
								</Text>
								<Text
									style={[
										styles.detailValue,
										detail.highlight &&
											styles.detailValueHighlight,
									]}>
									{detail.value}
								</Text>
							</View>
							{index < transferDetails.length - 1 && (
								<View style={styles.divider} />
							)}
						</View>
					))}
				</View>

				{/* Buttons */}
				<View style={styles.buttonsContainer}>
					<PrimaryButton
						title={
							isProcessing ? "Processing..." : "Confirm Transfer"
						}
						onPress={async () => {
							if (isProcessing) return;

							setIsProcessing(true);
							try {
								// Call API to create transfer
								const response = await createTransfer(
									transferData,
								);

								if (
									response.status === "success" &&
									response.data.txId
								) {
									// Navigate to OTP verification with txId
									console.log(
										"Transaction created:",
										response.data.txId,
									);
									router.push(
										`(transfer)/otpVerification?txId=${response.data.txId}`,
									);
								} else {
									Alert.alert(
										"Error",
										"Failed to create transaction",
									);
								}
							} catch (error: any) {
								console.error("Transfer error:", error);
								Alert.alert(
									"Transfer Failed",
									error.message ||
										"Unable to process transfer. Please try again.",
								);
							} finally {
								setIsProcessing(false);
							}
						}}
						style={styles.confirmButton}
						disabled={isProcessing}
					/>
					<TouchableOpacity
						style={styles.cancelButton}
						onPress={() => router.back()}>
						<Text style={styles.cancelButtonText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Bottom Indicator */}
			<View style={styles.bottomIndicator}>
				<View style={styles.indicator} />
			</View>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 16,
		height: 53,
		backgroundColor: colors.neutral.neutral6,
	},
	backButton: {
		width: 16,
		height: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "600",
		lineHeight: 28,
		color: colors.neutral.neutral1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 60,
	},
	iconContainer: {
		alignItems: "center",
		marginBottom: 16,
	},
	successIcon: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.primary.primary1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "600",
		lineHeight: 28,
		color: colors.neutral.neutral1,
		textAlign: "center",
		marginBottom: 20,
	},
	detailsCard: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 15,
		padding: 16,
		shadowColor: "rgba(54, 41, 183, 0.07)",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 1,
		shadowRadius: 30,
		elevation: 5,
		marginBottom: 20,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingVertical: 8,
	},
	detailLabel: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "400",
		lineHeight: 21,
		color: colors.neutral.neutral3,
		flex: 1,
	},
	detailValue: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		lineHeight: 21,
		color: colors.neutral.neutral1,
		textAlign: "right",
		flex: 1,
	},
	detailValueHighlight: {
		color: colors.primary.primary1,
		fontSize: 16,
	},
	divider: {
		height: 1,
		backgroundColor: colors.neutral.neutral5,
	},
	buttonsContainer: {
		gap: 16,
	},
	confirmButton: {
		height: 48,
	},
	cancelButton: {
		height: 48,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: colors.neutral.neutral4,
	},
	cancelButtonText: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "500",
		color: colors.neutral.neutral1,
	},
	bottomIndicator: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 34,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.neutral.neutral6,
	},
	indicator: {
		width: 134,
		height: 5,
		borderRadius: 2.5,
		backgroundColor: colors.neutral.neutral4,
	},
});

export default TransferConfirmation;
