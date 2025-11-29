import Anthropic from "@anthropic-ai/sdk";
import { findSimilarPosts, getTopPerformingPosts, isRagConfigured } from './ragService';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true // ⚠️ ONLY safe for local use - DO NOT deploy publicly!
});

// OpenAI DALL-E 3 Image Generation
export const generateLinkedInImage = async (
  postContent: string,
  topic: string,
  referenceImage: string | null = null
): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey.includes('your_') || apiKey.length < 20) {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    // Step 1: If reference image provided, analyze it with Claude Vision to extract style
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
                media_type: referenceImage.split(';')[0].split(':')[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
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
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1792x1024", // 16:9 aspect ratio (perfect for LinkedIn)
        quality: "hd", // High quality
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ DALL-E 3 error:', errorData);
      throw new Error(`DALL-E 3 error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (imageUrl) {
      console.log('✅ Image generated successfully!');
      console.log('🖼️  Image URL:', imageUrl);
      return imageUrl;
    } else {
      console.error('❌ No image URL in response:', data);
      return null;
    }

  } catch (error) {
    console.error('❌ Image generation failed:', error);
    return null;
  }
};

// INSTAGRAM IMAGE GENERATOR
export const generateInstagramImage = async (
  postContent: string,
  topic: string,
  referenceImage: string | null = null
): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey.includes('your_') || apiKey.length < 20) {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    // Step 1: Brand style extraction (same as LinkedIn)
    let styleDescription = "";
    if (referenceImage) {
      console.log('🖼️  Analyzing reference image for Instagram style...');

      const visionPrompt = `Analyze this brand logo/image and extract key visual style elements for Instagram-style imagery.

Focus on:
- Color palette (specific colors)
- Visual vibe (modern, minimalist, bold, playful, etc.)
- Mood/tone (vibrant, authentic, energetic, calm, etc.)
- Design patterns (geometric, organic, flowing, etc.)

Output ONLY a brief style description (1 sentence).

Example: "vibrant gradient colors with teal and pink hues, modern playful aesthetic, energetic and authentic vibe"`;

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
                media_type: referenceImage.split(';')[0].split(':')[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
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
        console.log('🎨 Extracted Instagram style:', styleDescription);
      }
    }

    // Step 2: Generate Instagram-specific image prompt
    const conceptPrompt = `Analyze this Instagram caption and create a vibrant image prompt for DALL-E 3.

**Instagram Caption:**
${postContent}

**Topic:** ${topic}

${styleDescription ? `**Brand Style:** ${styleDescription}` : ''}

**CRITICAL Style Requirements:**
- **Instagram-worthy aesthetic** - vibrant, eye-catching, scroll-stopping
- Style: Lifestyle photography, authentic moments, visually appealing
- Show real people in authentic settings (coffee shops, coworking spaces, homes, outdoors)
- People shown from behind, side angles, or in natural candid moments
- Bright, warm, inviting atmosphere
- Natural lighting or golden hour vibes
- ${styleDescription ? 'Incorporate brand colors subtly through props/environment' : 'Vibrant, natural color palette'}

**Content Requirements:**
- Extract key themes from the caption (lifestyle, success, community, inspiration, etc.)
- Instagram-appropriate lifestyle imagery
- Avoid: Text in image, corporate/stuffy vibes, overly posed photos
- Focus: Real people in aspirational yet authentic moments

**Output:**
Provide ONLY the Instagram-style image generation prompt (2-3 sentences), no explanations.

Example: "Lifestyle photograph of young professional working on laptop at modern coffee shop with plants and natural light streaming through large windows, shot from behind showing workspace with coffee cup and notebook, warm golden hour lighting, authentic and aspirational Instagram aesthetic, vibrant yet natural colors"`;

    const conceptMessage = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 300,
      messages: [{ role: "user", content: conceptPrompt }],
    });

    let imagePrompt = conceptMessage.content[0].type === 'text'
      ? conceptMessage.content[0].text.trim()
      : "Vibrant Instagram lifestyle image, modern and authentic";

    if (imagePrompt.length > 1000) {
      imagePrompt = imagePrompt.substring(0, 997) + '...';
    }

    console.log('🎨 DALL-E 3 Instagram prompt:', imagePrompt);

    // Step 3: Generate square image (1:1 ratio for Instagram)
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1024x1024", // Square ratio (perfect for Instagram feed)
        quality: "hd",
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ DALL-E 3 Instagram error:', errorData);
      throw new Error(`DALL-E 3 error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (imageUrl) {
      console.log('✅ Instagram image generated!');
      console.log('🖼️  Image URL:', imageUrl);
      return imageUrl;
    } else {
      console.error('❌ No image URL in response:', data);
      return null;
    }

  } catch (error) {
    console.error('❌ Instagram image generation failed:', error);
    return null;
  }
};

// FACEBOOK IMAGE GENERATOR
export const generateFacebookImage = async (
  postContent: string,
  topic: string,
  referenceImage: string | null = null
): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey.includes('your_') || apiKey.length < 20) {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    // Step 1: Brand style extraction
    let styleDescription = "";
    if (referenceImage) {
      console.log('🖼️  Analyzing reference image for Facebook style...');

      const visionPrompt = `Analyze this brand logo/image and extract key visual style elements for Facebook imagery.

Focus on:
- Color palette (specific colors)
- Visual approach (friendly, professional, community-focused, etc.)
- Mood/tone (welcoming, authentic, relatable, etc.)

Output ONLY a brief style description (1 sentence).

Example: "warm friendly colors with blue and orange tones, approachable professional style, community-focused aesthetic"`;

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
                media_type: referenceImage.split(';')[0].split(':')[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
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
        console.log('🎨 Extracted Facebook style:', styleDescription);
      }
    }

    // Step 2: Generate Facebook-specific image prompt
    const conceptPrompt = `Analyze this Facebook post and create a relatable image prompt for DALL-E 3.

**Facebook Post:**
${postContent}

**Topic:** ${topic}

${styleDescription ? `**Brand Style:** ${styleDescription}` : ''}

**CRITICAL Style Requirements:**
- **Community-focused aesthetic** - relatable, warm, human-centered
- Style: Documentary-style photography, authentic everyday moments
- Show real people in community/family settings (homes, community centers, local businesses, neighborhoods)
- People shown naturally, candid moments, group interactions
- Warm, inviting, approachable atmosphere
- Natural lighting, authentic settings
- ${styleDescription ? 'Incorporate brand colors through environment/setting' : 'Warm, natural color palette'}

**Content Requirements:**
- Extract key themes (community, family, success stories, everyday life, etc.)
- Facebook-appropriate relatable imagery
- Avoid: Corporate/stiff imagery, overly polished photos, staged moments
- Focus: Real people in authentic community/family moments

**Output:**
Provide ONLY the Facebook-style image generation prompt (2-3 sentences), no explanations.

Example: "Documentary-style photograph of diverse community members gathering at local community center, warm natural lighting through windows, people engaged in friendly conversation and collaboration, authentic candid moment showing connection and community spirit, relatable and welcoming atmosphere"`;

    const conceptMessage = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 300,
      messages: [{ role: "user", content: conceptPrompt }],
    });

    let imagePrompt = conceptMessage.content[0].type === 'text'
      ? conceptMessage.content[0].text.trim()
      : "Community-focused Facebook image, warm and relatable";

    if (imagePrompt.length > 1000) {
      imagePrompt = imagePrompt.substring(0, 997) + '...';
    }

    console.log('🎨 DALL-E 3 Facebook prompt:', imagePrompt);

    // Step 3: Generate landscape image (works well for Facebook)
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1792x1024", // 16:9 landscape (works well for Facebook)
        quality: "hd",
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ DALL-E 3 Facebook error:', errorData);
      throw new Error(`DALL-E 3 error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (imageUrl) {
      console.log('✅ Facebook image generated!');
      console.log('🖼️  Image URL:', imageUrl);
      return imageUrl;
    } else {
      console.error('❌ No image URL in response:', data);
      return null;
    }

  } catch (error) {
    console.error('❌ Facebook image generation failed:', error);
    return null;
  }
};

// Quality Rating Interface (9.2+ REQUIRED)
export interface CopyQualityRating {
  overallScore: number; // Must be 9.2+ to pass
  clarityScore: number; // 1-10
  emotionalResonance: number; // 1-10
  conversionPotential: number; // 1-10
  platformOptimization: number; // 1-10
  hookStrength: number; // 1-10
  ctaPower: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  psychologicalTriggers: string[];
  recommendation: "PUBLISH" | "NEEDS WORK" | "REJECT";
}

export interface CopyVariation {
  content: string;
  framework: string;
  triggers: string[];
  rating: CopyQualityRating;
  imageUrl?: string; // Optional AI-generated image
}

// ELITE LINKEDIN POST GENERATOR
export const generateLinkedInPost = async (
  topic: string,
  targetAudience: string,
  goal: string,
  tone: string = "authoritative but empathetic",
  triggers: string[] = ["loss_aversion", "social_proof", "authority"],
  referenceImage: string | null = null, // Optional reference image for Pro features
  description: string = "", // Brief description for more context
  keywords: string = "" // Keywords for SEO and brand consistency
): Promise<CopyVariation[]> => {

  // RAG Integration: Query similar high-performing posts
  let ragExamples = "";
  if (isRagConfigured()) {
    try {
      // Get top performing LinkedIn posts
      const topPosts = await getTopPerformingPosts('linkedin', 3);

      if (topPosts.length > 0) {
        ragExamples = `\n\n**HIGH-PERFORMING POSTS FROM YOUR HISTORY:**\n\nThese posts performed exceptionally well with YOUR audience. Study their approach:\n\n`;

        topPosts.forEach((post, index) => {
          ragExamples += `\n---\n**Example ${index + 1}** (${post.engagement_rate?.toFixed(2)}% engagement, ${post.framework})\n`;
          ragExamples += `${post.content}\n`;
          ragExamples += `**Performance:** ${post.likes} likes, ${post.comments} comments, ${post.shares} shares (${post.reach} reach)\n`;
        });

        ragExamples += `\n---\n\n**Use these examples as inspiration for tone, structure, and style that works for YOUR specific audience.**\n`;
      }
    } catch (error) {
      console.log('RAG query failed, continuing without examples:', error);
    }
  }

  const systemPrompt = `You are an ELITE LinkedIn thought leader and storyteller specializing in value-first content.

**Your Standards:**
- MINIMUM quality: 9.2/10 (top 1% of all copywriters)
- VALUE FIRST, selling never
- Build authority through expertise, not promotion
- Every post teaches, inspires, or challenges

**Your Expertise:**
- 15+ years building executive brands on LinkedIn
- Master of storytelling and thought leadership
- Deep understanding of professional audience psychology
- Authentic voice that builds trust and authority

**LinkedIn Thought Leadership:**
- "Bro-etry" formatting (short paragraphs, 1-2 sentences)
- First line: Insight, story, or compelling question (NOT fear-mongering)
- Share real experiences, case studies, lessons learned
- Give away your best insights freely
- CTAs invite conversation, not sales

**VALUE-FIRST CONTENT FORMULA:**
1. **Hook (First Line):** Insight, surprising fact, or story opening (NOT "Are you struggling with...")
2. **Story/Example:** Real scenario, client story (anonymized), or personal experience
3. **Insight/Lesson:** What you learned, actionable takeaway
4. **Discussion CTA:** Ask their experience, invite perspectives (NOT "Book a call" or "Comment AUDIT")

**CRITICAL RULES:**
- 250-400 words (substantive, not superficial)
- Lead with value/insight, NEVER with a pitch
- Tell a story with specific details (numbers, quotes, situations)
- 1-2 strategic emojis MAX (professional tone)
- End with 3-5 relevant hashtags
- Soft CTA: "What's been your experience?" or "How are you handling this?"
- NO sales language: No "book," "audit," "claim your spot," "limited time"

**Psychological Trigger Mastery (Applied Subtly):**
${getTriggerExplanations(triggers)}

**QUALITY BARS (All must hit 9+/10):**
- Clarity: Message instantly understood
- Emotional Resonance: Relatable, inspiring, or thought-provoking
- Authority Building: Positions author as expert who helps
- Platform Optimization: Native LinkedIn thought leadership
- Hook Strength: Stops scrolling with insight, not fear
- Value Delivery: Reader gains actionable takeaway`;

  // Debug logging
  console.log('📝 LinkedIn Post Generation Request:');
  console.log('  Topic:', topic);
  console.log('  Description:', description || '(none)');
  console.log('  Keywords:', keywords || '(none)');
  if (keywords) {
    const hashtagsFromKeywords = keywords.split(',').map(k => '#' + k.trim().replace(/\s+/g, '')).join(' ');
    console.log('  Auto-generated hashtags:', hashtagsFromKeywords);
  }
  console.log('  Target Audience:', targetAudience);
  console.log('  Goal:', goal);

  const userPrompt = `Create 3 elite VALUE-FIRST LinkedIn posts (each 9.2+/10 quality).

**Topic:** ${topic}${description ? `\n**Story/Context:** ${description}` : ''}${keywords ? `\n**REQUIRED KEYWORDS (Must appear naturally in the copy):** ${keywords}` : ''}
**Target Audience:** ${targetAudience}
**Goal:** ${goal} (BUT focus on helping/educating, NOT selling)
**Tone:** ${tone}
**Psychological Triggers to Layer Subtly:** ${triggers.join(', ')}${ragExamples}

**Requirements:**
${keywords ? `
0. **KEYWORD INTEGRATION (CRITICAL):**
   - You MUST naturally incorporate these keywords into the post: ${keywords}
   - Weave them into the narrative organically
   - DO NOT force them - make them feel natural
   - Use them in context of the story/insight you're sharing
` : ''}

1. **HOOK (First Line - 15-20 words):**
   - Share an insight, surprising fact, or story opening
   - NO fear-mongering ("Are you struggling with...?")
   - Examples: "Last week, a client asked me...", "Here's what 10 years in [industry] taught me...", "The biggest misconception about [topic]..."
   - Make reader curious, not anxious

2. **STORY/EXAMPLE (100-150 words):**
   - Real scenario, anonymized client story, or personal experience
   - Specific details: numbers, quotes, situations
   - Show, don't tell
   - Build credibility through experience

3. **INSIGHT/LESSON (80-120 words):**
   - What you learned from this experience
   - Actionable takeaway readers can use
   - Challenge conventional thinking OR provide framework
   - Give away your best thinking (value-first)

4. **DISCUSSION CTA + HASHTAGS:**
   - Soft question: "What's your experience with [topic]?" or "How are you handling this?"
   - NO sales CTAs ("book a call", "claim your spot", "comment AUDIT")
   - Include 3-5 relevant hashtags:
     ${keywords ? `* MUST include these as hashtags: ${keywords.split(',').map(k => '#' + k.trim().replace(/\s+/g, '')).join(' ')}` : ''}
     * Add 1-2 related industry hashtags to reach 3-5 total
     * Mix broad reach + niche relevance
     * Example format: #AI #Automation #PropertyManagement #PropTech

**Total Length:** 250-400 words
**Emojis:** 1-2 maximum, strategic placement
**Formatting:** Bro-etry (short paragraphs, 1-2 sentences)

**Content Philosophy:**
- NEVER pitch a product/service
- Share freely to build authority
- Help first, relationship second, business third
- Position as expert who teaches, not sells

**Output Format:**
For each of 3 variations:

VARIATION [#]: [Approach/Angle]

[The actual LinkedIn post - formatted exactly as it would appear, including hashtags at the end]

---
TRIGGERS USED: [list]
WHY THIS WORKS: [2-3 sentences explaining psychology]
WORD COUNT: [actual count]
---

Make each variation use a DIFFERENT story/angle/insight.
Each must be 9.2+/10 quality or don't include it.`;

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229", // Opus for elite quality
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : "";

  // Parse variations from response
  const variations = parseLinkedInVariations(responseText);

  // Rate each variation
  const ratedVariations = await Promise.all(
    variations.map(async (variation) => {
      const rating = await rateCopy(variation.content, "LinkedIn", topic, targetAudience);
      return { ...variation, rating };
    })
  );

  // Filter by quality score
  const filteredVariations = ratedVariations.filter(v => v.rating.overallScore >= 8.0);

  // Generate ONE image for the topic (shared across all variations)
  // This saves time and API costs - all posts about same topic use same image
  const sharedImageUrl = await generateLinkedInImage(
    filteredVariations[0]?.content || topic,
    topic,
    referenceImage // Pass reference image to influence style
  );

  // Apply the shared image to all variations
  const variationsWithImages = filteredVariations.map(variation => ({
    ...variation,
    imageUrl: sharedImageUrl
  }));

  return variationsWithImages;
};

// ELITE LANDING PAGE GENERATOR
export const generateLandingPage = async (
  product: string,
  targetAudience: string,
  uniqueValue: string,
  framework: "AIDA" | "PAS" | "BAB" = "AIDA"
): Promise<{
  headline: string;
  subheadline: string;
  heroCopy: string;
  features: string[];
  benefits: string[];
  socialProof: string;
  cta: string;
  rating: CopyQualityRating;
}> => {

  // RAG Integration: Query similar high-performing landing pages
  let ragExamples = "";
  if (isRagConfigured()) {
    try {
      const topPosts = await getTopPerformingPosts('landing-page', 3);

      if (topPosts.length > 0) {
        ragExamples = `\n\n**HIGH-CONVERTING LANDING PAGES FROM YOUR HISTORY:**\n\nThese landing pages performed exceptionally well:\n\n`;

        topPosts.forEach((post, index) => {
          ragExamples += `\n---\n**Example ${index + 1}** (${post.engagement_rate?.toFixed(2)}% conversion rate, ${post.framework})\n`;
          ragExamples += `${post.content}\n`;
          ragExamples += `**Performance:** Converted ${post.engagement_rate?.toFixed(2)}% of visitors\n`;
        });

        ragExamples += `\n---\n\n**Study these examples for headlines, value propositions, CTAs, and proof elements that convert for YOUR specific audience.**\n`;
      }
    } catch (error) {
      console.log('RAG query failed, continuing without examples:', error);
    }
  }

  const systemPrompt = `You are an ELITE landing page copywriter with a 9.2+/10 quality standard.

**Your Background:**
- Created landing pages with 15-40% conversion rates
- Mastered AIDA, PAS, BAB, PASTOR frameworks
- Deep expertise in conversion rate optimization (CRO)
- Studied legendary landing pages (Ogilvy, Halbert, Hopkins)

**Landing Page Psychology:**
- Above-the-fold clarity: 5-second rule (visitor knows what you offer in 5 seconds)
- Headline = Promise (specific benefit, not clever wordplay)
- Subheadline = Proof/Expansion (makes promise believable)
- Features tell, Benefits sell (always lead with benefits)
- Social proof creates trust (specific stats, not "many customers")
- CTA clarity > creativity (clear action, remove friction)

**Conversion Principles:**
- One clear goal per page (don't dilute focus)
- Speak to ONE person (not "businesses" but "the ED managing 200 units")
- Specific > Generic ("reduce maintenance calls by 40%" not "improve efficiency")
- Believable > Hype ("tested in 12 pilot programs" not "revolutionary")

**Quality Standards (Must ALL hit 9+/10):**
- Clarity: Instantly understood value proposition
- Emotional Resonance: Creates urgent desire
- Conversion Potential: Drives action (clicks, signups, calls)
- Trust Building: Credible, not salesy
- Benefit Focus: Clear "what's in it for me"`;

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Create elite landing page copy using ${framework} framework.

**Product/Service:** ${product}
**Target Audience:** ${targetAudience}
**Unique Value Proposition:** ${uniqueValue}${ragExamples}

**Required Sections:**

1. **HEADLINE** (5-10 words)
   - Clear benefit promise
   - Includes power word
   - NOT clever, IS clear
   - Makes visitor want to read subheadline

2. **SUBHEADLINE** (10-15 words)
   - Expands on promise
   - Adds credibility/proof
   - Specific (numbers, timeline, method)

3. **HERO COPY** (2-3 sentences)
   - Elaborates on promise
   - Addresses main pain point
   - Creates urgency/desire

4. **3 KEY FEATURES** (each with benefit translation)
   Format: "Feature: [What it is] → Benefit: [What it means for them]"

5. **SOCIAL PROOF** (1-2 sentences)
   - Specific stat or testimonial concept
   - Believable (not "10x ROI")
   - Builds trust

6. **CTA** (3-5 words + supporting text)
   - Clear action verb
   - Low friction
   - Creates urgency without pressure

Return as JSON with these exact keys:
{
  "headline": "...",
  "subheadline": "...",
  "heroCopy": "...",
  "features": ["Feature 1: ... → Benefit: ...", "Feature 2: ...", "Feature 3: ..."],
  "socialProof": "...",
  "cta": "...",
  "ctaSupporting": "..."
}

9.2+/10 quality REQUIRED.`
    }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : "{}";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const landingPageData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  // Rate the landing page
  const fullCopy = `${landingPageData.headline}\n\n${landingPageData.subheadline}\n\n${landingPageData.heroCopy}`;
  const rating = await rateCopy(fullCopy, "Landing Page", product, targetAudience);

  return {
    headline: landingPageData.headline || "",
    subheadline: landingPageData.subheadline || "",
    heroCopy: landingPageData.heroCopy || "",
    features: landingPageData.features || [],
    benefits: landingPageData.features || [], // Features already include benefits
    socialProof: landingPageData.socialProof || "",
    cta: landingPageData.cta || "",
    rating
  };
};

// ELITE EMAIL CAMPAIGN GENERATOR
export const generateEmailCampaign = async (
  campaignType: "welcome" | "nurture" | "promotional" | "announcement",
  product: string,
  targetAudience: string,
  goal: string
): Promise<{
  subjectLines: string[];
  previewText: string;
  body: string;
  cta: string;
  rating: CopyQualityRating;
}> => {

  // RAG Integration: Query similar high-performing email campaigns
  let ragExamples = "";
  if (isRagConfigured()) {
    try {
      const topPosts = await getTopPerformingPosts('email', 3);

      if (topPosts.length > 0) {
        ragExamples = `\n\n**HIGH-PERFORMING EMAIL CAMPAIGNS FROM YOUR HISTORY:**\n\nThese emails achieved exceptional open and click rates:\n\n`;

        topPosts.forEach((post, index) => {
          ragExamples += `\n---\n**Example ${index + 1}** (${post.engagement_rate?.toFixed(2)}% click rate, ${post.framework})\n`;
          ragExamples += `${post.content}\n`;
          ragExamples += `**Performance:** ${post.engagement_rate?.toFixed(2)}% click-through rate\n`;
        });

        ragExamples += `\n---\n\n**Study these for subject line patterns, body structure, and CTAs that drive clicks with YOUR specific audience.**\n`;
      }
    } catch (error) {
      console.log('RAG query failed, continuing without examples:', error);
    }
  }

  const systemPrompt = `You are an ELITE email copywriter with 9.2+/10 quality standards.

**Your Expertise:**
- 20+ years writing high-converting emails
- Open rates: 35-55% (vs industry avg 20%)
- Click-through rates: 8-15% (vs industry avg 2-3%)
- Mastered subject line psychology

**Email Psychology:**
- Subject line = 50% of success (Open or delete decision in 2 seconds)
- Preview text = Second chance (Works WITH subject, not against it)
- First sentence = Hook (Confirms subject line promise)
- Body = ONE idea (Multiple CTAs kill conversion)
- CTA = Clear action (Remove all friction)

**Subject Line Mastery:**
- Curiosity gaps (create need to know more)
- Specificity (numbers, timelines beat vague promises)
- Personalization (speak to their world)
- Urgency (without spam triggers)
- Under 50 characters (mobile optimization)

**AVOID (Spam Triggers):**
- ALL CAPS, excessive !!!, $$$
- "Free", "Act Now", "Limited Time" (unless genuinely true)
- Misleading promises
- Generic mass-mail language

**Quality Standards (All 9+/10):**
- Subject Line Strength: Opens email
- Preview Text Synergy: Works with subject
- Hook Power: First sentence delivers
- Clarity: Message instantly clear
- Conversion: Drives click/action`;

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{
      role: "user",
      content: `Create elite ${campaignType} email campaign.

**Product/Service:** ${product}
**Target Audience:** ${targetAudience}
**Goal:** ${goal}${ragExamples}

**Required Components:**

1. **5 SUBJECT LINE OPTIONS** (A/B test variations)
   - Mix of approaches: Curiosity, Benefit, Question, Urgency, Social Proof
   - Each under 50 characters
   - Each must score 9+/10 on open potential
   - NO spam triggers

2. **PREVIEW TEXT** (40-60 characters)
   - Complements subject (not repeats it)
   - Adds context or benefit
   - Creates desire to open

3. **EMAIL BODY** (150-250 words)
   - Hook (first sentence confirms subject promise)
   - Problem/agitation (empathy for their pain)
   - Solution (your offer as natural fix)
   - Social proof (brief, specific)
   - ONE clear CTA
   - Personal sign-off

4. **CTA**
   - Action verb
   - Specific outcome
   - Low friction

Return as JSON:
{
  "subjectLines": ["option1", "option2", "option3", "option4", "option5"],
  "previewText": "...",
  "body": "...",
  "cta": "..."
}

9.2+/10 quality REQUIRED.`
    }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : "{}";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const emailData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  // Rate the email
  const fullEmail = `${emailData.subjectLines?.[0]}\n\n${emailData.body}`;
  const rating = await rateCopy(fullEmail, "Email", product, targetAudience);

  return {
    subjectLines: emailData.subjectLines || [],
    previewText: emailData.previewText || "",
    body: emailData.body || "",
    cta: emailData.cta || "",
    rating
  };
};

// RUTHLESS QUALITY RATER (9.2+ Required)
const rateCopy = async (
  copy: string,
  platform: string,
  topic: string,
  audience: string
): Promise<CopyQualityRating> => {

  const prompt = `You are a RUTHLESS copy quality evaluator. Your standards are BRUTAL.

**Rating Scale:**
- 9.5-10.0: World-class, study this
- 9.2-9.4: Elite, publish immediately
- 9.0-9.1: Strong, minor tweaks
- 8.0-8.9: Good, but not elite (REJECT for this system)
- Below 8.0: Amateur (REJECT)

**Platform:** ${platform}
**Topic:** ${topic}
**Audience:** ${audience}

**COPY TO RATE:**
${copy}

**Rate on these dimensions (1-10 each):**

1. **Clarity (1-10):** Is the message crystal clear? Can a 12-year-old understand it?
2. **Emotional Resonance (1-10):** Does it create desire, urgency, or curiosity?
3. **Conversion Potential (1-10):** Will this drive the desired action?
4. **Platform Optimization (1-10):** Native to ${platform} best practices?
5. **Hook Strength (1-10):** Does opening stop scrolling/compel opening?
6. **CTA Power (1-10):** Clear, compelling, low-friction call-to-action?

**Identify:**
- Strengths (2-3 specific things that work)
- Weaknesses (2-3 specific improvements needed)
- Psychological Triggers Used (list them)

**Overall Score:** Average of all 6 dimensions

**Recommendation:**
- PUBLISH: 9.2+ overall
- NEEDS WORK: 9.0-9.1 overall
- REJECT: Below 9.0

**CRITICAL FAILURES (Auto-REJECT):**
- Unclear value proposition
- Generic/could apply to anyone
- Salesy/pushy tone
- Weak/missing CTA
- Clichés ("game-changer", "revolutionary", "cutting-edge")
- No emotional impact

Return JSON (no markdown):
{
  "overallScore": X.X,
  "clarityScore": X,
  "emotionalResonance": X,
  "conversionPotential": X,
  "platformOptimization": X,
  "hookStrength": X,
  "ctaPower": X,
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "psychologicalTriggers": ["...", "..."],
  "recommendation": "PUBLISH/NEEDS WORK/REJECT"
}

Be RUTHLESS. This is for a 9.2+ quality system.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229", // Using Opus for rating (same as generation)
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : "{}";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Rating failed", error);
  }

  // Return failure rating
  return {
    overallScore: 0,
    clarityScore: 0,
    emotionalResonance: 0,
    conversionPotential: 0,
    platformOptimization: 0,
    hookStrength: 0,
    ctaPower: 0,
    strengths: [],
    weaknesses: ["Rating system error"],
    psychologicalTriggers: [],
    recommendation: "REJECT"
  };
};

// ELITE INSTAGRAM CAPTION GENERATOR
export const generateInstagramCaption = async (
  topic: string,
  targetAudience: string,
  goal: string,
  contentType: "feed" | "reel" | "story" = "feed",
  tone: string = "authentic and engaging",
  description: string = "",
  keywords: string = ""
): Promise<{
  captions: CopyVariation[];
  hashtags: string[];
  storyText?: string;
}> => {

  // RAG Integration: Query similar high-performing Instagram posts
  let ragExamples = "";
  if (isRagConfigured()) {
    try {
      const topPosts = await getTopPerformingPosts('instagram', 3);

      if (topPosts.length > 0) {
        ragExamples = `\n\n**HIGH-PERFORMING INSTAGRAM POSTS FROM YOUR HISTORY:**\n\nThese captions performed exceptionally well with YOUR audience:\n\n`;

        topPosts.forEach((post, index) => {
          ragExamples += `\n---\n**Example ${index + 1}** (${post.engagement_rate?.toFixed(2)}% engagement, ${post.framework})\n`;
          ragExamples += `${post.content}\n`;
          ragExamples += `**Performance:** ${post.likes} likes, ${post.comments} comments, ${post.shares} shares (${post.reach} reach)\n`;
        });

        ragExamples += `\n---\n\n**Use these as inspiration for tone, style, and hooks that resonate with YOUR specific audience.**\n`;
      }
    } catch (error) {
      console.log('RAG query failed, continuing without examples:', error);
    }
  }

  const systemPrompt = `You are an ELITE Instagram copywriter with 9.2+/10 quality standards.

**Your Expertise:**
- 10+ years crafting viral Instagram content
- Deep understanding of Instagram algorithm (2024)
- Master of visual-text synergy
- Expert in hashtag strategy and discoverability

**Instagram Mastery:**
- First line = EVERYTHING (shows in feed preview, must hook)
- 125-150 words = sweet spot (engagement drops after 150)
- Emoji strategy: Enhance, don't distract (2-4 per caption)
- Line breaks: Create visual rhythm (not walls of text)
- Hashtags: Mix (3-5 mega, 5-10 mid, 10-15 niche = 20-30 total)
- CTA: Natural ask (comment, save, share, visit bio link)

**Feed vs Reel vs Story:**
- Feed: Longer captions work (up to 150 words), storytelling
- Reel: Shorter captions (50-100 words), punchy, trending audio reference
- Story: Ultra-short (15-30 words), urgency, swipe-up/link sticker CTA

**Hook Formula (First Line):**
- Curiosity: "The thing nobody tells you about [topic]..."
- Controversy: "Unpopular opinion: [statement]"
- Question: "Ever wonder why [relatable scenario]?"
- Stat: "87% of [audience] don't know this..."
- You-Statement: "You're probably making this mistake..."

**Hashtag Strategy:**
- Mega (1M+ posts): 3-5 for reach
- Mid (100K-1M): 5-10 for targeted reach
- Niche (10K-100K): 10-15 for engagement
- Branded: 1-2 your own tags
- Total: 20-30 (30 max allowed)
- Mix evergreen + trending

**Quality Standards (All 9+/10):**
- Hook Strength: First line stops scrolling
- Engagement Potential: Drives comments/saves/shares
- Authenticity: Doesn't feel like an ad
- Hashtag Optimization: Discoverability + relevance
- CTA Clarity: Natural, compelling ask`;

  const userPrompt = `Create 3 elite Instagram ${contentType} captions (each 9.2+/10 quality).

**Topic:** ${topic}${description ? `\n**Story/Context:** ${description}` : ''}${keywords ? `\n**REQUIRED KEYWORDS (Must appear naturally in the caption):** ${keywords}` : ''}
**Target Audience:** ${targetAudience}
**Goal:** ${goal}
**Tone:** ${tone}
**Content Type:** ${contentType}${ragExamples}

**Requirements:**
${keywords ? `
0. **KEYWORD INTEGRATION (CRITICAL):**
   - You MUST naturally incorporate these keywords into the caption: ${keywords}
   - Weave them into the story organically
   - DO NOT force them - make them feel natural and Instagram-native
   - Use them in context
` : ''}

1. **HOOK (First Line):**
   - Under 125 characters (feed preview cutoff)
   - Creates instant curiosity/desire/urgency
   - Works WITHOUT seeing the image
   - Makes user tap "...more"

2. **CAPTION BODY:**
   - ${contentType === 'feed' ? '125-150 words' : contentType === 'reel' ? '50-100 words' : '15-30 words'}
   - 2-4 strategic emojis (enhance, don't spam)
   - Line breaks for visual rhythm
   - Personal/relatable tone
   - Value-packed (teach, inspire, or entertain)

3. **CTA:**
   - Ask question (drives comments)
   - OR ask for save/share
   - OR direct to bio link
   - Natural, not pushy

4. **HASHTAGS (separate section):**
   - 20-30 highly relevant tags
   ${keywords ? `- MUST include these as hashtags: ${keywords.split(',').map(k => '#' + k.trim().replace(/\s+/g, '')).join(' ')}` : ''}
   - Add 15-25 additional relevant tags to reach 20-30 total
   - Mix mega/mid/niche
   - Relevant to ${topic} and ${targetAudience}
   - NO banned/spammy hashtags

${contentType === 'story' ? `
5. **STORY TEXT (overlay text):**
   - 5-8 words max
   - Bold statement or question
   - Works with swipe-up CTA
` : ''}

**Output Format:**
For each of 3 variations:

VARIATION [#]: [Framework/Approach]

[Caption text - formatted exactly as it would appear on Instagram]

---
TRIGGERS USED: [list]
WHY THIS WORKS: [2-3 sentences]
EXPECTED ENGAGEMENT: [Comments/Saves/Shares prediction]
---

Then separately:

HASHTAG STRATEGY (for all variations):
[30 hashtags organized by size: MEGA: ... | MID: ... | NICHE: ...]

${contentType === 'story' ? 'STORY TEXT OVERLAYS: [3 options for on-screen text]' : ''}

9.2+/10 quality REQUIRED.`;

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : "";

  // Parse variations and hashtags
  const variations = parseInstagramVariations(responseText);
  const hashtags = parseHashtags(responseText);
  const storyText = contentType === 'story' ? parseStoryText(responseText) : undefined;

  // Rate each variation
  const ratedVariations = await Promise.all(
    variations.map(async (variation) => {
      const rating = await rateCopy(variation.content, "Instagram", topic, targetAudience);
      return { ...variation, rating };
    })
  );

  // Filter by quality score
  const filteredVariations = ratedVariations.filter(v => v.rating.overallScore >= 9.2);

  // Generate ONE image for the topic (shared across all variations)
  const sharedImageUrl = await generateInstagramImage(
    filteredVariations[0]?.content || topic,
    topic
  );

  // Apply the shared image to all variations
  const variationsWithImages = filteredVariations.map(variation => ({
    ...variation,
    imageUrl: sharedImageUrl
  }));

  // Only return variations that score 9.2+
  return {
    captions: variationsWithImages,
    hashtags,
    storyText
  };
};

// ELITE FACEBOOK POST GENERATOR
export const generateFacebookPost = async (
  topic: string,
  targetAudience: string,
  goal: string,
  postType: "organic" | "ad" = "organic",
  tone: string = "conversational and relatable",
  description: string = "",
  keywords: string = ""
): Promise<CopyVariation[]> => {

  // RAG Integration: Query similar high-performing Facebook posts
  let ragExamples = "";
  if (isRagConfigured()) {
    try {
      const topPosts = await getTopPerformingPosts('facebook', 3);

      if (topPosts.length > 0) {
        ragExamples = `\n\n**HIGH-PERFORMING FACEBOOK POSTS FROM YOUR HISTORY:**\n\nThese posts performed exceptionally well with YOUR audience:\n\n`;

        topPosts.forEach((post, index) => {
          ragExamples += `\n---\n**Example ${index + 1}** (${post.engagement_rate?.toFixed(2)}% engagement, ${post.framework})\n`;
          ragExamples += `${post.content}\n`;
          ragExamples += `**Performance:** ${post.likes} likes, ${post.comments} comments, ${post.shares} shares (${post.reach} reach)\n`;
        });

        ragExamples += `\n---\n\n**Use these as inspiration for tone, style, and engagement tactics that work for YOUR specific audience.**\n`;
      }
    } catch (error) {
      console.log('RAG query failed, continuing without examples:', error);
    }
  }

  const systemPrompt = `You are an ELITE Facebook copywriter with 9.2+/10 quality standards.

**Your Expertise:**
- 15+ years writing viral Facebook content
- Deep understanding of Facebook algorithm (2024)
- Master of community engagement
- Expert in organic reach + paid ad copy

**Facebook Mastery:**
- Conversational tone WINS (like talking to friend, not broadcasting)
- 40-80 words = optimal (longer works if compelling story)
- First 2 lines = preview (must hook before "See more")
- Questions drive comments (algorithm loves engagement)
- Tagged friends/pages = expanded reach
- Video/link posts: Copy must work WITH visual, not repeat it

**Organic vs Ad Copy:**
- Organic: Community-focused, conversational, engagement-driven
- Ad: Benefit-focused, clear CTA, scarcity/urgency, specific offer

**Hook Strategies:**
- Story opening: "So this happened yesterday..."
- Question: "Quick question for y'all:"
- Controversial: "Hot take: [statement]"
- Relatable: "Anyone else [relatable struggle]?"
- Value: "Here's what I learned about [topic]"

**Engagement Drivers:**
- Ask questions (especially this/that choices)
- Tag friends ("Tag someone who needs this")
- Share request ("Share if you agree")
- Emoji reactions ("❤️ if yes, 😢 if no")
- Poll-style ("Comment A or B")

**Quality Standards (All 9+/10):**
- Conversational Tone: Feels like friend talking
- Hook Strength: First 2 lines stop scrolling
- Engagement Potential: Drives comments/shares/reactions
- Authenticity: Not salesy (unless it's an ad)
- Community Feel: Builds connection`;

  const userPrompt = `Create 3 elite Facebook ${postType} posts (each 9.2+/10 quality).

**Topic:** ${topic}${description ? `\n**Story/Context:** ${description}` : ''}${keywords ? `\n**REQUIRED KEYWORDS (Must appear naturally in the post):** ${keywords}` : ''}
**Target Audience:** ${targetAudience}
**Goal:** ${goal}
**Tone:** ${tone}
**Post Type:** ${postType}${ragExamples}

**Requirements:**
${keywords ? `
0. **KEYWORD INTEGRATION (CRITICAL):**
   - You MUST naturally incorporate these keywords into the post: ${keywords}
   - Weave them into the conversational flow organically
   - Make them feel natural - like you'd say them in real conversation
   - DO NOT force them
` : ''}

1. **HOOK (First 2 Lines):**
   - Shows in feed preview (before "See more")
   - Conversational opener
   - Creates curiosity or relatability
   - Makes user want to expand post

2. **BODY:**
   - ${postType === 'organic' ? '40-80 words (can go longer if story is compelling)' : '60-100 words'}
   - Conversational tone (like talking to friend)
   - ${postType === 'organic' ? 'Value/story/insight' : 'Clear benefit + specific offer'}
   - 2-3 emojis max (Facebook older demographic, less emoji-heavy)
   - Natural keyword integration

3. **CTA:**
   - ${postType === 'organic' ? 'Ask question or request engagement (comment/share/tag)' : 'Clear action + urgency (limited spots, deadline, bonus)'}
   - Low pressure, high value
   - Specific ask

4. **ENGAGEMENT TACTICS:**
   ${postType === 'organic' ? `
   - Question that drives comments
   - "Tag a friend who..." request
   - This/that choice
   - Share if you agree
   ` : `
   - Scarcity (limited time/spots)
   - Social proof (testimonial, stat)
   - Risk reversal (guarantee, trial)
   - Clear next step
   `}

**Output Format:**
For each of 3 variations:

VARIATION [#]: [Approach/Framework]

[Facebook post - formatted exactly as it would appear]

---
TRIGGERS USED: [list]
WHY THIS WORKS: [2-3 sentences]
EXPECTED ENGAGEMENT: [Reactions/Comments/Shares prediction]
---

9.2+/10 quality REQUIRED.`;

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : "";

  // Parse variations
  const variations = parseLinkedInVariations(responseText); // Reuse same parser

  // Rate each variation
  const ratedVariations = await Promise.all(
    variations.map(async (variation) => {
      const rating = await rateCopy(variation.content, "Facebook", topic, targetAudience);
      return { ...variation, rating };
    })
  );

  // Filter by quality score
  const filteredVariations = ratedVariations.filter(v => v.rating.overallScore >= 8.0);

  // Generate ONE image for the topic (shared across all variations)
  const sharedImageUrl = await generateFacebookImage(
    filteredVariations[0]?.content || topic,
    topic
  );

  // Apply the shared image to all variations
  const variationsWithImages = filteredVariations.map(variation => ({
    ...variation,
    imageUrl: sharedImageUrl
  }));

  // Only return variations that score 8.0+ (lowered for testing)
  return variationsWithImages;
};

// ELITE WEBSITE COPY GENERATOR
export const generateWebsiteCopy = async (
  section: "homepage" | "about" | "services" | "pricing" | "contact",
  business: string,
  targetAudience: string,
  uniqueValue: string,
  tone: string = "professional yet approachable"
): Promise<{
  headline: string;
  subheadline: string;
  bodyCopy: string[];
  cta: string;
  rating: CopyQualityRating;
}> => {

  // RAG Integration: Query similar high-performing website copy
  let ragExamples = "";
  if (isRagConfigured()) {
    try {
      const topPosts = await getTopPerformingPosts('website', 3);

      if (topPosts.length > 0) {
        ragExamples = `\n\n**HIGH-PERFORMING WEBSITE COPY FROM YOUR HISTORY:**\n\nThese website sections achieved exceptional conversion rates:\n\n`;

        topPosts.forEach((post, index) => {
          ragExamples += `\n---\n**Example ${index + 1}** (${post.engagement_rate?.toFixed(2)}% conversion rate, ${post.framework})\n`;
          ragExamples += `${post.content}\n`;
          ragExamples += `**Performance:** ${post.engagement_rate?.toFixed(2)}% conversion rate\n`;
        });

        ragExamples += `\n---\n\n**Study these for brand voice, value propositions, and copy structure that converts for YOUR specific audience.**\n`;
      }
    } catch (error) {
      console.log('RAG query failed, continuing without examples:', error);
    }
  }

  const systemPrompt = `You are an ELITE website copywriter with 9.2+/10 quality standards.

**Your Expertise:**
- 20+ years writing high-converting website copy
- Mastered information architecture + persuasion
- Expert in SEO + conversion optimization
- Studied legendary websites (Apple, Basecamp, Stripe)

**Website Copy Principles:**
- Clarity > Cleverness (visitor should know what you do in 5 seconds)
- Skim-friendly (headers, bullets, short paragraphs)
- Benefits before features (what's in it for them)
- Social proof throughout (build trust continuously)
- Clear navigation (remove friction at every step)

**Section-Specific Rules:**

**Homepage:**
- Headline: Clear value proposition (not tagline)
- Above fold: What you do + who it's for + why now
- Proof: Social proof in first screen
- 3-5 sections max (don't overwhelm)

**About:**
- Not about you, about THEM (why you're uniquely positioned to help them)
- Story arc: Problem you saw → Solution you built → Results you deliver
- Credibility: Experience, credentials, case studies
- Personal touch: Photo, values, mission

**Services:**
- Outcome-focused (not feature list)
- Each service: Problem → Solution → Benefit → Proof
- Pricing hints (or "from $X" to qualify leads)
- Clear next step

**Pricing:**
- Transparent (builds trust)
- 3 tiers (anchor pricing psychology)
- Feature comparison (makes choice easy)
- Address objections (FAQs, guarantees)

**Contact:**
- Remove friction (fewer form fields = more submissions)
- Set expectations (response time, next steps)
- Multiple options (form, email, phone, chat)
- Final value reminder (why reach out)

**Quality Standards (All 9+/10):**
- Clarity: Instantly understood
- Scanability: Easy to skim
- Persuasion: Builds desire to act
- Trust: Credible, not hype
- SEO: Natural keyword integration`;

  const userPrompt = `Create elite ${section} page copy (9.2+/10 quality).

**Business:** ${business}
**Target Audience:** ${targetAudience}
**Unique Value:** ${uniqueValue}
**Tone:** ${tone}${ragExamples}
**Section:** ${section}

**Requirements:**

1. **HEADLINE** (5-12 words)
   - Clear value proposition
   - Benefit-focused
   - ${section === 'homepage' ? 'Answers: What do you do + Who is it for' : 'Section purpose immediately clear'}

2. **SUBHEADLINE** (10-20 words)
   - Expands on headline
   - Adds specificity or proof
   - Creates desire to read more

3. **BODY COPY** (3-5 paragraphs)
   - ${section === 'homepage' ? 'Problem → Solution → How It Works → Social Proof → CTA' : ''}
   - ${section === 'about' ? 'Your Story → Why You Care → How You Help → Credibility → Values' : ''}
   - ${section === 'services' ? 'Service Overview → Key Benefits → How It Works → Who It\'s For → Results' : ''}
   - ${section === 'pricing' ? '3 Tier Structure → Feature Comparison → FAQ → Guarantee' : ''}
   - ${section === 'contact' ? 'Why Reach Out → What Happens Next → Multiple Contact Options' : ''}
   - Scannable (short paragraphs, bullets)
   - Benefit-focused
   - Social proof integrated

4. **CTA**
   - Clear action
   - Specific outcome
   - Low friction

Return as JSON:
{
  "headline": "...",
  "subheadline": "...",
  "bodyCopy": ["paragraph1", "paragraph2", "paragraph3"],
  "cta": "..."
}

9.2+/10 quality REQUIRED.`;

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : "{}";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const websiteData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  // Rate the copy
  const fullCopy = `${websiteData.headline}\n\n${websiteData.subheadline}\n\n${websiteData.bodyCopy?.join('\n\n')}`;
  const rating = await rateCopy(fullCopy, `Website ${section}`, business, targetAudience);

  return {
    headline: websiteData.headline || "",
    subheadline: websiteData.subheadline || "",
    bodyCopy: websiteData.bodyCopy || [],
    cta: websiteData.cta || "",
    rating
  };
};

// REWRITE FUNCTION - Fix weaknesses identified in rating
export const rewriteToFixWeaknesses = async (
  originalCopy: string,
  rating: CopyQualityRating,
  platform: string,
  topic: string,
  audience: string
): Promise<{
  improvedCopy: string;
  rating: CopyQualityRating;
}> => {

  const rewritePrompt = `You are an ELITE copywriting editor. You've been given a piece of ${platform} copy that was rated and has specific weaknesses to fix.

**ORIGINAL COPY:**
${originalCopy}

**CURRENT RATING:** ${rating.overallScore}/10

**WEAKNESSES TO FIX:**
${rating.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

**STRENGTHS TO MAINTAIN:**
${rating.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**YOUR TASK:**
Rewrite this copy to address EVERY weakness while maintaining the strengths. Your rewrite MUST score 9.2+/10.

**SPECIFIC FIXES REQUIRED:**
- If hook is weak → Create a stronger, more specific opening that creates immediate tension or curiosity
- If rhythm/flow is off → Improve sentence variety, remove bullet points if they interrupt flow, use prose
- If CTA is generic → Make it specific and actionable (ask about a concrete situation)
- If it's too salesy → Remove all sales language, focus on pure value/insight
- If it lacks specificity → Add concrete numbers, examples, quotes
- If it's too long/short → Adjust to optimal length for ${platform}

**CRITICAL:**
- Maintain the same topic: ${topic}
- Maintain the same audience: ${audience}
- Keep what's working (the strengths)
- Fix what's broken (the weaknesses)
- The rewrite should feel like a natural evolution, not a completely different post

**OUTPUT:**
Just provide the improved copy, formatted exactly as it should appear on ${platform}. No explanations, just the copy.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 2000,
      messages: [{ role: "user", content: rewritePrompt }],
    });

    const improvedCopy = message.content[0].type === 'text' ? message.content[0].text : originalCopy;

    // Rate the improved version
    const newRating = await rateCopy(improvedCopy, platform, topic, audience);

    return {
      improvedCopy: improvedCopy.trim(),
      rating: newRating
    };
  } catch (error) {
    console.error('Rewrite failed:', error);
    // Return original if rewrite fails
    return { improvedCopy: originalCopy, rating };
  }
};

// Helper Functions
function getTriggerExplanations(triggers: string[]): string {
  const explanations: Record<string, string> = {
    loss_aversion: "Loss Aversion: People fear loss 2x more than they value gain. Frame as what they'll LOSE by not acting.",
    social_proof: "Social Proof: People follow the crowd. Use specific stats, case studies, testimonials.",
    authority: "Authority: Establish expertise. Use credentials, years of experience, insider knowledge.",
    scarcity: "Scarcity: Limited availability creates urgency. Be specific (\"12 spots left\") not vague (\"limited time\").",
    reciprocity: "Reciprocity: Give value first. Share insight, offer help, teach something useful.",
    consistency: "Consistency: People want to be consistent with past actions. Reference their previous behavior.",
    liking: "Liking: We buy from people we like. Be relatable, share vulnerabilities, show personality.",
    unity: "Unity: Create \"us\" feeling. Shared identity, common enemy, insider language."
  };

  return triggers.map(t => explanations[t] || "").join("\n");
}

function parseLinkedInVariations(text: string): Omit<CopyVariation, 'rating'>[] {
  const variations: Omit<CopyVariation, 'rating'>[] = [];
  const variationRegex = /VARIATION\s+(\d+):\s+([^\n]+)\n\n([\s\S]+?)(?=\n---|\nVARIATION|\Z)/g;

  let match;
  while ((match = variationRegex.exec(text)) !== null) {
    const framework = match[2].trim();
    const content = match[3].split('---')[0].trim();
    const triggersMatch = match[3].match(/TRIGGERS USED:\s*([^\n]+)/);
    const triggers = triggersMatch ? triggersMatch[1].split(',').map(t => t.trim()) : [];

    variations.push({ content, framework, triggers });
  }

  return variations;
}

function parseInstagramVariations(text: string): Omit<CopyVariation, 'rating'>[] {
  // Instagram variations use same format as LinkedIn
  return parseLinkedInVariations(text);
}

function parseHashtags(text: string): string[] {
  const hashtagMatch = text.match(/HASHTAG STRATEGY[^\n]*:\s*([^\n]+(?:\n[^A-Z\n][^\n]*)*)/i);
  if (!hashtagMatch) return [];

  const hashtagText = hashtagMatch[1];
  const hashtags = hashtagText.match(/#[\w]+/g) || [];

  return hashtags.slice(0, 30); // Max 30 hashtags
}

function parseStoryText(text: string): string | undefined {
  const storyMatch = text.match(/STORY TEXT OVERLAYS?:\s*\[(.*?)\]/i);
  if (!storyMatch) return undefined;

  const options = storyMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
  return options[0]; // Return first option
}
