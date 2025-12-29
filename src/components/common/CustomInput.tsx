import React from "react";
import {
	TextInput,
	StyleSheet,
	TextInputProps,
	ViewStyle,
	View,
	Text,
} from "react-native";
import { neutral } from "@/constants/colors";
import { semantic } from "@/constants";
import { componentSizes, typography, spacingScale, borderRadius } from "@/constants/responsive";
import { spacing, fontSize } from "@/utils/responsive";

interface CustomInputProps extends TextInputProps {
	isActive?: boolean;
	containerStyle?: ViewStyle;
	error?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
	isActive = false,
	containerStyle,
	style,
	error,
	placeholderTextColor = neutral.neutral4,
	...textInputProps
}) => {
	return (
		<View style={containerStyle}>
			<TextInput
				style={[
					styles.input,
					isActive && styles.inputActive,
					error && styles.inputError,
					style,
				]}
				placeholderTextColor={placeholderTextColor}
				{...textInputProps}
			/>
			{error && <Text style={styles.errorText}>{error}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	input: {
		height: componentSizes.inputHeight,
		borderWidth: 1,
		borderColor: neutral.neutral4,
		borderRadius: borderRadius.lg,
		paddingHorizontal: spacingScale.md,
		fontSize: typography.bodySmall,
		fontWeight: "500",
		color: neutral.neutral1,
		backgroundColor: neutral.neutral6,
	},
	inputActive: {
		borderColor: neutral.neutral1,
		borderWidth: 1,
	},
	inputError: {
		borderColor: "#EF4444",
		borderWidth: 1,
	},
	errorText: {
		fontSize: typography.caption,
		color: "#EF4444",
		marginTop: spacing(4),
		marginLeft: spacing(4),
		fontFamily: "Poppins",
	},
});

export default CustomInput;
