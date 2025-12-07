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
	Alert,
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
import { useForm } from "@/hooks";
import { addBeneficiary, updateBeneficiary, getBeneficiaryById } from "@/utils";
import { BeneficiaryFormData } from "@/types/beneficiary";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const AddBeneficiary = () => {
	const router = useRouter();
	const params = useLocalSearchParams();
	const beneficiaryId = params.beneficiaryId as string | undefined;

	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [beneficiaryName, setBeneficiaryName] = useState<string>("");
	const [isEditing, setIsEditing] = useState(false);

	const headerOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);

	const { values, handleChange, setFieldValue, resetForm } =
		useForm<BeneficiaryFormData>({
			accountNumber: "",
			accountName: "",
			bankName: "FortressBank",
			nickname: "",
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

	useEffect(() => {
		if (beneficiaryId) {
			loadBeneficiary();
		}
	}, [beneficiaryId]);

	const loadBeneficiary = async () => {
		if (!beneficiaryId) return;

		setIsLoading(true);
		try {
			const beneficiary = await getBeneficiaryById(beneficiaryId);
			if (beneficiary) {
				setFieldValue("accountNumber", beneficiary.accountNumber);
				setFieldValue("accountName", beneficiary.accountName);
				setFieldValue(
					"bankName",
					beneficiary.bankName || "FortressBank",
				);
				setFieldValue("nickname", beneficiary.nickname || "");
				setBeneficiaryName(beneficiary.accountName);
				setIsEditing(true);
			}
		} catch (error) {
			console.error("Error loading beneficiary:", error);
			Alert.alert("Error", "Failed to load beneficiary information");
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

	const handleBeneficiaryFound = (name: string) => {
		setBeneficiaryName(name);
		setFieldValue("accountName", name);
	};

	const handleBeneficiaryNotFound = () => {
		setBeneficiaryName("");
		setFieldValue("accountName", "");
	};

	const handleSave = async () => {
		// Validation
		if (!values.accountNumber || !beneficiaryName) {
			Alert.alert(
				"Validation Error",
				"Please enter a valid account number",
			);
			return;
		}

		setIsSaving(true);
		try {
			if (isEditing && beneficiaryId) {
				// Update existing
				await updateBeneficiary(beneficiaryId, {
					accountNumber: values.accountNumber,
					accountName: values.accountName,
					bankName: values.bankName || "FortressBank",
					nickname: values.nickname,
				});
				Alert.alert("Success", "Beneficiary updated successfully", [
					{ text: "OK", onPress: () => router.back() },
				]);
			} else {
				// Add new
				await addBeneficiary({
					accountNumber: values.accountNumber,
					accountName: values.accountName,
					bankName: values.bankName || "FortressBank",
					nickname: values.nickname,
				});
				Alert.alert("Success", "Beneficiary added successfully", [
					{ text: "OK", onPress: () => router.back() },
				]);
			}
		} catch (error: any) {
			console.error("Error saving beneficiary:", error);
			Alert.alert("Error", error.message || "Failed to save beneficiary");
		} finally {
			setIsSaving(false);
		}
	};

	const isFormValid =
		values.accountNumber && beneficiaryName && values.accountName;

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
								onBeneficiaryFound={handleBeneficiaryFound}
								onBeneficiaryNotFound={
									handleBeneficiaryNotFound
								}
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
								value={values.nickname}
								onChangeText={(text) =>
									handleChange("nickname", text)
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
							disabled={!isFormValid || isSaving}
						/>
					</Animated.View>
				</AnimatedScrollView>
			</KeyboardAvoidingView>
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
