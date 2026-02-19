import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, Plus, Loader2, ToggleLeft, ToggleRight, UserPlus, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InviteLink {
  id: string;
  code: string;
  label: string | null;
  questions_limit: number;
  max_uses: number | null;
  times_used: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export default function Admin() {
  const { user } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<InviteLink[]>([]);
  const [label, setLabel] = useState('');
  const [questionsLimit, setQuestionsLimit] = useState('999');
  const [maxUses, setMaxUses] = useState('');
  const [creating, setCreating] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoting, setPromoting] = useState(false);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    (async () => {
      const token = await getToken();
      const resp = await supabase.functions.invoke('admin', {
        body: { action: 'check-role' },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.isAdmin) {
        setIsAdmin(true);
        loadInvites();
      } else {
        navigate('/');
      }
      setLoading(false);
    })();
  }, [user]);

  const loadInvites = async () => {
    const token = await getToken();
    const resp = await supabase.functions.invoke('admin', {
      body: { action: 'list-invites' },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (Array.isArray(resp.data)) setInvites(resp.data);
  };

  const createInvite = async () => {
    setCreating(true);
    try {
      const token = await getToken();
      const resp = await supabase.functions.invoke('admin', {
        body: {
          action: 'create-invite',
          label: label || null,
          questions_limit: parseInt(questionsLimit) || 999,
          max_uses: maxUses ? parseInt(maxUses) : null,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.error) throw new Error(resp.data.error);
      toast({ title: 'Link criado!' });
      setLabel('');
      setMaxUses('');
      loadInvites();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const toggleInvite = async (id: string, is_active: boolean) => {
    const token = await getToken();
    await supabase.functions.invoke('admin', {
      body: { action: 'toggle-invite', id, is_active },
      headers: { Authorization: `Bearer ${token}` },
    });
    loadInvites();
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!' });
  };

  const promoteAdmin = async () => {
    if (!promoteEmail.trim()) return;
    setPromoting(true);
    try {
      const token = await getToken();
      const resp = await supabase.functions.invoke('admin', {
        body: { action: 'promote-admin', target_email: promoteEmail.trim() },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.error) throw new Error(resp.data.error);
      toast({ title: 'Usuário promovido a admin!' });
      setPromoteEmail('');
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setPromoting(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex-1 p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold">Painel Admin</h1>

      {/* Create Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" /> Criar Link de Convite (Passe Livre)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Input placeholder="Rótulo (ex: Amigos)" value={label} onChange={e => setLabel(e.target.value)} />
            <Input placeholder="Limite perguntas (999)" type="number" value={questionsLimit} onChange={e => setQuestionsLimit(e.target.value)} />
            <Input placeholder="Máx. usos (ilimitado)" type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} />
          </div>
          <Button onClick={createInvite} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Gerar Link
          </Button>
        </CardContent>
      </Card>

      {/* Existing Invites */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Links Criados</CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum link criado ainda.</p>
          ) : (
            <div className="space-y-3">
              {invites.map(inv => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{inv.label || inv.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.times_used}{inv.max_uses ? `/${inv.max_uses}` : ''} usos · {inv.questions_limit} perguntas
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => copyLink(inv.code)} title="Copiar link">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleInvite(inv.id, !inv.is_active)}
                    title={inv.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {inv.is_active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promote Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Promover Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input placeholder="Email do usuário" value={promoteEmail} onChange={e => setPromoteEmail(e.target.value)} className="flex-1" />
            <Button onClick={promoteAdmin} disabled={promoting || !promoteEmail.trim()}>
              {promoting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Promover
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
