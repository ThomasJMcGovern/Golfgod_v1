# Bug: Tournament Link Redirects Instead of Showing Tournament Landing Page

## Bug Description

When clicking the "View Tournaments" link from the landing page (authenticated or unauthenticated), users are immediately redirected from `http://localhost:3000/tournaments` to `http://localhost:3000/tournaments/pga/2019` (or another year). This prevents users from seeing a tournament landing page at `/tournaments` and forces them directly into a specific year's tournament listing.

**Expected Behavior**:
- Clicking "View Tournaments" should navigate to `/tournaments`
- Users should see a tournament landing page with options to select tour type and year
- No automatic redirect should occur

**Actual Behavior**:
- Clicking "View Tournaments" navigates to `/tournaments`
- User immediately redirected to `/tournaments/pga/[year]` (e.g., 2019 or current year)
- No landing page is shown

## Problem Statement

The `/tournaments` page (`app/tournaments/page.tsx`) is currently implemented as a redirect-only page that automatically forwards users to a specific year's tournament page (`/tournaments/pga/[year]`). This behavior:

1. Provides no context or landing experience for the tournaments feature
2. Bypasses the opportunity to show tour selection (PGA, LPGA, Champions, etc.)
3. Forces users directly into a specific year without choice
4. Creates confusing UX where clicking a link immediately redirects elsewhere

## Solution Statement

Remove the automatic redirect logic from `app/tournaments/page.tsx` and replace it with a proper tournament landing page. The landing page should:

1. Display tournament tour options (PGA TOUR, LPGA, Champions, LIV, DP World, Korn Ferry)
2. Show year selector or recent tournaments
3. Use the same visual design pattern as the landing page feature cards
4. Allow users to manually select which tour and year they want to view
5. Include breadcrumb navigation (Home > Tournaments)

## Steps to Reproduce

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Sign in (if not already authenticated)
4. Click on the "View Tournaments" card or link
5. Observe the URL changes from `/tournaments` to `/tournaments/pga/[year]` immediately
6. Note that no tournament landing page is shown

## Root Cause Analysis

**File**: `app/tournaments/page.tsx`

**Root Cause**: The page component contains a `useEffect` hook that automatically redirects users to a year-specific page:

```typescript
useEffect(() => {
  if (availableYears && availableYears.length > 0) {
    // Get the current year or the most recent year available
    const currentYear = new Date().getFullYear();
    const yearToRedirect = availableYears.includes(currentYear)
      ? currentYear
      : availableYears[0]; // First year is the most recent since they're sorted desc

    router.replace(`/tournaments/pga/${yearToRedirect}`);
  }
}, [availableYears, router]);
```

This `useEffect` executes immediately when the component mounts and `availableYears` data is loaded, causing an automatic redirect. The entire page is designed only to show a loading skeleton while the redirect occurs.

**Why This Exists**: This was likely implemented as a quick shortcut to get users to tournament data, but it creates a poor UX by bypassing any landing/selection page.

## Relevant Files

Use these files to fix the bug:

### Existing Files to Modify

- **`app/tournaments/page.tsx`** (37 lines) - The main tournament landing page
  - Currently: Auto-redirects to `/tournaments/pga/[year]` via useEffect
  - Change: Replace redirect logic with proper landing page UI
  - Add: Tournament tour selection cards (PGA, LPGA, Champions, LIV, DP World, Korn Ferry)
  - Add: Breadcrumb navigation (Home > Tournaments)
  - Pattern: Use FeatureCard-style layout similar to landing page

- **`app/page.tsx`** (346 lines) - Landing page with tournaments link
  - Reference: Shows how feature cards are displayed
  - No changes needed, just for reference

- **`components/landing/FeatureCard.tsx`** (88 lines) - Reusable feature card component
  - No changes needed, will be reused for tournament tour cards

### Reference Files

- **`app/inside-the-ropes/page.tsx`** - Hub page pattern to follow
  - Shows how to create a selection hub page
  - Pattern: Multiple feature cards with routes to sub-pages

- **`app/players/page.tsx`** - Player page with breadcrumbs
  - Shows breadcrumb navigation pattern
  - Reference for header styling

## Step by Step Tasks

### 1. Remove Auto-Redirect Logic from Tournament Page

- Open `app/tournaments/page.tsx`
- Remove the `useQuery` call to `api.tournaments.getAvailableYears`
- Remove the `useEffect` hook containing the redirect logic
- Remove the import for `useQuery`, `api`, and `Skeleton` (no longer needed)
- Keep `"use client"` directive and `useRouter` for navigation

### 2. Create Tournament Landing Page UI

- Add tournament tour selection cards using the FeatureCard pattern
- Import necessary components:
  - `FeatureCard` from `@/components/landing/FeatureCard`
  - Icons from `lucide-react`: `Trophy`, `Users`, `Calendar`, `Target`, `Globe`, `Star`
  - Breadcrumb components from `@/components/ui/breadcrumb`
  - Layout components: `UserMenu`, `ModeToggle`, `Button`
  - Authentication: `Authenticated`, `Unauthenticated` from `convex/react`

### 3. Implement Tournament Hub Layout

- Create header section with back button, title, mode toggle, and user menu
- Add breadcrumb navigation below header: Home > Tournaments
- Create main content area with welcome section
- Add grid of tournament tour cards (6 tours):
  1. **PGA TOUR** - Active, links to `/tournaments/pga/2025`
  2. **LPGA** - Coming soon, disabled
  3. **PGA TOUR Champions** - Coming soon, disabled
  4. **LIV Golf** - Coming soon, disabled
  5. **DP World Tour** - Coming soon, disabled
  6. **Korn Ferry Tour** - Coming soon, disabled

### 4. Style Tournament Tour Cards

- Use consistent color scheme for each tour:
  - PGA TOUR: Red/primary color (matches PGA brand)
  - LPGA: Purple
  - Champions: Gold
  - LIV: Green
  - DP World: Orange
  - Korn Ferry: Blue
- Add "COMING SOON" badges to inactive tours
- Make only PGA TOUR card clickable initially
- Use hover effects and cursor pointer for active cards

### 5. Add Authentication Guards

- Wrap entire page in authentication check
- Show unauthenticated state if not logged in
- Display authenticated tournament hub when logged in
- Use same pattern as other protected pages

### 6. Update Breadcrumb for Dynamic Year

- Ensure `/tournaments/pga/[year]/page.tsx` breadcrumb links back to `/tournaments` not `/tournaments/pga/2025`
- Current breadcrumb: Home > Tournaments > [Year]
- Fix the "Tournaments" link to point to `/tournaments` instead of `/tournaments/pga/2025`

### 7. Test Navigation Flow

- Test unauthenticated access to `/tournaments`
- Test authenticated access to `/tournaments`
- Test clicking PGA TOUR card navigates to `/tournaments/pga/2025`
- Test breadcrumb navigation from year page back to `/tournaments`
- Test coming soon tours show badge and are not clickable
- Test responsive design on mobile viewport

### 8. Run Validation Commands

Execute all validation commands to ensure zero regressions:
- Build the project with `npm run build`
- Start dev server with `npm run dev`
- Manually test navigation flow
- Verify TypeScript has no errors
- Check responsive design

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

```bash
# 1. Build validation - ensure no TypeScript errors
npm run build

# 2. Start development server
npm run dev

# 3. Manual testing checklist
# Navigate to http://localhost:3000
# - Sign in if not authenticated
# - Click "View Tournaments" card or footer link
# - VERIFY: URL is http://localhost:3000/tournaments (does NOT redirect)
# - VERIFY: See tournament landing page with tour selection
# - VERIFY: Breadcrumb shows "Home > Tournaments"
# - VERIFY: PGA TOUR card is clickable and has hover effect
# - VERIFY: Other tour cards show "COMING SOON" badge
# - Click PGA TOUR card
# - VERIFY: Navigate to /tournaments/pga/2025
# - VERIFY: Breadcrumb shows "Home > Tournaments > 2025"
# - Click "Tournaments" in breadcrumb
# - VERIFY: Navigate back to /tournaments
# - VERIFY: No redirect occurs

# 4. Test unauthenticated access
# - Sign out
# - Navigate to http://localhost:3000/tournaments
# - VERIFY: See sign in prompt (same as other protected pages)

# 5. Test responsive design
# - Resize browser to mobile viewport (375px)
# - VERIFY: Tournament cards stack vertically
# - VERIFY: Breadcrumbs hidden on mobile
# - VERIFY: Header responsive

# 6. Check console for errors
# - Open browser DevTools console
# - VERIFY: No errors or warnings
```

## Notes

**Design Considerations**:
- Use FeatureCard component for consistency with landing page
- Follow the Inside the Ropes hub pattern (selection page with feature cards)
- PGA TOUR is the only active tour initially (others coming soon)
- Desktop-only breadcrumbs (`hidden sm:block`) to match other pages
- Mobile-first responsive design with proper touch targets

**Future Enhancements**:
- Activate LPGA, Champions, LIV, DP World, Korn Ferry tour cards when data is available
- Add year selector on tournament landing page
- Show recent tournament winners or highlights
- Add tournament search functionality

**Related Files**:
- `app/tournaments/pga/[year]/page.tsx` - Year-specific tournament listing (already working)
- `convex/tournaments.ts` - Tournament queries (no changes needed)
- `components/landing/FeatureCard.tsx` - Reusable card component (no changes needed)

**Expected Result**:
After this fix, clicking "View Tournaments" from the landing page will show a proper tournament selection hub at `/tournaments`, allowing users to choose which tour and year they want to explore. The PGA TOUR card will navigate to `/tournaments/pga/2025` (current year), and breadcrumb navigation will allow users to return to the tournament hub.
