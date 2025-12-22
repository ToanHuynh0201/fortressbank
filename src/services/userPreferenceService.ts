import api from "@/lib/api";

export interface UserPreference {
	userId: string;
	phoneNumber?: string;
	email?: string;
	deviceToken?: string;
	pushNotificationEnabled?: boolean;
	smsNotificationEnabled?: boolean;
	emailNotificationEnabled?: boolean;
}

export interface UpsertUserPreferenceRequest {
	phoneNumber?: string;
	email?: string;
	deviceToken?: string;
	pushNotificationEnabled?: boolean;
	smsNotificationEnabled?: boolean;
	emailNotificationEnabled?: boolean;
}

export interface UserPreferenceResponse {
	success: boolean;
	data: UserPreference;
	message: string | null;
	timestamp: string;
}

class UserPreferenceService {
	/**
	 * Create or update user preference (upsert operation)
	 * @param {string} userId - User ID
	 * @param {UpsertUserPreferenceRequest} request - Preference data
	 * @returns {Promise<UserPreferenceResponse>} API response
	 */
	async upsertUserPreference(
		userId: string,
		request: UpsertUserPreferenceRequest,
	): Promise<UserPreferenceResponse> {
		try {
			const response = await api.post(
				`/user-preferences/${userId}`,
				request,
			);

			return response.data;
		} catch (error) {
			console.error("Upsert user preference error:", error);
			throw error;
		}
	}

	/**
	 * Get user preference
	 * @param {string} userId - User ID
	 * @returns {Promise<UserPreferenceResponse>} API response
	 */
	async getUserPreference(userId: string): Promise<UserPreferenceResponse> {
		try {
			const response = await api.get(`/user-preferences/${userId}`);
			return response.data;
		} catch (error) {
			console.error("Get user preference error:", error);
			throw error;
		}
	}

	/**
	 * Register device for push notifications
	 * Convenience method to register device token after login
	 * @param {string} userId - User ID
	 * @param {string} deviceToken - FCM device token
	 * @param {object} additionalData - Additional preference data (optional)
	 * @returns {Promise<UserPreferenceResponse>} API response
	 */
	async registerDeviceForPushNotifications(
		userId: string,
		deviceToken: string,
		additionalData?: {
			phoneNumber?: string;
			email?: string;
			pushNotificationEnabled?: boolean;
			smsNotificationEnabled?: boolean;
			emailNotificationEnabled?: boolean;
		},
	): Promise<UserPreferenceResponse> {
		try {
			const request: UpsertUserPreferenceRequest = {
				deviceToken,
				pushNotificationEnabled: true, // Default to enabled
				...additionalData,
			};

			return await this.upsertUserPreference(userId, request);
		} catch (error) {
			console.error("Register device for push notifications error:", error);
			throw error;
		}
	}

	/**
	 * Update device token only
	 * @param {string} userId - User ID
	 * @param {string} deviceToken - FCM device token
	 * @returns {Promise<UserPreferenceResponse>} API response
	 */
	async updateDeviceToken(
		userId: string,
		deviceToken: string,
	): Promise<UserPreferenceResponse> {
		try {
			return await this.upsertUserPreference(userId, { deviceToken });
		} catch (error) {
			console.error("Update device token error:", error);
			throw error;
		}
	}
}

export const userPreferenceService = new UserPreferenceService();
