import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../models/payment.dart';

class PaymentService {
  static const String baseUrl = 'http://192.168.56.1:8080/apis/v1/payments';

  Future<PaymentResponseDTO> createPayment(PaymentRequestDTO request) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/create/mobile'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(request.toJson()),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return PaymentResponseDTO.fromJson(data);
      } else {
        throw Exception('Failed to create payment: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Payment service error: $e');
    }
  }

  Future<void> openVNPayUrl(String paymentUrl) async {
    try {
      final Uri url = Uri.parse(paymentUrl);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        throw Exception('Could not launch $paymentUrl');
      }
    } catch (e) {
      throw Exception('Error opening VNPay URL: $e');
    }
  }
}
