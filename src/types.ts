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
