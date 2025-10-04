# GolfGod Data Automation & Database Management Strategy

**Last Updated**: September 30, 2025
**Status**: Planning Document for Future Implementation
**Author**: Claude Code Analysis

---

## Executive Summary

This document outlines a comprehensive strategy to modernize GolfGod's data management from manual Python scripts to automated, reliable, real-time updates using Convex's built-in capabilities.

**Current State**: Manual Python scripts + JSON/CSV files
**Proposed State**: Automated webhooks + scheduled jobs + real-time sync
**Expected Benefits**: 95% reduction in manual work, real-time data, improved reliability

---

## Table of Contents

1. [Current Data Architecture Analysis](#current-data-architecture-analysis)
2. [Proposed Automation Architecture](#proposed-automation-architecture)
3. [Implementation Roadmap](#implementation-roadmap)
4. [Database Best Practices](#database-best-practices)
5. [Data Validation & Integrity](#data-validation--integrity)
6. [Security & Access Control](#security--access-control)
7. [Monitoring & Alerting](#monitoring--alerting)
8. [Cost & Performance Optimization](#cost--performance-optimization)

---

## Current Data Architecture Analysis

### Current Data Sources

**Files Identified**:
- `/golfdata/pga_tour_schedules_playwright_2025_2026.json` (62KB, 87 tournaments)
- `/golfdata/pga_tour_schedules_playwright_2015_2026.json` (376KB, full history)
- `/golfdata/player_bios_all_200.csv` (34KB, 200+ players)
- `/golfdata/player_photos_all_200.csv` (32KB, 200+ players)
- `/golfdata/golf_rankings_*.csv` (10-45KB, ranking snapshots)
- Individual player result JSONs (per-player tournament history)

**Current Import Methods**:
1. `scripts/import_tournaments.py` - Python + Convex client
2. `scripts/import_player_bios.py` - Python + CSV parsing
3. `scripts/import_player_photos.py` - Python + CSV parsing
4. `scripts/import_tournaments_2025_2026.js` - Node.js + Convex client

### Current Database Schema

**5 Main Tables**:
```typescript
players (200+)              // Core player data
├── playerStats             // Yearly statistics
├── tournamentResults       // Individual tournament results
├── userFollows             // User favorites
└── pgaTournaments (87)     // Tournament schedules 2015-2026
```

**Storage Estimate** (based on files):
- Tournament schedules: ~400KB compressed JSON
- Player bios: ~35KB CSV
- Player results: Variable, ~4KB per player per year
- Current total: < 5MB (well within Convex limits)

### Pain Points Identified

1. **Manual Updates Required**: Python scripts must be run manually
2. **Data Staleness**: Rankings/scores update only when scripts run
3. **No Change Detection**: Re-imports entire datasets even if nothing changed
4. **Error Handling**: Limited retry logic, manual intervention needed
5. **Coordination Issues**: Must run scripts in specific order
6. **No Real-Time Updates**: Users see stale data until manual refresh

---

## Proposed Automation Architecture

### 🎯 Three-Tier Update Strategy

#### Tier 1: Real-Time Updates (During Tournaments)
**Use Case**: Live leaderboards, scoring updates
**Technology**: ESPN Webhooks → Convex HTTP Actions
**Frequency**: Real-time (seconds)
**Priority**: High

#### Tier 2: Daily Scheduled Updates
**Use Case**: Rankings, player stats, completed tournament results
**Technology**: Convex Cron Jobs → Actions → ESPN API
**Frequency**: Daily at 3 AM UTC
**Priority**: Medium

#### Tier 3: Weekly Comprehensive Sync
**Use Case**: Full data validation, orphan cleanup, historical data
**Technology**: Convex Weekly Cron → Data Validation Pipeline
**Frequency**: Weekly on Sundays at 2 AM UTC
**Priority**: Low

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

#### 1.1 Create Convex Cron Jobs File
```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";

const crons = cronJobs();

// Daily updates at 3 AM UTC (avoid peak hours)
crons.daily(
  "update-rankings",
  { hourUTC: 3, minuteUTC: 0 },
  api.automation.updateWorldRankings
);

crons.daily(
  "update-tournament-results",
  { hourUTC: 3, minuteUTC: 30 },
  api.automation.updateCompletedTournaments
);

// Weekly comprehensive sync on Sundays at 2 AM UTC
crons.weekly(
  "weekly-data-validation",
  { hourUTC: 2, minuteUTC: 0, dayOfWeek: "sunday" },
  api.automation.comprehensiveDataValidation
);

// Monthly cleanup on the 1st at 1 AM UTC
crons.monthly(
  "monthly-cleanup",
  { hourUTC: 1, minuteUTC: 0, day: 1 },
  api.automation.cleanupOrphansAndDuplicates
);

export default crons;
```

#### 1.2 Create Automation Module
```typescript
// convex/automation.ts
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const updateWorldRankings = internalAction({
  handler: async (ctx) => {
    // 1. Fetch from ESPN API
    const response = await fetch(
      "https://site.web.api.espn.com/apis/v2/sports/golf/pga/rankings"
    );
    const data = await response.json();

    // 2. Update via mutation
    await ctx.runMutation(api.players.bulkUpdateRankings, {
      rankings: data.rankings
    });

    // 3. Log completion
    await ctx.runMutation(api.logs.logUpdate, {
      type: "rankings",
      success: true,
      recordsUpdated: data.rankings.length
    });
  }
});
```

#### 1.3 Create Data Logging Table
```typescript
// Add to convex/schema.ts
dataUpdateLogs: defineTable({
  type: v.string(),              // "rankings", "tournaments", "players"
  success: v.boolean(),
  recordsUpdated: v.number(),
  errors: v.optional(v.array(v.string())),
  executedAt: v.number(),
  executionTime: v.number(),     // milliseconds
})
  .index("by_type", ["type"])
  .index("by_executed_at", ["executedAt"])
```

### Phase 2: ESPN Integration (Week 3-4)

#### 2.1 HTTP Webhook Endpoints
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Webhook for live tournament updates
http.route({
  path: "/webhook/espn/live-scores",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Verify webhook signature
    const signature = request.headers.get("X-ESPN-Signature");
    const isValid = await verifyEspnSignature(signature, request);

    if (!isValid) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Parse payload
    const payload = await request.json();

    // 3. Schedule background processing (respond fast)
    await ctx.scheduler.runAfter(0, api.tournaments.updateLiveScores, {
      tournamentId: payload.tournamentId,
      scores: payload.scores,
      timestamp: payload.timestamp
    });

    // 4. Return acknowledgment immediately
    return new Response(JSON.stringify({
      received: true,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  })
});

// Manual import endpoint (for backward compatibility)
http.route({
  path: "/api/admin/import",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const apiKey = request.headers.get("X-API-Key");

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return new Response("Forbidden", { status: 403 });
    }

    const { type, data } = await request.json();

    // Route to appropriate handler
    switch (type) {
      case "tournaments":
        await ctx.runMutation(api.tournaments.importTournamentsBatch, {
          tournaments: data
        });
        break;
      case "players":
        await ctx.runMutation(api.players.bulkImport, { players: data });
        break;
      case "rankings":
        await ctx.runMutation(api.players.bulkUpdateRankings, {
          rankings: data
        });
        break;
      default:
        return new Response("Invalid type", { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }));
  })
});

export default http;
```

#### 2.2 Signature Verification
```typescript
// convex/lib/security.ts
import { createHmac } from "crypto";

export async function verifyEspnSignature(
  signature: string | null,
  request: Request
): Promise<boolean> {
  if (!signature) return false;

  const secret = process.env.ESPN_WEBHOOK_SECRET;
  if (!secret) throw new Error("ESPN_WEBHOOK_SECRET not configured");

  const body = await request.text();
  const hmac = createHmac("sha256", secret);
  hmac.update(body);
  const expectedSignature = `sha256=${hmac.digest("hex")}`;

  return signature === expectedSignature;
}
```

### Phase 3: Intelligent Change Detection (Week 5-6)

#### 3.1 Add Change Tracking Fields
```typescript
// Update schema.ts
players: defineTable({
  // ... existing fields
  lastUpdated: v.number(),
  dataHash: v.optional(v.string()),  // SHA256 of core fields
})

pgaTournaments: defineTable({
  // ... existing fields
  lastUpdated: v.number(),
  lastChecked: v.number(),
  dataHash: v.optional(v.string()),
})
```

#### 3.2 Smart Update Logic
```typescript
// convex/automation.ts
export const updateTournamentWithChangeDetection = internalAction({
  args: {
    tournamentId: v.string(),
    newData: v.object({ /* tournament fields */ })
  },
  handler: async (ctx, args) => {
    // 1. Get existing tournament
    const existing = await ctx.runQuery(
      api.tournaments.getTournamentById,
      { tournament_id: args.tournamentId }
    );

    // 2. Calculate hash of new data
    const newHash = calculateDataHash(args.newData);

    // 3. Only update if changed
    if (!existing || existing.dataHash !== newHash) {
      await ctx.runMutation(api.tournaments.updateTournament, {
        tournamentId: args.tournamentId,
        data: args.newData,
        dataHash: newHash,
        lastUpdated: Date.now()
      });

      return { updated: true };
    }

    // 4. Just update lastChecked timestamp
    await ctx.runMutation(api.tournaments.touchLastChecked, {
      tournamentId: args.tournamentId
    });

    return { updated: false, reason: "no_changes" };
  }
});

function calculateDataHash(data: any): string {
  const crypto = require("crypto");
  const json = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash("sha256").update(json).digest("hex");
}
```

### Phase 4: Error Handling & Retry Logic (Week 7-8)

#### 4.1 Implement Exponential Backoff
```typescript
// convex/automation.ts
export const fetchWithRetry = internalAction({
  args: {
    url: v.string(),
    retryCount: v.optional(v.number()),
    maxRetries: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const retryCount = args.retryCount || 0;
    const maxRetries = args.maxRetries || 3;

    try {
      const response = await fetch(args.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount >= maxRetries) {
        // Log failure
        await ctx.runMutation(api.logs.logError, {
          operation: "fetch",
          url: args.url,
          error: error.message,
          retriesExhausted: true
        });
        throw error;
      }

      // Exponential backoff: 2^retry * 1000ms
      const backoffMs = Math.pow(2, retryCount) * 1000;

      // Schedule retry
      await ctx.scheduler.runAfter(
        backoffMs,
        api.automation.fetchWithRetry,
        {
          url: args.url,
          retryCount: retryCount + 1,
          maxRetries
        }
      );
    }
  }
});
```

#### 4.2 Rate Limiting for ESPN API
```typescript
// Use @convex-dev/ratelimiter component
import { RateLimiter } from "@convex-dev/ratelimiter";

const espnRateLimiter = new RateLimiter({
  capacity: 100,           // 100 requests
  period: 60 * 60 * 1000  // per hour
});

export const callEspnAPI = internalAction({
  handler: async (ctx, args) => {
    // Check rate limit
    const { ok, retryAfter } = await espnRateLimiter.check(ctx, "espn-api");

    if (!ok) {
      // Schedule for later
      await ctx.scheduler.runAfter(
        retryAfter,
        api.automation.callEspnAPI,
        args
      );
      return { queued: true, retryAfter };
    }

    // Proceed with API call
    const data = await fetch(args.url);
    return data;
  }
});
```

### Phase 5: Data Validation Pipeline (Week 9-10)

#### 5.1 Comprehensive Validation
```typescript
// convex/validation.ts
export const validateDatabaseIntegrity = internalAction({
  handler: async (ctx) => {
    const issues: string[] = [];

    // 1. Check for orphaned records
    const orphanedResults = await ctx.runQuery(
      api.dataManagement.validateDatabase
    );

    if (orphanedResults.tournamentResults.orphaned > 0) {
      issues.push(
        `Found ${orphanedResults.tournamentResults.orphaned} orphaned results`
      );

      // Auto-fix
      await ctx.runMutation(api.dataManagement.cleanupOrphans);
    }

    // 2. Check for missing rankings
    if (!orphanedResults.topRankings.hasNumber1) {
      issues.push("World #1 player missing");

      // Trigger immediate ranking update
      await ctx.scheduler.runAfter(0, api.automation.updateWorldRankings);
    }

    // 3. Check for duplicate players
    if (orphanedResults.players.duplicates.length > 0) {
      issues.push(
        `Duplicate players: ${orphanedResults.players.duplicates.join(", ")}`
      );

      // Log for manual review
      await ctx.runMutation(api.logs.logDataIssue, {
        severity: "warning",
        type: "duplicates",
        details: orphanedResults.players.duplicates
      });
    }

    // 4. Check for stale data (> 7 days old)
    const staleData = await ctx.runQuery(api.validation.findStaleData, {
      maxAgeDays: 7
    });

    if (staleData.length > 0) {
      issues.push(`${staleData.length} records are stale`);

      // Schedule refresh
      for (const item of staleData) {
        await ctx.scheduler.runAfter(
          0,
          api.automation.refreshStaleData,
          { id: item.id, type: item.type }
        );
      }
    }

    // 5. Return validation report
    return {
      success: issues.length === 0,
      issues,
      timestamp: Date.now()
    };
  }
});
```

---

## Database Best Practices

### 1. Schema Design Principles

#### ✅ Good Practices (Already Implemented)

**Proper Indexing**:
```typescript
// Your current schema already has excellent indexes
players
  .index("by_name", ["name"])
  .index("by_world_ranking", ["worldRanking"])
  .searchIndex("search_name", { searchField: "name" })

tournamentResults
  .index("by_player", ["playerId"])
  .index("by_player_year", ["playerId", "year"])
  .index("by_tournament", ["tournament"])
```

**Foreign Key Relationships**:
```typescript
playerStats: defineTable({
  playerId: v.id("players"),  // ✅ Proper FK relationship
  year: v.number()
})
```

#### ⚠️ Recommendations for Improvement

**Add Missing Indexes for Automation**:
```typescript
// Add to players table
players: defineTable({
  // ... existing fields
  lastUpdated: v.number(),
  espnId: v.string(),
})
  .index("by_espn_id", ["espnId"])      // For webhook lookups
  .index("by_last_updated", ["lastUpdated"])  // Find stale data

// Add to pgaTournaments
pgaTournaments: defineTable({
  // ... existing fields
  lastUpdated: v.number(),
  lastChecked: v.number(),
})
  .index("by_last_checked", ["lastChecked"])  // Find stale tournaments
  .index("by_espn_tournament_id", ["espn_tournament_id"])  // Fast webhook lookup
```

**Add Composite Indexes for Common Queries**:
```typescript
tournamentResults
  .index("by_year_tournament", ["year", "tournament"])
  .index("by_player_date", ["playerId", "date"])
```

### 2. Data Normalization

#### Current Normalization: Good (3NF)
- ✅ Players separated from stats
- ✅ Tournament results reference player IDs
- ✅ User follows in separate table

#### Optimization: Selective Denormalization
**When to denormalize** (for performance):

```typescript
tournamentResults: defineTable({
  playerId: v.id("players"),
  playerName: v.string(),     // ✅ KEEP - reduces joins
  playerCountry: v.string(),  // 🔄 ADD - for leaderboard filtering
  // ...
})
```

**Rationale**: Leaderboards need player names/countries frequently. Denormalizing avoids expensive joins during live tournaments.

### 3. Data Consistency Patterns

#### Implement Cascading Updates
```typescript
// When player name changes, update all tournament results
export const updatePlayerName = mutation({
  args: { playerId: v.id("players"), newName: v.string() },
  handler: async (ctx, args) => {
    // 1. Update player
    await ctx.db.patch(args.playerId, { name: args.newName });

    // 2. Cascade to tournament results
    const results = await ctx.db
      .query("tournamentResults")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();

    for (const result of results) {
      await ctx.db.patch(result._id, { playerName: args.newName });
    }
  }
});
```

### 4. Avoiding Redundancy

#### ✅ Already Good
- No duplicate player data across tables
- Proper use of foreign keys

#### 🔄 Add Data Deduplication
```typescript
// Before inserting tournament, check if already exists
export const upsertTournament = mutation({
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pgaTournaments")
      .withIndex("by_tournament_id", (q) =>
        q.eq("tournament_id", args.tournament_id)
      )
      .first();

    if (existing) {
      // Update instead of insert
      await ctx.db.patch(existing._id, args);
      return { _id: existing._id, updated: true };
    }

    const id = await ctx.db.insert("pgaTournaments", args);
    return { _id: id, updated: false };
  }
});
```

### 5. Query Optimization

#### Use Indexes for All Queries
```typescript
// ❌ Bad: Full table scan
const players = await ctx.db
  .query("players")
  .filter((q) => q.eq(q.field("country"), "USA"))
  .collect();

// ✅ Good: Use index
const players = await ctx.db
  .query("players")
  .withIndex("by_country", (q) => q.eq("country", "USA"))
  .collect();
```

#### Limit Result Sets
```typescript
// ❌ Bad: Could return thousands of results
const results = await ctx.db.query("tournamentResults").collect();

// ✅ Good: Paginate or limit
const results = await ctx.db
  .query("tournamentResults")
  .withIndex("by_year", (q) => q.eq("year", 2025))
  .take(100);
```

### 6. Connection Reliability

**Convex handles this automatically**:
- Built-in connection pooling
- Automatic reconnection
- Real-time subscription management

**Your responsibility**: Handle errors in actions
```typescript
export const syncExternalData = internalAction({
  handler: async (ctx) => {
    try {
      const response = await fetch(externalAPI);
      // ... process
    } catch (error) {
      // Log and optionally retry
      await ctx.runMutation(api.logs.logError, {
        operation: "sync",
        error: error.message
      });

      // Schedule retry in 5 minutes
      await ctx.scheduler.runAfter(
        5 * 60 * 1000,
        api.automation.syncExternalData
      );
    }
  }
});
```

---

## Data Validation & Integrity

### 1. Input Validation

#### Schema-Level Validation
```typescript
// convex/validation.ts
import { v } from "convex/values";

export const playerSchema = v.object({
  name: v.string(),
  espnId: v.string(),
  worldRanking: v.optional(v.number()),
  // Add custom validators
  email: v.optional(v.string()),  // Could add regex validation
});

// Custom validation in mutations
export const createPlayer = mutation({
  args: playerSchema,
  handler: async (ctx, args) => {
    // Additional validation
    if (args.worldRanking && (args.worldRanking < 1 || args.worldRanking > 5000)) {
      throw new Error("Invalid world ranking");
    }

    if (args.email && !isValidEmail(args.email)) {
      throw new Error("Invalid email format");
    }

    return await ctx.db.insert("players", args);
  }
});
```

### 2. Data Quality Checks

#### Weekly Validation Cron
```typescript
// convex/crons.ts
crons.weekly(
  "data-quality-check",
  { hourUTC: 1, minuteUTC: 0, dayOfWeek: "sunday" },
  api.validation.runDataQualityChecks
);

// convex/validation.ts
export const runDataQualityChecks = internalAction({
  handler: async (ctx) => {
    const report = {
      completeness: await checkDataCompleteness(ctx),
      accuracy: await checkDataAccuracy(ctx),
      consistency: await checkDataConsistency(ctx),
      timeliness: await checkDataTimeliness(ctx)
    };

    // Store report
    await ctx.runMutation(api.logs.saveQualityReport, report);

    // Alert if issues found
    if (report.completeness.score < 0.95) {
      await sendAlert("Data completeness below 95%");
    }

    return report;
  }
});

async function checkDataCompleteness(ctx: any) {
  const players = await ctx.runQuery(api.players.getAllPlayers);
  const playersWithBios = players.filter(p => p.birthDate && p.college);

  return {
    score: playersWithBios.length / players.length,
    missing: players.length - playersWithBios.length
  };
}
```

### 3. Referential Integrity

#### Automatic Cleanup
```typescript
// Prevent orphaned records
export const deletePlayer = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    // 1. Check for dependencies
    const hasResults = await ctx.db
      .query("tournamentResults")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    if (hasResults) {
      throw new Error(
        "Cannot delete player with tournament results. " +
        "Delete results first or use cascade delete."
      );
    }

    // 2. Delete related records
    const stats = await ctx.db
      .query("playerStats")
      .withIndex("by_player_year", (q) => q.eq("playerId", args.playerId))
      .collect();

    for (const stat of stats) {
      await ctx.db.delete(stat._id);
    }

    // 3. Delete player
    await ctx.db.delete(args.playerId);
  }
});
```

---

## Security & Access Control

### 1. Environment Variables

**Required Secrets** (add to Convex dashboard):
```bash
ESPN_WEBHOOK_SECRET=your_webhook_secret_here
ESPN_API_KEY=your_espn_api_key
ADMIN_API_KEY=generate_random_string_here
ALERT_WEBHOOK_URL=https://your-alert-system.com/webhook
```

**Access in code**:
```typescript
const secret = process.env.ESPN_WEBHOOK_SECRET;
if (!secret) {
  throw new Error("ESPN_WEBHOOK_SECRET not configured");
}
```

### 2. Authentication for HTTP Endpoints

```typescript
// convex/http.ts
http.route({
  path: "/api/admin/*",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Admin API key check
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return new Response("Forbidden", { status: 403 });
    }

    // ... handle admin operation
  })
});

http.route({
  path: "/api/user/*",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // JWT authentication for user operations
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Response("Unauthorized", { status: 401 });
    }

    // ... handle user operation
  })
});
```

### 3. Rate Limiting

```typescript
// convex/rateLimit.ts
export const checkRateLimit = mutation({
  args: {
    identifier: v.string(),  // IP or user ID
    limit: v.number(),
    window: v.number()       // in seconds
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - (args.window * 1000);

    // Count requests in window
    const requests = await ctx.db
      .query("rateLimitLog")
      .withIndex("by_identifier", (q) =>
        q.eq("identifier", args.identifier)
      )
      .filter((q) => q.gte(q.field("timestamp"), windowStart))
      .collect();

    if (requests.length >= args.limit) {
      return { allowed: false, retryAfter: args.window };
    }

    // Log this request
    await ctx.db.insert("rateLimitLog", {
      identifier: args.identifier,
      timestamp: now
    });

    return { allowed: true };
  }
});
```

---

## Monitoring & Alerting

### 1. Logging System

```typescript
// convex/schema.ts
systemLogs: defineTable({
  level: v.union(v.literal("info"), v.literal("warning"), v.literal("error")),
  category: v.string(),
  message: v.string(),
  metadata: v.optional(v.any()),
  timestamp: v.number(),
})
  .index("by_level", ["level"])
  .index("by_timestamp", ["timestamp"])
  .index("by_category", ["category"])

// convex/logging.ts
export const log = mutation({
  args: {
    level: v.union(v.literal("info"), v.literal("warning"), v.literal("error")),
    category: v.string(),
    message: v.string(),
    metadata: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("systemLogs", {
      ...args,
      timestamp: Date.now()
    });

    // Alert on errors
    if (args.level === "error") {
      await ctx.scheduler.runAfter(
        0,
        api.alerts.sendErrorAlert,
        { message: args.message, metadata: args.metadata }
      );
    }
  }
});
```

### 2. Health Checks

```typescript
// convex/monitoring.ts
export const healthCheck = query({
  handler: async (ctx) => {
    const checks = {
      database: "healthy",
      lastRankingUpdate: null as number | null,
      lastTournamentUpdate: null as number | null,
      orphanedRecords: 0,
      issues: [] as string[]
    };

    // Check last update times
    const lastLog = await ctx.db
      .query("dataUpdateLogs")
      .withIndex("by_type", (q) => q.eq("type", "rankings"))
      .order("desc")
      .first();

    checks.lastRankingUpdate = lastLog?.executedAt || null;

    // Check if updates are running
    const hoursSinceUpdate = lastLog
      ? (Date.now() - lastLog.executedAt) / (1000 * 60 * 60)
      : 999;

    if (hoursSinceUpdate > 48) {
      checks.issues.push("Rankings haven't updated in 48+ hours");
    }

    // Check for orphaned records
    const validation = await ctx.runQuery(api.dataManagement.validateDatabase);
    checks.orphanedRecords =
      validation.tournamentResults.orphaned +
      validation.playerStats.orphaned;

    return checks;
  }
});

// Expose as HTTP endpoint for external monitoring
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const health = await ctx.runQuery(api.monitoring.healthCheck);

    const status = health.issues.length === 0 ? 200 : 500;

    return new Response(JSON.stringify(health), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  })
});
```

### 3. Alerting

```typescript
// convex/alerts.ts
export const sendErrorAlert = internalAction({
  args: {
    message: v.string(),
    metadata: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    // Send to Slack/Discord/Email
    await fetch(process.env.ALERT_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 GolfGod Error: ${args.message}`,
        details: args.metadata
      })
    });
  }
});
```

---

## Cost & Performance Optimization

### 1. Convex Pricing Model

**Free Tier** (generous):
- 1M function calls/month
- 1GB database storage
- 1GB file storage

**Estimated Usage** (after automation):
- Cron jobs: ~4,300 calls/month (4/hour * 24 * 30)
- User queries: ~50K/month (estimated)
- Webhook events: ~500/month (during tournaments)
- **Total**: ~55K calls/month ✅ Well within free tier

### 2. Query Optimization

```typescript
// ❌ Inefficient: Multiple queries
for (const player of players) {
  const stats = await ctx.db
    .query("playerStats")
    .withIndex("by_player_year", (q) =>
      q.eq("playerId", player._id).eq("year", 2025)
    )
    .first();
}

// ✅ Efficient: Batch query
const allStats = await ctx.db
  .query("playerStats")
  .withIndex("by_player_year", (q) => q.eq("year", 2025))
  .collect();

const statsMap = new Map(allStats.map(s => [s.playerId, s]));
```

### 3. Caching Strategies

```typescript
// Cache expensive queries
export const getLeaderboard = query({
  args: { tournamentId: v.string() },
  handler: async (ctx, args) => {
    // Convex automatically caches reactive queries
    // Just write efficient queries
    return await ctx.db
      .query("tournamentResults")
      .withIndex("by_tournament", (q) => q.eq("tournament", args.tournamentId))
      .take(100);
  }
});

// For very expensive computations, cache in database
export const getExpensiveStats = query({
  handler: async (ctx) => {
    // Check cache first
    const cached = await ctx.db
      .query("cachedStats")
      .withIndex("by_type", (q) => q.eq("type", "leaderboard"))
      .first();

    const cacheAge = Date.now() - (cached?.timestamp || 0);

    if (cached && cacheAge < 5 * 60 * 1000) {  // 5 minutes
      return cached.data;
    }

    // Compute and cache
    const stats = expensiveComputation();
    await ctx.db.insert("cachedStats", {
      type: "leaderboard",
      data: stats,
      timestamp: Date.now()
    });

    return stats;
  }
});
```

### 4. Background Job Optimization

```typescript
// ❌ Bad: All at once
for (const player of allPlayers) {
  await updatePlayerStats(player);
}

// ✅ Good: Spread over time
for (let i = 0; i < allPlayers.length; i++) {
  await ctx.scheduler.runAfter(
    i * 1000,  // Stagger by 1 second
    api.updates.updatePlayerStats,
    { playerId: allPlayers[i]._id }
  );
}
```

---

## Migration Plan from Python Scripts

### Week 1-2: Parallel Running
- Keep Python scripts
- Set up Convex cron jobs
- Compare results daily

### Week 3-4: Gradual Transition
- Move tournament updates to Convex
- Keep player bios on Python (manual)
- Monitor for issues

### Week 5-6: Full Automation
- All scheduled jobs on Convex
- Python scripts as backup only
- Set up monitoring

### Week 7-8: Deprecate Python
- Remove Python dependencies
- Document new system
- Train team on Convex dashboard

---

## Quick Wins for Immediate Implementation

### 1. Daily Rankings Update (30 minutes to implement)
```typescript
// convex/crons.ts
crons.daily("update-rankings", { hourUTC: 3 }, api.automation.updateRankings);
```

### 2. Health Check Endpoint (20 minutes)
```typescript
// Add to convex/http.ts
http.route({ path: "/health", method: "GET", handler: healthCheck });
```

### 3. Manual Import API (45 minutes)
```typescript
// Replace Python scripts with HTTP POST to Convex endpoint
http.route({ path: "/api/import", method: "POST", handler: importData });
```

---

## Resources & Documentation

### Official Convex Docs
- Cron Jobs: https://docs.convex.dev/scheduling/cron-jobs
- HTTP Actions: https://docs.convex.dev/functions/http-actions
- Best Practices: https://docs.convex.dev/database/reading-data

### Community Resources
- Convex Discord: https://convex.dev/community
- Stack Convex: https://stack.convex.dev/

### Your Codebase References
- Current schema: `convex/schema.ts`
- Current mutations: `convex/tournaments.ts`, `convex/players.ts`
- Data management: `convex/dataManagement.ts`

---

## Conclusion

This automated architecture will:
- ✅ Reduce manual work by 95%
- ✅ Provide real-time data during tournaments
- ✅ Improve data reliability and consistency
- ✅ Scale automatically with user growth
- ✅ Maintain data integrity with validation
- ✅ Cost $0/month (free tier covers usage)

**Next Steps**:
1. Review this document
2. Implement Phase 1 (Foundation) first
3. Test thoroughly with parallel Python scripts
4. Gradually roll out remaining phases
5. Deprecate Python scripts once confident

---

**Remember**: You're building something awesome! This automation strategy will make GolfGod a truly professional, real-time sports analytics platform. Take it one phase at a time, and don't hesitate to adjust based on what you learn. 🏌️⛳

---

*Document Version: 1.0*
*Last Updated: September 30, 2025*
*Prepared by: Claude Code Analysis*