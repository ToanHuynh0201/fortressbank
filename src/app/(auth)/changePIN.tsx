import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { primary, neutral, typography, spacingScale, borderRadius } from "@/constants";
import { scale, fontSize, spacing } from "@/utils/responsive";
import {
	AppHeader,
	PINInput,
	PrimaryButton,
	CardContainer,
	ScreenContainer,
	DecorativeIllustration,
	AlertModal,
} from "@/components";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useForm } from "@/hooks";
import { accountService } from "@/services";
import type { Account } from "@/services/accountService";
import { CaretDown } from "phosphor-react-native";
import { validationRules } from "@/utils/validation";

const ChangePIN = () => {
	const router = useRouter();
	const [step, setStep] = useState<"select-account" | "enter-pins" | "success">(
		"select-account",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});

	const { values, setFieldValue } = useForm({
		oldPIN: "",
		newPIN: "",
		confirmPIN: "",
	});

	useEffect(() => {
		loadAccounts();
	}, []);

	const loadAccounts = async () => {
		try {
			const response = await accountService.getAccounts();
			if (response.success && response.data) {
				setAccounts(response.data);
				// Auto-select if only one account
				if (response.data.length === 1) {
					setSelectedAccount(response.data[0]);
					setStep("enter-pins");
				}
			}
		} catch (error) {
			console.error("Error loading accounts:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Failed to load accounts",
				variant: "error",
			});
		}
	};

	const handleAccountSelect = (account: Account) => {
		setSelectedAccount(account);
		setStep("enter-pins");
	};

	const isFormValid =
		values.oldPIN &&
		values.newPIN &&
		values.confirmPIN &&
		values.oldPIN.length === 6 &&
		values.newPIN.length === 6 &&
		values.confirmPIN.length === 6;

	const handleChangePIN = async () => {
		if (!selectedAccount) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Please select an account",
				variant: "error",
			});
			return;
		}

		// Validate old PIN
		const oldPinError = validationRules.pin(values.oldPIN);
		if (oldPinError) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: oldPinError,
				variant: "error",
			});
			return;
		}

		// Validate new PIN
		const newPinError = validationRules.pin(values.newPIN);
		if (newPinError) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: newPinError,
				variant: "error",
			});
			return;
		}

		// Validate confirm PIN
		const confirmPinError = validationRules.confirmPIN(values.newPIN)(values.confirmPIN);
		if (confirmPinError) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: confirmPinError,
				variant: "error",
			});
			return;
		}

		if (values.oldPIN === values.newPIN) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "New PIN must be different from old PIN",
				variant: "error",
			});
			return;
		}

		setIsLoading(true);
		try {
			const response = await accountService.changeAccountPIN(
				selectedAccount.accountId,
				values.oldPIN,
				values.newPIN,
			);

			if (response.success) {
				setStep("success");
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: response.error || "Failed to change PIN",
					variant: "error",
				});
			}
		} catch (error: any) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: error.message || "Failed to change PIN",
				variant: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleOk = () => {
		router.back();
	};

	if (step === "select-account") {
		return (
			<ScreenContainer backgroundColor={neutral.neutral6}>
				<StatusBar style="dark" />

				<AppHeader
					title="Change PIN"
					backgroundColor={neutral.neutral6}
					textColor={neutral.neutral1}
				/>

				<ScrollView
					style={styles.content}
					contentContainerStyle={styles.contentContainer}
					showsVerticalScrollIndicator={false}>
					<Text style={styles.sectionTitle}>Select Account</Text>
					<Text style={styles.sectionSubtitle}>
						Choose the account you want to change PIN for
					</Text>

					{accounts.map((account) => (
						<TouchableOpacity
							key={account.accountId}
							style={styles.accountCard}
							onPress={() => handleAccountSelect(account)}>
							<View style={styles.accountInfo}>
								<Text style={styles.accountName}>
									Account {account.accountNumber}
								</Text>
								<Text style={styles.accountNumber}>
									{account.accountNumber}
								</Text>
								<Text style={styles.accountBalance}>
									Balance: ${account.balance.toFixed(2)}
								</Text>
							</View>
							<CaretDown
								size={20}
								color={primary.primary1}
								weight="bold"
								style={{ transform: [{ rotate: "-90deg" }] }}
							/>
						</TouchableOpacity>
					))}
				</ScrollView>
			</ScreenContainer>
		);
	}

	if (step === "success") {
		return (
			<ScreenContainer backgroundColor={neutral.neutral6}>
				<StatusBar style="dark" />

				<AppHeader
					title="Change PIN"
					showBackButton={false}
					backgroundColor={neutral.neutral6}
					textColor={neutral.neutral1}
				/>

				<ScrollView
					style={styles.content}
					contentContainerStyle={styles.successContainer}
					showsVerticalScrollIndicator={false}>
					{/* Success Illustration */}
					<DecorativeIllustration
						size={150}
						circleColor={primary.primary4}>
						<Text style={styles.successIcon}>✓</Text>
					</DecorativeIllustration>

					<Text style={styles.successTitle}>
						Change PIN successfully!
					</Text>
					<Text style={styles.successMessage}>
						You have successfully changed your PIN for account{"\n"}
						<Text style={styles.accountNumberHighlight}>
							{selectedAccount?.accountNumber}
						</Text>
						{"\n\n"}
						Please use the new PIN for your transactions.
					</Text>

					<PrimaryButton
						title="Ok"
						onPress={handleOk}
						style={styles.okButton}
					/>
				</ScrollView>
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer backgroundColor={neutral.neutral6}>
			<StatusBar style="dark" />

			<AppHeader
				title="Change PIN"
				backgroundColor={neutral.neutral6}
				textColor={neutral.neutral1}
				onBack={() => setStep("select-account")}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.flex}>
				<ScrollView
					style={styles.content}
					contentContainerStyle={styles.contentContainer}
					showsVerticalScrollIndicator={false}>
					{/* Selected Account Info */}
					<View style={styles.selectedAccountCard}>
						<Text style={styles.selectedAccountLabel}>
							Changing PIN for:
						</Text>
						<Text style={styles.selectedAccountName}>
							Account {selectedAccount?.accountNumber}
						</Text>
						<Text style={styles.selectedAccountNumber}>
							{selectedAccount?.accountNumber}
						</Text>
					</View>

					<CardContainer>
						{/* Old PIN */}
						<View style={styles.fieldContainer}>
							<Text style={styles.label}>Type your old PIN</Text>
							<PINInput
								length={6}
								onComplete={(pin) => setFieldValue("oldPIN", pin)}
								onChangeText={(pin) => setFieldValue("oldPIN", pin)}
								secureTextEntry={true}
							/>
							{values.oldPIN && values.oldPIN.length < 6 && (
								<Text style={styles.errorText}>
									PIN must be 6 digits
								</Text>
							)}
						</View>

						{/* New PIN */}
						<View style={styles.fieldContainer}>
							<Text style={styles.label}>Type your new PIN</Text>
							<PINInput
								length={6}
								onComplete={(pin) => setFieldValue("newPIN", pin)}
								onChangeText={(pin) => setFieldValue("newPIN", pin)}
								secureTextEntry={true}
							/>
							{values.newPIN && values.newPIN.length < 6 && (
								<Text style={styles.errorText}>
									PIN must be 6 digits
								</Text>
							)}
						</View>

						{/* Confirm PIN */}
						<View style={styles.fieldContainer}>
							<Text style={styles.label}>Confirm new PIN</Text>
							<PINInput
								length={6}
								onComplete={(pin) =>
									setFieldValue("confirmPIN", pin)
								}
								onChangeText={(pin) =>
									setFieldValue("confirmPIN", pin)
								}
								secureTextEntry={true}
							/>
							{values.confirmPIN &&
								values.confirmPIN.length === 6 &&
								values.newPIN !== values.confirmPIN && (
									<Text style={styles.errorText}>
										PINs do not match
									</Text>
								)}
						</View>

						{/* Security Note */}
						<View style={styles.noteContainer}>
							<Text style={styles.noteText}>
								• PIN must be 6 digits{"\n"}
								• Use a unique PIN that you haven't used before
								{"\n"}
								• Never share your PIN with anyone
							</Text>
						</View>

						{/* Change PIN Button */}
						<PrimaryButton
							title="Change PIN"
							onPress={handleChangePIN}
							loading={isLoading}
							loadingText="Changing PIN..."
							disabled={!isFormValid}
							style={styles.button}
						/>
					</CardContainer>
				</ScrollView>
			</KeyboardAvoidingView>

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

export default ChangePIN;

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	content: {
		flex: 1,
		backgroundColor: neutral.neutral6,
	},
	contentContainer: {
		paddingHorizontal: spacingScale.xl,
		paddingTop: spacingScale.xl,
		paddingBottom: spacingScale.xxxl,
	},
	sectionTitle: {
		fontSize: typography.h3,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: spacingScale.sm,
		fontFamily: "Poppins",
	},
	sectionSubtitle: {
		fontSize: typography.bodySmall,
		fontWeight: "400",
		color: neutral.neutral3,
		marginBottom: spacingScale.xl,
		fontFamily: "Poppins",
	},
	accountCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: neutral.neutral6,
		borderRadius: borderRadius.md,
		padding: spacingScale.lg,
		marginBottom: spacingScale.md,
		borderWidth: 1.5,
		borderColor: neutral.neutral5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(2) },
		shadowOpacity: 0.05,
		shadowRadius: scale(4),
		elevation: 2,
	},
	accountInfo: {
		flex: 1,
	},
	accountName: {
		fontSize: fontSize(16),
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: spacing(4),
		fontFamily: "Poppins",
	},
	accountNumber: {
		fontSize: fontSize(13),
		fontWeight: "500",
		color: neutral.neutral3,
		marginBottom: spacing(4),
		fontFamily: "Poppins",
	},
	accountBalance: {
		fontSize: typography.bodySmall,
		fontWeight: "600",
		color: primary.primary1,
		fontFamily: "Poppins",
	},
	selectedAccountCard: {
		backgroundColor: primary.primary4,
		borderRadius: borderRadius.md,
		padding: spacingScale.lg,
		marginBottom: spacingScale.xl,
		borderWidth: 1,
		borderColor: primary.primary3,
	},
	selectedAccountLabel: {
		fontSize: typography.caption,
		fontWeight: "500",
		color: neutral.neutral2,
		marginBottom: spacing(4),
		fontFamily: "Poppins",
	},
	selectedAccountName: {
		fontSize: fontSize(16),
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: spacing(2),
		fontFamily: "Poppins",
	},
	selectedAccountNumber: {
		fontSize: typography.bodySmall,
		fontWeight: "500",
		color: primary.primary1,
		fontFamily: "Poppins",
	},
	fieldContainer: {
		marginBottom: spacingScale.xl,
	},
	label: {
		fontSize: typography.caption,
		fontWeight: "600",
		color: "#979797",
		marginBottom: spacingScale.sm,
	},
	errorText: {
		fontSize: fontSize(11),
		color: "#FF4267",
		marginTop: spacing(4),
		fontFamily: "Poppins",
	},
	noteContainer: {
		backgroundColor: primary.primary4,
		padding: spacingScale.md,
		borderRadius: borderRadius.sm,
		marginBottom: spacingScale.xl,
	},
	noteText: {
		fontSize: typography.caption,
		fontWeight: "400",
		color: neutral.neutral1,
		lineHeight: fontSize(18),
		fontFamily: "Poppins",
	},
	button: {
		marginTop: spacingScale.sm,
	},
	// Success Screen Styles
	successContainer: {
		paddingHorizontal: spacingScale.xl,
		paddingTop: spacingScale.xl,
		paddingBottom: spacingScale.xxxl,
		alignItems: "center",
	},
	successIcon: {
		fontSize: fontSize(80),
		fontWeight: "bold",
		color: primary.primary1,
	},
	successTitle: {
		fontSize: fontSize(16),
		fontWeight: "600",
		color: primary.primary1,
		marginBottom: spacingScale.xl,
		marginTop: spacingScale.xxl,
		textAlign: "center",
	},
	successMessage: {
		fontSize: typography.bodySmall,
		fontWeight: "500",
		lineHeight: fontSize(21),
		color: neutral.neutral1,
		textAlign: "center",
		marginBottom: spacingScale.xxl,
	},
	accountNumberHighlight: {
		fontWeight: "700",
		color: primary.primary1,
	},
	okButton: {
		width: scale(327),
	},
});
