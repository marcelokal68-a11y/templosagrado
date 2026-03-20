import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SendHorizonal, Loader2, MessageCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { containsProfanity } from '@/lib/profanityFilter';

// If display_name looks like an email, show only the part before @
function friendlyName(name: string | null): string {
  if (!name) return 'Alguém';
  if (name.includes('@')) return name.split('@')[0];
  return name;
}

interface Post {
  id: string;
  content: string;
  display_name: string | null;
  is_anonymous: boolean;
  user_id: string;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  display_name: string | null;
  created_at: string;
}

interface Reaction {
  post_id: string;
  user_id: string;
  reaction_type: string;
}

export default function Mural() {
  const { user } = useApp();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newPrayer, setNewPrayer] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Load profile display name
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name || null));
  }, [user]);

  // Load posts, reactions, comments
  const loadData = useCallback(async () => {
    const [postsRes, reactionsRes, commentsRes] = await Promise.all([
      supabase.from('prayer_wall_posts').select('id, content, display_name, is_anonymous, user_id, created_at')
        .order('created_at', { ascending: false }).limit(50),
      supabase.from('prayer_reactions').select('post_id, user_id, reaction_type'),
      supabase.from('prayer_comments').select('*').order('created_at', { ascending: true }),
    ]);
    if (postsRes.data) setPosts(postsRes.data);
    if (reactionsRes.data) setReactions(reactionsRes.data);
    if (commentsRes.data) setComments(commentsRes.data as Comment[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase.channel('prayer-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_wall_posts' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_reactions' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_comments' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const handlePost = async () => {
    if (!newPrayer.trim() || !user) return;
    if (containsProfanity(newPrayer)) {
      toast({ title: 'Conteúdo inadequado detectado', variant: 'destructive' });
      return;
    }
    setPosting(true);
    try {
      await supabase.from('prayer_wall_posts').insert({
        user_id: user.id,
        content: newPrayer.trim(),
        display_name: displayName,
        is_anonymous: false,
        is_public: true,
      });
      setNewPrayer('');
      toast({ title: 'Oração publicada 🙏' });
    } catch {
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  const handleAmem = async (postId: string) => {
    if (!user) return;
    const existing = reactions.find(r => r.post_id === postId && r.user_id === user.id && r.reaction_type === 'pray');
    if (existing) {
      await supabase.from('prayer_reactions').delete()
        .eq('post_id', postId).eq('user_id', user.id).eq('reaction_type', 'pray');
    } else {
      await supabase.from('prayer_reactions').insert({
        post_id: postId, user_id: user.id, reaction_type: 'pray',
      });
    }
    loadData();
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-foreground">Corrente de Orações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compartilhe seu pedido e ore pelos outros
          </p>
        </div>

        {/* New prayer input */}
        {user && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
            <Textarea
              value={newPrayer}
              onChange={e => setNewPrayer(e.target.value)}
              placeholder="Qual é o seu pedido de oração hoje?"
              className="min-h-[60px] max-h-[120px] resize-none text-sm rounded-xl bg-background border-border/50"
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                onClick={handlePost}
                disabled={posting || !newPrayer.trim()}
                size="sm"
                className="bg-primary text-primary-foreground gap-1.5"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                Publicar
              </Button>
            </div>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Nenhuma oração ainda. Seja o primeiro a compartilhar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PrayerCard
                key={post.id}
                post={post}
                reactions={reactions}
                comments={comments.filter(c => c.post_id === post.id)}
                currentUserId={user?.id}
                displayName={displayName}
                onAmem={handleAmem}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PrayerCard({ post, reactions, comments, currentUserId, displayName, onAmem, onRefresh }: {
  post: Post;
  reactions: Reaction[];
  comments: Comment[];
  currentUserId?: string;
  displayName: string | null;
  onAmem: (id: string) => void;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const amenCount = reactions.filter(r => r.post_id === post.id && r.reaction_type === 'pray').length;
  const userAmen = reactions.some(r => r.post_id === post.id && r.user_id === currentUserId && r.reaction_type === 'pray');
  const isOwn = currentUserId === post.user_id;

  const timeAgo = getTimeAgo(post.created_at);

  const handleComment = async () => {
    if (!newComment.trim() || !currentUserId) return;
    if (containsProfanity(newComment)) {
      toast({ title: 'Conteúdo inadequado', variant: 'destructive' });
      return;
    }
    setCommenting(true);
    try {
      await supabase.from('prayer_comments').insert({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment.trim(),
        display_name: displayName,
      } as any);
      setNewComment('');
      onRefresh();
    } catch {
      toast({ title: 'Erro ao comentar', variant: 'destructive' });
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from('prayer_wall_posts').delete().eq('id', post.id);
    onRefresh();
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from('prayer_comments').delete().eq('id', commentId);
    onRefresh();
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Post content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {(post.is_anonymous ? 'A' : (post.display_name || '?')[0]).toUpperCase()}
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">
                {post.is_anonymous ? 'Anônimo' : (post.display_name || 'Alguém')}
              </span>
              <span className="text-[11px] text-muted-foreground ml-2">{timeAgo}</span>
            </div>
          </div>
          {isOwn && (
            <button onClick={handleDelete} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex items-center border-t border-border/30 px-2">
        <button
          onClick={() => onAmem(post.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors flex-1 justify-center",
            userAmen ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          🙏 Amém {amenCount > 0 && <span className="text-xs">({amenCount})</span>}
        </button>
        <div className="w-px h-6 bg-border/30" />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex-1 justify-center"
        >
          <MessageCircle className="h-4 w-4" />
          Comentar {comments.length > 0 && <span className="text-xs">({comments.length})</span>}
          {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border/30 bg-background/50">
          {comments.length > 0 && (
            <div className="px-4 py-2 space-y-2">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0 mt-0.5">
                    {(comment.display_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-medium text-foreground">{comment.display_name || 'Alguém'}</span>
                      <span className="text-[10px] text-muted-foreground">{getTimeAgo(comment.created_at)}</span>
                      {currentUserId === comment.user_id && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-muted-foreground hover:text-destructive ml-auto">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {currentUserId && (
            <div className="flex gap-2 px-4 py-2 border-t border-border/20">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment())}
                placeholder="Escreva um comentário..."
                className="flex-1 text-xs bg-transparent border-0 outline-none placeholder:text-muted-foreground/50 py-1"
              />
              <button
                onClick={handleComment}
                disabled={commenting || !newComment.trim()}
                className="text-primary disabled:opacity-40 text-xs font-medium px-2"
              >
                {commenting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enviar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}
