import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/services_provider.dart';
import '../../../core/models/equipment.dart';
import '../../../core/navigation/app_router.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class EquipmentScreen extends StatefulWidget {
  const EquipmentScreen({super.key});

  @override
  State<EquipmentScreen> createState() => _EquipmentScreenState();
}

class _EquipmentScreenState extends State<EquipmentScreen> {
  final _searchController = TextEditingController();
  EquipmentCategory? _selectedCategory;

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
    final servicesProvider = context.read<ServicesProvider>();
    await servicesProvider.loadEquipment();
  }

  void _onSearchChanged(String query) {
    final servicesProvider = context.read<ServicesProvider>();
    servicesProvider.searchEquipment(query);
  }

  void _onCategoryFilterChanged(EquipmentCategory? category) {
    setState(() {
      _selectedCategory = category;
    });
    final servicesProvider = context.read<ServicesProvider>();
    servicesProvider.filterEquipmentByCategory(category);
  }

  String _getCategoryName(EquipmentCategory category) {
    switch (category) {
      case EquipmentCategory.tent:
        return 'Lều';
      case EquipmentCategory.cooking:
        return 'Nấu ăn';
      case EquipmentCategory.lighting:
        return 'Chiếu sáng';
      case EquipmentCategory.sleeping:
        return 'Ngủ nghỉ';
      case EquipmentCategory.furniture:
        return 'Nội thất';
      case EquipmentCategory.other:
        return 'Khác';
    }
  }

  IconData _getCategoryIcon(EquipmentCategory category) {
    switch (category) {
      case EquipmentCategory.tent:
        return Icons.home;
      case EquipmentCategory.cooking:
        return Icons.local_fire_department;
      case EquipmentCategory.lighting:
        return Icons.lightbulb;
      case EquipmentCategory.sleeping:
        return Icons.bed;
      case EquipmentCategory.furniture:
        return Icons.chair;
      case EquipmentCategory.other:
        return Icons.category;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thiết bị cắm trại'),
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
              SizedBox(
                height: 50,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    FilterChip(
                      label: const Text('Tất cả'),
                      selected: _selectedCategory == null,
                      onSelected: (selected) {
                        if (selected) _onCategoryFilterChanged(null);
                      },
                    ),
                    const SizedBox(width: 8),
                    ...EquipmentCategory.values.map((category) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          avatar: Icon(
                            _getCategoryIcon(category),
                            size: 16,
                          ),
                          label: Text(_getCategoryName(category)),
                          selected: _selectedCategory == category,
                          onSelected: (selected) {
                            _onCategoryFilterChanged(selected ? category : null);
                          },
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
      body: Consumer<ServicesProvider>(
        builder: (context, servicesProvider, child) {
          if (servicesProvider.equipmentLoading && servicesProvider.equipment.isEmpty) {
            return const LoadingWidget(message: 'Đang tải thiết bị...');
          }

          if (servicesProvider.equipmentError != null) {
            return CustomErrorWidget(
              message: servicesProvider.equipmentError!,
              onRetry: _loadEquipment,
            );
          }

          if (servicesProvider.equipment.isEmpty) {
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
                childAspectRatio: 0.75,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: servicesProvider.equipment.length,
              itemBuilder: (context, index) {
                final equipment = servicesProvider.equipment[index];
                return _EquipmentCard(equipment: equipment);
              },
            ),
          );
        },
      ),
    );
  }
}

class _EquipmentCard extends StatelessWidget {
  final Equipment equipment;

  const _EquipmentCard({required this.equipment});

  String _getCategoryName(EquipmentCategory category) {
    switch (category) {
      case EquipmentCategory.tent:
        return 'Lều';
      case EquipmentCategory.cooking:
        return 'Nấu ăn';
      case EquipmentCategory.lighting:
        return 'Chiếu sáng';
      case EquipmentCategory.sleeping:
        return 'Ngủ nghỉ';
      case EquipmentCategory.furniture:
        return 'Nội thất';
      case EquipmentCategory.other:
        return 'Khác';
    }
  }

  IconData _getCategoryIcon(EquipmentCategory category) {
    switch (category) {
      case EquipmentCategory.tent:
        return Icons.home;
      case EquipmentCategory.cooking:
        return Icons.local_fire_department;
      case EquipmentCategory.lighting:
        return Icons.lightbulb;
      case EquipmentCategory.sleeping:
        return Icons.bed;
      case EquipmentCategory.furniture:
        return Icons.chair;
      case EquipmentCategory.other:
        return Icons.category;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
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
                  color: Theme.of(context).colorScheme.surfaceVariant,
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Icon(
                        _getCategoryIcon(equipment.category),
                        size: 48,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: equipment.isAvailable ? Colors.green : Colors.red,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          equipment.isAvailable 
                              ? 'Còn ${equipment.availableQuantity}'
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
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _getCategoryName(equipment.category),
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
            
            // Content
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      equipment.name,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    
                    const SizedBox(height: 4),
                    
                    // Brand
                    Text(
                      equipment.brand,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                    
                    const Spacer(),
                    
                    // Rating and Price
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 2),
                        Text(
                          equipment.rating.toString(),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${equipment.pricePerDay.toStringAsFixed(0)}đ',
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      'mỗi ngày',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
