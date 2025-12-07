# AuthContext - Cấu Trúc Mới

## 📁 Cấu trúc File

AuthContext đã được tách thành các file riêng biệt để dễ quản lý và maintain:

```
src/
├── types/
│   ├── auth.ts                    # ✨ Type definitions cho authentication
│   └── index.ts                   # Export tất cả types
├── contexts/
│   ├── auth/
│   │   ├── AuthContext.tsx        # ✨ React Context definition
│   │   ├── AuthProvider.tsx       # ✨ Provider component
│   │   └── index.ts               # Export auth context
│   ├── AuthContext.tsx            # ⚠️ Deprecated (backward compatibility)
│   └── index.ts                   # Export tất cả contexts
├── hooks/
│   ├── useAuth.ts                 # ✨ Custom hook
│   └── index.ts                   # Export tất cả hooks
└── services/
    └── authService.ts             # Auth API service (đã tồn tại)
```

---

## 📝 Chi Tiết Từng File

### 1. `src/types/auth.ts`

**Chức năng**: Định nghĩa tất cả TypeScript interfaces và types cho authentication

```typescript
export interface User {
	id: string;
	email: string;
	name: string;
	phone?: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
	phone?: string;
}

export interface LoginResponse {
	status: string;
	data: {
		accessToken: string;
		refreshToken: string;
		user: User;
	};
}

export interface AuthContextState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (credentials: LoginRequest) => Promise<void>;
	register: (data: RegisterRequest) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}
```

**Sử dụng**:

```typescript
import { User, LoginRequest, AuthContextState } from "@/types/auth";
// hoặc
import { User, LoginRequest, AuthContextState } from "@/types";
```

---

### 2. `src/contexts/auth/AuthContext.tsx`

**Chức năng**: Tạo React Context instance

```typescript
import { createContext } from "react";
import { AuthContextState } from "@/types/auth";

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export default AuthContext;
```

**File này**:

-   Chỉ tạo Context, không chứa logic
-   Nhỏ gọn, dễ test
-   Được sử dụng bởi AuthProvider và useAuth

---

### 3. `src/contexts/auth/AuthProvider.tsx`

**Chức năng**: Provider component chứa tất cả business logic

```typescript
import React, { useState, useEffect, ReactNode } from "react";
import AuthContext from "./AuthContext";
import authService from "@/services/authService";
import { User, LoginRequest, RegisterRequest } from "@/types/auth";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// ... all the logic

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
```

**Chứa**:

-   State management (user, isLoading)
-   Initialization logic
-   Auth methods (login, register, logout, refreshUser)
-   Helper functions (clearAuth, initializeAuth)

---

### 4. `src/hooks/useAuth.ts`

**Chức năng**: Custom hook để sử dụng AuthContext

```typescript
import { useContext } from "react";
import AuthContext from "@/contexts/auth/AuthContext";
import { AuthContextState } from "@/types/auth";

export const useAuth = (): AuthContextState => {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};
```

**Đặc điểm**:

-   Validation check (đảm bảo được dùng trong AuthProvider)
-   Type-safe
-   Có JSDoc với ví dụ sử dụng

---

### 5. `src/services/authService.ts`

**Chức năng**: Xử lý API calls (file này đã tồn tại, được update để import types)

```typescript
import apiService from "@/lib/api";
import {
	LoginRequest,
	RegisterRequest,
	LoginResponse,
	// ...
} from "@/types/auth";

class AuthService {
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		// API call
	}

	async register(data: RegisterRequest): Promise<LoginResponse> {
		// API call
	}

	async logout(): Promise<void> {
		// API call
	}
}
```

---

## 🔄 Cách Sử Dụng

### Import Statements

**Cách cũ** (vẫn hoạt động nhưng deprecated):

```typescript
import { useAuth, AuthProvider, User } from "@/contexts/AuthContext";
```

**Cách mới** (khuyến nghị):

```typescript
// Import types
import { User, LoginRequest } from "@/types/auth";

// Import Provider
import { AuthProvider } from "@/contexts/auth";

// Import hook
import { useAuth } from "@/hooks/useAuth";
// hoặc
import { useAuth } from "@/hooks";
```

### Setup trong App

```typescript
// app/_layout.tsx
import { AuthProvider } from "@/contexts/auth";

export default function RootLayout() {
	return (
		<AuthProvider>
			<Stack>
				<Stack.Screen name="index" />
			</Stack>
		</AuthProvider>
	);
}
```

### Sử dụng trong Component

```typescript
import { useAuth } from "@/hooks";
import { User } from "@/types/auth";

function ProfileScreen() {
	const { user, isAuthenticated, logout, isLoading } = useAuth();

	if (isLoading) {
		return <ActivityIndicator />;
	}

	if (!isAuthenticated) {
		return <Redirect href="/signIn" />;
	}

	return (
		<View>
			<Text>Email: {user?.email}</Text>
			<Text>Name: {user?.name}</Text>
			<Button
				title="Logout"
				onPress={logout}
			/>
		</View>
	);
}
```

---

## ✅ Lợi Ích Của Cấu Trúc Mới

### 1. **Separation of Concerns**

-   Types riêng biệt
-   Context definition riêng biệt
-   Business logic riêng biệt
-   Hook riêng biệt

### 2. **Dễ Test**

```typescript
// Test types
import { User } from "@/types/auth";

// Test Provider
import { AuthProvider } from "@/contexts/auth/AuthProvider";

// Test hook
import { useAuth } from "@/hooks/useAuth";
```

### 3. **Dễ Maintain**

-   Mỗi file có một nhiệm vụ rõ ràng
-   Dễ tìm và sửa lỗi
-   Dễ thêm tính năng mới

### 4. **Reusability**

-   Types có thể dùng cho nhiều mục đích khác
-   Hook có thể customize dễ dàng
-   Service có thể mock khi test

### 5. **Better IDE Support**

-   Autocomplete tốt hơn
-   Go to definition chính xác
-   Type inference tốt hơn

---

## 🔄 Migration Guide

Nếu bạn đang sử dụng code cũ, đây là cách migrate:

### Before:

```typescript
import { useAuth, AuthProvider, User } from "@/contexts/AuthContext";
```

### After:

```typescript
import { AuthProvider } from "@/contexts/auth";
import { useAuth } from "@/hooks";
import { User } from "@/types/auth";
```

**Lưu ý**: File cũ `src/contexts/AuthContext.tsx` vẫn được giữ lại để backward compatibility nhưng đã được đánh dấu deprecated.

---

## 📦 Export Summary

### Từ `@/types/auth`:

-   `User`
-   `LoginRequest`
-   `RegisterRequest`
-   `LoginResponse`
-   `ForgotPasswordRequest`
-   `ResetPasswordRequest`
-   `ChangePasswordRequest`
-   `AuthContextState`

### Từ `@/contexts/auth`:

-   `AuthProvider` (component)
-   `AuthContext` (context instance)

### Từ `@/hooks`:

-   `useAuth` (custom hook)

### Từ `@/services`:

-   `authService` (default export)

---

## 🎯 Best Practices

1. ✅ **Import types từ `@/types/auth`**

    ```typescript
    import { User, LoginRequest } from "@/types/auth";
    ```

2. ✅ **Import Provider từ `@/contexts/auth`**

    ```typescript
    import { AuthProvider } from "@/contexts/auth";
    ```

3. ✅ **Import hook từ `@/hooks`**

    ```typescript
    import { useAuth } from "@/hooks";
    ```

4. ✅ **Không import trực tiếp từ file implementation**

    ```typescript
    // ❌ Tránh
    import { useAuth } from "@/hooks/useAuth";

    // ✅ Nên dùng
    import { useAuth } from "@/hooks";
    ```

---

## 📝 File Summary Table

| File                             | Kích thước | Chức năng        | Dependencies                 |
| -------------------------------- | ---------- | ---------------- | ---------------------------- |
| `types/auth.ts`                  | ~50 lines  | Type definitions | Không                        |
| `contexts/auth/AuthContext.tsx`  | ~10 lines  | Context creation | types/auth                   |
| `contexts/auth/AuthProvider.tsx` | ~150 lines | Business logic   | AuthContext, services, utils |
| `hooks/useAuth.ts`               | ~25 lines  | Hook wrapper     | AuthContext                  |
| `services/authService.ts`        | ~140 lines | API calls        | types/auth, utils            |

---

**Version**: 2.0.0  
**Last Updated**: December 2025  
**Migration Status**: Backward compatible with v1.0.0
