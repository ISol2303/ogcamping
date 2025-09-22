# API Test Guide for Login/Register

## Overview
This guide helps you test the login and register functionality with your backend APIs.

## Backend Endpoints

### 1. Login Endpoint
```
POST /apis/v1/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Expected Response (Success):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "phone": "+84123456789",
    "address": "123 Main St",
    "status": "ACTIVE",
    "agreeMarketing": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}

Expected Response (Error):
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 2. Register Endpoint
```
POST /apis/v1/register
Content-Type: application/json

Request Body:
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+84987654321",  // optional
  "address": "456 Oak St"   // optional
}

Expected Response (Success):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "newuser@example.com",
    "role": "CUSTOMER",
    "phone": "+84987654321",
    "address": "456 Oak St",
    "status": "ACTIVE",
    "agreeMarketing": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}

Expected Response (Error):
{
  "success": false,
  "message": "Email already exists"
}
```

## Mobile App Configuration

### Current API Base URL:
```dart
static const String baseUrl = 'http://localhost:8080/apis/v1';
```

### Update if needed:
1. Open `lib/core/services/api_service.dart`
2. Change `baseUrl` to match your backend server
3. Common configurations:
   - Local development: `http://10.0.2.2:8080/apis/v1`
   - Network testing: `http://YOUR_IP:8080/apis/v1`
   - Production: `https://yourdomain.com/apis/v1`

## Testing Steps

### 1. Test with Postman/curl

#### Login Test:
```bash
curl -X POST http://localhost:8080/apis/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Register Test:
```bash
curl -X POST http://localhost:8080/apis/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Test with Mobile App

#### Login Flow:
1. Open app → Login screen
2. Enter email and password
3. Tap "Đăng nhập"
4. Check network logs for API call
5. Verify successful navigation to home screen

#### Register Flow:
1. Open app → Login screen → "Đăng ký ngay"
2. Fill registration form
3. Agree to terms and conditions
4. Tap "Đăng ký"
5. Check network logs for API call
6. Verify successful navigation to home screen

## Debugging

### 1. Network Issues
- Check if backend server is running
- Verify API base URL is correct
- Check firewall/network connectivity
- Use `flutter logs` to see network errors

### 2. API Response Issues
- Verify response format matches expected structure
- Check HTTP status codes (200 for success)
- Ensure `success` field is boolean
- Verify `user` object structure matches User model

### 3. Authentication Issues
- Check JWT token format
- Verify token is saved to SharedPreferences
- Test token validation on subsequent API calls

## Error Handling

### Common Error Messages:
- "Network error: ..." → Connection issues
- "Login failed: 401" → Invalid credentials
- "Registration failed: 400" → Invalid input data
- "Email already exists" → Duplicate email

### Mobile App Error Display:
- Errors shown in red SnackBar
- Loading states with LoadingOverlay
- Form validation messages
- Network timeout handling (60 seconds)

## User Model Structure

The app expects this User model structure:
```dart
class User {
  final int id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? address;
  final String status;
  final bool agreeMarketing;
  final DateTime createdAt;
}
```

Make sure your backend returns user data in this format.

## Next Steps

1. **Test Backend APIs** with Postman/curl first
2. **Update API base URL** in mobile app if needed
3. **Test mobile app** login/register flows
4. **Check network logs** for debugging
5. **Verify user data** is saved correctly
6. **Test navigation** to home screen after auth

## Support

If you encounter issues:
1. Check backend server logs
2. Check mobile app logs (`flutter logs`)
3. Verify API response format
4. Test with different user credentials
5. Check network connectivity between app and server
