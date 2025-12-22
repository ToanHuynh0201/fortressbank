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
export { cardService, default as CardService } from "./cardService";
export {
	userPreferenceService,
	default as UserPreferenceService,
} from "./userPreferenceService";
export {
	firebaseMessagingService,
	default as FirebaseMessagingService,
} from "./firebaseMessagingService";

export type {
	TransferRequest,
	TransferResponse,
	VerifyOTPRequest,
	VerifyOTPResponse,
	Transaction,
	AccountLookupResponse,
	AccountLookupData,
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

export type {
	UserPreference,
	UpsertUserPreferenceRequest,
	UserPreferenceResponse,
} from "./userPreferenceService";
