import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  RotateCw, RefreshCw, Shuffle, Heart, Music, ListMusic, 
  AudioLines, Flame, Hourglass, Search, ChevronRight, PlayCircle
} from 'lucide-react';
import { Track, PlaybackState } from '../types';
import { TRACKS } from '../data';

interface MusicPlayerProps {
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
}

export default function MusicPlayer({ currentTrackIndex, setCurrentTrackIndex }: MusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [activeGenre, setActiveGenre] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Favorites State (stored locally)
  const [likedSongIds, setLikedSongIds] = useState<Record<string, boolean>>({
    '1': true,
    '3': true,
  });

  // Track Play Counts
  const [playCounts, setPlayCounts] = useState<Record<string, number>>(
    TRACKS.reduce((acc, t) => ({ ...acc, [t.id]: t.plays }), {})
  );

  const currentTrack = tracks[currentTrackIndex] || TRACKS[0];

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState<'none' | 'one' | 'all'>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  
  // Tab panels: 'canciones' or 'lyrics' or 'queue'
  const [activeTab, setActiveTab] = useState<'tracks' | 'lyrics' | 'queue'>('tracks');

  // HTML Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);

  // Filter track list
  const genres = ['Todos', 'Reggaeton', 'Trap', 'Urban Latino', 'Lo-Fi Beats', 'Chill House'];
  
  const filteredTracks = TRACKS.filter(track => {
    const matchesGenre = activeGenre === 'Todos' || track.genre === activeGenre;
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  // Audio lifecycle handler
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log("Audio play postponed:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex]);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play / Pause event handlers
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          // Increment play count incrementally on play
          setPlayCounts(prev => ({
            ...prev,
            [currentTrack.id]: prev[currentTrack.id] + 1
          }));
        })
        .catch(err => {
          console.error("No se pudo iniciar el audio:", err);
          setIsPlaying(true); // fall back to simulated playing anyway to support preview
        });
    }
  };

  // Audio update handlers
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 300); // fallback default to prevent division by zero
    }
  };

  // Skip songs
  const handleNext = () => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * TRACKS.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
      setCurrentTrackIndex(nextIndex);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const prevIndex = currentTrackIndex === 0 ? TRACKS.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleAudioEnded = () => {
    if (isLooping === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else if (isLooping === 'all' || isShuffled) {
      handleNext();
    } else {
      if (currentTrackIndex < TRACKS.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
    setCurrentTime(val);
  };

  // Format Helper e.g. 03:45
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Favorite toggle
  const toggleLike = (id: string) => {
    setLikedSongIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Cycle loop status
  const cycleLooping = () => {
    setIsLooping(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-inner shadow-white/5">
      
      {/* Invisible Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* LEFT COLUMN: Visualizer, Now Playing, Controls (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
        
        {/* Active Song Billboard */}
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-black p-6 flex flex-col md:flex-row items-center gap-6">
          {/* Dynamic mood backdrop matches song color preset */}
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentTrack.color} opacity-10 blur-2xl group-hover:opacity-20 transition-all duration-700`} />

          {/* Album Cover with Play/Pause button */}
          <div className="relative w-40 h-40 md:w-44 md:h-44 shrink-0 rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] border border-white/10">
            <img 
              referrerPolicy="no-referrer"
              src={currentTrack.coverUrl} 
              alt={currentTrack.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={handlePlayPause}
                className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform shadow-lg hover:bg-blue-500 active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </button>
            </div>

            {/* Simulated Live visualizer bars overlaid in bottom left */}
            {isPlaying && (
              <div className="absolute bottom-2 left-2 flex items-end gap-1 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                <span className="w-1.5 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1.5 h-5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-1.5 h-4 bg-purple-500 rounded-full animate-bounce [animation-delay:0.5s]" />
                <span className="w-1.5 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1 space-y-1 mt-2 md:mt-0 relative">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 text-white border border-white/10">
              {currentTrack.genre}
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight pt-1 select-all">
              {currentTrack.title}
            </h3>
            <p className="text-gray-300 text-sm font-medium">{currentTrack.artist}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-gray-400 pt-2 font-mono">
              <div className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>{(playCounts[currentTrack.id] || currentTrack.plays).toLocaleString()} reproducciones</span>
              </div>
              <div className="flex items-center gap-1">
                <Hourglass className="h-3.5 w-3.5 text-blue-400" />
                <span>{currentTrack.duration} min</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center md:justify-start gap-3">
              <button 
                onClick={() => toggleLike(currentTrack.id)}
                className={`flex h-9 items-center gap-2 rounded-xl border px-4 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  likedSongIds[currentTrack.id]
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                    : 'border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${likedSongIds[currentTrack.id] ? 'fill-current' : ''}`} />
                <span>{likedSongIds[currentTrack.id] ? 'Favorito' : 'Guardar'}</span>
              </button>

              <div className="h-9 w-px bg-white/10 mr-1" />

              {/* Dynamic simulated spectrum wave bars when playing */}
              <div className="flex items-center gap-1 h-6">
                {[...Array(12)].map((_, i) => (
                  <span 
                    key={i} 
                    className="w-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-full transition-all duration-300"
                    style={{
                      height: isPlaying 
                        ? `${Math.max(10, Math.floor(Math.sin((currentTime + i) * 1.5) * 15 + 15))}px` 
                        : '4px',
                      opacity: isPlaying ? 0.8 : 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Playback Controls & Progress Seek Area */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
          
          {/* Progress bar info */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span className="bg-white/5 px-1.5 py-0.5 rounded text-blue-400 font-semibold">{formatTime(currentTime)}</span>
              <span className="text-[10px] text-gray-500">LINEA DE TIEMPO</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <input
              ref={progressRef}
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            
            {/* Play modes loops */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsShuffled(!isShuffled)}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isShuffled ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Aleatorio"
              >
                <Shuffle className="h-4 w-4" />
              </button>

              <button 
                onClick={cycleLooping}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all relative cursor-pointer ${
                  isLooping !== 'none' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={`Bucle: ${isLooping}`}
              >
                {isLooping === 'one' ? <RotateCw className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                {isLooping !== 'none' && (
                  <span className="absolute -top-0.5 -right-0.5 text-[8px] font-black h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    {isLooping === 'one' ? '1' : 'A'}
                  </span>
                )}
              </button>
            </div>

            {/* Core Play Pause Next Skip Buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrev}
                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button 
                onClick={handlePlayPause}
                className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg shadow-blue-500/20 animate-pulse-ring"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>

              <button 
                onClick={handleNext}
                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Volume controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-20 md:w-24 h-1 rounded-lg bg-white/10 appearance-none cursor-pointer accent-blue-500"
              />
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Tabs (Search list, Lyrics, Queue) (5 Columns) */}
      <div className="lg:col-span-5 flex flex-col min-h-[480px]">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-white/5 pb-3 gap-2">
          <button 
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'tracks' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListMusic className="h-3.5 w-3.5" />
            <span>Canciones</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'lyrics' 
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AudioLines className="h-3.5 w-3.5" />
            <span>Letra</span>
          </button>

          <button 
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'queue' 
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>Cola</span>
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="flex-1 mt-4 overflow-y-auto max-h-[380px] pr-1">
          
          {/* TRACKS LIST TAB */}
          {activeTab === 'tracks' && (
            <div className="space-y-4">
              
              {/* Search track & Genre filters container */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar canción o artista..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Horizontal scroll genres */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setActiveGenre(genre)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                        activeGenre === genre 
                          ? 'bg-white text-black' 
                          : 'bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracks Rendered */}
              {filteredTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 space-y-2">
                  <p className="text-xs">No se encontraron pistas de audio.</p>
                  <button 
                    onClick={() => { setActiveGenre('Todos'); setSearchQuery(''); }}
                    className="text-[10px] text-blue-400 hover:underline font-bold"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredTracks.map((track, i) => {
                    // Find actual Index in central TRACKS list
                    const realIndex = TRACKS.findIndex(t => t.id === track.id);
                    const isSelected = realIndex === currentTrackIndex;

                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          setCurrentTrackIndex(realIndex);
                          setIsPlaying(true);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group select-none text-left ${
                          isSelected 
                            ? 'bg-blue-600/10 border border-blue-500/10' 
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-500 w-4 pl-1">
                            {isSelected && isPlaying ? (
                              <PlayCircle className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                            ) : (
                              i + 1
                            )}
                          </span>
                          
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/5 relative">
                            <img 
                              referrerPolicy="no-referrer"
                              src={track.coverUrl} 
                              alt={track.title} 
                              className="h-full w-full object-cover" 
                            />
                            {isSelected && isPlaying && (
                              <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                                <Pause className="h-3.5 w-3.5 text-white" />
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                              {track.title}
                            </h4>
                            <p className="text-[10.5px] text-gray-400">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-gray-500">{track.duration}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(track.id);
                            }}
                            className={`h-7 w-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer ${
                              likedSongIds[track.id] ? 'text-rose-500' : 'text-gray-500 group-hover:text-gray-300'
                            }`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${likedSongIds[track.id] ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* LYRICS PANEL TAB */}
          {activeTab === 'lyrics' && (
            <div className="rounded-xl bg-black/30 border border-white/5 p-4 min-h-[200px] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black tracking-wider text-purple-400 uppercase mb-3 flex items-center gap-1.5">
                  <AudioLines className="h-3.5 w-3.5" /> Letras de Canción en Español
                </h3>
                
                {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
                  <div className="space-y-3.5 text-center py-2">
                    {currentTrack.lyrics.map((line, idx) => {
                      // Simple simulated timeline lyrics highlighting by dividing lines amongst track length
                      const songSegmentRatio = duration / currentTrack.lyrics!.length;
                      const isLineActive = isPlaying && currentTime >= (idx * songSegmentRatio) && currentTime < ((idx + 1) * songSegmentRatio);

                      return (
                        <p 
                          key={idx}
                          className={`text-xs font-medium leading-relaxed transition-all duration-350 ${
                            isLineActive 
                              ? 'text-white scale-110 font-bold bg-purple-500/10 rounded-lg p-1.5 border border-purple-500/20' 
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic text-center py-10">Lyrics instrumentales para esta canción.</p>
                )}
              </div>
              
              <div className="border-t border-purple-500/10 mt-4 pt-3 flex items-center justify-between text-[10px] text-purple-400">
                <span>TaAppMusic Lyrics Engine ®</span>
                <span className="font-mono">Sincronizado</span>
              </div>
            </div>
          )}

          {/* QUEUE LIST TAB */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>SONANDO AHORA</span>
                <span className="text-emerald-400">ACTIVO</span>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0">
                  <img src={currentTrack.coverUrl} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{currentTrack.title}</h4>
                  <p className="text-[10px] text-gray-400">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-gray-400 pt-2">
                <span>SIGUIENTE EN COLA</span>
                <span className="text-[10px] text-amber-500 font-mono">{(TRACKS.length - 1)} TEMAS RESTANTES</span>
              </div>

              <div className="space-y-1">
                {TRACKS.filter(t => t.id !== currentTrack.id).map((track, index) => {
                  const realIndexInBackend = TRACKS.findIndex(t => t.id === track.id);
                  return (
                    <div 
                      key={track.id}
                      onClick={() => {
                        setCurrentTrackIndex(realIndexInBackend);
                        setIsPlaying(true);
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500 w-4">{index + 1}</span>
                        <div className="h-8 w-8 rounded overflow-hidden">
                          <img src={track.coverUrl} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{track.title}</h4>
                          <p className="text-[10px] text-gray-400">{track.artist}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
        
        {/* Release signature watermark */}
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>CODA: TAAPPMUSIC-2026</span>
          <span>BPM SYNC CODES</span>
        </div>

      </div>

    </div>
  );
}
