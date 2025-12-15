import React from "react";
import {
	Pressable,
	Text,
	StyleSheet,
	PressableProps,
	ViewStyle,
	TextStyle,
} from "react-native";
import { primary, neutral } from "@/constants/colors";

interface PrimaryButtonProps extends Omit<PressableProps, "style"> {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
	title,
	onPress,
	disabled = false,
	style,
	textStyle,
	...pressableProps
}) => {
	return (
		<Pressable
			style={[styles.button, disabled && styles.buttonDisabled, style]}
			onPress={onPress}
			disabled={disabled}
			{...pressableProps}>
			<Text
				style={[
					styles.buttonText,
					disabled && styles.buttonTextDisabled,
					textStyle,
				]}>
				{title}
			</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		height: 48,
		backgroundColor: primary.primary1,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	buttonDisabled: {
		backgroundColor: primary.primary4,
	},
	buttonText: {
		fontSize: 15,
		fontWeight: "600",
		color: neutral.neutral6,
		fontFamily: "Poppins",
	},
	buttonTextDisabled: {
		color: neutral.neutral6,
	},
});

export default PrimaryButton;
