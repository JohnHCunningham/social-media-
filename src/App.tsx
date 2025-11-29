import React, { useState } from 'react';
import { Sparkles, Linkedin, Instagram, Facebook, FileText, Mail, Globe, BookOpen, Home } from 'lucide-react';
import LinkedInForm from './components/LinkedInForm';
import InstagramForm from './components/InstagramForm';
import FacebookForm from './components/FacebookForm';
import LandingPageForm from './components/LandingPageForm';
import EmailForm from './components/EmailForm';
import WebsiteForm from './components/WebsiteForm';
import VariationDisplay from './components/VariationDisplay';
import SavedPostsLibrary from './components/SavedPostsLibrary';
import type { CopyVariation, CopyQualityRating } from './services/eliteCopy';

type AgentType = 'linkedin' | 'instagram' | 'facebook' | 'landing-page' | 'email' | 'website';

interface GeneratedContent {
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
}

function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'generate' | 'library'>('generate');

  const agents = [
    {
      id: 'linkedin' as AgentType,
      name: 'LinkedIn',
      icon: Linkedin,
      description: 'Elite LinkedIn posts with bro-etry formatting',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'instagram' as AgentType,
      name: 'Instagram',
      icon: Instagram,
      description: 'Captions, hashtags, and story text',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
    },
    {
      id: 'facebook' as AgentType,
      name: 'Facebook',
      icon: Facebook,
      description: 'Conversational posts and ads',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'landing-page' as AgentType,
      name: 'Landing Page',
      icon: FileText,
      description: 'High-converting page copy',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'email' as AgentType,
      name: 'Email',
      icon: Mail,
      description: 'Subject lines, body, and CTAs',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'website' as AgentType,
      name: 'Website',
      icon: Globe,
      description: 'Homepage, about, services, pricing',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const handleGenerate = (content: GeneratedContent) => {
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const handleBack = () => {
    setSelectedAgent(null);
    setGeneratedContent(null);
  };

  const handleViewChange = (mode: 'generate' | 'library') => {
    setViewMode(mode);
    setSelectedAgent(null);
    setGeneratedContent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              AI Advantage Copy Studio
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-2">Elite Copywriting Platform</p>
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold text-sm mb-6">
            9.2+ Quality Standard (Top 1%)
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => handleViewChange('generate')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                viewMode === 'generate'
                  ? 'bg-blue-600 shadow-lg scale-105'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Home className="w-5 h-5" />
              Generate Copy
            </button>
            <button
              onClick={() => handleViewChange('library')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                viewMode === 'library'
                  ? 'bg-blue-600 shadow-lg scale-105'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Saved Posts Library
            </button>
          </div>
        </header>

        {/* Saved Posts Library View */}
        {viewMode === 'library' && <SavedPostsLibrary />}

        {/* Agent Selection */}
        {viewMode === 'generate' && !selectedAgent && !generatedContent && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Select Your Copywriting Agent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`${agent.color} p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 text-left`}
                  >
                    <Icon className="w-10 h-10 mb-4" />
                    <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                    <p className="text-white/80">{agent.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Forms */}
        {viewMode === 'generate' && selectedAgent && !generatedContent && (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleBack}
              className="mb-6 text-gray-300 hover:text-white transition-colors"
            >
              ← Back to agents
            </button>

            {selectedAgent === 'linkedin' && (
              <LinkedInForm onGenerate={handleGenerate} setIsGenerating={setIsGenerating} />
            )}
            {selectedAgent === 'instagram' && (
              <InstagramForm onGenerate={handleGenerate} setIsGenerating={setIsGenerating} />
            )}
            {selectedAgent === 'facebook' && (
              <FacebookForm onGenerate={handleGenerate} setIsGenerating={setIsGenerating} />
            )}
            {selectedAgent === 'landing-page' && (
              <LandingPageForm onGenerate={handleGenerate} setIsGenerating={setIsGenerating} />
            )}
            {selectedAgent === 'email' && (
              <EmailForm onGenerate={handleGenerate} setIsGenerating={setIsGenerating} />
            )}
            {selectedAgent === 'website' && (
              <WebsiteForm onGenerate={handleGenerate} setIsGenerating={setIsGenerating} />
            )}

            {isGenerating && (
              <div className="mt-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                <p className="mt-4 text-gray-300">Generating elite copy with 9.2+ quality...</p>
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {viewMode === 'generate' && generatedContent && (
          <div className="max-w-6xl mx-auto">
            <button
              onClick={handleBack}
              className="mb-6 text-gray-300 hover:text-white transition-colors"
            >
              ← Generate new copy
            </button>

            <VariationDisplay
              content={generatedContent}
              agentType={selectedAgent!}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
