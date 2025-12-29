import React, { ReactNode } from "react";
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	ViewStyle,
} from "react-native";
import { primary, neutral } from "@/constants/colors";
import { spacingScale, borderRadius } from "@/constants/responsive";
import AppHeader from "../common/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuthLayoutProps {
	children: ReactNode;
	title: string;
	showBackButton?: boolean;
	onBack?: () => void;
	headerBackgroundColor?: string;
	contentBackgroundColor?: string;
	containerStyle?: ViewStyle;
	contentContainerStyle?: ViewStyle;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
	children,
	title,
	showBackButton = true,
	onBack,
	headerBackgroundColor = primary.primary1,
	contentBackgroundColor = neutral.neutral6,
	contentContainerStyle,
}) => {
	return (
		<SafeAreaView
			style={styles.container}
			edges={["top"]}>
			<AppHeader
				title={title}
				showBackButton={showBackButton}
				onBack={onBack}
				backgroundColor={headerBackgroundColor}
				textColor={neutral.neutral6}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.flex}>
				<ScrollView
					style={[
						styles.content,
						{ backgroundColor: contentBackgroundColor },
					]}
					contentContainerStyle={[
						styles.contentContainer,
						contentContainerStyle,
					]}
					showsVerticalScrollIndicator={false}>
					{children}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primary.primary1,
	},
	flex: {
		flex: 1,
	},
	content: {
		flex: 1,
		borderTopLeftRadius: borderRadius.xxl,
		borderTopRightRadius: borderRadius.xxl,
	},
	contentContainer: {
		paddingHorizontal: spacingScale.xl,
		paddingTop: spacingScale.lg,
		paddingBottom: spacingScale.xl,
		flexGrow: 1,
	},
});

export default AuthLayout;
