import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/services/screens/services_screen.dart';
import '../../features/services/screens/service_detail_screen.dart';
import '../../features/equipment/screens/equipment_screen.dart';
import '../../features/equipment/screens/equipment_detail_screen.dart';
import '../../features/combo/screens/combo_screen.dart';
import '../../features/combo/screens/combo_detail_screen.dart';
import '../../features/booking/screens/cart_screen.dart';
import '../../features/booking/screens/booking_confirmation_screen.dart';
import '../../features/booking/screens/booking_screen.dart';
import '../../features/booking/screens/booking_history_screen.dart';
import '../../features/booking/screens/payment_success_screen.dart';
import '../../features/booking/screens/payment_failure_screen.dart';
import '../../features/chat/screens/chat_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';
import '../../shared/widgets/main_layout.dart';

class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _shellNavigatorKey = GlobalKey<NavigatorState>();

  static GoRouter createRouter() {
    return GoRouter(
      navigatorKey: _rootNavigatorKey,
      initialLocation: '/splash',
      redirect: (context, state) {
        // Debug logging for deep link handling
        print('🔗 GoRouter redirect - Current location: ${state.uri}');
        print('🔗 Full URI: ${state.uri.toString()}');
        print('🔗 Scheme: ${state.uri.scheme}, Host: ${state.uri.host}, Path: ${state.uri.path}');
        print('🔗 Query params: ${state.uri.queryParameters}');
        
        final uri = state.uri;
        
        // ✅ Handle VNPay payment callback deeplink: ogcamping://payment/result
        if (uri.scheme == 'ogcamping' && 
            uri.host == 'payment' && 
            uri.path == '/result') {
          
          print('🎉 SUCCESS! VNPay Payment Callback Deep Link Detected: $uri');
          
          final queryParams = uri.queryParameters;
          final bookingId = queryParams['bookingId'] ?? '0';
          final status = queryParams['status'] ?? 'failure';
          final txnRef = queryParams['txnRef'];
          final error = queryParams['error'];
          
          print('💳 Payment Result - BookingID: $bookingId, Status: $status, TxnRef: $txnRef');

          // Navigate to Payment Success Screen with parameters
          final redirectPath = '/payment-success?bookingId=$bookingId&status=$status${txnRef != null ? '&txnRef=$txnRef' : ''}${error != null ? '&error=${Uri.encodeComponent(error)}' : ''}';
          print('🔄 GoRouter redirecting to: $redirectPath');
          return redirectPath;
        }
        
        // ✅ Fallback: Handle /result path from any scheme (in case deep link doesn't work properly)
        if (uri.path == '/result' && uri.queryParameters.containsKey('bookingId')) {
          print('🔄 Fallback: Payment result path detected: $uri');
          
          final queryParams = uri.queryParameters;
          final bookingId = queryParams['bookingId'] ?? '0';
          final status = queryParams['status'] ?? 'failure';
          final txnRef = queryParams['txnRef'];
          final error = queryParams['error'];
          
          print('💳 Fallback Payment Result - BookingID: $bookingId, Status: $status, TxnRef: $txnRef');

          // Navigate to Payment Success Screen with parameters
          final redirectPath = '/payment-success?bookingId=$bookingId&status=$status${txnRef != null ? '&txnRef=$txnRef' : ''}${error != null ? '&error=${Uri.encodeComponent(error)}' : ''}';
          print('🔄 Fallback GoRouter redirecting to: $redirectPath');
          return redirectPath;
        }
        
        return null;
      },
      routes: [
        // Splash Screen
        GoRoute(
          path: '/splash',
          name: 'splash',
          builder: (context, state) => const SplashScreen(),
        ),

        // Auth Routes
        GoRoute(
          path: '/login',
          name: 'login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/register',
          name: 'register',
          builder: (context, state) => const RegisterScreen(),
        ),

        // Main App Shell
        ShellRoute(
          navigatorKey: _shellNavigatorKey,
          builder: (context, state, child) => MainLayout(child: child),
          routes: [
            // Home
            GoRoute(
              path: '/home',
              name: 'home',
              builder: (context, state) => const HomeScreen(),
            ),

            // Services
            GoRoute(
              path: '/services',
              name: 'services',
              builder: (context, state) => const ServicesScreen(),
              routes: [
                GoRoute(
                  path: 'detail/:id',
                  name: 'service-detail',
                  builder: (context, state) => ServiceDetailScreen(
                    serviceId: state.pathParameters['id']!,
                  ),
                ),
              ],
            ),

            // Equipment
            GoRoute(
              path: '/equipment',
              name: 'equipment',
              builder: (context, state) => const EquipmentScreen(),
              routes: [
                GoRoute(
                  path: 'detail/:id',
                  name: 'equipment-detail',
                  builder: (context, state) => EquipmentDetailScreen(
                    equipmentId: state.pathParameters['id']!,
                  ),
                ),
              ],
            ),

            // Combos
            GoRoute(
              path: '/combos',
              name: 'combos',
              builder: (context, state) => const ComboScreen(),
              routes: [
                GoRoute(
                  path: 'detail/:id',
                  name: 'combo-detail',
                  builder: (context, state) => ComboDetailScreen(
                    comboId: state.pathParameters['id']!,
                  ),
                ),
              ],
            ),

            // Chat
            GoRoute(
              path: '/chat',
              name: 'chat',
              builder: (context, state) => const ChatScreen(),
            ),

            // Profile
            GoRoute(
              path: '/profile',
              name: 'profile',
              builder: (context, state) => const ProfileScreen(),
              routes: [
                GoRoute(
                  path: 'edit',
                  name: 'edit-profile',
                  builder: (context, state) => const EditProfileScreen(),
                ),
              ],
            ),
          ],
        ),

        // Booking Routes (Full Screen)
        GoRoute(
          path: '/cart',
          name: 'cart',
          parentNavigatorKey: _rootNavigatorKey,
          builder: (context, state) => const CartScreen(),
        ),
        GoRoute(
          path: '/booking-confirmation',
          name: 'booking-confirmation',
          parentNavigatorKey: _rootNavigatorKey,
          builder: (context, state) => const BookingConfirmationScreen(),
        ),
        GoRoute(
          path: '/booking',
          name: 'booking',
          parentNavigatorKey: _rootNavigatorKey,
          builder: (context, state) => const BookingScreen(),
        ),
        GoRoute(
          path: '/booking-history',
          name: 'booking-history',
          parentNavigatorKey: _rootNavigatorKey,
          builder: (context, state) => const BookingHistoryScreen(),
        ),
        // ✅ Fallback route for /result (in case deep link redirect doesn't work)
        GoRoute(
          path: '/result',
          name: 'payment-result',
          parentNavigatorKey: _rootNavigatorKey,
          builder: (context, state) {
            final bookingId = state.uri.queryParameters['bookingId'] ?? '0';
            final status = state.uri.queryParameters['status'] ?? 'failure';
            final txnRef = state.uri.queryParameters['txnRef'];
            final error = state.uri.queryParameters['error'];
            
            print('🎉 Direct Payment Result Route - BookingID: $bookingId, Status: $status, TxnRef: $txnRef');

            // Route to appropriate screen based on backend status
            if (status == 'success') {
              return PaymentSuccessScreen(
                bookingId: bookingId,
                txnRef: txnRef,
              );
            } else {
              return PaymentFailureScreen(
                bookingId: bookingId,
                txnRef: txnRef,
                error: error,
                responseCode: state.uri.queryParameters['responseCode'],
              );
            }
          },
        ),

        GoRoute(
          path: '/payment-success',
          name: 'payment-success',
          parentNavigatorKey: _rootNavigatorKey,
          builder: (context, state) {
            final bookingId = state.uri.queryParameters['bookingId'] ?? '0';
            final status = state.uri.queryParameters['status'] ?? 'failure';
            final txnRef = state.uri.queryParameters['txnRef'];
            final error = state.uri.queryParameters['error'];
            
            print('🎉 Payment Result Screen - BookingID: $bookingId, Status: $status, TxnRef: $txnRef');

            // Route to appropriate screen based on backend status
            if (status == 'success') {
              return PaymentSuccessScreen(
                bookingId: bookingId,
                txnRef: txnRef,
              );
            } else {
              return PaymentFailureScreen(
                bookingId: bookingId,
                txnRef: txnRef,
                error: error,
                responseCode: state.uri.queryParameters['responseCode'],
              );
            }
          },
        ),
      ],
    );
  }
}

// Route Names for easy access
class AppRoutes {
  static const splash = 'splash';
  static const login = 'login';
  static const register = 'register';
  static const home = 'home';
  static const services = 'services';
  static const serviceDetail = 'service-detail';
  static const equipment = 'equipment';
  static const equipmentDetail = 'equipment-detail';
  static const combos = 'combos';
  static const comboDetail = 'combo-detail';
  static const chat = 'chat';
  static const profile = 'profile';
  static const editProfile = 'edit-profile';
  static const cart = 'cart';
  static const bookingConfirmation = 'booking-confirmation';
  static const booking = 'booking';
  static const bookingHistory = 'booking-history';
  static const paymentSuccess = 'payment-success';
}

// Extension for easy navigation
extension GoRouterExtension on GoRouter {
  void pushService(String serviceId) {
    pushNamed(AppRoutes.serviceDetail, pathParameters: {'id': serviceId});
  }

  void pushEquipment(String equipmentId) {
    pushNamed(AppRoutes.equipmentDetail, pathParameters: {'id': equipmentId});
  }

  void pushCombo(String comboId) {
    pushNamed(AppRoutes.comboDetail, pathParameters: {'id': comboId});
  }
}
