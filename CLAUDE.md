# GolfGod - Claude Code Context

Quick reference for AI-assisted development.

---

## 🎯 Project Overview

**GolfGod** - PGA Tour analytics platform with course-specific player performance insights for informed betting decisions.

**Tech Stack**:
- Next.js 15 + React 19
- Convex (database + backend)
- TypeScript
- Tailwind CSS + shadcn/ui
- Dark mode golf theme (green accents)

---

## 📊 Database Schema Quick Reference

### Entity Flow
```
players (200)
  └─> tournamentResults (20K+) [playerId]
        ├─> roundStats (future: 80K+) [tournamentResultId]
        └─> has: scores[], position, earnings

courses (54)
  └─> playerCourseStats (2.7K) [courseId]
        └─> has: AGGREGATED career stats
```

### Query Decision Tree
```
Need career stats at course?     → playerCourseStats
Need tournament history?          → tournamentResults
Need round-by-round details?      → roundStats
Need AM/PM or Thu-Fri/Sat-Sun?    → roundStats (only table with teeTime)
Need tournament schedule?         → pgaTournaments
```

### Most Used Indexes
- `tournamentResults.by_player_year` - Player results by year
- `roundStats.by_player_course` - Split stats queries
- `playerCourseStats.by_player_course` - Career stats (fastest)

**📖 Full Reference**: See `DATABASE_MAP.md` for complete schema, relationships, and query patterns

---

## 🗂️ Key Files

### Frontend
- `app/inside-the-ropes/page.tsx` - Course-specific player stats
- `app/tournaments/pga/[year]/page.tsx` - Tournament listings
- `components/player/PlayerSelect.tsx` - Player search dropdown
- `components/player/PlayerStats.tsx` - Player profile stats

### Backend (Convex)
- `convex/schema.ts` - Database schema definition
- `convex/courseStats.ts` - Inside the Ropes calculations
- `convex/players.ts` - Player queries and mutations
- `convex/tournamentResults.ts` - Tournament result queries

### Documentation
- `DATABASE_MAP.md` - **Single source of truth** for schema
- `docs/SCHEMA_DIAGRAM.md` - Visual Mermaid diagrams
- `docs/DATA_AUTOMATION_STRATEGY.md` - Future automation plans

---

## 🎨 UI Patterns

### Mobile-First Design
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-optimized buttons (min 44px)
- Horizontal scroll for tables on mobile
- Skeleton loaders for all data fetching

### Color Scheme (Dark Mode)
```css
--background: hsl(120, 15%, 8%)      /* Dark green-gray */
--foreground: hsl(120, 5%, 95%)       /* Off-white */
--primary: hsl(142, 76%, 36%)         /* Golf green */
--secondary: hsl(120, 10%, 15%)       /* Darker green */
--accent: hsl(142, 76%, 45%)          /* Bright green */
```

### Common Components
- `SearchableSelect` - Searchable dropdown with flags
- `Skeleton` - Loading states
- `Badge` - Position indicators (Win, T10, MC)
- `Tabs` - Multi-view data presentation

---

## 🔧 Development Commands

```bash
# Development
bun run dev              # Start dev server (localhost:3000)
npx convex dev           # Start Convex backend

# Convex Operations
npx convex run <function>           # Run mutation/action
npx convex function <name>          # Get function info
npx convex data import <file>       # Import data

# Git
git status                          # Check changes
git add . && git commit -m "msg"    # Commit
git push                            # Push to GitHub
```

---

## 🚨 Common Patterns & Best Practices

### Convex Query Patterns
```typescript
// ✅ GOOD: Use indexes
const results = await ctx.db
  .query("tournamentResults")
  .withIndex("by_player_year", (q) =>
    q.eq("playerId", id).eq("year", 2024)
  )
  .collect();

// ❌ BAD: Full table scan
const results = await ctx.db
  .query("tournamentResults")
  .filter((q) => q.eq(q.field("year"), 2024))
  .collect();
```

### Safe to .collect()
- ✅ `players` (200 records, indexed)
- ✅ `courses` (54 records)
- ✅ `by_player` queries (200-500 per player)
- ✅ `by_player_course` queries (bounded)
- ❌ All `tournamentResults` (20K+)

### Frontend Year Generation
```typescript
// ✅ Generate years in frontend (not database query)
const getAvailableYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2015;
  const endYear = Math.max(currentYear + 1, 2026);
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => endYear - i
  );
};
```

---

## 📝 Code Style

### TypeScript
- Use explicit types for function returns
- Prefer `const` over `let`
- Use optional chaining: `player?.name`
- Use nullish coalescing: `value ?? default`

### React
- Use `"use client"` for client components
- Destructure props in function signature
- Use early returns for loading/error states
- Prefer functional components with hooks

### Convex
- Always use indexes in queries
- Use `.collect()` only on bounded queries
- Validate inputs with `v.validator`
- Add comments explaining `.collect()` safety

---

## 🐛 Common Issues & Solutions

### Issue: Player not appearing in search
**Cause**: Query limit too low (default 100)
**Solution**: Use `getAll` query which returns all ~200 players
```typescript
const players = useQuery(api.players.getAll, {});
```

### Issue: Year dropdown only shows 2015-2019
**Cause**: Extracting years from limited database query
**Solution**: Generate years directly in frontend (2015-2026)

### Issue: "No tournament results for 2021" but data exists
**Cause**: Query limited to 100 results via `.take(limit)`
**Solution**: Use `.collect()` for bounded player queries

### Issue: Invalid golf scores corrupting averages
**Cause**: Scores like "21" from withdrawn rounds
**Solution**: Validate scores (50-100 range) before calculations
```typescript
const isValidGolfScore = (score: number) => score >= 50 && score <= 100;
```

---

## 🎯 Inside the Ropes Feature

### Current Implementation
- ✅ Career stats at course (scoring avg, cuts, wins)
- ✅ Tournament-by-tournament history
- ✅ Round breakdowns (R1-R4 averages)
- ✅ Thu/Fri vs Sat/Sun splits
- ✅ Weekend differential

### Pending Features
- ⏳ AM vs PM tee time splits (need tee time data)
- ⏳ Round-level stats (populate `roundStats` table)
- ⏳ Weather condition correlations
- ⏳ Strokes gained data

### Data Tables
1. **playerCourseStats** - Aggregated career stats (FASTEST)
2. **tournamentResults** - Tournament-level data with scores array
3. **roundStats** - Round-level data (schema exists, data pending)

---

## 🔄 Git Workflow

### Commit Message Format
```
<type>: <description>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: fix, feat, refactor, docs, style, perf

### Branch Strategy
- `main` - Production-ready code
- Work directly on `main` for solo development
- Use feature branches for major changes

---

## 📚 Key Decisions & Rationale

### Why frontend year generation?
**Decision**: Generate 2015-2026 years in frontend, not database query
**Rationale**: Avoids unnecessary DB queries, handles future years, consistent UX

### Why `.collect()` on player queries?
**Decision**: Use `.collect()` for `by_player` tournament results
**Rationale**: Bounded dataset (~200-500 tournaments per player), indexed query is safe

### Why denormalize playerName in tournamentResults?
**Decision**: Store `playerName` alongside `playerId`
**Rationale**: Leaderboards need names frequently, avoids 100+ join queries

### Why separate roundStats table?
**Decision**: Separate table for round-level data vs tournament aggregates
**Rationale**: Different granularity needs, enables split stats (AM/PM, Thu-Fri/Sat-Sun)

---

## 🚀 Quick Start Checklist

When starting a new session:
1. ✅ Check `DATABASE_MAP.md` for schema reference
2. ✅ Review recent commits (`git log --oneline -10`)
3. ✅ Verify dev server running (`npm run dev`)
4. ✅ Check for TypeScript errors (`npm run build`)

When making database queries:
1. ✅ Identify correct table (raw/detailed/aggregated)
2. ✅ Use appropriate index
3. ✅ Verify `.collect()` is safe for this query
4. ✅ Test with real data

When creating features:
1. ✅ Check if data exists in schema
2. ✅ Create backend query first
3. ✅ Add UI components
4. ✅ Test on mobile viewport

---

## 📞 When to Update This File

Update `CLAUDE.md` when:
- ✅ Adding new major features
- ✅ Changing database schema patterns
- ✅ Establishing new coding conventions
- ✅ Discovering common issues/solutions
- ✅ Updating tech stack

**Keep this file concise** - detailed docs go in `DATABASE_MAP.md`, `docs/`, and README.md

---

**Last Updated**: January 2025
**Project Version**: 1.0
**Database Version**: 1.0
