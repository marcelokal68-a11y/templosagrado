import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SacredPlace from '@/components/mural/SacredPlace';
import EcumenicalWall from '@/components/mural/EcumenicalWall';
import TempleGallery from '@/components/mural/TempleGallery';
import ReligionPicker from '@/components/mural/ReligionPicker';
import { ScrollText, Globe, ArrowLeft } from 'lucide-react';

export default function Mural() {
  const { language, user } = useApp();
  const [userReligion, setUserReligion] = useState<string | null>(null);
  const [selectedTemple, setSelectedTemple] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('preferred_religion')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const religion = data?.preferred_religion || null;
        setUserReligion(religion);
        setShowPicker(!religion);
        setLoading(false);
      });
  }, [user]);

  const handleReligionPicked = (religion: string) => {
    setUserReligion(religion);
    setShowPicker(false);
    setSelectedTemple(religion); // go straight to their temple
  };

  const labels = {
    myPlace: language === 'en' ? 'Sacred Places' : language === 'es' ? 'Lugares Sagrados' : 'Locais Sagrados',
    ecumenical: language === 'en' ? 'Ecumenical Meeting' : language === 'es' ? 'Encuentro Ecuménico' : 'Encontro Ecumênico',
    back: language === 'en' ? 'Back to temples' : language === 'es' ? 'Volver a templos' : 'Voltar aos templos',
  };

  if (loading) {
    return (
      <main className="flex-1 container py-6 pb-20 md:pb-6 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 container py-6 pb-20 md:pb-6">
      <ReligionPicker open={showPicker} onSelected={handleReligionPicked} />

      <Tabs defaultValue="sacred" className="space-y-6">
        <TabsList className="w-full grid grid-cols-2 bg-secondary border border-primary/10">
          <TabsTrigger value="sacred" className="gap-1.5">
            <ScrollText className="h-4 w-4" />
            {labels.myPlace}
          </TabsTrigger>
          <TabsTrigger value="ecumenical" className="gap-1.5">
            <Globe className="h-4 w-4" />
            {labels.ecumenical}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sacred">
          {selectedTemple ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemple(null)}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                {labels.back}
              </Button>
              <SacredPlace
                selectedReligion={selectedTemple}
                userReligion={userReligion || ''}
              />
            </div>
          ) : (
            <TempleGallery
              userReligion={userReligion || ''}
              onSelect={setSelectedTemple}
            />
          )}
        </TabsContent>

        <TabsContent value="ecumenical">
          <EcumenicalWall />
        </TabsContent>
      </Tabs>
    </main>
  );
}
