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
		status: "PENDING_OTP" | "PENDING_SMART_OTP" | "PENDING_FACE_AUTH" | "PENDING" | "COMPLETED" | "FAILED";
		requireFaceAuth?: boolean; // Legacy support
		challengeType?: "NONE" | "SMS_OTP" | "DEVICE_BIO" | "FACE_VERIFY";
		challengeData?: string;
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

export interface VerifyDeviceSignatureRequest {
	transactionId: string;
	deviceId: string;
	signatureBase64: string;
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

export interface VerifyOTPResponse {
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
	 * Verify OTP for a pending transaction (SMS_OTP)
	 */
	async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
		const response = await apiService.post(
			"/transactions/verify-otp",
			data,
		);
		return response.data;
	}

	/**
	 * Verify device signature for a pending transaction (DEVICE_BIO)
	 */
	async verifyDeviceSignature(data: VerifyDeviceSignatureRequest): Promise<VerifyOTPResponse> {
		const response = await apiService.post(
			"/transactions/verify-device",
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
	 * Complete face verification for a transaction (FACE_VERIFY challenge).
	 * 
	 * Current Flow (Simplified - BE trusts FE):
	 * 1. FE captures face photo locally
	 * 2. FE does local liveness/quality check if possible
	 * 3. FE calls this method to tell BE face is verified
	 * 4. BE completes the transaction
	 * 
	 * NOTE: In production, this should verify via /smart-otp/verify-face first,
	 * but the current BE design doesn't return challengeId in TransactionResponse.
	 * 
	 * @param transactionId - Transaction ID to verify
	 * @param photoUri - URI of captured face (for local checks, not sent to BE currently)
	 * @returns Promise with verification response
	 */
	async verifyTransactionWithFace(
		transactionId: string,
		photoUri: string,
	): Promise<VerifyTransactionFaceResponse> {
		try {
			// TODO: If we had challengeId, we would:
			// 1. Call /smart-otp/verify-face with challengeId + photo
			// 2. Only if that returns valid, proceed here
			// For now, we trust the FE did local face capture
			console.log("📡 Completing face verification for transaction:", transactionId);
			console.log("📷 Photo captured (local check only):", photoUri ? "Yes" : "No");

			// Call BE with JSON body - BE expects { transactionId } + ?faceVerified=true
			const response = await apiService.post(
				`/transactions/verify-face?faceVerified=true`,
				{ transactionId }
			);

			console.log("📡 Face verification response:", response.data);

			// Map to expected response format
			return {
				code: response.data.code,
				message: response.data.message,
				data: {
					verified: response.data.code === 1000 && response.data.data?.status === "COMPLETED",
					otpSent: false,
					transactionId: response.data.data?.transactionId || transactionId,
					status: response.data.data?.status || "UNKNOWN",
				},
			};
		} catch (error: any) {
			console.error("❌ Face verification error:", error);
			
			// Extract meaningful error message
			const errorMessage = 
				error.response?.data?.message ||
				error.message ||
				"Face verification failed";
			
			throw new Error(errorMessage);
		}
	}
}

export const transferService = new TransferService();
export default transferService;
