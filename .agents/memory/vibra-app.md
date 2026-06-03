---
name: VIBRA app
description: React+Vite music player PWA at artifacts/vibra — architecture, patterns, and completed features for the Universo HBG ecosystem.
---

## Stack
- pnpm workspace, React + Vite, TypeScript, Tailwind v4, framer-motion, wouter, lucide-react, vite-plugin-pwa

## Audio architecture
- IndexedDB blobs (`src/lib/db.ts`) — audio files survive page refresh
- localStorage `vibra_track_meta` = `TrackMeta[]` {id, name, duration} — avoids re-reading IndexedDB on boot
- Blob object URLs created at load time and stored in Track.url (revoked on removeTrack)
- `src/lib/id3.ts` — pure ID3v2 TIT2 parser (no deps) + `getAudioDuration()` via `preload="metadata"`
- Stale-closure fix: all audio event handlers read state via refs (tracksRef, currentIndexRef, shuffleRef, repeatRef)

## PlayerContext features (as of V2)
- shuffle, repeat, volume, mood, progress, duration, isLoading
- favorites, recents (30 cap), playlists, history (100 cap), stats {plays, topMood}
- Repeat mode: repeatRef in onEnded; restarts track at currentTime=0 instead of advancing

**Why refs:** audio event listeners attached once on mount (empty deps array) — refs keep them reading live state without re-attaching.

## Pages
- `/` Splash — animated particles canvas, stacked H·B·G signature, VIBRA logo
- `/player` Player — Música tab (upload, search, A-Z sort, Todos/Recientes/Favoritos/Listas), Vibra tab (8 mood selectors)
- `/party` Party — canvas orb visualizer, energy levels, fullscreen
- `/pro` Pro — AI Musical (local: time-based mood, top tracks, discovery, insights), Karaoke placeholder, 4-stat grid, mood history
- `/universe` Universe — premium cards for INSTINTO, TERMINADOR IA, UNIVERSO MUSICAL HBG

## Completed V2 features
- HBG signature throughout (stacked H·B·G letters with per-letter glow)
- Premium CSS: ambient radial gradient body, glass-card, glow-box/glow-text enhanced, neon-border animation, shimmer-text, scrollbar-hide
- Search bar + A-Z sort in library (Todos view)
- Repeat mode button (Repeat2 icon) with accent dot indicator
- MiniPlayer: click → navigate to /player, next button, progress gradient bar
- BottomNav: colored top-line active indicator with glow
- PWA: vite-plugin-pwa installed, SW in production only (devOptions.enabled=false)
- ID3 title reading + duration display per track row

## Gotchas
- Do NOT use `devOptions: { enabled: true }` for vite-plugin-pwa — SW caching breaks Replit HMR
- `sortMode === "alpha"` spreads the array before sorting (tracks is read-only state)
- Track row `onRemove` uses `e.stopPropagation()` to prevent triggering `onPlay`
- Party.tsx OrbCanvas wrapped in ErrorBoundary to survive canvas context failures
