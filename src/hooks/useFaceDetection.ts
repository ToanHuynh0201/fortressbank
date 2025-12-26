import { useState, useCallback, useRef } from "react";
import { runOnJS } from "react-native-reanimated";
import {
	detectFaces,
	type DetectedFace,
	DEFAULT_FACE_DETECTION_OPTIONS,
} from "@/utils/faceDetection";
import {
	validateFaceForCapture,
	type PoseType,
	type FaceValidationResult,
} from "@/utils/faceValidation";

export interface UseFaceDetectionResult {
	faces: DetectedFace[];
	validation: FaceValidationResult | null;
	isDetecting: boolean;
	lastFaceBounds: DetectedFace["bounds"] | null;
	detectFacesInFrame: (imagePath: string) => Promise<void>;
}

/**
 * Hook for face detection with validation
 * Provides face detection results and validation feedback
 */
export function useFaceDetection(
	requiredPose: PoseType,
	frameSize: { width: number; height: number },
): UseFaceDetectionResult {
	const [faces, setFaces] = useState<DetectedFace[]>([]);
	const [validation, setValidation] = useState<FaceValidationResult | null>(
		null,
	);
	const [isDetecting, setIsDetecting] = useState(false);

	// Store last valid face bounds for cropping
	const lastFaceBounds = useRef<DetectedFace["bounds"] | null>(null);

	// Throttle detection to avoid performance issues
	const lastDetectionTime = useRef(0);
	const DETECTION_INTERVAL = 100; // Detect every 100ms

	/**
	 * Detect faces in frame and validate
	 */
	const detectFacesInFrame = useCallback(
		async (imagePath: string) => {
			const now = Date.now();

			// Throttle detection
			if (now - lastDetectionTime.current < DETECTION_INTERVAL) {
				return;
			}

			lastDetectionTime.current = now;
			setIsDetecting(true);

			try {
				// Detect faces using ML Kit
				const detectedFaces = await detectFaces(
					imagePath,
					DEFAULT_FACE_DETECTION_OPTIONS,
				);

				// Validate faces for current pose
				const validationResult = validateFaceForCapture(
					detectedFaces,
					requiredPose,
					frameSize,
				);

				// Store last valid face bounds
				if (
					detectedFaces.length === 1 &&
					validationResult.faceDetected
				) {
					lastFaceBounds.current = detectedFaces[0].bounds;
				}

				// Update state
				setFaces(detectedFaces);
				setValidation(validationResult);
			} catch (error) {
				console.error("Face detection error:", error);
				setFaces([]);
				setValidation(null);
			} finally {
				setIsDetecting(false);
			}
		},
		[requiredPose, frameSize],
	);

	return {
		faces,
		validation,
		isDetecting,
		lastFaceBounds: lastFaceBounds.current,
		detectFacesInFrame,
	};
}
