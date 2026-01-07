import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import colors from "@/constants/colors";
import { scale, fontSize, spacing } from "@/utils/responsive";
import {
	typography,
	spacingScale,
	borderRadius,
	componentSizes,
} from "@/constants/responsive";

interface PINInputProps {
	length?: number;
	onComplete?: (pin: string) => void;
	onChangeText?: (pin: string) => void;
	secureTextEntry?: boolean;
}

/**
 * PIN Input Component
 * Displays individual boxes for each digit with secure entry option
 */
const PINInput: React.FC<PINInputProps> = ({
	length = 6,
	onComplete,
	onChangeText,
	secureTextEntry = true,
}) => {
	const [pin, setPin] = useState<string[]>(new Array(length).fill(""));
	const [focusedIndex, setFocusedIndex] = useState<number>(0);
	const inputRefs = useRef<(TextInput | null)[]>([]);

	const handleChange = (text: string, index: number) => {
		// Only allow numbers
		if (text && !/^\d+$/.test(text)) return;

		const newPin = [...pin];

		// Handle paste
		if (text.length > 1) {
			const pastedData = text.slice(0, length).split("");
			pastedData.forEach((char, i) => {
				if (index + i < length) {
					newPin[index + i] = char;
				}
			});
			setPin(newPin);

			// Focus on next empty or last box
			const nextIndex = Math.min(index + pastedData.length, length - 1);
			inputRefs.current[nextIndex]?.focus();

			const pinString = newPin.join("");
			onChangeText?.(pinString);
			if (pinString.length === length) {
				onComplete?.(pinString);
			}
			return;
		}

		// Handle single character
		newPin[index] = text;
		setPin(newPin);

		// Move to next input
		if (text && index < length - 1) {
			inputRefs.current[index + 1]?.focus();
		}

		const pinString = newPin.join("");
		onChangeText?.(pinString);
		if (pinString.length === length) {
			onComplete?.(pinString);
		}
	};

	const handleKeyPress = (e: any, index: number) => {
		if (e.nativeEvent.key === "Backspace") {
			if (!pin[index] && index > 0) {
				// Move to previous input if current is empty
				inputRefs.current[index - 1]?.focus();
			}

			const newPin = [...pin];
			newPin[index] = "";
			setPin(newPin);
			onChangeText?.(newPin.join(""));
		}
	};

	const handleBoxPress = (index: number) => {
		inputRefs.current[index]?.focus();
	};

	return (
		<View style={styles.container}>
			{pin.map((digit, index) => (
				<Pressable
					key={index}
					onPress={() => handleBoxPress(index)}
					style={[
						styles.box,
						focusedIndex === index && styles.boxFocused,
						digit && styles.boxFilled,
					]}>
					<TextInput
						ref={(ref) => {
							inputRefs.current[index] = ref;
						}}
						style={styles.input}
						keyboardType="number-pad"
						maxLength={1}
						value={digit}
						onChangeText={(text) => handleChange(text, index)}
						onKeyPress={(e) => handleKeyPress(e, index)}
						onFocus={() => setFocusedIndex(index)}
						selectTextOnFocus
						textAlign="center"
					/>
				</Pressable>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: spacingScale.md,
	},
	box: {
		flex: 1,
		height: scale(56),
		borderWidth: 2,
		borderColor: colors.neutral.neutral4,
		borderRadius: borderRadius.md,
		backgroundColor: colors.neutral.neutral6,
		justifyContent: "center",
		alignItems: "center",
	},
	boxFocused: {
		borderColor: colors.primary.primary1,
		backgroundColor: colors.primary.primary4,
	},
	boxFilled: {
		borderColor: colors.primary.primary1,
	},
	input: {
		fontFamily: "Poppins",
		fontSize: typography.h2,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		width: "100%",
		height: "100%",
		textAlign: "center",
	},
});

export default PINInput;
