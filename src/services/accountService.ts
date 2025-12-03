import apiService from '@/lib/api';

/**
 * Account Service
 * Handles all account-related API calls
 */

export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  cardNumber: string;
  cardHolder: string;
  cardType: 'DEBIT' | 'CREDIT';
  cardBrand: 'VISA' | 'MASTERCARD' | 'AMERICAN_EXPRESS';
  expiryDate: string;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
  cardLimit?: number;
  availableCredit?: number;
  createdAt: string;
}

export interface AccountBalance {
  accountId: string;
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  currency: string;
}

export interface AccountStatement {
  accountId: string;
  transactions: Array<{
    date: string;
    description: string;
    debit?: number;
    credit?: number;
    balance: number;
  }>;
  startDate: string;
  endDate: string;
}

class AccountService {
  /**
   * Get all user accounts
   */
  async getAccounts(): Promise<{ status: string; data: Account[] }> {
    const response = await apiService.get('/accounts');
    return response.data;
  }

  /**
   * Get account by ID
   */
  async getAccountById(accountId: string): Promise<{ status: string; data: Account }> {
    const response = await apiService.get(`/accounts/${accountId}`);
    return response.data;
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<{ status: string; data: AccountBalance }> {
    const response = await apiService.get(`/accounts/${accountId}/balance`);
    return response.data;
  }

  /**
   * Get account statement
   */
  async getAccountStatement(
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<{ status: string; data: AccountStatement }> {
    const response = await apiService.get(
      `/accounts/${accountId}/statement?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  /**
   * Get all user cards
   */
  async getCards(): Promise<{ status: string; data: Card[] }> {
    const response = await apiService.get('/cards');
    return response.data;
  }

  /**
   * Get card by ID
   */
  async getCardById(cardId: string): Promise<{ status: string; data: Card }> {
    const response = await apiService.get(`/cards/${cardId}`);
    return response.data;
  }

  /**
   * Block/freeze card
   */
  async blockCard(cardId: string): Promise<{ status: string; message: string }> {
    const response = await apiService.post(`/cards/${cardId}/block`, {});
    return response.data;
  }

  /**
   * Unblock card
   */
  async unblockCard(cardId: string): Promise<{ status: string; message: string }> {
    const response = await apiService.post(`/cards/${cardId}/unblock`, {});
    return response.data;
  }

  /**
   * Delete/cancel card
   */
  async deleteCard(cardId: string): Promise<{ status: string; message: string }> {
    const response = await apiService.delete(`/cards/${cardId}`);
    return response.data;
  }

  /**
   * Request new card
   */
  async requestCard(data: {
    accountId: string;
    cardType: 'DEBIT' | 'CREDIT';
    deliveryAddress: string;
  }): Promise<{ status: string; data: Card }> {
    const response = await apiService.post('/cards/request', data);
    return response.data;
  }

  /**
   * Update card PIN
   */
  async updateCardPin(cardId: string, oldPin: string, newPin: string): Promise<{ status: string; message: string }> {
    const response = await apiService.post(`/cards/${cardId}/update-pin`, {
      oldPin,
      newPin,
    });
    return response.data;
  }

  /**
   * Set card limit
   */
  async setCardLimit(cardId: string, limit: number): Promise<{ status: string; message: string }> {
    const response = await apiService.post(`/cards/${cardId}/set-limit`, {
      limit,
    });
    return response.data;
  }
}

export const accountService = new AccountService();
export default accountService;
