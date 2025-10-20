# GolfGod x Convex 🏌️‍♂️⚡

> **Next-generation PGA Tour analytics platform** powered by real-time data and advanced player performance insights.

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-Realtime-orange)](https://convex.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Features

### 🎯 **Inside the Ropes** - Course-Specific Player Intelligence
Deep-dive analytics revealing how players perform at specific golf courses:
- **Tournament-by-Tournament History**: Complete performance records at each venue
- **Course Performance Metrics**: Scoring averages, best/worst rounds, cut percentages
- **Round-by-Round Analysis**: Average scores by round (R1, R2, R3, R4)
- **Weekend vs Early Scoring**: Performance comparison between early rounds and weekend play
- **Career Statistics**: Wins, top-10s, top-25s, total earnings at each course

### 📊 **Core Analytics**
- **Player Profiles**: Comprehensive bios, photos, career statistics
- **Tournament Database**: 20,745+ tournament results across 200+ players
- **Real-time Rankings**: PGA Tour world rankings and player follows
- **Advanced Filtering**: Searchable dropdowns with type-to-filter functionality
- **Historical Data**: Multi-year tournament histories from 2015-2026

### 🚀 **Technical Excellence**
- **Real-time Database**: Convex for instant data synchronization
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: shadcn/ui component library with Tailwind CSS
- **Responsive Design**: Mobile-first, works beautifully on all devices
- **Performance Optimized**: Sub-second page loads, efficient queries

---

## 🏁 Quick Start

### Option 1: Automated Script (Recommended)

```bash
# 1. Install dependencies
bun install

# 2. Start all services with one command
./scripts/start.sh
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
bun install

# 2. Set up Convex
npx convex dev

# 3. Start development server
bun run dev
```

Visit `http://localhost:3000` and explore the platform!

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | [Next.js 15](https://nextjs.org/) | React framework with App Router |
| **UI Library** | [React 19](https://react.dev/) | Modern React with Server Components |
| **Database** | [Convex](https://convex.dev/) | Real-time backend-as-a-service |
| **Styling** | [Tailwind CSS 4.0](https://tailwindcss.com/) | Utility-first CSS framework |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) | Beautiful, accessible UI components |
| **Language** | [TypeScript 5.0](https://www.typescriptlang.org/) | Type-safe JavaScript |
| **Forms** | [react-select](https://react-select.com/) | Advanced searchable dropdowns |
| **Icons** | [lucide-react](https://lucide.dev/) | Modern icon library |
| **Package Manager** | [Bun](https://bun.sh/) | Ultra-fast JavaScript runtime |

---

## 📁 Project Structure

```
golfgod_x_convex/
├── app/                          # Next.js App Router pages
│   ├── inside-the-ropes/         # Course-specific player analytics
│   ├── tournaments/pga/          # Tournament browsing & results
│   └── api/                      # API routes (imports, JSON handling)
├── components/                    # React components
│   ├── layout/                   # Dashboard, navigation
│   └── ui/                       # shadcn/ui & custom components
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema (9 tables)
│   ├── courseStats.ts            # Course analytics queries
│   ├── players.ts                # Player data queries
│   ├── importMasterData.ts       # Batch data import pipeline
│   └── _generated/               # Convex auto-generated types
├── docs/                         # Documentation
│   ├── INSIDE_THE_ROPES.md      # Feature methodology
│   ├── DATABASE_SCHEMA.md        # Schema diagrams
│   └── admin/                    # Admin guides
└── scripts/                      # Data import scripts
```

---

## 🎯 Inside the Ropes: How It Works

**Inside the Ropes** provides unprecedented insight into player performance at specific golf courses by analyzing historical tournament results.

### Data Model

#### 1️⃣ **Course Mapping**
Each PGA Tour event is mapped to its host course:
- **TPC Sawgrass** → THE PLAYERS Championship
- **Augusta National** → Masters Tournament
- **Pebble Beach Golf Links** → AT&T Pebble Beach Pro-Am

#### 2️⃣ **Performance Aggregation**
For each player-course combination, we calculate:

```typescript
// Example: Scottie Scheffler at TPC Sawgrass
{
  roundsPlayed: 24,          // Total rounds at this course
  scoringAverage: 69.8,      // Average score per round
  bestScore: 64,             // Career best round
  worstScore: 74,            // Career worst round
  cutsPlayed: 6,             // Tournaments entered
  cutsMade: 6,               // Tournaments where cut was made
  wins: 2,                   // Tournament victories
  top10s: 5,                 // Top-10 finishes
  top25s: 6,                 // Top-25 finishes
  totalEarnings: 8450000,    // Career earnings at course
  avgR1Score: 70.2,          // Average Round 1 score
  avgR2Score: 69.5,          // Average Round 2 score
  avgR3Score: 69.3,          // Average Round 3 score
  avgR4Score: 70.0,          // Average Round 4 score
  avgEarlyScore: 69.85,      // Average Rounds 1-2 score
  avgWeekendScore: 69.65     // Average Rounds 3-4 score
}
```

#### 3️⃣ **Tournament History**
Complete tournament-by-tournament breakdown:

| Year | Tournament | Position | Scorecard | To Par | Earnings |
|------|-----------|----------|-----------|--------|----------|
| 2024 | THE PLAYERS | 1 | 67-70-69-67 | -15 | $4,500,000 |
| 2023 | THE PLAYERS | T-3 | 69-68-71-70 | -10 | $850,000 |
| 2022 | THE PLAYERS | MC | 74-72 | +2 | $0 |

#### 4️⃣ **Missed Cut Detection**
Smart logic identifies missed cuts:
- Position field contains "MC", "CUT", or "WD"
- Only 2 rounds played (didn't qualify for weekend)
- "Unknown" position + 2 rounds = missed cut

### Technical Implementation

**Backend Query**: `convex/courseStats.ts`
```typescript
export const getPlayerTournamentHistoryAtCourse = query({
  args: {
    playerId: v.id("players"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // Get course details
    const course = await ctx.db.get(args.courseId);

    // Find all tournament results at this course
    const results = await ctx.db
      .query("tournamentResults")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("course"), course.name))
      .collect();

    // Sort by year, format scorecard, detect missed cuts
    return sortedResults.map(formatResult);
  },
});
```

**Frontend Component**: `app/inside-the-ropes/page.tsx`
- **SearchableSelect** for players: Type to filter 200+ players
- **SearchableSelect** for courses: Type to filter golf courses
- **Tabs Interface**: Switch between Course Stats and Tournament History
- **Responsive Tables**: Mobile-friendly data presentation

---

## 🗄️ Database Schema

### Core Tables (9 Total)

#### **players** - Player profiles and metadata
```typescript
{
  _id: Id<"players">,
  name: string,                    // "Scottie Scheffler"
  espnId?: string,                 // ESPN athlete ID
  country?: string,                // "United States"
  countryCode?: string,            // "USA"
  worldRanking?: number,           // 1
  birthDate?: string,              // "1996-06-21"
  birthPlace?: string,             // "Ridgewood, New Jersey"
  college?: string,                // "University of Texas"
  swing?: "Right" | "Left",        // "Right"
  turnedPro?: number,              // 2018
  height?: string,                 // "6'3\""
  weight?: string,                 // "215 lbs"
  photoUrl?: string                // Profile image URL
}
```

#### **courses** - Golf course information
```typescript
{
  _id: Id<"courses">,
  name: string,                    // "TPC Sawgrass"
  location: string,                // "Ponte Vedra Beach, Florida"
  par: number,                     // 72
  yardage?: number,                // 7245
  established?: number,            // 1980
  designer?: string,               // "Pete Dye"
  type?: string,                   // "Stadium"
  grassType?: string,              // "Bermuda"
  stimpmeter?: number              // Green speed
}
```

#### **tournamentResults** - Historical performance data
```typescript
{
  _id: Id<"tournamentResults">,
  playerId: Id<"players">,         // Player reference
  tournament: string,              // "THE PLAYERS Championship"
  year: number,                    // 2024
  course?: string,                 // "TPC Sawgrass"
  position: string,                // "1" or "T-3" or "MC"
  scores?: string[],               // ["67", "70", "69", "67"]
  totalScore?: number,             // 273
  toPar?: string,                  // "-15"
  earnings?: number                // 4500000
}
```

#### **playerCourseStats** - Aggregated course performance
```typescript
{
  _id: Id<"playerCourseStats">,
  playerId: Id<"players">,
  courseId: Id<"courses">,
  roundsPlayed: number,            // 24
  scoringAverage: number,          // 69.8
  bestScore: number,               // 64
  worstScore: number,              // 74
  cutsPlayed: number,              // 6
  cutsMade: number,                // 6
  wins: number,                    // 2
  top10s: number,                  // 5
  top25s: number,                  // 6
  totalEarnings: number,           // 8450000
  avgR1Score?: number,             // 70.2
  avgR2Score?: number,             // 69.5
  avgR3Score?: number,             // 69.3
  avgR4Score?: number,             // 70.0
  avgEarlyScore?: number,          // 69.85
  avgWeekendScore?: number,        // 69.65
  lastUpdated: number,             // Timestamp
  lastTournamentYear: number       // 2024
}
```

#### **tournamentCourses** - Tournament-to-course mapping
```typescript
{
  _id: Id<"tournamentCourses">,
  tournamentName: string,          // "THE PLAYERS Championship"
  courseId: Id<"courses">,         // Reference to TPC Sawgrass
  yearStart: number,               // 1982
  yearEnd?: number,                // undefined (still current)
  isPrimary: boolean               // true
}
```

### Supporting Tables
- **pgaTournaments**: Tournament metadata (name, year, winner, purse, dates)
- **roundStats**: Individual round statistics (fairways, greens, putts)
- **playerStats**: Annual player statistics (SG:Total, driving distance, etc.)
- **userFollows**: User-player follow relationships (requires auth)

---

## 💻 Development

### Prerequisites
- **Node.js** 18+ or **Bun** 1.0+
- **Convex Account** (free at [convex.dev](https://convex.dev))

### Local Setup

```bash
# Clone repository
git clone https://github.com/yourusername/golfgod_x_convex.git
cd golfgod_x_convex

# Install dependencies
bun install

# Initialize Convex (first time only)
bunx convex dev

# Start development server
bun run dev
```

### Available Scripts

```bash
./scripts/start.sh   # Start all services (Convex + Next.js)
bun run dev          # Start Next.js dev server (localhost:3000)
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
npx convex dev       # Start Convex development backend
npx convex deploy    # Deploy Convex backend to production
```

### Environment Variables

Create `.env.local`:
```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional: Authentication (if using Convex Auth)
# CONVEX_AUTH_SECRET=your-secret-key
```

### Common Development Tasks

#### Seed Popular Courses
```typescript
// In Convex dashboard, run:
await api.courseStats.seedPopularCourses()
```

#### Import Master Data (200 players, 20,745 tournaments)
```bash
# Via API route
POST http://localhost:3000/api/import-json-files
```

#### Calculate Player Course Stats
```typescript
// In Convex dashboard, run:
await api.courseStats.calculatePlayerCourseStats({
  playerId: "playerIdHere",
  courseId: "courseIdHere",
  tournamentName: "THE PLAYERS Championship"
})
```

### Debugging Tips

**Issue: "Unknown" course locations in dropdown**
- **Cause**: Master JSON has `course_location: null`
- **Fix**: Either hide subtitle when "Unknown" or manually update course locations

**Issue: Missed cuts showing in scorecard column**
- **Fix**: Already resolved in `courseStats.ts:87-109` and `page.tsx:231-252`

**Issue: Convex queries not updating**
- **Solution**: Check Convex dashboard logs, ensure indexes are built

---

## 📥 Data Import Pipeline

### Architecture

```
Master JSON Files (scripts/)
    ↓
API Route (/api/import-json-files)
    ↓
Convex Action (importMasterData.ts)
    ↓
Batch Processing (100 players at a time)
    ↓
Database Tables (players, courses, tournamentResults, etc.)
```

### Import Process

1. **Source Files**: `scripts/master_data_batch_*.json`
   - 200 players across 2 batch files
   - 20,745 tournament results (2015-2026)
   - Course data with variants (Stadium, Links, Parkland)

2. **Processing Logic**:
   - **Players**: Check by name, insert if new, update if exists
   - **Courses**: Check by name, insert if new (location defaults to "Unknown")
   - **Tournament Results**: Batch insert 100 at a time for performance
   - **Deduplication**: Automatic via name/espnId matching

3. **Performance**:
   - ~30-60 seconds for full import
   - Batched operations prevent timeout
   - Convex handles transactional consistency

4. **Data Quality**:
   - ✅ Player names, countries, ESPN IDs
   - ✅ Tournament results, positions, earnings
   - ✅ Round-by-round scores
   - ⚠️ Course locations (need manual enrichment)
   - ⚠️ Course par/yardage (defaults to 72/undefined)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow TypeScript best practices
   - Use existing component patterns
   - Add comments for complex logic
4. **Test thoroughly**
   - Manual testing in browser
   - Check Convex query performance
   - Verify mobile responsiveness
5. **Commit with clear messages**
   ```bash
   git commit -m "Add course performance trend charts"
   ```
6. **Push and create Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **Components**: Functional components with hooks
- **Convex**: Use typed validators (`v.string()`, `v.id()`)
- **Styling**: Tailwind utility classes, shadcn/ui components
- **Naming**: camelCase for variables, PascalCase for components

### Areas for Contribution

- 🎨 **UI/UX Enhancements**: Better charts, visualizations, mobile experience
- 📊 **Advanced Analytics**: Strokes Gained data, weather correlations
- 🔍 **Search Improvements**: Fuzzy search, autocomplete, filters
- 🗺️ **Course Data**: Enrich course locations, par, yardage, designers
- 📱 **Mobile App**: React Native version with shared Convex backend
- 🧪 **Testing**: Unit tests, E2E tests, performance benchmarks

---

## 📚 Documentation

- [Inside the Ropes Methodology](docs/INSIDE_THE_ROPES.md)
- [Database Schema Reference](docs/DATABASE_SCHEMA.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Data Management](docs/admin/data-management.md)
- [API Documentation](docs/api/)

---

## 📄 License

MIT License - feel free to use this project for learning or building your own golf analytics platform!

---

## 🙏 Acknowledgments

- **PGA Tour** for the incredible sport and data
- **Convex** for the amazing real-time backend platform
- **Vercel** for Next.js and deployment infrastructure
- **shadcn** for the beautiful UI component library

---

**Built with ❤️ by golf fans, for golf fans** 🏌️‍♂️

*Last updated: January 2025*
