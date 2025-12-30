import {
	authService,
	biometricService,
	// userPreferenceService, // TODO: Uncomment when backend API is ready
	firebaseMessagingService,
	userPreferenceService,
} from "@/services";
import { createContext, useReducer, useEffect, useState } from "react";
import { getStorageItem, setStorageItem } from "@/utils";
import { STORAGE_KEYS } from "@/constants";

// AuthState type
interface AuthState {
	user: any;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

interface AuthContextType {
	user: any;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	biometricAvailable: boolean;
	biometricEnabled: boolean;
	login: (username: string, password: string) => Promise<any>;
	loginWithBiometric: () => Promise<any>;
	logout: () => Promise<void>;
	clearError: () => void;
	updateUser: (user: any) => void;
	changePassword: (
		currentPassword: string,
		newPassword: string,
	) => Promise<any>;
	enableBiometric: (username: string, password: string) => Promise<boolean>;
	disableBiometric: () => Promise<boolean>;
	checkBiometricStatus: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: true,
	error: null,
};

// Action types
const AUTH_ACTIONS = {
	LOGIN_START: "LOGIN_START",
	LOGIN_SUCCESS: "LOGIN_SUCCESS",
	LOGIN_FAILURE: "LOGIN_FAILURE",
	LOGOUT: "LOGOUT",
	SET_LOADING: "SET_LOADING",
	CLEAR_ERROR: "CLEAR_ERROR",
	UPDATE_USER: "UPDATE_USER",
};

// Reducer
const authReducer = (state: any, action: any) => {
	switch (action.type) {
		case AUTH_ACTIONS.LOGIN_START:
			return {
				...state,
				isLoading: true,
				error: null,
			};
		case AUTH_ACTIONS.LOGIN_SUCCESS:
			return {
				...state,
				user: action.payload.user,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			};
		case AUTH_ACTIONS.LOGIN_FAILURE:
			return {
				...state,
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: action.payload.error,
			};
		case AUTH_ACTIONS.LOGOUT:
			return {
				...state,
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null,
			};
		case AUTH_ACTIONS.SET_LOADING:
			return {
				...state,
				isLoading: action.payload,
			};
		case AUTH_ACTIONS.CLEAR_ERROR:
			return {
				...state,
				error: null,
			};
		case AUTH_ACTIONS.UPDATE_USER:
			return {
				...state,
				user: action.payload.user,
			};
		default:
			return state;
	}
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: any) => {
	const [state, dispatch] = useReducer(authReducer, initialState);
	const [biometricAvailable, setBiometricAvailable] = useState(false);
	const [biometricEnabled, setBiometricEnabled] = useState(false);

	// Check for existing authentication on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const isValid = await authService.validateSession();
				if (isValid) {
					const user = await authService.getCurrentUser();
					dispatch({
						type: AUTH_ACTIONS.LOGIN_SUCCESS,
						payload: { user },
					});
				} else {
					dispatch({
						type: AUTH_ACTIONS.SET_LOADING,
						payload: false,
					});
				}
			} catch {
				dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
			}
		};

		checkAuth();
		checkBiometricStatus();
	}, []);

	// Register device for push notifications
	const registerPushNotification = async (userId: string) => {
		try {
			console.log("========================================");
			console.log("🔔 Starting push notification registration...");
			console.log("User ID:", userId);

			// Get device token from Firebase
			const deviceToken = await firebaseMessagingService.getDeviceToken();
			console.log("========================================");
			if (!deviceToken) {
				console.warn(
					"⚠️ Failed to get device token, push notifications will not be registered",
				);
				console.log("========================================");
				return;
			}

			const user = await authService.getCurrentUser();
			const { email, phoneNumber } = user;
			const additionalData = { email, phoneNumber };

			// TODO: Backend API not ready yet - uncomment when /user-preferences endpoint is available
			// Register device token with backend
			const response =
				await userPreferenceService.registerDeviceForPushNotifications(
					userId,
					deviceToken,
					additionalData,
				);
			console.log(response);

			// console.log("✅ Push notification registration successful!");
			// console.log("📦 Response:", JSON.stringify(response, null, 2));
		} catch (error) {
			// Don't throw error, just log it
			// We don't want to fail login if push notification registration fails
			console.error("========================================");
			console.error("❌ Failed to register push notification:");
			console.error(error);
			console.error("========================================");
		}
	};

	// Login function
	const login = async (username: string, password: string) => {
		dispatch({ type: AUTH_ACTIONS.LOGIN_START });

		try {
			const response = await authService.login({
				username,
				password,
			});

			const user = await getStorageItem(STORAGE_KEYS.USER_DATA);

			// Check if response code is 1000 (success)
			if (response.code === 1000 && user) {
				const userData = user;

				// Check if user switched accounts - clear old biometric credentials
				try {
					const storedCredentials = await biometricService.getCredentials();
					if (storedCredentials && storedCredentials.username !== username) {
						console.log("Account switch detected - clearing old biometric credentials");
						await biometricService.removeCredentials();
						setBiometricEnabled(false);
					}
				} catch (error) {
					console.error("Error checking stored biometric credentials:", error);
				}

				dispatch({
					type: AUTH_ACTIONS.LOGIN_SUCCESS,
					payload: { user: userData },
				});

				// Register push notification after successful login
				// Run in background, don't await to avoid blocking login flow
				registerPushNotification(userData.id || userData.userId).catch(
					(error) => {
						console.error(
							"Background push notification registration failed:",
							error,
						);
					},
				);

				return response;
			} else {
				const errorMsg =
					response.message || "Failed to fetch user profile";
				throw new Error(errorMsg);
			}
		} catch (error: any) {
			const errorMessage =
				error.message || "Login failed. Please try again.";
			dispatch({
				type: AUTH_ACTIONS.LOGIN_FAILURE,
				payload: { error: errorMessage },
			});
			throw error;
		}
	};

	// Logout function
	const logout = async () => {
		await authService.logout();
		dispatch({ type: AUTH_ACTIONS.LOGOUT });
	};

	// Clear error function
	const clearError = () => {
		dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
	};

	// Update user function
	const updateUser = (user: any) => {
		// Update localStorage with new user data
		setStorageItem(STORAGE_KEYS.USER_DATA, user);

		dispatch({
			type: AUTH_ACTIONS.UPDATE_USER,
			payload: { user },
		});
	};

	// Change password function
	const changePassword = async (oldPassword: string, newPassword: string) => {
		return await authService.changePassword(oldPassword, newPassword);
	};

	// Check biometric status
	const checkBiometricStatus = async () => {
		try {
			const available = await authService.isBiometricAvailable();
			const enabled = await authService.isBiometricEnabled();
			setBiometricAvailable(available);
			setBiometricEnabled(enabled);
		} catch (error) {
			console.error("Error checking biometric status:", error);
			setBiometricAvailable(false);
			setBiometricEnabled(false);
		}
	};

	// Login with biometric
	const loginWithBiometric = async () => {
		dispatch({ type: AUTH_ACTIONS.LOGIN_START });

		try {
			const response = await authService.loginWithBiometric();

			const user = await getStorageItem(STORAGE_KEYS.USER_DATA);

			if (response.code === 1000 && user) {
				const userData = user;
				dispatch({
					type: AUTH_ACTIONS.LOGIN_SUCCESS,
					payload: { user: userData },
				});

				// Register push notification after successful biometric login
				// Run in background, don't await to avoid blocking login flow
				registerPushNotification(userData.id || userData.userId).catch(
					(error) => {
						console.error(
							"Background push notification registration failed:",
							error,
						);
					},
				);

				return response;
			} else {
				const errorMsg = response.message || "Biometric login failed";
				throw new Error(errorMsg);
			}
		} catch (error: any) {
			const errorMessage =
				error.message || "Biometric login failed. Please try again.";
			dispatch({
				type: AUTH_ACTIONS.LOGIN_FAILURE,
				payload: { error: errorMessage },
			});
			throw error;
		}
	};

	// Enable biometric authentication
	const enableBiometric = async (username: string, password: string) => {
		try {
			// Check if biometric is available
			const available = await authService.isBiometricAvailable();
			if (!available) {
				throw new Error(
					"Biometric authentication is not available on this device",
				);
			}

			// Authenticate with biometric first
			const authenticated = await biometricService.authenticate();
			if (!authenticated) {
				throw new Error("Biometric authentication failed");
			}

			// Save credentials
			const saved = await authService.saveBiometricCredentials(
				username,
				password,
			);
			if (saved) {
				// Refresh biometric status to ensure it's up to date
				await checkBiometricStatus();
				return true;
			}
			return false;
		} catch (error) {
			console.error("Enable biometric error:", error);
			throw error;
		}
	};

	// Disable biometric authentication
	const disableBiometric = async () => {
		try {
			const removed = await authService.removeBiometricCredentials();
			if (removed) {
				// Refresh biometric status to ensure it's up to date
				await checkBiometricStatus();
				return true;
			}
			return false;
		} catch (error) {
			console.error("Disable biometric error:", error);
			return false;
		}
	};

	const value = {
		...state,
		biometricAvailable,
		biometricEnabled,
		login,
		loginWithBiometric,
		changePassword,
		logout,
		clearError,
		updateUser,
		enableBiometric,
		disableBiometric,
		checkBiometricStatus,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

// Export context for use in hooks
export { AuthContext };
