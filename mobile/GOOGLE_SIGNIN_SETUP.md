# Google Sign-In Setup Guide

## Overview
This guide explains how to set up Google Sign-In for the OG Camping mobile app to work with your backend OAuth2 endpoints.

## Backend Integration
Your backend already supports OAuth2 with the endpoint:
```
GET /oauth2/authorization/google
```

The mobile app will:
1. Use Google Sign-In SDK to get user's Google tokens
2. Send `idToken` and `accessToken` to your backend
3. Backend handles OAuth2 flow and returns user data + JWT token

## Android Setup

### 1. Get Google Services Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select your project
3. Enable Google+ API and Google Sign-In API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Create credentials for:
   - **Android app**: Use your app's package name and SHA-1 fingerprint
   - **Web application**: For your backend server

### 2. Get SHA-1 Fingerprint
```bash
# For debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release keystore
keytool -list -v -keystore /path/to/your/release.keystore -alias your_alias
```

### 3. Download google-services.json
1. Download `google-services.json` from Google Cloud Console
2. Place it in `android/app/google-services.json`

### 4. Update Android Configuration
Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

Add to `android/build.gradle`:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

Apply plugin in `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## iOS Setup

### 1. Get iOS Configuration
1. In Google Cloud Console, create OAuth 2.0 Client ID for iOS
2. Use your app's Bundle ID
3. Download `GoogleService-Info.plist`

### 2. Add Configuration File
1. Place `GoogleService-Info.plist` in `ios/Runner/`
2. Add it to Xcode project (drag & drop, ensure "Add to target" is checked)

### 3. Update iOS Configuration
Add to `ios/Runner/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>REVERSED_CLIENT_ID</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

Replace `YOUR_REVERSED_CLIENT_ID` with the value from `GoogleService-Info.plist`.

## Flutter Configuration

### 1. Update pubspec.yaml (Already Done)
```yaml
dependencies:
  google_sign_in: ^6.1.6
```

### 2. Configure Google Sign-In
The app is already configured to use:
```dart
final GoogleSignIn _googleSignIn = GoogleSignIn(
  scopes: ['email', 'profile'],
);
```

## Backend API Expected Format

Your backend should expect this request at `/oauth2/authorization/google`:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "accessToken": "ya29.a0AfH6SMC..."
}
```

And return:
```json
{
  "success": true,
  "token": "your_jwt_token",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    // ... other user fields
  }
}
```

## Testing

### 1. Debug Mode
- Use debug SHA-1 fingerprint for Android
- Test on real device (Google Sign-In doesn't work on emulator without Google Play Services)

### 2. Release Mode
- Use release SHA-1 fingerprint
- Test on real device with release build

## Troubleshooting

### Common Issues:
1. **"Sign in failed"**: Check SHA-1 fingerprint and package name
2. **"Network error"**: Verify backend endpoint is accessible
3. **"OAuth2 error"**: Check backend OAuth2 configuration
4. **iOS build error**: Ensure `GoogleService-Info.plist` is added to Xcode project

### Debug Steps:
1. Check network logs for API calls
2. Verify Google tokens are being generated
3. Test backend endpoint directly with Postman
4. Check Google Cloud Console for API quotas and errors

## Security Notes

1. **Never commit** `google-services.json` or `GoogleService-Info.plist` to version control if they contain sensitive data
2. Use different OAuth2 clients for debug/release builds
3. Implement proper token validation on backend
4. Set up proper CORS policies for your domain

## Current Implementation Status

✅ **Completed:**
- Flutter Google Sign-In integration
- AuthProvider with Google Sign-In methods
- API service with OAuth2 endpoints
- Login screen with Google button
- Error handling and loading states

🔄 **Next Steps:**
1. Configure Google Cloud Console
2. Add configuration files
3. Test on real devices
4. Deploy backend with OAuth2 support
