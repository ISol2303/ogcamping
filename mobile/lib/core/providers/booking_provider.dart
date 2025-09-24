import 'package:flutter/foundation.dart';
import '../models/booking.dart';
import '../models/booking_response.dart';
import '../models/camping_service.dart';
import '../models/equipment.dart';
import '../models/combo_package.dart';
import '../repositories/booking_repository.dart';
import '../services/api_service.dart';

class CartItem {
  final String id;
  final String name;
  final BookingType type;
  final double price;
  int quantity;
  final Map<String, dynamic> details;
  
  // Booking specific fields
  DateTime? checkInDate;
  DateTime? checkOutDate;
  int numberOfPeople;

  CartItem({
    required this.id,
    required this.name,
    required this.type,
    required this.price,
    this.quantity = 1,
    required this.details,
    this.checkInDate,
    this.checkOutDate,
    this.numberOfPeople = 1,
  });

  double get totalPrice => price * quantity;
  
  bool get needsBookingInfo => type == BookingType.SERVICE || type == BookingType.COMBO;
  bool get hasCompleteBookingInfo => !needsBookingInfo || 
    (checkInDate != null && checkOutDate != null && numberOfPeople > 0);
}

class BookingProvider extends ChangeNotifier {
  final BookingRepository _bookingRepository;
  final ApiService _apiService = ApiService();

  BookingProvider(this._bookingRepository);

  // Cart items
  List<CartItem> _cartItems = [];

  // Booking dates and participants
  DateTime? _checkInDate;
  DateTime? _checkOutDate;
  int _participants = 1;

  // Bookings
  List<Booking> _bookings = [];
  bool _bookingsLoading = false;
  String? _bookingsError;

  // Current booking process
  bool _isBooking = false;
  String? _bookingError;
  int? _lastBookingId;

  // Getters
  List<CartItem> get cartItems => _cartItems;
  DateTime? get checkInDate => _checkInDate;
  DateTime? get checkOutDate => _checkOutDate;
  int get participants => _participants;

  List<Booking> get bookings => _bookings;
  bool get bookingsLoading => _bookingsLoading;
  String? get bookingsError => _bookingsError;

  bool get isBooking => _isBooking;
  String? get bookingError => _bookingError;
  int? get lastBookingId => _lastBookingId;

  bool get hasItems => _cartItems.isNotEmpty;
  int get itemCount => _cartItems.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal =>
      _cartItems.fold(0, (sum, item) => sum + item.totalPrice);
  double get tax => subtotal * 0.1; // 10% tax
  double get total => subtotal + tax;

  int get durationDays {
    if (_checkInDate == null || _checkOutDate == null) return 1;
    return _checkOutDate!.difference(_checkInDate!).inDays;
  }

  double get totalWithDuration => total * durationDays;

  List<Booking> get upcomingBookings => _bookings
      .where((booking) =>
          booking.status == BookingStatus.confirmed &&
          booking.checkInDate.isAfter(DateTime.now()))
      .toList();

  List<Booking> get pastBookings => _bookings
      .where((booking) =>
          booking.status == BookingStatus.completed ||
          booking.status == BookingStatus.cancelled ||
          booking.checkOutDate.isBefore(DateTime.now()))
      .toList();

  // Cart methods
  void addToCart(CartItem item) {
    final existingIndex = _cartItems.indexWhere((cartItem) => 
        cartItem.id == item.id && cartItem.type == item.type);

    if (existingIndex >= 0) {
      _cartItems[existingIndex].quantity += item.quantity;
    } else {
      _cartItems.add(item);
    }

    notifyListeners();
  }

  void addServiceToCart(CampingService service, {int quantity = 1, String? selectedDate, int? numberOfPeople}) {
    // Create unique ID that includes date for services
    final uniqueId = selectedDate != null 
        ? '${service.id}_$selectedDate'
        : service.id.toString();

    // Calculate checkout date based on maxDays
    DateTime? checkInDate;
    DateTime? checkOutDate;
    
    if (selectedDate != null) {
      try {
        checkInDate = DateTime.parse(selectedDate);
        // Checkout date = check-in date + maxDays
        checkOutDate = checkInDate.add(Duration(days: service.maxDays));
        
        print('Service ${service.name}:');
        print('- Check-in: $checkInDate (${selectedDate})');
        print('- Check-out: $checkOutDate (maxDays: ${service.maxDays})');
      } catch (e) {
        print('Error parsing selectedDate: $selectedDate, error: $e');
      }
    }
        
    final cartItem = CartItem(
      id: uniqueId,
      name: service.name,
      type: BookingType.SERVICE,
      price: service.pricePerNight,
      quantity: quantity,
      numberOfPeople: numberOfPeople ?? 1,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      details: {
        'name': service.name,
        'location': service.location,
        'maxCapacity': service.maxCapacity,
        'extraFeePerPerson': service.extraFeePerPerson,
        'allowExtraPeople': service.allowExtraPeople,
        'maxExtraPeople': service.maxExtraPeople,
        'maxDays': service.maxDays,
        'type': service.type.toString().split('.').last,
        'selectedDate': selectedDate,
        'serviceId': service.id,
      },
    );

    addToCart(cartItem);
  }

  void addEquipmentToCart(Equipment equipment, {int quantity = 1}) {
    final cartItem = CartItem(
      id: equipment.id,
      name: equipment.name,
      type: BookingType.EQUIPMENT,
      price: equipment.pricePerDay,
      quantity: quantity,
      details: {
        'name': equipment.name,
        'brand': equipment.brand,
        'category': equipment.category.toString().split('.').last,
      },
    );

    addToCart(cartItem);
  }

  void addComboToCart(ComboPackage combo, {int quantity = 1, String? selectedDate, int? numberOfPeople}) {
    // Create unique ID that includes date for combos
    final uniqueId = selectedDate != null 
        ? '${combo.id}_$selectedDate'
        : combo.id.toString();

    // Calculate checkout date based on maxDays
    DateTime? checkInDate;
    DateTime? checkOutDate;
    
    if (selectedDate != null) {
      try {
        checkInDate = DateTime.parse(selectedDate);
        // Checkout date = check-in date + maxDays
        checkOutDate = checkInDate.add(Duration(days: combo.maxDays));
        
        print('Combo ${combo.name}:');
        print('- Check-in: $checkInDate (${selectedDate})');
        print('- Check-out: $checkOutDate (maxDays: ${combo.maxDays})');
      } catch (e) {
        print('Error parsing selectedDate: $selectedDate, error: $e');
      }
    }

    final cartItem = CartItem(
      id: uniqueId,
      name: combo.name,
      type: BookingType.COMBO,
      price: combo.discountedPrice,
      quantity: quantity,
      numberOfPeople: numberOfPeople ?? combo.minPeople ?? 1,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      details: {
        'name': combo.name,
        'durationDays': combo.durationDays,
        'maxDays': combo.maxDays,
        'maxParticipants': combo.maxParticipants,
        'activities': combo.activities,
        'selectedDate': selectedDate,
        'comboId': combo.id,
      },
    );

    addToCart(cartItem);
  }

  void removeFromCart(String id, BookingType type, {String? selectedDate}) {
    _cartItems.removeWhere((item) => item.id == id && item.type == type);
    notifyListeners();
  }

  void updateCartItemQuantity(String id, BookingType type, int quantity, {String? selectedDate}) {
    final index = _cartItems.indexWhere((item) => item.id == id && item.type == type);
    if (index >= 0) {
      if (quantity <= 0) {
        _cartItems.removeAt(index);
      } else {
        _cartItems[index].quantity = quantity;
      }
      notifyListeners();
    }
  }

  void clearCart() {
    _cartItems.clear();
    notifyListeners();
  }

  void updateCartItemBookingInfo(String id, BookingType type, {
    DateTime? checkInDate,
    DateTime? checkOutDate,
    int? numberOfPeople,
  }) {
    final index = _cartItems.indexWhere((item) => item.id == id && item.type == type);
    if (index >= 0) {
      if (checkInDate != null) _cartItems[index].checkInDate = checkInDate;
      if (checkOutDate != null) _cartItems[index].checkOutDate = checkOutDate;
      if (numberOfPeople != null) _cartItems[index].numberOfPeople = numberOfPeople;
      notifyListeners();
    }
  }

  bool get hasIncompleteBookingInfo => _cartItems.any((item) => !item.hasCompleteBookingInfo);

  // Customer information
  String _firstName = '';
  String _lastName = '';
  String _email = '';
  String _phone = '';
  String _address = '';
  String _notes = '';

  String get firstName => _firstName;
  String get lastName => _lastName;
  String get email => _email;
  String get phone => _phone;
  String get address => _address;
  String get notes => _notes;

  void setCustomerInfo({
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? address,
    String? notes,
  }) {
    if (firstName != null) _firstName = firstName;
    if (lastName != null) _lastName = lastName;
    if (email != null) _email = email;
    if (phone != null) _phone = phone;
    if (address != null) _address = address;
    if (notes != null) _notes = notes;
    notifyListeners();
  }

  // Date and participants methods
  void setCheckInDate(DateTime date) {
    _checkInDate = date;
    notifyListeners();
  }

  void setCheckOutDate(DateTime date) {
    _checkOutDate = date;
    notifyListeners();
  }

  void setParticipants(int count) {
    _participants = count;
    notifyListeners();
  }

  // Booking methods
  Future<bool> createBooking(String customerId, {String? notes}) async {
    if (_cartItems.isEmpty) {
      _bookingError = 'Cart is empty';
      notifyListeners();
      return false;
    }

    // Auto-set check-in and check-out dates from cart items if not already set
    if (_checkInDate == null || _checkOutDate == null) {
      print('Auto-setting dates from cart items...');
      
      // Get dates from first cart item that has dates
      for (final item in _cartItems) {
        print('Checking item: ${item.name}');
        print('- checkInDate: ${item.checkInDate}');
        print('- checkOutDate: ${item.checkOutDate}');
        print('- selectedDate: ${item.details['selectedDate']}');
        
        if (item.checkInDate != null && item.checkOutDate != null) {
          _checkInDate = item.checkInDate;
          _checkOutDate = item.checkOutDate;
          print('Set dates from item checkIn/checkOut dates');
          break;
        }
        // For services, use selectedDate as both check-in and check-out
        if (item.details['selectedDate'] != null) {
          try {
            final selectedDate = DateTime.parse(item.details['selectedDate']);
            _checkInDate = selectedDate;
            _checkOutDate = selectedDate;
            print('Set dates from selectedDate: $selectedDate');
            break;
          } catch (e) {
            print('Error parsing selectedDate: $e');
          }
        }
      }
      
      // If still no dates found, use today as default
      if (_checkInDate == null || _checkOutDate == null) {
        final today = DateTime.now();
        _checkInDate = today;
        _checkOutDate = today;
        print('Using today as default dates: $today');
      }
    }

    // Calculate total amount including extra fees (no tax)
    final totalAmount = _cartItems.fold(0.0, (total, item) {
      final itemTotal = item.totalPrice;
      // Add extra fee for services
      if (item.type == BookingType.SERVICE) {
        final maxCapacity = item.details['maxCapacity'] ?? 0;
        final extraFeePerPerson = item.details['extraFeePerPerson'] ?? 0.0;
        if (item.numberOfPeople > maxCapacity) {
          final extraPeople = item.numberOfPeople - maxCapacity;
          return total + itemTotal + (extraPeople * extraFeePerPerson);
        }
      }
      return total + itemTotal;
    });

    print('BookingProvider.createBooking - Debug Info:');
    print('- Cart items count: ${_cartItems.length}');
    print('- Check-in date: $_checkInDate');
    print('- Check-out date: $_checkOutDate');
    print('- Participants: $_participants');
    print('- Total amount: $totalAmount');

    _isBooking = true;
    _bookingError = null;
    notifyListeners();

    try {
      // Pass CartItems directly to repository
      final booking = await _bookingRepository.createBooking(
        customerId: customerId,
        items: _cartItems, // Pass CartItems directly
        checkInDate: _checkInDate!,
        checkOutDate: _checkOutDate!,
        participants: _participants,
        totalAmount: totalAmount,
        notes: notes,
      );

      _bookings.add(booking);
      _lastBookingId = int.tryParse(booking.id); // Save the booking ID for payment processing
      clearCart();
      _checkInDate = null;
      _checkOutDate = null;
      _participants = 1;

      _isBooking = false;
      notifyListeners();
      return true;
    } catch (e) {
      _bookingError = e.toString();
      _isBooking = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadUserBookings(String userId) async {
    _bookingsLoading = true;
    _bookingsError = null;
    notifyListeners();

    try {
      // Use real API to get customer bookings
      final customerId = int.tryParse(userId) ?? 0;
      print('Loading bookings for customerId: $customerId');
      
      final bookingResponses = await _apiService.getCustomerBookings(customerId);
      print('Received ${bookingResponses.length} booking responses');
      
      // Convert BookingResponse to Booking for compatibility
      _bookings = bookingResponses.map((response) => _convertBookingResponseToBooking(response)).toList();
      
      _bookingsLoading = false;
      notifyListeners();
    } catch (e) {
      print('Error loading user bookings: $e');
      _bookingsError = e.toString();
      _bookingsLoading = false;
      notifyListeners();
    }
  }
  
  // Convert BookingResponse to Booking model
  Booking _convertBookingResponseToBooking(BookingResponse response) {
    // Convert services to BookingItems
    List<BookingItem> items = response.services.map((service) => BookingItem(
      id: service.id.toString(),
      type: _parseBookingType(service.type),
      quantity: service.quantity,
      price: service.price,
      details: {
        'name': service.name,
        'serviceId': service.serviceId,
        'comboId': service.comboId,
        'equipmentId': service.equipmentId,
        'total': service.total,
      },
    )).toList();
    
    // Convert combos to BookingItems
    if (response.combos.isNotEmpty) {
      final comboItems = response.combos.map((combo) {
        if (combo is Map<String, dynamic>) {
          return BookingItem(
            id: combo['id']?.toString() ?? '',
            type: BookingType.COMBO,
            quantity: combo['quantity'] ?? 1,
            price: (combo['price'] ?? 0).toDouble(),
            details: {
              'name': combo['name'] ?? 'Combo',
              'comboId': combo['comboId'],
              'total': combo['total'] ?? combo['price'] ?? 0,
            },
          );
        }
        return null;
      }).where((item) => item != null).cast<BookingItem>().toList();
      
      items.addAll(comboItems);
    }
    
    return Booking(
      id: response.id.toString(),
      userId: response.customerId.toString(),
      items: items,
      checkInDate: response.checkInDate ?? DateTime.now(),
      checkOutDate: response.checkOutDate ?? DateTime.now(),
      participants: response.numberOfPeople ?? 1,
      totalAmount: response.totalPrice,
      status: _parseBookingStatus(response.status),
      notes: response.note,
      createdAt: response.bookingDate,
      updatedAt: null, // Not provided in API response
      paymentId: response.payment.id.toString(),
    );
  }
  
  BookingType _parseBookingType(String type) {
    switch (type.toUpperCase()) {
      case 'SERVICE':
        return BookingType.SERVICE;
      case 'EQUIPMENT':
        return BookingType.EQUIPMENT;
      case 'COMBO':
        return BookingType.COMBO;
      default:
        return BookingType.SERVICE;
    }
  }
  
  BookingStatus _parseBookingStatus(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return BookingStatus.pending;
      case 'CONFIRMED':
        return BookingStatus.confirmed;
      case 'CANCELLED':
        return BookingStatus.cancelled;
      case 'COMPLETED':
        return BookingStatus.completed;
      default:
        return BookingStatus.pending;
    }
  }

  Future<bool> cancelBooking(String bookingId) async {
    try {
      final success = await _bookingRepository.cancelBooking(bookingId);
      if (success) {
        final index =
            _bookings.indexWhere((booking) => booking.id == bookingId);
        if (index >= 0) {
          _bookings[index] =
              _bookings[index].copyWith(status: BookingStatus.cancelled);
          notifyListeners();
        }
      }
      return success;
    } catch (e) {
      _bookingError = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearBookingError() {
    _bookingError = null;
    notifyListeners();
  }

  // Load customer bookings using real API
  Future<void> loadCustomerBookings(int customerId) async {
    print('BookingProvider.loadCustomerBookings called with customerId: $customerId');
    
    _bookingsLoading = true;
    _bookingsError = null;
    notifyListeners();

    try {
      print('Calling API service to get customer bookings...');
      final bookingResponses = await _apiService.getCustomerBookings(customerId);
      print('Received ${bookingResponses.length} booking responses from API');
      
      // Convert BookingResponse to Booking model for compatibility
      final convertedBookings = <Booking>[];
      for (final response in bookingResponses) {
        try {
          final booking = _convertBookingResponseToBooking(response);
          convertedBookings.add(booking);
          print('Successfully converted booking ID: ${booking.id}');
        } catch (e) {
          print('Error converting booking response: $e');
          print('Problematic response: $response');
          // Continue with other bookings instead of failing completely
        }
      }
      
      _bookings = convertedBookings;
      print('Successfully loaded ${_bookings.length} bookings');
      
      _bookingsLoading = false;
      notifyListeners();
    } catch (e) {
      print('Error in loadCustomerBookings: $e');
      _bookingsError = 'Không thể tải lịch sử đặt chỗ: ${e.toString()}';
      _bookingsLoading = false;
      notifyListeners();
    }
  }
}
