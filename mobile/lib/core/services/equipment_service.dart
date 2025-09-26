import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/equipment.dart';
import '../config/app_config.dart';

class EquipmentService {

  Future<List<Equipment>> fetchEquipment() async {
    try {
      final url = Uri.parse(AppConfig.equipmentEndpoint);
      final response = await http.get(url);

      if (response.statusCode == 200) {
        List<dynamic> body = json.decode(utf8.decode(response.bodyBytes));
        return body.map((dynamic item) => Equipment.fromJson(item)).toList();
      } else {
        throw Exception('Failed to load equipment: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching equipment: $e');
    }
  }

  Future<Equipment> fetchEquipmentById(String id) async {
    try {
      final url = Uri.parse('${AppConfig.equipmentEndpoint}/$id');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        return Equipment.fromJson(json.decode(utf8.decode(response.bodyBytes)));
      } else {
        throw Exception('Failed to load equipment $id: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching equipment $id: $e');
    }
  }

  Future<List<Equipment>> searchEquipment({
    String? name,
    String? category,
    String? area,
    String? status,
  }) async {
    try {
      final Map<String, String> queryParams = {};
      if (name != null && name.isNotEmpty) queryParams['name'] = name;
      if (category != null && category.isNotEmpty) queryParams['category'] = category;
      if (area != null && area.isNotEmpty) queryParams['area'] = area;
      if (status != null && status.isNotEmpty) queryParams['status'] = status;

      final uri = Uri.parse(AppConfig.equipmentEndpoint).replace(queryParameters: queryParams);
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        List<dynamic> body = json.decode(utf8.decode(response.bodyBytes));
        return body.map((dynamic item) => Equipment.fromJson(item)).toList();
      } else {
        throw Exception('Failed to search equipment: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      throw Exception('Error searching equipment: $e');
    }
  }
}
