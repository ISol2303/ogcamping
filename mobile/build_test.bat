@echo off
echo Testing OG Camping Private build...
echo.

echo Step 1: Cleaning project...
flutter clean
if %ERRORLEVEL% neq 0 (
    echo ERROR: flutter clean failed
    pause
    exit /b 1
)

echo.
echo Step 2: Running flutter pub get...
flutter pub get
if %ERRORLEVEL% neq 0 (
    echo ERROR: flutter pub get failed
    pause
    exit /b 1
)

echo.
echo Step 3: Running flutter analyze...
flutter analyze
if %ERRORLEVEL% neq 0 (
    echo WARNING: flutter analyze found issues
)

echo.
echo Step 4: Testing build for Android...
flutter build apk --debug
if %ERRORLEVEL% neq 0 (
    echo ERROR: flutter build failed
    pause
    exit /b 1
)

echo.
echo SUCCESS: Build completed successfully!
echo APK location: build\app\outputs\flutter-apk\app-debug.apk
pause
