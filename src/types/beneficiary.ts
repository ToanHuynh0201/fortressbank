/**
 * Beneficiary type definitions
 */

export interface Beneficiary {
	id: number;
	ownerId: string;
	accountNumber: string;
	accountName: string;
	bankName: string;
	nickName: string;
}

export interface BeneficiaryFormData {
	accountNumber: string;
	bankName: string;
	nickName: string;
}

export interface UpdateBeneficiaryRequest {
	nickName: string;
}
