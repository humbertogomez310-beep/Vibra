import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Crown, History, BarChart2, Mic2, Star, ChevronRight, Zap,
  Brain, Music2, TrendingUp, Clock3, Sparkles, ListMusic,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

// ─── Mood metadata ───────────────────────────────────────────────────────────

const MOOD_META: Record<string, { label: string; emoji: string; color: string }> = {
  feliz:    { label: "Feliz",     emoji: "😊", color: "hsl(45,90%,60%)" },
  triste:   { label: "Triste",    emoji: "😔", color: "hsl(210,80%,60%)" },
  enojado:  { label: "Enojado",   emoji: "😤", color: "hsl(0,80%,60%)" },
  relajado: { label: "Relajado",  emoji: "😌", color: "hsl(145,60%,55%)" },
  motivado: { label: "Motivado",  emoji: "💪", color: "hsl(25,90%,60%)" },
  enamorado:{ label: "Enamorado", emoji: "💕", color: "hsl(330,80%,65%)" },
  confiado: { label: "Confiado",  emoji: "😎", color: "hsl(195,100%,55%)" },
  fiesta:   { label: "Fiesta",    emoji: "🎉", color: "hsl(270,80%,65%)" },
};

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

// ─── Local AI engine ─────────────────────────────────────────────────────────

function useAIRecommendations() {
  const { tracks, recents, favorites, history, stats } = usePlayer();

  return useMemo(() => {
    // Time-based mood suggestion
    const h = new Date().getHours();
    let timeMood: string, timeLabel: string;
    if      (h >= 6  && h < 12) { timeMood = "motivado";  timeLabel = "Mañana activa"; }
    else if (h >= 12 && h < 15) { timeMood = "confiado";  timeLabel = "Mediodía con energía"; }
    else if (h >= 15 && h < 19) { timeMood = "relajado";  timeLabel = "Tarde tranquila"; }
    else if (h >= 19 && h < 23) { timeMood = "fiesta";    timeLabel = "Noche vibra"; }
    else                         { timeMood = "relajado";  timeLabel = "Madrugada tranquila"; }

    // Most played tracks
    const freq: Record<string, number> = {};
    recents.forEach((r) => { freq[r.trackId] = (freq[r.trackId] ?? 0) + 1; });
    const topTrackIds = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);
    const topTracks = topTrackIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as typeof tracks;

    // Dominant mood
    const moodFreq: Record<string, number> = {};
    history.forEach((e) => { moodFreq[e.mood] = (moodFreq[e.mood] ?? 0) + 1; });
    const [dominantMood] = Object.entries(moodFreq).sort(([, a], [, b]) => b - a)[0] ?? ["", 0];

    // Unique listening days (streak)
    const uniqueDays = new Set(recents.map((r) => new Date(r.timestamp).toDateString())).size;

    // Discovery: favorite tracks not in recents (unplayed recently)
    const recentIds = new Set(recents.slice(0, 10).map((r) => r.trackId));
    const discoveryTracks = favorites.filter((id) => !recentIds.has(id))
      .map((id) => tracks.find((t) => t.id === id)).filter(Boolean).slice(0, 3) as typeof tracks;

    // Insights text
    const insights: string[] = [];
    if (uniqueDays >= 3) insights.push(`Llevas ${uniqueDays} días seguidos escuchando música 🔥`);
    if (dominantMood) insights.push(`Tu vibra dominante es "${MOOD_META[dominantMood]?.label ?? dominantMood}" ${MOOD_META[dominantMood]?.emoji ?? ""}`);
    if (stats.plays >= 20) insights.push(`Has reproducido ${stats.plays} canciones en total — vas fuerte 🎵`);
    if (favorites.length >= 5) insights.push(`Tienes ${favorites.length} canciones favoritas — buen gusto 💜`);

    return { timeMood, timeLabel, topTracks, discoveryTracks, insights, dominantMood, uniqueDays };
  }, [tracks, recents, favorites, history, stats]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Pro() {
  const { history, stats, tracks, favorites, playlists } = usePlayer();
  const ai = useAIRecommendations();

  return (
    <motion.div
      className="min-h-screen px-4 py-6 max-w-2xl mx-auto pb-36"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex flex-col items-center gap-1.5 mb-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring" }}
        >
          {/* HBG signature */}
          <div className="flex gap-3 mb-1">
            {["H", "B", "G"].map((l, i) => (
              <span key={l} className="font-display text-xs font-black text-muted-foreground/60 tracking-widest">{l}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Crown size={26} style={{ color: "hsl(45,95%,60%)", filter: "drop-shadow(0 0 10px hsl(45 95% 60% / 0.6))" }} />
            <h1
              className="font-display text-3xl font-black tracking-widest glow-text-gold"
              style={{
                background: "linear-gradient(135deg, hsl(45,95%,65%) 0%, hsl(35,90%,55%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PRO
            </h1>
          </div>
        </motion.div>
        <p className="text-sm text-muted-foreground">Lleva tu experiencia VIBRA al siguiente nivel</p>
      </div>

      {/* ── CTA ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <motion.button
          data-testid="button-activate-pro"
          className="flex-1 py-4 font-display font-bold tracking-widest uppercase rounded-2xl text-sm flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, hsl(45,95%,50%) 0%, hsl(35,90%,45%) 100%)",
            boxShadow: "0 0 25px hsl(45 95% 60% / 0.35), inset 0 1px 0 hsla(45,100%,80%,0.3)",
            color: "hsl(30,20%,10%)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap size={18} fill="currentColor" /> ACTIVAR PRO
        </motion.button>
        <motion.button
          data-testid="button-learn-more"
          className="flex-1 py-4 font-display font-bold tracking-widest uppercase rounded-2xl text-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          SABER MÁS <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* ── Stats grid ── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart2 size={13} /> Tus estadísticas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: stats.plays, label: "Reproducciones", icon: Music2, color: "hsl(var(--primary))" },
            { val: favorites.length, label: "Favoritas", icon: Star, color: "hsl(340,80%,65%)" },
            { val: tracks.length, label: "En biblioteca", icon: ListMusic, color: "hsl(var(--accent))" },
            { val: playlists.length, label: "Playlists", icon: TrendingUp, color: "hsl(45,90%,60%)" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className="p-4 rounded-2xl bg-card border border-border text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                style={{ boxShadow: `0 0 20px ${s.color}10` }}
              >
                <Icon size={16} className="mx-auto mb-2" style={{ color: s.color }} />
                <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── IA Musical ── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Brain size={13} /> IA Musical
        </h2>

        {/* Time-based suggestion */}
        <motion.div
          className="mb-3 p-4 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsla(270,80%,20%,0.5) 0%, hsla(195,100%,15%,0.3) 100%)",
            border: "1px solid hsla(270,80%,50%,0.25)",
            boxShadow: "0 0 30px hsla(270,80%,40%,0.1)",
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ background: "hsl(270,80%,60%)", transform: "translate(30%,-30%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Clock3 size={14} className="text-primary" />
              <span className="text-xs font-semibold text-primary">{ai.timeLabel}</span>
            </div>
            <p className="text-sm font-medium mb-1">
              Para este momento, tu vibra ideal es{" "}
              <span style={{ color: MOOD_META[ai.timeMood]?.color ?? "inherit" }}>
                {MOOD_META[ai.timeMood]?.emoji} {MOOD_META[ai.timeMood]?.label}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Ajusta tu estado de ánimo en la pestaña Música para activar las recomendaciones.
            </p>
          </div>
        </motion.div>

        {/* Top tracks */}
        {ai.topTracks.length > 0 && (
          <motion.div
            className="mb-3 p-4 rounded-2xl bg-card border border-border"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-accent" />
              <span className="text-xs font-semibold text-accent">Tus canciones más escuchadas</span>
            </div>
            <div className="space-y-2">
              {ai.topTracks.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="font-display text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Music2 size={14} className="text-primary" />
                  </div>
                  <p className="text-sm truncate flex-1">{t.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Discovery */}
        {ai.discoveryTracks.length > 0 && (
          <motion.div
            className="mb-3 p-4 rounded-2xl bg-card border border-border"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">No las escuchas hace rato</span>
            </div>
            <div className="space-y-2">
              {ai.discoveryTracks.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Music2 size={14} className="text-yellow-400" />
                  </div>
                  <p className="text-sm truncate flex-1">{t.name}</p>
                  <span className="text-[10px] text-yellow-400/60 shrink-0">Redescubre</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Insights */}
        {ai.insights.length > 0 && (
          <motion.div
            className="p-4 rounded-2xl bg-card border border-border"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-primary" />
              <span className="text-xs font-semibold text-primary">Lo que la IA detectó</span>
            </div>
            <div className="space-y-2">
              {ai.insights.map((ins, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed">{ins}</p>
              ))}
            </div>
          </motion.div>
        )}

        {ai.topTracks.length === 0 && ai.insights.length === 0 && (
          <div className="p-5 rounded-2xl border border-dashed border-border text-center">
            <Brain size={28} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">La IA necesita datos para aprender</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Sube música y comienza a escuchar</p>
          </div>
        )}
      </div>

      {/* ── Karaoke ── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Mic2 size={13} /> Karaoke
        </h2>
        <motion.div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, hsla(260,60%,12%,0.8) 0%, hsla(200,60%,10%,0.6) 100%)",
            border: "1px solid hsla(260,70%,45%,0.2)",
            boxShadow: "0 0 30px hsla(260,80%,40%,0.08)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Fake lyrics preview */}
          <div className="px-5 pt-5 pb-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/50 mb-4">MODO CANTANTE</p>
            <p className="text-xs text-muted-foreground/40 mb-2">♪ La primera línea ya pasó...</p>
            <p
              className="text-lg font-bold mb-2"
              style={{
                background: "linear-gradient(90deg, hsl(270,80%,70%), hsl(195,100%,60%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                filter: "drop-shadow(0 0 8px hsl(270,80%,65%,0.5))",
              }}
            >
              ♪ Sincroniza tu voz aquí ♪
            </p>
            <p className="text-xs text-muted-foreground/40 mt-2">y la siguiente línea viene...</p>
          </div>

          {/* Info bar */}
          <div className="mx-4 mb-4 p-3 rounded-xl flex items-center gap-3"
            style={{ background: "hsla(260,80%,40%,0.12)", border: "1px solid hsla(270,80%,55%,0.18)" }}
          >
            <Mic2 size={16} className="text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary">Próximamente — Modo Letra</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Carga archivos .lrc y canta sincronizado en tiempo real
              </p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
              Beta
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Mood History ── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <History size={13} /> Historial de vibras
        </h2>
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.slice(0, 10).map((entry, i) => {
              const mood = MOOD_META[entry.mood];
              return (
                <motion.div
                  key={`${entry.mood}-${entry.timestamp}`}
                  data-testid={`item-mood-history-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span className="text-xl">{mood?.emoji ?? "🎵"}</span>
                  <span className="text-sm font-medium flex-1">{mood?.label ?? entry.mood}</span>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: mood?.color ?? "hsl(var(--primary))", boxShadow: `0 0 6px ${mood?.color ?? "hsl(var(--primary))"}` }}
                  />
                  <span className="text-xs text-muted-foreground">{timeAgo(entry.timestamp)}</span>
                </motion.div>
              );
            })}
            {history.length > 10 && (
              <p className="text-center text-xs text-muted-foreground/60 pt-1">
                +{history.length - 10} entradas más — activa Pro para ver todo el historial
              </p>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-border text-center">
            <History size={28} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Tu historial aparecerá aquí</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Selecciona una vibra en la pestaña Música</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
