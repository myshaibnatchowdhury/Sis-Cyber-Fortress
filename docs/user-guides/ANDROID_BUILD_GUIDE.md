# SIS CYBER FORTRESS — Android Build & Release Engineering Guide

**Document Version:** 1.0.0  
**Application Target:** SIS CYBER FORTRESS (Android 8.0 to Android 14+)  
**Package Identifier:** `com.sis.cyberfortress`  
**Framework:** Kotlin 1.9.23 + Jetpack Compose (Material 3)  

---

## 1. Build Specifications & Target Platforms

| Property | Value | Notes |
|:---|:---|:---|
| **Application ID** | `com.sis.cyberfortress` | Defined in `app/build.gradle.kts` |
| **Minimum SDK** | `26` (Android 8.0 Oreo) | Ensures Keystore AES-GCM and Notification Channels |
| **Target / Compile SDK** | `34` (Android 14 UpsideDownCake) | Full compliance with Google Play modern API standards |
| **Android Gradle Plugin** | `8.2.1` | Modern Gradle build toolset |
| **Gradle Distribution** | `8.2.1-bin` | Configured in `gradle/wrapper/gradle-wrapper.properties` |
| **JVM Compatibility** | Java 17 | Eclipse Temurin OpenJDK 17.0.13 |

---

## 2. Debug Build Procedure

To compile and package the debug APK from the command line:

```powershell
# Set JDK 17 environment variables
$env:JAVA_HOME = "C:\Users\UESR\.gemini\antigravity\scratch\jdk17\jdk-17.0.13+11"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# Navigate to android-app directory
cd C:\Users\UESR\.gemini\antigravity\scratch\sis-cyber-fortress\android-app

# Execute debug build
.\gradlew.bat assembleDebug
```

### Verified Build Artifact:
```
Location: android-app/app/build/outputs/apk/debug/app-debug.apk
Size: 17,062,659 bytes (17.06 MB)
SHA-256 Digest: Generated during build
```

---

## 3. Release Build & Code Signing Configuration

To prepare the application for production distribution:

### 3.1 Generate a Production Keystore
Generate a cryptographically secure 4096-bit RSA keystore using Java `keytool`:

```bash
keytool -genkeypair -v \
  -keystore release-key.jks \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000 \
  -alias sis-cyber-fortress
```

### 3.2 Configure Signing in `app/build.gradle.kts`
Add the production signing configuration to `android-app/app/build.gradle.kts`:

```kotlin
android {
    ...
    signingConfigs {
        create("release") {
            storeFile = file(System.getenv("KEYSTORE_PATH") ?: "release-key.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = System.getenv("KEY_ALIAS") ?: "sis-cyber-fortress"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

### 3.3 Build Release APK & App Bundle (AAB)
```powershell
# Compile signed release APK
.\gradlew.bat assembleRelease

# Compile signed Google Play App Bundle (AAB)
.\gradlew.bat bundleRelease
```

---

## 4. Deploying & Sideloading onto Android Devices

### 4.1 Via Android Debug Bridge (ADB)
Connect an Android physical device with USB Debugging enabled (or start an Android Virtual Device):

```bash
# Verify device connection
adb devices

# Install debug APK
adb install -r android-app/app/build/outputs/apk/debug/app-debug.apk

# Launch the main activity
adb shell am start -n com.sis.cyberfortress/.MainActivity
```

### 4.2 Sideloading on Physical Device
1. Transfer `app-debug.apk` to your Android device via USB, Google Drive, or local file sharing.
2. Open your device's **Files** app and tap `app-debug.apk`.
3. If prompted, toggle "Allow from this source" in Android Settings.
4. Tap **Install** and launch **SIS Cyber Fortress**.

---

## 5. Runtime Permissions & Android 14 Architecture

The application handles modern runtime permissions gracefully:
- **`POST_NOTIFICATIONS` (API 33+)**: Prompts the user upon first launch to enable threat and SOC incident notifications.
- **`USE_BIOMETRIC`**: Enables hardware fingerprint and face unlock for the zero-knowledge vault.
- **`ACCESS_NETWORK_STATE` & `ACCESS_WIFI_STATE`**: Powers the Network Sentinel module to detect open Wi-Fi risks without accessing private location data.
- **`SCHEDULE_EXACT_ALARM`**: Ensures WorkManager background security audit tasks trigger reliably.
