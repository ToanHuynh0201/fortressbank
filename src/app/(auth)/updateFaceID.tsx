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
import { primary, neutral } from "@/constants";
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
		router.back();
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
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 40,
	},
	instructionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: 12,
		textAlign: "center",
	},
	instructionText: {
		fontSize: 14,
		fontWeight: "500",
		lineHeight: 21,
		color: neutral.neutral3,
		textAlign: "center",
		marginBottom: 24,
	},
	// Photo Grid Styles
	photoGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginBottom: 24,
	},
	photoItem: {
		width: "48%",
		alignItems: "center",
	},
	photoLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: 8,
		textAlign: "center",
	},
	photoWrapper: {
		width: "100%",
		aspectRatio: 3 / 4,
		borderRadius: 12,
		overflow: "hidden",
		backgroundColor: neutral.neutral5,
		marginBottom: 8,
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
		fontSize: 12,
		fontWeight: "500",
		color: neutral.neutral3,
	},
	photoIcon: {
		fontSize: 24,
		textAlign: "center",
		color: primary.primary1,
	},
	previewContainer: {
		marginBottom: 24,
	},
	previewImageWrapper: {
		width: "100%",
		aspectRatio: 3 / 4,
		borderRadius: 20,
		overflow: "hidden",
		backgroundColor: neutral.neutral5,
	},
	previewImage: {
		width: "100%",
		height: "100%",
	},
	buttonRow: {
		flexDirection: "row",
		gap: 12,
	},
	secondaryButton: {
		flex: 1,
		height: 56,
		borderRadius: 20,
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
		fontSize: 16,
		fontWeight: "700",
		color: neutral.neutral1,
	},
	confirmButton: {
		flex: 1,
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
		paddingTop: 20,
		paddingHorizontal: 24,
		alignItems: "center",
		marginBottom: 20,
	},
	progressBar: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 8,
	},
	progressDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
	},
	progressDotActive: {
		backgroundColor: neutral.neutral6,
	},
	progressText: {
		fontSize: 14,
		fontWeight: "600",
		color: neutral.neutral6,
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	instructionContainer: {
		paddingHorizontal: 24,
		alignItems: "center",
		marginBottom: 20,
	},
	poseIcon: {
		fontSize: 60,
		color: neutral.neutral6,
		marginBottom: 12,
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
	cameraInstruction: {
		fontSize: 18,
		fontWeight: "700",
		color: neutral.neutral6,
		textAlign: "center",
		marginBottom: 8,
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 3,
	},
	cameraSubInstruction: {
		fontSize: 14,
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
		width: 280,
		height: 360,
		borderRadius: 140,
		borderWidth: 4,
		borderColor: neutral.neutral6,
		borderStyle: "dashed",
	},
	cameraControls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 40,
		paddingBottom: 50,
	},
	flipButton: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	flipButtonPlaceholder: {
		width: 56,
		height: 56,
	},
	captureButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
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
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: neutral.neutral6,
	},
	// Permission Styles
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	permissionText: {
		fontSize: 16,
		fontWeight: "600",
		color: neutral.neutral2,
		textAlign: "center",
	},
	permissionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: neutral.neutral1,
		textAlign: "center",
		marginTop: 24,
		marginBottom: 12,
	},
	permissionMessage: {
		fontSize: 14,
		fontWeight: "500",
		lineHeight: 21,
		color: neutral.neutral3,
		textAlign: "center",
		marginBottom: 32,
	},
	permissionButton: {
		width: "100%",
		maxWidth: 327,
	},
});
