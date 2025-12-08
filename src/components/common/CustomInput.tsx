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
		height: 44,
		borderWidth: 1,
		borderColor: neutral.neutral4,
		borderRadius: 15,
		paddingHorizontal: 12,
		fontSize: 14,
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
		fontSize: 12,
		color: "#EF4444",
		marginTop: 4,
		marginLeft: 4,
		fontFamily: "Poppins",
	},
});

export default CustomInput;
