# 🚀 Complete Deployment Guide - GitHub + Vercel

## Step-by-Step Instructions for Tomorrow

---

## Part 1: Setup GitHub Repository (15 minutes)

### 1. Create GitHub Account (if needed)
- Go to https://github.com
- Click "Sign up"
- Follow the prompts

### 2. Create New Repository

1. Click the **"+"** icon (top right) → **"New repository"**
2. Fill in details:
   - **Repository name:** `ai-copy-studio` (or your preferred name)
   - **Description:** "AI-powered copywriting platform with RAG system"
   - **Visibility:** Private (recommended for now)
   - ✅ **Do NOT** initialize with README (you already have one)
3. Click **"Create repository"**

### 3. Push Your Code to GitHub

Open Terminal in your project folder and run:

```bash
# Navigate to your project
cd "/Users/johncunningham/Downloads/social-media-"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - AI Copy Studio with serverless functions"

# Add GitHub as remote (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/ai-copy-studio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important:** Replace `YOUR-USERNAME` with your actual GitHub username!

### 4. Verify Upload
- Refresh your GitHub repository page
- You should see all your files uploaded ✅

---

## Part 2: Setup Vercel (10 minutes)

### 1. Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (easiest)
4. Authorize Vercel to access your GitHub

### 2. Import Your Repository

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `ai-copy-studio` repository
3. Click **"Import"**

### 3. Configure Project

1. **Framework Preset:** Vite
2. **Root Directory:** `./` (leave as default)
3. **Build Command:** `npm run build` (auto-detected)
4. **Output Directory:** `dist` (auto-detected)
5. Click **"Deploy"** (will fail first time - that's OK!)

---

## Part 3: Add Environment Variables (5 minutes)

### In Vercel Dashboard:

1. Go to your project
2. Click **"Settings"** (top menu)
3. Click **"Environment Variables"** (left sidebar)
4. Add these variables one by one:

| Key | Value | Environment |
|-----|-------|-------------|
| `CLAUDE_API_KEY` | `your_claude_api_key_here` | Production, Preview, Development |
| `OPENAI_API_KEY` | `your_openai_api_key_here` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your_supabase_anon_key_here` | Production, Preview, Development |

**For each variable:**
1. Click **"Add New"**
2. Enter **Key** name
3. Enter **Value** (paste from your `.env.local` file)
4. Check all three environments (Production, Preview, Development)
5. Click **"Save"**

### 4. Redeploy

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes for build to complete ✅

---

## Part 4: Test Your Deployment (5 minutes)

### 1. Get Your Live URL

After deployment succeeds, you'll see:
```
🎉 Your project is live at: https://ai-copy-studio-xyz123.vercel.app
```

### 2. Open Your App

Click the URL to open your deployed app!

### 3. Test Core Features

1. ✅ Select "LinkedIn" platform
2. ✅ Fill in topic, audience, goal
3. ✅ Upload your logo (optional)
4. ✅ Click "Generate"
5. ✅ Wait 10-20 seconds
6. ✅ See 3-5 copy variations with images!

### 4. Test Serverless Functions (Optional - Advanced)

Open Terminal and test API endpoints:

```bash
# Replace YOUR-URL with your actual Vercel URL
curl -X POST https://YOUR-URL.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"postContent": "AI helps families", "topic": "AI automation"}'
```

If you get a JSON response with `imageUrl`, it's working! ✅

---

## Part 5: Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel project settings, go to **"Domains"**
2. Click **"Add"**
3. Enter your domain (e.g., `copystudio.com`)
4. Follow DNS setup instructions
5. Wait 24 hours for DNS propagation

---

## 🔒 Security Checklist

Before going public, ensure:

- ✅ API keys are in Vercel environment variables (NOT in code)
- ✅ `.env.local` is in `.gitignore` (so it's not uploaded to GitHub)
- ✅ Supabase Row Level Security (RLS) is enabled
- ⏳ Add user authentication (next step)
- ⏳ Add rate limiting (next step)

---

## 🆘 Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Functions Fail
- Check environment variables are set correctly
- View function logs in Vercel dashboard
- Test locally with `vercel dev` first

### Images Don't Generate
- Check OpenAI API key is valid
- Check DALL-E 3 quota/credits
- View logs in Vercel **"Functions"** tab

### Posts Don't Generate
- Check Claude API key is valid
- Check API usage limits
- Ensure all environment variables are set

---

## 📋 Pre-Deployment Checklist

Tomorrow before deploying:

- [ ] GitHub account created
- [ ] Vercel account created (use GitHub login)
- [ ] API keys ready (from `.env.local`)
- [ ] Code committed to GitHub
- [ ] Environment variables added to Vercel
- [ ] Test deployment successful
- [ ] Live URL working

---

## 🎉 You're Ready!

Follow these steps tomorrow and you'll have your SaaS live in **~30 minutes**!

Questions? Check the Vercel docs: https://vercel.com/docs

---

## Next Steps After Deployment

1. **Add User Authentication** - Supabase Auth
2. **Add Rate Limiting** - Prevent API abuse
3. **Custom Domain** - Your own branded URL
4. **Analytics** - Vercel Analytics or Plausible
5. **Monitoring** - Sentry for error tracking
6. **Payment** - Stripe for subscriptions

You've built something amazing! 🚀
