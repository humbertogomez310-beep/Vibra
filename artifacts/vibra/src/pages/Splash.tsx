import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export function Splash() {
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();

    type Particle = { x: number; y: number; r: number; dx: number; dy: number; color: string; alpha: number; life: number };
    const colors = ["hsl(270,80%,70%)", "hsl(195,100%,60%)", "hsl(300,90%,65%)", "hsl(220,100%,75%)", "hsl(280,90%,75%)"];

    const makeParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.5,
      dy: -(Math.random() * 0.9 + 0.3),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.1,
      life: Math.random() * 0.5 + 0.5,
    });

    const particles: Particle[] = Array.from({ length: 80 }, makeParticle).map((p) => ({
      ...p,
      y: Math.random() * canvas.height,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mesh gradient background pulse
      const grad = ctx.createRadialGradient(canvas.width * 0.2, canvas.height * 0.8, 0, canvas.width * 0.2, canvas.height * 0.8, canvas.width * 0.7);
      grad.addColorStop(0, "hsla(270,80%,30%,0.08)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grad2 = ctx.createRadialGradient(canvas.width * 0.8, canvas.height * 0.1, 0, canvas.width * 0.8, canvas.height * 0.1, canvas.width * 0.5);
      grad2.addColorStop(0, "hsla(195,100%,30%,0.06)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        ctx.save();
        ctx.globalAlpha = p.alpha * p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();

        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.002;

        if (p.y < -10 || p.life <= 0) particles[i] = makeParticle();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 px-6 text-center"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        {/* HBG Signature – vertical stacked letters */}
        <motion.div
          className="flex flex-col items-start gap-0.5 mb-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          {(["H", "B", "G"] as const).map((letter, i) => (
            <motion.div
              key={letter}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.12, duration: 0.5 }}
            >
              <span
                className="font-display text-sm font-black"
                style={{
                  color: `hsl(${270 + i * 25}, 80%, 68%)`,
                  textShadow: `0 0 12px hsl(${270 + i * 25}, 80%, 65% / 0.6)`,
                }}
              >
                {letter}
              </span>
              <span className="text-[10px] tracking-[0.35em] text-muted-foreground/50 font-medium">
                · · ·
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* VIBRA Logo */}
        <motion.h1
          className="font-display font-black tracking-wider select-none leading-none"
          style={{
            fontSize: "clamp(5rem, 22vw, 9rem)",
            background: "linear-gradient(135deg, hsl(270,80%,75%) 0%, hsl(195,100%,68%) 45%, hsl(300,85%,72%) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 40px hsl(270 80% 65% / 0.55)) drop-shadow(0 0 80px hsl(195 100% 60% / 0.25))",
          }}
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          VIBRA
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-sm sm:text-base text-muted-foreground max-w-xs leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
        >
          La música que entiende tu estado de ánimo
        </motion.p>

        {/* Ecosystem label */}
        <motion.div
          className="px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.25em] uppercase"
          style={{
            background: "hsla(270,80%,40%,0.15)",
            border: "1px solid hsla(270,80%,65%,0.2)",
            color: "hsl(270,80%,75%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Universo HBG
        </motion.div>

        {/* CTA Button */}
        <motion.button
          data-testid="button-start-experience"
          onClick={() => setLocation("/player")}
          className="mt-3 px-10 py-4 font-display text-sm font-bold tracking-widest uppercase rounded-full relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(270,80%,52%) 0%, hsl(195,100%,48%) 100%)",
            boxShadow: "0 0 30px hsl(270 80% 65% / 0.5), 0 0 60px hsl(195 100% 55% / 0.2), inset 0 1px 0 hsla(255,100%,100%,0.2)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          whileHover={{
            scale: 1.06,
            boxShadow: "0 0 50px hsl(270 80% 65% / 0.8), 0 0 90px hsl(195 100% 60% / 0.35)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="relative z-10">INICIAR EXPERIENCIA</span>
        </motion.button>

        {/* Sound wave equalizer bars */}
        <motion.div
          className="flex items-end gap-1.5 h-6 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.6 }}
        >
          {[12, 18, 10, 22, 14, 20, 8, 16, 12].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full eq-bar"
              style={{
                height: `${h}px`,
                background: `linear-gradient(to top, hsl(270,80%,60%), hsl(195,100%,55%))`,
                boxShadow: `0 0 6px hsl(270,80%,65%,0.5)`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
