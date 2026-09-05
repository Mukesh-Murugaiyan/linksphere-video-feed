import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Sparkles, Sliders } from 'lucide-react-native';
import { UpscaleQuality } from '../types/video';
import { COLORS, GLASS_STYLE } from '../constants/theme';

interface Props {
  quality: UpscaleQuality;
  onToggle: () => void;
}

export const UpscaleToggle: React.FC<Props> = ({ quality, onToggle }) => {
  const isHD = quality === 'hd';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={[
        styles.buttonContainer,
        GLASS_STYLE,
        isHD ? styles.activeContainer : styles.inactiveContainer,
      ]}
    >
      <View style={styles.contentRow}>
        <Sparkles
          size={16}
          color={isHD ? COLORS.accentCyan : COLORS.textMuted}
        />
        <Text style={[styles.label, isHD ? styles.activeLabel : styles.inactiveLabel]}>
          {isHD ? 'AI Upscale ON' : 'AI Upscale / HD'}
        </Text>
        <View style={[styles.indicatorDot, isHD && styles.activeDot]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  inactiveContainer: {
    backgroundColor: 'rgba(20, 20, 27, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeContainer: {
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
    borderColor: COLORS.accentCyan,
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  inactiveLabel: {
    color: COLORS.textSecondary,
  },
  activeLabel: {
    color: COLORS.accentCyan,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginLeft: 2,
  },
  activeDot: {
    backgroundColor: COLORS.accentCyan,
  },
});
