import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Zap, Play, Pause, SkipForward, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ENERGY_LEVELS = [
  { id: "suave", label: "Suave", speed: "3s", speedMs: 3000, intensity: 0.4 },
  { id: "normal", label: "Normal", speed: "1.5s", speedMs: 1500, intensity: 0.7 },
  { id: "alta", label: "Alta Energía", speed: "0.7s", speedMs: 700, intensity: 1 },
];

const PARTY_COLORS = [
  "hsl(270,80%,65%)",
  "hsl(200,100%,60%)",
  "hsl(300,90%,60%)",
  "hsl(180,100%,50%)",
  "hsl(340,90%,60%)",
];

// Convert "hsl(h,s%,l%)" → "hsla(h,s%,l%,a)" for canvas compatibility
function toHsla(color: string, alpha: number): string {
  return color.replace("hsl(", "hsla(").replace(")", `,${alpha})`);
}

// ─── Canvas orb visualizer ────────────────────────────────────────────────────

interface OrbsProps {
  active: boolean;
  intensity: number;
}

function OrbCanvas({ active, intensity }: OrbsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      canvas.width = canvas.offsetWidth || 400;
      canvas.height = canvas.offsetHeight || 400;
      ctx = canvas.getContext("2d");
    } catch {
      return; // Canvas not available
    }
    if (!ctx) return;

    const orbs = Array.from({ length: Math.floor(15 * intensity) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 45 + 10,
      dx: (Math.random() - 0.5) * 2 * intensity,
      dy: (Math.random() - 0.5) * 2 * intensity,
      color: PARTY_COLORS[Math.floor(Math.random() * PARTY_COLORS.length)],
    }));

    const draw = () => {
      try {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        orbs.forEach((o) => {
          const grad = ctx!.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
          grad.addColorStop(0, toHsla(o.color, 0.35));
          grad.addColorStop(1, "transparent");
          ctx!.beginPath();
          ctx!.arc(o.x, o.y, o.r, 0, Math.PI * 2);
          ctx!.fillStyle = grad;
          ctx!.fill();
          o.x += o.dx;
          o.y += o.dy;
          if (o.x < -o.r) o.x = canvas.width + o.r;
          if (o.x > canvas.width + o.r) o.x = -o.r;
          if (o.y < -o.r) o.y = canvas.height + o.r;
          if (o.y > canvas.height + o.r) o.y = -o.r;
        });
        animRef.current = requestAnimationFrame(draw);
      } catch {
        // Canvas error — stop animation gracefully
        cancelAnimationFrame(animRef.current);
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, intensity]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Party() {
  const { isPlaying, currentTrack, play, pause, next, tracks, shuffle, toggleShuffle } = usePlayer();
  const [partyActive, setPartyActive] = useState(false);
  const [energy, setEnergy] = useState("normal");
  const [bgColorIdx, setBgColorIdx] = useState(0);
  const colorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const energyData = ENERGY_LEVELS.find((e) => e.id === energy)!;
  const barCount = energy === "alta" ? 24 : energy === "normal" ? 18 : 12;

  // Color cycling and auto-play when party mode activates
  useEffect(() => {
    if (partyActive) {
      colorIntervalRef.current = setInterval(() => {
        setBgColorIdx((c) => (c + 1) % PARTY_COLORS.length);
      }, energyData.speedMs);
      if (!isPlaying && tracks.length > 0) play();
      if (!shuffle) toggleShuffle();
    } else {
      if (colorIntervalRef.current) {
        clearInterval(colorIntervalRef.current);
        colorIntervalRef.current = null;
      }
    }
    return () => {
      if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
    };
  }, [partyActive, energy]); // eslint-disable-line react-hooks/exhaustive-deps

  const titleGradient = partyActive
    ? `linear-gradient(135deg, ${PARTY_COLORS[bgColorIdx]}, ${PARTY_COLORS[(bgColorIdx + 2) % PARTY_COLORS.length]})`
    : "linear-gradient(135deg, hsl(270,80%,75%), hsl(200,100%,70%))";

  const titleFilter = partyActive
    ? `drop-shadow(0 0 20px ${PARTY_COLORS[bgColorIdx]}) drop-shadow(0 0 40px ${PARTY_COLORS[(bgColorIdx + 1) % PARTY_COLORS.length]})`
    : "drop-shadow(0 0 10px hsla(270,80%,65%,0.4))";

  return (
    <motion.div
      className={cn("min-h-screen relative overflow-hidden", partyActive ? "party-active" : "bg-background")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Canvas orb visualizer wrapped in error boundary */}
      <ErrorBoundary
        label="El visualizador no pudo cargarse"
        fallback={<div className="absolute inset-0 z-0" />}
      >
        <OrbCanvas active={partyActive} intensity={energyData.intensity} />
      </ErrorBoundary>

      <div className="relative z-10 px-4 py-6 max-w-2xl mx-auto pb-24">

        {/* Title */}
        <motion.h1
          className="font-display text-3xl sm:text-4xl font-black tracking-widest text-center mb-2"
          style={{
            background: titleGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: titleFilter,
            transition: "filter 0.7s",
          }}
          animate={partyActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: parseFloat(energyData.speed) * 2 }}
        >
          MODO FIESTA
        </motion.h1>

        <p className="text-center text-sm text-muted-foreground mb-6">
          {partyActive ? "¡La fiesta está encendida!" : "Activa el modo para encender el ambiente"}
        </p>

        {/* Equalizer bars */}
        <div
          className={cn(
            "flex items-end justify-center gap-1 mb-8 rounded-2xl p-4 transition-all",
            partyActive ? "bg-black/30 backdrop-blur-sm border border-white/10" : "bg-card border border-border"
          )}
          style={{ height: 120 }}
        >
          {Array.from({ length: barCount }).map((_, i) => {
            const colorIdx = (i + bgColorIdx) % PARTY_COLORS.length;
            return (
              <div
                key={i}
                className="rounded-t-sm flex-1 max-w-3 transition-colors"
                style={{
                  backgroundColor: partyActive ? PARTY_COLORS[colorIdx] : "hsl(var(--primary))",
                  boxShadow: partyActive ? `0 0 8px ${PARTY_COLORS[colorIdx]}` : undefined,
                  animation: partyActive || isPlaying
                    ? `eq-bounce ${energyData.speed} infinite ease-in-out`
                    : undefined,
                  animationDelay: `${(i % 5) * 0.12}s`,
                  transform: !partyActive && !isPlaying ? "scaleY(0.15)" : undefined,
                  transformOrigin: "bottom",
                  transition: "background-color 0.7s, transform 0.3s",
                }}
              />
            );
          })}
        </div>

        {/* Activate / Deactivate button */}
        <div className="flex justify-center mb-8">
          <motion.button
            data-testid="button-toggle-party"
            onClick={() => setPartyActive((v) => !v)}
            className="px-10 py-5 font-display text-base font-bold tracking-widest uppercase rounded-full transition-all"
            style={partyActive ? {
              background: `linear-gradient(135deg, ${PARTY_COLORS[bgColorIdx]}, ${PARTY_COLORS[(bgColorIdx + 2) % PARTY_COLORS.length]})`,
              boxShadow: `0 0 40px ${PARTY_COLORS[bgColorIdx]}, 0 0 80px ${toHsla(PARTY_COLORS[(bgColorIdx + 1) % PARTY_COLORS.length], 0.4)}`,
              transition: "background 0.7s, box-shadow 0.7s",
            } : {
              background: "linear-gradient(135deg, hsl(270,80%,55%), hsl(300,90%,55%))",
              boxShadow: "0 0 25px hsla(270,80%,65%,0.4)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Zap size={18} className="inline mr-2" />
            {partyActive ? "DESACTIVAR MODO FIESTA" : "ACTIVAR MODO FIESTA"}
          </motion.button>
        </div>

        {/* Energy selector */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-3">
            Energía
          </p>
          <div className="flex gap-2 justify-center">
            {ENERGY_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                data-testid={`button-energy-${lvl.id}`}
                onClick={() => setEnergy(lvl.id)}
                className={cn(
                  "flex-1 max-w-32 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all",
                  energy === lvl.id
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current track controls */}
        {tracks.length > 0 ? (
          <div className={cn(
            "p-4 rounded-2xl border transition-all",
            partyActive ? "bg-black/30 backdrop-blur-sm border-white/10" : "bg-card border-border"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Music2 size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {currentTrack ? currentTrack.name : "Sin pista activa"}
                </p>
                <p className="text-xs text-muted-foreground">{isPlaying ? "Reproduciendo" : "Pausado"}</p>
              </div>
              <button
                data-testid="button-party-play-pause"
                onClick={isPlaying ? pause : play}
                className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors"
              >
                {isPlaying
                  ? <Pause size={16} fill="currentColor" />
                  : <Play size={16} fill="currentColor" className="ml-0.5" />
                }
              </button>
              <button
                data-testid="button-party-next"
                onClick={next}
                className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:text-foreground transition-colors"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">
              Ve a <span className="text-primary font-medium">Música</span> para cargar canciones primero
            </p>
          </div>
        )}

      </div>
    </motion.div>
  );
}
