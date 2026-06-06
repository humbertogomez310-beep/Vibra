import { motion } from "framer-motion";
import { Globe, Sparkles, Lock, Music, Cpu, Flame, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const HBG_APPS = [
  {
    id: "instinto",
    emoji: "🎭",
    name: "INSTINTO",
    tagline: "Navegación emocional en tiempo real",
    desc: "Tu brújula interior hecha app. INSTINTO lee tu energía, detecta tu estado y te guía hacia las decisiones más auténticas. Inteligencia emocional del siglo XXI.",
    status: "available",
    url: "https://instinto.replit.app",
    gradient: "from-orange-950/60 via-amber-950/40 to-red-950/30",
    border: "hsla(25, 90%, 55%, 0.4)",
    glow: "hsla(25, 90%, 50%, 0.2)",
    accent: "hsl(25, 90%, 65%)",
    Icon: Flame,
    iconColor: "#f97316",
  },
  {
    id: "terminador-ia",
    emoji: "🚀",
    name: "TERMINADOR IA",
    tagline: "IA de alto rendimiento a tu servicio",
    desc: "Automatiza lo complejo. Optimiza lo posible. Domina lo digital. TERMINADOR IA es el asistente de productividad del Universo HBG — diseñado para quien no acepta límites.",
    status: "soon",
    gradient: "from-red-950/60 via-rose-950/40 to-pink-950/30",
    border: "hsla(0, 85%, 45%, 0.3)",
    glow: "hsla(0, 85%, 50%, 0.15)",
    accent: "hsl(0, 85%, 62%)",
    Icon: Cpu,
    iconColor: "#ef4444",
  },
  {
    id: "universo-musical",
    emoji: "🎤",
    name: "UNIVERSO MUSICAL HBG",
    tagline: "Sonidos que trascienden géneros",
    desc: "La música original del ecosistema. Canciones, álbumes y proyectos exclusivos donde cada nota cuenta una historia. Tu portal a la banda sonora del Universo HBG.",
    status: "beta",
    gradient: "from-violet-950/60 via-purple-950/40 to-fuchsia-950/30",
    border: "hsla(270, 80%, 50%, 0.35)",
    glow: "hsla(270, 80%, 55%, 0.18)",
    accent: "hsl(270, 80%, 68%)",
    Icon: Music,
    iconColor: "#a855f7",
  },
];

const UPCOMING = [
  { title: "Señal Digital", genre: "Electronic", gradient: "from-violet-800 to-indigo-900", dots: "hsl(270,80%,65%)" },
  { title: "Frecuencia", genre: "Ambient", gradient: "from-cyan-900 to-teal-900", dots: "hsl(195,100%,60%)" },
  { title: "Pulso", genre: "Hip-Hop", gradient: "from-fuchsia-900 to-purple-900", dots: "hsl(300,90%,65%)" },
  { title: "Neon Dreams", genre: "Synthwave", gradient: "from-pink-900 to-rose-900", dots: "hsl(340,90%,65%)" },
];

export function Universe() {
  return (
    <motion.div
      className="min-h-screen px-4 py-6 max-w-2xl mx-auto pb-36"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="text-center mb-10">
        <motion.div
          className="text-5xl mb-4 float-anim inline-block"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.1, damping: 12 }}
        >
          🌌
        </motion.div>

        {/* HBG Signature */}
        <motion.div
          className="flex justify-center gap-4 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {["H", "B", "G"].map((l, i) => (
            <motion.span
              key={l}
              className="font-display text-lg font-black"
              style={{
                color: `hsl(${270 + i * 25}, 80%, 68%)`,
                textShadow: `0 0 15px hsl(${270 + i * 25}, 80%, 65% / 0.5)`,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              {l}
            </motion.span>
          ))}
        </motion.div>

        <h1
          className="font-display text-3xl font-black tracking-widest mb-3 shimmer-text"
        >
          UNIVERSO HBG
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Un ecosistema de aplicaciones creadas para evolucionar contigo — cada app una pieza, juntas forman el universo.
        </p>
      </div>

      {/* ── HBG Apps ── */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
          <Globe size={13} />
          Proyectos del universo
        </h2>
        <div className="space-y-4">
          {HBG_APPS.map((app, i) => {
            const Icon = app.Icon;
            return (
              <motion.div
                key={app.id}
                data-testid={`card-app-${app.id}`}
                className={cn("relative rounded-2xl overflow-hidden bg-gradient-to-br", app.status === "available" ? "cursor-pointer" : "cursor-default", app.gradient)}
                style={{ border: `1px solid ${app.border}`, boxShadow: `0 0 30px ${app.glow}, inset 0 1px 0 hsla(255,100%,100%,0.05)` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, type: "spring", damping: 20 }}
                whileHover={{ scale: 1.015, y: -2 }}
                onClick={() => { if (app.status === "available" && "url" in app && app.url) window.open(app.url as string, "_blank", "noopener"); }}
              >
                {/* Ambient orb */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                  style={{ background: app.glow, transform: "translate(30%, -30%)" }}
                />

                <div className="relative p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Icon circle */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          background: `${app.glow}`,
                          border: `1px solid ${app.border}`,
                          boxShadow: `0 0 20px ${app.glow}`,
                        }}
                      >
                        <span className="text-2xl">{app.emoji}</span>
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold tracking-wider" style={{ color: app.accent }}>
                          {app.name}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">{app.tagline}</p>
                      </div>
                    </div>

                    {/* Status badge */}
                    {app.status === "soon" ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10 shrink-0">
                        <Lock size={8} /> Pronto
                      </span>
                    ) : app.status === "available" ? (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: `${app.glow}`, color: app.accent, border: `1px solid ${app.border}` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: app.accent }} />
                        Disponible
                      </span>
                    ) : (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: `${app.glow}`, color: app.accent, border: `1px solid ${app.border}` }}
                      >
                        Beta
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground/75 leading-relaxed mb-4">{app.desc}</p>

                  {/* Action hint */}
                  <div className="flex items-center gap-1.5" style={{ color: app.accent }}>
                    <Icon size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      {app.status === "available" ? "Disponible — Abrir App" : app.status === "beta" ? "Disponible en Beta" : "Próximamente"}
                    </span>
                    <ArrowRight size={10} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Universo Musical HBG ── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
          <Music size={13} />
          Universo Musical HBG
        </h2>

        {/* Featured card */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-5 p-5"
          style={{
            background: "linear-gradient(135deg, hsl(270 35% 10%) 0%, hsl(290 25% 8%) 50%, hsl(220 30% 7%) 100%)",
            border: "1px solid hsla(270, 60%, 40%, 0.25)",
            boxShadow: "0 0 40px hsla(270,80%,40%,0.12), inset 0 1px 0 hsla(255,100%,100%,0.05)",
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{ background: "hsla(270,80%,40%,0.12)", transform: "translate(20%,-20%)" }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary" />
              <span className="font-display text-sm font-bold tracking-wider text-primary">Música Original</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
                Próximamente
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-5">
              Canciones, álbumes y proyectos musicales exclusivos del Universo HBG. Pronto escucharás, verás letras y vivirás la historia detrás de cada track — todo integrado en VIBRA.
            </p>
            <button
              data-testid="button-notify-me"
              className="w-full py-3 rounded-xl text-sm font-semibold font-display tracking-wider uppercase transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, hsla(270,80%,40%,0.5), hsla(195,100%,35%,0.3))",
                border: "1px solid hsla(270,80%,55%,0.3)",
                color: "hsl(var(--primary))",
              }}
            >
              Notificarme del lanzamiento
            </button>
          </div>
        </motion.div>

        {/* Upcoming releases grid */}
        <div className="grid grid-cols-2 gap-3">
          {UPCOMING.map((r, i) => (
            <motion.div
              key={r.title}
              data-testid={`card-release-${i}`}
              className="relative rounded-2xl overflow-hidden h-36"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br", r.gradient)} />
              {/* Noise texture overlay */}
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E\")" }}
              />
              <div className="absolute inset-0 bg-black/40" />
              {/* Sound dot */}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full animate-ping" style={{ background: r.dots }} />
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: r.dots }} />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 bg-black/40 px-2 py-0.5 rounded-full">
                  {r.genre}
                </span>
                <p className="font-display text-xs font-bold text-white text-center leading-tight">
                  {r.title}
                </p>
                <span className="text-[9px] text-white/40 uppercase tracking-wider">Próximamente</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
