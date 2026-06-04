import { Track, VipFeature, UserTask, Reel } from './types';

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Intro: TaAppMusic',
    artist: 'Kervin x DJ TaApp',
    duration: '6:12',
    genre: 'Urban Latino',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    color: 'from-pink-500 to-indigo-700',
    plays: 124500,
    lyrics: [
      'Bienvenidos a TaAppMusic',
      'Donde el ritmo y el código se fusionan en una sola alma',
      'Mi gente, compartan el enlace oficial con el mundo',
      'Lanzamos la plataforma que va a dominar las calles y las redes',
      '¡Siente los bajos, siente la conexión!',
      'TaApp es futuro, TaApp es música'
    ]
  },
  {
    id: '2',
    title: 'Vibras Nocturnas',
    artist: 'Young TaApp',
    duration: '7:05',
    genre: 'Reggaeton',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    color: 'from-blue-600 to-purple-800',
    plays: 98120,
    lyrics: [
      'Salgo cuando la luna se pone gigante',
      'Vibras nocturnas que se sienten al instante',
      'El teléfono suena pero ya apagué la señal',
      'Solo quiero que esta noche sea inmortal',
      'Comparte el enlace, que suene en el barrio',
      'TaApp en el parlante como el abecedario'
    ]
  },
  {
    id: '3',
    title: 'Flow Dominicano (Urban Beat)',
    artist: 'La Sensación',
    duration: '5:44',
    genre: 'Reggaeton',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    color: 'from-red-500 to-amber-600',
    plays: 154300,
    lyrics: [
      'TaApp sonando de Santo Domingo pal mundo',
      'Esto se baila y se siente cada segundo',
      'Mi hermano, pásame el enlace de una vez',
      'Que todo el mundo quiere descargarla ya lo ves',
      'Bajo potente que retumba en tus arterias',
      'Con paciencia y trabajo dejamos fuera las miserias'
    ]
  },
  {
    id: '4',
    title: 'Trap de las Calles',
    artist: 'El Kervin Flow',
    duration: '5:02',
    genre: 'Trap',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    color: 'from-emerald-500 to-teal-800',
    plays: 247000,
    lyrics: [
      'Empezamos desde abajo sin saber lo que vendría',
      'Ahora controlamos el reproductor de la noche al día',
      'Enlace verificado, lanzamiento oficial',
      'TaAppMusic en tu cel beats del nivel espacial',
      'No confíes en copias, tenemos la fórmula real',
      'La gente sabe de qué lado está la calidad visual'
    ]
  },
  {
    id: '5',
    title: 'Code & Chill Lo-Fi',
    artist: 'Beatmaker Pro',
    duration: '6:02',
    genre: 'Lo-Fi Beats',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    color: 'from-yellow-500 to-rose-600',
    plays: 341000,
    lyrics: [
      '[Instrumental Chill]',
      'Silencio agradable en la habitación...',
      'Un café caliente flotando en la imaginación...',
      'Escribe tu código, copia el link oficial...',
      'Relaja tu mente con este beat cósmico ancestral'
    ]
  },
  {
    id: '6',
    title: 'Deep House Sunset',
    artist: 'Marina Club',
    duration: '7:38',
    genre: 'Chill House',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    color: 'from-cyan-500 to-blue-700',
    plays: 89000,
    lyrics: [
      '[Intro Instrumental Synth]',
      'Feel the sun touching the sea...',
      'TaAppMusic is where we want to be...',
      'Share the rhythm that brings us together...',
      'In this perfect electronic sunset weather'
    ]
  }
];

export const VIP_TICKETS: VipFeature[] = [
  {
    name: 'VIP ORO 10$',
    price: '$10 USD',
    bonusMultiplier: 1.0,
    badgeColor: 'bg-yellow-950/40 text-yellow-500 border-yellow-500/30',
    glowColor: 'shadow-yellow-500/10'
  },
  {
    name: 'VIP ORO 20$',
    price: '$20 USD',
    bonusMultiplier: 1.5,
    badgeColor: 'bg-yellow-900/40 text-yellow-400 border-yellow-400/40',
    glowColor: 'shadow-yellow-400/20'
  },
  {
    name: 'VIP RUBÍ 40$',
    price: '$40 USD',
    bonusMultiplier: 2.2,
    badgeColor: 'bg-rose-950/40 text-red-400 border-red-500/30',
    glowColor: 'shadow-red-500/25'
  },
  {
    name: 'VIP DIAMANTE 120$',
    price: '$120 USD',
    bonusMultiplier: 3.5,
    badgeColor: 'bg-sky-950/40 text-sky-400 border-sky-500/30',
    glowColor: 'shadow-sky-500/30 font-extrabold'
  },
  {
    name: 'VIP PLATINO 420$',
    price: '$420 USD',
    bonusMultiplier: 5.0,
    badgeColor: 'bg-purple-950/40 text-purple-300 border-purple-500/30 font-extrabold',
    glowColor: 'shadow-purple-500/35 font-extrabold'
  },
  {
    name: 'VIP SÚPER VIP 1000$',
    price: '$1000 USD',
    bonusMultiplier: 8.0,
    badgeColor: 'bg-gradient-to-r from-purple-900/30 to-yellow-500/10 text-emerald-400 border-emerald-500/40 font-extrabold',
    glowColor: 'shadow-emerald-500/45 font-extrabold'
  }
];

export const TASKS_DATABASE: UserTask[] = [
  {
    id: 'task_1',
    title: 'Ver Video de Fe: Caminando con Jesús',
    description: 'Visualiza el video inspirador "Caminando con Jesús" durante al menos 15 segundos para sintonizar tu fe.',
    rewardValue: 5.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 10$',
    category: 'Video de Fe'
  },
  {
    id: 'task_2',
    title: 'Compartir Mensaje del Evangelio',
    description: 'Copia nuestro versículo del día y el link oficial de Tappmusic para bendecir a tu familia por WhatsApp o Telegram.',
    rewardValue: 8.00,
    isCompleted: false,
    vipRequired: 'VIP ORO 10$',
    category: 'Compartir'
  },
  {
    id: 'task_3',
    title: 'Verificar Mensaje ORO: Dios tiene el Control',
    description: 'Mira la prédica animada sobre la gracia divina (15 segundos) para desbloquear la recompensa de hoy.',
    rewardValue: 12.00,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Familia'
  },
  {
    id: 'task_4',
    title: 'Calificar Prédica: Disciplina Absoluta ★★★★★',
    description: 'Dale 5 estrellas al testimonio audiovisual sobre disciplina cristiana y mentalidad millonaria.',
    rewardValue: 15.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Mentalidad'
  },
  {
    id: 'task_5',
    title: 'Comentario de Fe: Jesús Maestro de Vida',
    description: 'Escribe un comentario positivo y un "Amén" en el Reel interactivo de Jesús el Salvador.',
    rewardValue: 24.00,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Mentalidad'
  },
  {
    id: 'task_6',
    title: 'Ver Cortometraje: Amor Familiar Protegido',
    description: 'Mira el cortometraje sobre el valor y la bendición de un hogar edificado en la fe (10 segundos).',
    rewardValue: 35.00,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Familia'
  },
  {
    id: 'task_7',
    title: 'Embajador Diamante: Unión Familiar en Redes',
    description: 'Comparte un mensaje de unión familiar junto con la app en tus estados públicos con el hashtag #Tappmusic.',
    rewardValue: 50.00,
    isCompleted: false,
    vipRequired: 'VIP DIAMANTE 120$',
    category: 'Compartir'
  },
  {
    id: 'task_8',
    title: 'Visualizar: Riqueza Espiritual y Propósito',
    description: 'Mira el video de coaching sobre mentalidad millonaria celestial y abundancia espiritual.',
    rewardValue: 75.00,
    isCompleted: false,
    vipRequired: 'VIP DIAMANTE 120$',
    category: 'Video de Fe'
  },
  {
    id: 'task_9',
    title: 'Misión Platino: Liderazgo y Visión Divina',
    description: 'Completa la visualización de la mentoría de liderazgo y prosperidad basada en la fe en alta definición.',
    rewardValue: 150.00,
    isCompleted: false,
    vipRequired: 'VIP PLATINO 420$',
    category: 'Mentalidad'
  },
  {
    id: 'task_10',
    title: 'Embajador Platino: Difusión de Esperanza',
    description: 'Comparte un pasaje bíblico y testimonio de éxito millonario con nuestro cartel en Instagram Reels o TikTok.',
    rewardValue: 220.00,
    isCompleted: false,
    vipRequired: 'VIP PLATINO 420$',
    category: 'Compartir'
  },
  {
    id: 'task_11',
    title: 'Súper VIP: Auditoría de Misiones Familiares',
    description: 'Verifica y califica el bloque de ayuda social y misiones internacionales en República Dominicana.',
    rewardValue: 450.00,
    isCompleted: false,
    vipRequired: 'VIP SÚPER VIP 1000$',
    category: 'Familia'
  },
  {
    id: 'task_12',
    title: 'Súper VIP: La Cima de la Bendición Final',
    description: 'Evalúa la reflexión inspiradora del Reel diario "La Cima de la Bendición" para concluir tu jornada exitosa.',
    rewardValue: 600.00,
    isCompleted: false,
    vipRequired: 'VIP SÚPER VIP 1000$',
    category: 'Mentalidad'
  }
];

export const REELS_DATABASE: Reel[] = [
  // VIP ORO 10$ Reels
  {
    id: 'reel_1',
    title: 'Caminando con Jesús Cristo 🕊️',
    caption: 'En los momentos más difíciles de la vida, Su gracia nos sostiene. Sigue adelante con fe, Él nunca te abandonará. ¡Fe inquebrantable! #Jesucristo #Fe #DiosEsAmor #Esperanza',
    artist: 'Kervin de Fe',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    likes: 540,
    commentsCount: 32,
    vipLevel: 'VIP ORO 10$',
    duration: '0:15'
  },
  {
    id: 'reel_2',
    title: 'La Familia es el Mayor Regalo 🏠❤️',
    caption: 'Las riquezas materiales van y vienen, pero el amor de una familia unida dura para siempre. Protege a tu hogar, edifícalo sobre roca firme. #Familia #Hogar #Bendiciones #Unión',
    artist: 'Fe y Familia',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    likes: 820,
    commentsCount: 45,
    vipLevel: 'VIP ORO 10$',
    duration: '0:12'
  },

  // VIP ORO 20$ Reels
  {
    id: 'reel_3',
    title: 'Motivación Millonaria: Disciplina Absoluta 📈💼',
    caption: 'Un ganador no nace, se hace con sudor, desvelos y fe ciega. Pon a Dios en primer lugar en tus negocios y verás tu vida prosperar. #Millonario #Motivacion #Esfuerzo #Disciplina',
    artist: 'Juventud del Éxito',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    likes: 1250,
    commentsCount: 68,
    vipLevel: 'VIP ORO 20$',
    duration: '0:18'
  },
  {
    id: 'reel_4',
    title: 'Dios Tiene el Control Absoluto 🙌✨',
    caption: 'No te preocupes por el mañana, ya que Dios está preparando lo mejor para ti. Ora con fervor, trabaja con honestidad y confía en Su proceso eterno. #DiosEsBueno #Oración #Milagro #Fiel',
    artist: 'DJ Gracia Divina',
    coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    likes: 1420,
    commentsCount: 89,
    vipLevel: 'VIP ORO 20$',
    duration: '0:20'
  },

  // VIP RUBÍ 40$ Reels
  {
    id: 'reel_5',
    title: 'Aprende de Jesús: El Maestro de Vida ✝️🔥',
    caption: 'Jesús venció al mundo. Con Su fuerza en tu corazón, no hay gigante ni prueba que no puedas derrotar. Levántate con la mente enfocada en Su gloria. #Jesús #Superación #FeActiva',
    artist: 'La Sensación Cristiana',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    likes: 3100,
    commentsCount: 143,
    vipLevel: 'VIP RUBÍ 40$',
    duration: '0:25'
  },
  {
    id: 'reel_6',
    title: 'Mi Familia Bajo la Cobertura de Dios 🙏🛡️',
    caption: 'Nada hay más hermoso que ver a toda una familia unida alabando al Creador en armonía. Declaramos paz, provisión y salud sobre tu hogar hoy. #FamiliaDeFe #HogarBendecido #Amor',
    artist: 'Refugio Familiar',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    likes: 2900,
    commentsCount: 112,
    vipLevel: 'VIP RUBÍ 40$',
    duration: '0:30'
  },

  // VIP DIAMANTE 120$ Reels
  {
    id: 'reel_7',
    title: 'Riqueza Espiritual y Propósito Millonario 👑💎',
    caption: 'La sabiduría divina nos instruye a ser excelentes administradores de dones y talentos. Multiplica tu servicio, ayuda a tu prójimo y vive con propósito de abundancia. #MillonarioDeFe #Prosperidad',
    artist: 'Marina Club Celestial',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    likes: 9800,
    commentsCount: 450,
    vipLevel: 'VIP DIAMANTE 120$',
    duration: '0:35'
  },
  {
    id: 'reel_8',
    title: 'La Gloria Postrera de Dios 🙌🌟',
    caption: 'Se viene una lluvia de bendiciones sobrenaturales que sobreabundará en tu vida, tus sueños y los de tu familia. ¡Pásate al nivel superior con fe y da gracias! #DiosEsFiel #Abundancia #Amen',
    artist: 'El Kervin Flow',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    likes: 12400,
    commentsCount: 512,
    vipLevel: 'VIP DIAMANTE 120$',
    duration: '0:40'
  },

  // VIP PLATINO 420$ Reels
  {
    id: 'reel_9',
    title: 'Impacto Platino: La Unión de Liderazgo ⚡🔥',
    caption: 'Cuando los líderes trabajan bajo una visión divina, los milagros se multiplican. Permanece firme. #PlatinoLevel #Liderazgo #ExitoCristiano',
    artist: 'Platino Sound',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    likes: 15600,
    commentsCount: 680,
    vipLevel: 'VIP PLATINO 420$',
    duration: '0:45'
  },

  // VIP SÚPER VIP 1000$ Reels
  {
    id: 'reel_10',
    title: 'Súper VIP: La Cima de la Bendición 👑🌍',
    caption: 'Dedicado a los valientes que no temen soñar en grande. La excelencia es un hábito inspirado en Su gracia infinita. #SuperVip #Excelencia #Abundancia',
    artist: 'DJ TaApp Celestial',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    likes: 31200,
    commentsCount: 1240,
    vipLevel: 'VIP SÚPER VIP 1000$',
    duration: '0:50'
  }
];
