import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import colors from "@/constants/colors";
import { typography, spacingScale } from "@/constants/responsive";

interface LoadingSpinnerProps {
	size?: number | "small" | "large";
	color?: string;
	text?: string;
	textStyle?: TextStyle;
	containerStyle?: ViewStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = 24,
	color = colors.primary.primary1,
	text,
	textStyle,
	containerStyle,
}) => {
	return (
		<Animated.View
			entering={FadeIn.duration(200)}
			style={[
				text ? styles.containerVertical : styles.containerHorizontal,
				containerStyle,
			]}>
			<ActivityIndicator
				size={size}
				color={color}
				accessibilityLabel="Loading, please wait"
			/>
			{text && (
				<Text style={[styles.text, textStyle]}>{text}</Text>
			)}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	containerHorizontal: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacingScale.sm,
	},
	containerVertical: {
		flexDirection: "column",
		alignItems: "center",
		gap: spacingScale.sm,
	},
	text: {
		fontFamily: "Poppins",
		fontSize: typography.caption,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
});

export default LoadingSpinner;
