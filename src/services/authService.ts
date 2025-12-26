import api from "@/lib/api";
import { API_CONFIG, STORAGE_KEYS } from "@/constants";
import {
	getStorageItem,
	setStorageItem,
	clearStorageItems,
} from "@/utils/storage";
import { biometricService } from "./biometricService";
import type {
	LoginRequest,
	ValidateAndSendOtpRequest,
	ValidateAndSendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse,
	RegisterRequest,
	RegisterResponse,
} from "@/types/auth";

class AuthService {
	/**
	 * Get user profile from API
	 * @returns {Promise<any>} User profile data
	 */
	async getUserProfile() {
		try {
			const token = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);

			const response = await fetch(`${API_CONFIG.BASE_URL}/users/me`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			const result = await response.json();

			if (result.code === 1000 && result.data) {
				const userData = result.data;

				// Save user data to storage
				await setStorageItem(STORAGE_KEYS.USER_DATA, userData);
				return result;
			}

			return null;
		} catch (error) {
			console.error("Get user profile error:", error);
			return null;
		}
	}

	/**
	 * Login user with username and password
	 * @param {LoginRequest} request - Login request with username and password
	 * @returns {Promise<any>} API response data
	 */
	async login(request: LoginRequest) {
		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(request),
			});

			const result = await response.json();

			if (result.code === 1000 && result.data) {
				const { access_token, refresh_token } = result.data;

				if (access_token) {
					await setStorageItem(STORAGE_KEYS.AUTH_TOKEN, access_token);
				}

				if (refresh_token) {
					await setStorageItem(
						STORAGE_KEYS.SESSION_DATA,
						refresh_token,
					);
				}

				// Fetch user profile after successful login
				const userProfileResponse = await this.getUserProfile();

				// Add user data to response
				return {
					...result,
					data: {
						...result.data,
						user: userProfileResponse?.data?.data || null,
					},
				};
			}

			return result;
		} catch (error) {
			console.error("Login error:", error);
			return {
				code: -1,
				message:
					error instanceof Error
						? error.message
						: "Network error occurred",
			};
		}
	}

	/**
	 * Logout user and clear stored data
	 */
	async logout() {
		try {
			const refreshToken = await this.getRefreshToken();
			if (refreshToken) {
				await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						refreshToken: refreshToken,
					}),
				});
			}
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			// Clear auth data but keep biometric credentials for future logins
			clearStorageItems([
				STORAGE_KEYS.AUTH_TOKEN,
				STORAGE_KEYS.SESSION_DATA,
				STORAGE_KEYS.USER_DATA,
			]);

			// Note: Biometric credentials are intentionally kept to allow biometric login
			// They will only be removed when user explicitly disables biometric or changes password
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
	changePassword = async (oldPassword: string, newPassword: string) => {
		try {
			const response = await api.post("/users/me/change-password", {
				oldPassword,
				newPassword,
			});

			// If password change is successful, remove biometric credentials
			// User will need to re-enable biometric with new password
			if (response.data?.code === 1000 || response.status === 200) {
				await biometricService.removeCredentials();
			}

			return response;
		} catch (error) {
			console.error("Change password error:", error);
			throw error;
		}
	};

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
	 * Save credentials for biometric authentication
	 * @param {string} username - Username to save
	 * @param {string} password - Password to save (encrypted by SecureStore)
	 * @returns {Promise<boolean>} Success status
	 */
	async saveBiometricCredentials(
		username: string,
		password: string,
	): Promise<boolean> {
		try {
			return await biometricService.saveCredentials(username, password);
		} catch (error) {
			console.error("Save biometric credentials error:", error);
			return false;
		}
	}

	/**
	 * Remove biometric credentials
	 * @returns {Promise<boolean>} Success status
	 */
	async removeBiometricCredentials(): Promise<boolean> {
		try {
			return await biometricService.removeCredentials();
		} catch (error) {
			console.error("Remove biometric credentials error:", error);
			return false;
		}
	}

	/**
	 * Check if biometric authentication is enabled
	 * @returns {Promise<boolean>} True if enabled
	 */
	async isBiometricEnabled(): Promise<boolean> {
		try {
			return await biometricService.isBiometricEnabled();
		} catch (error) {
			console.error("Check biometric enabled error:", error);
			return false;
		}
	}

	/**
	 * Check if biometric authentication is available on device
	 * @returns {Promise<boolean>} True if available
	 */
	async isBiometricAvailable(): Promise<boolean> {
		try {
			return await biometricService.isBiometricAvailable();
		} catch (error) {
			console.error("Check biometric available error:", error);
			return false;
		}
	}

	/**
	 * Login with biometric authentication
	 * @returns {Promise<any>} Login response
	 */
	async loginWithBiometric(): Promise<any> {
		try {
			// Check if biometric is available
			const isAvailable = await biometricService.isBiometricAvailable();
			if (!isAvailable) {
				return {
					code: -1,
					message: "Biometric authentication is not available",
				};
			}

			// Check if biometric is enabled
			const isEnabled = await biometricService.isBiometricEnabled();
			if (!isEnabled) {
				return {
					code: -1,
					message: "Biometric authentication is not enabled",
				};
			}

			// Authenticate with biometric
			const authenticated = await biometricService.authenticate();
			if (!authenticated) {
				return {
					code: -1,
					message: "Biometric authentication failed",
				};
			}

			// Get stored credentials
			const credentials = await biometricService.getCredentials();
			if (!credentials) {
				return {
					code: -1,
					message: "No stored credentials found",
				};
			}

			// Login with stored credentials
			const loginResponse = await this.login({
				username: credentials.username,
				password: credentials.password,
			});

			return loginResponse;
		} catch (error) {
			console.error("Biometric login error:", error);
			return {
				code: -1,
				message:
					error instanceof Error
						? error.message
						: "Biometric login failed",
			};
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

	/**
	 * Validate user information and send OTP for registration
	 * @param {ValidateAndSendOtpRequest} request - Request with email, phoneNumber, and citizenId
	 * @returns {Promise<ValidateAndSendOtpResponse>} API response
	 */
	async validateAndSendOtp(
		request: ValidateAndSendOtpRequest,
	): Promise<ValidateAndSendOtpResponse> {
		try {
			const response = await fetch(
				`${API_CONFIG.BASE_URL}/auth/validate-and-send-otp`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(request),
				},
			);

			const data: ValidateAndSendOtpResponse = await response.json();

			// Return the response regardless of success or error
			return data;
		} catch (error) {
			console.error("Validate and send OTP error:", error);
			// Return error response in the same format
			return {
				code: -1,
				message:
					error instanceof Error
						? error.message
						: "Network error occurred",
			};
		}
	}

	/**
	 * Verify OTP code
	 * @param {VerifyOtpRequest} request - Request with email and OTP code
	 * @returns {Promise<VerifyOtpResponse>} API response
	 */
	async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		try {
			const response = await fetch(
				`${API_CONFIG.BASE_URL}/auth/verify-otp`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(request),
				},
			);

			const data: VerifyOtpResponse = await response.json();

			// Return the response regardless of success or error
			return data;
		} catch (error) {
			console.error("Verify OTP error:", error);
			// Return error response in the same format
			return {
				code: -1,
				message:
					error instanceof Error
						? error.message
						: "Network error occurred",
			};
		}
	}

	/**
	 * Register new user account
	 * @param {RegisterRequest} request - Registration data
	 * @returns {Promise<RegisterResponse>} API response
	 */
	async register(request: RegisterRequest): Promise<RegisterResponse> {
		try {
			const response = await fetch(
				`${API_CONFIG.BASE_URL}/auth/register`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(request),
				},
			);

			const data: RegisterResponse = await response.json();

			// Return the response regardless of success or error
			return data;
		} catch (error) {
			console.error("Register error:", error);
			// Return error response in the same format
			return {
				code: -1,
				message:
					error instanceof Error
						? error.message
						: "Network error occurred",
			};
		}
	}

	/**
	 * Register Face ID for new user during sign-up
	 * @param {string} userId - User ID from registration response
	 * @param {object} photos - Object with 4 face photos (left, right, closed_eyes, normal)
	 * @returns {Promise<any>} API response
	 */
	async registerFaceID(
		userId: string,
		photos: {
			left: string | null;
			right: string | null;
			closed_eyes: string | null;
			normal: string | null;
		},
	): Promise<any> {
		try {
			const formData = new FormData();

			// Append user_id parameter
			formData.append("user_id", userId);

			// Append 4 photos
			if (photos.left) {
				formData.append("files", {
					uri: photos.left,
					type: "image/jpeg",
					name: "left.jpg",
				} as any);
			}

			if (photos.right) {
				formData.append("files", {
					uri: photos.right,
					type: "image/jpeg",
					name: "right.jpg",
				} as any);
			}

			if (photos.closed_eyes) {
				formData.append("files", {
					uri: photos.closed_eyes,
					type: "image/jpeg",
					name: "closed_eyes.jpg",
				} as any);
			}

			if (photos.normal) {
				formData.append("files", {
					uri: photos.normal,
					type: "image/jpeg",
					name: "normal.jpg",
				} as any);
			}

			const response = await fetch(
				`${API_CONFIG.BASE_URL}/auth/register-face`,
				{
					method: "POST",
					body: formData,
					headers: {
						"Content-Type": "multipart/form-data",
						// NO Authorization header - user not logged in yet
					},
				},
			);

			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Register Face ID error:", error);
			return {
				code: -1,
				message:
					error instanceof Error
						? error.message
						: "Face ID registration failed",
			};
		}
	}

	/**
	 * Update Face ID for existing logged-in user
	 * @param {object} photos - Object with 4 face photos (left, right, closed_eyes, normal)
	 * @returns {Promise<any>} API response
	 */
	async updateFaceID(photos: {
		left: string | null;
		right: string | null;
		closed_eyes: string | null;
		normal: string | null;
	}): Promise<any> {
		return this._updateFaceIDWithRetry(photos, false);
	}

	/**
	 * Internal method to update Face ID with retry on 401
	 * @private
	 */
	private async _updateFaceIDWithRetry(
		photos: {
			left: string | null;
			right: string | null;
			closed_eyes: string | null;
			normal: string | null;
		},
		isRetry: boolean,
	): Promise<any> {
		try {
			// Get access token for fetch request
			const accessToken = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
			if (!accessToken) {
				throw new Error("Access token not found");
			}

			const formData = new FormData();

			// Append 4 photos (no user_id needed - uses auth token)
			if (photos.left) {
				formData.append("files", {
					uri: photos.left,
					type: "image/jpeg",
					name: "left.jpg",
				} as any);
			}

			if (photos.right) {
				formData.append("files", {
					uri: photos.right,
					type: "image/jpeg",
					name: "right.jpg",
				} as any);
			}

			if (photos.closed_eyes) {
				formData.append("files", {
					uri: photos.closed_eyes,
					type: "image/jpeg",
					name: "closed_eyes.jpg",
				} as any);
			}

			if (photos.normal) {
				formData.append("files", {
					uri: photos.normal,
					type: "image/jpeg",
					name: "normal.jpg",
				} as any);
			}

			// Use fetch for multipart/form-data (axios has issues with React Native FormData)
			const response = await fetch(
				`${API_CONFIG.BASE_URL}/users/me/update-face`,
				{
					method: "POST",
					body: formData,
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			const data = await response.json();

			// Handle 401 Unauthorized - token expired
			if (response.status === 401 && !isRetry) {
				console.log(
					"Access token expired, attempting to refresh token...",
				);

				// Try to refresh the token
				const refreshToken = await getStorageItem(
					STORAGE_KEYS.SESSION_DATA,
				);
				if (!refreshToken) {
					throw new Error("Refresh token not found");
				}

				// Perform token refresh
				const refreshResponse = await fetch(
					`${API_CONFIG.BASE_URL}/auth/refresh`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ refreshToken }),
					},
				);

				const refreshData = await refreshResponse.json();

				// Check if refresh was successful
				if (
					refreshResponse.ok &&
					refreshData.code === 1000 &&
					refreshData.data
				) {
					const {
						access_token: newAccessToken,
						refresh_token: newRefreshToken,
					} = refreshData.data;

					// Save new tokens
					await setStorageItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
					if (newRefreshToken) {
						await setStorageItem(
							STORAGE_KEYS.SESSION_DATA,
							newRefreshToken,
						);
					}

					console.log("Token refreshed successfully, retrying request");

					// Retry the original request with new token
					return this._updateFaceIDWithRetry(photos, true);
				} else {
					// Refresh failed, logout user
					await this.logout();
					throw new Error("Session expired. Please login again.");
				}
			}

			// Handle other errors
			if (!response.ok) {
				throw new Error(data.message || "Failed to update face ID");
			}

			return data;
		} catch (error) {
			console.error("Update Face ID error:", error);
			throw error;
		}
	}
}

export const authService = new AuthService();
