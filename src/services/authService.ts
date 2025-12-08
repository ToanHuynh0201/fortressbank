import api from "@/lib/api";
import { STORAGE_KEYS } from "@/constants";
import {
	getStorageItem,
	setStorageItem,
	clearStorageItems,
} from "@/utils/storage";
import { withErrorHandling } from "@/utils/error";
import type { LoginRequest } from "@/types/auth";

class AuthService {
	/**
	 * Login user with username and password
	 * @param {LoginRequest} request - Login request with username and password
	 * @returns {Promise<any>} API response data
	 */
	login = withErrorHandling(async (request: LoginRequest) => {
		const response = await api.post("/auth/login", request);

		if (response.data.status === "success") {
			const data = response.data.data;
			const { access_token, refresh_token } = data;

			if (access_token) {
				await setStorageItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
			}

			if (refresh_token) {
				await setStorageItem(STORAGE_KEYS.SESSION_DATA, refresh_token);
			}
		}

		return response;
	});

	/**
	 * Logout user and clear stored data
	 */
	async logout() {
		try {
			const token = await this.getAccessToken();
			if (token) {
				await api.post("/auth/logout", {});
			}
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			clearStorageItems([
				STORAGE_KEYS.AUTH_TOKEN,
				STORAGE_KEYS.SESSION_DATA,
				STORAGE_KEYS.USER_DATA,
			]);
		}
	}

	/**
	 * Get current user from localStorage
	 * @returns {Object|null} User object or null
	 */
	getCurrentUser() {
		return getStorageItem(STORAGE_KEYS.USER_DATA);
	}

	/**
	 * Check if user is authenticated
	 * @returns {boolean} Authentication status
	 */
	isAuthenticated() {
		try {
			const token = this.getAccessToken();
			const user = this.getCurrentUser();

			if (!token || !user) {
				return false;
			}

			return true;
		} catch (error) {
			this.logout();
			return false;
		}
	}

	/**
	 * Get access token
	 * @returns {Promise<string|null>} Access token or null
	 */
	async getAccessToken() {
		return await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
	}

	/**
	 * Get refresh token
	 * @returns {Promise<string|null>} Refresh token or null
	 */
	async getRefreshToken() {
		return await getStorageItem(STORAGE_KEYS.SESSION_DATA);
	}

	/**
	 * Validate user session
	 * @returns {boolean} Whether session is valid
	 */
	validateSession() {
		const token = this.getAccessToken();
		if (!token) {
			return false;
		}

		const user = this.getCurrentUser();
		if (!user) {
			this.logout();
			return false;
		}

		return true;
	}

	/**
	 * Change user password
	 * @param {string} currentPassword - Current password
	 * @param {string} newPassword - New password
	 * @returns {Promise<Object>} API response data
	 */
	async changePassword(currentPassword: string, newPassword: string) {
		try {
			const response = await api.patch("/auth/change-password", {
				currentPassword,
				newPassword,
			});

			if (response.data.status === "success" || response.data.success) {
				return response.data;
			}

			throw new Error("Change password failed");
		} catch (error: any) {
			throw error;
		}
	}

	/**
	 * Refresh authentication token
	 * @returns {Promise<boolean>} Success status
	 */
	async refreshToken() {
		try {
			const refreshToken = this.getRefreshToken();
			if (!refreshToken) {
				return false;
			}

			const response = await api.post("/auth/token/refresh", {
				refreshToken,
			});

			if (response.data.status === "success") {
				const { accessToken, refreshToken: newRefreshToken } =
					response.data.data;
				setStorageItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

				if (newRefreshToken) {
					setStorageItem(STORAGE_KEYS.SESSION_DATA, newRefreshToken);
				}

				return true;
			}

			return false;
		} catch (error) {
			this.logout();
			return false;
		}
	}

	/**
	 * Store authentication data in localStorage
	 * @private
	 * @param {Object} user - User object
	 * @param {string} accessToken - Access token
	 * @param {string} refreshToken - Refresh token
	 */
	_storeAuthData(user: any, accessToken: any, refreshToken: any) {
		setStorageItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
		setStorageItem(STORAGE_KEYS.SESSION_DATA, refreshToken);
		setStorageItem(STORAGE_KEYS.USER_DATA, user);
	}
}

export const authService = new AuthService();
