/**
 * Services Index
 * Central export point for all API services
 */

// Services
export * from "./authService";
export * from "./biometricService";
export { transferService, default as TransferService } from "./transferService";
export { accountService, default as AccountService } from "./accountService";
export {
	beneficiaryService,
	default as BeneficiaryService,
} from "./beneficiaryService";

export type {
	TransferRequest,
	TransferResponse,
	VerifyOTPRequest,
	VerifyOTPResponse,
	Transaction,
	BeneficiaryNameResponse,
	TransactionHistoryParams,
	TransactionHistoryResponse,
} from "./transferService";

export type {
	Account,
	Card,
	AccountBalance,
	AccountStatement,
} from "./accountService";

export type {
	Beneficiary,
	CreateBeneficiaryRequest,
} from "./beneficiaryService";
