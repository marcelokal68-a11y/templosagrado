import { Play, Pause, Square, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PodcastControlsProps {
  isPlaying: boolean;
  topicLabel: string;
  speed: number;
  hasActive: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onSpeedChange: (s: number) => void;
  language?: 'en' | 'es' | 'pt';
}

const SPEEDS = [0.9, 1.0, 1.15, 1.3];

export default function PodcastControls({
  isPlaying,
  topicLabel,
  speed,
  hasActive,
  onPlayPause,
  onStop,
  onSpeedChange,
  language = 'pt',
}: PodcastControlsProps) {
  const podcastLabel = language === 'en' ? 'Podcast' : 'Podcast';

  return (
    <div className="mb-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 px-3 py-2 flex items-center gap-2 shadow-sm">
      <div className={cn(
        'shrink-0 w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center ring-1 ring-primary/30',
        isPlaying && 'animate-pulse'
      )}>
        <Mic className="h-4 w-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
          {podcastLabel}
        </p>
        <p className="text-sm font-medium text-foreground truncate">
          {topicLabel}
          {isPlaying && (
            <span className="ml-2 inline-flex items-end gap-[2px] h-3 align-middle" aria-hidden>
              <span className="w-[2px] bg-primary rounded-full animate-pulse" style={{ height: '40%' }} />
              <span className="w-[2px] bg-primary rounded-full animate-pulse" style={{ height: '90%', animationDelay: '120ms' }} />
              <span className="w-[2px] bg-primary rounded-full animate-pulse" style={{ height: '60%', animationDelay: '240ms' }} />
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="h-9 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label={language === 'en' ? 'Playback speed' : language === 'es' ? 'Velocidad' : 'Velocidade'}
        >
          {SPEEDS.map(s => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onPlayPause}
          disabled={!hasActive}
          aria-label={isPlaying ? 'Pausar narração' : 'Retomar narração'}
          className="h-9 w-9 text-primary hover:bg-primary/10"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onStop}
          disabled={!hasActive}
          aria-label={language === 'en' ? 'Stop narration' : language === 'es' ? 'Detener narración' : 'Parar narração'}
          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
