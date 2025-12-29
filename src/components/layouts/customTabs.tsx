import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";
import { neutral, primary, semantic } from "@/constants";
import { spacing, fontSize, scale } from "@/utils/responsive";
import { spacingScale, typography, componentSizes } from "@/constants/responsive";
import { useNotifications } from "@/contexts";

const AnimatedTouchableOpacity =
	Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = neutral.neutral6;
const SECONDARY_COLOR = primary.primary1;

const getIconByRouteName = (
	routeName: string,
	color: string,
	badgeCount?: number,
) => {
	const iconSize = scale(20);

	const renderIcon = () => {
		switch (routeName) {
			case "index":
				return (
					<Feather
						name="home"
						size={iconSize}
						color={color}
					/>
				);
			case "notification":
				return (
					<Feather
						name="bell"
						size={iconSize}
						color={color}
					/>
				);
			case "history":
				return (
					<Feather
						name="clock"
						size={iconSize}
						color={color}
					/>
				);
			case "setting":
				return (
					<Ionicons
						name="settings-outline"
						size={iconSize}
						color={color}
					/>
				);
			default:
				return (
					<Feather
						name="home"
						size={iconSize}
						color={color}
					/>
				);
		}
	};

	if (routeName === "notification" && badgeCount && badgeCount > 0) {
		return (
			<View style={styles.iconContainer}>
				{renderIcon()}
				<View style={styles.badge}>
					<Text style={styles.badgeText}>
						{badgeCount > 99 ? "99+" : badgeCount}
					</Text>
				</View>
			</View>
		);
	}

	return renderIcon();
};

const CustomNavBar = ({
	state,
	descriptors,
	navigation,
}: BottomTabBarProps) => {
	const { unreadCount } = useNotifications();

	const handleQRPress = () => {
		navigation.navigate("qrScanner");
	};

	return (
		<View style={styles.wrapper}>
			<View style={styles.container}>
				{state.routes.map((route, index) => {
					if (
						["_sitemap", "+not-found", "qrScanner"].includes(
							route.name,
						)
					)
						return null;

					const { options } = descriptors[route.key];
					const label =
						options.tabBarLabel !== undefined
							? options.tabBarLabel
							: options.title !== undefined
							? options.title
							: route.name;

					const isFocused = state.index === index;

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name, route.params);
						}
					};

					return (
						<AnimatedTouchableOpacity
							layout={LinearTransition.springify().mass(0.5)}
							key={route.key}
							onPress={onPress}
							style={[
								styles.tabItem,
								{
									backgroundColor: isFocused
										? SECONDARY_COLOR
										: "transparent",
								},
							]}>
							{getIconByRouteName(
								route.name,
								isFocused ? PRIMARY_COLOR : SECONDARY_COLOR,
								route.name === "notification"
									? unreadCount
									: undefined,
							)}
							{isFocused && (
								<Animated.Text
									entering={FadeIn.duration(200)}
									exiting={FadeOut.duration(200)}
									style={styles.text}>
									{label as string}
								</Animated.Text>
							)}
						</AnimatedTouchableOpacity>
					);
				})}
			</View>

			<View style={styles.qrButtonWrapper}>
				<TouchableOpacity
					onPress={handleQRPress}
					style={styles.qrButton}
					activeOpacity={0.8}>
					<View style={styles.qrIconContainer}>
						<Ionicons
							name="qr-code-outline"
							size={scale(28)}
							color={PRIMARY_COLOR}
						/>
					</View>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		width: "100%",
		alignItems: "center",
		bottom: spacingScale.xxxl,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: spacingScale.xl * 0.83,
	},
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: PRIMARY_COLOR,
		flex: 1,
		maxWidth: "80%",
		borderRadius: spacingScale.xxxl,
		paddingHorizontal: spacingScale.xl * 0.83,
		paddingVertical: spacing(15),
		borderWidth: 1,
		borderColor: SECONDARY_COLOR,
		boxShadow: "0 10px 20px 0 rgba(47, 0, 255, 0.4)",
		elevation: 10,
	},
	tabItem: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		height: scale(36),
		paddingHorizontal: spacing(10),
		borderRadius: spacingScale.xxl,
	},
	text: {
		color: PRIMARY_COLOR,
		marginLeft: spacingScale.sm,
		fontWeight: "500",
	},
	iconContainer: {
		position: "relative",
		justifyContent: "center",
		alignItems: "center",
	},
	badge: {
		position: "absolute",
		top: scale(-6),
		right: scale(-8),
		minWidth: scale(16),
		height: scale(16),
		borderRadius: scale(8),
		backgroundColor: semantic.error,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: spacing(4),
	},
	badgeText: {
		fontSize: typography.tiny,
		fontFamily: "Poppins",
		fontWeight: "700",
		color: neutral.neutral6,
		lineHeight: scale(12),
	},
	qrButtonWrapper: {
		marginLeft: spacing(15),
	},
	qrButton: {
		shadowColor: SECONDARY_COLOR,
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.5,
		shadowRadius: 15,
		elevation: 15,
	},
	qrIconContainer: {
		width: componentSizes.tabBarHeight,
		height: componentSizes.tabBarHeight,
		borderRadius: componentSizes.tabBarHeight / 2,
		backgroundColor: SECONDARY_COLOR,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 4,
		boxShadow: "0 10px 20px 0 rgba(47, 0, 255, 0.4)",
		borderColor: PRIMARY_COLOR,
	},
});

export default CustomNavBar;
