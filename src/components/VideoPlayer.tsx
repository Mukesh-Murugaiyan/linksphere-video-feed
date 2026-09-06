import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Play } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { UpscaleQuality, PlaybackLifecycleState } from '../types/video';
import {
  savePlaybackPosition,
  getSavedPlaybackPosition,
  markVideoAsCached,
  isVideoCached,
} from '../services/videoCache';

interface Props {
  id?: string;
  uri: string;
  posterUrl?: string;
  isFocused: boolean;
  isPreloadTarget?: boolean;
  isMuted: boolean;
  isManuallyPaused?: boolean;
  quality: UpscaleQuality;
  pendingSeekPosition: number | null;
  onClearPendingSeek: () => void;
  onPlaybackProgress?: (positionMillis: number) => void;
}

export type QualitySwitchState =
  | 'IDLE'
  | 'SWITCH_REQUESTED'
  | 'LOADING_NEW_SOURCE'
  | 'READY_TO_SEEK'
  | 'SEEKING'
  | 'WAITING_FOR_FIRST_FRAME_AFTER_SEEK'
  | 'CROSSFADE'
  | 'SWITCH_COMPLETE';

interface SwitchContext {
  targetSlot: 'A' | 'B';
  targetSeekTime: number;
  wasPlaying: boolean;
  seekApplied: boolean;
  firstFrameAfterSeekRendered: boolean;
}

const VideoPlayerComponent: React.FC<Props> = ({
  id,
  uri,
  posterUrl,
  isFocused,
  isPreloadTarget = false,
  isMuted,
  isManuallyPaused = false,
  quality,
  pendingSeekPosition,
  onClearPendingSeek,
  onPlaybackProgress,
}) => {
  // Check if video has verified cached playable data on local disk
  const isAlreadyCached = useMemo(() => (id ? isVideoCached(id) : false), [id]);

  // Quality switch state machine state
  const [switchState, setSwitchState] = useState<QualitySwitchState>('IDLE');

  // Active slot state for staged dual-player transition ('A' | 'B')
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [uriA, setUriA] = useState<string | null>(uri);
  const [uriB, setUriB] = useState<string | null>(null);

  // Control whether incoming player's VideoView is mounted to gate onFirstFrameRender
  const [mountVideoViewA, setMountVideoViewA] = useState<boolean>(true);
  const [mountVideoViewB, setMountVideoViewB] = useState<boolean>(false);

  // Shared opacity values for smooth UI-thread cross-fading
  const videoOpacityA = useSharedValue(isAlreadyCached ? 1 : 0);
  const videoOpacityB = useSharedValue(0);
  const thumbnailOpacity = useSharedValue(isAlreadyCached ? 0 : 1);

  // AppState & lifecycle tracking
  const [appState, setAppState] = useState<AppStateStatus>(() => AppState.currentState);
  const wasPlayingBeforeBackgroundRef = useRef<boolean>(false);
  const isFirstFrameRenderedRef = useRef<boolean>(isAlreadyCached);

  // Transition in progress & captured context refs
  const switchContextRef = useRef<SwitchContext | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Buffering & retry state
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [lifecycleState, setLifecycleState] = useState<PlaybackLifecycleState>(
    isAlreadyCached ? 'READY' : 'UNLOADED'
  );
  const retryCountRef = useRef<number>(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoized video sources for player slots
  const videoSourceA = useMemo(() => (uriA ? { uri: uriA } : null), [uriA]);
  const videoSourceB = useMemo(() => (uriB ? { uri: uriB } : null), [uriB]);

  const shouldMountPlayer = isFocused || isPreloadTarget;

  // Ref to hold pending seek position for instant setup retrieval
  const pendingSeekRef = useRef<number | null>(pendingSeekPosition);
  useEffect(() => {
    pendingSeekRef.current = pendingSeekPosition;
  }, [pendingSeekPosition]);

  // --- PLAYER SLOT A ---
  const playerA = useVideoPlayer(shouldMountPlayer ? videoSourceA : null, (p) => {
    p.loop = true;
    p.muted = isMuted;
    p.timeUpdateEventInterval = 0.25;

    if (id && !pendingSeekRef.current) {
      const savedPosMs = getSavedPlaybackPosition(id);
      if (savedPosMs && savedPosMs > 500) {
        try {
          p.currentTime = savedPosMs / 1000;
        } catch (_) {}
      }
    }

    if (isFocused && !isManuallyPaused && AppState.currentState === 'active') {
      try {
        p.play();
      } catch (_) {}
    } else {
      try {
        p.pause();
      } catch (_) {}
    }
  });

  // --- PLAYER SLOT B ---
  const playerB = useVideoPlayer(shouldMountPlayer ? videoSourceB : null, (p) => {
    p.loop = true;
    p.muted = isMuted;
    p.timeUpdateEventInterval = 0.25;

    // Always pause incoming slot B initially while buffering
    try {
      p.pause();
    } catch (_) {}
  });

  // Active player instance helper
  const activePlayer = activeSlot === 'A' ? playerA : playerB;

  // React to prop `uri` changes for quality switching or card changes
  const prevUriPropRef = useRef(uri);
  useEffect(() => {
    if (prevUriPropRef.current !== uri) {
      prevUriPropRef.current = uri;

      if (pendingSeekPosition !== null && pendingSeekPosition > 0) {
        // Prevent duplicate trigger if already switching
        if (switchContextRef.current !== null) {
          console.log('[QualitySwitch] Ignored duplicate toggle - switch already in progress');
          return;
        }

        // STEP 1: Capture currently visible player's exact currentTime and playing state
        const currentActive = activeSlot === 'A' ? playerA : playerB;
        const capturedTimeSeconds = currentActive && currentActive.currentTime > 0
          ? currentActive.currentTime
          : pendingSeekPosition / 1000;
        const capturedWasPlaying = currentActive ? currentActive.playing : (!isManuallyPaused && isFocused);

        const targetSlot = activeSlot === 'A' ? 'B' : 'A';
        switchContextRef.current = {
          targetSlot,
          targetSeekTime: capturedTimeSeconds,
          wasPlaying: capturedWasPlaying,
          seekApplied: false,
          firstFrameAfterSeekRendered: false,
        };

        console.log(`[QualitySwitch] 1. captured currentTime: ${capturedTimeSeconds.toFixed(3)}s, wasPlaying: ${capturedWasPlaying}`);

        // STEP 2: Pause current player but keep last rendered frame fully visible on screen
        if (activeSlot === 'A') {
          try {
            playerA?.pause();
          } catch (_) {}
          // Unmount incoming VideoView B so it does not render frame 0:00 while loading
          setMountVideoViewB(false);
          setUriB(uri);
        } else {
          try {
            playerB?.pause();
          } catch (_) {}
          setMountVideoViewA(false);
          setUriA(uri);
        }

        // STEP 3: Enter LOADING_NEW_SOURCE
        setSwitchState('LOADING_NEW_SOURCE');
      } else {
        // Cold URI change (different feed item)
        setActiveSlot('A');
        setUriA(uri);
        setUriB(null);
        setMountVideoViewA(true);
        setMountVideoViewB(false);
        setSwitchState('IDLE');
        isFirstFrameRenderedRef.current = false;
        videoOpacityA.value = 0;
        videoOpacityB.value = 0;
        thumbnailOpacity.value = 1;
      }
    }
  }, [uri, pendingSeekPosition, activeSlot, playerA, playerB, isFocused, isManuallyPaused, videoOpacityA, videoOpacityB, thumbnailOpacity]);

  // Event listener & state transitions for incoming Player B (when targetSlot === 'B')
  useEffect(() => {
    if (!playerB) return;

    const checkPlayerBReady = (status: string) => {
      const ctx = switchContextRef.current;
      if (!ctx || ctx.targetSlot !== 'B') return;

      if (status === 'readyToPlay' && switchState === 'LOADING_NEW_SOURCE') {
        console.log('[QualitySwitch] 2. incoming player ready (status: readyToPlay)');
        setSwitchState('READY_TO_SEEK');
      }
    };

    if (playerB.status === 'readyToPlay' && switchState === 'LOADING_NEW_SOURCE') {
      checkPlayerBReady('readyToPlay');
    }

    const statusSub = playerB.addListener('statusChange', (payload) => {
      checkPlayerBReady(payload.status);
    });

    const timeSub = playerB.addListener('timeUpdate', (payload) => {
      const ctx = switchContextRef.current;
      if (!ctx || ctx.targetSlot !== 'B') return;

      if (switchState === 'SEEKING') {
        const currentPos = payload.currentTime;
        const expectedTime = ctx.targetSeekTime;
        const diff = Math.abs(currentPos - expectedTime);

        // Step 4: Seek position validated within ±0.4s tolerance
        if (diff <= 0.4) {
          ctx.seekApplied = true;
          console.log(`[QualitySwitch] 4. seek position validated: currentPos = ${currentPos.toFixed(3)}s, expected = ${expectedTime.toFixed(3)}s, diff = ${diff.toFixed(3)}s`);

          // Mount VideoView B onto the already-seeked player to render the seeked frame
          setMountVideoViewB(true);
          setSwitchState('WAITING_FOR_FIRST_FRAME_AFTER_SEEK');
        }
      }
    });

    return () => {
      statusSub.remove();
      timeSub.remove();
    };
  }, [playerB, switchState]);

  // Handle READY_TO_SEEK -> SEEKING for Player B
  useEffect(() => {
    if (switchState === 'READY_TO_SEEK' && switchContextRef.current?.targetSlot === 'B') {
      const ctx = switchContextRef.current;
      console.log(`[QualitySwitch] 3. seek requested: targetSeekTime = ${ctx.targetSeekTime.toFixed(3)}s on Player B`);
      setSwitchState('SEEKING');
      try {
        playerB.currentTime = ctx.targetSeekTime;
      } catch (e) {
        console.warn('[QualitySwitch] Error seeking Player B:', e);
      }
    }
  }, [switchState, playerB]);

  // Event listener & state transitions for incoming Player A (when targetSlot === 'A')
  useEffect(() => {
    if (!playerA) return;

    const checkPlayerAReady = (status: string) => {
      const ctx = switchContextRef.current;
      if (!ctx || ctx.targetSlot !== 'A') return;

      if (status === 'readyToPlay' && switchState === 'LOADING_NEW_SOURCE') {
        console.log('[QualitySwitch] 2. incoming player ready (status: readyToPlay)');
        setSwitchState('READY_TO_SEEK');
      }
    };

    if (playerA.status === 'readyToPlay' && switchState === 'LOADING_NEW_SOURCE') {
      checkPlayerAReady('readyToPlay');
    }

    const statusSub = playerA.addListener('statusChange', (payload) => {
      checkPlayerAReady(payload.status);
    });

    const timeSub = playerA.addListener('timeUpdate', (payload) => {
      const ctx = switchContextRef.current;
      if (!ctx || ctx.targetSlot !== 'A') return;

      if (switchState === 'SEEKING') {
        const currentPos = payload.currentTime;
        const expectedTime = ctx.targetSeekTime;
        const diff = Math.abs(currentPos - expectedTime);

        // Step 4: Seek position validated within ±0.4s tolerance
        if (diff <= 0.4) {
          ctx.seekApplied = true;
          console.log(`[QualitySwitch] 4. seek position validated: currentPos = ${currentPos.toFixed(3)}s, expected = ${expectedTime.toFixed(3)}s, diff = ${diff.toFixed(3)}s`);

          // Mount VideoView A onto the already-seeked player to render the seeked frame
          setMountVideoViewA(true);
          setSwitchState('WAITING_FOR_FIRST_FRAME_AFTER_SEEK');
        }
      }
    });

    return () => {
      statusSub.remove();
      timeSub.remove();
    };
  }, [playerA, switchState]);

  // Handle READY_TO_SEEK -> SEEKING for Player A
  useEffect(() => {
    if (switchState === 'READY_TO_SEEK' && switchContextRef.current?.targetSlot === 'A') {
      const ctx = switchContextRef.current;
      console.log(`[QualitySwitch] 3. seek requested: targetSeekTime = ${ctx.targetSeekTime.toFixed(3)}s on Player A`);
      setSwitchState('SEEKING');
      try {
        playerA.currentTime = ctx.targetSeekTime;
      } catch (e) {
        console.warn('[QualitySwitch] Error seeking Player A:', e);
      }
    }
  }, [switchState, playerA]);

  // Handle onFirstFrameRender for Slot A
  const handleFirstFrameA = useCallback(() => {
    if (id) markVideoAsCached(id);

    const ctx = switchContextRef.current;
    if (switchState === 'WAITING_FOR_FIRST_FRAME_AFTER_SEEK' && ctx?.targetSlot === 'A' && ctx.seekApplied) {
      // STEP 5: First frame rendered AFTER seek confirmed
      ctx.firstFrameAfterSeekRendered = true;
      console.log(`[QualitySwitch] 5. first frame rendered after seek at position: ${playerA?.currentTime.toFixed(3)}s`);
      setSwitchState('CROSSFADE');
    } else if (!isFirstFrameRenderedRef.current && switchState === 'IDLE') {
      // Cold initial load of Player A
      isFirstFrameRenderedRef.current = true;
      setLifecycleState('READY');
      videoOpacityA.value = withTiming(1, { duration: 150 });
      thumbnailOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [id, switchState, playerA, videoOpacityA, thumbnailOpacity]);

  // Handle onFirstFrameRender for Slot B
  const handleFirstFrameB = useCallback(() => {
    if (id) markVideoAsCached(id);

    const ctx = switchContextRef.current;
    if (switchState === 'WAITING_FOR_FIRST_FRAME_AFTER_SEEK' && ctx?.targetSlot === 'B' && ctx.seekApplied) {
      // STEP 5: First frame rendered AFTER seek confirmed
      ctx.firstFrameAfterSeekRendered = true;
      console.log(`[QualitySwitch] 5. first frame rendered after seek at position: ${playerB?.currentTime.toFixed(3)}s`);
      setSwitchState('CROSSFADE');
    }
  }, [id, switchState, playerB]);

  // Complete quality switch transition when entering CROSSFADE
  useEffect(() => {
    if (switchState === 'CROSSFADE') {
      const ctx = switchContextRef.current;
      if (!ctx) return;

      console.log('[QualitySwitch] 6. crossfade started');

      const targetSlot = ctx.targetSlot;
      const targetPlayer = targetSlot === 'B' ? playerB : playerA;

      // STEP 8: Smoothly crossfade from frozen old player frame to new player
      if (targetSlot === 'B') {
        videoOpacityB.value = withTiming(1, { duration: 150 });
        videoOpacityA.value = withTiming(0, { duration: 150 });
      } else {
        videoOpacityA.value = withTiming(1, { duration: 150 });
        videoOpacityB.value = withTiming(0, { duration: 150 });
      }

      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        // STEP 9 & 12: Make new player active and release old player instance
        setActiveSlot(targetSlot);
        if (targetSlot === 'B') {
          setUriA(null);
          setMountVideoViewA(false);
        } else {
          setUriB(null);
          setMountVideoViewB(false);
        }

        onClearPendingSeek();

        // STEP 9: Resume playback if previous player was playing
        const wasPlaying = ctx.wasPlaying;
        switchContextRef.current = null;
        setSwitchState('IDLE');

        if (wasPlaying && isFocused && !isManuallyPaused && AppState.currentState === 'active') {
          console.log(`[QualitySwitch] 7. playback resumed at position: ${targetPlayer?.currentTime.toFixed(3)}s`);
          try {
            targetPlayer?.play();
          } catch (_) {}
        } else {
          console.log(`[QualitySwitch] 7. keeping paused at position: ${targetPlayer?.currentTime.toFixed(3)}s`);
          try {
            targetPlayer?.pause();
          } catch (_) {}
        }
      }, 150);
    }
  }, [switchState, playerA, playerB, isFocused, isManuallyPaused, onClearPendingSeek, videoOpacityA, videoOpacityB]);

  // Animated styles for slots A, B and thumbnail
  const animatedVideoStyleA = useAnimatedStyle(() => ({
    opacity: videoOpacityA.value,
  }));
  const animatedVideoStyleB = useAnimatedStyle(() => ({
    opacity: videoOpacityB.value,
  }));
  const animatedThumbnailStyle = useAnimatedStyle(() => ({
    opacity: thumbnailOpacity.value,
  }));

  // Listen to Active Player events (status, playing, timeUpdate)
  useEffect(() => {
    if (!activePlayer) return;

    if (activePlayer.status === 'readyToPlay' || activePlayer.playing) {
      setIsBuffering(false);
      setLifecycleState(activePlayer.playing ? 'PLAYING' : 'READY');
    } else if (activePlayer.status === 'error') {
      setIsBuffering(false);
      setLifecycleState('ERROR');
    } else if (activePlayer.status === 'loading' && !isAlreadyCached && switchState === 'IDLE') {
      setIsBuffering(true);
    }

    const statusSub = activePlayer.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay') {
        setIsBuffering(false);
      } else if (payload.status === 'loading' && !isAlreadyCached && switchState === 'IDLE') {
        setIsBuffering(true);
      }
    });

    const playingSub = activePlayer.addListener('playingChange', (payload) => {
      if (payload.isPlaying) {
        setIsBuffering(false);
        if (isFocused && !isManuallyPaused) {
          setLifecycleState('PLAYING');
        }
      } else if (!payload.isPlaying && isFirstFrameRenderedRef.current) {
        setLifecycleState('PAUSED');
      }
    });

    const timeSub = activePlayer.addListener('timeUpdate', (payload) => {
      if (appState === 'active' && activePlayer.playing && switchState === 'IDLE') {
        const millis = payload.currentTime * 1000;
        if (id) {
          savePlaybackPosition(id, millis);
          markVideoAsCached(id);
        }
        if (onPlaybackProgress) {
          onPlaybackProgress(millis);
        }
      }
    });

    const endSub = activePlayer.addListener('playToEnd', () => {
      if (id) {
        savePlaybackPosition(id, 0);
      }
    });

    return () => {
      statusSub.remove();
      playingSub.remove();
      timeSub.remove();
      endSub.remove();
    };
  }, [activePlayer, isFocused, isManuallyPaused, isAlreadyCached, onPlaybackProgress, appState, id, switchState]);

  // AppState change listener (Background / Foreground preservation)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState((prevAppState) => {
        if (prevAppState === 'active' && nextAppState.match(/inactive|background/)) {
          if (activePlayer) {
            try {
              wasPlayingBeforeBackgroundRef.current = activePlayer.playing;
              activePlayer.pause();
            } catch (_) {}
          }
        } else if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
          if (activePlayer && isFocused && !isManuallyPaused && wasPlayingBeforeBackgroundRef.current) {
            try {
              activePlayer.play();
            } catch (_) {}
          }
        }
        return nextAppState;
      });
    });

    return () => {
      subscription.remove();
    };
  }, [activePlayer, isFocused, isManuallyPaused]);

  // Play / Pause handler for focus or manual pause toggles
  useEffect(() => {
    if (!activePlayer) return;
    if (appState !== 'active') return;
    if (switchState !== 'IDLE') return; // Do not interrupt ongoing quality transition

    try {
      if (isFocused && !isManuallyPaused) {
        activePlayer.play();
      } else {
        activePlayer.pause();
      }
    } catch (e) {
      console.warn('Player play/pause error:', e);
    }
  }, [isFocused, isManuallyPaused, appState, activePlayer, switchState]);

  // Mute state handler
  useEffect(() => {
    if (playerA) {
      try {
        playerA.muted = isMuted;
      } catch (_) {}
    }
    if (playerB) {
      try {
        playerB.muted = isMuted;
      } catch (_) {}
    }
  }, [isMuted, playerA, playerB]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Render thumbnail only if outside active window
  if (!shouldMountPlayer) {
    return (
      <View style={styles.container}>
        {posterUrl && (
          <Image source={{ uri: posterUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
      </View>
    );
  }

  // Loading spinner renders during quality transitions OR initial cold buffering
  const isSwitchingQuality = switchState !== 'IDLE';

  const showLoadingSpinner =
    isSwitchingQuality ||
    (isFocused &&
      !isManuallyPaused &&
      !isAlreadyCached &&
      (isBuffering || !isFirstFrameRenderedRef.current || lifecycleState === 'LOADING'));

  return (
    <View style={styles.container}>
      {/* Player Slot A */}
      {videoSourceA && mountVideoViewA && (
        <Animated.View style={[StyleSheet.absoluteFill, animatedVideoStyleA]}>
          <VideoView
            player={playerA}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
            onFirstFrameRender={handleFirstFrameA}
          />
        </Animated.View>
      )}

      {/* Player Slot B */}
      {videoSourceB && mountVideoViewB && (
        <Animated.View style={[StyleSheet.absoluteFill, animatedVideoStyleB]}>
          <VideoView
            player={playerB}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
            onFirstFrameRender={handleFirstFrameB}
          />
        </Animated.View>
      )}

      {/* Poster Image Layer (ONLY rendered on cold initial load before first frame renders) */}
      {posterUrl && (
        <Animated.View style={[StyleSheet.absoluteFill, animatedThumbnailStyle]} pointerEvents="none">
          <Image source={{ uri: posterUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        </Animated.View>
      )}

      {/* Spinning Loading Indicator */}
      {showLoadingSpinner && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <View style={styles.iconBadge}>
            <ActivityIndicator size="large" color={COLORS.textPrimary} />
          </View>
        </View>
      )}

      {/* Manually Paused Indicator */}
      {isManuallyPaused && !showLoadingSpinner && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <View style={styles.iconBadge}>
            <Play size={44} color={COLORS.textPrimary} fill={COLORS.textPrimary} style={{ marginLeft: 4 }} />
          </View>
        </View>
      )}

      {/* AI Quality Enhancer Overlay */}
      {quality === 'hd' && <View style={styles.hdEnhancerOverlay} pointerEvents="none" />}
    </View>
  );
};

export const VideoPlayer = React.memo(VideoPlayerComponent);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  iconBadge: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hdEnhancerOverlay: {
    ...StyleSheet.absoluteFill,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
  },
});
