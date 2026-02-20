import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, BookOpen, CheckSquare, Sparkles, ArrowRight, SlidersHorizontal, ShieldCheck } from 'lucide-react';

const traditions = [
  'christian', 'catholic', 'protestant', 'mormon', 'jewish', 'islam',
  'buddhist', 'hindu', 'spiritist', 'umbanda', 'candomble', 'agnostic',
];

const philosophies = [
  'stoicism', 'humanism', 'existentialism', 'epicureanism', 'logosophy',
  'pantheism', 'rationalism', 'absurdism', 'pragmatism',
  'shamanism', 'taoism', 'anthroposophy', 'cosmism', 'ubuntu',
];

const features = [
  { icon: MessageCircle, titleKey: 'landing.feat_chat_title', descKey: 'landing.feat_chat_desc', emoji: '🙏' },
  { icon: Heart, titleKey: 'landing.feat_prayer_title', descKey: 'landing.feat_prayer_desc', emoji: '✨' },
  { icon: BookOpen, titleKey: 'landing.feat_verse_title', descKey: 'landing.feat_verse_desc', emoji: '📖' },
  { icon: CheckSquare, titleKey: 'landing.feat_practice_title', descKey: 'landing.feat_practice_desc', emoji: '☀️' },
];

export default function Landing() {
  const { language } = useApp();

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="container relative py-16 md:py-28 flex flex-col items-center text-center gap-6 px-4">
          <div className="text-6xl md:text-8xl animate-fade-in">🕉️</div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary leading-tight max-w-3xl animate-fade-in">
            {t('landing.hero_title', language)}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-in">
            {t('landing.hero_subtitle', language)}
          </p>
          <p className="text-sm md:text-base text-foreground/70 max-w-xl animate-fade-in">
            {t('landing.hero_desc', language)}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 animate-fade-in">
            <Link to="/">
              <Button size="lg" className="gap-2 text-base px-8 shadow-lg hover:shadow-xl transition-shadow">
                <Sparkles className="h-5 w-5" />
                {t('landing.try_free', language)}
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                {t('landing.sign_in', language)}
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="secondary" size="lg" className="gap-2 text-base px-8">
                <ArrowRight className="h-5 w-5" />
                {t('landing.subscribe', language)}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tutorial Steps */}
      <section className="container py-16 px-4">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-center text-foreground mb-12">
          {t('landing.tutorial_title', language)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { step: 1, icon: SlidersHorizontal, titleKey: 'landing.step1_title', descKey: 'landing.step1_desc' },
            { step: 2, icon: MessageCircle, titleKey: 'landing.step2_title', descKey: 'landing.step2_desc' },
            { step: 3, icon: Heart, titleKey: 'landing.step3_title', descKey: 'landing.step3_desc' },
            { step: 4, icon: CheckSquare, titleKey: 'landing.step4_title', descKey: 'landing.step4_desc' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-md">
                {item.step}
              </div>
              <item.icon className="h-6 w-6 text-primary" />
              <h3 className="font-display text-base font-semibold text-foreground">
                {t(item.titleKey, language)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {t(item.descKey, language)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-16 px-4">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-center text-foreground mb-12">
          {t('landing.features_title', language)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feat) => (
            <Card key={feat.titleKey} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {feat.emoji}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {t(feat.titleKey, language)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(feat.descKey, language)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Privacy / Confidentiality */}
      <section className="container py-16 px-4">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            {t('landing.privacy_title', language)}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('landing.privacy_desc', language)}
          </p>
          <p className="text-sm text-primary/80 italic font-medium">
            {t('landing.privacy_note', language)}
          </p>
        </div>
      </section>

      {/* Traditions */}
      <section className="bg-card/50 border-y border-border">
        <div className="container py-16 px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
            {t('landing.traditions_title', language)}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm">
            {t('landing.traditions_subtitle', language)}
          </p>

          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mb-6">
            {traditions.map((r) => (
              <Badge key={r} variant="secondary" className="text-sm py-1.5 px-4">
                {t(`religion.${r}`, language)}
              </Badge>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
            {t('landing.philosophies_label', language)}
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {philosophies.map((p) => (
              <Badge key={p} variant="outline" className="text-sm py-1.5 px-4">
                {t(`philosophy.${p}`, language)}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-12 px-4 text-center">
        <p className="font-display text-lg text-primary/80 italic">
          "{t('landing.footer', language)}"
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Templo Sagrado © {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
