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

export type VipLevel = 
  | 'VIP PLATA 10$'
  | 'VIP ORO 20$'
  | 'VIP RUBÍ 40$'
  | 'VIP DIAMANTE 120$'
  | 'VIP PLATINO 420$'
  | 'VIP CORONA IMPERIAL 1000$';

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
  category: 'Video de Fe' | 'Compartir' | 'Familia' | 'Mentalidad';
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
  category?: 'Video de Fe' | 'Familia' | 'Mentalidad' | 'Video Musical';
}

export interface UserProfile {
  username: string;
  email?: string;
  password?: string;
  vipLevel: VipLevel;
  earnings: number;
  completedTaskIds: string[];
  isRegistered: boolean;
  status?: 'pending' | 'active';
  paymentMethodUsed?: 'Pago Móvil' | 'USDT BEP-20';
  proofFileName?: string;
  proofFileBlob?: string; // base64 or placeholder preview link
  referenceNo?: string;
  invitedBy?: string;
  inviteCommissionsEarned?: number;
  inviteCount?: number;
  lastResetDate?: string;
  createdAt?: string;
  commissionPaid?: boolean;
  walletAddress?: string;
  commissionsMergedV4?: boolean;
  blockedTasksUntilDate?: string;
  isSyncedFromDb?: boolean;
  updatedAt?: number;
}

export interface RecoveryRequest {
  id: string;
  username: string;
  email?: string;
  requestedAt: string;
  status: 'pending' | 'resolved';
  requestedNewPassword?: string;
  oldPassword?: string;
}
