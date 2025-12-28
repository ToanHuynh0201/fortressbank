import api from "@/lib/api";
import { API_CONFIG, STORAGE_KEYS } from "@/constants";
import { getStorageItem } from "@/utils/storage";

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
			const token = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);

			const response = await fetch(`${API_CONFIG.BASE_URL}/notifications`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			const result = await response.json();

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
			const token = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);

			const response = await fetch(
				`${API_CONFIG.BASE_URL}/notifications/${notificationId}/read`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const result = await response.json();
			return result;
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
			const token = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);

			const response = await fetch(
				`${API_CONFIG.BASE_URL}/notifications/read-all`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const result = await response.json();
			return result;
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
			const token = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);

			const response = await fetch(
				`${API_CONFIG.BASE_URL}/notifications/${notificationId}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Delete notification error:", error);
			throw error;
		}
	}
}

export const notificationService = new NotificationService();
export default NotificationService;
