import React, { useEffect, useState } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	Easing,
	FadeIn,
} from "react-native-reanimated";
import {
	CaretLeft,
	User,
	Bank,
	IdentificationCard,
} from "phosphor-react-native";

interface BankOption {
	id: string;
	name: string;
	code: string;
	logo: string;
}

// Move banks outside component to avoid re-creating on every render
const BANKS: BankOption[] = [
	{
		id: "0",
		name: "FortressBank",
		code: "FORTRESS",
		logo: "🏰",
	},
	{
		id: "1",
		name: "Stripe",
		code: "STRIPE",
		logo: "💳",
	},
];
import colors from "@/constants/colors";
import { PrimaryButton, CustomInput, AccountNumberInput } from "@/components";
import AlertModal from "@/components/common/AlertModal";
import { useForm } from "@/hooks";
import { BeneficiaryFormData } from "@/types/beneficiary";
import beneficiaryService from "@/services/beneficiaryService";
import type { AccountLookupData } from "@/services/transferService";
import { scale, fontSize, spacing } from "@/utils/responsive";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const AddBeneficiary = () => {
	const router = useRouter();
	const params = useLocalSearchParams();
	const beneficiaryId = params.beneficiaryId as string | undefined;

	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [beneficiaryName, setBeneficiaryName] = useState<string>("");
	const [beneficiaryAccountData, setBeneficiaryAccountData] =
		useState<AccountLookupData | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedBank, setSelectedBank] = useState<string>("0");
	const [showBankDropdown, setShowBankDropdown] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "info" as "info" | "success" | "error" | "warning",
	});

	const headerOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);

	const { values, handleChange, setFieldValue, resetForm } =
		useForm<BeneficiaryFormData>({
			accountNumber: "",
			bankName: "",
			nickName: "",
		});

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

		// Load beneficiary data if editing
		if (beneficiaryId) {
			loadBeneficiaryData();
		}
	}, [beneficiaryId]);

	const loadBeneficiaryData = async () => {
		if (!beneficiaryId) return;

		setIsLoading(true);
		try {
			// Get data from params instead of API call
			const accountNumber = params.accountNumber as string;
			const accountName = params.accountName as string;
			const bankName = params.bankName as string;
			const nickName = params.nickName as string;

			if (accountNumber) {
				setIsEditing(true);
				setFieldValue("accountNumber", accountNumber);
				setFieldValue("bankName", bankName || "FortressBank");
				setFieldValue("nickName", nickName || "");
				setBeneficiaryName(accountName);

				// Set selected bank based on bankName
				const bank = BANKS.find(
					(b) => b.name === (bankName || "FortressBank"),
				);
				if (bank) {
					setSelectedBank(bank.id);
				}
			}
		} catch (error) {
			console.error("Error loading beneficiary:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Failed to load beneficiary data",
				variant: "error",
			});
			router.back();
		} finally {
			setIsLoading(false);
		}
	};

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ translateY: contentTranslateY.value }],
	}));

	const handleAccountFound = (accountData: AccountLookupData) => {
		setBeneficiaryName(accountData.fullName);
		setBeneficiaryAccountData(accountData);
	};

	const handleAccountNotFound = () => {
		setBeneficiaryName("");
		setBeneficiaryAccountData(null);
	};

	// Get selected bank data
	const selectedBankData = BANKS.find((b) => b.id === selectedBank);

	const isFormValid = values.accountNumber && beneficiaryName && selectedBank;

	const handleSave = async () => {
		if (!isFormValid) return;

		setIsSaving(true);
		try {
			if (isEditing && beneficiaryId) {
				// Update existing beneficiary (only nickname can be updated)
				await beneficiaryService.updateBeneficiary(
					parseInt(beneficiaryId),
					{
						nickName: values.nickName,
					},
				);
				setAlertModal({
					visible: true,
					title: "Success",
					message: "Beneficiary updated successfully",
					variant: "success",
				});
			} else {
				// Add new beneficiary
				await beneficiaryService.addBeneficiary({
					accountNumber: values.accountNumber,
					bankName: selectedBankData?.name || "FortressBank",
					nickName: values.nickName,
				});
				setAlertModal({
					visible: true,
					title: "Success",
					message: "Beneficiary added successfully",
					variant: "success",
				});
			}
			router.back();
		} catch (error) {
			console.error("Error saving beneficiary:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: isEditing
					? "Failed to update beneficiary"
					: "Failed to add beneficiary",
				variant: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SafeAreaView
			style={styles.container}
			edges={["top"]}>
			<StatusBar
				barStyle="light-content"
				backgroundColor={colors.primary.primary1}
			/>

			{/* Enhanced Header with Gradient */}
			<LinearGradient
				colors={["#4A3FDB", "#3629B7", "#2A1F8F"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.headerGradient}>
				<Animated.View style={[styles.header, headerAnimatedStyle]}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}>
						<CaretLeft
							size={scale(24)}
							color={colors.neutral.neutral6}
							weight="bold"
						/>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>
						{isEditing ? "Edit Beneficiary" : "Add Beneficiary"}
					</Text>
					<View style={styles.headerRight} />
				</Animated.View>
			</LinearGradient>

			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<AnimatedScrollView
					style={[styles.content, contentAnimatedStyle]}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled">
					{/* Icon Container */}
					<Animated.View
						entering={FadeIn.delay(100).duration(400)}
						style={styles.iconContainer}>
						<LinearGradient
							colors={[
								colors.primary.primary1,
								colors.primary.primary2,
							]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.iconGradient}>
							<User
								size={scale(48)}
								color={colors.neutral.neutral6}
								weight="regular"
							/>
						</LinearGradient>
					</Animated.View>

					{/* Title Section */}
					<Animated.View
						entering={FadeIn.delay(150).duration(400)}
						style={styles.titleSection}>
						<Text style={styles.formTitle}>
							{isEditing
								? "Update Information"
								: "New Beneficiary"}
						</Text>
						<Text style={styles.formSubtitle}>
							{isEditing
								? "Update the beneficiary details below"
								: "Add a new recipient for quick transfers"}
						</Text>
					</Animated.View>

					{/* Form Card */}
					<Animated.View
						entering={FadeIn.delay(200).duration(400)}
						style={styles.formCard}>
						{/* Account Number Input with Icon */}
						<View style={styles.inputGroup}>
							<View style={styles.inputLabelRow}>
								<IdentificationCard
									size={scale(20)}
									color={colors.primary.primary1}
									weight="regular"
								/>
								<Text style={styles.inputLabel}>
									Account Number
								</Text>
							</View>
							<AccountNumberInput
								value={values.accountNumber}
								onChangeText={(text) =>
									handleChange("accountNumber", text)
								}
								onAccountFound={handleAccountFound}
								onAccountNotFound={handleAccountNotFound}
								placeholder="Enter account number"
								containerStyle={styles.customInputContainer}
							/>
						</View>
						{/* Bank Name */}
						<View style={styles.inputGroup}>
							<View style={styles.inputLabelRow}>
								<Bank
									size={scale(20)}
									color={colors.primary.primary1}
									weight="regular"
								/>
								<Text style={styles.inputLabel}>Bank Name</Text>
							</View>
							<View style={styles.bankSelectorWrapper}>
								<TouchableOpacity
									style={styles.bankSelector}
									onPress={() =>
										setShowBankDropdown(!showBankDropdown)
									}>
									<View style={styles.bankSelectorContent}>
										<View style={styles.bankIconContainer}>
											<Text style={styles.bankLogo}>
												{selectedBankData?.logo}
											</Text>
										</View>
										<View style={styles.bankTextContainer}>
											<Text
												style={styles.bankNameSelected}>
												{selectedBankData?.name}
											</Text>
											<Text style={styles.bankCode}>
												Code: {selectedBankData?.code}
											</Text>
										</View>
										<View
											style={styles.dropdownIconWrapper}>
											<CaretLeft
												size={scale(16)}
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
											{BANKS.map((bank) => (
												<TouchableOpacity
													key={bank.id}
													style={[
														styles.bankDropdownItem,
														selectedBank ===
															bank.id &&
															styles.bankDropdownItemSelected,
													]}
													onPress={() => {
														setSelectedBank(
															bank.id,
														);
														setShowBankDropdown(
															false,
														);
													}}>
													<View
														style={
															styles.bankIconContainer
														}>
														<Text
															style={
																styles.bankLogo
															}>
															{bank.logo}
														</Text>
													</View>
													<View
														style={
															styles.bankDropdownItemInfo
														}>
														<Text
															style={
																styles.bankDropdownItemName
															}>
															{bank.name}
														</Text>
														<Text
															style={
																styles.bankDropdownItemCode
															}>
															Code: {bank.code}
														</Text>
													</View>
													{selectedBank ===
														bank.id && (
														<View
															style={
																styles.checkIcon
															}>
															<Text
																style={
																	styles.checkIconText
																}>
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
						{/* Nickname */}
						<View style={styles.inputGroup}>
							<View style={styles.inputLabelRow}>
								<User
									size={scale(20)}
									color={colors.primary.primary1}
									weight="regular"
								/>
								<Text style={styles.inputLabel}>
									Nickname{" "}
									<Text style={styles.optionalText}>
										(Optional)
									</Text>
								</Text>
							</View>
							<CustomInput
								placeholder="e.g., Mom, Best Friend..."
								value={values.nickName}
								onChangeText={(text) =>
									handleChange("nickName", text)
								}
								containerStyle={styles.input}
							/>
						</View>
					</Animated.View>

					{/* Save Button */}
					<Animated.View
						entering={FadeIn.delay(250).duration(400)}
						style={styles.buttonContainer}>
						<PrimaryButton
							title={
								isEditing
									? "Update Beneficiary"
									: "Save Beneficiary"
							}
							onPress={handleSave}
							loading={isSaving}
							loadingText={
								isEditing ? "Updating..." : "Saving..."
							}
							disabled={!isFormValid}
						/>
					</Animated.View>
				</AnimatedScrollView>
			</KeyboardAvoidingView>

			{/* Alert Modal */}
			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.primary.primary1,
	},
	headerGradient: {
		paddingHorizontal: spacing(24),
		paddingTop: spacing(16),
		paddingBottom: spacing(24),
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	backButton: {
		width: scale(40),
		height: scale(40),
		justifyContent: "center",
		alignItems: "flex-start",
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(20),
		fontWeight: "700",
		color: colors.neutral.neutral6,
		flex: 1,
		textAlign: "center",
	},
	headerRight: {
		width: scale(40),
	},
	content: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
		borderTopLeftRadius: scale(30),
		borderTopRightRadius: scale(30),
	},
	scrollContent: {
		padding: spacing(24),
		paddingTop: spacing(32),
		paddingBottom: spacing(40),
	},
	iconContainer: {
		alignItems: "center",
		marginBottom: spacing(24),
	},
	iconGradient: {
		width: scale(96),
		height: scale(96),
		borderRadius: scale(48),
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: scale(8) },
		shadowOpacity: 0.3,
		shadowRadius: scale(16),
		elevation: 8,
	},
	titleSection: {
		alignItems: "center",
		marginBottom: spacing(32),
	},
	formTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(24),
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: spacing(8),
		textAlign: "center",
	},
	formSubtitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		lineHeight: fontSize(20),
		paddingHorizontal: spacing(20),
	},
	formCard: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: scale(20),
		padding: spacing(20),
		marginBottom: spacing(24),
		borderWidth: scale(1),
		borderColor: colors.neutral.neutral5,
		shadowColor: "rgba(54, 41, 183, 0.08)",
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 1,
		shadowRadius: scale(20),
		elevation: 3,
	},
	inputGroup: {
		marginBottom: spacing(20),
	},
	inputLabelRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: spacing(8),
		gap: spacing(8),
	},
	inputLabel: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "600",
		color: colors.neutral.neutral1,
	},
	optionalText: {
		fontFamily: "Poppins",
		fontSize: fontSize(12),
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	customInputContainer: {
		marginBottom: 0,
	},
	input: {
		marginBottom: 0,
	},
	buttonContainer: {
		paddingHorizontal: spacing(4),
	},
	bankSelectorWrapper: {
		position: "relative",
	},
	bankSelector: {
		minHeight: scale(60),
		borderWidth: 1.5,
		borderColor: colors.primary.primary4,
		borderRadius: scale(14),
		paddingHorizontal: spacing(14),
		paddingVertical: spacing(10),
		backgroundColor: colors.neutral.neutral6,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: scale(2) },
		shadowOpacity: 0.04,
		shadowRadius: scale(6),
		elevation: 2,
	},
	bankSelectorContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	bankIconContainer: {
		width: scale(38),
		height: scale(38),
		borderRadius: scale(19),
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: spacing(10),
	},
	bankLogo: {
		fontSize: fontSize(20),
	},
	bankTextContainer: {
		flex: 1,
		marginRight: spacing(10),
	},
	bankNameSelected: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: spacing(3),
	},
	bankCode: {
		fontFamily: "Poppins",
		fontSize: fontSize(11),
		fontWeight: "500",
		color: colors.neutral.neutral3,
	},
	dropdownIconWrapper: {
		width: scale(24),
		height: scale(24),
		justifyContent: "center",
		alignItems: "center",
	},
	bankDropdownMenu: {
		marginTop: spacing(8),
		backgroundColor: colors.neutral.neutral6,
		borderRadius: scale(14),
		borderWidth: 1.5,
		borderColor: colors.primary.primary4,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: scale(3) },
		shadowOpacity: 0.08,
		shadowRadius: scale(10),
		elevation: 4,
		maxHeight: scale(240),
		overflow: "hidden",
	},
	bankDropdownScroll: {
		maxHeight: scale(240),
	},
	bankDropdownItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: spacing(10),
		paddingHorizontal: spacing(14),
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
		fontSize: fontSize(14),
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: spacing(4),
	},
	bankDropdownItemCode: {
		fontFamily: "Poppins",
		fontSize: fontSize(12),
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	checkIcon: {
		width: scale(28),
		height: scale(28),
		borderRadius: scale(14),
		backgroundColor: colors.primary.primary1,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: scale(2) },
		shadowOpacity: 0.3,
		shadowRadius: scale(4),
		elevation: 3,
	},
	checkIconText: {
		fontSize: fontSize(18),
		color: colors.neutral.neutral6,
		fontWeight: "bold",
	},
});

export default AddBeneficiary;
