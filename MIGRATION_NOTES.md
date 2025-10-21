# FortressBank - React Native Setup Notes

## API Service Migration từ Web sang React Native

API service đã được cập nhật để hoạt động với React Native (Expo):

### Thay đổi chính:

1. **Storage**: `localStorage` → `AsyncStorage`

    - Tất cả các storage operations bây giờ là **async**
    - Import: `@react-native-async-storage/async-storage`

2. **Environment Variables**: `import.meta.env` → `expo-constants`

    - Sử dụng `Constants.expoConfig.extra` để đọc env vars
    - Config trong `app.config.js`

3. **Navigation**: `window.location.href` → `expo-router`
    - Sử dụng `router.replace()` để navigate
    - Import từ `expo-router`

### Cách sử dụng API Service:

```typescript
import apiService from "@/lib/api";

// Tất cả methods giữ nguyên
const response = await apiService.get("/users");
const data = await apiService.post("/auth/login", {email, password});
```

### Environment Variables:

1. Copy `.env.example` thành `.env`
2. Cập nhật các giá trị:

    ```
    EXPO_PUBLIC_API_BASE_URL=https://your-api.com/api
    EXPO_PUBLIC_API_LOCATION_URL=https://your-location-api.com/api
    ```

3. Prefix `EXPO_PUBLIC_` là **bắt buộc** để Expo có thể đọc được

### Storage Utils:

**Lưu ý**: Tất cả storage functions bây giờ trả về **Promise**

```typescript
import {getStorageItem, setStorageItem, clearStorageItems} from "@/utils/storage";

// ✅ Đúng - với async/await
const token = await getStorageItem("access_token");
await setStorageItem("user", userData);

// ❌ Sai - thiếu await
const token = getStorageItem("access_token"); // Sẽ trả về Promise, không phải giá trị
```

### Dependencies đã cài đặt:

-   `@react-native-async-storage/async-storage` - Storage cho React Native
-   `expo-constants` - Đọc environment variables
-   `expo-router` - File-based routing
-   `axios` - HTTP client (giống như web version)

### Testing:

Đảm bảo app chạy được:

```bash
npm start
```

Sau đó test trên device/simulator để verify API calls hoạt động đúng.
