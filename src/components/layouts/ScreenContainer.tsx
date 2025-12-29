import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { scale, fontSize, spacing } from '@/utils/responsive';

interface ScreenContainerProps {
	children: ReactNode;
	backgroundColor?: string;
	edges?: Edge[];
	style?: ViewStyle;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
	children,
	backgroundColor = "#FFFFFF",
	edges = ["top", "bottom"],
	style,
}) => {
	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor }, style]}
			edges={edges}>
			{children}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default ScreenContainer;
