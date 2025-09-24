# IP Configuration Guide

## 📋 Overview

This guide explains how to change the backend IP address for the OG Camping mobile app. All IP configurations are now centralized in a single file for easy management.

## 🔧 Quick Setup

### 1. Change Backend IP Address

Edit the file: `lib/core/config/app_config.dart`

```dart
class AppConfig {
  // 🔧 CONFIGURATION: Change this IP address to match your backend server
  static const String _backendHost = '192.168.56.1';  // ← Change this line
  static const String _backendPort = '8080';
  
  // ... rest of the file
}
```

### 2. Update Android Network Security (Required for HTTP)

Edit the file: `android/app/src/main/res/xml/network_security_config.xml`

Add your new IP to the domain list:

```xml
<domain-config cleartextTrafficPermitted="true">
    <!-- Your new backend IP -->
    <domain includeSubdomains="true">YOUR_NEW_IP_HERE</domain>
    
    <!-- Keep existing common IPs -->
    <domain includeSubdomains="true">localhost</domain>
    <domain includeSubdomains="true">127.0.0.1</domain>
    <domain includeSubdomains="true">10.0.2.2</domain>
</domain-config>
```

### 3. Clean and Rebuild

```bash
flutter clean
flutter pub get
flutter run
```

## 🌐 Common IP Addresses

| Environment | IP Address | Description |
|-------------|------------|-------------|
| `localhost` | `127.0.0.1` | Local development (web only) |
| Android Emulator | `10.0.2.2` | Host machine from Android emulator |
| VirtualBox/VMware | `192.168.56.1` | Host-only network |
| Local Network | `192.168.1.xxx` | Your router's network range |
| Docker Desktop | `host.docker.internal` | Docker container to host |

## 📁 Files Affected by IP Configuration

The centralized configuration automatically updates these files:

### ✅ Automatically Updated (via AppConfig)
- `lib/core/services/api_service.dart` - API endpoints
- `lib/core/services/payment_service.dart` - Payment URLs  
- `lib/core/models/camping_service.dart` - Image URLs
- `lib/core/models/combo_package.dart` - Image URLs
- `lib/features/services/screens/service_detail_screen.dart` - Image display
- `lib/features/services/screens/services_screen.dart` - Image display

### ⚠️ Manually Update Required
- `android/app/src/main/res/xml/network_security_config.xml` - Android HTTP permissions

## 🔍 Configuration Details

### AppConfig Class Features

```dart
// Base API URL (auto-detects web vs mobile)
AppConfig.baseUrl              // http://192.168.56.1:8080/apis/v1

// Server URL (without /apis/v1)
AppConfig.serverUrl            // http://192.168.56.1:8080

// Payment service URL
AppConfig.paymentUrl           // http://192.168.56.1:8080/apis/v1/payments

// Image URL helper
AppConfig.getImageUrl('/path') // http://192.168.56.1:8080/path

// Network domains for Android
AppConfig.allowedDomains       // ['192.168.56.1', 'localhost', ...]
```

### Platform Detection

The configuration automatically detects the platform:

- **Flutter Web**: Uses `localhost:8080` for same-origin requests
- **Mobile (Android/iOS)**: Uses the configured IP address

### Debug Information

Add this to your main.dart to see current configuration:

```dart
void main() {
  AppConfig.printConfig(); // Prints current configuration
  runApp(MyApp());
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"Network unreachable" error**
   - Check if backend server is running
   - Verify IP address is correct
   - Ensure firewall allows connections

2. **"Cleartext HTTP traffic not permitted"**
   - Update `network_security_config.xml`
   - Add your IP to allowed domains
   - Rebuild the app

3. **Images not loading**
   - Check if image URLs are correct
   - Verify server serves static files
   - Test image URL in browser

### Testing Configuration

```dart
// Test in your app
print('Base URL: ${AppConfig.baseUrl}');
print('Server URL: ${AppConfig.serverUrl}');
print('Image URL: ${AppConfig.getImageUrl('/test.jpg')}');
```

### Network Debugging

```bash
# Test API connectivity
curl http://YOUR_IP:8080/apis/v1/services

# Test image serving
curl http://YOUR_IP:8080/images/test.jpg
```

## 📝 Migration from Old System

If you're migrating from hardcoded IPs, replace:

```dart
// OLD: Hardcoded IP
'http://192.168.56.1:8080/apis/v1/services'

// NEW: Centralized config
'${AppConfig.baseUrl}/services'
```

```dart
// OLD: Hardcoded image URL
'http://192.168.56.1:8080$imageUrl'

// NEW: Centralized config
AppConfig.getImageUrl(imageUrl)
```

## 🔐 Security Notes

- Only use HTTP for development
- Use HTTPS in production
- Don't commit sensitive IPs to version control
- Consider environment variables for production

## 📞 Support

If you encounter issues:

1. Check the configuration with `AppConfig.printConfig()`
2. Verify network connectivity
3. Check Android network security config
4. Test API endpoints manually

---

**Last Updated**: September 2024  
**Version**: 1.0.0
