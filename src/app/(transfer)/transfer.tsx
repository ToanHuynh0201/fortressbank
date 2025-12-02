import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
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
import { CaretLeft, Eye, EyeSlash, UserList } from "phosphor-react-native";
import colors from "@/constants/colors";
import {
	ScreenContainer,
	PrimaryButton,
	CustomInput,
	AccountNumberInput,
	CurrencyInput,
} from "@/components";
import { BeneficiarySelector } from "@/components/beneficiaries";
import { useForm } from "@/hooks";
import { parseCurrency } from "@/utils/currency";
import { Beneficiary } from "@/types/beneficiary";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface Account {
	id: string;
	label: string;
	fullNumber: string;
	maskedNumber: string;
	balance: number;
}

const Transfer = () => {
	const router = useRouter();
	const [selectedAccount, setSelectedAccount] = useState<string>("");
	const [showAccountDropdown, setShowAccountDropdown] = useState(false);
	const [showAccountNumbers, setShowAccountNumbers] = useState(false);
	const [beneficiaryName, setBeneficiaryName] = useState<string>("");
	const [showBeneficiarySelector, setShowBeneficiarySelector] =
		useState(false);

	const headerOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);

	useEffect(() => {
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});

		contentOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});
		contentTranslateY.value = withSpring(0, {
			damping: 20,
			stiffness: 90,
		});
	}, []);

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ translateY: contentTranslateY.value }],
	}));

	// Form fields managed by useForm hook
	const { values, handleChange, setFieldValue } = useForm({
		accountNumber: "",
		amount: "",
		content: "",
	});

	const accounts: Account[] = [
		{
			id: "1",
			label: "Checking Account",
			fullNumber: "1234 5678 9012",
			maskedNumber: "**** **** 9012",
			balance: 10000,
		},
		{
			id: "2",
			label: "Savings Account",
			fullNumber: "1234 5678 5689",
			maskedNumber: "**** **** 5689",
			balance: 25000,
		},
		{
			id: "3",
			label: "Investment Account",
			fullNumber: "5412 3456 7890",
			maskedNumber: "**** **** 7890",
			balance: 5500,
		},
		{
			id: "4",
			label: "Business Account",
			fullNumber: "9876 5432 1098",
			maskedNumber: "**** **** 1098",
			balance: 15000,
		},
	];

	// Get selected account balance
	const selectedAccountData = accounts.find((a) => a.id === selectedAccount);
	const availableBalance = selectedAccountData?.balance || 0;

	// Parse amount for validation
	const numericAmount = parseCurrency(values.amount);

	// Form validation
	const isFormValid =
		selectedAccount &&
		values.accountNumber &&
		beneficiaryName && // Must have found beneficiary
		values.amount &&
		numericAmount > 0 &&
		numericAmount <= availableBalance;

	const handleBeneficiarySelect = (beneficiary: Beneficiary) => {
		setFieldValue("accountNumber", beneficiary.accountNumber);
		setBeneficiaryName(beneficiary.accountName);
	};

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
					<CaretLeft
						size={16}
						color={colors.neutral.neutral1}
						weight="regular"
					/>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Transfer</Text>
			</Animated.View>

			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}>
				{/* Content */}
				<AnimatedScrollView
					style={[styles.scrollView, contentAnimatedStyle]}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="on-drag">
					{/* Account Selection */}
					<Animated.View
						entering={FadeIn.delay(100).duration(400)}
						style={styles.section}>
						<View style={styles.accountSelectorWrapper}>
							<TouchableOpacity
								style={styles.accountSelector}
								onPress={() =>
									setShowAccountDropdown(!showAccountDropdown)
								}>
								<View style={styles.accountSelectorContent}>
									<View style={styles.accountTextContainer}>
										{selectedAccount ? (
											<>
												<Text
													style={
														styles.accountLabelSelected
													}>
													{
														accounts.find(
															(a) =>
																a.id ===
																selectedAccount,
														)?.label
													}{" "}
													{showAccountNumbers
														? accounts.find(
																(a) =>
																	a.id ===
																	selectedAccount,
														  )?.fullNumber
														: accounts.find(
																(a) =>
																	a.id ===
																	selectedAccount,
														  )?.maskedNumber}
												</Text>
												<Text
													style={styles.balanceLabel}>
													Available balance :{" "}
													{selectedAccountData?.balance.toLocaleString()}
													$
												</Text>
											</>
										) : (
											<Text style={styles.accountLabel}>
												Choose account
											</Text>
										)}
									</View>
									<View style={styles.accountSelectorIcons}>
										{selectedAccount && (
											<TouchableOpacity
												onPress={() =>
													setShowAccountNumbers(
														!showAccountNumbers,
													)
												}
												style={styles.eyeButton}>
												{showAccountNumbers ? (
													<Eye
														size={20}
														color={
															colors.primary
																.primary1
														}
														weight="regular"
													/>
												) : (
													<EyeSlash
														size={20}
														color={
															colors.neutral
																.neutral3
														}
														weight="regular"
													/>
												)}
											</TouchableOpacity>
										)}
										<Text style={styles.dropdownIcon}>
											▼
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						</View>

						{/* Dropdown Menu */}
						{showAccountDropdown && (
							<View style={styles.dropdownMenu}>
								{accounts.map((account) => (
									<TouchableOpacity
										key={account.id}
										style={[
											styles.dropdownItem,
											selectedAccount === account.id &&
												styles.dropdownItemSelected,
										]}
										onPress={() => {
											setSelectedAccount(account.id);
											setShowAccountDropdown(false);
										}}>
										<View
											style={styles.dropdownItemContent}>
											<View style={styles.cardIcon}>
												<Text
													style={styles.cardIconText}>
													🏦
												</Text>
											</View>
											<View
												style={styles.dropdownItemInfo}>
												<Text
													style={
														styles.dropdownItemLabel
													}>
													{account.label}{" "}
													{showAccountNumbers
														? account.fullNumber
														: account.maskedNumber}
												</Text>
												<Text
													style={
														styles.dropdownItemBalance
													}>
													Available balance:{" "}
													{account.balance.toLocaleString()}
													$
												</Text>
											</View>
											{selectedAccount === account.id && (
												<View style={styles.checkIcon}>
													<Text
														style={
															styles.checkIconText
														}>
														✓
													</Text>
												</View>
											)}
										</View>
									</TouchableOpacity>
								))}

								{/* Toggle Eye in Dropdown */}
								<TouchableOpacity
									style={styles.dropdownEyeToggle}
									onPress={() =>
										setShowAccountNumbers(
											!showAccountNumbers,
										)
									}>
									{showAccountNumbers ? (
										<Eye
											size={20}
											color={colors.primary.primary1}
											weight="regular"
										/>
									) : (
										<EyeSlash
											size={20}
											color={colors.neutral.neutral3}
											weight="regular"
										/>
									)}
									<Text style={styles.dropdownEyeText}>
										{showAccountNumbers
											? "Hide account numbers"
											: "Show account numbers"}
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</Animated.View>

					{/* Transfer Form */}
					<Animated.View
						entering={FadeIn.delay(200).duration(400)}
						style={styles.formCard}>
						<View style={styles.formHeaderRow}>
							<View style={styles.formHeaderText}>
								<Text style={styles.formTitle}>
									Transfer within FortressBank
								</Text>
								<Text style={styles.formSubtitle}>
									Enter recipient information
								</Text>
							</View>

							{/* Button to open beneficiary selector */}
							<TouchableOpacity
								style={styles.beneficiaryButton}
								onPress={() =>
									setShowBeneficiarySelector(true)
								}>
								<UserList
									size={20}
									color={colors.primary.primary1}
									weight="regular"
								/>
							</TouchableOpacity>
						</View>

						{/* Account Number Input with Auto-fetch */}
						<AccountNumberInput
							value={values.accountNumber}
							onChangeText={(text) =>
								handleChange("accountNumber", text)
							}
							onBeneficiaryFound={(name) =>
								setBeneficiaryName(name)
							}
							onBeneficiaryNotFound={() => setBeneficiaryName("")}
							placeholder="Recipient account number"
						/>

						{/* Amount Input */}
						<CurrencyInput
							value={values.amount}
							onChangeText={(formatted, numeric) => {
								handleChange("amount", formatted);
							}}
							placeholder="0"
							currencySymbol="$"
							showBalance={!!selectedAccount}
							availableBalance={availableBalance}
							maxAmount={availableBalance}
						/>

						{/* Transfer Content */}
						<CustomInput
							placeholder="Transfer content"
							value={values.content}
							onChangeText={(text) =>
								handleChange("content", text)
							}
							containerStyle={styles.input}
							multiline
							numberOfLines={3}
							textAlignVertical="top"
							style={{ paddingTop: 12, height: 80 }}
						/>

						{/* Confirm Button */}
						<PrimaryButton
							title="Continue"
							onPress={() => {
								router.push("(transfer)/transferConfirmation");
							}}
							disabled={!isFormValid}
							style={styles.confirmButton}
						/>
					</Animated.View>
				</AnimatedScrollView>
			</KeyboardAvoidingView>

			{/* Beneficiary Selector Modal */}
			<BeneficiarySelector
				visible={showBeneficiarySelector}
				onClose={() => setShowBeneficiarySelector(false)}
				onSelect={handleBeneficiarySelect}
			/>
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
		backgroundColor: colors.neutral.neutral6,
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
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 24,
	},
	section: {
		paddingHorizontal: 24,
		marginBottom: 32,
		marginTop: 24,
	},
	sectionTitle: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "600",
		lineHeight: 16,
		color: colors.neutral.neutral3,
	},
	accountSelectorWrapper: {
		position: "relative",
	},
	accountSelector: {
		minHeight: 44,
		borderWidth: 1,
		borderColor: colors.neutral.neutral4,
		borderRadius: 15,
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: colors.neutral.neutral6,
	},
	accountSelectorContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	accountTextContainer: {
		flex: 1,
		marginRight: 8,
	},
	accountSelectorIcons: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	eyeButton: {
		padding: 4,
	},
	accountLabel: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "500",
		color: colors.neutral.neutral4,
	},
	accountLabelSelected: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "500",
		color: colors.neutral.neutral1,
	},
	balanceLabel: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "600",
		color: colors.primary.primary1,
		marginTop: 4,
	},
	dropdownIcon: {
		fontSize: 12,
		color: colors.neutral.neutral4,
	},
	dropdownMenu: {
		marginTop: 8,
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
		overflow: "hidden",
	},
	dropdownItem: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	dropdownItemSelected: {
		backgroundColor: colors.primary.primary4,
	},
	dropdownItemContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	cardIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	cardIconText: {
		fontSize: 20,
	},
	dropdownItemInfo: {
		flex: 1,
	},
	dropdownItemLabel: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "500",
		color: colors.neutral.neutral1,
		marginBottom: 4,
	},
	dropdownItemBalance: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	checkIcon: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: colors.primary.primary1,
		justifyContent: "center",
		alignItems: "center",
	},
	checkIconText: {
		fontSize: 16,
		color: colors.neutral.neutral6,
		fontWeight: "bold",
	},
	dropdownEyeToggle: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		gap: 8,
		backgroundColor: colors.neutral.neutral6,
		borderTopWidth: 1,
		borderTopColor: colors.neutral.neutral5,
	},
	dropdownEyeText: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "500",
		color: colors.neutral.neutral1,
	},
	formCard: {
		marginHorizontal: 7,
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 15,
		padding: 20,
		shadowColor: "rgba(54, 41, 183, 0.07)",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 1,
		shadowRadius: 30,
		elevation: 5,
	},
	formHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 20,
	},
	formHeaderText: {
		flex: 1,
	},
	formTitle: {
		fontFamily: "Poppins",
		fontSize: 18,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: 4,
	},
	formSubtitle: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	beneficiaryButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 12,
	},
	input: {
		marginBottom: 0,
	},
	confirmButton: {
		marginTop: 8,
	},
});

export default Transfer;
