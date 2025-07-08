# GitHub Storage Setup for cx-flow-designer

This guide shows you how to set up GitHub Gist storage so your flows persist across browsers and users.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens/new?scopes=gist)
2. Set **Token name**: `cx-flow-designer-storage`
3. Set **Expiration**: `No expiration` (for demo) or your preferred duration
4. Check **ONLY** the `gist` scope checkbox
5. Click **Generate token**
6. **COPY THE TOKEN** - you won't see it again!

### Step 2: Create a GitHub Gist

1. Go to [GitHub Gists](https://gist.github.com)
2. Create a new gist:
   - **Filename**: `cx-flow-designer-data.json`
   - **Content**: `[]` (just empty brackets)
   - Make it **Public** or **Secret** (your choice)
3. Click **Create public gist** (or **Create secret gist**)
4. **COPY THE GIST ID** from the URL:
   ```
   https://gist.github.com/your_username/GIST_ID_HERE
                                      ^^^^^^^^^^^^ 
                                      Copy this part
   ```

### Step 3: Set Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your values:
   ```env
   NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here
   NEXT_PUBLIC_GIST_ID=your_gist_id_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## ✅ Verify It's Working

1. Open your app at `http://localhost:3000`
2. Look for the storage status indicator in the flow editor:
   - 🟢 **Green dot + "GitHub"** = Working with GitHub storage
   - 🟡 **Yellow dot + "Local"** = Fallback to localStorage only
   - 🔴 **Red dot + "Offline"** = No storage available

3. Create a flow, add some nodes
4. Open the app in a **different browser** or **incognito mode**
5. You should see the same flows!

## 🚀 Deploy to Vercel

When deploying to Vercel, add the environment variables:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add both variables:
   - `NEXT_PUBLIC_GITHUB_TOKEN` = your token
   - `NEXT_PUBLIC_GIST_ID` = your gist ID

Now your colleague and client will see the same flows when accessing the deployed app!

## 🔧 Troubleshooting

### Yellow dot (localStorage only)
- Check that your `.env.local` file exists and has correct values
- Restart the development server
- Check browser console for errors

### Red dot (offline)
- Check your internet connection
- Verify the GitHub token has `gist` scope
- Verify the Gist ID is correct

### Flows not syncing
- Check that you're using the same Gist ID across all environments
- Refresh the browser to pull latest data
- Check browser console for API errors

## 🔐 Security Notes

- The GitHub token only has `gist` access (limited permissions)
- Keep your `.env.local` file private (it's in `.gitignore`)
- For production, consider using a dedicated GitHub account for storage 