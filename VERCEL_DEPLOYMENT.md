# Vercel Deployment Guide for GolfGod v1

## Prerequisites
- GitHub repository is ready ✅ (https://github.com/ThomasJMcGovern/Golfgod_v1)
- Convex backend configured ✅

## Environment Variables Required

You'll need to add these in Vercel's dashboard:

```bash
# Required - Get from Convex Dashboard
NEXT_PUBLIC_CONVEX_URL=https://[your-deployment].convex.cloud
CONVEX_DEPLOY_KEY=[your-deploy-key]

# Get these from your current .env.local file
```

## Step-by-Step Deployment

### 1. Connect to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub repository: `ThomasJMcGovern/Golfgod_v1`

### 2. Configure Build Settings
Vercel should auto-detect Next.js, but verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:

1. Add `NEXT_PUBLIC_CONVEX_URL`:
   - Get from: https://dashboard.convex.dev
   - Select your project
   - Copy the deployment URL

2. Add `CONVEX_DEPLOY_KEY`:
   - Get from Convex dashboard → Settings → Deploy Keys
   - Generate a new deploy key if needed

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete (3-5 minutes)

## Post-Deployment Setup

### Update Convex for Production
1. In your Convex dashboard:
   - Add your Vercel domain to allowed origins
   - Example: `https://golfgod-v1.vercel.app`

2. Update authentication settings if needed:
   ```bash
   # In your local project
   npx convex env set SITE_URL https://your-app.vercel.app --prod
   ```

### Verify Deployment
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Player data displays
- [ ] Admin tools accessible (protect these in production!)

## Common Issues & Solutions

### Issue: "Convex connection failed"
**Solution**: Check NEXT_PUBLIC_CONVEX_URL is correct and starts with `https://`

### Issue: "Build failed"
**Solution**: Check Node version (should be 18+):
```json
// Add to package.json if needed
"engines": {
  "node": ">=18.0.0"
}
```

### Issue: "Authentication not working"
**Solution**: Update Convex auth settings with production URL:
- Add Vercel domain to Convex allowed origins
- Update SITE_URL in Convex environment

## Production Considerations

### 1. Protect Admin Routes
Add middleware to protect admin pages:
```typescript
// middleware.ts - already exists, may need updates
export function middleware(request: NextRequest) {
  // Add protection for /admin/* routes
}
```

### 2. Environment-Specific Settings
Consider different settings for production:
- Disable debug logging
- Enable analytics
- Set up error monitoring (Sentry, etc.)

### 3. Database Considerations
- Your Convex data persists across deployments
- No migration needed - data stays in Convex
- Tournament data already imported will remain

## Deployment Checklist

- [ ] GitHub repo pushed with latest changes
- [ ] Convex dashboard open to get credentials
- [ ] Environment variables ready
- [ ] Vercel account logged in
- [ ] Domain name decided (or use Vercel's default)

## Quick Deploy Command (Alternative)

If you have Vercel CLI installed:
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Follow prompts and add env vars when asked
```

## Your Specific Setup Notes

- **Data**: 100 PGA Tour players already imported to Convex
- **Admin Tools**: Located at `/admin/*` - consider protecting these
- **Port**: Local dev runs on 3001, Vercel will handle production port
- **Authentication**: Convex Auth is configured and ready