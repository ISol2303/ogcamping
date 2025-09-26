import '../services/api_service.dart';
import '../models/booking.dart';

class BookingRepository {
  final ApiService _apiService;

  BookingRepository(this._apiService);

  Future<Booking> createBooking({
    required String customerId,
    required List<dynamic> items, // Accept dynamic items (CartItem)
    required DateTime checkInDate,
    required DateTime checkOutDate,
    required int participants,
    required double totalAmount,
    String? notes,
    String? customerName,
    String? customerEmail,
    String? customerPhone,
  }) async {
    try {
      // Separate services and combos like in NextJS code
      final services =
          items.where((item) => item.type == BookingType.SERVICE).map((item) {
        // Extract numeric ID from composite ID (e.g., "1_2025-09-22" -> 1)
        final numericId = _extractNumericId(item.id);
        print('Service item.id: ${item.id} -> numericId: $numericId');

        // Get numberOfPeople from CartItem field
        final numberOfPeople = item.numberOfPeople ?? participants;
        print('Service numberOfPeople: $numberOfPeople');

        // Use dates from CartItem if available, otherwise use method parameters
        final itemCheckInDate = item.checkInDate ?? checkInDate;
        final itemCheckOutDate = item.checkOutDate ?? checkOutDate;
        
        print('Service dates - CheckIn: $itemCheckInDate, CheckOut: $itemCheckOutDate');
        
        return {
          'serviceId': numericId,
          'checkInDate': '${itemCheckInDate.toIso8601String().split('T')[0]}T08:00:00',
          'checkOutDate': '${itemCheckOutDate.toIso8601String().split('T')[0]}T12:00:00',
          'numberOfPeople': numberOfPeople,
        };
      }).toList();

      final combos =
          items.where((item) => item.type == BookingType.COMBO).map((item) {
        // Extract numeric ID from composite ID
        final numericId = _extractNumericId(item.id);
        print('Combo item.id: ${item.id} -> numericId: $numericId');

        // Use dates from CartItem if available, otherwise use method parameters
        final itemCheckInDate = item.checkInDate ?? checkInDate;
        final itemCheckOutDate = item.checkOutDate ?? checkOutDate;
        
        print('Combo dates - CheckIn: $itemCheckInDate, CheckOut: $itemCheckOutDate');
        
        return {
          'comboId': numericId,
          'quantity': item.quantity,
          'checkInDate': '${itemCheckInDate.toIso8601String().split('T')[0]}T08:00:00',
          'checkOutDate': '${itemCheckOutDate.toIso8601String().split('T')[0]}T12:00:00',
          'extraPeople': 0,
        };
      }).toList();

      // Add equipment handling
      final equipments =
          items.where((item) => item.type == BookingType.EQUIPMENT).map((item) {
        // Extract numeric ID from composite ID
        final numericId = _extractNumericId(item.id);
        print('Equipment item.id: ${item.id} -> numericId: $numericId');

        // Get rental days from CartItem details
        final rentalDays = item.details['rentalDays'] ?? 1;
        print('Equipment rentalDays: $rentalDays');

        // Use dates from CartItem if available, otherwise use method parameters
        final itemCheckInDate = item.checkInDate ?? checkInDate;
        final itemCheckOutDate = item.checkOutDate ?? checkOutDate;
        
        print('Equipment dates - CheckIn: $itemCheckInDate, CheckOut: $itemCheckOutDate');
        
        return {
          'equipmentId': numericId,
          'quantity': item.quantity,
          'rentalDays': rentalDays,
          'checkInDate': '${itemCheckInDate.toIso8601String().split('T')[0]}T08:00:00',
          'checkOutDate': '${itemCheckOutDate.toIso8601String().split('T')[0]}T12:00:00',
        };
      }).toList();

      // Check if we have equipment items - use different API
      if (equipments.isNotEmpty) {
        // Use equipment order API for equipment items - same format as web
        print('Customer data from AuthProvider:');
        print('- customerName: $customerName');
        print('- customerEmail: $customerEmail');
        print('- customerPhone: $customerPhone');
        
        final orderData = {
          'userId': int.parse(customerId),
          'customerName': customerName ?? 'Mobile User',
          'email': customerEmail ?? 'mobile@example.com',
          'phone': customerPhone ?? '0123456789',
          'totalPrice': totalAmount,
          'items': equipments.map((equipment) => {
            'itemType': 'GEAR',
            'itemId': equipment['equipmentId'],
            'quantity': equipment['quantity'],
            'rentalDays': equipment['rentalDays'],
            'unitPrice': 0.0, // Will be filled by backend
            'totalPrice': 0.0, // Will be calculated by backend
          }).toList(),
        };

        print('Creating equipment order with data: $orderData');
        print('CustomerId: $customerId');

        await _apiService.createEquipmentOrder(
            customerId, orderData);
        
        // Simple success response - don't parse complex JSON
        return Booking.fromJson({
          'id': 'equipment_${DateTime.now().millisecondsSinceEpoch}',
          'customerId': int.parse(customerId),
          'services': [],
          'combos': [],
          'equipments': equipments,
          'checkInDate': null,
          'checkOutDate': null,
          'bookingDate': DateTime.now().toIso8601String(),
          'numberOfPeople': null,
          'status': 'PENDING',
          'payment': null,
          'note': notes ?? '',
          'staff': null,
          'internalNotes': null,
          'totalPrice': totalAmount,
          'hasReview': false,
        });
      } else {
        // Use regular booking API for services and combos only
        final bookingData = {
          'services': services,
          'combos': combos,
          'note': notes ?? '',
        };

        print('Creating booking with data: $bookingData');
        print('CustomerId: $customerId');

        final response = await _apiService.createBookingWithCustomerId(
            customerId, bookingData);
        
        return Booking.fromJson(response);
      }
    } catch (e) {
      print('BookingRepository.createBooking error: $e');
      throw Exception('Failed to create booking: $e');
    }
  }

  // Helper method to extract numeric ID from composite ID
  int _extractNumericId(String compositeId) {
    try {
      // Handle composite IDs like "1_2025-09-22" -> extract "1"
      if (compositeId.contains('_')) {
        final parts = compositeId.split('_');
        return int.parse(parts[0]);
      }
      // Handle simple numeric IDs
      return int.parse(compositeId);
    } catch (e) {
      print('Error extracting numeric ID from: $compositeId, error: $e');
      // Return 0 as fallback, but this should be handled properly
      return 0;
    }
  }

  Future<List<Booking>> getUserBookings(String userId) async {
    try {
      final response = await _apiService.getUserBookings(userId);
      return response.map((json) => Booking.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load user bookings: $e');
    }
  }

  Future<Booking> getBookingById(String bookingId) async {
    try {
      // In a real implementation, this would call a specific API endpoint
      // For now, we'll simulate by getting all bookings and finding the one
      throw UnimplementedError('getBookingById not implemented in mock API');
    } catch (e) {
      throw Exception('Failed to load booking: $e');
    }
  }

  Future<bool> cancelBooking(String bookingId) async {
    try {
      // In a real implementation, this would call the cancel booking API
      // For now, we'll simulate a successful cancellation
      await Future.delayed(Duration(seconds: 1));
      return true;
    } catch (e) {
      throw Exception('Failed to cancel booking: $e');
    }
  }

  Future<List<Booking>> getBookingHistory(String userId) async {
    try {
      final allBookings = await getUserBookings(userId);
      return allBookings
          .where((booking) =>
              booking.status == BookingStatus.completed ||
              booking.status == BookingStatus.cancelled)
          .toList();
    } catch (e) {
      throw Exception('Failed to load booking history: $e');
    }
  }

  Future<List<Booking>> getUpcomingBookings(String userId) async {
    try {
      final allBookings = await getUserBookings(userId);
      return allBookings
          .where((booking) =>
              booking.status == BookingStatus.confirmed &&
              booking.checkInDate.isAfter(DateTime.now()))
          .toList();
    } catch (e) {
      throw Exception('Failed to load upcoming bookings: $e');
    }
  }

  Future<double> calculateBookingTotal({
    required List<BookingItem> items,
    required DateTime checkInDate,
    required DateTime checkOutDate,
  }) async {
    try {
      final days = checkOutDate.difference(checkInDate).inDays;
      double total = 0;

      for (final item in items) {
        if (item.type == BookingType.SERVICE ||
            item.type == BookingType.COMBO) {
          total += item.price * days * item.quantity;
        } else if (item.type == BookingType.EQUIPMENT) {
          total += item.price * days * item.quantity;
        }
      }

      return total;
    } catch (e) {
      throw Exception('Failed to calculate booking total: $e');
    }
  }
}
