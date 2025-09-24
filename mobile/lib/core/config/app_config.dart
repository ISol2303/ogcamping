import 'package:flutter/foundation.dart';

/// Centralized application configuration
/// 
/// This class manages all environment-specific configurations including:
/// - Backend server URLs
/// - API endpoints
/// - Network settings
/// 
/// To change the backend IP address, simply update the [_backendHost] constant.
class AppConfig {
  // 🔧 CONFIGURATION: Change this IP address to match your backend server
  static const String _backendHost = '192.168.56.1';
  static const String _backendPort = '8080';
  
  // Alternative common IPs for development:
  // static const String _backendHost = 'localhost';      // For web development
  // static const String _backendHost = '127.0.0.1';     // Local loopback
  // static const String _backendHost = '10.0.2.2';      // Android emulator
  // static const String _backendHost = '192.168.1.100'; // Your local network IP
  
  /// Base backend URL with automatic platform detection
  static String get baseUrl {
    // For Flutter web, use localhost for same-origin requests
    if (kIsWeb) {
      return 'http://localhost:$_backendPort/apis/v1';
    }
    // For mobile, use the configured IP address
    return 'http://$_backendHost:$_backendPort/apis/v1';
  }
  
  /// Backend server URL (without /apis/v1 suffix)
  static String get serverUrl {
    if (kIsWeb) {
      return 'http://localhost:$_backendPort';
    }
    return 'http://$_backendHost:$_backendPort';
  }
  
  /// Payment service URL
  static String get paymentUrl => '$baseUrl/payments';
  
  /// Get full image URL from relative path
  static String getImageUrl(String? relativePath) {
    if (relativePath == null || relativePath.isEmpty) {
      return '';
    }
    
    // If already a full URL, return as-is
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    
    // Ensure path starts with /
    final path = relativePath.startsWith('/') ? relativePath : '/$relativePath';
    return '$serverUrl$path';
  }
  
  /// Network configuration for Android
  static List<String> get allowedDomains => [
    _backendHost,
    'localhost',
    '127.0.0.1',
    '10.0.2.2', // Android emulator
  ];
  
  /// Development settings
  static const Duration requestTimeout = Duration(seconds: 60);
  static const bool enableDebugLogs = true;
  
  /// Environment info
  static String get environment => kDebugMode ? 'development' : 'production';
  static bool get isWeb => kIsWeb;
  static bool get isMobile => !kIsWeb;
  
  /// Configuration summary for debugging
  static Map<String, dynamic> get configSummary => {
    'backendHost': _backendHost,
    'backendPort': _backendPort,
    'baseUrl': baseUrl,
    'serverUrl': serverUrl,
    'paymentUrl': paymentUrl,
    'platform': isWeb ? 'web' : 'mobile',
    'environment': environment,
    'allowedDomains': allowedDomains,
  };
  
  /// Print configuration for debugging
  static void printConfig() {
    if (enableDebugLogs) {
      print('🔧 AppConfig Summary:');
      configSummary.forEach((key, value) {
        print('   $key: $value');
      });
    }
  }
}
