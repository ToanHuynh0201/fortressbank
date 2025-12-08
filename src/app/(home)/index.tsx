import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Image,
	TouchableOpacity,
	Alert,
} from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { primary, neutral, semantic } from "@/constants";
import { useRouter } from "expo-router";
import { UserAvatar, NotificationBell, BankCard } from "@/components";
import { useNotifications } from "@/contexts";
import { SignOut } from "phosphor-react-native";
import { clearStorage } from "@/utils/storage";
import Feather from "@expo/vector-icons/Feather";
import { authService } from "@/services";
const Home = () => {
	const router = useRouter();
	const { unreadCount } = useNotifications();

	const handleLogout = () => {
		Alert.alert(
			"Logout",
			"Are you sure you want to logout?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Logout",
					style: "destructive",
					onPress: async () => {
						try {
							await clearStorage();
							router.replace("/(auth)/signIn");
						} catch (error) {
							console.error("Error during logout:", error);
							Alert.alert(
								"Error",
								"Failed to logout. Please try again.",
							);
						}
					},
				},
			],
			{ cancelable: true },
		);
	};

	const mainFeatures = [
		{
			id: 1,
			title: "Account and Card",
			description: "Manage your accounts and cards",
			icon: "wallet",
			route: "(account)/accountCard",
		},
		{
			id: 2,
			title: "Transfer",
			description: "Send money quickly and securely",
			icon: "transfer",
			route: "(transfer)/transfer",
		},
		{
			id: 3,
			title: "Beneficiaries",
			description: "Manage saved recipients",
			icon: "beneficiaries",
			route: "/beneficiaries",
		},
		{
			id: 4,
			title: "Transaction Report",
			description: "View your transaction history",
			icon: "report",
			route: "(home)/history",
		},
	];

	const getIcon = (iconName: string, large?: boolean) => {
		const size = large ? 48 : 28;

		switch (iconName) {
			case "wallet":
				return (
					<Image
						source={require("../../../assets/icons/wallet.png")}
						style={{ width: size, height: size }}
						resizeMode="contain"
					/>
				);
			case "transfer":
				return (
					<Image
						source={require("../../../assets/icons/transfer.png")}
						style={{ width: size, height: size }}
						resizeMode="contain"
					/>
				);
			case "beneficiaries":
				return (
					<Feather
						name="users"
						size={size}
						color="#FFFFFF"
					/>
				);
			case "report":
				return (
					<Image
						source={require("../../../assets/icons/reports.png")}
						style={{ width: size, height: size }}
						resizeMode="contain"
					/>
				);
			default:
				return null;
		}
	};

	return (
		<SafeAreaView
			style={styles.container}
			edges={["top"]}>
			{/* Enhanced Header with Gradient */}
			<LinearGradient
				colors={["#4A3FDB", "#3629B7", "#2A1F8F"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.headerGradient}>
				<View style={styles.header}>
					<View style={styles.headerLeft}>
						<UserAvatar
							imageUri="https://i.pravatar.cc/150?img=12"
							size={54}
						/>
						<View style={styles.greetingContainer}>
							<Text style={styles.greetingLabel}>
								Welcome back,
							</Text>
							<Text style={styles.greeting}>Push Puttichai</Text>
						</View>
					</View>
					<View style={styles.headerRight}>
						<NotificationBell
							count={unreadCount}
							onPress={() => router.push("/(home)/notification")}
						/>
						<TouchableOpacity
							style={styles.logoutButton}
							onPress={handleLogout}
							activeOpacity={0.7}>
							<SignOut
								size={20}
								color={neutral.neutral6}
								weight="bold"
							/>
						</TouchableOpacity>
					</View>
				</View>
			</LinearGradient>

			<View style={styles.content}>
				{/* Bank Card */}
				<View style={styles.cardContainer}>
					<BankCard
						cardholderName="John Smith"
						cardNumber="4756 1234 5678 9018"
						maskedCardNumber="•••• •••• •••• 9018"
						balance="$3.469.52"
					/>
				</View>

				{/* Main Features Title */}
				<Text style={styles.sectionTitle}>Main Features</Text>

				{/* Main Features - Large Cards */}
				<View style={styles.featuresContainer}>
					{mainFeatures.map((feature, index) => (
						<TouchableOpacity
							key={feature.id}
							style={[
								styles.featureCard,
								index === mainFeatures.length - 1 &&
									styles.featureCardLast,
							]}
							onPress={() => router.push(feature.route as any)}
							activeOpacity={0.7}>
							<LinearGradient
								colors={[primary.primary1, primary.primary2]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.featureGradient}>
								<View style={styles.featureIconContainer}>
									{getIcon(feature.icon, true)}
								</View>
								<View style={styles.featureContent}>
									<Text style={styles.featureTitle}>
										{feature.title}
									</Text>
									<Text style={styles.featureDescription}>
										{feature.description}
									</Text>
								</View>
								<View style={styles.featureArrow}>
									<Feather
										name="arrow-right"
										size={20}
										color={neutral.neutral6}
										style={styles.arrowIcon}
									/>
								</View>
							</LinearGradient>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</SafeAreaView>
	);
};

export default Home;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primary.primary1,
	},
	headerGradient: {
		paddingHorizontal: 24,
		paddingVertical: 20,
		paddingBottom: 24,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		flex: 1,
	},
	greetingContainer: {
		flex: 1,
	},
	greetingLabel: {
		fontSize: 13,
		fontFamily: "Poppins",
		fontWeight: "400",
		color: "rgba(255, 255, 255, 0.7)",
		lineHeight: 18,
		marginBottom: 2,
	},
	greeting: {
		fontSize: 18,
		fontFamily: "Poppins",
		fontWeight: "600",
		color: neutral.neutral6,
		lineHeight: 24,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	logoutButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1.5,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	scrollView: {
		flex: 1,
	},
	content: {
		backgroundColor: neutral.neutral6,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingTop: 16,
		paddingHorizontal: 24,
		paddingBottom: 20,
		minHeight: "100%",
	},
	cardContainer: {
		marginBottom: 6,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: 6,
		fontFamily: "Poppins",
	},
	featuresContainer: {
		gap: 10,
	},
	featureCard: {
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	featureCardLast: {
		marginBottom: 20,
	},
	featureGradient: {
		flexDirection: "row",
		alignItems: "center",
		padding: 14,
		minHeight: 82,
	},
	featureIconContainer: {
		width: 56,
		height: 56,
		borderRadius: 14,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 14,
	},
	featureContent: {
		flex: 1,
	},
	featureTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: neutral.neutral6,
		marginBottom: 6,
		fontFamily: "Poppins",
	},
	featureDescription: {
		fontSize: 13,
		fontWeight: "400",
		color: "rgba(255, 255, 255, 0.85)",
		lineHeight: 18,
		fontFamily: "Poppins",
	},
	featureArrow: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	arrowIcon: {
		fontSize: 20,
		color: neutral.neutral6,
		fontWeight: "bold",
	},
});
