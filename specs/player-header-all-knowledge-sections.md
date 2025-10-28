# Feature: Player Profile Header Across All Knowledge Hub Sections

## Feature Description

Apply the `PlayerBio` component (player profile header) consistently across all 8 Player Knowledge Hub category pages. Currently, the player profile header is only visible on the "Personal Profile" page (`/profile`). This feature will add the same header to all other knowledge categories: Family, Family Golf History, Professional History, Hometown Courses, University Courses, Injury History, and Intangibles.

The player profile header displays:
- Player avatar/photo or initials
- Player's full name (uppercase)
- Country flag emoji and country name
- Follow/unfollow button
- Decorative flag background pattern

This creates a consistent user experience where users always see which player's data they're viewing, regardless of which knowledge category they're exploring.

## User Story

As a user exploring player knowledge hub categories
I want to see the player's profile header on every category page
So that I always know which player's information I'm viewing and can quickly follow/unfollow them without navigating back to the profile page

## Problem Statement

Currently, the player profile header (`PlayerBio` component) is only displayed on the Personal Profile page (`/players/[playerId]/profile`). When users navigate to other knowledge categories like Family, Injuries, or Intangibles, they lose this visual context about which player they're viewing. This creates an inconsistent user experience and makes it unclear whose data is being displayed, especially after navigating through multiple players and categories.

Users must navigate back to the profile page to see the player's photo, country, or to follow/unfollow them. This adds unnecessary navigation friction and breaks the flow of exploring player knowledge.

## Solution Statement

Add the `PlayerBio` component to the top of all 7 remaining Player Knowledge Hub category pages. The component will be imported and placed consistently at the top of the page content (after any data notice cards) in each category page:

1. Family (`/family/page.tsx`)
2. Family Golf History (`/family-history/page.tsx`)
3. Professional History (`/professional/page.tsx`)
4. Hometown Courses (`/hometown-courses/page.tsx`)
5. University Courses (`/university-courses/page.tsx`)
6. Injury History (`/injuries/page.tsx`)
7. Intangibles (`/intangibles/page.tsx`)

This creates visual consistency, improves user context awareness, and allows follow/unfollow actions from any knowledge category page.

## Relevant Files

Use these files to implement the feature:

- `components/player/PlayerBio.tsx` - **Existing component to reuse**. Contains the player profile header with avatar, name, country, and follow button. Already imported and working in `/profile/page.tsx`.

- `app/players/[playerId]/profile/page.tsx` - **Reference implementation**. Shows how `PlayerBio` is currently used with proper imports, loading states, and error handling.

- `app/players/[playerId]/family/page.tsx` - **Update**: Add `PlayerBio` component below data notice, convert to client component if needed.

- `app/players/[playerId]/family-history/page.tsx` - **Update**: Add `PlayerBio` component below data notice, convert to client component if needed.

- `app/players/[playerId]/professional/page.tsx` - **Update**: Add `PlayerBio` component below data notice, convert to client component if needed.

- `app/players/[playerId]/hometown-courses/page.tsx` - **Update**: Add `PlayerBio` component below data notice, convert to client component if needed.

- `app/players/[playerId]/university-courses/page.tsx` - **Update**: Add `PlayerBio` component below data notice, convert to client component if needed.

- `app/players/[playerId]/injuries/page.tsx` - **Update**: Add `PlayerBio` component below data notice, convert to client component if needed.

- `app/players/[playerId]/intangibles/page.tsx` - **Update**: Add `PlayerBio` component below data notice, convert to client component if needed.

- `app/players/[playerId]/layout.tsx` - **Reference**: Contains breadcrumbs and shared layout structure, no changes needed.

- `convex/players.ts` - **Reference**: Contains `getPlayer`, `isFollowingPlayer`, `followPlayer`, `unfollowPlayer` queries/mutations used by `PlayerBio`. No changes needed.

### New Files

No new files need to be created. This is purely an integration task using existing components.

## shadcn/ui Components

### Existing Components to Use

All required shadcn/ui components are already imported and used by `PlayerBio`:
- `Card` - Container for player profile header
- `CardContent` - Content wrapper for player info
- `Button` - Follow/unfollow action button

All category pages already use:
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` - Content cards
- `Badge` - Status indicators
- Various Lucide icons (`Users`, `Heart`, `Baby`, `Activity`, `Brain`, etc.)
- `Skeleton` - Loading states (already in profile page)

### New Components to Add

None needed. All required UI components are already available in the codebase.

### Custom Components to Create

None needed. `PlayerBio` is the existing component being reused across all pages.

## Implementation Plan

### Phase 1: Foundation

**Analyze existing implementation**:
- Review `/profile/page.tsx` to understand exact implementation pattern
- Identify that `PlayerBio` requires client-side rendering (`"use client"`)
- Confirm `PlayerBio` accepts `playerId` prop of type `Id<"players">`
- Note spacing pattern: PlayerBio comes first, data notice second, content cards follow

**Convert pages to client components**:
- All 7 category pages are currently server components (`async function`)
- Must convert to client components since `PlayerBio` uses Convex hooks (`useQuery`, `useMutation`)
- Pattern: Remove `async`, add `"use client"` directive, use React `use()` hook for params

### Phase 2: Core Implementation

**Update each category page** following this pattern:
1. Add `"use client"` directive at top of file
2. Import `PlayerBio` component
3. Import React's `use` hook for params unwrapping
4. Convert `params` from `Promise` to synchronous access using `use()`
5. Place `PlayerBio` component after data notice card but before main content

**Consistency requirements**:
- All pages use same spacing: `space-y-4 sm:space-y-6`
- PlayerBio appears in consistent position (after data notice, before content)
- No changes to existing content, just add PlayerBio component

### Phase 3: Integration

**Visual consistency validation**:
- Test navigation flow between all 8 knowledge categories
- Verify PlayerBio renders correctly on all pages
- Confirm follow/unfollow button works from each page
- Check mobile responsive layout (avatar size, name truncation, button layout)

**Error handling**:
- PlayerBio handles player not found internally (shows loading skeleton)
- No additional error handling needed in category pages
- Existing data notice cards remain unchanged

## Step by Step Tasks

### Step 1: Update Family Page

- Add `"use client"` directive at top of `/app/players/[playerId]/family/page.tsx`
- Import `use` from React: `import { use } from "react"`
- Import `PlayerBio`: `import PlayerBio from "@/components/player/PlayerBio"`
- Import `Id` type: `import { Id } from "@/convex/_generated/dataModel"`
- Change function signature from `async function FamilyPage({ params }: FamilyPageProps)` to `export default function FamilyPage({ params }: FamilyPageProps)`
- Change `const { playerId } = await params` to `const { playerId } = use(params)`
- Add `<PlayerBio playerId={playerId as Id<"players">} />` after opening `<div className="space-y-4 sm:space-y-6">` and before data notice card

### Step 2: Update Family History Page

- Add `"use client"` directive at top of `/app/players/[playerId]/family-history/page.tsx`
- Import `use` from React: `import { use } from "react"`
- Import `PlayerBio`: `import PlayerBio from "@/components/player/PlayerBio"`
- Import `Id` type: `import { Id } from "@/convex/_generated/dataModel"`
- Change function signature from `async function FamilyHistoryPage({ params }: FamilyHistoryPageProps)` to `export default function FamilyHistoryPage({ params }: FamilyHistoryPageProps)`
- Change `const { playerId } = await params` to `const { playerId } = use(params)`
- Add `<PlayerBio playerId={playerId as Id<"players">} />` after opening `<div className="space-y-4 sm:space-y-6">` and before data notice card

### Step 3: Update Professional History Page

- Add `"use client"` directive at top of `/app/players/[playerId]/professional/page.tsx`
- Import `use` from React: `import { use } from "react"`
- Import `PlayerBio`: `import PlayerBio from "@/components/player/PlayerBio"`
- Import `Id` type: `import { Id } from "@/convex/_generated/dataModel"`
- Change function signature from async to sync
- Change `const { playerId } = await params` to `const { playerId } = use(params)`
- Add `<PlayerBio playerId={playerId as Id<"players">} />` after opening `<div className="space-y-4 sm:space-y-6">` and before data notice card

### Step 4: Update Hometown Courses Page

- Add `"use client"` directive at top of `/app/players/[playerId]/hometown-courses/page.tsx`
- Import `use` from React: `import { use } from "react"`
- Import `PlayerBio`: `import PlayerBio from "@/components/player/PlayerBio"`
- Import `Id` type: `import { Id } from "@/convex/_generated/dataModel"`
- Change function signature from async to sync
- Change `const { playerId } = await params` to `const { playerId } = use(params)`
- Add `<PlayerBio playerId={playerId as Id<"players">} />` after opening `<div className="space-y-4 sm:space-y-6">` and before data notice card

### Step 5: Update University Courses Page

- Add `"use client"` directive at top of `/app/players/[playerId]/university-courses/page.tsx`
- Import `use` from React: `import { use } from "react"`
- Import `PlayerBio`: `import PlayerBio from "@/components/player/PlayerBio"`
- Import `Id` type: `import { Id } from "@/convex/_generated/dataModel"`
- Change function signature from async to sync
- Change `const { playerId } = await params` to `const { playerId } = use(params)`
- Add `<PlayerBio playerId={playerId as Id<"players">} />` after opening `<div className="space-y-4 sm:space-y-6">` and before data notice card

### Step 6: Update Injury History Page

- Add `"use client"` directive at top of `/app/players/[playerId]/injuries/page.tsx`
- Import `use` from React: `import { use } from "react"`
- Import `PlayerBio`: `import PlayerBio from "@/components/player/PlayerBio"`
- Import `Id` type: `import { Id } from "@/convex/_generated/dataModel"`
- Change function signature from async to sync
- Change `const { playerId } = await params` to `const { playerId } = use(params)`
- Add `<PlayerBio playerId={playerId as Id<"players">} />` after opening `<div className="space-y-4 sm:space-y-6">` and before data notice card

### Step 7: Update Intangibles Page

- Add `"use client"` directive at top of `/app/players/[playerId]/intangibles/page.tsx`
- Import `use` from React: `import { use } from "react"`
- Import `PlayerBio`: `import PlayerBio from "@/components/player/PlayerBio"`
- Import `Id` type: `import { Id } from "@/convex/_generated/dataModel"`
- Change function signature from async to sync
- Change `const { playerId } = await params` to `const { playerId } = use(params)`
- Add `<PlayerBio playerId={playerId as Id<"players">} />` after opening `<div className="space-y-4 sm:space-y-6">` and before data notice card

### Step 8: Run Validation Commands

- Execute `npm run build` to validate TypeScript compilation with zero errors
- Execute `npx convex dev` (run in background) to ensure Convex backend is running
- Execute `npm run dev` to start development server
- Manually test all 8 knowledge category pages for the same test player:
  - Navigate to `/players/k973t2kprbv6sabjehch2yzktd7r9np1/profile` - Verify PlayerBio exists
  - Navigate to `/players/k973t2kprbv6sabjehch2yzktd7r9np1/family` - Verify PlayerBio added
  - Navigate to `/players/k973t2kprbv6sabjehch2yzktd7r9np1/family-history` - Verify PlayerBio added
  - Navigate to `/players/k973t2kprbv6sabjehch2yzktd7r9np1/professional` - Verify PlayerBio added
  - Navigate to `/players/k973t2kprbv6sabjehch2yzktd7r9np1/hometown-courses` - Verify PlayerBio added
  - Navigate to `/players/k973t2kprbv6sabjehch2yzktd7r9np1/university-courses` - Verify PlayerBio added
  - Navigate to `/players/k973t2kprbv6sabjehch2yzktd7r9np1/injuries` - Verify PlayerBio added
  - Navigate to `/players/k973t2kprbv6sabjehch2yzktd7r9np1/intangibles` - Verify PlayerBio added
- Test follow/unfollow functionality from each page
- Test mobile responsive layout on all pages (resize browser to 375px width)
- Verify correct spacing between PlayerBio, data notice, and content cards

## Testing Strategy

### Unit Tests

No unit tests required for this feature. This is a pure UI integration task using an existing, tested component (`PlayerBio`).

### Integration Tests

**Manual integration testing**:
1. **Navigation flow**: Navigate through all 8 knowledge categories for the same player
2. **Follow state persistence**: Follow a player from one page, verify follow state persists across all categories
3. **Player switching**: Select a different player from `/players` page, verify PlayerBio updates correctly on all pages
4. **Loading states**: Refresh page on each category, verify PlayerBio skeleton appears during loading

### Edge Cases

1. **Player not found**: Navigate to invalid playerId URL (e.g., `/players/invalid-id/family`) - PlayerBio should show loading skeleton, page content should handle gracefully
2. **No player photo**: Navigate to player without photoUrl - PlayerBio should show initials fallback
3. **Long player names**: Test with player names that might wrap on mobile (e.g., "Cameron Young", "Viktor Hovland")
4. **Country code edge cases**: Test UK subdivision country codes (GB-ENG, GB-SCT) - should display UK flag emoji
5. **Unauthenticated user**: Test follow/unfollow when not logged in - should prompt authentication
6. **Network latency**: Throttle network to 3G, verify PlayerBio skeleton displays properly before data loads

## Acceptance Criteria

1. ✅ PlayerBio component appears on all 8 Player Knowledge Hub category pages
2. ✅ PlayerBio is positioned consistently (after data notice card, before main content)
3. ✅ Follow/unfollow button works correctly from every category page
4. ✅ Follow state persists when navigating between categories
5. ✅ Player avatar/photo displays correctly on all pages (or initials fallback)
6. ✅ Country flag emoji displays correctly on all pages
7. ✅ Mobile responsive layout works on all pages (avatar scales, name wraps, button stacks)
8. ✅ Loading skeleton displays while player data fetches on all pages
9. ✅ No TypeScript build errors or warnings
10. ✅ No visual regressions on existing content (data notices, cards, content remain unchanged)
11. ✅ No console errors when navigating through all pages
12. ✅ Page performance remains fast (no noticeable slowdown from adding PlayerBio)

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors (must complete with zero errors)
- `npx convex dev` - Deploy Convex schema and functions (run in background, verify "Convex functions ready" message)
- `npm run dev` - Start the Next.js dev server and manually test the feature end-to-end (navigate to all 8 category pages at `http://localhost:3000/players/k973t2kprbv6sabjehch2yzktd7r9np1/{category}`)
- Manual browser testing checklist:
  - Visit `/players/k973t2kprbv6sabjehch2yzktd7r9np1/profile` → Verify PlayerBio exists (baseline)
  - Visit `/players/k973t2kprbv6sabjehch2yzktd7r9np1/family` → Verify PlayerBio added
  - Visit `/players/k973t2kprbv6sabjehch2yzktd7r9np1/family-history` → Verify PlayerBio added
  - Visit `/players/k973t2kprbv6sabjehch2yzktd7r9np1/professional` → Verify PlayerBio added
  - Visit `/players/k973t2kprbv6sabjehch2yzktd7r9np1/hometown-courses` → Verify PlayerBio added
  - Visit `/players/k973t2kprbv6sabjehch2yzktd7r9np1/university-courses` → Verify PlayerBio added
  - Visit `/players/k973t2kprbv6sabjehch2yzktd7r9np1/injuries` → Verify PlayerBio added
  - Visit `/players/k973t2kprbv6sabjehch2yzktd7r9np1/intangibles` → Verify PlayerBio added
  - Test follow/unfollow button on any page → Verify state updates immediately
  - Navigate between categories → Verify follow state persists
  - Resize browser to 375px width → Verify mobile responsive layout
  - Check browser console → Verify zero errors or warnings

## Notes

### Key Implementation Details

1. **Client vs Server Components**: All category pages must be converted from server components (`async function`) to client components (`"use client"`) because `PlayerBio` uses Convex hooks that require client-side rendering.

2. **React 19 params handling**: Next.js 15 with React 19 changed params from synchronous to async. Use React's `use()` hook to unwrap the Promise: `const { playerId } = use(params)`.

3. **No layout changes**: The shared `layout.tsx` does not need changes. It already provides breadcrumbs and navigation structure.

4. **No backend changes**: All Convex queries (`getPlayer`, `isFollowingPlayer`, `followPlayer`, `unfollowPlayer`) already exist and work correctly.

5. **Placeholder data pages**: All 7 category pages (except profile) currently use placeholder data from `lib/placeholder-data.ts`. Adding PlayerBio doesn't change this - it only provides visual consistency until real data integration happens in a future phase.

### Visual Consistency

- PlayerBio includes decorative flag background pattern (gradient from blue → white → red with 10% opacity)
- Avatar is 24x24 on mobile (sm:32x32 on desktop) with 4px border
- Player name is uppercase, 2xl on mobile (sm:3xl on desktop)
- Country flag emoji uses special handling for UK subdivisions (GB-ENG → 🇬🇧)
- Follow button is full-width on mobile, auto-width on desktop

### Performance Considerations

- PlayerBio uses Convex's built-in caching and reactivity, no additional optimization needed
- Component already exists and is tested, minimal risk of introducing bugs
- No new network requests (same queries already run for follow functionality)

### Future Enhancements (Out of Scope)

- Sticky PlayerBio header on scroll (would require additional CSS/JavaScript)
- Expandable/collapsible PlayerBio on mobile to save space (would require state management)
- Player comparison mode showing multiple PlayerBios side-by-side (would require redesign)
- Player statistics summary in PlayerBio (would require additional Convex queries)
