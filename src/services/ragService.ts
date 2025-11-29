import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url'
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Initialize OpenAI for embeddings
const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openai = openaiKey && openaiKey !== 'your_openai_api_key_for_embeddings'
  ? new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true })
  : null;

export interface SavedPost {
  id: string;
  content: string;
  topic: string;
  target_audience: string;
  platform: string;
  framework?: string;
  quality_score?: number;
  triggers?: string[];
  image_url?: string;
  published: boolean;
  created_at: string;
}

export interface PostPerformance {
  post_id: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement_rate: number;
}

// Generate embedding for text using OpenAI
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!openai) {
    console.warn('OpenAI not configured for embeddings');
    return null;
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Cheaper and faster than ada-002
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

// Save post to database with embedding
export async function savePost(
  content: string,
  topic: string,
  targetAudience: string,
  platform: string,
  framework?: string,
  qualityScore?: number,
  triggers?: string[],
  imageUrl?: string
): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase not configured');
    return null;
  }

  try {
    // Insert post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        content,
        topic,
        target_audience: targetAudience,
        platform,
        framework,
        quality_score: qualityScore,
        triggers,
        image_url: imageUrl,
        published: false,
      })
      .select()
      .single();

    if (postError) throw postError;

    // Generate and save embedding
    const embedding = await generateEmbedding(content);
    if (embedding) {
      const { error: embeddingError } = await supabase
        .from('post_embeddings')
        .insert({
          post_id: post.id,
          embedding,
        });

      if (embeddingError) {
        console.error('Error saving embedding:', embeddingError);
      }
    }

    return post.id;
  } catch (error) {
    console.error('Error saving post:', error);
    return null;
  }
}

// Find similar posts using vector similarity
export async function findSimilarPosts(
  content: string,
  platform: string,
  limit: number = 5
): Promise<SavedPost[]> {
  if (!supabase || !openai) {
    return [];
  }

  try {
    // Generate embedding for the query content
    const queryEmbedding = await generateEmbedding(content);
    if (!queryEmbedding) return [];

    // Query similar posts using vector similarity
    const { data, error } = await supabase.rpc('match_posts', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7, // Similarity threshold (0-1, higher = more similar)
      match_count: limit,
      filter_platform: platform,
    });

    if (error) {
      console.error('Error finding similar posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in findSimilarPosts:', error);
    return [];
  }
}

// Get top performing posts by engagement rate
export async function getTopPerformingPosts(
  platform?: string,
  limit: number = 10
): Promise<(SavedPost & PostPerformance)[]> {
  if (!supabase) return [];

  try {
    let query = supabase
      .from('top_performing_posts')
      .select('*')
      .order('engagement_rate', { ascending: false })
      .limit(limit);

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting top performing posts:', error);
    return [];
  }
}

// Save performance metrics for a post
export async function savePostPerformance(
  postId: string,
  likes: number,
  comments: number,
  shares: number,
  reach: number
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const engagementRate = reach > 0 ? ((likes + comments + shares) / reach) * 100 : 0;

    const { error } = await supabase.from('post_performance').insert({
      post_id: postId,
      likes,
      comments,
      shares,
      reach,
      engagement_rate: engagementRate,
    });

    if (error) throw error;

    // Mark post as published
    await supabase
      .from('posts')
      .update({ published: true, published_at: new Date().toISOString() })
      .eq('id', postId);

    return true;
  } catch (error) {
    console.error('Error saving performance:', error);
    return false;
  }
}

// Get insights: What works best for this user
export async function getInsights(platform?: string): Promise<{
  avgEngagementRate: number;
  bestFrameworks: { framework: string; avgEngagement: number }[];
  bestTriggers: { trigger: string; avgEngagement: number }[];
  totalPosts: number;
  publishedPosts: number;
}> {
  if (!supabase) {
    return {
      avgEngagementRate: 0,
      bestFrameworks: [],
      bestTriggers: [],
      totalPosts: 0,
      publishedPosts: 0,
    };
  }

  try {
    // Get average engagement rate
    let performanceQuery = supabase
      .from('posts_with_performance')
      .select('engagement_rate, framework, triggers, published, platform');

    if (platform) {
      performanceQuery = performanceQuery.eq('platform', platform);
    }

    const { data: performanceData } = await performanceQuery;

    if (!performanceData || performanceData.length === 0) {
      return {
        avgEngagementRate: 0,
        bestFrameworks: [],
        bestTriggers: [],
        totalPosts: 0,
        publishedPosts: 0,
      };
    }

    // Calculate metrics
    const totalPosts = performanceData.length;
    const publishedPosts = performanceData.filter((p) => p.published).length;

    const engagementRates = performanceData
      .filter((p) => p.engagement_rate !== null)
      .map((p) => p.engagement_rate);

    const avgEngagementRate =
      engagementRates.length > 0
        ? engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length
        : 0;

    // Best frameworks
    const frameworkStats = new Map<string, { total: number; count: number }>();
    performanceData
      .filter((p) => p.framework && p.engagement_rate !== null)
      .forEach((p) => {
        const current = frameworkStats.get(p.framework!) || { total: 0, count: 0 };
        frameworkStats.set(p.framework!, {
          total: current.total + p.engagement_rate,
          count: current.count + 1,
        });
      });

    const bestFrameworks = Array.from(frameworkStats.entries())
      .map(([framework, stats]) => ({
        framework,
        avgEngagement: stats.total / stats.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5);

    // Best triggers
    const triggerStats = new Map<string, { total: number; count: number }>();
    performanceData
      .filter((p) => p.triggers && p.engagement_rate !== null)
      .forEach((p) => {
        p.triggers.forEach((trigger: string) => {
          const current = triggerStats.get(trigger) || { total: 0, count: 0 };
          triggerStats.set(trigger, {
            total: current.total + p.engagement_rate,
            count: current.count + 1,
          });
        });
      });

    const bestTriggers = Array.from(triggerStats.entries())
      .map(([trigger, stats]) => ({
        trigger,
        avgEngagement: stats.total / stats.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5);

    return {
      avgEngagementRate,
      bestFrameworks,
      bestTriggers,
      totalPosts,
      publishedPosts,
    };
  } catch (error) {
    console.error('Error getting insights:', error);
    return {
      avgEngagementRate: 0,
      bestFrameworks: [],
      bestTriggers: [],
      totalPosts: 0,
      publishedPosts: 0,
    };
  }
}

// Check if RAG system is configured
export function isRagConfigured(): boolean {
  return !!(supabase && openai);
}
