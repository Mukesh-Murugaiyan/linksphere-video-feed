import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { generateFeedData } from '../constants/mockData';
import { FeedItem } from '../types/video';
import { VideoCard } from './VideoCard';
import { AdCard } from './AdCard';
import { useVideoFeed } from '../hooks/useVideoFeed';
import { COLORS } from '../constants/theme';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export const FeedList: React.FC = () => {
  const feedData = useMemo(() => generateFeedData(20), []);
  const { activeIndex, isMuted, toggleMute, viewabilityConfig, onViewableItemsChanged } =
    useVideoFeed();

  const renderItem = ({ item, index }: { item: FeedItem; index: number }) => {
    if (item.type === 'ad') {
      return <AdCard item={item} />;
    }

    return (
      <VideoCard
        item={item}
        isFocused={index === activeIndex}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    );
  };

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
