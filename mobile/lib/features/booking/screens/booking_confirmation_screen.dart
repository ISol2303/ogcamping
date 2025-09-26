import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:og_camping_private/core/models/booking.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/models/payment.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/services/payment_service.dart';
import '../../../core/navigation/app_router.dart';

class BookingConfirmationScreen extends StatefulWidget {
  const BookingConfirmationScreen({super.key});

  @override
  State<BookingConfirmationScreen> createState() =>
      _BookingConfirmationScreenState();
}

class _BookingConfirmationScreenState extends State<BookingConfirmationScreen> {
  final _notesController = TextEditingController();
  bool _isBooking = false;
  PaymentMethod _selectedPaymentMethod = PaymentMethod.CASH;
  final PaymentService _paymentService = PaymentService();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            '$label:',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentMethodTile(
    BuildContext context,
    PaymentMethod method,
    String title,
    String subtitle,
    IconData icon,
    Color color,
  ) {
    final isSelected = _selectedPaymentMethod == method;

    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          color: color,
          size: 24,
        ),
      ),
      title: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
      ),
      subtitle: Text(
        subtitle,
        style: Theme.of(context).textTheme.bodySmall,
      ),
      trailing: Radio<PaymentMethod>(
        value: method,
        groupValue: _selectedPaymentMethod,
        onChanged: (PaymentMethod? value) {
          if (value != null) {
            setState(() {
              _selectedPaymentMethod = value;
            });
          }
        },
        activeColor: color,
      ),
      onTap: () {
        setState(() {
          _selectedPaymentMethod = method;
        });
      },
    );
  }

  Future<void> _confirmBooking() async {
    final bookingProvider = context.read<BookingProvider>();
    final authProvider = context.read<AuthProvider>();

    if (authProvider.user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để đặt chỗ')),
      );
      return;
    }

    setState(() {
      _isBooking = true;
    });

    try {
      // Step 1: Create booking first
      // Debug auth data
      print('BookingConfirmation - Auth data:');
      print('- isAuthenticated: ${authProvider.isAuthenticated}');
      print('- user: ${authProvider.user}');
      print('- customer: ${authProvider.customer}');
      
      // Use customer ID instead of user ID
      final customerId = authProvider.customer?.id.toString() ??
          authProvider.user!.id.toString();
      print('Using customerId: $customerId');
      
      // Pass user data directly to avoid provider dependency issues
      final success = await bookingProvider.createBookingWithUserData(
        customerId,
        customerName: authProvider.user?.name,
        customerEmail: authProvider.user?.email,
        customerPhone: authProvider.user?.phone,
        notes: _notesController.text.trim(),
      );

      if (!success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  bookingProvider.bookingError ?? 'Có lỗi xảy ra khi đặt chỗ'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }

      // Step 2: Handle payment based on selected method
      // Skip payment for equipment orders as they are already paid
      if (bookingProvider.lastBookingId != null) {
        await _handlePayment(bookingProvider.lastBookingId);
      } else {
        // For equipment orders, just show success message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Đặt thiết bị thành công! Vui lòng thanh toán tại quầy.'),
              backgroundColor: Colors.green,
            ),
          );
          context.go('/home');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isBooking = false;
        });
      }
    }
  }

  Future<void> _handlePayment(int? bookingId) async {
    if (bookingId == null) {
      throw Exception('Booking ID is null');
    }

    switch (_selectedPaymentMethod) {
      case PaymentMethod.VNPAY:
        await _processVNPayPayment(bookingId);
        break;
      case PaymentMethod.PAYPAL:
        await _processPayPalPayment(bookingId);
        break;
      case PaymentMethod.CASH:
        await _processCashPayment(bookingId);
        break;
    }
  }

  Future<void> _processVNPayPayment(int bookingId) async {
    try {
      final paymentRequest = PaymentRequestDTO(
        bookingId: bookingId,
        method: PaymentMethod.VNPAY,
      );

      final paymentResponse =
          await _paymentService.createPayment(paymentRequest);

      if (paymentResponse.paymentUrl != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Chuyển hướng đến VNPay...')),
          );

          // Open VNPay URL using PaymentService with in-app browser
          await _paymentService.openVNPayUrl(
            paymentResponse.paymentUrl!,
            context,
            onPaymentResult: (params) {
              // Handle payment result from in-app browser
              print('Payment result received: $params');
              
              // Navigate to /result route with parameters
              if (mounted) {
                final bookingId = params['bookingId'] ?? '0';
                final status = params['status'] ?? 'failure';
                final txnRef = params['txnRef'];
                final responseCode = params['responseCode'];
                
                // Build query parameters for navigation
                final queryParams = <String, String>{
                  'bookingId': bookingId,
                  'status': status,
                };
                
                if (txnRef != null) queryParams['txnRef'] = txnRef;
                if (responseCode != null) queryParams['responseCode'] = responseCode;
                if (params['error'] != null) queryParams['error'] = params['error']!;
                
                // Navigate to /result route
                final uri = Uri(path: '/result', queryParameters: queryParams);
                print('🔄 Navigating to: ${uri.toString()}');
                context.go(uri.toString());
              }
            },
          );

          // Show a simple message instead of dialog since user will be redirected back
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Vui lòng hoàn tất thanh toán. Bạn sẽ được chuyển hướng về ứng dụng sau khi thanh toán.'),
                duration: Duration(seconds: 5),
              ),
            );
            
            // ✅ DO NOT NAVIGATE - Stay on current screen and wait for deep link redirect
            // The deep link ogcamping://payment/result will automatically handle navigation
            print('✅ Staying on booking confirmation screen, waiting for deep link redirect...');
          }
        }
      } else {
        throw Exception('Không nhận được URL thanh toán từ VNPay');
      }
    } catch (e) {
      throw Exception('Lỗi thanh toán VNPay: $e');
    }
  }


  Future<void> _processPayPalPayment(int bookingId) async {
    try {
      final paymentRequest = PaymentRequestDTO(
        bookingId: bookingId,
        method: PaymentMethod.PAYPAL,
      );

      final paymentResponse =
          await _paymentService.createPayment(paymentRequest);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Chuyển hướng đến PayPal...')),
        );
        // TODO: Implement PayPal integration
        context.goNamed(AppRoutes.bookingHistory);
      }
    } catch (e) {
      throw Exception('Lỗi thanh toán PayPal: $e');
    }
  }

  Future<void> _processCashPayment(int bookingId) async {
    try {
      final paymentRequest = PaymentRequestDTO(
        bookingId: bookingId,
        method: PaymentMethod.CASH,
      );

      await _paymentService.createPayment(paymentRequest);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text(
                  'Đặt chỗ thành công! Thanh toán tại quầy khi nhận phòng.')),
        );
        context.goNamed(AppRoutes.bookingHistory);
      }
    } catch (e) {
      throw Exception('Lỗi xử lý thanh toán tại quầy: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Xác nhận đặt chỗ'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: Consumer<BookingProvider>(
        builder: (context, bookingProvider, child) {
          if (bookingProvider.cartItems.isEmpty) {
            return const Center(
              child: Text('Giỏ hàng trống'),
            );
          }

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Cart Items Summary
                      Text(
                        'Chi tiết đặt chỗ',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 16),

                      ...bookingProvider.cartItems.map((item) {
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      item.type == BookingType.SERVICE
                                          ? Icons.nature
                                          : item.type == BookingType.COMBO
                                              ? Icons.card_giftcard
                                              : Icons.inventory_2,
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item.name,
                                            style: Theme.of(context)
                                                .textTheme
                                                .titleMedium
                                                ?.copyWith(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                          ),
                                          Text(
                                            item.type == BookingType.SERVICE
                                                ? 'Dịch vụ'
                                                : item.type == BookingType.COMBO
                                                    ? 'Combo'
                                                    : 'Thiết bị',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                                  color: Theme.of(context)
                                                      .colorScheme
                                                      .onSurface
                                                      .withOpacity(0.6),
                                                ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      '${item.price.toStringAsFixed(0)}đ',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            color: Theme.of(context)
                                                .colorScheme
                                                .primary,
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                  ],
                                ),
                                if (item.needsBookingInfo) ...[
                                  const SizedBox(height: 12),
                                  const Divider(),
                                  const SizedBox(height: 8),
                                  if (item.checkInDate != null &&
                                      item.checkOutDate != null) ...[
                                    Row(
                                      children: [
                                        const Icon(Icons.calendar_today,
                                            size: 16),
                                        const SizedBox(width: 8),
                                        Text(
                                          'Từ ${_formatDate(item.checkInDate!)} đến ${_formatDate(item.checkOutDate!)}',
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                  ],
                                  Row(
                                    children: [
                                      const Icon(Icons.people, size: 16),
                                      const SizedBox(width: 8),
                                      Text(
                                        '${item.numberOfPeople} người',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium,
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      }).toList(),

                      const SizedBox(height: 24),

                      // Customer Information Section
                      Text(
                        'Thông tin khách hàng',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 12),

                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildInfoRow(context, 'Họ tên',
                                  '${bookingProvider.firstName} ${bookingProvider.lastName}'),
                              const SizedBox(height: 8),
                              _buildInfoRow(
                                  context, 'Email', bookingProvider.email),
                              const SizedBox(height: 8),
                              _buildInfoRow(context, 'Số điện thoại',
                                  bookingProvider.phone),
                              const SizedBox(height: 8),
                              _buildInfoRow(
                                  context, 'Địa chỉ', bookingProvider.address),
                              if (bookingProvider.notes.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                _buildInfoRow(
                                    context, 'Ghi chú', bookingProvider.notes),
                              ],
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Payment Method Section
                      Text(
                        'Phương thức thanh toán',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 12),

                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              _buildPaymentMethodTile(
                                context,
                                PaymentMethod.VNPAY,
                                'VNPay',
                                'Thanh toán qua VNPay',
                                Icons.payment,
                                Colors.blue,
                              ),
                              const Divider(),
                              _buildPaymentMethodTile(
                                context,
                                PaymentMethod.PAYPAL,
                                'PayPal',
                                'Thanh toán qua PayPal',
                                Icons.account_balance_wallet,
                                Colors.orange,
                              ),
                              const Divider(),
                              _buildPaymentMethodTile(
                                context,
                                PaymentMethod.CASH,
                                'Thanh toán tại quầy',
                                'Thanh toán khi nhận phòng',
                                Icons.money,
                                Colors.green,
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Notes Section
                      Text(
                        'Ghi chú',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 12),

                      TextField(
                        controller: _notesController,
                        decoration: const InputDecoration(
                          hintText: 'Nhập ghi chú cho đơn đặt chỗ (tùy chọn)',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 3,
                      ),

                      const SizedBox(height: 24),

                      // Total Section
                      Card(
                        color: Theme.of(context).colorScheme.primaryContainer,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Tổng cộng',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              Text(
                                '${bookingProvider.subtotal.toStringAsFixed(0)}đ',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Action
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isBooking ? null : _confirmBooking,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor:
                            Theme.of(context).colorScheme.onPrimary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _isBooking
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Xác nhận đặt chỗ',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
