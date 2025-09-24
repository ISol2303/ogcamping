import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../config/app_config.dart';
import '../models/payment.dart';
import 'in_app_browser_service.dart';

class PaymentService {
  static String get baseUrl => AppConfig.paymentUrl;

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

  Future<void> openVNPayUrl(
    String paymentUrl,
    BuildContext context, {
    Function(Map<String, String>)? onPaymentResult,
  }) async {
    try {
      await InAppBrowserService.instance.openPaymentUrl(
        url: paymentUrl,
        context: context,
        onPaymentResult: onPaymentResult,
      );
    } catch (e) {
      print('Error opening VNPay URL with in-app browser: $e');
      // Fallback to external browser
      try {
        final Uri url = Uri.parse(paymentUrl);
        if (await canLaunchUrl(url)) {
          await launchUrl(url, mode: LaunchMode.externalApplication);
        } else {
          throw Exception('Could not launch $paymentUrl');
        }
      } catch (fallbackError) {
        throw Exception('Error opening VNPay URL: $fallbackError');
      }
    }
  }
}
