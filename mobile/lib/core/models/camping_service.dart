import '../config/app_config.dart';

enum ServiceType { camping, glamping }

enum ServiceStatus { available, booked, maintenance }

class ServiceAvailability {
  final int id;
  final String date;
  final int totalSlots;
  final int bookedSlots;

  ServiceAvailability({
    required this.id,
    required this.date,
    required this.totalSlots,
    required this.bookedSlots,
  });

  factory ServiceAvailability.fromJson(Map<String, dynamic> json) {
    return ServiceAvailability(
      id: json['id'] ?? 0,
      date: json['date'] ?? '',
      totalSlots: json['totalSlots'] ?? 0,
      bookedSlots: json['bookedSlots'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date,
      'totalSlots': totalSlots,
      'bookedSlots': bookedSlots,
    };
  }

  int get availableSlots => totalSlots - bookedSlots;
  bool get isAvailable => availableSlots > 0;
}

class CampingService {
  final int id;
  final String name;
  final String description;
  final double price;
  final String location;
  final int minDays;
  final int maxDays;
  final int minCapacity;
  final int maxCapacity;
  final bool? isExperience;
  final bool active;
  final double? averageRating;
  final int? totalReviews;
  final String duration;
  final String capacity;
  final String tag;
  final String imageUrl;
  final List<String> extraImageUrls;
  final List<String> highlights;
  final List<String> included;
  final bool allowExtraPeople;
  final double extraFeePerPerson;
  final int maxExtraPeople;
  final int? requireAdditionalSiteIfOver;
  final List<String> itinerary;
  final List<ServiceAvailability> availability;

  CampingService({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.location,
    required this.minDays,
    required this.maxDays,
    required this.minCapacity,
    required this.maxCapacity,
    this.isExperience,
    required this.active,
    this.averageRating,
    this.totalReviews,
    required this.duration,
    required this.capacity,
    required this.tag,
    required this.imageUrl,
    required this.extraImageUrls,
    required this.highlights,
    required this.included,
    required this.allowExtraPeople,
    required this.extraFeePerPerson,
    required this.maxExtraPeople,
    this.requireAdditionalSiteIfOver,
    required this.itinerary,
    required this.availability,
  });

  factory CampingService.fromJson(Map<String, dynamic> json) {
    return CampingService(
      id: json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      location: json['location'] ?? '',
      minDays: json['minDays'] ?? 1,
      maxDays: json['maxDays'] ?? 1,
      minCapacity: json['minCapacity'] ?? 1,
      maxCapacity: json['maxCapacity'] ?? 1,
      isExperience: json['isExperience'],
      active: json['active'] ?? true,
      averageRating: json['averageRating']?.toDouble(),
      totalReviews: json['totalReviews'],
      duration: json['duration'] ?? '',
      capacity: json['capacity'] ?? '',
      tag: json['tag'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      extraImageUrls: List<String>.from(json['extraImageUrls'] ?? []),
      highlights: List<String>.from(json['highlights'] ?? []),
      included: List<String>.from(json['included'] ?? []),
      allowExtraPeople: json['allowExtraPeople'] ?? false,
      extraFeePerPerson: (json['extraFeePerPerson'] ?? 0).toDouble(),
      maxExtraPeople: json['maxExtraPeople'] ?? 0,
      requireAdditionalSiteIfOver: json['requireAdditionalSiteIfOver'],
      itinerary: List<String>.from(json['itinerary'] ?? []),
      availability: (json['availability'] as List? ?? [])
          .map((item) => ServiceAvailability.fromJson(item))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'location': location,
      'minDays': minDays,
      'maxDays': maxDays,
      'minCapacity': minCapacity,
      'maxCapacity': maxCapacity,
      'isExperience': isExperience,
      'active': active,
      'averageRating': averageRating,
      'totalReviews': totalReviews,
      'duration': duration,
      'capacity': capacity,
      'tag': tag,
      'imageUrl': imageUrl,
      'extraImageUrls': extraImageUrls,
      'highlights': highlights,
      'included': included,
      'allowExtraPeople': allowExtraPeople,
      'extraFeePerPerson': extraFeePerPerson,
      'maxExtraPeople': maxExtraPeople,
      'requireAdditionalSiteIfOver': requireAdditionalSiteIfOver,
      'itinerary': itinerary,
      'availability': availability.map((item) => item.toJson()).toList(),
    };
  }

  bool get isAvailable => active && availability.any((slot) => slot.isAvailable);

  double get pricePerNight => price;

  double get rating => averageRating ?? 0.0;

  int get reviewCount => totalReviews ?? 0;

  ServiceType get type {
    if (name.toLowerCase().contains('glamping')) {
      return ServiceType.glamping;
    }
    return ServiceType.camping;
  }

  ServiceStatus get status {
    if (!active) return ServiceStatus.maintenance;
    if (isAvailable) return ServiceStatus.available;
    return ServiceStatus.booked;
  }

  List<String> get images => [fullImageUrl, ...extraImageUrls.map((url) => _getFullImageUrl(url))];

  List<String> get amenities => included;

  String get fullImageUrl {
    return _getFullImageUrl(imageUrl);
  }

  String _getFullImageUrl(String url) {
    // Use centralized configuration for image URLs
    return AppConfig.getImageUrl(url);
  }
}
