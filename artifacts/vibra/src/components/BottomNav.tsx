import { Link, useLocation } from "wouter";
import { Music, Zap, Star, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Música", path: "/player", icon: Music },
  { name: "Fiesta", path: "/party", icon: Zap },
  { name: "Pro", path: "/pro", icon: Star },
  { name: "Universo", path: "/universe", icon: Globe },
];

export function BottomNav() {
  const [location] = useLocation();
  if (location === "/") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 z-50 flex items-center justify-around px-2"
      style={{
        background: "hsla(230, 25%, 5%, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid hsla(270, 50%, 40%, 0.18)",
        boxShadow: "0 -4px 20px hsla(270, 80%, 30%, 0.15)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = location === tab.path;
        const Icon = tab.icon;
        return (
          <Link href={tab.path} key={tab.path}>
            <div className="relative flex flex-col items-center justify-center w-16 h-full gap-1 cursor-pointer transition-all">
              {/* Active indicator line */}
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(270,80%,65%), hsl(195,100%,55%))",
                    boxShadow: "0 0 8px hsl(270,80%,65%), 0 0 16px hsl(270,80%,65%,0.4)",
                  }}
                />
              )}

              <Icon
                size={20}
                className={cn("transition-all", isActive ? "text-primary scale-110" : "text-muted-foreground")}
                style={isActive ? { filter: "drop-shadow(0 0 6px hsl(var(--primary)))" } : undefined}
              />
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.name}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
