import api from "@/lib/api";
import { withErrorHandling } from "@/utils/error";
import type { Card, GetCardsResponse } from "@/types/card";

/**
 * Card Service
 * Handles all card-related API calls
 */

class CardService {
	/**
	 * Get all cards for a specific account
	 * @param accountId - The account ID to fetch cards for
	 * @returns Promise with cards data
	 */
	getCardsByAccountId = withErrorHandling(async (accountId: string) => {
		const response = await api.get(`/cards/account/${accountId}`);
		return response;
	});

	/**
	 * Toggle lock/unlock status of a card
	 * @param cardId - The card ID to toggle lock status
	 * @returns Promise with response data
	 */
	toggleLock = withErrorHandling(async (cardId: string) => {
		const response = await api.post(`/cards/${cardId}/toggle-lock`, {});
		return response;
	});
}

export const cardService = new CardService();
export default cardService;
