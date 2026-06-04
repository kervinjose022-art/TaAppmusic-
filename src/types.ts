export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  genre: 'Reggaeton' | 'Trap' | 'Urban Latino' | 'Lo-Fi Beats' | 'Chill House';
  color: string;
  plays: number;
  lyrics?: string[];
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  currentTrackIndex: number;
  isLooping: 'none' | 'one' | 'all';
  isShuffled: boolean;
}

export type VipLevel = 'VIP 1' | 'VIP 2' | 'VIP 3' | 'VIP 4';

export interface VipFeature {
  name: VipLevel;
  price: string;
  bonusMultiplier: number;
  badgeColor: string;
  glowColor: string;
}

export interface UserTask {
  id: string;
  title: string;
  description: string;
  rewardValue: number;
  isCompleted: boolean;
  vipRequired: VipLevel;
  category: 'Escucha' | 'Share' | 'Rate' | 'Ad Watch';
}

export interface Reel {
  id: string;
  title: string;
  caption: string;
  artist: string;
  coverUrl: string;
  videoUrl: string; // Simulated or looping audio with beautiful active waveform/music visualization
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
  vipLevel: VipLevel;
  duration: string;
}

export interface UserProfile {
  username: string;
  vipLevel: VipLevel;
  earnings: number;
  completedTaskIds: string[];
  isRegistered: boolean;
}
