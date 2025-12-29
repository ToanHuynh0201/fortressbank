import React, { useState } from "react";
import {
	View,
	TextInput,
	Pressable,
	Text,
	StyleSheet,
	TextInputProps,
	ViewStyle,
} from "react-native";
import { neutral } from "@/constants/colors";
import { componentSizes, typography, spacingScale, borderRadius } from "@/constants/responsive";
import { spacing, fontSize, scale } from "@/utils/responsive";

interface PasswordInputProps extends TextInputProps {
	containerStyle?: ViewStyle;
	isActive?: boolean;
	error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
	containerStyle,
	isActive = false,
	error,
	style,
	placeholderTextColor = neutral.neutral4,
	...textInputProps
}) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<View style={containerStyle}>
			<View style={styles.container}>
				<TextInput
					style={[
						styles.input,
						isActive && styles.inputActive,
						error && styles.inputError,
						style,
					]}
					placeholderTextColor={placeholderTextColor}
					secureTextEntry={!showPassword}
					{...textInputProps}
				/>
				<Pressable
					style={styles.eyeIcon}
					onPress={() => setShowPassword(!showPassword)}>
					<Text style={styles.eyeIconText}>
						{showPassword ? "👁️" : "👁️‍🗨️"}
					</Text>
				</Pressable>
			</View>
			{error && <Text style={styles.errorText}>{error}</Text>}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: "relative",
	},
	input: {
		height: componentSizes.inputHeight,
		borderWidth: 1,
		borderColor: neutral.neutral4,
		borderRadius: borderRadius.lg,
		paddingHorizontal: spacingScale.md,
		paddingRight: spacingScale.xxxl,
		fontSize: typography.bodySmall,
		fontWeight: "500",
		color: neutral.neutral1,
		backgroundColor: neutral.neutral6,
	},
	inputActive: {
		borderColor: neutral.neutral1,
	},
	inputError: {
		borderColor: "#EF4444",
		borderWidth: 1,
	},
	eyeIcon: {
		position: "absolute",
		right: spacingScale.md,
		top: scale(14),
	},
	eyeIconText: {
		fontSize: fontSize(16),
	},
	errorText: {
		fontSize: typography.caption,
		color: "#EF4444",
		marginTop: spacing(4),
		marginLeft: spacing(4),
		fontFamily: "Poppins",
	},
});

export default PasswordInput;
