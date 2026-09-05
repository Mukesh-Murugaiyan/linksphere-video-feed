# LinkSphere - Virtualized Video Feed with Gestures & Simulated AI Upscaling

A high-performance, vertically scrolling video feed built for **LinkSphere Technologies**, engineered to balance UI-thread performance (60+ FPS), aggressive memory recycling, native gesture physics, zero layout shifts (Zero CLS), and synchronous state persistence.

---

## 🌟 Architecture & Key Features

### 1. Virtualized Infinite Feed (`@shopify/flash-list`)
- **Snap Paging**: Built with `@shopify/flash-list` configured with `pagingEnabled` for smooth, native snap scrolling.
- **Explicit Sizing**: Utilizes `estimatedItemSize={WINDOW_HEIGHT}` matching window dimensions to prevent blank areas and scrolling stutter.
- **Viewability & Lifecycle Management**: Employs `onViewableItemsChanged` listeners to autoplay **only** the single focused video cell currently in view. Off-screen video instances immediately pause and cease audio/frame decoding to prevent memory leaks and maintain 60+ FPS performance.

### 2. 60 FPS Native Double-Tap Gesture (`react-native-gesture-handler` + `react-native-reanimated` v3)
- **Native UI-Thread Execution**: Attached `Gesture.Tap().numberOfTaps(2)` using `react-native-gesture-handler`.
- **Spring & Translate Physics**: Triggers floating double-tap heart animations executed entirely on the native UI thread via Reanimated v3 worklets (`useAnimatedStyle`, `useSharedValue`, `withSpring`, `withSequence`, `withTiming`).
- **Zero UI-Latency Persistence**: Synchronously reads and writes liked state and count using a zero-latency storage engine backed by MMKV/AsyncStorage.

### 3. Dynamic Resolution & Continuous AI Upscaling Layer
- **Glassmorphic AI Upscale Toggle**: Floating control featuring the `Sparkles` icon labeled **"AI Upscale / HD"**.
- **Continuous Playback Timestamp Preservation**: Swapping between SD (480p/720p) and HD (1080p) streams captures the exact `positionMillis` playback timestamp prior to switching. Upon loading the target stream, the player instantly seeks to the captured position, **preserving continuous playback without resetting progress to 0:00**.
- **Visual Enhancement Shader Overlay**: Applies a dynamic visual filter layer (sharpness & contrast boost) when HD mode is active.
- **Animated Toast HUD**: Displays an animated status badge (`"⚡ AI Upscaled 1080p | 60FPS"`) that automatically fades out after 2 seconds.

### 4. Ad Placement Without Layout Shifts (Zero CLS)
- **Automated Sponsored Injection**: Automatically injects sponsored ad cards at **every 5th feed index** (index 4, 9, 14, 19...).
- **Fixed Skeleton Dimensions**: Ad containers are allocated fixed window dimensions (`width: WINDOW_WIDTH`, `height: WINDOW_HEIGHT`) ensuring the feed never stutters, recalculates layout, or triggers Cumulative Layout Shift (CLS).

---

## 🎨 Tech Stack & Design Tokens

- **Framework**: React Native / Expo SDK (TypeScript strict mode)
- **Virtualization**: `@shopify/flash-list`
- **Gestures & Worklets**: `react-native-gesture-handler` & `react-native-reanimated` v3
- **Video Player**: `expo-av` with lifecycle stream management
- **Persistence**: Synchronous Zero-Latency Storage (`@react-native-async-storage/async-storage` + in-memory cache)
- **Icons**: `lucide-react-native`
- **Design Tokens**:
  - **Background**: Deep dark `#0A0A0E`
  - **Card Surface**: `#14141B`
  - **Accents**: `#8B5CF6` (Vibrant Purple) & `#06B6D4` (Electric Cyan)
  - **Glassmorphism**: `rgba(255,255,255,0.06)` with 1px border `rgba(255,255,255,0.12)`

---

## 📁 Project Structure

```
linksphere-video-feed/
├── App.tsx                     # Entry point with GestureHandlerRootView & StatusBar
├── app.json                    # Expo project configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # Strict TypeScript config
└── src/
    ├── types/
    │   └── video.ts            # VideoItem, AdItem, FeedItem & UpscaleQuality interfaces
    ├── constants/
    │   ├── theme.ts            # Design tokens (#0A0A0E, #14141B, #8B5CF6, #06B6D4)
    │   └── mockData.ts         # 8+ HD/SD test video streams + sponsored ad generator
    ├── services/
    │   └── storage.ts          # Synchronous zero UI-latency persistence service
    ├── utils/
    │   └── formatters.ts       # Count and time formatters (K/M notation)
    ├── hooks/
    │   ├── useVideoFeed.ts     # Viewability tracking & active index lifecycle control
    │   ├── useVideoQuality.ts  # HD/SD upscaling toggle & continuous playback preservation
    │   └── useLikesStore.ts    # Optimistic double-tap likes & persistence store
    └── components/
        ├── FeedList.tsx        # FlashList virtualization with pagingEnabled
        ├── VideoCard.tsx       # Main feed item binding gestures, video, & overlays
        ├── VideoPlayer.tsx     # expo-av video player with seek preservation
        ├── DoubleTapHeart.tsx  # Floating heart animated via Reanimated v3 UI worklets
        ├── UpscaleToggle.tsx   # Glassmorphic AI Upscale / HD floating button
        ├── ToastHUD.tsx        # Animated toast badge fading out in 2 seconds
        ├── AdCard.tsx          # Zero-CLS sponsored ad container matching window height
        └── VideoOverlay.tsx    # Creator handle, caption, music badge, & sidebar buttons
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on mobile (or iOS Simulator / Android Emulator)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<username>/linksphere-video-feed.git
cd linksphere-video-feed

# Install dependencies
npm install
```

### 3. Running the Application

```bash
# Start Expo development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Run on Web Browser
npm run web
```

---

## 🧪 TypeScript & Quality Verification

Run strict TypeScript type checks to verify clean compilation:
```bash
npx tsc --noEmit
```

---

## 📜 License
MIT License - Created for LinkSphere Technologies Take-Home Assignment.
