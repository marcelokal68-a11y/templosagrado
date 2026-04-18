CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector,
  match_count integer DEFAULT 5,
  filter_religion text DEFAULT NULL::text,
  similarity_threshold double precision DEFAULT 0.65,
  strict_match boolean DEFAULT false
)
RETURNS TABLE(chunk_id uuid, source_id uuid, content text, similarity double precision, source_title text, source_author text, source_religion text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    AND (
      filter_religion IS NULL
      OR ks.religion = filter_religion
      OR (NOT strict_match AND ks.religion = 'general')
    )
    AND (1 - (kc.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;