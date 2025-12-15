import * as LocalAuthentication from "expo-local-authentication";
import {
	getStorageItem,
	setStorageItem,
	removeStorageItem,
} from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants";

/**
 * Interface for stored biometric credentials
 */
interface BiometricCredentials {
	username: string;
	password: string;
}

class BiometricService {
	/**
	 * Check if device supports biometric authentication
	 * @returns {Promise<boolean>} True if device has biometric hardware
	 */
	async isHardwareAvailable(): Promise<boolean> {
		try {
			const compatible = await LocalAuthentication.hasHardwareAsync();
			return compatible;
		} catch (error) {
			console.error("Error checking biometric hardware:", error);
			return false;
		}
	}

	/**
	 * Check if biometric authentication is enrolled (fingerprint/face registered)
	 * @returns {Promise<boolean>} True if biometric is enrolled
	 */
	async isBiometricEnrolled(): Promise<boolean> {
		try {
			const enrolled = await LocalAuthentication.isEnrolledAsync();
			return enrolled;
		} catch (error) {
			console.error("Error checking biometric enrollment:", error);
			return false;
		}
	}

	/**
	 * Get available biometric types on device
	 * @returns {Promise<number[]>} Array of biometric types
	 */
	async getSupportedBiometricTypes(): Promise<
		LocalAuthentication.AuthenticationType[]
	> {
		try {
			const types =
				await LocalAuthentication.supportedAuthenticationTypesAsync();
			return types;
		} catch (error) {
			console.error("Error getting biometric types:", error);
			return [];
		}
	}

	/**
	 * Get biometric type name for display
	 * @returns {Promise<string>} Biometric type name
	 */
	async getBiometricTypeName(): Promise<string> {
		const types = await this.getSupportedBiometricTypes();

		if (
			types.includes(
				LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
			)
		) {
			return "Face ID";
		}
		if (
			types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
		) {
			return "Fingerprint";
		}
		if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
			return "Iris";
		}

		return "Biometric";
	}

	/**
	 * Authenticate user with biometric
	 * @returns {Promise<boolean>} True if authentication successful
	 */
	async authenticate(): Promise<boolean> {
		try {
			const biometricName = await this.getBiometricTypeName();

			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: `Authenticate with ${biometricName}`,
				fallbackLabel: "Use Password",
				cancelLabel: "Cancel",
				disableDeviceFallback: false,
			});

			return result.success;
		} catch (error) {
			console.error("Biometric authentication error:", error);
			return false;
		}
	}

	/**
	 * Save credentials for biometric login
	 * @param {string} username - User's username
	 * @param {string} password - User's password (will be stored encrypted by SecureStore)
	 * @returns {Promise<boolean>} True if saved successfully
	 */
	async saveCredentials(
		username: string,
		password: string,
	): Promise<boolean> {
		try {
			const credentials: BiometricCredentials = {
				username,
				password,
			};

			// Save credentials to secure storage (setStorageItem will auto-stringify)
			await setStorageItem(
				STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
				credentials,
			);

			// Mark biometric as enabled
			await setStorageItem(STORAGE_KEYS.BIOMETRIC_ENABLED, true);

			return true;
		} catch (error) {
			console.error("Error saving biometric credentials:", error);
			return false;
		}
	}

	/**
	 * Get stored credentials for biometric login
	 * @returns {Promise<BiometricCredentials | null>} Stored credentials or null
	 */
	async getCredentials(): Promise<BiometricCredentials | null> {
		try {
			// getStorageItem auto-parses JSON, so no need to manually parse
			const credentials = await getStorageItem(
				STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
			);

			if (!credentials) {
				return null;
			}

			// Verify it has the required fields
			if (credentials.username && credentials.password) {
				return credentials as BiometricCredentials;
			}

			// Clean up invalid data
			await this.removeCredentials();
			return null;
		} catch (error) {
			console.error("Error getting biometric credentials:", error);
			// If there's a parse error, clean up corrupted data
			await this.removeCredentials();
			return null;
		}
	}

	/**
	 * Remove stored credentials and disable biometric
	 * @returns {Promise<boolean>} True if removed successfully
	 */
	async removeCredentials(): Promise<boolean> {
		try {
			await removeStorageItem(STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
			await removeStorageItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
			return true;
		} catch (error) {
			console.error("Error removing biometric credentials:", error);
			return false;
		}
	}

	/**
	 * Check if biometric login is enabled
	 * @returns {Promise<boolean>} True if biometric is enabled
	 */
	async isBiometricEnabled(): Promise<boolean> {
		try {
			const enabled = await getStorageItem(
				STORAGE_KEYS.BIOMETRIC_ENABLED,
			);
			// Handle both boolean true and string "true" since getStorageItem parses JSON
			return enabled === true || enabled === "true";
		} catch (error) {
			console.error("Error checking biometric enabled status:", error);
			return false;
		}
	}

	/**
	 * Check if biometric authentication is available and ready to use
	 * @returns {Promise<boolean>} True if biometric is available
	 */
	async isBiometricAvailable(): Promise<boolean> {
		const hasHardware = await this.isHardwareAvailable();
		const isEnrolled = await this.isBiometricEnrolled();
		return hasHardware && isEnrolled;
	}
}

export const biometricService = new BiometricService();
