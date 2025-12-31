import api from "@/lib/api";

export interface NotificationData {
	notificationId: string;
	userId: string;
	title: string;
	content: string;
	image: string | null;
	type: string;
	sentAt: string;
	read: boolean;
}

export interface NotificationResponse {
	code: number;
	message: string;
	data: NotificationData[];
}

class NotificationService {
	/**
	 * Get all notifications for the current user
	 * @returns {Promise<NotificationResponse>} Notifications response
	 */
	async getNotifications(): Promise<NotificationResponse> {
		try {
			const response = await api.get("/notifications");
			const result = response.data;

			if (result.code === 1000) {
				return result;
			}

			throw new Error(result.message || "Failed to fetch notifications");
		} catch (error) {
			console.error("Get notifications error:", error);
			throw error;
		}
	}

	/**
	 * Mark a notification as read
	 * @param {string} notificationId - The ID of the notification to mark as read
	 * @returns {Promise<any>} Response
	 */
	async markAsRead(notificationId: string): Promise<any> {
		try {
			const response = await api.put(
				`/notifications/${notificationId}`,
				{},
			);
			console.log(response.data);

			return response.data;
		} catch (error) {
			console.error("Mark as read error:", error);
			throw error;
		}
	}

	/**
	 * Mark all notifications as read
	 * @returns {Promise<any>} Response
	 */
	async markAllAsRead(): Promise<any> {
		try {
			// Get all notifications first
			const notificationsResponse = await this.getNotifications();

			// Filter unread notifications
			const unreadNotifications = notificationsResponse.data.filter(
				(notification) => !notification.read,
			);

			// Mark each unread notification as read
			const markReadPromises = unreadNotifications.map((notification) =>
				api.put(`/notifications/${notification.notificationId}`, {}),
			);

			// Execute all requests in parallel
			await Promise.all(markReadPromises);
			console.log(unreadNotifications.length);

			return {
				code: 1000,
				message: "All notifications marked as read",
				count: unreadNotifications.length,
			};
		} catch (error) {
			console.error("Mark all as read error:", error);
			throw error;
		}
	}

	/**
	 * Delete a notification
	 * @param {string} notificationId - The ID of the notification to delete
	 * @returns {Promise<any>} Response
	 */
	async deleteNotification(notificationId: string): Promise<any> {
		try {
			const response = await api.delete(
				`/notifications/${notificationId}`,
			);
			return response.data;
		} catch (error) {
			console.error("Delete notification error:", error);
			throw error;
		}
	}
}

export const notificationService = new NotificationService();
export default NotificationService;
