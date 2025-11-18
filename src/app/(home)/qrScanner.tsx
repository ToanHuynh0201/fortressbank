import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CameraView, Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { primary, neutral } from "@/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";

const QRScanner = () => {
	const router = useRouter();
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [scanned, setScanned] = useState(false);

	useEffect(() => {
		const getCameraPermissions = async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");
		};

		getCameraPermissions();
	}, []);

	const handleBarCodeScanned = ({
		type,
		data,
	}: {
		type: string;
		data: string;
	}) => {
		setScanned(true);
		alert(`QR Code scanned!\nType: ${type}\nData: ${data}`);
		// TODO: Xử lý dữ liệu QR code ở đây
		// router.push({ pathname: '(transfer)/transferFilled', params: { accountNumber: data } });
	};

	if (hasPermission === null) {
		return (
			<LinearGradient
				colors={[primary.primary1, primary.primary2]}
				style={styles.gradientContainer}>
				<SafeAreaView style={styles.centerContainer}>
					<View style={styles.loadingCard}>
						<Ionicons
							name="camera-outline"
							size={64}
							color={primary.primary1}
						/>
						<Text style={styles.loadingText}>
							Requesting camera permission...
						</Text>
					</View>
				</SafeAreaView>
			</LinearGradient>
		);
	}

	if (hasPermission === false) {
		return (
			<LinearGradient
				colors={[primary.primary1, primary.primary2]}
				style={styles.gradientContainer}>
				<SafeAreaView style={styles.centerContainer}>
					<View style={styles.errorCard}>
						<Feather
							name="camera-off"
							size={64}
							color={primary.primary1}
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
							onPress={() => router.back()}>
							<Feather
								name="arrow-left"
								size={20}
								color={neutral.neutral6}
							/>
							<Text style={styles.primaryButtonText}>
								Go Back
							</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>
			</LinearGradient>
		);
	}

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
					<Text style={styles.headerTitle}>Scan QR Code</Text>
					<View style={{ width: 40 }} />
				</View>

				{/* Camera Container */}
				<View style={styles.contentContainer}>
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
									<View
										style={[styles.corner, styles.topLeft]}
									/>
									<View
										style={[styles.corner, styles.topRight]}
									/>
									<View
										style={[
											styles.corner,
											styles.bottomLeft,
										]}
									/>
									<View
										style={[
											styles.corner,
											styles.bottomRight,
										]}
									/>

									{/* Scan line animation could be added here */}
									<View style={styles.scanLine} />
								</View>
							</View>
						</CameraView>
					</View>

					{/* Instructions Card */}
					<View style={styles.instructionCard}>
						<Ionicons
							name="qr-code-outline"
							size={32}
							color={primary.primary1}
							style={{ marginBottom: 12 }}
						/>
						<Text style={styles.instructionTitle}>
							{scanned ? "QR Code Scanned!" : "Position QR Code"}
						</Text>
						<Text style={styles.instructionText}>
							{scanned
								? "Your QR code has been successfully scanned"
								: "Align the QR code within the frame to scan"}
						</Text>

						{scanned && (
							<TouchableOpacity
								style={styles.scanAgainButton}
								onPress={() => setScanned(false)}>
								<Ionicons
									name="refresh"
									size={20}
									color={neutral.neutral6}
								/>
								<Text style={styles.scanAgainText}>
									Scan Again
								</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
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
		paddingHorizontal: 24,
	},
	loadingCard: {
		backgroundColor: neutral.neutral6,
		borderRadius: 24,
		padding: 40,
		alignItems: "center",
		width: "100%",
		maxWidth: 320,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	loadingText: {
		fontSize: 16,
		color: neutral.neutral1,
		textAlign: "center",
		marginTop: 16,
		fontWeight: "500",
	},
	errorCard: {
		backgroundColor: neutral.neutral6,
		borderRadius: 24,
		padding: 32,
		alignItems: "center",
		width: "100%",
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
	},
	errorText: {
		fontSize: 14,
		color: neutral.neutral2,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 24,
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
	},
	contentContainer: {
		flex: 1,
		paddingHorizontal: 24,
		paddingBottom: 140,
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
		marginBottom: 20,
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
	instructionCard: {
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
	instructionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: neutral.neutral1,
		marginBottom: 8,
	},
	instructionText: {
		fontSize: 14,
		color: neutral.neutral2,
		textAlign: "center",
		lineHeight: 20,
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
	},
});
