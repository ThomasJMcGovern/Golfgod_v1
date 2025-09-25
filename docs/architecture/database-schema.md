# Database Schema

GolfGod uses Convex as its backend database. This document describes the complete database schema and relationships.

## Schema Overview

```typescript
// Located in: /convex/schema.ts
```

## Tables

### 1. Players Table

Stores comprehensive player information including biographical data and rankings.

```typescript
players: defineTable({
  // Basic Information
  name: v.string(),              // Full name (e.g., "Tiger Woods")
  firstName: v.string(),         // First name
  lastName: v.string(),          // Last name

  // Location
  country: v.string(),           // Country name (e.g., "United States")
  countryCode: v.string(),       // ISO country code (e.g., "US")

  // Biographical Data
  birthDate: v.optional(v.string()),    // Birth date (YYYY-MM-DD)
  birthPlace: v.optional(v.string()),   // Birth location
  college: v.optional(v.string()),      // College attended
  swing: v.optional(v.string()),        // Swing type (Right/Left)
  turnedPro: v.optional(v.number()),    // Year turned professional

  // Physical Attributes
  height: v.optional(v.string()),       // Height (e.g., "6'1\"")
  weight: v.optional(v.string()),       // Weight (e.g., "185 lbs")

  // Media
  photoUrl: v.optional(v.string()),     // Player photo URL

  // Rankings
  worldRanking: v.optional(v.number()),  // Current world ranking (1-200+)
  tourRanking: v.optional(v.number()),   // PGA Tour ranking

  // External References
  espnId: v.optional(v.string()),       // ESPN player ID
})
```

**Indexes:**
- `by_name`: Search by player name
- `by_world_ranking`: Sort by world ranking
- `search_name`: Full-text search on name

### 2. Player Stats Table

Annual statistics for each player.

```typescript
playerStats: defineTable({
  playerId: v.id("players"),     // Reference to players table
  year: v.number(),               // Year (e.g., 2024)

  // Performance Metrics
  avgSgApp: v.optional(v.number()),      // Avg Strokes Gained: Approach
  fairwaysHit: v.optional(v.number()),   // Fairways Hit Percentage
  avgPutts: v.optional(v.number()),      // Average Putts per Round

  // Tournament Data
  tournaments: v.optional(v.number()),    // Tournaments played
  wins: v.optional(v.number()),          // Tournament wins
  top10s: v.optional(v.number()),        // Top 10 finishes

  // Financial
  earnings: v.optional(v.number()),      // Total earnings in USD
})
```

**Indexes:**
- `by_player`: Get stats by player ID
- `by_year`: Filter by year

### 3. Tournament Results Table

Individual tournament results for players.

```typescript
tournamentResults: defineTable({
  // Player Reference
  playerId: v.id("players"),      // Reference to players table
  playerName: v.string(),          // Denormalized for performance

  // Tournament Information
  year: v.number(),                // Tournament year
  date: v.string(),                // Date range (e.g., "Jul 18 - 21")
  tournament: v.string(),          // Tournament name

  // Results
  position: v.string(),            // Final position (e.g., "1", "T10", "MC")
  score: v.string(),               // Score relative to par (e.g., "-10")
  overall: v.string(),             // Total strokes (e.g., "270")
  earnings: v.number(),            // Prize money in USD
})
```

**Indexes:**
- `by_player`: Get results by player
- `by_tournament`: Get tournament leaderboards
- `by_year`: Filter by year

### 4. User Follows Table

Tracks which players users are following.

```typescript
userFollows: defineTable({
  userId: v.string(),              // User ID from auth system
  playerId: v.id("players"),      // Player being followed
  followedAt: v.number(),          // Timestamp when followed
})
```

**Indexes:**
- `by_user`: Get user's followed players
- `by_player`: Get player's followers

### 5. Authentication Tables

Convex Auth provides these tables automatically:

```typescript
users: defineTable({
  email: v.optional(v.string()),
  emailVerified: v.optional(v.boolean()),
  // ... other auth fields
})

sessions: defineTable({
  userId: v.id("users"),
  // ... session data
})
```

## Relationships

### Entity Relationship Diagram

```
┌──────────────┐
│   Players    │
└──────┬───────┘
       │ 1
       │
       ├────────────────┬─────────────────┬──────────────┐
       │ *              │ *               │ *            │ *
┌──────▼──────┐ ┌───────▼──────┐ ┌────────▼──────┐ ┌─────▼──────┐
│ PlayerStats │ │ Tournament   │ │  UserFollows  │ │    ...     │
│             │ │   Results    │ │               │ │            │
└─────────────┘ └──────────────┘ └───────────────┘ └────────────┘
```

### Key Relationships

1. **Players → PlayerStats** (One-to-Many)
   - Each player has multiple years of statistics
   - Linked via `playerId` field

2. **Players → TournamentResults** (One-to-Many)
   - Each player has multiple tournament results
   - Linked via `playerId` field

3. **Users → UserFollows → Players** (Many-to-Many)
   - Users can follow multiple players
   - Players can have multiple followers
   - UserFollows acts as junction table

## Data Types

### Position Values
- Numeric: `"1"`, `"2"`, `"3"`...
- Tied: `"T1"`, `"T10"`...
- Missed Cut: `"MC"` or `"Missed Cut"`
- Withdrew: `"WD"`
- Disqualified: `"DQ"`

### Country Codes
Standard mappings include:
- `"UNI"` → United States
- `"ENG"` → England
- `"SCO"` → Scotland
- `"AUS"` → Australia
- etc.

## Query Patterns

### Common Queries

1. **Get Player with Stats**
```typescript
const player = await ctx.db.get(playerId);
const stats = await ctx.db
  .query("playerStats")
  .withIndex("by_player", q => q.eq("playerId", playerId))
  .filter(q => q.eq(q.field("year"), 2024))
  .first();
```

2. **Search Players**
```typescript
const players = await ctx.db
  .query("players")
  .withSearchIndex("search_name", q => q.search("name", searchTerm))
  .take(10);
```

3. **Get Tournament Results**
```typescript
const results = await ctx.db
  .query("tournamentResults")
  .withIndex("by_player", q => q.eq("playerId", playerId))
  .collect();
```

## Data Validation

### Required Fields
- Players: `name`, `firstName`, `lastName`, `country`, `countryCode`
- PlayerStats: `playerId`, `year`
- TournamentResults: `playerId`, `playerName`, `year`, `tournament`
- UserFollows: `userId`, `playerId`, `followedAt`

### Constraints
- World rankings: 1-500+ (integer)
- Years: 1900-current year
- Earnings: Non-negative number
- Percentages: 0-100

## Migration Strategy

When updating schema:

1. Add new fields as optional
2. Deploy schema changes
3. Backfill data if needed
4. Make fields required if necessary
5. Update indexes as needed

## Performance Considerations

- **Denormalization**: `playerName` in `tournamentResults` for faster queries
- **Indexes**: Strategic indexes for common query patterns
- **Search Index**: Full-text search on player names
- **Pagination**: Use `.take()` for large result sets

## Security

- All queries require authentication (except public player data)
- User can only modify their own follows
- Admin functions protected by role checks
- Input validation on all mutations