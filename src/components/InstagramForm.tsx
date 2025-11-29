import React, { useState } from 'react';
import { generateInstagramCaption } from '../services/eliteCopy';

interface Props {
  onGenerate: (content: any) => void;
  setIsGenerating: (value: boolean) => void;
}

export default function InstagramForm({ onGenerate, setIsGenerating }: Props) {
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    keywords: '',
    targetAudience: '',
    goal: '',
    contentType: 'feed' as 'feed' | 'reel' | 'story',
    tone: 'authentic and engaging'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const result = await generateInstagramCaption(
        formData.topic,
        formData.targetAudience,
        formData.goal,
        formData.contentType,
        formData.tone,
        formData.description,
        formData.keywords
      );

      onGenerate({
        variations: result.captions,
        hashtags: result.hashtags,
        storyText: result.storyText
      });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate copy. Check console for details.');
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-xl">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Instagram Caption Generator
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Topic</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., AI tools for property managers"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Brief Description
            <span className="text-gray-400 text-xs ml-2">(What happened? Key details?)</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Our AI reduced response time from 3 days to 3 hours. Tenants love it!"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 min-h-[100px]"
            rows={4}
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 More context = better captions! Include specific results or story details.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Keywords (Optional)
            <span className="text-gray-400 text-xs ml-2">(Comma-separated)</span>
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="e.g., AI, PropTech, automation, efficiency"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            These keywords will be woven into your caption and used as hashtags.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g., Property managers and housing directors"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Goal</label>
          <input
            type="text"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            placeholder="e.g., Drive engagement and bio link clicks"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, contentType: 'feed' })}
              className={`px-4 py-3 rounded-lg transition-colors ${
                formData.contentType === 'feed'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Feed Post
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, contentType: 'reel' })}
              className={`px-4 py-3 rounded-lg transition-colors ${
                formData.contentType === 'reel'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Reel
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, contentType: 'story' })}
              className={`px-4 py-3 rounded-lg transition-colors ${
                formData.contentType === 'story'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Story
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="authentic and engaging">Authentic and Engaging</option>
            <option value="fun and playful">Fun and Playful</option>
            <option value="inspirational">Inspirational</option>
            <option value="educational">Educational</option>
            <option value="behind-the-scenes">Behind-the-Scenes</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Generate Elite Instagram Content (9.2+)
        </button>
      </div>
    </form>
  );
}
