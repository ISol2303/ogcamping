import 'payment.dart';

class BookingService {
  final int id;
  final int serviceId;
  final int? comboId;
  final int? equipmentId;
  final int bookingId;
  final String type;
  final int numberOfPeople;
  final DateTime checkInDate;
  final DateTime checkOutDate;
  final String name;
  final int quantity;
  final double price;
  final double total;

  BookingService({
    required this.id,
    required this.serviceId,
    this.comboId,
    this.equipmentId,
    required this.bookingId,
    required this.type,
    required this.numberOfPeople,
    required this.checkInDate,
    required this.checkOutDate,
    required this.name,
    required this.quantity,
    required this.price,
    required this.total,
  });

  factory BookingService.fromJson(Map<String, dynamic> json) {
    try {
      return BookingService(
        id: json['id'] ?? 0,
        serviceId: json['serviceId'] ?? 0,
        comboId: json['comboId'],
        equipmentId: json['euipmentId'] ?? json['equipmentId'], // Handle both typo and correct spelling
        bookingId: json['bookingId'] ?? 0,
        type: json['type'] ?? 'SERVICE',
        numberOfPeople: json['numberOfPeople'] ?? 1,
        checkInDate: json['checkInDate'] != null 
            ? DateTime.tryParse(json['checkInDate'].toString()) ?? DateTime.now()
            : DateTime.now(),
        checkOutDate: json['checkOutDate'] != null 
            ? DateTime.tryParse(json['checkOutDate'].toString()) ?? DateTime.now().add(Duration(days: 1))
            : DateTime.now().add(Duration(days: 1)),
        name: json['name']?.toString() ?? 'Unknown Service',
        quantity: json['quantity'] ?? 1,
        price: json['price'] != null 
            ? double.tryParse(json['price'].toString()) ?? 0.0
            : 0.0,
        total: json['total'] != null 
            ? double.tryParse(json['total'].toString()) ?? 0.0
            : 0.0,
      );
    } catch (e) {
      print('Error parsing BookingService: $e');
      print('Problematic JSON: $json');
      rethrow;
    }
  }
}

class BookingStaff {
  final int id;
  final String name;
  final String role;

  BookingStaff({
    required this.id,
    required this.name,
    required this.role,
  });

  factory BookingStaff.fromJson(Map<String, dynamic> json) {
    try {
      return BookingStaff(
        id: json['id'] ?? 0,
        name: json['name']?.toString() ?? 'Unknown',
        role: json['role']?.toString() ?? 'STAFF',
      );
    } catch (e) {
      print('Error parsing BookingStaff: $e');
      print('Problematic JSON: $json');
      rethrow;
    }
  }
}

class BookingPayment {
  final int id;
  final int? bookingId;
  final String method;
  final String status;
  final double amount;
  final String providerTransactionId;
  final String? paymentUrl;
  final DateTime createdAt;

  BookingPayment({
    required this.id,
    this.bookingId,
    required this.method,
    required this.status,
    required this.amount,
    required this.providerTransactionId,
    this.paymentUrl,
    required this.createdAt,
  });

  factory BookingPayment.fromJson(Map<String, dynamic> json) {
    try {
      return BookingPayment(
        id: json['id'] ?? 0,
        bookingId: json['bookingId'],
        method: json['method']?.toString() ?? 'UNKNOWN',
        status: json['status']?.toString() ?? 'PENDING',
        amount: json['amount'] != null 
            ? double.tryParse(json['amount'].toString()) ?? 0.0
            : 0.0,
        providerTransactionId: json['providerTransactionId']?.toString() ?? '',
        paymentUrl: json['paymentUrl']?.toString(),
        createdAt: json['createdAt'] != null 
            ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
      );
    } catch (e) {
      print('Error parsing BookingPayment: $e');
      print('Problematic JSON: $json');
      rethrow;
    }
  }
}

class BookingResponse {
  final int id;
  final int customerId;
  final List<BookingService> services;
  final List<dynamic> combos; // Empty in example
  final List<dynamic> equipments; // Empty in example
  final DateTime? checkInDate;
  final DateTime? checkOutDate;
  final DateTime bookingDate;
  final int? numberOfPeople;
  final String status;
  final BookingPayment payment;
  final String note;
  final BookingStaff staff;
  final String? internalNotes;
  final double totalPrice;

  BookingResponse({
    required this.id,
    required this.customerId,
    required this.services,
    required this.combos,
    required this.equipments,
    this.checkInDate,
    this.checkOutDate,
    required this.bookingDate,
    this.numberOfPeople,
    required this.status,
    required this.payment,
    required this.note,
    required this.staff,
    this.internalNotes,
    required this.totalPrice,
  });

  factory BookingResponse.fromJson(Map<String, dynamic> json) {
    try {
      return BookingResponse(
        id: json['id'] ?? 0,
        customerId: json['customerId'] ?? 0,
        services: json['services'] != null 
            ? (json['services'] as List)
                .where((service) => service != null)
                .map((service) {
                  try {
                    return BookingService.fromJson(service as Map<String, dynamic>);
                  } catch (e) {
                    print('Error parsing service: $e');
                    return null;
                  }
                })
                .where((service) => service != null)
                .cast<BookingService>()
                .toList()
            : [],
        combos: json['combos'] ?? [],
        equipments: json['equipments'] ?? [],
        checkInDate: json['checkInDate'] != null 
            ? DateTime.tryParse(json['checkInDate'].toString()) 
            : null,
        checkOutDate: json['checkOutDate'] != null 
            ? DateTime.tryParse(json['checkOutDate'].toString()) 
            : null,
        bookingDate: json['bookingDate'] != null 
            ? DateTime.tryParse(json['bookingDate'].toString()) ?? DateTime.now()
            : DateTime.now(),
        numberOfPeople: json['numberOfPeople'],
        status: json['status'] ?? 'PENDING',
        payment: json['payment'] != null 
            ? BookingPayment.fromJson(json['payment'] as Map<String, dynamic>)
            : BookingPayment(
                id: 0,
                method: 'UNKNOWN',
                status: 'PENDING',
                amount: 0.0,
                providerTransactionId: '',
                createdAt: DateTime.now(),
              ),
        note: json['note']?.toString() ?? '',
        staff: json['staff'] != null 
            ? BookingStaff.fromJson(json['staff'] as Map<String, dynamic>)
            : BookingStaff(id: 0, name: 'Unknown', role: 'STAFF'),
        internalNotes: json['internalNotes']?.toString(),
        totalPrice: json['totalPrice'] != null 
            ? double.tryParse(json['totalPrice'].toString()) ?? 0.0
            : 0.0,
      );
    } catch (e) {
      print('Error parsing BookingResponse: $e');
      print('Problematic JSON: $json');
      rethrow;
    }
  }
}
