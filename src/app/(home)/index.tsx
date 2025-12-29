import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Image,
	TouchableOpacity,
	FlatList,
	ViewToken,
	ActivityIndicator,
	useWindowDimensions,
} from "react-native";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { primary, neutral } from "@/constants";
import { scale, fontSize, spacing } from "@/utils/responsive";
import {
	typography,
	spacingScale,
	borderRadius,
	componentSizes,
} from "@/constants/responsive";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
	UserAvatar,
	NotificationBell,
	AccountCardItem,
	ConfirmationModal,
	AlertModal,
} from "@/components";
import { useNotifications } from "@/contexts";
import { SignOut } from "phosphor-react-native";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "@/hooks";
import Animated, {
	useSharedValue,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	interpolate,
	Extrapolate,
	SharedValue,
} from "react-native-reanimated";
import { Account, accountService } from "@/services/accountService";

// Account Item Component with animation
const AccountItem = React.memo(
	({
		item,
		index,
		scrollX,
		screenWidth,
	}: {
		item: Account;
		index: number;
		scrollX: SharedValue<number>;
		screenWidth: number;
	}) => {
		const accountAnimatedStyle = useAnimatedStyle(() => {
			const inputRange = [
				(index - 1) * screenWidth,
				index * screenWidth,
				(index + 1) * screenWidth,
			];

			const scale = interpolate(
				scrollX.value,
				inputRange,
				[0.85, 1, 0.85],
				Extrapolate.CLAMP,
			);

			return {
				transform: [{ scale }],
			};
		});

		return (
			<Animated.View
				style={[
					{
						width: screenWidth,
						height: scale(240),
						justifyContent: "center",
					},
					accountAnimatedStyle,
				]}>
				<View style={styles.accountCardWrapper}>
					<AccountCardItem
						accountName={`Account`}
						accountNumber={item.accountNumber}
						balance={`$${item.balance.toFixed(2)}`}
						branch={item.accountStatus}
					/>
				</View>
			</Animated.View>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.item.accountId === nextProps.item.accountId &&
			prevProps.index === nextProps.index &&
			prevProps.screenWidth === nextProps.screenWidth
		);
	},
);

const Home = () => {
	const router = useRouter();
	const { unreadCount } = useNotifications();
	const { user, isLoading, logout } = useAuth();
	const flatListRef = useRef<FlatList>(null);
	const scrollX = useSharedValue(0);
	const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});

	// Fetch accounts from API
	useEffect(() => {
		fetchAccounts();
	}, []);

	// Refresh accounts when screen gains focus
	useFocusEffect(
		useCallback(() => {
			fetchAccounts();
		}, []),
	);

	const fetchAccounts = async () => {
		try {
			setIsLoadingAccounts(true);
			const response = await accountService.getAccounts();

			if (response.success && response.data) {
				setAccounts(response.data);
			} else {
				console.error("Failed to fetch accounts:", response.error);
			}
		} catch (error) {
			console.error("Error fetching accounts:", error);
		} finally {
			setIsLoadingAccounts(false);
		}
	};

	const handleLogoutPress = () => {
		setShowLogoutModal(true);
	};

	const handleLogoutConfirm = async () => {
		setShowLogoutModal(false);
		try {
			await logout();
			router.replace("/(auth)/signIn");
		} catch (error) {
			console.error("Error during logout:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Failed to logout. Please try again.",
				variant: "error",
			});
		}
	};

	const handleLogoutCancel = () => {
		setShowLogoutModal(false);
	};

	// Scroll handler for FlatList
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	// Handle viewable items change
	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0].index !== null) {
				setCurrentAccountIndex(viewableItems[0].index);
			}
		},
	).current;

	const viewabilityConfig = useRef({
		itemVisiblePercentThreshold: 50,
	}).current;

	const { width: screenWidth } = useWindowDimensions();
	// Render each account item
	const renderAccountItem = useCallback(
		({ item, index }: { item: Account; index: number }) => {
			return (
				<AccountItem
					item={item}
					index={index}
					scrollX={scrollX}
					screenWidth={screenWidth}
				/>
			);
		},
		[screenWidth],
	);

	// Key extractor
	const keyExtractor = (item: Account) => item.accountId;

	// Get item layout for optimization
	const getItemLayout = (_: any, index: number) => ({
		length: screenWidth,
		offset: screenWidth * index,
		index,
	});

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
		const size = large ? scale(48) : scale(28);

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
						<UserAvatar size={scale(54)} />
						<View style={styles.greetingContainer}>
							<Text style={styles.greetingLabel}>
								Welcome back,
							</Text>
							<Text style={styles.greeting}>
								{user?.name || user?.fullName || "User"}
							</Text>
						</View>
					</View>
					<View style={styles.headerRight}>
						<NotificationBell
							count={unreadCount}
							onPress={() => router.push("/(home)/notification")}
						/>
						<TouchableOpacity
							style={styles.logoutButton}
							onPress={handleLogoutPress}
							activeOpacity={0.7}>
							<SignOut
								size={scale(20)}
								color={neutral.neutral6}
								weight="bold"
							/>
						</TouchableOpacity>
					</View>
				</View>
			</LinearGradient>

			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				bounces={false}
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom:
						componentSizes.tabBarHeight + spacingScale.md,
				}}>
				{/* Account Cards Carousel */}
				{isLoadingAccounts ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator
							size="large"
							color={primary.primary1}
						/>
						<Text style={styles.loadingText}>
							Loading accounts...
						</Text>
					</View>
				) : accounts.length > 0 ? (
					<>
						<Animated.FlatList
							ref={flatListRef}
							data={accounts}
							renderItem={renderAccountItem}
							keyExtractor={keyExtractor}
							getItemLayout={getItemLayout}
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							snapToAlignment="center"
							decelerationRate="fast"
							onScroll={scrollHandler}
							scrollEventThrottle={16}
							onViewableItemsChanged={onViewableItemsChanged}
							viewabilityConfig={viewabilityConfig}
							contentContainerStyle={styles.flatListContent}
							style={styles.flatList}
							removeClippedSubviews={true}
							maxToRenderPerBatch={3}
							initialNumToRender={3}
							windowSize={3}
						/>

						{/* Account Indicators */}
						{accounts.length > 1 && (
							<View style={styles.accountIndicators}>
								{accounts.map((_, index) => (
									<View
										key={index}
										style={[
											styles.indicatorDot,
											index === currentAccountIndex &&
												styles.indicatorDotActive,
										]}
									/>
								))}
							</View>
						)}
					</>
				) : (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>No accounts found</Text>
					</View>
				)}
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
			</ScrollView>

			<ConfirmationModal
				visible={showLogoutModal}
				title="Logout"
				message="Are you sure you want to logout from your account?"
				confirmText="Logout"
				cancelText="Cancel"
				onConfirm={handleLogoutConfirm}
				onCancel={handleLogoutCancel}
				confirmButtonVariant="danger"
			/>

			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>
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
		paddingHorizontal: spacingScale.xl,
		paddingVertical: spacingScale.xl * 0.83,
		paddingBottom: spacingScale.xl,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacingScale.lg,
		flex: 1,
	},
	greetingContainer: {
		flex: 1,
	},
	greetingLabel: {
		fontSize: fontSize(13),
		fontFamily: "Poppins",
		fontWeight: "400",
		color: "rgba(255, 255, 255, 0.7)",
		lineHeight: scale(18),
		marginBottom: spacing(2),
	},
	greeting: {
		fontSize: typography.subtitle,
		fontFamily: "Poppins",
		fontWeight: "600",
		color: neutral.neutral6,
		lineHeight: scale(24),
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacingScale.md,
	},
	logoutButton: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
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
		borderTopLeftRadius: borderRadius.xxl,
		borderTopRightRadius: borderRadius.xxl,
		paddingTop: spacingScale.sm,
	},
	flatList: {
		height: scale(240),
	},
	flatListContent: {
		paddingHorizontal: 0,
	},
	accountCardWrapper: {
		paddingHorizontal: spacingScale.xl,
		justifyContent: "center",
	},
	accountIndicators: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: spacingScale.sm,
		marginBottom: spacingScale.md,
		paddingHorizontal: spacingScale.xl,
	},
	indicatorDot: {
		width: scale(8),
		height: scale(8),
		borderRadius: scale(4),
		backgroundColor: neutral.neutral4,
	},
	indicatorDotActive: {
		width: spacingScale.xl,
		backgroundColor: primary.primary1,
	},
	cardContainer: {
		marginBottom: spacing(6),
	},
	sectionTitle: {
		fontSize: typography.h3,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: spacing(6),
		fontFamily: "Poppins",
		paddingHorizontal: spacingScale.xl,
	},
	featuresContainer: {
		gap: spacing(5),
		paddingHorizontal: spacingScale.xl,
		paddingBottom: componentSizes.tabBarHeight,
	},
	featureCard: {
		borderRadius: borderRadius.lg,
		overflow: "hidden",
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	featureCardLast: {
		marginBottom: 0,
	},
	featureGradient: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing(14),
		minHeight: scale(82),
	},
	featureIconContainer: {
		width: scale(56),
		height: scale(56),
		borderRadius: spacing(14),
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: spacing(14),
	},
	featureContent: {
		flex: 1,
	},
	featureTitle: {
		fontSize: typography.subtitle,
		fontWeight: "700",
		color: neutral.neutral6,
		marginBottom: spacing(6),
		fontFamily: "Poppins",
	},
	featureDescription: {
		fontSize: fontSize(13),
		fontWeight: "400",
		color: "rgba(255, 255, 255, 0.85)",
		lineHeight: scale(18),
		fontFamily: "Poppins",
	},
	featureArrow: {
		width: scale(32),
		height: scale(32),
		borderRadius: scale(16),
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	arrowIcon: {
		fontSize: scale(20),
		color: neutral.neutral6,
		fontWeight: "bold",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: componentSizes.tabBarHeight,
		minHeight: scale(240),
	},
	loadingText: {
		fontFamily: "Poppins",
		fontSize: typography.bodySmall,
		fontWeight: "500",
		color: neutral.neutral3,
		marginTop: spacingScale.md,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: componentSizes.tabBarHeight,
		minHeight: scale(240),
	},
	emptyText: {
		fontFamily: "Poppins",
		fontSize: typography.bodySmall,
		fontWeight: "500",
		color: neutral.neutral3,
		textAlign: "center",
	},
});
