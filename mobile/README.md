# OG Camping Private

Ứng dụng di động đặt dịch vụ cắm trại và thuê thiết bị cắm trại dành cho khách hàng.

## Tính năng chính

- 🔐 **Đăng nhập/Đăng ký**: Email/Password, Google Sign-In
- 🏕️ **Dịch vụ cắm trại**: Camping, Glamping với tìm kiếm và lọc
- 🎒 **Thuê thiết bị**: Lều, bếp gas, đèn pin, túi ngủ, bàn ghế...
- 🎁 **Combo packages**: Gói dịch vụ ưu đãi
- 🤖 **AI Chat**: Tư vấn chọn dịch vụ phù hợp
- 📅 **Đặt chỗ**: Quản lý đặt chỗ và lịch sử
- 👤 **Hồ sơ cá nhân**: Quản lý thông tin và cài đặt
- 🌙 **Dark mode**: Hỗ trợ chế độ tối/sáng

## Cấu trúc dự án

```
lib/
├── core/                    # Core functionality
│   ├── models/             # Data models
│   ├── providers/          # State management (Provider)
│   ├── repositories/       # Data repositories
│   ├── services/           # API services
│   └── navigation/         # App routing
├── features/               # Feature modules
│   ├── auth/              # Authentication
│   ├── home/              # Home screen
│   ├── services/          # Camping services
│   ├── equipment/         # Equipment rental
│   ├── combo/             # Combo packages
│   ├── booking/           # Booking management
│   ├── chat/              # AI chat
│   └── profile/           # User profile
└── shared/                # Shared widgets
    └── widgets/
```

## Cài đặt và chạy

1. **Cài đặt dependencies:**
   ```bash
   cd og_camping_private
   flutter pub get
   ```

2. **Chạy ứng dụng:**
   ```bash
   # Chạy trên emulator/device
   flutter run
   
   # Hoặc chạy trên Chrome (web)
   flutter run -d chrome
   
   # Build APK để test
   flutter build apk --debug
   ```

3. **Nếu gặp lỗi:**
   ```bash
   # Clean và rebuild
   flutter clean
   flutter pub get
   flutter run
   
   # Hoặc sử dụng script
   build_test.bat      # Để build APK
   run_android.bat     # Để chạy trên Android device
   ```

4. **Lỗi fonts (nếu có):**
   - Đã xóa fonts custom khỏi pubspec.yaml
   - Sử dụng Material Design fonts mặc định

## Công nghệ sử dụng

- **Framework**: Flutter 3.x
- **State Management**: Provider
- **Navigation**: go_router
- **UI**: Material 3 với dark mode
- **Storage**: SharedPreferences
- **HTTP**: Dio
- **Localization**: flutter_localizations

## Mock Data

Ứng dụng sử dụng mock data để demo:

- **Login**: Bất kỳ email/password nào cũng được chấp nhận
- **Services**: 2 dịch vụ mẫu (Glamping và Camping)
- **Equipment**: 2 thiết bị mẫu (Lều và Bếp gas)
- **Combos**: 1 combo package mẫu
- **AI Chat**: Phản hồi tự động với gợi ý

## Tính năng sắp tới

- [ ] Tích hợp API thật
- [ ] Payment gateway
- [ ] Push notifications
- [ ] Review và rating system
- [ ] Wishlist
- [ ] Multi-language support
- [ ] Offline mode

## Phát triển

Dự án được phát triển với kiến trúc Feature-first, dễ dàng mở rộng và bảo trì.

### Thêm tính năng mới

1. Tạo thư mục trong `features/`
2. Thêm models trong `core/models/`
3. Tạo provider trong `core/providers/`
4. Thêm routes trong `core/navigation/`
5. Implement UI screens

### Mock API

Tất cả API calls đều được mock trong `core/services/api_service.dart`. Để tích hợp API thật, chỉ cần thay thế implementation trong file này.

## License

MIT License
