import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { DetectedFace } from "@/utils/faceDetection";
import { neutral, primary } from "@/constants";
import { scale } from "@/utils/responsive";

export interface FaceOverlayProps {
	faces: DetectedFace[];
	isValid: boolean;
	frameSize: { width: number; height: number };
	displaySize: { width: number; height: number };
}

/**
 * Overlay component to visualize detected faces with bounds and landmarks
 */
export const FaceOverlay: React.FC<FaceOverlayProps> = ({
	faces,
	isValid,
	frameSize,
	displaySize,
}) => {
	// Scale coordinates from frame to display
	const scaleX = displaySize.width / frameSize.width;
	const scaleY = displaySize.height / frameSize.height;

	const scaleBounds = (bounds: DetectedFace["bounds"]) => ({
		x: bounds.x * scaleX,
		y: bounds.y * scaleY,
		width: bounds.width * scaleX,
		height: bounds.height * scaleY,
	});

	const scalePoint = (point: { x: number; y: number }) => ({
		x: point.x * scaleX,
		y: point.y * scaleY,
	});

	// Colors based on validation state
	const boundColor = isValid
		? "rgba(0, 255, 0, 0.7)"
		: "rgba(255, 0, 0, 0.7)";
	const landmarkColor = isValid ? primary.primary1 : "#FF6B6B";

	return (
		<View style={StyleSheet.absoluteFill} pointerEvents="none">
			<Svg
				width={displaySize.width}
				height={displaySize.height}
				style={StyleSheet.absoluteFill}>
				{faces.map((face, index) => {
					const bounds = scaleBounds(face.bounds);

					return (
						<React.Fragment key={index}>
							{/* Face bounds rectangle */}
							<Rect
								x={bounds.x}
								y={bounds.y}
								width={bounds.width}
								height={bounds.height}
								stroke={boundColor}
								strokeWidth={scale(3)}
								fill="transparent"
								rx={scale(8)}
							/>

							{/* Eye landmarks */}
							{face.landmarks?.leftEye && (
								<Circle
									cx={scalePoint(face.landmarks.leftEye).x}
									cy={scalePoint(face.landmarks.leftEye).y}
									r={scale(4)}
									fill={landmarkColor}
								/>
							)}
							{face.landmarks?.rightEye && (
								<Circle
									cx={scalePoint(face.landmarks.rightEye).x}
									cy={scalePoint(face.landmarks.rightEye).y}
									r={scale(4)}
									fill={landmarkColor}
								/>
							)}

							{/* Nose landmark */}
							{face.landmarks?.noseBase && (
								<Circle
									cx={scalePoint(face.landmarks.noseBase).x}
									cy={scalePoint(face.landmarks.noseBase).y}
									r={scale(3)}
									fill={landmarkColor}
								/>
							)}

							{/* Mouth landmarks */}
							{face.landmarks?.leftMouth && (
								<Circle
									cx={scalePoint(face.landmarks.leftMouth).x}
									cy={scalePoint(face.landmarks.leftMouth).y}
									r={scale(3)}
									fill={landmarkColor}
								/>
							)}
							{face.landmarks?.rightMouth && (
								<Circle
									cx={scalePoint(face.landmarks.rightMouth).x}
									cy={scalePoint(face.landmarks.rightMouth).y}
									r={scale(3)}
									fill={landmarkColor}
								/>
							)}
						</React.Fragment>
					);
				})}
			</Svg>
		</View>
	);
};
