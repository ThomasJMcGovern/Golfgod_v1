# Chore: Add Player Header to Personal Profile Page

## Chore Description

The Personal Profile page (`/players/[playerId]/profile`) currently displays a generic "Personal Profile" header without any player-specific information. Users expect to see the player's photo, name, country, and Follow button at the top of this page - similar to what's shown on the main player page.

**Current State:**
- Generic AppHeader shows "Personal Profile" title
- No player photo, name, or country displayed
- No visual context about which player's profile is being viewed

**Expected State:**
- Player's photo displayed prominently at the top
- Player's full name (e.g., "RUSSELL HENLEY")
- Country flag and name
- Follow button for the player
- Consistent visual experience with the main player page

**Visual Reference:**
- The main `/players` page shows PlayerBio component with player photo, name, country, and Follow button
- The `/players/[playerId]/profile` page should have similar player header at the top

## Relevant Files

Use these files to resolve the chore:

- **`app/players/[playerId]/profile/page.tsx`** (PRIMARY) - Personal Profile page component
  - Currently displays generic cards with player stats
  - Needs to add PlayerBio component or similar player header at the top
  - Already queries player data via `useQuery(api.players.getPlayer)`

- **`components/player/PlayerBio.tsx`** - Existing player header component
  - Displays player photo, name, country flag, and Follow button
  - Already implemented with proper styling and loading states
  - Can be reused directly or serve as reference for custom header

- **`app/players/[playerId]/layout.tsx`** - Shared layout for player pages
  - Currently displays AppHeader with category name
  - May need adjustment to accommodate player header in profile page

- **`components/layout/AppHeader.tsx`** - Generic header component
  - Currently used in layout for all player knowledge pages
  - Profile page may need different approach than other category pages

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Analyze Current Implementation

- Read `app/players/[playerId]/profile/page.tsx` to understand current structure
- Read `components/player/PlayerBio.tsx` to understand existing player header implementation
- Identify if PlayerBio can be reused or if custom header is needed
- Determine best placement for player header (before or after data notice card)

### Step 2: Add Player Header to Profile Page

- Import `PlayerBio` component in `app/players/[playerId]/profile/page.tsx`
- Add `<PlayerBio playerId={playerId} />` at the top of the main content area
- Position it before the "Live Data" notice card for visual hierarchy
- Ensure proper spacing between PlayerBio and existing content (`space-y-4` or `space-y-6`)

### Step 3: Update Loading State

- Add PlayerBio skeleton to `ProfileSkeleton` function
- Match the loading skeleton used in PlayerBio component
- Ensure smooth loading experience with proper skeleton placeholders

### Step 4: Verify Mobile Responsiveness

- Test player header displays correctly on mobile viewport (min-width 320px)
- Verify Follow button is touch-optimized (min 44px height)
- Ensure player name and photo scale properly on small screens
- Check that header doesn't overlap with back button in layout

### Step 5: Test Integration

- Start dev server: `npm run dev`
- Navigate to `/players` and select a player (e.g., Russell Henley)
- Click "Personal Profile" in Player Knowledge Hub
- Verify player header displays with photo, name, country, and Follow button
- Test Follow button functionality (requires authentication)
- Verify loading states show proper skeletons
- Test on mobile viewport (responsive design)

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually validate the chore is complete
  - Navigate to `/players`
  - Select Russell Henley (or any player)
  - Click "Personal Profile" category card
  - Verify player header shows at top with photo, name, country, Follow button
  - Test Follow button (should work if authenticated)
  - Test on mobile viewport (320px width minimum)
  - Verify loading states show skeletons

## Notes

- **Reuse PlayerBio component**: The existing `PlayerBio` component already has all the styling, Follow button logic, and country flag functionality needed. No need to reinvent.

- **Layout consideration**: The player layout adds a back button overlay on the AppHeader. Ensure the PlayerBio component doesn't conflict with this back button positioning.

- **Consistent experience**: After this change, users will have clear visual context of which player's profile they're viewing, matching the UX of the main player page.

- **Follow button**: The Follow button requires Convex authentication. Users must be signed in for it to work properly (already handled by PlayerBio component).

- **Visual hierarchy**: PlayerBio should be the first prominent element users see, followed by the data notice card, then the profile content cards.
