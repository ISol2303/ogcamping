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
      print('ServicesRepository: Fetching services from API...');
      final response = await _apiService.getCampingServices();
      print('ServicesRepository: Got ${response.length} services from API');
      
      final services = <CampingService>[];
      for (int i = 0; i < response.length; i++) {
        try {
          final service = CampingService.fromJson(response[i]);
          services.add(service);
        } catch (e) {
          print('ServicesRepository: Error parsing service at index $i: $e');
          print('ServicesRepository: Service data: ${response[i]}');
          // Continue with other services instead of failing completely
        }
      }
      
      print('ServicesRepository: Successfully parsed ${services.length} services');
      return services;
    } catch (e) {
      print('ServicesRepository: Failed to load camping services: $e');
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
      print('ServicesRepository: Fetching combos from API...');
      final response = await _apiService.getComboPackages();
      print('ServicesRepository: Got ${response.length} combos from API');
      
      final combos = <ComboPackage>[];
      for (int i = 0; i < response.length; i++) {
        try {
          final combo = ComboPackage.fromJson(response[i]);
          combos.add(combo);
        } catch (e) {
          print('ServicesRepository: Error parsing combo at index $i: $e');
          print('ServicesRepository: Combo data: ${response[i]}');
          // Continue with other combos instead of failing completely
        }
      }
      
      print('ServicesRepository: Successfully parsed ${combos.length} combos');
      return combos;
    } catch (e) {
      print('ServicesRepository: Failed to load combo packages: $e');
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
        equipment.area.toLowerCase().contains(query.toLowerCase())
      ).toList();
    } catch (e) {
      throw Exception('Failed to search equipment: $e');
    }
  }

  Future<List<ServiceAvailability>> getServiceAvailability(String serviceId) async {
    try {
      print('ServicesRepository: Fetching availability for service $serviceId');
      final response = await _apiService.getServiceAvailability(serviceId);
      final availabilities = response.map((json) => ServiceAvailability.fromJson(json)).toList();
      print('ServicesRepository: Successfully parsed ${availabilities.length} availability slots');
      return availabilities;
    } catch (e) {
      print('ServicesRepository: Failed to load availability: $e');
      throw Exception('Failed to load service availability: $e');
    }
  }
}
