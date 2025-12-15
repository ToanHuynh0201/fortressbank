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
	 * Change account PIN
	 */
	changeAccountPIN = withErrorHandling(
		async (accountId: string, oldPin: string, newPin: string) => {
			const response = await api.put(`/accounts/${accountId}/pin`, {
				oldPin,
				newPin,
			});

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
}

export const accountService = new AccountService();
export default accountService;
