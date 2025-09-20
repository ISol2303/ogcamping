@echo off
echo Running OG Camping Private on Android device...
echo.

echo Step 1: Cleaning project...
flutter clean

echo.
echo Step 2: Getting dependencies...
flutter pub get

echo.
echo Step 3: Running on Android device...
flutter run -d android

pause
