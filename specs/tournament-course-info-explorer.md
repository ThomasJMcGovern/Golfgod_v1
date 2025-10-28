# Feature: Tournament Course Information Explorer

## Feature Description

Add a "What Would You Like to Know?" section to the tournament pages (after selecting a tour and year) that allows users to explore detailed course information similar to the player knowledge hub. This feature provides comprehensive course details including physical characteristics (inception, architect, length, scorecard), course conditions (grass types, green size, bunker sand), historical data (winners since 2015), and major championships hosted at the course.

Users can click on category cards to view specific course information, with an initial focus on PGA TOUR courses. This creates a richer tournament experience by providing betting-relevant course insights beyond just the schedule and winners.

## User Story

As a golf analytics enthusiast
I want to explore detailed course information for tournaments (inception, architect, scorecard, grass types, winners history, majors)
So that I can make informed betting decisions based on course characteristics and historical performance data

## Problem Statement

Currently, the tournament pages (`/tournaments/pga/[year]`) only display:
- Tournament schedule (current, scheduled, completed)
- Basic winner information
- Prize money and dates

**Problem**: Users interested in betting or analysis lack critical course information:
- Course physical details (par, yardage, architect, established date)
- Course conditions (grass types on greens/fairways, green size, bunker sand type)
- Historical winner data (winners since 2015 with filtering by top 10/15/20)
- Major championship history at the course
- Detailed scorecard information

This information exists partially in the `courses` table but is not exposed to users, and additional data needs to be added to the schema.

## Solution Statement

Create a tournament course information explorer similar to the player knowledge hub, with 6 clickable category cards:

1. **Course Information** - Inception year, architect, total length
2. **Course Scorecard** - Par breakdown by hole, yardage details
3. **Course Conditions** - Grass types (greens/fairways), average green size (sq. ft.), bunker sand type
4. **Winners Since 2015** - Historical winners with year, score, and player links
5. **Top Finishers** - Configurable list (Top 10/15/20) from selected year
6. **Major Championships** - List majors played at this course (often 0)

**Implementation approach:**
- Add new schema fields to `courses` table for missing data
- Create `courseWinners` table linking courses to tournament winners
- Create `courseMajors` table for major championship history
- Build reusable components following CategoryExplorer pattern
- Wire up Convex queries with proper indexing and `.take(limit)` rules
- Create category pages under `/tournaments/pga/[year]/course/[courseId]/[category]`

## Relevant Files

Use these files to implement the feature:

- **`app/tournaments/pga/[year]/page.tsx`** - Main tournament page
  - Add TournamentCourseExplorer section after year selector
  - Needs course selection mechanism (tournaments → courses mapping)
  - Integration point for new category explorer

- **`convex/schema.ts`** - Database schema definition
  - Extend `courses` table with new fields: `architect`, `established`, `grassGreens`, `grassFairways`, `avgGreenSize`, `bunkerSandType`, `scorecardPar`, `scorecardYardage`
  - Add `courseWinners` table for historical winners data
  - Add `courseMajors` table for major championships
  - Add proper indexes for efficient querying

- **`convex/courseStats.ts`** - Course-related Convex queries
  - Add queries for course detailed information
  - Add queries for winners history with year filtering
  - Add queries for top finishers by year and limit
  - Add queries for majors hosted at course
  - Follow `.take(limit)` patterns for all queries

- **`DATABASE_MAP.md`** - Schema documentation
  - Update with new course schema fields
  - Document new tables and relationships
  - Add query patterns for course information

- **`components/player/CategoryExplorer.tsx`** - Reference implementation
  - Use as pattern for TournamentCourseExplorer
  - Similar card grid layout and dialog pattern
  - Reuse visual design language

- **`components/player/KnowledgeCard.tsx`** - Reusable card component
  - Will be used for course category cards
  - Already supports icons, titles, descriptions
  - Mobile-first with ≥44px touch targets

- **`lib/knowledge-categories.ts`** - Category definitions pattern
  - Create `lib/course-categories.ts` following same pattern
  - Define 6 course information categories
  - Export shared types and constants

### New Files

- **`lib/course-categories.ts`** - Course category constants
  - Define 6 course information categories with icons, titles, descriptions
  - Export `CourseCategory` interface and `courseCategories` array
  - Follow same pattern as `lib/knowledge-categories.ts`

- **`components/tournament/TournamentCourseExplorer.tsx`** - Course category explorer
  - Display "What Would You Like to Know?" section for courses
  - Render 6 course category cards in responsive grid
  - Manage course selection and category navigation
  - Handle redirect to course category pages

- **`components/tournament/CourseSelect.tsx`** - Course selection component
  - Searchable dropdown for selecting course
  - Filter by tournament association
  - Display course name and location
  - Follow PlayerSelect component pattern

- **`app/tournaments/pga/[year]/course/[courseId]/[category]/page.tsx`** - Category detail pages
  - Dynamic route for course category information
  - 6 category pages: info, scorecard, conditions, winners, top-finishers, majors
  - Reuse layout patterns from player category pages
  - Mobile-responsive with proper breadcrumbs

- **`convex/courses.ts`** - New course-specific queries file
  - Separate from courseStats.ts for better organization
  - Course information queries
  - Winners history queries
  - Top finishers queries
  - Major championships queries

- **`components/tournament/CourseInfo.tsx`** - Course information display
  - Show inception, architect, length
  - Display course metadata
  - Formatted date displays

- **`components/tournament/CourseScorecard.tsx`** - Scorecard display
  - Show par and yardage by hole
  - Total par and yardage
  - Responsive table layout

- **`components/tournament/CourseConditions.tsx`** - Course conditions display
  - Grass types (greens/fairways)
  - Average green size
  - Bunker sand type
  - Formatted metric displays

- **`components/tournament/WinnersHistory.tsx`** - Winners since 2015
  - Chronological list with year, player, score
  - Player links to player profiles
  - Tournament links

- **`components/tournament/TopFinishers.tsx`** - Top N finishers
  - Configurable top 10/15/20
  - Year selector
  - Player links and scores

- **`components/tournament/MajorsHistory.tsx`** - Major championships
  - List of majors hosted (often empty)
  - Years hosted
  - Winners for each major

## shadcn/ui Components

### Existing Components to Use

- **`components/ui/card.tsx`** - Container cards for category information
- **`components/ui/button.tsx`** - Action buttons, navigation
- **`components/ui/table.tsx`** - Scorecard and winners tables
- **`components/ui/select.tsx`** - Year selector, top N selector
- **`components/ui/tabs.tsx`** - Category switching if needed
- **`components/ui/badge.tsx`** - Labels for course types, grass types
- **`components/ui/separator.tsx`** - Visual section separators
- **`components/ui/skeleton.tsx`** - Loading states
- **`components/player/KnowledgeCard.tsx`** - Reusable category cards

### New Components to Add

None required - all necessary shadcn/ui components already exist.

### Custom Components to Create

- **`TournamentCourseExplorer`** - Course category grid (follows CategoryExplorer pattern)
- **`CourseSelect`** - Searchable course dropdown (follows PlayerSelect pattern)
- **`CourseInfo`** - Course information display component
- **`CourseScorecard`** - Scorecard table component
- **`CourseConditions`** - Conditions display component
- **`WinnersHistory`** - Winners list component
- **`TopFinishers`** - Top finishers list component
- **`MajorsHistory`** - Majors list component

All custom components follow shadcn/ui patterns:
- CVA for variants
- forwardRef for DOM elements
- CSS variables for theming
- cn() utility for class merging
- Mobile-first responsive design (sm/md/lg breakpoints)
- Dark mode support with golf green accents

## Implementation Plan

### Phase 1: Foundation

1. **Extend Database Schema**
   - Add new fields to `courses` table
   - Create `courseWinners` table
   - Create `courseMajors` table
   - Add proper indexes for querying
   - Deploy schema changes to Convex

2. **Create Convex Queries**
   - Course information queries
   - Winners history queries
   - Top finishers queries
   - Majors queries
   - Follow `.take(limit)` rules

3. **Define Course Categories**
   - Create `lib/course-categories.ts`
   - Define 6 categories with metadata
   - Export shared types

### Phase 2: Core Implementation

1. **Build Course Selection**
   - Create `CourseSelect` component
   - Wire up to Convex courses query
   - Add to tournament page

2. **Create Category Explorer**
   - Create `TournamentCourseExplorer` component
   - Render 6 category cards
   - Handle category navigation

3. **Build Category Display Components**
   - Create 6 display components for each category
   - Wire up to Convex queries
   - Handle loading and error states

4. **Create Category Pages**
   - Create dynamic route structure
   - Build 6 category pages
   - Add breadcrumb navigation

### Phase 3: Integration

1. **Integrate into Tournament Page**
   - Add TournamentCourseExplorer to tournament page
   - Add course selection mechanism
   - Test navigation flow

2. **Add Data Population Scripts**
   - Create scripts to populate course data
   - Import scorecard data
   - Import winners history
   - Import majors data

3. **Testing & Optimization**
   - Test responsive layout
   - Test dark mode
   - Test all queries
   - Optimize performance

## Step by Step Tasks

### 1. Extend Convex Schema

- **Read** `convex/schema.ts` to understand current structure
- **Add** new fields to `courses` table:
  - `architect` (optional string) - Course designer name
  - `established` (optional number) - Year course established
  - `grassGreens` (optional string) - Grass type on greens
  - `grassFairways` (optional string) - Grass type on fairways
  - `avgGreenSize` (optional number) - Average green size in sq. ft.
  - `bunkerSandType` (optional string) - Type of bunker sand
  - `scorecardPar` (optional array of numbers) - Par for each hole (18 holes)
  - `scorecardYardage` (optional array of numbers) - Yardage for each hole (18 holes)
- **Create** `courseWinners` table:
  ```typescript
  courseWinners: defineTable({
    courseId: v.id("courses"),
    year: v.number(),
    tournament: v.string(),
    playerId: v.id("players"),
    playerName: v.string(),
    score: v.string(),
    toPar: v.optional(v.number()),
    earnings: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_course_year", ["courseId", "year"])
    .index("by_year", ["year"])
  ```
- **Create** `courseMajors` table:
  ```typescript
  courseMajors: defineTable({
    courseId: v.id("courses"),
    majorName: v.string(), // "Masters", "PGA Championship", "U.S. Open", "The Open Championship"
    yearsHosted: v.array(v.number()),
    totalHosted: v.number(),
  })
    .index("by_course", ["courseId"])
  ```
- **Deploy** schema with `npx convex dev`
- **Update** `DATABASE_MAP.md` with new schema information

### 2. Create Course Categories Constants

- **Create** `lib/course-categories.ts`
- **Import** Lucide icons: `Info`, `FileText`, `Leaf`, `Trophy`, `Medal`, `Star`
- **Define** `CourseCategory` interface:
  ```typescript
  export interface CourseCategory {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    href: (courseId: string) => string;
  }
  ```
- **Export** `courseCategories` array with 6 categories:
  1. **info** - "Course Information" - Inception, architect, length
  2. **scorecard** - "Course Scorecard" - Par breakdown, yardage details
  3. **conditions** - "Course Conditions" - Grass types, green size, bunker sand
  4. **winners** - "Winners Since 2015" - Historical winners with scores
  5. **top-finishers** - "Top Finishers" - Configurable top 10/15/20
  6. **majors** - "Major Championships" - Majors hosted at course
- **Add** JSDoc comments explaining purpose

### 3. Create Convex Course Queries

- **Create** `convex/courses.ts` (new file separate from courseStats.ts)
- **Implement** queries following `.take(limit)` rules:
  ```typescript
  // Get detailed course information
  export const getCourseDetails = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
      return await ctx.db.get(args.courseId);
    },
  });

  // Get winners at course since year
  export const getCourseWinners = query({
    args: {
      courseId: v.id("courses"),
      sinceYear: v.number(),
      limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const limit = Math.min(args.limit || 50, 100);
      return await ctx.db
        .query("courseWinners")
        .withIndex("by_course_year", (q) =>
          q.eq("courseId", args.courseId).gte("year", args.sinceYear)
        )
        .take(limit);
    },
  });

  // Get top finishers at course for specific year
  export const getTopFinishers = query({
    args: {
      courseId: v.id("courses"),
      year: v.number(),
      topN: v.number(), // 10, 15, or 20
    },
    handler: async (ctx, args) => {
      const limit = Math.min(args.topN, 25); // Safety cap
      // Query tournamentResults for this course and year, sorted by position
      // Implementation details TBD based on data structure
    },
  });

  // Get majors hosted at course
  export const getCourseMajors = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
      return await ctx.db
        .query("courseMajors")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect(); // Safe: typically 0-2 majors per course
    },
  });

  // Get courses for tournament mapping
  export const getCoursesByTournament = query({
    args: { tournamentName: v.string() },
    handler: async (ctx, args) => {
      const mappings = await ctx.db
        .query("tournamentCourses")
        .withIndex("by_tournament", (q) =>
          q.eq("tournamentName", args.tournamentName)
        )
        .collect(); // Safe: typically 1-3 courses per tournament

      const courses = [];
      for (const mapping of mappings) {
        const course = await ctx.db.get(mapping.courseId);
        if (course) courses.push(course);
      }
      return courses;
    },
  });
  ```
- **Add** JSDoc comments for all functions
- **Test** queries in Convex dashboard

### 4. Create CourseSelect Component

- **Create** `components/tournament/CourseSelect.tsx`
- **Follow** `PlayerSelect` component pattern
- **Import** necessary UI components and hooks
- **Implement** searchable dropdown:
  ```typescript
  - Use Convex `useQuery` for courses
  - Filter courses by search term
  - Display course name and location
  - Handle course selection callback
  - Mobile-responsive with ≥44px touch targets
  - Dark mode support
  ```
- **Add** loading and error states
- **Test** component in isolation

### 5. Create TournamentCourseExplorer Component

- **Create** `components/tournament/TournamentCourseExplorer.tsx`
- **Import** `courseCategories` from `lib/course-categories.ts`
- **Import** `KnowledgeCard` component
- **Import** `useRouter` from `next/navigation`
- **Manage** state: `selectedCourse` (Id<"courses"> | null), `selectedCategory` (string | null)
- **Render** section with:
  - Heading: "What Would You Like to Know?"
  - Description: "Explore comprehensive course details and historical data"
  - Course selection dropdown (CourseSelect)
  - Grid of 6 category cards (responsive: 1 col mobile, 2 col sm, 3 col lg)
- **Handle** category card click:
  - If no course selected, show toast/message "Please select a course first"
  - If course selected, redirect to `/tournaments/pga/[year]/course/[courseId]/[category]`
- **Add** TypeScript types for all props and state
- **Follow** mobile-first responsive patterns

### 6. Create Course Display Components

- **Create** `components/tournament/CourseInfo.tsx`:
  - Display inception year, architect, total length
  - Format numbers with proper units
  - Show "Unknown" for missing data
  - Mobile-responsive card layout

- **Create** `components/tournament/CourseScorecard.tsx`:
  - Table with holes 1-18
  - Par and yardage for each hole
  - Total par and total yardage rows
  - Responsive table with horizontal scroll on mobile
  - Front 9 / Back 9 subtotals

- **Create** `components/tournament/CourseConditions.tsx`:
  - Display grass types for greens and fairways
  - Show average green size with sq. ft. unit
  - Display bunker sand type
  - Use badge components for grass types
  - Mobile-responsive card layout

- **Create** `components/tournament/WinnersHistory.tsx`:
  - Query winners since 2015
  - Display in chronological table (most recent first)
  - Columns: Year, Player (linked), Score, To Par, Earnings
  - Player links to `/players?playerId={id}`
  - Mobile-responsive with horizontal scroll
  - Loading skeleton during query

- **Create** `components/tournament/TopFinishers.tsx`:
  - Selector for top 10/15/20
  - Year selector (2015-2026)
  - Query top finishers for selected parameters
  - Display in table with position, player, score
  - Player links to player profiles
  - Mobile-responsive table

- **Create** `components/tournament/MajorsHistory.tsx`:
  - Display list of majors hosted (often empty)
  - Show years hosted for each major
  - Display "No major championships hosted at this course" when empty
  - Simple card layout

### 7. Create Course Category Pages

- **Create** directory structure: `app/tournaments/pga/[year]/course/[courseId]/[category]/`
- **Create** `page.tsx` for each category:
  - Parse route params: year, courseId, category
  - Fetch course data from Convex
  - Render appropriate display component
  - Add breadcrumb navigation
  - Add MainNavigation component
  - Mobile-responsive layout
  - Loading and error states
- **Categories to create**:
  1. `info/page.tsx` - Course information
  2. `scorecard/page.tsx` - Scorecard display
  3. `conditions/page.tsx` - Course conditions
  4. `winners/page.tsx` - Winners history
  5. `top-finishers/page.tsx` - Top finishers
  6. `majors/page.tsx` - Majors history
- **Reuse** layout patterns from player category pages
- **Add** shared layout component if needed

### 8. Integrate into Tournament Page

- **Read** `app/tournaments/pga/[year]/page.tsx`
- **Import** `TournamentCourseExplorer` component
- **Add** component after year selector, before tournament tables:
  ```tsx
  {/* Year Selector */}
  <div className="bg-card border-b">
    {/* existing year selector */}
  </div>

  {/* NEW: Course Information Explorer */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <TournamentCourseExplorer year={year} />
  </div>

  {/* Main Content - Tournament Tables */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {/* existing tournament tables */}
  </div>
  ```
- **Test** integration and layout flow
- **Verify** responsive behavior

### 9. Add Data Population Support

- **Create** mutation for adding course winners:
  ```typescript
  export const addCourseWinner = mutation({
    args: {
      courseId: v.id("courses"),
      year: v.number(),
      tournament: v.string(),
      playerId: v.id("players"),
      playerName: v.string(),
      score: v.string(),
      toPar: v.optional(v.number()),
      earnings: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      return await ctx.db.insert("courseWinners", {
        courseId: args.courseId,
        year: args.year,
        tournament: args.tournament,
        playerId: args.playerId,
        playerName: args.playerName,
        score: args.score,
        toPar: args.toPar,
        earnings: args.earnings,
      });
    },
  });
  ```
- **Create** mutation for updating course details:
  ```typescript
  export const updateCourseDetails = mutation({
    args: {
      courseId: v.id("courses"),
      architect: v.optional(v.string()),
      established: v.optional(v.number()),
      grassGreens: v.optional(v.string()),
      grassFairways: v.optional(v.string()),
      avgGreenSize: v.optional(v.number()),
      bunkerSandType: v.optional(v.string()),
      scorecardPar: v.optional(v.array(v.number())),
      scorecardYardage: v.optional(v.array(v.number())),
    },
    handler: async (ctx, args) => {
      const { courseId, ...updates } = args;
      return await ctx.db.patch(courseId, updates);
    },
  });
  ```
- **Document** data population process in notes

### 10. Testing & Quality Assurance

- **Test** responsive layout on mobile (320px), tablet (768px), desktop (1024px+)
- **Test** dark mode appearance
- **Test** all Convex queries return expected data
- **Test** course selection and category navigation flow
- **Test** all 6 category pages display correctly
- **Test** player links navigate to correct player profiles
- **Test** loading states and error handling
- **Test** keyboard navigation and accessibility
- **Verify** no TypeScript errors
- **Verify** no build errors

### 11. Documentation Updates

- **Update** `DATABASE_MAP.md` with new schema tables and relationships
- **Update** `CLAUDE.md` with new course category routes and components
- **Add** JSDoc comments to all new components
- **Document** query patterns and indexes
- **Add** notes on data population process

### 12. Run Validation Commands

- **Execute** `npm run build` - Build Next.js app, verify no TypeScript/build errors
- **Execute** `npx convex dev` - Deploy schema changes to Convex backend
- **Execute** `npm run dev` - Start dev server, test end-to-end
- **Test** complete user flow:
  1. Navigate to `/tournaments/pga/2025`
  2. Verify TournamentCourseExplorer section appears
  3. Select a course from dropdown
  4. Click "Course Information" card
  5. Verify redirect to course info page
  6. Verify course details display correctly
  7. Test all 6 categories with different courses
  8. Verify responsive behavior on mobile/tablet/desktop
  9. Verify dark mode styling
  10. Verify player links work correctly

## Testing Strategy

### Unit Tests

If tests exist in the project:
- Test `TournamentCourseExplorer` renders 6 category cards
- Test course selection updates state
- Test category click with/without course selected
- Test Convex queries return expected data structures
- Test display components format data correctly

### Integration Tests

- Test complete flow: select course → click category → view details
- Test navigation between categories
- Test back button behavior
- Test course switching while on category page
- Test responsive layout at different breakpoints
- Test dark mode theme switching

### Edge Cases

- **No course selected**: Category cards show message/toast
- **Course with missing data**: Display "Unknown" or empty state
- **Course with no winners data**: Show empty state message
- **Course with no majors**: Display "No major championships hosted" message
- **Network errors**: Show error state with retry option
- **Slow queries**: Display loading skeleton
- **Mobile small screens**: Components scroll and resize properly
- **Keyboard navigation**: All elements accessible via keyboard
- **Screen reader**: Proper ARIA labels and announcements

## Acceptance Criteria

- ✅ TournamentCourseExplorer section appears on `/tournaments/pga/[year]` page
- ✅ Section displays "What Would You Like to Know?" heading
- ✅ CourseSelect dropdown shows available courses
- ✅ 6 category cards render in responsive grid (1/2/3 columns)
- ✅ Clicking category without course selected shows helpful message
- ✅ Clicking category with course selected navigates to category page
- ✅ All 6 category pages display correctly with real data
- ✅ Course information shows inception, architect, length
- ✅ Scorecard displays par and yardage for 18 holes
- ✅ Conditions show grass types, green size, bunker sand
- ✅ Winners history shows winners since 2015 with player links
- ✅ Top finishers allows selecting top 10/15/20 and year
- ✅ Majors displays majors hosted (or empty state)
- ✅ Player links navigate to correct player profiles
- ✅ Mobile-first responsive design with ≥44px touch targets
- ✅ Dark mode support with golf green accents
- ✅ Breadcrumb navigation shows correct path
- ✅ Loading states display during queries
- ✅ Error states handle network/query failures
- ✅ No TypeScript or build errors
- ✅ No regressions in existing tournament functionality
- ✅ All Convex queries follow `.take(limit)` rules

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev` - Deploy Convex schema and functions (run in background)
- `npm run dev` - Start the Next.js dev server and manually test the feature end-to-end
- Manual testing checklist:
  1. Navigate to `http://localhost:3000/tournaments/pga/2025`
  2. Verify TournamentCourseExplorer section appears below year selector
  3. Click CourseSelect dropdown → verify courses load
  4. Select "TPC Sawgrass" (or another course)
  5. Click "Course Information" card → verify redirect
  6. Verify course info displays (inception, architect, length)
  7. Navigate back → select course → click "Course Scorecard"
  8. Verify scorecard displays with 18 holes, par, yardage
  9. Test "Course Conditions" → verify grass types, green size, bunker sand
  10. Test "Winners Since 2015" → verify winners list with player links
  11. Click player link → verify navigation to player profile
  12. Test "Top Finishers" → change top N selector → verify list updates
  13. Test "Major Championships" → verify majors display (or empty state)
  14. Test responsive design: resize to mobile (320px), tablet (768px), desktop (1024px)
  15. Test dark mode: toggle theme → verify styling
  16. Test keyboard navigation: Tab through elements, Escape behavior
  17. Verify breadcrumbs show correct path
  18. Verify existing tournament tables still work correctly
- `npm test` - Run tests to validate the feature works with zero regressions (if tests exist)

## Notes

### Data Population Strategy

**Phase 1 - Manual Entry** (MVP):
- Manually populate 5-10 popular courses with full data
- Use Convex dashboard or admin UI
- Courses: Augusta National, TPC Sawgrass, Pebble Beach, Torrey Pines, TPC Scottsdale

**Phase 2 - Automated Import**:
- Create Python scripts to scrape PGA.com course details
- Import scorecard data from ESPN Golf
- Parse historical winners from existing tournament data
- Identify majors from tournament names

**Phase 3 - Community Contributions**:
- Build admin UI for course data management
- Allow authenticated users to submit course data
- Review and approve submissions

### Missing Data Handling

- **Scorecard**: If missing, show "Scorecard data not available"
- **Grass Types**: Default to "Unknown" with option to contribute
- **Green Size**: Show "Not available" if null
- **Winners History**: Query from existing tournamentResults when courseWinners empty
- **Majors**: Determine from tournament name patterns (Masters, PGA Championship, U.S. Open, The Open)

### Future Enhancements

- **Course Comparison**: Compare 2+ courses side-by-side
- **Course Difficulty Metrics**: Calculate and display difficulty ratings
- **Weather History**: Historical weather conditions during tournaments
- **Scoring Trends**: Average scores over years
- **Player Performance Heatmap**: Show which players excel at this course
- **Course Flyovers**: Embed video flyovers or aerial imagery
- **Hole-by-Hole Details**: Detailed info for each hole with images
- **Course Rankings**: Allow users to rate/rank courses

### Design Considerations

- **Visual Hierarchy**: Course selector prominent but not overwhelming
- **Empty States**: Graceful handling of missing data
- **Loading Performance**: Optimize queries for fast page loads
- **Mobile Experience**: Consider collapsible sections on mobile
- **Course Images**: Optional course images/logos in future

### Technical Considerations

- **Course-Tournament Mapping**: Use existing `tournamentCourses` table
- **Query Optimization**: Pre-aggregate winners data for faster queries
- **Caching Strategy**: Consider caching course details
- **Data Normalization**: Ensure grass types use consistent terminology
- **Major Identification**: Robust pattern matching for major tournaments

### Convex Database Rules Compliance

- ✅ All queries use `.take(limit)` with reasonable defaults (50-100)
- ✅ All queries use `.withIndex()` for filtering
- ✅ Small tables (<200) can use `.collect()` with indexes (courseMajors, tournamentCourses)
- ✅ New tables include proper indexes for efficient querying
- ✅ Batch operations use 25-50 item limits
- ✅ Frontend `useQuery` calls always include `{}` argument

### Schema Extension Notes

**New Fields on `courses` Table**:
- All new fields are optional to support gradual data population
- `scorecardPar` and `scorecardYardage` arrays must have 18 elements
- `avgGreenSize` in square feet (typical range: 4,000-8,000 sq. ft.)
- `grassGreens` and `grassFairways` use standardized names (Bentgrass, Bermuda, Poa Annua, etc.)
- `bunkerSandType` examples: "Pure White Silica", "Capillary Concrete", "Standard Sand"

**New Tables**:
- `courseWinners` pre-aggregates winner data for fast queries
- `courseMajors` stores major championship history (most courses have 0)
- Both tables indexed for efficient course-based queries

### Mobile-First Considerations

- Scorecard table scrolls horizontally on mobile
- Winners table collapses columns on small screens
- Course selector full-width on mobile
- Category cards stack vertically on mobile (1 column)
- Touch targets ≥44px for all interactive elements
- Bottom navigation spacing for mobile Safari
