enum ServiceType { camping, glamping }

enum ServiceStatus { available, booked, maintenance }

class CampingService {
  final String id;
  final String name;
  final String description;
  final List<String> images;
  final double pricePerNight;
  final ServiceType type;
  final ServiceStatus status;
  final String location;
  final int maxCapacity;
  final List<String> amenities;
  final double rating;
  final int reviewCount;
  final DateTime createdAt;

  CampingService({
    required this.id,
    required this.name,
    required this.description,
    required this.images,
    required this.pricePerNight,
    required this.type,
    required this.status,
    required this.location,
    required this.maxCapacity,
    required this.amenities,
    required this.rating,
    required this.reviewCount,
    required this.createdAt,
  });

  factory CampingService.fromJson(Map<String, dynamic> json) {
    return CampingService(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      images: List<String>.from(json['images']),
      pricePerNight: json['pricePerNight'].toDouble(),
      type: ServiceType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
      ),
      status: ServiceStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
      ),
      location: json['location'],
      maxCapacity: json['maxCapacity'],
      amenities: List<String>.from(json['amenities']),
      rating: json['rating'].toDouble(),
      reviewCount: json['reviewCount'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'images': images,
      'pricePerNight': pricePerNight,
      'type': type.toString().split('.').last,
      'status': status.toString().split('.').last,
      'location': location,
      'maxCapacity': maxCapacity,
      'amenities': amenities,
      'rating': rating,
      'reviewCount': reviewCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isAvailable => status == ServiceStatus.available;
}
