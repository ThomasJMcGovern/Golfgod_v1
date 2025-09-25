# Production Deployment Guide

This guide covers deploying GolfGod to production using Vercel for the frontend and Convex for the backend.

## Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- Convex account with production access
- GitHub repository for the project
- Domain name (optional)

## Deployment Overview

```
GitHub Repo → Vercel (Next.js) → Convex (Backend)
     ↓             ↓                    ↓
   CI/CD     Edge Network         Global Database
```

## Step 1: Prepare for Production

### Update Environment Variables

Create production environment variables:

```env
# .env.production
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=prod_deploy_key
NEXT_PUBLIC_SITE_URL=https://golfgod.com
```

### Update Configuration Files

#### next.config.ts
```typescript
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-cdn.com'],
  },
  // Production optimizations
  swcMinify: true,
  compress: true,
};
```

#### package.json
```json
{
  "scripts": {
    "build": "next build && npx convex deploy --prod",
    "start": "next start",
    "deploy": "vercel --prod"
  }
}
```

## Step 2: Deploy Convex Backend

### 1. Create Production Instance

```bash
# Deploy to production
npx convex deploy --prod

# This will:
# - Create a production Convex instance
# - Upload your schema and functions
# - Return your production URL
```

### 2. Set Production Environment Variables

In Convex Dashboard:
1. Go to Settings → Environment Variables
2. Add production variables:
   - `SITE_URL`: `https://golfgod.com`
   - `NODE_ENV`: `production`
   - Any API keys or secrets

### 3. Initialize Production Data

```bash
# Run seed functions if needed
npx convex run --prod seed:initialData
```

## Step 3: Deploy to Vercel

### Option A: GitHub Integration (Recommended)

1. **Connect GitHub to Vercel**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Prepare for production"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project settings

3. **Set Environment Variables**
   In Vercel Dashboard:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   CONVEX_DEPLOY_KEY=your_production_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Follow prompts to:
# - Link to existing project or create new
# - Configure settings
# - Set environment variables
```

## Step 4: Configure Domain

### Add Custom Domain

1. **In Vercel Dashboard**:
   - Go to Project Settings → Domains
   - Add your domain: `golfgod.com`
   - Follow DNS configuration instructions

2. **DNS Settings** (at your registrar):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**:
   - Automatically provisioned by Vercel
   - Force HTTPS in settings

## Step 5: Post-Deployment

### 1. Verify Deployment

Check these endpoints:
- `https://golfgod.com` - Landing page
- `https://golfgod.com/signin` - Authentication
- `https://golfgod.com/players` - Main application

### 2. Set Up Monitoring

#### Vercel Analytics
```bash
npm install @vercel/analytics

# In app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Convex Monitoring
- Enable alerts in Convex Dashboard
- Set up error notifications
- Monitor function execution times

### 3. Configure Caching

#### Vercel Edge Config
```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, stale-while-revalidate',
        },
      ],
    },
  ],
};
```

## Production Checklist

### Security
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] Authentication tested
- [ ] Rate limiting configured
- [ ] Input validation active
- [ ] CORS properly configured

### Performance
- [ ] Images optimized
- [ ] Code minified
- [ ] Caching configured
- [ ] CDN active
- [ ] Database indexed
- [ ] Query optimization done

### Monitoring
- [ ] Error tracking active
- [ ] Analytics installed
- [ ] Uptime monitoring configured
- [ ] Alerts set up
- [ ] Logs accessible

### Backup
- [ ] Database backup scheduled
- [ ] Export functionality tested
- [ ] Recovery plan documented
- [ ] Rollback procedure ready

## Deployment Commands

### Quick Deploy
```bash
# Deploy everything
npm run deploy:all

# Deploy frontend only
vercel --prod

# Deploy backend only
npx convex deploy --prod
```

### Rollback
```bash
# Rollback Vercel deployment
vercel rollback

# Rollback Convex (use dashboard)
# Go to Deployments → Select previous → Promote
```

### Maintenance Mode
```javascript
// middleware.ts
export function middleware(request: Request) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return new Response('Maintenance in progress', {
      status: 503,
    });
  }
}
```

## Environment-Specific Settings

### Production Optimizations

```javascript
// utils/config.ts
export const config = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // API settings
  apiTimeout: isProd ? 10000 : 30000,
  maxRetries: isProd ? 3 : 1,

  // Cache settings
  cacheTime: isProd ? 3600 : 0,

  // Feature flags
  enableAnalytics: isProd,
  enableErrorReporting: isProd,
};
```

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Deploy to Convex
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
        run: npx convex deploy --prod

      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod --token=$VERCEL_TOKEN
```

## Troubleshooting Production Issues

### Issue: 500 Errors
```bash
# Check Vercel logs
vercel logs

# Check Convex logs
npx convex logs --prod
```

### Issue: Slow Performance
1. Check Vercel Analytics
2. Review Convex function times
3. Optimize database queries
4. Enable caching

### Issue: Authentication Failures
1. Verify SITE_URL in Convex
2. Check cookie settings
3. Verify HTTPS is enforced
4. Check CORS configuration

### Issue: Data Not Updating
1. Check WebSocket connection
2. Verify Convex subscription
3. Check network tab
4. Review error logs

## Scaling Considerations

### Vercel Limits
- Serverless Function: 10 seconds (Hobby), 60 seconds (Pro)
- API Routes: 4MB body size
- Static files: 100MB

### Convex Limits
- Function execution: 60 seconds
- Database document: 1MB
- Query results: 16MB
- Concurrent connections: Based on plan

### Optimization Strategies
1. Implement pagination
2. Use edge caching
3. Optimize images
4. Lazy load components
5. Batch API requests

## Cost Optimization

### Vercel
- Use ISR for static content
- Optimize image delivery
- Monitor bandwidth usage
- Use edge functions wisely

### Convex
- Optimize query patterns
- Use appropriate indexes
- Monitor function invocations
- Clean up unused data

## Security Best Practices

1. **Never commit secrets**
2. **Use environment variables**
3. **Enable 2FA on all accounts**
4. **Regular security audits**
5. **Monitor for vulnerabilities**
6. **Keep dependencies updated**
7. **Implement rate limiting**
8. **Use CSP headers**

## Support and Resources

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Convex Support**: [convex.dev/support](https://convex.dev/support)
- **Status Pages**:
  - Vercel: [status.vercel.com](https://status.vercel.com)
  - Convex: [status.convex.dev](https://status.convex.dev)