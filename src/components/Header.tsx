import { Music, Radio, Share2 } from 'lucide-react';

interface HeaderProps {
  userEmail: string;
  onOpenShareModal: () => void;
}

export default function Header({ userEmail, onOpenShareModal }: HeaderProps) {
  const username = userEmail.split('@')[0];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#0b0c10]/80 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 text-white">
          <Music className="h-5 w-5 animate-bounce-slow" />
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0b0c10]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            TaApp<span className="text-blue-500">Music</span>
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-emerald-400 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Lanzamiento Oficial Activo
          </div>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
          <Radio className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          <span>Servidor Cloud Run Estable</span>
        </div>
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Compartir Plataforma</span>
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-1.5 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-xs font-bold text-white capitalize">
            {username.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white truncate max-w-[100px]">{username}</p>
            <p className="text-[10px] text-gray-400">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
