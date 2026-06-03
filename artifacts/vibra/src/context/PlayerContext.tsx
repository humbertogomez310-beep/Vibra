import { createContext, useContext, useState, useRef, useEffect } from "react";
import { saveAudio, getAllAudio, deleteAudio } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Track {
  id: string;
  name: string;
  url: string; // object URL, valid for the current session
}

export interface MoodEntry {
  mood: string;
  timestamp: number;
}

export interface RecentEntry {
  trackId: string;
  name: string;
  timestamp: number;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

// Stored in localStorage — survives sessions without the audio blob
interface TrackMeta {
  id: string;
  name: string;
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
  isLoading: boolean;
  favorites: string[];
  recents: RecentEntry[];
  playlists: Playlist[];
  history: MoodEntry[];
  stats: { plays: number; topMood: string | null };

  loadTracks: (files: File[]) => Promise<void>;
  play: () => void;
  pause: () => void;
  playTrack: (index: number) => void;
  next: () => void;
  prev: () => void;
  setMood: (mood: string) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  seek: (time: number) => void;
  toggleFavorite: (trackId: string) => void;
  removeTrack: (trackId: string) => Promise<void>;
  addPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ls<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private mode — silently skip
  }
}

function calcTopMood(hist: MoodEntry[]): string | null {
  if (!hist.length) return null;
  const counts: Record<string, number> = {};
  let maxMood = hist[0].mood;
  hist.forEach((h) => {
    counts[h.mood] = (counts[h.mood] ?? 0) + 1;
    if (counts[h.mood] > (counts[maxMood] ?? 0)) maxMood = h.mood;
  });
  return maxMood;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<RecentEntry[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<{ plays: number; topMood: string | null }>({
    plays: 0,
    topMood: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs that audio event handlers read — always current, no stale closure
  const tracksRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);
  const shuffleRef = useRef(false);
  tracksRef.current = tracks;
  currentIndexRef.current = currentTrackIndex;
  shuffleRef.current = shuffle;

  // ─── Boot: restore library + preferences ─────────────────────────────────

  useEffect(() => {
    document.documentElement.classList.add("dark");

    // Create the single shared audio element
    const audio = new Audio();
    audio.volume = 1;
    audioRef.current = audio;

    // Restore simple preferences
    const savedMood = localStorage.getItem("vibra_last_mood");
    if (savedMood) setCurrentMood(savedMood);

    const savedVol = parseFloat(localStorage.getItem("vibra_volume") ?? "1");
    if (!isNaN(savedVol)) {
      setVolumeState(savedVol);
      audio.volume = savedVol;
    }

    setFavorites(ls<string[]>("vibra_favorites", []));
    setRecents(ls<RecentEntry[]>("vibra_recents", []));
    setPlaylists(ls<Playlist[]>("vibra_playlists", []));

    const savedHistory = ls<MoodEntry[]>("vibra_mood_history", []);
    setHistory(savedHistory);
    setStats({ plays: parseInt(localStorage.getItem("vibra_plays") ?? "0", 10), topMood: calcTopMood(savedHistory) });

    // Restore audio library from IndexedDB
    const restoreLibrary = async () => {
      try {
        const stored = await getAllAudio();
        const meta = ls<TrackMeta[]>("vibra_track_meta", []);

        if (stored.length === 0) {
          setIsLoading(false);
          return;
        }

        // Build a map of id→name from metadata
        const nameMap: Record<string, string> = {};
        meta.forEach((m) => { nameMap[m.id] = m.name; });

        const restored: Track[] = stored.map(({ id, blob }) => ({
          id,
          name: nameMap[id] ?? id,
          url: URL.createObjectURL(blob),
        }));

        setTracks(restored);
      } catch {
        // IndexedDB unavailable — start fresh
      } finally {
        setIsLoading(false);
      }
    };

    restoreLibrary();

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // ─── Audio event listeners — attach once, use refs for latest state ────────

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      const t = tracksRef.current;
      const ci = currentIndexRef.current;
      const sh = shuffleRef.current;
      if (!t.length) return;
      const nextIdx = sh
        ? Math.floor(Math.random() * t.length)
        : ci + 1 >= t.length
        ? 0
        : ci + 1;
      if (audioRef.current && nextIdx >= 0 && nextIdx < t.length) {
        audioRef.current.src = t[nextIdx].url;
        audioRef.current.play().catch(() => {});
        setCurrentTrackIndex(nextIdx);
        setIsPlaying(true);
        pushRecent(t[nextIdx]);
        incrementPlays();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Internal helpers ──────────────────────────────────────────────────────

  const pushRecent = (track: Track) => {
    setRecents((prev) => {
      const entry: RecentEntry = { trackId: track.id, name: track.name, timestamp: Date.now() };
      const filtered = prev.filter((r) => r.trackId !== track.id);
      const next = [entry, ...filtered].slice(0, 30);
      lsSet("vibra_recents", next);
      return next;
    });
  };

  const incrementPlays = () => {
    setStats((s) => {
      const newPlays = s.plays + 1;
      lsSet("vibra_plays", newPlays);
      return { ...s, plays: newPlays };
    });
  };

  // ─── Public API ───────────────────────────────────────────────────────────

  const loadTracks = async (files: File[]) => {
    const valid = files.filter(
      (f) =>
        ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/x-wav"].includes(f.type) ||
        /\.(mp3|wav|ogg)$/i.test(f.name)
    );
    if (!valid.length) return;

    const newTracks: Track[] = valid.map((f) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: f.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(f),
    }));

    // Save blobs and metadata for next session
    const meta = ls<TrackMeta[]>("vibra_track_meta", []);
    for (let i = 0; i < valid.length; i++) {
      await saveAudio(newTracks[i].id, valid[i]);
      meta.push({ id: newTracks[i].id, name: newTracks[i].name });
    }
    lsSet("vibra_track_meta", meta);

    setTracks((prev) => {
      const merged = [...prev, ...newTracks];
      // Auto-load first track if library was empty
      if (prev.length === 0 && newTracks.length > 0 && audioRef.current) {
        setCurrentTrackIndex(0);
      }
      return merged;
    });
  };

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src && tracks.length > 0) {
      playTrack(0);
    } else if (audio.src) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const playTrack = (index: number) => {
    const t = tracksRef.current;
    const audio = audioRef.current;
    if (!audio || index < 0 || index >= t.length) return;
    audio.src = t[index].url;
    audio.play()
      .then(() => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
        pushRecent(t[index]);
        incrementPlays();
      })
      .catch(() => {});
  };

  const next = () => {
    const t = tracksRef.current;
    if (!t.length) return;
    const ci = currentIndexRef.current;
    const sh = shuffleRef.current;
    const nextIdx = sh
      ? Math.floor(Math.random() * t.length)
      : ci + 1 >= t.length
      ? 0
      : ci + 1;
    playTrack(nextIdx);
  };

  const prev = () => {
    const t = tracksRef.current;
    if (!t.length) return;
    // If >3s in, restart current track instead of skipping back
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const ci = currentIndexRef.current;
    playTrack(ci <= 0 ? t.length - 1 : ci - 1);
  };

  const setMood = (mood: string) => {
    setCurrentMood(mood);
    localStorage.setItem("vibra_last_mood", mood);
    setHistory((prev) => {
      const entry: MoodEntry = { mood, timestamp: Date.now() };
      const next = [entry, ...prev].slice(0, 100);
      lsSet("vibra_mood_history", next);
      setStats((s) => ({ ...s, topMood: calcTopMood(next) }));
      return next;
    });
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
    lsSet("vibra_volume", v);
  };

  const toggleShuffle = () => setShuffle((s) => !s);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId];
      lsSet("vibra_favorites", next);
      return next;
    });
  };

  const removeTrack = async (trackId: string) => {
    setTracks((prev) => {
      const idx = prev.findIndex((t) => t.id === trackId);
      if (idx === -1) return prev;
      URL.revokeObjectURL(prev[idx].url);
      const next = prev.filter((t) => t.id !== trackId);

      // Adjust current index
      setCurrentTrackIndex((ci) => {
        if (ci === idx) {
          audioRef.current?.pause();
          setIsPlaying(false);
          return -1;
        }
        return ci > idx ? ci - 1 : ci;
      });

      return next;
    });

    // Persist
    await deleteAudio(trackId);
    const meta = ls<TrackMeta[]>("vibra_track_meta", []).filter((m) => m.id !== trackId);
    lsSet("vibra_track_meta", meta);

    // Remove from favorites, recents, playlists
    setFavorites((prev) => {
      const next = prev.filter((id) => id !== trackId);
      lsSet("vibra_favorites", next);
      return next;
    });
    setRecents((prev) => {
      const next = prev.filter((r) => r.trackId !== trackId);
      lsSet("vibra_recents", next);
      return next;
    });
    setPlaylists((prev) => {
      const next = prev.map((p) => ({ ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }));
      lsSet("vibra_playlists", next);
      return next;
    });
  };

  const addPlaylist = (name: string) => {
    const pl: Playlist = { id: `pl_${Date.now()}`, name: name.trim(), trackIds: [] };
    setPlaylists((prev) => {
      const next = [...prev, pl];
      lsSet("vibra_playlists", next);
      return next;
    });
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => {
      const next = prev.filter((p) => p.id !== id);
      lsSet("vibra_playlists", next);
      return next;
    });
  };

  const addToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId)
          ? { ...p, trackIds: [...p.trackIds, trackId] }
          : p
      );
      lsSet("vibra_playlists", next);
      return next;
    });
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) =>
        p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p
      );
      lsSet("vibra_playlists", next);
      return next;
    });
  };

  return (
    <PlayerContext.Provider
      value={{
        tracks,
        currentTrackIndex,
        currentTrack: currentTrackIndex >= 0 && currentTrackIndex < tracks.length
          ? tracks[currentTrackIndex]
          : null,
        isPlaying,
        shuffle,
        volume,
        currentMood,
        progress,
        duration,
        isLoading,
        favorites,
        recents,
        playlists,
        history,
        stats,
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
        toggleFavorite,
        removeTrack,
        addPlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
