import React, { useEffect } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { neutral, primary } from "@/constants";
import { PoseType } from "@/utils/faceValidation";
import { scale, fontSize, spacing } from "@/utils/responsive";

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

export interface PoseGuidanceProps {
	currentPose: PoseType;
	feedback: string;
	isValid: boolean;
	countdown: number;
}

/**
 * Component to display pose guidance and feedback
 */
export const PoseGuidance: React.FC<PoseGuidanceProps> = ({
	currentPose,
	feedback,
	isValid,
	countdown,
}) => {
	const instruction = POSE_INSTRUCTIONS[currentPose];
	const scaleAnim = React.useRef(new Animated.Value(1)).current;
	const pulseAnim = React.useRef(new Animated.Value(1)).current;

	// Animate icon when valid
	useEffect(() => {
		if (isValid) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1.1,
						duration: 500,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 500,
						useNativeDriver: true,
					}),
				]),
			).start();
		} else {
			pulseAnim.setValue(1);
		}
	}, [isValid, pulseAnim]);

	// Show countdown
	const showCountdown = countdown > 0;

	return (
		<View style={styles.container}>
			{/* Pose Icon */}
			{!showCountdown && (
				<Animated.Text
					style={[
						styles.poseIcon,
						{
							color: isValid
								? primary.primary3
								: neutral.neutral6,
							transform: [{ scale: pulseAnim }],
						},
					]}>
					{instruction.icon}
				</Animated.Text>
			)}

			{/* Countdown */}
			{showCountdown && (
				<Animated.Text
					style={[
						styles.countdown,
						{ transform: [{ scale: scaleAnim }] },
					]}>
					{Math.ceil(countdown / 10)}
				</Animated.Text>
			)}

			{/* Instructions */}
			<Text
				style={[
					styles.title,
					isValid && styles.titleValid,
					showCountdown && styles.titleCountdown,
				]}>
				{showCountdown ? "Get ready..." : instruction.title}
			</Text>

			{/* Feedback */}
			<Text
				style={[styles.feedback, isValid && styles.feedbackValid]}>
				{showCountdown ? "Capturing..." : feedback}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: spacing(24),
		alignItems: "center",
		marginBottom: spacing(20),
	},
	poseIcon: {
		fontSize: fontSize(60),
		color: neutral.neutral6,
		marginBottom: spacing(12),
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: scale(2) },
		textShadowRadius: scale(4),
	},
	countdown: {
		fontSize: fontSize(72),
		fontWeight: "bold",
		color: primary.primary3,
		marginBottom: spacing(12),
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: scale(2) },
		textShadowRadius: scale(4),
	},
	title: {
		fontSize: fontSize(18),
		fontWeight: "700",
		color: neutral.neutral6,
		textAlign: "center",
		marginBottom: spacing(8),
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: scale(1) },
		textShadowRadius: scale(3),
	},
	titleValid: {
		color: primary.primary3,
	},
	titleCountdown: {
		color: primary.primary3,
	},
	feedback: {
		fontSize: fontSize(14),
		fontWeight: "500",
		color: neutral.neutral5,
		textAlign: "center",
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: scale(1) },
		textShadowRadius: scale(3),
	},
	feedbackValid: {
		color: primary.primary3,
	},
});
