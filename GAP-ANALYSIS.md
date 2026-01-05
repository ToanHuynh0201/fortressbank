# Frontend-Backend Gap Analysis: Security Features

**Date:** January 5, 2026
**Status:** 🔴 CRITICAL GAPS DETECTED
**Scope:** Mobile App (React Native) integration with Backend Smart OTP & Risk Engine

---

## 1. Overview
The backend (BE) has been significantly upgraded with a "Smart OTP" system (Vietnamese e-banking style) and enhanced Risk Engine (velocity tracking). The frontend (FE) is currently using legacy logic and endpoints, rendering it incompatible with the new security requirements for Medium and High-risk transactions.

| Feature | Backend Status (New) | Frontend Status (Current) | Gap Severity |
| :--- | :--- | :--- | :--- |
| **Smart OTP** | Implemented (`DEVICE_BIO`, `FACE_VERIFY`) | Missing / Legacy | 🔴 CRITICAL |
| **Risk Engine** | Returns `challengeType` + `challengeId` | Expects `requireFaceAuth` boolean | 🔴 CRITICAL |
| **Device Bio** | Requires Key Pair & Signature | Missing (Local Auth only) | 🔴 CRITICAL |
| **Face Verify** | Endpoint: `/smart-otp/verify-face` | Endpoint: `/users/me/verify-transaction` | 🔴 CRITICAL |
| **Velocity** | Rule 7 (Daily limit check) | Transparent (but triggers Med Risk) | 🟡 MEDIUM |

---

## 2. Detailed Gap Analysis

### 2.1. Transaction Creation & Response Handling
*   **Backend Expectation:**
    *   `POST /transactions/transfers` returns a `TransactionResponse`.
    *   **Response Fields:** `status` (PENDING_SMART_OTP, PENDING_OTP), `challengeType` ("DEVICE_BIO", "FACE_VERIFY", "SMS_OTP", "NONE"), `challengeId` (UUID), `challengeData` (random bytes for signing).
*   **Frontend Reality (`transferConfirmation.tsx`):**
    *   Checks only `response.data.requireFaceAuth` (boolean).
    *   Routes to `faceVerification` if true, otherwise `pinVerification`.
    *   **Impact:** FE fails to recognize `DEVICE_BIO` or the new enum-based challenge types. It blindly defaults to PIN/SMS flow, which will fail if BE expects a biometric signature.

### 2.2. Smart OTP (Device Biometric)
*   **Backend Expectation:**
    *   **Registration:** `POST /devices/register` with public key (RSA/EC).
    *   **Verification:** `POST /transactions/verify-device` with `transactionId`, `deviceId`, and `signature` (signed `challengeData`).
    *   **Flow:** User sees "Confirm with Fingerprint" -> App signs challenge with private key -> Sends signature.
*   **Frontend Reality (`biometricService.ts`):**
    *   Uses `expo-local-authentication` only for local unlocking.
    *   **No Cryptography:** No key generation, no keystore management, no signing logic.
    *   **No Registration:** No API call to register devices.
    *   **Impact:** "Medium Risk" transactions (which now trigger `DEVICE_BIO`) are impossible to complete.

### 2.3. Face Verification
*   **Backend Expectation:**
    *   **Endpoint:** `POST /smart-otp/verify-face` (via `TransactionController` wrapper `/transactions/verify-face`).
    *   **Payload:** `transactionId`, `files` (multipart).
    *   **Flow:** High risk -> `FACE_VERIFY` challenge -> App captures photo -> Backend validates -> Transaction completes.
*   **Frontend Reality (`faceVerification.tsx`):**
    *   **Endpoint:** Calls `transferService.verifyTransactionWithFace` -> `/users/me/verify-transaction` (Legacy/Deprecated).
    *   **Flow:** Success -> Navigates to `otpVerification`.
    *   **Impact:** High risk transactions will fail due to 404 or wrong logic (BE expects face verify to *complete* the transaction or move to next step, not just gatekeep OTP).

### 2.4. OTP Verification
*   **Backend Expectation:**
    *   `/transactions/verify-otp` is **strictly** for SMS OTP.
    *   Calling it for a transaction in `PENDING_SMART_OTP` state throws `BAD_REQUEST`.
*   **Frontend Reality (`otpVerification.tsx`):**
    *   Used as a catch-all fallback.
    *   **Impact:** If a transaction is `DEVICE_BIO` but FE treats it as "Not Face Auth", it falls back to PIN -> OTP. The `verify-otp` call will fail because the transaction expects a signature, not an OTP code.

---

## 3. Action Plan (Frontend Upgrade)

### Phase 1: Foundation (Cryptography & Types)
1.  **Update Types:** Update `TransferResponse` to include `challengeType`, `challengeId`, `challengeData`.
2.  **Crypto Service:** Implement `DeviceService` to handle:
    *   Key pair generation (RSA/EC) using `expo-secure-store` or similar (requires native module or polyfill if Expo doesn't support key generation natively - might need `expo-crypto` or similar). *Correction: `expo-secure-store` stores strings. We need a library for Key generation/Signing.*
    *   **Note:** React Native environment might need `react-native-biometrics` (which supports creating keys) instead of just `expo-local-authentication`.

### Phase 2: Device Registration
1.  **UI:** Add "Trusted Devices" section in Settings.
2.  **Logic:** Call `POST /devices/register` with generated Public Key.

### Phase 3: Transaction Flow Upgrade
1.  **Routing:** Update `transferConfirmation.tsx` to switch based on `challengeType`:
    *   `DEVICE_BIO` -> New `DeviceBioVerification` screen (or modal).
    *   `FACE_VERIFY` -> Updated `FaceVerification` screen.
    *   `SMS_OTP` -> Existing `OTPVerification`.
    *   `NONE` -> Success.
2.  **Device Bio Screen:**
    *   Prompt user: "Confirm transaction of $X with TouchID/FaceID".
    *   On auth success: Sign `challengeData` -> Call `POST /transactions/verify-device`.
3.  **Face Verify Screen:**
    *   Update API call to `/transactions/verify-face`.

---

## 4. Technical Recommendations
*   **Library:** Evaluate `react-native-biometrics` (supports `createKeys`, `signPayload`). `expo-local-authentication` is insufficient for "Smart OTP" as it doesn't provide cryptographic signatures.
*   **Type Safety:** Strictly type the `challengeType` enum to match BE.

---
*Generated by Gemini Agent for FortressBank Team*
