import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Loader2, Feather } from 'lucide-react';
import PublishToMural from '@/components/mural/PublishToMural';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type AssistantMsg = { id: string; content: string; created_at: string };
type GeneratedPost = { network: string; content: string };

const NETWORKS = [
  { id: 'x', label: 'X (Twitter)', icon: '𝕏' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
];

export default function Posts() {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [messages, setMessages] = useState<AssistantMsg[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('chat_messages')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .eq('role', 'assistant')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
  }, [user]);

  const toggleNetwork = (id: string) => {
    setSelectedNetworks(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const generate = async () => {
    const msg = messages.find(m => m.id === selectedMsg);
    if (!msg || selectedNetworks.length === 0) return;
    setGenerating(true);
    setPosts([]);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: msg.content, networks: selectedNetworks }),
      });
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setPosts(data.posts || []);
    } catch {
      toast({ title: t('chat.error', language), variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const copyPost = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 pb-20">
        <div className="text-center space-y-3">
          <Feather className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">{t('posts.login_required', language) || 'Faça login para criar posts.'}</p>
          <Link to="/auth"><Button>{t('auth.login', language)}</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-20 max-w-2xl mx-auto w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display text-xl font-bold">{t('posts.title', language) || 'Criar Post'}</h1>
        <p className="text-sm text-muted-foreground">{t('posts.subtitle', language) || 'Transforme respostas do chat em posts para redes sociais'}</p>
      </div>

      {/* Step 1: Select message */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">{t('posts.select', language) || '1. Selecione uma resposta'}</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t('posts.no_messages', language) || 'Nenhuma conversa encontrada. Converse primeiro no chat!'}</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => setSelectedMsg(msg.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                  selectedMsg === msg.id
                    ? "border-primary/40 bg-primary/10 sacred-glow"
                    : "border-primary/10 glass hover:border-primary/30"
                )}
              >
                <p className="line-clamp-2">{msg.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Step 2: Select networks */}
      {selectedMsg && (
        <section className="space-y-2 animate-fade-in">
          <h2 className="text-sm font-semibold text-muted-foreground">{t('posts.networks', language) || '2. Escolha as redes'}</h2>
          <div className="grid grid-cols-2 gap-2">
            {NETWORKS.map(net => (
              <label
                key={net.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all",
                  selectedNetworks.includes(net.id)
                    ? "border-primary/40 bg-primary/10 sacred-glow"
                    : "border-primary/10 glass hover:border-primary/30"
                )}
              >
                <Checkbox
                  checked={selectedNetworks.includes(net.id)}
                  onCheckedChange={() => toggleNetwork(net.id)}
                />
                <span className="text-sm">{net.icon} {net.label}</span>
              </label>
            ))}
          </div>
          <Button
            onClick={generate}
            disabled={generating || selectedNetworks.length === 0}
            className="w-full mt-2"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Feather className="h-4 w-4 mr-2" />}
            {t('posts.generate', language) || 'Gerar Posts'}
          </Button>
        </section>
      )}

      {/* Step 3: Results */}
      {posts.length > 0 && (
        <section className="space-y-3 animate-fade-in">
          <h2 className="text-sm font-semibold text-muted-foreground">{t('posts.results', language) || '3. Posts gerados'}</h2>
          {posts.map((post, i) => {
            const net = NETWORKS.find(n => n.id === post.network);
            return (
              <div key={i} className="glass sacred-border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{net?.icon} {net?.label}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyPost(post.content, i)} className="gap-1.5">
                    {copiedIndex === i ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedIndex === i ? (t('posts.copied', language) || 'Copiado!') : (t('posts.copy', language) || 'Copiar')}
                  </Button>
                  <PublishToMural originalContent={post.content} />
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
