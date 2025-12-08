/**
 * Authentication type definitions
 */

export interface User {
	id: string;
	email: string;
	name: string;
	phone?: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
	phone?: string;
}

export interface LoginResponse {
	status: string;
	code: number;
	message: string;
	data: {
		access_token: string;
		refresh_token: string;
		expires_in: number;
		refresh_expires_in: number;
		id_token: string;
		token_type: string;
		scope: string;
	};
}

export interface ForgotPasswordRequest {
	email: string;
}

export interface ResetPasswordRequest {
	token: string;
	newPassword: string;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export interface AuthContextState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (credentials: LoginRequest) => Promise<void>;
	register: (data: RegisterRequest) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}
