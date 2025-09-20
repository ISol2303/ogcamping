import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/models/booking.dart';
import '../../../core/navigation/app_router.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  DateTime? _checkInDate;
  DateTime? _checkOutDate;
  int _participants = 1;
  final _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final bookingProvider = context.read<BookingProvider>();
    _checkInDate = bookingProvider.checkInDate;
    _checkOutDate = bookingProvider.checkOutDate;
    _participants = bookingProvider.participants;
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectCheckInDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _checkInDate ?? DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (date != null) {
      setState(() {
        _checkInDate = date;
        // Reset checkout date if it's before checkin date
        if (_checkOutDate != null && _checkOutDate!.isBefore(date)) {
          _checkOutDate = null;
        }
      });

      final bookingProvider = context.read<BookingProvider>();
      bookingProvider.setCheckInDate(date);
    }
  }

  Future<void> _selectCheckOutDate() async {
    if (_checkInDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn ngày nhận phòng trước')),
      );
      return;
    }

    final date = await showDatePicker(
      context: context,
      initialDate: _checkOutDate ?? _checkInDate!.add(const Duration(days: 1)),
      firstDate: _checkInDate!.add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (date != null) {
      setState(() {
        _checkOutDate = date;
      });

      final bookingProvider = context.read<BookingProvider>();
      bookingProvider.setCheckOutDate(date);
    }
  }

  void _updateParticipants(int count) {
    setState(() {
      _participants = count;
    });

    final bookingProvider = context.read<BookingProvider>();
    bookingProvider.setParticipants(count);
  }

  Future<void> _proceedToBooking() async {
    if (_checkInDate == null || _checkOutDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn ngày nhận và trả phòng')),
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final bookingProvider = context.read<BookingProvider>();

    final success = await bookingProvider.createBooking(
      authProvider.user!.id,
      notes: _notesController.text.trim().isEmpty
          ? null
          : _notesController.text.trim(),
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đặt chỗ thành công!')),
      );
      context.goNamed(AppRoutes.home);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Giỏ hàng'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Consumer<BookingProvider>(
        builder: (context, bookingProvider, child) {
          if (!bookingProvider.hasItems) {
            return const EmptyStateWidget(
              message: 'Giỏ hàng trống',
              actionText: 'Khám phá dịch vụ',
              icon: Icons.shopping_cart_outlined,
            );
          }

          return LoadingOverlay(
            isLoading: bookingProvider.isBooking,
            message: 'Đang xử lý đặt chỗ...',
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cart Items
                  Text(
                    'Dịch vụ đã chọn',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),

                  ...bookingProvider.cartItems.map((item) {
                    return _CartItemCard(
                      item: item,
                      onQuantityChanged: (quantity) {
                        bookingProvider.updateCartItemQuantity(
                          item.id,
                          item.type,
                          quantity,
                        );
                      },
                      onRemove: () {
                        bookingProvider.removeFromCart(item.id, item.type);
                      },
                    );
                  }).toList(),

                  const SizedBox(height: 24),

                  // Date Selection
                  Text(
                    'Thông tin đặt chỗ',
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
                          // Check-in Date
                          ListTile(
                            leading: const Icon(Icons.calendar_today),
                            title: const Text('Ngày nhận phòng'),
                            subtitle: Text(
                              _checkInDate != null
                                  ? '${_checkInDate!.day}/${_checkInDate!.month}/${_checkInDate!.year}'
                                  : 'Chọn ngày',
                            ),
                            trailing: const Icon(Icons.arrow_forward_ios),
                            onTap: _selectCheckInDate,
                          ),

                          const Divider(),

                          // Check-out Date
                          ListTile(
                            leading: const Icon(Icons.event),
                            title: const Text('Ngày trả phòng'),
                            subtitle: Text(
                              _checkOutDate != null
                                  ? '${_checkOutDate!.day}/${_checkOutDate!.month}/${_checkOutDate!.year}'
                                  : 'Chọn ngày',
                            ),
                            trailing: const Icon(Icons.arrow_forward_ios),
                            onTap: _selectCheckOutDate,
                          ),

                          const Divider(),

                          // Participants
                          ListTile(
                            leading: const Icon(Icons.people),
                            title: const Text('Số người tham gia'),
                            subtitle: Text('$_participants người'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  onPressed: _participants > 1
                                      ? () {
                                          _updateParticipants(
                                              _participants - 1);
                                        }
                                      : null,
                                  icon: const Icon(Icons.remove),
                                ),
                                Text(
                                  _participants.toString(),
                                  style:
                                      Theme.of(context).textTheme.titleMedium,
                                ),
                                IconButton(
                                  onPressed: () {
                                    _updateParticipants(_participants + 1);
                                  },
                                  icon: const Icon(Icons.add),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Notes
                  TextField(
                    controller: _notesController,
                    decoration: const InputDecoration(
                      labelText: 'Ghi chú (tùy chọn)',
                      hintText: 'Nhập yêu cầu đặc biệt...',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),

                  const SizedBox(height: 24),

                  // Price Summary
                  Card(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Tạm tính:'),
                              Text(
                                  '${bookingProvider.subtotal.toStringAsFixed(0)}đ'),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Thuế (10%):'),
                              Text(
                                  '${bookingProvider.tax.toStringAsFixed(0)}đ'),
                            ],
                          ),
                          const SizedBox(height: 8),
                          if (bookingProvider.durationDays > 1) ...[
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                    'Số ngày: ${bookingProvider.durationDays}'),
                                const Text(''),
                              ],
                            ),
                            const SizedBox(height: 8),
                          ],
                          const Divider(),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Tổng cộng:',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              Text(
                                '${bookingProvider.totalWithDuration.toStringAsFixed(0)}đ',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                    ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Error Message
                  if (bookingProvider.bookingError != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.error_outline,
                            color: Theme.of(context).colorScheme.error,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              bookingProvider.bookingError!,
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.error,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Book Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed:
                          bookingProvider.isBooking ? null : _proceedToBooking,
                      child: const Text('Đặt chỗ ngay'),
                    ),
                  ),

                  const SizedBox(height: 100),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _CartItemCard extends StatelessWidget {
  final CartItem item;
  final Function(int) onQuantityChanged;
  final VoidCallback onRemove;

  const _CartItemCard({
    required this.item,
    required this.onQuantityChanged,
    required this.onRemove,
  });

  String _getTypeDisplayName() {
    switch (item.type) {
      case BookingType.SERVICE:
        return 'Dịch vụ';
      case BookingType.EQUIPMENT:
        return 'Thiết bị';
      case BookingType.COMBO:
        return 'Combo';
    }
  }

  IconData _getTypeIcon() {
    switch (item.type) {
      case BookingType.SERVICE:
        return Icons.nature;
      case BookingType.EQUIPMENT:
        return Icons.inventory_2;
      case BookingType.COMBO:
        return Icons.card_giftcard;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Icon
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                _getTypeIcon(),
                color: Theme.of(context).colorScheme.onPrimaryContainer,
              ),
            ),

            const SizedBox(width: 12),

            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  Text(
                    _getTypeDisplayName(),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface
                              .withOpacity(0.6),
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${item.price.toStringAsFixed(0)}đ × ${item.quantity}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.w500,
                        ),
                  ),
                ],
              ),
            ),

            // Quantity Controls
            Column(
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: item.quantity > 1
                          ? () {
                              onQuantityChanged(item.quantity - 1);
                            }
                          : null,
                      icon: const Icon(Icons.remove),
                      iconSize: 20,
                    ),
                    Text(
                      item.quantity.toString(),
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    IconButton(
                      onPressed: () {
                        onQuantityChanged(item.quantity + 1);
                      },
                      icon: const Icon(Icons.add),
                      iconSize: 20,
                    ),
                  ],
                ),
                TextButton(
                  onPressed: onRemove,
                  child: const Text('Xóa'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
