import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ListenButtonProps {
  isPlaying: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  language?: 'en' | 'es' | 'pt';
}

export default function ListenButton({
  isPlaying,
  isLoading = false,
  disabled = false,
  onClick,
  language = 'pt',
}: ListenButtonProps) {
  const label = isPlaying
    ? (language === 'en' ? 'Pause' : language === 'es' ? 'Pausar' : 'Pausar')
    : (language === 'en' ? 'Listen' : language === 'es' ? 'Escuchar' : 'Ouvir');

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={isPlaying ? 'Pausar narração' : 'Ouvir resposta'}
      className={cn(
        'h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-primary',
        isPlaying && 'text-primary'
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isPlaying ? (
        <>
          <Pause className="h-3.5 w-3.5" />
          {/* Animated waveform when playing */}
          <span className="inline-flex items-end gap-[2px] h-3" aria-hidden>
            <span className="w-[2px] bg-primary rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0ms' }} />
            <span className="w-[2px] bg-primary rounded-full animate-pulse" style={{ height: '90%', animationDelay: '120ms' }} />
            <span className="w-[2px] bg-primary rounded-full animate-pulse" style={{ height: '60%', animationDelay: '240ms' }} />
            <span className="w-[2px] bg-primary rounded-full animate-pulse" style={{ height: '80%', animationDelay: '360ms' }} />
          </span>
        </>
      ) : (
        <Play className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
