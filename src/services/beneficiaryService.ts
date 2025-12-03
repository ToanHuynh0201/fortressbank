import apiService from '@/lib/api';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage';

/**
 * Beneficiary Service
 * Handles all beneficiary-related operations
 */

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName?: string;
  bankCode?: string;
  nickname?: string;
  createdAt: string;
}

export interface CreateBeneficiaryRequest {
  name: string;
  accountNumber: string;
  bankName?: string;
  bankCode?: string;
  nickname?: string;
}

class BeneficiaryService {
  /**
   * Get all beneficiaries
   */
  async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      // Try to get from server first
      const response = await apiService.get('/beneficiaries');

      if (response.data.status === 'success') {
        // Cache locally
        await setStorageItem(STORAGE_KEYS.BENEFICIARIES, response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.warn('Failed to fetch beneficiaries from server, using local cache');
    }

    // Fallback to local storage
    const localBeneficiaries = await getStorageItem(STORAGE_KEYS.BENEFICIARIES, []);
    return localBeneficiaries;
  }

  /**
   * Get beneficiary by ID
   */
  async getBeneficiaryById(id: string): Promise<Beneficiary | null> {
    try {
      const response = await apiService.get(`/beneficiaries/${id}`);
      return response.data.data;
    } catch (error) {
      // Fallback to local storage
      const beneficiaries = await this.getBeneficiaries();
      return beneficiaries.find(b => b.id === id) || null;
    }
  }

  /**
   * Add new beneficiary
   */
  async addBeneficiary(data: CreateBeneficiaryRequest): Promise<Beneficiary> {
    try {
      const response = await apiService.post('/beneficiaries', data);

      if (response.data.status === 'success') {
        // Update local cache
        const beneficiaries = await this.getBeneficiaries();
        beneficiaries.push(response.data.data);
        await setStorageItem(STORAGE_KEYS.BENEFICIARIES, beneficiaries);

        return response.data.data;
      }
    } catch (error) {
      console.warn('Failed to add beneficiary to server, saving locally');
    }

    // Fallback: Save locally
    const newBeneficiary: Beneficiary = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    const beneficiaries = await this.getBeneficiaries();
    beneficiaries.push(newBeneficiary);
    await setStorageItem(STORAGE_KEYS.BENEFICIARIES, beneficiaries);

    return newBeneficiary;
  }

  /**
   * Update beneficiary
   */
  async updateBeneficiary(id: string, data: Partial<CreateBeneficiaryRequest>): Promise<Beneficiary> {
    try {
      const response = await apiService.patch(
        `/beneficiaries/${id}`,
        data
      );

      if (response.data.status === 'success') {
        // Update local cache
        const beneficiaries = await this.getBeneficiaries();
        const index = beneficiaries.findIndex(b => b.id === id);

        if (index !== -1) {
          beneficiaries[index] = response.data.data;
          await setStorageItem(STORAGE_KEYS.BENEFICIARIES, beneficiaries);
        }

        return response.data.data;
      }
    } catch (error) {
      console.warn('Failed to update beneficiary on server, updating locally');
    }

    // Fallback: Update locally
    const beneficiaries = await this.getBeneficiaries();
    const index = beneficiaries.findIndex(b => b.id === id);

    if (index !== -1) {
      beneficiaries[index] = { ...beneficiaries[index], ...data };
      await setStorageItem(STORAGE_KEYS.BENEFICIARIES, beneficiaries);
      return beneficiaries[index];
    }

    throw new Error('Beneficiary not found');
  }

  /**
   * Delete beneficiary
   */
  async deleteBeneficiary(id: string): Promise<void> {
    try {
      await apiService.delete(`/beneficiaries/${id}`);
    } catch (error) {
      console.warn('Failed to delete beneficiary from server, deleting locally');
    }

    // Delete from local storage
    const beneficiaries = await this.getBeneficiaries();
    const filtered = beneficiaries.filter(b => b.id !== id);
    await setStorageItem(STORAGE_KEYS.BENEFICIARIES, filtered);
  }

  /**
   * Search beneficiaries by name or account number
   */
  async searchBeneficiaries(query: string): Promise<Beneficiary[]> {
    const beneficiaries = await this.getBeneficiaries();
    const lowerQuery = query.toLowerCase();

    return beneficiaries.filter(
      b =>
        b.name.toLowerCase().includes(lowerQuery) ||
        b.accountNumber.includes(query) ||
        b.nickname?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Check if account number exists in beneficiaries
   */
  async isBeneficiary(accountNumber: string): Promise<boolean> {
    const beneficiaries = await this.getBeneficiaries();
    return beneficiaries.some(b => b.accountNumber === accountNumber);
  }
}

export const beneficiaryService = new BeneficiaryService();
export default beneficiaryService;
