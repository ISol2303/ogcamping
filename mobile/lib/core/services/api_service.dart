import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/camping_service.dart';
import '../models/combo_package.dart';
import '../models/equipment.dart';
import '../models/user.dart';
import '../models/customer.dart';
import '../models/booking_response.dart';

class ApiService {
  // Backend URL - detect platform and use appropriate URL
  static String get baseUrl {
    // For Flutter web, use the same host as the web app
    if (kIsWeb) {
      return 'http://localhost:8080/apis/v1';
    }
    // For mobile, use IP address for real device connectivity
    return 'http://192.168.56.1:8080/apis/v1';
  }

  static const Duration requestTimeout =
      Duration(seconds: 60); // Increase timeout

  // Simulate network delay
  Future<void> _simulateDelay() async {
    await Future.delayed(Duration(milliseconds: Random().nextInt(1000) + 500));
  }

  // Auth APIs
  Future<Map<String, dynamic>> login(String email, String password) async {
    await _simulateDelay();

    // Mock successful login
    if (email.isNotEmpty && password.isNotEmpty) {
      return {
        'success': true,
        'token': 'mock_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
        'user': {
          'id': 'user_1',
          'email': email,
          'fullName': 'Nguyễn Văn A',
          'phoneNumber': '0123456789',
          'avatar': 'https://via.placeholder.com/150',
          'createdAt':
              DateTime.now().subtract(Duration(days: 30)).toIso8601String(),
        }
      };
    }

    throw Exception('Invalid credentials');
  }

  Future<Map<String, dynamic>> googleSignIn(String idToken) async {
    await _simulateDelay();

    return {
      'success': true,
      'token': 'mock_google_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
      'user': {
        'id': 'google_user_1',
        'email': 'user@gmail.com',
        'fullName': 'Google User',
        'avatar': 'https://via.placeholder.com/150',
        'createdAt': DateTime.now().toIso8601String(),
      }
    };
  }

  // Services APIs
  Future<List<Map<String, dynamic>>> getCampingServices() async {
    try {
      print('Fetching services from: $baseUrl/services');
      final response = await http.get(
        Uri.parse('$baseUrl/services'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(requestTimeout);

      print('Services API Response Status: ${response.statusCode}');
      print('Services API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        print('Successfully loaded ${data.length} services');
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception(
            'Failed to load services: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error fetching services: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> getCampingServiceById(String id) async {
    try {
      print('Fetching service by ID from: $baseUrl/services/$id');
      final response = await http.get(
        Uri.parse('$baseUrl/services/$id'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(requestTimeout);

      print('Service by ID API Response Status: ${response.statusCode}');
      print('Service by ID API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('Successfully loaded service by ID: ${data['name']}');
        return data;
      } else {
        throw Exception(
            'Failed to load service: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error fetching service by ID: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getServiceAvailability(
      String serviceId) async {
    try {
      print(
          'Fetching availability for service ID: $serviceId from: $baseUrl/services/$serviceId/availability');
      final response = await http.get(
        Uri.parse('$baseUrl/services/$serviceId/availability'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(requestTimeout);

      print('Availability API Response Status: ${response.statusCode}');
      print('Availability API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        print('Successfully loaded ${data.length} availability slots');
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception(
            'Failed to load availability: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error fetching availability: $e');
      throw Exception('Network error: $e');
    }
  }

  // Equipment APIs
  Future<List<Map<String, dynamic>>> getEquipment() async {
    await _simulateDelay();

    return [
      {
        'id': 'equipment_1',
        'name': 'Lều 4 người Coleman',
        'description': 'Lều cắm trại chất lượng cao cho 4 người',
        'images': ['https://via.placeholder.com/400x300'],
        'pricePerDay': 200000.0,
        'category': 'tent',
        'status': 'available',
        'quantity': 10,
        'availableQuantity': 7,
        'brand': 'Coleman',
        'specifications': {
          'capacity': '4 người',
          'weight': '5.2kg',
          'waterproof': 'Có',
        },
        'rating': 4.6,
        'reviewCount': 45,
        'createdAt':
            DateTime.now().subtract(Duration(days: 30)).toIso8601String(),
      },
      {
        'id': 'equipment_2',
        'name': 'Bếp gas mini',
        'description': 'Bếp gas di động tiện lợi cho cắm trại',
        'images': ['https://via.placeholder.com/400x300'],
        'pricePerDay': 50000.0,
        'category': 'cooking',
        'status': 'available',
        'quantity': 15,
        'availableQuantity': 12,
        'brand': 'Kovea',
        'specifications': {
          'fuel': 'Gas butane',
          'weight': '1.2kg',
          'power': '3000W',
        },
        'rating': 4.4,
        'reviewCount': 32,
        'createdAt':
            DateTime.now().subtract(Duration(days: 25)).toIso8601String(),
      },
    ];
  }

  // Combo APIs
  Future<List<Map<String, dynamic>>> getComboPackages() async {
    try {
      print('Fetching combos from: $baseUrl/combos');
      final response = await http.get(
        Uri.parse('$baseUrl/combos'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(requestTimeout);

      print('Combos API Response Status: ${response.statusCode}');
      print('Combos API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        print('Successfully loaded ${data.length} combos');
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception(
            'Failed to load combos: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error fetching combos: $e');
      throw Exception('Network error: $e');
    }
  }

  // Booking APIs
  Future<Map<String, dynamic>> createBooking(
      Map<String, dynamic> bookingData) async {
    await _simulateDelay();

    // Mock successful booking creation
    return {
      'success': true,
      'booking': {
        'id': 'booking_${DateTime.now().millisecondsSinceEpoch}',
        'userId': bookingData['userId'],
        'items': bookingData['items'],
        'checkInDate': bookingData['checkInDate'],
        'checkOutDate': bookingData['checkOutDate'],
        'participants': bookingData['participants'],
        'totalAmount': bookingData['totalAmount'],
        'notes': bookingData['notes'],
        'status': 'PENDING',
        'createdAt': DateTime.now().toIso8601String(),
      }
    };
  }

  // Real API call for creating booking with customerId
  Future<Map<String, dynamic>> createBookingWithCustomerId(
      String customerId, Map<String, dynamic> bookingData) async {
    try {
      print(
          'Creating booking API call: POST $baseUrl/bookings?customerId=$customerId');
      print('Request body: $bookingData');

      final response = await http
          .post(
            Uri.parse('$baseUrl/bookings?customerId=$customerId'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode(bookingData),
          )
          .timeout(requestTimeout);

      print('Booking API Response Status: ${response.statusCode}');
      print('Booking API Response Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception(
            'Failed to create booking: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Create booking API error: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getUserBookings(String userId) async {
    await _simulateDelay();

    return [
      {
        'id': 'booking_1',
        'userId': userId,
        'items': [
          {
            'id': 'service_1',
            'type': 'service',
            'quantity': 1,
            'price': 1500000.0,
            'details': {'name': 'Luxury Glamping Experience'}
          }
        ],
        'checkInDate': DateTime.now().add(Duration(days: 7)).toIso8601String(),
        'checkOutDate': DateTime.now().add(Duration(days: 9)).toIso8601String(),
        'participants': 2,
        'totalAmount': 3000000.0,
        'status': 'confirmed',
        'createdAt':
            DateTime.now().subtract(Duration(days: 3)).toIso8601String(),
      }
    ];
  }

  // AI Chat APIs
  Future<Map<String, dynamic>> sendChatMessage(String message) async {
    await _simulateDelay();

    // Simple mock AI responses
    String aiResponse = _generateAIResponse(message);

    return {
      'success': true,
      'message': {
        'id': 'msg_${DateTime.now().millisecondsSinceEpoch}',
        'content': aiResponse,
        'type': 'text',
        'sender': 'ai',
        'timestamp': DateTime.now().toIso8601String(),
        'suggestions': [
          'Tôi muốn xem thêm dịch vụ glamping',
          'Gợi ý combo cho gia đình 4 người',
          'Thiết bị cần thiết cho cắm trại'
        ]
      }
    };
  }

  String _generateAIResponse(String userMessage) {
    final responses = [
      'Chào bạn! Tôi có thể giúp bạn tìm kiếm dịch vụ cắm trại phù hợp. Bạn đang tìm kiếm loại hình cắm trại nào?',
      'Dựa trên nhu cầu của bạn, tôi gợi ý gói Glamping sang trọng tại Đà Lạt. Bạn có muốn xem chi tiết không?',
      'Để có trải nghiệm tốt nhất, bạn nên chuẩn bị: lều, túi ngủ, bếp gas và đèn pin. Chúng tôi có thể cho thuê tất cả!',
      'Combo Weekend Glamping đang có ưu đãi 20%! Bao gồm chỗ ở, thiết bị và bữa ăn cho 4 người trong 2 ngày.',
    ];

    return responses[Random().nextInt(responses.length)];
  }

  // Reviews APIs
  Future<List<Map<String, dynamic>>> getReviews(
      String itemId, String itemType) async {
    await _simulateDelay();

    return [
      {
        'id': 'review_1',
        'userId': 'user_2',
        'userName': 'Trần Thị B',
        'userAvatar': 'https://via.placeholder.com/50',
        'itemId': itemId,
        'itemType': itemType,
        'rating': 5.0,
        'comment': 'Dịch vụ tuyệt vời! Sẽ quay lại lần sau.',
        'images': [],
        'createdAt':
            DateTime.now().subtract(Duration(days: 5)).toIso8601String(),
      }
    ];
  }

  // User APIs
  Future<User> getUserById(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/$userId'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(requestTimeout);

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        return User.fromJson(data);
      } else {
        throw Exception('Failed to load user: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Customer APIs
  Future<Customer> getCustomerById(int customerId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/customers/$customerId'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(requestTimeout);

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        return Customer.fromJson(data);
      } else {
        throw Exception('Failed to load customer: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Get headers with CORS support for web
  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add CORS headers for web
    if (kIsWeb) {
      headers.addAll({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
    }

    return headers;
  }

  // Booking APIs - Real API
  Future<List<BookingResponse>> getCustomerBookings(int customerId) async {
    try {
      print(
          'Fetching customer bookings from: $baseUrl/bookings/customer/$customerId');

      final response = await http
          .get(
            Uri.parse('$baseUrl/bookings/customer/$customerId'),
            headers: _headers,
          )
          .timeout(requestTimeout);

      print('Customer bookings API Response Status: ${response.statusCode}');
      print('Customer bookings API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        // Check if response body is empty or null
        if (response.body.isEmpty || response.body == 'null') {
          print('Empty response body, returning empty list');
          return [];
        }

        final dynamic decodedData = json.decode(response.body);

        // Handle case where API returns null
        if (decodedData == null) {
          print('API returned null, returning empty list');
          return [];
        }

        // Handle case where API returns a single object instead of array
        if (decodedData is Map<String, dynamic>) {
          print('API returned single object, wrapping in array');
          return [BookingResponse.fromJson(decodedData)];
        }

        // Handle normal array response
        if (decodedData is List) {
          print('Successfully loaded ${decodedData.length} bookings');
          return decodedData
              .where((booking) => booking != null) // Filter out null items
              .map((booking) {
                try {
                  return BookingResponse.fromJson(
                      booking as Map<String, dynamic>);
                } catch (e) {
                  print('Error parsing booking: $e');
                  print('Problematic booking data: $booking');
                  return null;
                }
              })
              .where((booking) => booking != null)
              .cast<BookingResponse>()
              .toList();
        }

        throw Exception(
            'Unexpected response format: ${decodedData.runtimeType}');
      } else if (response.statusCode == 404) {
        print('Customer not found or no bookings, returning empty list');
        return [];
      } else {
        throw Exception(
            'Failed to load bookings: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error in getCustomerBookings: $e');
      throw Exception('Network error: $e');
    }
  }

  // Login API
  Future<Map<String, dynamic>> loginWithEmail(
      String email, String password) async {
    try {
      final url = '$baseUrl/login';
      print('Login API URL: $url');
      print('Login Request: ${json.encode({
            "email": email,
            "password": password
          })}');

      final response = await http
          .post(
            Uri.parse(url),
            headers: _headers,
            body: json.encode({
              'email': email,
              'password': password,
            }),
          )
          .timeout(requestTimeout);

      print('Login Response Status: ${response.statusCode}');
      print('Login Response Body: ${response.body}');

      if (response.statusCode == 200) {
        try {
          final jsonResponse = json.decode(response.body);

          // Transform backend response to match app expectations
          return {
            'success': true,
            'token': jsonResponse['token'],
            'user': {
              'id': jsonResponse['id'],
              'name': jsonResponse['fullname'], // Backend uses 'fullname'
              'email': jsonResponse['email'],
              'role': jsonResponse['role'],
              'phone': null, // Not provided by backend
              'address': null, // Not provided by backend
              'status': 'ACTIVE',
              'agreeMarketing': false,
              'createdAt': DateTime.now().toIso8601String(),
            }
          };
        } catch (e) {
          print('JSON Parse Error: $e');
          throw Exception('Server returned invalid JSON: ${response.body}');
        }
      } else {
        // Handle error response - backend returns plain text error
        String errorMessage = response.body;
        if (errorMessage.contains('Email hoặc mật khẩu không đúng')) {
          throw Exception('Email hoặc mật khẩu không đúng');
        } else {
          throw Exception(
              'Login failed (${response.statusCode}): $errorMessage');
        }
      }
    } catch (e) {
      print('Login Network Error: $e');
      if (e.toString().contains('Email hoặc mật khẩu không đúng')) {
        throw Exception('Email hoặc mật khẩu không đúng');
      }
      throw Exception('Network error: $e');
    }
  }

  // Register endpoint
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
    String? phone,
    String? address,
  }) async {
    try {
      print('Register API URL: $baseUrl/register');
      print('Register Request: ${json.encode({
            'email': email,
            'password': password,
            'name': name,
            'phone': phone,
            'address': address
          })}');

      final response = await http
          .post(
            Uri.parse('$baseUrl/register'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'email': email,
              'password': password,
              'fullname':
                  name, // Backend might expect 'fullname' instead of 'name'
              'phone': phone,
              'address': address,
            }),
          )
          .timeout(requestTimeout);

      print('Register Response Status: ${response.statusCode}');
      print('Register Response Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        try {
          final jsonResponse = json.decode(response.body);

          // Transform backend response to match app expectations
          return {
            'success': true,
            'token': jsonResponse['token'],
            'user': {
              'id': jsonResponse['id'],
              'name': jsonResponse['fullname'], // Backend uses 'fullname'
              'email': jsonResponse['email'],
              'role': jsonResponse['role'] ?? 'CUSTOMER',
              'phone': phone,
              'address': address,
              'status': 'ACTIVE',
              'agreeMarketing': false,
              'createdAt': DateTime.now().toIso8601String(),
            }
          };
        } catch (e) {
          print('Register JSON Parse Error: $e');
          throw Exception('Server returned invalid JSON: ${response.body}');
        }
      } else {
        // Handle error response
        String errorMessage = response.body;
        if (errorMessage.contains('Email đã tồn tại')) {
          throw Exception('Email đã tồn tại');
        } else if (errorMessage.contains('Email already exists')) {
          throw Exception('Email đã tồn tại');
        } else {
          throw Exception(
              'Registration failed (${response.statusCode}): $errorMessage');
        }
      }
    } catch (e) {
      print('Register Network Error: $e');
      if (e.toString().contains('Email đã tồn tại') ||
          e.toString().contains('Email already exists')) {
        throw Exception('Email đã tồn tại');
      }
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> loginWithGoogle(String googleToken) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/google'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'token': googleToken,
            }),
          )
          .timeout(requestTimeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Google login failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // OAuth2 Google login (matching your backend OAuth2 flow)
  Future<Map<String, dynamic>> oauth2GoogleLogin(
      String idToken, String accessToken) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/oauth2/authorization/google'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'idToken': idToken,
              'accessToken': accessToken,
            }),
          )
          .timeout(requestTimeout);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('OAuth2 Google login failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('OAuth2 Network error: $e');
    }
  }
}
