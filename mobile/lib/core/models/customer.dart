import 'user.dart';

class Customer {
  final int id;
  final String? name;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String address;
  final int userId;
  final User? user; // Nested user object from API

  Customer({
    required this.id,
    this.name,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.address,
    required this.userId,
    this.user,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'],
      name: json['name'],
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      userId: json['userId'],
      user: json['user'] != null ? User.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'address': address,
      'userId': userId,
      'user': user?.toJson(),
    };
  }

  String get fullName => '$firstName $lastName'.trim();
}
