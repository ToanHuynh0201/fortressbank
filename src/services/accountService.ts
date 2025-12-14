import api from "@/lib/api";
import { withErrorHandling } from "@/utils/error";

/**
 * Account Service
 * Handles all account-related API calls
 */

export interface Account {
	accountId: string;
	userId: string;
	balance: number;
	createdAt: string;
	accountNumber: string;
	accountStatus: string;
}

export interface Card {
	id: string;
	cardNumber: string;
	cardHolder: string;
	cardType: "DEBIT" | "CREDIT";
	cardBrand: "VISA" | "MASTERCARD" | "AMERICAN_EXPRESS";
	expiryDate: string;
	status: "ACTIVE" | "BLOCKED" | "EXPIRED";
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
	getAccounts = withErrorHandling(async () => {
		const response = await api.get("/accounts");
		return response;
	});

	/**
	 * Create new account
	 */
	createAccount = withErrorHandling(
		async (data: {
			accountNumberType: "PHONE_NUMBER" | "AUTO_GENERATE";
			pin: string;
		}) => {
			const response = await api.post("/accounts", data);
			return response;
		},
	);

	/**
	 * Get account by ID
	 */
	async getAccountById(
		accountId: string,
	): Promise<{ status: string; data: Account }> {
		const response = await api.get(`/accounts/${accountId}`);
		return response.data;
	}

	/**
	 * Get account balance
	 */
	async getAccountBalance(
		accountId: string,
	): Promise<{ status: string; data: AccountBalance }> {
		const response = await api.get(`/accounts/${accountId}/balance`);
		return response.data;
	}

	/**
	 * Get account statement
	 */
	async getAccountStatement(
		accountId: string,
		startDate: string,
		endDate: string,
	): Promise<{ status: string; data: AccountStatement }> {
		const response = await api.get(
			`/accounts/${accountId}/statement?startDate=${startDate}&endDate=${endDate}`,
		);
		return response.data;
	}

	/**
	 * Get all user cards
	 */
	async getCards(): Promise<{ status: string; data: Card[] }> {
		const response = await api.get("/cards");
		return response.data;
	}

	/**
	 * Get card by ID
	 */
	async getCardById(cardId: string): Promise<{ status: string; data: Card }> {
		const response = await api.get(`/cards/${cardId}`);
		return response.data;
	}

	/**
	 * Block/freeze card
	 */
	async blockCard(
		cardId: string,
	): Promise<{ status: string; message: string }> {
		const response = await api.post(`/cards/${cardId}/block`, {});
		return response.data;
	}

	/**
	 * Unblock card
	 */
	async unblockCard(
		cardId: string,
	): Promise<{ status: string; message: string }> {
		const response = await api.post(`/cards/${cardId}/unblock`, {});
		return response.data;
	}

	/**
	 * Delete/cancel card
	 */
	async deleteCard(
		cardId: string,
	): Promise<{ status: string; message: string }> {
		const response = await api.delete(`/cards/${cardId}`);
		return response.data;
	}

	/**
	 * Request new card
	 */
	async requestCard(data: {
		accountId: string;
		cardType: "DEBIT" | "CREDIT";
		deliveryAddress: string;
	}): Promise<{ status: string; data: Card }> {
		const response = await api.post("/cards/request", data);
		return response.data;
	}

	/**
	 * Update card PIN
	 */
	async updateCardPin(
		cardId: string,
		oldPin: string,
		newPin: string,
	): Promise<any> {
		const response = await api.post(`/cards/${cardId}/update-pin`, {
			oldPin,
			newPin,
		});

		return response;
	}

	/**
	 * Change account PIN
	 */
	changeAccountPIN = withErrorHandling(
		async (accountId: string, oldPin: string, newPin: string) => {
			const response = await api.put(`/accounts/${accountId}/pin`, {
				oldPin,
				newPin,
			});

			console.log("CHANGE_PIN", response);
			return response;
		},
	);

	/**
	 * Verify account PIN
	 */
	async verifyAccountPIN(
		accountId: string,
		pin: string,
	): Promise<{ status: string; message: string }> {
		const response = await api.post(`/accounts/${accountId}/verify-pin`, {
			pin,
		});
		return response.data;
	}

	/**
	 * Set card limit
	 */
	async setCardLimit(
		cardId: string,
		limit: number,
	): Promise<{ status: string; message: string }> {
		const response = await api.post(`/cards/${cardId}/set-limit`, {
			limit,
		});
		return response.data;
	}
}

export const accountService = new AccountService();
export default accountService;
