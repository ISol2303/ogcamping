# Khắc phục sự cố - OG Camping Private

## Các lỗi thường gặp và cách khắc phục

### 1. Lỗi Dependencies

**Lỗi:** `version solving failed` hoặc `pub get failed`

**Khắc phục:**
```bash
flutter clean
flutter pub cache repair
flutter pub get
```

### 2. Lỗi Build

**Lỗi:** `flutter build failed` hoặc compilation errors

**Khắc phục:**
```bash
# Clean project
flutter clean

# Get dependencies
flutter pub get

# Try building again
flutter build apk --debug
```

### 3. Lỗi Import

**Lỗi:** `Target of URI doesn't exist` hoặc `undefined name`

**Khắc phục:**
- Kiểm tra tất cả dependencies đã được cài đặt
- Chạy `flutter pub get`
- Restart IDE/Editor

### 4. Lỗi Navigation

**Lỗi:** Navigation không hoạt động hoặc crash

**Khắc phục:**
- Kiểm tra tất cả routes đã được định nghĩa đúng
- Đảm bảo context được sử dụng đúng cách
- Kiểm tra AuthProvider đã được khởi tạo

### 5. Lỗi Provider

**Lỗi:** `ProviderNotFoundException` hoặc `context.read() failed`

**Khắc phục:**
- Đảm bảo tất cả providers đã được khai báo trong MultiProvider
- Sử dụng Consumer hoặc context.watch() thay vì context.read() trong build method

### 6. Lỗi Platform Specific

**Android:**
```bash
# Clean gradle
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

**iOS:**
```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
flutter clean
flutter pub get
```

**Web:**
```bash
flutter run -d chrome --web-renderer html
```

### 7. Lỗi Hot Reload

**Khắc phục:**
- Restart app: `r` trong terminal
- Hot restart: `R` trong terminal
- Hoặc stop và chạy lại: `flutter run`

### 8. Performance Issues

**Khắc phục:**
- Chạy trong Release mode: `flutter run --release`
- Build APK: `flutter build apk --release`
- Kiểm tra memory leaks trong providers

## Debug Tips

1. **Bật debug mode:**
   ```dart
   // Trong main.dart
   void main() {
     debugPaintSizeEnabled = true; // Hiển thị widget boundaries
     runApp(const OGCampingApp());
   }
   ```

2. **Log debugging:**
   ```dart
   import 'package:flutter/foundation.dart';
   
   if (kDebugMode) {
     print('Debug message');
   }
   ```

3. **Kiểm tra build errors:**
   ```bash
   flutter analyze
   flutter doctor
   ```

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, hãy:
1. Kiểm tra Flutter version: `flutter --version`
2. Chạy `flutter doctor` để kiểm tra setup
3. Tạo issue với thông tin chi tiết về lỗi
