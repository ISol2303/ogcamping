import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/models/booking.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class BookingHistoryScreen extends StatefulWidget {
  const BookingHistoryScreen({super.key});

  @override
  State<BookingHistoryScreen> createState() => _BookingHistoryScreenState();
}

class _BookingHistoryScreenState extends State<BookingHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadBookings();
    });
  }

  Future<void> _loadBookings() async {
    final authProvider = context.read<AuthProvider>();
    final bookingProvider = context.read<BookingProvider>();

    if (authProvider.user != null && authProvider.customer != null) {
      print('Loading bookings for customer ID: ${authProvider.customer!.id}');
      await bookingProvider.loadCustomerBookings(authProvider.customer!.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch sử đặt chỗ'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.goNamed('profile'),
        ),
      ),
      body: Consumer<BookingProvider>(
        builder: (context, bookingProvider, child) {
          if (bookingProvider.bookingsLoading &&
              bookingProvider.bookings.isEmpty) {
            return const LoadingWidget(message: 'Đang tải lịch sử...');
          }

          if (bookingProvider.bookingsError != null) {
            return CustomErrorWidget(
              message: bookingProvider.bookingsError!,
              onRetry: _loadBookings,
            );
          }

          final allBookings = bookingProvider.bookings;

          if (allBookings.isEmpty) {
            return const _EmptyStateWidget(
              message: 'Chưa có lịch sử đặt chỗ',
              icon: Icons.history,
            );
          }

          // Group bookings by status
          final completedBookings = allBookings
              .where((b) => b.status == BookingStatus.completed)
              .toList();
          final cancelledBookings = allBookings
              .where((b) => b.status == BookingStatus.cancelled)
              .toList();
          final upcomingBookings = allBookings
              .where((b) =>
                  b.status == BookingStatus.confirmed ||
                  b.status == BookingStatus.pending)
              .toList();

          return RefreshIndicator(
            onRefresh: _loadBookings,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Statistics Cards
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          title: 'Đã đặt',
                          count: upcomingBookings.length,
                          color: Colors.blue,
                          icon: Icons.upcoming,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          title: 'Hoàn thành',
                          count: completedBookings.length,
                          color: Colors.green,
                          icon: Icons.check_circle,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          title: 'Đã hủy',
                          count: cancelledBookings.length,
                          color: Colors.red,
                          icon: Icons.cancel,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // All Bookings List
                  Text(
                    'Tất cả đặt chỗ',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),

                  ...allBookings.map((booking) {
                    return _BookingHistoryCard(booking: booking);
                  }).toList(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final int count;
  final Color color;
  final IconData icon;

  const _StatCard({
    required this.title,
    required this.count,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              count.toString(),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _BookingHistoryCard extends StatelessWidget {
  final Booking booking;

  const _BookingHistoryCard({required this.booking});

  String _getDisplayId(String id) {
    if (id.isEmpty) return 'N/A';
    if (id.length <= 8) return id;
    return '${id.substring(0, 8)}...';
  }

  String _getStatusText(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending:
        return 'Chờ xác nhận';
      case BookingStatus.confirmed:
        return 'Đã xác nhận';
      case BookingStatus.cancelled:
        return 'Đã hủy';
      case BookingStatus.completed:
        return 'Hoàn thành';
    }
  }

  Color _getStatusColor(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending:
        return Colors.orange;
      case BookingStatus.confirmed:
        return Colors.blue;
      case BookingStatus.cancelled:
        return Colors.red;
      case BookingStatus.completed:
        return Colors.green;
    }
  }

  IconData _getStatusIcon(BookingStatus status) {
    switch (status) {
      case BookingStatus.pending:
        return Icons.schedule;
      case BookingStatus.confirmed:
        return Icons.check_circle;
      case BookingStatus.cancelled:
        return Icons.cancel;
      case BookingStatus.completed:
        return Icons.done_all;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: _getStatusColor(booking.status).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            _getStatusIcon(booking.status),
            color: _getStatusColor(booking.status),
          ),
        ),
        title: Text(
          '#OGC00000${_getDisplayId(booking.id)}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${booking.checkInDate.day}/${booking.checkInDate.month}/${booking.checkInDate.year} - ${booking.checkOutDate.day}/${booking.checkOutDate.month}/${booking.checkOutDate.year}',
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getStatusColor(booking.status),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _getStatusText(booking.status),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  '${booking.totalAmount.toStringAsFixed(0)}đ',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Booking Details
                Row(
                  children: [
                    Icon(
                      Icons.people,
                      size: 16,
                      color: Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withOpacity(0.6),
                    ),
                    const SizedBox(width: 8),
                    Text('${booking.participants} người tham gia'),
                  ],
                ),

                const SizedBox(height: 8),

                // Items - Separate Services and Combos
                ..._buildBookingItems(context, booking),

                const SizedBox(height: 12),

                // Notes
                if (booking.notes != null && booking.notes!.isNotEmpty) ...[
                  Text(
                    'Ghi chú:',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    booking.notes!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontStyle: FontStyle.italic,
                        ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Dates
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Ngày đặt:',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Theme.of(context)
                                        .colorScheme
                                        .onSurface
                                        .withOpacity(0.6),
                                  ),
                        ),
                        Text(
                          '${booking.createdAt.day}/${booking.createdAt.month}/${booking.createdAt.year}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                    if (booking.updatedAt != null)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Cập nhật:',
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onSurface
                                          .withOpacity(0.6),
                                    ),
                          ),
                          Text(
                            '${booking.updatedAt!.day}/${booking.updatedAt!.month}/${booking.updatedAt!.year}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                  ],
                ),

                const SizedBox(height: 12),

                // Actions
                if (booking.status == BookingStatus.completed)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        // Navigate to review screen
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text(
                                  'Tính năng đánh giá sẽ có trong phiên bản tiếp theo')),
                        );
                      },
                      icon: const Icon(Icons.star_outline),
                      label: const Text('Đánh giá dịch vụ'),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildBookingItems(BuildContext context, Booking booking) {
    final services = booking.items.where((item) => item.type == BookingType.SERVICE).toList();
    final combos = booking.items.where((item) => item.type == BookingType.COMBO).toList();
    
    // Debug logging
    print('🔍 Booking ${booking.id} items analysis:');
    print('- Total items: ${booking.items.length}');
    print('- Services found: ${services.length}');
    print('- Combos found: ${combos.length}');
    for (var item in booking.items) {
      print('  - Item: ${item.details['name']} | Type: ${item.type} | ID: ${item.id}');
    }
    
    List<Widget> widgets = [];
    
    // Services section
    if (services.isNotEmpty) {
      widgets.add(
        Text(
          'Dịch vụ đã đặt:',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      );
      widgets.add(const SizedBox(height: 8));
      
      for (var item in services) {
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Container(
                  width: 4,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${item.details['name']} x${item.quantity}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
                Text(
                  '${(item.price * item.quantity).toStringAsFixed(0)}đ',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ),
        );
      }
      
      if (combos.isNotEmpty) {
        widgets.add(const SizedBox(height: 12));
      }
    }
    
    // Combos section
    if (combos.isNotEmpty) {
      widgets.add(
        Text(
          'Combo đã đặt:',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      );
      widgets.add(const SizedBox(height: 8));
      
      for (var item in combos) {
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Container(
                  width: 4,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.orange,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        Icons.card_giftcard,
                        size: 16,
                        color: Colors.orange,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${item.details['name']} x${item.quantity}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${(item.price * item.quantity).toStringAsFixed(0)}đ',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ),
        );
      }
    }
    
    return widgets;
  }
}

class _EmptyStateWidget extends StatelessWidget {
  final String message;
  final IconData icon;

  const _EmptyStateWidget({
    required this.message,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 80,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withOpacity(0.6),
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => context.go('/'),
              icon: const Icon(Icons.home),
              label: const Text('Về trang chủ'),
            ),
          ],
        ),
      ),
    );
  }
}
