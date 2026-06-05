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
    rewardValue: 2.45,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Video de Fe'
  },
  {
    id: 'task_p2',
    title: 'Compartir: Versículo Matutino de Provisión',
    description: 'Copia nuestro pasaje bíblico y compártelo con 3 familiares para sembrar bendición hoy.',
    rewardValue: 2.45,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Compartir'
  },
  {
    id: 'task_p3',
    title: 'Verificar: La Familia Edificada sobre Roca',
    description: 'Visualiza la prédica corta sobre la paciencia en el hogar y recibe tus regalías.',
    rewardValue: 2.45,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Familia'
  },
  {
    id: 'task_p4',
    title: 'Calificar: Testimonio de Superación Real',
    description: 'Dale 5 estrellas al material informativo de superación espiritual y fe.',
    rewardValue: 2.45,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Mentalidad'
  },
  {
    id: 'task_p5',
    title: 'Comentario: Agradecimiento al Altísimo',
    description: 'Escribe una frase de gratitud y un Amén sincero para cerrar tu jornada activa.',
    rewardValue: 2.45,
    isCompleted: false,
    vipRequired: 'VIP PLATA 10$',
    category: 'Mentalidad'
  },

  // === VIP ORO 20$ (7 Tareas de $3.50 USD c/u - Total: $24.50 USD Diario / $735.00 USD Mensual) ===
  {
    id: 'task_o1',
    title: 'Visualizar: Mentalidad Millonaria de Reino',
    description: 'Mira la mentoría bíblica sobre el enfoque de abundancia y mayordomía de recursos.',
    rewardValue: 3.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Video de Fe'
  },
  {
    id: 'task_o2',
    title: 'Compartir: Mensaje ORO de Esperanza Activa',
    description: 'Difunde la oración oficial por el empleo y el éxito en tus redes de mensajería.',
    rewardValue: 3.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Compartir'
  },
  {
    id: 'task_o3',
    title: 'Verificar: Altar de Dios en el Hogar Unido',
    description: 'Mira la guía audiovisual sobre cómo mantener la armonía ante las dificultades.',
    rewardValue: 3.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Familia'
  },
  {
    id: 'task_o4',
    title: 'Calificar: Disciplina y Esfuerzo sin Límites',
    description: 'Evalúa con 5 estrellas la reflexión de fe sobre vencer pereza y lograr abundancia.',
    rewardValue: 3.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Mentalidad'
  },
  {
    id: 'task_o5',
    title: 'Comentario: Testimonio de un Padre Exitoso',
    description: 'Comenta con palabras de aliento sobre el video de los valores eternos de la familia.',
    rewardValue: 3.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Mentalidad'
  },
  {
    id: 'task_o6',
    title: 'Visualizar: Romanos 8:28 Promesa Absoluta',
    description: 'Mira la explicación inspiradora de que todas las cosas ayudan a bien a los que aman a Dios.',
    rewardValue: 3.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Video de Fe'
  },
  {
    id: 'task_o7',
    title: 'Compartir: El Sembrador y las Tierras Fértiles',
    description: 'Sembrar buenas acciones da frutos al ciento por uno. Comparte con tus amados.',
    rewardValue: 3.50,
    isCompleted: false,
    vipRequired: 'VIP ORO 20$',
    category: 'Compartir'
  },

  // === VIP RUBÍ 40$ (10 Tareas de $4.90 USD c/u - Total: $49.00 USD Diario / $1,470.00 USD Mensual) ===
  {
    id: 'task_r1',
    title: 'Visualizar: El Poder de la Oración de Fe',
    description: 'Estudia el versículo interactivo acerca de la certeza de lo que se espera.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Video de Fe'
  },
  {
    id: 'task_r2',
    title: 'Compartir: La Fórmula de la Excelencia Rubí',
    description: 'Involucra a tus contactos enviando un estímulo de motivación y esperanza de vida.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Compartir'
  },
  {
    id: 'task_r3',
    title: 'Verificar: Sabiduría de Salomón para Finanzas',
    description: 'Mira el testimonio explicativo sobre la sabiduría por encima del oro y plata.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Mentalidad'
  },
  {
    id: 'task_r4',
    title: 'Calificar: Educación con Amor y Autoridad',
    description: 'Califica la charla de bienestar enfocada en educar hijos con fe en el porvenir.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Familia'
  },
  {
    id: 'task_r5',
    title: 'Comentario: Jesús el Proveedor Celestial',
    description: 'Expresa tu gozo espiritual dejando un comentario positivo sobre el Salvador.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Mentalidad'
  },
  {
    id: 'task_r6',
    title: 'Visualizar: El Milagro de la Cosecha Rubí',
    description: 'Mira la ilustración real sobre la perseverancia de los agricultores de fe.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Video de Fe'
  },
  {
    id: 'task_r7',
    title: 'Compartir: Paz en la Tormenta Diaria',
    description: 'Lleva paz a tus conocidos compartiendo el link de fe de Tappmusic.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Compartir'
  },
  {
    id: 'task_r8',
    title: 'Verificar: Supera el Temor al Fracaso',
    description: 'Mira el video de coaching sobre cómo el amor perfecto echa fuera el temor.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Mentalidad'
  },
  {
    id: 'task_r9',
    title: 'Calificar: Sanidad de Relaciones Familiares',
    description: 'Califica el panel de consejería familiar sobre restaurar la comunicación.',
    rewardValue: 4.90,
    isCompleted: false,
    vipRequired: 'VIP RUBÍ 40$',
    category: 'Familia'
  },
  {
    id: 'task_r10',
    title: 'Comentario: No Faltará Nada en Mi Mesa',
    description: 'Decreta prosperidad comentando sobre el Salmo 23 con fe inquebrantable.',
    rewardValue: 4.90,
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
    rewardValue: 9.79,
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
    rewardValue: 30.22,
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
    rewardValue: 61.16,
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
    caption: 'En los momentos más difíciles de la vida, Su gracia nos sostiene. Sigue adelante con fe, Él nunca te abandonará. ¡Fe inquebrantable! #Jesucristo #Fe #DiosEsAmor #Esperanza',
    artist: 'Kervin de Fe',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    likes: 540,
    commentsCount: 32,
    vipLevel: 'VIP PLATA 10$',
    duration: '0:15'
  },
  {
    id: 'reel_2',
    title: 'La Familia es el Mayor Regalo 🏠❤️',
    caption: 'Las riquezas materiales van y viene, pero el amor de una familia unida dura para siempre. Protege a tu hogar, edifícalo sobre roca firme. #Familia #Hogar #Bendiciones #Unión',
    artist: 'Fe y Familia',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    likes: 820,
    commentsCount: 45,
    vipLevel: 'VIP PLATA 10$',
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

  // VIP CORONA IMPERIAL 1000$ Reels
  {
    id: 'reel_10',
    title: 'Corona Imperial: La Cima de la Bendición 👑🌍',
    caption: 'Dedicado a los valientes que no temen soñar en grande. La excelencia es un hábito inspirado en Su gracia infinita. #CoronaImperial #Excelencia #Abundancia',
    artist: 'DJ TaApp Celestial',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    likes: 31200,
    commentsCount: 1240,
    vipLevel: 'VIP CORONA IMPERIAL 1000$',
    duration: '0:50'
  }
];
