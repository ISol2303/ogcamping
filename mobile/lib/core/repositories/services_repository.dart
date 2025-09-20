import '../services/api_service.dart';
import '../models/camping_service.dart';
import '../models/equipment.dart';
import '../models/combo_package.dart';
import '../models/review.dart';

class ServicesRepository {
  final ApiService _apiService;

  ServicesRepository(this._apiService);

  Future<List<CampingService>> getCampingServices() async {
    try {
      final response = await _apiService.getCampingServices();
      return response.map((json) => CampingService.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load camping services: $e');
    }
  }

  Future<CampingService> getCampingServiceById(String id) async {
    try {
      final response = await _apiService.getCampingServiceById(id);
      return CampingService.fromJson(response);
    } catch (e) {
      throw Exception('Failed to load camping service: $e');
    }
  }

  Future<List<Equipment>> getEquipment() async {
    try {
      final response = await _apiService.getEquipment();
      return response.map((json) => Equipment.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load equipment: $e');
    }
  }

  Future<List<Equipment>> getEquipmentByCategory(EquipmentCategory category) async {
    try {
      final allEquipment = await getEquipment();
      return allEquipment.where((eq) => eq.category == category).toList();
    } catch (e) {
      throw Exception('Failed to load equipment by category: $e');
    }
  }

  Future<List<ComboPackage>> getComboPackages() async {
    try {
      final response = await _apiService.getComboPackages();
      return response.map((json) => ComboPackage.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load combo packages: $e');
    }
  }

  Future<List<ComboPackage>> getPopularCombos() async {
    try {
      final allCombos = await getComboPackages();
      return allCombos.where((combo) => combo.isPopular).toList();
    } catch (e) {
      throw Exception('Failed to load popular combos: $e');
    }
  }

  Future<List<Review>> getReviews(String itemId, String itemType) async {
    try {
      final response = await _apiService.getReviews(itemId, itemType);
      return response.map((json) => Review.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load reviews: $e');
    }
  }

  Future<List<CampingService>> searchServices(String query) async {
    try {
      final allServices = await getCampingServices();
      return allServices.where((service) =>
        service.name.toLowerCase().contains(query.toLowerCase()) ||
        service.description.toLowerCase().contains(query.toLowerCase()) ||
        service.location.toLowerCase().contains(query.toLowerCase())
      ).toList();
    } catch (e) {
      throw Exception('Failed to search services: $e');
    }
  }

  Future<List<Equipment>> searchEquipment(String query) async {
    try {
      final allEquipment = await getEquipment();
      return allEquipment.where((equipment) =>
        equipment.name.toLowerCase().contains(query.toLowerCase()) ||
        equipment.description.toLowerCase().contains(query.toLowerCase()) ||
        equipment.brand.toLowerCase().contains(query.toLowerCase())
      ).toList();
    } catch (e) {
      throw Exception('Failed to search equipment: $e');
    }
  }
}
