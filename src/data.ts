import { Track, VipFeature, UserTask, Reel, VipLevel } from './types';

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
    name: 'VIP PLATA 10$',
    price: '$10 USD',
    bonusMultiplier: 1.0,
    badgeColor: 'bg-zinc-900/40 text-zinc-300 border-zinc-500/35',
    glowColor: 'shadow-zinc-500/10'
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
    name: 'VIP CORONA IMPERIAL 1000$',
    price: '$1000 USD',
    bonusMultiplier: 8.0,
    badgeColor: 'bg-gradient-to-r from-[#39FF14]/20 via-yellow-500/10 to-purple-950/40 text-[#39FF14] border-yellow-500/40 font-extrabold',
    glowColor: 'shadow-[#39FF14]/30 font-extrabold animate-pulse'
  }
];

export const TASKS_DATABASE: UserTask[] = [
  // === VIP PLATA 10$ (5 Tareas de $2.45 USD c/u - Total: $12.25 USD Diario / $367.00 USD Mensual) ===
  {
    id: 'task_p1',
    title: 'Visualizar: Refugio de Fe en Tiempos Difíciles',
    description: 'Mira el testimonio animado "Dios es mi Refugio" para fortalecer tu espíritu de fe.',
    rewardValue: 73.40,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Video de Fe'
  },
  {
    id: 'task_p2',
    title: 'Compartir: Versículo Matutino de Provisión',
    description: 'Copia nuestro pasaje bíblico y compártelo con 3 familiares para sembrar bendición hoy.',
    rewardValue: 73.40,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Compartir'
  },
  {
    id: 'task_p3',
    title: 'Verificar: La Familia Edificada sobre Roca',
    description: 'Visualiza la prédica corta sobre la paciencia en el hogar y recibe tus regalías.',
    rewardValue: 73.40,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Familia'
  },
  {
    id: 'task_p4',
    title: 'Calificar: Testimonio de Superación Real',
    description: 'Dale 5 estrellas al material informativo de superación espiritual y fe.',
    rewardValue: 73.40,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Mentalidad'
  },
  {
    id: 'task_p5',
    title: 'Comentario: Agradecimiento al Altísimo',
    description: 'Escribe una frase de gratitud y un Amén sincero para cerrar tu jornada activa.',
    rewardValue: 73.40,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Mentalidad'
  },

  // === VIP ORO 20$ (7 Tareas de $3.50 USD c/u - Total: $24.50 USD Diario / $735.00 USD Mensual) ===
  {
    id: 'task_o1',
    title: 'Visualizar: Mentalidad Millonaria de Reino',
    description: 'Mira la mentoría bíblica sobre el enfoque de abundancia y mayordomía de recursos.',
    rewardValue: 104.85,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Video de Fe'
  },
  {
    id: 'task_o2',
    title: 'Compartir: Mensaje ORO de Esperanza Activa',
    description: 'Difunde la oración oficial por el empleo y el éxito en tus redes de mensajería.',
    rewardValue: 104.85,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Compartir'
  },
  {
    id: 'task_o3',
    title: 'Verificar: Altar de Dios en el Hogar Unido',
    description: 'Mira la guía audiovisual sobre cómo mantener la armonía ante las dificultades.',
    rewardValue: 104.85,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Familia'
  },
  {
    id: 'task_o4',
    title: 'Calificar: Disciplina y Esfuerzo sin Límites',
    description: 'Evalúa con 5 estrellas la reflexión de fe sobre vencer pereza y lograr abundancia.',
    rewardValue: 104.85,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Mentalidad'
  },
  {
    id: 'task_o5',
    title: 'Comentario: Testimonio de un Padre Exitoso',
    description: 'Comenta con palabras de aliento sobre el video de los valores eternos de la familia.',
    rewardValue: 104.85,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Mentalidad'
  },
  {
    id: 'task_o6',
    title: 'Visualizar: Romanos 8:28 Promesa Absoluta',
    description: 'Mira la explicación inspiradora de que todas las cosas ayudan a bien a los que aman a Dios.',
    rewardValue: 104.85,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Video de Fe'
  },
  {
    id: 'task_o7',
    title: 'Compartir: El Sembrador y las Tierras Fértiles',
    description: 'Sembrar buenas acciones da frutos al ciento por uno. Comparte con tus amados.',
    rewardValue: 104.90,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Compartir'
  },

  // === VIP RUBÍ 40$ (10 Tareas de $4.90 USD c/u - Total: $49.00 USD Diario / $1,470.00 USD Mensual) ===
  {
    id: 'task_r1',
    title: 'Visualizar: El Poder de la Oración de Fe',
    description: 'Estudia el versículo interactivo acerca de la certeza de lo que se espera.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Video de Fe'
  },
  {
    id: 'task_r2',
    title: 'Compartir: La Fórmula de la Excelencia Rubí',
    description: 'Involucra a tus contactos enviando un estímulo de motivación y esperanza de vida.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Compartir'
  },
  {
    id: 'task_r3',
    title: 'Verificar: Sabiduría de Salomón para Finanzas',
    description: 'Mira el testimonio explicativo sobre la sabiduría por encima del oro y plata.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Mentalidad'
  },
  {
    id: 'task_r4',
    title: 'Calificar: Educación con Amor y Autoridad',
    description: 'Califica la charla de bienestar enfocada en educar hijos con fe en el porvenir.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Familia'
  },
  {
    id: 'task_r5',
    title: 'Comentario: Jesús el Proveedor Celestial',
    description: 'Expresa tu gozo espiritual dejando un comentario positivo sobre el Salvador.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Mentalidad'
  },
  {
    id: 'task_r6',
    title: 'Visualizar: El Milagro de la Cosecha Rubí',
    description: 'Mira la ilustración real sobre la perseverancia de los agricultores de fe.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Video de Fe'
  },
  {
    id: 'task_r7',
    title: 'Compartir: Paz en la Tormenta Diaria',
    description: 'Lleva paz a tus conocidos compartiendo el link de fe de Tappmusic.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Compartir'
  },
  {
    id: 'task_r8',
    title: 'Verificar: Supera el Temor al Fracaso',
    description: 'Mira el video de coaching sobre cómo el amor perfecto echa fuera el temor.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Mentalidad'
  },
  {
    id: 'task_r9',
    title: 'Calificar: Sanidad de Relaciones Familiares',
    description: 'Califica el panel de consejería familiar sobre restaurar la comunicación.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Familia'
  },
  {
    id: 'task_r10',
    title: 'Comentario: No Faltará Nada en Mi Mesa',
    description: 'Decreta prosperidad comentando sobre el Salmo 23 con fe inquebrantable.',
    rewardValue: 146.80,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Mentalidad'
  },

  // === VIP DIAMANTE 120$ (15 Tareas de $9.79 USD c/u - Total: $146.85 USD Diario / $4,405.50 USD Mensual) ===
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `task_d${i + 1}`,
    title: [
      'Visualizar: Sabiduría Divina y Éxito Financiero',
      'Compartir: Pacto de Éxito Familiar Diamante',
      'Verificar: El Don del Servicio y Multiplicación',
      'Calificar: Mentoría Cósmica de Finanzas de Reino',
      'Comentario: Confianza en el Tiempo de Dios',
      'Visualizar: Restauración Total de tu Salud Física',
      'Compartir: Semilla de Fe para Misiones Sociales',
      'Verificar: Liderazgo de Alto Impacto Cristiano',
      'Calificar: Manejo Sabio del Negocio Familiar',
      'Comentario: Mi Familia Servirá al Señor',
      'Visualizar: Salir de Deudas con Sabiduría de Fe',
      'Compartir: Campamento de Fe para Jóvenes',
      'Verificar: El Guardador de mi Hogar no Duerme',
      'Calificar: La Humildad Antes de la Riqueza',
      'Comentario: Declaro Cosecha de 100 Veces Más'
    ][i] || `Misión Diamante de Crecimiento #${i + 1}`,
    description: `Completa este paso de formación superior Diamante para optimizar tu mente de abundancia y recibir regalías.`,
    rewardValue: 293.60,
    isCompleted: false,
    vipRequired: 'VIP DIAMANTE 120$' as VipLevel,
    category: (['Video de Fe', 'Compartir', 'Familia', 'Mentalidad'][i % 4] || 'Mentalidad') as any
  })),

  // === VIP PLATINO 420$ (17 Tareas de $30.22 USD c/u - Total: $513.74 USD Diario / $15,412.20 USD Mensual) ===
  ...Array.from({ length: 17 }, (_, i) => ({
    id: `task_pl${i + 1}`,
    title: [
      'Visualizar: Liderazgo Platino y Éxito de Negocios',
      'Compartir: Cadena de Fe de Altar Familiar',
      'Verificar: Abundancia Sobrenatural y Sabiduría',
      'Calificar: El Legado Familiar y Valores de Dios',
      'Comentario: Sembrando Oro de Reino en Almas',
      'Visualizar: Proverbios de Prosperidad y Negocios',
      'Compartir: Evangelismo de Esperanza Mundial',
      'Verificar: Fe que Mueve Corazones y Puertas',
      'Calificar: Calidad de Vida y Caridad Cristiana',
      'Comentario: Soy Libre por Su Sangre',
      'Visualizar: Consagración de Proyectos Empresariales',
      'Compartir: Bendición sobre las Tierras de Siembra',
      'Verificar: Vence con el Bien la Adversidad',
      'Calificar: Fortaleza Espiritual Inquebrantable',
      'Comentario: Mi Copa Está Rebosando',
      'Visualizar: Testimonio de Superación en Alta Mar',
      'Compartir: Mensaje Celestial de Paz y Gozo'
    ][i] || `Mentoría Platino de Éxito Supremo #${i + 1}`,
    description: `Estudio bíblico de excelencia Platino en el que se reflexiona y proclaman verdades de éxito y familia.`,
    rewardValue: i === 16 ? 906.80 : 906.70,
    isCompleted: false,
    vipRequired: 'VIP PLATINO 420$' as VipLevel,
    category: (['Video de Fe', 'Sharing', 'Familia', 'Mentalidad'][i % 4] || 'Mentalidad') as any
  })),

  // === VIP CORONA IMPERIAL 1000$ (20 Tareas de $61.16 USD c/u - Total: $1,223.20 USD Diario / $36,696.00 USD Mensual) ===
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `task_c${i + 1}`,
    title: [
      'Visualizar: Corona Imperial del Éxito de Dios',
      'Compartir: Bendición de Altar Familiar Suprema',
      'Verificar: Cosecha de Éxito de Reyes y Líderes',
      'Calificar: Auditoría de Ayuda Internacional',
      'Comentario: Fe Que Reclama Territorios y Almas',
      'Visualizar: Finanzas y Multiplicación de Reino',
      'Compartir: Multiplicación de la Harina y Aceite',
      'Verificar: Sabiduría de Abundancia de Salomón',
      'Calificar: Proyecto de Apoyo Social Comunitario',
      'Comentario: Victoria Absoluta en Cristo Jesús',
      'Visualizar: Fe Viva de los Triunfadores de Reino',
      'Compartir: Esperanza que Sostiene a las Naciones',
      'Verificar: Restauración Financiera y Propósito',
      'Calificar: Inteligencia de Negocios Sabia',
      'Comentario: Coronación Celestial de Paz',
      'Visualizar: Gracia Sobrenatural en el Trabajo',
      'Compartir: El Legado Imborrable de Mi Hogar',
      'Verificar: Claves del Liderazgo Sabio Supremo',
      'Calificar: Mayordomía Fiel de Bendiciones',
      'Comentario: Declaración de Gozo Celestial Eterno'
    ][i] || `Misión Corona Imperial de Éxito #${i + 1}`,
    description: `Reflexión suprema reservada exclusivamente para miembros del Rango Corona Imperial para validar regalías reales de fe.`,
    rewardValue: 1835.00,
    isCompleted: false,
    vipRequired: 'VIP CORONA IMPERIAL 1000$' as VipLevel,
    category: (['Video de Fe', 'Compartir', 'Familia', 'Mentalidad'][i % 4] || 'Mentalidad') as any
  }))
];

export const REELS_DATABASE: Reel[] = [
  // VIP PLATA 10$ Reels
  {
    id: 'reel_1',
    title: 'Caminando con Jesús Cristo 🕊️',
    caption: 'En los momentos más difíciles de la vida, Su gracia nos sostiene. Sigue adelante con fe, Él nunca te abandonará. ¡Fe inquebrantable en Jesucristo!',
    artist: 'Sermones Celestiales',
    coverUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    likes: 540,
    commentsCount: 32,
    vipLevel: 'VIP PLATA 10$',
    duration: '0:15',
    category: 'Video de Fe'
  },
  {
    id: 'reel_music_1',
    title: 'Si No Estás - Iñigo Quintero (TikTok Hits)',
    caption: 'La canción más viral de TikTok sobre la búsqueda espiritual y la paz profunda. Una reproducción musical perfecta y con canciones reales para motivar tu día.',
    artist: 'Música TikTok Real',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=450&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    likes: 1280,
    commentsCount: 84,
    vipLevel: 'VIP PLATA 10$',
    duration: '0:22',
    category: 'Video Musical'
  },
  {
    id: 'reel_2',
    title: 'La Familia es el Mayor Regalo 🏠❤️',
    caption: 'Las riquezas materiales van y vienen, pero el amor de una familia unida dura para siempre. Protege a tu hogar con sabio amor y verdadero respeto.',
    artist: 'Reflexión Familiar Sabia',
    coverUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    likes: 820,
    commentsCount: 45,
    vipLevel: 'VIP PLATA 10$',
    duration: '0:12',
    category: 'Familia'
  },

  // VIP ORO 20$ Reels
  {
    id: 'reel_3',
    title: 'Motivación Millonaria: Disciplina Absoluta 📈💼',
    caption: 'Un ganador no se rinde, se levanta con fe ciega y compromiso mental de abundancia. Pon a Dios en primer lugar en tus planes y verás resultados.',
    artist: 'Mentalidad Creadora',
    coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    likes: 1250,
    commentsCount: 68,
    vipLevel: 'VIP ORO 20$',
    duration: '0:18',
    category: 'Mentalidad'
  },
  {
    id: 'reel_music_2',
    title: 'LALA - Myke Towers (Instagram Remix)',
    caption: 'El hit global del momento en Instagram Reels y TikTok. Alta fidelidad de reproducción para tus tareas de monetización de canciones reales.',
    artist: 'Instagram Hits',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    likes: 2450,
    commentsCount: 130,
    vipLevel: 'VIP ORO 20$',
    duration: '0:20',
    category: 'Video Musical'
  },
  {
    id: 'reel_4',
    title: 'Dios Tiene el Control Absoluto 🙌✨',
    caption: 'No te preocupes por el mañana, ya que tu Padre Celestial prepara lo mejor. Ora con gozo, trabaja sincera y honestamente y confía en Su eterna provisión.',
    artist: 'Paz Providencial',
    coverUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    likes: 1420,
    commentsCount: 89,
    vipLevel: 'VIP ORO 20$',
    duration: '0:20',
    category: 'Video de Fe'
  },

  // VIP RUBÍ 40$ Reels
  {
    id: 'reel_5',
    title: 'Aprende de Jesús: El Maestro de Vida ✝️🔥',
    caption: 'Jesús venció la adversidad. Con Su fuerza bien sembrada en tu corazón, no hay prueba que no puedas superar con creces.',
    artist: 'Jesucristo Salvador',
    coverUrl: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    likes: 3100,
    commentsCount: 143,
    vipLevel: 'VIP RUBÍ 40$',
    duration: '0:25',
    category: 'Video de Fe'
  },
  {
    id: 'reel_music_3',
    title: 'Luna - Feid & ATL Jacob (TikTok Hits)',
    caption: 'La canción bailable que define el éxito de tendencias en Instagram Reels. Compra de VIP para desbloquear mayores regalías semanales en Tappmusic.',
    artist: 'Música Instagram Real',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    likes: 4100,
    commentsCount: 198,
    vipLevel: 'VIP RUBÍ 40$',
    duration: '0:24',
    category: 'Video Musical'
  },
  {
    id: 'reel_6',
    title: 'Mi Familia Bajo la Cobertura de Dios 🙏🛡️',
    caption: 'Qué hermoso ver a una familia unida caminando bajo sabias enseñanzas de amor y respeto mutuo. Declaramos paz, pan y provisión sobre todos tus seres queridos.',
    artist: 'Valores Familiares',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    likes: 2900,
    commentsCount: 112,
    vipLevel: 'VIP RUBÍ 40$',
    duration: '0:30',
    category: 'Familia'
  },

  // VIP DIAMANTE 120$ Reels
  {
    id: 'reel_7',
    title: 'Riqueza Espiritual y Propósito Millonario 👑💎',
    caption: 'La sabiduría infinita nos instruye a administrar con excelencia cada uno de nuestros recursos. Multiplica tu fe y asiste a tu familia con abundante gozo.',
    artist: 'Mentalidad de Reino',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    likes: 9800,
    commentsCount: 450,
    vipLevel: 'VIP DIAMANTE 120$',
    duration: '0:35',
    category: 'Mentalidad'
  },
  {
    id: 'reel_music_4',
    title: 'Gata Only - FloyyMenor & Cris Mj',
    caption: 'Súper éxito viral de reproducción en TikTok e Instagram de Chile para el mundo, con reproducción limpia y perfecta en fidelidad absoluta.',
    artist: 'Canciones Más Escuchadas',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    likes: 15400,
    commentsCount: 520,
    vipLevel: 'VIP DIAMANTE 120$',
    duration: '0:28',
    category: 'Video Musical'
  },
  {
    id: 'reel_8',
    title: 'La Gloria Postrera de Dios 🙌🌟',
    caption: 'Lluvia de bendiciones sobrenaturales sobreabundará en tu hogar. Da gracias por la vida de tus familiares y sigue adelante sembrando fe.',
    artist: 'Refugio de Amor Celestial',
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    likes: 12400,
    commentsCount: 512,
    vipLevel: 'VIP DIAMANTE 120$',
    duration: '0:40',
    category: 'Video de Fe'
  },

  // VIP PLATINO 420$ Reels
  {
    id: 'reel_9',
    title: 'Impacto Platino: La Unión de Liderazgo ⚡🔥',
    caption: 'Cuando los líderes trabajan bajo principios sagrados de honestidad, los milagros florecen y la escasez se desvanece por completo. Excelente guía mental.',
    artist: 'Liderazgo Eterno',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    likes: 15600,
    commentsCount: 680,
    vipLevel: 'VIP PLATINO 420$',
    duration: '0:45',
    category: 'Mentalidad'
  },

  // VIP CORONA IMPERIAL 1000$ Reels
  {
    id: 'reel_10',
    title: 'Corona Imperial: La Cima de la Bendición 👑🌍',
    caption: 'Dedicado a los corazones valientes. La excelencia de la vida es una obra de la gracia divina del Creador para edificar hogares hermosos.',
    artist: 'Dios Es Fiel',
    coverUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    likes: 31200,
    commentsCount: 1240,
    vipLevel: 'VIP CORONA IMPERIAL 1000$',
    duration: '0:50',
    category: 'Video de Fe'
  }
];
