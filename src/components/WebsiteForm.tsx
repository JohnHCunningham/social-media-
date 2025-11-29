import React, { useState } from 'react';
import { generateWebsiteCopy } from '../services/eliteCopy';

interface Props {
  onGenerate: (content: any) => void;
  setIsGenerating: (value: boolean) => void;
}

export default function WebsiteForm({ onGenerate, setIsGenerating }: Props) {
  const [formData, setFormData] = useState({
    section: 'homepage' as 'homepage' | 'about' | 'services' | 'pricing' | 'contact',
    business: '',
    targetAudience: '',
    uniqueValue: '',
    tone: 'professional yet approachable'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const websiteCopy = await generateWebsiteCopy(
        formData.section,
        formData.business,
        formData.targetAudience,
        formData.uniqueValue,
        formData.tone
      );

      onGenerate({ websiteCopy });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate copy. Check console for details.');
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-purple-400">Website Copy Generator</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Website Section</label>
          <div className="grid grid-cols-3 gap-3">
            {(['homepage', 'about', 'services', 'pricing', 'contact'] as const).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setFormData({ ...formData, section })}
                className={`px-4 py-3 rounded-lg transition-colors capitalize ${
                  formData.section === section
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Business/Product</label>
          <input
            type="text"
            value={formData.business}
            onChange={(e) => setFormData({ ...formData, business: e.target.value })}
            placeholder="e.g., AI Advantage Solutions"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g., Housing executives and property managers"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unique Value</label>
          <textarea
            value={formData.uniqueValue}
            onChange={(e) => setFormData({ ...formData, uniqueValue: e.target.value })}
            placeholder="e.g., Only AI platform built for mixed-income housing compliance"
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="professional yet approachable">Professional yet Approachable</option>
            <option value="authoritative">Authoritative</option>
            <option value="friendly and casual">Friendly and Casual</option>
            <option value="innovative and bold">Innovative and Bold</option>
            <option value="trustworthy and reliable">Trustworthy and Reliable</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Generate Elite Website Copy (9.2+)
        </button>
      </div>
    </form>
  );
}
