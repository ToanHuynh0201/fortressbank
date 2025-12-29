import React, { useState, useRef, useCallback, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	Dimensions,
	FlatList,
	ViewToken,
	ActivityIndicator,
	Clipboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
	CaretLeft,
	User,
	Wallet,
	Copy,
	CreditCard,
	Lock,
	LockOpen,
	Eye,
	EyeSlash,
} from "phosphor-react-native";
import Animated, {
	FadeInDown,
	useSharedValue,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	interpolate,
	Extrapolate,
	SharedValue,
	withTiming,
	Easing,
} from "react-native-reanimated";
import colors from "@/constants/colors";
import { scale, fontSize, spacing } from '@/utils/responsive';
import {
	ScreenContainer,
	CreditCardItem,
	CardItem,
	ConfirmationModal,
	SuccessModal,
} from "@/components";
import AlertModal from "@/components/common/AlertModal";
import { cardService } from "@/services/cardService";
import { accountService } from "@/services/accountService";
import { biometricService } from "@/services/biometricService";
import type { Card } from "@/types/card";
import type { Account } from "@/services/accountService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CardDetailData {
	id: string;
	cardName: string;
	cardNumber: string;
	cardType: "Visa" | "Mastercard" | "American Express";
	expiryDate: string;
	cardHolder: string;
	cardLimit: string;
	availableCredit: string;
	linkedAccountNumber: string;
	linkedAccountName: string;
}

// Separate component for card item to use hooks properly
const CardItemComponent = React.memo(
	({
		item,
		index,
		scrollX,
	}: {
		item: Card;
		index: number;
		scrollX: SharedValue<number>;
	}) => {
		const cardAnimatedStyle = useAnimatedStyle(() => {
			const inputRange = [
				(index - 1) * SCREEN_WIDTH,
				index * SCREEN_WIDTH,
				(index + 1) * SCREEN_WIDTH,
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
				style={[styles.cardItemContainer, cardAnimatedStyle]}>
				<CardItem card={item} />
			</Animated.View>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison - only re-render if item changes, ignore scrollX changes
		return (
			prevProps.item.cardId === nextProps.item.cardId &&
			prevProps.index === nextProps.index
		);
	},
);

const CardDetail = () => {
	const router = useRouter();
	const params = useLocalSearchParams();
	const cardId = params.cardId as string;

	const headerOpacity = useSharedValue(0);
	const [cards, setCards] = useState<Card[]>([]);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [isLockAction, setIsLockAction] = useState(false);
	const [showAccountNumber, setShowAccountNumber] = useState(false);
	const [hasAuthenticatedForAccount, setHasAuthenticatedForAccount] = useState(false);
	const flatListRef = useRef<FlatList>(null);
	const scrollX = useSharedValue(0);

	// Alert Modal states
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: '',
		message: '',
		variant: 'info' as 'info' | 'success' | 'error' | 'warning',
	});

	const currentCard = cards[currentCardIndex];

	useEffect(() => {
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});

		// Fetch all cards and accounts
		fetchAllData();
	}, []);

	const fetchAllData = async () => {
		try {
			setIsLoading(true);

			// Fetch accounts first
			const accountsResponse = await accountService.getAccounts();
			if (accountsResponse.success && accountsResponse.data) {
				setAccounts(accountsResponse.data);

				// Fetch cards for all accounts
				const cardPromises = accountsResponse.data.map(
					(account: Account) =>
						cardService.getCardsByAccountId(account.accountId),
				);

				const cardResponses = await Promise.all(cardPromises);

				// Combine all cards
				const allCards: Card[] = [];
				cardResponses.forEach((response) => {
					if (response.success && response.data) {
						allCards.push(...response.data);
					}
				});

				setCards(allCards);

				// Find the index of the current card
				if (cardId) {
					const index = allCards.findIndex(
						(card) => card.cardId === cardId,
					);
					if (index !== -1) {
						setCurrentCardIndex(index);
						// Scroll to the current card
						setTimeout(() => {
							flatListRef.current?.scrollToIndex({
								index,
								animated: false,
							});
						}, 100);
					}
				}
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Animated scroll handler for FlatList
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	// Scroll handler for main ScrollView to control header opacity
	const mainScrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			const offsetY = event.contentOffset.y;
			headerOpacity.value = offsetY > 50 ? 1 : offsetY / 50;
		},
	});

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	// Handle viewable items change
	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0].index !== null) {
				setCurrentCardIndex(viewableItems[0].index);
			}
		},
	).current;

	const viewabilityConfig = useRef({
		itemVisiblePercentThreshold: 50,
	}).current;

	// Helper function to format expiry date
	const formatExpiryDate = (dateString: string) => {
		const date = new Date(dateString);
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = String(date.getFullYear()).slice(-2);
		return `${month}/${year}`;
	};

	// Helper function to get linked account (for now, just return first account)
	// In real app, you would need to link card to specific account via API
	const getLinkedAccount = () => {
		return accounts.length > 0 ? accounts[0] : null;
	};

	// Render each card item - memoized to prevent re-renders
	const renderCardItem = useCallback(
		({ item, index }: { item: Card; index: number }) => {
			return (
				<CardItemComponent
					item={item}
					index={index}
					scrollX={scrollX}
				/>
			);
		},
		[],
	);

	// Key extractor
	const keyExtractor = (item: Card) => item.cardId;

	// Get item layout for optimization
	const getItemLayout = (_: any, index: number) => ({
		length: SCREEN_WIDTH,
		offset: SCREEN_WIDTH * index,
		index,
	});

	// Mask account number (show only last 4 digits)
	const maskAccountNumber = (accountNumber: string) => {
		if (!accountNumber) return "";
		const lastFour = accountNumber.slice(-4);
		const maskedPart = "•".repeat(accountNumber.length - 4);
		return `${maskedPart}${lastFour}`;
	};

	const handleToggleAccountNumber = async () => {
		// If showing account number, just hide it
		if (showAccountNumber) {
			setShowAccountNumber(false);
			return;
		}

		// If not authenticated yet, require biometric authentication
		if (!hasAuthenticatedForAccount) {
			try {
				// Check if biometric is available
				const isAvailable = await biometricService.isBiometricAvailable();

				if (!isAvailable) {
					setAlertModal({
						visible: true,
						title: "Biometric Not Available",
						message: "Please enable biometric authentication in your device settings to view account number.",
						variant: 'warning',
					});
					return;
				}

				// Authenticate with biometric
				const authenticated = await biometricService.authenticate();

				if (authenticated) {
					setHasAuthenticatedForAccount(true);
					setShowAccountNumber(true);
				} else {
					setAlertModal({
						visible: true,
						title: "Authentication Failed",
						message: "Please try again to view account number.",
						variant: 'error',
					});
				}
			} catch (error) {
				console.error("Biometric authentication error:", error);
				setAlertModal({
					visible: true,
					title: "Error",
					message: "Failed to authenticate. Please try again.",
					variant: 'error',
				});
			}
		} else {
			// Already authenticated, just toggle
			setShowAccountNumber(true);
		}
	};

	const handleCopyAccountNumber = async () => {
		// If not authenticated yet, require biometric authentication
		if (!hasAuthenticatedForAccount) {
			try {
				// Check if biometric is available
				const isAvailable = await biometricService.isBiometricAvailable();

				if (!isAvailable) {
					setAlertModal({
						visible: true,
						title: "Biometric Not Available",
						message: "Please enable biometric authentication in your device settings to copy account number.",
						variant: 'warning',
					});
					return;
				}

				// Authenticate with biometric
				const authenticated = await biometricService.authenticate();

				if (authenticated) {
					setHasAuthenticatedForAccount(true);
					setShowAccountNumber(true);
					if (linkedAccount) {
						Clipboard.setString(linkedAccount.accountNumber);
						setAlertModal({
							visible: true,
							title: "Copied",
							message: "Account number has been copied to clipboard",
							variant: 'success',
						});
					}
				} else {
					setAlertModal({
						visible: true,
						title: "Authentication Failed",
						message: "Please try again to copy account number.",
						variant: 'error',
					});
				}
			} catch (error) {
				console.error("Biometric authentication error:", error);
				setAlertModal({
					visible: true,
					title: "Error",
					message: "Failed to authenticate. Please try again.",
					variant: 'error',
				});
			}
		} else {
			// Already authenticated, just copy
			if (linkedAccount) {
				Clipboard.setString(linkedAccount.accountNumber);
				setAlertModal({
					visible: true,
					title: "Copied",
					message: "Account number has been copied to clipboard",
					variant: 'success',
				});
			}
		}
	};

	const handleToggleLockCard = () => {
		setShowConfirmModal(true);
	};

	const handleConfirmToggleLock = async () => {
		setShowConfirmModal(false);
		const isLocked = currentCard.status === "LOCKED";
		const action = isLocked ? "unlocked" : "locked";

		try {
			// Call API to lock/unlock card
			const response = await cardService.toggleLock(currentCard.cardId);

			if (response.success) {
				// Update local card status
				const updatedCards = cards.map((card) => {
					if (card.cardId === currentCard.cardId) {
						return {
							...card,
							status: isLocked ? "ACTIVE" : "LOCKED",
						} as Card;
					}
					return card;
				});
				setCards(updatedCards);

				// Show success modal
				setIsLockAction(!isLocked);
				setShowSuccessModal(true);
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: response.error || `Failed to ${action} card`,
					variant: 'error',
				});
			}
		} catch (error) {
			console.error("Toggle lock error:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: `Failed to ${action} card. Please try again.`,
				variant: 'error',
			});
		}
	};

	const handleCancelToggleLock = () => {
		setShowConfirmModal(false);
	};

	const handleCloseSuccessModal = () => {
		setShowSuccessModal(false);
		router.back();
	};

	const linkedAccount = getLinkedAccount();

	// Show loading state
	if (isLoading || !currentCard) {
		return (
			<ScreenContainer backgroundColor={colors.neutral.neutral6}>
				<StatusBar
					barStyle="dark-content"
					backgroundColor={colors.neutral.neutral6}
				/>
				<View style={styles.loadingContainer}>
					<ActivityIndicator
						size="large"
						color={colors.primary.primary1}
					/>
					<Text style={styles.loadingText}>
						Loading card details...
					</Text>
				</View>
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer backgroundColor={colors.neutral.neutral6}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor={colors.neutral.neutral6}
			/>
			{/* Navigation Header */}
			<Animated.View style={[styles.header, headerAnimatedStyle]}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}>
					<CaretLeft
						size={scale(24)}
						color={colors.neutral.neutral1}
						weight="regular"
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Card Details</Text>
			</Animated.View>
			{/* Content */}
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				onScroll={mainScrollHandler}
				scrollEventThrottle={16}>
				{/* Bank Card Carousel */}
				<Animated.FlatList
					ref={flatListRef}
					data={cards}
					renderItem={renderCardItem}
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

				{/* Card Indicators */}
				{cards.length > 1 && (
					<View style={styles.cardIndicators}>
						{cards.map((_, index) => (
							<View
								key={index}
								style={[
									styles.indicatorDot,
									index === currentCardIndex &&
										styles.indicatorDotActive,
								]}
							/>
						))}
					</View>
				)}

				{/* Account Information */}
				<Animated.View
					key={`info-${currentCardIndex}`}
					entering={FadeInDown.delay(100).duration(300)}
					style={styles.accountInfoContainer}>
					{/* Card Owner Name */}
					<View style={styles.infoRow}>
						<View style={styles.infoLabelContainer}>
							<User
								size={scale(16)}
								color={colors.neutral.neutral2}
								weight="regular"
							/>
							<Text style={styles.infoLabel}>Card Owner</Text>
						</View>
						<Text style={styles.infoValue}>
							{currentCard.cardHolderName}
						</Text>
					</View>

					{/* Card Status */}
					<View style={styles.infoRow}>
						<View style={styles.infoLabelContainer}>
							<CreditCard
								size={scale(16)}
								color={colors.neutral.neutral2}
								weight="regular"
							/>
							<Text style={styles.infoLabel}>Card Status</Text>
						</View>
						<Text
							style={[
								styles.infoValue,
								{
									color:
										currentCard.status === "ACTIVE"
											? "#10B981"
											: currentCard.status === "LOCKED"
											? "#EF4444"
											: "#6B7280",
								},
							]}>
							{currentCard.status}
						</Text>
					</View>

					{/* Card Type */}
					<View style={styles.infoRow}>
						<View style={styles.infoLabelContainer}>
							<Wallet
								size={scale(16)}
								color={colors.neutral.neutral2}
								weight="regular"
							/>
							<Text style={styles.infoLabel}>Card Type</Text>
						</View>
						<Text style={styles.infoValue}>
							{currentCard.cardType}
						</Text>
					</View>

					{/* Linked Account Number */}
					{linkedAccount && (
						<View style={styles.infoRow}>
							<View style={styles.infoLabelContainer}>
								<Wallet
									size={scale(16)}
									color={colors.neutral.neutral2}
									weight="regular"
								/>
								<Text style={styles.infoLabel}>
									Linked Account Number
								</Text>
							</View>
							<View style={styles.accountNumberContainer}>
								<Text style={styles.infoValue}>
									{showAccountNumber
										? linkedAccount.accountNumber
										: maskAccountNumber(linkedAccount.accountNumber)}
								</Text>
								<View style={styles.accountNumberActions}>
									<TouchableOpacity
										onPress={handleToggleAccountNumber}
										style={styles.eyeIconButton}>
										{showAccountNumber ? (
											<Eye
												size={scale(18)}
												color={colors.primary.primary1}
												weight="bold"
											/>
										) : (
											<EyeSlash
												size={scale(18)}
												color={colors.neutral.neutral3}
												weight="bold"
											/>
										)}
									</TouchableOpacity>
									<TouchableOpacity
										onPress={handleCopyAccountNumber}
										style={styles.copyButton}>
										<Copy
											size={scale(18)}
											color={colors.primary.primary1}
											weight="regular"
										/>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}

					{/* Lock/Unlock Card Button */}
					<TouchableOpacity
						style={[
							styles.lockButton,
							currentCard.status === "LOCKED" &&
								styles.unlockButton,
						]}
						onPress={handleToggleLockCard}>
						{currentCard.status === "LOCKED" ? (
							<LockOpen
								size={scale(20)}
								color={colors.neutral.neutral6}
								weight="bold"
							/>
						) : (
							<Lock
								size={scale(20)}
								color={colors.neutral.neutral6}
								weight="bold"
							/>
						)}
						<Text style={styles.lockButtonText}>
							{currentCard.status === "LOCKED"
								? "Unlock Card"
								: "Lock Card"}
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</ScrollView>

			{/* Confirmation Modal */}
			<ConfirmationModal
				visible={showConfirmModal}
				title={
					currentCard?.status === "LOCKED"
						? "Unlock Card"
						: "Lock Card"
				}
				message={
					currentCard?.status === "LOCKED"
						? "Are you sure you want to unlock this card?"
						: "Are you sure you want to lock this card?"
				}
				confirmText={
					currentCard?.status === "LOCKED" ? "Unlock" : "Lock"
				}
				cancelText="Cancel"
				confirmButtonVariant={
					currentCard?.status === "LOCKED" ? "primary" : "danger"
				}
				onConfirm={handleConfirmToggleLock}
				onCancel={handleCancelToggleLock}
			/>

			{/* Success Modal */}
			<SuccessModal
				visible={showSuccessModal}
				title="Success!"
				subtitle={
					isLockAction
						? "Your card has been locked successfully"
						: "Your card has been unlocked successfully"
				}
				details={[
					{
						label: "Card Number",
						value: currentCard?.cardNumber || "",
					},
					{
						label: "Card Holder",
						value: currentCard?.cardHolderName || "",
					},
					{
						label: "Status",
						value: isLockAction ? "LOCKED" : "ACTIVE",
					},
				]}
				buttonText="Done"
				onClose={handleCloseSuccessModal}
			/>

			{/* Alert Modal */}
			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing(24),
		paddingVertical: spacing(16),
		height: scale(60),
		backgroundColor: colors.neutral.neutral6,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	backButton: {
		width: scale(40),
		height: scale(40),
		justifyContent: "center",
		alignItems: "center",
		marginRight: spacing(8),
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(20),
		fontWeight: "600",
		lineHeight: fontSize(28),
		color: colors.neutral.neutral1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: spacing(20),
		paddingBottom: spacing(120),
	},
	flatList: {
		marginBottom: spacing(16),
		height: scale(240),
		flexGrow: 0,
	},
	flatListContent: {
		paddingHorizontal: 0,
	},
	cardItemContainer: {
		width: SCREEN_WIDTH,
		height: scale(240),
		paddingHorizontal: spacing(24),
		justifyContent: "center",
	},
	cardIndicators: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: spacing(8),
		marginBottom: spacing(24),
		paddingHorizontal: spacing(24),
	},
	indicatorDot: {
		width: scale(8),
		height: scale(8),
		borderRadius: scale(4),
		backgroundColor: colors.neutral.neutral4,
	},
	indicatorDotActive: {
		width: scale(24),
		backgroundColor: colors.primary.primary1,
	},
	accountInfoContainer: {
		backgroundColor: colors.neutral.neutral6,
		marginHorizontal: spacing(24),
		borderRadius: scale(16),
		padding: spacing(20),
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
		shadowColor: colors.primary.primary1,
		shadowOffset: {
			width: 0,
			height: scale(4),
		},
		shadowOpacity: 0.08,
		shadowRadius: scale(12),
		elevation: 3,
	},
	infoRow: {
		marginBottom: spacing(20),
	},
	infoLabelContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(8),
		marginBottom: spacing(8),
	},
	infoLabel: {
		fontFamily: "Poppins",
		fontSize: fontSize(13),
		fontWeight: "500",
		color: colors.neutral.neutral2,
	},
	infoValue: {
		fontFamily: "Poppins",
		fontSize: fontSize(16),
		fontWeight: "600",
		color: colors.neutral.neutral1,
		letterSpacing: 0.5,
	},
	accountNumberContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	accountNumberActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(8),
	},
	eyeIconButton: {
		padding: spacing(8),
		backgroundColor: colors.neutral.neutral5,
		borderRadius: scale(8),
	},
	copyButton: {
		padding: spacing(8),
		backgroundColor: colors.primary.primary4,
		borderRadius: scale(8),
	},
	lockButton: {
		backgroundColor: "#EF4444",
		borderRadius: scale(12),
		paddingVertical: spacing(14),
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing(10),
		marginTop: spacing(8),
		shadowColor: "#EF4444",
		shadowOffset: {
			width: 0,
			height: scale(4),
		},
		shadowOpacity: 0.25,
		shadowRadius: scale(8),
		elevation: 5,
	},
	unlockButton: {
		backgroundColor: "#10B981",
		shadowColor: "#10B981",
	},
	lockButtonText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "600",
		color: colors.neutral.neutral6,
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
		paddingVertical: spacing(60),
	},
	loadingText: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "500",
		color: colors.neutral.neutral3,
		marginTop: spacing(12),
	},
});

export default CardDetail;
