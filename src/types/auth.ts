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
	username: string;
	email: string;
	password: string;
	fullName: string;
	phoneNumber: string;
	dob: string;
	citizenId: string;
	accountNumberType: "AUTO_GENERATE" | "PHONE_NUMBER";
	pin: string;
}

export interface RegisterResponse {
	code: number;
	message: string;
	data?: {
		id: string;
		username: string;
		email: string;
		fullName: string;
		citizenId: string;
		dob: string;
		phoneNumber: string;
		createdAt: string;
	};
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

export interface ValidateAndSendOtpRequest {
	email: string;
	phoneNumber: string;
	citizenId: string;
}

export interface ValidateAndSendOtpResponse {
	code: number;
	message: string;
	data?: any;
}

export interface VerifyOtpRequest {
	phoneNumber: string;
	otp: string;
}

export interface VerifyOtpResponse {
	code: number;
	message: string;
	data?: any;
}

// Forgot Password - Send OTP
export interface ForgotPasswordSendOtpRequest {
	phoneNumber: string;
}

export interface ForgotPasswordSendOtpResponse {
	code: number;
	message: string;
	data?: {
		sent: boolean;
		message: string;
		expirySeconds: number;
	};
}

// Forgot Password - Verify OTP
export interface ForgotPasswordVerifyOtpRequest {
	phoneNumber: string;
	otp: string;
}

export interface ForgotPasswordVerifyOtpResponse {
	code: number;
	message: string;
	data?: {
		verified: boolean;
		message: string;
		verificationToken: string;
	};
}

// Forgot Password - Reset Password
export interface ForgotPasswordResetRequest {
	phoneNumber: string;
	verificationToken: string;
	newPassword: string;
}

export interface ForgotPasswordResetResponse {
	code: number;
	message: string;
	data?: {
		success: boolean;
		message: string;
	};
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
