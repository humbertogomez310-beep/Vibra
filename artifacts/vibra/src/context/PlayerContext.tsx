import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

export interface Track {
  id: string;
  name: string;
  url: string;
  file: File;
}

export interface MoodEntry {
  mood: string;
  timestamp: number;
}

interface PlayerContextType {
  tracks: Track[];
  currentTrackIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  shuffle: boolean;
  volume: number;
  currentMood: string | null;
  progress: number;
  duration: number;
  loadTracks: (files: File[]) => void;
  play: () => void;
  pause: () => void;
  playTrack: (index: number) => void;
  next: () => void;
  prev: () => void;
  setMood: (mood: string) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  seek: (time: number) => void;
  history: MoodEntry[];
  stats: { plays: number; topMood: string | null };
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(1);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<{ plays: number; topMood: string | null }>({ plays: 0, topMood: null });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize
  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const savedMood = localStorage.getItem("vibra_last_mood");
    if (savedMood) setCurrentMood(savedMood);

    const savedHistory = localStorage.getItem("vibra_mood_history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
        calculateStats(parsed);
      } catch (e) {
        // ignore
      }
    }

    const savedPlays = localStorage.getItem("vibra_plays");
    if (savedPlays) {
      setStats(s => ({ ...s, plays: parseInt(savedPlays, 10) }));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const calculateStats = (hist: MoodEntry[]) => {
    if (hist.length === 0) return;
    const counts: Record<string, number> = {};
    let maxCount = 0;
    let maxMood = hist[0].mood;

    hist.forEach(h => {
      counts[h.mood] = (counts[h.mood] || 0) + 1;
      if (counts[h.mood] > maxCount) {
        maxCount = counts[h.mood];
        maxMood = h.mood;
      }
    });

    setStats(s => ({ ...s, topMood: maxMood }));
  };

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    next();
  }, [tracks, currentTrackIndex, shuffle]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded]);

  const loadTracks = (files: File[]) => {
    const newTracks = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
      file
    }));
    setTracks(prev => [...prev, ...newTracks]);
    if (currentTrackIndex === -1 && newTracks.length > 0) {
      setCurrentTrackIndex(0);
    }
  };

  const playTrack = (index: number) => {
    if (index >= 0 && index < tracks.length && audioRef.current) {
      setCurrentTrackIndex(index);
      audioRef.current.src = tracks[index].url;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        incrementPlays();
      }).catch(e => console.error("Playback failed", e));
    }
  };

  const incrementPlays = () => {
    setStats(s => {
      const newPlays = s.plays + 1;
      localStorage.setItem("vibra_plays", newPlays.toString());
      return { ...s, plays: newPlays };
    });
  };

  const play = () => {
    if (audioRef.current) {
      if (!audioRef.current.src && tracks.length > 0) {
        playTrack(0);
      } else if (audioRef.current.src) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const next = () => {
    if (tracks.length === 0) return;
    let nextIdx = currentTrackIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else if (nextIdx >= tracks.length) {
      nextIdx = 0;
    }
    playTrack(nextIdx);
  };

  const prev = () => {
    if (tracks.length === 0) return;
    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) prevIdx = tracks.length - 1;
    playTrack(prevIdx);
  };

  const setMood = (mood: string) => {
    setCurrentMood(mood);
    localStorage.setItem("vibra_last_mood", mood);
    
    const newEntry = { mood, timestamp: Date.now() };
    const newHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem("vibra_mood_history", JSON.stringify(newHistory));
    calculateStats(newHistory);
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const toggleShuffle = () => {
    setShuffle(s => !s);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  return (
    <PlayerContext.Provider value={{
      tracks,
      currentTrackIndex,
      currentTrack: currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null,
      isPlaying,
      shuffle,
      volume,
      currentMood,
      progress,
      duration,
      loadTracks,
      play,
      pause,
      playTrack,
      next,
      prev,
      setMood,
      setVolume,
      toggleShuffle,
      seek,
      history,
      stats
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
