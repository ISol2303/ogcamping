import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/services_provider.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/models/camping_service.dart';
import '../../../core/navigation/app_router.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class ServiceDetailScreen extends StatefulWidget {
  final String serviceId;

  const ServiceDetailScreen({
    super.key,
    required this.serviceId,
  });

  @override
  State<ServiceDetailScreen> createState() => _ServiceDetailScreenState();
}

class _ServiceDetailScreenState extends State<ServiceDetailScreen> {
  CampingService? _service;
  bool _isLoading = true;
  String? _error;
  List<ServiceAvailability> _availability = [];
  bool _availabilityLoading = false;
  String? _availabilityError;
  ServiceAvailability? _selectedDate;
  int _numberOfPeople = 1;

  @override
  void initState() {
    super.initState();
    _loadService();
  }

  Future<void> _loadService() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final servicesProvider = context.read<ServicesProvider>();

      // Load service from API by ID
      final service =
          await servicesProvider.getCampingServiceById(widget.serviceId);

      if (service != null) {
        setState(() {
          _service = service;
          // Set initial numberOfPeople to minCapacity
          _numberOfPeople = service.minCapacity ?? 1;
          _isLoading = false;
        });

        // Load reviews and availability
        await servicesProvider.loadReviews(widget.serviceId, 'service');
        await _loadAvailability();
      } else {
        setState(() {
          _error = 'Không tìm thấy dịch vụ';
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
    if (_service == null || _selectedDate == null) return;

    // Validate số người
    final minCapacity = _service!.minCapacity ?? 1;
    final maxCapacity = _service!.maxCapacity;

    if (_numberOfPeople < minCapacity) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Số người tối thiểu cho ${_service!.name} là $minCapacity người'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_numberOfPeople > maxCapacity) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Số người vượt quá sức chứa tối đa ($maxCapacity người) cho ${_service!.name}'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final bookingProvider = context.read<BookingProvider>();
    bookingProvider.addServiceToCart(
      _service!, 
      selectedDate: _selectedDate!.date,
      numberOfPeople: _numberOfPeople,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            'Đã thêm ${_service!.name} (${_formatDate(_selectedDate!.date)}) - $_numberOfPeople người vào giỏ hàng'),
        action: SnackBarAction(
          label: 'Xem giỏ hàng',
          onPressed: () => context.pushNamed(AppRoutes.cart),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết dịch vụ')),
        body: const LoadingWidget(message: 'Đang tải thông tin dịch vụ...'),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết dịch vụ')),
        body: CustomErrorWidget(
          message: _error!,
          onRetry: _loadService,
        ),
      );
    }

    if (_service == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết dịch vụ')),
        body: const EmptyStateWidget(
          message: 'Không tìm thấy dịch vụ',
          icon: Icons.nature_outlined,
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
                _service!.name,
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
                  // Service Image
                  if (_service!.imageUrl.isNotEmpty)
                    Image.network(
                      'http://192.168.56.1:8080${_service!.imageUrl}',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Theme.of(context).colorScheme.primary,
                                Theme.of(context)
                                    .colorScheme
                                    .primary
                                    .withOpacity(0.8),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.nature,
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
                            Theme.of(context)
                                .colorScheme
                                .primary
                                .withOpacity(0.8),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.nature,
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
                  // Status and Type
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: _service!.type == ServiceType.glamping
                              ? Colors.purple
                              : Colors.green,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          _service!.type == ServiceType.glamping
                              ? 'Glamping'
                              : 'Camping',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color:
                              _service!.isAvailable ? Colors.green : Colors.red,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          _service!.isAvailable ? 'Còn chỗ' : 'Hết chỗ',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Rating and Reviews
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        _service!.rating.toString(),
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '(${_service!.reviewCount} đánh giá)',
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

                  // Location
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _service!.location,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Price and Capacity
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${_service!.pricePerNight.toStringAsFixed(0)}đ',
                            style: Theme.of(context)
                                .textTheme
                                .headlineMedium
                                ?.copyWith(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          Text(
                            _getDurationText(_service!),
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .onSurface
                                      .withOpacity(0.6),
                                ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Icon(
                            Icons.people,
                            color: Theme.of(context)
                                .colorScheme
                                .onSurface
                                .withOpacity(0.6),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Tối đa ${_service!.maxCapacity} người',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ],
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
                    _service!.description,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 24),

                  // Amenities
                  Text(
                    'Tiện nghi',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _service!.amenities.map((amenity) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.check_circle,
                              size: 16,
                              color: Theme.of(context)
                                  .colorScheme
                                  .onPrimaryContainer,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              amenity,
                              style: TextStyle(
                                color: Theme.of(context)
                                    .colorScheme
                                    .onPrimaryContainer,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 24),

                  // Availability Section
                  _buildAvailabilitySection(),

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
                      '${_service!.pricePerNight.toStringAsFixed(0)}đ',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      _getDurationText(_service!),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context)
                                .colorScheme
                                .onSurface
                                .withOpacity(0.6),
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: ElevatedButton.icon(
                  onPressed: _canAddToCart() ? _addToCart : null,
                  icon: const Icon(Icons.add_shopping_cart),
                  label: Text(_getCartButtonText()),
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

  Widget _buildReviewsSection() {
    return Consumer<ServicesProvider>(
      builder: (context, servicesProvider, child) {
        final reviews = servicesProvider.getReviewsForItem(widget.serviceId);

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

  Future<void> _loadAvailability() async {
    setState(() {
      _availabilityLoading = true;
      _availabilityError = null;
    });

    try {
      final servicesProvider = context.read<ServicesProvider>();
      final availability =
          await servicesProvider.getServiceAvailability(widget.serviceId);

      setState(() {
        _availability = availability;
        _availabilityLoading = false;

        // Reset selected date if it's no longer available (past date)
        if (_selectedDate != null) {
          final futureDates = _getAvailableFutureDates();
          if (!futureDates.any((slot) => slot.id == _selectedDate!.id)) {
            _selectedDate = null;
          }
        }
      });
    } catch (e) {
      setState(() {
        _availabilityError = e.toString();
        _availabilityLoading = false;
      });
    }
  }

  Widget _buildAvailabilitySection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.calendar_month,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Lịch trống',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_availabilityLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_availabilityError != null)
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.error_outline,
                      color: Theme.of(context).colorScheme.error,
                      size: 48,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Không thể tải lịch trống',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: _loadAvailability,
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              )
            else if (_availability.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Text('Không có lịch trống'),
                ),
              )
            else
              Column(
                children: [
                  Text(
                    'Chọn ngày để đặt:',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 12),
                  ..._getAvailableFutureDates().map((slot) {
                    final isAvailable = slot.bookedSlots < slot.totalSlots;
                    final availableSlots = slot.totalSlots - slot.bookedSlots;
                    final isSelected = _selectedDate?.id == slot.id;

                    return GestureDetector(
                      onTap: isAvailable
                          ? () {
                              setState(() {
                                _selectedDate = slot;
                              });
                            }
                          : null,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? Theme.of(context)
                                  .colorScheme
                                  .primary
                                  .withOpacity(0.2)
                              : isAvailable
                                  ? Theme.of(context)
                                      .colorScheme
                                      .primaryContainer
                                      .withOpacity(0.1)
                                  : Theme.of(context)
                                      .colorScheme
                                      .errorContainer
                                      .withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected
                                ? Theme.of(context).colorScheme.primary
                                : isAvailable
                                    ? Theme.of(context)
                                        .colorScheme
                                        .primary
                                        .withOpacity(0.3)
                                    : Theme.of(context)
                                        .colorScheme
                                        .error
                                        .withOpacity(0.3),
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              isSelected
                                  ? Icons.radio_button_checked
                                  : isAvailable
                                      ? Icons.radio_button_unchecked
                                      : Icons.cancel,
                              color: isSelected
                                  ? Theme.of(context).colorScheme.primary
                                  : isAvailable
                                      ? Theme.of(context).colorScheme.primary
                                      : Theme.of(context).colorScheme.error,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _formatDate(slot.date),
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: isSelected
                                              ? Theme.of(context)
                                                  .colorScheme
                                                  .primary
                                              : null,
                                        ),
                                  ),
                                  Text(
                                    isAvailable
                                        ? 'Còn $availableSlots chỗ'
                                        : 'Hết chỗ (${slot.totalSlots}/${slot.totalSlots})',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: isSelected
                                              ? Theme.of(context)
                                                  .colorScheme
                                                  .primary
                                              : isAvailable
                                                  ? Theme.of(context)
                                                      .colorScheme
                                                      .onSurface
                                                      .withOpacity(0.7)
                                                  : Theme.of(context)
                                                      .colorScheme
                                                      .error,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              Icon(
                                Icons.check_circle,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                  
                  const SizedBox(height: 24),
                  
                  // People Selector
                  Text(
                    'Số người tham gia:',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 12),
                  
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Số người:',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            Row(
                              children: [
                                IconButton(
                                  onPressed: _numberOfPeople > (_service?.minCapacity ?? 1)
                                      ? () {
                                          setState(() {
                                            _numberOfPeople--;
                                          });
                                        }
                                      : null,
                                  icon: const Icon(Icons.remove),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    _numberOfPeople.toString(),
                                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                ),
                                IconButton(
                                  onPressed: _canAddMorePeople()
                                      ? () {
                                          setState(() {
                                            _numberOfPeople++;
                                          });
                                        }
                                      : null,
                                  icon: const Icon(Icons.add),
                                ),
                              ],
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 8),
                        
                        Text(
                          _getPeopleCapacityText(),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: _numberOfPeople > (_service?.maxCapacity ?? 0)
                                    ? Theme.of(context).colorScheme.error
                                    : Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  bool _canAddMorePeople() {
    if (_service == null) return false;
    
    final maxCapacity = _service!.maxCapacity;
    
    // Chỉ cho phép tối đa maxCapacity (không bao gồm extra people)
    return _numberOfPeople < maxCapacity;
  }

  String _getPeopleCapacityText() {
    if (_service == null) return '';
    
    final minCapacity = _service!.minCapacity ?? 1;
    final maxCapacity = _service!.maxCapacity ?? 0;
    
    String baseText = 'Tối thiểu: $minCapacity người, Tối đa: $maxCapacity người';
    
    // Add validation messages
    if (_numberOfPeople < minCapacity) {
      return '$baseText\n⚠️ Số người dưới mức tối thiểu!';
    } else if (_numberOfPeople > maxCapacity) {
      return '$baseText\n❌ Vượt quá sức chứa tối đa!';
    } else {
      return baseText;
    }
  }


  String _getDurationText(CampingService service) {
    if (service.maxDays == 0) {
      return 'mỗi đêm';
    }

    final days = service.maxDays;
    final nights = days - 1;

    if (days == 1) {
      return 'trong ngày';
    } else if (days == 2) {
      return '2 ngày 1 đêm';
    } else {
      return '$days ngày $nights đêm';
    }
  }

  bool _canAddToCart() {
    if (_selectedDate == null) return false;
    return _selectedDate!.bookedSlots < _selectedDate!.totalSlots;
  }

  String _getCartButtonText() {
    if (_selectedDate == null) {
      return 'Chọn ngày';
    } else if (_selectedDate!.bookedSlots < _selectedDate!.totalSlots) {
      return 'Thêm vào giỏ';
    } else {
      return 'Hết chỗ';
    }
  }

  List<ServiceAvailability> _getAvailableFutureDates() {
    final today = DateTime.now();
    final todayDateOnly = DateTime(today.year, today.month, today.day);

    return _availability.where((slot) {
      try {
        final slotDate = DateTime.parse(slot.date);
        final slotDateOnly =
            DateTime(slotDate.year, slotDate.month, slotDate.day);
        // Chỉ hiển thị ngày từ hôm nay trở đi
        return slotDateOnly.isAtSameMomentAs(todayDateOnly) ||
            slotDateOnly.isAfter(todayDateOnly);
      } catch (e) {
        print('Error parsing date: ${slot.date}');
        return false;
      }
    }).toList();
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
}
