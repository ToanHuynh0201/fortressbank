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
import { useRouter } from "expo-router";
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
import { CaretLeft, CreditCard } from "phosphor-react-native";
import colors from "@/constants/colors";
import {
	PrimaryButton,
	PasswordInput,
	SuccessModal,
} from "@/components";
import AlertModal from "@/components/common/AlertModal";
import { useForm, useAuth } from "@/hooks";
import { accountService, Account } from "@/services/accountService";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface AddAccountFormData {
	pin: string;
	confirmPin: string;
	accountNumberType: "auto" | "phone" | "";
}

const AddAccount = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [newAccount, setNewAccount] = useState<Account | null>(null);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: '',
		message: '',
		variant: 'info' as 'info' | 'success' | 'error' | 'warning',
	});

	const headerOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);

	const {
		values,
		handleChange,
		setFieldValue,
		errors,
		setFieldError,
		touched,
		handleBlur,
	} = useForm<AddAccountFormData>({
		pin: "",
		confirmPin: "",
		accountNumberType: "",
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
	}, []);

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ translateY: contentTranslateY.value }],
	}));

	const validateForm = () => {
		let isValid = true;

		// Validate PIN
		if (!values.pin.trim()) {
			setFieldError("pin", "PIN is required");
			isValid = false;
		} else if (values.pin.length !== 6) {
			setFieldError("pin", "PIN must be 6 digits");
			isValid = false;
		}

		// Validate confirm PIN
		if (!values.confirmPin.trim()) {
			setFieldError("confirmPin", "Confirm PIN is required");
			isValid = false;
		} else if (values.pin !== values.confirmPin) {
			setFieldError("confirmPin", "PINs do not match");
			isValid = false;
		}

		// Validate account number type
		if (!values.accountNumberType) {
			setAlertModal({
				visible: true,
				title: 'Error',
				message: 'Please select an account number type',
				variant: 'error',
			});
			isValid = false;
		}

		return isValid;
	};

	const handleCreateAccount = async () => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		try {
			const apiAccountType =
				values.accountNumberType === "auto"
					? "AUTO_GENERATE"
					: "PHONE_NUMBER";

			const response = await accountService.createAccount({
				accountNumberType: apiAccountType,
				pin: values.pin,
			});

			if (response.success && response.data) {
				setNewAccount(response.data);
				setShowSuccessModal(true);
			} else {
				setAlertModal({
					visible: true,
					title: 'Error',
					message: response.error || "Failed to create account. Please try again.",
					variant: 'error',
				});
			}
		} catch (error) {
			setAlertModal({
				visible: true,
				title: 'Error',
				message: 'Failed to create account. Please try again.',
				variant: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSuccessClose = () => {
		setShowSuccessModal(false);
		router.back();
	};

	const userPhoneNumber = user?.phoneNumber || "";
	const isFormValid =
		values.pin.length === 6 &&
		values.confirmPin.length === 6 &&
		values.pin === values.confirmPin &&
		values.accountNumberType !== "";

	const getAccountTypeLabel = () => {
		return values.accountNumberType === "auto"
			? "Auto-generated"
			: "Phone Number";
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<StatusBar
				barStyle="light-content"
				backgroundColor={colors.primary.primary1}
			/>

			{/* Header with Gradient */}
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
							size={24}
							color={colors.neutral.neutral6}
							weight="bold"
						/>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Create New Account</Text>
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
							<CreditCard
								size={48}
								color={colors.neutral.neutral6}
								weight="regular"
							/>
						</LinearGradient>
					</Animated.View>

					{/* Title Section */}
					<Animated.View
						entering={FadeIn.delay(150).duration(400)}
						style={styles.titleSection}>
						<Text style={styles.formTitle}>Create New Account</Text>
						<Text style={styles.formSubtitle}>
							Set your PIN and choose account number type
						</Text>
					</Animated.View>

					{/* Form Card */}
					<Animated.View
						entering={FadeIn.delay(200).duration(400)}
						style={styles.formCard}>
						{/* PIN Input Section */}
						<View style={styles.row}>
							<View style={styles.halfWidth}>
								<Text style={styles.label}>PIN (6 digits)</Text>
								<PasswordInput
									placeholder="Enter PIN"
									value={values.pin}
									onChangeText={(text) =>
										handleChange(
											"pin",
											text.replace(/\D/g, "").slice(0, 6)
										)
									}
									onBlur={() => handleBlur("pin")}
									keyboardType="number-pad"
									maxLength={6}
									isActive={!!values.pin}
									error={touched.pin ? errors.pin : undefined}
									containerStyle={styles.inputWrapper}
								/>
							</View>

							<View style={styles.halfWidth}>
								<Text style={styles.label}>Confirm PIN</Text>
								<PasswordInput
									placeholder="Confirm PIN"
									value={values.confirmPin}
									onChangeText={(text) =>
										handleChange(
											"confirmPin",
											text.replace(/\D/g, "").slice(0, 6)
										)
									}
									onBlur={() => handleBlur("confirmPin")}
									keyboardType="number-pad"
									maxLength={6}
									isActive={!!values.confirmPin}
									error={
										touched.confirmPin
											? errors.confirmPin
											: undefined
									}
									containerStyle={styles.inputWrapper}
								/>
							</View>
						</View>

						{/* Account Number Type Selection */}
						<Text style={styles.label}>Account Number Type</Text>
						<View style={styles.accountTypeContainer}>
							<TouchableOpacity
								style={[
									styles.accountTypeOption,
									values.accountNumberType === "auto" &&
										styles.accountTypeOptionSelected,
								]}
								onPress={() =>
									setFieldValue("accountNumberType", "auto")
								}
								disabled={isLoading}>
								<View style={styles.radioButton}>
									{values.accountNumberType === "auto" && (
										<View style={styles.radioButtonSelected} />
									)}
								</View>
								<View style={styles.accountTypeContent}>
									<Text style={styles.accountTypeTitle}>
										Auto-generate
									</Text>
									<Text style={styles.accountTypeDescription}>
										System creates unique number
									</Text>
								</View>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.accountTypeOption,
									values.accountNumberType === "phone" &&
										styles.accountTypeOptionSelected,
								]}
								onPress={() =>
									setFieldValue("accountNumberType", "phone")
								}
								disabled={isLoading}>
								<View style={styles.radioButton}>
									{values.accountNumberType === "phone" && (
										<View style={styles.radioButtonSelected} />
									)}
								</View>
								<View style={styles.accountTypeContent}>
									<Text style={styles.accountTypeTitle}>
										Use Phone Number
									</Text>
									<Text style={styles.accountTypeDescription}>
										{userPhoneNumber}
									</Text>
								</View>
							</TouchableOpacity>
						</View>
					</Animated.View>

					{/* Create Button */}
					<Animated.View
						entering={FadeIn.delay(250).duration(400)}
						style={styles.buttonContainer}>
						<PrimaryButton
							title="Create Account"
							onPress={handleCreateAccount}
							loading={isLoading}
							loadingText="Creating account..."
							disabled={!isFormValid}
						/>
					</Animated.View>
				</AnimatedScrollView>
			</KeyboardAvoidingView>

			{/* Success Modal */}
			<SuccessModal
				visible={showSuccessModal}
				title="Account Created!"
				subtitle="Your new account has been created successfully"
				details={[
					{
						label: "Account Number",
						value: newAccount?.accountNumber || "N/A",
					},
					{
						label: "Account Type",
						value: getAccountTypeLabel(),
					},
					{
						label: "Balance",
						value: `$${newAccount?.balance.toFixed(2) || "0.00"}`,
					},
				]}
				buttonText="Back to Accounts"
				onClose={handleSuccessClose}
			/>

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
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 24,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "flex-start",
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "700",
		color: colors.neutral.neutral6,
		flex: 1,
		textAlign: "center",
	},
	headerRight: {
		width: 40,
	},
	content: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	scrollContent: {
		padding: 24,
		paddingTop: 32,
		paddingBottom: 40,
	},
	iconContainer: {
		alignItems: "center",
		marginBottom: 24,
	},
	iconGradient: {
		width: 96,
		height: 96,
		borderRadius: 48,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	titleSection: {
		alignItems: "center",
		marginBottom: 32,
	},
	formTitle: {
		fontFamily: "Poppins",
		fontSize: 24,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: 8,
		textAlign: "center",
	},
	formSubtitle: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		lineHeight: 20,
		paddingHorizontal: 20,
	},
	formCard: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 20,
		padding: 20,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
		shadowColor: "rgba(54, 41, 183, 0.08)",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 1,
		shadowRadius: 20,
		elevation: 3,
	},
	row: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 20,
	},
	halfWidth: {
		flex: 1,
	},
	label: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: 8,
	},
	inputWrapper: {
		marginBottom: 0,
	},
	accountTypeContainer: {
		gap: 12,
		marginBottom: 0,
	},
	accountTypeOption: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: colors.neutral.neutral4,
		backgroundColor: colors.neutral.neutral6,
	},
	accountTypeOptionSelected: {
		borderColor: colors.primary.primary1,
		backgroundColor: colors.primary.primary4,
	},
	radioButton: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: colors.neutral.neutral3,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	radioButtonSelected: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: colors.primary.primary1,
	},
	accountTypeContent: {
		flex: 1,
	},
	accountTypeTitle: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: 2,
	},
	accountTypeDescription: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	buttonContainer: {
		paddingHorizontal: 4,
	},
});

export default AddAccount;
