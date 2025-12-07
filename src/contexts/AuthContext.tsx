import { authService } from "@/services";
import { createContext, useReducer, useEffect } from "react";
import { setStorageItem } from "@/utils";

// AuthState type
interface AuthState {
	user: any;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

interface AuthContextType extends AuthState {
	login: (email: string, password: string) => Promise<any>;
	logout: () => void;
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
		const checkAuth = () => {
			try {
				if (authService.validateSession()) {
					const user = authService.getCurrentUser();
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
	const login = async (email: string, password: string) => {
		dispatch({ type: AUTH_ACTIONS.LOGIN_START });

		try {
			const response = await authService.login(email, password);
			const userData = response.data?.user;
			dispatch({
				type: AUTH_ACTIONS.LOGIN_SUCCESS,
				payload: { user: userData },
			});
			return response;
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
		setStorageItem("user", user);

		dispatch({
			type: AUTH_ACTIONS.UPDATE_USER,
			payload: { user },
		});
	};

	// Change password function
	const changePassword = async (
		currentPassword: string,
		newPassword: string,
	) => {
		return await authService.changePassword(currentPassword, newPassword);
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
