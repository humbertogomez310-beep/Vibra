import { motion } from "framer-motion";
import { Crown, History, BarChart2, Users, Mic2, Star, ChevronRight, Zap } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

const PRO_FEATURES = [
  { icon: History, label: "Historial de estados de ánimo", desc: "Revive cada momento emocional", available: true },
  { icon: BarChart2, label: "Estadísticas de uso", desc: "Descubre tus patrones musicales", available: true },
  { icon: Star, label: "Recomendaciones avanzadas", desc: "IA musical personalizada", available: false },
  { icon: Users, label: "Perfiles múltiples", desc: "Cada persona, su propia vibra", available: false },
  { icon: Mic2, label: "Karaoke", desc: "Canta con letra en pantalla", available: false, badge: "Próximamente" },
];

const MOOD_LABELS: Record<string, { label: string; emoji: string }> = {
  feliz: { label: "Feliz", emoji: "😊" },
  triste: { label: "Triste", emoji: "😔" },
  enojado: { label: "Enojado", emoji: "😤" },
  relajado: { label: "Relajado", emoji: "😌" },
  motivado: { label: "Motivado", emoji: "💪" },
  enamorado: { label: "Enamorado", emoji: "💕" },
  confiado: { label: "Confiado", emoji: "😎" },
  fiesta: { label: "Fiesta", emoji: "🎉" },
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

export function Pro() {
  const { history, stats } = usePlayer();
  const [isPro] = [false];

  return (
    <motion.div
      className="min-h-screen px-4 py-6 max-w-2xl mx-auto pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center gap-2 mb-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <Crown size={28} style={{ color: "hsl(45,95%,60%)", filter: "drop-shadow(0 0 8px hsl(45 95% 60% / 0.6))" }} />
          <h1
            className="font-display text-3xl font-black tracking-widest"
            style={{
              background: "linear-gradient(135deg, hsl(45,95%,65%) 0%, hsl(35,90%,55%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px hsl(45 95% 60% / 0.3))",
            }}
          >
            PRO
          </h1>
        </motion.div>
        <p className="text-sm text-muted-foreground">Lleva tu experiencia VIBRA al siguiente nivel</p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <motion.button
          data-testid="button-activate-pro"
          className="flex-1 py-4 font-display font-bold tracking-widest uppercase rounded-xl text-sm flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, hsl(45,95%,50%) 0%, hsl(35,90%,45%) 100%)",
            boxShadow: "0 0 25px hsl(45 95% 60% / 0.4)",
            color: "hsl(30,20%,10%)",
          }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 40px hsl(45 95% 60% / 0.6)" }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap size={18} />
          ACTIVAR PRO
        </motion.button>
        <motion.button
          data-testid="button-learn-more"
          className="flex-1 py-4 font-display font-bold tracking-widest uppercase rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          SABER MÁS
          <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* Features List */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Incluido en Pro
        </h2>
        <div className="space-y-2">
          {PRO_FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.label}
                data-testid={`card-pro-feature-${i}`}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border",
                  feat.available
                    ? "bg-card border-border"
                    : "bg-card/50 border-border/50 opacity-60"
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: feat.available ? 1 : 0.6, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{feat.label}</p>
                  <p className="text-xs text-muted-foreground">{feat.desc}</p>
                </div>
                {feat.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {feat.badge}
                  </span>
                )}
                {!feat.badge && !feat.available && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Pro
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Tus estadísticas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p
              className="font-display text-3xl font-bold mb-1"
              style={{ color: "hsl(var(--primary))" }}
            >
              {stats.plays}
            </p>
            <p className="text-xs text-muted-foreground">Canciones escuchadas</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="font-display text-3xl font-bold mb-1" style={{ color: "hsl(var(--accent))" }}>
              {stats.topMood ? (MOOD_LABELS[stats.topMood]?.emoji ?? "—") : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.topMood ? `Vibra favorita: ${MOOD_LABELS[stats.topMood]?.label}` : "Sin datos aún"}
            </p>
          </div>
        </div>
      </div>

      {/* Mood History */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Historial de vibras
        </h2>
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.slice(0, 10).map((entry, i) => {
              const mood = MOOD_LABELS[entry.mood];
              return (
                <motion.div
                  key={`${entry.mood}-${entry.timestamp}`}
                  data-testid={`item-mood-history-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="text-xl">{mood?.emoji ?? "🎵"}</span>
                  <span className="text-sm font-medium flex-1">{mood?.label ?? entry.mood}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(entry.timestamp)}</span>
                </motion.div>
              );
            })}
            {history.length > 10 && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                +{history.length - 10} entradas más — activa Pro para ver todo
              </p>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-border text-center">
            <History size={32} className="mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Tu historial aparecerá aquí</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Selecciona una vibra en la pestaña Música para comenzar
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
