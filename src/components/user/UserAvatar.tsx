import React from "react";
import { View, Image, Text, StyleSheet, ImageStyle } from "react-native";
import { neutral, primary } from "@/constants/colors";
import { useAuth } from "@/hooks";

interface UserAvatarProps {
	size?: number;
	name?: string;
	initials?: string;
	backgroundColor?: string;
	textColor?: string;
	containerStyle?: ImageStyle;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
	size = 50,
	name,
	initials,
	backgroundColor = primary.primary1,
	textColor = neutral.neutral6,
	containerStyle,
}) => {
	const { user } = useAuth();
	name = user?.fullName || name || "User";
	const avatarSize: ImageStyle = {
		width: size,
		height: size,
		borderRadius: size / 2,
	};

	// Get initials from name if name is provided
	const getInitials = () => {
		if (initials) return initials.toUpperCase();
		if (name) {
			const words = name.trim().split(" ");
			if (words.length >= 2) {
				return (words[0][0] + words[words.length - 1][0]).toUpperCase();
			}
			return name.charAt(0).toUpperCase();
		}
		return "";
	};

	const displayInitials = getInitials();

	if (displayInitials) {
		return (
			<View
				style={[
					styles.avatar,
					avatarSize,
					{ backgroundColor },
					containerStyle,
				]}>
				<Text
					style={[
						styles.initials,
						{ color: textColor, fontSize: size / 2.5 },
					]}>
					{displayInitials}
				</Text>
			</View>
		);
	}

	return (
		<View
			style={[
				styles.avatar,
				avatarSize,
				{ backgroundColor },
				containerStyle,
			]}
		/>
	);
};

const styles = StyleSheet.create({
	avatarContainer: {
		position: "relative",
		justifyContent: "center",
		alignItems: "center",
	},
	avatar: {
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	avatarBorder: {
		position: "absolute",
		width: "100%",
		height: "100%",
		borderRadius: 999,
		borderWidth: 2,
		borderColor: "rgba(255, 255, 255, 0.2)",
	},
	initials: {
		fontFamily: "Poppins",
		fontWeight: "600",
	},
});

export default UserAvatar;
