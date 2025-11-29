import React, { useState } from 'react';
import { Copy, CheckCircle, XCircle, AlertCircle, RefreshCw, Save, TrendingUp, Download } from 'lucide-react';
import { rewriteToFixWeaknesses } from '../services/eliteCopy';
import { savePost, savePostPerformance, isRagConfigured } from '../services/ragService';
import type { CopyVariation, CopyQualityRating } from '../services/eliteCopy';

interface Props {
  content: {
    variations?: CopyVariation[];
    hashtags?: string[];
    storyText?: string;
    landingPage?: {
      headline: string;
      subheadline: string;
      heroCopy: string;
      features: string[];
      benefits: string[];
      socialProof: string;
      cta: string;
      rating: CopyQualityRating;
    };
    email?: {
      subjectLines: string[];
      previewText: string;
      body: string;
      cta: string;
      rating: CopyQualityRating;
    };
    websiteCopy?: {
      headline: string;
      subheadline: string;
      bodyCopy: string[];
      cta: string;
      rating: CopyQualityRating;
    };
  };
  agentType: string;
}

export default function VariationDisplay({ content, agentType }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rewritingIndex, setRewritingIndex] = useState<number | null>(null);
  const [variations, setVariations] = useState(content.variations || []);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedPostForMetrics, setSelectedPostForMetrics] = useState<{
    index: number;
    postId: string;
  } | null>(null);
  const [performanceData, setPerformanceData] = useState({
    likes: 0,
    comments: 0,
    shares: 0,
    reach: 0,
  });

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      // Try to fetch with no-cors mode
      const response = await fetch(imageUrl, { mode: 'cors' });

      if (!response.ok) {
        throw new Error('Fetch failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-copy-studio-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download via fetch failed, trying alternative method:', error);
      // Fallback: Open in new tab for manual download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `ai-copy-studio-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRewrite = async (index: number, originalCopy: string, rating: CopyQualityRating) => {
    if (rating.weaknesses.length === 0) {
      alert('No weaknesses to fix! This copy is already excellent.');
      return;
    }

    setRewritingIndex(index);

    try {
      // Extract topic and audience from agentType (you might need to pass these as props)
      const { improvedCopy, rating: newRating } = await rewriteToFixWeaknesses(
        originalCopy,
        rating,
        agentType === 'linkedin' ? 'LinkedIn' : agentType === 'instagram' ? 'Instagram' : 'Facebook',
        'Copy improvement', // You might want to pass the original topic
        'Target audience' // You might want to pass the original audience
      );

      // Update the specific variation with improved copy
      const updatedVariations = [...variations];
      updatedVariations[index] = {
        ...updatedVariations[index],
        content: improvedCopy,
        rating: newRating
      };
      setVariations(updatedVariations);

    } catch (error) {
      console.error('Rewrite failed:', error);
      alert('Failed to rewrite. Please try again.');
    } finally {
      setRewritingIndex(null);
    }
  };

  const handleSavePost = async (index: number, variation: CopyVariation) => {
    if (!isRagConfigured()) {
      alert('RAG system not configured. Please set up Supabase and OpenAI API keys in .env.local');
      return;
    }

    setSavingIndex(index);

    try {
      const postId = await savePost(
        variation.content,
        'Generated Post', // You might want to pass the original topic as a prop
        'Target Audience', // You might want to pass the original audience as a prop
        agentType,
        variation.framework,
        variation.rating.overallScore,
        variation.triggers,
        variation.imageUrl
      );

      if (postId) {
        alert('Post saved successfully! 🎉\n\nYou can now add performance metrics after publishing.');
        // Store the post ID for later performance tracking
        setSelectedPostForMetrics({ index, postId });
      } else {
        alert('Failed to save post. Please check console for errors.');
      }
    } catch (error) {
      console.error('Save post failed:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setSavingIndex(null);
    }
  };

  const handleAddPerformance = async () => {
    if (!selectedPostForMetrics) return;

    try {
      const success = await savePostPerformance(
        selectedPostForMetrics.postId,
        performanceData.likes,
        performanceData.comments,
        performanceData.shares,
        performanceData.reach
      );

      if (success) {
        alert('Performance metrics saved! 📊\n\nThe system will learn from this data.');
        setShowPerformanceModal(false);
        setPerformanceData({ likes: 0, comments: 0, shares: 0, reach: 0 });
      } else {
        alert('Failed to save metrics. Please check console for errors.');
      }
    } catch (error) {
      console.error('Save performance failed:', error);
      alert('Failed to save metrics. Please try again.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.5) return 'text-green-400';
    if (score >= 9.2) return 'text-blue-400';
    if (score >= 9.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation === 'PUBLISH') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (recommendation === 'NEEDS WORK') return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const renderRating = (rating: CopyQualityRating, index: number) => (
    <div className="bg-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getRecommendationIcon(rating.recommendation)}
          <span className="font-bold text-lg">Quality Score</span>
        </div>
        <span className={`text-3xl font-bold ${getScoreColor(rating.overallScore)}`}>
          {rating.overallScore.toFixed(1)}/10
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Clarity: <span className="font-bold">{rating.clarityScore}/10</span></div>
        <div>Emotional: <span className="font-bold">{rating.emotionalResonance}/10</span></div>
        <div>Conversion: <span className="font-bold">{rating.conversionPotential}/10</span></div>
        <div>Platform: <span className="font-bold">{rating.platformOptimization}/10</span></div>
        <div>Hook: <span className="font-bold">{rating.hookStrength}/10</span></div>
        <div>CTA: <span className="font-bold">{rating.ctaPower}/10</span></div>
      </div>

      {rating.strengths.length > 0 && (
        <div>
          <div className="text-green-400 font-semibold mb-1">Strengths:</div>
          <ul className="list-disc list-inside text-sm text-gray-300">
            {rating.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {rating.weaknesses.length > 0 && (
        <div>
          <div className="text-orange-400 font-semibold mb-1">Weaknesses:</div>
          <ul className="list-disc list-inside text-sm text-gray-300">
            {rating.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {rating.psychologicalTriggers.length > 0 && (
        <div>
          <div className="text-purple-400 font-semibold mb-1">Triggers Used:</div>
          <div className="flex flex-wrap gap-2">
            {rating.psychologicalTriggers.map((t, i) => (
              <span key={i} className="bg-purple-900 text-purple-300 px-2 py-1 rounded text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Social Media Variations (LinkedIn, Instagram, Facebook)
  if (variations && variations.length > 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mb-6">
          Generated {agentType.charAt(0).toUpperCase() + agentType.slice(1)} Posts
          <span className="ml-3 text-sm text-gray-400">
            ({variations.length} variations)
          </span>
        </h2>

        {/* Shared Image (displayed once for all variations) */}
        {variations.length > 0 && variations[0].imageUrl && (
          <div className="mb-6 bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-gray-300">AI-Generated Image</div>
              <button
                onClick={() => downloadImage(variations[0].imageUrl!, 0)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
            </div>
            <img
              src={variations[0].imageUrl}
              alt="AI-generated post image"
              className="w-full rounded-lg shadow-lg"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
            <p className="text-xs text-yellow-400 mt-3">
              ⚠️ Image URLs expire in 1 hour. Download now to save permanently!
            </p>
            <p className="text-xs text-gray-400 mt-1">
              💡 This image is shared across all variations below. Use with any caption!
            </p>
          </div>
        )}

        {variations.map((variation, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                Variation {index + 1}: {variation.framework}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRewrite(index, variation.content, variation.rating)}
                  disabled={rewritingIndex === index || variation.rating.weaknesses.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    variation.rating.weaknesses.length === 0
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : rewritingIndex === index
                      ? 'bg-orange-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                  title={variation.rating.weaknesses.length === 0 ? 'No weaknesses to fix!' : 'Rewrite to fix weaknesses'}
                >
                  {rewritingIndex === index ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Fix Weaknesses
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleSavePost(index, variation)}
                  disabled={savingIndex === index}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    savingIndex === index
                      ? 'bg-green-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  title="Save to RAG system for learning"
                >
                  {savingIndex === index ? (
                    <>
                      <Save className="w-4 h-4 animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Post
                    </>
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(variation.content, index)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 mb-4 whitespace-pre-wrap font-mono text-sm">
              {variation.content}
            </div>

            {variation.triggers && variation.triggers.length > 0 && (
              <div className="mb-4">
                <span className="text-purple-400 font-semibold">Framework Triggers: </span>
                <span className="text-gray-300">{variation.triggers.join(', ')}</span>
              </div>
            )}

            {renderRating(variation.rating, index)}

            {/* Add Performance Metrics Button (shows after saving) */}
            {selectedPostForMetrics?.index === index && (
              <div className="mt-4">
                <button
                  onClick={() => setShowPerformanceModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  Add Performance Metrics (Likes, Comments, Shares)
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Hashtags for Instagram */}
        {content.hashtags && content.hashtags.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Optimized Hashtags</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                {content.hashtags.join(' ')}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(content.hashtags!.join(' '), 999)}
              className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Hashtags
            </button>
          </div>
        )}

        {/* Story Text for Instagram */}
        {content.storyText && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Story Overlay Text</h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-pink-400 font-bold text-lg">{content.storyText}</p>
            </div>
          </div>
        )}

        {/* Performance Tracking Modal */}
        {showPerformanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Track Post Performance</h3>
              <p className="text-gray-400 mb-6">
                Add engagement metrics to help the system learn what works best for your audience.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Likes</label>
                  <input
                    type="number"
                    value={performanceData.likes}
                    onChange={(e) => setPerformanceData({ ...performanceData, likes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Comments</label>
                  <input
                    type="number"
                    value={performanceData.comments}
                    onChange={(e) => setPerformanceData({ ...performanceData, comments: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Shares</label>
                  <input
                    type="number"
                    value={performanceData.shares}
                    onChange={(e) => setPerformanceData({ ...performanceData, shares: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Reach / Impressions</label>
                  <input
                    type="number"
                    value={performanceData.reach}
                    onChange={(e) => setPerformanceData({ ...performanceData, reach: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {performanceData.reach > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Engagement Rate</div>
                    <div className="text-2xl font-bold text-green-400">
                      {(((performanceData.likes + performanceData.comments + performanceData.shares) / performanceData.reach) * 100).toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddPerformance}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Save Metrics
                </button>
                <button
                  onClick={() => {
                    setShowPerformanceModal(false);
                    setPerformanceData({ likes: 0, comments: 0, shares: 0, reach: 0 });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Landing Page
  if (content.landingPage) {
    const lp = content.landingPage;
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mb-6">Generated Landing Page Copy</h2>

        <div className="bg-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Headline</label>
            <div className="text-3xl font-bold text-green-400 mt-2">{lp.headline}</div>
            <button
              onClick={() => copyToClipboard(lp.headline, 0)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Copy headline
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Subheadline</label>
            <div className="text-xl text-gray-300 mt-2">{lp.subheadline}</div>
            <button
              onClick={() => copyToClipboard(lp.subheadline, 1)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Copy subheadline
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Hero Copy</label>
            <div className="text-gray-300 mt-2 leading-relaxed">{lp.heroCopy}</div>
            <button
              onClick={() => copyToClipboard(lp.heroCopy, 2)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Copy hero copy
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Features & Benefits</label>
            <ul className="mt-2 space-y-2">
              {lp.features.map((feature, i) => (
                <li key={i} className="bg-gray-700 p-3 rounded text-gray-300">{feature}</li>
              ))}
            </ul>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Social Proof</label>
            <div className="text-gray-300 mt-2 italic">{lp.socialProof}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Call-to-Action</label>
            <div className="text-xl font-bold text-orange-400 mt-2">{lp.cta}</div>
          </div>

          {renderRating(lp.rating, 0)}
        </div>
      </div>
    );
  }

  // Email Campaign
  if (content.email) {
    const email = content.email;
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mb-6">Generated Email Campaign</h2>

        <div className="bg-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">
              Subject Lines (A/B Test Options)
            </label>
            <div className="mt-2 space-y-2">
              {email.subjectLines.map((subject, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                  <span className="text-orange-400 font-semibold">{subject}</span>
                  <button
                    onClick={() => copyToClipboard(subject, i)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Preview Text</label>
            <div className="text-gray-300 mt-2">{email.previewText}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Email Body</label>
            <div className="bg-gray-900 rounded-lg p-6 mt-2 whitespace-pre-wrap leading-relaxed text-gray-300">
              {email.body}
            </div>
            <button
              onClick={() => copyToClipboard(email.body, 99)}
              className="mt-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              <Copy className="w-4 h-4" />
              Copy Email Body
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Call-to-Action</label>
            <div className="text-xl font-bold text-orange-400 mt-2">{email.cta}</div>
          </div>

          {renderRating(email.rating, 0)}
        </div>
      </div>
    );
  }

  // Website Copy
  if (content.websiteCopy) {
    const web = content.websiteCopy;
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mb-6">Generated Website Copy</h2>

        <div className="bg-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Headline</label>
            <div className="text-3xl font-bold text-purple-400 mt-2">{web.headline}</div>
            <button
              onClick={() => copyToClipboard(web.headline, 0)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Copy headline
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Subheadline</label>
            <div className="text-xl text-gray-300 mt-2">{web.subheadline}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Body Copy</label>
            <div className="mt-2 space-y-4">
              {web.bodyCopy.map((paragraph, i) => (
                <p key={i} className="text-gray-300 leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <button
              onClick={() => copyToClipboard(web.bodyCopy.join('\n\n'), 1)}
              className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              <Copy className="w-4 h-4" />
              Copy All Body Copy
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wide">Call-to-Action</label>
            <div className="text-xl font-bold text-orange-400 mt-2">{web.cta}</div>
          </div>

          {renderRating(web.rating, 0)}
        </div>
      </div>
    );
  }

  return <div>No content to display</div>;
}
