import apiService from "@/lib/api";
import { withErrorHandling } from "@/utils/error";

/**
 * Transfer Service
 * Handles all transfer and transaction-related API calls
 */

export interface TransferRequest {
	senderAccountId: string;
	senderAccountNumber: string;
	receiverAccountNumber: string;
	amount: number;
	transactionType: "INTERNAL_TRANSFER" | "EXTERNAL_TRANSFER";
	description?: string;
}

export interface TransferResponse {
	code: number;
	message: string;
	data: {
		transactionId: string;
		senderAccountId: string;
		senderAccountNumber: string;
		senderUserId: string;
		receiverAccountId: string;
		receiverAccountNumber: string;
		receiverUserId: string;
		amount: number;
		feeAmount: number;
		transactionType: "INTERNAL_TRANSFER" | "EXTERNAL_TRANSFER";
		status: "PENDING_OTP" | "PENDING_FACE_AUTH";
		requireFaceAuth ?: boolean;
		description: string;
		createdAt: string | null;
		updatedAt: string | null;
		completedAt: string | null;
		failureReason: string | null;
	};
}

export interface VerifyOTPRequest {
	transactionId: string;
	otpCode: string;
}

export interface Transaction {
	transactionId: string;
	senderAccountId: string;
	senderAccountNumber: string;
	senderUserId: string;
	receiverAccountId: string;
	receiverAccountNumber: string;
	receiverUserId: string;
	amount: number;
	feeAmount: number;
	transactionType: string;
	status: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	completedAt: string | null;
	failureReason: string | null;
}

export interface VerifyOTPResponse {ư
	code: number;
	message: string;
	data: Transaction;
}

export interface VerifyTransactionFaceRequest {
	transactionId: string;
	photo: string; // URI to captured photo
}

export interface VerifyTransactionFaceResponse {
	code: number;
	message: string;
	data: {
		verified: boolean;
		otpSent?: boolean;
		transactionId: string;
		status: string;
	};
}

// Complete account lookup data from API
export interface AccountLookupData {
	accountId: string;
	userId: string;
	balance: number;
	createdAt: string;
	accountNumber: string;
	accountStatus: "ACTIVE" | "INACTIVE" | "BLOCKED" | "CLOSED";
	fullName: string;
}

// Response structure matching withErrorHandling pattern
export interface AccountLookupResponse {
	success: boolean;
	data?: AccountLookupData;
	error?: string;
	code?: string;
	message?: string;
}

export interface TransactionHistoryParams {
	offset?: number;
	limit?: number;
	type?: "SENT" | "RECEIVED" | "ALL";
}

export interface TransactionHistoryResponse {
	code: number;
	message: string;
	data: {
		content: Transaction[];
		pageable: {
			pageNumber: number;
			pageSize: number;
			offset: number;
			paged: boolean;
			unpaged: boolean;
		};
		totalPages: number;
		totalElements: number;
		last: boolean;
		size: number;
		number: number;
		numberOfElements: number;
		first: boolean;
		empty: boolean;
	};
}

class TransferService {
	/**
	 * Create a new transfer transaction
	 */
	async createTransfer(data: TransferRequest): Promise<TransferResponse> {
		const response = await apiService.post("/transactions/transfers", data);
		return response.data;
	}

	/**
	 * Verify OTP for a pending transaction
	 */
	async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
		const response = await apiService.post(
			"/transactions/verify-otp",
			data,
		);
		return response.data;
	}

	/**
	 * Look up account details by account number
	 * Returns complete account information including accountId needed for transfers
	 * @param accountNumber - The account number to lookup
	 * @param bankName - Optional bank name (e.g., "Stripe" for external banks)
	 */
	lookupAccount = withErrorHandling(
		async (accountNumber: string, bankName?: string) => {
			const params: { accountNumber: string; bankName?: string } = {
				accountNumber,
			};
			if (bankName) {
				params.bankName = bankName;
			}
			const response = await apiService.get("/accounts/lookup", {
				params,
			});
			return response;
		},
	);

	/**
	 * Validate transfer before processing
	 */
	async validateTransfer(
		data: Omit<TransferRequest, "description" | "senderAccountNumber">,
	): Promise<{ success: boolean; error?: string }> {
		try {
			const response = await apiService.post(
				"/transactions/validate",
				data,
			);
			return response.data;
		} catch (error: any) {
			return {
				success: false,
				error: error.message || "Failed to validate transfer",
			};
		}
	}

	/**
	 * Get transaction history for a specific account
	 */
	async getTransactionHistory(
		accountNumber: string,
		params?: TransactionHistoryParams,
	): Promise<TransactionHistoryResponse> {
		const queryParams = new URLSearchParams();

		// Always include offset, limit, and type params (even for ALL)
		queryParams.append("offset", (params?.offset ?? 0).toString());
		queryParams.append("limit", (params?.limit ?? 20).toString());
		queryParams.append("type", params?.type ?? "ALL");

		const url = `/transactions/${accountNumber}/history?${queryParams.toString()}`;
		const response = await apiService.get(url);
		return response.data;
	}

	/**
	 * Get transaction by ID
	 */
	async getTransactionById(
		txId: string,
	): Promise<{ code: number; message: string; data: Transaction }> {
		const response = await apiService.get(`/transactions/${txId}`);
		return response.data;
	}

	/**
	 * Cancel pending transaction
	 */
	async cancelTransaction(
		txId: string,
	): Promise<{ status: string; message: string }> {
		const response = await apiService.post(
			`/transactions/${txId}/cancel`,
			{},
		);
		return response.data;
	}

	/**
	 * Resend OTP for transaction
	 */
	async resendOTP(
		txId: string,
	): Promise<{ status: string; message: string }> {
		const response = await apiService.post(
			`/transactions/${txId}/resend-otp`,
			{},
		);
		return response.data;
	}

	/**
	 * Get transaction receipt/details for printing
	 */
	async getTransactionReceipt(
		txId: string,
	): Promise<{ status: string; data: Transaction }> {
		const response = await apiService.get(`/transactions/${txId}/receipt`);
		return response.data;
	}

	/**
	 * Verify transaction with face recognition
	 * @param transactionId - Transaction ID to verify
	 * @param photoUri - URI of the captured face photo
	 * @returns Promise with verification response
	 */
	async verifyTransactionWithFace(
		transactionId: string,
		photoUri: string,
	): Promise<VerifyTransactionFaceResponse> {
		return this._verifyTransactionWithFaceRetry(
			transactionId,
			photoUri,
			false,
		);
	}

	/**
	 * Internal method to verify transaction with face recognition with retry on 401
	 * @private
	 */
	private async _verifyTransactionWithFaceRetry(
		transactionId: string,
		photoUri: string,
		isRetry: boolean,
	): Promise<VerifyTransactionFaceResponse> {
		try {
			const formData = new FormData();
			formData.append("transactionId", transactionId);
			formData.append("files", {
				uri: photoUri,
				type: "image/jpeg",
				name: "normal.jpg",
			} as any);

			// Get access token from storage
			const { getStorageItem, setStorageItem } = await import(
				"@/utils/storage"
			);
			const { STORAGE_KEYS, API_CONFIG } = await import("@/constants");

			const accessToken = await getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
			if (!accessToken) {
				throw new Error("Access token not found");
			}

			// Use fetch for multipart/form-data
			const response = await fetch(
				`${API_CONFIG.BASE_URL}/users/me/verify-transaction`,
				{
					method: "POST",
					body: formData,
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);

			const responseText = await response.text();
			console.log("📡 Response status:", response.status);
			console.log("📡 Response text:", responseText);

			let data;
			try {
				data = responseText ? JSON.parse(responseText) : {};
			} catch (parseError) {
				throw new Error(`Invalid JSON response: ${responseText}`);
			}

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
					return this._verifyTransactionWithFaceRetry(
						transactionId,
						photoUri,
						true,
					);
				} else {
					// Refresh failed, logout user
					const { authService } = await import("./authService");
					await authService.logout();
					throw new Error("Session expired. Please login again.");
				}
			}

			// Handle other errors
			if (!response.ok) {
				const errorMessage =
					data.message ||
					data.error ||
					`Face verification failed (status: ${response.status})`;
				throw new Error(errorMessage);
			}

			return data;
		} catch (error: any) {
			console.error("Verify transaction face error:", error);
			throw error;
		}
	}
}

export const transferService = new TransferService();
export default transferService;
