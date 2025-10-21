# 🧪 API Testing với JSONPlaceholder

## Đã setup sẵn!

API demo của bạn giờ sử dụng **JSONPlaceholder** - một public REST API miễn phí để testing.

### 🎯 Các test cases có sẵn:

#### 1. **GET Requests**

-   **Get Users** - Lấy danh sách 10 users (hiển thị 3 đầu)
-   **Get User #1** - Lấy chi tiết 1 user

#### 2. **POST Request**

-   **Create Post** - Tạo một post mới
-   Response sẽ trả về post với ID mới

#### 3. **PUT Request**

-   **Update Post** - Cập nhật post có ID = 1
-   Response sẽ trả về post đã update

#### 4. **DELETE Request**

-   **Delete Post** - Xóa post có ID = 1
-   Response sẽ trả về status thành công

#### 5. **AsyncStorage Test**

-   Lưu và đọc data từ AsyncStorage
-   Verify data được persist đúng

### 🚀 Cách test:

1. Chạy app:

    ```bash
    npm start
    ```

2. Mở app trên device/simulator

3. Tap vào **"Test API Service →"**

4. Thử các buttons:
    - Mỗi button test một HTTP method khác nhau
    - Kết quả hiển thị real-time
    - Scroll để xem full response

### 📱 Screenshots flow:

```
Home Screen
    ↓
[Test API Service →]
    ↓
API Demo Screen
    ↓
- Get Users
- Get User #1
- POST - Create Post
- PUT - Update Post
- DELETE - Delete Post
- Test AsyncStorage
    ↓
Results hiển thị ở dưới
```

### 🔍 Những gì được test:

✅ **API Service hoạt động**

-   GET, POST, PUT, DELETE methods
-   Request/Response handling
-   Error handling

✅ **AsyncStorage hoạt động**

-   Save data
-   Retrieve data
-   JSON serialization

✅ **Network connectivity**

-   Public API endpoint
-   Real HTTP requests

### 💡 Code reference:

**File quan trọng:**

-   `app/api-demo.tsx` - Demo UI
-   `src/lib/testApi.ts` - JSONPlaceholder API instance
-   `src/lib/api.ts` - Main API service class

**Sử dụng trong code:**

```typescript
import testApiService from "@/lib/testApi";

// GET
const users = await testApiService.get("/users");

// POST
const newPost = await testApiService.post("/posts", {
    title: "Test",
    body: "Content",
    userId: 1,
});

// PUT
const updated = await testApiService.put("/posts/1", data);

// DELETE
await testApiService.delete("/posts/1");
```

### 🎨 UI Features:

-   ✨ Modern card-based design
-   🎨 Color-coded buttons (GET, POST, PUT, DELETE)
-   📋 Scrollable results
-   ⏳ Loading indicators
-   📱 Responsive layout

### 📖 JSONPlaceholder Resources:

-   Website: https://jsonplaceholder.typicode.com
-   Endpoints:
    -   `/users` - 10 users
    -   `/posts` - 100 posts
    -   `/comments` - 500 comments
    -   `/todos` - 200 todos
    -   `/albums` - 100 albums
    -   `/photos` - 5000 photos

### ⚡ Next steps:

Sau khi test thành công với JSONPlaceholder, bạn có thể:

1. Thay đổi base URL trong `.env` để test với API thật của bạn
2. Add thêm test cases trong `api-demo.tsx`
3. Implement authentication flow
4. Build production screens

Enjoy testing! 🚀
