import { useState, useRef, useEffect } from 'react';
import { 
  Heart, MessageCircle, Play, Pause, RefreshCw, Volume2, 
  VolumeX, Send, Music, Award, Sparkles, Flame, ThumbsUp 
} from 'lucide-react';
import { Reel, VipLevel } from '../types';
import { REELS_DATABASE } from '../data';

interface VipReelsProps {
  currentVip: VipLevel;
}

export default function VipReels({ currentVip }: VipReelsProps) {
  // Let's copy initial database so user can like individually
  const [reels, setReels] = useState<Reel[]>(REELS_DATABASE);
  const [activeTab, setActiveTab] = useState<VipLevel>('VIP 1');
  
  // Track active playing reel ID
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Comments database associated with reel IDs
  const [comments, setComments] = useState<Record<string, { username: string; text: string; time: string }[]>>({
    'reel_1': [
      { username: 'pedrito_flow', text: 'Hermano finalmente la plataforma activa!!! 🇩🇴', time: '1m ago' },
      { username: 'tapp_music_fan', text: 'Qué loco esto, se siente el bajo real', time: '12m ago' }
    ],
    'reel_2': [
      { username: 'dj_santiago', text: 'El cerebro con audífonos se ve de locura total, LED real', time: '30m ago' }
    ],
    'reel_3': [
      { username: 'margarita_99', text: 'Esos pases de nivel VIP 2 tan brutales!! 🕺🔥', time: '2h ago' }
    ],
    'reel_4': [
      { username: 'urban_producer', text: 'Sintetizador soñado, guíame con ese beat brother', time: '1d ago' }
    ]
  });

  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  // Core HTML5 Audio Player for Reels
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play audio snippet when reel gets active and clicked
  const handleTogglePlayReel = (reel: Reel) => {
    if (playingReelId === reel.id) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingReelId(null);
    } else {
      // Play new
      setPlayingReelId(reel.id);
      if (audioRef.current) {
        audioRef.current.src = reel.videoUrl;
        audioRef.current.loop = true;
        audioRef.current.volume = isMuted ? 0 : 0.8;
        audioRef.current.play().catch(err => {
          console.warn("Autoplay block averted on reel:", err);
        });
      }
    }
  };

  // Keep volume/mute settings active on audio trigger change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.8;
    }
  }, [isMuted]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleLikeReel = (id: string) => {
    setReels(prev => prev.map(reel => {
      if (reel.id === id) {
        const hasLiked = !reel.hasLiked;
        return {
          ...reel,
          hasLiked,
          likes: hasLiked ? reel.likes + 1 : reel.likes - 1
        };
      }
      return reel;
    }));
  };

  const handlePostComment = (reelId: string) => {
    const text = newCommentText[reelId]?.trim();
    if (!text) return;

    const newComment = {
      username: 'tu_usuario',
      text,
      time: 'Justo ahora'
    };

    setComments(prev => ({
      ...prev,
      [reelId]: [newComment, ...(prev[reelId] || [])]
    }));

    setNewCommentText(prev => ({
      ...prev,
      [reelId]: ''
    }));
  };

  // Filter reels corresponding to selected VIP Level
  const activeReelsList = reels.filter(reel => reel.vipLevel === activeTab);

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-black p-6 shadow-xl relative overflow-hidden select-none">
      
      {/* Hidden audio element triggers music clips for reels */}
      <audio ref={audioRef} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-white/5 pb-4">
        <div className="text-left">
          <p className="text-[10px] font-mono tracking-widest text-[#39FF14] uppercase">Tappmusic Reels</p>
          <h3 className="text-lg font-black text-white flex items-center gap-1.5 pt-0.5">
            <Flame className="h-4 w-4 text-purple-400 animate-pulse" /> Clips Exclusivos
          </h3>
        </div>

        {/* Mute button container */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg bg-[#302138] hover:bg-[#402e4d] px-3 py-1.5 text-xs text-purple-300 font-bold font-mono transition-all uppercase cursor-pointer"
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          <span>{isMuted ? 'Silenciado' : 'Sonido Activado'}</span>
        </button>
      </div>

      {/* Selector VIP Tabs */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-6">
        {(['VIP 1', 'VIP 2', 'VIP 3', 'VIP 4'] as VipLevel[]).map(lvl => {
          const isActive = activeTab === lvl;
          const isUserLevel = currentVip === lvl;

          return (
            <button
              key={lvl}
              onClick={() => setActiveTab(lvl)}
              className={`py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border relative flex flex-col items-center justify-center leading-tight uppercase ${
                isActive
                  ? 'bg-gradient-to-tr from-purple-900/40 to-yellow-500/10 text-white border-purple-500'
                  : 'bg-black text-gray-500 border-white/10 hover:border-white/20'
              }`}
            >
              <span>{lvl}</span>
              {isUserLevel && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List/Carousel of Reels matching the selected Level */}
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
        {activeReelsList.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-xs font-mono">
            No hay reels activos para este nivel en este momento.
          </div>
        ) : (
          activeReelsList.map(reel => {
            const isPlaying = playingReelId === reel.id;
            const reelComments = comments[reel.id] || [];

            return (
              <div 
                key={reel.id} 
                className="rounded-2xl border border-white/5 bg-zinc-950/40 p-4 grid grid-cols-1 md:grid-cols-12 gap-5 animate-slide-up relative"
              >
                {/* Visual Video Cover (Left md:col-span-5) */}
                <div className="md:col-span-5 relative h-64 md:h-72 rounded-xl overflow-hidden border border-white/10 bg-black group shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={reel.coverUrl}
                    alt={reel.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Backdrop Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-95" />

                  {/* Core Floating Controls with state indicators */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => handleTogglePlayReel(reel)}
                      className={`h-14 w-14 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all outline-none border border-white/20 ${
                        isPlaying 
                          ? 'bg-purple-900/60 shadow-[0_0_20px_#a855f7]' 
                          : 'bg-black/80 hover:bg-black'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6 animate-pulse" />
                      ) : (
                        <Play className="h-6 w-6 ml-1 text-yellow-400" />
                      )}
                    </button>
                  </div>

                  {/* Animated music equalizer bar when loop snippet is playing */}
                  {isPlaying && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#39FF14] bg-black/80 px-2.5 py-1.5 rounded-lg border border-[#39FF14]/20 backdrop-blur-sm">
                      <span className="flex items-center gap-1.5 truncate">
                        <Music className="h-3.5 w-3.5 animate-spin" /> {reel.title}
                      </span>
                      <div className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 h-full bg-neon-green animate-bounce" />
                        <span className="w-0.5 h-2 bg-neon-green animate-bounce [animation-delay:0.2s]" />
                        <span className="w-0.5 h-1.5 bg-neon-green animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  {/* Top floating VIP Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/80 border border-purple-500/30 text-purple-300 font-black font-mono text-[9px] uppercase px-2 py-1 rounded-md tracking-wider">
                    <Award className="h-3 w-3 text-yellow-500" />
                    <span>{reel.vipLevel}</span>
                  </div>
                </div>

                {/* Info and Interactions Panel (Right md:col-span-7) */}
                <div className="md:col-span-7 flex flex-col justify-between text-left space-y-4">
                  <div>
                    {/* Caption area */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-mono text-purple-400 font-bold mb-1">@{reel.artist}</p>
                      <h4 className="text-xs font-black text-white leading-snug">{reel.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-normal">{reel.caption}</p>
                    </div>

                    {/* Likes & Comments Counters */}
                    <div className="flex items-center gap-4 py-2 mt-2 border-y border-white/5 text-xs font-mono font-bold text-gray-400">
                      <button
                        onClick={() => handleLikeReel(reel.id)}
                        className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                          reel.hasLiked ? 'text-red-500' : 'hover:text-white'
                        }`}
                      >
                        <Heart className={`h-4.5 w-4.5 ${reel.hasLiked ? 'fill-current' : ''}`} />
                        <span>{reel.likes} Likes</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="h-4.5 w-4.5 text-purple-400" />
                        <span>{reelComments.length} comentarios</span>
                      </div>
                    </div>

                    {/* Interactive Sub-thread Comments */}
                    <div className="pt-3 space-y-2 max-h-[140px] overflow-y-auto mt-2">
                      {reelComments.length === 0 ? (
                        <p className="text-[10px] text-gray-500 italic pb-2">Sé el primero en comentar este reel...</p>
                      ) : (
                        reelComments.map((com, index) => (
                          <div key={index} className="text-[11px] leading-relaxed bg-black/40 p-2 rounded-lg border border-white/5">
                            <div className="flex items-center justify-between font-mono font-bold">
                              <span className="text-[#39FF14]">@{com.username}</span>
                              <span className="text-[9px] text-gray-600 font-normal">{com.time}</span>
                            </div>
                            <p className="text-gray-300 mt-0.5">{com.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Comment input form */}
                  <div className="flex gap-2 border-t border-white/5 pt-3">
                    <input
                      type="text"
                      placeholder="Comentar reel..."
                      value={newCommentText[reel.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewCommentText(prev => ({
                          ...prev,
                          [reel.id]: val
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePostComment(reel.id);
                      }}
                      className="flex-1 text-xs bg-black/60 border border-white/10 rounded-xl pl-3 pr-2 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handlePostComment(reel.id)}
                      className="h-8 w-8 rounded-lg bg-purple-900/40 hover:bg-purple-900 border border-purple-500/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5 text-purple-300" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
