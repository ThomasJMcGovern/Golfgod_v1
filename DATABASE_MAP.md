# GolfGod Database Relationship Map

**Single Source of Truth** for database schema, relationships, and query patterns.

---

## 🎯 Quick Schema Overview (30 seconds)

```
Players (200) → Tournament Results (20K+) → Round Stats (future)
   ↓                    ↓                        ↓
   ├─────────→ Player Course Stats (aggregated career data)
   │                    ↑
   │         Courses (54) ──────────┘
   │              ↓
   │              ├──→ courseWinners (winners since 2015)
   │              └──→ courseMajors (major championships)
   │
   └─────────→ Player Knowledge Hub (6 tables):
               - playerFamily (~200)
               - playerFamilyHistory (~400)
               - playerProfessional (~200)
               - playerNearbyCourses (~800)
               - playerInjuries (~300)
               - playerIntangibles (~600)
```

**Key Principle**: Data exists at 3 levels of granularity
1. **Raw** → `tournamentResults` (single tournament, aggregate score)
2. **Detailed** → `roundStats` (individual rounds with tee times)
3. **Aggregated** → `playerCourseStats` (career stats at course)
4. **Knowledge** → 6 player knowledge tables (biographical, career, injuries, intangibles)

---

## 📊 Entity Flow Diagram

```
┌─────────┐
│ players │ (200 records)
└────┬────┘
     │
     ├──→ tournamentResults (playerId) [20K+ records]
     │    │
     │    ├─ Stores: year, tournament, position, scores[], toPar, earnings
     │    │
     │    └──→ roundStats (tournamentResultId) [future: 80K+ records]
     │         └─ Stores: round (1-4), score, toPar, teeTime (AM/PM)
     │
     └──→ playerCourseStats (playerId) [2.7K records]
          └─ Stores: AGGREGATED career stats at course

┌─────────┐
│ courses │ (54 records)
└────┬────┘
     │
     ├──→ tournamentCourses (courseId) [mapping table]
     │    └─ Maps: tournamentName ↔ courseId ↔ yearRange
     │
     ├──→ tournamentResults (course field - string)
     │    └─ Links tournaments to courses
     │
     ├──→ roundStats (courseId)
     │
     └──→ playerCourseStats (courseId)
          └─ One record per player-course combination

┌──────────────────┐
│ pgaTournaments   │ (tournament schedule 2015-2026)
└──────────────────┘
     └─ Standalone: Schedule, winners, prize money
```

---

## 🔗 Table Connections (Parent → Child)

### **players**
```
players
├── tournamentResults (FK: playerId)
│   └── Contains: All tournament results for this player
├── roundStats (FK: playerId)
│   └── Contains: All individual rounds played
├── playerCourseStats (FK: playerId)
│   └── Contains: Aggregated stats at each course
└── userFollows (FK: playerId)
    └── Contains: Users following this player
```

### **courses**
```
courses
├── tournamentCourses (FK: courseId)
│   └── Contains: Tournament-to-course mappings
├── tournamentResults (field: course - string match)
│   └── Contains: Results at this course
├── roundStats (FK: courseId)
│   └── Contains: All rounds played at this course
├── playerCourseStats (FK: courseId)
│   └── Contains: All player stats at this course
├── courseWinners (FK: courseId)
│   └── Contains: Tournament winners since 2015
└── courseMajors (FK: courseId)
    └── Contains: Major championships hosted
```

### **tournamentResults**
```
tournamentResults
└── roundStats (FK: tournamentResultId)
    └── Contains: Round-by-round breakdown of this result
```

---

## 🎯 Query Patterns by Use Case

### **Use Case 1: Inside the Ropes - Player Course Stats**
**Goal**: Show Scottie Scheffler's career stats at TPC Scottsdale

```typescript
// Step 1: Get aggregated career stats (FASTEST)
const stats = await ctx.db
  .query("playerCourseStats")
  .withIndex("by_player_course", (q) =>
    q.eq("playerId", scottieId).eq("courseId", tpcScottsdaleId)
  )
  .first();

// Returns: { scoringAverage, roundsPlayed, wins, top10s, cutsMade, etc. }
```

**Why this table?** Pre-aggregated career stats, single record, instant response.

### **Use Case 2: Inside the Ropes - Tournament History**
**Goal**: Show year-by-year tournament results at a course

```typescript
// Step 1: Get all tournament results at this course
const results = await ctx.db
  .query("tournamentResults")
  .withIndex("by_player", (q) => q.eq("playerId", scottieId))
  .filter((q) => q.eq(q.field("course"), "TPC Scottsdale"))
  .collect();

// Returns: [{ year, tournament, position, scores: ["69","72","68","70"], toPar, earnings }]
```

**Why this table?** Historical tournament-level data with scores array.

### **Use Case 3: Split Stats - Round-Level Analysis**
**Goal**: Show Thu/Fri vs Sat/Sun, AM vs PM tee time splits

```typescript
// Step 1: Get all individual rounds
const rounds = await ctx.db
  .query("roundStats")
  .withIndex("by_player_course", (q) =>
    q.eq("playerId", scottieId).eq("courseId", tpcScottsdaleId)
  )
  .collect();

// Returns: [
//   { round: 1, score: 69, toPar: -2, teeTime: "AM" },
//   { round: 2, score: 72, toPar: +1, teeTime: "PM" },
//   ...
// ]

// Step 2: Calculate splits
const thuFri = rounds.filter(r => r.round === 1 || r.round === 2);
const satSun = rounds.filter(r => r.round === 3 || r.round === 4);
const amRounds = rounds.filter(r => r.teeTime === "AM");
const pmRounds = rounds.filter(r => r.teeTime === "PM");
```

**Why this table?** Round-level granularity with teeTime data.

### **Use Case 4: Player Profile - Tournament Results**
**Goal**: Show all tournaments for a player in 2024

```typescript
const results = await ctx.db
  .query("tournamentResults")
  .withIndex("by_player_year", (q) =>
    q.eq("playerId", scottieId).eq("year", 2024)
  )
  .collect();

// Returns: All 2024 tournaments with positions, scores, earnings
```

**Why this index?** Optimized for player + year queries (common pattern).

### **Use Case 5: Tournament Page - Leaderboard**
**Goal**: Show all players' results for 2024 Masters

```typescript
const leaderboard = await ctx.db
  .query("tournamentResults")
  .withIndex("by_tournament", (q) =>
    q.eq("tournament", "Masters Tournament")
  )
  .filter((q) => q.eq(q.field("year"), 2024))
  .collect();

// Sort by position
leaderboard.sort((a, b) => {
  const posA = parseInt(a.position.replace(/\D/g, '')) || 999;
  const posB = parseInt(b.position.replace(/\D/g, '')) || 999;
  return posA - posB;
});
```

---

## 📇 Complete Index Reference

### **players**
```typescript
.index("by_name", ["name"])              // Player search
.index("by_world_ranking", ["worldRanking"])  // Rankings page
.searchIndex("search_name", { searchField: "name" })  // Fuzzy search
```

**When to use**:
- `by_name`: Exact name lookups
- `by_world_ranking`: Rankings leaderboard
- `search_name`: Player search dropdown

### **tournamentResults**
```typescript
.index("by_player", ["playerId"])                    // All player results
.index("by_player_year", ["playerId", "year"])       // Player results by year
.index("by_tournament", ["tournament"])              // Tournament leaderboard
.index("by_year", ["year"])                          // All results in year
.index("by_player_name", ["playerName"])             // Denormalized name search
```

**When to use**:
- `by_player`: Player profile, career history
- `by_player_year`: Player stats for specific year
- `by_tournament`: Tournament leaderboard
- `by_year`: Year summary stats
- `by_player_name`: Search without player ID

### **roundStats**
```typescript
.index("by_player", ["playerId"])                           // All player rounds
.index("by_course", ["courseId"])                           // All course rounds
.index("by_tournament_result", ["tournamentResultId"])      // Rounds for result
.index("by_player_course", ["playerId", "courseId"])        // Player at course
.index("by_year", ["year"])                                 // Rounds in year
```

**When to use**:
- `by_player_course`: **PRIMARY** for Inside the Ropes split stats
- `by_tournament_result`: Expand single tournament to rounds
- `by_year`: Yearly round analysis

### **playerCourseStats**
```typescript
.index("by_player", ["playerId"])                    // All player courses
.index("by_course", ["courseId"])                    // All players at course
.index("by_player_course", ["playerId", "courseId"]) // Specific combo
```

**When to use**:
- `by_player_course`: **PRIMARY** for Inside the Ropes career stats
- `by_course`: Course leaderboard (best avg scores)

### **courses**
```typescript
.index("by_name", ["name"])  // Course lookup
```

### **courseWinners**
```typescript
.index("by_course", ["courseId"])              // All winners at course
.index("by_course_year", ["courseId", "year"]) // Winners by year
.index("by_year", ["year"])                    // Winners in year
```

**When to use**:
- `by_course`: Tournament winners since 2015 at course (default 50-100 limit)
- `by_course_year`: Specific year winner lookup
- `by_year`: All wins across courses in a year

### **courseMajors**
```typescript
.index("by_course", ["courseId"])  // Majors hosted at course
```

**When to use**:
- `by_course`: List all major championships hosted (typically 0-5 records per course)

### **pgaTournaments**
```typescript
.index("by_year", ["year"])                       // Year schedule
.index("by_winner", ["winner_espn_id"])           // Player wins
.index("by_tournament_id", ["tournament_id"])     // Unique lookup
.index("by_year_and_name", ["year", "name"])      // Specific tournament
.index("by_status", ["status"])                   // Completed vs scheduled
```

---

## 🎓 Player Knowledge Hub Tables

### Overview
Six tables storing comprehensive player biographical, career, and performance data. All tables are **small** (<1K records each), making them **safe for `.collect()` with indexes**.

### **playerFamily** - Personal Family Information
```typescript
{
  playerId: Id<"players">,
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed",
  spouseName?: string,
  spouseMarriedSince?: number,  // Year
  children?: Array<{ name: string, birthYear: number }>,
  lastUpdated: number
}
```

**Indexes**: `by_player` on `playerId`
**Table Size**: ~200 records (one per player, optional)
**Safe to .collect()**: ✅ Yes, with index

**Query Patterns**:
```typescript
// Get player's family info
const family = await ctx.db
  .query("playerFamily")
  .withIndex("by_player", (q) => q.eq("playerId", playerId))
  .first();
```

### **playerFamilyHistory** - Family Golf Background
```typescript
{
  playerId: Id<"players">,
  memberName: string,
  relationship: string,  // "Father", "Mother", "Brother", etc.
  golfLevel: "College" | "Professional" | "Amateur",
  achievements: string,
  yearsActive?: string,  // e.g., "1985-1995"
  lastUpdated: number
}
```

**Indexes**: `by_player`, `by_golf_level`
**Table Size**: ~400 records (2 avg per player)
**Safe to .collect()**: ✅ Yes, bounded by playerId

**Query Patterns**:
```typescript
// Get all family golf history for player
const history = await ctx.db
  .query("playerFamilyHistory")
  .withIndex("by_player", (q) => q.eq("playerId", playerId))
  .collect();  // Safe: ~2-5 records per player
```

### **playerProfessional** - Professional Career History
```typescript
{
  playerId: Id<"players">,
  currentStatus: "PGA Tour" | "Korn Ferry" | "DP World Tour" | "LIV Golf" | "Retired",
  tourCard?: number,         // Year obtained PGA Tour card
  rookieYear?: number,
  careerEarnings?: number,
  majorWins?: number,
  totalWins?: number,
  milestones: Array<{ year: number, achievement: string }>,
  lastUpdated: number
}
```

**Indexes**: `by_player`, `by_status`
**Table Size**: ~200 records (one per player)
**Safe to .collect()**: ✅ Yes, with index

**Query Patterns**:
```typescript
// Get professional career for player
const pro = await ctx.db
  .query("playerProfessional")
  .withIndex("by_player", (q) => q.eq("playerId", playerId))
  .first();

// Get all active PGA Tour players
const active = await ctx.db
  .query("playerProfessional")
  .withIndex("by_status", (q) => q.eq("currentStatus", "PGA Tour"))
  .collect();  // Safe: ~200 records, indexed
```

### **playerNearbyCourses** - Hometown & University Courses
```typescript
{
  playerId: Id<"players">,
  courseId: Id<"courses">,
  courseType: "Hometown" | "University",
  distanceMiles: number,           // Max 180 miles
  referenceLocation: string,       // City, State
  eventsPlayed?: number,
  avgScore?: number,
  bestFinish?: string,             // e.g., "1", "T-3"
  lastUpdated: number
}
```

**Indexes**: `by_player`, `by_player_type`, `by_course`
**Table Size**: ~800 records (4 avg per player)
**Safe to .collect()**: ✅ Yes, bounded by playerId

**Query Patterns**:
```typescript
// Get hometown courses for player
const hometown = await ctx.db
  .query("playerNearbyCourses")
  .withIndex("by_player_type", (q) =>
    q.eq("playerId", playerId).eq("courseType", "Hometown")
  )
  .collect();  // Safe: ~2-4 records per player

// Get university courses for player
const university = await ctx.db
  .query("playerNearbyCourses")
  .withIndex("by_player_type", (q) =>
    q.eq("playerId", playerId).eq("courseType", "University")
  )
  .collect();  // Safe: ~2-4 records per player
```

### **playerInjuries** - Injury History Tracking
```typescript
{
  playerId: Id<"players">,
  injuryType: string,              // e.g., "Back strain", "Wrist injury"
  affectedArea: string,            // Body part
  injuryDate: string,              // ISO date (YYYY-MM-DD)
  status: "Active" | "Recovering" | "Recovered",
  recoveryTimeline?: string,       // e.g., "4-6 weeks"
  tournamentsMissed?: number,
  impact?: string,
  returnDate?: string,             // ISO date
  lastUpdated: number
}
```

**Indexes**: `by_player`, `by_status`, `by_player_date`
**Table Size**: ~300 records (1.5 avg per player)
**Safe to .collect()**: ✅ Yes, bounded by playerId

**Query Patterns**:
```typescript
// Get all injuries for player (chronological)
const injuries = await ctx.db
  .query("playerInjuries")
  .withIndex("by_player_date", (q) => q.eq("playerId", playerId))
  .collect();  // Safe: ~1-3 records per player
// Sort: descending by injuryDate

// Get active injuries only
const active = injuries.filter(i => i.status === "Active" || i.status === "Recovering");
```

### **playerIntangibles** - Performance Factors
```typescript
{
  playerId: Id<"players">,
  category: "Weather" | "Course Type" | "Pressure" | "Tournament Size" | "Field Strength",
  subcategory?: string,            // e.g., "Wind", "Rain" for Weather
  description: string,
  performanceRating: "Outstanding" | "Excellent" | "Strong" | "Average" | "Weak" | "Poor",
  supportingStats?: string,        // Statistical evidence
  confidence?: "High" | "Medium" | "Low",
  lastUpdated: number
}
```

**Indexes**: `by_player`, `by_category`, `by_player_category`
**Table Size**: ~600 records (3 avg per player)
**Safe to .collect()**: ✅ Yes, bounded by playerId

**Query Patterns**:
```typescript
// Get all intangibles for player
const intangibles = await ctx.db
  .query("playerIntangibles")
  .withIndex("by_player", (q) => q.eq("playerId", playerId))
  .collect();  // Safe: ~3-6 records per player

// Get weather preferences specifically
const weather = await ctx.db
  .query("playerIntangibles")
  .withIndex("by_player_category", (q) =>
    q.eq("playerId", playerId).eq("category", "Weather")
  )
  .collect();  // Safe: ~1-2 records
```

### Knowledge Hub Query Decision Tree
```
Need player knowledge data?

├─ Family info (spouse, children)?
│  └─→ playerFamily.first()
│
├─ Family golf background?
│  └─→ playerFamilyHistory.collect() [bounded by playerId]
│
├─ Professional career timeline?
│  └─→ playerProfessional.first()
│
├─ Hometown courses?
│  └─→ playerNearbyCourses.collect() [filter: courseType="Hometown"]
│
├─ University courses?
│  └─→ playerNearbyCourses.collect() [filter: courseType="University"]
│
├─ Injury history?
│  └─→ playerInjuries.collect() [filter by status if needed]
│
└─ Performance intangibles?
   └─→ playerIntangibles.collect() [filter by category if needed]
```

---

## 📊 Data Granularity Guide

**"Which table should I query?"** - Decision tree:

```
START: What am I looking for?

├─ Career stats at a course?
│  └─→ playerCourseStats (pre-aggregated, FASTEST)
│
├─ Single tournament result?
│  └─→ tournamentResults.first() (aggregate score, position, earnings)
│
├─ Tournament history at a course?
│  └─→ tournamentResults.collect() + filter by course
│
├─ Round-by-round breakdown?
│  └─→ roundStats (individual rounds, tee times, detailed stats)
│
├─ Split stats (AM/PM, Thu-Fri/Sat-Sun)?
│  └─→ roundStats (ONLY table with teeTime field)
│
├─ Tournament schedule/winners?
│  └─→ pgaTournaments (schedule 2015-2026)
│
├─ Course information?
│  └─→ courses (name, location, par, yardage, architect, grass types, green size)
│
├─ Course winners since 2015?
│  └─→ courseWinners (year, tournament, winner, score, earnings)
│
├─ Top finishers at course in specific year?
│  └─→ Use tournamentResults with course filter + year + topN limit
│
└─ Major championships hosted?
   └─→ courseMajors (majorName, yearsHosted[], totalHosted)
```

---

## 🔑 Foreign Key Reference

| Child Table | Foreign Keys | Parent Tables | Relationship |
|-------------|--------------|---------------|--------------|
| `tournamentResults` | `playerId` | `players` | many-to-one |
| `tournamentResults` | `course` (string) | `courses.name` | many-to-one (loose) |
| `roundStats` | `playerId` | `players` | many-to-one |
| `roundStats` | `courseId` | `courses` | many-to-one |
| `roundStats` | `tournamentResultId` | `tournamentResults` | many-to-one |
| `playerCourseStats` | `playerId` | `players` | many-to-one |
| `playerCourseStats` | `courseId` | `courses` | many-to-one |
| `tournamentCourses` | `courseId` | `courses` | many-to-one |
| `userFollows` | `playerId` | `players` | many-to-one |
| `userFollows` | `userId` | `users` (auth) | many-to-one |
| `playerFamily` | `playerId` | `players` | one-to-one |
| `playerFamilyHistory` | `playerId` | `players` | many-to-one |
| `playerProfessional` | `playerId` | `players` | one-to-one |
| `playerNearbyCourses` | `playerId` | `players` | many-to-one |
| `playerNearbyCourses` | `courseId` | `courses` | many-to-one |
| `playerInjuries` | `playerId` | `players` | many-to-one |
| `playerIntangibles` | `playerId` | `players` | many-to-one |
| `courseWinners` | `courseId` | `courses` | many-to-one |
| `courseWinners` | `playerId` | `players` | many-to-one |
| `courseMajors` | `courseId` | `courses` | many-to-one |

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Querying Wrong Granularity
```typescript
// WRONG: Trying to get round scores from tournamentResults
const rounds = tournamentResults.scores; // ["69", "72", "68", "70"]
// This is aggregate! No tee times, no round metadata

// RIGHT: Query roundStats for round-level data
const rounds = await ctx.db.query("roundStats")...
```

### ❌ Mistake 2: Calculating Aggregates from Raw Data
```typescript
// WRONG: Calculating career average from all tournamentResults
const allResults = await ctx.db.query("tournamentResults")...
const avg = calculateAverage(allResults); // SLOW, wasteful

// RIGHT: Use pre-aggregated playerCourseStats
const stats = await ctx.db.query("playerCourseStats")
  .withIndex("by_player_course", ...)
  .first();
// stats.scoringAverage already calculated!
```

### ❌ Mistake 3: Forgetting courseId Filter
```typescript
// WRONG: Getting ALL player rounds everywhere
const rounds = await ctx.db.query("roundStats")
  .withIndex("by_player", (q) => q.eq("playerId", id))
  .collect();

// RIGHT: Filter by course for Inside the Ropes
const rounds = await ctx.db.query("roundStats")
  .withIndex("by_player_course", (q) =>
    q.eq("playerId", id).eq("courseId", courseId)
  )
  .collect();
```

### ❌ Mistake 4: Using Wrong Index
```typescript
// WRONG: Full table scan to find player's 2024 results
const results = await ctx.db.query("tournamentResults")
  .filter((q) =>
    q.eq(q.field("playerId"), id).eq(q.field("year"), 2024)
  )
  .collect();

// RIGHT: Use composite index
const results = await ctx.db.query("tournamentResults")
  .withIndex("by_player_year", (q) =>
    q.eq("playerId", id).eq("year", 2024)
  )
  .collect();
```

---

## 📝 Data Denormalization

**Fields duplicated for performance** (avoid joins):

### **tournamentResults**
- `playerName` (from `players.name`) - Display without join
- `course` (from `courses.name`) - Filter without join

**Why?** Leaderboards need player names frequently. Querying 100+ players.name individually would be slow.

### **roundStats**
- None currently - all relationships via IDs

---

## 🎨 Common Query Examples

### Example 1: Inside the Ropes - Full Player Profile
```typescript
export const getInsideTheRopesData = query({
  args: {
    playerId: v.id("players"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // 1. Get aggregated career stats (FAST)
    const careerStats = await ctx.db
      .query("playerCourseStats")
      .withIndex("by_player_course", (q) =>
        q.eq("playerId", args.playerId).eq("courseId", args.courseId)
      )
      .first();

    // 2. Get tournament history (MODERATE)
    const course = await ctx.db.get(args.courseId);
    const tournamentHistory = await ctx.db
      .query("tournamentResults")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("course"), course!.name))
      .collect();

    // 3. Get round-level data for splits (FUTURE)
    const rounds = await ctx.db
      .query("roundStats")
      .withIndex("by_player_course", (q) =>
        q.eq("playerId", args.playerId).eq("courseId", args.courseId)
      )
      .collect();

    return {
      careerStats,      // Aggregated
      tournamentHistory, // Tournament-level
      rounds,           // Round-level (when populated)
    };
  },
});
```

### Example 2: Calculate Split Stats
```typescript
export const getPlayerSplitStats = query({
  args: {
    playerId: v.id("players"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const rounds = await ctx.db
      .query("roundStats")
      .withIndex("by_player_course", (q) =>
        q.eq("playerId", args.playerId).eq("courseId", args.courseId)
      )
      .collect();

    // Calculate splits
    const thuFri = rounds.filter(r => r.round === 1 || r.round === 2);
    const satSun = rounds.filter(r => r.round === 3 || r.round === 4);
    const amWave = rounds.filter(r => r.teeTime === "AM");
    const pmWave = rounds.filter(r => r.teeTime === "PM");

    const avg = (arr: typeof rounds) =>
      arr.reduce((sum, r) => sum + r.score, 0) / arr.length;

    return {
      thursdayFriday: { avg: avg(thuFri), rounds: thuFri.length },
      saturdaySunday: { avg: avg(satSun), rounds: satSun.length },
      amWave: { avg: avg(amWave), rounds: amWave.length },
      pmWave: { avg: avg(pmWave), rounds: pmWave.length },
      earlyWeekendDiff: avg(thuFri) - avg(satSun),
      amPmDiff: avg(amWave) - avg(pmWave),
    };
  },
});
```

---

## 🚀 Performance Tips

### 1. Always Use Indexes
```typescript
// ❌ BAD: Full table scan
.filter((q) => q.eq(q.field("playerId"), id))

// ✅ GOOD: Use index
.withIndex("by_player", (q) => q.eq("playerId", id))
```

### 2. Limit Result Sets
```typescript
// ❌ BAD: .collect() on large table
const allResults = await ctx.db.query("tournamentResults").collect();

// ✅ GOOD: .take(limit) with reasonable limit
const results = await ctx.db.query("tournamentResults").take(100);
```

### 3. Use Pre-Aggregated Tables
```typescript
// ❌ BAD: Calculate from raw data every time
const allRounds = await ctx.db.query("roundStats")...
const avgScore = calculateAverage(allRounds);

// ✅ GOOD: Use playerCourseStats
const stats = await ctx.db.query("playerCourseStats")...
// stats.scoringAverage already computed
```

### 4. Collect Only When Safe
Safe to use `.collect()`:
- `players` (200 records, indexed)
- `courses` (54 records)
- `by_player` queries on `tournamentResults` (~200-500 per player)
- `by_player_course` queries on `roundStats` (bounded by player + course)
- `by_course` queries on `courseWinners` (~10-50 per course)
- `by_course` queries on `courseMajors` (~0-5 per course)
- **Player Knowledge Hub tables** (all <1K records, bounded by playerId):
  - `playerFamily` (~200 records, one per player)
  - `playerFamilyHistory` (~400 records, ~2 per player)
  - `playerProfessional` (~200 records, one per player)
  - `playerNearbyCourses` (~800 records, ~4 per player)
  - `playerInjuries` (~300 records, ~1.5 per player)
  - `playerIntangibles` (~600 records, ~3 per player)

NOT safe to use `.collect()`:
- All `tournamentResults` (20K+ records)
- All `roundStats` (future: 80K+ records)
- All `courseWinners` (unbounded, use `.take(limit)`)

---

## 📅 Schema Version History

**Current Version**: 1.2 (January 2025)

**Recent Changes (v1.2)**:
- ✅ Added **Tournament Course Explorer** - Course-focused navigation for tournament pages:
  - Extended `courses` table with: `architect`, `grassGreens`, `grassFairways`, `avgGreenSize`, `bunkerSandType`, `scorecardPar[]`, `scorecardYardage[]`
  - `courseWinners` - Tournament winners since 2015 at each course
  - `courseMajors` - Major championships hosted at each course
- ✅ Added 6 new course category pages: info, scorecard, conditions, winners, top-finishers, majors
- ✅ Added CourseSelect component and TournamentCourseExplorer navigation
- ✅ Added 5 new indexes for course queries (`courseWinners.by_course`, `courseWinners.by_course_year`, `courseWinners.by_year`, `courseMajors.by_course`)

**Previous Changes (v1.1)**:
- ✅ Added **Player Knowledge Hub** - 6 new tables for comprehensive player data:
  - `playerFamily` - Personal family information (marital status, spouse, children)
  - `playerFamilyHistory` - Family members with golf backgrounds
  - `playerProfessional` - Professional career timeline and achievements
  - `playerNearbyCourses` - Hometown and university courses within 180 miles
  - `playerInjuries` - Injury history tracking with recovery status
  - `playerIntangibles` - Performance factors (weather, course type, pressure)
- ✅ Added 12 new indexes optimized for player knowledge queries
- ✅ All new tables are small (<1K records) - safe for `.collect()` with indexes

**Original (v1.0)**:
- Added `roundStats` table (schema defined, data pending)
- Added `courses`, `tournamentCourses`, `playerCourseStats` tables
- Added `by_player_course` composite indexes
- Added `teeTime` field to `roundStats` for AM/PM splits

**Pending**:
- Populate `roundStats` with historical round data
- Add tee time data from ESPN/PGA Tour API
- Add weather conditions to `roundStats`

---

## 🔄 Data Flow Summary

```
ESPN/PGA Tour API
        ↓
Import Scripts (Python/JS)
        ↓
┌───────────────────────┐
│  RAW DATA LAYER       │
│  - tournamentResults  │ ← Single tournament, aggregate scores
└───────────────────────┘
        ↓
┌───────────────────────┐
│  DETAILED DATA LAYER  │
│  - roundStats         │ ← Round-by-round, tee times, conditions
└───────────────────────┘
        ↓
┌───────────────────────┐
│  AGGREGATED LAYER     │
│  - playerCourseStats  │ ← Career stats (calculated via mutation)
└───────────────────────┘
        ↓
Inside the Ropes UI
```

**Key Insight**: Data exists at 3 layers. Query the appropriate layer for your use case.

---

## 📞 When to Update This Document

Update DATABASE_MAP.md when you:
- ✅ Add a new table
- ✅ Add a new index
- ✅ Change a relationship
- ✅ Add a new query pattern
- ✅ Discover a common mistake to avoid

**This is a living document** - keep it in sync with schema changes!

---

**Last Updated**: January 2025
**Maintained By**: Development Team
**Schema File**: `convex/schema.ts`
