import { setVideoCacheSizeAsync, getCurrentVideoCacheSize } from 'expo-video';

// 500 MB persistent LRU disk cache limit for offline video segments
const DESIRED_CACHE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

// In-memory bounded LRU map for storing last playback positions and cache status (max 100 entries)
class BoundedLRUMap<K, V> {
  private capacity: number;
  private map: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    // Re-insert to mark as recently used
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // Evict oldest item (least recently used)
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey);
      }
    }
    this.map.set(key, value);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  clear(): void {
    this.map.clear();
  }
}

// Global LRU cache instances
const positionCache = new BoundedLRUMap<string, number>(100);
const cachedVideosSet = new BoundedLRUMap<string, boolean>(100);

/**
 * Initializes native Expo Video disk caching at app startup.
 * Sets persistent LRU video segment cache limit to 500MB on Android (ExoPlayer) and iOS (AVPlayer).
 */
export async function initVideoCache(): Promise<void> {
  try {
    await setVideoCacheSizeAsync(DESIRED_CACHE_SIZE_BYTES);
  } catch (err) {
    console.warn('Video cache size initialization warning:', err);
  }
}

/**
 * Retrieves space currently occupied by the video disk cache in bytes.
 */
export function getUsedVideoCacheSizeBytes(): number {
  try {
    return getCurrentVideoCacheSize();
  } catch (_) {
    return 0;
  }
}

/**
 * Saves last playback position for a specific video ID in LRU cache.
 */
export function savePlaybackPosition(videoId: string, positionMillis: number): void {
  if (positionMillis > 500) {
    positionCache.set(videoId, positionMillis);
  }
}

/**
 * Retrieves saved playback position for a specific video ID.
 */
export function getSavedPlaybackPosition(videoId: string): number | undefined {
  return positionCache.get(videoId);
}

/**
 * Marks a video as having verified locally cached playable data on disk.
 */
export function markVideoAsCached(videoId: string): void {
  if (videoId) {
    cachedVideosSet.set(videoId, true);
  }
}

/**
 * Checks if a video has verified locally cached playable video data available.
 */
export function isVideoCached(videoId: string): boolean {
  if (!videoId) return false;
  return Boolean(cachedVideosSet.get(videoId));
}
