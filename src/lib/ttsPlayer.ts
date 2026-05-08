// Lightweight TTS player using MediaSource for progressive playback when supported,
// falling back to blob URL. Caches finished audio in IndexedDB so repeated narrations
// of the same text play instantly.

import { hashKey, getCachedAudio, putCachedAudio } from './ttsCache';
import { supabase } from '@/integrations/supabase/client';

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export class TTSCapReachedError extends Error {
  constructor(public cap: number, public used: number, message: string) {
    super(message);
    this.name = 'TTSCapReachedError';
  }
}

export class TTSAuthRequiredError extends Error {
  constructor() {
    super('Faça login para ouvir narrações em áudio.');
    this.name = 'TTSAuthRequiredError';
  }
}

export interface PlayTTSOptions {
  text: string;
  speed?: number;
  onEnded?: () => void;
}

export interface PlayTTSResult {
  audio: HTMLAudioElement;
  stop: () => void;
}

async function playFromBlob(blob: Blob, onEnded?: () => void): Promise<PlayTTSResult> {
  const audio = new Audio();
  const url = URL.createObjectURL(blob);
  audio.src = url;
  const cleanup = () => URL.revokeObjectURL(url);
  audio.addEventListener('ended', () => { cleanup(); onEnded?.(); });
  await audio.play();
  return {
    audio,
    stop: () => { audio.pause(); cleanup(); },
  };
}

export async function playTTS({ text, speed = 1.15, onEnded }: PlayTTSOptions): Promise<PlayTTSResult> {
  // 1) Cache hit → instant playback
  const cacheKey = await hashKey(text, speed);
  const cached = await getCachedAudio(cacheKey);
  if (cached) {
    return playFromBlob(cached, onEnded);
  }

  // 2) Cache miss → fetch streaming response
  // The TTS edge function REQUIRES an authenticated user (monthly cap is
  // enforced per-user). Anonymous calls would be rejected as 401, so we
  // bail out early with a clear error instead of sending the publishable
  // key (which has no `sub` claim and triggers a confusing 401).
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new TTSAuthRequiredError();
  }

  const response = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ text, speed }),
  });

  if (response.status === 401 || response.status === 403) {
    throw new TTSAuthRequiredError();
  }


  if (response.status === 429) {
    let payload: any = {};
    try { payload = await response.json(); } catch {}
    throw new TTSCapReachedError(
      payload.cap ?? 300,
      payload.used ?? 0,
      payload.message ?? 'Limite mensal de narrações atingido.'
    );
  }

  if (!response.ok || !response.body) {
    throw new Error(`TTS failed: ${response.status}`);
  }

  // Tee the body: one branch feeds the player, the other accumulates for the cache
  const [playStream, cacheStream] = response.body.tee();

  // Cache accumulator (runs in background)
  (async () => {
    try {
      const reader = cacheStream.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
      if (blob.size > 0) await putCachedAudio(cacheKey, blob);
    } catch (e) {
      console.warn('TTS cache write skipped:', e);
    }
  })();

  const audio = new Audio();
  let stopped = false;

  const cleanup = () => {
    if (audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
  };

  audio.addEventListener('ended', () => {
    cleanup();
    onEnded?.();
  });

  // Try MediaSource for progressive playback
  const mimeType = 'audio/mpeg';
  const canStream = typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mimeType);

  if (canStream) {
    const mediaSource = new MediaSource();
    audio.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', async () => {
      try {
        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        const reader = playStream.getReader();
        const queue: Uint8Array[] = [];
        let isAppending = false;
        let readerDone = false;

        const pump = () => {
          if (isAppending || queue.length === 0 || sourceBuffer.updating) return;
          isAppending = true;
          const chunk = queue.shift()!;
          try {
            sourceBuffer.appendBuffer(chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer);
          } catch (e) {
            console.error('appendBuffer error:', e);
            isAppending = false;
          }
        };

        sourceBuffer.addEventListener('updateend', () => {
          isAppending = false;
          if (queue.length > 0) {
            pump();
          } else if (readerDone && mediaSource.readyState === 'open') {
            try { mediaSource.endOfStream(); } catch {}
          }
        });

        while (!stopped) {
          const { done, value } = await reader.read();
          if (done) {
            readerDone = true;
            if (!isAppending && queue.length === 0 && mediaSource.readyState === 'open') {
              try { mediaSource.endOfStream(); } catch {}
            }
            break;
          }
          if (value) {
            queue.push(value);
            pump();
          }
        }
      } catch (e) {
        console.error('MediaSource stream error:', e);
      }
    });

    audio.play().catch(err => console.error('Audio play error:', err));
  } else {
    // Fallback: read full stream into a blob
    const reader = playStream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
    audio.src = URL.createObjectURL(blob);
    await audio.play();
  }

  return {
    audio,
    stop: () => {
      stopped = true;
      audio.pause();
      cleanup();
    },
  };
}
