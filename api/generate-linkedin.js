// Vercel Serverless Function - LinkedIn Copy Generation
// Keeps Claude API key secure server-side

import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, targetAudience, goal, tone, triggers } = req.body;

    if (!topic || !targetAudience || !goal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const claudeApiKey = process.env.CLAUDE_API_KEY;

    if (!claudeApiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

    const anthropic = new Anthropic({ apiKey: claudeApiKey });

    // Build the prompt
    const prompt = `Generate 3-5 elite LinkedIn posts about ${topic} for ${targetAudience}.

**GOAL:** ${goal}
**TONE:** ${tone || 'authoritative but empathetic'}
**PSYCHOLOGICAL TRIGGERS:** ${(triggers || []).join(', ')}

**FORMAT REQUIREMENTS:**
- Use bro-etry formatting (short, punchy lines)
- Hook in first line
- Story or insight in middle
- Clear CTA at end
- NO emojis unless they truly add value
- Professional but conversational

**QUALITY STANDARD:** Each post must be 9.2+ quality (top 1%)

Return as JSON array:
[
  {
    "content": "full post text",
    "framework": "framework used (e.g., PAS, AIDA, Storytelling)",
    "hook": "first line hook",
    "cta": "call to action",
    "triggers": ["trigger1", "trigger2"]
  }
]`;

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse response' });
    }

    const variations = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ variations });

  } catch (error) {
    console.error('❌ LinkedIn generation failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
