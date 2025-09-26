import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

// Core
import 'core/navigation/app_router.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/services_provider.dart';
import 'core/providers/equipment_provider.dart';
import 'core/providers/booking_provider.dart';
import 'core/providers/chat_provider.dart';
import 'core/providers/theme_provider.dart';
import 'core/repositories/auth_repository.dart';
import 'core/repositories/services_repository.dart';
import 'core/repositories/booking_repository.dart';
import 'core/repositories/chat_repository.dart';
import 'core/services/api_service.dart';
import 'core/services/in_app_browser_service.dart';

// Global instances to prevent recreation on hot reload
final _apiService = ApiService();
final _authRepository = AuthRepository(_apiService);
final _servicesRepository = ServicesRepository(_apiService);
final _bookingRepository = BookingRepository(_apiService);
final _chatRepository = ChatRepository(_apiService);
final _router = AppRouter.createRouter();

void main() async {
  // Disable debug checks in debug mode to prevent hot reload issues
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    print('Warning: Could not load .env file: $e');
  }
  runApp(const OGCampingApp());
}

class OGCampingApp extends StatefulWidget {
  const OGCampingApp({super.key});

  @override
  State<OGCampingApp> createState() => _OGCampingAppState();
}

class _OGCampingAppState extends State<OGCampingApp> {
  @override
  void initState() {
    super.initState();
    _initializeDeepLinks();
  }

  void _initializeDeepLinks() {
    InAppBrowserService.instance.initializeDeepLinks(
      onDeepLinkReceived: (params) {
        print('Deep link received in main app: $params');
        // Navigate to payment success screen
        _router.go('/payment-success', extra: params);
      },
    );
  }

  @override
  void dispose() {
    InAppBrowserService.instance.dispose();
    super.dispose();
  }

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

        // Equipment Provider
        ChangeNotifierProvider(create: (_) => EquipmentProvider()),

        // Booking Provider
        ChangeNotifierProxyProvider<AuthProvider, BookingProvider>(
            create: (context) => BookingProvider(_bookingRepository, context.read<AuthProvider>()),
            update: (_, authProvider, previous) => 
                previous ?? BookingProvider(_bookingRepository, authProvider)),

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
