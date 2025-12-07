import api from "@/lib/api";
import { AUTH_CONFIG } from "@/constants";
import {
	getStorageItem,
	setStorageItem,
	clearStorageItems,
} from "@/utils/storage";

class AuthService {
	/**
	 * Login user with email and password
	 * @param {string} email - User email
	 * @param {string} password - User password
	 * @returns {Promise<any>} API response data
	 */
	async login(email: string, password: string): Promise<any> {
		try {
			const loginData = {
				email,
				password,
			};

			const response = await api.post("/auth/login", loginData);

			if (response.data.status === "success" || response.data.success) {
				const data = response.data.data || response.data;
				const { user, accessToken, refreshToken, token } = data;

				const authToken = accessToken || token;

				if (user && authToken) {
					this._storeAuthData(user, authToken, refreshToken);
				}

				return response.data;
			}

			throw new Error("Login failed");
		} catch (error: any) {
			throw error;
		}
	}

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
				AUTH_CONFIG.TOKEN_STORAGE_KEY,
				AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
				AUTH_CONFIG.USER_STORAGE_KEY,
			]);
		}
	}

	/**
	 * Get current user from localStorage
	 * @returns {Object|null} User object or null
	 */
	getCurrentUser() {
		return getStorageItem(AUTH_CONFIG.USER_STORAGE_KEY);
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
	 * @returns {string|null} Access token or null
	 */
	getAccessToken() {
		return getStorageItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
	}

	/**
	 * Get refresh token
	 * @returns {string|null} Refresh token or null
	 */
	getRefreshToken() {
		return getStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
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
				setStorageItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, accessToken);

				if (newRefreshToken) {
					setStorageItem(
						AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
						newRefreshToken,
					);
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
		setStorageItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, accessToken);
		setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
		setStorageItem(AUTH_CONFIG.USER_STORAGE_KEY, user);
	}
}

export const authService = new AuthService();
