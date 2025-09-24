import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/navigation/app_router.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/models/booking.dart';

class PaymentSuccessScreen extends StatefulWidget {
  final String bookingId;
  final String? txnRef;

  const PaymentSuccessScreen({
    super.key,
    required this.bookingId,
    this.txnRef,
  });

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  // Add booking details state
  Map<String, dynamic>? bookingDetails;
  bool isLoadingBooking = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeIn,
    ));

    _animationController.forward();

    // Refresh booking history and load specific booking details after successful payment
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final bookingProvider = context.read<BookingProvider>();

      // Load customer bookings if customer ID is available
      if (authProvider.customer?.id != null) {
        bookingProvider.loadCustomerBookings(authProvider.customer!.id);
      }

      // Load specific booking details
      _loadBookingDetails();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadBookingDetails() async {
    if (widget.bookingId == '0') return;

    setState(() {
      isLoadingBooking = true;
    });

    try {
      final bookingProvider = context.read<BookingProvider>();

      // Find the booking in the loaded bookings
      final booking = bookingProvider.bookings.firstWhere(
        (b) => b.id.toString() == widget.bookingId,
        orElse: () => throw Exception('Booking not found'),
      );

      setState(() {
        // Get service and combo names
        final services = booking.items.where((item) => item.type == BookingType.SERVICE).toList();
        final combos = booking.items.where((item) => item.type == BookingType.COMBO).toList();
        
        String displayName = '';
        if (combos.isNotEmpty && services.isNotEmpty) {
          displayName = '${combos.length} combo, ${services.length} dịch vụ';
        } else if (combos.isNotEmpty) {
          displayName = combos.length == 1 
              ? 'Combo: ${combos.first.details['name'] ?? 'Combo'}'
              : '${combos.length} combo';
        } else if (services.isNotEmpty) {
          displayName = services.length == 1 
              ? 'Dịch vụ: ${services.first.details['name'] ?? 'Service'}'
              : '${services.length} dịch vụ';
        } else {
          displayName = 'Đặt chỗ';
        }

        bookingDetails = {
          'id': booking.id,
          'serviceName': displayName,
          'totalAmount': booking.totalAmount,
          'checkInDate': booking.checkInDate,
          'checkOutDate': booking.checkOutDate,
          'status': booking.status,
          'participants': booking.participants,
          'items': booking.items.length,
          'services': services.length,
          'combos': combos.length,
        };
        isLoadingBooking = false;
      });
    } catch (e) {
      print('Error loading booking details: $e');
      setState(() {
        isLoadingBooking = false;
      });
    }
  }

  bool get isSuccess => true; // This screen is only for success

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: isSuccess ? Colors.green.shade50 : Colors.red.shade50,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Header with close button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const SizedBox(width: 40), // Balance the close button
                  Text(
                    isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: isSuccess
                              ? Colors.green.shade700
                              : Colors.red.shade700,
                        ),
                  ),
                  IconButton(
                    onPressed: () => context.goNamed(AppRoutes.home),
                    icon: const Icon(Icons.close),
                    color: Colors.grey.shade600,
                  ),
                ],
              ),

              const SizedBox(height: 40),

              // Animated success/failure icon
              Expanded(
                flex: 2,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      AnimatedBuilder(
                        animation: _scaleAnimation,
                        builder: (context, child) {
                          return Transform.scale(
                            scale: _scaleAnimation.value,
                            child: Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSuccess ? Colors.green : Colors.red,
                                boxShadow: [
                                  BoxShadow(
                                    color:
                                        (isSuccess ? Colors.green : Colors.red)
                                            .withOpacity(0.3),
                                    blurRadius: 20,
                                    spreadRadius: 5,
                                  ),
                                ],
                              ),
                              child: Icon(
                                isSuccess ? Icons.check : Icons.close,
                                size: 20,
                                color: Colors.white,
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 20),
                      FadeTransition(
                        opacity: _fadeAnimation,
                        child: Column(
                          children: [
                            Text(
                              isSuccess
                                  ? 'Thanh toán thành công!'
                                  : 'Thanh toán thất bại!',
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineSmall
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: isSuccess
                                        ? Colors.green.shade700
                                        : Colors.red.shade700,
                                  ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 1),
                            Text(
                              'Đơn đặt chỗ của bạn đã được xác nhận.\nChúng tôi sẽ liên hệ với bạn sớm nhất.',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge
                                  ?.copyWith(
                                    color: Colors.grey.shade700,
                                  ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Payment details card
              if (isSuccess) ...[
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.receipt_long,
                                color: Colors.green.shade600,
                                size: 12,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'Chi tiết thanh toán',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Show loading or booking details
                          if (isLoadingBooking) ...[
                            const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ] else if (bookingDetails != null) ...[
                            _buildDetailRow(
                                'Loại', bookingDetails!['serviceName']),
                            const SizedBox(height: 8),
                            _buildDetailRow('Mã đơn hàng', widget.bookingId),
                            // const SizedBox(height: 8),
                            // _buildDetailRow('Tổng tiền',
                            //     '${bookingDetails!['totalAmount'].toStringAsFixed(0)}đ'),
                            const SizedBox(height: 8),
                            _buildDetailRow('Trạng thái', 'Đã thanh toán'),
                          ] else ...[
                            _buildDetailRow('Mã đơn hàng', widget.bookingId),
                            const SizedBox(height: 8),
                            _buildDetailRow('Trạng thái', 'Đã thanh toán'),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Action buttons
              FadeTransition(
                opacity: _fadeAnimation,
                child: Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () =>
                            context.goNamed(AppRoutes.bookingHistory),
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              isSuccess ? Colors.green : Colors.red,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
                        child: Text(
                          isSuccess ? 'Xem lịch sử đặt chỗ' : 'Thử lại',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => context.goNamed(AppRoutes.home),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: isSuccess
                              ? Colors.green.shade700
                              : Colors.red.shade700,
                          side: BorderSide(
                            color: isSuccess
                                ? Colors.green.shade300
                                : Colors.red.shade300,
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Về trang chủ',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey.shade600,
              ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }
}
