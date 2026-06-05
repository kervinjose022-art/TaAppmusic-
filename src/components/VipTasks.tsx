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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopVoiceover = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const startVoiceover = (text: string) => {
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

      utterance.rate = 0.85;
      utterance.pitch = 0.95;

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

  // Sync mute and voiceover speaker trigger
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isAudioMuted;
    }
    if (isAudioMuted) {
      stopVoiceover();
    } else if (activeTask && activeReel) {
      // Direct noble preaching/motivation speech synthesis voice trigger
      const narrativeText = `${activeTask.title}. Sermón y reflexión: ${activeReel.title}. Mensaje de fe: ${activeReel.caption}`;
      startVoiceover(narrativeText);
    } else {
      stopVoiceover();
    }
  }, [isAudioMuted, activeTask, activeReel]);

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
              ${userProfile.earnings.toFixed(2)}
            </span>
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
                    <p className="text-md font-extrabold text-[#39FF14] font-mono mt-1">+${task.rewardValue.toFixed(2)}</p>
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
        💎 <span className="font-bold">CONSEJO VIP:</span> Desbloquea niveles superiores usando el panel de registro superior para multiplicar tu balance y acceder a tareas de hasta $75.00 dólares cada una.
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
                  <span>RECIBIR RECOMPENSA DE +${activeTask.rewardValue.toFixed(2)} USD</span>
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
