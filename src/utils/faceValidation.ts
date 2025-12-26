import { DetectedFace } from "./faceDetection";

export type PoseType = "left" | "right" | "closed_eyes" | "normal";

export interface FaceValidationResult {
	isValid: boolean;
	feedback: string;
	faceDetected: boolean;
	poseCorrect: boolean;
	sizeValid: boolean;
	positionValid: boolean;
}

/**
 * Check if face is in left pose (turned left 20-60 degrees)
 */
export function isLeftPose(face: DetectedFace): boolean {
	const headYaw = face.headEulerAngleY || 0;

	return (
		headYaw > 20 && // Face rotated 20-60° to the left
		headYaw < 60 &&
		Math.abs(face.headEulerAngleX || 0) < 15 && // Not tilting up/down
		Math.abs(face.headEulerAngleZ || 0) < 15 // Not rolling
	);
}

/**
 * Check if face is in right pose (turned right 20-60 degrees)
 */
export function isRightPose(face: DetectedFace): boolean {
	const headYaw = face.headEulerAngleY || 0;

	return (
		headYaw < -20 && // Face rotated 20-60° to the right
		headYaw > -60 &&
		Math.abs(face.headEulerAngleX || 0) < 15 &&
		Math.abs(face.headEulerAngleZ || 0) < 15
	);
}

/**
 * Check if eyes are closed
 */
export function isClosedEyes(face: DetectedFace): boolean {
	const leftEyeClosed = (face.leftEyeOpenProbability || 0) < 0.2;
	const rightEyeClosed = (face.rightEyeOpenProbability || 0) < 0.2;

	return (
		leftEyeClosed &&
		rightEyeClosed &&
		Math.abs(face.headEulerAngleY || 0) < 15 // Facing forward
	);
}

/**
 * Check if face is in normal frontal pose with eyes open
 */
export function isNormalPose(face: DetectedFace): boolean {
	const leftEyeOpen = (face.leftEyeOpenProbability || 0) > 0.8;
	const rightEyeOpen = (face.rightEyeOpenProbability || 0) > 0.8;

	return (
		leftEyeOpen &&
		rightEyeOpen &&
		Math.abs(face.headEulerAngleY || 0) < 15 && // Facing forward
		Math.abs(face.headEulerAngleX || 0) < 15 &&
		Math.abs(face.headEulerAngleZ || 0) < 15
	);
}

/**
 * Check if face is the correct pose for the current step
 */
export function isPoseCorrect(
	face: DetectedFace,
	requiredPose: PoseType,
): boolean {
	switch (requiredPose) {
		case "left":
			return isLeftPose(face);
		case "right":
			return isRightPose(face);
		case "closed_eyes":
			return isClosedEyes(face);
		case "normal":
			return isNormalPose(face);
		default:
			return false;
	}
}

/**
 * Check if face size is valid (occupies 20-80% of frame)
 */
export function isFaceSizeValid(
	face: DetectedFace,
	frameSize: { width: number; height: number },
): boolean {
	const faceArea = face.bounds.width * face.bounds.height;
	const frameArea = frameSize.width * frameSize.height;
	const faceRatio = faceArea / frameArea;

	// Face should occupy 20-80% of frame
	return faceRatio > 0.2 && faceRatio < 0.8;
}

/**
 * Check if face is centered in frame (within 30% of center)
 */
export function isFacePositionValid(
	face: DetectedFace,
	frameSize: { width: number; height: number },
): boolean {
	const faceCenterX = face.bounds.x + face.bounds.width / 2;
	const faceCenterY = face.bounds.y + face.bounds.height / 2;
	const frameCenterX = frameSize.width / 2;
	const frameCenterY = frameSize.height / 2;

	// Face center should be within 30% of frame center
	const xOffset = Math.abs(faceCenterX - frameCenterX) / frameSize.width;
	const yOffset = Math.abs(faceCenterY - frameCenterY) / frameSize.height;

	return xOffset < 0.3 && yOffset < 0.3;
}

/**
 * Get feedback message based on validation issues
 */
export function getValidationFeedback(
	faces: DetectedFace[],
	requiredPose: PoseType,
	frameSize: { width: number; height: number },
): string {
	// No face detected
	if (faces.length === 0) {
		return "Position your face in the frame";
	}

	// Multiple faces detected
	if (faces.length > 1) {
		return "Multiple faces detected - ensure only one person";
	}

	const face = faces[0];

	// Check face size
	if (!isFaceSizeValid(face, frameSize)) {
		const faceArea = face.bounds.width * face.bounds.height;
		const frameArea = frameSize.width * frameSize.height;
		const faceRatio = faceArea / frameArea;

		if (faceRatio < 0.2) {
			return "Move closer to the camera";
		} else {
			return "Move further from the camera";
		}
	}

	// Check face position
	if (!isFacePositionValid(face, frameSize)) {
		return "Center your face in the frame";
	}

	// Check pose
	if (!isPoseCorrect(face, requiredPose)) {
		switch (requiredPose) {
			case "left":
				return "Turn your face to the left";
			case "right":
				return "Turn your face to the right";
			case "closed_eyes":
				return "Close your eyes gently";
			case "normal":
				return "Look straight at the camera with eyes open";
			default:
				return "Follow the pose instruction";
		}
	}

	// All validations passed
	return "Hold steady...";
}

/**
 * Validate face for capture
 * Returns comprehensive validation result
 */
export function validateFaceForCapture(
	faces: DetectedFace[],
	requiredPose: PoseType,
	frameSize: { width: number; height: number },
): FaceValidationResult {
	// No face detected
	if (faces.length === 0) {
		return {
			isValid: false,
			feedback: "Position your face in the frame",
			faceDetected: false,
			poseCorrect: false,
			sizeValid: false,
			positionValid: false,
		};
	}

	// Multiple faces detected
	if (faces.length > 1) {
		return {
			isValid: false,
			feedback: "Multiple faces detected - ensure only one person",
			faceDetected: true,
			poseCorrect: false,
			sizeValid: false,
			positionValid: false,
		};
	}

	const face = faces[0];
	const sizeValid = isFaceSizeValid(face, frameSize);
	const positionValid = isFacePositionValid(face, frameSize);
	const poseCorrect = isPoseCorrect(face, requiredPose);

	const isValid = sizeValid && positionValid && poseCorrect;
	const feedback = getValidationFeedback(faces, requiredPose, frameSize);

	return {
		isValid,
		feedback,
		faceDetected: true,
		poseCorrect,
		sizeValid,
		positionValid,
	};
}
