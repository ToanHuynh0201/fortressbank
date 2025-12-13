import { authService } from "@/services";
import { createContext, useReducer, useEffect } from "react";
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
	login: (username: string, password: string) => Promise<any>;
	logout: () => Promise<void>;
	clearError: () => void;
	updateUser: (user: any) => void;
	changePassword: (
		currentPassword: string,
		newPassword: string,
	) => Promise<any>;
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
	}, []);

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
				dispatch({
					type: AUTH_ACTIONS.LOGIN_SUCCESS,
					payload: { user: userData },
				});
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

	const value = {
		...state,
		login,
		changePassword,
		logout,
		clearError,
		updateUser,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

// Export context for use in hooks
export { AuthContext };
