# GolfGod v1 - PGA Tour Analytics Platform

A modern PGA Tour analytics platform built with Next.js, Convex, and TypeScript.

## Features

- **Player Analytics**: View detailed statistics for PGA Tour players
- **Tournament Results**: Browse tournament history from 2015-2026
- **Tournament Schedule**: View upcoming PGA Tour events with previous winners
- **World Rankings**: Track current player rankings
- **Interactive Dashboard**: User-friendly interface with real-time data
- **Authentication**: Secure user authentication with Convex Auth

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database)
- **UI Components**: shadcn/ui
- **Authentication**: Convex Auth
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Convex account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ThomasJMcGovern/Golfgod_v1.git
cd Golfgod_v1
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```

4. Create a `.env.local` file with your Convex deployment URL:
```
NEXT_PUBLIC_CONVEX_URL=your-convex-url
CONVEX_DEPLOY_KEY=your-deploy-key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   │   ├── data-management/  # Unified data management interface
│   │   └── import-json-pipeline/  # JSON data import tool
│   ├── api/               # API routes
│   ├── players/           # Player analytics pages
│   └── tournaments/       # Tournament schedule and results
├── components/            # React components
│   ├── player/           # Player-specific components
│   ├── layout/           # Layout components (Dashboard, UserMenu, etc.)
│   └── ui/               # Reusable UI components (shadcn/ui)
├── convex/                # Convex backend functions
│   ├── schema.ts         # Database schema
│   ├── players.ts        # Player queries and mutations
│   ├── tournaments.ts    # Tournament queries and mutations
│   └── *.ts              # Other backend functions
├── lib/                   # Utility functions
├── scripts/               # Data import scripts
└── public/               # Static assets
```

## Features Overview

### Player Analytics
- View comprehensive player statistics
- Browse tournament history by year
- Track earnings and performance metrics
- See world and tour rankings

### Tournament Features
- Browse tournaments by year (2015-2026)
- View completed tournament results and winners
- Check upcoming tournament schedules
- See previous winners for scheduled events

### Admin Tools
- Unified data management interface
- Import tournament and player data from JSON files
- Database reset and cleanup tools
- Selective data clearing options

### Authentication
- Secure sign-in/sign-up flow
- Protected routes for authenticated users
- Session management with Convex Auth

## Data Sources

Tournament data includes 100+ PGA Tour players with comprehensive tournament history from 2015-2026. Data is imported and stored in Convex database for real-time queries.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Convex Functions

Key backend functions:
- `players.ts` - Player data queries and mutations
- `tournaments.ts` - Tournament schedule and results queries
- `tournamentResults.ts` - Historical tournament result queries
- `importPipeline.ts` - Data import functionality
- `dataManagement.ts` - Database management utilities
- `auth.ts` - Authentication handlers

## TODO

- [ ] **Google OAuth**: Add Google OAuth authentication as an alternative sign-in method
- [ ] **Data Validation**: Check tournament data for other years (2015-2025) to ensure they don't have similar issues with future tournaments marked as "completed"
- [ ] **Historical Data**: Verify that past tournament winners are correctly stored and not marked as "previous_winner"
- [ ] **Date Logic**: Review the date parsing and categorization logic for edge cases, especially around year boundaries

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Thomas J McGovern

---

Built with ❤️ for golf analytics enthusiasts