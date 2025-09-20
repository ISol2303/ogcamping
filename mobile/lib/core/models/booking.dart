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
      id: json['id'],
      type: BookingType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
      ),
      quantity: json['quantity'],
      price: json['price'].toDouble(),
      details: Map<String, dynamic>.from(json['details']),
    );
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
    return Booking(
      id: json['id'],
      userId: json['userId'],
      items: (json['items'] as List)
          .map((item) => BookingItem.fromJson(item))
          .toList(),
      checkInDate: DateTime.parse(json['checkInDate']),
      checkOutDate: DateTime.parse(json['checkOutDate']),
      participants: json['participants'],
      totalAmount: json['totalAmount'].toDouble(),
      status: BookingStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
      ),
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt:
          json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
      paymentId: json['paymentId'],
    );
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
