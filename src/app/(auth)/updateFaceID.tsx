import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	Pressable,
	ScrollView,
	Image,
} from "react-native";
import { useRouter } from "expo-router";
import { primary, neutral, typography, spacingScale, borderRadius } from "@/constants";
import { scale, fontSize, spacing } from "@/utils/responsive";
import { AppHeader, PrimaryButton, AlertModal } from "@/components/common";
import { DecorativeIllustration } from "@/components/decorative";
import { CardContainer, ScreenContainer } from "@/components/layouts";
import { StatusBar } from "expo-status-bar";
import { FaceDetectionCamera } from "@/components/camera";
import { authService } from "@/services";

type PoseType = "left" | "right" | "closed_eyes" | "normal";

interface CapturedPhotos {
	left: string | null;
	right: string | null;
	closed_eyes: string | null;
	normal: string | null;
}

const POSE_INSTRUCTIONS = {
	left: {
		title: "Turn Left",
		description: "Turn your face to the left side",
		icon: "←",
	},
	right: {
		title: "Turn Right",
		description: "Turn your face to the right side",
		icon: "→",
	},
	closed_eyes: {
		title: "Close Eyes",
		description: "Close your eyes gently",
		icon: "◡",
	},
	normal: {
		title: "Look Straight",
		description: "Look straight at the camera",
		icon: "◉",
	},
};

const POSE_ORDER: PoseType[] = ["left", "right", "closed_eyes", "normal"];

const UpdateFaceID = () => {
	const router = useRouter();
	const [step, setStep] = useState<"camera" | "preview" | "success">(
		"camera",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhotos>({
		left: null,
		right: null,
		closed_eyes: null,
		normal: null,
	});
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});

	const handleRetake = () => {
		setCapturedPhotos({
			left: null,
			right: null,
			closed_eyes: null,
			normal: null,
		});
		setStep("camera");
	};

	const handleConfirm = async () => {
		setIsLoading(true);
		try {
			// Log photo URIs for debugging
			console.log("📤 Uploading photos:", {
				left: capturedPhotos.left?.substring(0, 50) + "...",
				right: capturedPhotos.right?.substring(0, 50) + "...",
				closed_eyes: capturedPhotos.closed_eyes?.substring(0, 50) + "...",
				normal: capturedPhotos.normal?.substring(0, 50) + "...",
			});

			// Use authService to update face ID (includes auto token refresh)
			const response = await authService.updateFaceID(capturedPhotos);

			console.log("Face ID updated successfully:", response);
			setStep("success");
		} catch (error: any) {
			console.error("Error processing photos:", error);

			// Handle session expired error
			if (error.message?.includes("Session expired")) {
				setAlertModal({
					visible: true,
					title: "Session Expired",
					message:
						"Your session has expired. Please login again to continue.",
					variant: "warning",
				});
				// Optional: Navigate to login after showing error
				// setTimeout(() => router.replace("/login"), 2000);
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: error.message || "Failed to process Face ID photos",
					variant: "error",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleOk = () => {
		// Navigate to home after successful Face ID update
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(home)");
		}
	};

	// Success Screen
	if (step === "success") {
		return (
			<ScreenContainer backgroundColor={neutral.neutral6}>
				<StatusBar style="dark" />

				<AppHeader
					title="Update Face ID"
					showBackButton={false}
					backgroundColor={neutral.neutral6}
					textColor={neutral.neutral1}
				/>

				<ScrollView
					style={styles.content}
					contentContainerStyle={styles.successContainer}
					showsVerticalScrollIndicator={false}>
					<DecorativeIllustration
						size={150}
						circleColor={primary.primary4}>
						<Text style={styles.successIcon}>✓</Text>
					</DecorativeIllustration>

					<Text style={styles.successTitle}>
						Face ID updated successfully!
					</Text>
					<Text style={styles.successMessage}>
						Your face recognition has been updated.{"\n"}
						You can now use it for authentication.
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

	// Preview Screen
	if (step === "preview") {
		return (
			<ScreenContainer backgroundColor={neutral.neutral6}>
				<StatusBar style="dark" />

				<AppHeader
					title="Review Photos"
					backgroundColor={neutral.neutral6}
					textColor={neutral.neutral1}
					onBack={handleRetake}
				/>

				<ScrollView
					style={styles.content}
					contentContainerStyle={styles.contentContainer}
					showsVerticalScrollIndicator={false}>
					<CardContainer>
						<Text style={styles.instructionTitle}>
							Review Your Photos
						</Text>
						<Text style={styles.instructionText}>
							Please review all photos. Make sure your face is
							clearly visible in each pose.
						</Text>

						{/* Photo Grid */}
						<View style={styles.photoGrid}>
							{POSE_ORDER.map((pose) => (
								<View
									key={pose}
									style={styles.photoItem}>
									<Text style={styles.photoLabel}>
										{POSE_INSTRUCTIONS[pose].title}
									</Text>
									<View style={styles.photoWrapper}>
										{capturedPhotos[pose] ? (
											<Image
												source={{
													uri: capturedPhotos[pose]!,
												}}
												style={styles.photoThumbnail}
												resizeMode="cover"
											/>
										) : (
											<View
												style={styles.photoPlaceholder}>
												<Text
													style={
														styles.photoPlaceholderText
													}>
													No photo
												</Text>
											</View>
										)}
									</View>
									<Text style={styles.photoIcon}>
										{POSE_INSTRUCTIONS[pose].icon}
									</Text>
								</View>
							))}
						</View>

						<View style={styles.buttonRow}>
							<Pressable
								style={({ pressed }) => [
									styles.secondaryButton,
									pressed && styles.buttonPressed,
								]}
								onPress={handleRetake}>
								<Text style={styles.secondaryButtonText}>
									Retake All
								</Text>
							</Pressable>

							<PrimaryButton
								title="Confirm"
								onPress={handleConfirm}
								loading={isLoading}
								loadingText="Uploading..."
								style={styles.confirmButton}
							/>
						</View>
					</CardContainer>
				</ScrollView>

				<AlertModal
					visible={alertModal.visible}
					title={alertModal.title}
					message={alertModal.message}
					variant={alertModal.variant}
					onClose={() =>
						setAlertModal({ ...alertModal, visible: false })
					}
				/>
			</ScreenContainer>
		);
	}

	// Camera Screen
	return (
		<ScreenContainer backgroundColor={neutral.neutral1}>
			<StatusBar style="light" />

			<AppHeader
				title="Update Face ID"
				backgroundColor={neutral.neutral1}
				textColor={neutral.neutral6}
			/>

			<FaceDetectionCamera
				onPhotosCaptured={(photos) => {
					setCapturedPhotos(photos);
					setStep("preview");
				}}
				onError={(error) => {
					setAlertModal({
						visible: true,
						title: "Error",
						message: error.message || "Failed to capture photos",
						variant: "error",
					});
				}}
			/>

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

export default UpdateFaceID;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		backgroundColor: neutral.neutral6,
	},
	contentContainer: {
		paddingHorizontal: spacingScale.xl,
		paddingTop: spacingScale.xl,
		paddingBottom: spacingScale.xxxl,
	},
	instructionTitle: {
		fontSize: typography.subtitle,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: spacingScale.md,
		textAlign: "center",
	},
	instructionText: {
		fontSize: typography.bodySmall,
		fontWeight: "500",
		lineHeight: fontSize(21),
		color: neutral.neutral3,
		textAlign: "center",
		marginBottom: spacingScale.xl,
	},
	// Photo Grid Styles
	photoGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacingScale.md,
		marginBottom: spacingScale.xl,
	},
	photoItem: {
		width: "48%",
		alignItems: "center",
	},
	photoLabel: {
		fontSize: typography.caption,
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: spacingScale.sm,
		textAlign: "center",
	},
	photoWrapper: {
		width: "100%",
		aspectRatio: 3 / 4,
		borderRadius: borderRadius.md,
		overflow: "hidden",
		backgroundColor: neutral.neutral5,
		marginBottom: spacingScale.sm,
	},
	photoThumbnail: {
		width: "100%",
		height: "100%",
	},
	photoPlaceholder: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: neutral.neutral5,
	},
	photoPlaceholderText: {
		fontSize: typography.caption,
		fontWeight: "500",
		color: neutral.neutral3,
	},
	photoIcon: {
		fontSize: fontSize(24),
		textAlign: "center",
		color: primary.primary1,
	},
	previewContainer: {
		marginBottom: spacingScale.xl,
	},
	previewImageWrapper: {
		width: "100%",
		aspectRatio: 3 / 4,
		borderRadius: borderRadius.xl,
		overflow: "hidden",
		backgroundColor: neutral.neutral5,
	},
	previewImage: {
		width: "100%",
		height: "100%",
	},
	buttonRow: {
		flexDirection: "row",
		gap: spacingScale.md,
	},
	secondaryButton: {
		flex: 1,
		height: scale(56),
		borderRadius: borderRadius.xl,
		backgroundColor: neutral.neutral5,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: neutral.neutral4,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	secondaryButtonText: {
		fontSize: fontSize(16),
		fontWeight: "700",
		color: neutral.neutral1,
	},
	confirmButton: {
		flex: 1,
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
	okButton: {
		width: scale(327),
	},
	// Camera Screen Styles
	cameraContainer: {
		flex: 1,
		position: "relative",
	},
	camera: {
		flex: 1,
	},
	cameraOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
	},
	// Progress Indicator Styles
	progressContainer: {
		paddingTop: spacing(20),
		paddingHorizontal: spacingScale.xl,
		alignItems: "center",
		marginBottom: spacing(20),
	},
	progressBar: {
		flexDirection: "row",
		gap: spacingScale.sm,
		marginBottom: spacingScale.sm,
	},
	progressDot: {
		width: scale(12),
		height: scale(12),
		borderRadius: scale(6),
		backgroundColor: "rgba(255, 255, 255, 0.3)",
	},
	progressDotActive: {
		backgroundColor: neutral.neutral6,
	},
	progressText: {
		fontSize: typography.bodySmall,
		fontWeight: "600",
		color: neutral.neutral6,
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	instructionContainer: {
		paddingHorizontal: spacingScale.xl,
		alignItems: "center",
		marginBottom: spacing(20),
	},
	poseIcon: {
		fontSize: fontSize(60),
		color: neutral.neutral6,
		marginBottom: spacingScale.md,
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: scale(2) },
		textShadowRadius: scale(4),
	},
	cameraInstruction: {
		fontSize: typography.subtitle,
		fontWeight: "700",
		color: neutral.neutral6,
		textAlign: "center",
		marginBottom: spacingScale.sm,
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	cameraSubInstruction: {
		fontSize: typography.bodySmall,
		fontWeight: "500",
		color: neutral.neutral5,
		textAlign: "center",
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	faceFrameContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	faceOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
	},
	faceFrame: {
		width: scale(280),
		height: scale(360),
		borderRadius: scale(140),
		borderWidth: 4,
		borderColor: neutral.neutral6,
		borderStyle: "dashed",
	},
	cameraControls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: spacingScale.xxxl,
		paddingBottom: spacing(50),
	},
	flipButton: {
		width: scale(56),
		height: scale(56),
		borderRadius: scale(28),
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	flipButtonPlaceholder: {
		width: scale(56),
		height: scale(56),
	},
	captureButton: {
		width: scale(80),
		height: scale(80),
		borderRadius: scale(40),
		backgroundColor: "transparent",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 5,
		borderColor: neutral.neutral6,
	},
	captureButtonPressed: {
		transform: [{ scale: 0.9 }],
	},
	captureButtonInner: {
		width: scale(64),
		height: scale(64),
		borderRadius: scale(32),
		backgroundColor: neutral.neutral6,
	},
	// Permission Styles
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: spacingScale.xxxl,
	},
	permissionText: {
		fontSize: fontSize(16),
		fontWeight: "600",
		color: neutral.neutral2,
		textAlign: "center",
	},
	permissionTitle: {
		fontSize: typography.h3,
		fontWeight: "700",
		color: neutral.neutral1,
		textAlign: "center",
		marginTop: spacingScale.xl,
		marginBottom: spacingScale.md,
	},
	permissionMessage: {
		fontSize: typography.bodySmall,
		fontWeight: "500",
		lineHeight: fontSize(21),
		color: neutral.neutral3,
		textAlign: "center",
		marginBottom: spacingScale.xxl,
	},
	permissionButton: {
		width: "100%",
		maxWidth: scale(327),
	},
});
