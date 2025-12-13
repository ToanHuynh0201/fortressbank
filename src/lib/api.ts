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
	private isRefreshing: boolean = false;
	private failedQueue: Array<{
		resolve: (value?: any) => void;
		reject: (reason?: any) => void;
	}> = [];

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
				// Don't send token for login/register/refresh endpoints
				if (
					!this._isLoginEndpoint(config.url) &&
					!this._isRefreshEndpoint(config.url)
				) {
					const token = await getAuthToken();
					if (token) {
						config.headers.Authorization = `Bearer ${token}`;
					}
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
				const originalRequest = error.config;
				const parsedError = parseError(error);

				// Don't trigger logout for login endpoint errors
				if (this._isLoginEndpoint(originalRequest?.url)) {
					logError(parsedError, { context: "api.response" });
					return Promise.reject(error);
				}

				// Handle 401 errors with token refresh
				if (parsedError.status === 401 && !originalRequest._retry) {
					if (this.isRefreshing) {
						// If already refreshing, queue this request
						return new Promise((resolve, reject) => {
							this.failedQueue.push({ resolve, reject });
						})
							.then((token) => {
								originalRequest.headers.Authorization = `Bearer ${token}`;
								return this.api(originalRequest);
							})
							.catch((err) => {
								return Promise.reject(err);
							});
					}

					originalRequest._retry = true;
					this.isRefreshing = true;

					const refreshToken = await getStorageItem(
						STORAGE_KEYS.SESSION_DATA,
					);
					if (!refreshToken) {
						this.isRefreshing = false;
						this._handleLogout();
						return Promise.reject(error);
					}

					try {
						const refreshResponse = await this._performTokenRefresh(
							refreshToken,
						);

						// Check response format: { code: 1000, data: { access_token, refresh_token } }
						if (
							refreshResponse.data.code === 1000 &&
							refreshResponse.data.data
						) {
							const {
								access_token: newAccessToken,
								refresh_token: newRefreshToken,
							} = refreshResponse.data.data;

							await setStorageItem(
								STORAGE_KEYS.AUTH_TOKEN,
								newAccessToken,
							);

							if (newRefreshToken) {
								await setStorageItem(
									STORAGE_KEYS.SESSION_DATA,
									newRefreshToken,
								);
							}

							// Update auth header for original request
							originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

							// Process queued requests
							this._processQueue(null, newAccessToken);
							this.isRefreshing = false;

							// Retry original request
							return this.api(originalRequest);
						} else {
							// Refresh failed
							this._processQueue(error, null);
							this.isRefreshing = false;
							this._handleLogout();
							return Promise.reject(error);
						}
					} catch (refreshError) {
						logError(parseError(refreshError), {
							context: "api.refresh",
						});
						this._processQueue(refreshError, null);
						this.isRefreshing = false;
						this._handleLogout();
						return Promise.reject(refreshError);
					}
				}

				// Handle other auth errors
				if (shouldLogout(parsedError)) {
					this._handleLogout();
				}

				logError(parsedError, { context: "api.response" });
				return Promise.reject(error);
			},
		);
	}

	/**
	 * Process queued requests after token refresh
	 * @private
	 */
	_processQueue(error: any, token: string | null = null) {
		this.failedQueue.forEach((prom) => {
			if (error) {
				prom.reject(error);
			} else {
				prom.resolve(token);
			}
		});

		this.failedQueue = [];
	}

	/**
	 * Check if URL is login endpoint
	 * @private
	 * @param {string} url - Request URL
	 * @returns {boolean} Whether URL is login endpoint
	 */
	_isLoginEndpoint(url: string) {
		return url?.includes("login") || url?.includes("register");
	}

	/**
	 * Check if URL is refresh endpoint
	 * @private
	 * @param {string} url - Request URL
	 * @returns {boolean} Whether URL is refresh endpoint
	 */
	_isRefreshEndpoint(url: string) {
		return url?.includes("refresh") || url?.includes("/refresh");
	}

	/**
	 * Perform token refresh API call
	 * @private
	 * @param {string} refreshToken - Refresh token
	 * @returns {Promise<Object>} Refresh response
	 */
	async _performTokenRefresh(refreshToken: any) {
		return axios.post(`${this.baseUrl}/auth/refresh`, {
			refreshToken,
		});
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
