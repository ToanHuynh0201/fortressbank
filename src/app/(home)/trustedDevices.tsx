import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	ActivityIndicator,
	FlatList,
	RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
	FadeInDown,
} from "react-native-reanimated";
import {
	CaretLeft,
	DeviceMobile,
	ShieldCheck,
	Trash,
	Plus,
	CheckCircle,
	Warning,
	Fingerprint,
} from "phosphor-react-native";
import colors from "@/constants/colors";
import { PrimaryButton, AlertModal, ConfirmationModal } from "@/components";
import { deviceService, type RegisteredDevice, type DeviceInfo } from "@/services";
import { scale, fontSize, spacing } from "@/utils/responsive";

/**
 * Trusted Devices Screen
 * 
 * Allows users to:
 * - View current device registration status
 * - Register current device for Smart OTP
 * - View all registered devices
 * - Unregister devices (revoke trust)
 */
const TrustedDevices = () => {
	const router = useRouter();

	// State
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
	const [registeredDevices, setRegisteredDevices] = useState<RegisteredDevice[]>([]);
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "info" as "success" | "error" | "info" | "warning",
	});
	const [confirmModal, setConfirmModal] = useState({
		visible: false,
		deviceId: "",
		deviceName: "",
	});

	// Animations
	const headerOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);

	useEffect(() => {
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});
		contentOpacity.value = withTiming(1, {
			duration: 500,
			easing: Easing.out(Easing.ease),
		});

		loadDeviceData();
	}, []);

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
	}));

	const loadDeviceData = async () => {
		try {
			setIsLoading(true);

			// Get current device info
			const info = await deviceService.getDeviceInfo();
			setDeviceInfo(info);

			// Get all registered devices from backend
			const devices = await deviceService.getRegisteredDevices();
			
			// Mark current device
			const currentDeviceId = await deviceService.getDeviceId();
			const devicesWithCurrent = devices.map(d => ({
				...d,
				isCurrent: d.deviceId === currentDeviceId,
			}));
			
			setRegisteredDevices(devicesWithCurrent);
		} catch (error) {
			console.error("Error loading device data:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Failed to load device information",
				variant: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onRefresh = useCallback(async () => {
		setIsRefreshing(true);
		await loadDeviceData();
		setIsRefreshing(false);
	}, []);

	const handleRegisterDevice = async () => {
		setIsRegistering(true);
		try {
			// Initialize keys if needed
			const keys = await deviceService.initializeDeviceKeys();
			if (!keys) {
				throw new Error("Failed to generate device keys");
			}

			// Register with backend
			const success = await deviceService.registerDevice();
			
			if (success) {
				setAlertModal({
					visible: true,
					title: "Success",
					message: "This device has been registered for Smart OTP authentication",
					variant: "success",
				});
				await loadDeviceData();
			} else {
				throw new Error("Registration failed");
			}
		} catch (error: any) {
			console.error("Error registering device:", error);
			setAlertModal({
				visible: true,
				title: "Registration Failed",
				message: error.message || "Failed to register this device",
				variant: "error",
			});
		} finally {
			setIsRegistering(false);
		}
	};

	const handleUnregisterDevice = (deviceId: string, deviceName: string) => {
		setConfirmModal({
			visible: true,
			deviceId,
			deviceName,
		});
	};

	const confirmUnregister = async () => {
		const { deviceId } = confirmModal;
		setConfirmModal({ visible: false, deviceId: "", deviceName: "" });

		try {
			const currentDeviceId = await deviceService.getDeviceId();
			
			if (deviceId === currentDeviceId) {
				// Unregister current device
				await deviceService.unregisterDevice();
			} else {
				// Unregister other device via API
				// Note: This would need a backend endpoint to unregister specific devices
				// For now, we'll show an info message
				setAlertModal({
					visible: true,
					title: "Info",
					message: "Remote device removal is not yet supported. Please unregister from that device directly.",
					variant: "info",
				});
				return;
			}

			setAlertModal({
				visible: true,
				title: "Device Removed",
				message: "The device has been unregistered from Smart OTP",
				variant: "success",
			});
			
			await loadDeviceData();
		} catch (error) {
			console.error("Error unregistering device:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Failed to unregister device",
				variant: "error",
			});
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const renderDeviceItem = ({ item, index }: { item: RegisteredDevice; index: number }) => (
		<Animated.View
			entering={FadeInDown.delay(index * 100).duration(400)}
			style={[
				styles.deviceCard,
				item.isCurrent && styles.currentDeviceCard,
			]}
		>
			<View style={styles.deviceIconContainer}>
				<DeviceMobile
					size={scale(28)}
					color={item.isCurrent ? colors.primary.primary1 : colors.neutral.neutral2}
					weight="duotone"
				/>
			</View>
			
			<View style={styles.deviceInfo}>
				<View style={styles.deviceNameRow}>
					<Text style={styles.deviceName}>{item.deviceName}</Text>
					{item.isCurrent && (
						<View style={styles.currentBadge}>
							<Text style={styles.currentBadgeText}>This Device</Text>
						</View>
					)}
				</View>
				<Text style={styles.deviceType}>
					{item.deviceType === "IOS" ? "iPhone" : "Android"}
				</Text>
				<Text style={styles.deviceDate}>
					Registered: {formatDate(item.registeredAt)}
				</Text>
			</View>

			<TouchableOpacity
				style={styles.deleteButton}
				onPress={() => handleUnregisterDevice(item.deviceId, item.deviceName)}
			>
				<Trash size={scale(20)} color={colors.semantic.error} weight="bold" />
			</TouchableOpacity>
		</Animated.View>
	);

	// Loading state
	if (isLoading) {
		return (
			<SafeAreaView style={styles.container} edges={["top"]}>
				<StatusBar barStyle="light-content" backgroundColor={colors.primary.primary1} />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primary.primary1} />
					<Text style={styles.loadingText}>Loading device information...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<StatusBar barStyle="light-content" backgroundColor={colors.primary.primary1} />

			{/* Header */}
			<LinearGradient
				colors={["#4A3FDB", "#3629B7", "#2A1F8F"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.header}
			>
				<Animated.View style={[styles.headerContent, headerAnimatedStyle]}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<CaretLeft size={scale(24)} color="#FFFFFF" weight="bold" />
					</TouchableOpacity>
					<View style={styles.headerTextContainer}>
						<Text style={styles.headerTitle}>Trusted Devices</Text>
						<Text style={styles.headerSubtitle}>Manage Smart OTP authentication</Text>
					</View>
				</Animated.View>
			</LinearGradient>

			{/* Content */}
			<Animated.View style={[styles.content, contentAnimatedStyle]}>
				{/* Current Device Status */}
				<View style={styles.statusCard}>
					<View style={styles.statusHeader}>
						{deviceInfo?.isRegistered ? (
							<CheckCircle size={scale(32)} color={colors.semantic.success} weight="fill" />
						) : (
							<Warning size={scale(32)} color={colors.semantic.warning} weight="fill" />
						)}
						<View style={styles.statusTextContainer}>
							<Text style={styles.statusTitle}>
								{deviceInfo?.isRegistered ? "Device Registered" : "Device Not Registered"}
							</Text>
							<Text style={styles.statusSubtitle}>
								{deviceInfo?.isRegistered
									? "Smart OTP is enabled on this device"
									: "Register to use biometric transaction signing"}
							</Text>
						</View>
					</View>

					{/* Biometric Info */}
					<View style={styles.biometricInfo}>
						<Fingerprint size={scale(20)} color={colors.primary.primary1} weight="bold" />
						<Text style={styles.biometricText}>
							{deviceInfo?.biometricAvailable
								? `${deviceInfo.biometricType} available`
								: "No biometric hardware detected"}
						</Text>
					</View>

					{/* Register Button (if not registered) */}
					{!deviceInfo?.isRegistered && (
						<PrimaryButton
							title={isRegistering ? "Registering..." : "Register This Device"}
							onPress={handleRegisterDevice}
							disabled={isRegistering || !deviceInfo?.biometricAvailable}
							loading={isRegistering}
							style={styles.registerButton}
						/>
					)}
				</View>

				{/* Security Notice */}
				<View style={styles.securityNotice}>
					<ShieldCheck size={scale(20)} color={colors.semantic.success} weight="fill" />
					<Text style={styles.securityText}>
						Registered devices can sign transactions using cryptographic keys stored securely on the device.
					</Text>
				</View>

				{/* Registered Devices List */}
				<View style={styles.devicesSection}>
					<Text style={styles.sectionTitle}>
						Registered Devices ({registeredDevices.length})
					</Text>

					{registeredDevices.length === 0 ? (
						<View style={styles.emptyState}>
							<DeviceMobile size={scale(48)} color={colors.neutral.neutral4} weight="thin" />
							<Text style={styles.emptyText}>No registered devices</Text>
							<Text style={styles.emptySubtext}>
								Register this device to enable Smart OTP
							</Text>
						</View>
					) : (
						<FlatList
							data={registeredDevices}
							renderItem={renderDeviceItem}
							keyExtractor={(item) => item.deviceId}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={styles.deviceList}
							refreshControl={
								<RefreshControl
									refreshing={isRefreshing}
									onRefresh={onRefresh}
									colors={[colors.primary.primary1]}
								/>
							}
						/>
					)}
				</View>
			</Animated.View>

			{/* Alert Modal */}
			<AlertModal
				visible={alertModal.visible}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
			/>

			{/* Confirmation Modal */}
			<ConfirmationModal
				visible={confirmModal.visible}
				title="Remove Device"
				message={`Are you sure you want to remove "${confirmModal.deviceName}" from trusted devices? This device will no longer be able to sign transactions.`}
				confirmText="Remove"
				cancelText="Cancel"
				onConfirm={confirmUnregister}
				onCancel={() => setConfirmModal({ visible: false, deviceId: "", deviceName: "" })}
				confirmButtonVariant="danger"
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: spacing(4),
	},
	loadingText: {
		fontSize: fontSize(14),
		color: colors.neutral.neutral2,
	},
	header: {
		paddingTop: spacing(4),
		paddingBottom: spacing(8),
		paddingHorizontal: spacing(4),
		borderBottomLeftRadius: scale(24),
		borderBottomRightRadius: scale(24),
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	headerTextContainer: {
		marginLeft: spacing(4),
	},
	headerTitle: {
		fontSize: fontSize(20),
		fontWeight: "700",
		color: "#FFFFFF",
	},
	headerSubtitle: {
		fontSize: fontSize(14),
		color: "rgba(255, 255, 255, 0.8)",
		marginTop: spacing(1),
	},
	content: {
		flex: 1,
		paddingHorizontal: spacing(4),
		paddingTop: spacing(4),
	},
	statusCard: {
		backgroundColor: colors.neutral.neutral6,
		borderRadius: scale(16),
		padding: spacing(4),
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
		shadowColor: colors.neutral.neutral1,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	statusHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(3),
	},
	statusTextContainer: {
		flex: 1,
	},
	statusTitle: {
		fontSize: fontSize(16),
		fontWeight: "700",
		color: colors.neutral.neutral1,
	},
	statusSubtitle: {
		fontSize: fontSize(13),
		color: colors.neutral.neutral3,
		marginTop: spacing(1),
	},
	biometricInfo: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(2),
		marginTop: spacing(4),
		paddingTop: spacing(4),
		borderTopWidth: 1,
		borderTopColor: colors.neutral.neutral5,
	},
	biometricText: {
		fontSize: fontSize(14),
		color: colors.neutral.neutral2,
	},
	registerButton: {
		marginTop: spacing(4),
	},
	securityNotice: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(82, 213, 186, 0.1)",
		paddingHorizontal: spacing(4),
		paddingVertical: spacing(3),
		borderRadius: scale(12),
		marginTop: spacing(4),
		gap: spacing(2),
	},
	securityText: {
		flex: 1,
		fontSize: fontSize(12),
		color: colors.semantic.success,
		lineHeight: fontSize(18),
	},
	devicesSection: {
		flex: 1,
		marginTop: spacing(6),
	},
	sectionTitle: {
		fontSize: fontSize(16),
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: spacing(3),
	},
	deviceList: {
		paddingBottom: spacing(4),
	},
	deviceCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.neutral.neutral6,
		borderRadius: scale(12),
		padding: spacing(4),
		marginBottom: spacing(3),
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
	},
	currentDeviceCard: {
		borderColor: colors.primary.primary3,
		backgroundColor: colors.primary.primary4,
	},
	deviceIconContainer: {
		width: scale(48),
		height: scale(48),
		borderRadius: scale(24),
		backgroundColor: colors.neutral.neutral5,
		justifyContent: "center",
		alignItems: "center",
	},
	deviceInfo: {
		flex: 1,
		marginLeft: spacing(3),
	},
	deviceNameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(2),
	},
	deviceName: {
		fontSize: fontSize(14),
		fontWeight: "600",
		color: colors.neutral.neutral1,
	},
	currentBadge: {
		backgroundColor: colors.primary.primary1,
		paddingHorizontal: spacing(2),
		paddingVertical: spacing(0.5),
		borderRadius: scale(4),
	},
	currentBadgeText: {
		fontSize: fontSize(10),
		fontWeight: "600",
		color: "#FFFFFF",
	},
	deviceType: {
		fontSize: fontSize(12),
		color: colors.neutral.neutral3,
		marginTop: spacing(0.5),
	},
	deviceDate: {
		fontSize: fontSize(11),
		color: colors.neutral.neutral4,
		marginTop: spacing(0.5),
	},
	deleteButton: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		backgroundColor: "rgba(255, 66, 103, 0.1)",
		justifyContent: "center",
		alignItems: "center",
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: spacing(8),
	},
	emptyText: {
		fontSize: fontSize(16),
		fontWeight: "600",
		color: colors.neutral.neutral3,
		marginTop: spacing(3),
	},
	emptySubtext: {
		fontSize: fontSize(13),
		color: colors.neutral.neutral4,
		marginTop: spacing(1),
		textAlign: "center",
	},
});

export default TrustedDevices;
