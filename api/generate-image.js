// Vercel Serverless Function - DALL-E 3 Image Generation
// Keeps OpenAI API key secure server-side

import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postContent, topic, referenceImage } = req.body;

    if (!postContent || !topic) {
      return res.status(400).json({ error: 'Missing required fields: postContent, topic' });
    }

    const claudeApiKey = process.env.CLAUDE_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!claudeApiKey || !openaiApiKey) {
      return res.status(500).json({ error: 'API keys not configured' });
    }

    const anthropic = new Anthropic({ apiKey: claudeApiKey });

    // Step 1: If reference image provided, analyze it with Claude Vision
    let styleDescription = "";
    if (referenceImage) {
      console.log('🖼️  Analyzing reference image for style extraction...');

      const visionPrompt = `Analyze this brand logo/image and extract key visual style elements that should influence AI-generated images.

Focus on:
- Color palette (specific colors)
- Visual style (modern, minimalist, gradient, geometric, etc.)
- Mood/tone (professional, vibrant, bold, soft, etc.)
- Design patterns (flowing, angular, organic, structured, etc.)

Output ONLY a brief style description (1 sentence) that can be added to an image generation prompt.

Example: "vibrant gradient color palette with teal, orange, and pink hues, modern flowing design, professional yet energetic aesthetic"`;

      const visionMessage = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 150,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: referenceImage.split(';')[0].split(':')[1],
                data: referenceImage.split(',')[1],
              },
            },
            {
              type: "text",
              text: visionPrompt
            }
          ],
        }],
      });

      styleDescription = visionMessage.content[0].type === 'text'
        ? visionMessage.content[0].text.trim()
        : "";

      if (styleDescription) {
        console.log('🎨 Extracted brand style:', styleDescription);
      }
    }

    // Step 2: Generate image prompt based on post content
    const conceptPrompt = `Analyze this LinkedIn post and create a professional image prompt for DALL-E 3.

**LinkedIn Post:**
${postContent}

**Topic:** ${topic}

${styleDescription ? `**Brand Color Palette:** ${styleDescription}` : ''}

**CRITICAL Style Requirements:**
- **MUST be photorealistic** - looks like professional documentary photography, NOT illustrations or abstract art
- Style: High-quality professional photography, realistic lighting, authentic settings
- Show real-world professional environments (offices, meetings, community spaces, etc.)
- People should be shown from behind, side angles, or in groups to avoid direct face focus
- Warm, authentic, human-centered scenes
- ${styleDescription ? 'Incorporate the brand color palette subtly through environment/lighting' : 'Natural, professional color palette'}

**Content Requirements:**
- Extract key themes from the post (helping families, professional services, community impact, etc.)
- LinkedIn-appropriate professional imagery
- Avoid: Text in image, illustrated/cartoon style, abstract art, logos, cluttered designs
- Focus: Real people in authentic professional/community settings

**Output:**
Provide ONLY the photorealistic image generation prompt (2-3 sentences), no explanations.

Example: "Professional documentary-style photograph of diverse team members collaborating around a conference table with laptops and documents, natural office lighting, warm atmosphere, shot from slightly elevated angle showing teamwork and focused productivity, modern professional office setting, authentic and realistic"`;

    const conceptMessage = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 300,
      messages: [{ role: "user", content: conceptPrompt }],
    });

    let imagePrompt = conceptMessage.content[0].type === 'text'
      ? conceptMessage.content[0].text.trim()
      : "Professional LinkedIn banner image, clean and modern design";

    // Ensure prompt isn't too long (DALL-E 3 has 1000 char limit)
    if (imagePrompt.length > 1000) {
      imagePrompt = imagePrompt.substring(0, 997) + '...';
    }

    console.log('🎨 DALL-E 3 prompt:', imagePrompt);

    // Step 3: Generate image with DALL-E 3
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1792x1024", // 16:9 aspect ratio (perfect for LinkedIn)
        quality: "hd",
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ DALL-E 3 error:', errorData);
      return res.status(500).json({ error: `DALL-E 3 error: ${errorData.error?.message}` });
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (imageUrl) {
      console.log('✅ Image generated successfully!');
      return res.status(200).json({ imageUrl, prompt: imagePrompt });
    } else {
      console.error('❌ No image URL in response');
      return res.status(500).json({ error: 'No image URL in response' });
    }

  } catch (error) {
    console.error('❌ Image generation failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
