# AI Advantage Copy Studio

Elite copywriting platform with a **9.2+/10 quality standard** (top 1% of copywriters).

## Features

### 6 Specialized Elite Copywriting Agents

1. **LinkedIn Post Generator**
   - Bro-etry formatting (1-2 sentence paragraphs)
   - Pattern interrupt hooks
   - 3 elite variations per request
   - Psychological trigger layering
   - 150-300 word optimal length

2. **Instagram Caption Generator**
   - Feed, Reel, and Story options
   - 125-150 word sweet spot
   - Optimized hashtag strategy (20-30 tags: mega/mid/niche mix)
   - Story overlay text suggestions
   - First-line hooks for feed previews

3. **Facebook Post Generator**
   - Organic posts and ads
   - Conversational tone (40-80 words)
   - Engagement-driving CTAs
   - First 2 lines optimized for feed preview

4. **Landing Page Copy Generator**
   - AIDA, PAS, or BAB frameworks
   - Above-the-fold clarity (5-second rule)
   - Headline + Subheadline + Hero Copy
   - Feature → Benefit translation
   - Social proof + CTA

5. **Email Campaign Generator**
   - 5 subject line variations for A/B testing
   - Preview text synergy
   - 150-250 word body copy
   - Spam trigger avoidance
   - ONE clear CTA

6. **Website Copy Generator**
   - Homepage, About, Services, Pricing, Contact sections
   - SEO-optimized
   - Scannable formatting
   - Benefits-focused
   - Trust-building elements

## Quality Standard: 9.2+/10

Every piece of copy is rated on 6 dimensions:

- **Clarity** (1-10): Is the message crystal clear?
- **Emotional Resonance** (1-10): Does it create desire/urgency/curiosity?
- **Conversion Potential** (1-10): Will this drive action?
- **Platform Optimization** (1-10): Native to platform best practices?
- **Hook Strength** (1-10): Does it stop scrolling/compel opening?
- **CTA Power** (1-10): Clear, compelling call-to-action?

**Anything below 9.2/10 is automatically rejected.**

### Rating Scale:
- 9.5-10.0: World-class, study this
- 9.2-9.4: Elite, publish immediately ✅
- 9.0-9.1: Strong, minor tweaks needed
- 8.0-8.9: Good, but not elite (REJECTED)
- Below 8.0: Amateur (REJECTED)

## Setup

### Prerequisites

- Node.js 18+ installed
- Claude API key from Anthropic

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JohnHCunningham/social-media-.git
cd social-media-
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
CLAUDE_API_KEY=your_actual_api_key_here
```

4. Start development server:
```bash
npm run dev
```

5. Open browser to `http://localhost:5173`

## Usage

### 1. Select Your Agent

Choose from 6 specialized copywriting agents based on your content needs.

### 2. Fill Out the Form

Each agent has a custom form optimized for that content type:

- **Topic**: What are you writing about?
- **Target Audience**: Who are you speaking to?
- **Goal**: What action do you want them to take?
- **Tone/Style**: Choose from platform-optimized options
- **Additional Options**: Framework selection, psychological triggers, content type, etc.

### 3. Generate Elite Copy

Click the "Generate" button. The system will:

1. Use Claude Opus to generate 3+ variations
2. Rate each variation on 6 quality dimensions
3. Filter out anything below 9.2/10
4. Return only elite-quality copy

### 4. Review & Copy

- View quality scores for each variation
- See strengths, weaknesses, and psychological triggers used
- Copy individual variations or all at once
- Use A/B testing with multiple variations

## Copywriting Frameworks

### AIDA (Attention, Interest, Desire, Action)
Best for: Landing pages, ads

### PAS (Problem, Agitate, Solution)
Best for: Email campaigns, social posts addressing pain points

### BAB (Before, After, Bridge)
Best for: Transformation stories, case studies

### 4Ps (Promise, Picture, Proof, Push)
Best for: High-ticket offers, B2B sales

### PASTOR (Problem, Amplify, Story, Transformation, Offer, Response)
Best for: Long-form sales pages

### FAB (Features, Advantages, Benefits)
Best for: Product descriptions, service pages

## Psychological Triggers

- **Loss Aversion**: Fear of missing out (2x stronger than gain)
- **Social Proof**: People follow the crowd (testimonials, stats)
- **Authority**: Expertise and credentials
- **Scarcity**: Limited availability creates urgency
- **Reciprocity**: Give value first
- **Consistency**: People want to align with past actions
- **Liking**: We buy from people we like
- **Unity**: "Us vs. them" shared identity

## Deployment

### Deploy to Vercel

1. Push code to GitHub:
```bash
git add .
git commit -m "Initial commit: Elite copywriting platform"
git push origin main
```

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `CLAUDE_API_KEY`
   - Deploy

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Tech Stack

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Anthropic Claude**: AI copywriting
  - Claude 3 Opus: Elite copy generation
  - Claude 3.5 Sonnet: Quality rating
- **Lucide React**: Icons

## Cost Estimate

Using Claude API (Opus for writing, Sonnet for rating):

- **LinkedIn/Instagram/Facebook**: ~$0.15-0.30 per generation (3 variations)
- **Landing Page**: ~$0.10-0.20 per generation
- **Email Campaign**: ~$0.10-0.20 per generation
- **Website Copy**: ~$0.10-0.20 per section

## Performance Tips

1. **Use specific inputs**: The more specific your topic/audience/goal, the better the output
2. **Try different frameworks**: Each framework excels in different scenarios
3. **Mix psychological triggers**: Layering 2-4 triggers creates stronger copy
4. **Test variations**: Use the multiple variations for A/B testing
5. **Iterate**: If quality isn't 9.2+, refine your inputs and regenerate

## Project Structure

```
social-media-/
├── src/
│   ├── components/
│   │   ├── LinkedInForm.tsx
│   │   ├── InstagramForm.tsx
│   │   ├── FacebookForm.tsx
│   │   ├── LandingPageForm.tsx
│   │   ├── EmailForm.tsx
│   │   ├── WebsiteForm.tsx
│   │   └── VariationDisplay.tsx
│   ├── services/
│   │   └── eliteCopy.ts (Core AI copywriting engine)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## License

MIT

## Author

John Cunningham - [AI Advantage Solutions](https://aiadvantagesolutions.ca)

---

**Built with 9.2+/10 quality standards. Anything less is rejected.**
