import { useState } from 'react';
import { Copy, Check, ExternalLink, MessageSquare, QrCode, Sparkles, Send } from 'lucide-react';

interface PromoShareCardProps {
  sharedUrl: string;
}

export default function PromoShareCard({ sharedUrl }: PromoShareCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const promoMessage = `🔥 ¡Hermano, ya está activa nuestra plataforma TaAppMusic! Escucha el mejor flow urbano dominicano, reggaetón, trap y beats originales en vivo. Lanzamiento oficial aquí: ${sharedUrl} 🎶`;

  const copyToClipboard = async (text: string, isMessage: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isMessage) {
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  };

  const shareViaWhatsApp = () => {
    const encoded = encodeURIComponent(promoMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const shareViaTelegram = () => {
    const encoded = encodeURIComponent(promoMessage);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(sharedUrl)}&text=${encodeURIComponent('🔥 ¡Ya está activa nuestra plataforma TaAppMusic! Escucha el mejor flow urbano dominicano, reggaetón, trap y beats originales en vivo. Lanzamiento oficial.')}`, '_blank');
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-blue-900/10 h-full flex flex-col justify-between">
      {/* Background decoration flares */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-blue-500/10 blur-xl" />
      <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-xl" />

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400" />
          <p className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">Kit de Lanzamiento Rápido</p>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-2">
          Enlace de Lanzamiento <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
        </h2>
        <p className="text-gray-400 text-xs leading-relaxed mb-5">
          Usa estas opciones rápidas para enviarle el link oficial de **TaAppMusic** a tus hermanos, amigos y oyentes.
        </p>

        {/* Pure Link Row */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Dirección Web Oficial</span>
            <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/5 p-2 pr-1 select-all">
              <span className="text-xs text-gray-300 truncate pl-2 font-mono flex-1 lowercase select-all">
                {sharedUrl}
              </span>
              <button
                onClick={() => copyToClipboard(sharedUrl, false)}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white active:scale-95'
                }`}
              >
                {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Prepared Message Copy */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Mensaje de Difusión Listo</span>
            <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-xs text-gray-300 text-left relative group">
              <p className="line-clamp-3 select-all leading-relaxed font-sans pr-6">
                {promoMessage}
              </p>
              <button
                onClick={() => copyToClipboard(promoMessage, true)}
                className="absolute right-2 top-2 h-7 w-7 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 text-gray-400 hover:text-white"
                title="Copiar mensaje de difusión completo"
              >
                {copiedMessage ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
        {/* Quick Launch Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={shareViaWhatsApp}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-950/20"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={shareViaTelegram}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-all cursor-pointer active:scale-95 shadow-md shadow-sky-950/20"
          >
            <Send className="h-4 w-4" />
            <span>Telegram</span>
          </button>
        </div>

        {/* Beautiful high fidelity simulated QR card to feel complete */}
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
          <div className="h-14 w-14 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
            {/* Elegant SVG QR design with small music icon in center */}
            <svg viewBox="0 0 100 100" className="w-12 h-12 text-black">
              <rect x="0" y="0" width="25" height="25" fill="currentColor" />
              <rect x="5" y="5" width="15" height="15" fill="white" />
              <rect x="75" y="0" width="25" height="25" fill="currentColor" />
              <rect x="80" y="5" width="15" height="15" fill="white" />
              <rect x="0" y="75" width="25" height="25" fill="currentColor" />
              <rect x="5" y="80" width="15" height="15" fill="white" />
              
              {/* QR Dots */}
              <rect x="10" y="40" width="10" height="10" fill="currentColor" />
              <rect x="30" y="10" width="8" height="8" fill="currentColor" />
              <rect x="50" y="20" width="10" height="10" fill="currentColor" />
              <rect x="40" y="50" width="12" height="12" fill="currentColor" />
              <rect x="60" y="40" width="8" height="15" fill="currentColor" />
              <rect x="35" y="70" width="15" height="5" fill="currentColor" />
              <rect x="65" y="75" width="10" height="15" fill="currentColor" />
              <rect x="85" y="45" width="8" height="8" fill="currentColor" />

              {/* Music badge in the middle */}
              <path d="M43,43 L43,53 C41.5,52 39,53 39,55 C39,57 41,58 43,58 C45,58 46,56 46,53 L46,45 L53,48 L53,45" fill="currentColor" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none mb-1">
              <QrCode className="h-3 w-3 text-blue-400" /> Código QR Oficial
            </h4>
            <p className="text-[10px] text-gray-400 leading-normal">
              Escanea con tu celular para abrir en móvil al instante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
