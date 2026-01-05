import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { CaretLeft, SealCheck } from "phosphor-react-native";
import colors from "@/constants/colors";
import { AlertModal } from "@/components";
import { transferService } from "@/services";
import { scale, fontSize, spacing } from "@/utils/responsive";
import { SimpleFaceCamera } from "@/components/camera/SimpleFaceCamera";

const FaceVerification = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{
		transactionId: string;
		fromAccountId?: string;
		recipientName?: string;
		amount?: string;
		bankName?: string;
	}>();

	const [attemptNumber, setAttemptNumber] = useState(1);
	const [isVerifying, setIsVerifying] = useState(false);
	const [showCamera, setShowCamera] = useState(true);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});

	const MAX_ATTEMPTS = 3;

	const handlePhotoCapture = async (photoUri: string) => {
		if (isVerifying) return;

		setIsVerifying(true);
		setShowCamera(false);

		try {
			console.log(
				"🔐 Verifying face for transaction:",
				params.transactionId,
			);

			// Call API to verify face - this completes the transaction
			const response = await transferService.verifyTransactionWithFace(
				params.transactionId,
				photoUri,
			);

			if (response.code === 1000 && response.data.verified) {
				// Face verified successfully - transaction is COMPLETED
				console.log(
					"✅ Face verification successful, transaction status:",
					response.data.status,
				);

				// Navigate to success screen (transaction is complete)
				router.push({
					pathname: "(transfer)/transferSuccess",
					params: {
						transactionId: params.transactionId,
						recipientName: params.recipientName || "",
						amount: params.amount || "",
						bankName: params.bankName || "",
						status: response.data.status,
					},
				});
			} else {
				// Verification failed
				handleVerificationFailure(
					response.message || "Face verification failed",
				);
			}
		} catch (error: any) {
			console.error("❌ Face verification error:", error);

			// Parse error message for better user feedback
			let userMessage = "Face verification failed";
			if (error.message) {
				if (error.message.includes("No match") || error.message.includes("not recognized")) {
					userMessage = "Face not recognized. Please ensure your face is clearly visible and matches your registered Face ID.";
				} else if (error.message.includes("network") || error.message.includes("timeout")) {
					userMessage = "Network error. Please check your connection and try again.";
				} else if (error.message.includes("token") || error.message.includes("Session expired")) {
					userMessage = "Session expired. Please login again.";
				} else {
					userMessage = error.message;
				}
			}

			handleVerificationFailure(userMessage);
		} finally {
			setIsVerifying(false);
		}
	};

	const handleVerificationFailure = (errorMessage: string) => {
		if (attemptNumber >= MAX_ATTEMPTS) {
			// Max attempts reached
			setAlertModal({
				visible: true,
				title: "Verification Failed",
				message: `Face verification failed after ${MAX_ATTEMPTS} attempts. Please try again later or contact support.`,
				variant: "error",
			});

			// Cancel transaction and navigate back
			setTimeout(async () => {
				try {
					await transferService.cancelTransaction(
						params.transactionId,
					);
					console.log(
						"🚫 Transaction cancelled due to max face verification attempts",
					);
				} catch (error) {
					console.error("Failed to cancel transaction:", error);
				}
				router.back();
			}, 2500);
		} else {
			// Allow retry
			const remainingAttempts = MAX_ATTEMPTS - attemptNumber;
			setAlertModal({
				visible: true,
				title: "Verification Failed",
				message: `${errorMessage}. You have ${remainingAttempts} attempt(s) remaining.`,
				variant: "error",
			});

			setAttemptNumber(attemptNumber + 1);
			setShowCamera(true);
		}
	};

	const handleError = (error: Error) => {
		console.error("📷 Camera error:", error);
		setAlertModal({
			visible: true,
			title: "Camera Error",
			message:
				error.message || "Failed to capture photo. Please try again.",
			variant: "error",
		});
		setShowCamera(true);
	};

	const handleBack = () => {
		if (isVerifying) return;
		router.back();
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar
				barStyle="light-content"
				backgroundColor="#4A3FDB"
			/>

			{/* Header with Gradient */}
			<LinearGradient
				colors={["#4A3FDB", "#3629B7", "#2A1F8F"]}
				style={styles.headerGradient}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={handleBack}
						style={styles.backButton}
						disabled={isVerifying}>
						<CaretLeft
							size={scale(24)}
							color={colors.neutral.neutral6}
							weight="bold"
						/>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Face Verification</Text>
					<View style={styles.headerRight} />
				</View>
			</LinearGradient>

			{/* Content */}
			<View style={styles.content}>
				{showCamera && !isVerifying ? (
					<>
						<View style={styles.instructionContainer}>
							<View style={styles.iconContainer}>
								<SealCheck
									size={scale(48)}
									color={colors.primary.primary1}
									weight="fill"
								/>
							</View>
							<Text style={styles.instructionTitle}>
								Verify Your Identity
							</Text>
							<Text style={styles.instructionText}>
								Position your face within the frame and look
								straight at the camera
							</Text>
						</View>

						<View style={styles.cameraContainer}>
							<SimpleFaceCamera
								onPhotoCapture={handlePhotoCapture}
								onError={handleError}
								attemptNumber={attemptNumber}
								maxAttempts={MAX_ATTEMPTS}
							/>
						</View>
					</>
				) : (
					<View style={styles.loadingContainer}>
						<ActivityIndicator
							size="large"
							color={colors.primary.primary1}
						/>
						<Text style={styles.loadingText}>
							Verifying your face...
						</Text>
						<Text style={styles.loadingSubtext}>
							Please wait a moment
						</Text>
					</View>
				)}
			</View>

			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
	},
	headerGradient: {
		paddingBottom: spacing(24),
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: spacing(24),
		paddingTop: spacing(12),
	},
	backButton: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(20),
		fontWeight: "700",
		color: colors.neutral.neutral6,
		lineHeight: fontSize(28),
	},
	headerRight: {
		width: scale(40),
	},
	content: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
	},
	instructionContainer: {
		alignItems: "center",
		paddingHorizontal: spacing(24),
		paddingVertical: spacing(24),
		backgroundColor: colors.neutral.neutral6,
	},
	iconContainer: {
		width: scale(80),
		height: scale(80),
		borderRadius: scale(40),
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: spacing(16),
	},
	instructionTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(22),
		fontWeight: "700",
		color: colors.neutral.neutral1,
		lineHeight: fontSize(30),
		marginBottom: spacing(8),
		textAlign: "center",
	},
	instructionText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "400",
		color: colors.neutral.neutral3,
		lineHeight: fontSize(20),
		textAlign: "center",
		paddingHorizontal: spacing(16),
	},
	cameraContainer: {
		flex: 1,
		borderTopLeftRadius: scale(24),
		borderTopRightRadius: scale(24),
		overflow: "hidden",
		backgroundColor: colors.neutral.neutral1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: spacing(24),
	},
	loadingText: {
		fontFamily: "Poppins",
		fontSize: fontSize(18),
		fontWeight: "600",
		color: colors.neutral.neutral1,
		lineHeight: fontSize(26),
		marginTop: spacing(24),
		textAlign: "center",
	},
	loadingSubtext: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "400",
		color: colors.neutral.neutral3,
		lineHeight: fontSize(20),
		marginTop: spacing(8),
		textAlign: "center",
	},
});

export default FaceVerification;
