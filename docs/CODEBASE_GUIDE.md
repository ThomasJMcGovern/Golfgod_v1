# GolfGod Codebase Understanding Guide

**Quick Reference** for understanding your PGA Tour analytics platform architecture.

---

## 🎯 **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│                    (Next.js 15 + React 19)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ useQuery() / useMutation()
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Convex Backend                            │
│              (Real-time Database + Functions)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Read/Write
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Database (Convex)                           │
│  9 Tables: players, tournamentResults, courses, etc.        │
└──────────────────────────────────────────────────────────────┘
```

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Backend:** Convex (serverless, real-time)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Auth:** Convex Auth (email/password + Google OAuth)
- **Package Manager:** Bun

---

## 📁 **Project Structure Overview**

```
golfgod_x_convex/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx            # Landing page (/)
│   ├── signin/             # Authentication
│   ├── players/            # Player browsing
│   ├── tournaments/        # Tournament browsing
│   │   └── pga/[year]/     # Year-specific tournaments
│   ├── inside-the-ropes/   # Advanced analytics hub
│   │   └── player-course-stats/  # Course-specific player stats
│   ├── admin/              # Admin tools
│   │   └── database-schema/  # Schema visualizer
│   └── api/                # API routes
│       └── import-json-files/  # Data import endpoint
│
├── components/             # React components (40 files)
│   ├── landing/            # Landing page sections
│   ├── player/             # Player-specific components
│   ├── layout/             # Dashboard, navigation, menus
│   ├── admin/              # Admin UI components
│   └── ui/                 # shadcn/ui components (25 files)
│
├── convex/                 # Backend logic (Convex)
│   ├── schema.ts           # Database schema (9 tables)
│   ├── players.ts          # Player queries/mutations
│   ├── tournamentResults.ts  # Tournament result queries
│   ├── tournaments.ts      # PGA schedule queries
│   ├── courseStats.ts      # Course-specific analytics
│   ├── importMasterData.ts # Bulk data import
│   └── utils/              # Helper functions
│
├── docs/                   # Documentation
│   ├── database/           # Schema docs
│   ├── deployment/         # Deploy guides
│   ├── guides/             # Development guides
│   └── setup/              # Setup instructions
│
└── lib/                    # Utilities
    ├── utils.ts            # Helper functions
    └── schema-parser.ts    # Schema parsing
```

---

## 🗺️ **Application Routes (User Journey)**

### **Public Routes**
| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing page with hero, features, CTA |
| `/signin` | `app/signin/page.tsx` | Authentication (email/password + Google OAuth) |

### **Main Application Routes**
| Route | File | Purpose | Data Source |
|-------|------|---------|-------------|
| `/players` | `app/players/page.tsx` | Browse 200+ players, search, rankings | `convex/players.ts` |
| `/tournaments` | `app/tournaments/page.tsx` | Tournament hub (redirect to current year) | `convex/tournaments.ts` |
| `/tournaments/pga/[year]` | `app/tournaments/pga/[year]/page.tsx` | Year-specific tournament list (2015-2026) | `convex/tournaments.ts` |
| `/inside-the-ropes` | `app/inside-the-ropes/page.tsx` | Analytics hub (feature selector) | Static |
| `/inside-the-ropes/player-course-stats` | `app/inside-the-ropes/player-course-stats/page.tsx` | Course-specific player performance | `convex/courseStats.ts` |

### **Admin Routes**
| Route | File | Purpose |
|-------|------|---------|
| `/admin/database-schema` | `app/admin/database-schema/page.tsx` | Interactive schema visualization |

### **API Routes**
| Route | File | Purpose |
|-------|------|---------|
| `/api/import-json-files` | `app/api/import-json-files/route.ts` | Trigger bulk data import |

---

## 🗄️ **Database Schema (9 Tables)**

### **Core Data Tables**

#### 1. **players** (~200 records)
```typescript
{
  name: string,              // "Scottie Scheffler"
  firstName/lastName: string,
  country/countryCode: string,
  espnId: string,            // Unique identifier
  worldRanking: number,
  photoUrl: string,
  // Bio data: birthDate, birthPlace, college, swing, height, weight
}
```
**Indexes:** `by_name`, `by_world_ranking`, `search_name`

#### 2. **tournamentResults** (20,745+ records) ⚠️ LARGE TABLE
```typescript
{
  playerId: Id<"players">,
  playerName: string,        // Denormalized for performance
  year: number,              // 2015-2026
  tournament: string,        // "Masters Tournament"
  course: string,            // "Augusta National"
  position: string,          // "1", "T5", "MC"
  scores: string[],          // ["69", "72", "68", "70"]
  totalScore: number,        // 279
  toPar: number,             // -9
  earnings: number           // Prize money
}
```
**Indexes:** `by_player`, `by_player_year`, `by_tournament`, `by_year`
**⚠️ CRITICAL:** Always use `.take(limit)` - NEVER `.collect()` on this table!

#### 3. **courses** (~54 records)
```typescript
{
  name: string,              // "TPC Sawgrass"
  location: string,          // "Ponte Vedra Beach, FL"
  par: number,               // 72
  yardage: number,
  designer: string,          // "Pete Dye"
  grassType: string          // "Bermuda"
}
```

#### 4. **playerCourseStats** (~2,700 records)
**Aggregated career stats** at specific courses
```typescript
{
  playerId: Id<"players">,
  courseId: Id<"courses">,
  roundsPlayed: number,
  scoringAverage: number,    // Career avg at this course
  bestScore: number,
  worstScore: number,
  cutsPlayed: number,
  cutsMade: number,
  wins: number,
  top10s: number,
  totalEarnings: number,
  // Round breakdowns
  avgR1Score: number,
  avgR2Score: number,
  avgR3Score: number,
  avgR4Score: number,
  avgEarlyScore: number,     // R1+R2
  avgWeekendScore: number    // R3+R4
}
```
**Indexes:** `by_player`, `by_course`, `by_player_course`

#### 5. **pgaTournaments** (~100 records)
```typescript
{
  tournament_id: string,     // "2024_the_masters"
  name: string,
  year: number,
  start_date: string,
  end_date: string,
  winner_name: string,
  winning_score: string,
  prize_money: number,
  status: "completed" | "scheduled"
}
```

### **Supporting Tables**

#### 6. **tournamentCourses** (mapping)
Maps tournaments to courses (handles venue changes)
```typescript
{
  tournamentName: string,
  courseId: Id<"courses">,
  yearStart: number,
  yearEnd?: number,          // null = current
  isPrimary: boolean
}
```

#### 7. **roundStats** (future: 80K+ records)
**Detailed round-by-round data** (schema exists, data pending)
```typescript
{
  playerId: Id<"players">,
  courseId: Id<"courses">,
  tournamentResultId: Id<"tournamentResults">,
  round: number,             // 1-4
  score: number,
  teeTime: "AM" | "PM",      // For split stats
  fairwaysHit: number,
  greensHit: number,
  putts: number,
  // Strokes gained, weather conditions, etc.
}
```

#### 8. **playerStats** (annual stats)
```typescript
{
  playerId: Id<"players">,
  year: number,
  avgSgApp: number,          // Strokes gained approach
  fairwaysHit: number,
  avgPutts: number,
  tournaments: number,
  wins: number,
  earnings: number
}
```

#### 9. **userFollows** (auth-required)
```typescript
{
  userId: string,            // Convex Auth user ID
  playerId: Id<"players">,
  followedAt: number         // Timestamp
}
```

---

## 🔌 **Convex Backend Functions**

### **players.ts** (15 functions)
```typescript
// Queries
getAllPlayers()              // All players with stats
getAll()                     // Simple player list for dropdowns
getPlayer(playerId)          // Single player details
getPlayerStats(playerId)     // Annual stats
getWorldRankings()           // Top 100 by world ranking
getUserFollows(userId)       // User's followed players
isFollowingPlayer(...)       // Check follow status

// Mutations
followPlayer(...)            // Follow a player
unfollowPlayer(...)          // Unfollow a player
updatePlayerBio(...)         // Update player metadata
cleanupPlayerData()          // Admin: data cleanup
```

### **courseStats.ts** (10 functions)
```typescript
// Queries
getAllCourses()                              // All golf courses
getCourseByName(name)                        // Find course
getPlayerCourseStats(playerId, courseId)     // Career stats at course
getPlayerTournamentHistoryAtCourse(...)      // Tournament-by-tournament history
getAllPlayersAtCourse(courseId)              // All players at course

// Mutations
calculatePlayerCourseStats(...)              // Recalculate aggregated stats
addCourse(...)                               // Add new course
mapTournamentToCourse(...)                   // Map tournament to course
seedPopularCourses()                         // Add popular courses
```

### **tournamentResults.ts** (11 functions)
```typescript
// Queries
getPlayerTournamentResults(playerId, limit?) // Player's tournament history
getAllTournaments(limit?)                    // All tournaments
getTournamentResults(tournament, year)       // Tournament leaderboard
checkResultsStatus()                         // Import status

// Mutations
importTournamentResults(...)                 // Import single result
importResultsJSON(...)                       // Bulk import
deleteAllTournamentResults()                 // Admin: clear data
```

### **tournaments.ts** (PGA Schedule)
```typescript
// Queries
getTournamentsByYear(year)   // Year schedule
getAllTournaments(limit?)    // All schedules
getTournamentById(id)        // Single tournament

// Mutations
importTournaments(...)       // Bulk import schedules
```

---

## 🧩 **Component Organization**

### **Layout Components** (`components/layout/`)
- `Dashboard.tsx` - Main app wrapper with sidebar navigation
- `UserMenu.tsx` - User profile dropdown (sign out, settings)
- `ConvexClientProvider.tsx` - Convex provider wrapper

### **Player Components** (`components/player/`)
- `PlayerSelect.tsx` - Searchable player dropdown (uses react-select)
- `PlayerStats.tsx` - Comprehensive player stats card (22KB, largest component)
- `PlayerBio.tsx` - Player biography and metadata
- `PlayerRankings.tsx` - World rankings display

### **Landing Components** (`components/landing/`)
- `FeatureCard.tsx` - Feature showcase cards
- `HowItWorks.tsx` - How-it-works section
- `StatsBar.tsx` - Statistics banner
- `ComparisonSection.tsx` - Before/after comparison
- `UseCaseCard.tsx` - Use case cards

### **Admin Components** (`components/admin/database-schema/`)
- `SchemaCanvas.tsx` - Interactive schema graph
- `TableNode.tsx` - Draggable table nodes
- `TableDetailsPanel.tsx` - Table details sidebar

### **UI Components** (`components/ui/`) - 25 shadcn/ui components
```
alert, avatar, badge, breadcrumb, button, card, collapsible,
command, dialog, drawer, dropdown-menu, input, label, progress,
scroll-area, searchable-select, select, separator, sheet,
skeleton, table, tabs, textarea
```

---

## 🔄 **Key User Flows**

### **Flow 1: Landing → Sign In → Dashboard**
```
User visits / (app/page.tsx)
  ├─ Sees hero, features, testimonials
  ├─ Clicks "Get Started"
  └─ Opens sign-in dialog
      ├─ Email/password OR Google OAuth
      └─ Authenticated → Redirects to dashboard

Dashboard shows:
  ├─ Navigation: Players, Tournaments, Inside the Ropes
  ├─ User menu (top right)
  └─ Main content area
```

### **Flow 2: Browse Players**
```
User clicks "Players" (/players)
  ├─ Sees searchable player list
  ├─ Search bar filters 200+ players
  ├─ Clicks player card
  └─ Sees player profile with:
      ├─ Bio (photo, country, college)
      ├─ World ranking
      ├─ Career stats
      ├─ Recent tournament results
      └─ Follow button
```

### **Flow 3: Inside the Ropes - Course Stats**
```
User clicks "Inside the Ropes" (/inside-the-ropes)
  ├─ Sees analytics hub with 5 features
  ├─ Clicks "Player Stats Per Course" (only active feature)
  └─ Goes to /inside-the-ropes/player-course-stats
      ├─ Select Player (dropdown, 200+ players)
      ├─ Select Course (dropdown, 54 courses)
      └─ Views 2 tabs:
          ├─ Course Stats (aggregated career stats)
          │   ├─ Scoring average, best/worst rounds
          │   ├─ Cuts made, wins, top-10s
          │   ├─ Round breakdowns (R1-R4)
          │   └─ Weekend vs early scoring
          │
          └─ Tournament History (year-by-year)
              ├─ Position, scorecard, earnings
              └─ Sortable by year
```

### **Flow 4: Browse Tournaments**
```
User clicks "Tournaments" (/tournaments)
  ├─ Redirects to /tournaments/pga/{currentYear}
  ├─ Year selector (2015-2026)
  ├─ Sees tournament list for selected year
  │   ├─ Tournament name, dates
  │   ├─ Winner name, score
  │   └─ Prize money
  └─ Can switch years to browse historical data
```

---

## 💾 **Data Flow Architecture**

### **Frontend → Backend → Database**
```
React Component
  ├─ useQuery(api.players.getAll, {})
  │     ↓
  │  Convex Backend (convex/players.ts)
  │     ↓
  │  export const getAll = query({
  │    handler: async (ctx, args) => {
  │      return await ctx.db.query("players")
  │        .withIndex("by_name")
  │        .collect();
  │    }
  │  })
  │     ↓
  │  Database (players table)
  │     ↓
  └─ Returns: Player[] (reactive, updates automatically)
```

### **Query Performance Rules**
```typescript
// ✅ GOOD - Use indexes
.withIndex("by_player", q => q.eq("playerId", id))

// ✅ GOOD - Limit results
.take(100)

// ❌ BAD - Full table scan
.filter(q => q.eq(q.field("year"), 2024))

// ❌ BAD - Unbounded on large table
.query("tournamentResults").collect()  // 20K+ records!
```

---

## 🎨 **Styling System**

### **Tailwind CSS Configuration**
```typescript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      background: "hsl(120, 15%, 8%)",     // Dark green-gray
      foreground: "hsl(120, 5%, 95%)",     // Off-white
      primary: "hsl(142, 76%, 36%)",       // Golf green
      secondary: "hsl(120, 10%, 15%)",     // Darker green
      accent: "hsl(142, 76%, 45%)"         // Bright green
    }
  }
}
```

### **Common Patterns**
```tsx
// Mobile-first responsive design
<div className="px-4 sm:px-6 lg:px-8">
  <h1 className="text-2xl sm:text-3xl md:text-4xl">Title</h1>
</div>

// Dark mode (automatic via next-themes)
<Card className="bg-card text-card-foreground">

// Loading states
{isLoading ? <Skeleton className="h-8 w-full" /> : <Content />}
```

---

## 🔐 **Authentication Flow**

```
Convex Auth (@convex-dev/auth)
  ├─ Providers:
  │   ├─ Email/Password (password provider)
  │   └─ Google OAuth
  │
  ├─ Frontend hooks:
  │   ├─ useAuthActions() → { signIn, signOut }
  │   ├─ useConvexAuth() → { isLoading, isAuthenticated }
  │   └─ Authenticated/Unauthenticated components
  │
  └─ Backend:
      ├─ convex/auth.ts - Auth configuration
      ├─ convex/http.ts - OAuth routes
      └─ authTables in schema (users, authSessions, etc.)
```

---

## 📊 **Data Import Pipeline**

```
Master JSON Files (200 players, 20K+ results)
  ↓
API Route: POST /api/import-json-files
  ↓
Convex Action: importMasterData.ts
  ↓
Batch Processing (100 items at a time)
  ├─ Insert players (check by name/espnId)
  ├─ Insert courses (check by name)
  └─ Insert tournament results (batch insert)
  ↓
Database Tables Updated
  ↓
Frontend Auto-Updates (reactive queries)
```

**Import Functions:**
- `importMasterData.importAllPlayers()` - Import player data
- `importMasterData.importAllTournamentResults()` - Import results
- `tournamentResults.importResultsJSON()` - Bulk import utility

---

## 🚀 **Development Commands**

```bash
# Start all services
./scripts/start.sh              # Starts Convex + Next.js

# Individual services
bun run dev:frontend            # Next.js dev server (port 3000)
bun run dev:backend             # Convex dev server

# Build & Deploy
bun run build                   # Production build
bun run start                   # Production server
npx convex deploy               # Deploy Convex backend

# Database operations
npx convex run <function>       # Run Convex function
npx convex dashboard            # Open Convex dashboard
```

---

## 🐛 **Common Patterns & Best Practices**

### **Convex Query Patterns**
```typescript
// ✅ Always use indexes
const results = await ctx.db
  .query("tournamentResults")
  .withIndex("by_player_year", q =>
    q.eq("playerId", id).eq("year", 2024)
  )
  .take(100);  // ✅ Always limit

// ✅ Safe to .collect() on small tables
const players = await ctx.db
  .query("players")
  .withIndex("by_name")
  .collect();  // Safe: ~200 records

// ❌ NEVER .collect() on large tables
const results = await ctx.db
  .query("tournamentResults")
  .collect();  // ❌ 20K+ records, bandwidth killer!
```

### **React Component Patterns**
```typescript
// ✅ Use client components for interactivity
"use client";

// ✅ Early returns for loading states
if (isLoading) return <Skeleton />;
if (!data) return <Empty />;

// ✅ Destructure props
export function Component({ title, description }: Props) {

// ✅ Use Convex hooks
const players = useQuery(api.players.getAll, {});
const followPlayer = useMutation(api.players.followPlayer);
```

### **TypeScript Patterns**
```typescript
// ✅ Import Convex types
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";

// ✅ Type component props
interface PlayerCardProps {
  playerId: Id<"players">;
  showStats?: boolean;
}

// ✅ Type Convex functions
export const getPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args): Promise<Player | null> => {
    return await ctx.db.get(args.playerId);
  }
});
```

---

## 📚 **Key Files Reference**

### **Most Important Files to Understand**

| File | Lines | Purpose | Complexity |
|------|-------|---------|-----------|
| `convex/schema.ts` | 215 | Database schema definition | ★★★★★ |
| `convex/courseStats.ts` | 450 | Inside the Ropes analytics | ★★★★☆ |
| `convex/players.ts` | 300 | Player queries/mutations | ★★★☆☆ |
| `app/page.tsx` | 423 | Landing page | ★★☆☆☆ |
| `app/inside-the-ropes/player-course-stats/page.tsx` | 599 | Course stats UI | ★★★★☆ |
| `components/player/PlayerStats.tsx` | 700+ | Player profile stats | ★★★★☆ |

### **Configuration Files**
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS theme
- `tsconfig.json` - TypeScript configuration
- `convex/tsconfig.json` - Convex TypeScript config

---

## 🎯 **Next Steps for Understanding**

1. **Start Here:** Read `convex/schema.ts` to understand data model
2. **Follow a Flow:** Trace `/players` route from UI → Convex → Database
3. **Inspect Components:** Open `components/player/PlayerStats.tsx` to see query usage
4. **Test Queries:** Use Convex dashboard to run queries interactively
5. **Explore Docs:** Read `docs/database/schema-map.md` for detailed schema info

---

**Last Updated:** January 2025
**Codebase Version:** 1.0
**Total Files:** ~100 TypeScript/React files
**Database:** 9 tables, 20K+ tournament results
