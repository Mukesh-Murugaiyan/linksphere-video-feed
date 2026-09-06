import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  type SharedValue,
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

const PARTICLES = [
  { id: 1, angle: -35, distance: 75, size: 26, rotate: -15 },
  { id: 2, angle: 35, distance: 80, size: 22, rotate: 18 },
  { id: 3, angle: -85, distance: 70, size: 28, rotate: -10 },
  { id: 4, angle: 85, distance: 65, size: 24, rotate: 12 },
  { id: 5, angle: -145, distance: 72, size: 22, rotate: -25 },
  { id: 6, angle: 145, distance: 78, size: 26, rotate: 20 },
];

const MiniParticle = ({
  angle,
  distance,
  size,
  rotate,
  progress,
}: {
  angle: number;
  distance: number;
  size: number;
  rotate: number;
  progress: SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const rad = (angle * Math.PI) / 180;
    const currentDist = distance * p;
    const translateX = Math.cos(rad) * currentDist;
    const translateY = Math.sin(rad) * currentDist - p * 45;
    const scale = Math.sin(p * Math.PI) * 1.15;
    const opacity = p > 0.75 ? (1 - p) * 4 : p > 0.05 ? 0.95 : 0;

    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotate}deg` },
        { scale: Math.max(0.01, scale) },
      ],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Heart size={size} color={COLORS.heartRed} fill={COLORS.heartRed} strokeWidth={0} />
    </Animated.View>
  );
};

const DoubleTapHeartComponent = forwardRef<DoubleTapHeartRef, Props>(({ onAnimationComplete }, ref) => {
  const scale = useSharedValue(0.01);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const particleProgress = useSharedValue(0);

  const triggerAnimation = useCallback(() => {
    // Reset baseline values
    scale.value = 0.01;
    translateY.value = 0;
    opacity.value = 0;
    particleProgress.value = 0;
    rotation.value = (Math.random() - 0.5) * 20;

    // Realistic Heartbeat Pulse Sequence: Pop 1.35 -> Rebound 0.92 -> Secondary Pulse 1.08 -> Rest 1.0
    scale.value = withSequence(
      withSpring(1.35, { damping: 6, stiffness: 340 }),
      withSpring(0.92, { damping: 8, stiffness: 280 }),
      withSpring(1.08, { damping: 10, stiffness: 240 }),
      withDelay(380, withTiming(0.01, { duration: 220 }))
    );

    // Particle Burst Progress: 0 to 1
    particleProgress.value = withSequence(
      withTiming(1, { duration: 650 }),
      withTiming(0, { duration: 0 })
    );

    // Smooth Float Upward Physics
    translateY.value = withTiming(-85, { duration: 750 });

    // Fade In and Fade Out Sequence
    opacity.value = withSequence(
      withTiming(1, { duration: 90 }),
      withDelay(
        420,
        withTiming(0, { duration: 220 }, (finished) => {
          if (finished && onAnimationComplete) {
            scheduleOnRN(onAnimationComplete);
          }
        })
      )
    );
  }, [onAnimationComplete, opacity, particleProgress, rotation, scale, translateY]);

  useImperativeHandle(ref, () => ({
    triggerAnimation,
  }));

  const mainHeartStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.overlayWrapper} pointerEvents="none">
      {PARTICLES.map((item) => (
        <MiniParticle
          key={item.id}
          angle={item.angle}
          distance={item.distance}
          size={item.size}
          rotate={item.rotate}
          progress={particleProgress}
        />
      ))}
      <Animated.View style={[styles.heartWrapper, mainHeartStyle]}>
        <Heart size={128} color={COLORS.heartRed} fill={COLORS.heartRed} strokeWidth={0} />
      </Animated.View>
    </View>
  );
});

export const DoubleTapHeart = React.memo(DoubleTapHeartComponent);

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  particle: {
    position: 'absolute',
    shadowColor: COLORS.heartRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  heartWrapper: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.heartRed,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.95,
    shadowRadius: 24,
    elevation: 25,
  },
});
