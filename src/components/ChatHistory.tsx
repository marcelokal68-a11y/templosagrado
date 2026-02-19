import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HistoryMsg = { id: string; role: string; content: string; created_at: string };

export default function ChatHistory() {
  const { language, user } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<HistoryMsg[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadHistory();
  }, [open]);

  const deleteOne = async (id: string) => {
    await supabase.from('chat_messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const deleteAll = async () => {
    if (!user) return;
    await supabase.from('chat_messages').delete().eq('user_id', user.id);
    setMessages([]);
    toast({ title: t('history.deleted', language) || 'Histórico apagado' });
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
          <History className="h-4 w-4" />
          {t('history.title', language) || 'Histórico'}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{t('history.title', language) || 'Histórico'}</span>
            {messages.length > 0 && (
              <Button variant="destructive" size="sm" onClick={deleteAll} className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                {t('history.delete_all', language) || 'Apagar tudo'}
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {loading && <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>}
          {!loading && messages.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">
              {t('history.empty', language) || 'Nenhuma mensagem salva.'}
            </p>
          )}
          <div className="space-y-3 pr-2">
            {messages.map(msg => (
              <div key={msg.id} className="group relative bg-card border border-border rounded-lg p-3">
                <button
                  onClick={() => deleteOne(msg.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="text-[10px] font-medium text-muted-foreground mb-1">
                  {msg.role === 'user' ? '👤 Você' : '🕊️ Sacerdote'} · {new Date(msg.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm leading-relaxed line-clamp-4">{msg.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
