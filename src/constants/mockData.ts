import { FeedItem, VideoItem, AdItem } from '../types/video';

// Public reliable CDN MP4 streaming links (Video.js & W3C public media samples)
export const RAW_VIDEOS: Omit<VideoItem, 'id' | 'type'>[] = [
  {
    title: 'Cyberpunk Neon Metropolis Exploration',
    creator: {
      handle: '@future_pulse',
      name: 'Future Pulse',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    caption: 'Exploring the neon-lit alleys of tomorrow. Built with real-time ray tracing & 60fps renders! ⚡✨ #cyberpunk #future #scifi',
    tags: ['cyberpunk', 'future', 'scifi', 'linksphere'],
    sdUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    hdUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    audioTrack: {
      title: 'Neon Synthwave Odyssey - Original Mix',
      artist: 'Future Pulse Audio',
    },
    initialLikes: 14230,
    commentsCount: 842,
    sharesCount: 1205,
    bookmarksCount: 3410,
  },
  {
    title: 'Deep Space Galaxy Dynamics',
    creator: {
      handle: '@astro_vision',
      name: 'Astro Vision',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    caption: '4K simulation of cosmic nebula turbulence & stellar evolution. Turn volume UP for spatial audio! 🌌🚀 #space #astronomy #cosmos',
    tags: ['space', 'astronomy', 'cosmos', '4k'],
    sdUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    hdUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    audioTrack: {
      title: 'Interstellar Waves Vol 4',
      artist: 'Cosmic Soundscapes',
    },
    initialLikes: 29840,
    commentsCount: 1940,
    sharesCount: 4820,
    bookmarksCount: 8900,
  },
  {
    title: 'Kinetic High Speed Motion & Physics',
    creator: {
      handle: '@motion_lab',
      name: 'Kinetic Lab',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    caption: 'Ultra 240fps slow-motion liquid dynamics & particle impact testing. 💧💥 #physics #fluid #motion',
    tags: ['physics', 'fluid', 'motion', 'cinematic'],
    sdUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4',
    hdUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    audioTrack: {
      title: 'Liquid Bass Horizon',
      artist: 'Subsonic Echoes',
    },
    initialLikes: 8930,
    commentsCount: 420,
    sharesCount: 910,
    bookmarksCount: 1840,
  },
  {
    title: 'Extreme Mountain Biking Trail',
    creator: {
      handle: '@adrenaline_junkie',
      name: 'Apex Riders',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    caption: 'Descending the steepest cliff edge downhill trail in British Columbia! POV footage 🚵‍♂️💨 #biking #extreme #gopro',
    tags: ['biking', 'extreme', 'gopro', 'action'],
    sdUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    hdUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    audioTrack: {
      title: 'Adrenaline High Rush',
      artist: 'Apex Beats',
    },
    initialLikes: 54120,
    commentsCount: 3105,
    sharesCount: 8940,
    bookmarksCount: 14200,
  },
  {
    title: 'Tokyo Street Food Night Market',
    creator: {
      handle: '@urban_gourmet',
      name: 'Urban Eats',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    caption: 'Sizzling midnight Wagyu beef skewers & handmade ramen in Shinjuku, Tokyo 🍜🥩 #tokyo #japan #foodie #streetfood',
    tags: ['tokyo', 'japan', 'foodie', 'streetfood'],
    sdUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    hdUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    audioTrack: {
      title: 'Shinjuku Lofi Chill Hop',
      artist: 'Tokyo Midnight Beats',
    },
    initialLikes: 41200,
    commentsCount: 2180,
    sharesCount: 6100,
    bookmarksCount: 11400,
  },
  {
    title: 'Architectural Minimalism in Alpine Nature',
    creator: {
      handle: '@arch_digest_tv',
      name: 'Architectural Vision',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    caption: 'A cantilevered glass villa suspended over the Swiss Alps. Pure serenity and architectural harmony. 🏔️🏛️ #architecture #design #luxury',
    tags: ['architecture', 'design', 'luxury', 'nature'],
    sdUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4',
    hdUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    audioTrack: {
      title: 'Minimal Ambient Piano in D Minor',
      artist: 'Echoes of the Alps',
    },
    initialLikes: 19450,
    commentsCount: 920,
    sharesCount: 2310,
    bookmarksCount: 5600,
  },
  {
    title: 'Quantum Computing Supercomputer Cooling',
    creator: {
      handle: '@tech_insider',
      name: 'Tech Insider',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    caption: 'Inside a 15-millikelvin dilution refrigerator cooling 1,000 qubit quantum processor units! 💻⚛️ #quantum #tech #future',
    tags: ['quantum', 'tech', 'future', 'hardware'],
    sdUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    hdUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    audioTrack: {
      title: 'Subatomic Pulse Anthem',
      artist: 'Digital Frontier',
    },
    initialLikes: 32100,
    commentsCount: 1650,
    sharesCount: 4200,
    bookmarksCount: 9800,
  },
  {
    title: 'Bioluminescent Underwater Deep Dive',
    creator: {
      handle: '@ocean_explorer',
      name: 'Oceanic Deep',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    caption: 'Diving 2,000m deep into abyssal trenches with glowing bioluminescent jellyfish and deep sea squids! 🌊🦑 #ocean #deepsea #nature',
    tags: ['ocean', 'deepsea', 'nature', 'discovery'],
    sdUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    hdUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    audioTrack: {
      title: 'Abyssal Deep Resonance',
      artist: 'Oceanic Soundwaves',
    },
    initialLikes: 68400,
    commentsCount: 4120,
    sharesCount: 11200,
    bookmarksCount: 22100,
  },
];

export const MOCK_ADS: Omit<AdItem, 'id' | 'type'>[] = [
  {
    sponsorName: 'LinkSphere Cloud AI',
    sponsorLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Supercharge Your Apps with Real-Time Video AI',
    description: 'Deploy zero-latency streaming pipelines with automated neural upscaling and smart spatial analytics.',
    ctaText: 'Start Free Trial',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    badgeText: 'SPONSORED BY LINKSPHERE',
  },
  {
    sponsorName: 'CyberPulse Audio',
    sponsorLogo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80',
    title: 'Spatial Audio Pro Wireless Headphones',
    description: 'Immerse yourself in active noise-cancelling 3D audio crafted for creators & developers.',
    ctaText: 'Get 25% Off',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    badgeText: 'FEATURED PARTNER',
  },
  {
    sponsorName: 'QuantumScale Cloud',
    sponsorLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    title: 'Deploy AI Models at 10x Speed',
    description: 'Scale GPU clusters instantly with zero setup time and per-millisecond billing.',
    ctaText: 'Claim $500 Credit',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    badgeText: 'PROMOTED PLATFORM',
  },
  {
    sponsorName: 'Apex Hardware Lab',
    sponsorLogo: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=100&auto=format&fit=crop&q=80',
    title: 'Ultimate M3 Ultra Studio Rig',
    description: 'Designed for real-time 8K video editing, 3D rendering, and local LLM fine-tuning.',
    ctaText: 'Configure Your Rig',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    badgeText: 'SPONSORED BUILD',
  },
];

// Helper to construct feed dataset with Ads injected at every 5th index (0-indexed: index 4, 9, 14, etc.)
export function generateFeedData(totalCount: number = 30): FeedItem[] {
  const items: FeedItem[] = [];
  let videoIndex = 0;
  let adIndex = 0;

  for (let i = 0; i < totalCount; i++) {
    // Every 5th item (index 4, 9, 14, 19...) is an Ad item
    if ((i + 1) % 5 === 0) {
      const adTemplate = MOCK_ADS[adIndex % MOCK_ADS.length];
      adIndex++;
      items.push({
        ...adTemplate,
        id: `ad-${i + 1}`,
        type: 'ad',
      });
    } else {
      const videoTemplate = RAW_VIDEOS[videoIndex % RAW_VIDEOS.length];
      videoIndex++;
      items.push({
        ...videoTemplate,
        id: `video-${i + 1}`,
        type: 'video',
      });
    }
  }

  return items;
}
