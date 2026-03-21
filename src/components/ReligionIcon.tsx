import { Cross, Moon, Star, Flower2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const RELIGION_ICONS: Record<string, typeof Cross> = {
  christian: Cross,
  catholic: Cross,
  protestant: Cross,
  mormon: Cross,
  jewish: Star,
  islam: Moon,
  buddhist: Flower2,
  spiritist: Star,
  umbanda: Star,
  candomble: Star,
  agnostic: Sparkles,
};

const RELIGION_EMOJI: Record<string, string> = {
  hindu: '🕉️',
};

export function getReligionIcon(religion: string) {
  return RELIGION_ICONS[religion] || null;
}

export function getReligionEmoji(religion: string) {
  return RELIGION_EMOJI[religion] || null;
}

export default function ReligionIcon({ religion, className }: { religion: string; className?: string }) {
  const emoji = getReligionEmoji(religion);
  if (emoji) {
    return <span className={cn("text-sm", className)}>{emoji}</span>;
  }
  const IconComponent = getReligionIcon(religion);
  if (IconComponent) {
    return <IconComponent className={cn("h-4 w-4 text-primary", className)} />;
  }
  return <Sparkles className={cn("h-4 w-4 text-primary", className)} />;
}
