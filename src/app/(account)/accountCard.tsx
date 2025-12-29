import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	Easing,
	FadeIn,
} from "react-native-reanimated";
import { CaretLeftIcon, Plus } from "phosphor-react-native";
import colors from "@/constants/colors";
import { scale, fontSize, spacing } from '@/utils/responsive';
import {
	ScreenContainer,
	UserAvatar,
	AccountCardItem,
	CreditCardItem,
	CardItem,
} from "@/components";
import { useAuth } from "@/hooks";
import { accountService } from "@/services/accountService";
import { cardService } from "@/services/cardService";
import type { Account } from "@/services/accountService";
import type { Card } from "@/types/card";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface AccountCardData {
	id: string;
	accountName: string;
	accountNumber: string;
	balance: string;
	branch: string;
}

interface BankCardData {
	id: string;
	cardName: string;
	cardNumber: string;
	cardType: "Visa" | "Mastercard" | "American Express";
	expiryDate: string;
	cvv: string;
	cardHolder: string;
	cardLimit: string;
	availableCredit: string;
}

const accountsData: AccountCardData[] = [
	{
		id: "1",
		accountName: "Account 1",
		accountNumber: "1900 8988 1234",
		balance: "$20,000",
		branch: "New York",
	},
	{
		id: "2",
		accountName: "Account 2",
		accountNumber: "8988 1234",
		balance: "$12,000",
		branch: "New York",
	},
	{
		id: "3",
		accountName: "Account 3",
		accountNumber: "1900 1234 2222",
		balance: "$230,000",
		branch: "New York",
	},
];

const cardsData: BankCardData[] = [
	{
		id: "1",
		cardName: "Platinum Visa",
		cardNumber: "4532 **** **** 8765",
		cardType: "Visa",
		expiryDate: "12/26",
		cvv: "***",
		cardHolder: "Push Puttichai",
		cardLimit: "$50,000",
		availableCredit: "$35,000",
	},
	{
		id: "2",
		cardName: "Gold Mastercard",
		cardNumber: "5425 **** **** 3210",
		cardType: "Mastercard",
		expiryDate: "08/27",
		cvv: "***",
		cardHolder: "Push Puttichai",
		cardLimit: "$30,000",
		availableCredit: "$28,500",
	},
	{
		id: "3",
		cardName: "Business Amex",
		cardNumber: "3782 **** **** 9876",
		cardType: "American Express",
		expiryDate: "03/28",
		cvv: "****",
		cardHolder: "Push Puttichai",
		cardLimit: "$100,000",
		availableCredit: "$85,000",
	},
];

const AccountCard = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"account" | "card">("account");
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [cards, setCards] = useState<Card[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingCards, setIsLoadingCards] = useState(false);

	const headerOpacity = useSharedValue(0);
	const userOpacity = useSharedValue(0);
	const userScale = useSharedValue(0.9);
	const contentOpacity = useSharedValue(0);
	const { user } = useAuth();

	useEffect(() => {
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});

		userOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});
		userScale.value = withSpring(1, {
			damping: 20,
			stiffness: 90,
		});

		contentOpacity.value = withTiming(1, {
			duration: 500,
			easing: Easing.out(Easing.ease),
		});

		// Fetch accounts data
		fetchAccounts();
	}, []);

	// Refresh accounts when screen gains focus
	useFocusEffect(
		useCallback(() => {
			fetchAccounts();
		}, [])
	);

	const fetchAccounts = async () => {
		try {
			setIsLoading(true);
			const response = await accountService.getAccounts();

			if (response.success && response.data) {
				setAccounts(response.data);
				// Fetch cards for all accounts
				if (response.data.length > 0) {
					await fetchCardsForAllAccounts(response.data);
				}
			} else {
				console.error("Failed to fetch accounts:", response.error);
			}
		} catch (error) {
			console.error("Error fetching accounts:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchCardsForAllAccounts = async (accountList: Account[]) => {
		try {
			setIsLoadingCards(true);

			// Fetch cards for all accounts in parallel
			const cardPromises = accountList.map((account) =>
				cardService.getCardsByAccountId(account.accountId)
			);

			const cardResponses = await Promise.all(cardPromises);

			// Combine all cards from all accounts
			const allCards: Card[] = [];
			cardResponses.forEach((response) => {
				if (response.success && response.data) {
					allCards.push(...response.data);
				}
			});

			setCards(allCards);
		} catch (error) {
			console.error("Error fetching cards:", error);
			setCards([]);
		} finally {
			setIsLoadingCards(false);
		}
	};

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const userAnimatedStyle = useAnimatedStyle(() => ({
		opacity: userOpacity.value,
		transform: [{ scale: userScale.value }],
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
	}));

	const renderAccountCard = (account: Account) => (
		<AccountCardItem
			key={account.accountId}
			accountName={`Account`}
			accountNumber={account.accountNumber}
			balance={`$${account.balance.toFixed(2)}`}
			branch="Main Branch"
		/>
	);

	const renderBankCard = (card: BankCardData) => (
		<CreditCardItem
			key={card.id}
			cardName={card.cardName}
			cardNumber={card.cardNumber}
			cardType={card.cardType}
			expiryDate={card.expiryDate}
			cardHolder={card.cardHolder}
			cardLimit={card.cardLimit}
			availableCredit={card.availableCredit}
			onPress={() =>
				router.push({
					pathname: "/(account)/cardDetail",
					params: { cardId: card.id },
				})
			}
		/>
	);

	const renderCard = (card: Card) => (
		<CardItem
			key={card.cardId}
			card={card}
			onPress={() =>
				router.push({
					pathname: "/(account)/cardDetail",
					params: { cardId: card.cardId },
				})
			}
		/>
	);

	return (
		<ScreenContainer backgroundColor={colors.neutral.neutral6}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor="#FFFFFF"
			/>

			{/* Navigation Header */}
			<Animated.View style={[styles.header, headerAnimatedStyle]}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}>
					<CaretLeftIcon
						size={scale(16)}
						color="#000000"
						weight="regular"
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Account and card</Text>
			</Animated.View>

			{/* Tabs */}
			<Animated.View
				entering={FadeIn.delay(100).duration(400)}
				style={styles.tabsContainer}>
				<TouchableOpacity
					style={[
						styles.tab,
						activeTab === "account" && styles.tabActive,
					]}
					onPress={() => setActiveTab("account")}>
					<Text
						style={[
							styles.tabText,
							activeTab === "account" && styles.tabTextActive,
						]}>
						Account
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.tab,
						activeTab === "card" && styles.tabActive,
					]}
					onPress={() => setActiveTab("card")}>
					<Text
						style={[
							styles.tabText,
							activeTab === "card" && styles.tabTextActive,
						]}>
						Card
					</Text>
				</TouchableOpacity>
			</Animated.View>

			{/* User Avatar and Name */}
			<Animated.View style={[styles.userSection, userAnimatedStyle]}>
				<UserAvatar
					size={scale(100)}
					backgroundColor={colors.primary.primary1}
					textColor={colors.neutral.neutral6}
				/>
				<Text style={styles.userName}>{user.fullName}</Text>
			</Animated.View>

			{/* Account Cards List */}
			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator
						size="large"
						color={colors.primary.primary1}
					/>
					<Text style={styles.loadingText}>Loading accounts...</Text>
				</View>
			) : (
				<AnimatedScrollView
					style={[styles.scrollView, contentAnimatedStyle]}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}>
					{activeTab === "account" ? (
						accounts.length > 0 ? (
							accounts.map((account) =>
								renderAccountCard(account),
							)
						) : (
							<Text style={styles.emptyText}>
								No accounts found
							</Text>
						)
					) : isLoadingCards ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator
								size="large"
								color={colors.primary.primary1}
							/>
							<Text style={styles.loadingText}>
								Loading cards...
							</Text>
						</View>
					) : cards.length > 0 ? (
						cards.map((card) => renderCard(card))
					) : (
						<Text style={styles.emptyText}>No cards found</Text>
					)}
				</AnimatedScrollView>
			)}

			{/* Floating Action Button */}
			<TouchableOpacity
				style={styles.fab}
				onPress={() => router.push("/(account)/addAccount")}
				activeOpacity={0.8}>
				<Plus size={scale(24)} color={colors.neutral.neutral6} weight="bold" />
			</TouchableOpacity>

			{/* Bottom Indicator */}
			<View style={styles.bottomIndicator}>
				<View style={styles.indicator} />
			</View>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing(24),
		paddingVertical: spacing(16),
		height: scale(53),
	},
	backButton: {
		width: scale(16),
		height: scale(16),
		justifyContent: "center",
		alignItems: "center",
		marginRight: spacing(16),
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(20),
		fontWeight: "600",
		lineHeight: fontSize(28),
		color: colors.neutral.neutral1,
	},
	tabsContainer: {
		flexDirection: "row",
		paddingHorizontal: spacing(24),
		marginTop: spacing(8),
		marginBottom: spacing(24),
		backgroundColor: colors.primary.primary4,
		borderRadius: scale(18),
		padding: spacing(4),
		marginHorizontal: spacing(24),
	},
	tab: {
		flex: 1,
		height: scale(48),
		backgroundColor: "transparent",
		borderRadius: scale(14),
		justifyContent: "center",
		alignItems: "center",
	},
	tabActive: {
		backgroundColor: colors.primary.primary1,
		shadowColor: colors.primary.primary1,
		shadowOffset: {
			width: 0,
			height: scale(4),
		},
		shadowOpacity: 0.25,
		shadowRadius: scale(8),
		elevation: 5,
	},
	tabText: {
		fontFamily: "Poppins",
		fontSize: fontSize(16),
		fontWeight: "600",
		lineHeight: fontSize(24),
		color: colors.primary.primary2,
	},
	tabTextActive: {
		color: colors.neutral.neutral6,
		fontWeight: "700",
	},
	userSection: {
		alignItems: "center",
		marginBottom: spacing(20),
		paddingHorizontal: spacing(24),
		paddingVertical: spacing(20),
		backgroundColor: "rgba(74, 63, 219, 0.03)",
		marginHorizontal: spacing(24),
		borderRadius: scale(20),
	},
	userName: {
		fontFamily: "Poppins",
		fontSize: fontSize(18),
		fontWeight: "700",
		lineHeight: fontSize(26),
		color: colors.primary.primary1,
		marginTop: spacing(16),
		letterSpacing: 0.3,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: spacing(24),
		paddingBottom: spacing(50),
	},
	bottomIndicator: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: scale(34),
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.neutral.neutral6,
	},
	indicator: {
		width: scale(134),
		height: scale(5),
		borderRadius: scale(2.5),
		backgroundColor: colors.neutral.neutral4,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: spacing(40),
	},
	loadingText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "500",
		color: colors.neutral.neutral3,
		marginTop: spacing(12),
	},
	emptyText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "500",
		color: colors.neutral.neutral3,
		textAlign: "center",
		marginTop: spacing(20),
	},
	fab: {
		position: "absolute",
		bottom: spacing(50),
		right: spacing(24),
		width: scale(56),
		height: scale(56),
		borderRadius: scale(28),
		backgroundColor: colors.primary.primary1,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.3,
		shadowRadius: scale(8),
		elevation: 8,
	},
});

export default AccountCard;
