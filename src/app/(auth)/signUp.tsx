import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Alert,
	TouchableOpacity,
	ScrollView,
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
import { LinearGradient } from "expo-linear-gradient";
import {
	ShieldCheck,
	UserCircle,
	CreditCard,
	CheckCircle,
	CaretLeft,
} from "phosphor-react-native";
import { primary, neutral, semantic } from "@/constants";
import {
	CustomInput,
	PasswordInput,
	PrimaryButton,
	LinkText,
	OTPInput,
	CheckboxWithLabel,
	ScreenContainer,
	AppHeader,
	DatePickerInput,
	ConfirmationModal,
} from "@/components";
import { useForm } from "@/hooks";
import { validationRules } from "@/utils";
import { authService } from "@/services/authService";

type Step =
	| "initial-info"
	| "otp-verification"
	| "complete-registration"
	| "account-selection"
	| "success";

const SignUp = () => {
	const router = useRouter();
	const [step, setStep] = useState<Step>("initial-info");
	const [timer, setTimer] = useState(60);
	const [canResend, setCanResend] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showExitModal, setShowExitModal] = useState(false);

	// Animation values
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);

	// Form state
	const {
		values,
		handleChange,
		setFieldValue,
		errors,
		setFieldError,
		touched,
		handleBlur,
	} = useForm({
		// Step 1: Initial info
		citizenId: "",
		phoneNumber: "",
		email: "",

		// Step 2: OTP
		otp: "",

		// Step 3: Complete registration
		username: "",
		password: "",
		confirmPassword: "",
		fullname: "",
		dateOfBirth: "",
		pin: "",
		confirmPin: "",
		agreedToTerms: false,

		// Step 4: Account selection
		accountNumberOption: "", // 'auto' or 'phone'
	});

	// Animate content on step change
	useEffect(() => {
		contentOpacity.value = 0;
		contentTranslateY.value = 15;

		setTimeout(() => {
			contentOpacity.value = withTiming(1, {
				duration: 400,
				easing: Easing.out(Easing.ease),
			});
			contentTranslateY.value = withSpring(0, {
				damping: 20,
				stiffness: 90,
			});
		}, 50);
	}, [step]);

	// Timer countdown for OTP
	useEffect(() => {
		if (step === "otp-verification" && timer > 0) {
			const interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		} else if (timer === 0) {
			setCanResend(true);
		}
	}, [timer, step]);

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ translateY: contentTranslateY.value }],
	}));

	// Validation functions
	const validateInitialInfo = () => {
		let isValid = true;

		// Validate citizen ID (12 digits)
		if (!values.citizenId.trim()) {
			setFieldError("citizenId", "Citizen ID is required");
			isValid = false;
		} else if (!/^\d{12}$/.test(values.citizenId)) {
			setFieldError("citizenId", "Citizen ID must have 12 digits");
			isValid = false;
		}

		// Validate phone number
		const phoneError = validationRules.phoneNumber(values.phoneNumber);
		if (!values.phoneNumber.trim()) {
			setFieldError("phoneNumber", "Phone number is required");
			isValid = false;
		} else if (phoneError) {
			setFieldError("phoneNumber", phoneError);
			isValid = false;
		}

		// Validate email
		const emailError = validationRules.email(values.email);
		if (!values.email.trim()) {
			setFieldError("email", "Email is required");
			isValid = false;
		} else if (emailError) {
			setFieldError("email", emailError);
			isValid = false;
		}

		return isValid;
	};

	const validateCompleteRegistration = () => {
		let isValid = true;

		// Validate username
		if (!values.username.trim()) {
			setFieldError("username", "Username is required");
			isValid = false;
		} else if (values.username.length < 4) {
			setFieldError("username", "Username must be at least 4 characters");
			isValid = false;
		}

		// Validate password
		const passwordError = validationRules.password(values.password);
		if (passwordError) {
			setFieldError("password", passwordError);
			isValid = false;
		}

		// Validate confirm password
		if (values.password !== values.confirmPassword) {
			setFieldError("confirmPassword", "Passwords do not match");
			isValid = false;
		}

		// Validate fullname
		if (!values.fullname.trim()) {
			setFieldError("fullname", "Full name is required");
			isValid = false;
		}

		// Validate date of birth
		if (!values.dateOfBirth.trim()) {
			setFieldError("dateOfBirth", "Date of birth is required");
			isValid = false;
		}

		return isValid;
	};

	// Step handlers
	const handleInitialInfoSubmit = async () => {
		if (!validateInitialInfo()) {
			return;
		}

		setIsLoading(true);
		try {
			const result = await authService.validateAndSendOtp({
				email: values.email,
				phoneNumber: values.phoneNumber,
				citizenId: values.citizenId,
			});

			if (result.code === 1000 && result.data?.sent) {
				setStep("otp-verification");
				setTimer(60);
				setCanResend(false);
				Alert.alert("Success", "OTP code has been sent to your email");
			} else {
				Alert.alert(
					"Error",
					result.message || "Cannot send OTP code. Please try again.",
				);
			}
		} catch (error) {
			Alert.alert("Error", "Cannot send OTP code. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendOTP = async () => {
		if (!canResend) return;

		try {
			const result = await authService.validateAndSendOtp({
				email: values.email,
				phoneNumber: values.phoneNumber,
				citizenId: values.citizenId,
			});

			if (result.code === 1000 && result.data?.sent) {
				setTimer(60);
				setCanResend(false);
				setFieldValue("otp", "");
				Alert.alert(
					"Success",
					"A new OTP code has been sent to your email",
				);
			} else {
				Alert.alert(
					"Error",
					result.message ||
						"Cannot resend OTP code. Please try again.",
				);
			}
		} catch (error) {
			Alert.alert("Error", "Cannot resend OTP code. Please try again.");
		}
	};

	const handleOTPVerification = async () => {
		if (values.otp.length !== 6) {
			Alert.alert("Error", "Please enter all 6 digits of the OTP code");
			return;
		}

		setIsLoading(true);
		try {
			const result = await authService.verifyOtp({
				email: values.email,
				otp: values.otp,
			});

			if (result.code === 1000 && result.data?.valid) {
				setStep("complete-registration");
				Alert.alert("Success", "OTP verified successfully");
			} else {
				Alert.alert(
					"Error",
					result.message ||
						"OTP code is incorrect. Please try again.",
				);
				setFieldValue("otp", "");
			}
		} catch (error) {
			Alert.alert("Error", "OTP code is incorrect. Please try again.");
			setFieldValue("otp", "");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCompleteRegistration = async () => {
		if (!validateCompleteRegistration()) {
			return;
		}

		// Move to account selection step
		setStep("account-selection");
	};

	const validateFinalStep = () => {
		let isValid = true;

		// Validate PIN
		if (!values.pin.trim()) {
			setFieldError("pin", "PIN is required");
			isValid = false;
		} else if (!/^\d{6}$/.test(values.pin)) {
			setFieldError("pin", "PIN must be 6 digits");
			isValid = false;
		}

		// Validate confirm PIN
		if (values.pin !== values.confirmPin) {
			setFieldError("confirmPin", "PINs do not match");
			isValid = false;
		}

		// Validate account number option
		if (!values.accountNumberOption) {
			Alert.alert("Error", "Please select an account number type");
			isValid = false;
		}

		// Validate terms
		if (!values.agreedToTerms) {
			Alert.alert("Note", "Please agree to the terms and conditions");
			isValid = false;
		}

		return isValid;
	};

	const handleFinalSubmit = async () => {
		if (!validateFinalStep()) {
			return;
		}

		setIsLoading(true);
		try {
			const accountNumberType =
				values.accountNumberOption === "auto"
					? "AUTO_GENERATE"
					: "PHONE_NUMBER";

			// Convert date from DD/MM/YYYY to YYYY-MM-DD
			const [day, month, year] = values.dateOfBirth.split("/");
			const formattedDob = `${year}-${month}-${day}`;

			const result = await authService.register({
				username: values.username,
				email: values.email,
				password: values.password,
				fullName: values.fullname,
				phoneNumber: values.phoneNumber,
				dob: formattedDob,
				citizenId: values.citizenId,
				accountNumberType: accountNumberType,
				pin: values.pin,
			});

			if (result.code === 1000 && result.data) {
				setStep("success");
				Alert.alert(
					"Success",
					"Your account has been created successfully!",
				);
			} else {
				Alert.alert(
					"Error",
					result.message || "Registration failed. Please try again.",
				);
			}
		} catch (error) {
			Alert.alert("Error", "Cannot create account. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoToSignIn = () => {
		router.replace("/(auth)/signIn");
	};

	const handleBackPress = () => {
		setShowExitModal(true);
	};

	const handleConfirmExit = () => {
		setShowExitModal(false);
		router.replace("/(auth)/signIn");
	};

	const handleCancelExit = () => {
		setShowExitModal(false);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const renderStepIndicator = () => {
		const steps = [
			"initial-info",
			"otp-verification",
			"complete-registration",
			"account-selection",
		];
		const currentIndex = steps.indexOf(step);

		if (step === "success") return null;

		return (
			<View style={styles.stepIndicatorContainer}>
				{steps.map((_, index) => (
					<View
						key={index}
						style={[
							styles.stepDot,
							index <= currentIndex && styles.stepDotActive,
						]}
					/>
				))}
			</View>
		);
	};

	const renderContent = () => {
		switch (step) {
			case "initial-info":
				return (
					<Animated.View
						style={[styles.contentSection, contentAnimatedStyle]}>
						<View style={styles.iconContainer}>
							<LinearGradient
								colors={[primary.primary1, primary.primary2]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.iconGradient}>
								<UserCircle
									size={48}
									color={neutral.neutral6}
									weight="regular"
								/>
							</LinearGradient>
						</View>

						<Text style={styles.title}>Basic Information</Text>
						<Text style={styles.subtitle}>
							Please enter your information to start account
							registration
						</Text>

						<View style={styles.formContainer}>
							<Text style={styles.label}>Citizen ID</Text>
							<CustomInput
								placeholder="Enter 12-digit Citizen ID"
								value={values.citizenId}
								onChangeText={(text) =>
									handleChange(
										"citizenId",
										text.replace(/\D/g, ""),
									)
								}
								onBlur={() => handleBlur("citizenId")}
								keyboardType="number-pad"
								maxLength={12}
								isActive={!!values.citizenId}
								error={
									touched.citizenId
										? errors.citizenId
										: undefined
								}
								containerStyle={styles.inputWrapper}
							/>

							<Text style={styles.label}>Phone Number</Text>
							<CustomInput
								placeholder="Enter phone number"
								value={values.phoneNumber}
								onChangeText={(text) =>
									handleChange(
										"phoneNumber",
										text.replace(/\D/g, ""),
									)
								}
								onBlur={() => handleBlur("phoneNumber")}
								keyboardType="phone-pad"
								isActive={!!values.phoneNumber}
								error={
									touched.phoneNumber
										? errors.phoneNumber
										: undefined
								}
								containerStyle={styles.inputWrapper}
							/>

							<Text style={styles.label}>Email</Text>
							<CustomInput
								placeholder="Enter email address"
								value={values.email}
								onChangeText={(text) =>
									handleChange("email", text)
								}
								onBlur={() => handleBlur("email")}
								keyboardType="email-address"
								autoCapitalize="none"
								isActive={!!values.email}
								error={touched.email ? errors.email : undefined}
								containerStyle={styles.inputWrapper}
							/>

							<PrimaryButton
								title={isLoading ? "Sending..." : "Continue"}
								onPress={handleInitialInfoSubmit}
								disabled={
									isLoading ||
									!values.citizenId ||
									!values.phoneNumber ||
									!values.email
								}
								style={styles.button}
							/>

							<LinkText
								normalText="Already have an account? "
								linkText="Sign In"
								onPress={() =>
									router.navigate("/(auth)/signIn")
								}
							/>
						</View>
					</Animated.View>
				);

			case "otp-verification":
				return (
					<Animated.View
						style={[styles.contentSection, contentAnimatedStyle]}>
						<View style={styles.iconContainer}>
							<LinearGradient
								colors={[primary.primary1, primary.primary2]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.iconGradient}>
								<ShieldCheck
									size={48}
									color={neutral.neutral6}
									weight="regular"
								/>
							</LinearGradient>
						</View>

						<Text style={styles.title}>OTP Verification</Text>
						<Text style={styles.subtitle}>
							Enter the 6-digit OTP code sent to your phone number
						</Text>
						<Text style={styles.phoneNumber}>
							{values.phoneNumber}
						</Text>

						<View style={styles.otpContainer}>
							<OTPInput
								length={6}
								onComplete={(code) =>
									setFieldValue("otp", code)
								}
								onChangeText={(code) =>
									setFieldValue("otp", code)
								}
							/>
						</View>

						<View style={styles.timerContainer}>
							{!canResend ? (
								<Text style={styles.timerText}>
									Resend code in{" "}
									<Text style={styles.timerHighlight}>
										{formatTime(timer)}
									</Text>
								</Text>
							) : (
								<TouchableOpacity onPress={handleResendOTP}>
									<Text style={styles.resendText}>
										Resend OTP Code
									</Text>
								</TouchableOpacity>
							)}
						</View>

						<PrimaryButton
							title={isLoading ? "Verifying..." : "Verify"}
							onPress={handleOTPVerification}
							disabled={isLoading || values.otp.length !== 6}
							style={styles.button}
						/>

						<TouchableOpacity
							onPress={() => setStep("initial-info")}>
							<Text style={styles.backLink}>
								Change phone number
							</Text>
						</TouchableOpacity>
					</Animated.View>
				);

			case "complete-registration":
				return (
					<Animated.View
						style={[styles.contentSection, contentAnimatedStyle]}>
						<View style={styles.compactIconContainer}>
							<LinearGradient
								colors={[primary.primary1, primary.primary2]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.compactIconGradient}>
								<UserCircle
									size={36}
									color={neutral.neutral6}
									weight="fill"
								/>
							</LinearGradient>
						</View>

						<Text style={styles.compactTitle}>
							Complete Registration
						</Text>
						<Text style={styles.compactSubtitle}>
							Fill in the remaining information to complete
							registration
						</Text>

						<View style={styles.formContainer}>
							<View style={styles.row}>
								<View style={styles.halfWidth}>
									<Text style={styles.label}>Username</Text>
									<CustomInput
										placeholder="Username"
										value={values.username}
										onChangeText={(text) =>
											handleChange("username", text)
										}
										onBlur={() => handleBlur("username")}
										autoCapitalize="none"
										isActive={!!values.username}
										error={
											touched.username
												? errors.username
												: undefined
										}
										containerStyle={
											styles.compactInputWrapper
										}
									/>
								</View>

								<View style={styles.halfWidth}>
									<Text style={styles.label}>Full Name</Text>
									<CustomInput
										placeholder="Full Name"
										value={values.fullname}
										onChangeText={(text) =>
											handleChange("fullname", text)
										}
										onBlur={() => handleBlur("fullname")}
										autoCapitalize="words"
										isActive={!!values.fullname}
										error={
											touched.fullname
												? errors.fullname
												: undefined
										}
										containerStyle={
											styles.compactInputWrapper
										}
									/>
								</View>
							</View>

							<View style={styles.row}>
								<View style={styles.halfWidth}>
									<Text style={styles.label}>Password</Text>
									<PasswordInput
										placeholder="Password"
										value={values.password}
										onChangeText={(text) =>
											handleChange("password", text)
										}
										onBlur={() => handleBlur("password")}
										isActive={!!values.password}
										error={
											touched.password
												? errors.password
												: undefined
										}
										containerStyle={
											styles.compactInputWrapper
										}
									/>
								</View>

								<View style={styles.halfWidth}>
									<Text style={styles.label}>
										Confirm Password
									</Text>
									<PasswordInput
										placeholder="Confirm"
										value={values.confirmPassword}
										onChangeText={(text) =>
											handleChange(
												"confirmPassword",
												text,
											)
										}
										onBlur={() =>
											handleBlur("confirmPassword")
										}
										isActive={!!values.confirmPassword}
										error={
											touched.confirmPassword
												? errors.confirmPassword
												: undefined
										}
										containerStyle={
											styles.compactInputWrapper
										}
									/>
								</View>
							</View>

							<Text style={styles.label}>Date of Birth</Text>
							<DatePickerInput
								value={values.dateOfBirth}
								onDateChange={(date) =>
									handleChange("dateOfBirth", date)
								}
								placeholder="Select date of birth"
								isActive={!!values.dateOfBirth}
								error={
									touched.dateOfBirth
										? errors.dateOfBirth
										: undefined
								}
								containerStyle={styles.inputWrapper}
							/>

							<PrimaryButton
								title={
									isLoading
										? "Processing..."
										: "Complete Registration"
								}
								onPress={handleCompleteRegistration}
								disabled={isLoading}
								style={styles.compactButton}
							/>
						</View>
					</Animated.View>
				);

			case "account-selection":
				return (
					<Animated.View
						style={[styles.contentSection, contentAnimatedStyle]}>
						<View style={styles.compactIconContainer}>
							<LinearGradient
								colors={[primary.primary1, primary.primary2]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.compactIconGradient}>
								<CreditCard
									size={36}
									color={neutral.neutral6}
									weight="fill"
								/>
							</LinearGradient>
						</View>

						<Text style={styles.compactTitle}>Final Step</Text>
						<Text style={styles.compactSubtitle}>
							Set your PIN and choose account number type
						</Text>

						<View style={styles.formContainer}>
							{/* PIN Input */}
							<View style={styles.row}>
								<View style={styles.halfWidth}>
									<Text style={styles.label}>
										PIN (6 digits)
									</Text>
									<PasswordInput
										placeholder="Enter PIN"
										value={values.pin}
										onChangeText={(text) =>
											handleChange(
												"pin",
												text
													.replace(/\D/g, "")
													.slice(0, 6),
											)
										}
										onBlur={() => handleBlur("pin")}
										keyboardType="number-pad"
										maxLength={6}
										isActive={!!values.pin}
										error={
											touched.pin ? errors.pin : undefined
										}
										containerStyle={
											styles.compactInputWrapper
										}
									/>
								</View>

								<View style={styles.halfWidth}>
									<Text style={styles.label}>
										Confirm PIN
									</Text>
									<PasswordInput
										placeholder="Confirm PIN"
										value={values.confirmPin}
										onChangeText={(text) =>
											handleChange(
												"confirmPin",
												text
													.replace(/\D/g, "")
													.slice(0, 6),
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
										containerStyle={
											styles.compactInputWrapper
										}
									/>
								</View>
							</View>

							{/* Account Number Type Selection */}
							<Text style={styles.label}>
								Account Number Type
							</Text>
							<View style={styles.accountTypeContainer}>
								<TouchableOpacity
									style={[
										styles.accountTypeOption,
										values.accountNumberOption === "auto" &&
											styles.accountTypeOptionSelected,
									]}
									onPress={() =>
										setFieldValue(
											"accountNumberOption",
											"auto",
										)
									}
									disabled={isLoading}>
									<View style={styles.radioButton}>
										{values.accountNumberOption ===
											"auto" && (
											<View
												style={
													styles.radioButtonSelected
												}
											/>
										)}
									</View>
									<View style={styles.accountTypeContent}>
										<Text style={styles.accountTypeTitle}>
											Auto-generate
										</Text>
										<Text
											style={
												styles.accountTypeDescription
											}>
											System creates unique number
										</Text>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.accountTypeOption,
										values.accountNumberOption ===
											"phone" &&
											styles.accountTypeOptionSelected,
									]}
									onPress={() =>
										setFieldValue(
											"accountNumberOption",
											"phone",
										)
									}
									disabled={isLoading}>
									<View style={styles.radioButton}>
										{values.accountNumberOption ===
											"phone" && (
											<View
												style={
													styles.radioButtonSelected
												}
											/>
										)}
									</View>
									<View style={styles.accountTypeContent}>
										<Text style={styles.accountTypeTitle}>
											Use Phone Number
										</Text>
										<Text
											style={
												styles.accountTypeDescription
											}>
											{values.phoneNumber}
										</Text>
									</View>
								</TouchableOpacity>
							</View>

							{/* Terms and Conditions */}
							<CheckboxWithLabel
								checked={values.agreedToTerms}
								onPress={() =>
									setFieldValue(
										"agreedToTerms",
										!values.agreedToTerms,
									)
								}
								label={
									<Text style={styles.termsText}>
										I agree to the{" "}
										<Text style={styles.termsLink}>
											Terms and Conditions
										</Text>
									</Text>
								}
								containerStyle={styles.compactTermsContainer}
							/>

							{/* Submit Button */}
							<PrimaryButton
								title={
									isLoading
										? "Creating Account..."
										: "Create Account"
								}
								onPress={handleFinalSubmit}
								disabled={
									isLoading || !values.accountNumberOption
								}
								style={styles.compactButton}
							/>
						</View>
					</Animated.View>
				);

			case "success":
				return (
					<Animated.View
						style={[styles.contentSection, contentAnimatedStyle]}>
						<Animated.View
							entering={FadeIn.delay(200).duration(600)}
							style={styles.successIconContainer}>
							<LinearGradient
								colors={[semantic.success, "#40C9A8"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.successIconGradient}>
								<CheckCircle
									size={64}
									color={neutral.neutral6}
									weight="fill"
								/>
							</LinearGradient>
						</Animated.View>

						<Text style={styles.successTitle}>
							Registration Successful!
						</Text>
						<Text style={styles.successSubtitle}>
							Your account has been successfully created
						</Text>

						<View style={styles.successInfoCard}>
							<View style={styles.successInfoRow}>
								<Text style={styles.successInfoLabel}>
									Username:
								</Text>
								<Text style={styles.successInfoValue}>
									{values.username}
								</Text>
							</View>
							<View style={styles.successInfoRow}>
								<Text style={styles.successInfoLabel}>
									Full Name:
								</Text>
								<Text style={styles.successInfoValue}>
									{values.fullname}
								</Text>
							</View>
							<View style={styles.successInfoRow}>
								<Text style={styles.successInfoLabel}>
									Email:
								</Text>
								<Text style={styles.successInfoValue}>
									{values.email}
								</Text>
							</View>
							<View style={styles.successInfoRow}>
								<Text style={styles.successInfoLabel}>
									Account Number:
								</Text>
								<Text style={styles.successInfoValue}>
									{values.accountNumberOption === "phone"
										? values.phoneNumber
										: "0123456789"}
								</Text>
							</View>
						</View>

						<PrimaryButton
							title="Sign In Now"
							onPress={handleGoToSignIn}
							style={styles.button}
						/>
					</Animated.View>
				);

			default:
				return null;
		}
	};

	return (
		<ScreenContainer backgroundColor={neutral.neutral6}>
			{/* Back button only - no title */}
			{step !== "success" && (
				<View style={styles.headerContainer}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={handleBackPress}>
						<CaretLeft
							size={24}
							color={neutral.neutral1}
							weight="bold"
						/>
					</TouchableOpacity>
				</View>
			)}

			{renderStepIndicator()}

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.flex}>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollViewContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled">
					{renderContent()}
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Exit Confirmation Modal */}
			<ConfirmationModal
				visible={showExitModal}
				title="Cancel Registration?"
				message="Your registration information will not be saved. Are you sure you want to exit?"
				confirmText="Exit"
				cancelText="Continue Registration"
				onConfirm={handleConfirmExit}
				onCancel={handleCancelExit}
			/>
		</ScreenContainer>
	);
};

export default SignUp;

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	headerContainer: {
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 8,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "flex-start",
	},
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		paddingHorizontal: 24,
		paddingTop: 8,
		paddingBottom: 40,
	},
	stepIndicatorContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 16,
		gap: 8,
	},
	stepDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: neutral.neutral4,
	},
	stepDotActive: {
		backgroundColor: primary.primary1,
		width: 24,
	},
	contentSection: {
		flex: 1,
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
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 6,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		color: neutral.neutral1,
		textAlign: "center",
		marginBottom: 8,
		fontFamily: "Poppins",
	},
	subtitle: {
		fontSize: 14,
		fontWeight: "400",
		color: neutral.neutral3,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 24,
		paddingHorizontal: 16,
		fontFamily: "Poppins",
	},
	phoneNumber: {
		fontSize: 16,
		fontWeight: "600",
		color: primary.primary1,
		textAlign: "center",
		marginBottom: 24,
		fontFamily: "Poppins",
	},
	formContainer: {
		marginTop: 8,
	},
	label: {
		fontSize: 12,
		fontWeight: "600",
		color: neutral.neutral2,
		marginBottom: 8,
		fontFamily: "Poppins",
	},
	inputWrapper: {
		marginBottom: 16,
	},
	button: {
		marginTop: 8,
		marginBottom: 16,
	},
	otpContainer: {
		marginBottom: 24,
	},
	timerContainer: {
		alignItems: "center",
		marginBottom: 24,
	},
	timerText: {
		fontSize: 14,
		fontWeight: "400",
		color: neutral.neutral3,
		fontFamily: "Poppins",
	},
	timerHighlight: {
		fontWeight: "600",
		color: primary.primary1,
	},
	resendText: {
		fontSize: 14,
		fontWeight: "600",
		color: primary.primary1,
		textDecorationLine: "underline",
		fontFamily: "Poppins",
	},
	backLink: {
		fontSize: 13,
		fontWeight: "600",
		color: primary.primary1,
		textAlign: "center",
		fontFamily: "Poppins",
	},
	termsContainer: {
		marginBottom: 20,
	},
	termsText: {
		fontSize: 12,
		fontWeight: "400",
		color: neutral.neutral1,
		lineHeight: 18,
		fontFamily: "Poppins",
	},
	termsLink: {
		color: primary.primary1,
		fontWeight: "600",
		textDecorationLine: "underline",
	},
	optionsContainer: {
		gap: 16,
		marginTop: 8,
	},
	optionCard: {
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	optionGradient: {
		padding: 20,
		alignItems: "center",
		minHeight: 180,
		justifyContent: "center",
	},
	optionIconContainer: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: neutral.neutral6,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 2,
	},
	optionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: 8,
		fontFamily: "Poppins",
	},
	optionDescription: {
		fontSize: 13,
		fontWeight: "400",
		color: neutral.neutral3,
		textAlign: "center",
		lineHeight: 19,
		fontFamily: "Poppins",
	},
	loadingText: {
		fontSize: 14,
		fontWeight: "500",
		color: primary.primary1,
		textAlign: "center",
		marginTop: 16,
		fontFamily: "Poppins",
	},
	successIconContainer: {
		alignItems: "center",
		marginBottom: 24,
		marginTop: 32,
	},
	successIconGradient: {
		width: 120,
		height: 120,
		borderRadius: 60,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: semantic.success,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	successTitle: {
		fontSize: 28,
		fontWeight: "700",
		color: neutral.neutral1,
		textAlign: "center",
		marginBottom: 8,
		fontFamily: "Poppins",
	},
	successSubtitle: {
		fontSize: 15,
		fontWeight: "400",
		color: neutral.neutral3,
		textAlign: "center",
		marginBottom: 32,
		fontFamily: "Poppins",
	},
	successInfoCard: {
		backgroundColor: primary.primary4,
		borderRadius: 16,
		padding: 20,
		marginBottom: 32,
		gap: 12,
	},
	successInfoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	successInfoLabel: {
		fontSize: 13,
		fontWeight: "500",
		color: neutral.neutral2,
		fontFamily: "Poppins",
	},
	successInfoValue: {
		fontSize: 14,
		fontWeight: "600",
		color: neutral.neutral1,
		fontFamily: "Poppins",
	},
	// Compact layout styles for complete-registration step
	compactIconContainer: {
		alignItems: "center",
		marginBottom: 16,
	},
	compactIconGradient: {
		width: 72,
		height: 72,
		borderRadius: 36,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 6,
	},
	compactTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: neutral.neutral1,
		textAlign: "center",
		marginBottom: 4,
		fontFamily: "Poppins",
	},
	compactSubtitle: {
		fontSize: 12,
		fontWeight: "400",
		color: neutral.neutral3,
		textAlign: "center",
		lineHeight: 18,
		marginBottom: 16,
		paddingHorizontal: 16,
		fontFamily: "Poppins",
	},
	row: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 12,
	},
	halfWidth: {
		flex: 1,
	},
	compactInputWrapper: {
		marginBottom: 0,
	},
	compactTermsContainer: {
		marginBottom: 12,
		marginTop: 4,
	},
	compactButton: {
		marginTop: 4,
		marginBottom: 8,
	},
	// Account type selection styles
	accountTypeContainer: {
		gap: 12,
		marginBottom: 16,
	},
	accountTypeOption: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: neutral.neutral4,
		backgroundColor: neutral.neutral6,
	},
	accountTypeOptionSelected: {
		borderColor: primary.primary1,
		backgroundColor: primary.primary4,
	},
	radioButton: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: neutral.neutral3,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	radioButtonSelected: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: primary.primary1,
	},
	accountTypeContent: {
		flex: 1,
	},
	accountTypeTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: neutral.neutral1,
		marginBottom: 2,
		fontFamily: "Poppins",
	},
	accountTypeDescription: {
		fontSize: 12,
		fontWeight: "400",
		color: neutral.neutral3,
		fontFamily: "Poppins",
	},
});
