// IndexedDB wrapper for persisting audio blobs across sessions.
// Falls back gracefully if IndexedDB is unavailable (private mode, etc.).

const DB_NAME = "vibra_db";
const DB_VERSION = 1;
const STORE_AUDIO = "audio";

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO);
      }
    };

    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function saveAudio(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, "readwrite");
      tx.objectStore(STORE_AUDIO).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail — session-only library is still usable
  }
}

export async function getAllAudio(): Promise<{ id: string; blob: Blob }[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, "readonly");
      const results: { id: string; blob: Blob }[] = [];
      const cursor = tx.objectStore(STORE_AUDIO).openCursor();

      cursor.onsuccess = (e) => {
        const c = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (c) {
          results.push({ id: String(c.key), blob: c.value as Blob });
          c.continue();
        } else {
          resolve(results);
        }
      };
      cursor.onerror = () => reject(cursor.error);
    });
  } catch {
    return [];
  }
}

export async function deleteAudio(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, "readwrite");
      tx.objectStore(STORE_AUDIO).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail
  }
}
