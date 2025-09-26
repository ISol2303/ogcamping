# Cấu hình Mobile App

## Thay đổi Base URL

Để thay đổi URL API, mở file `lib/core/config/app_config.dart`:

```dart
class AppConfig {
  // Base URLs for different environments
  static const String _devBaseUrl = 'http://192.168.1.13:8080/apis/v1';
  static const String _prodBaseUrl = 'https://your-production-domain.com/apis/v1';
  
  // Current environment (change this to switch between dev/prod)
  static const bool _isDevelopment = true;
  
  // Get the appropriate base URL based on environment
  static String get baseUrl => _isDevelopment ? _devBaseUrl : _prodBaseUrl;
}
```

### Các bước thay đổi:

1. **Thay đổi IP cho development:**
   - Sửa `_devBaseUrl` thành IP của máy tính bạn
   - Ví dụ: `'http://192.168.1.100:8080/apis/v1'`

2. **Thay đổi sang production:**
   - Sửa `_prodBaseUrl` thành domain production
   - Đặt `_isDevelopment = false`

3. **Tìm IP của máy tính:**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
   - Hoặc sử dụng `192.168.1.x` thay vì `192.168.1.13`

### Các endpoint có sẵn:

- `AppConfig.servicesEndpoint` - Dịch vụ
- `AppConfig.equipmentEndpoint` - Thiết bị  
- `AppConfig.combosEndpoint` - Combo
- `AppConfig.authEndpoint` - Xác thực
- `AppConfig.bookingsEndpoint` - Đặt chỗ

### Xử lý hình ảnh:

```dart
// Lấy URL hình ảnh đầy đủ
String imageUrl = AppConfig.getImageUrl('/uploads/equipment/image.jpg');
// Kết quả: http://192.168.1.13:8080/uploads/equipment/image.jpg
```

## Lưu ý:

- Đảm bảo backend đang chạy trên IP và port đã cấu hình
- Kiểm tra firewall không chặn kết nối
- Trên Android emulator, `localhost` không hoạt động, phải dùng IP thực
