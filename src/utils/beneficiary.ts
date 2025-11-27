import { getStorageItem, setStorageItem } from "./storage";
import { BENEFICIARY_CONFIG } from "@/constants";
import { Beneficiary, BeneficiaryFormData } from "@/types/beneficiary";

/**
 * Utility functions for managing beneficiaries
 */

/**
 * Get all beneficiaries from storage
 * @returns {Promise<Beneficiary[]>} Array of beneficiaries
 */
export const getAllBeneficiaries = async (): Promise<Beneficiary[]> => {
	try {
		const beneficiaries = await getStorageItem(
			BENEFICIARY_CONFIG.STORAGE_KEY,
			[],
		);
		// Sort by most recently updated
		return beneficiaries.sort(
			(a: Beneficiary, b: Beneficiary) => b.updatedAt - a.updatedAt,
		);
	} catch (error) {
		console.error("Error getting beneficiaries:", error);
		return [];
	}
};

/**
 * Get a beneficiary by ID
 * @param {string} id - Beneficiary ID
 * @returns {Promise<Beneficiary | null>} Beneficiary or null
 */
export const getBeneficiaryById = async (
	id: string,
): Promise<Beneficiary | null> => {
	try {
		const beneficiaries = await getAllBeneficiaries();
		return beneficiaries.find((b) => b.id === id) || null;
	} catch (error) {
		console.error("Error getting beneficiary by ID:", error);
		return null;
	}
};

/**
 * Search beneficiaries by account number or name
 * @param {string} query - Search query
 * @returns {Promise<Beneficiary[]>} Matching beneficiaries
 */
export const searchBeneficiaries = async (
	query: string,
): Promise<Beneficiary[]> => {
	try {
		const beneficiaries = await getAllBeneficiaries();
		const lowerQuery = query.toLowerCase();

		return beneficiaries.filter(
			(b) =>
				b.accountNumber.includes(query) ||
				b.accountName.toLowerCase().includes(lowerQuery) ||
				(b.nickname && b.nickname.toLowerCase().includes(lowerQuery)) ||
				(b.bankName && b.bankName.toLowerCase().includes(lowerQuery)),
		);
	} catch (error) {
		console.error("Error searching beneficiaries:", error);
		return [];
	}
};

/**
 * Add a new beneficiary
 * @param {BeneficiaryFormData} data - Beneficiary data
 * @returns {Promise<Beneficiary | null>} Created beneficiary or null
 */
export const addBeneficiary = async (
	data: BeneficiaryFormData,
): Promise<Beneficiary | null> => {
	try {
		const beneficiaries = await getAllBeneficiaries();

		// Check if account already exists
		const exists = beneficiaries.some(
			(b) => b.accountNumber === data.accountNumber,
		);

		if (exists) {
			throw new Error(
				"Beneficiary with this account number already exists",
			);
		}

		const now = Date.now();
		const newBeneficiary: Beneficiary = {
			id: `ben_${now}_${Math.random().toString(36).substr(2, 9)}`,
			accountNumber: data.accountNumber,
			accountName: data.accountName,
			bankName: data.bankName || "FortressBank",
			nickname: data.nickname,
			createdAt: now,
			updatedAt: now,
		};

		const updatedBeneficiaries = [newBeneficiary, ...beneficiaries];
		await setStorageItem(
			BENEFICIARY_CONFIG.STORAGE_KEY,
			updatedBeneficiaries,
		);

		return newBeneficiary;
	} catch (error) {
		console.error("Error adding beneficiary:", error);
		throw error;
	}
};

/**
 * Update an existing beneficiary
 * @param {string} id - Beneficiary ID
 * @param {Partial<BeneficiaryFormData>} data - Updated data
 * @returns {Promise<Beneficiary | null>} Updated beneficiary or null
 */
export const updateBeneficiary = async (
	id: string,
	data: Partial<BeneficiaryFormData>,
): Promise<Beneficiary | null> => {
	try {
		const beneficiaries = await getAllBeneficiaries();
		const index = beneficiaries.findIndex((b) => b.id === id);

		if (index === -1) {
			throw new Error("Beneficiary not found");
		}

		// Check if updating account number to an existing one
		if (
			data.accountNumber &&
			data.accountNumber !== beneficiaries[index].accountNumber
		) {
			const exists = beneficiaries.some(
				(b) => b.accountNumber === data.accountNumber && b.id !== id,
			);
			if (exists) {
				throw new Error(
					"Beneficiary with this account number already exists",
				);
			}
		}

		const updatedBeneficiary: Beneficiary = {
			...beneficiaries[index],
			...data,
			updatedAt: Date.now(),
		};

		beneficiaries[index] = updatedBeneficiary;
		await setStorageItem(BENEFICIARY_CONFIG.STORAGE_KEY, beneficiaries);

		return updatedBeneficiary;
	} catch (error) {
		console.error("Error updating beneficiary:", error);
		throw error;
	}
};

/**
 * Delete a beneficiary
 * @param {string} id - Beneficiary ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteBeneficiary = async (id: string): Promise<boolean> => {
	try {
		const beneficiaries = await getAllBeneficiaries();
		const filtered = beneficiaries.filter((b) => b.id !== id);

		if (filtered.length === beneficiaries.length) {
			throw new Error("Beneficiary not found");
		}

		await setStorageItem(BENEFICIARY_CONFIG.STORAGE_KEY, filtered);
		return true;
	} catch (error) {
		console.error("Error deleting beneficiary:", error);
		throw error;
	}
};

/**
 * Check if account number exists in beneficiaries
 * @param {string} accountNumber - Account number to check
 * @returns {Promise<Beneficiary | null>} Beneficiary if exists, null otherwise
 */
export const findBeneficiaryByAccount = async (
	accountNumber: string,
): Promise<Beneficiary | null> => {
	try {
		const beneficiaries = await getAllBeneficiaries();
		return (
			beneficiaries.find((b) => b.accountNumber === accountNumber) || null
		);
	} catch (error) {
		console.error("Error finding beneficiary by account:", error);
		return null;
	}
};
