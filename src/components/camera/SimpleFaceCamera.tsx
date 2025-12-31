import React, { useState, useRef, useCallback, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { Camera, useCameraPermission } from "react-native-vision-camera";
import { neutral } from "@/constants";
import { scale, spacing, fontSize } from "@/utils/responsive";
import { useFrontCameraDevice } from "@/hooks/useCameraDevice";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { useAutoCapture } from "@/hooks/useAutoCapture";
import { FaceOverlay } from "./FaceOverlay";
import { PoseGuidance } from "./PoseGuidance";
import * as ImageManipulator from "expo-image-manipulator";

export interface SimpleFaceCameraProps {
	onPhotoCapture: (photoUri: string) => void;
	onError: (error: Error) => void;
	attemptNumber?: number;
	maxAttempts?: number;
}

/**
 * Simplified face detection camera for single pose capture
 * Captures only "normal" pose (front-facing, eyes open)
 */
export const SimpleFaceCamera: React.FC<SimpleFaceCameraProps> = ({
	onPhotoCapture,
	onError,
	attemptNumber = 1,
	maxAttempts = 3,
}) => {
	const { hasPermission, requestPermission } = useCameraPermission();
	const { device, format } = useFrontCameraDevice();
	const cameraRef = useRef<Camera>(null);

	const [isProcessing, setIsProcessing] = useState(false);
	const [frameSize, setFrameSize] = useState({ width: 1080, height: 1920 });
	const [displaySize, setDisplaySize] = useState({ width: 375, height: 812 });

	// Face detection for "normal" pose only
	const { faces, validation, detectFacesInFrame } = useFaceDetection(
		"normal",
		frameSize,
	);

	// Capture photo function
	const handleCapture = useCallback(async () => {
		if (!cameraRef.current || isProcessing) return;

		setIsProcessing(true);

		try {
			// Take photo
			const photo = await cameraRef.current.takePhoto({
				enableShutterSound: false,
			});

			let finalPhotoUri = `file://${photo.path}`;

			console.log("📷 Photo captured:", finalPhotoUri);
			console.log(
				"📐 Original dimensions:",
				photo.width,
				"x",
				photo.height,
			);

			// Resize image to max 1024px to avoid server issues
			// This is crucial for transaction verification API
			const maxSize = 1024;
			const shouldResize =
				photo.width > maxSize || photo.height > maxSize;

			if (shouldResize) {
				const manipResult = await ImageManipulator.manipulateAsync(
					finalPhotoUri,
					[
						{
							resize: {
								width:
									photo.width > photo.height
										? maxSize
										: undefined,
								height:
									photo.height >= photo.width
										? maxSize
										: undefined,
							},
						},
					],
					{
						compress: 0.8,
						format: ImageManipulator.SaveFormat.JPEG,
					},
				);

				finalPhotoUri = manipResult.uri;
				console.log("📐 Resized to max", maxSize, "px");
				console.log("📐 New URI:", finalPhotoUri);
			}

			// Return photo (resized if needed)
			onPhotoCapture(finalPhotoUri);
		} catch (error: any) {
			console.error("Capture error:", error);
			onError(new Error(error.message || "Failed to capture photo"));
		} finally {
			setIsProcessing(false);
		}
	}, [isProcessing, onPhotoCapture, onError]);

	// Auto-capture hook
	const { countdown, onValidationResult } = useAutoCapture(handleCapture, {
		stabilityFrames: 15,
		countdownDuration: 1000,
		cooldownDuration: 500,
	});

	// Update validation result to auto-capture
	useEffect(() => {
		if (validation && !isProcessing) {
			onValidationResult(validation.isValid);
		}
	}, [validation, isProcessing, onValidationResult]);

	// Detect faces periodically
	useEffect(() => {
		if (!device || !hasPermission) return;

		const interval = setInterval(async () => {
			if (cameraRef.current && !isProcessing) {
				try {
					// Take snapshot for detection
					const snapshot = await cameraRef.current.takeSnapshot({
						quality: 60,
					});

					// Update frame size from actual snapshot dimensions
					if (snapshot.width && snapshot.height) {
						setFrameSize({
							width: snapshot.width,
							height: snapshot.height,
						});
					}

					await detectFacesInFrame(`file://${snapshot.path}`);
				} catch (error) {
					console.error("❌ Snapshot/Detection error:", error);
				}
			}
		}, 100); // Detect every 100ms

		return () => clearInterval(interval);
	}, [device, hasPermission, isProcessing, detectFacesInFrame]);

	// Request permission on mount
	useEffect(() => {
		if (!hasPermission) {
			requestPermission();
		}
	}, [hasPermission, requestPermission]);

	// Handle layout to get display size
	const onLayout = useCallback((event: any) => {
		const { width, height } = event.nativeEvent.layout;
		setDisplaySize({ width, height });
	}, []);

	// Loading or no permission
	if (!device || !hasPermission) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator
					size="large"
					color={neutral.neutral6}
				/>
			</View>
		);
	}

	return (
		<View
			style={styles.container}
			onLayout={onLayout}>
			{/* Camera */}
			<Camera
				ref={cameraRef}
				style={StyleSheet.absoluteFill}
				device={device}
				isActive={true}
				photo={true}
				format={format}
				enableZoomGesture={false}
			/>

			{/* Overlay */}
			<View
				style={styles.overlay}
				pointerEvents="box-none">
				{/* Attempt Counter */}
				<View style={styles.headerContainer}>
					<Text style={styles.attemptText}>
						Attempt {attemptNumber} of {maxAttempts}
					</Text>
				</View>

				{/* Pose Guidance */}
				<PoseGuidance
					currentPose="normal"
					feedback={validation?.feedback || "Position your face"}
					isValid={validation?.isValid || false}
					countdown={countdown}
				/>

				{/* Face Frame Guide */}
				<View style={styles.faceFrameContainer}>
					<View style={styles.faceFrame} />
				</View>

				{/* Face Detection Overlay */}
				{faces.length > 0 && (
					<FaceOverlay
						faces={faces}
						isValid={validation?.isValid || false}
						frameSize={frameSize}
						displaySize={displaySize}
					/>
				)}

				{/* Bottom Spacer */}
				<View style={styles.bottomSpacer} />
			</View>

			{/* Processing Indicator */}
			{isProcessing && (
				<View style={styles.processingOverlay}>
					<ActivityIndicator
						size="large"
						color={neutral.neutral6}
					/>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: neutral.neutral1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: neutral.neutral1,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
	},
	headerContainer: {
		paddingTop: spacing(60),
		paddingHorizontal: spacing(24),
		alignItems: "center",
	},
	attemptText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "600",
		color: neutral.neutral6,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		paddingHorizontal: spacing(16),
		paddingVertical: spacing(8),
		borderRadius: scale(20),
	},
	faceFrameContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	faceFrame: {
		width: scale(280),
		height: scale(360),
		borderRadius: scale(140),
		borderWidth: scale(4),
		borderColor: neutral.neutral6,
		borderStyle: "dashed",
	},
	bottomSpacer: {
		height: spacing(100),
	},
	processingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
});
