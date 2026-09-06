import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
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
  isPreloadTarget?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

const VideoCardComponent: React.FC<Props> = ({
  item,
  isFocused,
  isPreloadTarget = false,
  isMuted,
  onToggleMute,
}) => {
  const heartRef = useRef<DoubleTapHeartRef>(null);
  const currentPlaybackPositionRef = useRef<number>(0);

  // Manual Play/Pause State
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  // Reset manual pause state whenever video leaves focus so returning to it resumes playback automatically
  useEffect(() => {
    if (!isFocused) {
      setIsManuallyPaused(false);
    }
  }, [isFocused]);

  // Optimistic Like Store
  const {
    isLiked,
    likeCount,
    toggleLike,
    handleDoubleTapLike,
    isBookmarked,
    bookmarkCount,
    toggleBookmark,
  } = useLikesStore(item.id, item.initialLikes, item.bookmarksCount ?? item.initialBookmarks ?? 0);

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

  // Memoized Gesture Handler Configuration to prevent GC churn & re-registration on every render
  const composedGesture = useMemo(() => {
    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(300)
      .onEnd(() => {
        scheduleOnRN(onDoubleTap);
      });

    const singleTapGesture = Gesture.Tap()
      .numberOfTaps(1)
      .onEnd(() => {
        scheduleOnRN(onSingleTap);
      });

    return Gesture.Exclusive(doubleTapGesture, singleTapGesture);
  }, [onDoubleTap, onSingleTap]);

  const handleToggleQuality = useCallback(() => {
    toggleQuality(currentPlaybackPositionRef.current);
  }, [toggleQuality]);

  const handlePlaybackProgress = useCallback((pos: number) => {
    currentPlaybackPositionRef.current = pos;
  }, []);

  return (
    <View style={styles.cardContainer}>
      {/* Tap Gesture Handler ONLY for Video Background */}
      <GestureDetector gesture={composedGesture}>
        <View style={StyleSheet.absoluteFill}>
          <VideoPlayer
            id={item.id}
            uri={activeUrl}
            posterUrl={item.posterUrl}
            isFocused={isFocused}
            isPreloadTarget={isPreloadTarget}
            isMuted={isMuted}
            isManuallyPaused={isManuallyPaused}
            quality={quality}
            pendingSeekPosition={pendingSeekPosition}
            onClearPendingSeek={clearPendingSeek}
            onPlaybackProgress={handlePlaybackProgress}
          />
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

      {/* Floating UI-Thread Reanimated Double-Tap Heart Overlay rendered on top of all card components */}
      <DoubleTapHeart ref={heartRef} />
    </View>
  );
};

export const VideoCard = React.memo(
  VideoCardComponent,
  (prevProps, nextProps) =>
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.isPreloadTarget === nextProps.isPreloadTarget &&
    prevProps.isMuted === nextProps.isMuted &&
    prevProps.item.id === nextProps.item.id
);

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
