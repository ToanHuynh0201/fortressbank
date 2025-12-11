import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	Easing,
	FadeIn,
} from "react-native-reanimated";
import { CaretLeftIcon } from "phosphor-react-native";
import colors from "@/constants/colors";
import {
	ScreenContainer,
	UserAvatar,
	AccountCardItem,
	CreditCardItem,
} from "@/components";
import { useAuth } from "@/hooks";

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
	}, []);

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

	const renderAccountCard = (account: AccountCardData) => (
		<AccountCardItem
			key={account.id}
			accountName={account.accountName}
			accountNumber={account.accountNumber}
			balance={account.balance}
			branch={account.branch}
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
						size={16}
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
					size={100}
					backgroundColor={colors.primary.primary1}
					textColor={colors.neutral.neutral6}
				/>
				<Text style={styles.userName}>{user.fullName}</Text>
			</Animated.View>

			{/* Account Cards List */}
			<AnimatedScrollView
				style={[styles.scrollView, contentAnimatedStyle]}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}>
				{activeTab === "account"
					? accountsData.map((account) => renderAccountCard(account))
					: cardsData.map((card) => renderBankCard(card))}
			</AnimatedScrollView>

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
		paddingHorizontal: 24,
		paddingVertical: 16,
		height: 53,
	},
	backButton: {
		width: 16,
		height: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "600",
		lineHeight: 28,
		color: colors.neutral.neutral1,
	},
	tabsContainer: {
		flexDirection: "row",
		paddingHorizontal: 24,
		marginTop: 8,
		marginBottom: 24,
		backgroundColor: colors.primary.primary4,
		borderRadius: 18,
		padding: 4,
		marginHorizontal: 24,
	},
	tab: {
		flex: 1,
		height: 48,
		backgroundColor: "transparent",
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
	},
	tabActive: {
		backgroundColor: colors.primary.primary1,
		shadowColor: colors.primary.primary1,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 5,
	},
	tabText: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "600",
		lineHeight: 24,
		color: colors.primary.primary2,
	},
	tabTextActive: {
		color: colors.neutral.neutral6,
		fontWeight: "700",
	},
	userSection: {
		alignItems: "center",
		marginBottom: 20,
		paddingHorizontal: 24,
		paddingVertical: 20,
		backgroundColor: "rgba(74, 63, 219, 0.03)",
		marginHorizontal: 24,
		borderRadius: 20,
	},
	userName: {
		fontFamily: "Poppins",
		fontSize: 18,
		fontWeight: "700",
		lineHeight: 26,
		color: colors.primary.primary1,
		marginTop: 16,
		letterSpacing: 0.3,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 24,
		paddingBottom: 50,
	},
	bottomIndicator: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 34,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.neutral.neutral6,
	},
	indicator: {
		width: 134,
		height: 5,
		borderRadius: 2.5,
		backgroundColor: colors.neutral.neutral4,
	},
});

export default AccountCard;
