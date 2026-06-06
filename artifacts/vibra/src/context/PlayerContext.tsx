import { createContext, useContext, useState, useRef, useEffect } from "react";
import { saveAudio, getAllAudio, deleteAudio } from "@/lib/db";
import { getAudioDuration } from "@/lib/id3";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Track {
  id: string;
  name: string;
  url: string;
  duration: number;
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

interface TrackMeta {
  id: string;
  name: string;
  duration: number;
}

interface PlayerContextType {
  tracks: Track[];
  currentTrackIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: boolean;
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
  toggleRepeat: () => void;
  seek: (time: number) => void;
  toggleFavorite: (trackId: string) => void;
  removeTrack: (trackId: string) => Promise<void>;
  addPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

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
  } catch { /* quota exceeded */ }
}

function calcTopMood(hist: MoodEntry[]): string | null {
  if (!hist.length) return null;
  const c: Record<string, number> = {};
  hist.forEach((h) => { c[h.mood] = (c[h.mood] ?? 0) + 1; });
  return Object.keys(c).reduce((a, b) => (c[a] >= c[b] ? a : b));
}

function fileNameToTitle(name: string): string {
  // Strip only the extension — preserve the filename exactly as the user named it.
  return name.replace(/\.[^/.]+$/, "").trim();
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<RecentEntry[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<{ plays: number; topMood: string | null }>({ plays: 0, topMood: null });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs for stable event handler access
  const tracksRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);
  const shuffleRef = useRef(false);
  const repeatRef = useRef(false);
  const lastProgressSaveRef = useRef(0);
  tracksRef.current = tracks;
  currentIndexRef.current = currentTrackIndex;
  shuffleRef.current = shuffle;
  repeatRef.current = repeat;

  // ─── Boot ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const audio = new Audio();
    audioRef.current = audio;

    const savedVol = parseFloat(localStorage.getItem("vibra_volume") ?? "1");
    if (!isNaN(savedVol)) { setVolumeState(savedVol); audio.volume = savedVol; }

    const savedMood = localStorage.getItem("vibra_last_mood");
    if (savedMood) setCurrentMood(savedMood);

    setFavorites(ls<string[]>("vibra_favorites", []));
    setRecents(ls<RecentEntry[]>("vibra_recents", []));
    setPlaylists(ls<Playlist[]>("vibra_playlists", []));

    const savedHistory = ls<MoodEntry[]>("vibra_mood_history", []);
    setHistory(savedHistory);
    setStats({ plays: parseInt(localStorage.getItem("vibra_plays") ?? "0", 10), topMood: calcTopMood(savedHistory) });

    // Restore audio library from IndexedDB
    const restore = async () => {
      try {
        const stored = await getAllAudio();
        const meta = ls<TrackMeta[]>("vibra_track_meta", []);
        if (!stored.length) { setIsLoading(false); return; }
        const map: Record<string, TrackMeta> = {};
        meta.forEach((m) => { map[m.id] = m; });
        const restoredTracks = stored.map(({ id, blob }) => ({
          id,
          name: map[id]?.name ?? "Canción sin título",
          url: URL.createObjectURL(blob),
          duration: map[id]?.duration ?? 0,
        }));
        setTracks(restoredTracks);

        // ── Restore last session (track + seek position) ──────────────────
        const sessionTrackId = localStorage.getItem("vibra_session_track_id");
        const sessionProgress = parseFloat(localStorage.getItem("vibra_session_progress") ?? "0");
        if (sessionTrackId && audioRef.current) {
          const idx = restoredTracks.findIndex((t) => t.id === sessionTrackId);
          if (idx >= 0) {
            setCurrentTrackIndex(idx);
            audioRef.current.src = restoredTracks[idx].url;
            if (sessionProgress > 1) {
              // Seek once metadata is available
              const onMeta = () => {
                if (audioRef.current) {
                  audioRef.current.currentTime = sessionProgress;
                  setProgress(sessionProgress);
                }
                audioRef.current?.removeEventListener("loadedmetadata", onMeta);
              };
              audioRef.current.addEventListener("loadedmetadata", onMeta);
              audioRef.current.load();
            }
          }
        }
      } catch { /* IndexedDB unavailable */ }
      finally { setIsLoading(false); }
    };
    restore();

    return () => { audio.pause(); audioRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Audio events (attached once, read state via refs) ────────────────────

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      // Throttle progress saves to every 5 s to avoid hammering localStorage
      const now = Date.now();
      if (now - lastProgressSaveRef.current > 5000) {
        lastProgressSaveRef.current = now;
        localStorage.setItem("vibra_session_progress", String(Math.floor(audio.currentTime)));
      }
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      // Repeat mode: restart current track
      if (repeatRef.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        incrementPlays();
        return;
      }
      const t = tracksRef.current;
      const ci = currentIndexRef.current;
      const sh = shuffleRef.current;
      if (!t.length) return;
      const nextIdx = sh ? Math.floor(Math.random() * t.length) : ci + 1 >= t.length ? 0 : ci + 1;
      if (audioRef.current && nextIdx >= 0) {
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

  // ─── Internal helpers ─────────────────────────────────────────────────────

  const pushRecent = (track: Track) => {
    setRecents((prev) => {
      const next = [
        { trackId: track.id, name: track.name, timestamp: Date.now() },
        ...prev.filter((r) => r.trackId !== track.id),
      ].slice(0, 30);
      lsSet("vibra_recents", next);
      return next;
    });
  };

  const incrementPlays = () => {
    setStats((s) => {
      const n = s.plays + 1;
      localStorage.setItem("vibra_plays", String(n));
      return { ...s, plays: n };
    });
  };

  // ─── Public API ───────────────────────────────────────────────────────────

  const loadTracks = async (files: File[]) => {
    const valid = files.filter(
      (f) =>
        ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/x-wav", "audio/flac", "audio/aac"].includes(f.type) ||
        /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f.name)
    );
    if (!valid.length) return;

    const meta = ls<TrackMeta[]>("vibra_track_meta", []);
    const newTracks: Track[] = [];

    // Process files sequentially to avoid concurrent IndexedDB write failures
    // that silently drop tracks when many files are loaded at once.
    for (let i = 0; i < valid.length; i++) {
      const f = valid[i];
      // Include index so IDs are always unique even when Date.now() repeats
      const id = `${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`;
      const url = URL.createObjectURL(f);
      // Always use the filename as the display name — never ID3 tags which
      // often contain garbage like "01" or "Track 1".
      const name = fileNameToTitle(f.name);
      const dur = await getAudioDuration(url);
      await saveAudio(id, f);
      meta.push({ id, name, duration: dur });
      newTracks.push({ id, name, url, duration: dur });
    }

    lsSet("vibra_track_meta", meta);

    setTracks((prev) => {
      const merged = [...prev, ...newTracks];
      if (prev.length === 0 && newTracks.length > 0) setCurrentTrackIndex(0);
      return merged;
    });
  };

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src && tracks.length > 0) playTrack(currentTrackIndex >= 0 ? currentTrackIndex : 0);
    else if (audio.src) audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const pause = () => { audioRef.current?.pause(); setIsPlaying(false); };

  const playTrack = (index: number) => {
    const t = tracksRef.current;
    const audio = audioRef.current;
    if (!audio || index < 0 || index >= t.length) return;
    audio.src = t[index].url;
    audio.play().then(() => {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      pushRecent(t[index]);
      incrementPlays();
      // Save session so the app resumes here on next open
      localStorage.setItem("vibra_session_track_id", t[index].id);
      localStorage.setItem("vibra_session_progress", "0");
    }).catch(() => {});
  };

  const next = () => {
    const t = tracksRef.current;
    if (!t.length) return;
    const ci = currentIndexRef.current;
    playTrack(shuffleRef.current ? Math.floor(Math.random() * t.length) : ci + 1 >= t.length ? 0 : ci + 1);
  };

  const prev = () => {
    const t = tracksRef.current;
    if (!t.length) return;
    if (audioRef.current && audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    const ci = currentIndexRef.current;
    playTrack(ci <= 0 ? t.length - 1 : ci - 1);
  };

  const setMood = (mood: string) => {
    setCurrentMood(mood);
    localStorage.setItem("vibra_last_mood", mood);
    setHistory((prev) => {
      const next = [{ mood, timestamp: Date.now() }, ...prev].slice(0, 100);
      lsSet("vibra_mood_history", next);
      setStats((s) => ({ ...s, topMood: calcTopMood(next) }));
      return next;
    });
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
    localStorage.setItem("vibra_volume", String(v));
  };

  const toggleShuffle = () => setShuffle((s) => !s);
  const toggleRepeat = () => setRepeat((r) => !r);

  const seek = (time: number) => {
    if (audioRef.current) { audioRef.current.currentTime = time; setProgress(time); }
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId];
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
      setCurrentTrackIndex((ci) => {
        if (ci === idx) { audioRef.current?.pause(); setIsPlaying(false); return -1; }
        return ci > idx ? ci - 1 : ci;
      });
      return next;
    });
    await deleteAudio(trackId);
    lsSet("vibra_track_meta", ls<TrackMeta[]>("vibra_track_meta", []).filter((m) => m.id !== trackId));
    setFavorites((prev) => { const n = prev.filter((id) => id !== trackId); lsSet("vibra_favorites", n); return n; });
    setRecents((prev) => { const n = prev.filter((r) => r.trackId !== trackId); lsSet("vibra_recents", n); return n; });
    setPlaylists((prev) => { const n = prev.map((p) => ({ ...p, trackIds: p.trackIds.filter((id) => id !== trackId) })); lsSet("vibra_playlists", n); return n; });
  };

  const addPlaylist = (name: string) => {
    setPlaylists((prev) => { const n = [...prev, { id: `pl_${Date.now()}`, name: name.trim(), trackIds: [] }]; lsSet("vibra_playlists", n); return n; });
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => { const n = prev.filter((p) => p.id !== id); lsSet("vibra_playlists", n); return n; });
  };

  const addToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const n = prev.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId) ? { ...p, trackIds: [...p.trackIds, trackId] } : p
      );
      lsSet("vibra_playlists", n);
      return n;
    });
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const n = prev.map((p) =>
        p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p
      );
      lsSet("vibra_playlists", n);
      return n;
    });
  };

  return (
    <PlayerContext.Provider value={{
      tracks, currentTrackIndex, isPlaying, shuffle, repeat, volume, currentMood,
      progress, duration, isLoading, favorites, recents, playlists, history, stats,
      currentTrack: currentTrackIndex >= 0 && currentTrackIndex < tracks.length ? tracks[currentTrackIndex] : null,
      loadTracks, play, pause, playTrack, next, prev,
      setMood, setVolume, toggleShuffle, toggleRepeat, seek,
      toggleFavorite, removeTrack,
      addPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
