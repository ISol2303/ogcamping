import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../repositories/auth_repository.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;
  
  User? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;

  AuthProvider(this._authRepository) {
    _loadUserFromStorage();
  }

  // Getters
  User? get user => _user;
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
      
      _user = null;
      _token = null;
      _error = null;
      
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
}
