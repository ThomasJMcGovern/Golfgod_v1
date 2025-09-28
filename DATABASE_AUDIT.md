# Convex Database Audit - GolfGod PGA Analytics

## Database Schema Overview

### Total Tables: 11 (5 Application + 6 Authentication)

The database includes both custom application tables and Convex Auth system tables.

#### 1. **`players`** - Main Player Registry
**Purpose**: Store PGA Tour player profiles and rankings

**Fields**:
- `name`: string - Full player name
- `firstName`: string
- `lastName`: string
- `country`: string
- `countryCode`: string
- `birthDate`: optional string
- `birthPlace`: optional string
- `college`: optional string
- `swing`: optional "Right" | "Left"
- `turnedPro`: optional number
- `height`: optional string (e.g., "6'1"")
- `weight`: optional string (e.g., "185 lbs")
- `photoUrl`: optional string
- `worldRanking`: optional number - Current world golf ranking
- `tourRanking`: optional number - PGA Tour ranking
- `espnId`: optional string - ESPN player ID for data sync

**Indexes**:
- `by_name`: For quick name lookups
- `by_world_ranking`: For ranking queries
- `search_name`: Full-text search on player names

**Current Data**: 100 PGA Tour players imported

---

#### 2. **`tournamentResults`** - Tournament Performance Data
**Purpose**: Store detailed tournament results for each player

**Fields**:
- `playerId`: ID reference to `players` table (FOREIGN KEY)
- `playerName`: string - Denormalized for performance
- `year`: number - Tournament year
- `date`: string - Tournament dates
- `tournament`: string - Tournament name
- `course`: optional string - Golf course name
- `position`: string - Final position (e.g., "T1", "2", "Missed Cut")
- `scores`: optional array of strings - Round scores ["69", "72", "71", "70"]
- `totalScore`: optional number - Total strokes (e.g., 282)
- `toPar`: optional number - Score relative to par (e.g., -6)
- `score`: string - Display score (e.g., "-10" or "E")
- `overall`: string - Display total (e.g., "282")
- `earnings`: optional number - Prize money won

**Indexes**:
- `by_player`: Query all results for a player
- `by_player_year`: Player results by year
- `by_tournament`: All results for a tournament
- `by_year`: All results in a year
- `by_player_name`: Query by player name

**Current Data**: ~15,000 tournament results (2015-2025)

**Relationships**:
- Many-to-One with `players` (via `playerId`)
- Each player has multiple tournament results

---

#### 3. **`playerStats`** - Aggregated Performance Statistics
**Purpose**: Store yearly statistical summaries for players

**Fields**:
- `playerId`: ID reference to `players` table (FOREIGN KEY)
- `year`: number - Statistical year
- `avgSgApp`: optional number - Average Strokes Gained: Approach
- `fairwaysHit`: optional number - Fairways hit percentage
- `avgPutts`: optional number - Average putts per round
- `tournaments`: optional number - Tournaments played
- `wins`: optional number - Tournament wins
- `top10s`: optional number - Top 10 finishes
- `earnings`: optional number - Total yearly earnings

**Indexes**:
- `by_player_year`: Query stats by player and year

**Current Data**: Limited (needs population from tournament results)

**Relationships**:
- One-to-One with `players` per year (via `playerId`)
- Derived from `tournamentResults` data

---

#### 4. **`userFollows`** - User-Player Following System
**Purpose**: Track which players users are following

**Fields**:
- `userId`: string - User identifier
- `playerId`: ID reference to `players` table (FOREIGN KEY)
- `followedAt`: number - Timestamp when followed

**Indexes**:
- `by_user`: All players a user follows
- `by_user_player`: Check if user follows specific player

**Current Data**: Empty (feature not yet active)

**Relationships**:
- Many-to-Many between users and `players` (via `playerId`)

---

#### 5. **`numbers`** - Legacy/Demo Table
**Purpose**: Original demo table from Convex setup

**Fields**:
- `value`: number

**Current Data**: Minimal/test data
**Status**: Can be removed in cleanup

---

### Authentication Tables (from @convex-dev/auth)

When you include `...authTables` in your Convex schema (which you have in `convex/schema.ts`), Convex Auth automatically creates 6 tables for authentication management:

#### 6. **`authAccounts`** - External Authentication Providers
**Purpose**: Links users to external auth providers (OAuth, etc.)

**Fields**:
- `userId`: ID - Reference to the authenticated user
- `provider`: string - Provider name (e.g., "github", "google")
- `providerAccountId`: string - User's ID at the provider
- `accessToken`: optional string - OAuth access token
- `refreshToken`: optional string - OAuth refresh token
- `accessTokenExpiresAt`: optional number - Token expiration timestamp
- `scope`: optional string - OAuth scopes granted

**Current Data**: Depends on auth providers configured

---

#### 7. **`authSessions`** - Active User Sessions
**Purpose**: Manages active user sessions and authentication state

**Fields**:
- `userId`: ID - Reference to the authenticated user
- `sessionToken`: string - Unique session identifier
- `expiresAt`: number - Session expiration timestamp

**Current Data**: Active when users are logged in

---

#### 8. **`authVerificationCodes`** - Email/SMS Verification
**Purpose**: Temporary codes for email/phone verification

**Fields**:
- `accountId`: string - Account being verified
- `code`: string - Verification code
- `expiresAt`: number - Code expiration timestamp
- `emailVerified`: optional boolean

**Current Data**: Temporary, cleared after use

---

#### 9. **`authVerifiers`** - Password & Credential Storage
**Purpose**: Stores hashed passwords and authentication credentials

**Fields**:
- `identifier`: string - Email or username
- `secret`: optional string - Hashed password
- `accountId`: ID - Associated account

**Current Data**: One per user with password auth

---

#### 10. **`authRefreshTokens`** - Token Refresh Management
**Purpose**: Manages refresh tokens for maintaining sessions

**Fields**:
- `sessionId`: ID - Reference to session
- `refreshToken`: string - Refresh token value
- `expiresAt`: number - Token expiration

**Current Data**: Active for authenticated sessions

---

#### 11. **`authRateLimits`** - Rate Limiting & Security
**Purpose**: Prevents brute force attacks and abuse

**Fields**:
- `identifier`: string - IP or user identifier
- `kind`: string - Type of rate limit
- `count`: number - Request count
- `resetAt`: number - When limit resets

**Current Data**: Automatically managed by Convex Auth

---

## Table Relationships Diagram

### Application Tables
```
┌─────────────────┐
│    players      │◄────────┐
│                 │         │
│ - name          │         │ playerId (FK)
│ - worldRanking  │         │
│ - espnId        │         │
└────────┬────────┘         │
         │                  │
         │ playerId (FK)    │
         ▼                  │
┌─────────────────┐         │
│ tournamentResults│        │
│                 │         │
│ - tournament    │         │
│ - position      │         │
│ - earnings      │         │
└─────────────────┘         │
         │                  │
         │ Aggregates to    │
         ▼                  │
┌─────────────────┐         │
│  playerStats    │◄────────┘
│                 │
│ - avgSgApp      │
│ - wins          │
│ - earnings      │
└─────────────────┘

┌─────────────────┐
│  userFollows    │
│                 │
│ - userId        │
│ - playerId ─────┼────────► players
│ - followedAt    │
└─────────────────┘
```

### Authentication Flow (Convex Auth Tables)
```
User Registration/Login
         │
         ▼
┌─────────────────┐
│ authVerifiers   │ ← Stores hashed passwords
│ - identifier    │
│ - secret        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ authAccounts    │ ← Links to OAuth providers
│ - provider      │
│ - userId        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ authSessions    │ ← Active sessions
│ - sessionToken  │
│ - userId        │
│ - expiresAt     │
└────────┬────────┘
         │
         ├──────► authRefreshTokens (Token refresh)
         │
         ├──────► authRateLimits (Security)
         │
         └──────► authVerificationCodes (Email/SMS verify)
```

## Data Flow

1. **Import Pipeline**:
   - JSON files → `importPipeline.ts` → `players` + `tournamentResults`

2. **Player Views**:
   - `players.ts` queries → Join `tournamentResults` → Display stats

3. **Statistics Calculation**:
   - `tournamentResults` → Aggregate → `playerStats` (needs implementation)

4. **User Interactions**:
   - User actions → `userFollows` → Personalized player lists

## Key Observations

### Strengths:
1. **Well-indexed**: Good indexes for common query patterns
2. **Denormalized for performance**: `playerName` in results avoids joins
3. **Comprehensive data**: 100 players with 15,000+ tournament results
4. **Flexible schema**: Optional fields handle varying data availability

### Areas for Improvement:
1. **`playerStats` underutilized**: Not populated from tournament data
2. **`userFollows` inactive**: Following feature not implemented
3. **Missing relationships**: No tournaments table (tournament details embedded)
4. **`numbers` table**: Legacy table should be removed

### Recommended Actions:
1. Populate `playerStats` from tournament results
2. Implement user following feature
3. Consider adding `tournaments` table for tournament metadata
4. Remove `numbers` table
5. Add more statistical calculations (averages, trends)

## Database Size Estimate
- **Players**: 100 records × ~2KB = 200KB
- **Tournament Results**: 15,000 records × ~0.5KB = 7.5MB
- **Auth Tables**: Minimal (depends on active users)
- **Total**: ~8MB (well within Convex free tier limits)

## Why So Many Tables?

The 11 tables in your Convex dashboard break down into two categories:

### Your Application Tables (5)
1. **players** - Core player data
2. **tournamentResults** - Historical tournament data
3. **playerStats** - Aggregated statistics
4. **userFollows** - User preferences
5. **numbers** - Legacy demo table (can be removed)

### Convex Auth System Tables (6)
These are automatically created when you include `...authTables` in your schema:
1. **authAccounts** - OAuth provider connections
2. **authSessions** - Active user sessions
3. **authVerificationCodes** - Email/SMS verification
4. **authVerifiers** - Password storage
5. **authRefreshTokens** - Token management
6. **authRateLimits** - Security and rate limiting

The auth tables are managed entirely by Convex Auth (`@convex-dev/auth`) and handle all authentication, session management, and security features. You don't need to interact with these tables directly - they're abstracted by the auth library's API.