import {
	getAuthToken,
	setAuthToken,
	removeAuthToken,
	removeUserData,
	removeStorageItem,
	logError,
	parseError,
	shouldLogout,
	getStorageItem,
	setStorageItem,
} from "@/utils";
import axios, { type AxiosInstance } from "axios";
import { API_CONFIG, STORAGE_KEYS } from "../constants";
class ApiService {
	private baseUrl: string;
	private api: AxiosInstance;
	constructor(customBaseUrl: string | null = null) {
		// this.baseUrl = customBaseUrl || API_CONFIG.BASE_URL;
		this.baseUrl = "http://10.0.2.2:8000";
		this.api = this._createAxiosInstance();
		this._setupInterceptors();
	}

	/**
	 * Create axios instance with base configuration
	 * @private
	 * @returns {axios.AxiosInstance} Configured axios instance
	 */
	_createAxiosInstance() {
		return axios.create({
			baseURL: this.baseUrl,
			timeout: API_CONFIG.TIMEOUT,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Setup request and response interceptors
	 * @private
	 */
	_setupInterceptors() {
		this._setupRequestInterceptor();
		this._setupResponseInterceptor();
	}

	/**
	 * Setup request interceptor to add auth token
	 * @private
	 */
	_setupRequestInterceptor() {
		this.api.interceptors.request.use(
			async (config: any) => {
				const token = await getAuthToken();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error: any) => {
				const parsedError = parseError(error);
				logError(parsedError, { context: "api.request" });
				return Promise.reject(parsedError);
			},
		);
	}

	/**
	 * Setup response interceptor to handle auth errors
	 * @private
	 */
	_setupResponseInterceptor() {
		this.api.interceptors.response.use(
			(response: any) => response,
			async (error: any) => {
				const parsedError = parseError(error);

				// Don't trigger logout for login endpoint errors
				if (this._isLoginEndpoint(error.config?.url)) {
					logError(parsedError, { context: "api.response" });
					return Promise.reject(parsedError);
				}

				// Handle auth errors with token refresh attempt
				if (shouldLogout(parsedError)) {
					const refreshResult = await this._handleAuthError(
						error,
						parsedError,
					);
					if (refreshResult) {
						return refreshResult;
					}
					this._handleLogout();
				}

				logError(parsedError, { context: "api.response" });
				return Promise.reject(parsedError);
			},
		);
	}

	/**
	 * Check if URL is login endpoint
	 * @private
	 * @param {string} url - Request URL
	 * @returns {boolean} Whether URL is login endpoint
	 */
	_isLoginEndpoint(url: string) {
		return url?.includes("/auth/login");
	}

	/**
	 * Handle authentication errors
	 * @private
	 * @param {Object} originalError - Original error object
	 * @param {Object} parsedError - Parsed error object
	 * @returns {Promise<Object|false>} Retry result or false
	 */
	async _handleAuthError(originalError: any, parsedError: any) {
		// Try token refresh for 401 errors only
		if (parsedError.status === 401) {
			return await this._tryTokenRefresh(originalError);
		}
		return false;
	}

	/**
	 * Attempt to refresh token and retry original request
	 * @private
	 * @param {Object} originalError - Original error object
	 * @returns {Promise<Object|false>} Retry result or false
	 */
	async _tryTokenRefresh(originalError: any) {
		const refreshToken = await getStorageItem(STORAGE_KEYS.SESSION_DATA);
		if (!refreshToken) {
			return false;
		}

		try {
			const refreshResponse = await this._performTokenRefresh(
				refreshToken,
			);

			if (refreshResponse.data.status === "success") {
				const { accessToken, refreshToken: newRefreshToken } =
					refreshResponse.data.data;
				await setAuthToken(accessToken);

				if (newRefreshToken) {
					await setStorageItem(
						STORAGE_KEYS.SESSION_DATA,
						newRefreshToken,
					);
				}

				return this._retryOriginalRequest(originalError, accessToken);
			}
		} catch (refreshError) {
			logError(parseError(refreshError), { context: "api.refresh" });
		}

		return false;
	}

	/**
	 * Perform token refresh API call
	 * @private
	 * @param {string} refreshToken - Refresh token
	 * @returns {Promise<Object>} Refresh response
	 */
	async _performTokenRefresh(refreshToken: any) {
		return axios.post(`${API_CONFIG.BASE_URL}/auth/token/refresh`, {
			refreshToken,
		});
	}

	/**
	 * Retry original request with new token
	 * @private
	 * @param {Object} originalError - Original error object
	 * @param {string} accessToken - New access token
	 * @returns {Promise<Object>} Request response
	 */
	_retryOriginalRequest(originalError: any, accessToken: any) {
		const originalRequest = originalError.config;
		originalRequest.headers.Authorization = `Bearer ${accessToken}`;
		return axios(originalRequest);
	}

	/**
	 * Handle logout by clearing storage and redirecting
	 * @private
	 */
	async _handleLogout() {
		await Promise.all([
			removeAuthToken(),
			removeUserData(),
			removeStorageItem(STORAGE_KEYS.SESSION_DATA),
		]);

		// Use expo-router for navigation instead of window.location
		try {
			// router.replace(ROUTES.LOGIN);
		} catch (error) {
			console.warn("Router not available, unable to navigate to login");
		}
	}

	// Proxy methods to axios instance
	get(url: any, config?: any) {
		return this.api.get(url, config);
	}

	post(url: any, data: any, config?: any) {
		return this.api.post(url, data, config);
	}

	put(url: any, data: any, config?: any) {
		return this.api.put(url, data, config);
	}

	patch(url: any, data: any, config?: any) {
		return this.api.patch(url, data, config);
	}

	delete(url: any, config?: any) {
		return this.api.delete(url, config);
	}
}

const apiService = new ApiService();

// * Use this for custom instances
export { ApiService };

export default apiService;
