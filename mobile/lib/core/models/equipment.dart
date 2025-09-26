enum EquipmentCategory { tent, cooking, lighting, sleeping, furniture, other }

enum EquipmentStatus { available, outOfStock }

class Equipment {
  final String id;
  final String name;
  final String description;
  final String imageUrl;
  final double pricePerDay;
  final String category;
  final String status;
  final int available;
  final int quantityInStock;
  final String area;
  final double rating;
  final int reviewCount;
  final DateTime createdAt;

  Equipment({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.pricePerDay,
    required this.category,
    required this.status,
    required this.available,
    required this.quantityInStock,
    required this.area,
    required this.rating,
    required this.reviewCount,
    required this.createdAt,
  });

  factory Equipment.fromJson(Map<String, dynamic> json) {
    return Equipment(
      id: json['id']?.toString() ?? '0',
      name: (json['name']?.toString() ?? 'Thiết bị không tên').trim(),
      description: json['description']?.toString() ?? '',
      imageUrl: json['image']?.toString() ?? '',
      pricePerDay: (json['pricePerDay'] ?? 0).toDouble(),
      category: json['category']?.toString() ?? 'Khác',
      status: json['status']?.toString() ?? 'AVAILABLE',
      available: json['available'] ?? 0,
      quantityInStock: json['quantityInStock'] ?? 0,
      area: json['area']?.toString() ?? 'Khu vực chung',
      rating: (json['rating'] ?? 4.5).toDouble(),
      reviewCount: json['reviewCount'] ?? 0,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'image': imageUrl,
      'pricePerDay': pricePerDay,
      'category': category,
      'status': status,
      'available': available,
      'quantityInStock': quantityInStock,
      'area': area,
      'rating': rating,
      'reviewCount': reviewCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isAvailable => status == 'AVAILABLE' && available > 0;
}
