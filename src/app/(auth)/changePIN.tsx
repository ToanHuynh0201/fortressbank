import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { primary, neutral } from "@/constants";
import {
	AppHeader,
	PINInput,
	PrimaryButton,
	CardContainer,
	ScreenContainer,
	DecorativeIllustration,
} from "@/components";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useForm } from "@/hooks";
import { accountService } from "@/services";
import type { Account } from "@/services/accountService";
import { CaretDown } from "phosphor-react-native";

const ChangePIN = () => {
	const router = useRouter();
	const [step, setStep] = useState<"select-account" | "enter-pins" | "success">(
		"select-account",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

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
			if (response.status === "success" && response.data) {
				setAccounts(response.data);
				// Auto-select if only one account
				if (response.data.length === 1) {
					setSelectedAccount(response.data[0]);
					setStep("enter-pins");
				}
			}
		} catch (error) {
			console.error("Error loading accounts:", error);
			Alert.alert("Error", "Failed to load accounts");
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
			Alert.alert("Error", "Please select an account");
			return;
		}

		if (!isFormValid) {
			Alert.alert("Error", "Please fill in all PIN fields (6 digits each)");
			return;
		}

		if (values.newPIN !== values.confirmPIN) {
			Alert.alert("Error", "New PINs do not match");
			return;
		}

		if (values.oldPIN === values.newPIN) {
			Alert.alert("Error", "New PIN must be different from old PIN");
			return;
		}

		// Validate PIN format (only numbers)
		const pinRegex = /^\d{6}$/;
		if (!pinRegex.test(values.newPIN)) {
			Alert.alert("Error", "PIN must be 6 digits");
			return;
		}

		setIsLoading(true);
		try {
			const response = await accountService.changeAccountPIN(
				selectedAccount.id,
				values.oldPIN,
				values.newPIN,
			);

			if (response.status === "success") {
				setStep("success");
			} else {
				Alert.alert("Error", response.message || "Failed to change PIN");
			}
		} catch (error: any) {
			Alert.alert("Error", error.message || "Failed to change PIN");
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
							key={account.id}
							style={styles.accountCard}
							onPress={() => handleAccountSelect(account)}>
							<View style={styles.accountInfo}>
								<Text style={styles.accountName}>
									{account.accountName}
								</Text>
								<Text style={styles.accountNumber}>
									{account.accountNumber}
								</Text>
								<Text style={styles.accountBalance}>
									Balance: ${account.balance.toLocaleString()}
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
				onBackPress={() => setStep("select-account")}
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
							{selectedAccount?.accountName}
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
							disabled={!isFormValid || isLoading}
							style={styles.button}
						/>
					</CardContainer>
				</ScrollView>
			</KeyboardAvoidingView>
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
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 40,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: 8,
		fontFamily: "Poppins",
	},
	sectionSubtitle: {
		fontSize: 14,
		fontWeight: "400",
		color: neutral.neutral3,
		marginBottom: 24,
		fontFamily: "Poppins",
	},
	accountCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: neutral.neutral6,
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1.5,
		borderColor: neutral.neutral5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	accountInfo: {
		flex: 1,
	},
	accountName: {
		fontSize: 16,
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: 4,
		fontFamily: "Poppins",
	},
	accountNumber: {
		fontSize: 13,
		fontWeight: "500",
		color: neutral.neutral3,
		marginBottom: 4,
		fontFamily: "Poppins",
	},
	accountBalance: {
		fontSize: 14,
		fontWeight: "600",
		color: primary.primary1,
		fontFamily: "Poppins",
	},
	selectedAccountCard: {
		backgroundColor: primary.primary4,
		borderRadius: 12,
		padding: 16,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: primary.primary3,
	},
	selectedAccountLabel: {
		fontSize: 12,
		fontWeight: "500",
		color: neutral.neutral2,
		marginBottom: 4,
		fontFamily: "Poppins",
	},
	selectedAccountName: {
		fontSize: 16,
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: 2,
		fontFamily: "Poppins",
	},
	selectedAccountNumber: {
		fontSize: 14,
		fontWeight: "500",
		color: primary.primary1,
		fontFamily: "Poppins",
	},
	fieldContainer: {
		marginBottom: 24,
	},
	label: {
		fontSize: 12,
		fontWeight: "600",
		color: "#979797",
		marginBottom: 8,
	},
	errorText: {
		fontSize: 11,
		color: "#FF4267",
		marginTop: 4,
		fontFamily: "Poppins",
	},
	noteContainer: {
		backgroundColor: primary.primary4,
		padding: 12,
		borderRadius: 8,
		marginBottom: 24,
	},
	noteText: {
		fontSize: 12,
		fontWeight: "400",
		color: neutral.neutral1,
		lineHeight: 18,
		fontFamily: "Poppins",
	},
	button: {
		marginTop: 8,
	},
	// Success Screen Styles
	successContainer: {
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 40,
		alignItems: "center",
	},
	successIcon: {
		fontSize: 80,
		fontWeight: "bold",
		color: primary.primary1,
	},
	successTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: primary.primary1,
		marginBottom: 24,
		marginTop: 32,
		textAlign: "center",
	},
	successMessage: {
		fontSize: 14,
		fontWeight: "500",
		lineHeight: 21,
		color: neutral.neutral1,
		textAlign: "center",
		marginBottom: 32,
	},
	accountNumberHighlight: {
		fontWeight: "700",
		color: primary.primary1,
	},
	okButton: {
		width: 327,
	},
});
