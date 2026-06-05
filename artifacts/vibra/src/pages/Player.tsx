import { useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { Equalizer } from "@/components/Equalizer";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat2,
  Upload, Music2, Volume2, Heart, Trash2,
  Plus, ListMusic, Clock, ChevronLeft, X,
  Loader2, Search, SortAsc, SortDesc,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mood definitions ─────────────────────────────────────────────────────────

const MOODS = [
  { id: "feliz",     label: "Feliz",     emoji: "😊", color: "from-yellow-500/20 to-amber-500/10",   border: "border-yellow-500/40",  text: "text-yellow-300",
    desc: "Tu energía brilla con fuerza hoy.", rec: "Pop energético o dance music que te haga mover el cuerpo." },
  { id: "triste",    label: "Triste",    emoji: "😔", color: "from-blue-500/20 to-indigo-500/10",    border: "border-blue-500/40",    text: "text-blue-300",
    desc: "Las emociones profundas también tienen su belleza.", rec: "Indie melancólico o piano que acompañe sin interrumpir." },
  { id: "enojado",   label: "Enojado",   emoji: "😤", color: "from-red-500/20 to-rose-500/10",      border: "border-red-500/40",     text: "text-red-300",
    desc: "Esa energía es combustible. Canalízala bien.", rec: "Rock intenso o hip-hop de alto voltaje." },
  { id: "relajado",  label: "Relajado",  emoji: "😌", color: "from-green-500/20 to-emerald-500/10", border: "border-green-500/40",   text: "text-green-300",
    desc: "En calma. El momento presente es todo.", rec: "Lo-fi, jazz suave o ambient." },
  { id: "motivado",  label: "Motivado",  emoji: "💪", color: "from-orange-500/20 to-amber-500/10",  border: "border-orange-500/40",  text: "text-orange-300",
    desc: "Listo para conquistar. Nada te detiene.", rec: "EDM de alta energía o hip-hop motivacional." },
  { id: "enamorado", label: "Enamorado", emoji: "💕", color: "from-pink-500/20 to-rose-500/10",     border: "border-pink-500/40",    text: "text-pink-300",
    desc: "El corazón late diferente.", rec: "R&B suave o baladas que capturen esa sensación." },
  { id: "confiado",  label: "Confiado",  emoji: "😎", color: "from-cyan-500/20 to-teal-500/10",     border: "border-cyan-500/40",    text: "text-cyan-300",
    desc: "Sabes exactamente quién eres.", rec: "Hip-hop cool, funk o jazz moderno." },
  { id: "fiesta",    label: "Fiesta",    emoji: "🎉", color: "from-purple-500/20 to-fuchsia-500/10", border: "border-purple-500/40", text: "text-purple-300",
    desc: "La noche llama. El dancefloor te espera.", rec: "Electrónica, reggaeton o pop urbano." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(secs: number) {
  if (!secs || !isFinite(secs) || isNaN(secs)) return "";
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
}
function fmtFull(secs: number) {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
}
function timeAgo(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  if (m < 1440) return `hace ${Math.floor(m / 60)}h`;
  return `hace ${Math.floor(m / 1440)}d`;
}

// ─── Track row ────────────────────────────────────────────────────────────────

function TrackRow({
  name, index, isActive, isPlaying, isFavorite,
  duration, badge, playlistCount = 0,
  onPlay, onFavorite, onRemove,
}: {
  name: string; index: number; trackId: string;
  isActive: boolean; isPlaying: boolean; isFavorite: boolean;
  duration?: number; badge?: string; playlistCount?: number;
  onPlay: () => void; onFavorite: (e: React.MouseEvent) => void; onRemove?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onPlay}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all group",
        isActive
          ? "bg-primary/12 border border-primary/35"
          : "bg-card border border-transparent hover:border-border hover:bg-card/80"
      )}
    >
      {/* Index / EQ */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
        isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
      )}>
        {isActive && isPlaying
          ? <Equalizer isPlaying bars={3} className="h-4 w-5 justify-center" barClassName="w-1 bg-white" />
          : index + 1
        }
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate", isActive ? "text-primary font-medium" : "text-foreground")}>{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {duration ? <span className="text-[11px] text-muted-foreground/60">{fmt(duration)}</span> : null}
          {playlistCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground/50">
              <ListMusic size={9} />{playlistCount}
            </span>
          )}
        </div>
      </div>

      {badge && <span className="text-[10px] text-muted-foreground/55 shrink-0">{badge}</span>}

      <button onClick={onFavorite}
        className={cn("p-1.5 rounded-full transition-colors shrink-0",
          isFavorite ? "text-pink-400" : "text-muted-foreground/25 hover:text-pink-400 opacity-0 group-hover:opacity-100")}>
        <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
      </button>
      {onRemove && (
        <button onClick={onRemove}
          className="p-1.5 rounded-full text-muted-foreground/25 hover:text-destructive transition-colors shrink-0 opacity-0 group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type LibraryView = "todos" | "recientes" | "favoritos" | "listas";
type SortMode = "default" | "alpha";

export function Player() {
  const {
    tracks, currentTrack, currentTrackIndex, isPlaying,
    shuffle, repeat, volume, progress, duration, isLoading,
    favorites, recents, playlists,
    loadTracks, play, pause, playTrack, next, prev,
    setMood, setVolume, toggleShuffle, toggleRepeat, seek, currentMood,
    toggleFavorite, removeTrack,
    addPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist,
  } = usePlayer();

  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"music" | "vibra">("music");
  const [libraryView, setLibraryView] = useState<LibraryView>("todos");
  const [selectedMood, setSelectedMood] = useState<string | null>(currentMood);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const moodData = MOODS.find((m) => m.id === selectedMood);
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  const handleFiles = useCallback((files: FileList | null) => {
    if (files) loadTracks(Array.from(files));
  }, [loadTracks]);

  const handleSelectMood = (id: string) => { setSelectedMood(id); setMood(id); };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    addPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setShowNewPlaylist(false);
  };

  // Derived lists
  const favTracks = tracks.filter((t) => favorites.includes(t.id));

  const recentItems = useMemo(() =>
    recents
      .map((r) => ({ ...r, track: tracks.find((t) => t.id === r.trackId) }))
      .filter((r) => r.track) as { trackId: string; name: string; timestamp: number; track: typeof tracks[0] }[],
    [recents, tracks]
  );

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistTracks = selectedPlaylist
    ? (selectedPlaylist.trackIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as typeof tracks)
    : [];

  const playlistCountFor = (trackId: string) => playlists.filter((p) => p.trackIds.includes(trackId)).length;
  const idxOf = (trackId: string) => tracks.findIndex((t) => t.id === trackId);

  // Filtered + sorted tracks
  const filteredTracks = useMemo(() => {
    let list = tracks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    if (sortMode === "alpha") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [tracks, searchQuery, sortMode]);

  return (
    <motion.div
      className="min-h-screen px-4 py-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HBG + VIBRA header */}
      <div className="text-center mb-6">
        <div className="flex justify-center gap-3 mb-1">
          {["H", "B", "G"].map((l, i) => (
            <span key={l} className="font-display text-[10px] font-black text-muted-foreground/40 tracking-widest">{l}</span>
          ))}
        </div>
        <h1 className="font-display text-2xl font-bold tracking-wider glow-text">VIBRA</h1>
      </div>

      {/* Main tabs */}
      <div className="flex rounded-full overflow-hidden border border-border mb-6 bg-card/50">
        {(["music", "vibra"] as const).map((tab) => (
          <button key={tab} data-testid={`tab-${tab}`} onClick={() => setActiveTab(tab)}
            className={cn("flex-1 py-2.5 text-sm font-medium transition-all",
              activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {tab === "music" ? "Música" : "Vibra"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════ MÚSICA ══════════ */}
        {activeTab === "music" && (
          <motion.div key="music" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>

            {/* Now Playing card */}
            {currentTrack ? (
              <div className="mb-5 rounded-2xl glass-card glow-box overflow-hidden">
                {/* Ambient top bar */}
                <div className="h-1 w-full" style={{
                  background: "linear-gradient(90deg, hsl(270,80%,60%), hsl(195,100%,55%), hsl(300,90%,60%))",
                  backgroundSize: "200% 100%",
                  animation: isPlaying ? "shimmer 3s linear infinite" : undefined,
                }} />

                <div className="p-5">
                  {/* Circular art + track info row */}
                  <div className="flex items-center gap-4 mb-4">

                    {/* Circular art */}
                    <div className="relative shrink-0 w-16 h-16">
                      {/* Pulsing outer rings (only when playing) */}
                      {isPlaying && [0, 1].map((i) => (
                        <div key={i} className="absolute rounded-full animate-ping pointer-events-none"
                          style={{
                            inset: `${-4 - i * 6}px`,
                            border: `1px solid hsl(var(--primary) / ${0.3 - i * 0.12})`,
                            animationDuration: `${1.4 + i * 0.8}s`,
                            animationDelay: `${i * 0.35}s`,
                          }} />
                      ))}
                      {/* Spinning conic-gradient ring */}
                      <div
                        className="absolute inset-0 rounded-full p-[2px]"
                        style={{
                          background: "conic-gradient(from 0deg, hsl(270,80%,60%), hsl(195,100%,55%), hsl(300,90%,60%), hsl(270,80%,60%))",
                          animation: isPlaying ? "spin-slow 5s linear infinite" : undefined,
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                          <Music2 size={22} className="text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Track name + EQ */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-base">{currentTrack.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Equalizer isPlaying={isPlaying} bars={5} className="h-3" barClassName="w-1 bg-primary" />
                        {currentTrack.duration > 0 && (
                          <span className="text-xs text-muted-foreground/55">{fmt(currentTrack.duration)}</span>
                        )}
                      </div>
                    </div>

                    {/* Favorite */}
                    <button onClick={() => toggleFavorite(currentTrack.id)}
                      className={cn("p-2 rounded-full transition-colors shrink-0",
                        favorites.includes(currentTrack.id) ? "text-pink-400" : "text-muted-foreground hover:text-pink-400")}>
                      <Heart size={18} fill={favorites.includes(currentTrack.id) ? "currentColor" : "none"} />
                    </button>
                  </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <input data-testid="slider-progress" type="range" min={0} max={duration || 1} value={progress}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="w-full h-1.5 accent-primary cursor-pointer rounded-full"
                    style={{ background: `linear-gradient(to right, hsl(var(--primary)) ${progressPct}%, hsl(var(--border)) ${progressPct}%)` }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{fmtFull(progress)}</span>
                    <span>{fmtFull(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  {/* Shuffle + Repeat */}
                  <div className="flex items-center gap-1">
                    <button data-testid="button-shuffle" onClick={toggleShuffle}
                      className={cn("p-2 rounded-full transition-colors",
                        shuffle ? "text-primary bg-primary/15" : "text-muted-foreground hover:text-foreground")}>
                      <Shuffle size={16} />
                    </button>
                    <button data-testid="button-repeat" onClick={toggleRepeat}
                      className={cn("p-2 rounded-full transition-colors relative",
                        repeat ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground")}>
                      <Repeat2 size={16} />
                      {repeat && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" />
                      )}
                    </button>
                  </div>

                  <button data-testid="button-prev" onClick={prev}
                    className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <SkipBack size={22} />
                  </button>

                  <button data-testid="button-play-pause" onClick={isPlaying ? pause : play}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all neon-pulse"
                    style={{
                      background: "linear-gradient(135deg, hsl(270,80%,52%), hsl(195,100%,48%))",
                      boxShadow: "0 0 25px hsla(270,80%,65%,0.45)",
                    }}>
                    {isPlaying
                      ? <Pause size={24} fill="white" className="text-white" />
                      : <Play size={24} fill="white" className="text-white ml-1" />
                    }
                  </button>

                  <button data-testid="button-next" onClick={next}
                    className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <SkipForward size={22} />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-1">
                    <Volume2 size={15} className="text-muted-foreground" />
                    <input data-testid="slider-volume" type="range" min={0} max={1} step={0.05} value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-14 h-1 accent-primary cursor-pointer rounded-full" />
                  </div>
                </div>
                </div>{/* /p-5 */}
              </div>
            ) : isLoading ? (
              <div className="mb-5 p-6 rounded-2xl bg-card border border-border text-center">
                <Loader2 size={32} className="mx-auto text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Restaurando biblioteca...</p>
              </div>
            ) : (
              <div className="mb-5 p-6 rounded-2xl bg-card border border-dashed border-border text-center">
                <Music2 size={38} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">Agrega tu música para comenzar</p>
                <p className="text-muted-foreground/55 text-xs mt-1">↓ Sube archivos abajo</p>
              </div>
            )}

            {/* Library filter pills */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {([
                { id: "todos",    Icon: Music2,    label: "Todos" },
                { id: "recientes",Icon: Clock,     label: "Recientes" },
                { id: "favoritos",Icon: Heart,     label: "Favoritos" },
                { id: "listas",   Icon: ListMusic, label: "Listas" },
              ] as const).map(({ id, Icon, label }) => (
                <button key={id} data-testid={`filter-${id}`}
                  onClick={() => { setLibraryView(id); setSelectedPlaylistId(null); setSearchQuery(""); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                    libraryView === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  )}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── Todos ── */}
              {libraryView === "todos" && (
                <motion.div key="todos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                  {/* Upload zone */}
                  <div data-testid="zone-upload"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    className="border-2 border-dashed border-primary/25 rounded-2xl p-5 text-center cursor-pointer hover:border-primary/55 hover:bg-primary/4 transition-all mb-4 group"
                  >
                    <Upload size={22} className="mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-primary">Subir música</p>
                    <p className="text-xs text-muted-foreground mt-0.5">MP3, WAV, OGG, M4A, FLAC — arrastra o haz click</p>
                    <input ref={fileRef} type="file" accept=".mp3,.wav,.ogg,.m4a,.flac,.aac,audio/*"
                      multiple className="hidden" data-testid="input-file-upload"
                      onChange={(e) => handleFiles(e.target.files)} />
                  </div>

                  {tracks.length > 0 && (
                    <>
                      {/* Search + sort */}
                      <div className="flex gap-2 mb-3">
                        <div className="flex-1 relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Buscar canciones..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/50 transition-colors"
                          />
                          {searchQuery && (
                            <button onClick={() => setSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              <X size={12} />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setSortMode((s) => s === "alpha" ? "default" : "alpha")}
                          className={cn("px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors shrink-0",
                            sortMode === "alpha" ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground bg-card")}
                        >
                          {sortMode === "alpha" ? <SortAsc size={14} /> : <SortDesc size={14} />}
                          A–Z
                        </button>
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        {searchQuery
                          ? `${filteredTracks.length} resultado${filteredTracks.length !== 1 ? "s" : ""}`
                          : `Biblioteca · ${tracks.length} canción${tracks.length !== 1 ? "es" : ""}`
                        }
                      </p>

                      {filteredTracks.length > 0 ? (
                        <div className="space-y-1.5">
                          {filteredTracks.map((t, i) => {
                            const realIdx = idxOf(t.id);
                            return (
                              <TrackRow key={t.id} name={t.name} index={i} trackId={t.id}
                                isActive={currentTrackIndex === realIdx} isPlaying={isPlaying}
                                isFavorite={favorites.includes(t.id)}
                                duration={t.duration}
                                playlistCount={playlistCountFor(t.id)}
                                onPlay={() => playTrack(realIdx)}
                                onFavorite={(e) => { e.stopPropagation(); toggleFavorite(t.id); }}
                                onRemove={(e) => { e.stopPropagation(); removeTrack(t.id); }}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-muted-foreground py-6">
                          Sin resultados para "{searchQuery}"
                        </p>
                      )}
                    </>
                  )}

                  {!isLoading && tracks.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">No hay canciones en la biblioteca</p>
                  )}
                </motion.div>
              )}

              {/* ── Recientes ── */}
              {libraryView === "recientes" && (
                <motion.div key="recientes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {recentItems.length > 0 ? (
                    <div className="space-y-1.5">
                      {recentItems.map((r, i) => (
                        <TrackRow key={`${r.trackId}-${i}`} name={r.name} index={i} trackId={r.trackId}
                          isActive={currentTrack?.id === r.trackId} isPlaying={isPlaying}
                          isFavorite={favorites.includes(r.trackId)}
                          duration={r.track.duration}
                          badge={timeAgo(r.timestamp)}
                          onPlay={() => playTrack(idxOf(r.trackId))}
                          onFavorite={(e) => { e.stopPropagation(); toggleFavorite(r.trackId); }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Clock size={32} className="mx-auto text-muted-foreground/35 mb-3" />
                      <p className="text-sm text-muted-foreground">No hay canciones recientes</p>
                      <p className="text-xs text-muted-foreground/55 mt-1">Las que reproduzcas aparecerán aquí</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Favoritos ── */}
              {libraryView === "favoritos" && (
                <motion.div key="favoritos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {favTracks.length > 0 ? (
                    <div className="space-y-1.5">
                      {favTracks.map((t, i) => (
                        <TrackRow key={t.id} name={t.name} index={i} trackId={t.id}
                          isActive={currentTrack?.id === t.id} isPlaying={isPlaying}
                          isFavorite
                          duration={t.duration}
                          playlistCount={playlistCountFor(t.id)}
                          onPlay={() => playTrack(idxOf(t.id))}
                          onFavorite={(e) => { e.stopPropagation(); toggleFavorite(t.id); }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Heart size={32} className="mx-auto text-muted-foreground/35 mb-3" />
                      <p className="text-sm text-muted-foreground">Aún no tienes favoritos</p>
                      <p className="text-xs text-muted-foreground/55 mt-1">Toca el corazón en cualquier canción</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Listas ── */}
              {libraryView === "listas" && (
                <motion.div key="listas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {selectedPlaylist ? (
                    <div>
                      <button onClick={() => setSelectedPlaylistId(null)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ChevronLeft size={16} /> Volver a listas
                      </button>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{selectedPlaylist.name}</h3>
                          <p className="text-xs text-muted-foreground">{selectedPlaylist.trackIds.length} canciones</p>
                        </div>
                        <button onClick={() => { deletePlaylist(selectedPlaylist.id); setSelectedPlaylistId(null); }}
                          className="p-2 rounded-full text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {playlistTracks.length > 0 ? (
                        <div className="space-y-1.5 mb-4">
                          {playlistTracks.map((t, i) => (
                            <TrackRow key={t.id} name={t.name} index={i} trackId={t.id}
                              isActive={currentTrack?.id === t.id} isPlaying={isPlaying}
                              isFavorite={favorites.includes(t.id)}
                              duration={t.duration}
                              onPlay={() => playTrack(idxOf(t.id))}
                              onFavorite={(e) => { e.stopPropagation(); toggleFavorite(t.id); }}
                              onRemove={(e) => { e.stopPropagation(); removeFromPlaylist(selectedPlaylist.id, t.id); }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-muted-foreground py-4">Lista vacía — añade canciones abajo</p>
                      )}
                      {tracks.filter((t) => !selectedPlaylist.trackIds.includes(t.id)).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Añadir a esta lista</p>
                          <div className="space-y-1.5">
                            {tracks.filter((t) => !selectedPlaylist.trackIds.includes(t.id)).map((t, i) => (
                              <div key={t.id} onClick={() => addToPlaylist(selectedPlaylist.id, t.id)}
                                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer bg-card border border-transparent hover:border-border transition-all">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">{i + 1}</div>
                                <span className="text-sm truncate flex-1">{t.name}</span>
                                {t.duration > 0 && <span className="text-xs text-muted-foreground/55 shrink-0">{fmt(t.duration)}</span>}
                                <Plus size={14} className="text-primary shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {showNewPlaylist ? (
                        <div className="flex gap-2 mb-4">
                          <input autoFocus value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleCreatePlaylist(); if (e.key === "Escape") setShowNewPlaylist(false); }}
                            placeholder="Nombre de la lista..."
                            className="flex-1 px-3 py-2 rounded-xl bg-card border border-primary/50 text-sm outline-none focus:border-primary transition-colors"
                          />
                          <button onClick={handleCreatePlaylist} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Crear</button>
                          <button onClick={() => setShowNewPlaylist(false)} className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground"><X size={16} /></button>
                        </div>
                      ) : (
                        <button data-testid="button-new-playlist" onClick={() => setShowNewPlaylist(true)}
                          className="flex items-center gap-2 w-full p-3 rounded-xl border border-dashed border-primary/35 text-primary text-sm font-medium hover:bg-primary/5 transition-all mb-4">
                          <Plus size={16} /> Nueva lista de reproducción
                        </button>
                      )}
                      {playlists.length > 0 ? (
                        <div className="space-y-2">
                          {playlists.map((pl) => (
                            <motion.div key={pl.id} data-testid={`card-playlist-${pl.id}`}
                              onClick={() => setSelectedPlaylistId(pl.id)}
                              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/35 transition-all"
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center shrink-0">
                                <ListMusic size={18} className="text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{pl.name}</p>
                                <p className="text-xs text-muted-foreground">{pl.trackIds.length} canciones</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ListMusic size={32} className="mx-auto text-muted-foreground/35 mb-3" />
                          <p className="text-sm text-muted-foreground">Crea tu primera lista de reproducción</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}

        {/* ══════════ VIBRA ══════════ */}
        {activeTab === "vibra" && (
          <motion.div key="vibra" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-muted-foreground text-center mb-4">¿Cómo te sientes ahora?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {MOODS.map((mood) => (
                <motion.button key={mood.id} data-testid={`button-mood-${mood.id}`}
                  onClick={() => handleSelectMood(mood.id)}
                  className={cn("p-3 rounded-2xl border bg-gradient-to-br text-center transition-all", mood.color, mood.border,
                    selectedMood === mood.id ? "scale-105 ring-2 ring-offset-2 ring-offset-background" : "opacity-75 hover:opacity-100")}
                  whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.04 }}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className={cn("text-xs font-semibold", mood.text)}>{mood.label}</div>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {moodData && (
                <motion.div key={moodData.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className={cn("p-5 rounded-2xl border bg-gradient-to-br", moodData.color, moodData.border)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{moodData.emoji}</span>
                    <div>
                      <p className={cn("text-lg font-bold font-display", moodData.text)}>{moodData.label}</p>
                      <p className="text-xs text-muted-foreground">Estado actual</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90 mb-3">{moodData.desc}</p>
                  <div className="rounded-xl bg-black/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Recomendación</p>
                    <p className="text-sm">{moodData.rec}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
