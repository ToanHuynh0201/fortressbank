import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { primary, neutral, commonStyles } from "@/constants";
import {
	AppHeader,
	PasswordInput,
	PrimaryButton,
	CardContainer,
	ScreenContainer,
	DecorativeIllustration,
	AlertModal,
} from "@/components";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useForm } from "@/hooks";
import { useAuth } from "@/hooks";

const ChangePassword = () => {
	const router = useRouter();
	const { changePassword, logout } = useAuth();
	const [step, setStep] = useState<"enter-passwords" | "success">(
		"enter-passwords",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});

	const { values, handleChange } = useForm({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const isFormValid =
		values.oldPassword && values.newPassword && values.confirmPassword;

	const handleChangePassword = async () => {
		if (!isFormValid) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Please fill in all password fields",
				variant: "error",
			});
			return;
		}

		if (values.newPassword !== values.confirmPassword) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "New passwords do not match",
				variant: "error",
			});
			return;
		}

		if (values.oldPassword === values.newPassword) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "New password must be different from old password",
				variant: "error",
			});
			return;
		}

		setIsLoading(true);
		try {
			const response = await changePassword(
				values.oldPassword,
				values.newPassword,
			);

			if (response.success) {
				setStep("success");
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: response.error || "Failed to change password",
					variant: "error",
				});
			}
		} catch (error: any) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: error.message || "Failed to change password",
				variant: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleOk = async () => {
		await logout();
		router.replace("/signIn");
	};

	if (step === "success") {
		return (
			<ScreenContainer backgroundColor={neutral.neutral6}>
				<StatusBar style="dark" />

				<AppHeader
					title="Change password"
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
						Change password successfully!
					</Text>
					<Text style={styles.successMessage}>
						You have successfully change password.{"\n"}
						Please use the new password when Sign in.
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
				title="Change password"
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
					<CardContainer>
						{/* Old Password */}
						<View style={styles.fieldContainer}>
							<Text style={styles.label}>
								Type your old password
							</Text>
							<PasswordInput
								placeholder="************"
								value={values.oldPassword}
								onChangeText={(text) =>
									handleChange("oldPassword", text)
								}
							/>
						</View>

						{/* New Password */}
						<View style={styles.fieldContainer}>
							<Text style={styles.label}>
								Type your new password
							</Text>
							<PasswordInput
								placeholder="************"
								value={values.newPassword}
								onChangeText={(text) =>
									handleChange("newPassword", text)
								}
							/>
						</View>

						{/* Confirm Password */}
						<View style={styles.fieldContainer}>
							<Text style={styles.label}>Confirm password</Text>
							<PasswordInput
								placeholder="************"
								value={values.confirmPassword}
								onChangeText={(text) =>
									handleChange("confirmPassword", text)
								}
							/>
						</View>

						{/* Change Password Button */}
						<PrimaryButton
							title="Change password"
							onPress={handleChangePassword}
							disabled={!isFormValid || isLoading}
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

export default ChangePassword;

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
	fieldContainer: {
		marginBottom: 24,
	},
	label: {
		fontSize: 12,
		fontWeight: "600",
		color: "#979797",
		marginBottom: 8,
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
	okButton: {
		width: 327,
	},
});
