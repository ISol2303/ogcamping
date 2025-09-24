import '../config/app_config.dart';

class ComboItem {
  final int serviceId;
  final String serviceName;
  final int quantity;
  final double price;

  ComboItem({
    required this.serviceId,
    required this.serviceName,
    required this.quantity,
    required this.price,
  });

  factory ComboItem.fromJson(Map<String, dynamic> json) {
    return ComboItem(
      serviceId: json['serviceId'] ?? 0,
      serviceName: json['serviceName'] ?? '',
      quantity: json['quantity'] ?? 1,
      price: (json['price'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'serviceId': serviceId,
      'serviceName': serviceName,
      'quantity': quantity,
      'price': price,
    };
  }
}

class ComboPackage {
  final int id;
  final String name;
  final String description;
  final double price;
  final double? originalPrice;
  final int discount;
  final String imageUrl;
  final bool active;
  final double? rating;
  final int? reviewCount;
  final String location;
  final String duration;
  final int minDays;
  final int maxDays;
  final int? minPeople;
  final int? maxPeople;
  final List<String> highlights;
  final List<String> tags;
  final List<ComboItem> items;
  final List<String> equipment;
  final List<String> foods;

  ComboPackage({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.originalPrice,
    required this.discount,
    required this.imageUrl,
    required this.active,
    this.rating,
    this.reviewCount,
    required this.location,
    required this.duration,
    required this.minDays,
    required this.maxDays,
    this.minPeople,
    this.maxPeople,
    required this.highlights,
    required this.tags,
    required this.items,
    required this.equipment,
    required this.foods,
  });

  factory ComboPackage.fromJson(Map<String, dynamic> json) {
    return ComboPackage(
      id: json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      originalPrice: json['originalPrice']?.toDouble(),
      discount: json['discount'] ?? 0,
      imageUrl: json['imageUrl'] ?? '',
      active: json['active'] ?? true,
      rating: json['rating']?.toDouble(),
      reviewCount: json['reviewCount'],
      location: json['location'] ?? '',
      duration: json['duration'] ?? '',
      minDays: json['minDays'] ?? 1,
      maxDays: json['maxDays'] ?? 1,
      minPeople: json['minPeople'],
      maxPeople: json['maxPeople'],
      highlights: List<String>.from(json['highlights'] ?? []),
      tags: List<String>.from(json['tags'] ?? []),
      items: (json['items'] as List? ?? []).map((item) => ComboItem.fromJson(item)).toList(),
      equipment: List<String>.from(json['equipment'] ?? []),
      foods: List<String>.from(json['foods'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'originalPrice': originalPrice,
      'discount': discount,
      'imageUrl': imageUrl,
      'active': active,
      'rating': rating,
      'reviewCount': reviewCount,
      'location': location,
      'duration': duration,
      'minDays': minDays,
      'maxDays': maxDays,
      'minPeople': minPeople,
      'maxPeople': maxPeople,
      'highlights': highlights,
      'tags': tags,
      'items': items.map((item) => item.toJson()).toList(),
      'equipment': equipment,
      'foods': foods,
    };
  }

  double get discountedPrice {
    if (originalPrice != null) {
      return originalPrice! * (1 - discount / 100);
    }
    return price;
  }

  double get savings {
    if (originalPrice != null) {
      return originalPrice! - discountedPrice;
    }
    return 0;
  }

  bool get isPopular => discount > 10 || (rating != null && rating! >= 4.5);

  String get fullImageUrl {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return AppConfig.getImageUrl(imageUrl);
  }

  // Backward compatibility getters
  int get durationDays => maxDays;
  int get maxParticipants => maxPeople ?? 8;
  List<String> get activities => highlights;
  List<String> get includedMeals => foods;
  double get discountPercentage => discount.toDouble();
  List<String> get serviceIds => items.map((item) => item.serviceId.toString()).toList();
  List<String> get equipmentIds => equipment;
}
