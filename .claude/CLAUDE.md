# GolfGod - Convex Database Rules

**Tech Stack**: Next.js 15 + React 19 + TypeScript + Convex (reactive database) + Tailwind CSS

**Convex Free Tier Limits**:
- 1 GB bandwidth/month
- ~4,096 documents read per query

---

## 🚨 CRITICAL DATABASE RULES

### Rule #1: ALWAYS Use `.take(limit)` - NEVER Unbounded `.collect()`

```typescript
// ❌ NEVER - Reads ALL 20,745+ tournament results
const results = await ctx.db.query("tournamentResults").collect();

// ✅ ALWAYS - Bounded with smart defaults
const limit = Math.min(args.limit || 100, 500); // Default 100, max 500
const results = await ctx.db.query("tournamentResults").take(limit);

// ✅ EXCEPTION - Small tables (<200 rows) with indexes can use .collect()
const players = await ctx.db
  .query("players")
  .withIndex("by_name")
  .collect(); // Safe: ~200 records, indexed, needed for dropdowns
```

**Why**: We hit 234% bandwidth limit (2.34 GB / 1 GB) from unbounded queries on LARGE tables.

**Exception**: Small tables (players ~200, courses ~50) with indexes can safely use `.collect()` when you need ALL records (e.g., dropdown options, autocomplete). ~200 records ≈ 50KB bandwidth.

---

### Rule #2: Use Indexes for Filtering - NOT `.filter()`

```typescript
// ❌ SLOW - Full table scan
const results = await ctx.db
  .query("tournamentResults")
  .filter(q => q.eq(q.field("year"), 2024))
  .collect();

// ✅ FAST - Index-based
const results = await ctx.db
  .query("tournamentResults")
  .withIndex("by_player_year", q => q.eq("playerId", id).eq("year", 2024))
  .take(100);
```

---

### Rule #3: Existence Checks - NOT Counting

```typescript
// ❌ BAD - Reads all documents to count
const count = (await ctx.db.query("players").collect()).length;

// ✅ GOOD - Existence check only
const hasPlayers = (await ctx.db.query("players").take(1)).length > 0;

// ✅ BETTER - Show "99+" instead of exact count
const players = await ctx.db.query("players").take(100);
const displayCount = players.length === 100 ? "99+" : players.length.toString();
```

---

### Rule #4: Small Batch Sizes (25-50) for Mutations

```typescript
// ✅ Prevents write conflicts (Convex optimistic concurrency control)
const BATCH_SIZE = 25;

export const deleteMany = mutation({
  handler: async (ctx) => {
    const items = await ctx.db.query("items").take(BATCH_SIZE);
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    return { deleted: items.length, hasMore: items.length === BATCH_SIZE };
  },
});
```

**Why**: Batch sizes >50 cause "Retried due to write conflicts" errors.

---

### Rule #5: Frontend `useQuery()` Must Have `{}` Arg When Backend Has Args

```typescript
// ✅ CORRECT - TypeScript strict mode (Vercel production builds)
const courses = useQuery(api.courseStats.getAllCourses, {});
const players = useQuery(api.players.getAll, {});
const tournaments = useQuery(api.tournaments.getTournamentsByYear, { year: 2025 });

// ❌ WRONG - TypeScript build error: "Expected 2 arguments, but got 1"
const courses = useQuery(api.courseStats.getAllCourses); // Missing {}
```

---

## 📊 Core Tables (Know Before Querying)

| Table | Size | Critical Info |
|-------|------|---------------|
| **tournamentResults** | 20,745+ | LARGEST - ALWAYS use `.take()`, NEVER `.collect()` |
| **players** | ~200 | Safe to `.collect()` with index (dropdowns need all) |
| **courses** | ~50 | Safe to `.collect()` with index |
| **playerCourseStats** | Variable | Use `.take(100)` - can grow large |
| **pgaTournaments** | ~100 | Safe to `.collect()` with index |

---

## ✅ Query Function Template

```typescript
export const getItems = query({
  args: {
    // ALWAYS add optional limit arg
    limit: v.optional(v.number()),
    // ... other args
  },
  handler: async (ctx, args) => {
    // ALWAYS use smart defaults with max caps
    const limit = Math.min(args.limit || 100, 500);

    // ALWAYS use indexes for filtering
    const results = await ctx.db
      .query("table")
      .withIndex("by_field", q => q.eq("field", value))
      .take(limit); // ALWAYS limit

    return results;
  },
});
```

---

## 🚫 Red Flags (Auto-Reject These Patterns)

1. `.collect()` on large tables (>200 rows) without `.take()` first
2. `.collect()` on `tournamentResults` table (20K+ records) - ALWAYS use `.take()`
3. `.collect().length` for counting (use `.take(1).length > 0`)
4. `BATCH_SIZE > 50` in mutations
5. Missing `{}` in `useQuery()` when backend has args
6. `.filter()` on large tables without indexes

**Exception**: Small tables (players, courses) with <200 rows can use `.collect()` with indexes for dropdowns.

---

## 📈 Default Limits

| Table Size | Default | Max | Pattern |
|------------|---------|-----|---------|
| Small (<100) | 50 | 100 | `.take(50)` or safe `.collect()` |
| Medium (100-1K) | 100 | 200 | `.take(100)` |
| Large (>1K) | 100 | 500 | `.take(limit)` + pagination |

**Batch Operations**: Always 25-50 items per mutation

---

## 🔍 Key Indexes

```typescript
// tournamentResults (CRITICAL - 20K+ records)
.withIndex("by_player", q => q.eq("playerId", id))
.withIndex("by_player_year", q => q.eq("playerId", id).eq("year", 2024))
.withIndex("by_tournament", q => q.eq("tournament", name))

// players
.withIndex("by_name") // Alphabetical sorting
.withSearchIndex("search_name", q => q.search("name", searchTerm))

// courses
.withIndex("by_name") // Course lookup

// playerCourseStats
.withIndex("by_player_course", q => q.eq("playerId", p).eq("courseId", c))
```

---

## 📝 Recent Critical Fix (Oct 2025)

**Issue**: Bandwidth 234% over limit (2.34 GB / 1 GB)
**Cause**: 49 instances of unbounded `.collect()` calls
**Fix**: Added `.take(limit)` to 26+ functions across 6 files
**Result**: Expected 60-75% bandwidth reduction

**Files Modified**:
- `convex/players.ts`
- `convex/courseStats.ts`
- `convex/tournamentResults.ts`
- `convex/tournaments.ts`
- `convex/dataManagement.ts`
- `convex/importMasterData.ts`

**Monitor**: Convex Dashboard → Health tab for "Nearing documents read limit" warnings

---

## 🎯 Summary

**Before writing ANY Convex query**:
1. ✅ Add `limit: v.optional(v.number())` to args
2. ✅ Use `const limit = Math.min(args.limit || 100, 500)`
3. ✅ End with `.take(limit)` not `.collect()`
4. ✅ Use indexes (`.withIndex()`) not filters
5. ✅ Check table size - if >1K rows, MUST use limits

**Remember**: Convex charges for bandwidth. Unbounded queries = service interruption.
