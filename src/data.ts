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
    name: 'VIP 1',
    price: 'Gratis o Inicial',
    bonusMultiplier: 1.0,
    badgeColor: 'bg-zinc-800 text-zinc-100 border-zinc-700',
    glowColor: 'shadow-zinc-500/10'
  },
  {
    name: 'VIP 2',
    price: '15 USD o Activo',
    bonusMultiplier: 1.5,
    badgeColor: 'bg-purple-900/30 text-purple-300 border-purple-500/30',
    glowColor: 'shadow-purple-500/20'
  },
  {
    name: 'VIP 3',
    price: '40 USD o Premium',
    bonusMultiplier: 2.2,
    badgeColor: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
    glowColor: 'shadow-amber-500/25'
  },
  {
    name: 'VIP 4',
    price: '100 USD o Élite',
    bonusMultiplier: 3.5,
    badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
    glowColor: 'shadow-emerald-500/30 font-extrabold'
  }
];

export const TASKS_DATABASE: UserTask[] = [
  {
    id: 'task_1',
    title: 'Escuchar el Intro Completo',
    description: 'Reproduce la canción de introducción "Intro: TaAppMusic" durante al menos 30 segundos para sintonizar el flow.',
    rewardValue: 5.50,
    isCompleted: false,
    vipRequired: 'VIP 1',
    category: 'Escucha'
  },
  {
    id: 'task_2',
    title: 'Compartir el link Tappmusic.com',
    description: 'Copia el enlace de lanzamiento oficial de nuestra plataforma y compártelo por WhatsApp o Telegram.',
    rewardValue: 8.00,
    isCompleted: false,
    vipRequired: 'VIP 1',
    category: 'Share'
  },
  {
    id: 'task_3',
    title: 'Verificar Video Promocional VIP 2',
    description: 'Visualiza la presentación animada de DJ TaApp de 15 segundos para desbloquear la recompensa acelerada de nivel VIP 2.',
    rewardValue: 12.00,
    isCompleted: false,
    vipRequired: 'VIP 2',
    category: 'Ad Watch'
  },
  {
    id: 'task_4',
    title: 'Calificar Flow Dominicano ★★★★★',
    description: 'Dale like y marca Favorito en la canción "Flow Dominicano (Urban Beat)" de La Sensación.',
    rewardValue: 15.50,
    isCompleted: false,
    vipRequired: 'VIP 2',
    category: 'Rate'
  },
  {
    id: 'task_5',
    title: 'Auditoría de Audio VIP 3',
    description: 'Comenta y opina sobre el Bass Boost del tema "Trap de las Calles" en los comentarios del reproductor.',
    rewardValue: 24.00,
    isCompleted: false,
    vipRequired: 'VIP 3',
    category: 'Rate'
  },
  {
    id: 'task_6',
    title: 'Ver Anuncio Premium de Auriculares LED',
    description: 'Mira el anuncio del socio auspiciador de los audífonos con luces violetas y doradas (10 seg).',
    rewardValue: 35.00,
    isCompleted: false,
    vipRequired: 'VIP 3',
    category: 'Ad Watch'
  },
  {
    id: 'task_7',
    title: 'Embajador Élite: Promoción República Dominicana',
    description: 'Comparte el enlace de la app en tus estados públicos con un mensaje que incluya el hashtag #Tappmusic.',
    rewardValue: 50.00,
    isCompleted: false,
    vipRequired: 'VIP 4',
    category: 'Share'
  },
  {
    id: 'task_8',
    title: 'Escucha Suprema VIP 4: Deep House',
    description: 'Escucha el set completo de "Deep House Sunset" por Marina Club para recargar el fondo de regalías.',
    rewardValue: 75.00,
    isCompleted: false,
    vipRequired: 'VIP 4',
    category: 'Escucha'
  }
];

export const REELS_DATABASE: Reel[] = [
  // VIP 1 Reels
  {
    id: 'reel_1',
    title: 'Caminando con Jesús Cristo 🕊️',
    caption: 'En los momentos más difíciles de la vida, Su gracia nos sostiene. Sigue adelante con fe, Él nunca te abandonará. ¡Fe inquebrantable! #Jesucristo #Fe #DiosEsAmor #Esperanza',
    artist: 'Kervin de Fe',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    likes: 540,
    commentsCount: 32,
    vipLevel: 'VIP 1',
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
    vipLevel: 'VIP 1',
    duration: '0:12'
  },

  // VIP 2 Reels
  {
    id: 'reel_3',
    title: 'Motivación Millonaria: Disciplina Absoluta 📈💼',
    caption: 'Un ganador no nace, se hace con sudor, desvelos y fe ciega. Pon a Dios en primer lugar en tus negocios y verás tu vida prosperar. #Millonario #Motivacion #Esfuerzo #Disciplina',
    artist: 'Juventud del Éxito',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    likes: 1250,
    commentsCount: 68,
    vipLevel: 'VIP 2',
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
    vipLevel: 'VIP 2',
    duration: '0:20'
  },

  // VIP 3 Reels
  {
    id: 'reel_5',
    title: 'Aprende de Jesús: El Maestro de Vida ✝️🔥',
    caption: 'Jesús venció al mundo. Con Su fuerza en tu corazón, no hay gigante ni prueba que no puedas derrotar. Levántate con la mente enfocada en Su gloria. #Jesús #Superación #FeActiva',
    artist: 'La Sensación Cristiana',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    likes: 3100,
    commentsCount: 143,
    vipLevel: 'VIP 3',
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
    vipLevel: 'VIP 3',
    duration: '0:30'
  },

  // VIP 4 Reels
  {
    id: 'reel_7',
    title: 'Riqueza Espiritual y Propósito Millonario 👑💎',
    caption: 'La sabiduría divina nos instruye a ser excelentes administradores de dones y talentos. Multiplica tu servicio, ayuda a tu prójimo y vive con propósito de abundancia. #MillonarioDeFe #Prosperidad',
    artist: 'Marina Club Celestial',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    likes: 9800,
    commentsCount: 450,
    vipLevel: 'VIP 4',
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
    vipLevel: 'VIP 4',
    duration: '0:40'
  }
];
