# GolfGod Visual Architecture

**Interactive diagrams** showing how all the pieces fit together.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Landing   │  │   Players   │  │ Tournaments  │  │  Inside  │ │
│  │    Page     │  │   Browser   │  │   Browser    │  │the Ropes │ │
│  └─────────────┘  └─────────────┘  └──────────────┘  └──────────┘ │
│                                                                      │
│  Built with: Next.js 15 (App Router) + React 19 + TypeScript       │
│  Styling: Tailwind CSS + shadcn/ui components                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           │ useQuery() / useMutation()
                           │ Real-time WebSocket Connection
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│                      CONVEX BACKEND                                  │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ players  │  │tournament│  │  course  │  │   auth   │          │
│  │   .ts    │  │Results.ts│  │ Stats.ts │  │   .ts    │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                      │
│  Functions: queries (read), mutations (write), actions (external)   │
│  Serverless, auto-scales, real-time reactive queries               │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           │ ctx.db.query() / ctx.db.insert()
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│                       CONVEX DATABASE                                │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐               │
│  │   players   │  │ tournament   │  │   courses   │               │
│  │  (~200)     │  │   Results    │  │   (~54)     │               │
│  └─────────────┘  │   (20K+)     │  └─────────────┘               │
│                   └──────────────┘                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐               │
│  │  player     │  │     pga      │  │ tournament  │               │
│  │ CourseStats │  │ Tournaments  │  │  Courses    │               │
│  │  (~2.7K)    │  │   (~100)     │  │ (mapping)   │               │
│  └─────────────┘  └──────────────┘  └─────────────┘               │
│                                                                      │
│  Real-time reactive database with automatic sync                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Frontend Architecture

```
app/ (Next.js App Router)
│
├─ layout.tsx ─────────────────────────┐
│   └─ ConvexClientProvider            │  Global Layout
│       └─ ThemeProvider                │
│           └─ {children}               │
│                                       │
├─ page.tsx ──────────────────────────┐│
│   Landing Page Components:          ││
│   ├─ Hero Section                   ││  Pages
│   ├─ Features (FeatureCard x4)      ││
│   ├─ How It Works                   ││
│   ├─ Testimonials                   ││
│   ├─ Pricing                        ││
│   └─ Footer                         ││
│                                     ││
├─ signin/page.tsx                    ││
│   └─ Auth Dialog (Email + Google)  ││
│                                     ││
├─ players/page.tsx                   ││
│   ├─ SearchableSelect (200 players)││
│   ├─ PlayerCard x N                 ││
│   └─ PlayerStats Modal              ││
│                                     ││
├─ tournaments/pga/[year]/page.tsx    ││
│   ├─ Year Selector (2015-2026)     ││
│   └─ Tournament List                ││
│                                     ││
├─ inside-the-ropes/                  ││
│   ├─ page.tsx (Hub)                 ││
│   │   └─ FeatureCard x5             ││
│   └─ player-course-stats/page.tsx   ││
│       ├─ Player Selector            ││
│       ├─ Course Selector            ││
│       └─ Tabs:                      ││
│           ├─ Course Stats           ││
│           └─ Tournament History     ││
│                                     ││
└─ admin/database-schema/page.tsx     ││
    └─ Interactive Schema Graph      ─┘│
                                       │
components/                            │  Reusable Components
├─ layout/                             │
│   ├─ Dashboard.tsx ──────────────────┘
│   ├─ UserMenu.tsx
│   └─ ConvexClientProvider.tsx
├─ player/
│   ├─ PlayerSelect.tsx (react-select)
│   ├─ PlayerStats.tsx (22KB, comprehensive)
│   ├─ PlayerBio.tsx
│   └─ PlayerRankings.tsx
├─ landing/
│   ├─ FeatureCard.tsx
│   ├─ HowItWorks.tsx
│   └─ StatsBar.tsx
└─ ui/ (25 shadcn components)
    ├─ button, card, dialog, tabs...
    └─ searchable-select
```

---

## 🔌 Backend Function Architecture

```
convex/
│
├─ schema.ts ─────────────┐
│   Defines 9 tables      │  Schema Definition
│   + indexes + types     │
│                         │
├─ players.ts ────────────┤
│   ┌─ Queries (10)      │
│   │  ├─ getAllPlayers()│
│   │  ├─ getPlayer()    │  Player Module
│   │  ├─ getWorldRankings()
│   │  └─ getUserFollows()│
│   └─ Mutations (5)     │
│      ├─ followPlayer() │
│      └─ updatePlayerBio()
│                         │
├─ tournamentResults.ts ──┤
│   ┌─ Queries (4)       │  Tournament Results Module
│   │  ├─ getPlayerTournamentResults()
│   │  └─ getTournamentResults()
│   └─ Mutations (7)     │
│      ├─ importResultsJSON()
│      └─ deleteAllTournamentResults()
│                         │
├─ courseStats.ts ────────┤
│   ┌─ Queries (6)       │  Course Analytics Module
│   │  ├─ getAllCourses()│
│   │  ├─ getPlayerCourseStats()
│   │  └─ getPlayerTournamentHistoryAtCourse()
│   └─ Mutations (4)     │
│      ├─ calculatePlayerCourseStats()
│      └─ seedPopularCourses()
│                         │
├─ tournaments.ts ────────┤
│   ┌─ Queries (3)       │  PGA Schedule Module
│   │  ├─ getTournamentsByYear()
│   │  └─ getAllTournaments()
│   └─ Mutations (1)     │
│      └─ importTournaments()
│                         │
├─ auth.ts ──────────────┤
│   Convex Auth setup    │  Authentication
│   Email + Google OAuth │
│                         │
└─ utils/                 │
    └─ dataProcessing.ts ─┘  Helper Functions
```

---

## 🗄️ Database Entity Relationships

```
┌─────────────┐
│   players   │────────┐
│   (~200)    │        │
└─────────────┘        │
      │                │
      │ playerId       │ playerId
      ▼                ▼
┌──────────────┐  ┌────────────────┐
│ tournament   │  │  userFollows   │
│   Results    │  │  (auth users)  │
│   (20K+)     │  └────────────────┘
└──────────────┘
      │
      │ tournamentResultId
      ▼
┌──────────────┐
│  roundStats  │
│  (future)    │
└──────────────┘


┌─────────────┐
│   courses   │────────┐
│   (~54)     │        │
└─────────────┘        │
      │                │
      │ courseId       │ courseId
      ▼                ▼
┌──────────────┐  ┌────────────────┐
│ tournament   │  │ playerCourse   │
│   Courses    │  │     Stats      │
│  (mapping)   │  │    (~2.7K)     │
└──────────────┘  └────────────────┘
      │                ▲
      │ tournamentName │ playerId
      │                │
      ▼                │
┌──────────────┐       │
│     pga      │       │
│ Tournaments  │       │
│   (~100)     │       │
└──────────────┘       │
                       │
┌─────────────┐        │
│   players   │────────┘
└─────────────┘
```

**Legend:**
- `───>` One-to-Many relationship
- `playerId` Foreign key reference
- `(~200)` Approximate record count

---

## 🔄 Data Flow: Inside the Ropes Feature

### User Journey
```
1. User navigates to /inside-the-ropes/player-course-stats

2. Component mounts:
   ┌─────────────────────────────────────┐
   │ PlayerCourseStatsPage.tsx           │
   │                                     │
   │ useQuery(api.courseStats.getAllCourses)
   │ useQuery(api.players.getAll)        │
   └─────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────┐
   │ Convex Backend                      │
   │                                     │
   │ courseStats.getAllCourses()         │
   │ └─> ctx.db.query("courses")         │
   │     .withIndex("by_name")           │
   │     .collect()  // Safe: ~54 records│
   │                                     │
   │ players.getAll()                    │
   │ └─> ctx.db.query("players")         │
   │     .withIndex("by_name")           │
   │     .collect()  // Safe: ~200 records
   └─────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────┐
   │ UI renders dropdowns                │
   │ ├─ SearchableSelect (players)       │
   │ └─ SearchableSelect (courses)       │
   └─────────────────────────────────────┘

3. User selects player + course:

   ┌─────────────────────────────────────┐
   │ State updates:                      │
   │ setSelectedPlayer(playerId)         │
   │ setSelectedCourse(courseId)         │
   └─────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────┐
   │ useQuery auto-triggers:             │
   │                                     │
   │ api.courseStats.getPlayerCourseStats│
   │   { playerId, courseId }            │
   │                                     │
   │ api.courseStats.getPlayerTournament │
   │   HistoryAtCourse                   │
   │   { playerId, courseId }            │
   └─────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────┐
   │ Convex Backend Queries              │
   │                                     │
   │ Query 1: playerCourseStats          │
   │ └─> .withIndex("by_player_course")  │
   │     .first()  // Single record      │
   │                                     │
   │ Query 2: tournamentResults          │
   │ └─> .withIndex("by_player")         │
   │     .filter(course === courseName)  │
   │     .collect()  // Bounded by player│
   └─────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────┐
   │ UI renders results:                 │
   │                                     │
   │ ┌─ Course Stats Tab ───────────┐   │
   │ │ ├─ Scoring Average: 69.8      │   │
   │ │ ├─ Rounds Played: 24          │   │
   │ │ ├─ Wins: 2, Top-10s: 5        │   │
   │ │ ├─ Round Breakdowns (R1-R4)   │   │
   │ │ └─ Early vs Weekend Scoring   │   │
   │ └───────────────────────────────┘   │
   │                                     │
   │ ┌─ Tournament History Tab ──────┐   │
   │ │ Table with rows:              │   │
   │ │ ┌───────────────────────────┐ │   │
   │ │ │ 2024 | T-3 | 69-72-68-70  │ │   │
   │ │ │ 2023 | 1   | 67-70-69-67  │ │   │
   │ │ │ 2022 | MC  | 74-72        │ │   │
   │ │ └───────────────────────────┘ │   │
   │ └───────────────────────────────┘   │
   └─────────────────────────────────────┘

4. Data stays synced in real-time:
   - Any updates to database → UI auto-updates
   - No manual refetching needed
   - WebSocket connection maintained by Convex
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Landing Page                          │
│                                                          │
│  User clicks "Get Started" or "Sign In"                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Authentication Dialog                       │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Email/Password │  │  Google OAuth   │              │
│  │                 │  │                 │              │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │              │
│  │ │ Email Input │ │  │ │   Sign in   │ │              │
│  │ │ Pass Input  │ │  │ │ with Google │ │              │
│  │ │   Submit    │ │  │ └─────────────┘ │              │
│  │ └─────────────┘ │  │                 │              │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                        │
└───────────┼────────────────────┼────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│              Convex Auth Backend                         │
│                                                          │
│  ┌──────────────────┐  ┌────────────────────┐          │
│  │ Password Provider│  │  Google Provider   │          │
│  │                  │  │                    │          │
│  │ ├─ Hash password │  │ ├─ OAuth redirect  │          │
│  │ ├─ Verify email  │  │ ├─ Verify token    │          │
│  │ └─ Create user   │  │ └─ Link account    │          │
│  └──────────────────┘  └────────────────────┘          │
│                                                          │
│  Creates/updates:                                        │
│  ├─ users table (email, name, image)                    │
│  ├─ authSessions table (tokens, expiry)                 │
│  └─ authAccounts table (provider links)                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Authenticated Session                       │
│                                                          │
│  Frontend receives:                                      │
│  ├─ JWT token (stored in HTTP-only cookie)              │
│  ├─ User object (id, email, name, image)                │
│  └─ WebSocket connection (authenticated)                │
│                                                          │
│  All subsequent queries include auth context:            │
│  └─> ctx.auth.getUserIdentity()                         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Application                             │
│                                                          │
│  <Authenticated>                                         │
│    └─ Dashboard with user menu                          │
│    └─ Player following enabled                          │
│    └─ Personalized features                             │
│  </Authenticated>                                        │
│                                                          │
│  <Unauthenticated>                                       │
│    └─ Limited features / Public view                    │
│  </Unauthenticated>                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Component Composition Example

### PlayerStats Component Breakdown

```
PlayerStats.tsx (700+ lines)
│
├─ Props:
│   ├─ playerId: Id<"players">
│   └─ showFullDetails?: boolean
│
├─ Queries:
│   ├─ useQuery(api.players.getPlayer, { playerId })
│   ├─ useQuery(api.players.getPlayerStats, { playerId })
│   └─ useQuery(api.tournamentResults.getPlayerTournamentResults, { playerId })
│
└─ Renders:
    │
    ├─ <Card> Player Header
    │   ├─ <Avatar> Player Photo
    │   ├─ Player Name + Country Flag
    │   └─ World Ranking Badge
    │
    ├─ <Card> Biography
    │   ├─ Birth Date & Place
    │   ├─ College
    │   ├─ Turned Pro
    │   └─ Physical Stats (Height/Weight)
    │
    ├─ <Card> Annual Statistics
    │   ├─ <Tabs> Years (2024, 2023, 2022...)
    │   └─ For each year:
    │       ├─ Tournaments Played
    │       ├─ Wins / Top-10s
    │       ├─ Earnings
    │       └─ SG:APP, Fairways, Putts
    │
    └─ <Card> Recent Tournament Results
        ├─ <Table>
        │   └─ Rows:
        │       ├─ Tournament Name
        │       ├─ Position (with Badge)
        │       ├─ Score
        │       └─ Earnings
        │
        └─ <Pagination> (if > 20 results)
```

**Component Dependencies:**
```
PlayerStats.tsx
  ├─ imports from "@/components/ui"
  │   ├─ Card, CardHeader, CardTitle, CardContent
  │   ├─ Avatar, AvatarImage, AvatarFallback
  │   ├─ Badge
  │   ├─ Tabs, TabsList, TabsTrigger, TabsContent
  │   ├─ Table, TableHeader, TableRow, TableCell
  │   └─ Skeleton (loading state)
  │
  ├─ imports from "convex/react"
  │   └─ useQuery
  │
  ├─ imports from "lucide-react"
  │   ├─ Trophy, Target, DollarSign
  │   └─ TrendingUp, Award
  │
  └─ imports from "@/convex/_generated/api"
      └─ api.players, api.tournamentResults
```

---

## 🚀 Performance Optimization Strategy

```
Frontend Optimizations:
├─ Next.js 15 App Router
│   ├─ Server Components (default)
│   ├─ Client Components (interactive only)
│   ├─ Automatic code splitting
│   └─ Image optimization (next/image)
│
├─ React 19 Features
│   ├─ Suspense for data fetching
│   ├─ Concurrent rendering
│   └─ Automatic batching
│
└─ Convex Real-time
    ├─ WebSocket connection (1 per client)
    ├─ Automatic query caching
    ├─ Optimistic updates
    └─ Reactive queries (no polling)

Backend Optimizations:
├─ Database Indexes
│   ├─ by_player (fast player lookups)
│   ├─ by_player_year (year filtering)
│   ├─ by_player_course (course stats)
│   └─ search_name (fuzzy search)
│
├─ Query Limits
│   ├─ Always use .take(limit)
│   ├─ Default: 100, max: 500
│   └─ Small tables: .collect() OK
│
└─ Data Denormalization
    ├─ playerName in tournamentResults
    ├─ Aggregated playerCourseStats
    └─ Avoid N+1 queries

Bandwidth Optimization:
├─ Truncate log files (cleared 3MB)
├─ Smart pagination (100-500 per page)
├─ Bounded queries (never .collect() on 20K+ table)
└─ WebSocket compression
```

---

## 🔍 Debugging & Development Tools

```
Development Environment:
├─ Convex Dashboard (npx convex dashboard)
│   ├─ Query runner (test queries)
│   ├─ Table browser (view data)
│   ├─ Function logs (debug errors)
│   └─ Health metrics (bandwidth usage)
│
├─ Next.js DevTools
│   ├─ Fast Refresh (instant updates)
│   ├─ Error overlay (clear errors)
│   └─ Build analyzer
│
└─ Browser DevTools
    ├─ React DevTools (component tree)
    ├─ Network tab (query inspection)
    └─ Console (Convex logs)

Logging Strategy:
├─ Frontend: console.log for development
├─ Backend: Return descriptive errors
├─ Convex: Built-in function logs
└─ Production: Error boundaries
```

---

## 📊 Metrics & Monitoring

```
Key Metrics to Monitor:
├─ Convex Dashboard
│   ├─ Bandwidth usage (1GB/month free tier)
│   ├─ Documents read (4,096 per query limit)
│   ├─ Function execution time
│   └─ Error rate
│
├─ Vercel Analytics
│   ├─ Page load times
│   ├─ Core Web Vitals
│   └─ User sessions
│
└─ Database Health
    ├─ Table sizes (tournamentResults = largest)
    ├─ Index usage
    └─ Query performance

Alerts:
├─ Bandwidth >75% → Optimize queries
├─ Error rate >1% → Investigate logs
└─ Load time >3s → Performance audit
```

---

**Last Updated:** January 2025
**Diagram Format:** ASCII art for universal compatibility
