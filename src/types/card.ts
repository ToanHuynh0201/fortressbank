/**
 * Card Types
 * Types for card-related data and API responses
 */

export interface Card {
	cardId: string;
	cardNumber: string;
	cardHolderName: string;
	expirationDate: string;
	status: "ACTIVE" | "LOCKED" | "EXPIRED";
	cardType: "VIRTUAL" | "PHYSICAL";
}

export interface GetCardsResponse {
	code: number;
	message: string;
	data: Card[];
}
