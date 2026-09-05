import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { UpscaleQuality } from '../types/video';

interface Props {
  uri: string;
  isFocused: boolean;
  isMuted: boolean;
  isManuallyPaused?: boolean;
  quality: UpscaleQuality;
  pendingSeekPosition: number | null;
  onClearPendingSeek: () => void;
  onPlaybackProgress?: (positionMillis: number) => void;
}

export const VideoPlayer: React.FC<Props> = ({
  uri,
  isFocused,
  isMuted,
  isManuallyPaused = false,
  quality,
  pendingSeekPosition,
  onClearPendingSeek,
  onPlaybackProgress,
}) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = isMuted;
    if (isFocused && !isManuallyPaused) {
      p.play();
    }
  });

  const [status, setStatus] = useState<string>(player.status);
  const [isPlaying, setIsPlaying] = useState<boolean>(player.playing);

  // Subscribe to player status and playing state changes
  useEffect(() => {
    const statusSub = player.addListener('statusChange', (payload) => {
      setStatus(payload.status);
    });
    const playingSub = player.addListener('playingChange', (payload) => {
      setIsPlaying(payload.isPlaying);
    });

    return () => {
      statusSub.remove();
      playingSub.remove();
    };
  }, [player]);

  // Handle play/pause lifecycle on focus change or manual toggle
  useEffect(() => {
    if (isFocused && !isManuallyPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isFocused, isManuallyPaused, player]);

  // Handle mute state change
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  // Continuous playback timestamp seek preservation across HD/SD stream switches
  useEffect(() => {
    if (pendingSeekPosition !== null && pendingSeekPosition > 0) {
      const seekSeconds = pendingSeekPosition / 1000;
      try {
        player.currentTime = seekSeconds;
      } catch (err) {
        console.warn('Seek error during quality switch:', err);
      }
      onClearPendingSeek();
    }
  }, [pendingSeekPosition, onClearPendingSeek, player]);

  // Periodic playback progress callback
  useEffect(() => {
    const interval = setInterval(() => {
      if (player.playing && onPlaybackProgress) {
        onPlaybackProgress(player.currentTime * 1000);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [player, onPlaybackProgress]);

  // Loading state: when video is loading stream, buffering, or waiting to play on focus
  const isLoading = status === 'loading' || (isFocused && !isManuallyPaused && !isPlaying);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Instagram-Style Center Circular Loader Overlay */}
      {isLoading && (
        <View style={styles.loaderContainer} pointerEvents="none">
          <View style={styles.loaderBadge}>
            <ActivityIndicator size="large" color={COLORS.textPrimary} />
          </View>
        </View>
      )}

      {/* Instagram-Style Centered Play Overlay when Manually Paused */}
      {isManuallyPaused && !isLoading && (
        <View style={styles.pausedContainer} pointerEvents="none">
          <View style={styles.pausedIconBadge}>
            <Play size={44} color={COLORS.textPrimary} fill={COLORS.textPrimary} style={{ marginLeft: 4 }} />
          </View>
        </View>
      )}

      {/* Simulated AI Upscaling Sharpness / Contrast Enhancer Filter Layer */}
      {quality === 'hd' && (
        <View style={styles.hdEnhancerOverlay} pointerEvents="none" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loaderBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pausedContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  pausedIconBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hdEnhancerOverlay: {
    ...StyleSheet.absoluteFill,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
  },
});
