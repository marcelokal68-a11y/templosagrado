import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { getSacredPlace } from './sacredPlaces';
import PrayerNote from './PrayerNote';
import NoteForm from './NoteForm';
import { Button } from '@/components/ui/button';
import { Plus, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ROTATIONS = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0.5', '-rotate-0.5', 'rotate-0'];

interface SacredPlaceProps {
  selectedReligion: string;
  userReligion: string;
}

export default function SacredPlace({ selectedReligion, userReligion }: SacredPlaceProps) {
  const { language, user } = useApp();
  const [posts, setPosts] = useState<any[]>([]);
  const [reactions, setReactions] = useState<Record<string, { pray: number; heart: number; userPray: boolean; userHeart: boolean }>>({});
  const [showForm, setShowForm] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);

  const canPost = selectedReligion === userReligion;
  const place = getSacredPlace(selectedReligion);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('prayer_wall_posts')
      .select('*')
      .eq('religion', selectedReligion)
      .order('created_at', { ascending: false })
      .limit(50);

    setPosts(data || []);

    if (data && data.length > 0) {
      const postIds = data.map(p => p.id);
      const { data: rxns } = await supabase
        .from('prayer_reactions')
        .select('*')
        .in('post_id', postIds);

      const map: typeof reactions = {};
      for (const p of data) {
        const pRxns = (rxns || []).filter(r => r.post_id === p.id);
        map[p.id] = {
          pray: pRxns.filter(r => r.reaction_type === 'pray').length,
          heart: pRxns.filter(r => r.reaction_type === 'heart').length,
          userPray: pRxns.some(r => r.reaction_type === 'pray' && r.user_id === user.id),
          userHeart: pRxns.some(r => r.reaction_type === 'heart' && r.user_id === user.id),
        };
      }
      setReactions(map);
    }
  }, [user, selectedReligion]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('is_subscriber').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      setIsSubscriber(data?.is_subscriber ?? false);
    });
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel('mural-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayer_wall_posts' }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  const handleReact = async (postId: string, type: 'pray' | 'heart') => {
    if (!user) return;
    const key = type === 'pray' ? 'userPray' : 'userHeart';
    const current = reactions[postId]?.[key];

    if (current) {
      await supabase.from('prayer_reactions').delete().match({ post_id: postId, user_id: user.id, reaction_type: type });
    } else {
      await supabase.from('prayer_reactions').insert({ post_id: postId, user_id: user.id, reaction_type: type });
    }
    fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    await supabase.from('prayer_wall_posts').delete().eq('id', postId);
    fetchPosts();
  };

  const viewOnlyLabel = language === 'en'
    ? 'You are visiting this temple. You can only post in your own tradition.'
    : language === 'es'
      ? 'Estás visitando este templo. Solo puedes publicar en tu propia tradición.'
      : 'Você está visitando este templo. Só pode postar na sua própria tradição.';

  const banWarning = language === 'en'
    ? '⚠️ Offensive, racist, or hateful messages may result in a ban from the Sacred Temple.'
    : language === 'es'
      ? '⚠️ Mensajes ofensivos, racistas o de odio pueden resultar en un baneo del Templo Sagrado.'
      : '⚠️ Mensagens ofensivas, racistas ou de ódio podem resultar em banimento do Templo Sagrado.';

  return (
    <div className="space-y-0">
      {/* Hero image */}
      <div className="relative h-52 md:h-64 rounded-xl overflow-hidden mb-6 sacred-glow">
        <img
          src={place.imageUrl}
          alt={place.name[language] || place.name['pt-BR']}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient-sacred drop-shadow-lg" style={{ WebkitTextFillColor: 'initial', color: 'hsl(38 80% 55%)' }}>
            {place.name[language] || place.name['pt-BR']}
          </h2>
          <p className="text-sm text-white/70 mt-1 max-w-md">
            {place.subtitle[language] || place.subtitle['pt-BR']}
          </p>
        </div>
      </div>

      {/* Post controls */}
      {canPost ? (
        isSubscriber ? (
          <div className="mb-6">
            {showForm ? (
              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground text-center">{banWarning}</p>
                <NoteForm
                  religion={selectedReligion}
                  onCreated={() => { setShowForm(false); fetchPosts(); }}
                />
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="w-full">
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowForm(true)} className="w-full gap-2 sacred-gradient text-primary-foreground border-0 sacred-glow">
                <Plus className="h-4 w-4" />
                {language === 'en' ? 'Place a note' : language === 'es' ? 'Depositar nota' : 'Depositar bilhete'}
              </Button>
            )}
          </div>
        ) : (
          <div className="mb-6 glass sacred-border rounded-lg p-4 text-center space-y-2">
            <Lock className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Subscribe to place prayer notes' : language === 'es' ? 'Suscríbete para depositar notas' : 'Assine para depositar bilhetes de oração'}
            </p>
            <Link to="/pricing">
              <Button size="sm" variant="outline" className="border-primary/30">{t('chat.upgrade', language)}</Button>
            </Link>
          </div>
        )
      ) : (
        <div className="mb-6 glass sacred-border rounded-lg p-4 text-center space-y-1">
          <Eye className="h-5 w-5 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{viewOnlyLabel}</p>
        </div>
      )}

      {/* Notes grid */}
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          {language === 'en' ? 'No notes yet. Be the first!' : language === 'es' ? 'Aún no hay notas. ¡Sé el primero!' : 'Nenhum bilhete ainda. Seja o primeiro!'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post, i) => (
            <PrayerNote
              key={post.id}
              post={post}
              reactions={reactions[post.id] || { pray: 0, heart: 0, userPray: false, userHeart: false }}
              onReact={handleReact}
              onDelete={post.user_id === user?.id ? () => handleDelete(post.id) : undefined}
              rotationClass={ROTATIONS[i % ROTATIONS.length]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
