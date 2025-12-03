import apiService from '@/lib/api';

/**
 * Transfer Service
 * Handles all transfer and transaction-related API calls
 */

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  type: 'INTERNAL_TRANSFER' | 'EXTERNAL_TRANSFER';
  description?: string;
}

export interface TransferResponse {
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

export interface Transaction {
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
  completedAt: string | null;
  failureReason: string | null;
}

export interface VerifyOTPResponse {
  status: string;
  data: Transaction;
}

export interface BeneficiaryNameResponse {
  success: boolean;
  data?: {
    name: string;
    accountNumber: string;
  };
  error?: string;
}

export interface TransactionHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
}

export interface TransactionHistoryResponse {
  status: string;
  data: {
    transactions: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

class TransferService {
  /**
   * Create a new transfer transaction
   */
  async createTransfer(data: TransferRequest): Promise<TransferResponse> {
    const response = await apiService.post('/transactions/transfers', data);
    return response.data;
  }

  /**
   * Verify OTP for a pending transaction
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await apiService.post('/transactions/verify-otp', data);
    return response.data;
  }

  /**
   * Get beneficiary name by account number
   */
  async getBeneficiaryName(accountNumber: string): Promise<BeneficiaryNameResponse> {
    try {
      const response = await apiService.get(`/accounts/lookup/${accountNumber}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch beneficiary information',
      };
    }
  }

  /**
   * Validate transfer before processing
   */
  async validateTransfer(data: Omit<TransferRequest, 'description'>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.post('/transactions/validate', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to validate transfer',
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(params?: TransactionHistoryParams): Promise<TransactionHistoryResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const url = `/transactions/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get(url);
    return response.data;
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(txId: string): Promise<{ status: string; data: Transaction }> {
    const response = await apiService.get(`/transactions/${txId}`);
    return response.data;
  }

  /**
   * Cancel pending transaction
   */
  async cancelTransaction(txId: string): Promise<{ status: string; message: string }> {
    const response = await apiService.post(`/transactions/${txId}/cancel`, {});
    return response.data;
  }

  /**
   * Resend OTP for transaction
   */
  async resendOTP(txId: string): Promise<{ status: string; message: string }> {
    const response = await apiService.post(`/transactions/${txId}/resend-otp`, {});
    return response.data;
  }

  /**
   * Get transaction receipt/details for printing
   */
  async getTransactionReceipt(txId: string): Promise<{ status: string; data: Transaction }> {
    const response = await apiService.get(`/transactions/${txId}/receipt`);
    return response.data;
  }
}

export const transferService = new TransferService();
export default transferService;
