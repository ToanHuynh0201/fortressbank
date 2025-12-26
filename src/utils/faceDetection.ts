import FaceDetection, { Face } from "@react-native-ml-kit/face-detection";

export interface DetectedFace {
	bounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	landmarks?: {
		leftEye?: { x: number; y: number };
		rightEye?: { x: number; y: number };
		noseBase?: { x: number; y: number };
		leftCheek?: { x: number; y: number };
		rightCheek?: { x: number; y: number };
		leftMouth?: { x: number; y: number };
		rightMouth?: { x: number; y: number };
	};
	headEulerAngleY?: number; // Yaw (left/right rotation)
	headEulerAngleZ?: number; // Roll (tilt)
	headEulerAngleX?: number; // Pitch (up/down)
	leftEyeOpenProbability?: number;
	rightEyeOpenProbability?: number;
	smilingProbability?: number;
	trackingId?: number;
}

export interface FaceDetectionOptions {
	performanceMode?: "accurate" | "fast";
	landmarkMode?: "all" | "none";
	contourMode?: "all" | "none";
	classificationMode?: "all" | "none";
	minFaceSize?: number;
	trackingEnabled?: boolean;
}

/**
 * Default options for face detection
 * Optimized for real-time face validation and pose detection
 */
export const DEFAULT_FACE_DETECTION_OPTIONS: FaceDetectionOptions = {
	performanceMode: "fast",
	landmarkMode: "all",
	contourMode: "none",
	classificationMode: "all",
	minFaceSize: 0.1, // Face must be at least 10% of image (lowered to detect faces from further away)
	trackingEnabled: true,
};

/**
 * Initialize face detector with options
 */
export function getFaceDetectorOptions(
	options: FaceDetectionOptions = DEFAULT_FACE_DETECTION_OPTIONS,
): FaceDetectionOptions {
	return {
		...DEFAULT_FACE_DETECTION_OPTIONS,
		...options,
	};
}

/**
 * Parse ML Kit Face object to our simplified DetectedFace interface
 */
export function parseFace(face: Face): DetectedFace {
	const detectedFace: DetectedFace = {
		bounds: {
			x: face.frame.left,
			y: face.frame.top,
			width: face.frame.width,
			height: face.frame.height,
		},
		headEulerAngleY: face.rotationY,
		headEulerAngleZ: face.rotationZ,
		headEulerAngleX: face.rotationX,
		leftEyeOpenProbability: face.leftEyeOpenProbability,
		rightEyeOpenProbability: face.rightEyeOpenProbability,
		smilingProbability: face.smilingProbability,
		trackingId: face.trackingID,
	};

	// Parse landmarks if available
	if (face.landmarks) {
		detectedFace.landmarks = {};

		const leftEye = face.landmarks.leftEye;
		const rightEye = face.landmarks.rightEye;
		const noseBase = face.landmarks.noseBase;
		const leftCheek = face.landmarks.leftCheek;
		const rightCheek = face.landmarks.rightCheek;
		const leftMouth = face.landmarks.mouthLeft;
		const rightMouth = face.landmarks.mouthRight;

		if (leftEye) {
			detectedFace.landmarks.leftEye = {
				x: leftEye.position.x,
				y: leftEye.position.y,
			};
		}
		if (rightEye) {
			detectedFace.landmarks.rightEye = {
				x: rightEye.position.x,
				y: rightEye.position.y,
			};
		}
		if (noseBase) {
			detectedFace.landmarks.noseBase = {
				x: noseBase.position.x,
				y: noseBase.position.y,
			};
		}
		if (leftCheek) {
			detectedFace.landmarks.leftCheek = {
				x: leftCheek.position.x,
				y: leftCheek.position.y,
			};
		}
		if (rightCheek) {
			detectedFace.landmarks.rightCheek = {
				x: rightCheek.position.x,
				y: rightCheek.position.y,
			};
		}
		if (leftMouth) {
			detectedFace.landmarks.leftMouth = {
				x: leftMouth.position.x,
				y: leftMouth.position.y,
			};
		}
		if (rightMouth) {
			detectedFace.landmarks.rightMouth = {
				x: rightMouth.position.x,
				y: rightMouth.position.y,
			};
		}
	}

	return detectedFace;
}

/**
 * Detect faces in an image
 * @param imagePath - Path to the image file
 * @param options - Detection options
 * @returns Array of detected faces
 */
export async function detectFaces(
	imagePath: string,
	options: FaceDetectionOptions = DEFAULT_FACE_DETECTION_OPTIONS,
): Promise<DetectedFace[]> {
	try {
		const faces = await FaceDetection.detect(imagePath, options);
		return faces.map(parseFace);
	} catch (error) {
		console.error("❌ Face detection error:", error);
		return [];
	}
}
