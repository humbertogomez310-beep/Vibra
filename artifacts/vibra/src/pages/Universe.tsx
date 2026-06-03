import { motion } from "framer-motion";
import { Globe, Sparkles, Lock, Music } from "lucide-react";
import { cn } from "@/lib/utils";

const HBG_APPS = [
  {
    id: "instinto",
    name: "INSTINTO",
    desc: "El instinto que guía tus decisiones. Navegación emocional en tiempo real.",
    status: "soon",
    gradient: "from-orange-600/30 to-red-600/20",
    border: "border-orange-500/40",
    glow: "hsl(20,90%,55%)",
    icon: "⚡",
  },
  {
    id: "terminador-ia",
    name: "TERMINADOR IA",
    desc: "IA de alto rendimiento a tu servicio. Automatiza, optimiza, domina.",
    status: "soon",
    gradient: "from-red-600/30 to-rose-600/20",
    border: "border-red-500/40",
    glow: "hsl(0,85%,55%)",
    icon: "🤖",
  },
  {
    id: "universo-musical",
    name: "UNIVERSO MUSICAL HBG",
    desc: "La música original del universo. Sonidos que trascienden géneros.",
    status: "beta",
    gradient: "from-purple-600/30 to-fuchsia-600/20",
    border: "border-purple-500/40",
    glow: "hsl(270,80%,65%)",
    icon: "🎵",
  },
];

const UPCOMING_RELEASES = [
  { title: "Señal Digital", from: "Universo Musical HBG", gradient: "from-purple-800 to-indigo-900" },
  { title: "Frecuencia", from: "Universo Musical HBG", gradient: "from-cyan-900 to-blue-900" },
  { title: "Pulso", from: "Universo Musical HBG", gradient: "from-fuchsia-900 to-purple-900" },
  { title: "Neon Dreams", from: "Universo Musical HBG", gradient: "from-pink-900 to-rose-900" },
];

export function Universe() {
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
          className="text-4xl mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          🌌
        </motion.div>
        <h1
          className="font-display text-2xl font-black tracking-widest mb-2"
          style={{
            background: "linear-gradient(135deg, hsl(270,80%,75%), hsl(200,100%,70%), hsl(300,90%,70%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 15px hsl(270 80% 65% / 0.4))",
          }}
        >
          UNIVERSO HBG
        </h1>
        <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase">H... &nbsp; B... &nbsp; G...</p>
        <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
          Un ecosistema de apps creadas para evolucionar contigo
        </p>
      </div>

      {/* Apps Grid */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Globe size={14} />
          Proyectos del universo
        </h2>
        <div className="space-y-3">
          {HBG_APPS.map((app, i) => (
            <motion.div
              key={app.id}
              data-testid={`card-app-${app.id}`}
              className={cn(
                "relative p-5 rounded-2xl border bg-gradient-to-br overflow-hidden cursor-default",
                app.gradient, app.border
              )}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ background: app.glow, transform: "translate(30%, -30%)" }}
              />
              <div className="flex items-start gap-4">
                <div className="text-3xl">{app.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-sm font-bold tracking-wider">{app.name}</h3>
                    {app.status === "soon" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        <Lock size={8} />
                        Próximamente
                      </span>
                    )}
                    {app.status === "beta" && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{
                          background: "hsl(270 80% 65% / 0.2)",
                          color: "hsl(var(--primary))",
                          border: "1px solid hsl(270 80% 65% / 0.3)",
                        }}
                      >
                        Beta
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{app.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Universo Musical HBG */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Music size={14} />
          Universo Musical HBG
        </h2>

        <div
          className="p-5 rounded-2xl border mb-5"
          style={{
            background: "linear-gradient(135deg, hsl(270 40% 12%) 0%, hsl(300 30% 10%) 100%)",
            borderColor: "hsl(270 40% 25%)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-primary" />
            <h3 className="font-display text-sm font-bold tracking-wider text-primary">Música Original</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Canciones, álbumes y proyectos musicales exclusivos del universo HBG. Pronto podrás escuchar, ver letras y vivir la historia detrás de cada canción.
          </p>
          <button
            data-testid="button-notify-me"
            className="w-full py-3 rounded-xl text-sm font-medium border transition-colors"
            style={{
              borderColor: "hsl(270 40% 30%)",
              color: "hsl(var(--primary))",
              background: "hsl(270 40% 15%)",
            }}
          >
            Notificarme del lanzamiento
          </button>
        </div>

        {/* Releases */}
        <div className="grid grid-cols-2 gap-3">
          {UPCOMING_RELEASES.map((release, i) => (
            <motion.div
              key={release.title}
              data-testid={`card-release-${i}`}
              className="rounded-2xl overflow-hidden relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.07 }}
            >
              <div className={cn("h-32 bg-gradient-to-br", release.gradient)} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40">
                <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[9px] font-bold uppercase tracking-wider text-white/70">
                  Próximamente
                </div>
                <p className="font-display text-xs font-bold text-white text-center px-2 leading-tight">
                  {release.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
