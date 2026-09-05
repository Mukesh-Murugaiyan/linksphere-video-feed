import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Sparkles } from 'lucide-react-native';
import { COLORS, GLASS_STYLE } from '../constants/theme';

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export const ToastHUD: React.FC<Props> = ({ message, onDismiss }) => {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (message) {
      // Animate in
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      // Automatically fade out after 2000ms
      const timer = setTimeout(() => {
        translateY.value = withTiming(-60, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            scheduleOnRN(onDismiss);
          }
        });
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      translateY.value = -80;
      opacity.value = 0;
    }
  }, [message, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!message) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.hudToast, GLASS_STYLE, animatedStyle]}>
        <Sparkles size={18} color={COLORS.accentCyan} />
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  hudToast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 10, 14, 0.85)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    borderWidth: 1,
    gap: 8,
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
