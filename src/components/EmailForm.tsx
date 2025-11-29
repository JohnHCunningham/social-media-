import React, { useState } from 'react';
import { generateEmailCampaign } from '../services/eliteCopy';

interface Props {
  onGenerate: (content: any) => void;
  setIsGenerating: (value: boolean) => void;
}

export default function EmailForm({ onGenerate, setIsGenerating }: Props) {
  const [formData, setFormData] = useState({
    campaignType: 'welcome' as 'welcome' | 'nurture' | 'promotional' | 'announcement',
    product: '',
    targetAudience: '',
    goal: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const email = await generateEmailCampaign(
        formData.campaignType,
        formData.product,
        formData.targetAudience,
        formData.goal
      );

      onGenerate({ email });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate copy. Check console for details.');
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-orange-400">Email Campaign Generator</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Campaign Type</label>
          <div className="grid grid-cols-2 gap-3">
            {(['welcome', 'nurture', 'promotional', 'announcement'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, campaignType: type })}
                className={`px-4 py-3 rounded-lg transition-colors capitalize ${
                  formData.campaignType === type
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product/Service</label>
          <input
            type="text"
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            placeholder="e.g., AI Advantage Solutions platform"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g., Housing directors who signed up for demo"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Goal</label>
          <input
            type="text"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            placeholder="e.g., Book a discovery call"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Generate Elite Email Campaign (9.2+)
        </button>
      </div>
    </form>
  );
}
