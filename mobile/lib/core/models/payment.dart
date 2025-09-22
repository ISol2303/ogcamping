enum PaymentMethod {
  VNPAY,
  PAYPAL,
  CASH
}

class PaymentRequestDTO {
  final int bookingId;
  final PaymentMethod method;

  PaymentRequestDTO({
    required this.bookingId,
    required this.method,
  });

  Map<String, dynamic> toJson() {
    return {
      'bookingId': bookingId,
      'method': method.name,
    };
  }
}

class PaymentResponseDTO {
  final int? id;
  final int? bookingId;
  final String? method;
  final String? status;
  final double? amount;
  final String? providerTransactionId;
  final String? paymentUrl;
  final String? createdAt;
  final String? message;

  PaymentResponseDTO({
    this.id,
    this.bookingId,
    this.method,
    this.status,
    this.amount,
    this.providerTransactionId,
    this.paymentUrl,
    this.createdAt,
    this.message,
  });

  factory PaymentResponseDTO.fromJson(Map<String, dynamic> json) {
    return PaymentResponseDTO(
      id: json['id'],
      bookingId: json['bookingId'],
      method: json['method'],
      status: json['status'],
      amount: json['amount']?.toDouble(),
      providerTransactionId: json['providerTransactionId'],
      paymentUrl: json['paymentUrl'],
      createdAt: json['createdAt'],
      message: json['message'],
    );
  }
}
