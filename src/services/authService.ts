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
	 * Get user profile from API
	 * @returns {Promise<any>} User profile data
	 */
	getUserProfile = withErrorHandling(async () => {
		const response = await api.get("/users/me");

		if (response.data.status === "success") {
			const userData = response.data.data;
			// Save user data to storage
			await setStorageItem(STORAGE_KEYS.USER_DATA, userData);
			return response;
		}

		return null;
	});

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

			// Fetch user profile after successful login
			const userProfileResponse = await this.getUserProfile();

			// Add user data to response
			return {
				...response,
				data: {
					...response.data,
					user: userProfileResponse?.data,
				},
			};
		}

		return response;
	});

	/**
	 * Logout user and clear stored data
	 */
	async logout() {
		try {
			const refreshToken = await this.getRefreshToken();
			if (refreshToken) {
				// Use native fetch instead of api library
				const response = await fetch("http://10.0.2.2:8000/auth/logout", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						refreshToken: refreshToken,
					}),
				});

				const data = await response.json();
				console.log("Logout response:", data);
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
	 * @returns {Promise<Object|null>} User object or null
	 */
	async getCurrentUser() {
		return await getStorageItem(STORAGE_KEYS.USER_DATA);
	}

	/**
	 * Change user password
	 * @param {string} oldPassword - Current password
	 * @param {string} newPassword - New password
	 * @returns {Promise<any>} API response
	 */
	changePassword = withErrorHandling(
		async (oldPassword: string, newPassword: string) => {
			const response = await api.post("/users/me/change-password", {
				oldPassword,
				newPassword,
			});

			return response;
		},
	);

	/**
	 * Check if user is authenticated
	 * @returns {Promise<boolean>} Authentication status
	 */
	async isAuthenticated() {
		try {
			const token = await this.getAccessToken();
			const user = await this.getCurrentUser();

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
	 * @returns {Promise<boolean>} Whether session is valid
	 */
	async validateSession() {
		const token = await this.getAccessToken();
		if (!token) {
			return false;
		}

		const user = await this.getCurrentUser();
		if (!user) {
			this.logout();
			return false;
		}

		return true;
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
