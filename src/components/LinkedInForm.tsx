import React, { useState } from 'react';
import { generateLinkedInPost } from '../services/eliteCopy';

interface Props {
  onGenerate: (content: any) => void;
  setIsGenerating: (value: boolean) => void;
}

export default function LinkedInForm({ onGenerate, setIsGenerating }: Props) {
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    keywords: '',
    targetAudience: '',
    goal: '',
    tone: 'authoritative but empathetic',
    triggers: ['loss_aversion', 'social_proof', 'authority']
  });
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WEBP image');
      return;
    }

    // Validate file size (max 30MB)
    if (file.size > 30 * 1024 * 1024) {
      alert('Image must be less than 30MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const variations = await generateLinkedInPost(
        formData.topic,
        formData.targetAudience,
        formData.goal,
        formData.tone,
        formData.triggers,
        referenceImage, // Pass reference image to generator
        formData.description, // Brief description for better context
        formData.keywords // Keywords for SEO and consistency
      );

      onGenerate({ variations });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate copy. Check console for details.');
      setIsGenerating(false);
    }
  };

  const triggerOptions = [
    { value: 'loss_aversion', label: 'Loss Aversion' },
    { value: 'social_proof', label: 'Social Proof' },
    { value: 'authority', label: 'Authority' },
    { value: 'scarcity', label: 'Scarcity' },
    { value: 'reciprocity', label: 'Reciprocity' },
    { value: 'consistency', label: 'Consistency' },
    { value: 'liking', label: 'Liking' },
    { value: 'unity', label: 'Unity' }
  ];

  const toggleTrigger = (trigger: string) => {
    if (formData.triggers.includes(trigger)) {
      setFormData({
        ...formData,
        triggers: formData.triggers.filter(t => t !== trigger)
      });
    } else {
      setFormData({
        ...formData,
        triggers: [...formData.triggers, trigger]
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-blue-400">LinkedIn Post Generator</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Topic</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., AI automation for housing management"
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
            placeholder="e.g., Our AI system reduced tenant complaints by 60% in just 3 months by automating maintenance requests and improving response times. Tenants can now submit issues via text, and our system routes them instantly."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px]"
            rows={4}
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 More context = better copy! Include specific results, numbers, or story details.
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
            placeholder="e.g., AI, property management, automation, tenant satisfaction, efficiency"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            These keywords will be naturally woven into your copy for SEO and brand consistency.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g., Executive Directors of mixed-income housing"
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
            placeholder="e.g., Drive discovery call bookings"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="authoritative but empathetic">Authoritative but Empathetic</option>
            <option value="casual and friendly">Casual and Friendly</option>
            <option value="inspiring and motivational">Inspiring and Motivational</option>
            <option value="educational and informative">Educational and Informative</option>
            <option value="provocative and bold">Provocative and Bold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Psychological Triggers (select 2-4)</label>
          <div className="grid grid-cols-2 gap-3">
            {triggerOptions.map((trigger) => (
              <button
                key={trigger.value}
                type="button"
                onClick={() => toggleTrigger(trigger.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  formData.triggers.includes(trigger.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {trigger.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Reference Image (Optional) - Pro Feature
          </label>
          <p className="text-sm text-gray-400 mb-3">
            Upload your logo or brand image to influence the generated image style
          </p>
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              id="reference-image"
            />
            <label
              htmlFor="reference-image"
              className="flex items-center justify-center w-full px-4 py-3 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              {imageFileName ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm">{imageFileName}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setReferenceImage(null);
                      setImageFileName('');
                    }}
                    className="ml-2 text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-400">
                  Click to upload image (JPEG, PNG, WEBP - Max 30MB)
                </span>
              )}
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Generate Elite LinkedIn Posts (9.2+)
        </button>
      </div>
    </form>
  );
}
