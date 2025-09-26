import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/providers/equipment_provider.dart';
import '../../../core/providers/booking_provider.dart';
import '../../../core/models/equipment.dart';
import '../../../core/navigation/app_router.dart';
import '../../../core/config/app_config.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class EquipmentScreen extends StatefulWidget {
  const EquipmentScreen({super.key});

  @override
  State<EquipmentScreen> createState() => _EquipmentScreenState();
}

class _EquipmentScreenState extends State<EquipmentScreen> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'Tất cả';
  Equipment? _selectedEquipment;
  int _quantity = 1;
  bool _showRentalModal = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadEquipment();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadEquipment() async {
    final equipmentProvider = context.read<EquipmentProvider>();
    await equipmentProvider.loadEquipment();
  }

  void _onSearchChanged(String query) {
    final equipmentProvider = context.read<EquipmentProvider>();
    equipmentProvider.searchEquipment(query);
  }

  void _onCategoryFilterChanged(String? category) {
    setState(() {
      _selectedCategory = category ?? 'Tất cả';
    });
    final equipmentProvider = context.read<EquipmentProvider>();
    equipmentProvider.filterEquipmentByCategory(category ?? 'Tất cả');
  }

  void _showRentalDialog(Equipment equipment) {
    setState(() {
      _selectedEquipment = equipment;
      _quantity = 1;
      _showRentalModal = true;
    });
  }

  void _addToCart() {
    if (_selectedEquipment == null) return;

    final bookingProvider = context.read<BookingProvider>();
    bookingProvider.addEquipmentToCart(
      _selectedEquipment!,
      quantity: _quantity,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã thêm ${_selectedEquipment!.name} vào giỏ hàng'),
        backgroundColor: Colors.green,
        action: SnackBarAction(
          label: 'Xem giỏ hàng',
          textColor: Colors.white,
          onPressed: () => context.go('/cart'),
        ),
      ),
    );

    setState(() {
      _showRentalModal = false;
      _selectedEquipment = null;
    });
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'lều':
      case 'tent':
        return Icons.home;
      case 'nấu ăn':
      case 'cooking':
        return Icons.local_fire_department;
      case 'chiếu sáng':
      case 'lighting':
        return Icons.lightbulb;
      case 'ngủ nghỉ':
      case 'sleeping':
        return Icons.bed;
      case 'nội thất':
      case 'furniture':
        return Icons.chair;
      default:
        return Icons.category;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          appBar: AppBar(
            title: const Text('Cửa hàng thiết bị'),
            actions: [
              IconButton(
                icon: const Icon(Icons.shopping_cart),
                onPressed: () => context.go('/cart'),
              ),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(120),
              child: Column(
                children: [
                  // Search Bar
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: TextField(
                      controller: _searchController,
                      onChanged: _onSearchChanged,
                      decoration: InputDecoration(
                        hintText: 'Tìm kiếm thiết bị...',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () {
                                  _searchController.clear();
                                  _onSearchChanged('');
                                },
                              )
                            : null,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  
                        // Category Filter Chips
                        Consumer<EquipmentProvider>(
                          builder: (context, equipmentProvider, child) {
                            // Get unique categories from equipment
                            final categories = equipmentProvider.equipment
                                .map((e) => e.category)
                                .toSet()
                                .toList();
                            
                            return Container(
                              height: 50,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: ListView(
                                scrollDirection: Axis.horizontal,
                                children: [
                                  _buildFilterChip('Tất cả', _selectedCategory == 'Tất cả', () {
                                    _onCategoryFilterChanged('Tất cả');
                                  }),
                                  const SizedBox(width: 8),
                                  ...categories.map((category) {
                                    return Padding(
                                      padding: const EdgeInsets.only(right: 8),
                                      child: _buildFilterChip(
                                        category, 
                                        _selectedCategory == category, 
                                        () {
                                          _onCategoryFilterChanged(category);
                                        }
                                      ),
                                    );
                                  }).toList(),
                                ],
                              ),
                            );
                          },
                        ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
          body: Consumer<EquipmentProvider>(
            builder: (context, equipmentProvider, child) {
              if (equipmentProvider.isLoading && equipmentProvider.equipment.isEmpty) {
                return const LoadingWidget(message: 'Đang tải thiết bị...');
              }

              if (equipmentProvider.error != null) {
                return CustomErrorWidget(
                  message: equipmentProvider.error!,
                  onRetry: _loadEquipment,
                );
              }

              if (equipmentProvider.filteredEquipment.isEmpty) {
                return const EmptyStateWidget(
                  message: 'Không tìm thấy thiết bị nào',
                  icon: Icons.inventory_2_outlined,
                );
              }

              return RefreshIndicator(
                onRefresh: _loadEquipment,
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.6,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: equipmentProvider.filteredEquipment.length,
                  itemBuilder: (context, index) {
                    final equipment = equipmentProvider.filteredEquipment[index];
                    return _EquipmentCard(
                      equipment: equipment,
                      onAddToCart: () => _showRentalDialog(equipment),
                    );
                  },
                ),
              );
            },
          ),
        ),
        // Rental Modal
        if (_showRentalModal && _selectedEquipment != null)
          _buildRentalModal(),
      ],
    );
  }

  Widget _buildRentalModal() {
    return Container(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(20),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Chọn thông tin thuê',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _showRentalModal = false;
                        _selectedEquipment = null;
                      });
                    },
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Equipment Info
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(
                      _getCategoryIcon(_selectedEquipment!.category),
                      size: 32,
                      color: Colors.green[600],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedEquipment!.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            _selectedEquipment!.category,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            '${_selectedEquipment!.pricePerDay.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}đ/ngày',
                            style: TextStyle(
                              color: Colors.green[700],
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              
              // Quantity Selection
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Số lượng:',
                    style: TextStyle(fontSize: 16),
                  ),
                  Row(
                    children: [
                      IconButton(
                        onPressed: _quantity > 1 ? () {
                          setState(() {
                            _quantity--;
                          });
                        } : null,
                        icon: const Icon(Icons.remove_circle_outline),
                      ),
                      Container(
                        width: 50,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[300]!),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _quantity.toString(),
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 16),
                        ),
                      ),
                      IconButton(
                        onPressed: _quantity < _selectedEquipment!.available ? () {
                          setState(() {
                            _quantity++;
                          });
                        } : null,
                        icon: const Icon(Icons.add_circle_outline),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Total Price
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green[200]!),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Tổng cộng:',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${(_selectedEquipment!.pricePerDay * _quantity).toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}đ/ngày',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.green[700],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              
              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        setState(() {
                          _showRentalModal = false;
                          _selectedEquipment = null;
                        });
                      },
                      child: const Text('Hủy'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _addToCart,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green[600],
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Thêm vào giỏ hàng'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Build filter chip with custom styling
  Widget _buildFilterChip(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? Colors.green[600] : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? Colors.green[600]! : Colors.grey[300]!,
            width: 1.5,
          ),
          boxShadow: selected ? [
            BoxShadow(
              color: Colors.green.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ] : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (selected) ...[
              const Icon(
                Icons.check,
                color: Colors.white,
                size: 16,
              ),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                color: selected ? Colors.white : Colors.grey[700],
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EquipmentCard extends StatelessWidget {
  final Equipment equipment;
  final VoidCallback onAddToCart;

  const _EquipmentCard({
    required this.equipment,
    required this.onAddToCart,
  });

  Widget _buildPlaceholderImage(String category) {
    return Container(
      color: Colors.grey[200],
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _getCategoryIcon(category),
              size: 40,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 4),
            Text(
              category,
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[500],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  String _getDisplayName(String name) {
    // Hiển thị tên gốc, không sửa đổi
    if (name.isEmpty || name.trim().isEmpty) {
      return 'Thiết bị không tên';
    }
    
    return name.trim();
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'lều':
      case 'tent':
        return Icons.home;
      case 'nấu ăn':
      case 'cooking':
        return Icons.local_fire_department;
      case 'chiếu sáng':
      case 'lighting':
        return Icons.lightbulb;
      case 'ngủ nghỉ':
      case 'sleeping':
        return Icons.bed;
      case 'nội thất':
      case 'furniture':
        return Icons.chair;
      default:
        return Icons.category;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () => context.pushNamed(
          AppRoutes.equipmentDetail,
          pathParameters: {'id': equipment.id},
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(12),
                  ),
                ),
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(12),
                  ),
                  child: Stack(
                    children: [
                      if (equipment.imageUrl.isNotEmpty && 
                          equipment.imageUrl != 'null' && 
                          equipment.imageUrl.startsWith('/'))
                        CachedNetworkImage(
                          imageUrl: AppConfig.getImageUrl(equipment.imageUrl),
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: double.infinity,
                          placeholder: (context, url) => _buildPlaceholderImage(equipment.category),
                          errorWidget: (context, url, error) => _buildPlaceholderImage(equipment.category),
                        )
                      else
                        _buildPlaceholderImage(equipment.category),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                          decoration: BoxDecoration(
                            color: equipment.isAvailable ? Colors.green[600] : Colors.red[600],
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Text(
                            equipment.isAvailable 
                                ? 'Còn ${equipment.available}'
                                : 'Hết hàng',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            equipment.category,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            
            // Content
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Title
                    Text(
                      equipment.name.isNotEmpty ? equipment.name : 'Thiết bị không tên',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    
                    const SizedBox(height: 2),
                    
                    // Area
                    Text(
                      equipment.area,
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey[600],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    
                    const SizedBox(height: 4),
                    
                    // Rating
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 10),
                        const SizedBox(width: 2),
                        Text(
                          equipment.rating.toString(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    
                    const Spacer(),
                    
                    // Price
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${equipment.pricePerDay.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}đ',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                        const Text(
                          'mỗi ngày',
                          style: TextStyle(
                            fontSize: 8,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            // Add to Cart Button
            Container(
              margin: const EdgeInsets.fromLTRB(6, 2, 6, 6),
              child: SizedBox(
                width: double.infinity,
                height: 28,
                child: ElevatedButton.icon(
                  onPressed: equipment.isAvailable ? onAddToCart : null,
                  icon: Icon(
                    equipment.isAvailable ? Icons.add_shopping_cart : Icons.block,
                    size: 12,
                  ),
                  label: Text(
                    equipment.isAvailable ? 'Thêm vào giỏ' : 'Hết hàng',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: equipment.isAvailable 
                        ? Colors.green[600] 
                        : Colors.grey[400],
                    foregroundColor: Colors.white,
                    elevation: equipment.isAvailable ? 1 : 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
