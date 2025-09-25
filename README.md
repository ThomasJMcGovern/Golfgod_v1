# GolfGod v1 - PGA Tour Analytics Platform

A modern PGA Tour analytics platform built with Next.js, Convex, and TypeScript.

## Features

- **Player Analytics**: View detailed statistics for PGA Tour players
- **Tournament Results**: Browse tournament history from 2015-2025
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
├── app/                  # Next.js app directory
│   ├── admin/           # Admin pages for data management
│   ├── api/             # API routes
│   └── players/         # Player analytics pages
├── components/          # React components
├── convex/              # Convex backend functions
│   ├── schema.ts        # Database schema
│   └── *.ts            # Backend functions
├── lib/                 # Utility functions
└── public/             # Static assets
```

## Features Overview

### Player Analytics
- View comprehensive player statistics
- Browse tournament history by year
- Track earnings and performance metrics
- See world and tour rankings

### Admin Tools
- Import tournament data from JSON files
- Manage player database
- Data validation and cleanup utilities

### Authentication
- Secure sign-in/sign-up flow
- Protected routes for authenticated users
- Session management with Convex Auth

## Data Sources

Tournament data includes 100+ PGA Tour players with comprehensive tournament history from 2015-2025.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Convex Functions

Key backend functions:
- `players.ts` - Player data queries
- `tournamentResults.ts` - Tournament result queries
- `importPipeline.ts` - Data import functionality
- `auth.ts` - Authentication handlers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Thomas J McGovern

---

Built with ❤️ for golf analytics enthusiasts