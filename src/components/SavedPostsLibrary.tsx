import React, { useState, useEffect } from 'react';
import { TrendingUp, Trash2, ExternalLink, Calendar, Target, Award, Edit, Save, X } from 'lucide-react';
import { isRagConfigured } from '../services/ragService';
import { createClient } from '@supabase/supabase-js';

interface SavedPost {
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
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  engagement_rate?: number;
}

export default function SavedPostsLibrary() {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [editingMetrics, setEditingMetrics] = useState<string | null>(null);
  const [metricsForm, setMetricsForm] = useState({
    likes: 0,
    comments: 0,
    shares: 0,
    reach: 0
  });

  useEffect(() => {
    loadPosts();
  }, [filter, platformFilter]);

  const loadPosts = async () => {
    if (!isRagConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseKey);

      let query = supabase
        .from('posts_with_performance')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'published') {
        query = query.eq('published', true);
      } else if (filter === 'unpublished') {
        query = query.eq('published', false);
      }

      if (platformFilter !== 'all') {
        query = query.eq('platform', platformFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from('posts').delete().eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
        return;
      }

      // Refresh the list
      loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const startEditingMetrics = (post: SavedPost) => {
    setEditingMetrics(post.id);
    setMetricsForm({
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      reach: post.reach || 0
    });
  };

  const cancelEditingMetrics = () => {
    setEditingMetrics(null);
    setMetricsForm({ likes: 0, comments: 0, shares: 0, reach: 0 });
  };

  const saveMetrics = async (postId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Calculate engagement rate: (likes + comments + shares) / reach * 100
      const totalEngagement = metricsForm.likes + metricsForm.comments + metricsForm.shares;
      const engagementRate = metricsForm.reach > 0
        ? (totalEngagement / metricsForm.reach) * 100
        : 0;

      const { error } = await supabase
        .from('posts')
        .update({
          likes: metricsForm.likes,
          comments: metricsForm.comments,
          shares: metricsForm.shares,
          reach: metricsForm.reach,
          engagement_rate: engagementRate,
          published: true // Mark as published when adding metrics
        })
        .eq('id', postId);

      if (error) {
        console.error('Error updating metrics:', error);
        alert('Failed to save metrics');
        return;
      }

      console.log('✅ Metrics saved successfully!');
      console.log(`  Engagement Rate: ${engagementRate.toFixed(2)}%`);

      // Refresh the list
      setEditingMetrics(null);
      loadPosts();
    } catch (error) {
      console.error('Failed to save metrics:', error);
      alert('Failed to save metrics');
    }
  };

  if (!isRagConfigured()) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">RAG System Not Configured</h2>
          <p className="text-gray-300 mb-4">
            The Saved Posts Library requires the RAG system to be configured with Supabase.
          </p>
          <p className="text-gray-400 text-sm">
            Please check <code className="bg-gray-800 px-2 py-1 rounded">RAG-SETUP.md</code> for setup instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Saved Posts Library</h1>
        <p className="text-gray-400">
          View and manage your saved posts with performance metrics
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'published' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter('unpublished')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unpublished' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Drafts
          </button>
        </div>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Platforms</option>
          <option value="linkedin">LinkedIn</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <p className="text-xl text-gray-400 mb-2">No posts found</p>
          <p className="text-gray-500">
            Generate and save some posts to build your library!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-600 px-3 py-1 rounded text-sm font-semibold">
                      {post.platform}
                    </span>
                    {post.framework && (
                      <span className="bg-purple-600 px-3 py-1 rounded text-sm">
                        {post.framework}
                      </span>
                    )}
                    {post.published ? (
                      <span className="bg-green-600 px-3 py-1 rounded text-sm flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="bg-gray-600 px-3 py-1 rounded text-sm">Draft</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    {post.quality_score && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Quality: {post.quality_score.toFixed(1)}/10
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deletePost(post.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Delete post"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {post.image_url && (
                <div className="mb-4">
                  <img
                    src={post.image_url}
                    alt="Post image"
                    className="w-full rounded-lg shadow-lg max-h-64 object-cover"
                  />
                </div>
              )}

              <div className="bg-gray-900 rounded-lg p-4 mb-4 whitespace-pre-wrap text-sm">
                {post.content.length > 300
                  ? post.content.substring(0, 300) + '...'
                  : post.content}
              </div>

              {post.triggers && post.triggers.length > 0 && (
                <div className="mb-4">
                  <span className="text-purple-400 text-sm font-semibold">Triggers: </span>
                  <span className="text-gray-400 text-sm">{post.triggers.join(', ')}</span>
                </div>
              )}

              {/* Performance Metrics */}
              {editingMetrics === post.id ? (
                // EDITING MODE - Show input form
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold">Edit Performance Metrics</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveMetrics(post.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEditingMetrics}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Likes</label>
                      <input
                        type="number"
                        min="0"
                        value={metricsForm.likes}
                        onChange={(e) => setMetricsForm({ ...metricsForm, likes: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Comments</label>
                      <input
                        type="number"
                        min="0"
                        value={metricsForm.comments}
                        onChange={(e) => setMetricsForm({ ...metricsForm, comments: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Shares</label>
                      <input
                        type="number"
                        min="0"
                        value={metricsForm.shares}
                        onChange={(e) => setMetricsForm({ ...metricsForm, shares: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Reach</label>
                      <input
                        type="number"
                        min="0"
                        value={metricsForm.reach}
                        onChange={(e) => setMetricsForm({ ...metricsForm, reach: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    💡 Engagement rate will be calculated automatically: (Likes + Comments + Shares) / Reach × 100
                  </p>
                </div>
              ) : post.engagement_rate !== null && post.engagement_rate !== undefined ? (
                // VIEW MODE - Has metrics
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="font-semibold">Performance Metrics</span>
                    </div>
                    <button
                      onClick={() => startEditingMetrics(post)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Likes</div>
                      <div className="text-xl font-bold">{post.likes || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Comments</div>
                      <div className="text-xl font-bold">{post.comments || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Shares</div>
                      <div className="text-xl font-bold">{post.shares || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Reach</div>
                      <div className="text-xl font-bold">{post.reach || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Engagement Rate</div>
                      <div className="text-xl font-bold text-green-400">
                        {post.engagement_rate?.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // NO METRICS YET - Show "Add Metrics" button
                <div className="bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg p-4">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 mb-3">
                      Track performance to help the RAG system learn what works
                    </p>
                    <button
                      onClick={() => startEditingMetrics(post)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors mx-auto"
                    >
                      <Edit className="w-4 h-4" />
                      Add Performance Metrics
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
