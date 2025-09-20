class ComboPackage {
  final String id;
  final String name;
  final String description;
  final List<String> images;
  final double originalPrice;
  final double discountedPrice;
  final double discountPercentage;
  final List<String> serviceIds;
  final List<String> equipmentIds;
  final List<String> includedMeals;
  final List<String> activities;
  final int maxParticipants;
  final int durationDays;
  final bool isPopular;
  final double rating;
  final int reviewCount;
  final DateTime createdAt;

  ComboPackage({
    required this.id,
    required this.name,
    required this.description,
    required this.images,
    required this.originalPrice,
    required this.discountedPrice,
    required this.discountPercentage,
    required this.serviceIds,
    required this.equipmentIds,
    required this.includedMeals,
    required this.activities,
    required this.maxParticipants,
    required this.durationDays,
    required this.isPopular,
    required this.rating,
    required this.reviewCount,
    required this.createdAt,
  });

  factory ComboPackage.fromJson(Map<String, dynamic> json) {
    return ComboPackage(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      images: List<String>.from(json['images']),
      originalPrice: json['originalPrice'].toDouble(),
      discountedPrice: json['discountedPrice'].toDouble(),
      discountPercentage: json['discountPercentage'].toDouble(),
      serviceIds: List<String>.from(json['serviceIds']),
      equipmentIds: List<String>.from(json['equipmentIds']),
      includedMeals: List<String>.from(json['includedMeals']),
      activities: List<String>.from(json['activities']),
      maxParticipants: json['maxParticipants'],
      durationDays: json['durationDays'],
      isPopular: json['isPopular'],
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
      'originalPrice': originalPrice,
      'discountedPrice': discountedPrice,
      'discountPercentage': discountPercentage,
      'serviceIds': serviceIds,
      'equipmentIds': equipmentIds,
      'includedMeals': includedMeals,
      'activities': activities,
      'maxParticipants': maxParticipants,
      'durationDays': durationDays,
      'isPopular': isPopular,
      'rating': rating,
      'reviewCount': reviewCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  double get savings => originalPrice - discountedPrice;
}
