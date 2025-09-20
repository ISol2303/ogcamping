enum EquipmentCategory { tent, cooking, lighting, sleeping, furniture, other }

enum EquipmentStatus { available, rented, maintenance }

class Equipment {
  final String id;
  final String name;
  final String description;
  final List<String> images;
  final double pricePerDay;
  final EquipmentCategory category;
  final EquipmentStatus status;
  final int quantity;
  final int availableQuantity;
  final String brand;
  final Map<String, dynamic> specifications;
  final double rating;
  final int reviewCount;
  final DateTime createdAt;

  Equipment({
    required this.id,
    required this.name,
    required this.description,
    required this.images,
    required this.pricePerDay,
    required this.category,
    required this.status,
    required this.quantity,
    required this.availableQuantity,
    required this.brand,
    required this.specifications,
    required this.rating,
    required this.reviewCount,
    required this.createdAt,
  });

  factory Equipment.fromJson(Map<String, dynamic> json) {
    return Equipment(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      images: List<String>.from(json['images']),
      pricePerDay: json['pricePerDay'].toDouble(),
      category: EquipmentCategory.values.firstWhere(
        (e) => e.toString().split('.').last == json['category'],
      ),
      status: EquipmentStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
      ),
      quantity: json['quantity'],
      availableQuantity: json['availableQuantity'],
      brand: json['brand'],
      specifications: Map<String, dynamic>.from(json['specifications']),
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
      'pricePerDay': pricePerDay,
      'category': category.toString().split('.').last,
      'status': status.toString().split('.').last,
      'quantity': quantity,
      'availableQuantity': availableQuantity,
      'brand': brand,
      'specifications': specifications,
      'rating': rating,
      'reviewCount': reviewCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isAvailable => status == EquipmentStatus.available && availableQuantity > 0;
}
