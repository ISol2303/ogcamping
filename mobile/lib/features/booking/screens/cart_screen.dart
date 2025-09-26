import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/models/booking.dart';
import '../../../core/navigation/app_router.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isLoadingCustomerData = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCustomerData();
    });
  }

  Future<void> _loadCustomerData() async {
    final authProvider = context.read<AuthProvider>();

    // Nếu user đã login và có customer data
    if (authProvider.isAuthenticated && authProvider.customer != null) {
      setState(() {
        _isLoadingCustomerData = true;
      });

      final customer = authProvider.customer!;

      setState(() {
        // Ưu tiên firstName/lastName từ customer, fallback về user name
        _firstNameController.text = customer.firstName;
        _lastNameController.text = customer.lastName;

        // Nếu không có firstName/lastName, tách từ user name
        if (_firstNameController.text.isEmpty &&
            _lastNameController.text.isEmpty) {
          final userName = customer.user?.name ?? '';
          if (userName.isNotEmpty) {
            final nameParts = userName.split(' ');
            if (nameParts.length >= 2) {
              _firstNameController.text = nameParts.first;
              _lastNameController.text = nameParts.skip(1).join(' ');
            } else {
              _firstNameController.text = userName;
            }
          }
        }

        _emailController.text = customer.email;
        _phoneController.text = customer.phone;
        _addressController.text = customer.address;
        _isLoadingCustomerData = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã điền thông tin từ tài khoản của bạn'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  bool _validateCustomerInfo() {
    if (_firstNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập họ')),
      );
      return false;
    }

    if (_lastNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập tên')),
      );
      return false;
    }

    if (_emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập email')),
      );
      return false;
    }

    // Basic email validation
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
        .hasMatch(_emailController.text.trim())) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Email không hợp lệ')),
      );
      return false;
    }

    if (_phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập số điện thoại')),
      );
      return false;
    }

    if (_addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập địa chỉ')),
      );
      return false;
    }

    return true;
  }

  double _calculateExtraFee(CartItem item) {
    if (item.type != BookingType.SERVICE) return 0;

    final serviceId = item.details['serviceId'];
    if (serviceId == null) return 0;

    final maxCapacity = item.details['maxCapacity'] ?? 0;
    final extraFeePerPerson = item.details['extraFeePerPerson'] ?? 0.0;

    if (item.numberOfPeople <= maxCapacity) return 0;

    final extraPeople = item.numberOfPeople - maxCapacity;
    return (extraPeople * extraFeePerPerson).toDouble();
  }

  double _calculateItemTotalPrice(CartItem item) {
    return item.totalPrice + _calculateExtraFee(item);
  }

  double _calculateGrandTotal(List<CartItem> items) {
    return items.fold(
        0, (total, item) => total + _calculateItemTotalPrice(item));
  }

  double _calculateTotalExtraFee(List<CartItem> items) {
    return items.fold(0, (total, item) => total + _calculateExtraFee(item));
  }

  Future<void> _proceedToBooking() async {
    // Validate customer information
    if (!_validateCustomerInfo()) {
      return;
    }

    // Save customer information to provider
    final bookingProvider = context.read<BookingProvider>();
    bookingProvider.setCustomerInfo(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      address: _addressController.text.trim(),
      notes: _notesController.text.trim(),
    );

    // Navigate to confirmation screen
    context.pushNamed(AppRoutes.bookingConfirmation);
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
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.shopping_cart_outlined,
                    size: 64,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Giỏ hàng trống',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
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
                        selectedDate: item.details['selectedDate'],
                      );
                    },
                    onRentalDaysChanged: item.type == BookingType.EQUIPMENT
                        ? (rentalDays) {
                            bookingProvider.updateCartItemRentalDays(
                              item.id,
                              item.type,
                              rentalDays,
                            );
                          }
                        : null,
                    onRemove: () {
                      bookingProvider.removeFromCart(
                        item.id,
                        item.type,
                        selectedDate: item.details['selectedDate'],
                      );
                    },
                  );
                }).toList(),

                const SizedBox(height: 24),

                // Customer Information Form
                Row(
                  children: [
                    Text(
                      'Thông tin khách hàng',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    if (_isLoadingCustomerData) ...[
                      const SizedBox(width: 8),
                      const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 16),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        // First Name & Last Name Row
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _firstNameController,
                                decoration: const InputDecoration(
                                  labelText: 'Họ *',
                                  border: OutlineInputBorder(),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextField(
                                controller: _lastNameController,
                                decoration: const InputDecoration(
                                  labelText: 'Tên *',
                                  border: OutlineInputBorder(),
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Email
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            labelText: 'Email *',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.email),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Phone
                        TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            labelText: 'Số điện thoại *',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.phone),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Address
                        TextField(
                          controller: _addressController,
                          maxLines: 2,
                          decoration: const InputDecoration(
                            labelText: 'Địa chỉ *',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.location_on),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Notes
                        TextField(
                          controller: _notesController,
                          maxLines: 3,
                          decoration: const InputDecoration(
                            labelText: 'Ghi chú (tùy chọn)',
                            hintText: 'Nhập yêu cầu đặc biệt...',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.note),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                const SizedBox(height: 24),

                // Price Summary
                Card(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        // Tạm tính (giá gốc không bao gồm phụ thu)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Tạm tính:'),
                            Text(
                                '${_calculateGrandTotal(bookingProvider.cartItems).toStringAsFixed(0)}đ'),
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Phụ thu (nếu có)
                        if (_calculateTotalExtraFee(bookingProvider.cartItems) >
                            0) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Phụ thu:'),
                              Text(
                                  '${_calculateTotalExtraFee(bookingProvider.cartItems).toStringAsFixed(0)}đ'),
                            ],
                          ),
                          const SizedBox(height: 8),
                        ],

                        // Số ngày (nếu > 1)
                        if (bookingProvider.durationDays > 1) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Số ngày: ${bookingProvider.durationDays}'),
                              const Text(''),
                            ],
                          ),
                          const SizedBox(height: 8),
                        ],

                        const Divider(),

                        // Tổng cộng (bao gồm phụ thu, không có thuế)
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
                              '${_calculateGrandTotal(bookingProvider.cartItems).toStringAsFixed(0)}đ',
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
                    child: const Text('Xác nhận thông tin'),
                  ),
                ),

                const SizedBox(height: 100),
              ],
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
  final Function(int)? onRentalDaysChanged;
  final VoidCallback onRemove;

  const _CartItemCard({
    required this.item,
    required this.onQuantityChanged,
    this.onRentalDaysChanged,
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

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      final weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      final weekday = weekdays[date.weekday % 7];

      return '$weekday, ${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return dateString; // Fallback to original string if parsing fails
    }
  }

  double _calculateExtraFee() {
    if (item.type != BookingType.SERVICE) return 0;

    final maxCapacity = item.details['maxCapacity'] ?? 0;
    final extraFeePerPerson = item.details['extraFeePerPerson'] ?? 0.0;
    final allowExtraPeople = item.details['allowExtraPeople'] ?? false;

    if (!allowExtraPeople || item.numberOfPeople <= maxCapacity) return 0;

    final extraPeople = item.numberOfPeople - maxCapacity;
    return (extraPeople * extraFeePerPerson).toDouble();
  }

  double _getTotalItemPrice() {
    return item.totalPrice + _calculateExtraFee();
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
                  // Show check-in and check-out dates
                  if (item.checkInDate != null && item.checkOutDate != null)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Check-in: ${_formatDate(item.checkInDate!.toIso8601String().split('T')[0])}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                        Text(
                          'Check-out: ${_formatDate(item.checkOutDate!.toIso8601String().split('T')[0])}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                        Text(
                          'Thời gian: ${item.checkOutDate!.difference(item.checkInDate!).inDays} ngày',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Theme.of(context).colorScheme.secondary,
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                      ],
                    )
                  else if (item.details['selectedDate'] != null)
                    Text(
                      'Ngày: ${_formatDate(item.details['selectedDate'])}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.w500,
                          ),
                    )
                  // Show rental days for equipment
                  else if (item.type == BookingType.EQUIPMENT && item.details['rentalDays'] != null)
                    Text(
                      'Thuê ${item.details['rentalDays']} ngày',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                  const SizedBox(height: 4),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.type == BookingType.EQUIPMENT && item.details['rentalDays'] != null
                            ? '${item.price.toStringAsFixed(0)}đ × ${item.quantity} × ${item.details['rentalDays']} ngày'
                            : '${item.price.toStringAsFixed(0)}đ × ${item.quantity}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                      if (_calculateExtraFee() > 0) ...[
                        const SizedBox(height: 2),
                        Text(
                          'Phụ thu: ${_calculateExtraFee().toStringAsFixed(0)}đ',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Theme.of(context).colorScheme.error,
                                    fontWeight: FontWeight.w500,
                                  ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Tổng: ${_getTotalItemPrice().toStringAsFixed(0)}đ',
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),

            // Quantity Controls
            Column(
              children: [
                // Quantity controls
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
                
                // Rental days controls for equipment
                if (item.type == BookingType.EQUIPMENT && onRentalDaysChanged != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.calendar_today,
                        size: 16,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 4),
                      IconButton(
                        onPressed: (item.details['rentalDays'] ?? 1) > 1
                            ? () {
                                onRentalDaysChanged!((item.details['rentalDays'] ?? 1) - 1);
                              }
                            : null,
                        icon: const Icon(Icons.remove),
                        iconSize: 16,
                      ),
                      Text(
                        '${item.details['rentalDays'] ?? 1}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                      IconButton(
                        onPressed: () {
                          onRentalDaysChanged!((item.details['rentalDays'] ?? 1) + 1);
                        },
                        icon: const Icon(Icons.add),
                        iconSize: 16,
                      ),
                    ],
                  ),
                ],
                
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
