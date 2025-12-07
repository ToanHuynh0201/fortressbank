import React, { useState, useRef, useCallback, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	Alert,
	Dimensions,
	FlatList,
	ViewToken,
	Modal,
	Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
	CaretLeft,
	User,
	Wallet,
	Copy,
	Eye,
	EyeSlash,
	X,
	CreditCard,
	CalendarBlank,
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
import { ScreenContainer, CreditCardItem } from "@/components";

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
const CardItem = React.memo(
	({
		item,
		index,
		scrollX,
	}: {
		item: CardDetailData;
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
				<CreditCardItem
					cardName={item.cardName}
					cardNumber={item.cardNumber}
					cardType={item.cardType}
					expiryDate={item.expiryDate}
					cardHolder={item.cardHolder}
					cardLimit={item.cardLimit}
					availableCredit={item.availableCredit}
				/>
			</Animated.View>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison - only re-render if item changes, ignore scrollX changes
		return (
			prevProps.item.id === nextProps.item.id &&
			prevProps.index === nextProps.index
		);
	},
);

const CardDetail = () => {
	const router = useRouter();
	const headerOpacity = useSharedValue(0);
	// Mock data - Multiple cards for swipe functionality
	const cardsData: CardDetailData[] = [
		{
			id: "1",
			cardName: "Platinum Visa",
			cardNumber: "4532 **** **** 8765",
			cardType: "Visa",
			expiryDate: "12/26",
			cardHolder: "HUYNH NHAT TOAN",
			cardLimit: "$50,000",
			availableCredit: "$35,000",
			linkedAccountNumber: "1040868669",
			linkedAccountName: "HUYNH NHAT TOAN",
		},
		{
			id: "2",
			cardName: "Gold Mastercard",
			cardNumber: "5412 **** **** 3456",
			cardType: "Mastercard",
			expiryDate: "09/27",
			cardHolder: "HUYNH NHAT TOAN",
			cardLimit: "$30,000",
			availableCredit: "$22,000",
			linkedAccountNumber: "1040868670",
			linkedAccountName: "HUYNH NHAT TOAN",
		},
		{
			id: "3",
			cardName: "Premium Visa",
			cardNumber: "4916 **** **** 7890",
			cardType: "Visa",
			expiryDate: "03/28",
			cardHolder: "HUYNH NHAT TOAN",
			cardLimit: "$75,000",
			availableCredit: "$60,000",
			linkedAccountNumber: "1040868671",
			linkedAccountName: "HUYNH NHAT TOAN",
		},
	];

	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showCardNumber, setShowCardNumber] = useState(false);
	const flatListRef = useRef<FlatList>(null);
	const scrollX = useSharedValue(0);

	const currentCardData = cardsData[currentCardIndex];

	useEffect(() => {
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});
	});

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

	// Render each card item - memoized to prevent re-renders
	const renderCardItem = useCallback(
		({ item, index }: { item: CardDetailData; index: number }) => {
			return (
				<CardItem
					item={item}
					index={index}
					scrollX={scrollX}
				/>
			);
		},
		[],
	);

	// Key extractor
	const keyExtractor = (item: CardDetailData) => item.id;

	// Get item layout for optimization
	const getItemLayout = (_: any, index: number) => ({
		length: SCREEN_WIDTH,
		offset: SCREEN_WIDTH * index,
		index,
	});

	const handleCopyAccountNumber = () => {
		Alert.alert(
			"Đã sao chép",
			"Số tài khoản đã được sao chép vào clipboard",
		);
	};

	const handleShowDetail = () => {
		setShowDetailModal(true);
	};

	const handleCloseModal = () => {
		setShowDetailModal(false);
		setShowCardNumber(false); // Reset khi đóng modal
	};

	const toggleCardNumberVisibility = () => {
		setShowCardNumber(!showCardNumber);
	};

	const getFullCardNumber = (maskedNumber: string) => {
		// Giả sử số thẻ đầy đủ, thay thế **** bằng số thật
		// Trong thực tế, bạn cần lưu số thẻ đầy đủ ở backend
		const cardFullNumbers: { [key: string]: string } = {
			"4532 **** **** 8765": "4532 1234 5678 8765",
			"5412 **** **** 3456": "5412 7890 1234 3456",
			"4916 **** **** 7890": "4916 5555 6666 7890",
		};
		return cardFullNumbers[maskedNumber] || maskedNumber;
	};

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
						size={24}
						color={colors.neutral.neutral1}
						weight="regular"
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Chi tiết thẻ</Text>
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
					data={cardsData}
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
				<View style={styles.cardIndicators}>
					{cardsData.map((_, index) => (
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

				{/* Account Information */}
				<Animated.View
					key={`info-${currentCardIndex}`}
					entering={FadeInDown.delay(100).duration(300)}
					style={styles.accountInfoContainer}>
					{/* Card Owner Name */}
					<View style={styles.infoRow}>
						<View style={styles.infoLabelContainer}>
							<User
								size={16}
								color={colors.neutral.neutral2}
								weight="regular"
							/>
							<Text style={styles.infoLabel}>Tên chủ thẻ</Text>
						</View>
						<Text style={styles.infoValue}>
							{currentCardData.cardHolder}
						</Text>
					</View>

					{/* Linked Account Number */}
					<View style={styles.infoRow}>
						<View style={styles.infoLabelContainer}>
							<Wallet
								size={16}
								color={colors.neutral.neutral2}
								weight="regular"
							/>
							<Text style={styles.infoLabel}>
								Số tài khoản liên kết
							</Text>
						</View>
						<View style={styles.accountNumberContainer}>
							<Text style={styles.infoValue}>
								{currentCardData.linkedAccountNumber}
							</Text>
							<TouchableOpacity
								onPress={handleCopyAccountNumber}
								style={styles.copyButton}>
								<Copy
									size={18}
									color={colors.primary.primary1}
									weight="regular"
								/>
							</TouchableOpacity>
						</View>
					</View>

					{/* Show Account Info Button */}
					<TouchableOpacity
						style={styles.showInfoButton}
						onPress={handleShowDetail}>
						<Text style={styles.showInfoText}>Hiển thông tin</Text>
						<Eye
							size={20}
							color={colors.neutral.neutral6}
							weight="regular"
						/>
					</TouchableOpacity>
				</Animated.View>
			</ScrollView>

			{/* Card Detail Modal */}
			<Modal
				visible={showDetailModal}
				transparent={true}
				animationType="fade"
				onRequestClose={handleCloseModal}>
				<Pressable
					style={styles.modalOverlay}
					onPress={handleCloseModal}>
					<Pressable
						style={styles.modalContent}
						onPress={(e) => e.stopPropagation()}>
						{/* Modal Header */}
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Chi tiết thẻ</Text>
							<TouchableOpacity
								onPress={handleCloseModal}
								style={styles.closeButton}>
								<X
									size={24}
									color={colors.neutral.neutral1}
									weight="bold"
								/>
							</TouchableOpacity>
						</View>

						{/* Modal Body */}
						<View style={styles.modalBody}>
							{/* Card Number */}
							<View style={styles.detailRow}>
								<View style={styles.detailLabelContainer}>
									<CreditCard
										size={20}
										color={colors.primary.primary1}
										weight="regular"
									/>
									<Text style={styles.detailLabel}>
										Số thẻ
									</Text>
								</View>
								<View style={styles.cardNumberRow}>
									<Text style={styles.detailValue}>
										{showCardNumber
											? getFullCardNumber(
													currentCardData.cardNumber,
											  )
											: currentCardData.cardNumber}
									</Text>
									<TouchableOpacity
										onPress={toggleCardNumberVisibility}
										style={styles.eyeButton}>
										{showCardNumber ? (
											<EyeSlash
												size={20}
												color={colors.primary.primary1}
												weight="regular"
											/>
										) : (
											<Eye
												size={20}
												color={colors.primary.primary1}
												weight="regular"
											/>
										)}
									</TouchableOpacity>
								</View>
							</View>

							{/* Card Holder */}
							<View style={styles.detailRow}>
								<View style={styles.detailLabelContainer}>
									<User
										size={20}
										color={colors.primary.primary1}
										weight="regular"
									/>
									<Text style={styles.detailLabel}>
										Chủ thẻ
									</Text>
								</View>
								<Text style={styles.detailValue}>
									{currentCardData.cardHolder}
								</Text>
							</View>

							{/* Expiry Date */}
							<View style={styles.detailRow}>
								<View style={styles.detailLabelContainer}>
									<CalendarBlank
										size={20}
										color={colors.primary.primary1}
										weight="regular"
									/>
									<Text style={styles.detailLabel}>
										Ngày hết hạn
									</Text>
								</View>
								<Text style={styles.detailValue}>
									{currentCardData.expiryDate}
								</Text>
							</View>
						</View>

						{/* Modal Footer */}
						<TouchableOpacity
							style={styles.modalCloseButton}
							onPress={handleCloseModal}>
							<Text style={styles.modalCloseText}>Đóng</Text>
						</TouchableOpacity>
					</Pressable>
				</Pressable>
			</Modal>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 16,
		height: 60,
		backgroundColor: colors.neutral.neutral6,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 8,
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "600",
		lineHeight: 28,
		color: colors.neutral.neutral1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: 20,
		paddingBottom: 120,
	},
	flatList: {
		marginBottom: 16,
		height: 220,
		flexGrow: 0,
	},
	flatListContent: {
		paddingHorizontal: 0,
	},
	cardItemContainer: {
		width: SCREEN_WIDTH,
		height: 220,
		paddingHorizontal: 24,
		justifyContent: "center",
	},
	cardIndicators: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 8,
		marginBottom: 24,
		paddingHorizontal: 24,
	},
	indicatorDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.neutral.neutral4,
	},
	indicatorDotActive: {
		width: 24,
		backgroundColor: colors.primary.primary1,
	},
	accountInfoContainer: {
		backgroundColor: colors.neutral.neutral6,
		marginHorizontal: 24,
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
		shadowColor: colors.primary.primary1,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 3,
	},
	infoRow: {
		marginBottom: 20,
	},
	infoLabelContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
	},
	infoLabel: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "500",
		color: colors.neutral.neutral2,
	},
	infoValue: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		letterSpacing: 0.5,
	},
	accountNumberContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	copyButton: {
		padding: 8,
		backgroundColor: colors.primary.primary4,
		borderRadius: 8,
	},
	showInfoButton: {
		backgroundColor: colors.primary.primary1,
		borderRadius: 12,
		paddingVertical: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		marginTop: 8,
		shadowColor: colors.primary.primary1,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 5,
	},
	showInfoText: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral6,
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
	// Modal Styles
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	modalContent: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 20,
		width: "100%",
		maxWidth: 400,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.25,
		shadowRadius: 16,
		elevation: 10,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	modalTitle: {
		fontFamily: "Poppins",
		fontSize: 18,
		fontWeight: "700",
		color: colors.neutral.neutral1,
	},
	closeButton: {
		padding: 4,
	},
	modalBody: {
		padding: 20,
	},
	detailRow: {
		marginBottom: 20,
	},
	detailLabelContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 10,
	},
	detailLabel: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral2,
	},
	cardNumberRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingLeft: 30,
	},
	detailValue: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		letterSpacing: 0.5,
		flex: 1,
	},
	eyeButton: {
		padding: 8,
		backgroundColor: colors.primary.primary4,
		borderRadius: 8,
		marginLeft: 8,
	},
	modalCloseButton: {
		backgroundColor: colors.primary.primary1,
		borderRadius: 12,
		paddingVertical: 14,
		marginHorizontal: 20,
		marginBottom: 20,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 5,
	},
	modalCloseText: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral6,
	},
});

export default CardDetail;
