import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	Modal,
	TouchableOpacity,
} from "react-native";
import CustomInput from "./CustomInput";
import colors from "@/constants/colors";
import { transferService } from "@/services";
import type { AccountLookupData } from "@/services/transferService";
import { scale, fontSize, spacing } from "@/utils/responsive";
import {
	typography,
	spacingScale,
	borderRadius,
	componentSizes,
} from "@/constants/responsive";

interface AccountNumberInputProps {
	value: string;
	onChangeText: (text: string) => void;
	onAccountFound?: (accountData: AccountLookupData) => void;
	onAccountNotFound?: () => void;
	containerStyle?: any;
	placeholder?: string;
	bankName?: string; // Optional bank name for external bank lookups
}

/**
 * Account number input with auto-fetch beneficiary name
 * Uses debouncing to avoid excessive API calls
 */
const AccountNumberInput: React.FC<AccountNumberInputProps> = ({
	value,
	onChangeText,
	onAccountFound,
	onAccountNotFound,
	containerStyle,
	placeholder = "Account number",
	bankName,
}) => {
	const [beneficiaryName, setBeneficiaryName] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [showErrorModal, setShowErrorModal] = useState(false);

	// Use refs to store callbacks to avoid dependency issues
	const onAccountFoundRef = useRef(onAccountFound);
	const onAccountNotFoundRef = useRef(onAccountNotFound);

	// Update refs when callbacks change
	useEffect(() => {
		onAccountFoundRef.current = onAccountFound;
		onAccountNotFoundRef.current = onAccountNotFound;
	}, [onAccountFound, onAccountNotFound]);

	// Debounce timer
	useEffect(() => {
		// Clear previous states when input changes
		setBeneficiaryName("");
		setError("");
		setShowErrorModal(false);

		// Only fetch if account number has 10-12 digits
		const cleanedValue = value.replace(/\s/g, "");
		if (cleanedValue.length < 10 || cleanedValue.length > 24) {
			return;
		}
		//acct_1SdmKkRy4vdhIyRt

		setIsLoading(true);

		// Debounce: wait 1000ms (1 second) after user stops typing
		const timer = setTimeout(async () => {
			try {
				const result = await transferService.lookupAccount(
					cleanedValue,
					bankName, // Pass bankName if provided
				);
				console.log(result.data);

				if (result.success && result.data) {
					setBeneficiaryName(result.data.fullName);
					onAccountFoundRef.current?.(result.data);
					setError("");
				} else {
					// Account not found or error
					setBeneficiaryName("");
					onAccountNotFoundRef.current?.();
					setError(result.error || "Account not found");
					setShowErrorModal(true);
				}
			} catch (err) {
				// Unexpected error (should be rare with withErrorHandling)
				setBeneficiaryName("");
				onAccountNotFoundRef.current?.();
				setError("Failed to fetch account information");
				setShowErrorModal(true);
			} finally {
				setIsLoading(false);
			}
		}, 1000);

		return () => {
			clearTimeout(timer);
			setIsLoading(false);
		};
	}, [value, bankName]); // Depend on both value and bankName

	return (
		<View style={[styles.container, containerStyle]}>
			<View style={styles.inputWrapper}>
				<CustomInput
					placeholder={placeholder}
					value={value}
					onChangeText={onChangeText}
					keyboardType="default"
					maxLength={24}
				/>

				{/* Loading indicator */}
				{isLoading && (
					<View style={styles.loadingIndicator}>
						<ActivityIndicator
							size="small"
							color={colors.primary.primary1}
						/>
					</View>
				)}
			</View>

			{/* Beneficiary name display */}
			{beneficiaryName && !isLoading && (
				<View style={styles.beneficiaryInfo}>
					<Text style={styles.beneficiaryLabel}>Account holder:</Text>
					<Text style={styles.beneficiaryName}>
						{beneficiaryName}
					</Text>
				</View>
			)}

			{/* Error display */}
			{error && !isLoading && value.replace(/\s/g, "").length >= 10 && (
				<View style={styles.errorInfo}>
					<Text style={styles.errorText}>⚠️ {error}</Text>
				</View>
			)}

			{/* Error Modal */}
			<Modal
				visible={showErrorModal}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowErrorModal(false)}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalIconContainer}>
							<Text style={styles.modalIcon}>⚠️</Text>
						</View>

						<Text style={styles.modalTitle}>Account Not Found</Text>
						<Text style={styles.modalMessage}>
							{error ||
								"The account number you entered does not exist. Please check and try again."}
						</Text>

						<TouchableOpacity
							style={styles.modalButton}
							onPress={() => setShowErrorModal(false)}>
							<Text style={styles.modalButtonText}>OK</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: spacingScale.xl,
	},
	inputWrapper: {
		position: "relative",
	},
	loadingIndicator: {
		position: "absolute",
		right: spacingScale.md,
		top: spacingScale.md,
	},
	beneficiaryInfo: {
		marginTop: spacingScale.sm,
		padding: spacingScale.md,
		backgroundColor: colors.primary.primary4,
		borderRadius: borderRadius.sm,
		borderLeftWidth: 3,
		borderLeftColor: colors.primary.primary1,
	},
	beneficiaryLabel: {
		fontFamily: "Poppins",
		fontSize: fontSize(11),
		fontWeight: "500",
		color: colors.neutral.neutral3,
		marginBottom: spacing(4),
	},
	beneficiaryName: {
		fontFamily: "Poppins",
		fontSize: typography.subtitle,
		fontWeight: "600",
		color: colors.primary.primary1,
	},
	errorInfo: {
		marginTop: spacingScale.sm,
		padding: spacingScale.md,
		backgroundColor: "#FFF5F5",
		borderRadius: borderRadius.sm,
		borderLeftWidth: 3,
		borderLeftColor: colors.semantic.error,
	},
	errorText: {
		fontFamily: "Poppins",
		fontSize: fontSize(13),
		fontWeight: "500",
		color: colors.semantic.error,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: spacingScale.xl,
	},
	modalContent: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: borderRadius.xl,
		padding: spacingScale.xl,
		width: "100%",
		maxWidth: scale(340),
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: spacing(4) },
		shadowOpacity: 0.25,
		shadowRadius: spacingScale.md,
		elevation: 8,
	},
	modalIconContainer: {
		width: scale(64),
		height: scale(64),
		borderRadius: scale(32),
		backgroundColor: "#FFF5F5",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: spacingScale.lg,
	},
	modalIcon: {
		fontSize: fontSize(32),
	},
	modalTitle: {
		fontFamily: "Poppins",
		fontSize: typography.h3,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: spacingScale.sm,
		textAlign: "center",
	},
	modalMessage: {
		fontFamily: "Poppins",
		fontSize: typography.bodySmall,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		lineHeight: scale(20),
		marginBottom: spacingScale.xl,
	},
	modalButton: {
		width: "100%",
		height: componentSizes.buttonHeight,
		backgroundColor: colors.primary.primary1,
		borderRadius: borderRadius.lg,
		justifyContent: "center",
		alignItems: "center",
	},
	modalButtonText: {
		fontFamily: "Poppins",
		fontSize: typography.body,
		fontWeight: "600",
		color: colors.neutral.neutral6,
	},
});

export default AccountNumberInput;
