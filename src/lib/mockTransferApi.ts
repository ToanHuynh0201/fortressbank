/**
 * Mock API service for transfer operations
 * This simulates API calls until real endpoints are available
 */

// Mock database of account holders
const mockAccountHolders: Record<string, string> = {
  '1234567890': 'Nguyễn Văn A',
  '0987654321': 'Trần Thị B',
  '1111222233': 'Lê Văn C',
  '4444555566': 'Phạm Thị D',
  '7777888899': 'Hoàng Văn E',
  '1234123412': 'Vũ Thị F',
  '9876987698': 'Đặng Văn G',
  '5555666677': 'Bùi Thị H',
};

/**
 * Simulated network delay
 */
const simulateNetworkDelay = (min = 300, max = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Mock API: Get beneficiary name by account number
 * @param {string} accountNumber - Account number to lookup
 * @returns {Promise<{success: boolean, data?: {name: string, accountNumber: string}, error?: string}>}
 */
export const getBeneficiaryName = async (
  accountNumber: string
): Promise<{
  success: boolean;
  data?: { name: string; accountNumber: string };
  error?: string;
}> => {
  try {
    // Simulate network delay
    await simulateNetworkDelay();
    
    // Clean account number (remove spaces and special characters)
    const cleanedAccountNumber = accountNumber.replace(/\s/g, '');
    
    // Validate account number format
    if (!/^\d{10,12}$/.test(cleanedAccountNumber)) {
      return {
        success: false,
        error: 'Invalid account number format',
      };
    }
    
    // Look up account holder
    const name = mockAccountHolders[cleanedAccountNumber];
    
    if (!name) {
      return {
        success: false,
        error: 'Account number not found',
      };
    }
    
    return {
      success: true,
      data: {
        name,
        accountNumber: cleanedAccountNumber,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch beneficiary information',
    };
  }
};

/**
 * Mock API: Validate transfer
 * @param {object} transferData - Transfer details
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const validateTransfer = async (transferData: {
  fromAccount: string;
  toAccount: string;
  amount: number;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    await simulateNetworkDelay(200, 500);
    
    // Validate accounts are different
    if (transferData.fromAccount === transferData.toAccount) {
      return {
        success: false,
        error: 'Cannot transfer to the same account',
      };
    }
    
    // Validate amount
    if (transferData.amount <= 0) {
      return {
        success: false,
        error: 'Transfer amount must be greater than 0',
      };
    }
    
    // Mock balance check (simplified)
    if (transferData.amount > 1000000) {
      return {
        success: false,
        error: 'Insufficient balance',
      };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to validate transfer',
    };
  }
};

/**
 * Add a new mock account holder (for testing)
 */
export const addMockAccountHolder = (accountNumber: string, name: string): void => {
  mockAccountHolders[accountNumber] = name;
};
