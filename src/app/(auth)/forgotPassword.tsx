import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { neutral, primary, commonStyles } from "@/constants";
import {
	AppHeader,
	CustomInput,
	PasswordInput,
	PrimaryButton,
	CardContainer,
	ScreenContainer,
	AlertModal,
	ConfirmationModal,
} from "@/components";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useForm } from "@/hooks";

type Step = "enter-phone" | "confirm-phone" | "enter-code" | "change-password";

const ForgotPassword = () => {
	const router = useRouter();
	const [step, setStep] = useState<Step>("enter-phone");
	const [isSendingCode, setIsSendingCode] = useState(false);
	const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
	const [isResendingCode, setIsResendingCode] = useState(false);
	const [isVerifyingCode, setIsVerifyingCode] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});
	const [confirmModal, setConfirmModal] = useState({
		visible: false,
		onConfirm: () => {},
	});

	const { values, handleChange } = useForm({
		phoneNumber: "",
		code: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleSendCode = () => {
		if (!values.phoneNumber.trim()) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Please enter your phone number",
				variant: "error",
			});
			return;
		}
		// TODO: Call API to send verification code
		console.log("Sending code to:", values.phoneNumber);
		setStep("confirm-phone");
	};

	const handleVerifyPhone = () => {
		// TODO: Call API to verify phone and send code
		console.log("Verifying phone:", values.phoneNumber);
		setStep("enter-code");
	};

	const handleResendCode = async () => {
		setIsResendingCode(true);
		try {
			// TODO: Call API to resend code
			console.log("Resending code to:", values.phoneNumber);
			setAlertModal({
				visible: true,
				title: "Success",
				message: "Code has been resent to your phone",
				variant: "success",
			});
		} finally {
			setIsResendingCode(false);
		}
	};

	const handleVerifyCode = () => {
		if (values.code.length < 4) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Please enter the verification code",
				variant: "error",
			});
			return;
		}
		// TODO: Call API to verify code
		console.log("Verifying code:", values.code);
		setStep("change-password");
	};

	const handleChangePassword = () => {
		if (!values.newPassword.trim() || !values.confirmPassword.trim()) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Please enter both password fields",
				variant: "error",
			});
			return;
		}
		if (values.newPassword !== values.confirmPassword) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Passwords do not match",
				variant: "error",
			});
			return;
		}
		// TODO: Call API to change password
		console.log("Changing password with code:", values.code);
		setConfirmModal({
			visible: true,
			onConfirm: () => {
				setConfirmModal({ ...confirmModal, visible: false });
				router.replace("/signIn");
			},
		});
	};

	const handleChangePhoneNumber = () => {
		setStep("enter-phone");
		handleChange("phoneNumber", "");
		handleChange("code", "");
	};

	const renderStep = () => {
		switch (step) {
			case "enter-phone":
				return (
					<>
						<CardContainer>
							<Text style={styles.label}>
								Type your phone number
							</Text>
							<CustomInput
								placeholder="(+84)"
								value={values.phoneNumber}
								onChangeText={(text) =>
									handleChange("phoneNumber", text)
								}
								keyboardType="phone-pad"
								containerStyle={styles.inputWrapper}
							/>
							<Text style={styles.infoText}>
								We texted you a code to verify your phone number
							</Text>
							<PrimaryButton
								title="Send"
								onPress={handleSendCode}
								loading={isSendingCode}
								loadingText="Sending..."
								disabled={!values.phoneNumber.trim()}
							/>
						</CardContainer>
					</>
				);

			case "confirm-phone":
				return (
					<>
						<CardContainer>
							<Text style={styles.label}>
								Type your phone number
							</Text>
							<CustomInput
								value={values.phoneNumber}
								onChangeText={(text) =>
									handleChange("phoneNumber", text)
								}
								keyboardType="phone-pad"
								isActive={true}
								containerStyle={styles.inputWrapper}
							/>
							<Text style={styles.infoText}>
								We texted you a code to verify your phone number
							</Text>
							<PrimaryButton
								title="Send"
								onPress={handleVerifyPhone}
								loading={isVerifyingPhone}
								loadingText="Verifying..."
							/>
						</CardContainer>
					</>
				);

			case "enter-code":
				return (
					<>
						<CardContainer>
							<Text style={styles.label}>Type a code</Text>
							<View style={styles.codeInputRow}>
								<CustomInput
									placeholder="Code"
									value={values.code}
									onChangeText={(text) =>
										handleChange("code", text)
									}
									keyboardType="number-pad"
									maxLength={4}
									containerStyle={styles.codeInput}
								/>
								<Pressable
									style={[
										styles.resendButton,
										isResendingCode &&
											styles.resendButtonDisabled,
									]}
									onPress={handleResendCode}
									disabled={isResendingCode}>
									<Text style={styles.resendButtonText}>
										{isResendingCode
											? "Sending..."
											: "Resend"}
									</Text>
								</Pressable>
							</View>
							<Text style={styles.infoText}>
								We texted you a code to verify your phone number
								(+84) {values.phoneNumber}
							</Text>
							<Text style={styles.infoText}>
								This code will expired 10 minutes after this
								message. If you don't get a message.
							</Text>
							<PrimaryButton
								title="Change password"
								onPress={handleVerifyCode}
								loading={isVerifyingCode}
								loadingText="Verifying..."
								disabled={values.code.length < 4}
							/>
						</CardContainer>
						<Pressable
							style={styles.linkButton}
							onPress={handleChangePhoneNumber}>
							<Text style={styles.linkText}>
								Change your phone number
							</Text>
						</Pressable>
					</>
				);

			case "change-password":
				return (
					<>
						<CardContainer>
							<Text style={styles.label}>Type a code</Text>
							<View style={styles.codeInputRow}>
								<CustomInput
									value={values.code}
									onChangeText={(text) =>
										handleChange("code", text)
									}
									keyboardType="number-pad"
									maxLength={4}
									isActive={true}
									containerStyle={styles.codeInput}
								/>
								<Pressable
									style={[
										styles.resendButton,
										isResendingCode &&
											styles.resendButtonDisabled,
									]}
									onPress={handleResendCode}
									disabled={isResendingCode}>
									<Text style={styles.resendButtonText}>
										{isResendingCode
											? "Sending..."
											: "Resend"}
									</Text>
								</Pressable>
							</View>
							<Text style={styles.infoText}>
								We texted you a code to verify your phone number
								(+84) {values.phoneNumber}
							</Text>
							<Text style={styles.infoText}>
								This code will expired 10 minutes after this
								message. If you don't get a message.
							</Text>

							{/* New Password Fields */}
							<View style={styles.passwordSection}>
								<Text style={styles.label}>New Password</Text>
								<PasswordInput
									placeholder="Enter new password"
									value={values.newPassword}
									onChangeText={(text) =>
										handleChange("newPassword", text)
									}
									containerStyle={styles.passwordFieldSpacing}
								/>

								<Text style={styles.label}>
									Confirm Password
								</Text>
								<PasswordInput
									placeholder="Confirm new password"
									value={values.confirmPassword}
									onChangeText={(text) =>
										handleChange("confirmPassword", text)
									}
								/>
							</View>

							<PrimaryButton
								title="Change password"
								onPress={handleChangePassword}
								loading={isChangingPassword}
								loadingText="Changing..."
								disabled={
									!values.newPassword.trim() ||
									!values.confirmPassword.trim()
								}
							/>
						</CardContainer>
						<Pressable
							style={styles.linkButton}
							onPress={handleChangePhoneNumber}>
							<Text style={styles.linkText}>
								Change your phone number
							</Text>
						</Pressable>
					</>
				);
		}
	};

	return (
		<ScreenContainer backgroundColor={neutral.neutral6}>
			<StatusBar style="dark" />

			<AppHeader
				title="Forgot password"
				backgroundColor={neutral.neutral6}
				textColor={neutral.neutral1}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.flex}>
				<ScrollView
					style={styles.content}
					contentContainerStyle={styles.contentContainer}
					showsVerticalScrollIndicator={false}>
					{renderStep()}
				</ScrollView>
			</KeyboardAvoidingView>

			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>

			<ConfirmationModal
				visible={confirmModal.visible}
				title="Success"
				message="Your password has been changed successfully"
				confirmText="OK"
				onConfirm={confirmModal.onConfirm}
				showCancelButton={false}
			/>
		</ScreenContainer>
	);
};

export default ForgotPassword;

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
	label: {
		fontSize: 12,
		fontWeight: "600",
		color: "#979797",
		marginBottom: 8,
	},
	inputWrapper: {
		marginBottom: 16,
	},
	codeInputRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 16,
	},
	codeInput: {
		flex: 1,
	},
	resendButton: {
		width: 100,
		height: 44,
		backgroundColor: primary.primary1,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
	},
	resendButtonDisabled: {
		backgroundColor: primary.primary4,
		opacity: 0.7,
	},
	resendButtonText: {
		fontSize: 14,
		fontWeight: "500",
		color: neutral.neutral6,
	},
	infoText: {
		fontSize: 14,
		fontWeight: "500",
		lineHeight: 21,
		color: neutral.neutral2,
		marginBottom: 16,
	},
	passwordSection: {
		marginTop: 8,
	},
	passwordFieldSpacing: {
		marginBottom: 16,
	},
	linkButton: {
		alignItems: "center",
		paddingVertical: 12,
	},
	linkText: {
		fontSize: 12,
		fontWeight: "600",
		color: primary.primary1,
	},
});
