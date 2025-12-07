# AuthContext - Hướng Dẫn Sử Dụng

## Giới thiệu

`AuthContext` là một React Context quản lý trạng thái xác thực người dùng trong ứng dụng FortressBank. Context này cung cấp các chức năng đăng nhập, đăng ký, đăng xuất và quản lý thông tin người dùng.

## Cấu trúc

### File location

```
src/contexts/AuthContext.tsx
```

### Exported Items

-   `AuthProvider`: Component Provider cho Auth Context
-   `useAuth`: Custom hook để sử dụng Auth Context
-   `User`: TypeScript interface cho thông tin người dùng

## Tính năng chính

### 1. **State Management**

-   `user`: Thông tin người dùng hiện tại (User | null)
-   `isAuthenticated`: Trạng thái đăng nhập (boolean)
-   `isLoading`: Trạng thái đang tải (boolean)

### 2. **Methods**

-   `login(credentials)`: Đăng nhập người dùng
-   `register(data)`: Đăng ký tài khoản mới
-   `logout()`: Đăng xuất người dùng
-   `refreshUser()`: Làm mới thông tin người dùng

## Cài đặt và Sử dụng

### Bước 1: Wrap ứng dụng với AuthProvider

Trong file `app/_layout.tsx` hoặc file root của ứng dụng:

```tsx
import { AuthProvider } from "@/contexts";

export default function RootLayout() {
	return (
		<AuthProvider>
			{/* Các component con của bạn */}
			<Stack>
				<Stack.Screen name="index" />
				{/* ... */}
			</Stack>
		</AuthProvider>
	);
}
```

### Bước 2: Sử dụng useAuth hook trong components

```tsx
import { useAuth } from "@/contexts";

function MyComponent() {
	const { user, isAuthenticated, isLoading, login, logout } = useAuth();

	if (isLoading) {
		return <Text>Đang tải...</Text>;
	}

	if (!isAuthenticated) {
		return <Text>Chưa đăng nhập</Text>;
	}

	return (
		<View>
			<Text>Xin chào, {user?.name}!</Text>
			<Button
				title="Đăng xuất"
				onPress={logout}
			/>
		</View>
	);
}
```

## Ví dụ chi tiết

### 1. Đăng nhập

```tsx
import { useState } from "react";
import { useAuth } from "@/contexts";

function SignInScreen() {
	const { login, isLoading } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async () => {
		try {
			await login({ email, password });
			// Chuyển hướng đến trang chính
		} catch (err) {
			setError(err.message || "Đăng nhập thất bại");
		}
	};

	return (
		<View>
			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			{error && <Text style={{ color: "red" }}>{error}</Text>}
			<Button
				title={isLoading ? "Đang xử lý..." : "Đăng nhập"}
				onPress={handleLogin}
				disabled={isLoading}
			/>
		</View>
	);
}
```

### 2. Đăng ký

```tsx
import { useState } from "react";
import { useAuth } from "@/contexts";

function SignUpScreen() {
	const { register, isLoading } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		name: "",
		phone: "",
	});

	const handleRegister = async () => {
		try {
			await register(formData);
			// Chuyển hướng đến trang chính
		} catch (err) {
			console.error("Đăng ký thất bại:", err);
		}
	};

	return (
		<View>
			<TextInput
				placeholder="Họ tên"
				value={formData.name}
				onChangeText={(text) =>
					setFormData({ ...formData, name: text })
				}
			/>
			<TextInput
				placeholder="Email"
				value={formData.email}
				onChangeText={(text) =>
					setFormData({ ...formData, email: text })
				}
			/>
			<TextInput
				placeholder="Số điện thoại"
				value={formData.phone}
				onChangeText={(text) =>
					setFormData({ ...formData, phone: text })
				}
			/>
			<TextInput
				placeholder="Mật khẩu"
				value={formData.password}
				onChangeText={(text) =>
					setFormData({ ...formData, password: text })
				}
				secureTextEntry
			/>
			<Button
				title={isLoading ? "Đang xử lý..." : "Đăng ký"}
				onPress={handleRegister}
				disabled={isLoading}
			/>
		</View>
	);
}
```

### 3. Bảo vệ route (Protected Routes)

```tsx
import { useAuth } from "@/contexts";
import { Redirect } from "expo-router";

function ProtectedScreen() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <ActivityIndicator size="large" />;
	}

	if (!isAuthenticated) {
		return <Redirect href="/signIn" />;
	}

	return <View>{/* Nội dung của trang được bảo vệ */}</View>;
}
```

### 4. Hiển thị thông tin người dùng

```tsx
import { useAuth } from "@/contexts";

function ProfileScreen() {
	const { user, logout } = useAuth();

	return (
		<View>
			<Text>Email: {user?.email}</Text>
			<Text>Tên: {user?.name}</Text>
			{user?.phone && <Text>Số điện thoại: {user.phone}</Text>}
			<Button
				title="Đăng xuất"
				onPress={logout}
			/>
		</View>
	);
}
```

### 5. Làm mới thông tin người dùng

```tsx
import { useAuth } from "@/contexts";

function SettingsScreen() {
	const { user, refreshUser } = useAuth();

	const handleUpdateProfile = async () => {
		// Sau khi cập nhật thông tin qua API
		// Làm mới thông tin người dùng từ storage
		await refreshUser();
	};

	return (
		<View>
			<Text>Cài đặt tài khoản</Text>
			<Button
				title="Làm mới thông tin"
				onPress={refreshUser}
			/>
		</View>
	);
}
```

## API Reference

### AuthContextState

```typescript
interface AuthContextState {
	user: User | null; // Thông tin người dùng
	isAuthenticated: boolean; // Trạng thái đăng nhập
	isLoading: boolean; // Trạng thái loading
	login: (credentials: LoginRequest) => Promise<void>;
	register: (data: RegisterRequest) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}
```

### User Interface

```typescript
interface User {
	id: string;
	email: string;
	name: string;
	phone?: string;
}
```

### LoginRequest

```typescript
interface LoginRequest {
	email: string;
	password: string;
}
```

### RegisterRequest

```typescript
interface RegisterRequest {
	email: string;
	password: string;
	name: string;
	phone?: string;
}
```

## Xử lý lỗi

AuthContext tự động xử lý lỗi bằng cách sử dụng `handleApiError` từ utils. Lỗi sẽ được throw ra và bạn có thể catch chúng:

```tsx
try {
	await login({ email, password });
} catch (error) {
	// error đã được format bởi handleApiError
	console.error(error.message);
	Alert.alert("Lỗi", error.message);
}
```

## Lưu ý quan trọng

1. **Khởi tạo tự động**: AuthContext tự động khôi phục trạng thái đăng nhập từ storage khi app khởi động
2. **Token Management**: Token được quản lý tự động qua authService và utils/storage
3. **Error Handling**: Tất cả methods đều throw error, bạn nên wrap trong try-catch
4. **Loading State**: Luôn check `isLoading` trước khi thực hiện action hoặc hiển thị UI
5. **Provider Scope**: Đảm bảo AuthProvider được đặt ở level cao nhất để tất cả components có thể truy cập

## Debugging

Để debug AuthContext, bạn có thể:

```tsx
import { useAuth } from "@/contexts";

function DebugScreen() {
	const auth = useAuth();

	console.log("Auth State:", {
		user: auth.user,
		isAuthenticated: auth.isAuthenticated,
		isLoading: auth.isLoading,
	});

	return <Text>Check console for auth state</Text>;
}
```

## Tích hợp với các Context khác

AuthContext có thể kết hợp với các Context khác như NotificationContext:

```tsx
function App() {
	return (
		<AuthProvider>
			<NotificationProvider>{/* Your app */}</NotificationProvider>
		</AuthProvider>
	);
}
```

## Best Practices

1. ✅ Luôn check `isLoading` trước khi hiển thị UI
2. ✅ Sử dụng try-catch khi gọi login/register/logout
3. ✅ Clear sensitive data khi đăng xuất
4. ✅ Sử dụng `isAuthenticated` để điều hướng
5. ✅ Gọi `refreshUser` sau khi cập nhật thông tin người dùng
6. ❌ Không gọi `useAuth` bên ngoài AuthProvider
7. ❌ Không lưu trữ password trong state

## Troubleshooting

### Lỗi: "useAuth must be used within an AuthProvider"

**Giải pháp**: Đảm bảo component sử dụng `useAuth` nằm trong `<AuthProvider>`

### User không được lưu sau khi đăng nhập

**Giải pháp**: Kiểm tra authService có gọi `setUserData` đúng cách không

### Token hết hạn

**Giải pháp**: Implement refresh token logic trong apiService interceptor

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Maintainer**: FortressBank Development Team
