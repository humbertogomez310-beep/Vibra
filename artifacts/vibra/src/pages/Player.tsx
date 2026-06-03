import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { Equalizer } from "@/components/Equalizer";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Upload, Music2, Volume2, Heart, Trash2,
  Plus, ListMusic, Clock, ChevronLeft, X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mood data ────────────────────────────────────────────────────────────────

const MOODS = [
  { id: "feliz", label: "Feliz", emoji: "😊", color: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/40", text: "text-yellow-300",
    desc: "Tu energía brilla con fuerza hoy. El mundo se mueve a tu ritmo.",
    rec: "Sube el volumen con pop energético o dance music que te haga mover el cuerpo." },
  { id: "triste", label: "Triste", emoji: "😔", color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/40", text: "text-blue-300",
    desc: "Las emociones profundas también tienen su belleza. Déjate sentir.",
    rec: "Música suave, indie melancólico o piano que acompañe sin interrumpir." },
  { id: "enojado", label: "Enojado", emoji: "😤", color: "from-red-500/20 to-rose-500/10", border: "border-red-500/40", text: "text-red-300",
    desc: "Esa energía es combustible. Canalízala bien.",
    rec: "Rock intenso, metal o hip-hop de alto voltaje para liberar la tensión." },
  { id: "relajado", label: "Relajado", emoji: "😌", color: "from-green-500/20 to-emerald-500/10", border: "border-green-500/40", text: "text-green-300",
    desc: "En calma. El momento presente es todo lo que necesitas.",
    rec: "Lo-fi, jazz suave o ambient que mantenga la paz interior." },
  { id: "motivado", label: "Motivado", emoji: "💪", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/40", text: "text-orange-300",
    desc: "Listo para conquistar. Nada te detiene hoy.",
    rec: "EDM de alta energía, hip-hop motivacional o rock que empuje cada paso." },
  { id: "enamorado", label: "Enamorado", emoji: "💕", color: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/40", text: "text-pink-300",
    desc: "El corazón late diferente. Hay algo especial en el aire.",
    rec: "R&B suave, indie romántico o baladas que capturen esa sensación." },
  { id: "confiado", label: "Confiado", emoji: "😎", color: "from-cyan-500/20 to-teal-500/10", border: "border-cyan-500/40", text: "text-cyan-300",
    desc: "Sabes exactamente quién eres. Caminas con propósito.",
    rec: "Hip-hop cool, funk o jazz moderno que marque ese paso seguro." },
  { id: "fiesta", label: "Fiesta", emoji: "🎉", color: "from-purple-500/20 to-fuchsia-500/10", border: "border-purple-500/40", text: "text-purple-300",
    desc: "La noche llama. El dancefloor te espera.",
    rec: "Electrónica, reggaeton o pop urbano que no deje a nadie quieto." },
];

function fmt(secs: number) {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type LibraryView = "todos" | "recientes" | "favoritos" | "listas";

interface TrackRowProps {
  name: string;
  index: number;
  trackId: string;
  isActive: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onFavorite: (e: React.MouseEvent) => void;
  onRemove?: (e: React.MouseEvent) => void;
  badge?: string;
}

function TrackRow({ name, index, isActive, isPlaying, isFavorite, onPlay, onFavorite, onRemove, badge }: TrackRowProps) {
  return (
    <div
      onClick={onPlay}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group",
        isActive
          ? "bg-primary/15 border border-primary/40"
          : "bg-card border border-transparent hover:border-border"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
        isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
      )}>
        {isActive && isPlaying
          ? <Equalizer isPlaying bars={3} className="h-4 w-5 justify-center" barClassName="w-1 bg-white" />
          : index + 1
        }
      </div>

      <span className={cn("text-sm truncate flex-1", isActive ? "text-primary font-medium" : "text-foreground")}>
        {name}
      </span>

      {badge && (
        <span className="text-[10px] text-muted-foreground">{badge}</span>
      )}

      <button
        onClick={onFavorite}
        className={cn(
          "p-1.5 rounded-full transition-colors shrink-0",
          isFavorite ? "text-pink-400" : "text-muted-foreground/40 hover:text-pink-400 opacity-0 group-hover:opacity-100"
        )}
      >
        <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 rounded-full text-muted-foreground/40 hover:text-destructive transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Player() {
  const {
    tracks, currentTrack, currentTrackIndex, isPlaying,
    shuffle, volume, progress, duration, isLoading,
    favorites, recents, playlists,
    loadTracks, play, pause, playTrack, next, prev,
    setMood, setVolume, toggleShuffle, seek, currentMood,
    toggleFavorite, removeTrack, addPlaylist, deletePlaylist,
    addToPlaylist, removeFromPlaylist,
  } = usePlayer();

  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"music" | "vibra">("music");
  const [libraryView, setLibraryView] = useState<LibraryView>("todos");
  const [selectedMood, setSelectedMood] = useState<string | null>(currentMood);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);

  const moodData = MOODS.find((m) => m.id === selectedMood);
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    loadTracks(Array.from(files));
  }, [loadTracks]);

  const handleSelectMood = (id: string) => {
    setSelectedMood(id);
    setMood(id);
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    addPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setShowNewPlaylist(false);
  };

  // Derive lists for each view
  const favoriteTracks = tracks.filter((t) => favorites.includes(t.id));
  const recentTracks = recents
    .map((r) => ({ ...r, track: tracks.find((t) => t.id === r.trackId) }))
    .filter((r) => r.track) as { trackId: string; name: string; timestamp: number; track: typeof tracks[0] }[];
  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistTracks = selectedPlaylist
    ? selectedPlaylist.trackIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as typeof tracks
    : [];

  const trackIndex = (trackId: string) => tracks.findIndex((t) => t.id === trackId);

  return (
    <motion.div
      className="min-h-screen px-4 py-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="font-display text-2xl font-bold tracking-wider text-center mb-6 glow-text">
        VIBRA
      </h1>

      {/* Top tabs */}
      <div className="flex rounded-full overflow-hidden border border-border mb-6 bg-card/50">
        {(["music", "vibra"] as const).map((tab) => (
          <button
            key={tab}
            data-testid={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-all",
              activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "music" ? "Música" : "Vibra"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── MUSIC TAB ──────────────────────────────────────────────────── */}
        {activeTab === "music" && (
          <motion.div key="music" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>

            {/* Now Playing */}
            {currentTrack ? (
              <div className="mb-5 p-5 rounded-2xl bg-card border border-border glow-box">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Music2 size={24} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{currentTrack.name}</p>
                    <div className="flex items-end gap-1 h-5 mt-1">
                      <Equalizer isPlaying={isPlaying} bars={5} className="h-4" barClassName="w-1.5 bg-primary" />
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(currentTrack.id)}
                    className={cn("p-2 rounded-full transition-colors", favorites.includes(currentTrack.id) ? "text-pink-400" : "text-muted-foreground hover:text-pink-400")}
                  >
                    <Heart size={18} fill={favorites.includes(currentTrack.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <input
                    data-testid="slider-progress"
                    type="range" min={0} max={duration || 1} value={progress}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="w-full h-1.5 accent-primary cursor-pointer rounded-full"
                    style={{ background: `linear-gradient(to right, hsl(var(--primary)) ${progressPct}%, hsl(var(--border)) ${progressPct}%)` }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{fmt(progress)}</span>
                    <span>{fmt(duration)}</span>
                  </div>
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-between">
                  <button data-testid="button-shuffle" onClick={toggleShuffle}
                    className={cn("p-2 rounded-full transition-colors", shuffle ? "text-primary bg-primary/20" : "text-muted-foreground hover:text-foreground")}>
                    <Shuffle size={18} />
                  </button>
                  <button data-testid="button-prev" onClick={prev} className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <SkipBack size={22} />
                  </button>
                  <button
                    data-testid="button-play-pause"
                    onClick={isPlaying ? pause : play}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: "linear-gradient(135deg, hsl(270,80%,55%), hsl(200,100%,50%))",
                      boxShadow: "0 0 20px hsla(270,80%,65%,0.4)",
                    }}
                  >
                    {isPlaying ? <Pause size={24} fill="white" className="text-white" /> : <Play size={24} fill="white" className="text-white ml-1" />}
                  </button>
                  <button data-testid="button-next" onClick={next} className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <SkipForward size={22} />
                  </button>
                  <div className="flex items-center gap-1">
                    <Volume2 size={16} className="text-muted-foreground" />
                    <input
                      data-testid="slider-volume"
                      type="range" min={0} max={1} step={0.05} value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-16 h-1 accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="mb-5 p-6 rounded-2xl bg-card border border-border text-center">
                <Loader2 size={32} className="mx-auto text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Restaurando biblioteca...</p>
              </div>
            ) : (
              <div className="mb-5 p-6 rounded-2xl bg-card border border-dashed border-border text-center">
                <Music2 size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">Agrega tu música para comenzar</p>
                <p className="text-muted-foreground/60 text-xs mt-1">↓ Sube archivos abajo</p>
              </div>
            )}

            {/* Library sub-navigation */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {(["todos", "recientes", "favoritos", "listas"] as LibraryView[]).map((v) => {
                const icons = { todos: Music2, recientes: Clock, favoritos: Heart, listas: ListMusic };
                const labels = { todos: "Todos", recientes: "Recientes", favoritos: "Favoritos", listas: "Listas" };
                const Icon = icons[v];
                return (
                  <button
                    key={v}
                    data-testid={`filter-${v}`}
                    onClick={() => { setLibraryView(v); setSelectedPlaylistId(null); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                      libraryView === v
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon size={12} />
                    {labels[v]}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">

              {/* TODOS view */}
              {libraryView === "todos" && (
                <motion.div key="todos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <div
                    data-testid="zone-upload"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    className="border-2 border-dashed border-primary/30 rounded-2xl p-5 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all mb-4"
                  >
                    <Upload size={22} className="mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium text-primary">Subir música</p>
                    <p className="text-xs text-muted-foreground mt-0.5">MP3, WAV, OGG — arrastra o haz click</p>
                    <input ref={fileRef} type="file" accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
                      multiple className="hidden" data-testid="input-file-upload"
                      onChange={(e) => handleFiles(e.target.files)} />
                  </div>

                  {tracks.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                        Biblioteca ({tracks.length})
                      </p>
                      <div className="space-y-1.5">
                        {tracks.map((t, i) => (
                          <TrackRow key={t.id} name={t.name} index={i} trackId={t.id}
                            isActive={currentTrackIndex === i} isPlaying={isPlaying}
                            isFavorite={favorites.includes(t.id)}
                            onPlay={() => playTrack(i)}
                            onFavorite={(e) => { e.stopPropagation(); toggleFavorite(t.id); }}
                            onRemove={(e) => { e.stopPropagation(); removeTrack(t.id); }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : !isLoading && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No hay canciones en la biblioteca
                    </p>
                  )}
                </motion.div>
              )}

              {/* RECIENTES view */}
              {libraryView === "recientes" && (
                <motion.div key="recientes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {recentTracks.length > 0 ? (
                    <div className="space-y-1.5">
                      {recentTracks.map((r, i) => (
                        <TrackRow key={`${r.trackId}-${i}`} name={r.name} index={i} trackId={r.trackId}
                          isActive={currentTrack?.id === r.trackId} isPlaying={isPlaying}
                          isFavorite={favorites.includes(r.trackId)}
                          onPlay={() => playTrack(trackIndex(r.trackId))}
                          onFavorite={(e) => { e.stopPropagation(); toggleFavorite(r.trackId); }}
                          badge={timeAgo(r.timestamp)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Clock size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No hay canciones recientes</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Las canciones que reproduzcas aparecerán aquí</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* FAVORITOS view */}
              {libraryView === "favoritos" && (
                <motion.div key="favoritos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {favoriteTracks.length > 0 ? (
                    <div className="space-y-1.5">
                      {favoriteTracks.map((t, i) => (
                        <TrackRow key={t.id} name={t.name} index={i} trackId={t.id}
                          isActive={currentTrack?.id === t.id} isPlaying={isPlaying}
                          isFavorite
                          onPlay={() => playTrack(trackIndex(t.id))}
                          onFavorite={(e) => { e.stopPropagation(); toggleFavorite(t.id); }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Heart size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">Aún no tienes favoritos</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Toca el corazón en cualquier canción</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* LISTAS view */}
              {libraryView === "listas" && (
                <motion.div key="listas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                  {/* Playlist detail */}
                  {selectedPlaylist ? (
                    <div>
                      <button onClick={() => setSelectedPlaylistId(null)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ChevronLeft size={16} /> Volver a listas
                      </button>
                      <div className="flex items-center justify-between mb-3">
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
                        <div className="space-y-1.5">
                          {playlistTracks.map((t, i) => (
                            <TrackRow key={t.id} name={t.name} index={i} trackId={t.id}
                              isActive={currentTrack?.id === t.id} isPlaying={isPlaying}
                              isFavorite={favorites.includes(t.id)}
                              onPlay={() => playTrack(trackIndex(t.id))}
                              onFavorite={(e) => { e.stopPropagation(); toggleFavorite(t.id); }}
                              onRemove={(e) => { e.stopPropagation(); removeFromPlaylist(selectedPlaylist.id, t.id); }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-muted-foreground py-6">
                          Esta lista está vacía — añade canciones desde "Todos"
                        </p>
                      )}

                      {/* Add tracks to playlist */}
                      {tracks.filter((t) => !selectedPlaylist.trackIds.includes(t.id)).length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Añadir a esta lista</p>
                          <div className="space-y-1.5">
                            {tracks.filter((t) => !selectedPlaylist.trackIds.includes(t.id)).map((t, i) => (
                              <div key={t.id}
                                onClick={() => addToPlaylist(selectedPlaylist.id, t.id)}
                                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer bg-card border border-transparent hover:border-border transition-all">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                                  {i + 1}
                                </div>
                                <span className="text-sm truncate flex-1">{t.name}</span>
                                <Plus size={14} className="text-primary shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Playlist list */
                    <div>
                      {/* New playlist */}
                      {showNewPlaylist ? (
                        <div className="flex gap-2 mb-4">
                          <input
                            autoFocus
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleCreatePlaylist(); if (e.key === "Escape") setShowNewPlaylist(false); }}
                            placeholder="Nombre de la lista..."
                            className="flex-1 px-3 py-2 rounded-xl bg-card border border-primary/50 text-sm outline-none focus:border-primary"
                          />
                          <button onClick={handleCreatePlaylist}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                            Crear
                          </button>
                          <button onClick={() => setShowNewPlaylist(false)}
                            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          data-testid="button-new-playlist"
                          onClick={() => setShowNewPlaylist(true)}
                          className="flex items-center gap-2 w-full p-3 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-all mb-4">
                          <Plus size={16} /> Nueva lista
                        </button>
                      )}

                      {playlists.length > 0 ? (
                        <div className="space-y-2">
                          {playlists.map((pl) => (
                            <motion.div
                              key={pl.id}
                              data-testid={`card-playlist-${pl.id}`}
                              onClick={() => setSelectedPlaylistId(pl.id)}
                              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/40 transition-all"
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
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
                          <ListMusic size={32} className="mx-auto text-muted-foreground/40 mb-3" />
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

        {/* ── VIBRA TAB ──────────────────────────────────────────────────── */}
        {activeTab === "vibra" && (
          <motion.div key="vibra" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-muted-foreground text-center mb-4">¿Cómo te sientes ahora?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {MOODS.map((mood) => (
                <motion.button key={mood.id} data-testid={`button-mood-${mood.id}`}
                  onClick={() => handleSelectMood(mood.id)}
                  className={cn(
                    "p-3 rounded-2xl border bg-gradient-to-br text-center transition-all",
                    mood.color, mood.border,
                    selectedMood === mood.id ? "scale-105 ring-2 ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100"
                  )}
                  whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
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
