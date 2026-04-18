import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Plus, Upload, FileText, Trash2, RefreshCw, BookOpen, ArrowLeft, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';

interface KnowledgeSource {
  id: string;
  title: string;
  author: string | null;
  source_type: string;
  religion: string | null;
  language: string;
  file_path: string | null;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  error_message: string | null;
  chunk_count: number;
  created_at: string;
}

const RELIGIONS = [
  { value: 'general', label: 'Geral / Universal' },
  { value: 'catholic', label: 'Catolicismo' },
  { value: 'protestant', label: 'Protestantismo' },
  { value: 'jewish', label: 'Judaísmo' },
  { value: 'islam', label: 'Islã' },
  { value: 'hindu', label: 'Hinduísmo' },
  { value: 'buddhist', label: 'Budismo' },
  { value: 'spiritist', label: 'Espiritismo' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
];

const SOURCE_TYPES = [
  { value: 'book', label: 'Livro' },
  { value: 'article', label: 'Artigo' },
  { value: 'scripture', label: 'Escritura sagrada' },
  { value: 'lecture', label: 'Palestra/Aula' },
  { value: 'other', label: 'Outro' },
];

export default function AdminKnowledge() {
  const { user } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [sourceType, setSourceType] = useState('book');
  const [religion, setReligion] = useState('general');
  const [language, setLanguage] = useState('pt-BR');
  const [file, setFile] = useState<File | null>(null);
  const [inlineText, setInlineText] = useState('');
  const [mode, setMode] = useState<'file' | 'text'>('file');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    (async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      const admin = roles?.some((r: any) => r.role === 'admin') ?? false;
      if (!admin) { navigate('/'); return; }
      setIsAdmin(true);
      await loadSources();
      setLoading(false);
    })();
  }, [user]);

  const loadSources = async () => {
    const { data } = await supabase
      .from('knowledge_sources' as any)
      .select('*')
      .order('created_at', { ascending: false });
    setSources((data as any) || []);
  };

  // Auto-refresh sources that are processing
  useEffect(() => {
    const hasProcessing = sources.some(s => s.status === 'processing' || s.status === 'pending');
    if (!hasProcessing) return;
    const t = setInterval(loadSources, 5000);
    return () => clearInterval(t);
  }, [sources]);

  const reset = () => {
    setTitle(''); setAuthor(''); setSourceType('book');
    setReligion('general'); setLanguage('pt-BR');
    setFile(null); setInlineText('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast({ title: 'Título obrigatório', variant: 'destructive' }); return; }
    if (mode === 'file' && !file) { toast({ title: 'Selecione um arquivo', variant: 'destructive' }); return; }
    if (mode === 'text' && inlineText.trim().length < 100) { toast({ title: 'Cole pelo menos 100 caracteres', variant: 'destructive' }); return; }
    if (file && file.size > 15 * 1024 * 1024) { toast({ title: 'Arquivo > 15MB', description: 'Divida em partes menores.', variant: 'destructive' }); return; }

    setSubmitting(true);
    try {
      let filePath: string | null = null;
      if (mode === 'file' && file) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        if (!['pdf', 'txt', 'md'].includes(ext)) {
          throw new Error('Apenas .pdf, .txt ou .md são suportados');
        }
        filePath = `${user!.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error: upErr } = await supabase.storage
          .from('knowledge-files')
          .upload(filePath, file);
        if (upErr) throw upErr;
      }

      const { data: inserted, error: insErr } = await supabase
        .from('knowledge_sources' as any)
        .insert({
          title: title.trim(),
          author: author.trim() || null,
          source_type: sourceType,
          religion: religion === 'general' ? 'general' : religion,
          language,
          file_path: filePath,
          status: 'pending',
          created_by: user!.id,
        } as any)
        .select()
        .single();
      if (insErr) throw insErr;

      // Trigger ingestion
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('ingest-knowledge', {
        body: {
          source_id: (inserted as any).id,
          inline_text: mode === 'text' ? inlineText : undefined,
        },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.error) {
        // Source row exists but failed — show error but keep row
        toast({ title: 'Falha na ingestão', description: resp.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Fonte adicionada!', description: 'Processamento iniciado.' });
      }
      reset();
      await loadSources();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const reprocess = async (s: KnowledgeSource) => {
    if (!s.file_path && s.status !== 'failed') {
      toast({ title: 'Não é possível reprocessar', description: 'Sem arquivo armazenado.', variant: 'destructive' });
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    toast({ title: 'Reprocessando…' });
    await supabase.functions.invoke('ingest-knowledge', {
      body: { source_id: s.id },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    await loadSources();
  };

  const deleteSource = async (s: KnowledgeSource) => {
    if (!confirm(`Excluir "${s.title}"? Todos os trechos indexados serão removidos.`)) return;
    if (s.file_path) {
      await supabase.storage.from('knowledge-files').remove([s.file_path]);
    }
    await supabase.from('knowledge_sources' as any).delete().eq('id', s.id);
    await loadSources();
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  const StatusBadge = ({ s }: { s: KnowledgeSource }) => {
    const map = {
      pending: { icon: Clock, cls: 'bg-muted text-muted-foreground', label: 'Pendente' },
      processing: { icon: Loader2, cls: 'bg-blue-500/20 text-blue-700 border-blue-500/30', label: 'Processando…', spin: true },
      ready: { icon: CheckCircle2, cls: 'bg-green-500/20 text-green-700 border-green-500/30', label: `Pronto (${s.chunk_count} trechos)` },
      failed: { icon: AlertCircle, cls: 'bg-destructive/20 text-destructive border-destructive/30', label: 'Falhou' },
    } as const;
    const cfg = map[s.status];
    const Icon = cfg.icon;
    return (
      <Badge className={cfg.cls + ' gap-1'}>
        <Icon className={`h-3 w-3 ${(cfg as any).spin ? 'animate-spin' : ''}`} />
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="flex-1 p-4 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Biblioteca de Conhecimento
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={loadSources}>
          <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Adicione livros, artigos e textos. Eles serão processados em pequenos trechos com embeddings vetoriais e usados pelos chats (Mentor Espiritual e Aprender) para enriquecer respostas com fontes confiáveis.
      </p>

      {/* Add new source */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" /> Adicionar nova fonte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Título *</Label>
              <Input placeholder="Ex: Antissemitismo Estrutural" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Autor</Label>
              <Input placeholder="Ex: Gustavo Binenbojm" value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tradição</Label>
              <Select value={religion} onValueChange={setReligion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RELIGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (BR)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="he">עברית</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'file' | 'text')}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="file"><Upload className="h-4 w-4 mr-2" /> Upload PDF/TXT</TabsTrigger>
              <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2" /> Colar texto</TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="pt-3">
              <Input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground mt-2">Máx 15MB. PDFs digitalizados (imagens) não são suportados — apenas PDFs com texto. Para livros maiores, divida em volumes.</p>
            </TabsContent>
            <TabsContent value="text" className="pt-3">
              <Textarea
                placeholder="Cole aqui o conteúdo completo (mín 100 caracteres)…"
                value={inlineText}
                onChange={e => setInlineText(e.target.value)}
                rows={8}
              />
              <p className="text-xs text-muted-foreground mt-2">{inlineText.length} caracteres</p>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Adicionar e processar
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Fontes cadastradas ({sources.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma fonte ainda.</p>
          ) : (
            <div className="space-y-3">
              {sources.map(s => (
                <div key={s.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.author && `${s.author} · `}
                        {RELIGIONS.find(r => r.value === s.religion)?.label || s.religion} · {s.language}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge s={s} />
                      <Button size="icon" variant="ghost" onClick={() => reprocess(s)} title="Reprocessar" disabled={s.status === 'processing'}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteSource(s)} title="Excluir">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {s.error_message && (
                    <p className="text-xs text-destructive bg-destructive/10 rounded p-2 border border-destructive/20">{s.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
