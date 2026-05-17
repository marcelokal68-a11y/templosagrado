import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const SHOW_ON = ['/learn', '/verse', '/mural', '/journey', '/prayers', '/practice'];

export default function BackToChatFab() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, language } = useApp();

  if (!user) return null;
  const shouldShow = SHOW_ON.some(p => location.pathname.startsWith(p));
  if (!shouldShow) return null;

  const handleClick = () => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) - window.innerHeight;
    const remaining = maxScroll - window.scrollY;

    if (remaining > 4) {
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      window.setTimeout(() => navigate('/'), Math.min(600, 250 + remaining * 0.4));
    } else {
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={t('nav.chat', language)}
      className={cn(
        'fixed z-40 right-4 bottom-20 md:bottom-6',
        'flex items-center gap-2 px-4 h-12 rounded-full',
        'bg-primary text-primary-foreground shadow-lg',
        'hover:bg-primary/90 hover:shadow-xl active:scale-95',
        'transition-all duration-200',
        'border border-primary/20'
      )}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-medium">{t('nav.chat', language)}</span>
    </button>
  );
}
