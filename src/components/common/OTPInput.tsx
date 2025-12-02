import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import colors from "@/constants/colors";

interface OTPInputProps {
	length?: number;
	onComplete?: (otp: string) => void;
	onChangeText?: (otp: string) => void;
}

/**
 * OTP Input Component
 * Displays individual boxes for each digit
 */
const OTPInput: React.FC<OTPInputProps> = ({
	length = 6,
	onComplete,
	onChangeText,
}) => {
	const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
	const [focusedIndex, setFocusedIndex] = useState<number>(0);
	const inputRefs = useRef<(TextInput | null)[]>([]);

	const handleChange = (text: string, index: number) => {
		// Only allow numbers
		if (text && !/^\d+$/.test(text)) return;

		const newOtp = [...otp];

		// Handle paste
		if (text.length > 1) {
			const pastedData = text.slice(0, length).split("");
			pastedData.forEach((char, i) => {
				if (index + i < length) {
					newOtp[index + i] = char;
				}
			});
			setOtp(newOtp);

			// Focus on next empty or last box
			const nextIndex = Math.min(index + pastedData.length, length - 1);
			inputRefs.current[nextIndex]?.focus();

			const otpString = newOtp.join("");
			onChangeText?.(otpString);
			if (otpString.length === length) {
				onComplete?.(otpString);
			}
			return;
		}

		// Handle single character
		newOtp[index] = text;
		setOtp(newOtp);

		// Move to next input
		if (text && index < length - 1) {
			inputRefs.current[index + 1]?.focus();
		}

		const otpString = newOtp.join("");
		onChangeText?.(otpString);
		if (otpString.length === length) {
			onComplete?.(otpString);
		}
	};

	const handleKeyPress = (e: any, index: number) => {
		if (e.nativeEvent.key === "Backspace") {
			if (!otp[index] && index > 0) {
				// Move to previous input if current is empty
				inputRefs.current[index - 1]?.focus();
			}

			const newOtp = [...otp];
			newOtp[index] = "";
			setOtp(newOtp);
			onChangeText?.(newOtp.join(""));
		}
	};

	const handleBoxPress = (index: number) => {
		inputRefs.current[index]?.focus();
	};

	return (
		<View style={styles.container}>
			{otp.map((digit, index) => (
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
		gap: 12,
	},
	box: {
		flex: 1,
		height: 56,
		borderWidth: 2,
		borderColor: colors.neutral.neutral4,
		borderRadius: 12,
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
		fontSize: 24,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		width: "100%",
		height: "100%",
		textAlign: "center",
	},
});

export default OTPInput;
