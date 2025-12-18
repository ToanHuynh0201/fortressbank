import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import colors from "@/constants/colors";

interface LoadingStateProps {
	message?: string;
	description?: string;
	minHeight?: number;
	containerStyle?: ViewStyle;
}

const LoadingState: React.FC<LoadingStateProps> = ({
	message = "Loading...",
	description,
	minHeight = 200,
	containerStyle,
}) => {
	return (
		<View style={[styles.container, { minHeight }, containerStyle]}>
			<Animated.View
				entering={FadeIn.duration(300)}
				style={styles.content}>
				<ActivityIndicator
					size={48}
					color={colors.primary.primary1}
					accessibilityLabel="Loading, please wait"
				/>
				<Text style={styles.message}>{message}</Text>
				{description && (
					<Animated.Text
						entering={FadeIn.duration(300).delay(100)}
						style={styles.description}>
						{description}
					</Animated.Text>
				)}
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		alignItems: "center",
		gap: 16,
	},
	message: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		textAlign: "center",
	},
	description: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		marginTop: 8,
	},
});

export default LoadingState;
