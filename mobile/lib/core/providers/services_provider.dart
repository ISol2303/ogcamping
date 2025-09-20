import 'package:flutter/foundation.dart';
import '../models/camping_service.dart';
import '../models/equipment.dart';
import '../models/combo_package.dart';
import '../models/review.dart';
import '../repositories/services_repository.dart';

class ServicesProvider extends ChangeNotifier {
  final ServicesRepository _servicesRepository;

  ServicesProvider(this._servicesRepository);

  // Services
  List<CampingService> _services = [];
  List<CampingService> _filteredServices = [];
  bool _servicesLoading = false;
  String? _servicesError;

  // Equipment
  List<Equipment> _equipment = [];
  List<Equipment> _filteredEquipment = [];
  bool _equipmentLoading = false;
  String? _equipmentError;

  // Combos
  List<ComboPackage> _combos = [];
  List<ComboPackage> _filteredCombos = [];
  bool _combosLoading = false;
  String? _combosError;

  // Reviews
  final Map<String, List<Review>> _reviews = {};
  bool _reviewsLoading = false;
  String? _reviewsError;

  // Search
  String _searchQuery = '';
  ServiceType? _selectedServiceType;
  EquipmentCategory? _selectedEquipmentCategory;

  // Getters
  List<CampingService> get services => _filteredServices.isEmpty ? _services : _filteredServices;
  List<Equipment> get equipment => _filteredEquipment.isEmpty ? _equipment : _filteredEquipment;
  List<ComboPackage> get combos => _filteredCombos.isEmpty ? _combos : _filteredCombos;
  
  bool get servicesLoading => _servicesLoading;
  bool get equipmentLoading => _equipmentLoading;
  bool get combosLoading => _combosLoading;
  bool get reviewsLoading => _reviewsLoading;
  
  String? get servicesError => _servicesError;
  String? get equipmentError => _equipmentError;
  String? get combosError => _combosError;
  String? get reviewsError => _reviewsError;
  
  String get searchQuery => _searchQuery;
  ServiceType? get selectedServiceType => _selectedServiceType;
  EquipmentCategory? get selectedEquipmentCategory => _selectedEquipmentCategory;

  List<ComboPackage> get popularCombos => _combos.where((combo) => combo.isPopular).toList();
  List<CampingService> get availableServices => _services.where((service) => service.isAvailable).toList();
  List<Equipment> get availableEquipment => _equipment.where((eq) => eq.isAvailable).toList();

  // Load data methods
  Future<void> loadServices() async {
    _servicesLoading = true;
    _servicesError = null;
    notifyListeners();

    try {
      _services = await _servicesRepository.getCampingServices();
      _applyServicesFilter();
      _servicesLoading = false;
      notifyListeners();
    } catch (e) {
      _servicesError = e.toString();
      _servicesLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadEquipment() async {
    _equipmentLoading = true;
    _equipmentError = null;
    notifyListeners();

    try {
      _equipment = await _servicesRepository.getEquipment();
      _applyEquipmentFilter();
      _equipmentLoading = false;
      notifyListeners();
    } catch (e) {
      _equipmentError = e.toString();
      _equipmentLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadCombos() async {
    _combosLoading = true;
    _combosError = null;
    notifyListeners();

    try {
      _combos = await _servicesRepository.getComboPackages();
      _applyCombosFilter();
      _combosLoading = false;
      notifyListeners();
    } catch (e) {
      _combosError = e.toString();
      _combosLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadReviews(String itemId, String itemType) async {
    _reviewsLoading = true;
    _reviewsError = null;
    notifyListeners();

    try {
      final reviews = await _servicesRepository.getReviews(itemId, itemType);
      _reviews[itemId] = reviews;
      _reviewsLoading = false;
      notifyListeners();
    } catch (e) {
      _reviewsError = e.toString();
      _reviewsLoading = false;
      notifyListeners();
    }
  }

  // Get specific items
  CampingService? getServiceById(String id) {
    try {
      return _services.firstWhere((service) => service.id == id);
    } catch (e) {
      return null;
    }
  }

  Equipment? getEquipmentById(String id) {
    try {
      return _equipment.firstWhere((eq) => eq.id == id);
    } catch (e) {
      return null;
    }
  }

  ComboPackage? getComboById(String id) {
    try {
      return _combos.firstWhere((combo) => combo.id == id);
    } catch (e) {
      return null;
    }
  }

  List<Review> getReviewsForItem(String itemId) {
    return _reviews[itemId] ?? [];
  }

  // Search and filter methods
  void searchServices(String query) {
    _searchQuery = query;
    _applyServicesFilter();
    notifyListeners();
  }

  void searchEquipment(String query) {
    _searchQuery = query;
    _applyEquipmentFilter();
    notifyListeners();
  }

  void filterServicesByType(ServiceType? type) {
    _selectedServiceType = type;
    _applyServicesFilter();
    notifyListeners();
  }

  void filterEquipmentByCategory(EquipmentCategory? category) {
    _selectedEquipmentCategory = category;
    _applyEquipmentFilter();
    notifyListeners();
  }

  void clearFilters() {
    _searchQuery = '';
    _selectedServiceType = null;
    _selectedEquipmentCategory = null;
    _applyServicesFilter();
    _applyEquipmentFilter();
    _applyCombosFilter();
    notifyListeners();
  }

  // Private filter methods
  void _applyServicesFilter() {
    _filteredServices = _services.where((service) {
      bool matchesSearch = _searchQuery.isEmpty ||
          service.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          service.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          service.location.toLowerCase().contains(_searchQuery.toLowerCase());

      bool matchesType = _selectedServiceType == null || service.type == _selectedServiceType;

      return matchesSearch && matchesType;
    }).toList();
  }

  void _applyEquipmentFilter() {
    _filteredEquipment = _equipment.where((equipment) {
      bool matchesSearch = _searchQuery.isEmpty ||
          equipment.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          equipment.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          equipment.brand.toLowerCase().contains(_searchQuery.toLowerCase());

      bool matchesCategory = _selectedEquipmentCategory == null || 
          equipment.category == _selectedEquipmentCategory;

      return matchesSearch && matchesCategory;
    }).toList();
  }

  void _applyCombosFilter() {
    _filteredCombos = _combos.where((combo) {
      bool matchesSearch = _searchQuery.isEmpty ||
          combo.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          combo.description.toLowerCase().contains(_searchQuery.toLowerCase());

      return matchesSearch;
    }).toList();
  }

  // Refresh methods
  Future<void> refreshAll() async {
    await Future.wait([
      loadServices(),
      loadEquipment(),
      loadCombos(),
    ]);
  }
}
