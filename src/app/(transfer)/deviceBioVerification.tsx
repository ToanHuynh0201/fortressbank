import React, { useState, useEffect } from "react";
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
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	withSequence,
	Easing,
} from "react-native-reanimated";
import { CaretLeft, Fingerprint, ShieldCheck, Warning } from "phosphor-react-native";
import colors from "@/constants/colors";
import { PrimaryButton, AlertModal } from "@/components";
import { transferService, deviceService } from "@/services";
import { scale, fontSize, spacing } from "@/utils/responsive";

/**
 * Device Biometric Verification Screen
 * 
 * This screen handles DEVICE_BIO challenge type for medium-risk transactions.
 * Flow:
 * 1. Prompt user to authenticate with biometric (fingerprint/face)
 * 2. Sign the challengeData with device's private key
 * 3. Send signature to backend for verification
 * 4. On success, navigate to transfer success screen
 */
const DeviceBioVerification = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{
		transactionId: string;
		recipientName?: string;
		amount?: string;
		bankName?: string;
		challengeData?: string;
	}>();

	const [isVerifying, setIsVerifying] = useState(false);
	const [isDeviceReady, setIsDeviceReady] = useState<boolean | null>(null);
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
		// Check if device is registered
		checkDeviceStatus();

		// Animations
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});

		iconOpacity.value = withTiming(1, {
			duration: 500,
			easing: Easing.out(Easing.ease),
		});
		iconScale.value = withSequence(
			withSpring(1.1, { damping: 10, stiffness: 100 }),
			withSpring(1, { damping: 15, stiffness: 150 })
		);

		contentOpacity.value = withTiming(1, {
			duration: 500,
			easing: Easing.out(Easing.ease),
		});
	}, []);

	const checkDeviceStatus = async () => {
		const isRegistered = await deviceService.isDeviceRegistered();
		setIsDeviceReady(isRegistered);
		
		if (!isRegistered) {
			// Auto-initialize keys if not present (but not registered with backend)
			const keys = await deviceService.initializeDeviceKeys();
			if (keys) {
				// For now, we'll auto-register. In production, this should be a separate flow.
				const registered = await deviceService.registerDevice();
				setIsDeviceReady(registered);
			}
		}
	};

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

	const handleVerifyBiometric = async () => {
		if (!params.transactionId || !params.challengeData) {
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Transaction data is missing. Please try again.",
				variant: "error",
			});
			return;
		}

		setIsVerifying(true);
		try {
			// Step 1: Sign the challenge with device key (includes biometric prompt)
			const signResult = await deviceService.signChallenge(params.challengeData);
			
			if (!signResult.success || !signResult.signature) {
				setAlertModal({
					visible: true,
					title: "Verification Cancelled",
					message: signResult.error || "Biometric authentication failed",
					variant: "error",
				});
				setIsVerifying(false);
				return;
			}

			// Step 2: Get device ID
			const deviceId = await deviceService.getDeviceId();
			if (!deviceId) {
				setAlertModal({
					visible: true,
					title: "Device Error",
					message: "Device not registered. Please re-register your device.",
					variant: "error",
				});
				setIsVerifying(false);
				return;
			}

			// Step 3: Send signature to backend
			console.log("Sending device signature verification:", {
				transactionId: params.transactionId,
				deviceId,
				signatureLength: signResult.signature.length,
			});

			const response = await transferService.verifyDeviceSignature({
				transactionId: params.transactionId,
				deviceId,
				signatureBase64: signResult.signature,
			});

			console.log("Device verification response:", response);

			// Check if transaction is completed
			if (response.code === 1000 && response.data) {
				const txData = response.data;
				
				if (txData.status === "COMPLETED") {
					router.push({
						pathname: "(transfer)/transferSuccess",
						params: {
							transactionId: txData.transactionId,
							amount: txData.amount?.toString() || params.amount,
							receiverAccountNumber: txData.receiverAccountNumber,
							senderAccountNumber: txData.senderAccountNumber,
							transactionType: txData.transactionType,
							createdAt: txData.createdAt || new Date().toISOString(),
							status: txData.status,
							feeAmount: txData.feeAmount?.toString() || "0",
							description: txData.description || "",
							recipientName: params.recipientName || "",
							bankName: params.bankName || "",
						},
					});
				} else if (txData.status === "FAILED") {
					setAlertModal({
						visible: true,
						title: "Transaction Failed",
						message: txData.failureReason || "Transaction could not be completed",
						variant: "error",
					});
				} else {
					// Transaction is in another state (maybe needs OTP too?)
					setAlertModal({
						visible: true,
						title: "Verification Complete",
						message: `Transaction status: ${txData.status}`,
						variant: "info",
					});
				}
			} else {
				setAlertModal({
					visible: true,
					title: "Verification Failed",
					message: response.message || "Device verification failed",
					variant: "error",
				});
			}
		} catch (error: any) {
			console.error("Device verification error:", error);
			setAlertModal({
				visible: true,
				title: "Verification Error",
				message: error.response?.data?.message || error.message || "An error occurred",
				variant: "error",
			});
		} finally {
			setIsVerifying(false);
		}
	};

	const formatAmount = (amount: string) => {
		const num = parseFloat(amount || "0");
		return num.toLocaleString("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
		});
	};

	// Show loading while checking device status
	if (isDeviceReady === null) {
		return (
			<SafeAreaView style={styles.container} edges={["top"]}>
				<StatusBar barStyle="light-content" backgroundColor={colors.primary.primary1} />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primary.primary1} />
					<Text style={styles.loadingText}>Checking device security...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<StatusBar barStyle="light-content" backgroundColor={colors.primary.primary1} />

			{/* Header with Gradient */}
			<LinearGradient
				colors={["#4A3FDB", "#3629B7", "#2A1F8F"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.header}
			>
				<Animated.View style={[styles.headerContent, headerAnimatedStyle]}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<CaretLeft size={scale(24)} color="#FFFFFF" weight="bold" />
					</TouchableOpacity>
					<View style={styles.headerTextContainer}>
						<Text style={styles.headerTitle}>Xác Nhận Giao Dịch</Text>
						<Text style={styles.headerSubtitle}>Sử dụng vân tay hoặc Face ID</Text>
					</View>
				</Animated.View>
			</LinearGradient>

			{/* Content */}
			<View style={styles.content}>
				{/* Icon */}
				<Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
					<View style={styles.iconCircle}>
						<Fingerprint size={scale(64)} color={colors.primary.primary1} weight="duotone" />
					</View>
				</Animated.View>

				{/* Transaction Info */}
				<Animated.View style={[styles.infoContainer, contentAnimatedStyle]}>
					<Text style={styles.amountLabel}>Số tiền giao dịch</Text>
					<Text style={styles.amount}>{formatAmount(params.amount || "0")}</Text>
					
					{params.recipientName && (
						<View style={styles.recipientRow}>
							<Text style={styles.recipientLabel}>Người nhận:</Text>
							<Text style={styles.recipientName}>{params.recipientName}</Text>
						</View>
					)}
					
					{params.bankName && (
						<View style={styles.recipientRow}>
							<Text style={styles.recipientLabel}>Ngân hàng:</Text>
							<Text style={styles.recipientName}>{params.bankName}</Text>
						</View>
					)}
				</Animated.View>

				{/* Security Notice */}
				<Animated.View style={[styles.securityNotice, contentAnimatedStyle]}>
					<ShieldCheck size={scale(20)} color={colors.semantic.success} weight="fill" />
					<Text style={styles.securityText}>
						Giao dịch được bảo vệ bằng chữ ký số từ thiết bị của bạn
					</Text>
				</Animated.View>

				{/* Device not ready warning */}
				{!isDeviceReady && (
					<Animated.View style={[styles.warningNotice, contentAnimatedStyle]}>
						<Warning size={scale(20)} color={colors.semantic.warning} weight="fill" />
						<Text style={styles.warningText}>
							Thiết bị chưa được đăng ký. Đang tự động đăng ký...
						</Text>
					</Animated.View>
				)}

				{/* Verify Button */}
				<View style={styles.buttonContainer}>
					<PrimaryButton
						title={isVerifying ? "Đang xác thực..." : "Xác Nhận Bằng Vân Tay"}
						onPress={handleVerifyBiometric}
						disabled={isVerifying || !isDeviceReady}
						loading={isVerifying}
						style={styles.verifyButton}
					/>
					
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.cancelButton}
						disabled={isVerifying}
					>
						<Text style={styles.cancelButtonText}>Hủy Giao Dịch</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Alert Modal */}
			<AlertModal
				visible={alertModal.visible}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: spacing(4),
	},
	loadingText: {
		fontSize: fontSize(14),
		color: colors.neutral.neutral2,
	},
	header: {
		paddingTop: spacing(4),
		paddingBottom: spacing(8),
		paddingHorizontal: spacing(4),
		borderBottomLeftRadius: scale(24),
		borderBottomRightRadius: scale(24),
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	headerTextContainer: {
		marginLeft: spacing(4),
	},
	headerTitle: {
		fontSize: fontSize(20),
		fontWeight: "700",
		color: "#FFFFFF",
	},
	headerSubtitle: {
		fontSize: fontSize(14),
		color: "rgba(255, 255, 255, 0.8)",
		marginTop: spacing(1),
	},
	content: {
		flex: 1,
		paddingHorizontal: spacing(6),
		paddingTop: spacing(8),
		alignItems: "center",
	},
	iconContainer: {
		marginBottom: spacing(6),
	},
	iconCircle: {
		width: scale(120),
		height: scale(120),
		borderRadius: scale(60),
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: colors.primary.primary3,
	},
	infoContainer: {
		alignItems: "center",
		marginBottom: spacing(6),
	},
	amountLabel: {
		fontSize: fontSize(14),
		color: colors.neutral.neutral2,
		marginBottom: spacing(2),
	},
	amount: {
		fontSize: fontSize(32),
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: spacing(4),
	},
	recipientRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: spacing(2),
	},
	recipientLabel: {
		fontSize: fontSize(14),
		color: colors.neutral.neutral2,
		marginRight: spacing(2),
	},
	recipientName: {
		fontSize: fontSize(14),
		fontWeight: "600",
		color: colors.neutral.neutral1,
	},
	securityNotice: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(82, 213, 186, 0.1)",
		paddingHorizontal: spacing(4),
		paddingVertical: spacing(3),
		borderRadius: scale(12),
		marginBottom: spacing(4),
		gap: spacing(2),
	},
	securityText: {
		flex: 1,
		fontSize: fontSize(12),
		color: colors.semantic.success,
	},
	warningNotice: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255, 175, 42, 0.1)",
		paddingHorizontal: spacing(4),
		paddingVertical: spacing(3),
		borderRadius: scale(12),
		marginBottom: spacing(4),
		gap: spacing(2),
	},
	warningText: {
		flex: 1,
		fontSize: fontSize(12),
		color: colors.semantic.warning,
	},
	buttonContainer: {
		width: "100%",
		marginTop: "auto",
		paddingBottom: spacing(8),
	},
	verifyButton: {
		marginBottom: spacing(4),
	},
	cancelButton: {
		alignItems: "center",
		paddingVertical: spacing(3),
	},
	cancelButtonText: {
		fontSize: fontSize(14),
		color: colors.semantic.error,
		fontWeight: "600",
	},
});

export default DeviceBioVerification;
