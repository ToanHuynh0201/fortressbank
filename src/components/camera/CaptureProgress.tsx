import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "phosphor-react-native";
import { neutral, primary } from "@/constants";
import { PoseType } from "@/utils/faceValidation";
import { scale, fontSize, spacing } from "@/utils/responsive";

const POSE_ORDER: PoseType[] = ["left", "right", "closed_eyes", "normal"];

export interface CaptureProgressProps {
	currentPoseIndex: number;
	completedPoses: Set<number>;
}

/**
 * Component to display capture progress
 */
export const CaptureProgress: React.FC<CaptureProgressProps> = ({
	currentPoseIndex,
	completedPoses,
}) => {
	return (
		<View style={styles.container}>
			<View style={styles.progressBar}>
				{POSE_ORDER.map((_, index) => {
					const isCompleted = completedPoses.has(index);
					const isCurrent = index === currentPoseIndex;

					return (
						<View
							key={index}
							style={[
								styles.progressDot,
								isCurrent && styles.progressDotCurrent,
								isCompleted && styles.progressDotCompleted,
							]}>
							{isCompleted && (
								<Check
									size={scale(8)}
									color={neutral.neutral6}
									weight="bold"
								/>
							)}
						</View>
					);
				})}
			</View>
			<Text style={styles.progressText}>
				{currentPoseIndex + 1} / {POSE_ORDER.length}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingTop: spacing(20),
		paddingHorizontal: spacing(24),
		alignItems: "center",
		marginBottom: spacing(20),
	},
	progressBar: {
		flexDirection: "row",
		gap: spacing(8),
		marginBottom: spacing(8),
	},
	progressDot: {
		width: scale(12),
		height: scale(12),
		borderRadius: scale(6),
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	progressDotCurrent: {
		backgroundColor: neutral.neutral6,
	},
	progressDotCompleted: {
		backgroundColor: primary.primary3,
	},
	progressText: {
		fontSize: fontSize(14),
		fontWeight: "600",
		color: neutral.neutral6,
		textShadowColor: "rgba(0, 0, 0, 0.5)",
		textShadowOffset: { width: 0, height: scale(1) },
		textShadowRadius: scale(3),
	},
});
