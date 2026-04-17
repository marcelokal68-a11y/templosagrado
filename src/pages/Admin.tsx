import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Copy, Plus, Loader2, ToggleLeft, ToggleRight, UserPlus, Link as LinkIcon,
  Users, CreditCard, Wifi, Search, ArrowUpDown, Shield, Gift, Trash2, Clock
} from 'lucide-react';
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

interface CrmUser {
  id: string;
  email: string;
  display_name: string;
  is_subscriber: boolean;
  is_pro: boolean;
  is_admin: boolean;
  is_online: boolean;
  trial_days_left: number;
  created_at: string;
  last_sign_in_at: string | null;
}

interface Stats {
  totalUsers: number;
  onlineUsers: number;
  subscribers: number;
  trialing?: number;
}

interface FreeAccessRow {
  email: string;
  note: string | null;
  created_at: string;
}

type SortKey = 'display_name' | 'created_at' | 'last_sign_in_at';

export default function Admin() {
  const { user } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Invites state
  const [invites, setInvites] = useState<InviteLink[]>([]);
  const [label, setLabel] = useState('');
  const [questionsLimit, setQuestionsLimit] = useState('999');
  const [maxUses, setMaxUses] = useState('');
  const [creating, setCreating] = useState(false);

  // Promote state
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoting, setPromoting] = useState(false);

  // CRM state
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Free access state
  const [freeAccess, setFreeAccess] = useState<FreeAccessRow[]>([]);
  const [freeEmail, setFreeEmail] = useState('');
  const [freeNote, setFreeNote] = useState('');
  const [addingFree, setAddingFree] = useState(false);

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
        loadAll(token!);
      } else {
        navigate('/');
      }
      setLoading(false);
    })();
  }, [user]);

  const loadAll = async (token: string) => {
    loadInvites(token);
    loadUsers(token);
    loadStats(token);
    loadFreeAccess(token);
  };

  const loadInvites = async (token?: string) => {
    const t = token || await getToken();
    const resp = await supabase.functions.invoke('admin', {
      body: { action: 'list-invites' },
      headers: { Authorization: `Bearer ${t}` },
    });
    if (Array.isArray(resp.data)) setInvites(resp.data);
  };

  const loadUsers = async (token?: string) => {
    setLoadingUsers(true);
    const t = token || await getToken();
    const resp = await supabase.functions.invoke('admin', {
      body: { action: 'list-users' },
      headers: { Authorization: `Bearer ${t}` },
    });
    if (Array.isArray(resp.data)) setUsers(resp.data);
    setLoadingUsers(false);
  };

  const loadStats = async (token?: string) => {
    const t = token || await getToken();
    const resp = await supabase.functions.invoke('admin', {
      body: { action: 'get-stats' },
      headers: { Authorization: `Bearer ${t}` },
    });
    if (resp.data && !resp.data.error) setStats(resp.data);
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
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setPromoting(false);
    }
  };

  const loadFreeAccess = async (token?: string) => {
    const t = token || await getToken();
    const resp = await supabase.functions.invoke('admin', {
      body: { action: 'list-free-access' },
      headers: { Authorization: `Bearer ${t}` },
    });
    if (Array.isArray(resp.data)) setFreeAccess(resp.data);
  };

  const addFreeAccess = async () => {
    if (!freeEmail.trim()) return;
    setAddingFree(true);
    try {
      const token = await getToken();
      const resp = await supabase.functions.invoke('admin', {
        body: { action: 'add-free-access', email: freeEmail.trim(), note: freeNote.trim() || null },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.error) throw new Error(resp.data.error);
      toast({ title: 'Acesso livre concedido!' });
      setFreeEmail(''); setFreeNote('');
      loadFreeAccess();
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setAddingFree(false);
    }
  };

  const removeFreeAccess = async (email: string) => {
    const token = await getToken();
    await supabase.functions.invoke('admin', {
      body: { action: 'remove-free-access', email },
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({ title: 'Removido' });
    loadFreeAccess();
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    let list = users.filter(u =>
      u.display_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === 'display_name') { av = a.display_name.toLowerCase(); bv = b.display_name.toLowerCase(); }
      else if (sortKey === 'created_at') { av = a.created_at; bv = b.created_at; }
      else { av = a.last_sign_in_at ?? ''; bv = b.last_sign_in_at ?? ''; }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, search, sortKey, sortAsc]);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="flex-1 p-4 max-w-6xl mx-auto space-y-6 pb-24">
      <h1 className="font-display text-2xl font-bold">Painel Admin</h1>

      <Tabs defaultValue="users">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="invites">Convites</TabsTrigger>
          <TabsTrigger value="free">Acesso Livre</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        {/* ===== USERS TAB ===== */}
        <TabsContent value="users" className="space-y-6">
          {/* KPIs */}
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <Card><CardContent className="p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div><p className="text-2xl font-bold">{stats.totalUsers}</p><p className="text-xs text-muted-foreground">Total usuários</p></div>
              </CardContent></Card>
              <Card><CardContent className="p-4 flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-green-500" />
                <div><p className="text-2xl font-bold">{stats.subscribers}</p><p className="text-xs text-muted-foreground">Assinantes</p></div>
              </CardContent></Card>
              <Card><CardContent className="p-4 flex items-center gap-3">
                <Wifi className="h-8 w-8 text-blue-500" />
                <div><p className="text-2xl font-bold">{stats.onlineUsers}</p><p className="text-xs text-muted-foreground">Online agora</p></div>
              </CardContent></Card>
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground whitespace-nowrap">{filteredUsers.length} usuários</p>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('display_name')}>
                      <span className="flex items-center gap-1">Nome <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Trial</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                      <span className="flex items-center gap-1">Cadastro <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('last_sign_in_at')}>
                      <span className="flex items-center gap-1">Último acesso <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium max-w-[150px] truncate">{u.display_name}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground text-xs">{u.email}</TableCell>
                      <TableCell>
                        {u.is_online
                          ? <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Online</Badge>
                          : <Badge variant="secondary">Offline</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.is_admin && <Badge className="bg-purple-500/20 text-purple-700 border-purple-500/30">Admin</Badge>}
                          {u.is_subscriber
                            ? <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Assinante</Badge>
                            : <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">Gratuito</Badge>
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {u.trial_days_left > 0 && !u.is_subscriber
                          ? <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{u.trial_days_left}d</Badge>
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(u.created_at)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(u.last_sign_in_at)}</TableCell>
                      <TableCell>
                        {!u.is_admin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Promover a admin"
                            onClick={async () => {
                              const token = await getToken();
                              await supabase.functions.invoke('admin', {
                                body: { action: 'promote-admin', target_email: u.email },
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              toast({ title: 'Promovido!' });
                              loadUsers();
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ===== FREE ACCESS TAB ===== */}
        <TabsContent value="free" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Gift className="h-5 w-5" /> Conceder Acesso Livre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Emails nesta lista têm acesso completo permanente, sem precisar pagar.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder="email@exemplo.com" value={freeEmail} onChange={e => setFreeEmail(e.target.value)} />
                <Input placeholder="Nota (opcional)" value={freeNote} onChange={e => setFreeNote(e.target.value)} />
              </div>
              <Button onClick={addFreeAccess} disabled={addingFree || !freeEmail.trim()}>
                {addingFree ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Adicionar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Emails com acesso livre</CardTitle></CardHeader>
            <CardContent>
              {freeAccess.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum email cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {freeAccess.map(f => (
                    <div key={f.email} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{f.email}</p>
                        {f.note && <p className="text-xs text-muted-foreground truncate">{f.note}</p>}
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeFreeAccess(f.email)} title="Remover">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== INVITES TAB ===== */}
        <TabsContent value="invites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5" /> Criar Link de Convite
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

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Links Criados</CardTitle></CardHeader>
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
                      <Button size="icon" variant="ghost" onClick={() => toggleInvite(inv.id, !inv.is_active)} title={inv.is_active ? 'Desativar' : 'Ativar'}>
                        {inv.is_active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ADMIN TAB ===== */}
        <TabsContent value="admin" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
