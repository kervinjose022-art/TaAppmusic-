import { useState, useEffect, useRef } from 'react';
import { Check, Flame, Trophy, Coins, ChevronRight, Lock, Play, Cpu, Sparkles, Volume2, VolumeX, X, Disc, Tv } from 'lucide-react';
import { UserTask, UserProfile, VipLevel } from '../types';
import { TASKS_DATABASE, REELS_DATABASE } from '../data';

interface VipTasksProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
}

export default function VipTasks({ userProfile, setUserProfile }: VipTasksProps) {
  const [tasks, setTasks] = useState<UserTask[]>(() => {
    // Check if task IDs already stored in user profile to mark as completed
    return TASKS_DATABASE.map(task => ({
      ...task,
      isCompleted: userProfile.completedTaskIds.includes(task.id)
    }));
  });

  const [activeTab, setActiveTab] = useState<'disponibles' | 'completadas'>('disponibles');
  
  // Custom interactive countdown player states
  const [activeTask, setActiveTask] = useState<UserTask | null>(null);
  const [activeReel, setActiveReel] = useState<any | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(25);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [rewardClaimable, setRewardClaimable] = useState(false);
  const [activeVoiceKey, setActiveVoiceKey] = useState<string>('dios');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const VOICE_THEMES = [
    {
      key: 'jesus',
      speaker: 'Jesucristo Salvador',
      avatar: '✝️',
      description: 'Voz Sagrada de Redención y Amor',
      intro: 'Hijo mío, recibe mi paz protectora. Anda, contempla esta promesa y compártela: ',
      color: 'border-purple-500/30 text-purple-300 bg-purple-500/5',
      badgeColor: 'bg-purple-950/40 text-purple-300 border-purple-500/30',
      shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      pitch: 1.02,
      rate: 0.82
    },
    {
      key: 'dios',
      speaker: 'Dios Padre Celestial',
      avatar: '🌿',
      description: 'Voz Omnipotente, Calma y Solemne',
      intro: 'Yo soy tu refugio en la tormenta. Escucha con reverencia mi mensaje sagrado para ti: ',
      color: 'border-amber-500/30 text-amber-300 bg-amber-500/5',
      badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      pitch: 0.84,
      rate: 0.75
    },
    {
      key: 'familia',
      speaker: 'La Voz de la Familia',
      avatar: '🏠',
      description: 'Voz de Unión, Pureza y Valores',
      intro: 'Edifica tu bendito hogar sobre la roca del amor. Este es el consejo protector para tu mesa: ',
      color: 'border-pink-500/30 text-pink-300 bg-pink-500/5',
      badgeColor: 'bg-pink-950/40 text-pink-300 border-pink-500/30',
      shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
      pitch: 1.14,
      rate: 0.88
    },
    {
      key: 'mentalidad',
      speaker: 'Mentalidad Millonaria de Reino',
      avatar: '💎',
      description: 'Voz Inspiradora de Éxito y Provisión',
      intro: '¡Declara abundancia en el nombre del Creador! Rompe la escasez y recibe tu prosperidad: ',
      color: 'border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/5',
      badgeColor: 'bg-zinc-900 text-[#39FF14] border-[#39FF14]/40',
      shadow: 'shadow-[0_0_15px_rgba(57,255,20,0.3)]',
      pitch: 1.0,
      rate: 0.94
    }
  ];

  const stopVoiceover = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const startVoiceover = (text: string, voiceTheme: typeof VOICE_THEMES[0]) => {
    stopVoiceover();
    if (typeof window !== 'undefined' && window.speechSynthesis && !isAudioMuted) {
      const cleaned = text
        .replace(/#/g, ' hashtag ')
        .replace(/🕊️|❤️|🏠|📈|💼|✨|🙌|✝️|🔥|🛡️|👑|💎|🌟|🌍/g, '');

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'es-MX';
      
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.startsWith('es-MX') || v.lang.startsWith('es-ES') || v.lang.startsWith('es-')) || voices[0];
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.rate = voiceTheme.rate;
      utterance.pitch = voiceTheme.pitch;

      utterance.onstart = () => {
        if (audioRef.current && !isAudioMuted) {
          audioRef.current.volume = 0.03; // Duck general music sounds during vocal speech
        }
      };

      utterance.onend = () => {
        if (audioRef.current && !isAudioMuted) {
          audioRef.current.volume = 0.15; // Restore normal theme backing track
        }
      };

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter tasks based on selected tab & matching user's exact VIP requirement
  const currentFilteredTasks = tasks.filter(task => {
    const isCompleted = userProfile.completedTaskIds.includes(task.id);
    const matchesTab = activeTab === 'completadas' ? isCompleted : !isCompleted;
    return matchesTab;
  });

  // VIP numbers to check locker status
  const VIP_RANK_MAPPING: Record<VipLevel, number> = {
    'VIP PLATA 10$': 1,
    'VIP ORO 20$': 2,
    'VIP RUBÍ 40$': 3,
    'VIP DIAMANTE 120$': 4,
    'VIP PLATINO 420$': 5,
    'VIP CORONA IMPERIAL 1000$': 6,
  };
  const getVipRank = (level: VipLevel) => VIP_RANK_MAPPING[level] || 1;
  const userVipRank = getVipRank(userProfile.vipLevel);

  // Core handler: Click to "Hacer Tarea" (Do Task) with fancy simulated loader
  const handlePerformTask = (task: UserTask) => {
    const requiredRank = getVipRank(task.vipRequired);
    
    // Guard of VIP level
    if (userVipRank < requiredRank) {
      alert(`⚠️ Esta tarea requiere nivel ${task.vipRequired} o superior. ¡Por favor mejora tu nivel VIP en el selector o regístrate para iniciar!`);
      return;
    }

    // Direct interactive video correspondientes lookup based on task's required level
    const matchedReel = REELS_DATABASE.find(r => r.vipLevel === task.vipRequired) || REELS_DATABASE[0];

    // Detect ideal default voice thematic category
    const titleLower = task.title.toLowerCase();
    const descLower = task.description.toLowerCase();
    const isJesus = titleLower.includes('jesús') || titleLower.includes('cristo') || descLower.includes('jesús') || descLower.includes('cristo');
    const isMentalidad = task.category === 'Mentalidad' || titleLower.includes('millonaria') || titleLower.includes('disciplina') || descLower.includes('millonaria') || titleLower.includes('riqueza') || titleLower.includes('finanzas');
    const isFamilia = task.category === 'Familia' || titleLower.includes('familia') || descLower.includes('familia') || titleLower.includes('padre') || titleLower.includes('hogar');
    
    let defaultVoice = 'dios';
    if (isJesus) defaultVoice = 'jesus';
    else if (isMentalidad) defaultVoice = 'mentalidad';
    else if (isFamilia) defaultVoice = 'familia';

    setActiveVoiceKey(defaultVoice);
    setActiveTask(task);
    setActiveReel(matchedReel);
    setSecondsLeft(25);
    setRewardClaimable(false);
    setIsAudioMuted(false);
  };

  // Timer countdown count
  useEffect(() => {
    let timer: any = null;
    if (activeTask && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setRewardClaimable(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTask, secondsLeft]);

  // Audio stream control
  useEffect(() => {
    if (activeTask && activeReel) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = activeReel.videoUrl;
      audioRef.current.loop = true;
      audioRef.current.muted = isAudioMuted;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log("Reproducción automática esperando acción del usuario", err);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeTask, activeReel]);

  // Sync mute and voiceover speaker trigger based on selected vocal theme
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isAudioMuted;
    }
    if (isAudioMuted) {
      stopVoiceover();
    } else if (activeTask && activeReel) {
      const theme = VOICE_THEMES.find(t => t.key === activeVoiceKey) || VOICE_THEMES[0];
      const narrativeText = `${theme.intro} ${activeTask.title}. Mensaje de fe: ${activeReel.title}. Revelación: ${activeReel.caption}`;
      startVoiceover(narrativeText, theme);
    } else {
      stopVoiceover();
    }
  }, [isAudioMuted, activeTask, activeReel, activeVoiceKey]);

  // Stop sounds and voiceovers on unmount
  useEffect(() => {
    return () => {
      stopVoiceover();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleClaimReward = () => {
    if (!activeTask) return;
    
    const payout = activeTask.rewardValue;
    
    setUserProfile(prev => {
      if (prev.completedTaskIds.includes(activeTask.id)) return prev;
      
      const updatedIds = [...prev.completedTaskIds, activeTask.id];
      const updatedEarnings = prev.earnings + payout;

      return {
        ...prev,
        completedTaskIds: updatedIds,
        earnings: Number(updatedEarnings.toFixed(2))
      };
    });

    setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, isCompleted: true } : t));
    
    // Stop and cleanup
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setActiveTask(null);
    setActiveReel(null);
    setSecondsLeft(25);
    setRewardClaimable(false);
  };

  const handleCancelTask = () => {
    if (confirm("¿Estás seguro de cancelar? Se perderá el avance actual de esta tarea.")) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActiveTask(null);
      setActiveReel(null);
      setSecondsLeft(25);
      setRewardClaimable(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#39FF14]/20 bg-black p-6 shadow-xl relative overflow-hidden select-none">
      
      {/* Wallet / Balance Board */}
      <div className="grid grid-cols-2 gap-4 mb-6 border-b border-[#39FF14]/10 pb-5">
        <div className="text-left">
          <p className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">Billetera TaApp</p>
          <div className="flex items-center gap-1.5 pt-1 uppercase">
            <Coins className="h-4.5 w-4.5 text-yellow-400 animate-pulse" />
            <span className="text-2xl font-black text-white font-mono tracking-tight glow-text text-neon-green">
              {userProfile.earnings.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[#39FF14] font-bold self-end mb-1">MONEDAS</span>
          </div>
        </div>

        <div className="text-left border-l border-white/5 pl-4">
          <p className="text-[10px] font-mono tracking-widest text-[#39FF14] uppercase">Rango Activo</p>
          <div className="flex items-center gap-1 pt-1.5 font-bold text-white uppercase text-xs">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>Nivel {userProfile.vipLevel}</span>
          </div>
        </div>
      </div>

      {/* Tabs configuration */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('disponibles')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer ${
            activeTab === 'disponibles'
              ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          Disponibles ({tasks.filter(t => !userProfile.completedTaskIds.includes(t.id)).length})
        </button>

        <button
          onClick={() => setActiveTab('completadas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer ${
            activeTab === 'completadas'
              ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          Completadas ({userProfile.completedTaskIds.length})
        </button>
      </div>

      {/* Tasks Render lists */}
      {currentFilteredTasks.length === 0 ? (
        <div className="py-12 text-center text-gray-600 font-mono text-xs">
          {activeTab === 'disponibles' 
            ? '¡Excelente! Has completado todas las tareas disponibles de tu VIP.'
            : 'Aún no posees tareas completadas. ¡Haz click en "Hacer tarea" para ganar regalías!'}
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {currentFilteredTasks.map(task => {
            const requiredRank = getVipRank(task.vipRequired);
            const isLocked = userVipRank < requiredRank;

            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border transition-all text-left group ${
                  task.isCompleted
                    ? 'border-zinc-800 bg-zinc-950/40 opacity-70'
                    : isLocked
                    ? 'border-red-950 bg-red-950/10'
                    : 'border-[#39FF14]/15 bg-zinc-950/25 hover:border-[#39FF14]/30'
                }`}
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase border border-[#39FF14]/20 bg-[#39FF14]/5 text-[#39FF14]">
                      {task.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase border ${
                      task.vipRequired === 'VIP CORONA IMPERIAL 1000$' 
                        ? 'border-emerald-550/40 text-[#39FF14] bg-emerald-500/5 font-black animate-pulse' 
                        : task.vipRequired === 'VIP PLATINO 420$'
                        ? 'border-purple-500/30 text-purple-300 bg-purple-500/5'
                        : task.vipRequired === 'VIP DIAMANTE 120$'
                        ? 'border-sky-500/30 text-sky-400 bg-sky-500/5'
                        : task.vipRequired === 'VIP RUBÍ 40$'
                        ? 'border-red-500/30 text-red-400 bg-red-400/5'
                        : task.vipRequired === 'VIP ORO 20$'
                        ? 'border-yellow-400/35 text-yellow-300 bg-yellow-400/5'
                        : 'border-zinc-500/35 text-zinc-300 bg-zinc-500/5'
                    }`}>
                      {task.vipRequired}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">{task.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">{task.description}</p>
                </div>

                <div className="mt-3.5 sm:mt-0 w-full sm:w-auto shrink-0 flex items-center justify-between sm:justify-start gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-gray-500 font-mono leading-none">RECOMPENSA</p>
                    <p className="text-md font-extrabold text-[#39FF14] font-mono mt-1">+{task.rewardValue.toLocaleString()} monedas</p>
                  </div>

                  {task.isCompleted ? (
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : isLocked ? (
                    <div className="rounded-xl bg-red-950/30 border border-red-500/20 px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-red-400 font-mono font-bold">
                      <Lock className="h-3.5 w-3.5" />
                      <span>BLOQUEADO</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePerformTask(task)}
                      disabled={!!activeTask}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-[#39FF14] bg-[#39FF14]/5 hover:bg-[#39FF14]/20 text-[10px] font-bold font-mono text-[#39FF14] px-4 transition-all uppercase cursor-pointer disabled:opacity-50 active:scale-95 shadow-[0_0_8px_rgba(57,255,20,0.15)]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Hacer tarea</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tip Box */}
      <div className="mt-5 p-3.5 rounded-xl border border-[#39FF14]/10 bg-[#39FF14]/5 text-left text-[11px] text-[#39FF14]/90 leading-relaxed font-mono">
        💎 <span className="font-bold">CONSEJO VIP:</span> Desbloquea niveles superiores usando el panel de registro superior para multiplicar tu balance y sintonizar tareas de hasta 1,835 monedas cada una.
      </div>

      {/* NEW INTERACTIVE FULLSCREEN COUNTDOWN TASK PLAYER DIALOG */}
      {activeTask && activeReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-[#39FF14] bg-zinc-950 p-6 flex flex-col space-y-4 shadow-[0_0_50px_rgba(57,255,20,0.25)] text-center relative overflow-hidden">
            
            {/* Ambient gold glow in player */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full bg-yellow-500/10 blur-xl pointer-events-none" />

            {/* Header / Badges */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-mono font-bold text-[#39FF14] tracking-widest uppercase flex items-center gap-1 animate-pulse">
                <Cpu className="h-3.5 w-3.5 animate-spin" /> Tarea Activa {activeTask.vipRequired}
              </span>
              <button 
                onClick={handleCancelTask}
                className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-all flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                title="Cancelar Tarea"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Active Video/Reel representation Cover */}
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between p-4 bg-cover bg-center"
                 style={{ backgroundImage: `url(${activeReel.coverUrl})` }}>
              
              {/* Dark film tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/60 z-0" />

              {/* Top Bar inside the Player */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="px-2.5 py-0.5 rounded bg-black/65 border border-purple-550/30 text-[9px] font-mono text-purple-300 font-extrabold uppercase">
                  @{activeReel.artist}
                </span>

                {/* Styled Mute Button */}
                <button
                  type="button"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="h-8 w-8 rounded-full bg-black/75 border border-white/15 text-white hover:bg-black flex items-center justify-center cursor-pointer transition-all active:scale-90"
                >
                  {isAudioMuted ? <VolumeX className="h-4.5 w-4.5 text-zinc-400" /> : <Volume2 className="h-4.5 w-4.5 text-[#39FF14] animate-pulse" />}
                </button>
              </div>

              {/* Spinning Disc visual centerpiece */}
              <div className="relative z-10 flex flex-col items-center justify-center py-6">
                <div className="relative">
                  <div className="h-28 w-28 rounded-full ring-4 ring-[#39FF14]/20 bg-cover bg-center animate-spin"
                       style={{ 
                         backgroundImage: `url(${activeReel.coverUrl})`,
                         animationDuration: '6s' 
                       }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-black border border-white/15 flex items-center justify-center">
                      <Disc className="h-5 w-5 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                </div>
                
                {/* Visual Audio Wave beats representation */}
                <div className="flex items-center gap-1 mt-5 h-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#39FF14] rounded-full animate-bounce"
                      style={{
                        height: `${Math.floor(Math.random() * 16) + 6}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.4 + Math.random() * 0.5}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Quote inside the Player */}
              <div className="relative z-10 text-left space-y-1.5 bg-black/60 p-3 rounded-xl border border-white/5 backdrop-blur-xs">
                <h5 className="text-white text-xs font-black truncate">{activeReel.title}</h5>
                <p className="text-[10px] text-zinc-300 leading-normal line-clamp-2 italic">
                  "{activeReel.caption}"
                </p>
              </div>
            </div>

            {/* THEMATIC NARRATOR VOICE SELECTION TABS */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 space-y-2 text-left relative z-10">
              <span className="text-[9px] font-mono font-bold text-gray-500 tracking-wider uppercase">
                🎙️ Voces Reales de Fe (Sermones y Éxito)
              </span>
              
              {/* Speaker selection cards */}
              <div className="grid grid-cols-4 gap-1">
                {VOICE_THEMES.map((theme) => {
                  const isSelected = activeVoiceKey === theme.key;
                  return (
                    <button
                      key={theme.key}
                      onClick={() => {
                        setActiveVoiceKey(theme.key);
                        // Trigger immediate speak upon select gesture
                        const narrativeText = `${theme.intro} ${activeTask.title}. Mensaje del maestro: ${activeReel.title}. Revelación: ${activeReel.caption}`;
                        setIsAudioMuted(false);
                        startVoiceover(narrativeText, theme);
                      }}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[10px] font-bold font-mono transition-all cursor-pointer ${
                        isSelected 
                          ? `${theme.color} ring-1 ring-white/10 ${theme.shadow}`
                          : 'border-zinc-850 text-zinc-500 bg-zinc-950/20 hover:text-white'
                      }`}
                      title={theme.description}
                    >
                      <span className="text-sm mb-1">{theme.avatar}</span>
                      <span className="text-[8px] truncate max-w-full text-center">
                        {theme.key === 'mentalidad' ? 'Millonaria' : theme.key === 'familia' ? 'Familia' : theme.key === 'jesus' ? 'Jesús' : 'Dios'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Speaker Status Card & Manual Speech Reproducer */}
              {(() => {
                const currentTheme = VOICE_THEMES.find(t => t.key === activeVoiceKey) || VOICE_THEMES[0];
                return (
                  <div className="flex items-center justify-between gap-2.5 pt-1.5 border-t border-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-mono text-zinc-400 font-bold truncate">
                        Púlpito: <span className="text-white">{currentTheme.speaker}</span>
                      </p>
                      <p className="text-[8px] font-mono text-zinc-500 truncate leading-tight">
                        {currentTheme.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const narrativeText = `${currentTheme.intro} ${activeTask.title}. Mensaje de fe: ${activeReel.title}. Revelación: ${activeReel.caption}`;
                        setIsAudioMuted(false);
                        startVoiceover(narrativeText, currentTheme);
                      }}
                      className="px-2.5 py-1 rounded bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/20 text-[9px] font-black text-[#39FF14] font-mono uppercase tracking-wide cursor-pointer transition-all active:scale-95 shrink-0 flex items-center gap-1"
                    >
                      <span>🔊 Repetir Prédica</span>
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Countdown and progress bar indicators */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold px-1">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Tv className="h-3.5 w-3.5 text-purple-400" /> Reproducción del Evangelio
                </span>
                <span className="text-[#39FF14] font-black">
                  {secondsLeft > 0 ? `0:${secondsLeft < 10 ? '0' : ''}${secondsLeft}` : "¡Completado!"}
                </span>
              </div>

              {/* Timer Progress Bar */}
              <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-white/10 relative">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    rewardClaimable 
                      ? 'bg-gradient-to-r from-[#39FF14] to-emerald-400' 
                      : 'bg-gradient-to-r from-purple-600 to-yellow-500'
                  }`}
                  style={{ width: `${((25 - secondsLeft) / 25) * 100}%` }}
                />
              </div>

              {/* Help message status */}
              <p className="text-[10px] font-mono text-zinc-500">
                {secondsLeft > 0 
                  ? `Sintoniza tu fe. Por favor espera ${secondsLeft} segundos para validar la recompensa.`
                  : "¡Vídeo contemplado correctamente! Las regalías están listas para cosechar."}
              </p>
            </div>

            {/* Claim Reward Buttons row */}
            <div className="pt-2">
              {rewardClaimable ? (
                <button
                  onClick={handleClaimReward}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#39FF14] to-emerald-400 hover:from-emerald-400 hover:to-[#39FF14] text-xs font-black uppercase text-black font-sans tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(57,255,20,0.45)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] animate-pulse"
                >
                  <Sparkles className="h-4.5 w-4.5 text-black" />
                  <span>RECIBIR RECOMPENSA DE +{activeTask.rewardValue.toLocaleString()} MONEDAS</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wide cursor-not-allowed"
                >
                  <Lock className="h-4 w-4 text-zinc-600 animate-pulse" />
                  <span>Espera {secondsLeft}s segs para reclamar</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
