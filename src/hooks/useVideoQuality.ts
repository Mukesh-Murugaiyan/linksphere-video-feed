import { useState, useCallback } from 'react';
import { UpscaleQuality, VideoItem } from '../types/video';

export function useVideoQuality(item: VideoItem) {
  const [quality, setQuality] = useState<UpscaleQuality>('sd');
  const [pendingSeekPosition, setPendingSeekPosition] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeUrl = quality === 'hd' ? item.hdUrl : item.sdUrl;

  const toggleQuality = useCallback((currentPlaybackPositionMillis: number) => {
    // Preserve continuous playback timestamp across quality stream switch
    setPendingSeekPosition(currentPlaybackPositionMillis);

    setQuality((prev) => {
      const nextQuality: UpscaleQuality = prev === 'sd' ? 'hd' : 'sd';
      if (nextQuality === 'hd') {
        setToastMessage('Upscaled 1080p');
      } else {
        setToastMessage('SD 480p');
      }
      return nextQuality;
    });
  }, []);

  const clearPendingSeek = useCallback(() => {
    setPendingSeekPosition(null);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return {
    quality,
    activeUrl,
    pendingSeekPosition,
    toastMessage,
    toggleQuality,
    clearPendingSeek,
    clearToast,
  };
}
