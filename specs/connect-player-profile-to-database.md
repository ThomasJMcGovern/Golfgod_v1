# Chore: Connect Player Profile Page to Convex Database

## Chore Description

Replace placeholder data in the Personal Profile page (`/players/[playerId]/profile`) with real player data from the Convex database. The existing `players` table contains 90% of the required fields (height, weight, swing, birthDate, birthPlace, college, turnedPro), making this a straightforward backend-to-frontend connection.

**Current State**: Profile page uses `getPlaceholderProfile()` from `lib/placeholder-data.ts`

**Target State**: Profile page queries `api.players.getPlayer` from Convex and displays real data

**Scope**:
- Personal Information card (birthDate, birthPlace, college, turnedPro)
- Physical Statistics card (height, weight, swing)
- Background card remains placeholder (narrative text not in schema)

## Relevant Files

Use these files to resolve the chore:

- **`app/players/[playerId]/profile/page.tsx`** - Main profile page component currently using placeholder data. Needs conversion to client component with Convex query integration.

- **`convex/players.ts`** - Contains `getPlayer` query (lines 74-82) that retrieves player by ID. Already exports the function we need.

- **`convex/schema.ts`** - Database schema with `players` table definition (lines 12-34). Confirms all physical stats and personal info fields are available.

- **`lib/placeholder-data.ts`** - Contains `PlaceholderProfile` interface and `getPlaceholderProfile()` function. Reference for data structure, but will be replaced.

- **`components/ui/skeleton.tsx`** - Loading skeleton component for data fetching states.

- **`components/ui/card.tsx`** - shadcn/ui Card components (Card, CardHeader, CardTitle, CardDescription, CardContent) used throughout the profile page.

- **`components/ui/badge.tsx`** - shadcn/ui Badge component used for displaying swing handedness.

- **`app/players/[playerId]/layout.tsx`** - Player layout with breadcrumbs and navigation context. No changes needed, but good to understand routing.

### New Files

None required. All necessary components and queries already exist.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Profile Page Component Structure

- Convert `app/players/[playerId]/profile/page.tsx` from Server Component to Client Component
- Add `"use client"` directive at the top of the file
- Import Convex hooks: `import { useQuery } from "convex/react"`
- Import API types: `import { api } from "@/convex/_generated/api"` and `import { Id } from "@/convex/_generated/dataModel"`
- Import Skeleton component: `import { Skeleton } from "@/components/ui/skeleton"`
- Remove import of `getPlaceholderProfile` from `lib/placeholder-data`
- Change `params` handling from `Promise` to direct object access using `use()` hook from React

### 2. Add Convex Query Integration

- Add Convex query to fetch player data: `const player = useQuery(api.players.getPlayer, { playerId })`
- Implement loading state with skeleton UI while `player` is `undefined`
- Add null check for when player is not found (error state)
- Extract player data fields from query result to use in UI

### 3. Update Personal Information Card

- Replace `profile.personalInfo.birthDate` with `player.birthDate`
- Replace `profile.personalInfo.birthPlace` with `player.birthPlace`
- Replace `profile.personalInfo.college` with `player.college`
- Replace `profile.personalInfo.turnedPro` with `player.turnedPro`
- Add null/undefined checks with fallback display (e.g., "Not available")
- Format dates if needed (birthDate is optional string in schema)

### 4. Update Physical Statistics Card

- Replace `profile.personalInfo.height` with `player.height`
- Replace `profile.personalInfo.weight` with `player.weight`
- Replace `profile.personalInfo.swing` with `player.swing`
- Add null/undefined checks for optional fields
- Ensure Badge component properly displays `{player.swing}-handed`

### 5. Handle Background Card

- Keep Background card as-is with placeholder text for now
- Update the "Preview Mode" notice to clarify: "Personal and physical stats are live data. Background narratives are placeholder content pending future enrichment."
- Change notice styling from `border-primary/50 bg-primary/5` to `border-muted bg-muted/20` to indicate partial data integration

### 6. Create Loading Skeleton Component

- Design skeleton layout matching the profile page structure
- Include skeleton for Personal Information card (4 items in 2x2 grid)
- Include skeleton for Physical Statistics card (3 items in 1x3 grid)
- Include skeleton for Background card (3 text blocks)
- Use `Skeleton` component from `components/ui/skeleton.tsx`
- Match responsive grid layouts (grid-cols-1 sm:grid-cols-2 for personal info, grid-cols-1 sm:grid-cols-3 for physical stats)

### 7. Add Error Handling

- Create error state UI for when `player` is `null` (player not found)
- Display user-friendly error message in Card component
- Include "Back to Players" button to navigate back
- Maintain consistent styling with existing error patterns in the app

### 8. Test Mobile Responsiveness

- Verify profile page displays correctly on mobile viewport (< 640px)
- Ensure cards stack properly on small screens
- Verify touch targets are ≥44px for interactive elements
- Test loading skeleton responsiveness
- Validate data displays correctly with real player data across different screen sizes

### 9. Validate Data Display

- Test with at least 3 different players to verify data fetching
- Verify null/undefined fields display gracefully with "Not available" fallback
- Confirm swing badge shows "Right-handed" or "Left-handed" correctly
- Check that numeric fields (turnedPro) display without type errors
- Validate date formatting for birthDate field

### 10. Run Validation Commands

Execute all validation commands to ensure chore is complete with zero regressions.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev` - Deploy Convex schema and functions (run in background, verify no schema errors)
- `npm run dev` - Start the Next.js dev server and manually validate:
  - Navigate to `/players` page
  - Select a player (e.g., Scottie Scheffler)
  - Click "Personal Profile" card in "What Would You Like to Know?" section
  - Verify real data displays in Personal Information and Physical Statistics cards
  - Verify loading skeleton appears briefly before data loads
  - Test with multiple players to confirm query works correctly
  - Test mobile viewport (resize browser to < 640px) to ensure responsive design
  - Verify "Not available" displays for missing optional fields

## Notes

### Convex Query Best Practices

This chore follows `.claude/CLAUDE.md` rules:
- ✅ Using `getPlayer` query with explicit `playerId` argument
- ✅ Frontend passes empty object `{}` when backend expects no args (N/A - this query requires playerId)
- ✅ Query returns single player via `ctx.db.get()` - not using `.collect()` on large table
- ✅ No schema changes required - all fields already exist

### Data Availability

According to `DATABASE_MAP.md`, the `players` table has ~200 records with:
- **Always present**: `name`, `firstName`, `lastName`, `country`, `countryCode`
- **Optional fields**: `birthDate`, `birthPlace`, `college`, `swing`, `turnedPro`, `height`, `weight`, `photoUrl`

Expect some players to have incomplete data. Handle gracefully with "Not available" fallbacks.

### Background Narratives

The Background card (Early Life, Golf Beginnings, Achievements) will remain placeholder text. Schema does not include narrative biography fields. This is acceptable for Phase 1 (90% complete implementation). Future enhancement can add `playerBios` table per Option 3 in the original analysis.

### TypeScript Considerations

- `params` in Next.js 15 App Router is now a Promise, requiring `use()` hook in Client Components
- Player fields are optional in schema, so TypeScript will enforce null checks
- `Id<"players">` type must be imported from `@/convex/_generated/dataModel`

### Mobile-First Design

Existing profile page already has responsive classes:
- `space-y-4 sm:space-y-6` - Vertical spacing
- `grid-cols-1 sm:grid-cols-2` - Personal info grid
- `grid-cols-1 sm:grid-cols-3` - Physical stats grid

Maintain these patterns in skeleton and error states.

### Testing Strategy

1. **Happy path**: Player with complete data (e.g., Scottie Scheffler likely has full bio)
2. **Partial data**: Player with missing optional fields (test null handling)
3. **Edge cases**: Very long names, international characters in birthPlace
4. **Performance**: Verify query loads quickly (single document fetch via ID is fast)
