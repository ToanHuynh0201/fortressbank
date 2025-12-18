import React from "react";
import { View, Text, Modal, ActivityIndicator, StyleSheet } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import colors from "@/constants/colors";

interface LoadingOverlayProps {
	visible: boolean;
	message?: string;
	transparent?: boolean;
	backgroundColor?: string;
	spinnerColor?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
	visible,
	message = "Loading...",
	transparent = true,
	backgroundColor = "rgba(0, 0, 0, 0.4)",
	spinnerColor = colors.primary.primary1,
}) => {
	return (
		<Modal
			visible={visible}
			transparent={transparent}
			animationType="fade"
			statusBarTranslucent>
			<View style={[styles.overlay, { backgroundColor }]}>
				<Animated.View
					entering={FadeIn.duration(300)}
					style={styles.content}>
					<View style={styles.spinnerContainer}>
						<ActivityIndicator
							size="large"
							color={spinnerColor}
							accessibilityLabel="Loading, please wait"
						/>
					</View>
					{message && (
						<Text style={styles.message}>{message}</Text>
					)}
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 20,
		padding: 32,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 8,
		minWidth: 200,
	},
	spinnerContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
	},
	message: {
		fontFamily: "Poppins",
		fontSize: 15,
		fontWeight: "500",
		color: colors.neutral.neutral1,
		marginTop: 16,
		textAlign: "center",
	},
});

export default LoadingOverlay;
