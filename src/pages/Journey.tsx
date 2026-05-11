import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  History,
  MessageCircle,
  BookOpen,
  Heart,
  CheckSquare,
  Brain,
  FileText,
  Trash2,
  Copy,
  Download,
  ShieldCheck,
  Loader2,
  ChevronRight,
} from 'lucide-react';
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

const J_LABELS = {
  'pt-BR': {
    all: 'Todos', summary: 'Resumos', chat: 'Conversas', verse: 'Versículos', prayer: 'Orações', practice: 'Práticas',
    today: 'hoje', yesterday: 'ontem',
    daysAgo: (n: number) => `há ${n} dias`,
    weeksAgo: (n: number) => `há ${n} semana${n > 1 ? 's' : ''}`,
    monthsAgo: (n: number) => `há ${n} ${n === 1 ? 'mês' : 'meses'}`,
    locale: 'pt-BR',
    intro: 'Cada conversa, oração e versículo que você guardou compõe seu livro pessoal de caminhada espiritual.',
    emptyDesc: 'Cada conversa, oração e versículo aparece neste livro pessoal.',
    talkMentor: 'Conversar com o mentor',
    privacyNote: 'Apenas você vê esta página. Nem mesmo nossa equipe tem acesso.',
    copy: 'Copiar', deletev: 'Apagar', copied: 'Copiado!', removed: 'Removido da sua jornada',
    pageOf: (p: number, total: number) => `Templo Sagrado · templosagrado.lovable.app · página ${p} de ${total}`,
  },
  en: {
    all: 'All', summary: 'Summaries', chat: 'Conversations', verse: 'Verses', prayer: 'Prayers', practice: 'Practices',
    today: 'today', yesterday: 'yesterday',
    daysAgo: (n: number) => `${n} days ago`,
    weeksAgo: (n: number) => `${n} week${n > 1 ? 's' : ''} ago`,
    monthsAgo: (n: number) => `${n} month${n > 1 ? 's' : ''} ago`,
    locale: 'en-US',
    intro: 'Every conversation, prayer and verse you saved makes up your personal book of spiritual journey.',
    emptyDesc: 'Every conversation, prayer and verse appears in this personal book.',
    talkMentor: 'Chat with the mentor',
    privacyNote: 'Only you see this page. Not even our team has access.',
    copy: 'Copy', deletev: 'Delete', copied: 'Copied!', removed: 'Removed from your journey',
    pageOf: (p: number, total: number) => `Sacred Temple · templosagrado.lovable.app · page ${p} of ${total}`,
  },
  es: {
    all: 'Todos', summary: 'Resúmenes', chat: 'Conversaciones', verse: 'Versículos', prayer: 'Oraciones', practice: 'Prácticas',
    today: 'hoy', yesterday: 'ayer',
    daysAgo: (n: number) => `hace ${n} días`,
    weeksAgo: (n: number) => `hace ${n} semana${n > 1 ? 's' : ''}`,
    monthsAgo: (n: number) => `hace ${n} ${n === 1 ? 'mes' : 'meses'}`,
    locale: 'es-ES',
    intro: 'Cada conversación, oración y versículo que guardaste compone tu libro personal de camino espiritual.',
    emptyDesc: 'Cada conversación, oración y versículo aparece en este libro personal.',
    talkMentor: 'Hablar con el mentor',
    privacyNote: 'Solo tú ves esta página. Ni siquiera nuestro equipo tiene acceso.',
    copy: 'Copiar', deletev: 'Borrar', copied: '¡Copiado!', removed: 'Eliminado de tu jornada',
    pageOf: (p: number, total: number) => `Templo Sagrado · templosagrado.lovable.app · página ${p} de ${total}`,
  },
};

const TYPE_FILTERS = [
  { id: 'all', icon: History },
  { id: 'summary', icon: FileText },
  { id: 'chat', icon: MessageCircle },
  { id: 'verse', icon: BookOpen },
  { id: 'prayer', icon: Heart },
  { id: 'practice', icon: CheckSquare },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'summary': return <FileText className="h-4 w-4" />;
    case 'chat': return <MessageCircle className="h-4 w-4" />;
    case 'verse': return <BookOpen className="h-4 w-4" />;
    case 'prayer': return <Heart className="h-4 w-4" />;
    case 'practice': return <CheckSquare className="h-4 w-4" />;
    default: return <History className="h-4 w-4" />;
  }
}

function relativeDate(iso: string, L: typeof J_LABELS['pt-BR']): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return L.today;
  if (diffDays === 1) return L.yesterday;
  if (diffDays < 7) return L.daysAgo(diffDays);
  if (diffDays < 30) return L.weeksAgo(Math.floor(diffDays / 7));
  if (diffDays < 365) return L.monthsAgo(Math.floor(diffDays / 30));
  return d.toLocaleDateString(L.locale);
}

function monthLabel(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export default function Journey() {
  const { language, user } = useApp();
  const L = J_LABELS[language] || J_LABELS['pt-BR'];
  const { toast } = useToast();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ActivityItem | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('activity_history')
      .select('id, type, title, content, metadata, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);
    setItems((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const deleteItem = async (id: string) => {
    await supabase.from('activity_history').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    setSelected(null);
    toast({ title: L.removed });
  };

  const copyContent = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({ title: L.copied });
  };

  const downloadPdf = async (item: ActivityItem) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    renderJourneyPdf(doc, item);
    const dateStr = new Date(item.created_at).toISOString().split('T')[0];
    doc.save(`templo-sagrado-${dateStr}.pdf`);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  // Group by month
  const groups: Record<string, ActivityItem[]> = {};
  filtered.forEach(i => {
    const k = monthLabel(i.created_at, L.locale);
    if (!groups[k]) groups[k] = [];
    groups[k].push(i);
  });
  const groupKeys = Object.keys(groups);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
            {t('journey.title', language)}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            {L.intro}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-5 flex-wrap justify-center">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
              )}
            >
              <f.icon className="h-3.5 w-3.5" />
              {(L as any)[f.id]}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-base font-medium mb-2">{t('journey.empty', language)}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Cada conversa, oração e versículo aparece neste livro pessoal.
            </p>
            <Link to="/">
              <Button className="gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Conversar com o mentor
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupKeys.map(key => (
              <div key={key}>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
                  {key}
                </h3>
                <div className="space-y-2">
                  {groups[key].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className="w-full text-left bg-card border border-border rounded-lg p-3.5 hover:border-primary/40 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="text-sm font-medium truncate text-foreground">{item.title}</p>
                            <span className="text-[11px] text-muted-foreground shrink-0">{relativeDate(item.created_at, L)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Privacy footer */}
        <div className="mt-10 pt-6 border-t border-border/50 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary/70" />
            {L.privacyNote}
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <span className="text-primary">{getTypeIcon(selected.type)}</span>
                  {selected.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(selected.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </DialogHeader>
              <ScrollArea className="max-h-[50vh]">
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 pr-2">
                  {selected.content}
                </div>
              </ScrollArea>
              <div className="flex gap-2 pt-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => copyContent(selected.content)} className="gap-1.5 flex-1">
                  <Copy className="h-3.5 w-3.5" /> Copiar
                </Button>
                {selected.type === 'summary' && (
                  <Button variant="outline" size="sm" onClick={() => downloadPdf(selected)} className="gap-1.5 flex-1">
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteItem(selected.id)} className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" /> Apagar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// PDF rendering helper (also exported for ChatArea reuse if needed)
export function renderJourneyPdf(doc: any, item: { title: string; content: string; created_at: string; metadata?: any }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 25;
  const contentWidth = pageWidth - marginX * 2;
  let y = 25;

  // App title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(184, 134, 11); // amber
  doc.text('TEMPLO SAGRADO', marginX, y);
  y += 6;

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  const dateStr = new Date(item.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.text(dateStr, marginX, y);
  y += 4;

  // Divider
  doc.setDrawColor(220);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // Item title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(20);
  const titleLines = doc.splitTextToSize(item.title, contentWidth);
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 7 + 4;

  // Body — clean text
  const cleanContent = (item.content || '')
    .replace(/\[SUGGESTIONS\][\s\S]*?\[\/SUGGESTIONS\]/g, '')
    .replace(/[*#`_~]/g, '')
    .trim();

  const paragraphs = cleanContent.split(/\n\s*\n/);
  doc.setTextColor(40);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Detect ALL CAPS heading (line is uppercase, short, no period)
    const isHeading =
      trimmed.length < 60 &&
      !trimmed.includes('\n') &&
      /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]+$/.test(trimmed) &&
      !trimmed.endsWith('.');

    if (isHeading) {
      if (y > pageHeight - 30) { doc.addPage(); y = 25; }
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(184, 134, 11);
      doc.text(trimmed, marginX, y);
      y += 7;
      doc.setTextColor(40);
    } else {
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(trimmed, contentWidth);
      for (const line of lines) {
        if (y > pageHeight - 25) { doc.addPage(); y = 25; }
        doc.text(line, marginX, y);
        y += 6;
      }
      y += 4;
    }
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(
      `Templo Sagrado · templosagrado.lovable.app · página ${p} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
}
