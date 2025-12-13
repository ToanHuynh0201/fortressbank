import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ScrollView,
	Alert,
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
				Alert.alert("Error", "No accounts found");
			}
		} catch (error) {
			console.error("Error fetching accounts:", error);
			Alert.alert("Error", "Failed to fetch accounts");
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
			Alert.alert(
				"Invalid QR Code",
				"The scanned QR code is not a valid payment QR code.",
				[
					{
						text: "Scan Again",
						onPress: () => setScanned(false),
					},
					{
						text: "Cancel",
						onPress: () => setPageMode("show"),
					},
				],
			);
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
		Alert.alert(
			"Account Number Copied",
			`${selectedAccount?.accountNumber} has been copied to clipboard`,
			[{ text: "OK" }],
		);
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
							size={64}
							color={neutral.neutral6}
						/>
						<Text style={styles.errorTitle}>Camera Access Denied</Text>
						<Text style={styles.errorText}>
							Please enable camera permission in settings to scan QR
							codes
						</Text>
						<TouchableOpacity
							style={styles.primaryButton}
							onPress={() => handlePageModeSwitch("show")}>
							<Feather
								name="arrow-left"
								size={20}
								color={neutral.neutral6}
							/>
							<Text style={styles.primaryButtonText}>Go Back</Text>
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
						onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
						barcodeScannerSettings={{
							barcodeTypes: ["qr"],
						}}>
						<View style={styles.overlay}>
							<View style={styles.scanFrame}>
								{/* Corner decorations */}
								<View style={[styles.corner, styles.topLeft]} />
								<View style={[styles.corner, styles.topRight]} />
								<View style={[styles.corner, styles.bottomLeft]} />
								<View style={[styles.corner, styles.bottomRight]} />
								<View style={styles.scanLine} />
							</View>
						</View>
					</CameraView>
				</View>

				{/* Scanner Instructions */}
				<View style={styles.scannerInstructionCard}>
					<Feather
						name={scanned ? "check-circle" : "maximize"}
						size={32}
						color={scanned ? "#22C55E" : neutral.neutral6}
						style={{ marginBottom: 12 }}
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
								size={20}
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
							size={24}
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
							size={20}
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
							pageMode === "show" && styles.pageModeToggleButtonActive,
						]}
						onPress={() => handlePageModeSwitch("show")}
						activeOpacity={0.7}>
						<Feather
							name="image"
							size={18}
							color={
								pageMode === "show" ? neutral.neutral6 : primary.primary1
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
							pageMode === "scan" && styles.pageModeToggleButtonActive,
						]}
						onPress={() => handlePageModeSwitch("scan")}
						activeOpacity={0.7}>
						<Feather
							name="camera"
							size={18}
							color={
								pageMode === "scan" ? neutral.neutral6 : primary.primary1
							}
						/>
						<Text
							style={[
								styles.pageModeToggleText,
								pageMode === "scan" && styles.pageModeToggleTextActive,
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
					{/* Account Selector */}
					<Animated.View
						entering={FadeInDown.duration(400).delay(100)}
						style={styles.accountSelectorContainer}>
						<Text style={styles.sectionTitle}>Select Account</Text>
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
									onPress={() => handleAccountSelect(account)}
									activeOpacity={0.7}>
									<Text
										style={[
											styles.accountChipText,
											selectedAccount?.accountId ===
												account.accountId &&
												styles.accountChipTextActive,
										]}>
										••• {account.accountNumber.slice(-4)}
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
								qrMode === "static" && styles.modeToggleButtonActive,
							]}
							onPress={() => handleModeSwitch("static")}
							activeOpacity={0.7}>
							<Feather
								name="lock"
								size={16}
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
								qrMode === "dynamic" && styles.modeToggleButtonActive,
							]}
							onPress={() => handleModeSwitch("dynamic")}
							activeOpacity={0.7}>
							<Feather
								name="edit-3"
								size={16}
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
									<Text style={styles.currencySymbol}>$</Text>
									<TextInput
										style={styles.input}
										placeholder="0.00"
										placeholderTextColor={neutral.neutral4}
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
									style={[styles.input, styles.messageInput]}
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
							{/* User Info */}
							<View style={styles.userInfoSection}>
								<View style={styles.userAvatar}>
									<Feather
										name="user"
										size={32}
										color={primary.primary1}
									/>
								</View>
								<Text style={styles.userName}>
									{user?.fullName || user?.name || "User"}
								</Text>
								<View style={styles.bankBadge}>
									<Feather
										name="shield"
										size={14}
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
											size={220}
											color={primary.primary1}
											backgroundColor="white"
											logo={require("../../../assets/icon.png")}
											logoSize={50}
											logoBackgroundColor="white"
											logoBorderRadius={10}
										/>
									)}
								</View>
							</View>

							{/* Account Info */}
							<View style={styles.accountInfoSection}>
								<Text style={styles.accountInfoLabel}>
									Account Number
								</Text>
								<TouchableOpacity
									style={styles.accountNumberContainer}
									onPress={handleCopyAccountNumber}
									activeOpacity={0.7}>
									<Text style={styles.accountNumber}>
										{selectedAccount?.accountNumber}
									</Text>
									<Feather
										name="copy"
										size={18}
										color={primary.primary1}
									/>
								</TouchableOpacity>
							</View>

							{/* Dynamic QR Info Display */}
							{qrMode === "dynamic" && (amount || message) && (
								<View style={styles.dynamicInfoDisplay}>
									{amount && (
										<View style={styles.dynamicInfoItem}>
											<Feather
												name="dollar-sign"
												size={14}
												color={primary.primary1}
											/>
											<Text style={styles.dynamicInfoLabel}>
												Amount:
											</Text>
											<Text style={styles.dynamicInfoValue}>
												${amount}
											</Text>
										</View>
									)}
									{message && (
										<View style={styles.dynamicInfoItem}>
											<Feather
												name="message-circle"
												size={14}
												color={primary.primary1}
											/>
											<Text style={styles.dynamicInfoLabel}>
												Message:
											</Text>
											<Text
												style={styles.dynamicInfoValue}
												numberOfLines={2}>
												{message}
											</Text>
										</View>
									)}
								</View>
							)}

							{/* Instruction */}
							<View style={styles.instructionSection}>
								<Feather
									name="info"
									size={16}
									color={neutral.neutral3}
								/>
								<Text style={styles.instructionText}>
									{qrMode === "dynamic"
										? "This QR includes amount and message for the payment"
										: "Show this QR code to receive payments"}
								</Text>
							</View>
						</LinearGradient>
					</Animated.View>

					{/* Action Buttons */}
					<Animated.View
						entering={FadeInDown.duration(400).delay(300)}
						style={styles.actionButtonsContainer}>
						<TouchableOpacity
							style={styles.actionButton}
							onPress={handleShare}
							activeOpacity={0.7}>
							<View style={styles.actionButtonIconContainer}>
								<Feather
									name="share-2"
									size={20}
									color={primary.primary1}
								/>
							</View>
							<Text style={styles.actionButtonText}>
								Share QR
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.actionButton}
							onPress={handleCopyAccountNumber}
							activeOpacity={0.7}>
							<View style={styles.actionButtonIconContainer}>
								<Feather
									name="copy"
									size={20}
									color={primary.primary1}
								/>
							</View>
							<Text style={styles.actionButtonText}>
								Copy Account
							</Text>
						</TouchableOpacity>
					</Animated.View>

					{/* Info Cards */}
					<Animated.View
						entering={FadeInDown.duration(400).delay(400)}
						style={styles.infoCardsContainer}>
						<View style={styles.infoCard}>
							<View style={styles.infoCardHeader}>
								<Feather
									name="shield"
									size={20}
									color={primary.primary1}
								/>
								<Text style={styles.infoCardTitle}>
									Security Notice
								</Text>
							</View>
							<Text style={styles.infoCardText}>
								Never share your PIN or password. This QR code only
								contains your account number for receiving payments.
							</Text>
						</View>

						{qrMode === "static" ? (
							<View style={styles.infoCard}>
								<View style={styles.infoCardHeader}>
									<Feather
										name="zap"
										size={20}
										color={primary.primary1}
									/>
									<Text style={styles.infoCardTitle}>
										Static QR Code
									</Text>
								</View>
								<Text style={styles.infoCardText}>
									This QR code can be used for any amount. The
									payer can scan and enter their desired amount.
								</Text>
							</View>
						) : (
							<View style={styles.infoCard}>
								<View style={styles.infoCardHeader}>
									<Feather
										name="edit-3"
										size={20}
										color={primary.primary1}
									/>
									<Text style={styles.infoCardTitle}>
										Dynamic QR Code
									</Text>
								</View>
								<Text style={styles.infoCardText}>
									This QR code includes the amount and message you
									specified. Perfect for specific payment requests.
								</Text>
							</View>
						)}
					</Animated.View>
				</ScrollView>
				)}
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
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 16,
		color: neutral.neutral6,
		fontWeight: "600",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		paddingVertical: 16,
	},
	headerButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: neutral.neutral6,
		fontFamily: "Poppins",
	},
	scrollContent: {
		flex: 1,
	},
	scrollContentContainer: {
		paddingHorizontal: 24,
		paddingBottom: 120,
	},
	accountSelectorContainer: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: neutral.neutral6,
		marginBottom: 12,
		fontFamily: "Poppins",
	},
	accountScrollContainer: {
		gap: 12,
	},
	accountChip: {
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: 16,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderWidth: 1.5,
		borderColor: "rgba(255, 255, 255, 0.3)",
		minWidth: 140,
	},
	accountChipActive: {
		backgroundColor: neutral.neutral6,
		borderColor: neutral.neutral6,
	},
	accountChipText: {
		fontSize: 14,
		fontWeight: "600",
		color: neutral.neutral6,
		marginBottom: 4,
		fontFamily: "Poppins",
	},
	accountChipTextActive: {
		color: primary.primary1,
	},
	accountChipBalance: {
		fontSize: 12,
		fontWeight: "500",
		color: "rgba(255, 255, 255, 0.8)",
		fontFamily: "Poppins",
	},
	accountChipBalanceActive: {
		color: neutral.neutral2,
	},
	qrCard: {
		borderRadius: 24,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 16,
		elevation: 10,
		marginBottom: 20,
	},
	qrCardGradient: {
		padding: 28,
		alignItems: "center",
	},
	userInfoSection: {
		alignItems: "center",
		marginBottom: 24,
	},
	userAvatar: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: "rgba(74, 63, 219, 0.1)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
		borderWidth: 2,
		borderColor: "rgba(74, 63, 219, 0.2)",
	},
	userName: {
		fontSize: 22,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: 8,
		fontFamily: "Poppins",
	},
	bankBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74, 63, 219, 0.1)",
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 20,
		gap: 6,
	},
	bankName: {
		fontSize: 13,
		fontWeight: "600",
		color: primary.primary1,
		fontFamily: "Poppins",
	},
	qrCodeContainer: {
		marginBottom: 24,
	},
	qrCodeWrapper: {
		padding: 20,
		backgroundColor: "white",
		borderRadius: 20,
		shadowColor: primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	accountInfoSection: {
		width: "100%",
		alignItems: "center",
		marginBottom: 16,
	},
	accountInfoLabel: {
		fontSize: 12,
		fontWeight: "500",
		color: neutral.neutral3,
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		fontFamily: "Poppins",
	},
	accountNumberContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74, 63, 219, 0.08)",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 12,
		gap: 10,
	},
	accountNumber: {
		fontSize: 18,
		fontWeight: "600",
		color: primary.primary1,
		letterSpacing: 1,
		fontFamily: "Poppins",
	},
	instructionSection: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74, 63, 219, 0.05)",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		gap: 8,
		width: "100%",
	},
	instructionText: {
		fontSize: 12,
		color: neutral.neutral3,
		flex: 1,
		fontFamily: "Poppins",
	},
	actionButtonsContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 20,
	},
	actionButton: {
		flex: 1,
		backgroundColor: neutral.neutral6,
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	actionButtonIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "rgba(74, 63, 219, 0.1)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
	},
	actionButtonText: {
		fontSize: 13,
		fontWeight: "600",
		color: neutral.neutral1,
		fontFamily: "Poppins",
	},
	infoCardsContainer: {
		gap: 12,
	},
	infoCard: {
		backgroundColor: neutral.neutral6,
		borderRadius: 16,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	infoCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
	},
	infoCardTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: neutral.neutral1,
		fontFamily: "Poppins",
	},
	infoCardText: {
		fontSize: 12,
		color: neutral.neutral2,
		lineHeight: 18,
		fontFamily: "Poppins",
	},
	// Mode Toggle Styles
	modeToggleContainer: {
		flexDirection: "row",
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: 16,
		padding: 4,
		marginBottom: 20,
		gap: 4,
	},
	modeToggleButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		gap: 6,
	},
	modeToggleButtonActive: {
		backgroundColor: primary.primary1,
	},
	modeToggleText: {
		fontSize: 14,
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
		borderRadius: 20,
		padding: 20,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
		gap: 16,
	},
	inputGroup: {
		gap: 8,
	},
	inputLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: neutral.neutral1,
		fontFamily: "Poppins",
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(74, 63, 219, 0.05)",
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: "rgba(74, 63, 219, 0.1)",
		paddingHorizontal: 16,
	},
	currencySymbol: {
		fontSize: 18,
		fontWeight: "600",
		color: primary.primary1,
		marginRight: 8,
		fontFamily: "Poppins",
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
		color: neutral.neutral1,
		paddingVertical: 14,
		fontFamily: "Poppins",
		backgroundColor: "rgba(74, 63, 219, 0.05)",
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: "rgba(74, 63, 219, 0.1)",
		paddingHorizontal: 16,
	},
	messageInput: {
		minHeight: 80,
		textAlignVertical: "top",
		paddingTop: 12,
	},
	charCount: {
		fontSize: 11,
		color: neutral.neutral3,
		textAlign: "right",
		fontFamily: "Poppins",
		marginTop: 4,
	},
	// Dynamic Info Display Styles
	dynamicInfoDisplay: {
		width: "100%",
		backgroundColor: "rgba(74, 63, 219, 0.05)",
		borderRadius: 12,
		padding: 12,
		marginBottom: 16,
		gap: 8,
	},
	dynamicInfoItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	dynamicInfoLabel: {
		fontSize: 12,
		fontWeight: "500",
		color: neutral.neutral2,
		fontFamily: "Poppins",
	},
	dynamicInfoValue: {
		fontSize: 13,
		fontWeight: "600",
		color: primary.primary1,
		fontFamily: "Poppins",
		flex: 1,
	},
	// Page Mode Toggle Styles
	pageModeToggleContainer: {
		flexDirection: "row",
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		borderRadius: 16,
		padding: 4,
		marginHorizontal: 24,
		marginBottom: 20,
		gap: 4,
	},
	pageModeToggleButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 12,
		gap: 8,
	},
	pageModeToggleButtonActive: {
		backgroundColor: neutral.neutral6,
	},
	pageModeToggleText: {
		fontSize: 14,
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
		paddingHorizontal: 24,
		paddingBottom: 140,
		gap: 20,
	},
	cameraWrapper: {
		flex: 1,
		borderRadius: 24,
		overflow: "hidden",
		backgroundColor: neutral.neutral1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
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
		width: 280,
		height: 280,
		position: "relative",
	},
	corner: {
		position: "absolute",
		width: 50,
		height: 50,
		borderColor: neutral.neutral6,
		borderWidth: 5,
	},
	topLeft: {
		top: 0,
		left: 0,
		borderBottomWidth: 0,
		borderRightWidth: 0,
		borderTopLeftRadius: 16,
	},
	topRight: {
		top: 0,
		right: 0,
		borderBottomWidth: 0,
		borderLeftWidth: 0,
		borderTopRightRadius: 16,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderTopWidth: 0,
		borderRightWidth: 0,
		borderBottomLeftRadius: 16,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderTopWidth: 0,
		borderLeftWidth: 0,
		borderBottomRightRadius: 16,
	},
	scanLine: {
		position: "absolute",
		top: "50%",
		left: 0,
		right: 0,
		height: 2,
		backgroundColor: neutral.neutral6,
		opacity: 0.8,
	},
	scannerInstructionCard: {
		backgroundColor: neutral.neutral6,
		borderRadius: 20,
		padding: 24,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	scannerInstructionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: 8,
		fontFamily: "Poppins",
	},
	scannerInstructionText: {
		fontSize: 14,
		color: neutral.neutral2,
		textAlign: "center",
		lineHeight: 20,
		fontFamily: "Poppins",
	},
	errorCard: {
		backgroundColor: neutral.neutral6,
		borderRadius: 24,
		padding: 32,
		alignItems: "center",
		width: "90%",
		maxWidth: 320,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	errorTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: neutral.neutral1,
		marginTop: 16,
		marginBottom: 8,
		fontFamily: "Poppins",
	},
	errorText: {
		fontSize: 14,
		color: neutral.neutral2,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 24,
		fontFamily: "Poppins",
	},
	primaryButton: {
		backgroundColor: primary.primary1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 30,
		gap: 8,
	},
	primaryButtonText: {
		color: neutral.neutral6,
		fontSize: 16,
		fontWeight: "600",
		fontFamily: "Poppins",
	},
	scanAgainButton: {
		backgroundColor: primary.primary1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 28,
		paddingVertical: 14,
		borderRadius: 30,
		marginTop: 20,
		gap: 8,
	},
	scanAgainText: {
		color: neutral.neutral6,
		fontSize: 16,
		fontWeight: "600",
		fontFamily: "Poppins",
	},
});
