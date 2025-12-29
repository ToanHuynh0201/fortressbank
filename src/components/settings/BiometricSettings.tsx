import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Switch } from "react-native";
import { Fingerprint } from "phosphor-react-native";
import { primary, neutral } from "@/constants";
import { useAuth } from "@/hooks";
import { scale, fontSize, spacing } from "@/utils/responsive";
import AlertModal from "@/components/common/AlertModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import InputModal from "@/components/common/InputModal";

export const BiometricSettings = () => {
	try {
		const {
			biometricAvailable,
			biometricEnabled,
			enableBiometric,
			disableBiometric,
			checkBiometricStatus,
		} = useAuth();
		const [isLoading, setIsLoading] = useState(false);
		const [localEnabled, setLocalEnabled] = useState(biometricEnabled);

		// Modal states
		const [alertModal, setAlertModal] = useState({
			visible: false,
			title: '',
			message: '',
			variant: 'info' as 'info' | 'success' | 'error' | 'warning',
		});
		const [confirmModal, setConfirmModal] = useState({
			visible: false,
			title: '',
			message: '',
			onConfirm: () => {},
		});
		const [inputModal, setInputModal] = useState({
			visible: false,
			title: '',
			message: '',
			placeholder: '',
			secureTextEntry: false,
			onConfirm: (value: string) => {},
		});

		// Update localEnabled when biometricEnabled changes
		useEffect(() => {
			setLocalEnabled(biometricEnabled);
		}, [biometricEnabled]);

		const handleEnableBiometric = async (username: string, password: string) => {
			setIsLoading(true);
			try {
				const success = await enableBiometric(username, password);
				if (success) {
					await checkBiometricStatus();
					setLocalEnabled(true);
					setAlertModal({
						visible: true,
						title: 'Success',
						message: 'Biometric login has been enabled successfully!',
						variant: 'success',
					});
				} else {
					setAlertModal({
						visible: true,
						title: 'Failed',
						message: 'Failed to enable biometric login. Please try again.',
						variant: 'error',
					});
				}
			} catch (error: any) {
				setAlertModal({
					visible: true,
					title: 'Error',
					message: error.message || 'Failed to enable biometric login',
					variant: 'error',
				});
			} finally {
				setIsLoading(false);
			}
		};

		const handleDisableBiometric = async () => {
			setIsLoading(true);
			try {
				const success = await disableBiometric();
				if (success) {
					await checkBiometricStatus();
					setLocalEnabled(false);
					setAlertModal({
						visible: true,
						title: 'Success',
						message: 'Biometric login has been disabled.',
						variant: 'success',
					});
				} else {
					setAlertModal({
						visible: true,
						title: 'Failed',
						message: 'Failed to disable biometric login. Please try again.',
						variant: 'error',
					});
				}
			} catch (error) {
				setAlertModal({
					visible: true,
					title: 'Error',
					message: 'Failed to disable biometric login',
					variant: 'error',
				});
			} finally {
				setIsLoading(false);
			}
		};

		const handleToggle = async (value: boolean) => {
			if (value) {
				// Enable biometric - show confirmation first
				setConfirmModal({
					visible: true,
					title: 'Enable Biometric Login',
					message: 'You need to authenticate with your biometric and provide your login credentials to enable this feature.',
					onConfirm: () => {
						setConfirmModal({ ...confirmModal, visible: false });
						// Show username input
						setInputModal({
							visible: true,
							title: 'Enter Username',
							message: 'Please enter your username:',
							placeholder: 'Username',
							secureTextEntry: false,
							onConfirm: (username) => {
								if (!username) return;
								setInputModal({ ...inputModal, visible: false });
								// Show password input
								setInputModal({
									visible: true,
									title: 'Enter Password',
									message: 'Please enter your password:',
									placeholder: 'Password',
									secureTextEntry: true,
									onConfirm: (password) => {
										if (!password) return;
										setInputModal({ ...inputModal, visible: false });
										handleEnableBiometric(username, password);
									},
								});
							},
						});
					},
				});
			} else {
				// Disable biometric
				setConfirmModal({
					visible: true,
					title: 'Disable Biometric Login',
					message: 'Are you sure you want to disable biometric login?',
					onConfirm: () => {
						setConfirmModal({ ...confirmModal, visible: false });
						handleDisableBiometric();
					},
				});
			}
		};

		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<View style={styles.iconContainer}>
						<Fingerprint
							size={scale(20)}
							color={primary.primary1}
							weight="bold"
						/>
					</View>
					<View style={styles.textContainer}>
						<Text style={styles.title}>Biometric Login</Text>
						<Text style={styles.subtitle}>
							{biometricAvailable
								? "Use fingerprint or face recognition to sign in"
								: "Not available on this device"}
						</Text>
					</View>
				</View>
				<Switch
					value={localEnabled}
					onValueChange={handleToggle}
					disabled={isLoading || !biometricAvailable}
					trackColor={{
						false: neutral.neutral4,
						true: primary.primary2,
					}}
					thumbColor={
						localEnabled ? primary.primary1 : neutral.neutral6
					}
					ios_backgroundColor={neutral.neutral4}
				/>

				{/* Alert Modal */}
				<AlertModal
					visible={alertModal.visible}
					title={alertModal.title}
					message={alertModal.message}
					variant={alertModal.variant}
					onClose={() => setAlertModal({ ...alertModal, visible: false })}
				/>

				{/* Confirmation Modal */}
				<ConfirmationModal
					visible={confirmModal.visible}
					title={confirmModal.title}
					message={confirmModal.message}
					onConfirm={confirmModal.onConfirm}
					onCancel={() => setConfirmModal({ ...confirmModal, visible: false })}
				/>

				{/* Input Modal */}
				<InputModal
					visible={inputModal.visible}
					title={inputModal.title}
					message={inputModal.message}
					placeholder={inputModal.placeholder}
					secureTextEntry={inputModal.secureTextEntry}
					onConfirm={inputModal.onConfirm}
					onCancel={() => setInputModal({ ...inputModal, visible: false })}
				/>
			</View>
		);
	} catch (error) {
		console.error("BiometricSettings render error:", error);
		return (
			<View style={styles.container}>
				<Text style={styles.title}>
					Biometric Error: {String(error)}
				</Text>
			</View>
		);
	}
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: neutral.neutral6,
		borderRadius: scale(16),
		paddingVertical: spacing(16),
		paddingHorizontal: spacing(16),
		marginHorizontal: spacing(24),
		marginBottom: spacing(12),
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: scale(2) },
		shadowOpacity: 0.06,
		shadowRadius: scale(8),
		elevation: 2,
		borderWidth: 1,
		borderColor: neutral.neutral5,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		gap: spacing(12),
	},
	iconContainer: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		backgroundColor: primary.primary4,
		justifyContent: "center",
		alignItems: "center",
	},
	textContainer: {
		flex: 1,
	},
	title: {
		fontFamily: "Poppins",
		fontSize: fontSize(16),
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: spacing(2),
	},
	subtitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(12),
		fontWeight: "400",
		color: neutral.neutral3,
		lineHeight: 16,
	},
});
