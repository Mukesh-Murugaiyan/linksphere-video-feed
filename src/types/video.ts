export type UpscaleQuality = 'sd' | 'hd';

export type PlaybackLifecycleState =
  | 'UNLOADED'
  | 'LOADING'
  | 'READY'
  | 'PLAYING'
  | 'PAUSED'
  | 'ERROR';

export interface VideoItem {
  id: string;
  type: 'video';
  title: string;
  creator: {
    handle: string;
    name: string;
    avatar: string;
    verified?: boolean;
  };
  caption: string;
  tags: string[];
  sdUrl: string;
  hdUrl: string;
  posterUrl: string;
  audioTrack:
    | {
        title: string;
        artist: string;
      }
    | string;
  initialLikes: number;
  commentsCount?: number;
  initialComments?: number;
  sharesCount?: number;
  initialShares?: number;
  bookmarksCount?: number;
  initialBookmarks?: number;
}

export interface AdItem {
  id: string;
  type: 'ad';
  sponsorName: string;
  sponsorLogo?: string;
  logo?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl?: string;
  imageUrl: string;
  videoUrl?: string;
  badgeText?: string;
}

export type FeedItem = VideoItem | AdItem;

export interface InteractionState {
  isLiked: boolean;
  likeCount: number;
  isBookmarked: boolean;
  bookmarkCount: number;
}
