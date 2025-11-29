# 🚀 Deployment Guide - Vercel Serverless

Your API keys are now secured with Vercel Serverless Functions!

## 📋 Prerequisites

1. Install Vercel CLI: `npm install -g vercel`
2. Create Vercel account: https://vercel.com

## 🔒 Environment Variables Setup

### For Local Development

Your `.env.local` file should have:

```env
# Server-side (for /api functions)
CLAUDE_API_KEY=sk-ant-api03-your_key_here
OPENAI_API_KEY=sk-proj-your_key_here

# Client-side (for Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### For Vercel Production

Add these to Vercel dashboard (Settings → Environment Variables):

1. **CLAUDE_API_KEY** = your Claude API key
2. **OPENAI_API_KEY** = your OpenAI API key
3. **VITE_SUPABASE_URL** = your Supabase URL
4. **VITE_SUPABASE_ANON_KEY** = your Supabase anon key

## 🏃 Local Development with Serverless Functions

```bash
# Install Vercel CLI
npm install -g vercel

# Run dev server with serverless functions
vercel dev
```

This starts your app on `http://localhost:3000` with `/api` routes working.

## 🚀 Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Or deploy to production
vercel --prod
```

## ✅ Post-Deployment Checklist

1. ✅ Add all environment variables in Vercel dashboard
2. ✅ Test `/api/generate-image` endpoint
3. ✅ Test `/api/generate-linkedin` endpoint
4. ✅ Test `/api/rate-copy` endpoint
5. ✅ Remove API keys from client-side code
6. ✅ Delete old `.env.local` with VITE_CLAUDE_API_KEY

## 🔍 Testing Your Deployment

Once deployed, test the API endpoints:

```bash
# Test image generation
curl -X POST https://your-app.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"postContent": "test", "topic": "AI automation"}'

# Test LinkedIn generation
curl -X POST https://your-app.vercel.app/api/generate-linkedin \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI", "targetAudience": "executives", "goal": "awareness"}'
```

## 🎉 You're Done!

Your API keys are now:
- ✅ Hidden from client-side code
- ✅ Secure on Vercel servers
- ✅ Never exposed in browser
- ✅ Safe to deploy publicly

## 📚 Next Steps

1. Add user authentication (Supabase Auth)
2. Add rate limiting
3. Add API usage tracking
4. Set up custom domain
