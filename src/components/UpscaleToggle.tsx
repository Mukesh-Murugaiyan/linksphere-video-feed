import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { UpscaleQuality } from '../types/video';
import { COLORS, GLASS_STYLE } from '../constants/theme';

interface Props {
  quality: UpscaleQuality;
  onToggle: () => void;
}

const UpscaleToggleComponent: React.FC<Props> = ({ quality, onToggle }) => {
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
          size={14}
          color={isHD ? COLORS.accentCyan : '#94A3B8'}
          style={isHD ? styles.activeIcon : undefined}
        />
        <Text style={[styles.label, isHD ? styles.activeLabel : styles.inactiveLabel]}>
          AI Upscale
        </Text>
        <View style={[styles.badge, isHD ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.badgeText, isHD ? styles.activeBadgeText : styles.inactiveBadgeText]}>
            {isHD ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const UpscaleToggle = React.memo(UpscaleToggleComponent);

const styles = StyleSheet.create({
  buttonContainer: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inactiveContainer: {
    backgroundColor: 'rgba(15, 15, 22, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  activeContainer: {
    backgroundColor: 'rgba(6, 182, 212, 0.16)',
    borderColor: COLORS.accentCyan,
    borderWidth: 1,
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeIcon: {
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  inactiveLabel: {
    color: '#CBD5E1',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeBadge: {
    backgroundColor: COLORS.accentCyan,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  inactiveBadgeText: {
    color: '#94A3B8',
  },
  activeBadgeText: {
    color: '#0A0A0E',
  },
});
