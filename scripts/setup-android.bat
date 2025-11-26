@echo off
REM Alga Android Build Setup Script for Windows
REM This script prepares the Android build environment

echo 🔧 Alga Android Build Setup
echo ===========================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Run this script from the project root directory
    exit /b 1
)

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js version: %%i

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Build the frontend
echo 🏗️  Building frontend...
call npm run build

REM Sync Capacitor
echo 🔄 Syncing Capacitor with Android...
call npx cap sync android

REM Check for JAVA_HOME
if "%JAVA_HOME%"=="" (
    echo ⚠️  Warning: JAVA_HOME is not set
    echo    Please set JAVA_HOME to your JDK 21 installation
) else (
    echo ✅ JAVA_HOME: %JAVA_HOME%
)

REM Check for ANDROID_HOME
if "%ANDROID_HOME%"=="" (
    echo ⚠️  Warning: ANDROID_HOME is not set
    echo    Please set ANDROID_HOME to your Android SDK directory
) else (
    echo ✅ ANDROID_HOME: %ANDROID_HOME%
)

echo.
echo ✅ Setup complete!
echo.
echo To build the APK, run:
echo   cd android ^&^& gradlew.bat assembleDebug
echo.
echo The APK will be at:
echo   android\app\build\outputs\apk\debug\app-debug.apk
