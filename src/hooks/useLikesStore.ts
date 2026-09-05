import { useState, useCallback, useEffect } from 'react';
import { Storage } from '../services/storage';

export function useLikesStore(videoId: string, initialLikesCount: number, initialBookmarksCount: number = 0) {
  const likedKey = `liked_${videoId}`;
  const countKey = `like_count_${videoId}`;
  const bookmarkKey = `bookmarked_${videoId}`;
  const bookmarkCountKey = `bookmark_count_${videoId}`;

  const [isLiked, setIsLiked] = useState<boolean>(() => Storage.getBoolean(likedKey, false));
  const [likeCount, setLikeCount] = useState<number>(() => Storage.getNumber(countKey, initialLikesCount));
  
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => Storage.getBoolean(bookmarkKey, false));
  const [bookmarkCount, setBookmarkCount] = useState<number>(() => Storage.getNumber(bookmarkCountKey, initialBookmarksCount));

  useEffect(() => {
    // Synchronize initial state if not previously saved
    if (Storage.getItem(countKey) === null) {
      Storage.setNumber(countKey, initialLikesCount);
    }
    if (Storage.getItem(bookmarkCountKey) === null) {
      Storage.setNumber(bookmarkCountKey, initialBookmarksCount);
    }
  }, [videoId, initialLikesCount, initialBookmarksCount]);

  const toggleLike = useCallback(() => {
    setIsLiked((prev) => {
      const nextLiked = !prev;
      const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
      
      setLikeCount(nextCount);
      
      // Synchronous zero-latency persistence
      Storage.setBoolean(likedKey, nextLiked);
      Storage.setNumber(countKey, nextCount);

      return nextLiked;
    });
  }, [videoId, likeCount, likedKey, countKey]);

  const handleDoubleTapLike = useCallback(() => {
    let newlyAdded = false;
    setIsLiked((prev) => {
      if (!prev) {
        newlyAdded = true;
        const nextCount = likeCount + 1;
        setLikeCount(nextCount);
        Storage.setBoolean(likedKey, true);
        Storage.setNumber(countKey, nextCount);
        return true;
      }
      return true;
    });
    return newlyAdded;
  }, [likeCount, likedKey, countKey]);

  const toggleBookmark = useCallback(() => {
    setIsBookmarked((prev) => {
      const nextBookmarked = !prev;
      const nextCount = nextBookmarked ? bookmarkCount + 1 : Math.max(0, bookmarkCount - 1);

      setBookmarkCount(nextCount);

      Storage.setBoolean(bookmarkKey, nextBookmarked);
      Storage.setNumber(bookmarkCountKey, nextCount);

      return nextBookmarked;
    });
  }, [bookmarkCount, bookmarkKey, bookmarkCountKey]);

  return {
    isLiked,
    likeCount,
    toggleLike,
    handleDoubleTapLike,
    isBookmarked,
    bookmarkCount,
    toggleBookmark,
  };
}
