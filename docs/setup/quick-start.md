# Quick Start Guide

Get GolfGod up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Convex account (free at [convex.dev](https://convex.dev))

## 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/golfgod.git
cd golfgod_x_convex

# Install dependencies
npm install
```

## 2. Setup Convex

```bash
# Initialize Convex (will prompt for login)
npx convex dev
```

## 3. Start Development Server

```bash
# Run both Next.js and Convex
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 4. Create Your First Account

1. Navigate to `http://localhost:3000/signin`
2. Click "Sign up"
3. Enter email and password
4. You're in!

## First Steps

### Import Sample Data

1. **Go to Admin Panel**: `/admin/import-csv`
2. **Import Rankings**: Use the sample CSV provided
3. **View Players**: Navigate to `/players`

### Try Key Features

#### Search for Players
```
1. Go to /players
2. Use the dropdown to search "Scottie Scheffler"
3. Click to view profile
```

#### Follow a Player
```
1. Select any player
2. Click "Follow" button
3. View your follows in the dashboard
```

#### Import Tournament Results
```
1. Go to /admin/import-results
2. Click "Load Example"
3. Click "Import Single Player"
4. View results in player profile
```

## Sample Data

### Player Bio CSV
```csv
name,firstName,lastName,country,worldRanking
"Scottie Scheffler","Scottie","Scheffler","United States",1
"Rory McIlroy","Rory","McIlroy","Northern Ireland",2
"Xander Schauffele","Xander","Schauffele","United States",3
```

### Tournament Results JSON
```json
{
  "playerName": "Scottie Scheffler",
  "years": [
    {
      "year": 2024,
      "tournaments": [
        {
          "date": "Apr 11 - 14",
          "tournament": "Masters Tournament",
          "position": "1",
          "score": "-11",
          "overall": "277",
          "earnings": 3600000
        },
        {
          "date": "Mar 21 - 24",
          "tournament": "THE PLAYERS Championship",
          "position": "T2",
          "score": "-18",
          "overall": "270",
          "earnings": 1636667
        }
      ]
    }
  ]
}
```

## Project Structure

```
golfgod_x_convex/
├── app/                    # Next.js pages
│   ├── page.tsx           # Landing page
│   ├── players/           # Player analytics
│   ├── signin/            # Authentication
│   └── admin/             # Admin tools
├── components/            # React components
│   ├── PlayerSelect.tsx   # Player search
│   ├── PlayerBio.tsx     # Player profiles
│   ├── PlayerStats.tsx   # Statistics
│   └── ui/               # UI components
├── convex/               # Backend
│   ├── schema.ts         # Database schema
│   ├── players.ts        # Player queries
│   └── auth.ts          # Authentication
└── public/              # Static assets
```

## Key Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```

### Convex
```bash
npx convex dev       # Start Convex sync
npx convex deploy    # Deploy to production
npx convex logs      # View backend logs
```

### Database
```bash
# Open Convex dashboard
npx convex dashboard

# Run a function from CLI
npx convex run players:getAllPlayers
```

## Common Tasks

### Add a New Player
```typescript
// In Convex dashboard or code
await ctx.db.insert("players", {
  name: "Tiger Woods",
  firstName: "Tiger",
  lastName: "Woods",
  country: "United States",
  countryCode: "US",
  worldRanking: 15,
});
```

### Query Players
```typescript
// In your React component
const players = useQuery(api.players.getAllPlayers, {
  searchTerm: "Tiger"
});
```

### Follow a Player
```typescript
// In your React component
const followPlayer = useMutation(api.players.followPlayer);
await followPlayer({ playerId });
```

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key
```

## Troubleshooting

### Issue: "Convex connection failed"
```bash
# Restart Convex dev server
npx convex dev --once
```

### Issue: "Cannot find module"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Authentication error"
```bash
# Check SITE_URL in Convex dashboard
# Should be http://localhost:3000 for dev
```

## Next Steps

Now that you have GolfGod running:

1. **Explore the UI**: Browse player profiles and statistics
2. **Import More Data**: Add tournament results and player bios
3. **Customize**: Modify components and styles
4. **Deploy**: Follow the [deployment guide](../deployment/production.md)

## Getting Help

- **Documentation**: Check `/docs` folder
- **Convex Docs**: [docs.convex.dev](https://docs.convex.dev)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Issues**: Report bugs and request features

## Tips for Success

1. **Use the Admin Tools**: Import data via `/admin` pages
2. **Check the Console**: Browser and terminal for errors
3. **Monitor Convex Dashboard**: Real-time data and logs
4. **Test Locally First**: Before deploying changes
5. **Keep Dependencies Updated**: Regular `npm update`

## Quick Links

- Landing Page: `http://localhost:3000`
- Sign In: `http://localhost:3000/signin`
- Players: `http://localhost:3000/players`
- Admin: `http://localhost:3000/admin/import-csv`
- Convex Dashboard: `dashboard.convex.dev`