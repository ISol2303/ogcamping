import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

// Core
import 'core/navigation/app_router.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/services_provider.dart';
import 'core/providers/booking_provider.dart';
import 'core/providers/chat_provider.dart';
import 'core/providers/theme_provider.dart';
import 'core/repositories/auth_repository.dart';
import 'core/repositories/services_repository.dart';
import 'core/repositories/booking_repository.dart';
import 'core/repositories/chat_repository.dart';
import 'core/services/api_service.dart';

// Global instances to prevent recreation on hot reload
final _apiService = ApiService();
final _authRepository = AuthRepository(_apiService);
final _servicesRepository = ServicesRepository(_apiService);
final _bookingRepository = BookingRepository(_apiService);
final _chatRepository = ChatRepository(_apiService);
final _router = AppRouter.createRouter();

void main() {
  // Disable debug checks in debug mode to prevent hot reload issues
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const OGCampingApp());
}

class OGCampingApp extends StatelessWidget {
  const OGCampingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Theme Provider
        ChangeNotifierProvider(create: (_) => ThemeProvider()),

        // Auth Provider
        ChangeNotifierProvider(create: (_) => AuthProvider(_authRepository)),

        // Services Provider
        ChangeNotifierProvider(
            create: (_) => ServicesProvider(_servicesRepository)),

        // Booking Provider
        ChangeNotifierProvider(
            create: (_) => BookingProvider(_bookingRepository)),

        // Chat Provider
        ChangeNotifierProvider(create: (_) => ChatProvider(_chatRepository)),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp.router(
            key: const ValueKey('og_camping_app'),
            title: 'OG Camping Private',
            debugShowCheckedModeBanner: false,

            // Theme
            theme: ThemeProvider.lightTheme,
            darkTheme: ThemeProvider.darkTheme,
            themeMode: themeProvider.themeMode,

            // Localization
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('vi', 'VN'), // Vietnamese
              Locale('en', 'US'), // English
            ],
            locale: const Locale('vi', 'VN'),

            // Router
            routerConfig: _router,
          );
        },
      ),
    );
  }
}
