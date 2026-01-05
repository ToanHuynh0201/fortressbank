import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";
import forge from "node-forge";
import apiService from "@/lib/api";

/**
 * Device Service
 * Handles cryptographic device key management for Smart OTP (Vietnamese e-banking style).
 * 
 * Security Model:
 * 1. RSA-2048 keypair generated locally on device
 * 2. Private key stored in expo-secure-store (hardware-backed on iOS, encrypted on Android)
 * 3. Public key registered with backend via /devices/register
 * 4. For each DEVICE_BIO transaction:
 *    - User authenticates with biometric (unlocks access to key)
 *    - App signs challengeData with private key
 *    - Backend verifies signature against registered public key
 */

// Storage keys
const DEVICE_ID_KEY = "fortressbank_device_id";
const PRIVATE_KEY_KEY = "fortressbank_device_private_key";
const PUBLIC_KEY_KEY = "fortressbank_device_public_key";
const DEVICE_REGISTERED_KEY = "fortressbank_device_registered";

// Interfaces
export interface DeviceKeyPair {
	deviceId: string;
	publicKeyPem: string;
	privateKeyPem: string;
}

export interface DeviceRegistrationRequest {
	deviceId: string;
	publicKey: string;
	deviceName: string;
	deviceType: "ANDROID" | "IOS";
}

export interface DeviceRegistrationResponse {
	code: number;
	message: string;
	data: {
		deviceId: string;
		registered: boolean;
	};
}

export interface SignatureResult {
	success: boolean;
	signature?: string;
	error?: string;
}

class DeviceService {
	/**
	 * Generate a unique device ID (UUID v4 format)
	 */
	private generateDeviceId(): string {
		// Simple UUID v4 implementation
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	/**
	 * Generate RSA-2048 keypair using node-forge
	 */
	private async generateKeyPair(): Promise<{
		publicKeyPem: string;
		privateKeyPem: string;
	}> {
		return new Promise((resolve, reject) => {
			try {
				// Generate RSA 2048-bit keypair
				const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });

				// Convert to PEM format
				const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
				const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

				resolve({ publicKeyPem, privateKeyPem });
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Check if device has a registered keypair
	 */
	async isDeviceRegistered(): Promise<boolean> {
		try {
			const registered = await SecureStore.getItemAsync(DEVICE_REGISTERED_KEY);
			return registered === "true";
		} catch (error) {
			console.error("Error checking device registration:", error);
			return false;
		}
	}

	/**
	 * Get the current device ID (if exists)
	 */
	async getDeviceId(): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync(DEVICE_ID_KEY);
		} catch (error) {
			console.error("Error getting device ID:", error);
			return null;
		}
	}

	/**
	 * Initialize device keys if not already created.
	 * This should be called during app initialization or first login.
	 * Does NOT register with backend - that's a separate step.
	 */
	async initializeDeviceKeys(): Promise<DeviceKeyPair | null> {
		try {
			// Check if keys already exist
			const existingDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
			const existingPrivateKey = await SecureStore.getItemAsync(PRIVATE_KEY_KEY);
			const existingPublicKey = await SecureStore.getItemAsync(PUBLIC_KEY_KEY);

			if (existingDeviceId && existingPrivateKey && existingPublicKey) {
				console.log("Device keys already exist, returning existing keys");
				return {
					deviceId: existingDeviceId,
					publicKeyPem: existingPublicKey,
					privateKeyPem: existingPrivateKey,
				};
			}

			// Generate new keys
			console.log("Generating new device keypair...");
			const deviceId = this.generateDeviceId();
			const { publicKeyPem, privateKeyPem } = await this.generateKeyPair();

			// Store keys securely
			await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
			await SecureStore.setItemAsync(PRIVATE_KEY_KEY, privateKeyPem);
			await SecureStore.setItemAsync(PUBLIC_KEY_KEY, publicKeyPem);

			console.log("Device keys generated and stored successfully");
			return { deviceId, publicKeyPem, privateKeyPem };
		} catch (error) {
			console.error("Error initializing device keys:", error);
			return null;
		}
	}

	/**
	 * Register this device with the backend.
	 * Sends the public key to /devices/register.
	 */
	async registerDevice(deviceName?: string): Promise<boolean> {
		try {
			// Ensure keys exist
			const keys = await this.initializeDeviceKeys();
			if (!keys) {
				throw new Error("Failed to initialize device keys");
			}

			// Determine device type from platform
			const deviceType: "ANDROID" | "IOS" = Platform.OS === "ios" ? "IOS" : "ANDROID";

			const request: DeviceRegistrationRequest = {
				deviceId: keys.deviceId,
				publicKey: keys.publicKeyPem,
				deviceName: deviceName || `FortressBank ${Platform.OS === "ios" ? "iPhone" : "Android"}`,
				deviceType,
			};

			const response = await apiService.post(
				"/devices/register",
				request
			);

			if (response.data.code === 1000 && response.data.data?.registered) {
				// Mark as registered
				await SecureStore.setItemAsync(DEVICE_REGISTERED_KEY, "true");
				console.log("Device registered successfully with backend");
				return true;
			}

			console.error("Device registration failed:", response.data.message);
			return false;
		} catch (error) {
			console.error("Error registering device:", error);
			return false;
		}
	}

	/**
	 * Sign challenge data using the device's private key.
	 * Requires biometric authentication before signing.
	 * 
	 * @param challengeData The random challenge from backend to sign
	 * @returns Base64-encoded signature
	 */
	async signChallenge(challengeData: string): Promise<SignatureResult> {
		try {
			// Step 1: Verify biometric first
			const biometricResult = await LocalAuthentication.authenticateAsync({
				promptMessage: "Xác nhận giao dịch",
				fallbackLabel: "Sử dụng mật khẩu",
				cancelLabel: "Hủy",
				disableDeviceFallback: false,
			});

			if (!biometricResult.success) {
				return {
					success: false,
					error: biometricResult.error || "Biometric authentication failed",
				};
			}

			// Step 2: Retrieve private key from secure storage
			const privateKeyPem = await SecureStore.getItemAsync(PRIVATE_KEY_KEY);
			if (!privateKeyPem) {
				return {
					success: false,
					error: "Device key not found. Please re-register your device.",
				};
			}

			// Step 3: Sign the challenge data
			const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
			const md = forge.md.sha256.create();
			md.update(challengeData, "utf8");
			const signature = privateKey.sign(md);

			// Convert to base64
			const signatureBase64 = forge.util.encode64(signature);

			console.log("Challenge signed successfully");
			return {
				success: true,
				signature: signatureBase64,
			};
		} catch (error) {
			console.error("Error signing challenge:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Signing failed",
			};
		}
	}

	/**
	 * Clear all device keys and registration status.
	 * Use when logging out or resetting the device.
	 */
	async clearDeviceKeys(): Promise<void> {
		try {
			await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
			await SecureStore.deleteItemAsync(PRIVATE_KEY_KEY);
			await SecureStore.deleteItemAsync(PUBLIC_KEY_KEY);
			await SecureStore.deleteItemAsync(DEVICE_REGISTERED_KEY);
			console.log("Device keys cleared");
		} catch (error) {
			console.error("Error clearing device keys:", error);
		}
	}

	/**
	 * Get the public key in PEM format (for debugging/display)
	 */
	async getPublicKey(): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync(PUBLIC_KEY_KEY);
		} catch (error) {
			console.error("Error getting public key:", error);
			return null;
		}
	}

	/**
	 * Unregister this device from the backend.
	 * Call this before clearing local keys to properly clean up.
	 */
	async unregisterDevice(): Promise<boolean> {
		try {
			const deviceId = await this.getDeviceId();
			if (!deviceId) {
				console.log("No device ID found, nothing to unregister");
				return true;
			}

			const response = await apiService.delete(`/devices/${deviceId}`);
			
			if (response.data.code === 1000) {
				// Clear local keys after successful unregistration
				await this.clearDeviceKeys();
				console.log("Device unregistered successfully");
				return true;
			}

			console.error("Device unregistration failed:", response.data.message);
			return false;
		} catch (error) {
			console.error("Error unregistering device:", error);
			// Still clear local keys even if server call fails
			await this.clearDeviceKeys();
			return false;
		}
	}

	/**
	 * Get list of all registered devices for the current user.
	 */
	async getRegisteredDevices(): Promise<RegisteredDevice[]> {
		try {
			const response = await apiService.get("/devices");
			
			if (response.data.code === 1000 && Array.isArray(response.data.data)) {
				return response.data.data;
			}

			return [];
		} catch (error) {
			console.error("Error fetching registered devices:", error);
			return [];
		}
	}

	/**
	 * Check if biometric hardware is available on this device.
	 */
	async isBiometricAvailable(): Promise<{
		available: boolean;
		biometricType: string;
	}> {
		try {
			const compatible = await LocalAuthentication.hasHardwareAsync();
			const enrolled = await LocalAuthentication.isEnrolledAsync();
			const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

			let biometricType = "None";
			if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
				biometricType = "Face ID";
			} else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
				biometricType = "Fingerprint";
			} else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
				biometricType = "Iris";
			}

			return {
				available: compatible && enrolled,
				biometricType,
			};
		} catch (error) {
			console.error("Error checking biometric availability:", error);
			return { available: false, biometricType: "Unknown" };
		}
	}

	/**
	 * Get device info for display in settings.
	 */
	async getDeviceInfo(): Promise<DeviceInfo | null> {
		try {
			const deviceId = await this.getDeviceId();
			const isRegistered = await this.isDeviceRegistered();
			const biometric = await this.isBiometricAvailable();
			const publicKey = await this.getPublicKey();

			if (!deviceId) {
				return null;
			}

			return {
				deviceId,
				isRegistered,
				biometricAvailable: biometric.available,
				biometricType: biometric.biometricType,
				platform: Platform.OS === "ios" ? "iOS" : "Android",
				hasPublicKey: !!publicKey,
			};
		} catch (error) {
			console.error("Error getting device info:", error);
			return null;
		}
	}
}

// Additional interfaces for device management
export interface RegisteredDevice {
	deviceId: string;
	deviceName: string;
	deviceType: "ANDROID" | "IOS";
	registeredAt: string;
	lastUsedAt?: string;
	isCurrent?: boolean;
}

export interface DeviceInfo {
	deviceId: string;
	isRegistered: boolean;
	biometricAvailable: boolean;
	biometricType: string;
	platform: string;
	hasPublicKey: boolean;
}

export const deviceService = new DeviceService();
export default deviceService;
