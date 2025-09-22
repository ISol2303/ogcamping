class User {
  final int id;
  final String email;
  final String name;
  final String role;
  final String? avatar;
  final String? phone;
  final String? department;
  final DateTime? joinDate;
  final String status;
  final bool agreeMarketing;
  final String? address;
  final DateTime createdAt;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.avatar,
    this.phone,
    this.department,
    this.joinDate,
    required this.status,
    required this.agreeMarketing,
    this.address,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      name: json['name'] ?? '',
      role: json['role'] ?? 'CUSTOMER',
      avatar: json['avatar'],
      phone: json['phone'],
      department: json['department'],
      joinDate: json['joinDate'] != null ? DateTime.parse(json['joinDate']) : null,
      status: json['status'] ?? 'ACTIVE',
      agreeMarketing: json['agreeMarketing'] ?? false,
      address: json['address'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'avatar': avatar,
      'phone': phone,
      'department': department,
      'joinDate': joinDate?.toIso8601String(),
      'status': status,
      'agreeMarketing': agreeMarketing,
      'address': address,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  User copyWith({
    int? id,
    String? email,
    String? name,
    String? role,
    String? avatar,
    String? phone,
    String? department,
    DateTime? joinDate,
    String? status,
    bool? agreeMarketing,
    String? address,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      avatar: avatar ?? this.avatar,
      phone: phone ?? this.phone,
      department: department ?? this.department,
      joinDate: joinDate ?? this.joinDate,
      status: status ?? this.status,
      agreeMarketing: agreeMarketing ?? this.agreeMarketing,
      address: address ?? this.address,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  // Backward compatibility getters
  String get fullName => name;
  String? get phoneNumber => phone;
}
