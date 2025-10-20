# Google OAuth Setup Guide for GolfGod

This guide explains how to configure Google OAuth authentication for your GolfGod application.

---

## Prerequisites

- Google Cloud Console account
- Convex project deployed
- Access to your Convex dashboard

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 1.2 Enable Google OAuth
1. Navigate to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the **OAuth consent screen** first:
   - Choose **External** (or Internal for Google Workspace)
   - Fill in app name: **"GolfGod"**
   - Add user support email
   - Add developer contact email
   - Add scopes: `email` and `profile`
   - Save and continue

### 1.3 Create OAuth Client ID
1. Application type: **Web application**
2. Name: **"GolfGod OAuth"**
3. **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
4. **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
   - **Convex**: `https://your-deployment.convex.site/oauth/google/callback`
5. Click **"CREATE"**
6. Copy the **Client ID** and **Client Secret**

---

## Step 2: Configure Convex Environment Variables

### 2.1 Set Google OAuth Credentials
```bash
# In your terminal, run these commands:
npx convex env set AUTH_GOOGLE_ID "your-google-client-id"
npx convex env set AUTH_GOOGLE_SECRET "your-google-client-secret"
```

### 2.2 Set Site URL (if not already set)
```bash
# For development:
npx convex env set SITE_URL "http://localhost:3000"

# For production:
npx convex env set SITE_URL "https://your-domain.com"
```

### 2.3 Verify Environment Variables
1. Open your [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to **Settings** → **Environment Variables**
3. Confirm these variables are set:
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `SITE_URL`

---

## Step 3: Deploy Updated Code

### 3.1 Deploy Convex Backend
```bash
npx convex deploy
```

### 3.2 Restart Development Server
```bash
# Stop your dev server (Ctrl+C)
# Start it again:
bun run dev
```

---

## Step 4: Test Google OAuth

### 4.1 Navigate to Sign In Page
1. Go to `http://localhost:3000/signin`
2. You should see a **"Continue with Google"** button

### 4.2 Click "Continue with Google"
1. Click the button
2. You'll be redirected to Google's authentication page
3. Select your Google account
4. Grant permissions
5. You'll be redirected back to GolfGod

### 4.3 Verify Authentication
- After successful auth, you should be redirected to the Dashboard
- Check Convex Dashboard → **Data** → **users** table to see your new user entry

---

## Troubleshooting

### Error: "Redirect URI mismatch"
**Cause**: The redirect URI in Google Console doesn't match your Convex deployment URL.

**Solution**:
1. Get your Convex deployment URL from dashboard
2. Add to Google Console authorized redirect URIs:
   ```
   https://your-deployment.convex.site/oauth/google/callback
   ```

### Error: "AUTH_GOOGLE_ID not found"
**Cause**: Environment variables not set in Convex.

**Solution**:
```bash
npx convex env set AUTH_GOOGLE_ID "your-client-id"
npx convex env set AUTH_GOOGLE_SECRET "your-client-secret"
npx convex deploy
```

### Error: "Invalid configuration"
**Cause**: Missing `SITE_URL` environment variable.

**Solution**:
```bash
npx convex env set SITE_URL "http://localhost:3000"
npx convex deploy
```

### Google Button Not Appearing
**Cause**: Code not deployed or browser cache.

**Solution**:
1. Verify `convex/auth.ts` includes Google provider
2. Run `npx convex deploy`
3. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
4. Clear browser cache

---

## Production Deployment

### Vercel Production Setup

**Important**: The `SITE_URL` environment variable must match your production domain.

#### 1. Update Convex Environment Variable (Dashboard)
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Update `SITE_URL` to your Vercel domain: `https://golfgod-v1.vercel.app`
5. Click **Save**

**Why**: Convex uses `SITE_URL` to redirect users after OAuth. If this is set to `http://localhost:3004`, users will be redirected to localhost instead of your production site.

#### 2. Update Google Console for Production
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add production URLs:
   - **Authorized JavaScript origins**: `https://golfgod-v1.vercel.app`
   - **Authorized redirect URIs**:
     - `https://golfgod-v1.vercel.app/api/auth/callback/google`
     - `https://brainy-tiger-452.convex.site/api/auth/callback/google`

#### 3. Alternative: Set via CLI (if preferred)
```bash
# Set for production deployment
npx convex env set SITE_URL "https://golfgod-v1.vercel.app" --prod
```

---

## Security Best Practices

1. **Never commit credentials**: Keep `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Convex dashboard only
2. **Use HTTPS in production**: Google requires HTTPS for OAuth redirects
3. **Restrict redirect URIs**: Only add the specific URLs you need
4. **Monitor OAuth consent screen**: Check Google Console for user consent revocations
5. **Rotate secrets periodically**: Regenerate client secret every 6-12 months

---

## Additional Resources

- [Convex Auth Documentation](https://labs.convex.dev/auth)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Convex Dashboard](https://dashboard.convex.dev)

---

**Last Updated**: January 2025
**Author**: GolfGod Development Team
