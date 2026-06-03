import React from "react";
import { Link, useLocation } from "wouter";
import { Music, Zap, Star, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  if (location === "/") return null;

  const tabs = [
    { name: "Música", path: "/player", icon: Music },
    { name: "Fiesta", path: "/party", icon: Zap },
    { name: "Pro", path: "/pro", icon: Star },
    { name: "Universo", path: "/universe", icon: Globe },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border z-50 flex items-center justify-around px-4">
      {tabs.map((tab) => {
        const isActive = location === tab.path;
        const Icon = tab.icon;
        
        return (
          <Link href={tab.path} key={tab.path}>
            <div className={cn(
              "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors cursor-pointer",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <Icon size={20} className={isActive ? "glow-text" : ""} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
