import 'dart:math';

class ApiService {
  static const String baseUrl = 'https://api.ogcamping.com/v1';
  static const Duration requestTimeout = Duration(seconds: 30);

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
          'createdAt': DateTime.now().subtract(Duration(days: 30)).toIso8601String(),
        }
      };
    }
    
    throw Exception('Invalid credentials');
  }

  Future<Map<String, dynamic>> register(String email, String password, String fullName) async {
    await _simulateDelay();
    
    return {
      'success': true,
      'message': 'Registration successful',
      'user': {
        'id': 'user_${DateTime.now().millisecondsSinceEpoch}',
        'email': email,
        'fullName': fullName,
        'createdAt': DateTime.now().toIso8601String(),
      }
    };
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
    await _simulateDelay();
    
    return [
      {
        'id': 'service_1',
        'name': 'Luxury Glamping Experience',
        'description': 'Trải nghiệm cắm trại sang trọng với đầy đủ tiện nghi hiện đại',
        'images': [
          'https://via.placeholder.com/400x300',
          'https://via.placeholder.com/400x300',
        ],
        'pricePerNight': 1500000.0,
        'type': 'glamping',
        'status': 'available',
        'location': 'Đà Lạt, Lâm Đồng',
        'maxCapacity': 4,
        'amenities': ['WiFi', 'Điều hòa', 'Phòng tắm riêng', 'Bếp nấu ăn'],
        'rating': 4.8,
        'reviewCount': 125,
        'createdAt': DateTime.now().subtract(Duration(days: 60)).toIso8601String(),
      },
      {
        'id': 'service_2',
        'name': 'Traditional Camping',
        'description': 'Cắm trại truyền thống gần gũi với thiên nhiên',
        'images': [
          'https://via.placeholder.com/400x300',
          'https://via.placeholder.com/400x300',
        ],
        'pricePerNight': 500000.0,
        'type': 'camping',
        'status': 'available',
        'location': 'Sapa, Lào Cai',
        'maxCapacity': 6,
        'amenities': ['Lửa trại', 'Khu vệ sinh chung', 'Bãi đậu xe'],
        'rating': 4.5,
        'reviewCount': 89,
        'createdAt': DateTime.now().subtract(Duration(days: 45)).toIso8601String(),
      },
    ];
  }

  Future<Map<String, dynamic>> getCampingServiceById(String id) async {
    await _simulateDelay();
    
    final services = await getCampingServices();
    final service = services.firstWhere((s) => s['id'] == id);
    return service;
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
        'createdAt': DateTime.now().subtract(Duration(days: 30)).toIso8601String(),
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
        'createdAt': DateTime.now().subtract(Duration(days: 25)).toIso8601String(),
      },
    ];
  }

  // Combo APIs
  Future<List<Map<String, dynamic>>> getComboPackages() async {
    await _simulateDelay();
    
    return [
      {
        'id': 'combo_1',
        'name': 'Weekend Glamping Package',
        'description': 'Gói cắm trại cuối tuần hoàn hảo cho gia đình',
        'images': ['https://via.placeholder.com/400x300'],
        'originalPrice': 2500000.0,
        'discountedPrice': 2000000.0,
        'discountPercentage': 20.0,
        'serviceIds': ['service_1'],
        'equipmentIds': ['equipment_1', 'equipment_2'],
        'includedMeals': ['Bữa tối BBQ', 'Bữa sáng'],
        'activities': ['Trekking', 'Câu cá', 'Lửa trại'],
        'maxParticipants': 4,
        'durationDays': 2,
        'isPopular': true,
        'rating': 4.9,
        'reviewCount': 78,
        'createdAt': DateTime.now().subtract(Duration(days: 20)).toIso8601String(),
      },
    ];
  }

  // Booking APIs
  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
    await _simulateDelay();
    
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
        'status': 'pending',
        'notes': bookingData['notes'],
        'createdAt': DateTime.now().toIso8601String(),
      }
    };
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
        'createdAt': DateTime.now().subtract(Duration(days: 3)).toIso8601String(),
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
  Future<List<Map<String, dynamic>>> getReviews(String itemId, String itemType) async {
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
        'createdAt': DateTime.now().subtract(Duration(days: 5)).toIso8601String(),
      }
    ];
  }
}
