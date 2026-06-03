import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { Equalizer } from "@/components/Equalizer";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Upload, Music2, Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function formatTime(secs: number) {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Player() {
  const {
    tracks, currentTrack, currentTrackIndex, isPlaying,
    shuffle, volume, progress, duration,
    loadTracks, play, pause, playTrack, next, prev,
    setMood, setVolume, toggleShuffle, seek, currentMood,
  } = usePlayer();

  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"music" | "vibra">("music");
  const [selectedMood, setSelectedMood] = useState<string | null>(currentMood);

  const moodData = MOODS.find(m => m.id === selectedMood);
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const filtered = Array.from(files).filter(f =>
      ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/x-wav"].includes(f.type) ||
      /\.(mp3|wav|ogg)$/i.test(f.name)
    );
    if (filtered.length > 0) loadTracks(filtered);
  };

  const handleSelectMood = (id: string) => {
    setSelectedMood(id);
    setMood(id);
  };

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

      {/* Tabs */}
      <div className="flex rounded-full overflow-hidden border border-border mb-6 bg-card/50">
        <button
          data-testid="tab-music"
          onClick={() => setActiveTab("music")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-all",
            activeTab === "music"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Música
        </button>
        <button
          data-testid="tab-vibra"
          onClick={() => setActiveTab("vibra")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-all",
            activeTab === "vibra"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Vibra
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "music" && (
          <motion.div
            key="music"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Now Playing */}
            {currentTrack ? (
              <div className="mb-6 p-5 rounded-2xl bg-card border border-border glow-box">
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
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <input
                    data-testid="slider-progress"
                    type="range"
                    min={0}
                    max={duration || 1}
                    value={progress}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="w-full h-1.5 accent-primary cursor-pointer rounded-full"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) ${progressPercent}%, hsl(var(--border)) ${progressPercent}%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <button
                    data-testid="button-shuffle"
                    onClick={toggleShuffle}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      shuffle ? "text-primary bg-primary/20" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Shuffle size={18} />
                  </button>
                  <button
                    data-testid="button-prev"
                    onClick={prev}
                    className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipBack size={22} />
                  </button>
                  <button
                    data-testid="button-play-pause"
                    onClick={isPlaying ? pause : play}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: "linear-gradient(135deg, hsl(270,80%,55%), hsl(200,100%,50%))",
                      boxShadow: "0 0 20px hsl(270 80% 65% / 0.4)",
                    }}
                  >
                    {isPlaying
                      ? <Pause size={24} fill="white" className="text-white" />
                      : <Play size={24} fill="white" className="text-white ml-1" />
                    }
                  </button>
                  <button
                    data-testid="button-next"
                    onClick={next}
                    className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipForward size={22} />
                  </button>
                  <div className="flex items-center gap-1">
                    <Volume2 size={16} className="text-muted-foreground" />
                    <input
                      data-testid="slider-volume"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-16 h-1 accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-6 rounded-2xl bg-card border border-dashed border-border text-center">
                <Music2 size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">Agrega tu música para comenzar</p>
                <p className="text-muted-foreground/60 text-xs mt-1">↓ Sube archivos abajo</p>
              </div>
            )}

            {/* Upload */}
            <div
              data-testid="zone-upload"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all mb-5"
            >
              <Upload size={24} className="mx-auto text-primary mb-2" />
              <p className="text-sm font-medium text-primary">Subir música</p>
              <p className="text-xs text-muted-foreground mt-1">MP3, WAV, OGG — arrastra o haz click</p>
              <input
                ref={fileRef}
                type="file"
                accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
                multiple
                className="hidden"
                data-testid="input-file-upload"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Library */}
            {tracks.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                  Biblioteca ({tracks.length})
                </h2>
                <div className="space-y-2">
                  {tracks.map((track, i) => (
                    <motion.div
                      key={track.id}
                      data-testid={`card-track-${track.id}`}
                      onClick={() => playTrack(i)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                        currentTrackIndex === i
                          ? "bg-primary/15 border border-primary/40"
                          : "bg-card border border-transparent hover:border-border hover:bg-card/80"
                      )}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        currentTrackIndex === i ? "bg-primary" : "bg-muted"
                      )}>
                        {currentTrackIndex === i && isPlaying
                          ? <Equalizer isPlaying={true} bars={3} className="h-4 w-5 justify-center" barClassName="w-1 bg-white" />
                          : <span className="text-xs font-medium">{i + 1}</span>
                        }
                      </div>
                      <span className={cn(
                        "text-sm truncate flex-1",
                        currentTrackIndex === i ? "text-primary font-medium" : "text-foreground"
                      )}>
                        {track.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "vibra" && (
          <motion.div
            key="vibra"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-muted-foreground text-center mb-4">
              ¿Cómo te sientes ahora?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {MOODS.map((mood) => (
                <motion.button
                  key={mood.id}
                  data-testid={`button-mood-${mood.id}`}
                  onClick={() => handleSelectMood(mood.id)}
                  className={cn(
                    "p-3 rounded-2xl border bg-gradient-to-br text-center transition-all",
                    mood.color, mood.border,
                    selectedMood === mood.id
                      ? "scale-105 ring-2 ring-offset-2 ring-offset-background"
                      : "hover:scale-102 opacity-80 hover:opacity-100"
                  )}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className={cn("text-xs font-semibold", mood.text)}>{mood.label}</div>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {moodData && (
                <motion.div
                  key={moodData.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "p-5 rounded-2xl border bg-gradient-to-br",
                    moodData.color, moodData.border
                  )}
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
