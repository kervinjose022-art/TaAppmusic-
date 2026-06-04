import { useState } from 'react';
import Header from './components/Header';
import PromoShareCard from './components/PromoShareCard';
import MusicPlayer from './components/MusicPlayer';
import { 
  Sparkles, ShieldCheck, Share2, CircleAlert, Globe, X, Check, Copy, MessageSquare, Send
} from 'lucide-react';

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedModalLink, setCopiedModalLink] = useState(false);

  // Official Shared App URL provided by the AI Studio environment
  const sharedUrl = 'https://ais-pre-efepkfwykzkok6uvpgwtks-582716975968.us-east1.run.app';
  // User Email retrieved from metadata
  const userEmail = 'kervinjose022@gmail.com';

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
    <div className="min-h-screen bg-[#07070a] text-[#f3f4f6] selection:bg-blue-600 selection:text-white pb-12 antialiased">
      {/* Visual neon ambient globs */}
      <div className="fixed top-0 left-1/4 h-[400px] w-[500px] -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/0 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 h-[400px] w-[500px] translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/0 blur-[130px] pointer-events-none" />

      {/* Main Header */}
      <Header 
        userEmail={userEmail} 
        onOpenShareModal={() => setIsShareModalOpen(true)} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* TOP INTRO BANNER: Greet user & provide quick link visibility */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/10 bg-gradient-to-r from-blue-950/20 via-indigo-950/15 to-black/30 p-6 md:p-8 backdrop-blur-sm shadow-xl">
          <div className="absolute inset-0 bg-blue-500/[0.02] mix-blend-overlay" />
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  PLATAFORMA LANZADA
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Enlace de Producción Listo
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                ¡Está Activa, Mi Hermano! 🚀
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Aquí tienes el enlace definitivo listo para tus usuarios. Comparte, publica en tus redes, o envíalo por WhatsApp para que todos tus hermanos entren gratis a disfrutar del flow de <strong className="text-white">TaAppMusic</strong>.
              </p>
            </div>

            {/* Quick action card inside the hero row */}
            <div className="w-full md:w-auto shrink-0 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-4">
              <div className="text-left">
                <p className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">Link de Lanzamiento</p>
                <p className="text-xs font-mono text-gray-300 truncate max-w-[200px] select-all lowercase">{sharedUrl}</p>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto md:w-full lg:w-auto">
                <button
                  onClick={copyModalLink}
                  className={`flex-1 sm:flex-initial flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${
                    copiedModalLink 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                  }`}
                >
                  {copiedModalLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedModalLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                  title="Difundir plataforma"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COMPONENT BODY SPLIT: 
            Left side: Music Player (9 Columns equivalence) 
            Right side: Share panel (3 Columns equivalence) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="space-y-2 mb-4">
              <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Reproductor En Vivo
              </h2>
              <p className="text-gray-400 text-xs">Escucha tracks exclusivos y sigue la letra sincronizada en tiempo real.</p>
            </div>
            <MusicPlayer 
              currentTrackIndex={currentTrackIndex} 
              setCurrentTrackIndex={setCurrentTrackIndex} 
            />
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-2 mb-4">
              <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" /> Lanzar a Usuarios
              </h2>
              <p className="text-gray-400 text-xs">Difusión rápida del link original.</p>
            </div>
            <PromoShareCard sharedUrl={sharedUrl} />
          </div>
        </div>
        
        {/* Support instructions container */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5">
          <div className="flex items-start gap-3.5">
            <CircleAlert className="h-5 w-5 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 text-left">
              <h3 className="text-xs font-black tracking-wider text-white uppercase">Guía de Distribución</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                El enlace de arriba es independiente para el uso de tus fanáticos. Pueden abrirlo desde PCs, Tablets, Android o iPhones sin necesidad de iniciar sesión o configurar servidores. Toda la sincronización de audio corre localmente y está optimizada para consumos de banda ancha móviles de baja latencia.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* SHARE MODAL / DRAWER DIALOG */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e0f14] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                <Share2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">Compartir plataforma</h3>
                <p className="text-xs text-gray-400">Elige la vía de difusión para enviar a tus usuarios.</p>
              </div>

              {/* URL card with copy button */}
              <div className="rounded-xl bg-black/50 border border-white/5 p-3 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-300 truncate max-w-[200px] lowercase select-all">
                  {sharedUrl}
                </span>
                <button
                  onClick={copyModalLink}
                  className={`flex h-8 items-center gap-1 rounded-lg px-3 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    copiedModalLink 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white/10 hover:bg-white/15 text-white active:scale-95'
                  }`}
                >
                  {copiedModalLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedModalLink ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Big social share quick launches */}
              <div className="space-y-2 Pt-2">
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(`🔥 ¡Hermano, ya está activa nuestra plataforma TaAppMusic! Escucha el mejor flow urbano y beats aquí: ${sharedUrl}`);
                    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
                  }}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(sharedUrl)}&text=${encodeURIComponent('🔥 ¡Ya está activa TaAppMusic! Escucha el mejor flow dominicano, reggaetón y trap aquí!')}`, '_blank');
                  }}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Compartir por Telegram</span>
                </button>
              </div>

              <div className="pt-3 border-t border-white/5 text-center">
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-[11px] text-gray-500 hover:text-gray-300 font-semibold"
                >
                  Cerrar ventana
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
