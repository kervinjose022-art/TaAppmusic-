import { Headphones, Radio, Share2, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  userProfile: UserProfile;
  onOpenShareModal: () => void;
  onOpenVipSelector?: () => void;
}

export default function Header({ userProfile, onOpenShareModal, onOpenVipSelector }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#39FF14]/20 bg-black/95 px-6 py-4 backdrop-blur-md">
      {/* Left items - Live status LED indicator */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#39FF14]/20 bg-black px-3 py-1.5 text-xs text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
          </span>
          <span className="text-[#39FF14] font-mono tracking-widest text-[10px]">LED: LIVE</span>
        </div>
      </div>

      {/* Centered Tappmusic.com Name with headphones branding */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-purple-400 animate-pulse" />
          <h1 className="text-xl sm:text-2xl font-black tracking-widest text-center select-all text-neon-green">
            Tappmusic<span className="text-white">.com</span>
          </h1>
          <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-bounce" />
        </div>
        <p className="text-[9px] uppercase tracking-[0.25em] text-purple-400 font-bold">
          Cerebro LED de Sonido Dominicano
        </p>
      </div>

      {/* Right Items - VIP status indicator and Share Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 rounded-lg border border-[#39FF14]/40 bg-black hover:bg-[#39FF14]/10 transition-all px-3 py-2 text-[10px] sm:text-xs font-mono font-bold text-[#39FF14] cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden md:inline">COMPARTIR</span>
        </button>

        {/* User VIP Badge interactive display */}
        <button
          onClick={onOpenVipSelector}
          className={`flex items-center gap-2 rounded-xl border p-1 bg-zinc-950 hover:bg-zinc-900 transition-all text-left group pr-2.5 cursor-pointer max-w-[140px] sm:max-w-none ${
            userProfile.vipLevel === 'VIP 4' 
              ? 'border-emerald-500/30 text-emerald-400' 
              : userProfile.vipLevel === 'VIP 3'
              ? 'border-amber-500/30 text-amber-400'
              : userProfile.vipLevel === 'VIP 2'
              ? 'border-purple-500/30 text-purple-400'
              : 'border-[#39FF14]/20 text-[#39FF14]'
          }`}
          title="Cambiar Nivel VIP"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#303138] text-[10px] font-black uppercase text-white">
            {userProfile.vipLevel.split(' ')[1]}
          </div>
          <div className="text-left leading-none">
            <p className="text-[10px] font-bold text-white group-hover:underline">@{userProfile.username}</p>
            <p className="text-[8px] font-mono tracking-wider opacity-80 mt-0.5 uppercase">
              {userProfile.vipLevel}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
