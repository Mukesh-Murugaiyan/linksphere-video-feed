import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { FeedList } from './src/components/FeedList';
import { COLORS } from './src/constants/theme';
import { initVideoCache } from './src/services/videoCache';

export default function App() {
  useEffect(() => {
    initVideoCache();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.feedWrapper}>
        <FeedList />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  feedWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
