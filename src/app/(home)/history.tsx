import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	ScrollView,
	StatusBar,
	TouchableOpacity,
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
import { TransactionHistoryItem, TransactionDetailModal } from "@/components";
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
	const [filterLoading, setFilterLoading] = useState(false);
	const [transactions, setTransactions] = useState<any[]>([]);
	const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
	const [accountId, setAccountId] = useState<string | null>(null);
	const [accountNumber, setAccountNumber] = useState<string | null>(null);
	const [accounts, setAccounts] = useState<any[]>([]);
	const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
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

	// Fetch all accounts on mount
	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				const result = await accountService.getAccounts();
				if (result.success && result.data && result.data.length > 0) {
					setAccounts(result.data);
					const primaryAccount = result.data[0];
					setAccountId(primaryAccount.accountId);
					setAccountNumber(primaryAccount.accountNumber);
				}
			} catch (error) {
				console.error("Error fetching accounts:", error);
			}
		};

		fetchAccounts();
	}, []);

	// Fetch transactions when accountNumber or filter changes
	useEffect(() => {
		if (accountNumber && accountId) {
			fetchTransactions(true);
		}
	}, [accountNumber, accountId, filter]);

	const fetchTransactions = async (reset: boolean = false, isFilterChange: boolean = false) => {
		if (!accountNumber || !accountId) return;

		try {
			if (reset) {
				// Show full loading only on initial load
				if (transactions.length === 0) {
					setLoading(true);
				} else {
					// Show filter loading for filter changes
					setFilterLoading(true);
				}
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
				accountNumber,
				{
					offset: currentOffset,
					limit: LIMIT,
					type: filterType as "SENT" | "RECEIVED" | "ALL",
				},
			);

			if (response.code === 1000 && response.data && response.data.content) {
				const formattedTransactions = response.data.content.map(
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

				// Use Spring Data pagination info
				setHasMore(!response.data.last);
				setOffset(currentOffset + response.data.numberOfElements);
			} else {
				// Handle case where data or content is undefined
				if (reset) {
					setTransactions([]);
				}
				setHasMore(false);
			}
		} catch (error) {
			console.error("Error fetching transactions:", error);
		} finally {
			setLoading(false);
			setFilterLoading(false);
		}
	};

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: headerScale.value }],
		opacity: headerOpacity.value,
	}));

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchTransactions(true);
		setRefreshing(false);
	};

	const handleLoadMore = () => {
		if (hasMore && !loading && !filterLoading) {
			fetchTransactions(false);
		}
	};

	const handleTransactionPress = (transactionId: string) => {
		setSelectedTransactionId(transactionId);
		setModalVisible(true);
	};

	const handleCloseModal = () => {
		setModalVisible(false);
		setSelectedTransactionId(null);
	};

	const renderTransaction = ({ item, index }: { item: any; index: number }) => (
		<TransactionHistoryItem
			key={item.id}
			{...item}
			index={index}
			onPress={() => handleTransactionPress(item.transactionId)}
			style={{
				opacity: filterLoading ? 0.5 : 1,
			}}
		/>
	);

	const renderFooter = () => {
		if (!loading || filterLoading) return null;
		return (
			<View style={styles.loadingMore}>
				<ActivityIndicator size="small" color={primary.primary1} />
			</View>
		);
	};

	const renderEmpty = () => {
		if (loading || filterLoading) return null;
		return (
			<Animated.View
				entering={FadeIn.delay(200).duration(400)}
				style={styles.emptyState}>
				<Calendar size={64} color={neutral.neutral4} weight="thin" />
				<Text style={styles.emptyTitle}>No Transactions</Text>
				<Text style={styles.emptyMessage}>
					{filter === "all"
						? "You have no transaction history yet"
						: `You have no ${filter} transactions`}
				</Text>
			</Animated.View>
		);
	};

	// Handle account selection
	const handleAccountSelect = (index: number) => {
		const selectedAccount = accounts[index];
		setSelectedAccountIndex(index);
		setAccountId(selectedAccount.accountId);
		setAccountNumber(selectedAccount.accountNumber);
		// fetchTransactions will be called automatically via useEffect
	};

	// No need for client-side filtering since API handles it
	const filteredTransactions = transactions;

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

					{/* Account Selection Cards */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.accountsContainer}>
						{accounts.map((account, index) => (
							<TouchableOpacity
								key={account.accountId}
								style={[
									styles.accountCard,
									selectedAccountIndex === index &&
										styles.accountCardActive,
								]}
								onPress={() => handleAccountSelect(index)}
								activeOpacity={0.7}>
								<Text style={styles.accountLabel}>
									{account.accountNumber}
								</Text>
								<Text style={styles.accountBalance}>
									$
									{account.balance.toLocaleString("en-US", {
										minimumFractionDigits: 2,
									})}
								</Text>
								<Text style={styles.accountStatus}>
									{account.accountStatus}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
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
					<View style={{ flex: 1 }}>
						{filterLoading && (
							<View style={styles.filterLoadingOverlay}>
								<ActivityIndicator
									size="small"
									color={primary.primary1}
								/>
							</View>
						)}
						<FlatList
							data={filteredTransactions}
							renderItem={renderTransaction}
							keyExtractor={(item) => item.id}
							contentContainerStyle={styles.scrollContent}
							showsVerticalScrollIndicator={false}
							onRefresh={onRefresh}
							refreshing={refreshing}
							onEndReached={handleLoadMore}
							onEndReachedThreshold={0.5}
							ListFooterComponent={renderFooter}
							ListEmptyComponent={renderEmpty}
							initialNumToRender={10}
							maxToRenderPerBatch={10}
							windowSize={10}
							removeClippedSubviews={true}
							updateCellsBatchingPeriod={50}
						/>
					</View>
				)}
			</View>

			{/* Transaction Detail Modal */}
			<TransactionDetailModal
				visible={modalVisible}
				transactionId={selectedTransactionId}
				onClose={handleCloseModal}
				accountId={accountId}
			/>
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
	accountsContainer: {
		flexGrow: 0,
	},
	accountCard: {
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		borderRadius: 16,
		padding: 16,
		marginRight: 12,
		minWidth: 160,
		borderWidth: 2,
		borderColor: "transparent",
	},
	accountCardActive: {
		backgroundColor: "rgba(255, 255, 255, 0.25)",
		borderColor: neutral.neutral6,
	},
	accountLabel: {
		fontSize: 12,
		fontFamily: "Poppins",
		fontWeight: "500",
		color: "rgba(255, 255, 255, 0.8)",
		lineHeight: 16,
		marginBottom: 4,
	},
	accountBalance: {
		fontSize: 20,
		fontFamily: "Poppins",
		fontWeight: "700",
		color: neutral.neutral6,
		lineHeight: 28,
		marginBottom: 2,
	},
	accountStatus: {
		fontSize: 10,
		fontFamily: "Poppins",
		fontWeight: "500",
		color: "rgba(255, 255, 255, 0.7)",
		lineHeight: 14,
		textTransform: "uppercase",
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
	scrollContent: {
		paddingHorizontal: 24,
		paddingBottom: 120,
		flexGrow: 1,
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
	filterLoadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		padding: 16,
		alignItems: "center",
		zIndex: 10,
		backgroundColor: "rgba(255, 255, 255, 0.9)",
		borderRadius: 8,
		marginHorizontal: 24,
		marginTop: 8,
	},
	centerLoading: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
});
