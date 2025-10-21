# 🚀 Quick Start Guide - FortressBank

## Setup đã hoàn tất! ✅

API service của bạn đã được chuyển đổi thành công sang React Native (Expo).

## Chạy app ngay:

```bash
npm start
```

Sau đó chọn:

-   `i` - iOS Simulator
-   `a` - Android Emulator
-   Scan QR code với Expo Go app

## Test API Service:

1. Mở app
2. Tap vào button "Test API Service →"
3. Thử các functions:
    - **Test API Call** - Gọi API endpoint
    - **Test Storage** - Test AsyncStorage

## Cấu hình API URL:

1. Copy file env:

    ```bash
    cp .env.example .env
    ```

2. Sửa `.env`:

    ```env
    EXPO_PUBLIC_API_BASE_URL=https://your-api.com/api
    EXPO_PUBLIC_API_LOCATION_URL=https://your-location-api.com/api
    ```

3. Restart server:
    ```bash
    npm start
    ```

## Sử dụng API Service trong code:

```typescript
import apiService from "@/lib/api";

// GET request
const users = await apiService.get("/users");

// POST request
const result = await apiService.post("/auth/login", {
    email: "user@example.com",
    password: "password123",
});

// PUT request
await apiService.put("/users/1", {name: "New Name"});

// DELETE request
await apiService.delete("/users/1");
```

## Sử dụng Storage:

```typescript
import {getStorageItem, setStorageItem, clearStorageItems} from "@/utils/storage";

// Lưu data
await setStorageItem("user", {id: 1, name: "John"});

// Đọc data
const user = await getStorageItem("user");

// Xóa nhiều items
await clearStorageItems(["token", "user", "refresh_token"]);
```

## ⚠️ Lưu ý quan trọng:

-   **LUÔN dùng `await`** với storage functions
-   Env vars phải có prefix `EXPO_PUBLIC_`
-   API service tự động handle authentication
-   Token refresh được xử lý tự động

## 📖 Tài liệu chi tiết:

-   `SETUP_COMPLETE.md` - Tổng quan các thay đổi
-   `MIGRATION_NOTES.md` - Chi tiết migration từ web

## 🐛 Troubleshooting:

**Lỗi "Cannot find module '@/...'?"**

```bash
# Clear cache và restart
rm -rf node_modules .expo
npm install
npm start -- --clear
```

**API không hoạt động?**

-   Check `.env` file có đúng URL không
-   Verify backend API đang chạy
-   Check console logs trong Expo

Chúc bạn code vui!
