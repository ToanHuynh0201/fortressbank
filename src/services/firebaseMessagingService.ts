import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

class FirebaseMessagingService {
	/**
	 * Request notification permission (iOS)
	 * Android automatically grants permission
	 */
	async requestPermission(): Promise<boolean> {
		try {
			if (Platform.OS === "ios") {
				const authStatus = await messaging().requestPermission();
				const enabled =
					authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
					authStatus === messaging.AuthorizationStatus.PROVISIONAL;

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
			const hasPermission = await this.checkPermission();
			if (!hasPermission) {
				const granted = await this.requestPermission();
				if (!granted) {
					console.warn("Notification permission not granted");
					return null;
				}
			}

			// Get the token
			const token = await messaging().getToken();
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
			const authStatus = await messaging().hasPermission();
			return (
				authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
				authStatus === messaging.AuthorizationStatus.PROVISIONAL
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
		return messaging().onTokenRefresh(callback);
	}

	/**
	 * Handle foreground messages
	 * @param callback - Function to call when message is received
	 */
	onMessage(callback: (message: any) => void) {
		return messaging().onMessage(callback);
	}

	/**
	 * Handle background messages (must be set up at top level)
	 */
	setBackgroundMessageHandler(handler: (message: any) => Promise<void>) {
		messaging().setBackgroundMessageHandler(handler);
	}

	/**
	 * Get initial notification (app opened from notification)
	 */
	async getInitialNotification() {
		return await messaging().getInitialNotification();
	}

	/**
	 * Listen for notification opened app
	 */
	onNotificationOpenedApp(callback: (message: any) => void) {
		return messaging().onNotificationOpenedApp(callback);
	}
}

export const firebaseMessagingService = new FirebaseMessagingService();
