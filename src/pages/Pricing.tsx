import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

export default function Pricing() {
  const { language } = useApp();

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <h1 className="font-display text-3xl font-bold text-center mb-8">{t('pricing.title', language)}</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="font-display text-xl">{t('pricing.free', language)}</CardTitle>
              <CardDescription>{t('pricing.free_desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold font-display">R$0</p>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {t('pricing.free_questions', language)}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>{t('pricing.current', language)}</Button>
            </CardFooter>
          </Card>

          {/* Monthly */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="h-3 w-3" /> Popular
            </div>
            <CardHeader>
              <CardTitle className="font-display text-xl">{t('pricing.monthly', language)}</CardTitle>
              <CardDescription>{t('pricing.monthly_desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold font-display">{t('pricing.price', language)}</p>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {t('pricing.monthly_questions', language)}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full">{t('pricing.subscribe', language)}</Button>
              <p className="text-xs text-muted-foreground text-center">{t('pricing.pix_note', language)}</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
