import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
	neutral,
	primary,
	commonStyles,
	typography,
	spacingScale,
	borderRadius,
} from "@/constants";
import { scale, fontSize, spacing } from "@/utils/responsive";
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
import { validationRules } from "@/utils/validation";
import { authService } from "@/services";

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
		verificationToken: "",
	});

	const handleSendCode = async () => {
		if (!values.phoneNumber.trim()) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Please enter your phone number",
				variant: "error",
			});
			return;
		}

		// Validate phone number
		const phoneError = validationRules.phoneNumber(values.phoneNumber);
		if (phoneError) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: phoneError,
				variant: "error",
			});
			return;
		}

		setIsSendingCode(true);
		try {
			const response = await authService.sendForgotPasswordOtp({
				phoneNumber: values.phoneNumber,
			});
			console.log(response);

			if (response.code === 1000) {
				setStep("confirm-phone");
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message:
						response.message || "Failed to send verification code",
					variant: "error",
				});
			}
		} catch (error) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "An unexpected error occurred. Please try again.",
				variant: "error",
			});
		} finally {
			setIsSendingCode(false);
		}
	};

	const handleVerifyPhone = async () => {
		setIsVerifyingPhone(true);
		try {
			const response = await authService.sendForgotPasswordOtp({
				phoneNumber: values.phoneNumber,
			});

			if (response.code === 1000) {
				setStep("enter-code");
				setAlertModal({
					visible: true,
					title: "Success",
					message: `Verification code sent to your phone. Code expires in ${
						response.data?.expirySeconds || 300
					} seconds.`,
					variant: "success",
				});
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message:
						response.message || "Failed to send verification code",
					variant: "error",
				});
			}
		} catch (error) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "An unexpected error occurred. Please try again.",
				variant: "error",
			});
		} finally {
			setIsVerifyingPhone(false);
		}
	};

	const handleResendCode = async () => {
		setIsResendingCode(true);
		try {
			const response = await authService.sendForgotPasswordOtp({
				phoneNumber: values.phoneNumber,
			});

			if (response.code === 1000) {
				setAlertModal({
					visible: true,
					title: "Success",
					message: "Code has been resent to your phone",
					variant: "success",
				});
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: response.message || "Failed to resend code",
					variant: "error",
				});
			}
		} catch (error) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "An unexpected error occurred. Please try again.",
				variant: "error",
			});
		} finally {
			setIsResendingCode(false);
		}
	};

	const handleVerifyCode = async () => {
		if (values.code.length < 4) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Please enter the verification code",
				variant: "error",
			});
			return;
		}

		setIsVerifyingCode(true);
		try {
			const response = await authService.verifyForgotPasswordOtp({
				phoneNumber: values.phoneNumber,
				otp: values.code,
			});

			if (response.code === 1000 && response.data?.verified) {
				// Store verification token for password reset
				handleChange(
					"verificationToken",
					response.data.verificationToken,
				);
				setStep("change-password");
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: response.message || "Invalid verification code",
					variant: "error",
				});
			}
		} catch (error) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "An unexpected error occurred. Please try again.",
				variant: "error",
			});
		} finally {
			setIsVerifyingCode(false);
		}
	};

	const handleChangePassword = async () => {
		if (!values.newPassword.trim() || !values.confirmPassword.trim()) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Please enter both password fields",
				variant: "error",
			});
			return;
		}

		// Validate new password
		const passwordError = validationRules.password(values.newPassword);
		if (passwordError) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: passwordError,
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

		// Verify we have the verification token
		if (!values.verificationToken) {
			setAlertModal({
				visible: true,
				title: "Error",
				message:
					"Verification token missing. Please verify your code again.",
				variant: "error",
			});
			setStep("enter-code");
			return;
		}

		setIsChangingPassword(true);
		try {
			const response = await authService.resetPassword({
				phoneNumber: values.phoneNumber,
				verificationToken: values.verificationToken,
				newPassword: values.newPassword,
			});

			if (response.code === 1000 && response.data?.success) {
				setConfirmModal({
					visible: true,
					onConfirm: () => {
						setConfirmModal({ ...confirmModal, visible: false });
						router.replace("/signIn");
					},
				});
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: response.message || "Failed to reset password",
					variant: "error",
				});
			}
		} catch (error) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "An unexpected error occurred. Please try again.",
				variant: "error",
			});
		} finally {
			setIsChangingPassword(false);
		}
	};

	const handleChangePhoneNumber = () => {
		setStep("enter-phone");
		handleChange("phoneNumber", "");
		handleChange("code", "");
		handleChange("verificationToken", "");
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
								placeholder="Enter phone number"
								value={values.phoneNumber}
								onChangeText={(text) =>
									handleChange(
										"phoneNumber",
										text.replace(/\D/g, ""),
									)
								}
								keyboardType="phone-pad"
								isActive={!!values.phoneNumber}
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
								placeholder="Enter phone number"
								value={values.phoneNumber}
								onChangeText={(text) =>
									handleChange(
										"phoneNumber",
										text.replace(/\D/g, ""),
									)
								}
								keyboardType="phone-pad"
								isActive={!!values.phoneNumber}
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
									maxLength={6}
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
		paddingHorizontal: spacingScale.xl,
		paddingTop: spacingScale.xl,
		paddingBottom: spacingScale.xxxl,
	},
	label: {
		fontSize: typography.caption,
		fontWeight: "600",
		color: "#979797",
		marginBottom: spacingScale.sm,
	},
	inputWrapper: {
		marginBottom: spacingScale.lg,
	},
	codeInputRow: {
		flexDirection: "row",
		gap: spacingScale.md,
		marginBottom: spacingScale.lg,
	},
	codeInput: {
		flex: 1,
	},
	resendButton: {
		width: scale(100),
		height: scale(44),
		backgroundColor: primary.primary1,
		borderRadius: borderRadius.lg,
		justifyContent: "center",
		alignItems: "center",
	},
	resendButtonDisabled: {
		backgroundColor: primary.primary4,
		opacity: 0.7,
	},
	resendButtonText: {
		fontSize: typography.bodySmall,
		fontWeight: "500",
		color: neutral.neutral6,
	},
	infoText: {
		fontSize: typography.bodySmall,
		fontWeight: "500",
		lineHeight: fontSize(21),
		color: neutral.neutral2,
		marginBottom: spacingScale.lg,
	},
	passwordSection: {
		marginTop: spacingScale.sm,
	},
	passwordFieldSpacing: {
		marginBottom: spacingScale.lg,
	},
	linkButton: {
		alignItems: "center",
		paddingVertical: spacingScale.md,
	},
	linkText: {
		fontSize: typography.caption,
		fontWeight: "600",
		color: primary.primary1,
	},
});
