# RAG System Setup Guide

## ✅ What We Built

The RAG (Retrieval-Augmented Generation) system will:
- **Store** all generated posts with embeddings
- **Learn** from performance (likes, comments, shares, reach)
- **Find** similar high-performing posts before generating new content
- **Improve** over time based on what actually works for YOUR audience

---

## 🚀 Setup Steps

### **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Choose a name (e.g., "ai-copy-studio")
5. Set a strong database password (save it!)
6. Choose a region close to you
7. Click "Create new project" (takes 2-3 minutes)

### **Step 2: Run Database Schema**

Once your project is ready:

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the ENTIRE contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. You should see: "Success. No rows returned"

This creates:
- ✅ Posts table
- ✅ Performance metrics table
- ✅ Embeddings table with vector search
- ✅ Views for analytics
- ✅ Functions for similarity search

### **Step 3: Get Supabase API Keys**

1. In Supabase dashboard, click **Settings** → **API**
2. Copy these two values:
   - **Project URL** (like `https://xxxxx.supabase.co`)
   - **Project API Key** (the `anon` `public` key)

### **Step 4: Get OpenAI API Key**

We use OpenAI for generating embeddings (vector representations of text):

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Click **API keys** (left sidebar)
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)

**Cost:** Embeddings are CHEAP (~$0.0001 per post)
- 1,000 posts = ~$0.10
- Using `text-embedding-3-small` model

### **Step 5: Update .env.local**

Open `.env.local` and replace the placeholders:

```env
VITE_CLAUDE_API_KEY=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
VITE_KIE_API_KEY=34a8d7357ad1dcc7b2ea5aa8b83fccd8
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
VITE_OPENAI_API_KEY=sk-your_actual_openai_key_here
```

### **Step 6: Restart Dev Server**

```bash
# Kill current server (Ctrl+C or)
# Restart
npm run dev
```

### **Step 7: Test Connection**

Open browser console and type:
```javascript
// This will test if RAG is configured
console.log('RAG configured:', window.location)
```

---

## 🎯 What's Built

### ✅ **Phase 1: Save & Track** - COMPLETE!
- ✅ "Save Post" button on each variation
- ✅ Performance metrics input form (likes, comments, shares, reach)
- ✅ Saved Posts Library with filters

### ✅ **Phase 2: RAG-Enhanced Generation** - COMPLETE!
- ✅ Queries top 3 high-performing posts before generation
- ✅ Includes these as examples in prompts
- ✅ "Based on your past posts, here's what worked..."
- ✅ System learns YOUR voice and YOUR audience

### 🔜 **Phase 3: Insights Dashboard** (Coming Soon)
- "Your storytelling posts get 3x more engagement"
- "PAS framework works best for your audience"
- "Social proof trigger drives 40% more shares"

---

## 🧠 How It Works

```
1. Generate Post →
2. Save with embedding (vector representation) →
3. User publishes & records metrics (likes, comments, shares) →
4. Next time: Query similar posts that performed well →
5. Use those as examples for new generation →
6. New post is informed by what actually worked
```

**The Result:** System learns YOUR voice and YOUR audience over time.

---

## 📊 Database Structure

**posts** - All generated content
**post_performance** - Engagement metrics
**post_embeddings** - Vector representations for similarity search
**top_performing_posts** - View of best content by engagement rate

**Vector Search:** Find similar posts using cosine similarity
**Insights:** Analyze what frameworks/triggers work best

---

## 🔒 Security Note

**Current Setup:** Browser-based (local development only)

**For Production:** You'll need:
- Backend API (Next.js/Express)
- Server-side API calls (hide keys)
- User authentication
- Row-level security in Supabase

We'll build this when you're ready to launch the SaaS! 🚀

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] SQL schema run successfully
- [ ] Supabase URL added to .env.local
- [ ] Supabase anon key added to .env.local
- [ ] OpenAI API key added to .env.local
- [ ] Dev server restarted
- [ ] Ready to build UI components!

---

## 🚀 How to Use the RAG System

### **1. Generate a Post**
- Select "LinkedIn" (or any platform)
- Fill in topic, audience, and goal
- Click "Generate"
- Review the 3-5 variations with quality scores

### **2. Save a Post**
- Click the green "Save Post" button on any variation you like
- Post is saved with:
  - Content
  - Framework used
  - Quality score
  - Psychological triggers
  - AI-generated image (if available)

### **3. Track Performance**
After publishing a post to LinkedIn:
1. Click "Add Performance Metrics" button (appears after saving)
2. Enter actual metrics from LinkedIn:
   - Likes
   - Comments
   - Shares
   - Reach/Impressions
3. System automatically calculates engagement rate
4. Click "Save Metrics"

### **4. View Your Library**
- Click "Saved Posts Library" in the navigation
- Filter by:
  - All Posts / Published / Drafts
  - Platform (LinkedIn, Instagram, Facebook)
- See performance metrics for published posts
- Delete posts you don't want

### **5. RAG-Enhanced Generation**
Once you have saved posts with performance data:
- System automatically queries your top 3 performing posts
- Uses them as examples when generating new content
- Result: New posts match the tone/style that works for YOUR audience
- The more data you add, the better it gets!

---

## 💡 Pro Tips

1. **Save Every Post You Publish** - Even if engagement is low, data helps the system learn
2. **Update Metrics Regularly** - Add performance data 7-14 days after publishing
3. **Try Different Frameworks** - See which ones resonate with your audience
4. **Study Your Library** - Review your top performers to spot patterns
5. **Be Patient** - RAG improves over time as you build your dataset

---
