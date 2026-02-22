import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Check, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const { language } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const labels: Record<string, Record<string, string>> = {
    'pt-BR': {
      title: 'Instalar Templo Sagrado',
      subtitle: 'Tenha orientação espiritual sempre à mão',
      installed: 'App já instalado! ✨',
      installBtn: 'Instalar App',
      iosTitle: 'Como instalar no iPhone',
      iosStep1: '1. Toque no botão Compartilhar',
      iosStep2: '2. Role e toque em "Adicionar à Tela de Início"',
      iosStep3: '3. Toque em "Adicionar"',
      benefit1: 'Acesso rápido pela tela inicial',
      benefit2: 'Funciona offline',
      benefit3: 'Experiência como app nativo',
    },
    en: {
      title: 'Install Templo Sagrado',
      subtitle: 'Spiritual guidance always at hand',
      installed: 'App already installed! ✨',
      installBtn: 'Install App',
      iosTitle: 'How to install on iPhone',
      iosStep1: '1. Tap the Share button',
      iosStep2: '2. Scroll and tap "Add to Home Screen"',
      iosStep3: '3. Tap "Add"',
      benefit1: 'Quick access from home screen',
      benefit2: 'Works offline',
      benefit3: 'Native app experience',
    },
    es: {
      title: 'Instalar Templo Sagrado',
      subtitle: 'Orientación espiritual siempre a mano',
      installed: '¡App ya instalada! ✨',
      installBtn: 'Instalar App',
      iosTitle: 'Cómo instalar en iPhone',
      iosStep1: '1. Toca el botón Compartir',
      iosStep2: '2. Desplázate y toca "Agregar a pantalla de inicio"',
      iosStep3: '3. Toca "Agregar"',
      benefit1: 'Acceso rápido desde la pantalla',
      benefit2: 'Funciona sin conexión',
      benefit3: 'Experiencia de app nativa',
    },
  };

  const l = labels[language] || labels['pt-BR'];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg">
          <img src="/pwa-192x192.png" alt="Templo Sagrado" className="w-full h-full object-cover" />
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{l.title}</h1>
          <p className="text-muted-foreground mt-1">{l.subtitle}</p>
        </div>

        <div className="space-y-3 text-left">
          {[l.benefit1, l.benefit2, l.benefit3].map((b, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Check className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-foreground">{b}</span>
            </div>
          ))}
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-primary font-semibold">{l.installed}</p>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border border-border text-left">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Share className="h-4 w-4" /> {l.iosTitle}
            </h3>
            <p className="text-sm text-muted-foreground">{l.iosStep1}</p>
            <p className="text-sm text-muted-foreground">{l.iosStep2}</p>
            <p className="text-sm text-muted-foreground">{l.iosStep3}</p>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full sacred-gradient text-primary-foreground gap-2">
            <Download className="h-5 w-5" />
            {l.installBtn}
          </Button>
        ) : (
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <Smartphone className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {isIOS ? l.iosStep1 : l.subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
