import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gift, CheckCircle } from 'lucide-react';

export default function InviteRedeem() {
  const { code } = useParams<{ code: string }>();
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      // Store invite code and redirect to auth
      sessionStorage.setItem('pending_invite', code || '');
      navigate('/auth');
    }
  }, [user, code, navigate]);

  const redeem = async () => {
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('redeem-invite', {
        body: { code },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.data?.error) throw new Error(resp.data.error);
      setRedeemed(true);
      toast({ title: 'Passe livre ativado! 🎉' });
      sessionStorage.removeItem('pending_invite');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-redeem after login
  useEffect(() => {
    const pending = sessionStorage.getItem('pending_invite');
    if (user && pending && pending === code) {
      redeem();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            {redeemed ? <CheckCircle className="h-7 w-7 text-primary" /> : <Gift className="h-7 w-7 text-primary" />}
          </div>
          <CardTitle className="font-display text-xl">
            {redeemed ? 'Passe Livre Ativado!' : 'Convite Especial'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {redeemed ? (
            <>
              <p className="text-sm text-muted-foreground">Seu acesso foi ampliado. Aproveite!</p>
              <Button onClick={() => navigate('/')} className="w-full">Ir para o Chat</Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Você recebeu um convite com passe livre para o Templo Sagrado.</p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={redeem} disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gift className="h-4 w-4 mr-2" />}
                Ativar Passe Livre
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
