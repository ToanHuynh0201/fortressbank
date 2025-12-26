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
 * Check if face is in left pose (turned left 10-70 degrees)
 * INVERTED: Negative yaw = left turn (due to front camera mirroring)
 */
export function isLeftPose(face: DetectedFace): boolean {
	const headYaw = face.headEulerAngleY || 0;
	const headPitch = face.headEulerAngleX || 0;
	const headRoll = face.headEulerAngleZ || 0;

	// INVERTED: Front camera makes negative yaw = turn left
	const isValid =
		headYaw < -10 && // Face rotated left (negative yaw)
		headYaw > -70 &&
		Math.abs(headPitch) < 25 &&
		Math.abs(headRoll) < 25;

	return isValid;
}

/**
 * Check if face is in right pose (turned right 10-70 degrees)
 * INVERTED: Positive yaw = right turn (due to front camera mirroring)
 */
export function isRightPose(face: DetectedFace): boolean {
	const headYaw = face.headEulerAngleY || 0;
	const headPitch = face.headEulerAngleX || 0;
	const headRoll = face.headEulerAngleZ || 0;

	// INVERTED: Front camera makes positive yaw = turn right
	const isValid =
		headYaw > 10 && // Face rotated right (positive yaw)
		headYaw < 70 &&
		Math.abs(headPitch) < 25 &&
		Math.abs(headRoll) < 25;

	return isValid;
}

/**
 * Check if eyes are closed
 * Relaxed threshold for easier detection
 */
export function isClosedEyes(face: DetectedFace): boolean {
	const leftEyeClosed = (face.leftEyeOpenProbability || 0) < 0.3; // Relaxed from 0.2
	const rightEyeClosed = (face.rightEyeOpenProbability || 0) < 0.3; // Relaxed from 0.2
	const headYaw = face.headEulerAngleY || 0;

	const isValid =
		leftEyeClosed &&
		rightEyeClosed &&
		Math.abs(headYaw) < 20; // Facing forward (relaxed from 15)

	return isValid;
}

/**
 * Check if face is in normal frontal pose with eyes open
 * Relaxed thresholds for easier detection
 */
export function isNormalPose(face: DetectedFace): boolean {
	const leftEyeOpen = (face.leftEyeOpenProbability || 0) > 0.7; // Relaxed from 0.8
	const rightEyeOpen = (face.rightEyeOpenProbability || 0) > 0.7; // Relaxed from 0.8
	const headYaw = face.headEulerAngleY || 0;
	const headPitch = face.headEulerAngleX || 0;
	const headRoll = face.headEulerAngleZ || 0;

	const isValid =
		leftEyeOpen &&
		rightEyeOpen &&
		Math.abs(headYaw) < 20 && // Facing forward (relaxed from 15)
		Math.abs(headPitch) < 20 &&
		Math.abs(headRoll) < 20;

	return isValid;
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
 * Check if face size is valid (occupies 15-95% of frame)
 * Relaxed for better detection tolerance
 */
export function isFaceSizeValid(
	face: DetectedFace,
	frameSize: { width: number; height: number },
): boolean {
	const faceArea = face.bounds.width * face.bounds.height;
	const frameArea = frameSize.width * frameSize.height;
	const faceRatio = faceArea / frameArea;

	// Face should occupy 15-95% of frame (relaxed from 20-80%)
	return faceRatio > 0.15 && faceRatio < 0.95;
}

/**
 * Check if face is centered in frame (within 40% of center)
 * Relaxed for better detection tolerance
 */
export function isFacePositionValid(
	face: DetectedFace,
	frameSize: { width: number; height: number },
): boolean {
	const faceCenterX = face.bounds.x + face.bounds.width / 2;
	const faceCenterY = face.bounds.y + face.bounds.height / 2;
	const frameCenterX = frameSize.width / 2;
	const frameCenterY = frameSize.height / 2;

	// Face center should be within 40% of frame center (relaxed from 30%)
	const xOffset = Math.abs(faceCenterX - frameCenterX) / frameSize.width;
	const yOffset = Math.abs(faceCenterY - frameCenterY) / frameSize.height;

	return xOffset < 0.4 && yOffset < 0.4;
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

		if (faceRatio < 0.15) {
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
