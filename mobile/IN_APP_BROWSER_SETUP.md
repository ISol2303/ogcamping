# In-App Browser & Deep Links Setup Guide

## Overview
This guide explains how to set up in-app browser and deep link handling for the OG Camping mobile app payment flow.

## Features Implemented
- ✅ **In-App Browser**: Payment opens within the app using `flutter_inappwebview`
- ✅ **Deep Link Handling**: Automatic redirect back to app after payment
- ✅ **Fallback Support**: External browser if in-app browser fails
- ✅ **Cross-Platform**: Works on both Android and iOS

## Dependencies Added
```yaml
dependencies:
  flutter_inappwebview: ^6.0.0
  app_links: ^6.4.1  # Replaces discontinued uni_links
  url_launcher: ^6.2.2
```

**Important**: `uni_links` has been discontinued and causes Android build errors. Use `app_links` instead.

## Deep Link Configuration

### Android Configuration
File: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:usesCleartextTraffic="true"
        android:networkSecurityConfig="@xml/network_security_config">
        
        <!-- Custom URL scheme for payment redirect -->
        <intent-filter android:autoVerify="true">
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="ogcamping" android:host="payment" android:pathPrefix="/result" />
        </intent-filter>
    </application>
</manifest>
```

**Network Security Config** (`android/app/src/main/res/xml/network_security_config.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.13</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

### iOS Configuration
File: `ios/Runner/Info.plist`

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>ogcamping.payment</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>ogcamping</string>
        </array>
    </dict>
</array>
```

## API Configuration

### Backend CORS Update
File: `SecurityConfig.java`

```java
@Bean
CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.addAllowedOrigin("http://localhost:3000"); // ReactJS
    config.addAllowedOrigin("http://localhost:*"); // Flutter web
    config.addAllowedOrigin("http://127.0.0.1:*"); // Alternative localhost
    config.addAllowedOrigin("http://192.168.1.13:*"); // Mobile device IP
    config.addAllowedOriginPattern("http://localhost:*");
    config.addAllowedOriginPattern("http://192.168.*:*"); // Mobile network
    // ... rest of configuration
}
```

### Mobile API Base URL
File: `lib/core/services/api_service.dart`

```dart
static String get baseUrl {
  if (kIsWeb) {
    return 'http://localhost:8080/apis/v1';
  }
  // For mobile, use IP address for real device connectivity
  return 'http://192.168.1.13:8080/apis/v1';
}
```

## Payment Flow

### 1. Complete Payment Flow
```
1. User selects VNPay and confirms booking
2. App calls /create/mobile endpoint
3. Backend creates payment with mobile callback URL
4. App opens VNPay URL in in-app browser
5. User completes payment on VNPay
6. VNPay redirects to backend /callback/mobile
7. Backend processes payment and redirects to ogcamping://payment/result
8. In-app browser intercepts deep link and closes
9. App receives payment result and shows success screen
10. App refreshes booking history automatically
```

### 2. In-App Browser Implementation
```dart
// Open payment URL in in-app browser
await InAppBrowserService.instance.openPaymentUrl(
  url: paymentUrl,
  context: context,
  onPaymentResult: (params) {
    // Handle payment result
    context.go('/payment-success', extra: params);
  },
);
```

### 3. Deep Link Handling
```dart
// Initialize deep link listening in main.dart
InAppBrowserService.instance.initializeDeepLinks(
  onDeepLinkReceived: (params) {
    print('Deep link received: $params');
    _router.go('/payment-success', extra: params);
  },
);
```

## URL Schemes

### Deep Link Format
```
ogcamping://payment/result?bookingId=123&status=success&txnRef=ABC123
```

### Parameters
- `bookingId`: ID of the booking
- `status`: Payment status (success/failed)
- `txnRef`: Transaction reference
- `error`: Error message (if failed)

## Testing

### 1. Test Deep Links (Android)
```bash
adb shell am start \
  -W -a android.intent.action.VIEW \
  -d "ogcamping://payment/result?bookingId=123&status=success" \
  com.example.og_camping_private
```

### 2. Test Deep Links (iOS Simulator)
```bash
xcrun simctl openurl booted "ogcamping://payment/result?bookingId=123&status=success"
```

### 3. Test Payment Flow
1. Create a booking
2. Select VNPay payment
3. Complete payment in in-app browser
4. Verify automatic redirect to success screen

## Troubleshooting

### Common Issues

#### 1. Deep Links Not Working
- Check URL scheme configuration in AndroidManifest.xml/Info.plist
- Verify app is installed and can handle the scheme
- Test with simple deep link first

#### 2. In-App Browser Not Opening
- Check flutter_inappwebview plugin installation
- Verify internet permissions on Android
- Test with simple URL first

#### 3. CORS Errors
- Verify backend CORS configuration includes mobile IP
- Check network connectivity between mobile and backend
- Test API endpoints with Postman

#### 4. Payment Callback Not Working
- Verify backend /callback/mobile endpoint
- Check VNPay configuration for mobile callback URL
- Test callback URL manually

### Network Configuration

#### For Development
- Backend: `http://192.168.1.13:8080`
- Make sure mobile device can reach this IP
- Configure firewall to allow connections

#### For Production
- Use HTTPS URLs
- Configure proper domain names
- Set up SSL certificates

## Security Considerations

1. **URL Scheme Security**: Custom URL schemes can be intercepted
2. **HTTPS**: Always use HTTPS in production
3. **Token Validation**: Validate payment tokens on backend
4. **Deep Link Validation**: Validate deep link parameters

## Performance Tips

1. **Preload Browser**: Initialize in-app browser early
2. **Cache Management**: Clear browser cache periodically
3. **Timeout Handling**: Set appropriate timeouts for payment
4. **Error Recovery**: Implement fallback to external browser

## Future Enhancements

1. **Biometric Authentication**: Add fingerprint/face ID for payments
2. **Payment History**: Cache payment results locally
3. **Offline Support**: Handle offline payment scenarios
4. **Analytics**: Track payment flow metrics
