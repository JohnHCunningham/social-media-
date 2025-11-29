import React, { useState } from 'react';
import { generateFacebookPost } from '../services/eliteCopy';

interface Props {
  onGenerate: (content: any) => void;
  setIsGenerating: (value: boolean) => void;
}

export default function FacebookForm({ onGenerate, setIsGenerating }: Props) {
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    keywords: '',
    targetAudience: '',
    goal: '',
    postType: 'organic' as 'organic' | 'ad',
    tone: 'conversational and relatable'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const variations = await generateFacebookPost(
        formData.topic,
        formData.targetAudience,
        formData.goal,
        formData.postType,
        formData.tone,
        formData.description,
        formData.keywords
      );

      onGenerate({ variations });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate copy. Check console for details.');
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-blue-400">Facebook Post Generator</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Topic</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., Maintenance automation success story"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
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
            placeholder="e.g., We cut maintenance response time by 60% with automation. Residents are happier than ever!"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px]"
            rows={4}
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 More context = better posts! Include specific results or story details.
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
            placeholder="e.g., maintenance, automation, tenant satisfaction"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            These keywords will be woven naturally into your Facebook post.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g., Property managers and housing professionals"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Goal</label>
          <input
            type="text"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            placeholder="e.g., Drive comments and shares"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Post Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, postType: 'organic' })}
              className={`px-4 py-3 rounded-lg transition-colors ${
                formData.postType === 'organic'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Organic Post
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, postType: 'ad' })}
              className={`px-4 py-3 rounded-lg transition-colors ${
                formData.postType === 'ad'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Ad Copy
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="conversational and relatable">Conversational and Relatable</option>
            <option value="friendly and helpful">Friendly and Helpful</option>
            <option value="storytelling">Storytelling</option>
            <option value="informative">Informative</option>
            <option value="emotional">Emotional</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Generate Elite Facebook Posts (9.2+)
        </button>
      </div>
    </form>
  );
}
