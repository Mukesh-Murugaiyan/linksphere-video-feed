export const COLORS = {
  background: '#0A0A0E',
  card: '#14141B',
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  glassBackground: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  accentPurple: '#8B5CF6',
  accentCyan: '#06B6D4',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.45)',
  heartRed: '#EF4444',
  overlayGradient: ['transparent', 'rgba(10, 10, 14, 0.85)'],
  badgeBackground: 'rgba(139, 92, 246, 0.25)',
  cyanBadgeBg: 'rgba(6, 182, 212, 0.25)',
};

export const GLASS_STYLE = {
  backgroundColor: COLORS.glassBackground,
  borderColor: COLORS.glassBorder,
  borderWidth: 1,
};

export const SHADOWS = {
  purpleGlow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  cyanGlow: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
};
