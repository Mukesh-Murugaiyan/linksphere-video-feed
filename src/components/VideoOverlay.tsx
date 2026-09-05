import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Music,
  CheckCircle2,
} from 'lucide-react-native';
import { VideoItem } from '../types/video';
import { formatCount } from '../utils/formatters';
import { COLORS } from '../constants/theme';

interface Props {
  item: VideoItem;
  isLiked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  isBookmarked: boolean;
  bookmarkCount: number;
  onToggleBookmark: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VideoOverlay: React.FC<Props> = ({
  item,
  isLiked,
  likeCount,
  onToggleLike,
  isBookmarked,
  bookmarkCount,
  onToggleBookmark,
  isMuted,
  onToggleMute,
}) => {
  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      {/* Sidebar Actions */}
      <View style={styles.sidebar}>
        {/* Like Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onToggleLike} activeOpacity={0.7}>
          <View style={[styles.iconCircle, isLiked && styles.likedCircle]}>
            <Heart
              size={26}
              color={isLiked ? COLORS.heartRed : COLORS.textPrimary}
              fill={isLiked ? COLORS.heartRed : 'transparent'}
            />
          </View>
          <Text style={styles.actionText}>{formatCount(likeCount)}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={styles.iconCircle}>
            <MessageCircle size={26} color={COLORS.textPrimary} />
          </View>
          <Text style={styles.actionText}>{formatCount(item.commentsCount)}</Text>
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity style={styles.actionButton} onPress={onToggleBookmark} activeOpacity={0.7}>
          <View style={[styles.iconCircle, isBookmarked && styles.bookmarkedCircle]}>
            <Bookmark
              size={26}
              color={isBookmarked ? COLORS.accentCyan : COLORS.textPrimary}
              fill={isBookmarked ? COLORS.accentCyan : 'transparent'}
            />
          </View>
          <Text style={styles.actionText}>{formatCount(bookmarkCount)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={styles.iconCircle}>
            <Share2 size={26} color={COLORS.textPrimary} />
          </View>
          <Text style={styles.actionText}>{formatCount(item.sharesCount)}</Text>
        </TouchableOpacity>

        {/* Mute Toggle */}
        <TouchableOpacity style={styles.actionButton} onPress={onToggleMute} activeOpacity={0.7}>
          <View style={styles.iconCircle}>
            {isMuted ? (
              <VolumeX size={24} color={COLORS.textMuted} />
            ) : (
              <Volume2 size={24} color={COLORS.accentCyan} />
            )}
          </View>
          <Text style={styles.actionText}>{isMuted ? 'Muted' : 'Sound'}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Information Details */}
      <View style={styles.bottomDetails}>
        {/* Creator Info Header */}
        <View style={styles.creatorRow}>
          <Image source={{ uri: item.creator.avatar }} style={styles.avatar} />
          <Text style={styles.handleText}>{item.creator.handle}</Text>
          {item.creator.verified && (
            <CheckCircle2 size={16} color={COLORS.accentCyan} fill={COLORS.accentCyan} />
          )}
          <TouchableOpacity style={styles.followButton} activeOpacity={0.8}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>

        {/* Title & Caption */}
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.captionText} numberOfLines={2}>
          {item.caption}
        </Text>

        {/* Audio Track Badge */}
        <View style={styles.audioRow}>
          <Music size={14} color={COLORS.accentPurple} />
          <Text style={styles.audioText} numberOfLines={1}>
            {item.audioTrack.title} • {item.audioTrack.artist}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 28,
  },
  sidebar: {
    position: 'absolute',
    right: 12,
    bottom: 40,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 20, 27, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  likedCircle: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: COLORS.heartRed,
  },
  bookmarkedCircle: {
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
    borderColor: COLORS.accentCyan,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  bottomDetails: {
    position: 'absolute',
    left: 16,
    bottom: 28,
    right: 80,
    gap: 8,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.accentPurple,
  },
  handleText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  followButton: {
    backgroundColor: COLORS.accentPurple,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginLeft: 4,
  },
  followText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  titleText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  captionText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20, 20, 27, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    marginTop: 2,
  },
  audioText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});
