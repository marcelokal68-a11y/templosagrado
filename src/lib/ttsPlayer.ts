// Lightweight TTS player using MediaSource for progressive playback when supported,
// falling back to blob URL. Works with the streaming elevenlabs-tts edge function.

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface PlayTTSOptions {
  text: string;
  speed?: number;
  onEnded?: () => void;
}

export interface PlayTTSResult {
  audio: HTMLAudioElement;
  stop: () => void;
}

export async function playTTS({ text, speed = 1.15, onEnded }: PlayTTSOptions): Promise<PlayTTSResult> {
  const response = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ text, speed }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`TTS failed: ${response.status}`);
  }

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
        const reader = response.body!.getReader();
        const queue: Uint8Array[] = [];
        let isAppending = false;
        let readerDone = false;

        const pump = () => {
          if (isAppending || queue.length === 0 || sourceBuffer.updating) return;
          isAppending = true;
          const chunk = queue.shift()!;
          try {
            sourceBuffer.appendBuffer(chunk);
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

        // Start reading chunks
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

    // Play as soon as enough data is buffered
    audio.play().catch(err => console.error('Audio play error:', err));
  } else {
    // Fallback: blob (server still streams, but browser waits for full body)
    const blob = await response.blob();
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
