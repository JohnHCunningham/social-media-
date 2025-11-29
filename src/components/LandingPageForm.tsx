import React, { useState } from 'react';
import { generateLandingPage } from '../services/eliteCopy';

interface Props {
  onGenerate: (content: any) => void;
  setIsGenerating: (value: boolean) => void;
}

export default function LandingPageForm({ onGenerate, setIsGenerating }: Props) {
  const [formData, setFormData] = useState({
    product: '',
    targetAudience: '',
    uniqueValue: '',
    framework: 'AIDA' as 'AIDA' | 'PAS' | 'BAB'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const landingPage = await generateLandingPage(
        formData.product,
        formData.targetAudience,
        formData.uniqueValue,
        formData.framework
      );

      onGenerate({ landingPage });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate copy. Check console for details.');
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-green-400">Landing Page Copy Generator</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product/Service</label>
          <input
            type="text"
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            placeholder="e.g., AI-powered maintenance automation platform"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g., Executive Directors managing 200+ units"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unique Value Proposition</label>
          <textarea
            value={formData.uniqueValue}
            onChange={(e) => setFormData({ ...formData, uniqueValue: e.target.value })}
            placeholder="e.g., Only AI platform built specifically for mixed-income housing with RGI compliance"
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Copywriting Framework</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, framework: 'AIDA' })}
              className={`px-4 py-3 rounded-lg transition-colors ${
                formData.framework === 'AIDA'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-bold">AIDA</div>
              <div className="text-xs">Attention, Interest, Desire, Action</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, framework: 'PAS' })}
              className={`px-4 py-3 rounded-lg transition-colors ${
                formData.framework === 'PAS'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-bold">PAS</div>
              <div className="text-xs">Problem, Agitate, Solution</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, framework: 'BAB' })}
              className={`px-4 py-3 rounded-lg transition-colors ${
                formData.framework === 'BAB'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-bold">BAB</div>
              <div className="text-xs">Before, After, Bridge</div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Generate Elite Landing Page (9.2+)
        </button>
      </div>
    </form>
  );
}
