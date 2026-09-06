import { useState, useRef, useCallback, useMemo } from 'react';
import { ViewToken, ViewabilityConfig } from 'react-native';
import { FeedItem } from '../types/video';

export function useVideoFeed(feedData?: FeedItem[]) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // O(1) lookup map for item ID -> index
  const idToIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    if (feedData) {
      feedData.forEach((item, index) => {
        map.set(item.id, index);
      });
    }
    return map;
  }, [feedData]);

  // Fast viewability threshold to trigger immediate active video switch & preloading
  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 30,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null && viewableItems[0].index !== undefined) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const getIndexById = useCallback(
    (id: string): number => {
      return idToIndexMap.get(id) ?? -1;
    },
    [idToIndexMap]
  );

  return {
    activeIndex,
    isMuted,
    idToIndexMap,
    getIndexById,
    toggleMute,
    viewabilityConfig,
    onViewableItemsChanged,
  };
}
