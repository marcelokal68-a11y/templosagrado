import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { SACRED_PLACES } from './sacredPlaces';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReligionPickerProps {
  open: boolean;
  onSelected: (religion: string) => void;
}

export default function ReligionPicker({ open, onSelected }: ReligionPickerProps) {
  const { language, user } = useApp();

  const labels = {
    title: language === 'en' ? 'Choose Your Tradition' : language === 'es' ? 'Elige Tu Tradición' : 'Escolha Sua Tradição',
    desc: language === 'en'
      ? 'Select the spiritual tradition that guides your journey. You can change it later in settings.'
      : language === 'es'
        ? 'Selecciona la tradición espiritual que guía tu camino. Puedes cambiarla después.'
        : 'Selecione a tradição espiritual que guia sua jornada. Você pode mudar depois.',
  };

  const handleSelect = async (religion: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ preferred_religion: religion })
      .eq('user_id', user.id);

    if (error) {
      toast.error(language === 'en' ? 'Error saving' : 'Erro ao salvar');
      return;
    }
    onSelected(religion);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center">{labels.title}</DialogTitle>
          <DialogDescription className="text-center">{labels.desc}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {SACRED_PLACES.map(place => (
            <button
              key={place.religion}
              onClick={() => handleSelect(place.religion)}
              className={cn(
                'relative group overflow-hidden rounded-xl h-28 sm:h-32 transition-all duration-300',
                'hover:ring-2 hover:ring-primary hover:scale-[1.02] focus:ring-2 focus:ring-primary focus:outline-none'
              )}
            >
              <img
                src={place.imageUrl}
                alt={place.name[language] || place.name['pt-BR']}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-display font-bold text-sm leading-tight drop-shadow-lg">
                  {t(`religion.${place.religion}`, language)}
                </p>
                <p className="text-white/70 text-[10px] mt-0.5 leading-tight">
                  {place.name[language] || place.name['pt-BR']}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
