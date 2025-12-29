import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "expo-router";
import { primary, neutral, semantic } from "@/constants";
import { typography, spacingScale, borderRadius } from "@/constants/responsive";
import { scale } from "@/utils/responsive";

const NotificationToast = () => {
	const { toastVisible, currentToast, hideToast } = useNotifications();
	const router = useRouter();
	const slideAnim = useRef(new Animated.Value(-200)).current;

	useEffect(() => {
		if (toastVisible && currentToast) {
			// Slide in
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 50,
				friction: 8,
			}).start();
		} else {
			// Slide out
			Animated.timing(slideAnim, {
				toValue: -200,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}
	}, [toastVisible]);

	if (!toastVisible || !currentToast) return null;

	const getIconName = (): keyof typeof Ionicons.glyphMap => {
		switch (currentToast.type) {
			case "success":
				return "checkmark-circle";
			case "error":
				return "close-circle";
			case "warning":
				return "warning";
			case "info":
			default:
				return "information-circle";
		}
	};

	const getColors = () => {
		switch (currentToast.type) {
			case "success":
				return {
					bg: semantic.success,
					icon: semantic.success,
					text: neutral.neutral1,
				};
			case "error":
				return {
					bg: semantic.error,
					icon: semantic.error,
					text: neutral.neutral1,
				};
			case "warning":
				return {
					bg: semantic.warning,
					icon: semantic.warning,
					text: neutral.neutral1,
				};
			case "info":
			default:
				return {
					bg: primary.primary1,
					icon: primary.primary1,
					text: neutral.neutral1,
				};
		}
	};

	const colors = getColors();

	const handleToastPress = () => {
		hideToast();
		router.push("/(home)/notification");
	};

	return (
		<Animated.View
			style={[
				styles.container,
				{
					transform: [{ translateY: slideAnim }],
				},
			]}>
			<Pressable
				onPress={handleToastPress}
				style={styles.toast}>
				<View
					style={[
						styles.iconContainer,
						{ backgroundColor: colors.bg },
					]}>
					<Ionicons
						name={getIconName()}
						size={24}
						color={neutral.neutral6}
					/>
				</View>

				<View style={styles.content}>
					<Text
						style={styles.title}
						numberOfLines={1}>
						{currentToast.title}
					</Text>
					<Text
						style={styles.message}
						numberOfLines={2}>
						{currentToast.message}
					</Text>
					<Text style={styles.time}>Just now</Text>
				</View>

				<Pressable
					onPress={(e) => {
						e.stopPropagation();
						hideToast();
					}}
					style={styles.closeButton}>
					<Ionicons
						name="close"
						size={20}
						color={neutral.neutral2}
					/>
				</Pressable>
			</Pressable>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: scale(60),
		left: spacingScale.lg,
		right: spacingScale.lg,
		zIndex: 999,
		pointerEvents: "box-none",
	},
	toast: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacingScale.lg,
		borderRadius: borderRadius.lg,
		backgroundColor: neutral.neutral6,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
		pointerEvents: "auto",
	},
	iconContainer: {
		width: scale(48),
		height: scale(48),
		borderRadius: scale(24),
		alignItems: "center",
		justifyContent: "center",
		marginRight: spacingScale.md,
	},
	content: {
		flex: 1,
		marginRight: spacingScale.sm,
	},
	title: {
		fontSize: typography.body,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: spacingScale.xs,
	},
	message: {
		fontSize: typography.caption,
		fontWeight: "400",
		color: neutral.neutral2,
		lineHeight: 18,
		marginBottom: spacingScale.xs,
	},
	time: {
		fontSize: typography.tiny,
		fontWeight: "500",
		color: neutral.neutral3,
	},
	closeButton: {
		padding: spacingScale.xs,
		marginLeft: spacingScale.xs,
	},
});

export default NotificationToast;
