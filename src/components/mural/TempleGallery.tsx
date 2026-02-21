import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { SACRED_PLACES } from './sacredPlaces';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TempleGalleryProps {
  userReligion: string;
  onSelect: (religion: string) => void;
}

export default function TempleGallery({ userReligion, onSelect }: TempleGalleryProps) {
  const { language } = useApp();

  const labels = {
    title: language === 'en' ? 'Sacred Places of the World' : language === 'es' ? 'Lugares Sagrados del Mundo' : 'Locais Sagrados do Mundo',
    subtitle: language === 'en'
      ? 'Visit any temple. Post only in your own tradition.'
      : language === 'es'
        ? 'Visita cualquier templo. Publica solo en tu tradición.'
        : 'Visite qualquer templo. Poste apenas na sua tradição.',
    yourTradition: language === 'en' ? 'Your tradition' : language === 'es' ? 'Tu tradición' : 'Sua tradição',
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold shimmer-text">🏛️ {labels.title}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{labels.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {SACRED_PLACES.map(place => {
          const isUserTemple = place.religion === userReligion;
          return (
            <button
              key={place.religion}
              onClick={() => onSelect(place.religion)}
              className={cn(
                'relative group overflow-hidden rounded-xl h-36 sm:h-44 transition-all duration-300 text-left',
                'hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary',
                isUserTemple && 'ring-2 ring-primary sacred-glow'
              )}
            >
              <img
                src={place.imageUrl}
                alt={place.name[language] || place.name['pt-BR']}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {isUserTemple && (
                <Badge className="absolute top-2 right-2 sacred-gradient text-primary-foreground text-[10px] px-1.5 py-0.5 border-0">
                  ⭐ {labels.yourTradition}
                </Badge>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-primary-foreground font-display font-bold text-sm leading-tight drop-shadow-lg" style={{ WebkitTextFillColor: 'initial' }}>
                  {place.name[language] || place.name['pt-BR']}
                </p>
                <p className="text-white/60 text-[10px] mt-0.5">
                  {t(`religion.${place.religion}`, language)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
