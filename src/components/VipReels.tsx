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
  const [activeTab, setActiveTab] = useState<VipLevel>('VIP ORO 10$');
  
  // Track active playing reel ID
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

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
  
  // Ref to hold the active speech utterance
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<any[]>([]);

  const stopAmbientSynth = () => {
    if (synthNodesRef.current.length > 0) {
      synthNodesRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
        try { node.disconnect(); } catch (e) {}
      });
      synthNodesRef.current = [];
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const startAmbientSynth = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      stopAmbientSynth();
      
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      
      // Soothing warm triadic Cmajor background pad (C3, E3, G3 base notes)
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(130.81, ctx.currentTime);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(164.81, ctx.currentTime);
      
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(196.00, ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(290, ctx.currentTime); // filter out buzzing treble
      
      // Extremely soft ambient loop backing pad
      gainNode.gain.setValueAtTime(isMuted ? 0 : 0.07, ctx.currentTime);
      
      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc3.start();
      
      synthNodesRef.current = [osc1, osc2, osc3, filter, gainNode];
    } catch (e) {
      console.warn("Auto-ambient block avoided:", e);
    }
  };

  const stopVoiceover = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const startVoiceover = (title: string, caption: string, artist: string, category?: string) => {
    stopVoiceover();
    if (typeof window !== 'undefined' && window.speechSynthesis && !isMuted) {
      // If it's a music video, let the real audio play unmodified without speaking over it!
      if (category === 'Video Musical') {
        if (audioRef.current && !isMuted) {
          audioRef.current.volume = 0.95; // Let the full song play nicely
        }
        return;
      }

      // 1. Build a highly spiritual, majestic or motivating narration text
      let finalSpeechText = "";
      const cleanArtist = artist.replace(/^@/, ''); // Natural name reading instead of "@" technical symbol

      if (category === 'Video de Fe' || category === 'Voz de Dios') {
        finalSpeechText = `Mensaje de Fe Celestial. El Dios Todopoderoso y Jesucristo de Nazaret te proclaman para tu vida hoy: "${caption}". Amén y bendiciones hoy y siempre.`;
      } else if (category === 'Familia') {
        finalSpeechText = `Mensaje bendecido para la Familia y el Hogar Sagrado de parte del hermano ${cleanArtist}: "${caption}".`;
      } else if (category === 'Mentalidad') {
        finalSpeechText = `Declaración de Mentalidad Millonaria y el camino al Éxito, para el Nivel VIP: "${title}". Recuerda y graba esta regla de oro: "${caption}". Éxito rotundo.`;
      } else {
        finalSpeechText = `Mensaje de ${title}. Presentado con poder por ${cleanArtist}: "${caption}".`;
      }

      // Clean emojis and symbols for elegant text narration
      const cleaned = finalSpeechText
        .replace(/#/g, '')
        .replace(/🕊️|❤️|🏠|📈|💼|✨|🙌|✝️|🔥|🛡️|👑|💎|🌟|🌍/g, '');

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'es-MX'; // Deep Latin American accent
      
      const voices = window.speechSynthesis.getVoices();
      // Look for beautiful Spanish/Latin voices
      const spanishVoices = voices.filter(v => v.lang.startsWith('es-MX') || v.lang.startsWith('es-ES') || v.lang.startsWith('es-') || v.lang.startsWith('es'));
      
      // Look for neural or high-quality google ones
      let chosenVoice = spanishVoices.find(v => 
        v.name.toLowerCase().includes('google') || 
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('neural')
      );

      // Preferred deep registers for divine/authority preaching
      if (category === 'Video de Fe' || category === 'Voz de Dios' || category === 'Mentalidad') {
        const maleVoice = spanishVoices.find(v => 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('hombre') || 
          v.name.toLowerCase().includes('jorge') || 
          v.name.toLowerCase().includes('david') || 
          v.name.toLowerCase().includes('juan')
        );
        if (maleVoice) {
          chosenVoice = maleVoice;
        }
      }

      const finalVoice = chosenVoice || spanishVoices[0] || voices[0];
      if (finalVoice) {
        utterance.voice = finalVoice;
      }

      // Customize rates and pitches for specialized preaching / teaching / motivational flows
      if (category === 'Video de Fe' || category === 'Voz de Dios') {
        utterance.rate = 0.69; // Extremely slow, majestic, and heavy sermon tempo
        utterance.pitch = 0.72; // Warm, authoritative, divine bass tone
      } else if (category === 'Familia') {
        utterance.rate = 0.82; // Warm, loving pacing
        utterance.pitch = 0.95; // Friendly and wise parental tone
      } else if (category === 'Mentalidad') {
        utterance.rate = 0.78; // Deep, powerful magnetic tempo
        utterance.pitch = 0.88; // Deep, rich and confident entrepreneur coach register
      } else {
        utterance.rate = 0.84;
        utterance.pitch = 0.95;
      }

      utterance.onstart = () => {
        if (audioRef.current && !isMuted) {
          audioRef.current.volume = 0.12; // Lower overlay level so background beat plays beautifully behind the words
        }
      };

      utterance.onend = () => {
        // Boost music volume nicely once the narration is complete
        if (audioRef.current && !isMuted) {
          audioRef.current.volume = 0.50;
        }
      };

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Play audio snippet when reel gets active and clicked
  const handleTogglePlayReel = (reel: Reel) => {
    if (playingReelId === reel.id) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopVoiceover();
      stopAmbientSynth();
      setPlayingReelId(null);
    } else {
      // Play new
      setPlayingReelId(reel.id);
      if (audioRef.current) {
        audioRef.current.src = reel.videoUrl;
        audioRef.current.loop = true;
        // Keep background loop clearly audible
        audioRef.current.volume = isMuted ? 0 : 0.22;
        audioRef.current.play().catch(err => {
          console.warn("Autoplay block averted on reel:", err);
        });
      }
      // Start the dynamic offline backing synth loop
      startAmbientSynth();
      // Voice narration trigger
      startVoiceover(reel.title, reel.caption, reel.artist, reel.category);
    }
  };

  // Keep volume/mute settings active on audio trigger change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.22;
    }
    
    // Sync the synthesizer backing drone volume dynamically with mute state
    if (synthNodesRef.current.length > 0) {
      const gainNode = synthNodesRef.current[synthNodesRef.current.length - 1];
      if (gainNode) {
        try {
          gainNode.gain.setValueAtTime(isMuted ? 0 : 0.07, audioCtxRef.current?.currentTime || 0);
        } catch (e) {}
      }
    }

    if (isMuted) {
      stopVoiceover();
    } else if (playingReelId) {
      const activeReel = reels.find(r => r.id === playingReelId);
      if (activeReel) {
        startVoiceover(activeReel.title, activeReel.caption, activeReel.artist, activeReel.category);
      }
    }
  }, [isMuted]);

  // Clean up sound on unmount and ensure voiceover stops
  useEffect(() => {
    // Warm up voice list
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopVoiceover();
      stopAmbientSynth();
    };
  }, []);

  // Force stop sounds and speeches when tab switches
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopVoiceover();
    stopAmbientSynth();
    setPlayingReelId(null);
  }, [activeTab]);

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

  // Filter reels corresponding to selected VIP Level and Category
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo');

  const activeReelsList = reels.filter(reel => {
    const matchesVip = reel.vipLevel === activeTab;
    const matchesCategory = selectedCategory === 'Todo' || reel.category === selectedCategory;
    return matchesVip && matchesCategory;
  });

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
          className={`self-start sm:self-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold font-mono transition-all uppercase cursor-pointer border ${
            !isMuted 
              ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30 shadow-[0_0_12px_rgba(57,255,20,0.25)]' 
              : 'bg-[#302138] border-purple-500/10 text-purple-300'
          }`}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          <span>{isMuted ? 'Mudo (Haz clic para activar voz)' : 'Voz Real Activa'}</span>
        </button>
      </div>

      {/* Guide Banner for voiceover and register option */}
      <div className="mb-6 rounded-xl border border-[#39FF14]/20 bg-emerald-950/20 p-4 text-left space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500 animate-bounce" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Guía de Voces y Acceso VIP:</h4>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-300">
          Para cantar y proclamar en voz alta los versículos, testimonios y afirmaciones de <strong className="text-[#39FF14]">DIOS, FAMILIA Y MENTALIDAD MILLONARIA</strong>, haz clic arriba en <strong className="text-white">Voz Real Activa</strong> y luego dale al botón <strong className="text-purple-400">Play (▶)</strong> de cualquiera de las Reels. Escucharás una narración solemne en vivo.
        </p>
        <p className="text-[11px] leading-relaxed text-gray-400 pt-1 border-t border-white/5">
          🔑 <strong className="text-white">¿Quieres crear otro usuario o ver la pantalla de Registro vacía?</strong> Simplemente haz clic en el botón <strong className="text-red-500 font-black uppercase">Salir</strong> ubicado en la esquina superior derecha para cerrar sesión y volver al formulario de registro limpio en cualquier enlace.
        </p>
      </div>

      {/* Selector VIP Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 mb-6">
        {([
          'VIP PLATA 10$', 
          'VIP ORO 20$', 
          'VIP RUBÍ 40$', 
          'VIP DIAMANTE 120$', 
          'VIP PLATINO 420$', 
          'VIP CORONA IMPERIAL 1000$'
        ] as VipLevel[]).map(lvl => {
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

      {/* Category selection pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 pt-1 mb-2 scrollbar-none no-scrollbar">
        {['Todo', 'Video de Fe', 'Voz de Dios', 'Familia', 'Mentalidad', 'Video Musical'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`py-1.5 px-3 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] border-purple-500'
                : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 border-white/5'
            }`}
          >
            {cat === 'Todo' ? '🔥 Todo' : cat === 'Video de Fe' ? '🕊️ Fe' : cat === 'Voz de Dios' ? '⚡ Dios' : cat === 'Familia' ? '🏠 Familia' : cat === 'Mentalidad' ? '💎 Mentalidad' : '🎵 Música'}
          </button>
        ))}
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
