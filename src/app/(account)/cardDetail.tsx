import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
	CaretLeft,
	User,
	Wallet,
	Copy,
	Eye,
} from "phosphor-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import colors from "@/constants/colors";
import { ScreenContainer, CreditCardItem } from "@/components";

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

const CardDetail = () => {
	const router = useRouter();
	const params = useLocalSearchParams();

	// Mock data - In real app, fetch based on params.id
	const cardData: CardDetailData = {
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
	};

	const handleCopyAccountNumber = () => {
		Alert.alert(
			"Đã sao chép",
			"Số tài khoản đã được sao chép vào clipboard",
		);
	};

	return (
		<ScreenContainer backgroundColor={colors.neutral.neutral6}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor={colors.neutral.neutral6}
			/>

			{/* Content */}
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}>
				{/* Bank Card */}
				<View style={styles.cardContainer}>
					<CreditCardItem
						cardName={cardData.cardName}
						cardNumber={cardData.cardNumber}
						cardType={cardData.cardType}
						expiryDate={cardData.expiryDate}
						cardHolder={cardData.cardHolder}
						cardLimit={cardData.cardLimit}
						availableCredit={cardData.availableCredit}
					/>
				</View>

				{/* Account Information */}
				<Animated.View
					entering={FadeInDown.delay(400).duration(400).springify()}
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
						<Text style={styles.infoValue}>{cardData.cardHolder}</Text>
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
								{cardData.linkedAccountNumber}
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
					<TouchableOpacity style={styles.showInfoButton}>
						<Text style={styles.showInfoText}>Hiển thông tin</Text>
						<Eye
							size={20}
							color={colors.neutral.neutral6}
							weight="regular"
						/>
					</TouchableOpacity>
				</Animated.View>
			</ScrollView>

			{/* Bottom Indicator */}
			<View style={styles.bottomIndicator}>
				<View style={styles.indicator} />
			</View>
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: 20,
		paddingBottom: 120,
	},
	cardContainer: {
		paddingHorizontal: 24,
		marginBottom: 24,
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
});

export default CardDetail;
