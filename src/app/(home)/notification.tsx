import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	View,
	ScrollView,
	TouchableOpacity,
	Text,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	Easing,
	FadeIn,
} from "react-native-reanimated";
import { AppHeader } from "@/components/common";
import { NotificationItem } from "@/components/notifications";
import { primary, neutral, semantic } from "@/constants/colors";
import { useNotifications } from "@/contexts";
import { CheckCircle } from "phosphor-react-native";
import { scale, fontSize, spacing } from "@/utils/responsive";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const Notification = () => {
	const {
		notifications,
		markAsRead,
		markAllAsRead,
		unreadCount,
		refreshNotifications,
		isLoading,
	} = useNotifications();
	const [refreshing, setRefreshing] = useState(false);
	const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);

	useEffect(() => {
		contentOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});
		contentTranslateY.value = withSpring(0, {
			damping: 20,
			stiffness: 90,
		});
	}, []);

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ translateY: contentTranslateY.value }],
	}));

	const handleRefresh = async () => {
		setRefreshing(true);
		await refreshNotifications();
		setRefreshing(false);
	};

	const handleMarkAllAsRead = async () => {
		setMarkingAllAsRead(true);
		await markAllAsRead();
		setMarkingAllAsRead(false);
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView
				style={styles.container}
				edges={["top"]}>
				<AppHeader
					title="Notifications"
					showBackButton={true}
					backgroundColor={primary.primary1}
					textColor={neutral.neutral6}
				/>

				<AnimatedScrollView
					style={[styles.content, contentAnimatedStyle]}
					contentContainerStyle={styles.contentContainer}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={primary.primary1}
							colors={[primary.primary1]}
						/>
					}>
					{/* Initial Loading State */}
					{isLoading && notifications.length === 0 ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator
								size="large"
								color={primary.primary1}
							/>
							<Text style={styles.loadingText}>
								Loading notifications...
							</Text>
						</View>
					) : notifications.length === 0 ? (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>
								No notifications yet
							</Text>
							<Text style={styles.emptySubText}>
								You're all caught up!
							</Text>
						</View>
					) : (
						<>
							{/* Mark All as Read Button */}
							{unreadCount > 0 && (
								<Animated.View
									entering={FadeIn.delay(100).duration(400)}
									style={styles.actionContainer}>
									<TouchableOpacity
										style={[
											styles.markAllButton,
											markingAllAsRead &&
												styles.markAllButtonDisabled,
										]}
										onPress={handleMarkAllAsRead}
										activeOpacity={0.8}
										disabled={markingAllAsRead}>
										{markingAllAsRead ? (
											<ActivityIndicator
												size="small"
												color={neutral.neutral6}
											/>
										) : (
											<CheckCircle
												size={scale(20)}
												color={neutral.neutral6}
												weight="bold"
											/>
										)}
										<Text style={styles.markAllButtonText}>
											{markingAllAsRead
												? "Marking..."
												: `Mark all as read (${unreadCount})`}
										</Text>
									</TouchableOpacity>
								</Animated.View>
							)}

							<Animated.View
								entering={FadeIn.delay(150).duration(400)}
								style={styles.notificationsList}>
								{notifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										title={notification.title}
										message={notification.message}
										time={notification.time}
										isRead={notification.isRead}
										type={notification.type}
										onPress={() =>
											markAsRead(notification.id)
										}
									/>
								))}
							</Animated.View>
						</>
					)}
				</AnimatedScrollView>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
};

export default Notification;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primary.primary1,
	},
	content: {
		flex: 1,
		backgroundColor: neutral.neutral6,
	},
	contentContainer: {
		paddingTop: spacing(16),
		paddingBottom: spacing(100),
	},
	actionContainer: {
		paddingHorizontal: spacing(24),
		paddingBottom: spacing(16),
	},
	markAllButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: primary.primary1,
		paddingVertical: spacing(14),
		paddingHorizontal: spacing(20),
		borderRadius: scale(12),
		gap: spacing(10),
		shadowColor: primary.primary1,
		shadowOffset: {
			width: 0,
			height: scale(4),
		},
		shadowOpacity: 0.3,
		shadowRadius: scale(8),
		elevation: 6,
	},
	markAllButtonDisabled: {
		opacity: 0.6,
	},
	markAllButtonText: {
		fontFamily: "Poppins",
		fontSize: fontSize(15),
		fontWeight: "600",
		color: neutral.neutral6,
		lineHeight: fontSize(22),
	},
	notificationsList: {
		gap: 0,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: spacing(60),
	},
	loadingText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "500",
		color: neutral.neutral4,
		marginTop: spacing(16),
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: spacing(80),
	},
	emptyText: {
		fontFamily: "Poppins",
		fontSize: fontSize(18),
		fontWeight: "600",
		color: neutral.neutral3,
		marginBottom: spacing(8),
	},
	emptySubText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "400",
		color: neutral.neutral4,
	},
});
