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

const ToastHUDComponent: React.FC<Props> = ({ message, onDismiss }) => {
  const translateX = useSharedValue(-40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (message) {
      // Animate in smoothly from left
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 220 });

      // Automatically fade out after 2000ms
      const timer = setTimeout(() => {
        translateX.value = withTiming(-30, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            scheduleOnRN(onDismiss);
          }
        });
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      translateX.value = -40;
      opacity.value = 0;
    }
  }, [message, onDismiss, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  if (!message) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.hudToast, GLASS_STYLE, animatedStyle]}>
        <Sparkles size={16} color={COLORS.accentCyan} />
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    </View>
  );
};

export const ToastHUD = React.memo(ToastHUDComponent);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 16,
    zIndex: 100,
  },
  hudToast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 14, 0.85)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    borderWidth: 1,
    gap: 6,
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
