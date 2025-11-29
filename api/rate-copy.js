// Vercel Serverless Function - Copy Quality Rating
// Keeps Claude API key secure server-side

import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, platform, topic, targetAudience } = req.body;

    if (!content || !platform) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const claudeApiKey = process.env.CLAUDE_API_KEY;

    if (!claudeApiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

    const anthropic = new Anthropic({ apiKey: claudeApiKey });

    const ratingPrompt = `Rate this ${platform} copy on a scale of 1-10 for each metric.

**Copy:**
${content}

**Context:**
- Topic: ${topic || 'N/A'}
- Audience: ${targetAudience || 'N/A'}

**Rate these metrics (1-10):**
1. Clarity - Is the message crystal clear?
2. Emotional Resonance - Does it connect emotionally?
3. Conversion Potential - Will it drive action?
4. Platform Optimization - Perfect for ${platform}?
5. Hook Strength - Grabs attention instantly?
6. CTA Power - Clear, compelling call-to-action?

**CRITICAL:** Only give 9.2+ overall if this is truly elite (top 1%)

Return as JSON:
{
  "overallScore": 9.5,
  "clarityScore": 10,
  "emotionalResonance": 9,
  "conversionPotential": 9.5,
  "platformOptimization": 10,
  "hookStrength": 9,
  "ctaPower": 9.5,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "improvements": ["suggestion 1"]
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: ratingPrompt }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse rating' });
    }

    const rating = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ rating });

  } catch (error) {
    console.error('❌ Rating failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
