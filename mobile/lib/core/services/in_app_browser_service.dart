import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:app_links/app_links.dart';
import 'package:url_launcher/url_launcher.dart';

class InAppBrowserService {
  static InAppBrowserService? _instance;
  static InAppBrowserService get instance =>
      _instance ??= InAppBrowserService._();

  InAppBrowserService._();

  StreamSubscription<Uri>? _linkSubscription;
  Function(Map<String, String>)? _onDeepLinkReceived;
  final _appLinks = AppLinks();

  /// Initialize deep link listening
  Future<void> initializeDeepLinks({
    required Function(Map<String, String>) onDeepLinkReceived,
  }) async {
    _onDeepLinkReceived = onDeepLinkReceived;

    try {
      // Listen for incoming links when app is already running
      _linkSubscription = _appLinks.uriLinkStream.listen(
        (Uri uri) {
          print('Deep link received: $uri');
          _handleDeepLink(uri);
        },
        onError: (err) {
          print('Deep link error: $err');
        },
      );

      // Check for initial link when app is launched from deep link
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) {
        print('Initial deep link: $initialUri');
        _handleDeepLink(initialUri);
      }
    } catch (e) {
      print('Failed to initialize deep links: $e');
    }
  }

  /// Handle deep link and extract parameters
  void _handleDeepLink(Uri uri) {
    if (uri.scheme == 'ogcamping' && uri.host == 'payment' && uri.path == '/result') {
      final params = <String, String>{};
      uri.queryParameters.forEach((key, value) {
        params[key] = value;
      });

      print('Payment deep link params: $params');
      
      // Backend already determines success/failure status
      // Just preserve the status from backend and add VNPay response codes if available
      final responseCode = params['vnp_ResponseCode'];
      if (responseCode != null) {
        params['responseCode'] = responseCode;
      }
      
      _onDeepLinkReceived?.call(params);
    }
  }

  /// Open URL in in-app browser with payment handling
  Future<void> openPaymentUrl({
    required String url,
    required BuildContext context,
    Function(Map<String, String>)? onPaymentResult,
  }) async {
    try {
      final browser = PaymentInAppBrowser(
        onPaymentResult: onPaymentResult,
      );

      await browser.openUrlRequest(
        urlRequest: URLRequest(url: WebUri(url)),
        settings: InAppBrowserClassSettings(
          browserSettings: InAppBrowserSettings(
            hideUrlBar: true,
            hideToolbarTop: false,
            toolbarTopBackgroundColor: Theme.of(context).primaryColor,
            presentationStyle: ModalPresentationStyle.FULL_SCREEN,
          ),
          webViewSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            domStorageEnabled: true,
            databaseEnabled: true,
            userAgent: 'OGCamping-Mobile-App',
          ),
        ),
      );
    } catch (e) {
      print('Error opening in-app browser: $e');
      // Fallback to external browser
      await _openInExternalBrowser(url);
    }
  }

  /// Fallback: Open URL in external browser
  Future<void> _openInExternalBrowser(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
      } else {
        throw 'Could not launch $url';
      }
    } catch (e) {
      print('Error launching external browser: $e');
    }
  }

  /// Dispose resources
  void dispose() {
    _linkSubscription?.cancel();
    _linkSubscription = null;
    _onDeepLinkReceived = null;
  }
}

/// Custom InAppBrowser for payment handling
class PaymentInAppBrowser extends InAppBrowser {
  final Function(Map<String, String>)? onPaymentResult;

  PaymentInAppBrowser({this.onPaymentResult});

  @override
  Future<void> onBrowserCreated() async {
    print('Payment browser created');
  }

  @override
  Future<void> onLoadStart(url) async {
    print('Payment browser started loading: $url');
  }

  @override
  Future<void> onLoadStop(url) async {
    print('Payment browser finished loading: $url');

    // Check if this is a payment result URL
    if (url != null && url.toString().contains('ogcamping://payment/result')) {
      print('🔗 Payment result URL detected: $url');

      // Close browser first
      await close();
      
      // Extract parameters and call onPaymentResult
      final uri = Uri.parse(url.toString());
      final params = <String, String>{};
      uri.queryParameters.forEach((key, value) {
        params[key] = value;
      });
      
      print('✅ Payment result parameters extracted from onLoadStop: $params');
      onPaymentResult?.call(params);
    }
  }

  @override
  Future<void> onReceivedError(
      WebResourceRequest request, WebResourceError error) async {
    print('Payment browser error: ${error.description}');
  }

  @override
  Future<void> onProgressChanged(progress) async {
    print('Payment browser progress: $progress%');
  }

  @override
  Future<NavigationActionPolicy?> shouldOverrideUrlLoading(
      NavigationAction navigationAction) async {
    final url = navigationAction.request.url;

    if (url != null && url.scheme == 'ogcamping') {
      print('🔗 Deep link intercepted in browser: $url');

      // Close browser first
      await close();
      
      // Extract parameters and call onPaymentResult to let booking_confirmation handle navigation
      final params = <String, String>{};
      url.queryParameters.forEach((key, value) {
        params[key] = value;
      });
      
      print('✅ Deep link parameters extracted: $params');
      onPaymentResult?.call(params);
      
      return NavigationActionPolicy.CANCEL;
    }

    // Allow normal navigation
    return NavigationActionPolicy.ALLOW;
  }
}
