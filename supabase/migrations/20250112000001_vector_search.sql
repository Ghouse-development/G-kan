-- Vector Search Function for AI Semantic Search
-- AIセマンティック検索用のベクトル検索関数

-- Function to match article embeddings by similarity
CREATE OR REPLACE FUNCTION match_article_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  article_id uuid,
  content_chunk text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    article_embeddings.article_id,
    article_embeddings.content_chunk,
    1 - (article_embeddings.embedding <=> query_embedding) as similarity
  FROM article_embeddings
  WHERE 1 - (article_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY article_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
