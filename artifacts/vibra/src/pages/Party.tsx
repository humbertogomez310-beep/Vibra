import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Zap, Play, Pause, SkipForward, Music2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const ENERGY_LEVELS = [
  { id: "suave",  label: "Suave",       speedMs: 3000, intensity: 0.35, barsSpeed: "2.4s" },
  { id: "normal", label: "Normal",      speedMs: 1500, intensity: 0.68, barsSpeed: "1.2s" },
  { id: "alta",   label: "Alta ⚡",     speedMs: 650,  intensity: 1.0,  barsSpeed: "0.55s" },
];

const PARTY_COLORS = [
  "hsl(270,80%,65%)",
  "hsl(195,100%,58%)",
  "hsl(300,90%,60%)",
  "hsl(180,100%,50%)",
  "hsl(340,90%,62%)",
];

function hsla(color: string, a: number) {
  return color.replace("hsl(", "hsla(").replace(")", `,${a})`);
}

// ─── Full-canvas circular visualizer ─────────────────────────────────────────

function Visualizer({
  active,
  intensity,
  colorIdx,
}: {
  active: boolean;
  intensity: number;
  colorIdx: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null;
    try {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx = canvas.getContext("2d");
    } catch { return; }
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Pre-build bar state for smooth animation
    const BAR_COUNT = active ? 48 : 24;
    const barHeights = Array.from({ length: BAR_COUNT }, () => Math.random() * 0.5 + 0.1);
    const barTargets  = Array.from({ length: BAR_COUNT }, () => Math.random());

    const draw = () => {
      try {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const t = (tRef.current += 0.012 * (active ? intensity * 2 : 0.3));

        // --- Background orbs ---
        const orbCount = active ? 12 : 5;
        for (let i = 0; i < orbCount; i++) {
          const angle = (i / orbCount) * Math.PI * 2 + t * 0.15;
          const dist = cx * 0.65 + Math.sin(t * 0.4 + i) * cx * 0.2;
          const ox = cx + Math.cos(angle) * dist;
          const oy = cy + Math.sin(angle) * dist;
          const r = (active ? 55 : 30) + Math.sin(t + i) * 15;
          const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
          const c = PARTY_COLORS[(i + colorIdx) % PARTY_COLORS.length];
          grad.addColorStop(0, hsla(c, active ? 0.18 : 0.06));
          grad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // --- Concentric rings ---
        const ringRadii = [cx * 0.28, cx * 0.42, cx * 0.56];
        ringRadii.forEach((baseR, ri) => {
          const pulse = 1 + (active ? 0.07 : 0.02) * Math.sin(t * (0.6 + ri * 0.2));
          const r = baseR * pulse;
          const c = PARTY_COLORS[(ri + colorIdx) % PARTY_COLORS.length];
          ctx!.beginPath();
          ctx!.arc(cx, cy, r, 0, Math.PI * 2);
          ctx!.strokeStyle = hsla(c, active ? 0.45 : 0.12);
          ctx!.lineWidth = active ? 1.5 : 1;
          ctx!.shadowBlur = active ? 12 : 4;
          ctx!.shadowColor = c;
          ctx!.stroke();
          ctx!.shadowBlur = 0;
        });

        // --- Circular equalizer bars ---
        const innerR = cx * 0.48;
        const maxBar = cx * 0.25 * intensity;
        for (let i = 0; i < BAR_COUNT; i++) {
          // Smooth bar animation
          barTargets[i] += (Math.random() - 0.5) * 0.06 * intensity;
          barTargets[i] = Math.max(0.05, Math.min(1, barTargets[i]));
          barHeights[i] += (barTargets[i] - barHeights[i]) * 0.12;

          const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;
          const bh = barHeights[i] * maxBar;
          const x1 = cx + Math.cos(angle) * innerR;
          const y1 = cy + Math.sin(angle) * innerR;
          const x2 = cx + Math.cos(angle) * (innerR + bh);
          const y2 = cy + Math.sin(angle) * (innerR + bh);
          const c = PARTY_COLORS[(i + colorIdx) % PARTY_COLORS.length];

          ctx!.beginPath();
          ctx!.moveTo(x1, y1);
          ctx!.lineTo(x2, y2);
          ctx!.strokeStyle = hsla(c, active ? 0.85 : 0.25);
          ctx!.lineWidth = active ? 2.5 : 1.5;
          ctx!.lineCap = "round";
          if (active) {
            ctx!.shadowBlur = 8;
            ctx!.shadowColor = c;
          }
          ctx!.stroke();
          ctx!.shadowBlur = 0;
        }

        // --- Center pulse orb ---
        const centerR = cx * 0.22 * (1 + (active ? 0.06 : 0.015) * Math.sin(t * 1.5));
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR);
        const mainC = PARTY_COLORS[colorIdx % PARTY_COLORS.length];
        cg.addColorStop(0, hsla(mainC, active ? 0.55 : 0.15));
        cg.addColorStop(0.5, hsla(mainC, active ? 0.2 : 0.05));
        cg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();

        animRef.current = requestAnimationFrame(draw);
      } catch {
        cancelAnimationFrame(animRef.current);
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, intensity, colorIdx]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Party() {
  const { isPlaying, currentTrack, play, pause, next, tracks, shuffle, toggleShuffle } = usePlayer();
  const [partyActive, setPartyActive] = useState(false);
  const [energy, setEnergy] = useState("normal");
  const [colorIdx, setColorIdx] = useState(0);
  const colorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const energyData = ENERGY_LEVELS.find((e) => e.id === energy)!;

  useEffect(() => {
    if (colorRef.current) clearInterval(colorRef.current);
    if (partyActive) {
      colorRef.current = setInterval(() => setColorIdx((c) => (c + 1) % PARTY_COLORS.length), energyData.speedMs);
      if (!isPlaying && tracks.length > 0) play();
      if (!shuffle) toggleShuffle();
    }
    return () => { if (colorRef.current) clearInterval(colorRef.current); };
  }, [partyActive, energy]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeColor = PARTY_COLORS[colorIdx % PARTY_COLORS.length];
  const activeColor2 = PARTY_COLORS[(colorIdx + 2) % PARTY_COLORS.length];

  return (
    <motion.div
      className="relative overflow-hidden flex flex-col"
      style={{ minHeight: "100dvh", background: "hsl(var(--background))" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Full-canvas visualizer (always rendered) */}
      <ErrorBoundary label="Visualizador" fallback={<div />}>
        <div className="absolute inset-0 z-0">
          <Visualizer active={partyActive} intensity={energyData.intensity} colorIdx={colorIdx} />
        </div>
      </ErrorBoundary>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between px-4 py-6 max-w-lg mx-auto w-full pb-28 min-h-full" style={{ minHeight: "100dvh" }}>

        {/* ── Top: title ── */}
        <div className="text-center pt-4">
          {/* HBG mini */}
          <div className="flex justify-center gap-3 mb-2">
            {["H","B","G"].map((l,i) => (
              <span key={l} className="font-display text-[10px] font-black tracking-widest"
                style={{ color: partyActive ? PARTY_COLORS[(i + colorIdx) % PARTY_COLORS.length] : "hsl(var(--muted-foreground))", opacity: 0.6 }}>
                {l}
              </span>
            ))}
          </div>

          <motion.h1
            className="font-display font-black tracking-widest leading-none"
            style={{
              fontSize: "clamp(1.8rem, 8vw, 3rem)",
              background: partyActive
                ? `linear-gradient(135deg, ${activeColor}, ${activeColor2})`
                : "linear-gradient(135deg, hsl(270,80%,75%), hsl(200,100%,70%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: partyActive
                ? `drop-shadow(0 0 20px ${activeColor}) drop-shadow(0 0 40px ${activeColor2})`
                : "drop-shadow(0 0 10px hsla(270,80%,65%,0.5))",
              transition: "filter 0.6s",
            }}
            animate={partyActive ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: energyData.speedMs / 600 }}
          >
            MODO FIESTA
          </motion.h1>

          <p className="text-sm text-muted-foreground/70 mt-2">
            {partyActive ? "¡El universo está de fiesta!" : "Activa el modo para encender la noche"}
          </p>
        </div>

        {/* ── Center: visualizer area with track info ── */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
          {/* Circular visualizer frame */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64">
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full transition-all duration-700"
              style={{
                boxShadow: partyActive
                  ? `0 0 40px ${hsla(activeColor, 0.5)}, 0 0 80px ${hsla(activeColor, 0.25)}, inset 0 0 30px ${hsla(activeColor, 0.1)}`
                  : "0 0 20px hsla(270,80%,60%,0.15), inset 0 0 15px hsla(270,80%,60%,0.05)",
                border: `1px solid ${partyActive ? hsla(activeColor, 0.4) : "hsla(270,80%,60%,0.15)"}`,
                borderRadius: "50%",
              }}
            />

            {/* Center icon / track indicator */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full">
              {currentTrack ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-2"
                    style={{ boxShadow: partyActive ? `0 0 20px ${hsla(activeColor, 0.4)}` : undefined }}>
                    <Music2 size={28}
                      style={{ color: partyActive ? activeColor : "hsl(var(--primary))", transition: "color 0.6s" }} />
                  </div>
                  <p className="text-xs font-semibold text-center px-6 leading-tight max-w-full truncate"
                    style={{ color: partyActive ? activeColor : "hsl(var(--foreground))", transition: "color 0.6s" }}>
                    {currentTrack.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {isPlaying ? "Reproduciendo" : "Pausado"}
                  </p>
                </>
              ) : (
                <>
                  <Radio size={28} className="text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground/50 text-center px-6">Sin música</p>
                </>
              )}
            </div>
          </div>

          {/* Play / Next */}
          <div className="flex items-center gap-4">
            <motion.button
              data-testid="button-party-play-pause"
              onClick={isPlaying ? pause : play}
              disabled={tracks.length === 0}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
              style={{
                background: partyActive
                  ? `linear-gradient(135deg, ${activeColor}, ${activeColor2})`
                  : "linear-gradient(135deg, hsl(270,80%,52%), hsl(195,100%,48%))",
                boxShadow: partyActive
                  ? `0 0 30px ${hsla(activeColor, 0.6)}`
                  : "0 0 20px hsla(270,80%,65%,0.4)",
                transition: "background 0.6s, box-shadow 0.6s",
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
            >
              {isPlaying
                ? <Pause size={22} fill="white" className="text-white" />
                : <Play size={22} fill="white" className="text-white ml-0.5" />
              }
            </motion.button>
            <motion.button
              data-testid="button-party-next"
              onClick={next}
              disabled={tracks.length === 0}
              className="w-11 h-11 rounded-full flex items-center justify-center border transition-all disabled:opacity-30"
              style={{
                borderColor: partyActive ? hsla(activeColor, 0.4) : "hsl(var(--border))",
                color: partyActive ? activeColor : "hsl(var(--muted-foreground))",
                transition: "all 0.6s",
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
            >
              <SkipForward size={18} />
            </motion.button>
          </div>
        </div>

        {/* ── Bottom: energy + activate ── */}
        <div className="w-full space-y-4">
          {/* Energy selector */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60 text-center mb-2.5">
              Energía
            </p>
            <div className="flex gap-2">
              {ENERGY_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  data-testid={`button-energy-${lvl.id}`}
                  onClick={() => setEnergy(lvl.id)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                    energy === lvl.id
                      ? "text-primary border-primary/60 bg-primary/10"
                      : "border-border text-muted-foreground hover:border-primary/30 bg-card/50 backdrop-blur-sm"
                  )}
                  style={energy === lvl.id && partyActive
                    ? { borderColor: hsla(activeColor, 0.6), color: activeColor, background: hsla(activeColor, 0.1) }
                    : undefined}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activate button */}
          <motion.button
            data-testid="button-toggle-party"
            onClick={() => setPartyActive((v) => !v)}
            className="w-full py-5 font-display text-base font-bold tracking-widest uppercase rounded-2xl relative overflow-hidden transition-all"
            style={partyActive ? {
              background: `linear-gradient(135deg, ${activeColor}, ${activeColor2})`,
              boxShadow: `0 0 40px ${hsla(activeColor, 0.6)}, 0 0 80px ${hsla(activeColor2, 0.3)}, inset 0 1px 0 hsla(255,100%,100%,0.2)`,
              transition: "background 0.6s, box-shadow 0.6s",
            } : {
              background: "linear-gradient(135deg, hsl(270,80%,52%), hsl(300,85%,52%))",
              boxShadow: "0 0 25px hsla(270,80%,65%,0.4), inset 0 1px 0 hsla(255,100%,100%,0.15)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {partyActive ? (
              <span className="flex items-center justify-center gap-2">
                <Zap size={18} fill="white" />
                DESACTIVAR MODO FIESTA
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap size={18} fill="white" />
                ACTIVAR MODO FIESTA
              </span>
            )}
          </motion.button>

          {!partyActive && tracks.length === 0 && (
            <p className="text-center text-xs text-muted-foreground/60">
              Primero sube canciones en <span className="text-primary">Música</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
