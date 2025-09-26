import '../services/api_service.dart';
import '../models/user.dart';

class AuthRepository {
  final ApiService _apiService;

  AuthRepository(this._apiService);

  Future<AuthResult> login(String email, String password) async {
    try {
      final response = await _apiService.login(email, password);

      if (response['success'] == true) {
        final user = User.fromJson(response['user']);
        final token = response['token'];

        // Lưu token vào ApiService để các request sau dùng được
        _apiService.token = token;

        return AuthResult.success(
          user: user,
          token: token,
        );
      }

      return AuthResult.failure('Login failed');
    } catch (e) {
      return AuthResult.failure(e.toString());
    }
  }

  Future<AuthResult> register(
      String email, String password, String fullName) async {
    try {
      final response = await _apiService.register(
        email: email,
        password: password,
        name: fullName,
      );

      if (response['success'] == true) {
        final user = User.fromJson(response['user']);
        return AuthResult.success(user: user);
      }

      return AuthResult.failure('Registration failed');
    } catch (e) {
      return AuthResult.failure(e.toString());
    }
  }

  Future<AuthResult> googleSignIn(String idToken) async {
    try {
      final response = await _apiService.googleSignIn(idToken);

      if (response['success'] == true) {
        final user = User.fromJson(response['user']);
        return AuthResult.success(
          user: user,
          token: response['token'],
        );
      }

      return AuthResult.failure('Google sign in failed');
    } catch (e) {
      return AuthResult.failure(e.toString());
    }
  }

  Future<void> logout() async {
    // Clear local storage, tokens, etc.
    // In a real app, you might also call an API to invalidate the token
  }
}

class AuthResult {
  final bool isSuccess;
  final User? user;
  final String? token;
  final String? error;

  AuthResult._({
    required this.isSuccess,
    this.user,
    this.token,
    this.error,
  });

  factory AuthResult.success({User? user, String? token}) {
    return AuthResult._(
      isSuccess: true,
      user: user,
      token: token,
    );
  }

  factory AuthResult.failure(String error) {
    return AuthResult._(
      isSuccess: false,
      error: error,
    );
  }
}
