# LinkSphere Virtualized Video Feed

A production-quality, high-performance vertical video feed built with React Native and Expo SDK 57, engineered for **60+ FPS scrolling**, UI-thread gesture physics, sliding-window video preloading, **500MB native LRU cache-first playback**, zero layout shifts (Zero CLS), and synchronous state persistence.

---

## Features

- **FlashList Virtualized Feed**: Built with `@shopify/flash-list` using `pagingEnabled`, `decelerationRate="fast"`, and fixed viewport height for 60+ FPS vertical snap scrolling.
- **Paging and Focused-Video Autoplay**: Uses `onViewableItemsChanged` with a tuned 60% visibility threshold to auto-play strictly the active focused video while pausing off-screen items.
- **Video Lifecycle and Memory Recycling**: Controlled state machine (`UNLOADED -> LOADING -> READY -> PLAYING -> PAUSED -> ERROR`). Non-adjacent cards unmount native players to release hardware decoders while retaining lightweight thumbnail images.
- **Next-Video Preloading**: Sliding window `[activeIndex - 1, activeIndex, activeIndex + 1]` automatically prepares the next video (`activeIndex + 1`, paused) in the background to buffer initial headers/GOP frames while the active video plays.
- **Cache-First Playback**: 500MB persistent native LRU disk cache (`setVideoCacheSizeAsync`). Swiping back to a previously played video (`Video 1 -> Video 2 -> Video 3 -> Video 1`) bypasses network requests and loading spinners, streaming immediately from local disk at the saved timestamp.
- **Double-Tap Like Gesture**: Native `react-native-gesture-handler` double-tap gesture with optimistic like state updates.
- **Reanimated UI-Thread Heart Animation**: Floating double-tap heart pop-and-float animation running entirely on the Reanimated v3 UI thread using worklets.
- **MMKV / Local Persistence**: Synchronous zero-latency storage engine (`ZeroLatencyStorage` in `src/services/storage.ts`) delivering MMKV's exact synchronous `getBoolean` / `setBoolean` API interface.
- **AI Upscale / HD Quality Switching**: Floating glassmorphic toggle button switching between distinct SD (`sdUrl`) and HD (`hdUrl`) video stream sources.
- **Seamless currentTime Preservation**: Captures `currentTime` during AI Upscale toggling and seeks after quality switch, preventing videos from restarting at `0:00`.
- **Automatic Retry**: Background exponential backoff auto-retry (`replaceAsync`) for playback and network glitches without manual error overlay interaction.
- **App Background / Foreground Resume**: Preserves loaded frames and playback position when leaving the app, resuming active playback seamlessly upon foreground return.
- **Sponsored Cards**: Sponsored ad cards injected at every 5th feed index (`position % 5 === 0`) with zero cumulative layout shift (Zero CLS).
- **Strict TypeScript**: Clean architecture typed with 100% strict TypeScript (`tsc --noEmit` clean).

---

## Prerequisites / Environment Setup

> **Important Note for Evaluators**:
> The repository contains the application source code and native project configuration, but Android Emulator/iOS Simulator are local development tools and are not included in the repository. After cloning, the evaluator must install/configure the required development environment and create/start an emulator or simulator before running the app.

Ensure the following tools are installed and configured on your machine:

- **Node.js**: `18.x`, `20.x`, or higher (Recommended: Node 20 LTS).
- **npm**: `9.x+` (or **yarn**: `1.22+` / **pnpm**).
- **JDK (Java Development Kit)**: OpenJDK 17 (Required by React Native 0.86 & Expo SDK 57).
- **Android Studio**: Required for Android builds, SDK tools, and emulator setup.
- **Android SDK**: API Level 35 (Android 15) with Platform-Tools and Build-Tools 35.0.0 installed (`ANDROID_HOME` configured in shell environment).
- **Android Emulator / Virtual Device**: An AVD instance created via Android Studio Virtual Device Manager, or a physical Android device connected via USB debugging.
- **Xcode**: Required for iOS Simulator and native iOS builds (macOS only, Xcode 15+ or 16+).
- **CocoaPods**: Required for iOS native dependency installation (`1.14+`).

---

## Installation

Clone the repository and install project dependencies:

```bash
git clone https://github.com/Mukesh-Murugaiyan/linksphere-video-feed.git
cd linksphere-video-feed
npm install
```

---

## Android Development & Setup

### Environment Requirements
1. **JDK 17 Setup**:
   Ensure `JAVA_HOME` points to OpenJDK 17 (e.g. in `~/.zshrc` or `~/.bash_profile`):
   ```bash
   export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
   export PATH="$JAVA_HOME/bin:$PATH"
   ```
2. **Android SDK Setup**:
   Ensure `ANDROID_HOME` points to your Android SDK installation:
   ```bash
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$PATH:$ANDROID_HOME/emulator"
   export PATH="$PATH:$ANDROID_HOME/platform-tools"
   ```
3. **Android Device / Emulator Requirement**:
   An Android Emulator (created via Android Studio Device Manager) **must already be running**, or a physical Android device must be connected via USB with **USB Debugging** enabled (`adb devices`).

### Setup & Run Commands

- **Open in Android Studio** (recommended for IDE development and launching emulators):
  ```bash
  npm run studio
  ```

- **Run Android Build & App**:
  ```bash
  npm run android
  ```

- **Run Web Preview (Quick Test)**:
  ```bash
  npm run web
  ```

---

## iOS

### Environment Requirement
The iOS Simulator is provided through **Xcode** and is available exclusively on **macOS**. Xcode 15+ must be installed on your Mac before launching the iOS build.

### Setup & Run Commands

```bash
npm install
cd ios
pod install
cd ..
npm run ios
```

If generating native project files from scratch:

```bash
npx expo prebuild --platform ios
cd ios
pod install
cd ..
npm run ios
```

---

## Running the App

1. **Start Metro Bundler**:
   ```bash
   npm start
   ```
2. **Launch Target Platform**:
   - Make sure your Android Emulator or iOS Simulator is running.
   - Press **`i`** in the Metro terminal prompt to launch **iOS Simulator**.
   - Press **`a`** in the Metro terminal prompt to launch **Android Emulator**.
   - Alternatively, execute `npm run ios` or `npm run android` in a separate terminal.
3. **What You Should See**:
   - A full-screen, 60 FPS vertical snap video feed with pure white typography.
   - Immediate autoplay for the currently focused video card.
   - Smooth preloading of the adjacent video in the sliding window.
   - Double-tap heart popping animation with optimistic like count increment.
   - Floating glassmorphic AI Upscale / HD quality toggle.
   - Instant zero-spinner replay when swiping backward to previously watched videos.

---

## Troubleshooting

### Common Fixes & Utility Commands

- **No Connected Device / Emulator Error**:
  If `npm run android` outputs `No Android connected device found`, start an emulator from Android Studio or connect a physical device via USB:
  ```bash
  adb devices
  ```

- **`node_modules` Problems & Reinstall**:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

- **Metro Cache Clearing**:
  ```bash
  npx expo start --clear
  ```

- **CocoaPods Issues (iOS)**:
  ```bash
  cd ios
  pod deintegrate
  pod install
  cd ..
  ```

- **Android Gradle Build Failure**:
  ```bash
  cd android
  ./gradlew clean
  cd ..
  ```

- **Android SDK Path Issues**:
  Ensure environment variables are set in `~/.zshrc` or `~/.bash_profile`:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

- **Device / Emulator Connection Reset**:
  ```bash
  adb kill-server
  adb start-server
  ```

---

## Architecture

```
linksphere-video-feed/
├── App.tsx                     # Entry point initializing 500MB LRU video cache on launch
├── app.json                    # Expo project configuration with expo-video plugin
├── package.json                # Project scripts, dependencies, & version metadata
├── tsconfig.json               # Strict TypeScript compiler options
├── ios/                        # Native iOS platform project (generated via prebuild)
├── android/                    # Native Android platform project (generated via prebuild)
└── src/
    ├── types/
    │   ├── video.ts            # VideoItem, AdItem, FeedItem, & PlaybackLifecycleState definitions
    │   └── feed.ts             # Feed type re-exports
    ├── constants/
    │   ├── theme.ts            # Design tokens (#0A0A0E, #14141B, crisp text shadows)
    │   └── mockData.ts         # Public MP4/HLS test streams & sponsored ad dataset generator
    ├── services/
    │   ├── videoCache.ts       # 500MB native LRU disk cache & position preservation
    │   └── storage.ts          # ZeroLatencyStorage MMKV-compatible persistence engine
    ├── utils/
    │   └── formatters.ts       # K/M count and time formatting helpers
    ├── hooks/
    │   ├── useVideoFeed.ts     # Viewability tracking & active index lifecycle control
    │   ├── useVideoPreload.ts  # Sliding window preloading hook [i-1, i, i+1]
    │   ├── useVideoQuality.ts  # AI Upscale quality switcher & timestamp preservation
    │   └── useLikesStore.ts    # Double-tap optimistic likes and bookmarks persistence
    └── components/
        ├── FeedList.tsx        # FlashList v2 virtualization screen with pagingEnabled
        ├── VideoCard.tsx       # Main card binding gestures, video, overlay & focus reset
        ├── VideoPlayer.tsx     # expo-video player with Reanimated opacity transition & auto-retry
        ├── VideoOverlay.tsx    # Pure white typography text overlay with crisp legibility shadows
        ├── DoubleTapHeart.tsx  # Floating heart animated via Reanimated v3 UI worklets
        ├── UpscaleToggle.tsx   # Floating glassmorphic AI Upscale / HD toggle button
        ├── ToastHUD.tsx        # Reanimated animated toast notification badge
        └── AdCard.tsx          # Zero-CLS sponsored ad container matching window height
```

---

## Performance Architecture

- **FlashList Virtualization**: Utilizes `@shopify/flash-list` with `pagingEnabled`, `drawDistance={WINDOW_HEIGHT}`, and `overrideItemLayout` to ensure fixed viewport dimensions per cell without layout recalculation.
- **Fixed Item Height**: Matches cell container height strictly to `WINDOW_HEIGHT`, preventing layout shifts (Zero CLS).
- **Active Video Lifecycle**: State machine (`UNLOADED -> LOADING -> READY -> PLAYING -> PAUSED -> ERROR`) ensures only the focused video is active.
- **Adjacent-Video Preload Strategy**: Maintains a tight `[activeIndex - 1, activeIndex, activeIndex + 1]` window around the active index. Preloads initial video headers and GOP frames for `activeIndex + 1` while `activeIndex` plays.
- **Off-Screen Player Cleanup**: Non-adjacent cards unmount native `VideoView` instances, invoking native ExoPlayer / AVPlayer resource release while displaying lightweight `Image` poster placeholders.
- **Cache-First Playback Strategy**: Configures `setVideoCacheSizeAsync(500MB)` at app startup. Streamed video segments are cached locally. Swiping back to a previously watched video bypasses network requests and loading indicators, playing instantly from disk.
- **Reanimated UI-Thread Gestures**: Double-tap gestures and floating heart animations execute on the native UI thread via Reanimated v3 worklets (`scale`, `translateY`, `opacity`, `rotation`) and `react-native-worklets`.
- **Avoiding Unnecessary React Renders**: Heavy cell components are wrapped in `React.memo` with strict equality comparison, isolating gesture state and overlay updates from feed re-renders.

---

## Video Sources

- Configured in [`src/constants/mockData.ts`](file:///Users/sush/Projects/linksphere-video-feed/src/constants/mockData.ts).
- Uses valid public MP4 and Mux HLS (`.m3u8`) test streams.
- Zero secrets, private API keys, or backend credentials are exposed in the repository.

---

## AI Upscale

- Simulated AI upscaling is triggered via the floating glassmorphic **`AI Upscale / HD`** toggle button.
- Toggling switches between distinct SD (`sdUrl`) and HD (`hdUrl`) stream URLs.
- The `useVideoQuality` hook captures `currentTime` before switching and seeks after loading the target stream, preserving continuous playback without restarting at `0:00`.
- Displays an animated toast notification badge: `⚡ AI Upscaled 1080p | 60FPS`.

---

## Testing Checklist

- [ ] Fresh clone works
- [ ] npm install succeeds
- [ ] Android build succeeds
- [ ] iOS Pods install successfully
- [ ] iOS build succeeds
- [ ] Vertical paging works
- [ ] Only focused video plays
- [ ] Next video preloads
- [ ] Off-screen players are released
- [ ] Double-tap like works
- [ ] Like state persists
- [ ] AI Upscale switches quality without restarting at 0:00
- [ ] Automatic retry works
- [ ] Background/foreground resume works
- [ ] Sponsored cards appear correctly
- [ ] Cached video can replay

---

## License

MIT License - Built for LinkSphere Technologies Take-Home Assignment evaluation.
