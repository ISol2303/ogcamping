class AppConfig {
  // Base URLs for different environments
  static const String _devBaseUrl = 'http://192.168.1.13:8080/apis/v1';
  static const String _prodBaseUrl = 'https://your-production-domain.com/apis/v1';
  
  // Current environment (change this to switch between dev/prod)
  static const bool _isDevelopment = true;
  
  // Get the appropriate base URL based on environment
  static String get baseUrl => _isDevelopment ? _devBaseUrl : _prodBaseUrl;
  
  // API endpoints
  static String get servicesEndpoint => '$baseUrl/services';
  static String get equipmentEndpoint => '$baseUrl/gears';
  static String get combosEndpoint => '$baseUrl/combos';
  static String get authEndpoint => '$baseUrl/auth';
  static String get bookingsEndpoint => '$baseUrl/bookings';
  
  // Image base URL
  static String get imageBaseUrl => _isDevelopment 
      ? 'http://192.168.1.13:8080' 
      : 'https://your-production-domain.com';
  
  // Helper method to get full image URL
  static String getImageUrl(String imagePath) {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return '$imageBaseUrl$imagePath';
  }
}
