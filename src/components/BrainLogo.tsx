import { Headphones, Sparkles } from 'lucide-react';

interface BrainLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function BrainLogo({ size = 'md' }: BrainLogoProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-36 w-36 sm:h-40 sm:w-40',
    lg: 'h-48 w-48'
  };

  return (
    <div className="flex flex-col items-center justify-center text-center relative select-none">
      {/* Background ambient glow matching the LED/Neon styling request */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/25 to-yellow-500/25 blur-3xl rounded-full scale-110 pointer-events-none animate-pulse" />

      {/* Rotating Shape and LED glow rings */}
      <div className={`relative flex items-center justify-center ${sizeClasses[size]} rounded-full border border-purple-500/10 p-4 bg-black/60 shadow-[0_0_50px_rgba(168,85,247,0.15)]`}>
        
        {/* Outer glowing orbiting LED ring in gold & violet */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-500/30 animate-[spin_20s_infinite_linear]" />
        <div className="absolute -inset-1.5 rounded-full border border-purple-500/40 animate-[spin_10s_infinite_linear_reverse] animate-led-flash" />

        {/* The Brain Logo with Headphones Vector SVG */}
        <div className="relative w-full h-full animate-brain-rotate flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-4/5 h-4/5 text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left Hemisphere Lobe */}
            <path
              d="M48 20C32 20 25 31 25 45C25 54 29 58 35 63C38 65 41 68 41 71C41 74 44 76 48 76"
              stroke="url(#purpleGoldGradient)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Right Hemisphere Lobe */}
            <path
              d="M52 20C68 20 75 31 75 45C75 54 71 58 65 63C62 65 59 68 59 71C59 74 56 76 52 76"
              stroke="url(#purpleGoldGradient)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Brain Internal folds nodes to simulate intellectual neon circuitry */}
            <path d="M48 28C42 30 35 34 35 41" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
            <path d="M52 28C58 30 65 34 65 41" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
            <path d="M33 48C36 51 44 48 45 42" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M67 48C64 51 56 48 55 42" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
            
            <circle cx="48" cy="20" r="3" fill="#eab308" />
            <circle cx="35" cy="41" r="2.5" fill="#a855f7" />
            <circle cx="65" cy="41" r="2.5" fill="#eab308" />
            <circle cx="40" cy="64" r="3" fill="#a855f7" />
            <circle cx="60" cy="64" r="3" fill="#eab308" />

            {/* Huge DJ Headphones wrap styled in dazzling gold with glowing violet handles */}
            {/* Headphone Arch */}
            <path
              d="M16 50C16 28 28 12 50 12C72 12 84 28 84 50"
              stroke="#eab308"
              strokeWidth="6"
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]"
            />

            {/* Headphone Left Earcup */}
            <rect
              x="10"
              y="42"
              width="10"
              height="20"
              rx="4"
              fill="#12131a"
              stroke="#eab308"
              strokeWidth="3.5"
            />
            {/* Headphone Left Inner Grill Accent */}
            <line x1="15" y1="46" x2="15" y2="58" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />

            {/* Headphone Right Earcup */}
            <rect
              x="80"
              y="42"
              width="10"
              height="20"
              rx="4"
              fill="#12131a"
              stroke="#eab308"
              strokeWidth="3.5"
            />
            {/* Headphone Right Inner Grill Accent */}
            <line x1="85" y1="46" x2="85" y2="58" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />

            {/* Gradients Definition */}
            <defs>
              <linearGradient id="purpleGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Small floating sparkles on top of the brain */}
        <div className="absolute top-2 right-2 animate-bounce">
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="absolute bottom-2 left-2 animate-bounce [animation-delay:0.7s]">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
        </div>
      </div>

      {/* Decorative LED Indicator dots beneath the logo */}
      <div className="flex gap-2.5 mt-4 items-center animate-led-flash">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
        <span className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
      </div>
    </div>
  );
}
