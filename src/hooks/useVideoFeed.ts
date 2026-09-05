import { useState, useRef, useCallback } from 'react';
import { ViewToken, ViewabilityConfig } from 'react-native';

export function useVideoFeed() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 70, // Active video when at least 70% visible in viewport
    minimumViewTime: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    activeIndex,
    isMuted,
    toggleMute,
    viewabilityConfig,
    onViewableItemsChanged,
  };
}
