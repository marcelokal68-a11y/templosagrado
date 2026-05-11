import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { History, Trash2, Feather, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { edgeFunctionUrl, PUBLISHABLE_KEY } from '@/lib/authHeader';

type HistoryMsg = { id: string; role: string; content: string; created_at: string };
type Conversation = { userMsg: HistoryMsg; assistantMsg: HistoryMsg };
type GeneratedPost = { network: string; content: string };

const NETWORKS = [
  { id: 'x', label: 'X (Twitter)', icon: '𝕏' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
];

function groupConversations(messages: HistoryMsg[]): Conversation[] {
  const sorted = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const convos: Conversation[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].role === 'user' && sorted[i + 1].role === 'assistant') {
      convos.push({ userMsg: sorted[i], assistantMsg: sorted[i + 1] });
      i++;
    }
  }
  return convos.reverse(); // newest first
}

export default function ChatHistory() {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<HistoryMsg[]>([]);
  const [loading, setLoading] = useState(false);

  // Confirmation dialogs
  const [convoToDelete, setConvoToDelete] = useState<Conversation | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Post generation state
  const [postConvoIndex, setPostConvoIndex] = useState<number | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(40); // 20 conversations (pairs)
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadHistory();
      setPostConvoIndex(null);
      setPosts([]);
    }
  }, [open]);

  const deleteConvo = async (convo: Conversation) => {
    await supabase.from('chat_messages').delete().in('id', [convo.userMsg.id, convo.assistantMsg.id]);
    setMessages(prev => prev.filter(m => m.id !== convo.userMsg.id && m.id !== convo.assistantMsg.id));
    setConvoToDelete(null);
    toast({ title: t('history.deleted_one', language) || 'Conversa apagada' });
  };

  const deleteAll = async () => {
    if (!user) return;
    await supabase.from('chat_messages').delete().eq('user_id', user.id);
    setMessages([]);
    setConfirmDeleteAll(false);
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
      const resp = await fetch(edgeFunctionUrl('generate-post'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PUBLISHABLE_KEY}`,
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

  if (!user) return null;

  const conversations = groupConversations(messages);

  return (
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
            {conversations.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteAll(true)} className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                {t('history.delete_all', language) || 'Apagar tudo'}
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {loading && <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>}
          {!loading && conversations.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">
              {t('history.empty', language) || 'Nenhuma mensagem salva.'}
            </p>
          )}
          <div className="space-y-3 pr-2">
            {conversations.map((convo, idx) => (
              <div key={convo.userMsg.id} className="relative bg-card border border-border rounded-lg p-3 pr-10 space-y-2">
                <button
                  onClick={() => setConvoToDelete(convo)}
                  title={t('history.delete_one', language) || 'Apagar esta conversa'}
                  aria-label={t('history.delete_one', language) || 'Apagar esta conversa'}
                  className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <p className="text-[10px] font-medium text-muted-foreground">
                  {new Date(convo.userMsg.created_at).toLocaleDateString()}
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">👤 {convo.userMsg.content.length > 80 ? convo.userMsg.content.slice(0, 80) + '...' : convo.userMsg.content}</p>
                  <p className="text-sm leading-relaxed line-clamp-3">🕊️ {convo.assistantMsg.content}</p>
                </div>

                {/* Create Post button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => {
                    setPostConvoIndex(postConvoIndex === idx ? null : idx);
                    setSelectedNetworks([]);
                    setPosts([]);
                  }}
                >
                  <Feather className="h-3.5 w-3.5" />
                  {t('posts.title', language) || 'Criar Post'}
                </Button>

                {/* Inline post generator */}
                {postConvoIndex === idx && (
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
                      onClick={() => generatePosts(convo.assistantMsg.content)}
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

      {/* Delete one confirmation */}
      <AlertDialog open={!!convoToDelete} onOpenChange={(o) => !o && setConvoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('history.delete_one_title', language) || 'Apagar esta conversa?'}</AlertDialogTitle>
            <AlertDialogDescription>{t('history.delete_one_desc', language) || 'Esta troca será removida permanentemente do seu histórico.'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('panel.keep', language) || 'Manter'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => convoToDelete && deleteConvo(convoToDelete)}
            >
              {t('history.delete_one', language) || 'Apagar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete all confirmation */}
      <AlertDialog open={confirmDeleteAll} onOpenChange={setConfirmDeleteAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('chat.clear_all_title', language) || 'Apagar todo o histórico?'}</AlertDialogTitle>
            <AlertDialogDescription>{t('chat.clear_all_desc', language)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('panel.keep', language) || 'Manter'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteAll}
            >
              {t('history.delete_all', language) || 'Apagar tudo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
