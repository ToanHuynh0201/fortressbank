# 🏦 FortressBank

Ứng dụng mobile banking hiện đại được xây dựng với React Native và Expo Router, mang đến trải nghiệm ngân hàng số toàn diện và mượt mà.

## 📱 Tổng quan

FortressBank là một mobile banking app với đầy đủ tính năng quản lý tài chính cá nhân, chuyển tiền, quản lý thẻ và theo dõi giao dịch. App được thiết kế với UI/UX hiện đại, animations mượt mà và architecture rõ ràng.

### ✨ Tính năng chính

-   **🔐 Xác thực người dùng**
    -   Đăng nhập / Đăng ký
    -   Quên mật khẩu & đổi mật khẩu
    -   Auto token refresh (tự động làm mới phiên đăng nhập)

-   **💳 Quản lý tài khoản & thẻ**
    -   Hiển thị thông tin thẻ với số che giấu
    -   Xem số dư và chi tiết tài khoản
    -   Quản lý nhiều loại thẻ (VISA, MasterCard, Account)

-   **💸 Chuyển tiền**
    -   Chuyển qua số thẻ
    -   Chuyển trong cùng ngân hàng
    -   Chuyển sang ngân hàng khác
    -   Lưu người thụ hưởng
    -   Xác nhận giao dịch trước khi chuyển

-   **📊 Lịch sử giao dịch**
    -   Theo dõi tất cả giao dịch
    -   Chi tiết từng giao dịch
    -   Lọc theo thời gian

-   **🔔 Thông báo**
    -   Thông báo giao dịch
    -   Thông báo hệ thống
    -   Đếm số thông báo chưa đọc

-   **⚙️ Cài đặt**
    -   Quản lý thông tin cá nhân
    -   Cài đặt bảo mật
    -   Thông tin ứng dụng

## 🛠️ Tech Stack

-   **Framework**: React Native 0.81.5
-   **Navigation**: Expo Router 6.0
-   **Language**: TypeScript
-   **Animations**: React Native Reanimated 4.1
-   **HTTP Client**: Axios
-   **Storage**: AsyncStorage
-   **Icons**: Phosphor React Native
-   **UI Components**: Custom components với Linear Gradient

## 📁 Cấu trúc project

```
fortressbank/
├── src/
│   ├── app/                    # File-based routing (Expo Router)
│   │   ├── (auth)/            # Auth flow: signIn, signUp, forgotPassword
│   │   ├── (home)/            # Home flow: dashboard, history, notifications
│   │   ├── (transfer)/        # Transfer flow: form → confirm → success
│   │   └── (account)/         # Account & card management
│   │
│   ├── components/            # Reusable components
│   │   ├── cards/            # BankCard, AccountCard, CategoryCard
│   │   ├── common/           # Inputs, Buttons, Headers
│   │   ├── layouts/          # AuthLayout, ScreenContainer
│   │   └── ...
│   │
│   ├── constants/            # Colors, styles, API config
│   ├── contexts/             # React Context (Notifications)
│   ├── hooks/                # Custom hooks (useForm)
│   ├── lib/                  # API service với auto auth
│   └── utils/                # Helpers (validation, storage, error)
│
└── assets/                   # Icons, illustrations
```

## 🚀 Bắt đầu

### Yêu cầu

-   Node.js 18+
-   npm hoặc yarn
-   Expo CLI
-   iOS Simulator hoặc Android Emulator (hoặc Expo Go app)

### Cài đặt

1. Clone project và cài dependencies:

```bash
npm install
```

2. Tạo file `.env` từ template (nếu có):

```bash
cp .env.example .env
```

3. Cấu hình API endpoints trong file `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com/api
EXPO_PUBLIC_API_LOCATION_URL=https://your-location-api.com/api
```

4. Chạy app:

```bash
npm start
```

5. Chọn platform:
    - Nhấn `i` để mở iOS Simulator
    - Nhấn `a` để mở Android Emulator
    - Scan QR code bằng Expo Go app trên điện thoại

## 💡 Các điểm nổi bật kỹ thuật

### API Service với Auto Authentication

API service tự động xử lý authentication headers, token refresh và error handling:

```typescript
import apiService from "@/lib/api";

// Tự động thêm Bearer token vào headers
const response = await apiService.post("/auth/login", {
    email: "user@example.com",
    password: "password123",
});

// Auto retry với refreshed token khi 401
const data = await apiService.get("/user/profile");
```

### Custom Form Hook

Hook `useForm` giúp quản lý form state và validation dễ dàng:

```typescript
const { values, handleChange, isValid } = useForm({
    email: '',
    password: '',
});
```

### File-based Routing

Sử dụng Expo Router với folder structure rõ ràng:

-   `(auth)` - Auth flow với riêng layout
-   `(home)` - Main app với bottom tabs
-   `(transfer)` - Transfer flow với nhiều steps

### Animations mượt mà

Tất cả screens đều có entrance animations sử dụng Reanimated:

-   Fade in effects
-   Spring animations
-   Staggered delays cho từng element

## 🎨 Design System

-   **Primary Colors**: Purple gradient (#3629B7 → #5655B9)
-   **Neutral Colors**: Từ dark gray đến white
-   **Semantic Colors**: Error, Success, Warning, Info
-   **Typography**: Poppins font family
-   **Border Radius**: 15px cho cards, 30px cho containers

## 🔧 Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web (nếu support)
```

## 📝 Lưu ý khi develop

-   **Env variables** phải có prefix `EXPO_PUBLIC_` để access được từ app
-   **Path aliases** được config trong `babel.config.js` với `@/` pointing to `src/`
-   **Luôn dùng `await`** với storage functions (AsyncStorage)
-   **Router navigation**: Dùng `router.push()`, `router.replace()` từ `expo-router`

## 🐛 Troubleshooting

**App không start?**

```bash
npx expo start --clear
```

**Import alias không hoạt động?**

```bash
rm -rf node_modules .expo
npm install
```

**API errors?**

-   Check `.env` file có đúng URL chưa
-   Verify backend đang chạy
-   Xem console logs trong terminal

## 📄 License

Private project

---

Built with ❤️ using React Native & Expo
