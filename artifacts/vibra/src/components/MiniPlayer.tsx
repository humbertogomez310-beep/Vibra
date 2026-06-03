import React from "react";
import { useLocation } from "wouter";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause } from "lucide-react";

export function MiniPlayer() {
  const [location] = useLocation();
  const { currentTrack, isPlaying, play, pause, progress, duration } = usePlayer();

  // Don't show on splash or player page
  if (location === "/" || location === "/player" || !currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 left-0 right-0 h-14 bg-card/90 backdrop-blur-sm border-t border-border z-40 flex items-center px-4 cursor-pointer" onClick={(e) => {
      // Could navigate to player here, but for now just exists
    }}>
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-foreground truncate">{currentTrack.name}</p>
        <div className="flex items-end gap-1 h-3 mt-1 opacity-70">
          {isPlaying ? (
            <>
              <div className="w-1 h-2 bg-primary eq-bar" style={{ animationDelay: '0s' }}></div>
              <div className="w-1 h-3 bg-primary eq-bar" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-primary eq-bar" style={{ animationDelay: '0.4s' }}></div>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground">Pausado</span>
          )}
        </div>
      </div>
      
      <button 
        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          isPlaying ? pause() : play();
        }}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
      </button>

      {/* Thin progress bar at bottom of mini player */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/50">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
