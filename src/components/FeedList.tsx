import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { generateFeedData } from '../constants/mockData';
import { FeedItem } from '../types/video';
import { VideoCard } from './VideoCard';
import { AdCard } from './AdCard';
import { useVideoFeed } from '../hooks/useVideoFeed';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { COLORS } from '../constants/theme';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export const FeedList: React.FC = () => {
  const feedData = useMemo(() => generateFeedData(30), []);
  const { activeIndex, isMuted, toggleMute, viewabilityConfig, onViewableItemsChanged } =
    useVideoFeed(feedData);

  const { isItemPreloadTarget } = useVideoPreload(feedData, activeIndex);

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      if (item.type === 'ad') {
        return <AdCard item={item} />;
      }

      const isFocused = index === activeIndex;
      const isPreloadTarget = isItemPreloadTarget(index);

      return (
        <VideoCard
          item={item}
          isFocused={isFocused}
          isPreloadTarget={isPreloadTarget}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      );
    },
    [activeIndex, isItemPreloadTarget, isMuted, toggleMute]
  );

  const overrideItemLayout = useCallback((layout: { span?: number }) => {
    layout.span = 1;
  }, []);

  return (
    <View style={styles.container}>
      <FlashList
        data={feedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getItemType={(item) => item.type}
        pagingEnabled
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        overrideItemLayout={overrideItemLayout}
        drawDistance={WINDOW_HEIGHT}
        extraData={activeIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
