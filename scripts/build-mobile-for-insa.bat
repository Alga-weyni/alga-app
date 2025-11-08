@echo off
REM ========================================
REM ALGA MOBILE BUILD SCRIPT FOR INSA AUDIT (Windows)
REM ========================================
REM This script builds Android APK on Windows
REM Run this on your LOCAL Windows computer with Android Studio

echo Building Alga Mobile Apps for INSA Security Audit
echo ====================================================

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    exit /b 1
)

echo Node.js found: 
node --version

REM Install dependencies
echo.
echo Installing dependencies...
call npm install

REM Build web assets
echo.
echo Building web assets...
call npm run build

REM Sync with Capacitor
echo.
echo Syncing with Capacitor...
call npx cap sync

REM Android Build
echo.
echo Building Android APK...
echo Opening Android Studio...
echo.
echo In Android Studio:
echo 1. Open 'android' folder
echo 2. Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)
echo 3. Find APK in: android\app\build\outputs\apk\debug\app-debug.apk
echo 4. Copy to: builds\mobile\app-debug.apk

call npx cap open android

echo.
echo After building in Android Studio:
echo 1. Copy APK files to builds\mobile\
echo 2. Run: npm run insa:package-mobile
echo 3. Submit to INSA

pause
