import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, Flame, Trophy, Coins, ChevronRight, Lock, Play, Cpu, 
  Sparkles, Volume2, VolumeX, X, Disc, Tv, ArrowUpRight, Wallet, 
  ArrowRight, History, RefreshCw, Loader2 
} from 'lucide-react';
import { UserTask, UserProfile, VipLevel, Reel } from '../types';
import { TASKS_DATABASE, REELS_DATABASE } from '../data';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import WithdrawalCalendar from './WithdrawalCalendar';

const WITHDRAW_OPTIONS = [
  { coins: 3670, usdt: 5 },
  { coins: 7340, usdt: 10 },
  { coins: 11010, usdt: 15 },
  { coins: 36700, usdt: 50 },
  { coins: 146800, usdt: 200 },
  { coins: 367000, usdt: 500 }
];

interface VipTasksProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  withdrawHistory: any[];
  setWithdrawHistory: React.Dispatch<React.SetStateAction<any[]>>;
  voiceThemes?: any[];
  reels?: Reel[];
  withdrawConfig?: {
    enabled: boolean;
    allowedDays: number[];
    allowedDates: string[];
    allowedMonthDays?: number[];
  };
}

export default function VipTasks({ 
  userProfile, 
  setUserProfile, 
  withdrawHistory, 
  setWithdrawHistory,
  voiceThemes = [],
  reels = [],
  withdrawConfig = { enabled: true, allowedDays: [1, 5], allowedDates: [], allowedMonthDays: [10, 20, 30] }
}: VipTasksProps) {
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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<any[]>([]);

  // Pre-load and warm up Android TTS / Web Speech API voices at mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.getVoices();
        const handleVoices = () => {
          window.speechSynthesis.getVoices();
        };
        window.speechSynthesis.onvoiceschanged = handleVoices;
        return () => {
          if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
          }
        };
      } catch (err) {
        console.warn("TTS initialization warning:", err);
      }
    }
  }, []);

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
      gainNode.gain.setValueAtTime(isAudioMuted ? 0 : 0.07, ctx.currentTime);
      
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

  // --- WITHDRAWAL SYSTEM STATES ---
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [withdrawalNetwork, setWithdrawalNetwork] = useState<'BEP20' | 'PAGO_MOVIL'>('BEP20');
  const [pmPhone, setPmPhone] = useState('');
  const [pmCedula, setPmCedula] = useState('');
  const [pmBank, setPmBank] = useState('Banco de Venezuela (0102)');
  const [pmCustomBank, setPmCustomBank] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('3670');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');
  const [bypass10Days, setBypass10Days] = useState(false);

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError('');

    const amountVal = parseFloat(withdrawalAmount);
    if (isNaN(amountVal) || amountVal < 3670) {
      setWithdrawalError('El retiro mínimo es de 3670 monedas (5 USDT).');
      return;
    }

    if (userProfile.earnings < amountVal) {
      setWithdrawalError('Saldo de monedas insuficiente para retirar esta cantidad.');
      return;
    }

    let finalAddress = '';
    if (withdrawalNetwork === 'BEP20') {
      const trTrim = withdrawalAddress.trim();
      if (!trTrim) {
        setWithdrawalError('Introduce una dirección de destino USDT válida.');
        return;
      }
      if (!trTrim.startsWith('0x')) {
        setWithdrawalError('La dirección de retiro BEP-20 (BNB Chain) debe comenzar con la firma "0x". Ej: 0x9f...');
        return;
      }
      finalAddress = trTrim;
    } else {
      const pTrim = pmPhone.trim();
      const cTrim = pmCedula.trim();
      const chosenBank = pmBank === 'Otro' ? pmCustomBank.trim() : pmBank;
      
      if (!pTrim) {
        setWithdrawalError('Introduce el número de teléfono para el Pago Móvil.');
        return;
      }
      if (!cTrim) {
        setWithdrawalError('Introduce la cédula de identidad para el Pago Móvil.');
        return;
      }
      if (!chosenBank) {
        setWithdrawalError('Introduce o selecciona el banco receptor.');
        return;
      }
      finalAddress = `Pago Móvil: Tel: ${pTrim} • CI: ${cTrim} • Banco: ${chosenBank}`;
    }

    // Validate custom calendar date constraints unless bypass is checked
    if (withdrawConfig && withdrawConfig.enabled && !bypass10Days) {
      const today = new Date();
      const todayDayOfWeek = today.getDay(); // 0-6
      const todayDayOfMonth = today.getDate(); // 1-31
      const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const allowedMonthDays = withdrawConfig.allowedMonthDays !== undefined ? withdrawConfig.allowedMonthDays : [10, 20, 30];

      const isDayAllowed = withdrawConfig.allowedDays.includes(todayDayOfWeek);
      const isDateAllowed = withdrawConfig.allowedDates.includes(todayDateStr);
      const isMonthDayAllowed = allowedMonthDays.includes(todayDayOfMonth);
      
      if (!isDayAllowed && !isDateAllowed && !isMonthDayAllowed) {
        setWithdrawalError('La solicitud de retiro ha sido bloqueada porque hoy no es un día de retiro habilitado en el calendario virtual. Revisa las fechas en verde.');
        return;
      }
    }

    // Validate 10-day constraint unless bypass is checked
    if (!bypass10Days) {
      const lastWrd = withdrawHistory.find(w => w.status === 'Aprobado' || w.status === 'Pendiente');
      if (lastWrd && lastWrd.date) {
        try {
          // Date format: "03/06/2026 14:32"
          const parts = lastWrd.date.split(' ');
          const dateParts = parts[0].split('/');
          const timeParts = parts[1] ? parts[1].split(':') : ['00', '00'];
          
          const lastDate = new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[0]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1])
          );
          
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - lastDate.getTime());
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          
          if (diffDays < 10) {
            setWithdrawalError(`La normativa de Tappmusic.com exige esperar un lapso mínimo de 10 días entre retiros. Tu última solicitud fue el ${lastWrd.date} (hace ${diffDays.toFixed(1)} días).`);
            return;
          }
        } catch (err) {
          // Fallback if parsing fails
        }
      }
    }

    // Process simulation
    setIsSubmittingWithdrawal(true);
    
    setTimeout(() => {
      const generatedId = `TAPP-WD-${Math.floor(1000 + Math.random() * 9000)}`;
      const randomTxid = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const rawUsdt = Number((amountVal / 734).toFixed(2));
      const feeUsdt = Number((rawUsdt * 0.05).toFixed(2));
      const netUsdt = Number((rawUsdt - feeUsdt).toFixed(2));

      const newWithdrawal = {
        id: generatedId,
        username: userProfile.username,
        amountCoins: amountVal,
        amountUsdt: rawUsdt,
        feeUsdt: feeUsdt,
        netUsdt: netUsdt,
        address: finalAddress,
        network: withdrawalNetwork === 'BEP20' ? 'BEP20' : 'Pago Móvil',
        date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Pendiente', // starts as pending approval
        txid: randomTxid
      };

      // Write directly to our live real-time Firestore database!
      setDoc(doc(db, 'withdrawals', generatedId), newWithdrawal).catch(err => {
        console.error("Firestore submit withdrawal error:", err);
      });

      const updatedHistory = [newWithdrawal, ...withdrawHistory];
      setWithdrawHistory(updatedHistory);
      localStorage.setItem('tappmusic_withdrawals', JSON.stringify(updatedHistory));

      // Deduct from profile
      setUserProfile(prev => ({
        ...prev,
        earnings: Number((prev.earnings - amountVal).toFixed(2))
      }));

      setIsSubmittingWithdrawal(false);
      setWithdrawalSuccess(true);
      setWithdrawalAmount('3670'); // reset placeholder
      setPmPhone('');
      setPmCedula('');
      setWithdrawalAddress('');
      
      setTimeout(() => {
        setWithdrawalSuccess(false);
      }, 3500);

    }, 3000); // 3 sec delay
  };

  const REELS_POOL = reels && reels.length > 0 ? reels : REELS_DATABASE;

  const VOICE_THEMES = voiceThemes.length > 0 ? voiceThemes : [
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
      key: 'espiritu_santo',
      speaker: 'Espíritu Santo Consolador',
      avatar: '🕊️',
      description: 'Paz Absoluta y Unción Celestial',
      intro: 'Siente mi dulce presencia llenándote de fe y de abundancia celestial. Escucha esta palabra eterna: ',
      color: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/5',
      badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      pitch: 1.08,
      rate: 0.74
    },
    {
      key: 'angel',
      speaker: 'Ángel de la Revelación',
      avatar: '🌟',
      description: 'Mensajero Divino de Nuevas de Fe',
      intro: '¡Gloria a Dios en las alturas! Recibe la maravillosa promesa que tengo revelada para ti hoy: ',
      color: 'border-sky-500/30 text-sky-300 bg-sky-500/5',
      badgeColor: 'bg-sky-950/40 text-sky-300 border-sky-500/30',
      shadow: 'shadow-[0_0_15px_rgba(14,165,233,0.3)]',
      pitch: 1.15,
      rate: 0.85
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
      // Robust filtering of emojis, hashes, and non-alphanumeric text so TTS never says 'hashtag' or stutter-names emojis
      const cleaned = text
        .replace(/#/g, '')
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26EF]|\uD83E[\uDD10-\uDFFF]/g, '')
        .replace(/[^\x00-\x7F\u00C0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF.,;:!¿?¡\s]/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'es-MX';
      
      const voices = window.speechSynthesis.getVoices();
      const spanishVoices = voices.filter(v => v.lang.startsWith('es-MX') || v.lang.startsWith('es-ES') || v.lang.startsWith('es-') || v.lang.startsWith('es'));
      
      const maleKeywords = [
        'eed', 'dfz', 'esf', 'ycg', 'prd', 'isa', 'male', 'hombre', 'boy', 'jorge', 'david',
        'juan', 'diego', 'raul', 'raúl', 'carlos', 'santiago', 'mateo', 'julio', 'antonio',
        'alonso', 'enrique', 'miguel', 'pablo', 'pedro', 'tomas', 'tomás', 'francisco', 'guy'
      ];
      const femaleKeywords = [
        'female', 'mujer', 'girl', 'ana', 'sabina', 'helena', 'zira', 'pilar', 'lucia', 'lucía',
        'marisol', 'monica', 'mónica', 'paulina', 'soledad', 'carmit', 'bna', 'mma', 'lisa',
        'lorena', 'conchita'
      ];

      const isProbablyMale = (v: SpeechSynthesisVoice) => {
        const name = v.name.toLowerCase();
        const matchesMale = maleKeywords.some(kw => name.includes(kw));
        const matchesFemale = femaleKeywords.some(kw => name.includes(kw));
        if (matchesMale && !matchesFemale) return true;
        if (matchesFemale) return false;
        return false;
      };

      // Try male voice first if the theme asks for it
      let maleVoice = spanishVoices.find(isProbablyMale);
      if (!maleVoice && (voiceTheme.key === 'jesus' || voiceTheme.key === 'dios' || voiceTheme.key === 'mentalidad' || voiceTheme.key === 'espiritu_santo' || voiceTheme.key === 'angel')) {
        // Fallback: any voice that is not explicitly female
        maleVoice = spanishVoices.find(v => {
          const name = v.name.toLowerCase();
          return !femaleKeywords.some(kw => name.includes(kw));
        });
      }

      let chosenVoice = maleVoice || spanishVoices.find(v => v.name.toLowerCase().includes('google')) || spanishVoices[0] || voices[0];
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      // Dynamic custom rate & pitch override from voiceTheme configuration
      let finalRate = typeof voiceTheme.rate === 'number' ? voiceTheme.rate : 0.8;
      let finalPitch = typeof voiceTheme.pitch === 'number' ? voiceTheme.pitch : 1.0;

      // Pitch shifting to ultra-deep bass if we fell back to a female voice for solemn masculine categories
      if (voiceTheme.key === 'jesus' || voiceTheme.key === 'dios' || voiceTheme.key === 'mentalidad' || voiceTheme.key === 'espiritu_santo' || voiceTheme.key === 'angel') {
        const isFemale = chosenVoice ? femaleKeywords.some(kw => chosenVoice.name.toLowerCase().includes(kw)) : true;
        if (isFemale) {
          finalPitch = 0.65; // Warm, heavy sub-bass solemn sermon pitch
          finalRate = 0.72; // Make it slow and majestic
        }
      }

      utterance.rate = finalRate;
      utterance.pitch = finalPitch;

      utterance.onstart = () => {
        if (audioRef.current && !isAudioMuted) {
          audioRef.current.volume = 0.12; // Lower overlay level so background beat plays beautifully behind the words
        }
      };

      utterance.onend = () => {
        if (audioRef.current && !isAudioMuted) {
          audioRef.current.volume = 0.50; // Majestic full music on narration end
        }
      };

      speechUtteranceRef.current = utterance;
      try {
        // Resume in case speech synthesis is stuck or paused as a chromium webview quirk
        window.speechSynthesis.resume();
      } catch (e) {}
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter tasks based on selected tab & matching user's exact VIP requirement
  const currentFilteredTasks = tasks.filter(task => {
    const isCompleted = userProfile.completedTaskIds.includes(task.id);
    const matchesTab = activeTab === 'completadas' ? isCompleted : !isCompleted;
    const matchesVip = task.vipRequired === userProfile.vipLevel;
    return matchesTab && matchesVip;
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
    // Guard of verification status
    if (userProfile.status === 'pending') {
      alert(`⚠️ Tu cuenta está en modo gratuito para explorar la plataforma. Podrás realizar y cobrar estas tareas VIP una vez que tu depósito sea verificado y activado por el administrador (Hermanito Kervin).`);
      return;
    }

    // Guard of VIP level: Check exact level match
    if (task.vipRequired !== userProfile.vipLevel) {
      alert(`⚠️ Tu cuenta se encuentra en el rango ${userProfile.vipLevel}. Solo puedes realizar tareas correspondientes a tu nivel exacto.`);
      return;
    }

    // Direct interactive video correspondientes lookup based on task's required level
    const matchedReel = REELS_POOL.find(r => r.vipLevel === task.vipRequired) || REELS_POOL[0];

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
      if (audioRef.current) {
        audioRef.current.src = activeReel.videoUrl;
        audioRef.current.loop = true;
        audioRef.current.muted = isAudioMuted;
        audioRef.current.volume = isAudioMuted ? 0 : 0.22;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.log("Reproducción automática esperando acción del usuario", err);
        });
      }
      // Start the offline browser ambient synthesizer to overlay a warm backup pad
      startAmbientSynth();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopAmbientSynth();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopAmbientSynth();
    };
  }, [activeTask, activeReel]);

  // Sync mute and voiceover speaker trigger based on selected vocal theme
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isAudioMuted;
      audioRef.current.volume = isAudioMuted ? 0 : 0.22;
    }

    // Sync the local synthesis ambient gain node value!
    if (synthNodesRef.current.length > 0) {
      const gainNode = synthNodesRef.current[synthNodesRef.current.length - 1];
      if (gainNode) {
        try {
          gainNode.gain.setValueAtTime(isAudioMuted ? 0 : 0.07, audioCtxRef.current?.currentTime || 0);
        } catch (e) {}
      }
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
      stopAmbientSynth();
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
      <div className="grid grid-cols-2 gap-4 mb-6 border-b border-[#39FF14]/10 pb-5 items-center">
        <div className="text-left space-y-1.5">
          <p className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">Billetera TaApp</p>
          <div className="flex items-center gap-1.5 uppercase">
            <Coins className="h-4.5 w-4.5 text-yellow-400 animate-pulse" />
            <span className="text-2xl font-black text-white font-mono tracking-tight glow-text text-neon-green">
              {userProfile.earnings.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[#39FF14] font-bold self-end mb-1">MONEDAS</span>
          </div>

          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/30 hover:border-[#39FF14] text-[#39FF14] text-[9px] font-extrabold font-mono uppercase tracking-wider transition-all cursor-pointer active:scale-95"
          >
            <ArrowUpRight className="h-3 w-3 text-[#39FF14]" />
            <span>Retirar USDT</span>
          </button>
        </div>

        <div className="text-left border-l border-white/5 pl-4 flex flex-col justify-between py-1">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-[#39FF14] uppercase">Rango Activo</p>
            <div className="flex items-center gap-1 pt-1 font-bold text-white uppercase text-[11px] sm:text-xs">
              <Trophy className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
              <span className="truncate">{userProfile.vipLevel}</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 font-mono leading-none mt-2">
            Mínimo: 5 USDT (3670 monedas)
          </p>
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
          Disponibles ({tasks.filter(t => t.vipRequired === userProfile.vipLevel && !userProfile.completedTaskIds.includes(t.id)).length})
        </button>

        <button
          onClick={() => setActiveTab('completadas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer ${
            activeTab === 'completadas'
              ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          Completadas ({tasks.filter(t => t.vipRequired === userProfile.vipLevel && userProfile.completedTaskIds.includes(t.id)).length})
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
                        {theme.key === 'mentalidad' ? 'Millonaria' : theme.key === 'familia' ? 'Familia' : theme.key === 'jesus' ? 'Jesús' : theme.key === 'dios' ? 'Dios' : (theme.speaker.split(' ').slice(0, 2).join(' '))}
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

      {/* WITHDRAW MONEDAS / USDT MODAL DIALOG */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto animate-fade-in">
          
          {/* Floating always-visible close button outside the scrolling content card (perfect for physical devices) */}
          <div className="fixed top-4 right-4 z-55">
            <button 
              onClick={() => {
                if (!isSubmittingWithdrawal) {
                  setIsWithdrawOpen(false);
                  setWithdrawalError('');
                }
              }}
              disabled={isSubmittingWithdrawal}
              className="h-10 w-10 rounded-full bg-zinc-900/90 hover:bg-zinc-805 border border-white/10 flex items-center justify-center text-zinc-450 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-[#39FF14]/30 bg-black p-6 shadow-[0_0_50px_rgba(57,255,20,0.15)] text-center my-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            
            <div className="absolute top-5 right-5">
              <button 
                onClick={() => {
                  if (!isSubmittingWithdrawal) {
                    setIsWithdrawOpen(false);
                    setWithdrawalError('');
                  }
                }}
                disabled={isSubmittingWithdrawal}
                className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Header inside Modal */}
              <div className="flex flex-col items-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] mb-3">
                  <Wallet className="h-6 w-6 text-[#39FF14]" />
                </div>
                <h3 className="text-lg font-black tracking-widest text-white uppercase">Retirar Fondos VIP</h3>
                <p className="text-[11px] text-zinc-400 max-w-sm mt-1">
                  Convierte tus regalías acumuladas en USDT estables. El tiempo promedio de acreditación es de 5 a 15 minutos.
                </p>
              </div>

              {/* Stats boxes */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-white/5 text-left font-mono">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block tracking-wider">Saldo Disponible</span>
                  <span className="text-xl font-black text-white glow-text text-neon-green">
                    {userProfile.earnings.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-[#39FF14] font-bold ml-1.5 font-sans">Monedas</span>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <span className="text-[9px] text-zinc-500 uppercase block tracking-wider">Equivalente USDT</span>
                  <span className="text-xl font-black text-[#39FF14]">
                    ${(userProfile.earnings / 734).toFixed(2)}
                  </span>
                  <span className="text-[9px] text-zinc-400 ml-1.5 uppercase font-sans">USDT</span>
                </div>
              </div>

              {/* Render 4D Interactive Calendar of eligible withdrawal dates */}
              <WithdrawalCalendar mode="user" config={withdrawConfig} />

              {/* Submitting step */}
              {isSubmittingWithdrawal ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 text-[#39FF14] animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white uppercase tracking-wider font-mono">Firmando Retiro en Blockchain...</p>
                    <p className="text-xs text-zinc-550 font-mono animate-pulse">Sincronizando con redes descentralizadas. Por favor no cierres esta ventana.</p>
                  </div>
                </div>
              ) : withdrawalSuccess ? (
                <div className="py-8 p-4 rounded-2xl border border-emerald-500/25 bg-emerald-950/10 text-center space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 animate-bounce">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">¡Solicitud Enviada con Éxito!</h4>
                    <p className="text-xs text-zinc-400 font-mono mt-1 leading-relaxed">
                      Se han deducido las monedas correctas. Nuestra plataforma enviará tus fondos una vez aprobada la transacción automáticamente de 5 a 15 min. Consérvala en la lista inferior de retiros.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWithdrawOpen(false);
                      setWithdrawalSuccess(false);
                    }}
                    className="mt-4 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-mono font-bold text-[#39FF14] hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Cerrar Ventana de Retiros
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-left">
                  {/* Select Method / Network */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] font-bold block">
                      Método de Retiro
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawalNetwork('PAGO_MOVIL');
                          setWithdrawalError('');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold font-mono border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                          withdrawalNetwork === 'PAGO_MOVIL'
                            ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/50'
                            : 'bg-zinc-950 border-zinc-805 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="font-sans font-black flex items-center gap-1">🇻🇪 Pago Móvil</span>
                        <span className="text-[8px] opacity-80 font-mono text-center">Bolívares (Tasa Oficial)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawalNetwork('BEP20');
                          setWithdrawalError('');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold font-mono border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                          withdrawalNetwork === 'BEP20'
                            ? 'bg-purple-950/40 text-purple-400 border-purple-500/50'
                            : 'bg-zinc-950 border-zinc-805 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="font-sans font-black">USDT BEP-20</span>
                        <span className="text-[8px] opacity-80 font-mono text-center">Ecológico y Seguro</span>
                      </button>
                    </div>
                  </div>

                  {/* Form fields based on selection */}
                  {withdrawalNetwork === 'BEP20' ? (
                    /* BEP-20 Wallet Address Form */
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block font-bold">
                          Tu Dirección de Retiro USDT (BEP20)
                        </label>
                        <span className="text-[8px] text-zinc-500 font-mono">
                          Comienza con "0x"
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 0x9f323aCDa84db3..."
                        value={withdrawalAddress}
                        onChange={(e) => setWithdrawalAddress(e.target.value)}
                        className="w-full text-xs font-semibold bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                      />
                    </div>
                  ) : (
                    /* Venezuelan Pago Móvil Form */
                    <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-950 border border-white/5">
                      <p className="text-[9px] text-yellow-400 uppercase font-mono tracking-wider font-extrabold flex items-center gap-1 mb-1">
                        🎯 Datos Obligatorios de Transacción
                      </p>
                      
                      {/* Bank Select */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 block font-bold">
                          Banco Receptor *
                        </label>
                        <select
                          value={pmBank}
                          onChange={(e) => setPmBank(e.target.value)}
                          className="w-full text-xs bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                        >
                          <option value="Banco de Venezuela (0102)">Banco de Venezuela (0102)</option>
                          <option value="Banesco (0134)">Banesco (0134)</option>
                          <option value="Mercantil (0105)">Mercantil (0105)</option>
                          <option value="BBVA Provincial (0108)">BBVA Provincial (0108)</option>
                          <option value="BNC Banco Nacional de Crédito (0191)">BNC (0191)</option>
                          <option value="Bancamiga (0172)">Bancamiga (0172)</option>
                          <option value="Banco del Tesoro (0163)">Banco del Tesoro (0163)</option>
                          <option value="Bancaribe (0114)">Bancaribe (0114)</option>
                          <option value="Otro">Otro banco...</option>
                        </select>
                      </div>

                      {/* Custom Bank input if 'Otro' selected */}
                      {pmBank === 'Otro' && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block font-bold">
                            Escribe el nombre del banco *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Banco Activo (0171)"
                            value={pmCustomBank}
                            onChange={(e) => setPmCustomBank(e.target.value)}
                            className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-800 focus:outline-none focus:border-yellow-400"
                          />
                        </div>
                      )}

                      {/* Cédula de Identidad */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 block font-bold">
                          Cédula de Identidad *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. V-12345678"
                          value={pmCedula}
                          onChange={(e) => setPmCedula(e.target.value)}
                          className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-800 focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      {/* Teléfono Pago Móvil */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 block font-bold">
                          Número de Teléfono *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. 04121234567"
                          value={pmPhone}
                          onChange={(e) => setPmPhone(e.target.value)}
                          className="w-full text-xs font-semibold bg-black border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-800 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Amount of coins */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] font-bold block">
                      Selecciona el Monto de Retiro (Monedas / USDT)
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {WITHDRAW_OPTIONS.map((opt) => {
                        const isSelected = withdrawalAmount === String(opt.coins);
                        const canAfford = userProfile.earnings >= opt.coins;
                        return (
                          <button
                            key={opt.coins}
                            type="button"
                            onClick={() => {
                              setWithdrawalAmount(String(opt.coins));
                              setWithdrawalError('');
                            }}
                            className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                              isSelected
                                ? 'bg-[#39FF14]/15 border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)] scale-[1.02]'
                                : canAfford
                                  ? 'bg-zinc-950 hover:bg-zinc-900/50 hover:border-zinc-700 border-white/10 text-zinc-300'
                                  : 'bg-zinc-950/40 border-white/5 opacity-40 text-zinc-650'
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className={`text-[12px] font-black tracking-tight ${isSelected ? 'text-[#39FF14]' : 'text-white'}`}>
                                ${opt.usdt}.00 USDT
                              </span>
                              {isSelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-ping" />
                              )}
                            </div>
                            <div className="mt-1 flex items-baseline justify-between w-full font-mono">
                              <span className="text-[9px] text-[#39FF14] font-semibold leading-none">
                                {opt.coins.toLocaleString()} <span className="text-[8px] text-zinc-500 uppercase">Monedas</span>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Breakdown ticket card */}
                    {!isNaN(parseFloat(withdrawalAmount)) && parseFloat(withdrawalAmount) >= 3670 && (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-1.5 font-mono text-[9px] text-zinc-400 mt-2">
                        <div className="flex justify-between items-center">
                          <span>Monto de Retiro (Bruto):</span>
                          <span className="text-white">{(parseFloat(withdrawalAmount) / 734).toFixed(2)} USDT</span>
                        </div>
                        <div className="flex justify-between items-center text-red-400">
                          <span>Comisión de Retiro (5% Fee):</span>
                          <span>- {((parseFloat(withdrawalAmount) / 734) * 0.05).toFixed(2)} USDT</span>
                        </div>
                        <div className="border-t border-white/5 my-1.5 pt-1.5 flex justify-between items-center text-[#39FF14] font-bold text-[10px]">
                          <span>Recibes Netos en tu Billetera:</span>
                          <span className="text-shadow-[0_0_8px_rgba(57,255,20,0.2)]">
                            {((parseFloat(withdrawalAmount) / 734) * 0.95).toFixed(2)} USDT
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-[9px] text-zinc-500 font-mono mt-1">
                      * Mínimo de retiro: 3670 monedas (≈ {(3670 / 734).toFixed(2)} USDT). Comisión de Retiro: 5%. Conversión: 734 Monedas = 1 USDT.
                    </p>
                  </div>

                  {/* Error display */}
                  {withdrawalError && (
                    <div className="p-3 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 font-mono text-[10px] text-center leading-relaxed antialiased">
                      ⚠️ {withdrawalError}
                    </div>
                  )}

                  {/* Withdraw Submit buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={userProfile.earnings < (parseFloat(withdrawalAmount) || 3670)}
                      className="sm:col-span-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#39FF14] to-emerald-400 hover:from-emerald-400 hover:to-[#39FF14] text-xs font-black uppercase text-black font-sans tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed text-shadow-none cursor-pointer"
                    >
                      <ArrowUpRight className="h-4 w-4 text-black" />
                      <span>Someter Solicitud de Retiro</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsWithdrawOpen(false);
                        setWithdrawalError('');
                      }}
                      className="flex h-11 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-mono font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>

                </form>
              )}

              {/* Withdrawal History Area */}
              <div className="border-t border-white/5 pt-4 text-left">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <History className="h-3.5 w-3.5 text-zinc-400" />
                  <h4 className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-black">Historial de Retiros</h4>
                </div>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {withdrawHistory.length === 0 ? (
                    <p className="text-[9px] font-mono text-zinc-650 text-center py-4">No posees retiros anteriores realizados.</p>
                  ) : (
                    withdrawHistory.map((item: any) => (
                      <div 
                        key={item.id} 
                        className="p-3 rounded-xl border border-white/5 bg-zinc-950/40 hover:bg-zinc-950/80 transition-all flex items-center justify-between font-mono gap-4"
                      >
                        <div className="space-y-1 font-mono min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-white font-extrabold">{item.amountCoins} MONEDAS</span>
                            <span className="text-[9px] text-[#39FF14]">
                              {item.netUsdt !== undefined ? `${item.netUsdt} USDT netos` : `${(item.amountUsdt * 0.95).toFixed(2)} USDT netos`}
                            </span>
                            <span className="text-[8px] bg-[#39FF14]/10 text-zinc-400 px-1 rounded">Bruto: {item.amountUsdt} USDT</span>
                            <span className="text-[8px] bg-[#39FF14]/10 text-[#39FF14] px-1 rounded font-black">{item.network}</span>
                          </div>
                          <div className="text-[8px] text-zinc-500 truncate select-all" title={item.address}>
                            Dir: {item.address.slice(0, 8)}...{item.address.slice(-6)}
                          </div>
                          <p className="text-[8px] text-zinc-650 leading-none">{item.date} • ID: {item.id}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            item.status === 'Aprobado'
                              ? 'bg-emerald-950/40 text-[#39FF14] border border-[#39FF14]/25'
                              : item.status === 'Pendiente'
                              ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/25 animate-pulse'
                              : 'bg-zinc-900 text-zinc-500'
                          }`}>
                            {item.status}
                          </span>
                          {item.status === 'Aprobado' && item.txid && (
                            <p 
                              className="text-[7px] text-zinc-500 mt-1 cursor-pointer hover:underline underline-offset-2 truncate max-w-[80px]"
                              onClick={() => {
                                navigator.clipboard.writeText(item.txid);
                              }}
                              title="Copiar hash de la transacción"
                            >
                              TxID: {item.txid.slice(0, 6)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Hidden background music player */}
      <audio ref={audioRef} className="hidden" />

    </div>
  );
}
