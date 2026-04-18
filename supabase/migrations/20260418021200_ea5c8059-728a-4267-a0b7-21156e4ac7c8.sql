-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge sources (books, articles, texts)
CREATE TABLE public.knowledge_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  source_type TEXT NOT NULL DEFAULT 'book',
  religion TEXT,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  original_url TEXT,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage knowledge sources"
ON public.knowledge_sources
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read ready sources"
ON public.knowledge_sources
FOR SELECT
TO authenticated
USING (status = 'ready');

CREATE TRIGGER update_knowledge_sources_updated_at
BEFORE UPDATE ON public.knowledge_sources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Knowledge chunks with embeddings
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  token_count INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage knowledge chunks"
ON public.knowledge_chunks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_knowledge_chunks_source ON public.knowledge_chunks(source_id);
CREATE INDEX idx_knowledge_chunks_embedding ON public.knowledge_chunks
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Match function: semantic search returning top-N chunks
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(768),
  match_count INT DEFAULT 5,
  filter_religion TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.65
)
RETURNS TABLE (
  chunk_id UUID,
  source_id UUID,
  content TEXT,
  similarity FLOAT,
  source_title TEXT,
  source_author TEXT,
  source_religion TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id AS chunk_id,
    kc.source_id,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    ks.title AS source_title,
    ks.author AS source_author,
    ks.religion AS source_religion
  FROM public.knowledge_chunks kc
  JOIN public.knowledge_sources ks ON ks.id = kc.source_id
  WHERE ks.status = 'ready'
    AND (filter_religion IS NULL OR ks.religion = filter_religion OR ks.religion = 'general')
    AND (1 - (kc.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Storage bucket for knowledge files (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-files', 'knowledge-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload knowledge files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'knowledge-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read knowledge files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'knowledge-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete knowledge files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'knowledge-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update knowledge files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'knowledge-files' AND public.has_role(auth.uid(), 'admin'));