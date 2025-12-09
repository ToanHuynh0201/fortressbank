import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, UserCircle, CreditCard, CheckCircle, CaretLeft } from 'phosphor-react-native';
import { primary, neutral, semantic } from '@/constants';
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
} from '@/components';
import { useForm } from '@/hooks';
import { validationRules } from '@/utils';

type Step = 'initial-info' | 'otp-verification' | 'complete-registration' | 'account-selection' | 'success';

const SignUp = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('initial-info');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(15);

  // Form state
  const { values, handleChange, setFieldValue, errors, setFieldError, touched, handleBlur } = useForm({
    // Step 1: Initial info
    citizenId: '',
    phoneNumber: '',
    email: '',

    // Step 2: OTP
    otp: '',

    // Step 3: Complete registration
    username: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    dateOfBirth: '',
    agreedToTerms: false,

    // Step 4: Account selection
    accountNumberOption: '', // 'auto' or 'phone'
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
    if (step === 'otp-verification' && timer > 0) {
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
      setFieldError('citizenId', 'Căn cước công dân là bắt buộc');
      isValid = false;
    } else if (!/^\d{12}$/.test(values.citizenId)) {
      setFieldError('citizenId', 'Căn cước công dân phải có 12 chữ số');
      isValid = false;
    }

    // Validate phone number
    const phoneError = validationRules.phoneNumber(values.phoneNumber);
    if (!values.phoneNumber.trim()) {
      setFieldError('phoneNumber', 'Số điện thoại là bắt buộc');
      isValid = false;
    } else if (phoneError) {
      setFieldError('phoneNumber', phoneError);
      isValid = false;
    }

    // Validate email
    const emailError = validationRules.email(values.email);
    if (!values.email.trim()) {
      setFieldError('email', 'Email là bắt buộc');
      isValid = false;
    } else if (emailError) {
      setFieldError('email', emailError);
      isValid = false;
    }

    return isValid;
  };

  const validateCompleteRegistration = () => {
    let isValid = true;

    // Validate username
    if (!values.username.trim()) {
      setFieldError('username', 'Tên đăng nhập là bắt buộc');
      isValid = false;
    } else if (values.username.length < 4) {
      setFieldError('username', 'Tên đăng nhập phải có ít nhất 4 ký tự');
      isValid = false;
    }

    // Validate password
    const passwordError = validationRules.password(values.password);
    if (passwordError) {
      setFieldError('password', passwordError);
      isValid = false;
    }

    // Validate confirm password
    if (values.password !== values.confirmPassword) {
      setFieldError('confirmPassword', 'Mật khẩu xác nhận không khớp');
      isValid = false;
    }

    // Validate fullname
    if (!values.fullname.trim()) {
      setFieldError('fullname', 'Họ và tên là bắt buộc');
      isValid = false;
    }

    // Validate date of birth
    if (!values.dateOfBirth.trim()) {
      setFieldError('dateOfBirth', 'Ngày sinh là bắt buộc');
      isValid = false;
    }

    // Validate terms agreement
    if (!values.agreedToTerms) {
      Alert.alert('Lưu ý', 'Vui lòng đồng ý với điều khoản và điều kiện');
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
      // TODO: Call API to send OTP
      console.log('Sending OTP to:', values.phoneNumber);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setStep('otp-verification');
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      // TODO: Call API to resend OTP
      console.log('Resending OTP to:', values.phoneNumber);
      await new Promise(resolve => setTimeout(resolve, 500));

      setTimer(60);
      setCanResend(false);
      setFieldValue('otp', '');
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến số điện thoại của bạn');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    }
  };

  const handleOTPVerification = async () => {
    if (values.otp.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ 6 số mã OTP');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to verify OTP
      console.log('Verifying OTP:', values.otp);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStep('complete-registration');
    } catch (error) {
      Alert.alert('Lỗi', 'Mã OTP không chính xác. Vui lòng thử lại.');
      setFieldValue('otp', '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!validateCompleteRegistration()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call API to register user
      console.log('Registering user:', {
        username: values.username,
        fullname: values.fullname,
        email: values.email,
        citizenId: values.citizenId,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStep('account-selection');
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelection = async (option: 'auto' | 'phone') => {
    setIsLoading(true);
    try {
      // TODO: Call API to create account with selected option
      console.log('Creating account with option:', option);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFieldValue('accountNumberOption', option);
      setStep('success');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    router.replace('/(auth)/signIn');
  };

  const handleBackPress = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.replace('/(auth)/signIn');
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepIndicator = () => {
    const steps = ['initial-info', 'otp-verification', 'complete-registration', 'account-selection'];
    const currentIndex = steps.indexOf(step);

    if (step === 'success') return null;

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
      case 'initial-info':
        return (
          <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[primary.primary1, primary.primary2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}>
                <UserCircle size={48} color={neutral.neutral6} weight="regular" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Thông tin cơ bản</Text>
            <Text style={styles.subtitle}>
              Vui lòng nhập thông tin để bắt đầu đăng ký tài khoản
            </Text>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Căn cước công dân</Text>
              <CustomInput
                placeholder="Nhập 12 chữ số CCCD"
                value={values.citizenId}
                onChangeText={(text) => handleChange('citizenId', text.replace(/\D/g, ''))}
                onBlur={() => handleBlur('citizenId')}
                keyboardType="number-pad"
                maxLength={12}
                isActive={!!values.citizenId}
                error={touched.citizenId ? errors.citizenId : undefined}
                containerStyle={styles.inputWrapper}
              />

              <Text style={styles.label}>Số điện thoại</Text>
              <CustomInput
                placeholder="Nhập số điện thoại"
                value={values.phoneNumber}
                onChangeText={(text) => handleChange('phoneNumber', text.replace(/\D/g, ''))}
                onBlur={() => handleBlur('phoneNumber')}
                keyboardType="phone-pad"
                isActive={!!values.phoneNumber}
                error={touched.phoneNumber ? errors.phoneNumber : undefined}
                containerStyle={styles.inputWrapper}
              />

              <Text style={styles.label}>Email</Text>
              <CustomInput
                placeholder="Nhập địa chỉ email"
                value={values.email}
                onChangeText={(text) => handleChange('email', text)}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                isActive={!!values.email}
                error={touched.email ? errors.email : undefined}
                containerStyle={styles.inputWrapper}
              />

              <PrimaryButton
                title={isLoading ? "Đang gửi..." : "Tiếp tục"}
                onPress={handleInitialInfoSubmit}
                disabled={isLoading || !values.citizenId || !values.phoneNumber || !values.email}
                style={styles.button}
              />

              <LinkText
                normalText="Đã có tài khoản? "
                linkText="Đăng nhập"
                onPress={() => router.navigate('/(auth)/signIn')}
              />
            </View>
          </Animated.View>
        );

      case 'otp-verification':
        return (
          <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[primary.primary1, primary.primary2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}>
                <ShieldCheck size={48} color={neutral.neutral6} weight="regular" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Xác thực OTP</Text>
            <Text style={styles.subtitle}>
              Nhập mã OTP gồm 6 chữ số đã được gửi đến số điện thoại
            </Text>
            <Text style={styles.phoneNumber}>{values.phoneNumber}</Text>

            <View style={styles.otpContainer}>
              <OTPInput
                length={6}
                onComplete={(code) => setFieldValue('otp', code)}
                onChangeText={(code) => setFieldValue('otp', code)}
              />
            </View>

            <View style={styles.timerContainer}>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Gửi lại mã sau{' '}
                  <Text style={styles.timerHighlight}>{formatTime(timer)}</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP}>
                  <Text style={styles.resendText}>Gửi lại mã OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <PrimaryButton
              title={isLoading ? "Đang xác thực..." : "Xác thực"}
              onPress={handleOTPVerification}
              disabled={isLoading || values.otp.length !== 6}
              style={styles.button}
            />

            <TouchableOpacity onPress={() => setStep('initial-info')}>
              <Text style={styles.backLink}>Thay đổi số điện thoại</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 'complete-registration':
        return (
          <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
            <View style={styles.compactIconContainer}>
              <LinearGradient
                colors={[primary.primary1, primary.primary2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.compactIconGradient}>
                <UserCircle size={36} color={neutral.neutral6} weight="fill" />
              </LinearGradient>
            </View>

            <Text style={styles.compactTitle}>Hoàn tất đăng ký</Text>
            <Text style={styles.compactSubtitle}>
              Điền thông tin còn thiếu để hoàn tất đăng ký
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Tên đăng nhập</Text>
                  <CustomInput
                    placeholder="Tên đăng nhập"
                    value={values.username}
                    onChangeText={(text) => handleChange('username', text)}
                    onBlur={() => handleBlur('username')}
                    autoCapitalize="none"
                    isActive={!!values.username}
                    error={touched.username ? errors.username : undefined}
                    containerStyle={styles.compactInputWrapper}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <CustomInput
                    placeholder="Họ và tên"
                    value={values.fullname}
                    onChangeText={(text) => handleChange('fullname', text)}
                    onBlur={() => handleBlur('fullname')}
                    autoCapitalize="words"
                    isActive={!!values.fullname}
                    error={touched.fullname ? errors.fullname : undefined}
                    containerStyle={styles.compactInputWrapper}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <PasswordInput
                    placeholder="Mật khẩu"
                    value={values.password}
                    onChangeText={(text) => handleChange('password', text)}
                    onBlur={() => handleBlur('password')}
                    isActive={!!values.password}
                    error={touched.password ? errors.password : undefined}
                    containerStyle={styles.compactInputWrapper}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Xác nhận MK</Text>
                  <PasswordInput
                    placeholder="Xác nhận"
                    value={values.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    onBlur={() => handleBlur('confirmPassword')}
                    isActive={!!values.confirmPassword}
                    error={touched.confirmPassword ? errors.confirmPassword : undefined}
                    containerStyle={styles.compactInputWrapper}
                  />
                </View>
              </View>

              <Text style={styles.label}>Ngày sinh</Text>
              <DatePickerInput
                value={values.dateOfBirth}
                onDateChange={(date) => handleChange('dateOfBirth', date)}
                placeholder="Chọn ngày sinh"
                isActive={!!values.dateOfBirth}
                error={touched.dateOfBirth ? errors.dateOfBirth : undefined}
                containerStyle={styles.inputWrapper}
              />

              <CheckboxWithLabel
                checked={values.agreedToTerms}
                onPress={() => setFieldValue('agreedToTerms', !values.agreedToTerms)}
                label={
                  <Text style={styles.termsText}>
                    Tôi đồng ý với{' '}
                    <Text style={styles.termsLink}>Điều khoản và Điều kiện</Text>
                  </Text>
                }
                containerStyle={styles.compactTermsContainer}
              />

              <PrimaryButton
                title={isLoading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                onPress={handleCompleteRegistration}
                disabled={isLoading}
                style={styles.compactButton}
              />
            </View>
          </Animated.View>
        );

      case 'account-selection':
        return (
          <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[primary.primary1, primary.primary2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}>
                <CreditCard size={48} color={neutral.neutral6} weight="regular" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Chọn số tài khoản</Text>
            <Text style={styles.subtitle}>
              Chọn cách tạo số tài khoản ngân hàng của bạn
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleAccountSelection('auto')}
                disabled={isLoading}>
                <LinearGradient
                  colors={[primary.primary4, neutral.neutral6]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionGradient}>
                  <View style={styles.optionIconContainer}>
                    <CreditCard size={32} color={primary.primary1} weight="duotone" />
                  </View>
                  <Text style={styles.optionTitle}>Tự động tạo số</Text>
                  <Text style={styles.optionDescription}>
                    Hệ thống sẽ tự động tạo số tài khoản duy nhất cho bạn
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleAccountSelection('phone')}
                disabled={isLoading}>
                <LinearGradient
                  colors={[primary.primary4, neutral.neutral6]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionGradient}>
                  <View style={styles.optionIconContainer}>
                    <CreditCard size={32} color={primary.primary1} weight="duotone" />
                  </View>
                  <Text style={styles.optionTitle}>Dùng số điện thoại</Text>
                  <Text style={styles.optionDescription}>
                    Sử dụng số điện thoại {values.phoneNumber} làm số tài khoản
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {isLoading && (
              <Text style={styles.loadingText}>Đang tạo tài khoản...</Text>
            )}
          </Animated.View>
        );

      case 'success':
        return (
          <Animated.View style={[styles.contentSection, contentAnimatedStyle]}>
            <Animated.View
              entering={FadeIn.delay(200).duration(600)}
              style={styles.successIconContainer}>
              <LinearGradient
                colors={[semantic.success, '#40C9A8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.successIconGradient}>
                <CheckCircle size={64} color={neutral.neutral6} weight="fill" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.successTitle}>Đăng ký thành công!</Text>
            <Text style={styles.successSubtitle}>
              Tài khoản của bạn đã được tạo thành công
            </Text>

            <View style={styles.successInfoCard}>
              <View style={styles.successInfoRow}>
                <Text style={styles.successInfoLabel}>Tên đăng nhập:</Text>
                <Text style={styles.successInfoValue}>{values.username}</Text>
              </View>
              <View style={styles.successInfoRow}>
                <Text style={styles.successInfoLabel}>Họ tên:</Text>
                <Text style={styles.successInfoValue}>{values.fullname}</Text>
              </View>
              <View style={styles.successInfoRow}>
                <Text style={styles.successInfoLabel}>Email:</Text>
                <Text style={styles.successInfoValue}>{values.email}</Text>
              </View>
              <View style={styles.successInfoRow}>
                <Text style={styles.successInfoLabel}>Số tài khoản:</Text>
                <Text style={styles.successInfoValue}>
                  {values.accountNumberOption === 'phone'
                    ? values.phoneNumber
                    : '0123456789'}
                </Text>
              </View>
            </View>

            <PrimaryButton
              title="Đăng nhập ngay"
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
      {step !== 'success' && (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}>
            <CaretLeft size={24} color={neutral.neutral1} weight="bold" />
          </TouchableOpacity>
        </View>
      )}

      {renderStepIndicator()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
        title="Hủy đăng ký?"
        message="Thông tin đăng ký của bạn sẽ không được lưu. Bạn có chắc chắn muốn thoát?"
        confirmText="Thoát"
        cancelText="Tiếp tục đăng ký"
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
    justifyContent: 'center',
    alignItems: 'flex-start',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: primary.primary1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: neutral.neutral1,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: neutral.neutral3,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    fontFamily: 'Poppins',
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: primary.primary1,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins',
  },
  formContainer: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: neutral.neutral2,
    marginBottom: 8,
    fontFamily: 'Poppins',
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
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '400',
    color: neutral.neutral3,
    fontFamily: 'Poppins',
  },
  timerHighlight: {
    fontWeight: '600',
    color: primary.primary1,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: primary.primary1,
    textDecorationLine: 'underline',
    fontFamily: 'Poppins',
  },
  backLink: {
    fontSize: 13,
    fontWeight: '600',
    color: primary.primary1,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '400',
    color: neutral.neutral1,
    lineHeight: 18,
    fontFamily: 'Poppins',
  },
  termsLink: {
    color: primary.primary1,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  optionsContainer: {
    gap: 16,
    marginTop: 8,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: neutral.neutral6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: primary.primary1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: neutral.neutral1,
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  optionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: neutral.neutral3,
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: 'Poppins',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: primary.primary1,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Poppins',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: semantic.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: neutral.neutral1,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  successSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: neutral.neutral3,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Poppins',
  },
  successInfoCard: {
    backgroundColor: primary.primary4,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    gap: 12,
  },
  successInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successInfoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: neutral.neutral2,
    fontFamily: 'Poppins',
  },
  successInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: neutral.neutral1,
    fontFamily: 'Poppins',
  },
  // Compact layout styles for complete-registration step
  compactIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  compactIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: primary.primary1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  compactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: neutral.neutral1,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Poppins',
  },
  compactSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: neutral.neutral3,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontFamily: 'Poppins',
  },
  row: {
    flexDirection: 'row',
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
});
