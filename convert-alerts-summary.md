# Alert to AlertModal/ConfirmationModal Conversion Summary

## Completed Files (5/10):
✅ 1. src/app/(home)/index.tsx - 1 Alert → AlertModal
✅ 2. src/app/(home)/qrScanner.tsx - 4 Alerts → AlertModal + ConfirmationModal
✅ 3. src/app/(auth)/signIn.tsx - 2 Alerts with buttons → ConfirmationModal + AlertModal
✅ 4. src/app/(auth)/signUp.tsx - 9 Alerts → AlertModal
✅ 5. src/app/(auth)/changePassword.tsx - 5 Alerts → AlertModal

## Remaining Files (5/10):

### 6. src/app/(auth)/changePIN.tsx - 8 Alerts
Lines: 52, 71, 76, 81, 86, 93, 108, 111
- Remove Alert from imports
- Import AlertModal
- Add alertModal state
- Replace all Alert.alert() with setAlertModal()
- Add <AlertModal /> before </ScreenContainer>

### 7. src/app/(auth)/forgotPassword.tsx - 5 Alerts
Lines: 38, 55, 60, 70, 74, 79
- Remove Alert from imports
- Import AlertModal + ConfirmationModal
- Add alertModal state
- Replace Alert.alert() with setAlertModal()
- Line 79 has buttons → use ConfirmationModal
- Add modals before </ScreenContainer>

### 8. src/app/(transfer)/transferConfirmation.tsx - 2 Alerts
Lines: 136, 140
- Remove Alert from imports
- Import AlertModal
- Add alertModal state
- Replace Alert.alert() with setAlertModal()
- Add <AlertModal /> before </ScreenContainer>

### 9. src/app/(transfer)/pinVerification.tsx - 6 Alerts (2 with buttons)
Lines: 68, 73, 78, 104, 127, 151
- Remove Alert from imports
- Import AlertModal + ConfirmationModal
- Add alertModal state + confirmModal state
- Lines with buttons (78, 104, 127, 151) → use ConfirmationModal
- Simple alerts → use AlertModal
- Add modals before </SafeAreaView>

### 10. src/app/(transfer)/otpVerification.tsx - 5 Alerts
Lines: 85, 88, 97, 102, 120, 124
- Remove Alert from imports
- Import AlertModal
- Add alertModal state
- Replace Alert.alert() with setAlertModal()
- Add <AlertModal /> before </SafeAreaView>

## Pattern for each file:

1. Remove `Alert` from react-native imports
2. Import `AlertModal` (and `ConfirmationModal` if needed) from @/components
3. Add state:
```typescript
const [alertModal, setAlertModal] = useState({
  visible: false,
  title: "",
  message: "",
  variant: "error" as "success" | "error" | "info" | "warning",
});
```
4. Replace Alert.alert():
```typescript
// From:
Alert.alert("Title", "Message");

// To:
setAlertModal({
  visible: true,
  title: "Title",
  message: "Message",
  variant: "error", // or "success", "info", "warning"
});
```
5. Add component before closing tag:
```tsx
<AlertModal
  visible={alertModal.visible}
  title={alertModal.title}
  message={alertModal.message}
  variant={alertModal.variant}
  onClose={() => setAlertModal({ ...alertModal, visible: false })}
/>
```

## For Alerts with buttons (ConfirmationModal):
```typescript
const [confirmModal, setConfirmModal] = useState({
  visible: false,
  title: "",
  message: "",
  onConfirm: () => {},
});
```

```tsx
<ConfirmationModal
  visible={confirmModal.visible}
  title={confirmModal.title}
  message={confirmModal.message}
  confirmText="Confirm"
  cancelText="Cancel"
  onConfirm={confirmModal.onConfirm}
  onCancel={() => setConfirmModal({ ...confirmModal, visible: false })}
/>
```
