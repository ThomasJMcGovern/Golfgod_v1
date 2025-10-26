# Chore: Extend Database Schema for Player Knowledge Hub

## Chore Description

Extend the Convex database schema to support all 8 Player Knowledge Hub categories with real data storage. Currently, the application uses placeholder data from `lib/placeholder-data.ts`. This chore will create 5 new database tables to store:

1. **Personal Family** - Marital status, spouse information, children
2. **Family Golf History** - Family members with college/professional golf backgrounds
3. **Professional History** - Career timeline, achievements, current status
4. **Hometown/University Courses** - Tour courses within 180 miles of hometown and university
5. **Injury History** - Past injuries, recovery timelines, current status
6. **Intangibles** - Weather preferences, course type tendencies, pressure situations

**Current State**:
- `players` table has basic profile data (birthDate, birthPlace, college, height, weight, swing)
- All other knowledge categories use placeholder data

**Target State**:
- 5 new tables to store comprehensive player knowledge
- Proper foreign key relationships with `players` table
- Efficient indexes for common query patterns
- Geographic calculation support for hometown/university courses

**Schema Design Principles**:
- Separate tables for each knowledge category (normalized design)
- Small tables (<1K records each) - safe for `.collect()` with indexes
- One-to-many relationships from `players` table
- Optional data - not all players will have all categories populated

## Relevant Files

Use these files to resolve the chore:

- **`convex/schema.ts`** (lines 1-215) - Current database schema definition with 9 tables. Will add 5 new tables for player knowledge categories.

- **`lib/placeholder-data.ts`** (lines 1-200) - Contains TypeScript interfaces for all knowledge categories (`PlaceholderFamily`, `PlaceholderFamilyHistory`, `PlaceholderProfessional`, `PlaceholderCourse`, `PlaceholderInjury`, `PlaceholderIntangible`). These interfaces inform the new schema field definitions.

- **`DATABASE_MAP.md`** - Single source of truth for database schema. Must be updated with new table definitions, relationships, indexes, and query patterns after schema changes.

- **`CLAUDE.md`** - Quick reference guide. Update "Database Schema Quick Reference" section with new tables.

- **`.claude/CLAUDE.md`** - Critical Convex rules. Verify new tables follow Rule #1 (will be small, <1K records, safe for `.collect()` with indexes).

- **`convex/players.ts`** - Player queries and mutations. Reference for query patterns and index usage. No changes needed but useful for understanding existing patterns.

### New Files

- **`convex/playerFamily.ts`** - Queries and mutations for player family data (marital status, spouse, children)

- **`convex/playerFamilyHistory.ts`** - Queries and mutations for family golf history

- **`convex/playerProfessional.ts`** - Queries and mutations for professional career history and achievements

- **`convex/playerNearbyCourses.ts`** - Queries for hometown and university courses within 180 miles, with performance data

- **`convex/playerInjuries.ts`** - Queries and mutations for injury history tracking

- **`convex/playerIntangibles.ts`** - Queries and mutations for intangibles (weather, course type, pressure preferences)

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Add playerFamily Table to Schema

- Open `convex/schema.ts`
- Add new `playerFamily` table after `userFollows` (around line 56)
- Define fields based on `PlaceholderFamily` interface:
  - `playerId: v.id("players")` - Foreign key to players table
  - `maritalStatus: v.string()` - "Single", "Married", "Divorced", "Widowed"
  - `spouseName: v.optional(v.string())` - Spouse's full name
  - `spouseMarriedSince: v.optional(v.number())` - Year married
  - `children: v.optional(v.array(v.object({ name: v.string(), birthYear: v.number() })))` - Array of child objects
  - `lastUpdated: v.number()` - Timestamp for data freshness
- Add index: `.index("by_player", ["playerId"])` - Primary lookup pattern

### 2. Add playerFamilyHistory Table to Schema

- Add new `playerFamilyHistory` table after `playerFamily`
- Define fields based on `PlaceholderFamilyHistory` interface:
  - `playerId: v.id("players")` - Foreign key to players table
  - `memberName: v.string()` - Family member's name
  - `relationship: v.string()` - "Father", "Mother", "Brother", "Sister", "Uncle", etc.
  - `golfLevel: v.string()` - "College", "Professional", "Amateur"
  - `achievements: v.string()` - Notable golf achievements and background
  - `yearsActive: v.optional(v.string())` - e.g., "1985-1995"
  - `lastUpdated: v.number()` - Timestamp
- Add indexes:
  - `.index("by_player", ["playerId"])` - Get all family history for a player
  - `.index("by_golf_level", ["golfLevel"])` - Filter by professional vs college

### 3. Add playerProfessional Table to Schema

- Add new `playerProfessional` table after `playerFamilyHistory`
- Define fields based on `PlaceholderProfessional` interface:
  - `playerId: v.id("players")` - Foreign key to players table
  - `currentStatus: v.string()` - "PGA Tour", "Korn Ferry", "DP World Tour", "LIV Golf", "Retired", "Amateur"
  - `tourCard: v.optional(v.number())` - Year obtained PGA Tour card
  - `rookieYear: v.optional(v.number())` - First full year on tour
  - `careerEarnings: v.optional(v.number())` - Total career earnings
  - `majorWins: v.optional(v.number())` - Count of major championships
  - `totalWins: v.optional(v.number())` - Total PGA Tour wins
  - `milestones: v.array(v.object({ year: v.number(), achievement: v.string() }))` - Career milestones
  - `lastUpdated: v.number()` - Timestamp
- Add indexes:
  - `.index("by_player", ["playerId"])` - Primary lookup (should return single record)
  - `.index("by_status", ["currentStatus"])` - Filter active vs retired players

### 4. Add playerNearbyCourses Table to Schema

- Add new `playerNearbyCourses` table after `playerProfessional`
- Define fields for hometown and university courses:
  - `playerId: v.id("players")` - Foreign key to players table
  - `courseId: v.id("courses")` - Foreign key to courses table
  - `courseType: v.string()` - "Hometown" or "University"
  - `distanceMiles: v.number()` - Distance from hometown or university (max 180)
  - `referenceLocation: v.string()` - City, State of hometown or university
  - `eventsPlayed: v.optional(v.number())` - Count of tournaments at this course
  - `avgScore: v.optional(v.number())` - Average score at this course
  - `bestFinish: v.optional(v.string())` - Best tournament position (e.g., "1", "T-3")
  - `lastUpdated: v.number()` - Timestamp
- Add indexes:
  - `.index("by_player", ["playerId"])` - Get all nearby courses for a player
  - `.index("by_player_type", ["playerId", "courseType"])` - Filter hometown vs university
  - `.index("by_course", ["courseId"])` - Find all players for whom a course is nearby

### 5. Add playerInjuries Table to Schema

- Add new `playerInjuries` table after `playerNearbyCourses`
- Define fields based on `PlaceholderInjury` interface:
  - `playerId: v.id("players")` - Foreign key to players table
  - `injuryType: v.string()` - e.g., "Back strain", "Wrist injury", "Knee surgery"
  - `affectedArea: v.string()` - Body part affected
  - `injuryDate: v.string()` - ISO date string (YYYY-MM-DD)
  - `status: v.string()` - "Active", "Recovering", "Recovered"
  - `recoveryTimeline: v.optional(v.string())` - e.g., "4-6 weeks", "6 months"
  - `tournamentsMissed: v.optional(v.number())` - Count of missed events
  - `impact: v.optional(v.string())` - Description of impact on performance
  - `returnDate: v.optional(v.string())` - ISO date string when returned to play
  - `lastUpdated: v.number()` - Timestamp
- Add indexes:
  - `.index("by_player", ["playerId"])` - Get all injuries for a player
  - `.index("by_status", ["status"])` - Filter active vs recovered injuries
  - `.index("by_player_date", ["playerId", "injuryDate"])` - Chronological injury history

### 6. Add playerIntangibles Table to Schema

- Add new `playerIntangibles` table after `playerInjuries`
- Define fields based on `PlaceholderIntangible` interface:
  - `playerId: v.id("players")` - Foreign key to players table
  - `category: v.string()` - "Weather", "Course Type", "Pressure", "Tournament Size", "Field Strength"
  - `subcategory: v.optional(v.string())` - e.g., "Wind", "Rain" for Weather; "Links", "Parkland" for Course Type
  - `description: v.string()` - Detailed description of the intangible factor
  - `performanceRating: v.string()` - "Outstanding", "Excellent", "Strong", "Average", "Weak", "Poor"
  - `supportingStats: v.optional(v.string())` - Statistical evidence (e.g., "Avg score: 68.5 (calm) vs 70.2 (windy)")
  - `confidence: v.optional(v.string())` - "High", "Medium", "Low" - data confidence level
  - `lastUpdated: v.number()` - Timestamp
- Add indexes:
  - `.index("by_player", ["playerId"])` - Get all intangibles for a player
  - `.index("by_category", ["category"])` - Filter by intangible type
  - `.index("by_player_category", ["playerId", "category"])` - Get specific category for player

### 7. Update DATABASE_MAP.md with New Tables

- Add new tables to "Quick Schema Overview" section (lines 6-20)
- Update Entity Flow Diagram to show new relationships from `players` table
- Add new section "Player Knowledge Hub Tables" with detailed descriptions
- Document indexes for each new table
- Add query patterns for each knowledge category:
  - Example: Get player's family info
  - Example: Get family golf history
  - Example: Get professional career timeline
  - Example: Get nearby hometown courses
  - Example: Get injury history (active vs recovered)
  - Example: Get intangibles by category
- Add to "Safe to .collect()" section - all new tables are small (<1K records)
- Update table size reference chart

### 8. Update CLAUDE.md Quick Reference

- Update "Database Schema Quick Reference" section (lines 20-48)
- Add new tables to Entity Flow diagram
- Document that new tables are safe for `.collect()` (small, indexed)
- Add common query patterns for knowledge hub features
- Update "Key Files" section to mention new Convex function files

### 9. Create playerFamily.ts Convex Functions

- Create `convex/playerFamily.ts`
- Implement queries:
  - `getPlayerFamily(playerId)` - Get family info for a player
  - `hasFamily(playerId)` - Boolean check if family data exists
- Implement mutations:
  - `upsertPlayerFamily(playerId, familyData)` - Create or update family info
  - `deletePlayerFamily(playerId)` - Remove family data
- Follow `.claude/CLAUDE.md` rules:
  - Use `ctx.db.get()` for single record lookup
  - Use `.first()` for optional single record
  - Add validators with `v.id()`, `v.string()`, etc.
  - Pass `{}` from frontend when no args needed

### 10. Create playerFamilyHistory.ts Convex Functions

- Create `convex/playerFamilyHistory.ts`
- Implement queries:
  - `getPlayerFamilyHistory(playerId)` - Get all family golf history records
  - `getFamilyHistoryByLevel(playerId, golfLevel)` - Filter by college/professional
- Implement mutations:
  - `addFamilyMember(playerId, memberData)` - Add family history entry
  - `updateFamilyMember(memberId, updates)` - Update existing entry
  - `deleteFamilyMember(memberId)` - Remove family history entry
- Use `.withIndex("by_player")` for player-specific queries
- Use `.collect()` safely (small table, bounded by playerId)

### 11. Create playerProfessional.ts Convex Functions

- Create `convex/playerProfessional.ts`
- Implement queries:
  - `getPlayerProfessional(playerId)` - Get professional history (single record)
  - `getActivePlayers()` - Get all players with "PGA Tour" or "Korn Ferry" status
  - `getRetiredPlayers()` - Get all retired players
- Implement mutations:
  - `upsertPlayerProfessional(playerId, professionalData)` - Create or update
  - `addMilestone(playerId, milestone)` - Add career milestone to array
  - `updateStatus(playerId, newStatus)` - Update current tour status
- Use `.first()` for single record lookup (one record per player)
- Index queries by status for filtering

### 12. Create playerNearbyCourses.ts Convex Functions

- Create `convex/playerNearbyCourses.ts`
- Implement queries:
  - `getPlayerNearbyCourses(playerId, courseType)` - Get hometown OR university courses
  - `getHometownCourses(playerId)` - Filter for "Hometown" type
  - `getUniversityCourses(playerId)` - Filter for "University" type
  - `getPlayersForCourse(courseId, courseType)` - Reverse lookup (which players have this as nearby)
- Implement mutations:
  - `addNearbyCourse(playerId, courseId, courseType, distanceMiles, referenceLocation)` - Add course
  - `updateCoursePerformance(recordId, eventsPlayed, avgScore, bestFinish)` - Update stats
  - `deleteNearbyCourse(recordId)` - Remove course
- Use composite index `by_player_type` for efficient filtering
- Include course details in response by joining with `courses` table

### 13. Create playerInjuries.ts Convex Functions

- Create `convex/playerInjuries.ts`
- Implement queries:
  - `getPlayerInjuries(playerId)` - Get all injuries (chronological order)
  - `getActiveInjuries(playerId)` - Filter by status "Active" or "Recovering"
  - `getInjuryHistory(playerId)` - Get recovered injuries only
- Implement mutations:
  - `addInjury(playerId, injuryData)` - Create new injury record
  - `updateInjuryStatus(injuryId, status, returnDate)` - Update recovery status
  - `deleteInjury(injuryId)` - Remove injury record
- Sort by `injuryDate` descending (most recent first)
- Use `.withIndex("by_player_date")` for chronological queries

### 14. Create playerIntangibles.ts Convex Functions

- Create `convex/playerIntangibles.ts`
- Implement queries:
  - `getPlayerIntangibles(playerId)` - Get all intangibles
  - `getIntangiblesByCategory(playerId, category)` - Filter by category (Weather, Course Type, etc.)
  - `getWeatherPreferences(playerId)` - Shortcut for category="Weather"
  - `getCourseTypePreferences(playerId)` - Shortcut for category="Course Type"
- Implement mutations:
  - `addIntangible(playerId, intangibleData)` - Add new intangible
  - `updateIntangible(intangibleId, updates)` - Update existing intangible
  - `deleteIntangible(intangibleId)` - Remove intangible
- Group results by category for organized display
- Use composite index `by_player_category` for efficient category filtering

### 15. Test Schema Migration

- Run `npx convex dev` to deploy new schema
- Verify Convex dashboard shows 6 new tables (5 knowledge + existing tables)
- Check that indexes are created correctly
- Confirm no schema conflicts or errors in Convex logs
- Test creating sample records for each new table via Convex dashboard
- Verify foreign key relationships work (playerId references)

### 16. Run Validation Commands

Execute all validation commands to ensure schema changes are complete with zero regressions.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npx convex dev` - Deploy new schema to Convex backend (must complete without errors)
- `npm run build` - Build Next.js app to validate TypeScript types are generated correctly for new schema
- Verify in Convex Dashboard:
  - Navigate to "Data" tab
  - Confirm 6 new tables appear: `playerFamily`, `playerFamilyHistory`, `playerProfessional`, `playerNearbyCourses`, `playerInjuries`, `playerIntangibles`
  - Check indexes are created for each table
  - Test inserting a sample record in each table
  - Verify foreign key references to `players` table work
  - Confirm queries execute without errors
- `npm run dev` - Start dev server and verify no runtime errors from schema changes

## Notes

### Schema Design Rationale

**Separate Tables vs. Single Table**:
- ✅ Chosen: Separate tables for each knowledge category
- Rationale: Better data normalization, cleaner queries, optional data (not all players have all categories), easier to extend

**One-to-Many Relationships**:
- `players` → `playerFamily` (1:1 - one family record per player)
- `players` → `playerFamilyHistory` (1:many - multiple family members)
- `players` → `playerProfessional` (1:1 - one career record per player)
- `players` → `playerNearbyCourses` (1:many - multiple courses)
- `players` → `playerInjuries` (1:many - multiple injuries over career)
- `players` → `playerIntangibles` (1:many - multiple intangible factors)

**Estimated Table Sizes**:
- `playerFamily`: ~200 records (one per player, optional)
- `playerFamilyHistory`: ~400 records (2 family members avg per player)
- `playerProfessional`: ~200 records (one per player)
- `playerNearbyCourses`: ~800 records (4 courses avg per player - 2 hometown, 2 university)
- `playerInjuries`: ~300 records (1.5 injuries avg per player over career)
- `playerIntangibles`: ~600 records (3 intangibles avg per player)

All tables are **small** (<1K records), making them safe for `.collect()` with indexes per `.claude/CLAUDE.md` Rule #1.

### Geographic Calculations for Nearby Courses

**Distance Calculation** (not implemented in this chore, future enhancement):
- Use Haversine formula to calculate distance between two lat/long points
- Store hometown coordinates in `players` table: `hometownLat`, `hometownLng`
- Store university coordinates in `players` table: `universityLat`, `universityLng`
- Store course coordinates in `courses` table: `latitude`, `longitude`
- Calculate distances in backend mutation or scheduled function
- Filter courses where `distance <= 180 miles`

**For this chore**: Manually populate `playerNearbyCourses` with known hometown/university courses. Distance calculation can be added later.

### Data Population Strategy

After schema is deployed:
1. **Manual Entry**: Use Convex dashboard or admin UI to add data for top players (Scottie Scheffler, Rory McIlroy, etc.)
2. **Scraping Scripts**: Create Python/Node.js scripts to scrape public data sources
3. **Batch Import**: Use Convex actions to import CSV/JSON data files
4. **Progressive Enhancement**: Start with key players, expand over time

### Index Strategy

**Primary Indexes** (all tables):
- `by_player` on `playerId` - Most common query pattern (get all records for a player)

**Secondary Indexes**:
- Status filters: `by_status` for active vs recovered injuries, active vs retired players
- Category filters: `by_category` for intangibles, `by_golf_level` for family history
- Composite indexes: `by_player_type` for hometown vs university courses, `by_player_date` for chronological injury history

**Performance**: Small tables + indexes = sub-10ms query times with `.collect()`

### TypeScript Type Generation

Convex automatically generates TypeScript types for new schema:
- `Id<"playerFamily">`, `Id<"playerFamilyHistory">`, etc.
- Import from `@/convex/_generated/dataModel`
- Use in queries: `v.id("playerFamily")`
- Frontend: `useQuery(api.playerFamily.getPlayerFamily, { playerId })`

### Backward Compatibility

No breaking changes:
- Existing tables unchanged
- New tables are additions only
- Placeholder data in `lib/placeholder-data.ts` remains for reference
- Pages can be migrated one at a time from placeholder to real data

### Future Enhancements

After this chore, consider:
1. **Admin UI**: Create admin pages to manage player knowledge data
2. **Data Validation**: Add Zod schemas for input validation
3. **Geographic Search**: Implement Haversine distance calculation for automated course matching
4. **Bulk Import**: Create batch import actions for CSV/JSON data
5. **Data Export**: Add export functionality for backups
6. **Audit Logging**: Track who updated what data and when
7. **Public API**: Expose read-only API for player knowledge data
