import apiService from '@/lib/api';
import { withErrorHandling } from '@/utils/error';

/**
 * Transfer Service
 * Handles all transfer and transaction-related API calls
 */

export interface TransferRequest {
  senderAccountId: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  transactionType: 'INTERNAL_TRANSFER' | 'EXTERNAL_TRANSFER';
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
    transactionType: 'INTERNAL_TRANSFER' | 'EXTERNAL_TRANSFER';
    status: 'PENDING_OTP';
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

export interface VerifyOTPResponse {
  code: number;
  message: string;
  data: Transaction;
}

// Complete account lookup data from API
export interface AccountLookupData {
  accountId: string;
  userId: string;
  balance: number;
  createdAt: string;
  accountNumber: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'CLOSED';
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
  type?: 'SENT' | 'RECEIVED' | 'ALL';
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
   * Look up account details by account number
   * Returns complete account information including accountId needed for transfers
   */
  lookupAccount = withErrorHandling(async (accountNumber: string) => {
    const response = await apiService.get('/accounts/lookup', {
      params: { accountNumber }
    });
    return response;
  });

  /**
   * Validate transfer before processing
   */
  async validateTransfer(data: Omit<TransferRequest, 'description' | 'senderAccountNumber'>): Promise<{ success: boolean; error?: string }> {
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
   * Get transaction history for a specific account
   */
  async getTransactionHistory(accountNumber: string, params?: TransactionHistoryParams): Promise<TransactionHistoryResponse> {
    const queryParams = new URLSearchParams();

    // Always include offset, limit, and type params (even for ALL)
    queryParams.append('offset', (params?.offset ?? 0).toString());
    queryParams.append('limit', (params?.limit ?? 20).toString());
    queryParams.append('type', params?.type ?? 'ALL');

    const url = `/transactions/${accountNumber}/history?${queryParams.toString()}`;
    const response = await apiService.get(url);
    return response.data;
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(txId: string): Promise<{ code: number; message: string; data: Transaction }> {
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
