import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import PrayerNote from './PrayerNote';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const RELIGIONS = ['jewish', 'catholic', 'protestant', 'christian', 'mormon', 'islam', 'buddhist', 'hindu', 'spiritist', 'umbanda', 'candomble', 'agnostic'];
const ROTATIONS = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0.5', '-rotate-0.5', 'rotate-0'];

export default function EcumenicalWall() {
  const { language, user } = useApp();
  const [posts, setPosts] = useState<any[]>([]);
  const [reactions, setReactions] = useState<Record<string, { pray: number; heart: number; userPray: boolean; userHeart: boolean }>>({});
  const [filters, setFilters] = useState<string[]>([]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    let query = supabase
      .from('prayer_wall_posts')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters.length > 0) {
      query = query.in('religion', filters);
    }

    const { data } = await query;
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
  }, [user, filters]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('ecumenical-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayer_wall_posts' }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  const toggleFilter = (r: string) => {
    setFilters(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold">
          🌍 {language === 'en' ? 'Ecumenical Meeting' : language === 'es' ? 'Encuentro Ecuménico' : 'Encontro Ecumênico'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {language === 'en' ? 'Public prayers from all traditions, united in one sacred space' : language === 'es' ? 'Oraciones públicas de todas las tradiciones, unidas en un espacio sagrado' : 'Orações públicas de todas as tradições, unidas num só espaço sagrado'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {RELIGIONS.map(r => (
          <Badge
            key={r}
            variant={filters.includes(r) ? 'default' : 'outline'}
            className={cn('cursor-pointer text-xs transition-all', filters.includes(r) && 'shadow-sm')}
            onClick={() => toggleFilter(r)}
          >
            {t(`religion.${r}`, language)}
          </Badge>
        ))}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          {language === 'en' ? 'No public notes yet' : language === 'es' ? 'Aún no hay notas públicas' : 'Nenhum bilhete público ainda'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post, i) => (
            <PrayerNote
              key={post.id}
              post={post}
              reactions={reactions[post.id] || { pray: 0, heart: 0, userPray: false, userHeart: false }}
              onReact={handleReact}
              showReligionBadge
              rotationClass={ROTATIONS[i % ROTATIONS.length]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
