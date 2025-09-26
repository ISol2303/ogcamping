import 'package:flutter/foundation.dart';
import '../models/equipment.dart';
import '../services/equipment_service.dart';

class EquipmentProvider with ChangeNotifier {
  final EquipmentService _equipmentService = EquipmentService();

  List<Equipment> _equipment = [];
  List<Equipment> _filteredEquipment = [];
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';
  String _selectedCategory = 'Tất cả';

  // Getters
  List<Equipment> get equipment => _equipment;
  List<Equipment> get filteredEquipment => _filteredEquipment;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;
  String get selectedCategory => _selectedCategory;

  // Load equipment from API
  Future<void> loadEquipment() async {
    _setLoading(true);
    _clearError();

    try {
      final equipment = await _equipmentService.fetchEquipment();
      _equipment = equipment;
      _filteredEquipment = equipment;
      notifyListeners();
    } catch (e) {
      _setError('Không thể tải danh sách thiết bị: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Search equipment
  void searchEquipment(String query) {
    _searchQuery = query;
    _applyFilters();
  }

  // Filter by category
  void filterEquipmentByCategory(String category) {
    _selectedCategory = category;
    _applyFilters();
  }

  // Apply all filters
  void _applyFilters() {
    _filteredEquipment = _equipment.where((equipment) {
      // Search filter
      final matchesSearch = _searchQuery.isEmpty ||
          equipment.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          equipment.description.toLowerCase().contains(_searchQuery.toLowerCase());

      // Category filter
      final matchesCategory = _selectedCategory == 'Tất cả' ||
          equipment.category == _selectedCategory;

      return matchesSearch && matchesCategory;
    }).toList();

    notifyListeners();
  }

  // Get equipment by ID
  Equipment? getEquipmentById(String id) {
    try {
      return _equipment.firstWhere((equipment) => equipment.id == id);
    } catch (e) {
      return null;
    }
  }

  // Refresh equipment
  Future<void> refreshEquipment() async {
    await loadEquipment();
  }

  // Private methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }
}