import React, { useState, useRef, useCallback, useEffect } from "react";
import { StyleSheet, View, Pressable, ActivityIndicator } from "react-native";
import { Camera, useCameraPermission } from "react-native-vision-camera";
import { CameraRotate } from "phosphor-react-native";
import { neutral } from "@/constants";
import { scale, spacing } from "@/utils/responsive";
import { useFrontCameraDevice } from "@/hooks/useCameraDevice";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { useAutoCapture } from "@/hooks/useAutoCapture";
import { cropFaceFromImage } from "@/utils/faceCropping";
import { PoseType } from "@/utils/faceValidation";
import { detectFaces } from "@/utils/faceDetection";
import { FaceOverlay } from "./FaceOverlay";
import { PoseGuidance } from "./PoseGuidance";
import { CaptureProgress } from "./CaptureProgress";

const POSE_ORDER: PoseType[] = ["left", "right", "closed_eyes", "normal"];

interface CapturedPhotos {
	left: string | null;
	right: string | null;
	closed_eyes: string | null;
	normal: string | null;
}

export interface FaceDetectionCameraProps {
	onPhotosCaptured: (photos: CapturedPhotos) => void;
	onError: (error: Error) => void;
}

/**
 * Face detection camera with auto-capture
 * Captures 4 poses: left, right, closed_eyes, normal
 */
export const FaceDetectionCamera: React.FC<FaceDetectionCameraProps> = ({
	onPhotosCaptured,
	onError,
}) => {
	const { hasPermission, requestPermission } = useCameraPermission();
	const { device, format } = useFrontCameraDevice();
	const cameraRef = useRef<Camera>(null);

	const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
	const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhotos>({
		left: null,
		right: null,
		closed_eyes: null,
		normal: null,
	});
	const [completedPoses, setCompletedPoses] = useState<Set<number>>(
		new Set(),
	);
	const [isProcessing, setIsProcessing] = useState(false);

	// Frame size (will be updated from actual snapshot dimensions)
	const [frameSize, setFrameSize] = useState({ width: 1080, height: 1920 });
	const [displaySize, setDisplaySize] = useState({ width: 375, height: 812 });

	const currentPose = POSE_ORDER[currentPoseIndex];

	// Face detection hook
	const { faces, validation, lastFaceBounds, detectFacesInFrame } =
		useFaceDetection(currentPose, frameSize);

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
			console.log("📐 Face bounds at capture:", lastFaceBounds);
			console.log("📐 Frame size:", frameSize);
			console.log("📐 Photo dimensions:", photo.width, "x", photo.height);

			// Detect and crop face directly on full resolution photo
			try {
				// Detect face on full photo
				const detectedFaces = await detectFaces(finalPhotoUri);

				console.log("📐 Detected", detectedFaces.length, "face(s)");

				if (detectedFaces.length === 1) {
					const face = detectedFaces[0];
					console.log("📐 Face bounds:", face.bounds);

					// Crop face with padding
					finalPhotoUri = await cropFaceFromImage(
						finalPhotoUri,
						face.bounds,
						{
							padding: 0.3, // 30% padding around face
							targetSize: 400, // 400x400 output size
							quality: 0.9,
						},
					);

					console.log("✂️ Cropped successfully");
				} else {
					console.warn("⚠️ No single face detected, using full image");
				}
			} catch (cropError) {
				console.error("Crop error:", cropError);
			}

			// Save photo for current pose
			setCapturedPhotos((prev) => ({
				...prev,
				[currentPose]: finalPhotoUri,
			}));

			// Mark pose as completed
			setCompletedPoses((prev) => new Set(prev).add(currentPoseIndex));

			// Move to next pose or finish
			if (currentPoseIndex < POSE_ORDER.length - 1) {
				setCurrentPoseIndex(currentPoseIndex + 1);
			} else {
				// All poses captured
				const finalPhotos = {
					...capturedPhotos,
					[currentPose]: finalPhotoUri,
				};
				onPhotosCaptured(finalPhotos);
			}
		} catch (error: any) {
			console.error("Capture error:", error);
			onError(new Error(error.message || "Failed to capture photo"));
		} finally {
			setIsProcessing(false);
		}
	}, [
		currentPose,
		currentPoseIndex,
		capturedPhotos,
		lastFaceBounds,
		isProcessing,
		onPhotosCaptured,
		onError,
	]);

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
					// Quality 50-70 is good balance between detection accuracy and performance
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
				{/* Progress Indicator */}
				<CaptureProgress
					currentPoseIndex={currentPoseIndex}
					completedPoses={completedPoses}
				/>

				{/* Pose Guidance */}
				<PoseGuidance
					currentPose={currentPose}
					feedback={validation?.feedback || "Initializing..."}
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

				{/* Bottom Controls (minimal for auto-capture) */}
				<View style={styles.controls}>
					<View style={styles.placeholder} />
					<View style={styles.centerPlaceholder} />
					<View style={styles.placeholder} />
				</View>
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
	controls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: spacing(40),
		paddingBottom: spacing(50),
	},
	placeholder: {
		width: scale(56),
		height: scale(56),
	},
	centerPlaceholder: {
		width: scale(80),
		height: scale(80),
	},
	processingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
});
