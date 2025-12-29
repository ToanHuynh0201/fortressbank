import React from "react";
import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "phosphor-react-native";
import { neutral, primary } from "@/constants/colors";
import { typography, spacingScale, borderRadius } from "@/constants/responsive";
import { scale } from "@/utils/responsive";

interface AppHeaderProps {
	title: string;
	onBack?: () => void;
	showBackButton?: boolean;
	backgroundColor?: string;
	textColor?: string;
	containerStyle?: ViewStyle;
}

const AppHeader: React.FC<AppHeaderProps> = ({
	title,
	onBack,
	showBackButton = true,
	backgroundColor = primary.primary1,
	textColor = neutral.neutral6,
	containerStyle,
}) => {
	const router = useRouter();

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else if (router.canGoBack()) {
			router.back();
		}
	};

	return (
		<View style={[styles.header, { backgroundColor }, containerStyle]}>
			<View style={styles.headerContent}>
				{showBackButton ? (
					<Pressable
						style={styles.backButton}
						onPress={handleBack}
						android_ripple={{
							color: "rgba(255, 255, 255, 0.1)",
							radius: scale(24),
						}}>
						<View style={styles.backButtonInner}>
							<ArrowLeft
								size={scale(24)}
								color={textColor}
								weight="regular"
							/>
						</View>
					</Pressable>
				) : (
					<View style={styles.backButtonPlaceholder} />
				)}
				<View style={styles.titleContainer}>
					<Text
						style={[styles.headerTitle, { color: textColor }]}
						numberOfLines={1}>
						{title}
					</Text>
				</View>
				<View style={styles.rightPlaceholder} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		paddingTop: spacingScale.xl,
		paddingHorizontal: spacingScale.xl,
		paddingBottom: spacingScale.xl,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(2) },
		shadowOpacity: 0.1,
		shadowRadius: scale(4),
		elevation: 3,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	backButton: {
		borderRadius: borderRadius.md,
		overflow: "hidden",
	},
	backButtonInner: {
		width: scale(44),
		height: scale(44),
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: borderRadius.md,
	},
	backButtonPlaceholder: {
		width: scale(44),
		height: scale(44),
	},
	titleContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: spacingScale.lg,
	},
	headerTitle: {
		fontSize: typography.title,
		fontFamily: "Poppins",
		fontWeight: "900",
		lineHeight: scale(24),
		textAlign: "center",
	},
	rightPlaceholder: {
		width: scale(44),
		height: scale(44),
	},
});

export default AppHeader;
