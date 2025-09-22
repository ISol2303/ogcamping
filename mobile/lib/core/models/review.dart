class Review {
  final String id;
  final String userId;
  final String userName;
  final String? userAvatar;
  final String itemId;
  final String itemType; // 'service', 'equipment', 'combo'
  final double rating;
  final String comment;
  final List<String> images;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Review({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.itemId,
    required this.itemType,
    required this.rating,
    required this.comment,
    required this.images,
    required this.createdAt,
    this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      userId: json['userId'],
      userName: json['userName'],
      userAvatar: json['userAvatar'],
      itemId: json['itemId'],
      itemType: json['itemType'],
      rating: json['rating'].toDouble(),
      comment: json['comment'],
      images: List<String>.from(json['images'] ?? []),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'userAvatar': userAvatar,
      'itemId': itemId,
      'itemType': itemType,
      'rating': rating,
      'comment': comment,
      'images': images,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}
