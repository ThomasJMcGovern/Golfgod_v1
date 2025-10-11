# GolfGod Database Relationship Map

**Single Source of Truth** for database schema, relationships, and query patterns.

---

## 🎯 Quick Schema Overview (30 seconds)

```
Players (200) → Tournament Results (20K+) → Round Stats (future)
   ↓                    ↓                        ↓
   └─────────→ Player Course Stats (aggregated career data)
                        ↑
Courses (54) ──────────┘
```

**Key Principle**: Data exists at 3 levels of granularity
1. **Raw** → `tournamentResults` (single tournament, aggregate score)
2. **Detailed** → `roundStats` (individual rounds with tee times)
3. **Aggregated** → `playerCourseStats` (career stats at course)

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
└── playerCourseStats (FK: courseId)
    └── Contains: All player stats at this course
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

### **pgaTournaments**
```typescript
.index("by_year", ["year"])                       // Year schedule
.index("by_winner", ["winner_espn_id"])           // Player wins
.index("by_tournament_id", ["tournament_id"])     // Unique lookup
.index("by_year_and_name", ["year", "name"])      // Specific tournament
.index("by_status", ["status"])                   // Completed vs scheduled
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
└─ Course information?
   └─→ courses (name, location, par, yardage)
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

NOT safe to use `.collect()`:
- All `tournamentResults` (20K+ records)
- All `roundStats` (future: 80K+ records)

---

## 📅 Schema Version History

**Current Version**: 1.0 (January 2025)

**Recent Changes**:
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
