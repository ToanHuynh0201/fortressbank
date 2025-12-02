import apiService from "./api";

export interface CreateTransferRequest {
	fromAccountId: string;
	toAccountId: string;
	amount: number;
	type: "INTERNAL_TRANSFER" | "EXTERNAL_TRANSFER";
	description: string;
}

export interface CreateTransferResponse {
	status: string;
	data: {
		txId: string;
		status: string;
		message: string;
	};
}

export interface VerifyOTPRequest {
	transactionId: string;
	otpCode: string;
}

export interface VerifyOTPResponse {
	status: string;
	data: {
		txId: string;
		senderAccountId: string;
		receiverAccountId: string;
		amount: number;
		feeAmount: number;
		txType: string;
		status: string;
		description: string;
		createdAt: string;
		updatedAt: string;
		completedAt: string;
		failureReason: string | null;
	};
}

/**
 * Create a new transfer transaction
 * @param {CreateTransferRequest} data - Transfer details
 * @returns {Promise<CreateTransferResponse>} Transaction response with txId
 */
export const createTransfer = async (
	data: CreateTransferRequest,
): Promise<CreateTransferResponse> => {
	try {
		const response = await apiService.post("/transactions/transfers", data);
		return response.data;
	} catch (error: any) {
		throw error.response?.data || error;
	}
};

/**
 * Verify OTP for a pending transaction
 * @param {VerifyOTPRequest} data - Transaction ID and OTP code
 * @returns {Promise<VerifyOTPResponse>} Completed transaction details
 */
export const verifyTransactionOTP = async (
	data: VerifyOTPRequest,
): Promise<VerifyOTPResponse> => {
	try {
		const response = await apiService.post(
			"/transactions/verify-otp",
			data,
		);
		return response.data;
	} catch (error: any) {
		throw error.response?.data || error;
	}
};
