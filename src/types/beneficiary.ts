/**
 * Beneficiary type definitions
 */

export interface Beneficiary {
	id: string;
	accountNumber: string;
	accountName: string;
	bankName?: string;
	nickname?: string;
	createdAt: number;
	updatedAt: number;
}

export interface BeneficiaryFormData {
	accountNumber: string;
	accountName: string;
	bankName?: string;
	nickname?: string;
}
