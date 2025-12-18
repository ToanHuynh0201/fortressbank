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
import colors from "@/constants/colors";
import { PrimaryButton, CustomInput, AccountNumberInput } from "@/components";
import AlertModal from "@/components/common/AlertModal";
import { useForm } from "@/hooks";
import { BeneficiaryFormData } from "@/types/beneficiary";
import beneficiaryService from "@/services/beneficiaryService";
import type { AccountLookupData } from "@/services/transferService";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const AddBeneficiary = () => {
	const router = useRouter();
	const params = useLocalSearchParams();
	const beneficiaryId = params.beneficiaryId as string | undefined;

	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [beneficiaryName, setBeneficiaryName] = useState<string>("");
	const [beneficiaryAccountData, setBeneficiaryAccountData] = useState<AccountLookupData | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: '',
		message: '',
		variant: 'info' as 'info' | 'success' | 'error' | 'warning',
	});

	const headerOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);

	const { values, handleChange, setFieldValue, resetForm } =
		useForm<BeneficiaryFormData>({
			accountNumber: "",
			bankName: "FortressBank",
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
			}
		} catch (error) {
			console.error("Error loading beneficiary:", error);
			setAlertModal({
				visible: true,
				title: 'Error',
				message: 'Failed to load beneficiary data',
				variant: 'error',
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

	const isFormValid =
		values.accountNumber && beneficiaryName && values.bankName;

	const handleSave = async () => {
		if (!isFormValid) return;

		setIsSaving(true);
		try {
			if (isEditing && beneficiaryId) {
				// Update existing beneficiary (only nickname can be updated)
				await beneficiaryService.updateBeneficiary(parseInt(beneficiaryId), {
					nickName: values.nickName,
				});
				setAlertModal({
					visible: true,
					title: 'Success',
					message: 'Beneficiary updated successfully',
					variant: 'success',
				});
			} else {
				// Add new beneficiary
				await beneficiaryService.addBeneficiary({
					accountNumber: values.accountNumber,
					bankName: values.bankName,
					nickName: values.nickName,
				});
				setAlertModal({
					visible: true,
					title: 'Success',
					message: 'Beneficiary added successfully',
					variant: 'success',
				});
			}
			router.back();
		} catch (error) {
			console.error("Error saving beneficiary:", error);
			setAlertModal({
				visible: true,
				title: 'Error',
				message: isEditing
					? "Failed to update beneficiary"
					: "Failed to add beneficiary",
				variant: 'error',
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
							size={24}
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
									size={20}
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
									size={20}
									color={colors.primary.primary1}
									weight="regular"
								/>
								<Text style={styles.inputLabel}>Bank Name</Text>
							</View>
							<CustomInput
								placeholder="Bank name"
								value={values.bankName}
								onChangeText={(text) =>
									handleChange("bankName", text)
								}
								containerStyle={styles.input}
							/>
						</View>
						{/* Nickname */}
						<View style={styles.inputGroup}>
							<View style={styles.inputLabelRow}>
								<User
									size={20}
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
							loadingText={isEditing ? "Updating..." : "Saving..."}
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
	inputGroup: {
		marginBottom: 20,
	},
	inputLabelRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		gap: 8,
	},
	inputLabel: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "600",
		color: colors.neutral.neutral1,
	},
	optionalText: {
		fontFamily: "Poppins",
		fontSize: 12,
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
		paddingHorizontal: 4,
	},
});

export default AddBeneficiary;
