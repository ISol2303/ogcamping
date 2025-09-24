import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/config/app_config.dart';
import '../../../core/providers/services_provider.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/models/combo_package.dart';
import '../../../core/navigation/app_router.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class ComboDetailScreen extends StatefulWidget {
  final String comboId;

  const ComboDetailScreen({
    super.key,
    required this.comboId,
  });

  @override
  State<ComboDetailScreen> createState() => _ComboDetailScreenState();
}

class _ComboDetailScreenState extends State<ComboDetailScreen> {
  ComboPackage? _combo;
  bool _isLoading = true;
  String? _error;
  DateTime? _selectedDate;
  int _numberOfPeople = 1;

  @override
  void initState() {
    super.initState();
    _loadCombo();
  }

  Future<void> _loadCombo() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final servicesProvider = context.read<ServicesProvider>();
      final combo = await servicesProvider.getComboByIdFromApi(widget.comboId);
      
      if (combo != null) {
        setState(() {
          _combo = combo;
          // Set initial numberOfPeople to minPeople
          _numberOfPeople = combo.minPeople ?? 1;
          _isLoading = false;
        });

        // Load reviews
        await servicesProvider.loadReviews(widget.comboId, 'combo');
      } else {
        setState(() {
          _error = 'Không tìm thấy combo';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _addToCart() {
    if (_combo == null || _selectedDate == null) return;

    final bookingProvider = context.read<BookingProvider>();
    bookingProvider.addComboToCart(
      _combo!,
      selectedDate: _selectedDate!.toIso8601String().split('T')[0],
      numberOfPeople: _numberOfPeople,
    );

    final checkOutDate = _selectedDate!.add(Duration(days: _combo!.maxDays));
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Đã thêm ${_combo!.name} (${_formatDate(_selectedDate!)}-${_formatDate(checkOutDate)}) - $_numberOfPeople người vào giỏ hàng'
        ),
        action: SnackBarAction(
          label: 'Xem giỏ hàng',
          onPressed: () => context.pushNamed(AppRoutes.cart),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết combo')),
        body: const LoadingWidget(message: 'Đang tải thông tin combo...'),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết combo')),
        body: CustomErrorWidget(
          message: _error!,
          onRetry: _loadCombo,
        ),
      );
    }

    if (_combo == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết combo')),
        body: const EmptyStateWidget(
          message: 'Không tìm thấy combo',
          icon: Icons.card_giftcard_outlined,
        ),
      );
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with Image
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                _combo!.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      offset: Offset(0, 1),
                      blurRadius: 3,
                      color: Colors.black54,
                    ),
                  ],
                ),
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Combo Image
                  if (_combo!.imageUrl.isNotEmpty)
                    Image.network(
                      AppConfig.getImageUrl(_combo!.imageUrl),
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Theme.of(context).colorScheme.primary,
                                Theme.of(context).colorScheme.secondary,
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.card_giftcard,
                              size: 80,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                        );
                      },
                    )
                  else
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Theme.of(context).colorScheme.primary,
                            Theme.of(context).colorScheme.secondary,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.card_giftcard,
                          size: 80,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.3),
                        ],
                      ),
                    ),
                  ),
                  if (_combo!.isPopular)
                    Positioned(
                      top: 60,
                      left: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.orange,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Text(
                          'Phổ biến',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  Positioned(
                    top: 60,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        '-${_combo!.discountPercentage.toInt()}%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {
                  // Share functionality
                },
              ),
            ],
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Rating and Reviews
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        _combo!.rating.toString(),
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '(${_combo!.reviewCount} đánh giá)',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurface
                                  .withOpacity(0.6),
                            ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Duration and Participants
                  Row(
                    children: [
                      Icon(
                        Icons.schedule,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${_combo!.durationDays} ngày',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(width: 24),
                      Icon(
                        Icons.people,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Tối đa ${_combo!.maxParticipants} người',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Price
                  Card(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Giá combo',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onPrimaryContainer,
                                    ),
                              ),
                              Row(
                                children: [
                                  Text(
                                    '${_combo!.discountedPrice.toStringAsFixed(0)}đ',
                                    style: Theme.of(context)
                                        .textTheme
                                        .headlineMedium
                                        ?.copyWith(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .onPrimaryContainer,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '${_combo!.originalPrice?.toStringAsFixed(0)}đ',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyLarge
                                        ?.copyWith(
                                          decoration:
                                              TextDecoration.lineThrough,
                                          color: Theme.of(context)
                                              .colorScheme
                                              .onPrimaryContainer
                                              .withOpacity(0.7),
                                        ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'Tiết kiệm',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onPrimaryContainer,
                                    ),
                              ),
                              Text(
                                '${_combo!.savings.toStringAsFixed(0)}đ',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      color: Colors.green,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Description
                  Text(
                    'Mô tả',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _combo!.description,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 24),

                  // Included Services
                  Text(
                    'Dịch vụ bao gồm',
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
                          if (_combo!.serviceIds.isNotEmpty) ...[
                            _buildIncludedItem(
                              icon: Icons.nature,
                              title: 'Dịch vụ cắm trại',
                              subtitle: '${_combo!.serviceIds.length} dịch vụ',
                            ),
                            const Divider(),
                          ],
                          if (_combo!.equipmentIds.isNotEmpty) ...[
                            _buildIncludedItem(
                              icon: Icons.inventory_2,
                              title: 'Thiết bị',
                              subtitle: '${_combo!.equipmentIds.length} món đồ',
                            ),
                            const Divider(),
                          ],
                          if (_combo!.includedMeals.isNotEmpty) ...[
                            _buildIncludedItem(
                              icon: Icons.restaurant,
                              title: 'Bữa ăn',
                              subtitle: _combo!.includedMeals.join(', '),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Activities
                  if (_combo!.activities.isNotEmpty) ...[
                    Text(
                      'Hoạt động',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _combo!.activities.map((activity) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Theme.of(context)
                                .colorScheme
                                .secondaryContainer,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.local_activity,
                                size: 16,
                                color: Theme.of(context)
                                    .colorScheme
                                    .onSecondaryContainer,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                activity,
                                style: TextStyle(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .onSecondaryContainer,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Date Selection Section
                  _buildDateSelectionSection(),
                  
                  const SizedBox(height: 24),

                  // People Selection Section  
                  _buildPeopleSelectionSection(),

                  const SizedBox(height: 24),

                  // Reviews Section
                  _buildReviewsSection(),

                  const SizedBox(height: 100), // Space for bottom button
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${_combo!.discountedPrice.toStringAsFixed(0)}đ',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      'Tiết kiệm ${_combo!.savings.toStringAsFixed(0)}đ',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.green,
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: ElevatedButton.icon(
                  onPressed: _selectedDate != null ? _addToCart : null,
                  icon: const Icon(Icons.add_shopping_cart),
                  label: Text(_selectedDate != null ? 'Thêm vào giỏ' : 'Chọn ngày'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIncludedItem({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          color: Theme.of(context).colorScheme.primary,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withOpacity(0.7),
                    ),
              ),
            ],
          ),
        ),
        Icon(
          Icons.check_circle,
          color: Colors.green,
        ),
      ],
    );
  }

  Widget _buildReviewsSection() {
    return Consumer<ServicesProvider>(
      builder: (context, servicesProvider, child) {
        final reviews = servicesProvider.getReviewsForItem(widget.comboId);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Đánh giá (${reviews.length})',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                if (reviews.isNotEmpty)
                  TextButton(
                    onPressed: () {
                      // Show all reviews
                    },
                    child: const Text('Xem tất cả'),
                  ),
              ],
            ),
            if (reviews.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('Chưa có đánh giá nào'),
              )
            else
              ...reviews.take(3).map((review) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 16,
                              backgroundColor: Theme.of(context)
                                  .colorScheme
                                  .primaryContainer,
                              child: Text(
                                review.userName.substring(0, 1).toUpperCase(),
                                style: TextStyle(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .onPrimaryContainer,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    review.userName,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold),
                                  ),
                                  Row(
                                    children: List.generate(5, (index) {
                                      return Icon(
                                        index < review.rating
                                            ? Icons.star
                                            : Icons.star_border,
                                        size: 16,
                                        color: Colors.amber,
                                      );
                                    }),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(review.comment),
                      ],
                    ),
                  ),
                );
              }).toList(),
          ],
        );
      },
    );
  }

  Widget _buildDateSelectionSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Chọn ngày bắt đầu',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: () async {
                final DateTime? picked = await showDatePicker(
                  context: context,
                  initialDate: _selectedDate ?? DateTime.now().add(const Duration(days: 1)),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                );
                if (picked != null) {
                  setState(() {
                    _selectedDate = picked;
                  });
                }
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Theme.of(context).colorScheme.outline),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _selectedDate != null
                            ? 'Check-in: ${_formatDate(_selectedDate!)}'
                            : 'Chọn ngày check-in',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_selectedDate != null && _combo != null) ...[
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.calendar_month,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Check-out: ${_formatDate(_selectedDate!.add(Duration(days: _combo!.maxDays)))} (${_combo!.maxDays} ngày)',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPeopleSelectionSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Số người tham gia',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.people,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Số người: $_numberOfPeople',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: _numberOfPeople > (_combo?.minPeople ?? 1)
                          ? () {
                              setState(() {
                                _numberOfPeople--;
                              });
                            }
                          : null,
                      icon: const Icon(Icons.remove_circle_outline),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        border: Border.all(color: Theme.of(context).colorScheme.outline),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '$_numberOfPeople',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ),
                    IconButton(
                      onPressed: _combo != null && _numberOfPeople < (_combo!.maxPeople ?? 20)
                          ? () {
                              setState(() {
                                _numberOfPeople++;
                              });
                            }
                          : null,
                      icon: const Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
              ],
            ),
            if (_combo != null) ...[
              const SizedBox(height: 8),
              Text(
                'Tối thiểu: ${_combo!.minPeople ?? 1} người, Tối đa: ${_combo!.maxPeople ?? 20} người',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
