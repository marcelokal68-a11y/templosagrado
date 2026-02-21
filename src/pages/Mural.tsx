import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SacredPlace from '@/components/mural/SacredPlace';
import EcumenicalWall from '@/components/mural/EcumenicalWall';
import { ScrollText, Globe } from 'lucide-react';

export default function Mural() {
  const { language, chatContext } = useApp();
  const religion = chatContext.religion;
  const philosophy = chatContext.philosophy;

  const labels = {
    myPlace: language === 'en' ? 'My Sacred Place' : language === 'es' ? 'Mi Lugar Sagrado' : 'Meu Local Sagrado',
    ecumenical: language === 'en' ? 'Ecumenical Meeting' : language === 'es' ? 'Encuentro Ecuménico' : 'Encontro Ecumênico',
  };

  return (
    <main className="flex-1 container py-6 pb-20 md:pb-6">
      <Tabs defaultValue="sacred" className="space-y-6">
        <TabsList className="w-full grid grid-cols-2">
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
          <SacredPlace religion={religion} philosophy={philosophy} />
        </TabsContent>

        <TabsContent value="ecumenical">
          <EcumenicalWall />
        </TabsContent>
      </Tabs>
    </main>
  );
}
