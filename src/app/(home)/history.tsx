import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	StatusBar,
	TouchableOpacity,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	Easing,
	FadeIn,
} from "react-native-reanimated";
import { ClockClockwise, Calendar } from "phosphor-react-native";
import colors, { primary, neutral, semantic } from "@/constants/colors";
import { TransactionHistoryItem } from "@/components";
import { transferService, type Transaction } from "@/services/transferService";
import { accountService } from "@/services/accountService";
import { getUserData } from "@/utils/storage";

// Helper function to map API transaction type to UI type
const mapTransactionType = (
	transaction: Transaction,
	userAccountId: string,
): "sent" | "received" => {
	return transaction.senderAccountId === userAccountId ? "sent" : "received";
};

// Helper function to map API status to UI status
const mapTransactionStatus = (
	status: string,
): "success" | "pending" | "failed" => {
	switch (status) {
		case "COMPLETED":
			return "success";
		case "PENDING":
		case "PENDING_OTP":
			return "pending";
		case "FAILED":
		case "CANCELLED":
			return "failed";
		default:
			return "success";
	}
};

const History = () => {
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [transactions, setTransactions] = useState<any[]>([]);
	const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
	const [accountId, setAccountId] = useState<string | null>(null);
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const LIMIT = 20;

	const headerScale = useSharedValue(0.96);
	const headerOpacity = useSharedValue(0);

	useEffect(() => {
		headerScale.value = withSpring(1, {
			damping: 20,
			stiffness: 100,
		});
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});
	}, []);

	// Fetch account ID on mount
	useEffect(() => {
		const fetchAccountId = async () => {
			try {
				const result = await accountService.getAccounts();
				if (result.success && result.data && result.data.length > 0) {
					const primaryAccount = result.data[0];
					setAccountId(primaryAccount.accountId);
				}
			} catch (error) {
				console.error("Error fetching account:", error);
			}
		};

		fetchAccountId();
	}, []);

	// Fetch transactions when accountId or filter changes
	useEffect(() => {
		if (accountId) {
			fetchTransactions(true);
		}
	}, [accountId, filter]);

	const fetchTransactions = async (reset: boolean = false) => {
		if (!accountId) return;

		try {
			if (reset) {
				setLoading(true);
				setOffset(0);
			}

			const filterType =
				filter === "all"
					? "ALL"
					: filter === "sent"
					? "SENT"
					: "RECEIVED";
			const currentOffset = reset ? 0 : offset;

			const response = await transferService.getTransactionHistory(
				accountId,
				{
					offset: currentOffset,
					limit: LIMIT,
					type: filterType as "SENT" | "RECEIVED" | "ALL",
				},
			);

			if (response.code === 1000 && response.data) {
				const formattedTransactions = response.data.transactions.map(
					(tx: Transaction) => ({
						id: tx.transactionId,
						type: mapTransactionType(tx, accountId),
						recipient:
							tx.senderAccountId === accountId
								? tx.receiverAccountNumber
								: tx.senderAccountNumber,
						amount: tx.amount,
						date: new Date(tx.createdAt),
						transactionId: tx.transactionId,
						status: mapTransactionStatus(tx.status),
					}),
				);

				if (reset) {
					setTransactions(formattedTransactions);
				} else {
					setTransactions((prev) => [
						...prev,
						...formattedTransactions,
					]);
				}

				setHasMore(formattedTransactions.length === LIMIT);
				setOffset(currentOffset + formattedTransactions.length);
			}
		} catch (error) {
			console.error("Error fetching transactions:", error);
		} finally {
			setLoading(false);
		}
	};

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: headerScale.value }],
		opacity: headerOpacity.value,
	}));

	const onRefresh = React.useCallback(async () => {
		setRefreshing(true);
		await fetchTransactions(true);
		setRefreshing(false);
	}, [accountId, filter]);

	// No need for client-side filtering since API handles it
	const filteredTransactions = transactions;

	const totalSent = transactions
		.filter((t) => t.type === "sent")
		.reduce((sum, t) => sum + t.amount, 0);

	const totalReceived = transactions
		.filter((t) => t.type === "received")
		.reduce((sum, t) => sum + t.amount, 0);

	return (
		<SafeAreaView
			style={styles.container}
			edges={["top"]}>
			<StatusBar
				barStyle="light-content"
				backgroundColor={primary.primary1}
			/>

			{/* Header with Gradient */}
			<LinearGradient
				colors={["#4A3FDB", "#3629B7", "#2A1F8F"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.headerGradient}>
				<Animated.View style={[styles.header, headerAnimatedStyle]}>
					<View style={styles.headerTop}>
						<ClockClockwise
							size={28}
							color={neutral.neutral6}
							weight="bold"
						/>
						<Text style={styles.headerTitle}>
							Transaction History
						</Text>
					</View>

					{/* Stats Cards */}
					<View style={styles.statsContainer}>
						<View style={styles.statCard}>
							<Text style={styles.statLabel}>Total Sent</Text>
							<Text style={styles.statValue}>
								$
								{totalSent.toLocaleString("en-US", {
									minimumFractionDigits: 2,
								})}
							</Text>
						</View>
						<View style={styles.statCard}>
							<Text style={styles.statLabel}>Total Received</Text>
							<Text style={styles.statValue}>
								$
								{totalReceived.toLocaleString("en-US", {
									minimumFractionDigits: 2,
								})}
							</Text>
						</View>
					</View>
				</Animated.View>
			</LinearGradient>

			{/* Content */}
			<View style={styles.content}>
				{/* Filter Buttons */}
				<Animated.View
					entering={FadeIn.delay(150).duration(400)}
					style={styles.filterContainer}>
					<TouchableOpacity
						style={[
							styles.filterButton,
							filter === "all" && styles.filterButtonActive,
						]}
						onPress={() => setFilter("all")}
						activeOpacity={0.7}>
						<Text
							style={[
								styles.filterText,
								filter === "all" && styles.filterTextActive,
							]}>
							All
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.filterButton,
							filter === "sent" && styles.filterButtonActive,
						]}
						onPress={() => setFilter("sent")}
						activeOpacity={0.7}>
						<Text
							style={[
								styles.filterText,
								filter === "sent" && styles.filterTextActive,
							]}>
							Sent
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.filterButton,
							filter === "received" && styles.filterButtonActive,
						]}
						onPress={() => setFilter("received")}
						activeOpacity={0.7}>
						<Text
							style={[
								styles.filterText,
								filter === "received" &&
									styles.filterTextActive,
							]}>
							Received
						</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Transactions List */}
				{loading && transactions.length === 0 ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator
							size="large"
							color={primary.primary1}
						/>
						<Text style={styles.loadingText}>
							Loading transactions...
						</Text>
					</View>
				) : (
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								colors={[primary.primary1]}
								tintColor={primary.primary1}
							/>
						}
						onScroll={({ nativeEvent }) => {
							const {
								layoutMeasurement,
								contentOffset,
								contentSize,
							} = nativeEvent;
							const paddingToBottom = 20;
							const isCloseToBottom =
								layoutMeasurement.height + contentOffset.y >=
								contentSize.height - paddingToBottom;

							if (isCloseToBottom && hasMore && !loading) {
								fetchTransactions(false);
							}
						}}
						scrollEventThrottle={400}>
						{filteredTransactions.length > 0 ? (
							<>
								{filteredTransactions.map(
									(transaction, index) => (
										<TransactionHistoryItem
											key={transaction.id}
											{...transaction}
											index={index}
											onPress={() => {
												// Handle transaction detail view
												console.log(
													"Transaction pressed:",
													transaction.id,
												);
											}}
										/>
									),
								)}
								{loading && (
									<View style={styles.loadingMore}>
										<ActivityIndicator
											size="small"
											color={primary.primary1}
										/>
									</View>
								)}
							</>
						) : (
							<Animated.View
								entering={FadeIn.delay(200).duration(400)}
								style={styles.emptyState}>
								<Calendar
									size={64}
									color={neutral.neutral4}
									weight="thin"
								/>
								<Text style={styles.emptyTitle}>
									No Transactions
								</Text>
								<Text style={styles.emptyMessage}>
									{filter === "all"
										? "You have no transaction history yet"
										: `You have no ${filter} transactions`}
								</Text>
							</Animated.View>
						)}
					</ScrollView>
				)}
			</View>
		</SafeAreaView>
	);
};

export default History;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primary.primary1,
	},
	headerGradient: {
		paddingHorizontal: 24,
		paddingTop: 20,
		paddingBottom: 24,
	},
	header: {
		gap: 20,
	},
	headerTop: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	headerTitle: {
		fontSize: 24,
		fontFamily: "Poppins",
		fontWeight: "700",
		color: neutral.neutral6,
		lineHeight: 32,
	},
	statsContainer: {
		flexDirection: "row",
		gap: 12,
	},
	statCard: {
		flex: 1,
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		borderRadius: 16,
		padding: 16,
	},
	statLabel: {
		fontSize: 12,
		fontFamily: "Poppins",
		fontWeight: "500",
		color: "rgba(255, 255, 255, 0.8)",
		lineHeight: 16,
		marginBottom: 4,
	},
	statValue: {
		fontSize: 20,
		fontFamily: "Poppins",
		fontWeight: "700",
		color: neutral.neutral6,
		lineHeight: 28,
	},
	content: {
		flex: 1,
		backgroundColor: neutral.neutral6,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingTop: 24,
	},
	filterContainer: {
		flexDirection: "row",
		paddingHorizontal: 24,
		gap: 12,
		marginBottom: 20,
	},
	filterButton: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 12,
		backgroundColor: neutral.neutral5,
		alignItems: "center",
		justifyContent: "center",
	},
	filterButtonActive: {
		backgroundColor: primary.primary1,
	},
	filterText: {
		fontSize: 14,
		fontFamily: "Poppins",
		fontWeight: "600",
		color: neutral.neutral2,
		lineHeight: 20,
	},
	filterTextActive: {
		color: neutral.neutral6,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 24,
		paddingBottom: 120,
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 60,
		paddingHorizontal: 40,
	},
	emptyTitle: {
		fontSize: 20,
		fontFamily: "Poppins",
		fontWeight: "600",
		color: neutral.neutral1,
		lineHeight: 28,
		marginTop: 16,
		marginBottom: 8,
	},
	emptyMessage: {
		fontSize: 14,
		fontFamily: "Poppins",
		fontWeight: "400",
		color: neutral.neutral3,
		lineHeight: 21,
		textAlign: "center",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	loadingText: {
		fontSize: 14,
		fontFamily: "Poppins",
		fontWeight: "500",
		color: neutral.neutral3,
		marginTop: 12,
	},
	loadingMore: {
		paddingVertical: 20,
		alignItems: "center",
	},
});
