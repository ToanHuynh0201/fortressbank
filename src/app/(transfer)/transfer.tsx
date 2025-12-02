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
	FadeInDown,
} from "react-native-reanimated";
import {
	CaretLeft,
	Eye,
	EyeSlash,
	UserList,
	User,
	CurrencyDollar,
	FileText,
	Bank,
} from "phosphor-react-native";
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
					<View style={styles.backButtonCircle}>
						<CaretLeft
							size={20}
							color={colors.neutral.neutral1}
							weight="bold"
						/>
					</View>
				</TouchableOpacity>
				<View style={styles.headerTitleContainer}>
					<Text style={styles.headerTitle}>Transfer Money</Text>
					<Text style={styles.headerSubtitle}>
						Send money securely
					</Text>
				</View>
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
						entering={FadeInDown.delay(100).duration(500)}
						style={styles.section}>
						<Text style={styles.sectionLabel}>From Account</Text>
						<View style={styles.accountSelectorWrapper}>
							<TouchableOpacity
								style={styles.accountSelector}
								onPress={() =>
									setShowAccountDropdown(!showAccountDropdown)
								}>
								<View style={styles.accountSelectorContent}>
									<View style={styles.accountIconContainer}>
										<Bank
											size={24}
											color={colors.primary.primary1}
											weight="duotone"
										/>
									</View>
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
													}
												</Text>
												<Text
													style={
														styles.accountNumber
													}>
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
												<View
													style={
														styles.balanceContainer
													}>
													<Text
														style={
															styles.balanceLabel
														}>
														Balance:{" "}
													</Text>
													<Text
														style={
															styles.balanceAmount
														}>
														$
														{selectedAccountData?.balance.toLocaleString()}
													</Text>
												</View>
											</>
										) : (
											<>
												<Text
													style={styles.accountLabel}>
													Select your account
												</Text>
												<Text
													style={
														styles.accountPlaceholder
													}>
													Choose an account to
													transfer from
												</Text>
											</>
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
														weight="bold"
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
										<View
											style={styles.dropdownIconWrapper}>
											<CaretLeft
												size={16}
												color={colors.neutral.neutral3}
												weight="bold"
												style={{
													transform: [
														{
															rotate: showAccountDropdown
																? "-90deg"
																: "90deg",
														},
													],
												}}
											/>
										</View>
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
						entering={FadeInDown.delay(200).duration(500)}
						style={styles.formCard}>
						<View style={styles.formHeaderRow}>
							<View style={styles.formHeaderText}>
								<Text style={styles.formTitle}>
									Recipient Details
								</Text>
								<Text style={styles.formSubtitle}>
									Enter transfer information
								</Text>
							</View>

							{/* Button to open beneficiary selector */}
							<TouchableOpacity
								style={styles.beneficiaryButton}
								onPress={() =>
									setShowBeneficiarySelector(true)
								}>
								<UserList
									size={22}
									color={colors.primary.primary1}
									weight="bold"
								/>
							</TouchableOpacity>
						</View>

						{/* Recipient Account Section */}
						<View style={styles.inputSection}>
							<View style={styles.inputLabelRow}>
								<User
									size={18}
									color={colors.primary.primary1}
									weight="bold"
								/>
								<Text style={styles.inputLabel}>
									Recipient Account
								</Text>
							</View>
							<AccountNumberInput
								value={values.accountNumber}
								onChangeText={(text) =>
									handleChange("accountNumber", text)
								}
								onBeneficiaryFound={(name) =>
									setBeneficiaryName(name)
								}
								onBeneficiaryNotFound={() =>
									setBeneficiaryName("")
								}
								placeholder="Enter account number"
							/>
						</View>

						{/* Amount Section */}
						<View style={styles.inputSection}>
							<View style={styles.inputLabelRow}>
								<CurrencyDollar
									size={18}
									color={colors.primary.primary1}
									weight="bold"
								/>
								<Text style={styles.inputLabel}>
									Transfer Amount
								</Text>
							</View>
							<CurrencyInput
								value={values.amount}
								onChangeText={(formatted, numeric) => {
									handleChange("amount", formatted);
								}}
								placeholder="0.00"
								currencySymbol="$"
								showBalance={!!selectedAccount}
								availableBalance={availableBalance}
								maxAmount={availableBalance}
							/>
						</View>

						{/* Transfer Content Section */}
						<View style={styles.inputSection}>
							<View style={styles.inputLabelRow}>
								<FileText
									size={18}
									color={colors.primary.primary1}
									weight="bold"
								/>
								<Text style={styles.inputLabel}>
									Message (Optional)
								</Text>
							</View>
							<CustomInput
								placeholder="Add a note for this transfer"
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
						</View>

						{/* Confirm Button */}
						<PrimaryButton
							title="Continue to Confirmation"
							onPress={() => {
								router.push("(transfer)/transferConfirmation");
							}}
							// disabled={!isFormValid}
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
		paddingTop: 16,
		paddingBottom: 20,
		backgroundColor: colors.neutral.neutral6,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	backButton: {
		marginRight: 16,
	},
	backButtonCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitleContainer: {
		flex: 1,
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: 22,
		fontWeight: "700",
		lineHeight: 28,
		color: colors.neutral.neutral1,
		marginBottom: 2,
	},
	headerSubtitle: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		lineHeight: 18,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 32,
	},
	section: {
		paddingHorizontal: 24,
		marginBottom: 24,
		marginTop: 24,
	},
	sectionLabel: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "700",
		lineHeight: 18,
		color: colors.neutral.neutral1,
		marginBottom: 12,
		textTransform: "uppercase",
		letterSpacing: 0.5,
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
		minHeight: 88,
		borderWidth: 2,
		borderColor: colors.primary.primary4,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 16,
		backgroundColor: colors.neutral.neutral6,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
	},
	accountSelectorContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	accountIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	accountTextContainer: {
		flex: 1,
		marginRight: 12,
	},
	accountSelectorIcons: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	eyeButton: {
		padding: 6,
		borderRadius: 8,
		backgroundColor: colors.primary.primary4,
	},
	accountLabel: {
		fontFamily: "Poppins",
		fontSize: 15,
		fontWeight: "600",
		color: colors.neutral.neutral3,
		marginBottom: 4,
	},
	accountPlaceholder: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "400",
		color: colors.neutral.neutral4,
		marginTop: 2,
	},
	accountLabelSelected: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: 4,
	},
	accountNumber: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "500",
		color: colors.neutral.neutral3,
		marginBottom: 6,
	},
	balanceContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.primary.primary4,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		alignSelf: "flex-start",
	},
	balanceLabel: {
		fontFamily: "Poppins",
		fontSize: 11,
		fontWeight: "500",
		color: colors.neutral.neutral2,
	},
	balanceAmount: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "700",
		color: colors.primary.primary1,
	},
	dropdownIconWrapper: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: colors.neutral.neutral5,
		justifyContent: "center",
		alignItems: "center",
	},
	dropdownMenu: {
		marginTop: 12,
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: colors.primary.primary4,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.12,
		shadowRadius: 16,
		elevation: 8,
		overflow: "hidden",
	},
	dropdownItem: {
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	dropdownItemSelected: {
		backgroundColor: colors.primary.primary4,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary.primary1,
	},
	dropdownItemContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	cardIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 14,
		borderWidth: 2,
		borderColor: colors.primary.primary3,
	},
	cardIconText: {
		fontSize: 22,
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
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: colors.primary.primary1,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},
	checkIconText: {
		fontSize: 18,
		color: colors.neutral.neutral6,
		fontWeight: "bold",
	},
	dropdownEyeToggle: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		paddingHorizontal: 16,
		gap: 10,
		backgroundColor: colors.primary.primary4,
		borderTopWidth: 2,
		borderTopColor: colors.neutral.neutral5,
	},
	dropdownEyeText: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "600",
		color: colors.primary.primary1,
	},
	formCard: {
		marginHorizontal: 24,
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 24,
		padding: 24,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.1,
		shadowRadius: 24,
		elevation: 8,
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
	},
	formHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 24,
		paddingBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	formHeaderText: {
		flex: 1,
	},
	formTitle: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: 6,
	},
	formSubtitle: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		lineHeight: 18,
	},
	beneficiaryButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 12,
		borderWidth: 2,
		borderColor: colors.primary.primary3,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 6,
		elevation: 3,
	},
	inputSection: {
		marginBottom: 24,
	},
	inputLabelRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
		gap: 8,
	},
	inputLabel: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		letterSpacing: 0.3,
	},
	input: {
		marginBottom: 0,
	},
	confirmButton: {
		marginTop: 12,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
});

export default Transfer;
