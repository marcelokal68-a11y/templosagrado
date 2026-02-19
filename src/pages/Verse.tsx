import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Verse() {
  const { language, chatContext } = useApp();
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchVerse = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verse-of-day', {
        body: { religion: chatContext.religion || 'christian', language },
      });
      if (error) throw error;
      setVerse(data?.verse || 'No verse available');
    } catch (err) {
      console.error(err);
      setVerse('Could not fetch verse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVerse(); }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="font-display text-2xl">{t('verse.title', language)}</CardTitle>
          <CardDescription>{t('verse.subtitle', language)}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {loading ? (
            <div className="py-8 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('verse.loading', language)}</p>
            </div>
          ) : (
            <blockquote className="text-lg font-body italic leading-relaxed border-l-4 border-primary pl-4 text-left">
              {verse}
            </blockquote>
          )}
          <Button variant="outline" onClick={fetchVerse} disabled={loading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('verse.refresh', language)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
