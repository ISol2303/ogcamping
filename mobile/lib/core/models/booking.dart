enum BookingStatus { pending, confirmed, cancelled, completed }

enum BookingType { SERVICE, EQUIPMENT, COMBO }

class BookingItem {
  final String id;
  final BookingType type;
  final int quantity;
  final double price;
  final Map<String, dynamic> details;

  BookingItem({
    required this.id,
    required this.type,
    required this.quantity,
    required this.price,
    required this.details,
  });

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    return BookingItem(
      id: json['id'] ?? '',
      type: _parseBookingType(json['type']),
      quantity: json['quantity'] ?? 1,
      price: (json['price'] ?? 0).toDouble(),
      details: json['details'] != null 
          ? Map<String, dynamic>.from(json['details'])
          : <String, dynamic>{},
    );
  }
  
  static BookingType _parseBookingType(dynamic type) {
    if (type == null) return BookingType.SERVICE;
    
    final typeStr = type.toString().toUpperCase();
    switch (typeStr) {
      case 'SERVICE':
        return BookingType.SERVICE;
      case 'EQUIPMENT':
        return BookingType.EQUIPMENT;
      case 'COMBO':
        return BookingType.COMBO;
      default:
        print('Unknown booking type: $type, defaulting to SERVICE');
        return BookingType.SERVICE;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.toString().split('.').last,
      'quantity': quantity,
      'price': price,
      'details': details,
    };
  }
}

class Booking {
  final String id;
  final String userId;
  final List<BookingItem> items;
  final DateTime checkInDate;
  final DateTime checkOutDate;
  final int participants;
  final double totalAmount;
  final BookingStatus status;
  final String? notes;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? paymentId;

  Booking({
    required this.id,
    required this.userId,
    required this.items,
    required this.checkInDate,
    required this.checkOutDate,
    required this.participants,
    required this.totalAmount,
    required this.status,
    this.notes,
    required this.createdAt,
    this.updatedAt,
    this.paymentId,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    print('Parsing Booking from JSON: $json');
    
    try {
      return Booking(
        id: json['id']?.toString() ?? '',
        userId: json['userId']?.toString() ?? json['customerId']?.toString() ?? '',
        items: json['items'] != null 
            ? (json['items'] as List).map((item) {
                try {
                  return BookingItem.fromJson(item);
                } catch (e) {
                  print('Error parsing BookingItem: $e, item: $item');
                  return BookingItem(
                    id: item['id'] ?? '',
                    type: BookingType.SERVICE,
                    quantity: 1,
                    price: 0.0,
                    details: {},
                  );
                }
              }).toList()
            : <BookingItem>[],
        checkInDate: json['checkInDate'] != null 
            ? DateTime.tryParse(json['checkInDate']) ?? DateTime.now()
            : DateTime.now(),
        checkOutDate: json['checkOutDate'] != null 
            ? DateTime.tryParse(json['checkOutDate']) ?? DateTime.now()
            : DateTime.now(),
        participants: json['participants'] ?? json['numberOfPeople'] ?? 1,
        totalAmount: (json['totalAmount'] ?? json['total'] ?? 0).toDouble(),
        status: _parseStatus(json['status']),
        notes: json['notes'] ?? json['note'],
        createdAt: json['createdAt'] != null 
            ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
            : DateTime.now(),
        updatedAt: json['updatedAt'] != null 
            ? DateTime.tryParse(json['updatedAt'])
            : null,
        paymentId: json['paymentId']?.toString(),
      );
    } catch (e) {
      print('Error parsing Booking: $e');
      rethrow;
    }
  }

  static BookingStatus _parseStatus(dynamic status) {
    if (status == null) return BookingStatus.pending;
    
    final statusStr = status.toString().toUpperCase();
    switch (statusStr) {
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

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'items': items.map((item) => item.toJson()).toList(),
      'checkInDate': checkInDate.toIso8601String(),
      'checkOutDate': checkOutDate.toIso8601String(),
      'participants': participants,
      'totalAmount': totalAmount,
      'status': status.toString().split('.').last,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'paymentId': paymentId,
    };
  }

  int get durationDays => checkOutDate.difference(checkInDate).inDays;

  bool get canCancel =>
      status == BookingStatus.pending || status == BookingStatus.confirmed;

  Booking copyWith({
    String? id,
    String? userId,
    List<BookingItem>? items,
    DateTime? checkInDate,
    DateTime? checkOutDate,
    int? participants,
    double? totalAmount,
    BookingStatus? status,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? paymentId,
  }) {
    return Booking(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      items: items ?? this.items,
      checkInDate: checkInDate ?? this.checkInDate,
      checkOutDate: checkOutDate ?? this.checkOutDate,
      participants: participants ?? this.participants,
      totalAmount: totalAmount ?? this.totalAmount,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      paymentId: paymentId ?? this.paymentId,
    );
  }
}
