import { useState } from 'react';
import { Trash2, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import ReligionIcon from '@/components/ReligionIcon';
import { Badge } from '@/components/ui/badge';
import ReportDialog from './ReportDialog';

interface PrayerNoteProps {
  post: {
    id: string;
    content: string;
    display_name: string | null;
    religion: string | null;
    philosophy: string | null;
    is_anonymous: boolean;
    is_public: boolean;
    user_id: string;
    created_at: string;
  };
  reactions: { pray: number; heart: number; userPray: boolean; userHeart: boolean };
  onReact: (postId: string, type: 'pray' | 'heart') => void;
  onDelete?: () => void;
  showReligionBadge?: boolean;
  rotationClass?: string;
}

export default function PrayerNote({ post, reactions, onReact, onDelete, showReligionBadge, rotationClass }: PrayerNoteProps) {
  const { language, user } = useApp();
  const [reportOpen, setReportOpen] = useState(false);
  const isOwn = user?.id === post.user_id;

  const affiliation = post.religion || post.philosophy;
  const affiliationLabel = affiliation
    ? t(`religion.${affiliation}`, language) || t(`philosophy.${affiliation}`, language) || affiliation
    : '';

  const dateStr = new Date(post.created_at).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : language === 'es' ? 'es' : 'en', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <>
      <div
        className={cn(
          'group relative bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40',
          'rounded-sm p-4 shadow-md hover:shadow-lg transition-all duration-300',
          'before:absolute before:inset-0 before:bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.08)_100%)]',
          rotationClass || ''
        )}
      >
        {/* Religion icon */}
        {affiliation && (
          <div className="flex items-center gap-1.5 mb-2">
            <ReligionIcon religion={affiliation} className="h-3.5 w-3.5 opacity-60" />
            {showReligionBadge && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-0">
                {affiliationLabel}
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100 font-serif italic whitespace-pre-wrap break-words">
          "{post.content}"
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-400">
            <span className="font-medium">
              {post.is_anonymous ? (language === 'es' ? 'Anónimo' : language === 'en' ? 'Anonymous' : 'Anônimo') : (post.display_name || '?')}
            </span>
            <span>·</span>
            <span>{dateStr}</span>
          </div>

          {/* Reactions + actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onReact(post.id, 'pray')}
              className={cn(
                'flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full transition-colors',
                reactions.userPray
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-amber-200/50 dark:hover:bg-amber-800/30 text-amber-600 dark:text-amber-400'
              )}
            >
              🙏 <span>{reactions.pray || ''}</span>
            </button>
            <button
              onClick={() => onReact(post.id, 'heart')}
              className={cn(
                'flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full transition-colors',
                reactions.userHeart
                  ? 'bg-destructive/20 text-destructive'
                  : 'hover:bg-amber-200/50 dark:hover:bg-amber-800/30 text-amber-600 dark:text-amber-400'
              )}
            >
              ❤️ <span>{reactions.heart || ''}</span>
            </button>

            {/* Report button (not own posts) */}
            {!isOwn && (
              <button
                onClick={() => setReportOpen(true)}
                className="text-xs px-1.5 py-0.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                title={language === 'en' ? 'Report' : language === 'es' ? 'Reportar' : 'Denunciar'}
              >
                <Flag className="h-3 w-3" />
              </button>
            )}

            {/* Delete button (own posts) */}
            {isOwn && onDelete && (
              <button
                onClick={onDelete}
                className="text-xs px-1.5 py-0.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} postId={post.id} />
    </>
  );
}
