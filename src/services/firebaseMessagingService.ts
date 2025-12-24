import { getApp } from "@react-native-firebase/app";
import {
	getMessaging,
	requestPermission,
	getToken,
	hasPermission,
	onTokenRefresh,
	onMessage,
	setBackgroundMessageHandler,
	getInitialNotification,
	onNotificationOpenedApp,
	AuthorizationStatus,
	FirebaseMessagingTypes
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";

class FirebaseMessagingService {
	private messaging: FirebaseMessagingTypes.Module;

	constructor() {
		const app = getApp();
		this.messaging = getMessaging(app);
	}

	/**
	 * Request notification permission (iOS)
	 * Android automatically grants permission
	 */
	async requestPermission(): Promise<boolean> {
		try {
			if (Platform.OS === "ios") {
				const authStatus = await requestPermission(this.messaging);
				const enabled =
					authStatus === AuthorizationStatus.AUTHORIZED ||
					authStatus === AuthorizationStatus.PROVISIONAL;

				return enabled;
			}
			// Android automatically grants permission
			return true;
		} catch (error) {
			console.error("Error requesting notification permission:", error);
			return false;
		}
	}

	/**
	 * Get FCM device token
	 * @returns {Promise<string|null>} Device token or null
	 */
	async getDeviceToken(): Promise<string | null> {
		try {
			// Check if permission is granted
			const hasPermissionGranted = await this.checkPermission();
			if (!hasPermissionGranted) {
				const granted = await this.requestPermission();
				if (!granted) {
					console.warn("Notification permission not granted");
					return null;
				}
			}

			// Get the token
			const token = await getToken(this.messaging);
			return token;
		} catch (error) {
			console.error("Error getting device token:", error);
			return null;
		}
	}

	/**
	 * Check if notification permission is granted
	 */
	async checkPermission(): Promise<boolean> {
		try {
			const authStatus = await hasPermission(this.messaging);
			return (
				authStatus === AuthorizationStatus.AUTHORIZED ||
				authStatus === AuthorizationStatus.PROVISIONAL
			);
		} catch (error) {
			console.error("Error checking notification permission:", error);
			return false;
		}
	}

	/**
	 * Listen for token refresh
	 * @param callback - Function to call when token is refreshed
	 */
	onTokenRefresh(callback: (token: string) => void) {
		return onTokenRefresh(this.messaging, callback);
	}

	/**
	 * Handle foreground messages
	 * @param callback - Function to call when message is received
	 */
	onMessage(callback: (message: any) => void) {
		return onMessage(this.messaging, callback);
	}

	/**
	 * Handle background messages (must be set up at top level)
	 */
	setBackgroundMessageHandler(handler: (message: any) => Promise<void>) {
		setBackgroundMessageHandler(this.messaging, handler);
	}

	/**
	 * Get initial notification (app opened from notification)
	 */
	async getInitialNotification() {
		return await getInitialNotification(this.messaging);
	}

	/**
	 * Listen for notification opened app
	 */
	onNotificationOpenedApp(callback: (message: any) => void) {
		return onNotificationOpenedApp(this.messaging, callback);
	}
}

export const firebaseMessagingService = new FirebaseMessagingService();
