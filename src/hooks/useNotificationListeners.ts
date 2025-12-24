import { useEffect } from "react";
import { firebaseMessagingService, userPreferenceService } from "@/services";
import { useNotifications } from "@/contexts/NotificationContext";

/**
 * Hook to set up Firebase Cloud Messaging notification listeners
 * Handles foreground, background, and quit state notifications
 * Also handles token refresh events
 *
 * @param userId - Current user ID for token refresh updates
 */
export const useNotificationListeners = (userId?: string) => {
	const { showToast, addNotification } = useNotifications();
	useEffect(() => {
		console.log(
			"🔔 Setting up notification listeners for user:",
			userId || "Not logged in",
		);

		// Handle foreground messages (when app is open and active)
		const unsubscribeMessage = firebaseMessagingService.onMessage(
			(message) => {
				console.log("========================================");
				console.log("📨 Foreground notification received:", message);
				console.log("Title:", message.notification?.title);
				console.log("Body:", message.notification?.body);
				console.log("Data:", message.data);
				console.log("========================================");

				// Display toast notification
				if (message.notification?.title && message.notification?.body) {
					showToast(
						message.notification.title,
						message.notification.body,
						"info",
					);

					// Add to notification list
					addNotification({
						title: message.notification.title,
						message: message.notification.body,
						time: "Just now",
						type: "info",
					});
				}
			},
		);

		// Handle notification opened app (when app is in background)
		const unsubscribeOpenedApp =
			firebaseMessagingService.onNotificationOpenedApp((message) => {
				console.log("========================================");
				console.log(
					"📱 Notification opened app (from background):",
					message,
				);
				console.log("Data:", message.data);
				console.log("========================================");

				// Add to notification list when opened from background
				if (message.notification?.title && message.notification?.body) {
					addNotification({
						title: message.notification.title,
						message: message.notification.body,
						time: "Just now",
						type: "info",
					});
				}

				// TODO: Navigate to relevant screen based on notification data
				// Example:
				// if (message.data?.screen === 'transaction') {
				//   router.push('/transaction/' + message.data.transactionId)
				// }
			});

		// Handle token refresh (when FCM token is updated)
		const unsubscribeTokenRefresh = firebaseMessagingService.onTokenRefresh(
			async (token) => {
				console.log("========================================");
				console.log("🔄 FCM Token refreshed:", token);
				console.log("========================================");

				// Update backend with new token if user is logged in
				if (userId) {
					try {
						console.log(
							"📤 Updating backend with new token for user:",
							userId,
						);
						await userPreferenceService.registerDeviceForPushNotifications(
							userId,
							token,
						);
						console.log("✅ Token successfully updated in backend");
					} catch (error) {
						console.error(
							"❌ Failed to update token in backend:",
							error,
						);
					}
				}
			},
		);

		// Check if app was opened from notification (quit state)
		firebaseMessagingService
			.getInitialNotification()
			.then((message) => {
				if (message) {
					console.log("========================================");
					console.log(
						"🚀 App opened from notification (quit state):",
						message,
					);
					console.log("Data:", message.data);
					console.log("========================================");

					// Add to notification list when opened from quit state
					if (
						message.notification?.title &&
						message.notification?.body
					) {
						addNotification({
							title: message.notification.title,
							message: message.notification.body,
							time: "Just now",
							type: "info",
						});
					}

					// TODO: Navigate to relevant screen based on notification data
					// Example: router.push('/transaction/' + message.data.transactionId)
				}
			})
			.catch((error) => {
				console.error("Error checking initial notification:", error);
			});

		// Cleanup function - unsubscribe from all listeners when component unmounts
		return () => {
			console.log("🧹 Cleaning up notification listeners");
			unsubscribeMessage();
			unsubscribeOpenedApp();
			unsubscribeTokenRefresh();
		};
	}, [userId, showToast, addNotification]); // Re-run effect when userId or notification functions change
};
