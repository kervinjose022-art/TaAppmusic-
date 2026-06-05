import React, { useState } from 'react';
import Header from './components/Header';
import PromoShareCard from './components/PromoShareCard';
import BrainLogo from './components/BrainLogo';
import VipTasks from './components/VipTasks';
import VipReels from './components/VipReels';
import { UserProfile, VipLevel } from './types';
import { 
  Sparkles, ShieldCheck, Share2, CircleAlert, Globe, X, 
  Check, Copy, MessageSquare, Send, Trophy, Flame, UserCheck, Play, ArrowRight, Lock, Eye, EyeOff
} from 'lucide-react';

export default function App() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedModalLink, setCopiedModalLink] = useState(false);
  const [isVipSelectorOpen, setIsVipSelectorOpen] = useState(false);

  // App URLs & Constants
  const sharedUrl = 'https://ais-pre-efepkfwykzkok6uvpgwtks-582716975968.us-east1.run.app';

  // User profile state persistent in React state (initially unregistered or registered)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tappmusic_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      username: 'usuario_vip',
      email: '',
      password: '',
      vipLevel: 'VIP PLATA 10$',
      earnings: 25.50,
      completedTaskIds: ['task_1'],
      isRegistered: false // prompts registration card first
    };
  });

  // Save profile to local storage helper
  const saveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('tappmusic_profile', JSON.stringify(newProfile));
  };

  // Simulated registration fields
  const [inputUsername, setInputUsername] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedInitialVip, setSelectedInitialVip] = useState<VipLevel>('VIP PLATA 10$');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputUsername.trim().toLowerCase() || 'invitado_vip';
    let startEarnings = 10.00;
    if (selectedInitialVip === 'VIP ORO 20$') startEarnings = 20.00;
    else if (selectedInitialVip === 'VIP RUBÍ 40$') startEarnings = 40.00;
    else if (selectedInitialVip === 'VIP DIAMANTE 120$') startEarnings = 120.00;
    else if (selectedInitialVip === 'VIP PLATINO 420$') startEarnings = 420.00;
    else if (selectedInitialVip === 'VIP SÚPER VIP 1000$') startEarnings = 1000.00;

    const updated: UserProfile = {
      username: name,
      email: inputEmail,
      password: inputPassword,
      vipLevel: selectedInitialVip,
      earnings: startEarnings,
      completedTaskIds: [],
      isRegistered: true
    };
    saveProfile(updated);
  };

  const handleUpgradeVip = (lvl: VipLevel) => {
    const backup = { ...userProfile, vipLevel: lvl };
    saveProfile(backup);
    setIsVipSelectorOpen(false);
  };

  const handleLogout = () => {
    // Reset all form inputs to clean blank fields for registration
    setInputUsername('');
    setInputEmail('');
    setInputPassword('');
    
    const updated: UserProfile = {
      username: 'usuario_vip',
      email: '',
      password: '',
      vipLevel: 'VIP PLATA 10$',
      earnings: 25.50,
      completedTaskIds: [],
      isRegistered: false
    };
    saveProfile(updated);
    localStorage.removeItem('tappmusic_profile');
  };

  const copyModalLink = async () => {
    try {
      await navigator.clipboard.writeText(sharedUrl);
      setCopiedModalLink(true);
      setTimeout(() => setCopiedModalLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#39FF14] pb-16 antialiased selection:bg-[#39FF14] selection:text-black">
      {/* Visual background ambient LED glows of Violet & Gold */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-12 left-1/3 h-[400px] w-[400px] rounded-full bg-yellow-500/10 blur-[130px] pointer-events-none" />

      {/* Main Navigation Header */}
      <Header 
        userProfile={userProfile} 
        onOpenShareModal={() => setIsShareModalOpen(true)} 
        onOpenVipSelector={() => setIsVipSelectorOpen(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8 text-center">
        
        {/* CENTERED BRANDING LOGO & LED SLOGAN AREA */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
          {/* Centered Golden & Purple rotating brain with headphones logo */}
          <BrainLogo size="md" />

          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase select-all">
              Tappmusic<span className="text-[#39FF14] text-neon-green font-black">.com</span>
            </h1>
            <p className="text-gray-400 text-xs tracking-wider max-w-md mx-auto leading-relaxed">
              El portal definitivo de fe, familia, mentalidad de éxito y tareas VIP remuneradas con los mejores Reels inspiradores.
            </p>
          </div>
        </div>

        {/* REGISTRATION GUARDIAN CARD (If unregistered, users register to unlock full board) */}
        {!userProfile.isRegistered ? (
          <div className="max-w-lg mx-auto rounded-3xl border-2 border-dashed border-[#39FF14]/30 bg-black p-6 sm:p-8 shadow-[0_0_30px_rgba(57,255,20,0.1)] relative">
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#39FF14]/10 text-[#39FF14] font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold animate-pulse">
              Acceso Pendiente
            </div>

            <div className="space-y-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-400">
                <UserCheck className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Registro de Miembros VIP</h3>
                <p className="text-xs text-gray-400">
                  Regístrate gratis para desbloquear el <strong className="text-[#39FF14]">Panel de Tareas Diarias</strong> y los <strong className="text-purple-400">Reels Motivacionales</strong> de Tappmusic.com
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 pt-2">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] font-bold block">
                    Nombre de Usuario (Nickname)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. melodia_tapp"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    className="w-full text-xs font-semibold bg-black border border-[#39FF14]/30 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="w-full text-xs font-semibold bg-black border border-[#39FF14]/30 rounded-xl px-4 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold block">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        className="w-full text-xs font-semibold bg-black border border-[#39FF14]/30 rounded-xl pl-4 pr-10 py-2.5 text-[#39FF14] placeholder-zinc-800 focus:outline-none focus:border-[#39FF14]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#39FF14] transition-all cursor-pointer focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold block">
                    Selecciona Nivel VIP Inicial (Precios de Activación Oficial)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {([
                      { name: 'VIP PLATA 10$', price: '$10 USD' },
                      { name: 'VIP ORO 20$', price: '$20 USD' },
                      { name: 'VIP RUBÍ 40$', price: '$40 USD' },
                      { name: 'VIP DIAMANTE 120$', price: '$120 USD' },
                      { name: 'VIP PLATINO 420$', price: '$420 USD' },
                      { name: 'VIP SÚPER VIP 1000$', price: '$1000 USD' }
                    ]).map(v => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setSelectedInitialVip(v.name as VipLevel)}
                        className={`p-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex flex-col items-center justify-center gap-1 uppercase ${
                          selectedInitialVip === v.name
                            ? 'bg-purple-950/40 text-white border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)] bg-radial'
                            : 'bg-zinc-950 text-gray-400 border-zinc-800 hover:border-zinc-700/60'
                        }`}
                      >
                        <span className="font-extrabold tracking-tight text-center">{v.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                          selectedInitialVip === v.name
                            ? 'bg-purple-900/50 text-purple-200'
                            : 'bg-zinc-900/50 text-zinc-500'
                        }`}>
                          {v.price}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-2 font-mono">
                    * Los rangos superiores otorgan bonos multiplicadores automáticos para tus regalías de tareas.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-xs font-black uppercase text-black font-sans tracking-widest transition-all cursor-pointer active:scale-95 text-shadow-none"
                >
                  <span>Registrarme y Acceder</span>
                  <ArrowRight className="h-4 w-4 text-black" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* FULL BOARD LAYOUT (Unlocked upon registration) */
          <div className="space-y-8">
            
            {/* INFORMATIVE GREEN PROMO DECK */}
            <div className="relative overflow-hidden rounded-2xl border border-[#39FF14]/30 bg-zinc-950/50 p-6 md:p-8 backdrop-blur-sm shadow-2xl text-left">
              <div className="absolute inset-0 bg-[#39FF14]/[0.01] pointer-events-none" />
              
              <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-[#39FF14]/10 border border-[#39FF14]/30 px-2.5 py-0.5 text-[9px] font-black text-[#39FF14] uppercase tracking-widest">
                      Lanzamiento Oficial Activo
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> Enlace de Difusión Optimizado
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                    ¡Está listo nuestro proyecto, hermano! 🚀
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    Hemos subido todo a producción. Ya puedes compartir el enlace definitivo <strong className="text-white lower">Tappmusic.com</strong> con tus fanáticos para que realicen tareas VIP de fe, familia y mentalidad millonaria, ganen regalías y disfruten de los mejores Reels de motivación en vivo.
                  </p>
                </div>

                {/* Quick copy widget for deployment link */}
                <div className="w-full lg:w-auto shrink-0 bg-black border border-[#39FF14]/20 rounded-2xl p-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start gap-4">
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-[#39FF14] tracking-wider uppercase">Link de Lanzamiento</p>
                    <p className="text-xs font-mono text-zinc-300 truncate max-w-[180px] select-all lowercase">{sharedUrl}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={copyModalLink}
                      className={`flex-1 sm:flex-initial flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${
                        copiedModalLink 
                          ? 'bg-emerald-600 text-white border-none' 
                          : 'bg-black border border-[#39FF14]/40 hover:bg-[#39FF14]/15 text-[#39FF14] active:scale-95'
                      }`}
                    >
                      {copiedModalLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedModalLink ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39FF14]/5 hover:bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/20 transition-all cursor-pointer"
                      title="Difundir plataforma"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TWO COLUMN BENTO GRID OF FEED AND TASKS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start max-w-5xl mx-auto">
              
              {/* Column 1: VIP Tasks Board (Hacer Tareas) */}
              <div className="space-y-4">
                <div className="text-left pl-1">
                  <h3 className="text-sm font-black tracking-widest text-purple-400 uppercase">💼 Hacer Tareas Diarias</h3>
                  <p className="text-zinc-500 text-[11px]">Completa misiones inspiradoras para acumular regalías.</p>
                </div>
                <VipTasks 
                  userProfile={userProfile} 
                  setUserProfile={setUserProfile} 
                />
              </div>

              {/* Column 2: Instagram/TikTok Style Reels Filtered by VIP Levels */}
              <div className="space-y-4">
                <div className="text-left pl-1">
                  <h3 className="text-sm font-black tracking-widest text-yellow-400 uppercase">📱 Reels de Fe y Éxito</h3>
                  <p className="text-zinc-500 text-[11px]">Mira loops, videos cortos de fe y deja comentarios VIP.</p>
                </div>
                <VipReels currentVip={userProfile.vipLevel} />
              </div>

            </div>

            {/* Support instructions container */}
            <div className="rounded-2xl border border-white/5 bg-zinc-950/30 p-5 text-left max-w-5xl mx-auto">
              <div className="flex items-start gap-3.5">
                <CircleAlert className="h-5 w-5 text-purple-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-xs font-black tracking-wider text-white uppercase">Información general del servidor</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-mono">
                    Tappmusic.com ha sincronizado su base de datos con enlaces CDN de fe, familia y mentalidad de abundancia. El botón de "Hacer Tareas" calcula y liquida pagos directamente en tiempo real en la billetera local de tu navegador. Sube de VIP haciendo click en tu medalla del menú de arriba en cualquier momento para poner a prueba nuestro sistema.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* SHARE MODAL DIALOG */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-[#39FF14]/30 bg-black p-6 shadow-2xl overflow-hidden relative text-center">
            <div className="absolute top-4 right-4 animate-led-flash">
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14]">
                <Share2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-md font-black tracking-widest text-white uppercase">Compartir plataforma</h3>
                <p className="text-[11px] text-zinc-400">Copia el link de lanzamiento de Tappmusic.com para enviar a tu gente.</p>
              </div>

              <div className="rounded-xl bg-black border border-white/10 p-3 flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-300 truncate max-w-[170px] select-all lowercase">{sharedUrl}</span>
                <button
                  onClick={copyModalLink}
                  className={`flex h-8 items-center gap-1 rounded-lg px-3 text-[10px] font-black transition-all cursor-pointer uppercase ${
                    copiedModalLink 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#39FF14]/10 text-[#39FF14] hover:bg-[#39FF14]/20 border border-[#39FF14]/20'
                  }`}
                >
                  {copiedModalLink ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(`🔥 ¡Hermano, ya está activa nuestra plataforma Tappmusic.com! Escucha el mejor flow dominicano, Reels VIP y gana regalías con tareas aquí: ${sharedUrl}`);
                    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
                  }}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer border-none"
                >
                  <MessageSquare className="h-4 w-4 text-white" />
                  <span>Compartir por WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(sharedUrl)}&text=${encodeURIComponent('🔥 ¡Ya está activa Tappmusic.com! Reels latinos y tareas remuneradas en vivo.')}`, '_blank');
                  }}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-all cursor-pointer border-none"
                >
                  <Send className="h-4 w-4 text-white" />
                  <span>Compartir por Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK SELECTOR VIP DRAWER (For demo flexibility changing tiers instantly) */}
      {isVipSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-purple-500/30 bg-zinc-950 p-6 shadow-2xl relative overflow-hidden text-center">
            
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setIsVipSelectorOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Trophy className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-md font-black text-white uppercase tracking-wider">Cambiar Rango VIP</h3>
                <p className="text-[11px] text-zinc-400">Prueba los diferentes niveles para ver tareas y Reels asociados.</p>
              </div>

              <div className="space-y-2 pt-2 text-left max-h-[350px] overflow-y-auto pr-1">
                {[
                  { lvl: 'VIP PLATA 10$', desc: 'Tareas de $5.50 y $8.00', bonus: 'Bono x1.0', col: 'text-zinc-400' },
                  { lvl: 'VIP ORO 20$', desc: 'Tareas de $12.00 y $15.50', bonus: 'Bono x1.5', col: 'text-yellow-400' },
                  { lvl: 'VIP RUBÍ 40$', desc: 'Tareas de $24.00 y $35.00', bonus: 'Bono x2.2', col: 'text-red-400' },
                  { lvl: 'VIP DIAMANTE 120$', desc: 'Misiones de $50.00 y $75.00', bonus: 'Bono x3.5', col: 'text-sky-400 border border-sky-500/20 px-1 rounded' },
                  { lvl: 'VIP PLATINO 420$', desc: 'Misiones de $150.00 y $220.00', bonus: 'Bono x5.0', col: 'text-purple-400 border border-purple-500/20 px-1 rounded' },
                  { lvl: 'VIP SÚPER VIP 1000$', desc: 'Ganancias de $450.00 y $600.00', bonus: 'Bono x8.0', col: 'text-emerald-400 font-extrabold border border-emerald-500/35 px-1 rounded' }
                ].map((item) => (
                  <button
                    key={item.lvl}
                    onClick={() => handleUpgradeVip(item.lvl as VipLevel)}
                    className="w-full p-2.5 rounded-xl border border-white/5 bg-black hover:border-purple-500/50 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="pr-2">
                      <p className={`text-[11px] font-black uppercase ${item.col}`}>{item.lvl}</p>
                      <p className="text-[9px] text-zinc-500 leading-tight">{item.desc}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded text-white shrink-0">
                      {item.bonus}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => setIsVipSelectorOpen(false)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 font-bold"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
