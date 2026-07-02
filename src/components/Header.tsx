import { Sparkles, Share2, ShieldCheck, Heart, Crown, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  userProfile: UserProfile;
  onOpenShareModal: () => void;
  onOpenVipSelector?: () => void;
  onLogout?: () => void;
  apkDownloadUrl?: string;
}

export default function Header({ userProfile, onOpenShareModal, onOpenVipSelector, onLogout, apkDownloadUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#39FF14]/20 bg-black/95 px-6 py-4 backdrop-blur-md">
      {/* Left items - Live status LED indicator and APK Download */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-[#39FF14]/20 bg-black px-2.5 py-1.5 text-xs text-gray-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#39FF14]"></span>
          </span>
          <span className="text-[#39FF14] font-mono tracking-widest text-[9px]">LED: LIVE</span>
        </div>

        <a
          href={apkDownloadUrl || "https://drive.google.com/file/d/1TqGkx8aglLR2SyKsi6L-eOW-QBUeeHr5/view?usp=drivesdk"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-[#39FF14]/50 bg-gradient-to-r from-emerald-950/50 to-black px-3 py-1.5 text-[9px] font-mono font-black text-[#39FF14] hover:bg-[#39FF14]/15 hover:border-[#39FF14] transition-all shadow-[0_0_8px_rgba(57,255,20,0.1)] active:scale-95"
          onClick={() => {
            alert("📲 Redirigiendo de forma segura a la descarga oficial del APK original de Tappmusic v1.0...");
          }}
        >
          <Smartphone className="h-3 w-3 text-neon-green animate-pulse" />
          <span className="animate-pulse">DESCARGAR APK</span>
        </a>
      </div>

      {/* Centered Tappmusic.com Name with headphones branding */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500 animate-pulse" />
          <h1 className="text-xl sm:text-2xl font-black tracking-widest text-center select-all text-neon-green">
            Tappmusic<span className="text-white">.com</span>
          </h1>
          <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-bounce" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-[#39FF14] font-black">
          DIOS, FAMILIA Y MENTALIDAD MILLONARIA
        </p>
      </div>

      {/* Right Items - VIP status indicator and Share Button */}
      <div className="flex items-center gap-3">
        {userProfile.isRegistered && onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-red-500/20 bg-black hover:bg-red-500/10 hover:border-red-500/40 transition-all px-2.5 py-2 text-[10px] sm:text-xs font-mono font-bold text-red-500 cursor-pointer"
            title="Cerrar sesión / Registrar nuevo usuario"
          >
            SALIR
          </button>
        )}

        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 rounded-lg border border-[#39FF14]/40 bg-black hover:bg-[#39FF14]/10 transition-all px-3 py-2 text-[10px] sm:text-xs font-mono font-bold text-[#39FF14] cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden md:inline">COMPARTIR</span>
        </button>

        {/* User VIP Badge interactive display / Register Trigger */}
        {!userProfile.isRegistered ? (
          <button
            onClick={onOpenVipSelector}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#39FF14]/50 bg-black hover:bg-[#39FF14]/10 transition-all px-3 py-2 text-[10px] sm:text-xs font-mono font-black text-[#39FF14] animate-pulse cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.15)]"
          >
            <Crown className="h-4 w-4 text-yellow-500" />
            <span>REGISTRO VIP 👑</span>
          </button>
        ) : (
          <button
            onClick={onOpenVipSelector}
            className={`flex items-center gap-2 rounded-xl border p-1 bg-zinc-950 hover:bg-zinc-900 transition-all text-left group pr-2.5 cursor-pointer max-w-[140px] sm:max-w-none ${
              (userProfile.vipLevel || '') === 'VIP CORONA IMPERIAL 1000$' 
                ? 'border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)] bg-gradient-to-tr from-black to-emerald-950/20' 
                : (userProfile.vipLevel || '') === 'VIP PLATINO 420$'
                ? 'border-purple-500/30 text-purple-400'
                : (userProfile.vipLevel || '') === 'VIP DIAMANTE 120$'
                ? 'border-sky-500/30 text-sky-450'
                : (userProfile.vipLevel || '') === 'VIP RUBÍ 40$'
                ? 'border-red-500/30 text-red-400'
                : (userProfile.vipLevel || '') === 'VIP ORO 20$'
                ? 'border-yellow-400/35 text-yellow-300'
                : 'border-zinc-500/30 text-zinc-300'
            }`}
            title="Cambiar Nivel VIP"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#303138] text-[9px] font-black uppercase text-white px-0.5">
              {(userProfile.vipLevel || 'VIP PLATA 10$').split(' ')[1] || 'PLATA'}
            </div>
            <div className="text-left leading-none">
              <p className="text-[10px] font-bold text-white group-hover:underline">@{userProfile.username || 'usuario'}</p>
              <p className="text-[8px] font-mono tracking-wider opacity-80 mt-0.5 uppercase">
                {userProfile.vipLevel || 'VIP PLATA 10$'}
              </p>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}
