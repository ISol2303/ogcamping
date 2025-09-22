import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user.dart';
import '../models/customer.dart';
import '../repositories/auth_repository.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;
  final ApiService _apiService = ApiService();
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );
  
  User? _user;
  Customer? _customer;
  String? _token;
  bool _isLoading = false;
  String? _error;

  AuthProvider(this._authRepository) {
    _loadUserFromStorage();
  }

  // Getters
  User? get user => _user;
  Customer? get customer => _customer;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null && _token != null;

  // Private methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  Future<void> _saveUserToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    if (_user != null && _token != null) {
      await prefs.setString('user_data', _user!.toJson().toString());
      await prefs.setString('auth_token', _token!);
    }
  }

  Future<void> _loadUserFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userData = prefs.getString('user_data');
      final token = prefs.getString('auth_token');
      
      if (userData != null && token != null) {
        // In a real app, you'd properly parse the JSON
        // For now, we'll skip this to avoid complexity
        _token = token;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading user from storage: $e');
    }
  }

  Future<void> _clearUserFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');
    await prefs.remove('auth_token');
  }

  // Public methods
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _authRepository.login(email, password);
      
      if (result.isSuccess) {
        _user = result.user;
        _token = result.token;
        await _saveUserToStorage();
        _setLoading(false);
        return true;
      } else {
        _setError(result.error);
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<bool> register(String email, String password, String fullName) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _authRepository.register(email, password, fullName);
      
      if (result.isSuccess) {
        // After successful registration, automatically log in
        return await login(email, password);
      } else {
        _setError(result.error);
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<bool> googleSignIn(String idToken) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _authRepository.googleSignIn(idToken);
      
      if (result.isSuccess) {
        _user = result.user;
        _token = result.token;
        await _saveUserToStorage();
        _setLoading(false);
        return true;
      } else {
        _setError(result.error);
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    
    try {
      await _authRepository.logout();
      await _clearUserFromStorage();
      
      // Sign out from Google if user was signed in with Google
      await signOutGoogle();
      
      _user = null;
      _customer = null;
      _token = null;
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  void clearError() {
    _setError(null);
  }

  Future<void> updateProfile(User updatedUser) async {
    _setLoading(true);
    
    try {
      // In a real app, you'd call an API to update the profile
      _user = updatedUser;
      await _saveUserToStorage();
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  // New login methods using real API
  Future<bool> loginWithEmail(String email, String password) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.loginWithEmail(email, password);
      
      if (response['success'] == true) {
        final userData = response['user'];
        final token = response['token'];
        
        _user = User.fromJson(userData);
        _token = token;
        
        // Load customer info
        await _loadCustomerInfo(_user!.id);
        
        await _saveUserToStorage();
        _setLoading(false);
        return true;
      } else {
        _setError(response['message'] ?? 'Login failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<bool> loginWithGoogle(String googleToken) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.loginWithGoogle(googleToken);
      
      if (response['success'] == true) {
        final userData = response['user'];
        final token = response['token'];
        
        _user = User.fromJson(userData);
        _token = token;
        
        // Load customer info
        await _loadCustomerInfo(_user!.id);
        
        await _saveUserToStorage();
        _setLoading(false);
        return true;
      } else {
        _setError(response['message'] ?? 'Google login failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<void> _loadCustomerInfo(int userId) async {
    try {
      _customer = await _apiService.getCustomerById(userId);
    } catch (e) {
      print('Failed to load customer info: $e');
      // Don't throw error, customer info is optional
    }
  }

  // Google Sign-In implementation
  Future<bool> signInWithGoogle() async {
    _setLoading(true);
    _setError(null);

    try {
      // Step 1: Sign in with Google
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        _setLoading(false);
        return false; // User cancelled
      }

      // Step 2: Get authentication details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      if (googleAuth.idToken == null || googleAuth.accessToken == null) {
        _setError('Failed to get Google authentication tokens');
        _setLoading(false);
        return false;
      }

      // Step 3: Send tokens to backend OAuth2 endpoint
      final response = await _apiService.oauth2GoogleLogin(
        googleAuth.idToken!,
        googleAuth.accessToken!,
      );

      if (response['success'] == true) {
        _token = response['token'];
        
        // Load user info
        if (response['user'] != null) {
          _user = User.fromJson(response['user']);
          await _loadCustomerInfo(_user!.id);
        }

        // Save to storage
        await _saveUserToStorage();
        
        _setLoading(false);
        return true;
      } else {
        _setError(response['message'] ?? 'Google login failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Google Sign-In error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Sign out from Google
  Future<void> signOutGoogle() async {
    try {
      await _googleSignIn.signOut();
    } catch (e) {
      print('Google sign out error: $e');
    }
  }

  // Register with email/password
  Future<bool> registerWithEmail({
    required String email,
    required String password,
    required String name,
    String? phone,
    String? address,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiService.register(
        email: email,
        password: password,
        name: name,
        phone: phone,
        address: address,
      );

      if (response['success'] == true) {
        _token = response['token'];
        
        // Load user info
        if (response['user'] != null) {
          _user = User.fromJson(response['user']);
          await _loadCustomerInfo(_user!.id);
        }

        // Save to storage
        await _saveUserToStorage();
        
        _setLoading(false);
        return true;
      } else {
        _setError(response['message'] ?? 'Registration failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Registration error: $e');
      _setLoading(false);
      return false;
    }
  }
}
