import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import colors from "@/constants/colors";

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
		gap: 8,
	},
	containerVertical: {
		flexDirection: "column",
		alignItems: "center",
		gap: 8,
	},
	text: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
});

export default LoadingSpinner;
