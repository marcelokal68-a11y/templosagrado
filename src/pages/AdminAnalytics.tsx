import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface PlanRow {
  product_id: string;
  plan_name: string;
  active: number;
  trialing: number;
  canceled_30d: number;
  mrr: number;
  currency: string;
}

interface AnalyticsData {
  totals: {
    totalUsers: number;
    trialActive: number;
    trialExpired: number;
    convertedFromTrial: number;
    conversionRate: number;
    totalActiveSubs: number;
    totalCanceled30d: number;
    churnRate: number;
    totalMrr: number;
    arr: number;
  };
  planBreakdown: PlanRow[];
  timeline: { day: string; signups: number; conversions: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#6366f1'];

export default function AdminAnalytics() {
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    (async () => {
      try {
        const roleResp = await supabase.functions.invoke('admin', { body: { action: 'check-role' } });
        if (!roleResp.data?.isAdmin) {
          navigate('/');
          return;
        }
        setIsAdmin(true);
        const resp = await supabase.functions.invoke('admin', { body: { action: 'get-analytics' } });
        if (resp.error) throw resp.error;
        setData(resp.data);
      } catch (e: any) {
        toast({
          title: 'Erro ao carregar analytics',
          description: e?.message || 'Tente novamente',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate, toast]);

  const fmtBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin || !data) return null;

  const { totals, planBreakdown, timeline } = data;
  const conversionPieData = [
    { name: 'Convertidos', value: totals.convertedFromTrial },
    { name: 'Trial expirado (não pagou)', value: totals.trialExpired },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h1 className="text-2xl font-display font-semibold">Analytics</h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPI
          icon={<DollarSign className="h-4 w-4" />}
          label="MRR estimado"
          value={fmtBRL(totals.totalMrr)}
          sub={`ARR: ${fmtBRL(totals.arr)}`}
          tone="primary"
        />
        <KPI
          icon={<TrendingUp className="h-4 w-4" />}
          label="Conversão trial→pago"
          value={`${totals.conversionRate.toFixed(1)}%`}
          sub={`${totals.convertedFromTrial} de ${totals.convertedFromTrial + totals.trialExpired}`}
          tone="success"
        />
        <KPI
          icon={<TrendingDown className="h-4 w-4" />}
          label="Churn (30d)"
          value={`${totals.churnRate.toFixed(1)}%`}
          sub={`${totals.totalCanceled30d} cancelamentos`}
          tone={totals.churnRate > 5 ? 'danger' : 'muted'}
        />
        <KPI
          icon={<Users className="h-4 w-4" />}
          label="Trial ativos"
          value={String(totals.trialActive)}
          sub={`${totals.totalUsers} usuários totais`}
          tone="muted"
        />
      </div>

      {/* Conversion + Plans */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil de conversão (trials encerrados)</CardTitle>
          </CardHeader>
          <CardContent>
            {totals.convertedFromTrial + totals.trialExpired === 0 ? (
              <EmptyMsg text="Nenhum trial encerrou ainda." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={conversionPieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label={(e: any) => `${e.name}: ${e.value}`}
                  >
                    {conversionPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">MRR por plano</CardTitle>
          </CardHeader>
          <CardContent>
            {planBreakdown.length === 0 ? (
              <EmptyMsg text="Nenhuma assinatura ativa ainda." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={planBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="plan_name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip formatter={(v: any) => fmtBRL(Number(v))} />
                  <Bar dataKey="mrr" fill="hsl(var(--primary))" name="MRR" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Cadastros vs Conversões (últimos 30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="signups" stroke="hsl(var(--primary))" name="Cadastros" strokeWidth={2} />
              <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversões pagas" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plan breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhe por plano</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {planBreakdown.length === 0 ? (
            <EmptyMsg text="Sem dados de planos." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 font-medium">Plano</th>
                  <th className="py-2 font-medium text-right">Ativos</th>
                  <th className="py-2 font-medium text-right">Em trial</th>
                  <th className="py-2 font-medium text-right">Cancelados 30d</th>
                  <th className="py-2 font-medium text-right">Churn</th>
                  <th className="py-2 font-medium text-right">MRR</th>
                </tr>
              </thead>
              <tbody>
                {planBreakdown.map((p) => {
                  const total = p.active + p.trialing + p.canceled_30d;
                  const churn = total > 0 ? (p.canceled_30d / total) * 100 : 0;
                  return (
                    <tr key={p.product_id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{p.plan_name}</td>
                      <td className="py-2 text-right">{p.active}</td>
                      <td className="py-2 text-right">{p.trialing}</td>
                      <td className="py-2 text-right">{p.canceled_30d}</td>
                      <td className="py-2 text-right">
                        <Badge variant={churn > 5 ? 'destructive' : 'secondary'}>
                          {churn.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-semibold">{fmtBRL(p.mrr)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Dados em tempo real do Stripe. MRR normaliza planos anuais para mensal (÷12).
      </p>
    </div>
  );
}

function KPI({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: 'primary' | 'success' | 'danger' | 'muted';
}) {
  const toneColor = {
    primary: 'text-primary',
    success: 'text-emerald-600',
    danger: 'text-red-600',
    muted: 'text-muted-foreground',
  }[tone];
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`flex items-center gap-1.5 text-xs ${toneColor} mb-1.5`}>
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-2xl font-display font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return (
    <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
