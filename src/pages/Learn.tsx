import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import ReligionIcon from '@/components/ReligionIcon';
import { Sparkles } from 'lucide-react';

const religions = [
  'christian', 'catholic', 'protestant', 'mormon', 'jewish', 'islam',
  'hindu', 'buddhist', 'spiritist', 'umbanda', 'candomble', 'agnostic',
];

const philosophies = [
  'stoicism', 'logosophy', 'humanism', 'epicureanism', 'transhumanism',
  'pantheism', 'existentialism', 'objectivism', 'transcendentalism',
  'altruism', 'rationalism', 'optimistic_nihilism', 'absurdism',
  'utilitarianism', 'pragmatism', 'shamanism', 'taoism', 'anthroposophy',
  'cosmism', 'ubuntu',
];

export default function Learn() {
  const { language } = useApp();
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold text-primary mb-2">{t('learn.title', language)}</h1>
      <p className="text-muted-foreground mb-8">{t('learn.subtitle', language)}</p>

      <h2 className="text-lg font-semibold mb-4">{t('panel.mode_religion', language)}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
        {religions.map(r => (
          <button
            key={r}
            onClick={() => navigate(`/learn/${r}`)}
            className="flex items-center gap-2 p-3 rounded-lg border border-primary/10 bg-card hover:bg-primary/10 transition-all text-left"
          >
            <ReligionIcon religion={r} className="h-5 w-5" />
            <span className="text-sm font-medium">{t(`religion.${r}`, language)}</span>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">{t('panel.mode_philosophy', language)}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {philosophies.map(p => (
          <button
            key={p}
            onClick={() => navigate(`/learn/${p}`)}
            className="flex items-center gap-2 p-3 rounded-lg border border-primary/10 bg-card hover:bg-primary/10 transition-all text-left"
          >
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">{t(`philosophy.${p}`, language)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
