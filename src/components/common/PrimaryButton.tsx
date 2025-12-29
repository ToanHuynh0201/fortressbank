import React from "react";
import {
	Pressable,
	Text,
	StyleSheet,
	PressableProps,
	ViewStyle,
	TextStyle,
	View,
	ActivityIndicator,
} from "react-native";
import { primary, neutral } from "@/constants/colors";
import { componentSizes, typography, spacingScale, borderRadius } from "@/constants/responsive";
import { spacing } from "@/utils/responsive";

interface PrimaryButtonProps extends Omit<PressableProps, "style"> {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	loading?: boolean;
	loadingText?: string;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
	title,
	onPress,
	disabled = false,
	loading = false,
	loadingText,
	style,
	textStyle,
	...pressableProps
}) => {
	const isDisabled = disabled || loading;
	const displayText = loading && loadingText ? loadingText : title;

	return (
		<Pressable
			style={[styles.button, isDisabled && styles.buttonDisabled, style]}
			onPress={onPress}
			disabled={isDisabled}
			{...pressableProps}>
			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator
						size="small"
						color={neutral.neutral6}
					/>
					<Text
						style={[
							styles.buttonText,
							isDisabled && styles.buttonTextDisabled,
							textStyle,
						]}>
						{displayText}
					</Text>
				</View>
			) : (
				<Text
					style={[
						styles.buttonText,
						isDisabled && styles.buttonTextDisabled,
						textStyle,
					]}>
					{title}
				</Text>
			)}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		height: componentSizes.buttonHeight,
		backgroundColor: primary.primary1,
		borderRadius: borderRadius.lg,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: spacingScale.xl,
	},
	buttonDisabled: {
		backgroundColor: primary.primary4,
	},
	buttonText: {
		fontSize: typography.button,
		fontWeight: "600",
		color: neutral.neutral6,
		fontFamily: "Poppins",
	},
	buttonTextDisabled: {
		color: neutral.neutral6,
	},
	loadingContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacingScale.sm,
	},
});

export default PrimaryButton;
