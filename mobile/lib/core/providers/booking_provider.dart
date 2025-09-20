import 'package:flutter/foundation.dart';
import '../models/booking.dart';
import '../models/camping_service.dart';
import '../models/equipment.dart';
import '../models/combo_package.dart';
import '../repositories/booking_repository.dart';

class CartItem {
  final String id;
  final String name;
  final BookingType type;
  final double price;
  int quantity;
  final Map<String, dynamic> details;

  CartItem({
    required this.id,
    required this.name,
    required this.type,
    required this.price,
    this.quantity = 1,
    required this.details,
  });

  double get totalPrice => price * quantity;
}

class BookingProvider extends ChangeNotifier {
  final BookingRepository _bookingRepository;

  BookingProvider(this._bookingRepository);

  // Cart
  final List<CartItem> _cartItems = [];
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
    final existingIndex = _cartItems.indexWhere(
        (cartItem) => cartItem.id == item.id && cartItem.type == item.type);

    if (existingIndex >= 0) {
      _cartItems[existingIndex].quantity += item.quantity;
    } else {
      _cartItems.add(item);
    }

    notifyListeners();
  }

  void addServiceToCart(CampingService service, {int quantity = 1}) {
    final cartItem = CartItem(
      id: service.id,
      name: service.name,
      type: BookingType.SERVICE,
      price: service.pricePerNight,
      quantity: quantity,
      details: {
        'name': service.name,
        'location': service.location,
        'maxCapacity': service.maxCapacity,
        'type': service.type.toString().split('.').last,
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

  void addComboToCart(ComboPackage combo, {int quantity = 1}) {
    final cartItem = CartItem(
      id: combo.id,
      name: combo.name,
      type: BookingType.COMBO,
      price: combo.discountedPrice,
      quantity: quantity,
      details: {
        'name': combo.name,
        'durationDays': combo.durationDays,
        'maxParticipants': combo.maxParticipants,
        'activities': combo.activities,
      },
    );

    addToCart(cartItem);
  }

  void removeFromCart(String id, BookingType type) {
    _cartItems.removeWhere((item) => item.id == id && item.type == type);
    notifyListeners();
  }

  void updateCartItemQuantity(String id, BookingType type, int quantity) {
    final index =
        _cartItems.indexWhere((item) => item.id == id && item.type == type);
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
  Future<bool> createBooking(String userId, {String? notes}) async {
    if (_cartItems.isEmpty || _checkInDate == null || _checkOutDate == null) {
      _bookingError = 'Missing required booking information';
      notifyListeners();
      return false;
    }

    _isBooking = true;
    _bookingError = null;
    notifyListeners();

    try {
      final bookingItems = _cartItems
          .map((cartItem) => BookingItem(
                id: cartItem.id,
                type: cartItem.type,
                quantity: cartItem.quantity,
                price: cartItem.price,
                details: cartItem.details,
              ))
          .toList();

      final booking = await _bookingRepository.createBooking(
        userId: userId,
        items: bookingItems,
        checkInDate: _checkInDate!,
        checkOutDate: _checkOutDate!,
        participants: _participants,
        totalAmount: totalWithDuration,
        notes: notes,
      );

      _bookings.add(booking);
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
      _bookings = await _bookingRepository.getUserBookings(userId);
      _bookingsLoading = false;
      notifyListeners();
    } catch (e) {
      _bookingsError = e.toString();
      _bookingsLoading = false;
      notifyListeners();
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
}
