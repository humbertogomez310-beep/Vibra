import { useLocation } from "wouter";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, SkipForward, Music2 } from "lucide-react";

function fmt(secs: number) {
  if (!secs || !isFinite(secs)) return "";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const [location, setLocation] = useLocation();
  const { currentTrack, isPlaying, play, pause, next, progress, duration } = usePlayer();

  if (location === "/" || location === "/player" || !currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-2"
      onClick={() => setLocation("/player")}
    >
      <div
        className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3 cursor-pointer relative overflow-hidden"
        style={{ boxShadow: "0 4px 30px hsla(270,80%,40%,0.3), 0 0 0 1px hsla(270,80%,65%,0.15)" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 10% 50%, hsla(270,80%,50%,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Art placeholder */}
        <div className="relative w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Music2 size={18} className="text-primary" />
          {isPlaying && (
            <div className="absolute inset-0 rounded-xl animate-ping bg-primary/10" />
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">{currentTrack.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{fmt(progress)}</span>
            {duration > 0 && <span className="text-[11px] text-muted-foreground/50">/ {fmt(duration)}</span>}
          </div>
        </div>

        {/* Controls */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary/35 transition-colors shrink-0"
          onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(); }}
        >
          {isPlaying
            ? <Pause size={16} fill="currentColor" />
            : <Play size={16} fill="currentColor" className="ml-0.5" />
          }
        </button>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors shrink-0"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <SkipForward size={16} />
        </button>

        {/* Progress line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/50">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
