// Tiny IndexedDB wrapper for caching TTS audio blobs.
// Key = SHA-256 hash of (text + speed). Value = { blob, createdAt }.
// LRU-trimmed to MAX_ENTRIES; entries older than MAX_AGE_MS are ignored.

const DB_NAME = 'tts-cache';
const STORE = 'audio';
const VERSION = 1;
const MAX_ENTRIES = 50;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

interface CacheEntry {
  key: string;
  blob: Blob;
  createdAt: number;
  lastAccess: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'key' });
        store.createIndex('lastAccess', 'lastAccess');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function hashKey(text: string, speed: number): Promise<string> {
  const data = new TextEncoder().encode(`${speed}|${text}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getCachedAudio(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        const entry = req.result as CacheEntry | undefined;
        if (!entry) return resolve(null);
        if (Date.now() - entry.createdAt > MAX_AGE_MS) {
          store.delete(key);
          return resolve(null);
        }
        // Bump lastAccess for LRU
        entry.lastAccess = Date.now();
        store.put(entry);
        resolve(entry.blob);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('TTS cache read failed:', e);
    return null;
  }
}

export async function putCachedAudio(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const now = Date.now();
      store.put({ key, blob, createdAt: now, lastAccess: now } satisfies CacheEntry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    // Trim async (don't block)
    trimCache().catch(() => {});
  } catch (e) {
    console.warn('TTS cache write failed:', e);
  }
}

async function trimCache(): Promise<void> {
  const db = await openDB();
  return new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const countReq = store.count();
    countReq.onsuccess = () => {
      const count = countReq.result;
      if (count <= MAX_ENTRIES) return resolve();
      const toDelete = count - MAX_ENTRIES;
      const idx = store.index('lastAccess');
      const cursorReq = idx.openCursor();
      let deleted = 0;
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor || deleted >= toDelete) return resolve();
        cursor.delete();
        deleted++;
        cursor.continue();
      };
      cursorReq.onerror = () => resolve();
    };
    countReq.onerror = () => resolve();
  });
}

export async function clearTTSCache(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}
