import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Heart } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export interface DoubleTapHeartRef {
  triggerAnimation: () => void;
}

interface Props {
  onAnimationComplete?: () => void;
}

export const DoubleTapHeart = forwardRef<DoubleTapHeartRef, Props>(({ onAnimationComplete }, ref) => {
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  const triggerAnimation = useCallback(() => {
    // Cancel active animations
    cancelAnimation(scale);
    cancelAnimation(translateY);
    cancelAnimation(opacity);

    // Initial values
    scale.value = 0;
    translateY.value = 0;
    opacity.value = 0;
    rotation.value = (Math.random() - 0.5) * 24;

    // Pop & Spring Scale
    scale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 260 }),
      withSpring(1.0, { damping: 10, stiffness: 200 })
    );

    // Float Upward
    translateY.value = withTiming(-60, { duration: 800 });

    // Fade sequence: fast fade-in to 1, hold for 500ms, fade-out to 0
    opacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished && onAnimationComplete) {
          scheduleOnRN(onAnimationComplete);
        }
      })
    );
  }, [onAnimationComplete, opacity, rotation, scale, translateY]);

  useImperativeHandle(ref, () => ({
    triggerAnimation,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.overlayWrapper} pointerEvents="none">
      <Animated.View style={[styles.heartWrapper, animatedStyle]}>
        <Heart size={120} color="#FFFFFF" fill={COLORS.heartRed} strokeWidth={3.5} />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  heartWrapper: {
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.95,
    shadowRadius: 24,
    elevation: 20,
  },
});
