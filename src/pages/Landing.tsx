import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Heart, BookOpen, CheckSquare, Sparkles, ShieldCheck, Globe, ScrollText, Shield, Quote, Crown, Infinity } from 'lucide-react';
import temploLogo from '@/assets/templo-logo.png';

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
  { textKey: 'landing.testimonial3_text', authorKey: 'landing.testimonial3_author', traditionKey: 'landing.testimonial3_tradition', emoji: '🙏' },
  { textKey: 'landing.testimonial4_text', authorKey: 'landing.testimonial4_author', traditionKey: 'landing.testimonial4_tradition', emoji: '🏛️' },
];

export default function Landing() {
  const { language } = useApp();

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, hsl(38 80% 55% / 0.08) 0%, transparent 60%)' }} />
        <div className="container relative py-10 md:py-28 flex flex-col items-center text-center gap-4 md:gap-6 px-4">
          <img src={temploLogo} alt="Templo Sagrado" className="h-16 md:h-24 animate-fade-in" />
          <h1 className="sr-only">{t('landing.hero_title', language)}</h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-in">
            {t('landing.hero_subtitle', language)}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-4 animate-fade-in w-full sm:w-auto">
            <Link to="/" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 text-base px-10 sacred-gradient text-primary-foreground border-0 w-full sm:w-auto h-12">
                <Sparkles className="h-5 w-5" />
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Peace Stats Banner */}
      <section className="border-y border-border/40 bg-card/50">
        <div className="container py-8 px-4">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-4xl font-bold text-primary">5</span>
              <span className="text-[10px] md:text-sm text-muted-foreground font-medium">Tradições</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-4xl font-bold text-primary">∞</span>
              <span className="text-[10px] md:text-sm text-muted-foreground font-medium">Orações pela Paz</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl md:text-4xl font-bold text-primary">24/7</span>
              <span className="text-[10px] md:text-sm text-muted-foreground font-medium">Disponível</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Steps */}
      <section className="container py-14 px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-center text-foreground mb-10">
          {t('landing.tutorial_title', language)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { step: 1, icon: MessageCircle, title: 'Escolha sua tradição', desc: 'Católico, Evangélico, Espírita, Matriz Africana ou Filosofia.' },
            { step: 2, icon: MessageCircle, title: 'Converse com o Sacerdote', desc: 'Faça perguntas e receba orientação por texto ou voz.' },
            { step: 3, icon: Heart, title: 'Gere orações', desc: 'Crie orações personalizadas com referências sagradas.' },
            { step: 4, icon: CheckSquare, title: 'Pratique diariamente', desc: 'Checklist espiritual para nutrir sua jornada.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-14 px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-center text-foreground mb-10">
          {t('landing.features_title', language)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {features.map((feat) => (
            <Card key={feat.titleKey} className="border border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {feat.emoji}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{t(feat.titleKey, language)}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(feat.descKey, language)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mural Sagrado Highlight */}
      <section className="bg-card/50 border-y border-border/40">
        <div className="container py-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="text-4xl md:text-5xl">🕊️</div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {t('landing.mural_title', language)}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t('landing.mural_subtitle', language)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {muralFeatures.map((feat) => (
                <Card key={feat.titleKey} className="border border-border/50">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className="text-2xl">{feat.emoji}</div>
                    <h3 className="text-sm font-semibold text-foreground">{t(feat.titleKey, language)}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(feat.descKey, language)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Link to="/auth" className="inline-block mt-4">
              <Button size="lg" className="gap-2 text-base px-8 sacred-gradient text-primary-foreground border-0 h-12">
                <Globe className="h-5 w-5" />
                {t('landing.mural_cta', language)}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="container py-14 px-4">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            {t('landing.privacy_title', language)}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('landing.privacy_desc', language)}
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card/50 border-y border-border/40">
        <div className="container py-14 px-4">
          <h2 className="text-xl md:text-2xl font-semibold text-center text-foreground mb-8">
            {t('landing.testimonials_title', language)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {testimonials.map((item) => (
              <Card key={item.authorKey} className="border border-border/50">
                <CardContent className="p-5 flex flex-col gap-3">
                  <Quote className="h-5 w-5 text-primary/40" />
                  <p className="text-xs text-muted-foreground leading-relaxed italic flex-1">
                    "{t(item.textKey, language)}"
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{t(item.authorKey, language)}</p>
                      <p className="text-[10px] text-primary">{t(item.traditionKey, language)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA (simplified — no full pricing grid) */}
      <section className="container py-16 px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
          Comece gratuitamente. Evolua quando quiser.
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          10 perguntas grátis para começar. Planos a partir de R$19,90/mês para acesso ilimitado.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2 px-8 sacred-gradient text-primary-foreground border-0 h-12">
              <Sparkles className="h-5 w-5" />
              Começar Grátis
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" size="lg" className="gap-2 px-8 border-border hover:border-primary/30 h-12">
              Ver Planos
            </Button>
          </Link>
        </div>
      </section>

      {/* Peace Section */}
      <section className="bg-card/50 border-t border-border/40">
        <div className="container py-16 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              🕊️ {t('landing.peace_title', language)}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.peace_desc', language)}
            </p>
            <blockquote className="text-lg md:text-xl italic text-primary/80 font-medium pt-2">
              "{t('landing.peace_quote', language)}"
            </blockquote>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-10 px-4 text-center border-t border-border/40">
        <p className="text-sm text-primary/70 italic">
          "{t('landing.footer', language)}"
        </p>
        <p className="text-[10px] text-muted-foreground mt-3">
          Templo Sagrado © {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}