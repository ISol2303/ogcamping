import '../services/api_service.dart';
import '../models/booking.dart';

class BookingRepository {
  final ApiService _apiService;

  BookingRepository(this._apiService);

  Future<Booking> createBooking({
    required String userId,
    required List<BookingItem> items,
    required DateTime checkInDate,
    required DateTime checkOutDate,
    required int participants,
    required double totalAmount,
    String? notes,
  }) async {
    try {
      final bookingData = {
        'userId': userId,
        'items': items.map((item) => item.toJson()).toList(),
        'checkInDate': checkInDate.toIso8601String(),
        'checkOutDate': checkOutDate.toIso8601String(),
        'participants': participants,
        'totalAmount': totalAmount,
        'notes': notes,
      };

      final response = await _apiService.createBooking(bookingData);

      if (response['success'] == true) {
        return Booking.fromJson(response['booking']);
      }

      throw Exception('Failed to create booking');
    } catch (e) {
      throw Exception('Failed to create booking: $e');
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
