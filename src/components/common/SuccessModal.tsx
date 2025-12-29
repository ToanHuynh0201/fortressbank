import React, { useEffect } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	withSequence,
	withDelay,
	Easing,
} from "react-native-reanimated";
import { CheckCircle } from "phosphor-react-native";
import { neutral, primary } from "@/constants/colors";
import { scale } from "@/utils/responsive";
import { typography, spacingScale, borderRadius, componentSizes } from "@/constants/responsive";
import PrimaryButton from "./PrimaryButton";

interface SuccessModalProps {
	visible: boolean;
	title: string;
	subtitle?: string;
	details: Array<{ label: string; value: string }>;
	buttonText?: string;
	onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
	visible,
	title,
	subtitle,
	details,
	buttonText = "Done",
	onClose,
}) => {
	// Animation values
	const overlayOpacity = useSharedValue(0);
	const contentScale = useSharedValue(0.9);
	const contentOpacity = useSharedValue(0);
	const checkmarkScale = useSharedValue(0);

	useEffect(() => {
		if (visible) {
			// Overlay fade in
			overlayOpacity.value = withTiming(1, {
				duration: 300,
				easing: Easing.out(Easing.ease),
			});

			// Content card scale and fade in
			contentOpacity.value = withTiming(1, {
				duration: 400,
				easing: Easing.out(Easing.ease),
			});
			contentScale.value = withSpring(1, {
				damping: 20,
				stiffness: 90,
			});

			// Checkmark bounce animation with delay
			checkmarkScale.value = withDelay(
				200,
				withSequence(
					withSpring(1.3, { damping: 6, stiffness: 120 }),
					withSpring(1, { damping: 10, stiffness: 140 }),
				),
			);
		} else {
			// Reset animations when modal closes
			overlayOpacity.value = 0;
			contentScale.value = 0.9;
			contentOpacity.value = 0;
			checkmarkScale.value = 0;
		}
	}, [visible]);

	const overlayAnimatedStyle = useAnimatedStyle(() => ({
		opacity: overlayOpacity.value,
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ scale: contentScale.value }],
	}));

	const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: checkmarkScale.value }],
	}));

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={onClose}>
			<Animated.View style={[styles.modalOverlay, overlayAnimatedStyle]}>
				<Pressable
					style={styles.overlayPressable}
					onPress={onClose}>
					<Pressable onPress={(e) => e.stopPropagation()}>
						<Animated.View
							style={[styles.modalContent, contentAnimatedStyle]}>
							{/* Success Icon */}
							<View style={styles.iconContainer}>
								<Animated.View style={checkmarkAnimatedStyle}>
									<CheckCircle
										size={scale(64)}
										color="#40C957"
										weight="fill"
									/>
								</Animated.View>
							</View>

							{/* Title */}
							<Text style={styles.modalTitle}>{title}</Text>

							{/* Subtitle */}
							{subtitle && (
								<Text style={styles.modalSubtitle}>
									{subtitle}
								</Text>
							)}

							{/* Details Card */}
							<View style={styles.detailsCard}>
								{details.map((detail, index) => (
									<View
										key={index}
										style={[
											styles.detailRow,
											index < details.length - 1 &&
												styles.detailRowBorder,
										]}>
										<Text style={styles.detailLabel}>
											{detail.label}
										</Text>
										<Text style={styles.detailValue}>
											{detail.value}
										</Text>
									</View>
								))}
							</View>

							{/* Button */}
							<PrimaryButton
								title={buttonText}
								onPress={onClose}
								style={styles.button}
							/>
						</Animated.View>
					</Pressable>
				</Pressable>
			</Animated.View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: spacingScale.sm,
	},
	overlayPressable: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	modalContent: {
		backgroundColor: neutral.neutral6,
		borderRadius: borderRadius.xl,
		width: "100%",
		maxWidth: scale(400),
		padding: spacingScale.xl,
		alignItems: "center",
	},
	iconContainer: {
		marginBottom: spacingScale.md,
	},
	modalTitle: {
		fontSize: typography.h2,
		fontWeight: "700",
		color: neutral.neutral1,
		textAlign: "center",
		marginBottom: spacingScale.xs + 2,
		fontFamily: "Poppins",
	},
	modalSubtitle: {
		fontSize: typography.caption + 1,
		fontWeight: "400",
		color: neutral.neutral3,
		textAlign: "center",
		lineHeight: spacingScale.lg + 2,
		marginBottom: spacingScale.lg + 4,
		fontFamily: "Poppins",
		paddingHorizontal: spacingScale.sm,
	},
	detailsCard: {
		width: "100%",
		backgroundColor: neutral.neutral5,
		borderRadius: borderRadius.md,
		paddingHorizontal: spacingScale.lg,
		paddingVertical: spacingScale.lg,
		marginBottom: spacingScale.lg + 4,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: spacingScale.md,
		paddingHorizontal: spacingScale.xs,
		minHeight: componentSizes.inputHeight,
	},
	detailRowBorder: {
		borderBottomWidth: 1,
		borderBottomColor: "rgba(74, 63, 219, 0.1)",
	},
	detailLabel: {
		fontSize: typography.caption + 1,
		fontWeight: "500",
		color: neutral.neutral2,
		fontFamily: "Poppins",
		flexShrink: 1,
		marginRight: spacingScale.md,
	},
	detailValue: {
		fontSize: typography.bodySmall,
		fontWeight: "600",
		color: neutral.neutral1,
		fontFamily: "Poppins",
		flexShrink: 0,
	},
	button: {
		width: "100%",
		marginTop: spacingScale.xs,
	},
});

export default SuccessModal;
