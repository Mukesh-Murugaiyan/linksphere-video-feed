import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowUpRight, Sparkles, ExternalLink } from 'lucide-react-native';
import { AdItem } from '../types/video';
import { COLORS, GLASS_STYLE } from '../constants/theme';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

interface Props {
  item: AdItem;
}

export const AdCard: React.FC<Props> = ({ item }) => {
  return (
    <View style={styles.adContainer}>
      {/* Fixed Dimension Skeleton & Background Image (Zero CLS) */}
      <Image source={{ uri: item.imageUrl }} style={styles.backgroundImage} resizeMode="cover" />
      <View style={styles.gradientOverlay} />

      {/* Top Sponsored Tag */}
      <View style={styles.topBadgeContainer}>
        <View style={[styles.sponsoredBadge, GLASS_STYLE]}>
          <Sparkles size={14} color={COLORS.accentPurple} />
          <Text style={styles.badgeText}>{item.badgeText || 'SPONSORED'}</Text>
        </View>
      </View>

      {/* Bottom Ad Card Details */}
      <View style={styles.adContentBox}>
        <View style={[styles.glassCard, GLASS_STYLE]}>
          {/* Sponsor Header */}
          <View style={styles.sponsorHeader}>
            <Image source={{ uri: item.sponsorLogo }} style={styles.sponsorLogo} />
            <View style={styles.sponsorMeta}>
              <Text style={styles.sponsorName}>{item.sponsorName}</Text>
              <Text style={styles.promotedLabel}>Promoted Partner</Text>
            </View>
          </View>

          {/* Ad Title & Description */}
          <Text style={styles.adTitle}>{item.title}</Text>
          <Text style={styles.adDescription}>{item.description}</Text>

          {/* CTA Action Button */}
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaText}>{item.ctaText}</Text>
            <ArrowUpRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    backgroundColor: COLORS.card,
    position: 'relative',
    justifyContent: 'space-between',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 14, 0.65)',
  },
  topBadgeContainer: {
    position: 'absolute',
    top: 54,
    left: 16,
    zIndex: 10,
  },
  sponsoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 20, 27, 0.85)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderWidth: 1,
    gap: 6,
  },
  badgeText: {
    color: COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  adContentBox: {
    position: 'absolute',
    bottom: 36,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  glassCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 20, 27, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sponsorLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.accentCyan,
  },
  sponsorMeta: {
    flex: 1,
  },
  sponsorName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  promotedLabel: {
    color: COLORS.accentCyan,
    fontSize: 12,
    fontWeight: '600',
  },
  adTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  adDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: COLORS.accentPurple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 4,
    shadowColor: COLORS.accentPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
