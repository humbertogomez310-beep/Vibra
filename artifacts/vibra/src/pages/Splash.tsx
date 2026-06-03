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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; r: number; dx: number; dy: number; color: string; alpha: number }[] = [];
    const colors = ["hsl(270,80%,65%)", "hsl(200,100%,60%)", "hsl(300,90%,60%)", "hsl(220,100%,70%)"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.6,
        dy: -(Math.random() * 0.8 + 0.3),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xs font-medium tracking-[0.4em] text-muted-foreground uppercase"
        >
          H... &nbsp; B... &nbsp; G...
        </motion.div>

        <motion.h1
          className="font-display text-8xl sm:text-9xl font-black tracking-wider select-none"
          style={{
            background: "linear-gradient(135deg, hsl(270,80%,75%) 0%, hsl(200,100%,70%) 50%, hsl(300,90%,70%) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            filter: "drop-shadow(0 0 30px hsl(270 80% 65% / 0.6)) drop-shadow(0 0 60px hsl(200 100% 60% / 0.3))",
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          VIBRA
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg text-muted-foreground max-w-xs leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          La música que entiende tu estado de ánimo
        </motion.p>

        <motion.button
          data-testid="button-start-experience"
          onClick={() => setLocation("/player")}
          className="mt-4 px-10 py-4 font-display text-sm font-bold tracking-widest uppercase rounded-full relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(270,80%,55%) 0%, hsl(200,100%,50%) 100%)",
            boxShadow: "0 0 30px hsl(270 80% 65% / 0.5), 0 0 60px hsl(200 100% 60% / 0.2)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 50px hsl(270 80% 65% / 0.8), 0 0 80px hsl(200 100% 60% / 0.4)" }}
          whileTap={{ scale: 0.97 }}
        >
          INICIAR EXPERIENCIA
        </motion.button>

        <motion.div
          className="flex items-center gap-2 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-primary eq-bar"
              style={{
                height: `${10 + Math.random() * 14}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
