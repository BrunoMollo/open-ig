## Android APK build

This project can generate a local Android APK with Expo prebuild plus Gradle.

### Current output

After a successful release build, the APK is generated at:

`android/app/build/outputs/apk/release/app-release.apk`

### Current Android package name

The project is currently configured with:

`com.anonymous.openig`

If you want a permanent package name for distribution, replace it in `app.json` before building.

### Prerequisites

- Node.js and npm installed
- Homebrew installed on macOS
- Java 17
- Android command-line tools

### One-time environment setup on macOS

Install the required native tooling:

```bash
brew install openjdk@17
brew install --cask android-commandlinetools
```

Use these environment variables for the current shell session:

```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
```

Accept Android licenses and install the required SDK components:

```bash
yes | /opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin/sdkmanager --sdk_root="$ANDROID_HOME" --licenses

/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin/sdkmanager --sdk_root="$ANDROID_HOME" \
  "platform-tools" \
  "platforms;android-36" \
  "build-tools;36.0.0" \
  "build-tools;35.0.0" \
  "ndk;27.1.12297006" \
  "cmake;3.22.1"
```

### Build steps

Install JavaScript dependencies:

```bash
npm install
```

Generate the Android native project:

```bash
npx expo prebuild -p android
```

Build the release APK:

```bash
cd android
./gradlew assembleRelease
```

### Notes

- Expo prebuild updated `package.json` so the `android` script now uses `expo run:android`.
- The generated `release` build currently uses the default debug keystore from the generated Gradle config.
- That is acceptable for local testing, but not for Play Store distribution.
- For production distribution, replace the signing config in `android/app/build.gradle` with your own keystore.
