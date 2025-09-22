# Hướng dẫn sử dụng chức năng Quản lý Danh mục

## Tổng quan
Chức năng quản lý danh mục cho phép Admin tạo, xem, sửa và xóa các danh mục sản phẩm/dịch vụ trong hệ thống OG Camping.

## Các tính năng đã triển khai

### Backend (Spring Boot)

#### 1. Model - Category.java
- **Vị trí**: `ogcamping/backendOG/src/main/java/com/mytech/backend/portal/models/Category.java`
- **Mô tả**: Entity chính cho danh mục
- **Các trường**:
  - `id`: ID duy nhất
  - `name`: Tên danh mục (unique, max 100 ký tự)
  - `description`: Mô tả danh mục
  - `createdAt`: Thời gian tạo

#### 2. Repository - CategoryRepository.java
- **Vị trí**: `ogcamping/backendOG/src/main/java/com/mytech/backend/portal/repositories/CategoryRepository.java`
- **Mô tả**: Interface để truy cập database
- **Các method**:
  - `existsByName(String name)`: Kiểm tra tên danh mục đã tồn tại

#### 3. Service - CategoryService.java & CategoryServiceImpl.java
- **Vị trí**: 
  - Interface: `ogcamping/backendOG/src/main/java/com/mytech/backend/portal/services/CategoryService.java`
  - Implementation: `ogcamping/backendOG/src/main/java/com/mytech/backend/portal/services/impl/CategoryServiceImpl.java`
- **Các method**:
  - `findAll()`: Lấy tất cả danh mục
  - `findById(Long id)`: Lấy danh mục theo ID
  - `create(CategoryDTO)`: Tạo danh mục mới
  - `update(Long id, CategoryDTO)`: Cập nhật danh mục
  - `delete(Long id)`: Xóa danh mục
  - `existsByName(String name)`: Kiểm tra tên đã tồn tại

#### 4. Controller - CategoryController.java
- **Vị trí**: `ogcamping/backendOG/src/main/java/com/mytech/backend/portal/apis/CategoryController.java`
- **Base URL**: `/apis/v1/categories`
- **Các endpoint**:
  - `GET /apis/v1/categories`: Lấy tất cả danh mục
  - `GET /apis/v1/categories/{id}`: Lấy danh mục theo ID
  - `POST /apis/v1/categories`: Tạo danh mục mới (chỉ Admin)
  - `PUT /apis/v1/categories/{id}`: Cập nhật danh mục (chỉ Admin)
  - `DELETE /apis/v1/categories/{id}`: Xóa danh mục (chỉ Admin)

#### 5. DTO - CategoryDTO.java
- **Vị trí**: `ogcamping/backendOG/src/main/java/com/mytech/backend/portal/dto/CategoryDTO.java`
- **Mô tả**: Data Transfer Object cho việc truyền dữ liệu
- **Các trường**: `id`, `name`, `description`

### Frontend (Next.js)

#### 1. Trang quản lý danh mục
- **Vị trí**: `ogcamping/fontend/app/admin/categories/page.tsx`
- **Mô tả**: Trang chính để quản lý danh mục
- **Tính năng**:
  - Hiển thị danh sách danh mục dạng bảng
  - Tìm kiếm và lọc danh mục
  - Thống kê số lượng danh mục
  - Thêm/sửa/xóa danh mục qua dialog

#### 2. Tích hợp vào Admin Dashboard
- **Vị trí**: `ogcamping/fontend/app/admin/page.tsx`
- **Mô tả**: Thêm tab "Danh mục" vào menu admin
- **Tính năng**: Link đến trang quản lý danh mục chi tiết

## Cách sử dụng

### 1. Truy cập trang quản lý danh mục
1. Đăng nhập với tài khoản Admin
2. Vào trang Admin Dashboard (`/admin`)
3. Click vào tab "Danh mục"
4. Click "Quản lý danh mục" để vào trang chi tiết

### 2. Thêm danh mục mới
1. Click nút "Thêm danh mục"
2. Điền thông tin:
   - **Tên danh mục** (bắt buộc): Tên duy nhất cho danh mục
   - **Mô tả**: Mô tả chi tiết về danh mục
3. Click "Tạo danh mục"

### 3. Sửa danh mục
1. Click nút "Sửa" (biểu tượng bút chì) ở danh mục cần sửa
2. Cập nhật thông tin trong dialog
3. Click "Cập nhật"

### 4. Xóa danh mục
1. Click nút "Xóa" (biểu tượng thùng rác) ở danh mục cần xóa
2. Xác nhận xóa trong dialog
3. Click "Xóa" để hoàn tất

### 5. Tìm kiếm danh mục
- Sử dụng ô tìm kiếm để tìm theo tên hoặc mô tả
- Kết quả sẽ được lọc real-time

## API Endpoints

### Lấy tất cả danh mục
```http
GET /apis/v1/categories
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Lều trại",
      "description": "Các loại lều trại"
    }
  ]
}
```

### Tạo danh mục mới
```http
POST /apis/v1/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Thiết bị nấu ăn",
  "description": "Các thiết bị dùng để nấu ăn khi cắm trại"
}
```

### Cập nhật danh mục
```http
PUT /apis/v1/categories/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Thiết bị nấu ăn cập nhật",
  "description": "Mô tả mới"
}
```

### Xóa danh mục
```http
DELETE /apis/v1/categories/1
Authorization: Bearer <admin_token>
```

## Bảo mật
- Chỉ Admin mới có quyền tạo, sửa, xóa danh mục
- Tất cả API đều yêu cầu JWT token
- Kiểm tra tên danh mục trùng lặp trước khi tạo/cập nhật

## Xử lý lỗi
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **404 Not Found**: Không tìm thấy danh mục
- **409 Conflict**: Tên danh mục đã tồn tại
- **401 Unauthorized**: Chưa đăng nhập hoặc không có quyền

## Database Schema
```sql
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME(6),
  created_on DATETIME(6),
  updated_on DATETIME(6),
  version BIGINT
);
```

## Lưu ý
- Tên danh mục phải duy nhất trong hệ thống
- Không thể xóa danh mục đang được sử dụng bởi sản phẩm/dịch vụ khác
- Tất cả thao tác đều được ghi log để audit
