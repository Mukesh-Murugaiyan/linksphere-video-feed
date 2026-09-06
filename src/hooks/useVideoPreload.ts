import { useMemo, useEffect, useRef } from 'react';
import { Image } from 'react-native';
import { FeedItem, VideoItem } from '../types/video';

export interface PreloadWindowInfo {
  activeIndex: number;
  preloadWindowIndices: Set<number>;
  isItemActive: (index: number) => boolean;
  isItemPreloadTarget: (index: number) => boolean;
  isItemInWindow: (index: number) => boolean;
}

export function useVideoPreload(feedData: FeedItem[], activeIndex: number): PreloadWindowInfo {
  // Sliding window of indices around activeIndex: [activeIndex - 1, activeIndex, activeIndex + 1]
  const preloadWindowIndices = useMemo(() => {
    const indices = new Set<number>();
    if (activeIndex >= 0 && activeIndex < feedData.length) {
      indices.add(activeIndex);
      // Next video (highest preload priority)
      if (activeIndex + 1 < feedData.length) {
        indices.add(activeIndex + 1);
      }
      // Previous video (lower preload priority)
      if (activeIndex - 1 >= 0) {
        indices.add(activeIndex - 1);
      }
    }
    return indices;
  }, [activeIndex, feedData.length]);

  // Immediately prefetch thumbnail images for adjacent videos when activeIndex changes
  const prevActiveIndexRef = useRef<number>(-1);
  useEffect(() => {
    if (prevActiveIndexRef.current === activeIndex) return;
    prevActiveIndexRef.current = activeIndex;

    // Next item poster prefetch (highest priority)
    const nextItem = feedData[activeIndex + 1];
    if (nextItem && nextItem.type === 'video') {
      const videoItem = nextItem as VideoItem;
      if (videoItem.posterUrl) {
        Image.prefetch(videoItem.posterUrl).catch(() => {});
      }
    }

    // Previous item poster prefetch
    const prevItem = feedData[activeIndex - 1];
    if (prevItem && prevItem.type === 'video') {
      const videoItem = prevItem as VideoItem;
      if (videoItem.posterUrl) {
        Image.prefetch(videoItem.posterUrl).catch(() => {});
      }
    }
  }, [activeIndex, feedData]);

  const isItemActive = useMemo(
    () => (index: number) => index === activeIndex,
    [activeIndex]
  );

  const isItemPreloadTarget = useMemo(
    () => (index: number) => index === activeIndex + 1 || index === activeIndex - 1,
    [activeIndex]
  );

  const isItemInWindow = useMemo(
    () => (index: number) => preloadWindowIndices.has(index),
    [preloadWindowIndices]
  );

  return {
    activeIndex,
    preloadWindowIndices,
    isItemActive,
    isItemPreloadTarget,
    isItemInWindow,
  };
}
