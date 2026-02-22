import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Trash2, X, Feather, Copy, Check, Loader2, MessageCircle, BookOpen, Heart, CheckSquare, Brain, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata: any;
  created_at: string;
};

type GeneratedPost = { network: string; content: string };

const NETWORKS = [
  { id: 'x', label: 'X (Twitter)', icon: '𝕏' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
];

const TYPE_FILTERS = [
  { id: 'all', label: 'Todos', icon: History },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'verse', label: 'Versículos', icon: BookOpen },
  { id: 'prayer', label: 'Orações', icon: Heart },
  { id: 'practice', label: 'Prática', icon: CheckSquare },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'chat': return <MessageCircle className="h-3.5 w-3.5" />;
    case 'verse': return <BookOpen className="h-3.5 w-3.5" />;
    case 'prayer': return <Heart className="h-3.5 w-3.5" />;
    case 'practice': return <CheckSquare className="h-3.5 w-3.5" />;
    default: return <History className="h-3.5 w-3.5" />;
  }
}

export default function ActivityHistory() {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Post generation state
  const [postItemIndex, setPostItemIndex] = useState<number | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Analysis state
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisItems, setAnalysisItems] = useState<Record<string, boolean>>({});
  const [analysisResult, setAnalysisResult] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisCopied, setAnalysisCopied] = useState(false);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('activity_history' as any)
      .select('id, type, title, content, metadata, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    setItems((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadHistory();
      setPostItemIndex(null);
      setPosts([]);
    }
  }, [open]);

  const deleteItem = async (item: ActivityItem) => {
    await (supabase.from('activity_history' as any) as any).delete().eq('id', item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  const deleteAll = async () => {
    if (!user) return;
    await (supabase.from('activity_history' as any) as any).delete().eq('user_id', user.id);
    setItems([]);
    toast({ title: t('history.deleted', language) || 'Histórico apagado' });
  };

  const toggleNetwork = (id: string) => {
    setSelectedNetworks(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const generatePosts = async (text: string) => {
    if (selectedNetworks.length === 0) return;
    setGenerating(true);
    setPosts([]);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, networks: selectedNetworks }),
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

  // Analysis
  const openAnalysis = () => {
    const selected: Record<string, boolean> = {};
    items.forEach(item => { selected[item.id] = true; });
    setAnalysisItems(selected);
    setAnalysisResult('');
    setAnalysisOpen(true);
  };

  const runAnalysis = async () => {
    const selectedItems = items.filter(item => analysisItems[item.id]);
    if (selectedItems.length === 0) return;
    setAnalyzing(true);
    setAnalysisResult('');
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          items: selectedItems.map(i => ({ type: i.type, title: i.title, content: i.content, created_at: i.created_at })),
          language,
        }),
      });
      if (resp.status === 429) {
        toast({ title: t('chat.rate_limit', language), variant: 'destructive' });
        return;
      }
      if (resp.status === 402) {
        toast({ title: t('chat.credits_out', language), variant: 'destructive' });
        return;
      }
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setAnalysisResult(data.analysis || '');
    } catch {
      toast({ title: t('chat.error', language), variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const copyAnalysis = async () => {
    await navigator.clipboard.writeText(analysisResult);
    setAnalysisCopied(true);
    setTimeout(() => setAnalysisCopied(false), 2000);
  };

  if (!user) return null;

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
            <History className="h-4 w-4" />
            {t('history.title', language) || 'Histórico'}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>{t('history.title', language) || 'Histórico'}</span>
              {items.length > 0 && (
                <Button variant="destructive" size="sm" onClick={deleteAll} className="gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('history.delete_all', language) || 'Apagar tudo'}
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Analysis button */}
          {items.length > 0 && (
            <Button
              onClick={openAnalysis}
              className="w-full mt-3 gap-2 sacred-gradient text-primary-foreground border-0 font-display"
            >
              <Brain className="h-4 w-4" />
              {t('history.analyze', language) || 'Analisando sua História no Templo Sagrado'}
            </Button>
          )}

          {/* Filter tabs */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                  filter === f.id
                    ? "sacred-gradient text-primary-foreground border-primary/50"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/30"
                )}
              >
                <f.icon className="h-3 w-3" />
                {f.label}
              </button>
            ))}
          </div>

          <ScrollArea className="h-[calc(100vh-14rem)] mt-3">
            {loading && <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>}
            {!loading && filteredItems.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                {t('history.empty', language) || 'Nenhuma atividade registrada.'}
              </p>
            )}
            <div className="space-y-3 pr-2">
              {filteredItems.map((item, idx) => (
                <div key={item.id} className="group relative bg-card border border-border rounded-lg p-3 space-y-2">
                  <button
                    onClick={() => deleteItem(item)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{getTypeIcon(item.type)}</span>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{item.content}</p>

                  {/* Create Post button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => {
                      setPostItemIndex(postItemIndex === idx ? null : idx);
                      setSelectedNetworks([]);
                      setPosts([]);
                    }}
                  >
                    <Feather className="h-3.5 w-3.5" />
                    {t('posts.title', language) || 'Criar Post'}
                  </Button>

                  {/* Inline post generator */}
                  {postItemIndex === idx && (
                    <div className="space-y-2 pt-2 border-t border-border animate-fade-in">
                      <p className="text-xs font-medium text-muted-foreground">{t('posts.networks', language) || '2. Escolha as redes'}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {NETWORKS.map(net => (
                          <label
                            key={net.id}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all text-xs",
                              selectedNetworks.includes(net.id)
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background hover:border-primary/30"
                            )}
                          >
                            <Checkbox
                              checked={selectedNetworks.includes(net.id)}
                              onCheckedChange={() => toggleNetwork(net.id)}
                            />
                            <span>{net.icon} {net.label}</span>
                          </label>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => generatePosts(item.content)}
                        disabled={generating || selectedNetworks.length === 0}
                        className="w-full gap-1.5"
                      >
                        {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Feather className="h-3.5 w-3.5" />}
                        {t('posts.generate', language) || 'Gerar Posts'}
                      </Button>

                      {posts.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {posts.map((post, i) => {
                            const net = NETWORKS.find(n => n.id === post.network);
                            return (
                              <div key={i} className="bg-background border border-border rounded-lg p-2.5 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{net?.icon} {net?.label}</span>
                                  <Button variant="ghost" size="sm" onClick={() => copyPost(post.content, i)} className="h-6 gap-1 text-xs">
                                    {copiedIndex === i ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                                    {copiedIndex === i ? (t('posts.copied', language) || 'Copiado!') : (t('posts.copy', language) || 'Copiar')}
                                  </Button>
                                </div>
                                <p className="text-xs whitespace-pre-wrap leading-relaxed">{post.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
              <Brain className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">{t('history.analyze', language) || 'Analisando sua História no Templo Sagrado'}</span>
            </DialogTitle>
          </DialogHeader>

          {!analysisResult ? (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('history.analyze_desc', language) || 'Selecione os itens que deseja incluir na análise. O sacerdote-psicólogo analisará sua jornada espiritual.'}
              </p>
              <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                {items.map(item => (
                  <label key={item.id} className="flex items-start gap-2 p-2 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-all">
                    <Checkbox
                      checked={!!analysisItems[item.id]}
                      onCheckedChange={(v) => setAnalysisItems(prev => ({ ...prev, [item.id]: !!v }))}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-primary">{getTypeIcon(item.type)}</span>
                        <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium truncate">{item.title}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button
                onClick={runAnalysis}
                disabled={analyzing || Object.values(analysisItems).filter(Boolean).length === 0}
                className="w-full gap-2 sacred-gradient text-primary-foreground border-0"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {analyzing
                  ? (t('history.analyzing', language) || 'Analisando...')
                  : (t('history.start_analysis', language) || 'Iniciar Análise')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="glass sacred-border rounded-lg p-3 sm:p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{analysisResult}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAnalysis} className="gap-1.5 text-xs">
                  {analysisCopied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  {analysisCopied ? (t('posts.copied', language) || 'Copiado!') : (t('posts.copy', language) || 'Copiar')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setAnalysisResult(''); }} className="gap-1.5 text-xs">
                  <Brain className="h-3.5 w-3.5" />
                  {t('history.new_analysis', language) || 'Nova Análise'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
