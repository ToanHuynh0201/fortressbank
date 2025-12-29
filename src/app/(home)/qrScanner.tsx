import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ScrollView,
	Share,
	TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { primary, neutral } from "@/constants";
import Feather from "@expo/vector-icons/Feather";
import QRCode from "react-native-qrcode-svg";
import { useAuth } from "@/hooks";
import { Account, accountService } from "@/services/accountService";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CameraView, Camera } from "expo-camera";
import { AlertModal, ConfirmationModal } from "@/components";
import { scale, fontSize, spacing } from "@/utils/responsive";

type QRMode = "static" | "dynamic";
type PageMode = "show" | "scan";

const QRScanner = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [selectedAccount, setSelectedAccount] = useState<Account | null>(
		null,
	);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [qrValue, setQrValue] = useState("");
	const [qrMode, setQrMode] = useState<QRMode>("static");
	const [amount, setAmount] = useState("");
	const [message, setMessage] = useState("");

	// Scanner states
	const [pageMode, setPageMode] = useState<PageMode>("show");
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [scanned, setScanned] = useState(false);

	// Modal states
	const [alertModal, setAlertModal] = useState({
		visible: false,
		title: "",
		message: "",
		variant: "error" as "success" | "error" | "info" | "warning",
	});
	const [confirmModal, setConfirmModal] = useState({
		visible: false,
		title: "",
		message: "",
		onConfirm: () => {},
	});

	useEffect(() => {
		fetchAccounts();
	}, []);

	useEffect(() => {
		if (pageMode === "scan") {
			getCameraPermissions();
		}
	}, [pageMode]);

	const getCameraPermissions = async () => {
		const { status } = await Camera.requestCameraPermissionsAsync();
		setHasPermission(status === "granted");
	};

	const fetchAccounts = async () => {
		try {
			setIsLoading(true);
			const response = await accountService.getAccounts();

			if (response.success && response.data && response.data.length > 0) {
				setAccounts(response.data);
				// Select first account by default
				setSelectedAccount(response.data[0]);
				generateQRData(response.data[0]);
			} else {
				setAlertModal({
					visible: true,
					title: "Error",
					message: "No accounts found",
					variant: "error",
				});
			}
		} catch (error) {
			console.error("Error fetching accounts:", error);
			setAlertModal({
				visible: true,
				title: "Error",
				message: "Failed to fetch accounts",
				variant: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (selectedAccount) {
			generateQRData(selectedAccount);
		}
	}, [qrMode, amount, message, selectedAccount, user]);

	const generateQRData = (account: Account) => {
		const baseData = {
			bankCode: "FORTRESS",
			accountNumber: account.accountNumber,
			accountName: user?.fullName || user?.name || "User",
			accountId: account.accountId,
		};

		if (qrMode === "dynamic") {
			const qrData = JSON.stringify({
				...baseData,
				amount: amount ? parseFloat(amount) : 0,
				message: message || "",
				type: "dynamic",
			});
			setQrValue(qrData);
		} else {
			const qrData = JSON.stringify({
				...baseData,
				type: "static",
			});
			setQrValue(qrData);
		}
	};

	const handleAccountSelect = (account: Account) => {
		setSelectedAccount(account);
		generateQRData(account);
	};

	const handleModeSwitch = (mode: QRMode) => {
		setQrMode(mode);
		if (mode === "static") {
			setAmount("");
			setMessage("");
		}
	};

	const handleAmountChange = (text: string) => {
		// Only allow numbers and decimal point
		const filtered = text.replace(/[^0-9.]/g, "");
		// Ensure only one decimal point
		const parts = filtered.split(".");
		if (parts.length > 2) {
			return;
		}
		setAmount(filtered);
	};

	const handleBarCodeScanned = ({
		type,
		data,
	}: {
		type: string;
		data: string;
	}) => {
		setScanned(true);

		try {
			// Parse QR data
			const qrData = JSON.parse(data);

			// Navigate to transfer page with pre-filled data
			router.push({
				pathname: "/(transfer)/transfer",
				params: {
					accountNumber: qrData.accountNumber,
					accountName: qrData.accountName,
					amount: qrData.amount || "",
					message: qrData.message || "",
				},
			});
		} catch (error) {
			setConfirmModal({
				visible: true,
				title: "Invalid QR Code",
				message: "The scanned QR code is not a valid payment QR code.",
				onConfirm: () => {
					setConfirmModal({ ...confirmModal, visible: false });
					setScanned(false);
				},
			});
		}
	};

	const handlePageModeSwitch = (mode: PageMode) => {
		setPageMode(mode);
		if (mode === "show") {
			setScanned(false);
		}
	};

	const handleShare = async () => {
		try {
			await Share.share({
				message: `Pay me via FortressBank\nAccount: ${
					selectedAccount?.accountNumber
				}\nName: ${user?.fullName || user?.name}`,
				title: "Share Payment QR",
			});
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	const handleCopyAccountNumber = () => {
		setAlertModal({
			visible: true,
			title: "Account Number Copied",
			message: `${selectedAccount?.accountNumber} has been copied to clipboard`,
			variant: "success",
		});
	};

	if (isLoading) {
		return (
			<LinearGradient
				colors={[primary.primary1, primary.primary2]}
				style={styles.gradientContainer}>
				<SafeAreaView style={styles.centerContainer}>
					<Text style={styles.loadingText}>Loading...</Text>
				</SafeAreaView>
			</LinearGradient>
		);
	}

	// Render Scanner View
	const renderScannerView = () => {
		if (hasPermission === null) {
			return (
				<View style={styles.centerContainer}>
					<Text style={styles.loadingText}>
						Requesting camera permission...
					</Text>
				</View>
			);
		}

		if (hasPermission === false) {
			return (
				<View style={styles.centerContainer}>
					<View style={styles.errorCard}>
						<Feather
							name="camera-off"
							size={scale(64)}
							color={neutral.neutral6}
						/>
						<Text style={styles.errorTitle}>
							Camera Access Denied
						</Text>
						<Text style={styles.errorText}>
							Please enable camera permission in settings to scan
							QR codes
						</Text>
						<TouchableOpacity
							style={styles.primaryButton}
							onPress={() => handlePageModeSwitch("show")}>
							<Feather
								name="arrow-left"
								size={scale(20)}
								color={neutral.neutral6}
							/>
							<Text style={styles.primaryButtonText}>
								Go Back
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		}

		return (
			<View style={styles.scannerContainer}>
				<View style={styles.cameraWrapper}>
					<CameraView
						style={styles.camera}
						facing="back"
						onBarcodeScanned={
							scanned ? undefined : handleBarCodeScanned
						}
						barcodeScannerSettings={{
							barcodeTypes: ["qr"],
						}}>
						<View style={styles.overlay}>
							<View style={styles.scanFrame}>
								{/* Corner decorations */}
								<View style={[styles.corner, styles.topLeft]} />
								<View
									style={[styles.corner, styles.topRight]}
								/>
								<View
									style={[styles.corner, styles.bottomLeft]}
								/>
								<View
									style={[styles.corner, styles.bottomRight]}
								/>
								<View style={styles.scanLine} />
							</View>
						</View>
					</CameraView>
				</View>

				{/* Scanner Instructions */}
				<View style={styles.scannerInstructionCard}>
					<Feather
						name={scanned ? "check-circle" : "maximize"}
						size={scale(32)}
						color={scanned ? "#22C55E" : neutral.neutral6}
						style={{ marginBottom: spacing(12) }}
					/>
					<Text style={styles.scannerInstructionTitle}>
						{scanned ? "QR Code Scanned!" : "Position QR Code"}
					</Text>
					<Text style={styles.scannerInstructionText}>
						{scanned
							? "Processing payment information..."
							: "Align the QR code within the frame to scan"}
					</Text>

					{scanned && (
						<TouchableOpacity
							style={styles.scanAgainButton}
							onPress={() => setScanned(false)}>
							<Feather
								name="rotate-cw"
								size={scale(20)}
								color={neutral.neutral6}
							/>
							<Text style={styles.scanAgainText}>Scan Again</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	};

	return (
		<LinearGradient
			colors={[primary.primary1, primary.primary2]}
			style={styles.gradientContainer}>
			<SafeAreaView
				style={styles.container}
				edges={["top"]}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.headerButton}
						onPress={() => router.back()}>
						<Feather
							name="arrow-left"
							size={scale(24)}
							color={neutral.neutral6}
						/>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>
						{pageMode === "show" ? "My QR Code" : "Scan QR"}
					</Text>
					<TouchableOpacity
						style={styles.headerButton}
						onPress={
							pageMode === "show"
								? handleShare
								: () => handlePageModeSwitch("show")
						}>
						<Feather
							name={pageMode === "show" ? "share-2" : "x"}
							size={scale(20)}
							color={neutral.neutral6}
						/>
					</TouchableOpacity>
				</View>

				{/* Page Mode Toggle */}
				<Animated.View
					entering={FadeInDown.duration(300)}
					style={styles.pageModeToggleContainer}>
					<TouchableOpacity
						style={[
							styles.pageModeToggleButton,
							pageMode === "show" &&
								styles.pageModeToggleButtonActive,
						]}
						onPress={() => handlePageModeSwitch("show")}
						activeOpacity={0.7}>
						<Feather
							name="image"
							size={scale(18)}
							color={
								pageMode === "show"
									? primary.primary1
									: neutral.neutral6
							}
						/>
						<Text
							style={[
								styles.pageModeToggleText,
								pageMode === "show" &&
									styles.pageModeToggleTextActive,
							]}>
							Show My QR
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.pageModeToggleButton,
							pageMode === "scan" &&
								styles.pageModeToggleButtonActive,
						]}
						onPress={() => handlePageModeSwitch("scan")}
						activeOpacity={0.7}>
						<Feather
							name="camera"
							size={scale(18)}
							color={
								pageMode === "scan"
									? primary.primary1
									: neutral.neutral6
							}
						/>
						<Text
							style={[
								styles.pageModeToggleText,
								pageMode === "scan" &&
									styles.pageModeToggleTextActive,
							]}>
							Scan QR
						</Text>
					</TouchableOpacity>
				</Animated.View>

				{pageMode === "scan" ? (
					renderScannerView()
				) : (
					<ScrollView
						style={styles.scrollContent}
						contentContainerStyle={styles.scrollContentContainer}
						showsVerticalScrollIndicator={false}>
						{/* Account Selector - Compact */}
						<Animated.View
							entering={FadeInDown.duration(400).delay(100)}
							style={styles.accountSelectorContainer}>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={
									styles.accountScrollContainer
								}>
								{accounts.map((account, index) => (
									<TouchableOpacity
										key={account.accountId}
										style={[
											styles.accountChip,
											selectedAccount?.accountId ===
												account.accountId &&
												styles.accountChipActive,
										]}
										onPress={() =>
											handleAccountSelect(account)
										}
										activeOpacity={0.7}>
										<Text
											style={[
												styles.accountChipText,
												selectedAccount?.accountId ===
													account.accountId &&
													styles.accountChipTextActive,
											]}>
											•••{" "}
											{account.accountNumber.slice(-4)}
										</Text>
										<Text
											style={[
												styles.accountChipBalance,
												selectedAccount?.accountId ===
													account.accountId &&
													styles.accountChipBalanceActive,
											]}>
											${account.balance.toFixed(2)}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</Animated.View>

						{/* QR Mode Toggle */}
						<Animated.View
							entering={FadeInDown.duration(400).delay(150)}
							style={styles.modeToggleContainer}>
							<TouchableOpacity
								style={[
									styles.modeToggleButton,
									qrMode === "static" &&
										styles.modeToggleButtonActive,
								]}
								onPress={() => handleModeSwitch("static")}
								activeOpacity={0.7}>
								<Feather
									name="lock"
									size={scale(16)}
									color={
										qrMode === "static"
											? neutral.neutral6
											: primary.primary1
									}
								/>
								<Text
									style={[
										styles.modeToggleText,
										qrMode === "static" &&
											styles.modeToggleTextActive,
									]}>
									Static QR
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.modeToggleButton,
									qrMode === "dynamic" &&
										styles.modeToggleButtonActive,
								]}
								onPress={() => handleModeSwitch("dynamic")}
								activeOpacity={0.7}>
								<Feather
									name="edit-3"
									size={scale(16)}
									color={
										qrMode === "dynamic"
											? neutral.neutral6
											: primary.primary1
									}
								/>
								<Text
									style={[
										styles.modeToggleText,
										qrMode === "dynamic" &&
											styles.modeToggleTextActive,
									]}>
									Dynamic QR
								</Text>
							</TouchableOpacity>
						</Animated.View>

						{/* Dynamic QR Inputs */}
						{qrMode === "dynamic" && (
							<Animated.View
								entering={FadeInDown.duration(400).delay(200)}
								style={styles.dynamicInputsContainer}>
								{/* Amount Input */}
								<View style={styles.inputGroup}>
									<Text style={styles.inputLabel}>
										Amount (Optional)
									</Text>
									<View style={styles.inputWrapper}>
										<Text style={styles.currencySymbol}>
											$
										</Text>
										<TextInput
											style={styles.input}
											placeholder="0.00"
											placeholderTextColor={
												neutral.neutral4
											}
											value={amount}
											onChangeText={handleAmountChange}
											keyboardType="decimal-pad"
										/>
									</View>
								</View>

								{/* Message Input */}
								<View style={styles.inputGroup}>
									<Text style={styles.inputLabel}>
										Message (Optional)
									</Text>
									<TextInput
										style={[
											styles.input,
											styles.messageInput,
										]}
										placeholder="Enter payment message..."
										placeholderTextColor={neutral.neutral4}
										value={message}
										onChangeText={setMessage}
										multiline
										maxLength={100}
									/>
									<Text style={styles.charCount}>
										{message.length}/100
									</Text>
								</View>
							</Animated.View>
						)}

						{/* QR Code Card */}
						<Animated.View
							entering={FadeInDown.duration(400).delay(250)}
							style={styles.qrCard}>
							<LinearGradient
								colors={["#FFFFFF", "#F8F9FF"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.qrCardGradient}>
								{/* User Info - Compact */}
								<View style={styles.userInfoSection}>
									<View style={styles.userAvatar}>
										<Feather
											name="user"
											size={scale(24)}
											color={primary.primary1}
										/>
									</View>
									<Text style={styles.userName}>
										{user?.fullName || user?.name || "User"}
									</Text>
									<View style={styles.bankBadge}>
										<Feather
											name="shield"
											size={scale(12)}
											color={primary.primary1}
										/>
										<Text style={styles.bankName}>
											FortressBank
										</Text>
									</View>
								</View>

								{/* QR Code */}
								<View style={styles.qrCodeContainer}>
									<View style={styles.qrCodeWrapper}>
										{qrValue && (
											<QRCode
												value={qrValue}
												size={scale(180)}
												color={primary.primary1}
												backgroundColor="white"
												logo={require("../../../assets/icon.png")}
												logoSize={scale(40)}
												logoBackgroundColor="white"
												logoBorderRadius={scale(8)}
											/>
										)}
									</View>
								</View>

								{/* Account Info */}
								<View style={styles.accountInfoSection}>
									<TouchableOpacity
										style={styles.accountNumberContainer}
										onPress={handleCopyAccountNumber}
										activeOpacity={0.7}>
										<Text style={styles.accountNumber}>
											{selectedAccount?.accountNumber}
										</Text>
										<Feather
											name="copy"
											size={scale(18)}
											color={primary.primary1}
										/>
									</TouchableOpacity>
								</View>

								{/* Dynamic QR Info Display */}
								{qrMode === "dynamic" &&
									(amount || message) && (
										<View style={styles.dynamicInfoDisplay}>
											{amount && (
												<View
													style={
														styles.dynamicInfoItem
													}>
													<Feather
														name="dollar-sign"
														size={scale(14)}
														color={primary.primary1}
													/>
													<Text
														style={
															styles.dynamicInfoLabel
														}>
														Amount:
													</Text>
													<Text
														style={
															styles.dynamicInfoValue
														}>
														${amount}
													</Text>
												</View>
											)}
											{message && (
												<View
													style={
														styles.dynamicInfoItem
													}>
													<Feather
														name="message-circle"
														size={scale(14)}
														color={primary.primary1}
													/>
													<Text
														style={
															styles.dynamicInfoLabel
														}>
														Message:
													</Text>
													<Text
														style={
															styles.dynamicInfoValue
														}
														numberOfLines={2}>
														{message}
													</Text>
												</View>
											)}
										</View>
									)}
							</LinearGradient>
						</Animated.View>

						{/* Info Cards */}
						<Animated.View
							entering={FadeInDown.duration(400).delay(400)}
							style={styles.infoCardsContainer}>
							<View style={styles.infoCard}>
								<View style={styles.infoCardHeader}>
									<Feather
										name="shield"
										size={scale(20)}
										color={primary.primary1}
									/>
									<Text style={styles.infoCardTitle}>
										Security Notice
									</Text>
								</View>
								<Text style={styles.infoCardText}>
									Never share your PIN or password. This QR
									code only contains your account number for
									receiving payments.
								</Text>
							</View>

							{qrMode === "static" ? (
								<View style={styles.infoCard}>
									<View style={styles.infoCardHeader}>
										<Feather
											name="zap"
											size={scale(20)}
											color={primary.primary1}
										/>
										<Text style={styles.infoCardTitle}>
											Static QR Code
										</Text>
									</View>
									<Text style={styles.infoCardText}>
										This QR code can be used for any amount.
										The payer can scan and enter their
										desired amount.
									</Text>
								</View>
							) : (
								<View style={styles.infoCard}>
									<View style={styles.infoCardHeader}>
										<Feather
											name="edit-3"
											size={scale(20)}
											color={primary.primary1}
										/>
										<Text style={styles.infoCardTitle}>
											Dynamic QR Code
										</Text>
									</View>
									<Text style={styles.infoCardText}>
										This QR code includes the amount and
										message you specified. Perfect for
										specific payment requests.
									</Text>
								</View>
							)}
						</Animated.View>
					</ScrollView>
				)}

				<AlertModal
					visible={alertModal.visible}
					title={alertModal.title}
					message={alertModal.message}
					variant={alertModal.variant}
					onClose={() => setAlertModal({ ...alertModal, visible: false })}
				/>

				<ConfirmationModal
					visible={confirmModal.visible}
					title={confirmModal.title}
					message={confirmModal.message}
					confirmText="Scan Again"
					cancelText="Cancel"
					onConfirm={confirmModal.onConfirm}
					onCancel={() => {
						setConfirmModal({ ...confirmModal, visible: false });
						setPageMode("show");
					}}
				/>
			</SafeAreaView>
		</LinearGradient>
	);
};

export default QRScanner;

const styles = StyleSheet.create({
	gradientContainer: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingBottom: spacing(50),
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: fontSize(16),
		color: neutral.neutral6,
		fontWeight: "600",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: spacing(24),
		paddingVertical: spacing(16),
	},
	headerButton: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: fontSize(20),
		fontWeight: "700",
		color: neutral.neutral6,
		fontFamily: "Poppins",
	},
	scrollContent: {
		flex: 1,
	},
	scrollContentContainer: {
		paddingHorizontal: spacing(24),
		paddingBottom: spacing(100),
		paddingTop: spacing(8),
	},
	accountSelectorContainer: {
		marginBottom: spacing(12),
	},
	sectionTitle: {
		fontSize: fontSize(14),
		fontWeight: "600",
		color: neutral.neutral6,
		marginBottom: spacing(8),
		fontFamily: "Poppins",
	},
	accountScrollContainer: {
		gap: spacing(12),
	},
	accountChip: {
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: scale(12),
		paddingHorizontal: spacing(16),
		paddingVertical: spacing(10),
		borderWidth: scale(1.5),
		borderColor: "rgba(255, 255, 255, 0.3)",
		minWidth: scale(120),
	},
	accountChipActive: {
		backgroundColor: neutral.neutral6,
		borderColor: neutral.neutral6,
	},
	accountChipText: {
		fontSize: fontSize(13),
		fontWeight: "600",
		color: neutral.neutral6,
		marginBottom: spacing(2),
		fontFamily: "Poppins",
	},
	accountChipTextActive: {
		color: primary.primary1,
	},
	accountChipBalance: {
		fontSize: fontSize(11),
		fontWeight: "500",
		color: "rgba(255, 255, 255, 0.8)",
		fontFamily: "Poppins",
	},
	accountChipBalanceActive: {
		color: neutral.neutral2,
	},
	qrCard: {
		borderRadius: scale(20),
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(6) },
		shadowOpacity: 0.12,
		shadowRadius: scale(12),
		elevation: 8,
		marginBottom: spacing(16),
	},
	qrCardGradient: {
		padding: spacing(20),
		alignItems: "center",
	},
	userInfoSection: {
		alignItems: "center",
		marginBottom: spacing(16),
	},
	userAvatar: {
		width: scale(56),
		height: scale(56),
		borderRadius: scale(28),
		backgroundColor: "rgba(74, 63, 219, 0.1)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: spacing(8),
		borderWidth: scale(2),
		borderColor: "rgba(74, 63, 219, 0.2)",
	},
	userName: {
		fontSize: fontSize(18),
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: spacing(6),
		fontFamily: "Poppins",
	},
	bankBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74, 63, 219, 0.1)",
		paddingHorizontal: spacing(12),
		paddingVertical: spacing(4),
		borderRadius: scale(16),
		gap: spacing(4),
	},
	bankName: {
		fontSize: fontSize(11),
		fontWeight: "600",
		color: primary.primary1,
		fontFamily: "Poppins",
	},
	qrCodeContainer: {
		marginBottom: spacing(16),
	},
	qrCodeWrapper: {
		padding: spacing(16),
		backgroundColor: "white",
		borderRadius: scale(16),
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: scale(3) },
		shadowOpacity: 0.08,
		shadowRadius: scale(8),
		elevation: 4,
	},
	accountInfoSection: {
		width: "100%",
		alignItems: "center",
		marginBottom: spacing(12),
	},
	accountInfoLabel: {
		fontSize: fontSize(11),
		fontWeight: "500",
		color: neutral.neutral3,
		marginBottom: spacing(6),
		textTransform: "uppercase",
		letterSpacing: 0.5,
		fontFamily: "Poppins",
	},
	accountNumberContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74, 63, 219, 0.08)",
		paddingHorizontal: spacing(16),
		paddingVertical: spacing(10),
		borderRadius: scale(10),
		gap: spacing(8),
	},
	accountNumber: {
		fontSize: fontSize(16),
		fontWeight: "600",
		color: primary.primary1,
		letterSpacing: 0.8,
		fontFamily: "Poppins",
	},
	instructionSection: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74, 63, 219, 0.05)",
		paddingHorizontal: spacing(12),
		paddingVertical: spacing(10),
		borderRadius: scale(10),
		gap: spacing(6),
		width: "100%",
	},
	instructionText: {
		fontSize: fontSize(11),
		color: neutral.neutral3,
		flex: 1,
		fontFamily: "Poppins",
	},
	actionButtonsContainer: {
		flexDirection: "row",
		gap: spacing(10),
		marginBottom: spacing(16),
	},
	actionButton: {
		flex: 1,
		backgroundColor: neutral.neutral6,
		borderRadius: scale(14),
		padding: spacing(12),
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(2) },
		shadowOpacity: 0.08,
		shadowRadius: scale(6),
		elevation: 2,
	},
	actionButtonIconContainer: {
		width: scale(40),
		height: scale(40),
		borderRadius: scale(20),
		backgroundColor: "rgba(74, 63, 219, 0.1)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: spacing(6),
	},
	actionButtonText: {
		fontSize: fontSize(12),
		fontWeight: "600",
		color: neutral.neutral1,
		fontFamily: "Poppins",
	},
	infoCardsContainer: {
		gap: spacing(10),
	},
	infoCard: {
		backgroundColor: neutral.neutral6,
		borderRadius: scale(14),
		padding: spacing(14),
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(1) },
		shadowOpacity: 0.04,
		shadowRadius: scale(6),
		elevation: 1,
	},
	infoCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(6),
		marginBottom: spacing(6),
	},
	infoCardTitle: {
		fontSize: fontSize(13),
		fontWeight: "600",
		color: neutral.neutral1,
		fontFamily: "Poppins",
	},
	infoCardText: {
		fontSize: fontSize(11),
		color: neutral.neutral2,
		lineHeight: fontSize(16),
		fontFamily: "Poppins",
	},
	// Mode Toggle Styles
	modeToggleContainer: {
		flexDirection: "row",
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: scale(14),
		padding: spacing(3),
		marginBottom: spacing(12),
		gap: spacing(3),
	},
	modeToggleButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: spacing(10),
		paddingHorizontal: spacing(12),
		borderRadius: scale(11),
		gap: spacing(5),
	},
	modeToggleButtonActive: {
		backgroundColor: primary.primary1,
	},
	modeToggleText: {
		fontSize: fontSize(13),
		fontWeight: "600",
		color: primary.primary1,
		fontFamily: "Poppins",
	},
	modeToggleTextActive: {
		color: neutral.neutral6,
	},
	// Dynamic Inputs Styles
	dynamicInputsContainer: {
		backgroundColor: neutral.neutral6,
		borderRadius: scale(16),
		padding: spacing(16),
		marginBottom: spacing(12),
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(3) },
		shadowOpacity: 0.06,
		shadowRadius: scale(8),
		elevation: 3,
		gap: spacing(12),
	},
	inputGroup: {
		gap: spacing(6),
	},
	inputLabel: {
		fontSize: fontSize(12),
		fontWeight: "600",
		color: neutral.neutral1,
		fontFamily: "Poppins",
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74, 63, 219, 0.05)",
		borderRadius: scale(10),
		borderWidth: scale(1.5),
		borderColor: "rgba(74, 63, 219, 0.1)",
		paddingHorizontal: spacing(14),
	},
	currencySymbol: {
		fontSize: fontSize(16),
		fontWeight: "600",
		color: primary.primary1,
		marginRight: spacing(6),
		fontFamily: "Poppins",
	},
	input: {
		flex: 1,
		fontSize: fontSize(14),
		fontWeight: "500",
		color: neutral.neutral1,
		paddingVertical: spacing(12),
		fontFamily: "Poppins",
		backgroundColor: "rgba(74, 63, 219, 0.05)",
		borderRadius: scale(10),
		borderWidth: scale(1.5),
		borderColor: "rgba(74, 63, 219, 0.1)",
		paddingHorizontal: spacing(14),
	},
	messageInput: {
		minHeight: scale(70),
		textAlignVertical: "top",
		paddingTop: spacing(10),
	},
	charCount: {
		fontSize: fontSize(11),
		color: neutral.neutral3,
		textAlign: "right",
		fontFamily: "Poppins",
		marginTop: spacing(4),
	},
	// Dynamic Info Display Styles
	dynamicInfoDisplay: {
		width: "100%",
		backgroundColor: "rgba(74, 63, 219, 0.05)",
		borderRadius: scale(10),
		padding: spacing(10),
		marginBottom: spacing(12),
		gap: spacing(6),
	},
	dynamicInfoItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(5),
	},
	dynamicInfoLabel: {
		fontSize: fontSize(11),
		fontWeight: "500",
		color: neutral.neutral2,
		fontFamily: "Poppins",
	},
	dynamicInfoValue: {
		fontSize: fontSize(12),
		fontWeight: "600",
		color: primary.primary1,
		fontFamily: "Poppins",
		flex: 1,
	},
	// Page Mode Toggle Styles
	pageModeToggleContainer: {
		flexDirection: "row",
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		borderRadius: scale(16),
		padding: spacing(4),
		marginHorizontal: spacing(24),
		marginBottom: spacing(20),
		gap: spacing(4),
	},
	pageModeToggleButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: spacing(14),
		paddingHorizontal: spacing(16),
		borderRadius: scale(12),
		gap: spacing(8),
	},
	pageModeToggleButtonActive: {
		backgroundColor: neutral.neutral6,
	},
	pageModeToggleText: {
		fontSize: fontSize(14),
		fontWeight: "600",
		color: neutral.neutral6,
		fontFamily: "Poppins",
	},
	pageModeToggleTextActive: {
		color: primary.primary1,
	},
	// Scanner Styles
	scannerContainer: {
		flex: 1,
		paddingHorizontal: spacing(24),
		paddingBottom: spacing(140),
		gap: spacing(20),
	},
	cameraWrapper: {
		flex: 1,
		borderRadius: scale(24),
		overflow: "hidden",
		backgroundColor: neutral.neutral1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(8) },
		shadowOpacity: 0.3,
		shadowRadius: scale(16),
		elevation: 10,
	},
	camera: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		justifyContent: "center",
		alignItems: "center",
	},
	scanFrame: {
		width: scale(280),
		height: scale(280),
		position: "relative",
	},
	corner: {
		position: "absolute",
		width: scale(50),
		height: scale(50),
		borderColor: neutral.neutral6,
		borderWidth: scale(5),
	},
	topLeft: {
		top: 0,
		left: 0,
		borderBottomWidth: 0,
		borderRightWidth: 0,
		borderTopLeftRadius: scale(16),
	},
	topRight: {
		top: 0,
		right: 0,
		borderBottomWidth: 0,
		borderLeftWidth: 0,
		borderTopRightRadius: scale(16),
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderTopWidth: 0,
		borderRightWidth: 0,
		borderBottomLeftRadius: scale(16),
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderTopWidth: 0,
		borderLeftWidth: 0,
		borderBottomRightRadius: scale(16),
	},
	scanLine: {
		position: "absolute",
		top: "50%",
		left: 0,
		right: 0,
		height: scale(2),
		backgroundColor: neutral.neutral6,
		opacity: 0.8,
	},
	scannerInstructionCard: {
		backgroundColor: neutral.neutral6,
		borderRadius: scale(20),
		padding: spacing(24),
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.1,
		shadowRadius: scale(12),
		elevation: 5,
	},
	scannerInstructionTitle: {
		fontSize: fontSize(18),
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: spacing(8),
		fontFamily: "Poppins",
	},
	scannerInstructionText: {
		fontSize: fontSize(14),
		color: neutral.neutral2,
		textAlign: "center",
		lineHeight: fontSize(20),
		fontFamily: "Poppins",
	},
	errorCard: {
		backgroundColor: neutral.neutral6,
		borderRadius: scale(24),
		padding: spacing(32),
		alignItems: "center",
		width: "90%",
		maxWidth: scale(320),
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.1,
		shadowRadius: scale(12),
		elevation: 5,
	},
	errorTitle: {
		fontSize: fontSize(20),
		fontWeight: "700",
		color: neutral.neutral1,
		marginTop: spacing(16),
		marginBottom: spacing(8),
		fontFamily: "Poppins",
	},
	errorText: {
		fontSize: fontSize(14),
		color: neutral.neutral2,
		textAlign: "center",
		lineHeight: fontSize(20),
		marginBottom: spacing(24),
		fontFamily: "Poppins",
	},
	primaryButton: {
		backgroundColor: primary.primary1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: spacing(32),
		paddingVertical: spacing(16),
		borderRadius: scale(30),
		gap: spacing(8),
	},
	primaryButtonText: {
		color: neutral.neutral6,
		fontSize: fontSize(16),
		fontWeight: "600",
		fontFamily: "Poppins",
	},
	scanAgainButton: {
		backgroundColor: primary.primary1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: spacing(28),
		paddingVertical: spacing(14),
		borderRadius: scale(30),
		marginTop: spacing(20),
		gap: spacing(8),
	},
	scanAgainText: {
		color: neutral.neutral6,
		fontSize: fontSize(16),
		fontWeight: "600",
		fontFamily: "Poppins",
	},
});
