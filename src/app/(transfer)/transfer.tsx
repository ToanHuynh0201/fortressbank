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

interface Bank {
	id: string;
	name: string;
	code: string;
	logo: string;
}

const Transfer = () => {
	const router = useRouter();
	const [selectedAccount, setSelectedAccount] = useState<string>("");
	const [showAccountDropdown, setShowAccountDropdown] = useState(false);
	const [showAccountNumbers, setShowAccountNumbers] = useState(false);
	const [beneficiaryName, setBeneficiaryName] = useState<string>("");
	const [showBeneficiarySelector, setShowBeneficiarySelector] =
		useState(false);
	const [selectedBank, setSelectedBank] = useState<string>("");
	const [showBankDropdown, setShowBankDropdown] = useState(false);

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

	const banks: Bank[] = [
		{
			id: "1",
			name: "Vietcombank",
			code: "VCB",
			logo: "🏦",
		},
		{
			id: "2",
			name: "VietinBank",
			code: "CTG",
			logo: "🏦",
		},
		{
			id: "3",
			name: "BIDV",
			code: "BIDV",
			logo: "🏦",
		},
		{
			id: "4",
			name: "Agribank",
			code: "VBA",
			logo: "🏦",
		},
		{
			id: "5",
			name: "Techcombank",
			code: "TCB",
			logo: "🏦",
		},
		{
			id: "6",
			name: "MB Bank",
			code: "MB",
			logo: "🏦",
		},
		{
			id: "7",
			name: "ACB",
			code: "ACB",
			logo: "🏦",
		},
		{
			id: "8",
			name: "VPBank",
			code: "VPB",
			logo: "🏦",
		},
	];

	// Get selected account balance
	const selectedAccountData = accounts.find((a) => a.id === selectedAccount);
	const availableBalance = selectedAccountData?.balance || 0;

	// Parse amount for validation
	const numericAmount = parseCurrency(values.amount);

	// Get selected bank data
	const selectedBankData = banks.find((b) => b.id === selectedBank);

	// Form validation
	const isFormValid =
		selectedAccount &&
		selectedBank &&
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

						{/* Bank Selection Section */}
						<View style={styles.inputSection}>
							<View style={styles.inputLabelRow}>
								<Bank
									size={18}
									color={colors.primary.primary1}
									weight="bold"
								/>
								<Text style={styles.inputLabel}>
									Select Bank
								</Text>
							</View>
							<View style={styles.bankSelectorWrapper}>
								<TouchableOpacity
									style={styles.bankSelector}
									onPress={() =>
										setShowBankDropdown(!showBankDropdown)
									}>
									<View style={styles.bankSelectorContent}>
										{selectedBank ? (
											<>
												<View style={styles.bankIconContainer}>
													<Text style={styles.bankLogo}>
														{selectedBankData?.logo}
													</Text>
												</View>
												<View style={styles.bankTextContainer}>
													<Text style={styles.bankNameSelected}>
														{selectedBankData?.name}
													</Text>
													<Text style={styles.bankCode}>
														Code: {selectedBankData?.code}
													</Text>
												</View>
											</>
										) : (
											<>
												<View style={styles.bankIconContainer}>
													<Bank
														size={24}
														color={colors.neutral.neutral3}
														weight="regular"
													/>
												</View>
												<View style={styles.bankTextContainer}>
													<Text style={styles.bankPlaceholder}>
														Choose recipient's bank
													</Text>
												</View>
											</>
										)}
										<View style={styles.dropdownIconWrapper}>
											<CaretLeft
												size={16}
												color={colors.neutral.neutral3}
												weight="bold"
												style={{
													transform: [
														{
															rotate: showBankDropdown
																? "-90deg"
																: "90deg",
														},
													],
												}}
											/>
										</View>
									</View>
								</TouchableOpacity>

								{/* Bank Dropdown Menu */}
								{showBankDropdown && (
									<View style={styles.bankDropdownMenu}>
										<ScrollView
											style={styles.bankDropdownScroll}
											nestedScrollEnabled={true}>
											{banks.map((bank) => (
												<TouchableOpacity
													key={bank.id}
													style={[
														styles.bankDropdownItem,
														selectedBank === bank.id &&
															styles.bankDropdownItemSelected,
													]}
													onPress={() => {
														setSelectedBank(bank.id);
														setShowBankDropdown(false);
													}}>
													<View style={styles.bankIconContainer}>
														<Text style={styles.bankLogo}>
															{bank.logo}
														</Text>
													</View>
													<View style={styles.bankDropdownItemInfo}>
														<Text style={styles.bankDropdownItemName}>
															{bank.name}
														</Text>
														<Text style={styles.bankDropdownItemCode}>
															Code: {bank.code}
														</Text>
													</View>
													{selectedBank === bank.id && (
														<View style={styles.checkIcon}>
															<Text style={styles.checkIconText}>
																✓
															</Text>
														</View>
													)}
												</TouchableOpacity>
											))}
										</ScrollView>
									</View>
								)}
							</View>
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
								numberOfLines={2}
								textAlignVertical="top"
								style={{ paddingTop: 10, height: 60 }}
							/>
						</View>

						{/* Confirm Button */}
						<PrimaryButton
							title="Continue to Confirmation"
							onPress={() => {
								// Prepare transfer data
								const transferParams = {
									fromAccountId: selectedAccount,
									fromAccountLabel: selectedAccountData?.label || "",
									fromAccountNumber: selectedAccountData?.maskedNumber || "",
									toAccountNumber: values.accountNumber,
									recipientName: beneficiaryName || "Unknown",
									amount: values.amount,
									bankName: selectedBankData?.name || "",
									message: values.content,
								};

								// Navigate with params
								router.push({
									pathname: "(transfer)/transferConfirmation",
									params: transferParams,
								});
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
		paddingBottom: 20,
	},
	section: {
		paddingHorizontal: 24,
		marginBottom: 16,
		marginTop: 16,
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
		minHeight: 72,
		borderWidth: 1.5,
		borderColor: colors.primary.primary4,
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: colors.neutral.neutral6,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 3,
	},
	accountSelectorContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	accountIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 10,
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
		fontSize: 14,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: 3,
	},
	accountNumber: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "500",
		color: colors.neutral.neutral3,
		marginBottom: 4,
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
		marginTop: 8,
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 16,
		borderWidth: 1.5,
		borderColor: colors.primary.primary4,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 6,
		overflow: "hidden",
	},
	dropdownItem: {
		paddingVertical: 10,
		paddingHorizontal: 14,
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
		borderRadius: 20,
		padding: 18,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 16,
		elevation: 6,
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
	},
	formHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 16,
		paddingBottom: 14,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	formHeaderText: {
		flex: 1,
	},
	formTitle: {
		fontFamily: "Poppins",
		fontSize: 18,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: 4,
	},
	formSubtitle: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		lineHeight: 16,
	},
	beneficiaryButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 10,
		borderWidth: 1.5,
		borderColor: colors.primary.primary3,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 4,
		elevation: 2,
	},
	inputSection: {
		marginBottom: 16,
	},
	inputLabelRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		gap: 6,
	},
	inputLabel: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		letterSpacing: 0.2,
	},
	input: {
		marginBottom: 0,
	},
	confirmButton: {
		marginTop: 8,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 4,
	},
	bankSelectorWrapper: {
		position: "relative",
	},
	bankSelector: {
		minHeight: 60,
		borderWidth: 1.5,
		borderColor: colors.primary.primary4,
		borderRadius: 14,
		paddingHorizontal: 14,
		paddingVertical: 10,
		backgroundColor: colors.neutral.neutral6,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 2,
	},
	bankSelectorContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	bankIconContainer: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 10,
	},
	bankLogo: {
		fontSize: 20,
	},
	bankTextContainer: {
		flex: 1,
		marginRight: 10,
	},
	bankNameSelected: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: 3,
	},
	bankCode: {
		fontFamily: "Poppins",
		fontSize: 11,
		fontWeight: "500",
		color: colors.neutral.neutral3,
	},
	bankPlaceholder: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "500",
		color: colors.neutral.neutral3,
	},
	bankDropdownMenu: {
		marginTop: 8,
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 14,
		borderWidth: 1.5,
		borderColor: colors.primary.primary4,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.08,
		shadowRadius: 10,
		elevation: 4,
		maxHeight: 240,
		overflow: "hidden",
	},
	bankDropdownScroll: {
		maxHeight: 240,
	},
	bankDropdownItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderBottomWidth: 1,
		borderBottomColor: colors.neutral.neutral5,
	},
	bankDropdownItemSelected: {
		backgroundColor: colors.primary.primary4,
		borderLeftWidth: 4,
		borderLeftColor: colors.primary.primary1,
	},
	bankDropdownItemInfo: {
		flex: 1,
	},
	bankDropdownItemName: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: 4,
	},
	bankDropdownItemCode: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
});

export default Transfer;
