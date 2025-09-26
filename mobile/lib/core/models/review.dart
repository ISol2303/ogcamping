class Review {
  final int id;
  final int customerId;
  final String customerName;
  final String? customerAvatar;
  final int serviceId;
  final String? serviceName;
  final double rating;
  final String content;
  final List<String> images; // relative paths từ BE
  final List<String> videos; // relative paths từ BE
  final String? reply;
  final String? status;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Review({
    required this.id,
    required this.customerId,
    required this.customerName,
    this.customerAvatar,
    required this.serviceId,
    this.serviceName,
    required this.rating,
    required this.content,
    required this.images,
    required this.videos,
    this.reply,
    this.status,
    required this.createdAt,
    this.updatedAt,
  });

  // --------------------
  // JSON parsing helpers
  // --------------------
  static int _parseInt(dynamic v) {
    if (v == null) return 0;
    if (v is int) return v;
    return int.tryParse(v.toString()) ?? 0;
  }

  static double _parseDouble(dynamic v) {
    if (v == null) return 0.0;
    if (v is double) return v;
    if (v is int) return v.toDouble();
    return double.tryParse(v.toString()) ?? 0.0;
  }

  static List<String> _parseStringList(dynamic v) {
    if (v == null) return [];
    if (v is List) return v.map((e) => e.toString()).toList();
    return [];
  }

  static DateTime _parseDate(dynamic v) {
    if (v == null) return DateTime.fromMillisecondsSinceEpoch(0);
    if (v is DateTime) return v;
    try {
      return DateTime.parse(v.toString());
    } catch (_) {
      return DateTime.fromMillisecondsSinceEpoch(0);
    }
  }

  factory Review.fromJson(Map<String, dynamic> json) {
    final name =
        json['customerName']?.toString() ?? json['userName']?.toString() ?? '';

    return Review(
      id: _parseInt(json['id']),
      customerId: _parseInt(json['customerId'] ?? json['userId']),
      customerName: name,
      customerAvatar: json['customerAvatar']?.toString(),
      serviceId: _parseInt(json['serviceId'] ?? json['itemId']),
      serviceName:
          json['serviceName']?.toString() ?? json['itemName']?.toString(),
      rating: _parseDouble(json['rating']),
      content: json['content']?.toString() ?? json['comment']?.toString() ?? '',
      images: _parseStringList(json['images']),
      videos: _parseStringList(json['videos']),
      reply: json['reply']?.toString(),
      status: json['status']?.toString(),
      createdAt: _parseDate(json['createdAt']),
      updatedAt:
          json['updatedAt'] != null ? _parseDate(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'customerName': customerName,
      'customerAvatar': customerAvatar,
      'serviceId': serviceId,
      'serviceName': serviceName,
      'rating': rating,
      'content': content,
      'images': images,
      'videos': videos,
      'reply': reply,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  // --------------------
  // Helpers cho media
  // --------------------

  /// Trả về URL đầy đủ cho media (thêm baseUrl nếu BE trả về relative path)
  static String buildFullMediaUrl(String path,
      {String baseUrl = 'http://192.168.0.2468080'}) {
    if (path.isEmpty) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (baseUrl.endsWith('/') && path.startsWith('/')) {
      return baseUrl.substring(0, baseUrl.length - 1) + path;
    }
    return '$baseUrl$path';
  }

  /// Danh sách URL ảnh đầy đủ
  List<String> getFullImageUrls({String baseUrl = 'http://192.168.0.246:8080'}) {
    return images.map((p) => buildFullMediaUrl(p, baseUrl: baseUrl)).toList();
  }

  /// Danh sách URL video đầy đủ
  List<String> getFullVideoUrls({String baseUrl = 'http://192.168.0.246:8080'}) {
    return videos.map((p) => buildFullMediaUrl(p, baseUrl: baseUrl)).toList();
  }
}
