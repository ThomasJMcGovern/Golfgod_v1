# Bug: CategoryExplorer Shows When Player Selected

## Bug Description

When a player is selected on the `/players` page, the CategoryExplorer component ("What Would You Like to Know?" section) remains visible at the top of the page, creating duplicate category navigation. This results in:

- **Duplicate category sections**: Two identical "What Would You Like to Know?" sections displayed simultaneously
- **Confusing UX**: The top CategoryExplorer opens a player selection dialog (category-first flow), while the bottom PlayerKnowledgeHub navigates directly to category pages (player-first flow)
- **Redundant interface**: Both sections show the same 8 category cards with identical content

**Expected Behavior**: When a player is selected, only the PlayerKnowledgeHub component below the player profile should be visible, as it provides direct navigation to category pages for the selected player.

**Actual Behavior**: Both CategoryExplorer (top) and PlayerKnowledgeHub (bottom) are visible when a player is selected.

## Problem Statement

The CategoryExplorer component is currently set to "always visible" in `app/players/page.tsx` (line 193-194), regardless of whether a player is selected. This creates redundant UI and confusing navigation when a player is already selected.

## Solution Statement

Conditionally render CategoryExplorer only when NO player is selected (`selectedPlayerId === null`). This ensures:
1. Category-first navigation is available when exploring categories across players (no player selected)
2. Player-first navigation is used when a player is already selected (only PlayerKnowledgeHub visible)
3. Clean, unambiguous UI at all times

## Steps to Reproduce

1. Navigate to `http://localhost:3000/players`
2. Observe CategoryExplorer section at top ("What Would You Like to Know?")
3. Select a player from the sidebar (e.g., Scottie Scheffler)
4. Scroll down to see player profile
5. **BUG**: Notice two identical "What Would You Like to Know?" sections:
   - One at the top (CategoryExplorer) - opens player selection dialog
   - One below player profile (PlayerKnowledgeHub) - direct navigation
6. Expected: Only the PlayerKnowledgeHub section should be visible

## Root Cause Analysis

**File**: `app/players/page.tsx` (lines 193-194)

**Current Code**:
```tsx
{/* Category Explorer - always visible */}
<CategoryExplorer />
```

**Issue**: The CategoryExplorer is rendered unconditionally, outside of the `selectedPlayerId` conditional block. This was intentional during initial implementation to make it "always visible," but this creates UX confusion when a player is selected.

**Why it's wrong**:
- CategoryExplorer is designed for category-first exploration (select category → select player → view category page)
- PlayerKnowledgeHub is designed for player-first navigation (player already selected → click category → view category page)
- When a player is already selected, category-first flow is redundant and confusing
- User already knows which player they want to explore, so they should use player-first navigation

**Correct behavior**: CategoryExplorer should only render when `!selectedPlayerId` (no player selected).

## Relevant Files

### Files to Modify

- **`app/players/page.tsx`** - Main players page component
  - **Why relevant**: Contains the CategoryExplorer rendering logic that needs conditional rendering based on `selectedPlayerId` state
  - **Current issue**: Line 193-194 renders CategoryExplorer unconditionally
  - **Fix needed**: Wrap CategoryExplorer in conditional block to only render when `!selectedPlayerId`

## Step by Step Tasks

### 1. Add Conditional Rendering to CategoryExplorer

- **Read** `app/players/page.tsx` to verify current rendering logic
- **Locate** the CategoryExplorer component rendering (lines 193-194)
- **Wrap** CategoryExplorer in a conditional block: `{!selectedPlayerId && <CategoryExplorer />}`
- **Update** comment to reflect conditional rendering: `{/* Category Explorer - only visible when no player selected */}`
- **Verify** the conditional logic is correct (renders only when `selectedPlayerId === null`)

### 2. Test User Flows

- **Test Category-First Flow** (no player selected):
  1. Navigate to `/players` with no player selected
  2. Verify CategoryExplorer is visible at top
  3. Click a category card (e.g., "Injuries")
  4. Verify dialog opens with player search
  5. Select a player
  6. Verify redirect to `/players/{playerId}/injuries`
  7. Verify CategoryExplorer is now hidden (only PlayerKnowledgeHub visible)

- **Test Player-First Flow** (player selected):
  1. Navigate to `/players`
  2. Select a player from sidebar
  3. Verify CategoryExplorer is hidden (not visible at top)
  4. Verify PlayerKnowledgeHub is visible below player profile
  5. Click a category card in PlayerKnowledgeHub
  6. Verify navigation to category page works

- **Test State Transitions**:
  1. Start with player selected (CategoryExplorer hidden)
  2. Clear player selection (navigate back to `/players`)
  3. Verify CategoryExplorer reappears
  4. Select different player
  5. Verify CategoryExplorer disappears again

### 3. Verify Mobile Responsiveness

- **Test mobile viewport** (375px width):
  - No player selected: CategoryExplorer visible with 1-column grid
  - Player selected: CategoryExplorer hidden, PlayerKnowledgeHub visible with 1-column grid
- **Test tablet viewport** (768px width):
  - No player selected: CategoryExplorer visible with 2-column grid
  - Player selected: CategoryExplorer hidden, PlayerKnowledgeHub visible with 2-column grid
- **Test desktop viewport** (1024px+ width):
  - No player selected: CategoryExplorer visible with 3-column grid
  - Player selected: CategoryExplorer hidden, PlayerKnowledgeHub visible with 3-column grid

### 4. Run Validation Commands

Execute all validation commands to ensure bug is fixed with zero regressions.

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually test:
  1. Navigate to `http://localhost:3000/players`
  2. **Verify**: CategoryExplorer visible at top (no player selected)
  3. Select a player (e.g., Scottie Scheffler)
  4. **Verify**: CategoryExplorer is now hidden
  5. **Verify**: PlayerKnowledgeHub is visible below player profile
  6. **Verify**: Only ONE "What Would You Like to Know?" section exists
  7. Click category in PlayerKnowledgeHub
  8. **Verify**: Direct navigation to category page works
  9. Navigate back to `/players`
  10. **Verify**: CategoryExplorer reappears when player deselected
  11. Click category in CategoryExplorer
  12. **Verify**: Dialog opens, player selection works, redirect works
- Responsive testing:
  1. Resize browser to 375px (mobile)
  2. Verify CategoryExplorer visibility toggles correctly with player selection
  3. Resize to 768px (tablet)
  4. Verify CategoryExplorer visibility toggles correctly with player selection
  5. Resize to 1024px+ (desktop)
  6. Verify CategoryExplorer visibility toggles correctly with player selection

## Notes

### Why This Fix is Minimal and Correct

**Single-line change**: Only one line needs modification - wrapping `<CategoryExplorer />` in a conditional.

**No component changes**: CategoryExplorer and PlayerKnowledgeHub components remain unchanged - they work correctly, just need proper visibility control.

**Preserves both flows**:
- Category-first flow still works (when no player selected)
- Player-first flow remains unchanged (already working correctly)

### Design Rationale

**CategoryExplorer purpose**: Enable category-focused exploration across multiple players (compare injury histories of different players).

**PlayerKnowledgeHub purpose**: Navigate between categories for a specific player (explore Scottie Scheffler's injuries, then his family history, etc.).

**Why they shouldn't coexist**: When a player is already selected, the user has already made a player choice. Showing CategoryExplorer creates confusion:
- Clicking a category in CategoryExplorer opens a player selection dialog (but player is already selected?)
- Clicking a category in PlayerKnowledgeHub navigates directly (expected behavior)

**Solution**: Show CategoryExplorer only when enabling category-first exploration (no player selected). Once player is selected, use player-first navigation exclusively.

### Alternative Considered (Rejected)

**Option**: Always show both, but change CategoryExplorer behavior when player selected (skip dialog, navigate directly).

**Why rejected**:
- More complex implementation (conditional behavior in CategoryExplorer)
- Creates visual redundancy (identical sections)
- Wastes vertical space
- No clear benefit to user

**Chosen solution**: Simple visibility toggle based on player selection state.
