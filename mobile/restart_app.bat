@echo off
echo Restarting OG Camping Private app...
echo.

echo Step 1: Stopping current app...
taskkill /f /im flutter.exe 2>nul

echo.
echo Step 2: Cleaning build cache...
flutter clean

echo.
echo Step 3: Getting dependencies...
flutter pub get

echo.
echo Step 4: Starting app with hot restart...
flutter run -d android --hot

pause
