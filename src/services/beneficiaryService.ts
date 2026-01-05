import apiService from "@/lib/api";
import {
	Beneficiary,
	BeneficiaryFormData,
	UpdateBeneficiaryRequest,
} from "@/types/beneficiary";

/**
 * Beneficiary Service
 * Handles all beneficiary-related operations with FortressBank API
 */

class BeneficiaryService {
	/**
	 * Get all beneficiaries
	 * GET /beneficiaries
	 */
	async getBeneficiaries(): Promise<Beneficiary[]> {
		const response = await apiService.get("/beneficiaries");

		if (response.data.code === 1000) {
			return response.data.data;
		}

		return [];
	}

	/**
	 * Get beneficiary by ID
	 */
	async getBeneficiaryById(id: number): Promise<Beneficiary | null> {
		const response = await apiService.get(`/beneficiaries/${id}`);

		if (response.data.code === 1000) {
			return response.data.data;
		}

		return null;
	}

	/**
	 * Add new beneficiary
	 * POST /beneficiaries
	 * Request: { accountNumber, accountName, bankName, nickName }
	 * Response: { code, message, data: Beneficiary }
	 */
	async addBeneficiary(
		data: BeneficiaryFormData,
	): Promise<Beneficiary | null> {
		const response = await apiService.post("/beneficiaries", data);

		if (response.data.code === 1000) {
			return response.data.data;
		}

		return null;
	}

	/**
	 * Update beneficiary nickname
	 * PUT /beneficiaries/{id}
	 * Request: { nickName }
	 * Response: { code, message, data: Beneficiary }
	 */
	async updateBeneficiary(
		id: number,
		data: UpdateBeneficiaryRequest,
	): Promise<Beneficiary | null> {
		const response = await apiService.put(`/beneficiaries/${id}`, data);

		if (response.data.code === 1000) {
			return response.data.data;
		}

		return null;
	}

	/**
	 * Delete beneficiary
	 * DELETE /beneficiaries/{id}
	 * No request body, no response body
	 */
	async deleteBeneficiary(id: number): Promise<void> {
		await apiService.delete(`/beneficiaries/${id}`);
	}

	/**
	 * Search beneficiaries by name, account number, or nickname
	 */
	async searchBeneficiaries(query: string): Promise<Beneficiary[]> {
		const beneficiaries = await this.getBeneficiaries();
		const lowerQuery = query.toLowerCase();

		return beneficiaries.filter(
			(b) =>
				b.accountName.toLowerCase().includes(lowerQuery) ||
				b.accountNumber.includes(query) ||
				b.nickName?.toLowerCase().includes(lowerQuery),
		);
	}

	/**
	 * Check if account number exists in beneficiaries
	 */
	async isBeneficiary(accountNumber: string): Promise<boolean> {
		const beneficiaries = await this.getBeneficiaries();
		return beneficiaries.some((b) => b.accountNumber === accountNumber);
	}
}

export const beneficiaryService = new BeneficiaryService();
export default beneficiaryService;
