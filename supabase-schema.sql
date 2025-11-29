-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Posts table: Store all generated content
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  topic TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'linkedin', 'instagram', 'facebook', etc.
  framework TEXT, -- 'PAS', 'BAB', '4Ps', etc.
  quality_score DECIMAL(3,1), -- e.g., 8.3
  triggers TEXT[], -- Array of psychological triggers used
  image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table: Track engagement
CREATE TABLE IF NOT EXISTS post_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2), -- Calculated: (likes + comments + shares) / reach * 100
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Embeddings table: Store vector representations for similarity search
CREATE TABLE IF NOT EXISTS post_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search (using cosine distance)
CREATE INDEX IF NOT EXISTS post_embeddings_embedding_idx ON post_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
  p_likes INTEGER,
  p_comments INTEGER,
  p_shares INTEGER,
  p_reach INTEGER
)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  IF p_reach = 0 THEN
    RETURN 0;
  END IF;
  RETURN ((p_likes + p_comments + p_shares)::DECIMAL / p_reach * 100);
END;
$$ LANGUAGE plpgsql;

-- View: Posts with performance metrics
CREATE OR REPLACE VIEW posts_with_performance AS
SELECT
  p.*,
  pp.likes,
  pp.comments,
  pp.shares,
  pp.reach,
  pp.engagement_rate,
  pp.recorded_at as metrics_recorded_at
FROM posts p
LEFT JOIN post_performance pp ON p.id = pp.post_id;

-- View: Top performing posts by engagement rate
CREATE OR REPLACE VIEW top_performing_posts AS
SELECT
  p.*,
  pp.engagement_rate,
  pp.likes,
  pp.comments,
  pp.shares,
  pp.reach
FROM posts p
INNER JOIN post_performance pp ON p.id = pp.post_id
WHERE pp.engagement_rate IS NOT NULL
ORDER BY pp.engagement_rate DESC;

-- Function: Find similar posts using vector similarity
CREATE OR REPLACE FUNCTION match_posts(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_platform text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  topic TEXT,
  target_audience TEXT,
  platform TEXT,
  framework TEXT,
  quality_score DECIMAL(3,1),
  triggers TEXT[],
  image_url TEXT,
  published BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.content,
    p.topic,
    p.target_audience,
    p.platform,
    p.framework,
    p.quality_score,
    p.triggers,
    p.image_url,
    p.published,
    p.created_at,
    1 - (pe.embedding <=> query_embedding) as similarity
  FROM posts p
  INNER JOIN post_embeddings pe ON p.id = pe.post_id
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
    AND (filter_platform IS NULL OR p.platform = filter_platform)
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
