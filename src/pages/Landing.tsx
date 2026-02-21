import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, BookOpen, CheckSquare, Sparkles, ArrowRight, SlidersHorizontal, ShieldCheck, Globe, ScrollText, Shield, Quote } from 'lucide-react';

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

const muralFeatures = [
  { icon: ScrollText, titleKey: 'landing.mural_feat1', descKey: 'landing.mural_feat1_desc', emoji: '🕍' },
  { icon: Globe, titleKey: 'landing.mural_feat2', descKey: 'landing.mural_feat2_desc', emoji: '🌍' },
  { icon: Shield, titleKey: 'landing.mural_feat3', descKey: 'landing.mural_feat3_desc', emoji: '🛡️' },
];

const testimonials = [
  { textKey: 'landing.testimonial1_text', authorKey: 'landing.testimonial1_author', traditionKey: 'landing.testimonial1_tradition', emoji: '✝️' },
  { textKey: 'landing.testimonial2_text', authorKey: 'landing.testimonial2_author', traditionKey: 'landing.testimonial2_tradition', emoji: '☸️' },
  { textKey: 'landing.testimonial3_text', authorKey: 'landing.testimonial3_author', traditionKey: 'landing.testimonial3_tradition', emoji: '☪️' },
  { textKey: 'landing.testimonial4_text', authorKey: 'landing.testimonial4_author', traditionKey: 'landing.testimonial4_tradition', emoji: '🏛️' },
];

export default function Landing() {
  const { language } = useApp();

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="relative overflow-hidden cosmic-bg-deep">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, hsl(38 80% 55% / 0.12) 0%, transparent 60%)' }} />
        <div className="container relative py-10 md:py-28 flex flex-col items-center text-center gap-4 md:gap-6 px-4">
          <div className="text-5xl md:text-8xl animate-fade-in">🕉️</div>
          <h1 className="font-display text-3xl md:text-6xl font-bold leading-tight max-w-3xl animate-fade-in shimmer-text">
            {t('landing.hero_title', language)}
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-in">
            {t('landing.hero_subtitle', language)}
          </p>
          <p className="text-sm text-foreground/60 max-w-xl animate-fade-in">
            {t('landing.hero_desc', language)}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-4 animate-fade-in w-full sm:w-auto">
            <Link to="/" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 text-base px-8 sacred-gradient text-primary-foreground border-0 sacred-glow hover:sacred-glow-strong transition-shadow w-full sm:w-auto">
                <Sparkles className="h-5 w-5" />
                {t('landing.try_free', language)}
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 border-primary/30 hover:border-primary/60 hover:bg-primary/10 w-full sm:w-auto">
                {t('landing.sign_in', language)}
              </Button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="gap-2 text-base px-8 w-full sm:w-auto">
                <ArrowRight className="h-5 w-5" />
                {t('landing.subscribe', language)}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Peace Stats Banner */}
      <section className="sacred-gradient-subtle border-y border-primary/10">
        <div className="container py-10 px-4">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            {(['peace_stat1', 'peace_stat2', 'peace_stat3'] as const).map((key) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <span className="text-2xl md:text-5xl font-display font-bold text-gradient-sacred">
                  {t(`landing.${key}`, language)}
                </span>
                <span className="text-[10px] md:text-sm text-muted-foreground font-medium leading-tight text-center">
                  {t(`landing.${key}_label`, language)}
                </span>
              </div>
            ))}
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
              <div className="w-12 h-12 rounded-full sacred-gradient text-primary-foreground flex items-center justify-center text-lg font-bold shadow-md sacred-glow">
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
            <Card key={feat.titleKey} className="group glass sacred-border hover:sacred-glow transition-all duration-300">
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

      {/* ✨ Mural Sagrado Highlight */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cosmic-bg pointer-events-none" />
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, hsl(38 80% 55% / 0.15) 0%, transparent 50%)' }} />
        <div className="container relative py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="text-5xl md:text-6xl animate-fade-in">🕊️</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight shimmer-text">
              {t('landing.mural_title', language)}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('landing.mural_subtitle', language)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
              {muralFeatures.map((feat) => (
                <Card key={feat.titleKey} className="glass sacred-border group hover:sacred-glow transition-all duration-300">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform">{feat.emoji}</div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {t(feat.titleKey, language)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(feat.descKey, language)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Link to="/auth" className="inline-block mt-6">
              <Button size="lg" className="gap-2 text-base px-10 sacred-gradient text-primary-foreground border-0 sacred-glow hover:sacred-glow-strong transition-shadow">
                <Globe className="h-5 w-5" />
                {t('landing.mural_cta', language)}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy / Confidentiality */}
      <section className="container py-16 px-4">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center sacred-glow">
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

      {/* Testimonials */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cosmic-bg pointer-events-none" />
        <div className="container relative py-16 px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
              {t('landing.testimonials_title', language)}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('landing.testimonials_subtitle', language)}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {testimonials.map((item) => (
              <Card key={item.authorKey} className="group glass sacred-border hover:sacred-glow transition-all duration-300 relative">
                <CardContent className="p-6 flex flex-col gap-4">
                  <Quote className="h-6 w-6 text-primary/40" />
                  <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                    "{t(item.textKey, language)}"
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-primary/10">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t(item.authorKey, language)}</p>
                      <p className="text-xs text-primary font-medium">{t(item.traditionKey, language)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Traditions */}
      <section className="border-y border-primary/10">
        <div className="container py-16 px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
            {t('landing.traditions_title', language)}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm">
            {t('landing.traditions_subtitle', language)}
          </p>

          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mb-6">
            {traditions.map((r) => (
              <Badge key={r} variant="secondary" className="text-sm py-1.5 px-4 border-primary/10">
                {t(`religion.${r}`, language)}
              </Badge>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
            {t('landing.philosophies_label', language)}
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {philosophies.map((p) => (
              <Badge key={p} variant="outline" className="text-sm py-1.5 px-4 border-primary/20 text-foreground/70">
                {t(`philosophy.${p}`, language)}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Peace Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cosmic-bg pointer-events-none" />
        <div className="container relative py-20 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              🕊️ {t('landing.peace_title', language)}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              {t('landing.peace_desc', language)}
            </p>
            <blockquote className="font-display text-xl md:text-2xl italic text-primary/90 font-semibold pt-4">
              "{t('landing.peace_quote', language)}"
            </blockquote>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-12 px-4 text-center border-t border-primary/10">
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
