import React from "react";
import { cn } from "@/lib/utils";

interface EqualizerProps {
  isPlaying: boolean;
  className?: string;
  barClassName?: string;
  bars?: number;
}

export function Equalizer({ isPlaying, className, barClassName, bars = 5 }: EqualizerProps) {
  return (
    <div className={cn("flex items-end gap-1 h-full", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 bg-primary rounded-t-sm transition-all",
            isPlaying ? "eq-bar" : "h-1 opacity-50",
            barClassName
          )}
          style={isPlaying ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </div>
  );
}
