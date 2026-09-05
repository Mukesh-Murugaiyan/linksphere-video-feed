import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { VideoItem } from '../types/video';
import { VideoPlayer } from './VideoPlayer';
import { VideoOverlay } from './VideoOverlay';
import { UpscaleToggle } from './UpscaleToggle';
import { ToastHUD } from './ToastHUD';
import { DoubleTapHeart, DoubleTapHeartRef } from './DoubleTapHeart';
import { useLikesStore } from '../hooks/useLikesStore';
import { useVideoQuality } from '../hooks/useVideoQuality';
import { COLORS } from '../constants/theme';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

interface Props {
  item: VideoItem;
  isFocused: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VideoCard: React.FC<Props> = ({ item, isFocused, isMuted, onToggleMute }) => {
  const heartRef = useRef<DoubleTapHeartRef>(null);
  const currentPlaybackPositionRef = useRef<number>(0);

  // Manual Play/Pause State
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  // Optimistic Like Store
  const {
    isLiked,
    likeCount,
    toggleLike,
    handleDoubleTapLike,
    isBookmarked,
    bookmarkCount,
    toggleBookmark,
  } = useLikesStore(item.id, item.initialLikes, item.bookmarksCount);

  // Video Quality & Upscaling Hook
  const {
    quality,
    activeUrl,
    pendingSeekPosition,
    toastMessage,
    toggleQuality,
    clearPendingSeek,
    clearToast,
  } = useVideoQuality(item);

  // Single-Tap Callback to toggle manual play/pause
  const onSingleTap = useCallback(() => {
    setIsManuallyPaused((prev) => !prev);
  }, []);

  // Double-Tap Callback to trigger heart animation and like action
  const onDoubleTap = useCallback(() => {
    heartRef.current?.triggerAnimation();
    handleDoubleTapLike();
  }, [handleDoubleTapLike]);

  // Double Tap Gesture
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onEnd(() => {
      scheduleOnRN(onDoubleTap);
    });

  // Single Tap Gesture
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      scheduleOnRN(onSingleTap);
    });

  // Exclusive Composition: Double-tap takes precedence over single-tap!
  const composedGesture = Gesture.Exclusive(doubleTapGesture, singleTapGesture);

  const handleToggleQuality = () => {
    toggleQuality(currentPlaybackPositionRef.current);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Tap Gesture Handler ONLY for Video Background */}
      <GestureDetector gesture={composedGesture}>
        <View style={StyleSheet.absoluteFill}>
          <VideoPlayer
            uri={activeUrl}
            isFocused={isFocused}
            isMuted={isMuted}
            isManuallyPaused={isManuallyPaused}
            quality={quality}
            pendingSeekPosition={pendingSeekPosition}
            onClearPendingSeek={clearPendingSeek}
            onPlaybackProgress={(pos) => {
              currentPlaybackPositionRef.current = pos;
            }}
          />

          {/* Floating UI-Thread Reanimated Double-Tap Heart Overlay directly inside video container */}
          <DoubleTapHeart ref={heartRef} />
        </View>
      </GestureDetector>

      {/* Toast HUD Badge */}
      <ToastHUD message={toastMessage} onDismiss={clearToast} />

      {/* Top Control Bar: Glassmorphic AI Upscale Toggle */}
      <View style={styles.topControlBar} pointerEvents="box-none">
        <UpscaleToggle quality={quality} onToggle={handleToggleQuality} />
      </View>

      {/* Video Overlay with Sidebar Actions & Creator Info */}
      <VideoOverlay
        item={item}
        isLiked={isLiked}
        likeCount={likeCount}
        onToggleLike={toggleLike}
        isBookmarked={isBookmarked}
        bookmarkCount={bookmarkCount}
        onToggleBookmark={toggleBookmark}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  topControlBar: {
    position: 'absolute',
    top: 54,
    right: 16,
    zIndex: 90,
  },
});
