# Feature: Player Knowledge Hub Category Selector

## Feature Description

Add a category selection interface to the `/players` page that allows users to browse the 8 Player Knowledge Hub categories ("What Would You Like to Know?") before selecting a player. When a user clicks on a category card, they are prompted to select a player, then automatically redirected to that specific category page for the chosen player.

This feature enhances discoverability by allowing users to explore by information type (e.g., "I want to see injury histories") rather than only by player-first navigation. It creates a dual-entry path: users can either select a player first (current flow) or select a category first (new flow).

## User Story

As a golf analytics enthusiast
I want to explore player information by category (injuries, family history, intangibles, etc.)
So that I can discover insights across multiple players for a specific data category without having to navigate player-by-player

## Problem Statement

Currently, the `/players` page only supports a player-first navigation flow:
1. User selects a player from sidebar
2. User sees player profile with "What Would You Like to Know?" section
3. User clicks on a category card to view that category

**Problem**: Users who want to explore a specific category across multiple players must:
- Select player A → click category → view data
- Navigate back → select player B → click category → view data
- Repeat for each player

This creates unnecessary friction for category-focused exploration (e.g., "Show me injury histories for multiple players").

## Solution Statement

Add a "What Would You Like to Know?" section to the `/players` page that displays the same 8 category cards shown in the Player Knowledge Hub, but with modified behavior:

**When no player is selected:**
- Display category cards in a prominent section above the "Select a Player" placeholder
- Category cards are clickable and open a player selection dialog
- Dialog shows the same player list/search interface
- After selecting a player, automatically redirect to `/players/{playerId}/{category}`

**When a player is selected:**
- The existing Player Knowledge Hub section remains visible in the player profile
- Category cards in the new section can optionally be hidden or kept visible with direct links

This creates two entry points:
1. **Player-first** (existing): Select player → view profile → click category
2. **Category-first** (new): Click category → select player → view category page

## Relevant Files

Use these files to implement the feature:

- **`app/players/page.tsx`** - Main players page component
  - Add new "Category Explorer" section with knowledge cards
  - Implement category selection state management
  - Handle dialog open/close for player selection after category click

- **`components/player/PlayerKnowledgeHub.tsx`** - Existing knowledge hub component
  - Contains the `knowledgeCategories` array with all 8 categories
  - Export this array for reuse in the new category selector
  - Contains category metadata (icons, titles, descriptions, hrefs)

- **`components/player/KnowledgeCard.tsx`** - Reusable category card component
  - Already built with mobile-first responsive design
  - Will be reused with modified click behavior (dialog instead of direct link)
  - Supports `disabled` state for future enhancements

- **`components/player/PlayerSelect.tsx`** - Player selection dropdown
  - Used in the dialog for selecting a player after category click
  - Already supports searchable player list with ~200 players

### New Files

- **`components/player/CategoryExplorer.tsx`** - New component for category-first exploration
  - Displays "What Would You Like to Know?" heading and description
  - Renders 8 category cards using KnowledgeCard component
  - Manages selected category state
  - Opens player selection dialog when category is clicked
  - Redirects to `/players/{playerId}/{category}` after player selection

- **`components/player/CategoryPlayerDialog.tsx`** - New dialog component
  - Modal dialog for player selection after category click
  - Contains PlayerSelect component
  - Shows category context ("Select a player to view {categoryName}")
  - Handles redirect on player selection

## shadcn/ui Components

### Existing Components to Use

- **`components/ui/dialog.tsx`** - Dialog/modal for player selection after category click
- **`components/ui/card.tsx`** - Container cards (if needed)
- **`components/ui/button.tsx`** - Cancel/action buttons in dialog
- **`components/ui/separator.tsx`** - Visual separator between sections
- **`components/player/KnowledgeCard.tsx`** - Reusable category cards (custom component following shadcn patterns)
- **`components/player/PlayerSelect.tsx`** - Searchable player dropdown (custom component)

### New Components to Add

None required - all necessary shadcn/ui components already exist.

### Custom Components to Create

- **`CategoryExplorer`** - Category grid with dialog management (follows shadcn patterns)
- **`CategoryPlayerDialog`** - Dialog wrapper for player selection (uses existing Dialog primitive)

Both custom components will follow shadcn/ui patterns:
- CVA for variants (if needed)
- forwardRef for DOM elements
- CSS variables for theming
- cn() utility for class merging
- Mobile-first responsive design
- Dark mode support

## Implementation Plan

### Phase 1: Foundation

Extract and export the `knowledgeCategories` array from `PlayerKnowledgeHub.tsx` to a shared constants file or directly export it for reuse in the new CategoryExplorer component. This ensures a single source of truth for category metadata (icons, titles, descriptions).

### Phase 2: Core Implementation

Create the `CategoryPlayerDialog` and `CategoryExplorer` components with full dialog flow:
1. User clicks category card → dialog opens
2. Dialog shows player search/selection interface
3. User selects player → redirect to `/players/{playerId}/{category}`

Add mobile-responsive layout with proper touch targets (≥44px) and dark mode support.

### Phase 3: Integration

Integrate `CategoryExplorer` into the `/players` page above the existing "Select a Player" placeholder. Ensure proper visual hierarchy and spacing. Test the complete flow: category click → player selection → redirect → category page display.

## Step by Step Tasks

### 1. Export Knowledge Categories Constant

- **Read** `components/player/PlayerKnowledgeHub.tsx` to understand the `knowledgeCategories` array structure
- **Create** `lib/knowledge-categories.ts` file with exported `knowledgeCategories` constant
- **Modify** `components/player/PlayerKnowledgeHub.tsx` to import from `lib/knowledge-categories.ts`
- **Verify** no breaking changes to existing PlayerKnowledgeHub component

### 2. Create CategoryPlayerDialog Component

- **Create** `components/player/CategoryPlayerDialog.tsx`
- Import Dialog, DialogContent, DialogHeader, DialogTitle from `@/components/ui/dialog`
- Import PlayerSelect component
- Accept props: `open`, `onOpenChange`, `categoryId`, `categoryName`, `onPlayerSelect`
- Implement dialog with:
  - Title: "Select a Player to View {categoryName}"
  - Description: Brief explanation
  - PlayerSelect component for player search
  - Handle player selection and trigger `onPlayerSelect` callback
- Follow mobile-first responsive design (dialog width, padding)
- Add proper ARIA labels for accessibility

### 3. Create CategoryExplorer Component

- **Create** `components/player/CategoryExplorer.tsx`
- Import `knowledgeCategories` from `lib/knowledge-categories.ts`
- Import `KnowledgeCard` component
- Import `CategoryPlayerDialog` component
- Import `useRouter` from `next/navigation`
- Manage state: `selectedCategory` (string | null), `dialogOpen` (boolean)
- Render section with:
  - Heading: "What Would You Like to Know?"
  - Description: "Explore comprehensive player insights across multiple categories"
  - Grid of 8 category cards (responsive: 1 col mobile, 2 col sm, 3 col lg)
- Handle category card click:
  - Set `selectedCategory` to clicked category ID
  - Open dialog (`setDialogOpen(true)`)
- Handle player selection in dialog:
  - Close dialog
  - Redirect to `/players/{playerId}/{selectedCategory}`
- Add proper TypeScript types for all props and state

### 4. Integrate CategoryExplorer into Players Page

- **Read** `app/players/page.tsx` to understand current layout structure
- **Import** `CategoryExplorer` component
- **Add** `<CategoryExplorer />` above the conditional `{selectedPlayerId ? ... : ...}` block
- **Add** visual separator (horizontal rule or spacing) between CategoryExplorer and player content
- **Test** responsive layout on mobile (320px), tablet (768px), desktop (1024px+)
- Ensure no layout conflicts with existing PlayerKnowledgeHub when player is selected

### 5. Refactor Knowledge Categories Export

- **Verify** `lib/knowledge-categories.ts` contains proper TypeScript types
- **Export** type definition for category items: `KnowledgeCategory` interface
- **Ensure** both `PlayerKnowledgeHub` and `CategoryExplorer` use the same types
- **Add** JSDoc comments explaining the shared constant

### 6. Add Loading and Error States

- **Enhance** `CategoryPlayerDialog` to show loading state while players are being fetched
- **Add** error boundary or error message if PlayerSelect fails to load
- **Test** error scenarios (network failures, Convex query errors)

### 7. Enhance User Experience

- **Add** keyboard navigation support (Escape to close dialog, Enter to select player)
- **Add** auto-focus to PlayerSelect input when dialog opens
- **Test** tab navigation through category cards and dialog elements
- **Verify** proper focus management (focus returns to category card after dialog closes)

### 8. Mobile Optimization

- **Test** touch targets are ≥44px on all interactive elements
- **Verify** dialog scrolls properly on small screens
- **Test** player selection on mobile devices (touch scrolling, keyboard dismiss)
- **Ensure** category cards have proper active/pressed states on mobile

### 9. Dark Mode and Theme Consistency

- **Verify** all new components use CSS variables for theming
- **Test** dark mode appearance matches existing components
- **Check** hover states, active states, and focus rings in both light and dark modes
- **Ensure** green accent color (`hsl(142, 76%, 36%)`) is used consistently

### 10. Documentation and Comments

- **Add** JSDoc comments to all exported components and functions
- **Document** props interfaces with descriptions
- **Add** inline comments explaining non-obvious logic (e.g., redirect behavior)
- **Update** `CLAUDE.md` with new component descriptions if needed

### 11. Run Validation Commands

- **Execute** `npm run build` to ensure no TypeScript errors
- **Execute** `npx convex dev` to deploy schema (if needed)
- **Execute** `npm run dev` to start dev server
- **Test** complete user flow:
  1. Navigate to `/players`
  2. Click on "Family" category card
  3. Dialog opens with player search
  4. Search for "Scottie Scheffler"
  5. Select player
  6. Verify redirect to `/players/{playerId}/family`
  7. Verify page loads correctly
- **Test** all 8 categories with different players
- **Test** responsive behavior on mobile, tablet, desktop
- **Test** keyboard navigation and accessibility

## Testing Strategy

### Unit Tests

If tests exist in the project:
- Test `CategoryExplorer` component renders 8 category cards
- Test dialog opens when category card is clicked
- Test `selectedCategory` state updates correctly
- Test redirect logic with mock router
- Test `CategoryPlayerDialog` component with various props

### Integration Tests

- Test complete flow: category click → player selection → redirect → page load
- Test back button navigation after redirect
- Test URL query parameters are preserved (if any)
- Test multiple category selections in sequence
- Test dialog cancel/close behavior (no redirect)

### Edge Cases

- **No player selected initially**: Category cards should be clickable
- **Player already selected**: Both CategoryExplorer and PlayerKnowledgeHub visible (or decide on hiding CategoryExplorer)
- **Dialog closed without selection**: No redirect, dialog state resets
- **Network error in PlayerSelect**: Show error message in dialog
- **Slow player data loading**: Show loading skeleton in dialog
- **Mobile small screens**: Dialog and category grid responsive
- **Keyboard-only navigation**: All elements accessible via keyboard
- **Screen reader usage**: Proper ARIA labels and announcements

## Acceptance Criteria

- ✅ CategoryExplorer section appears on `/players` page above "Select a Player" placeholder
- ✅ Section displays "What Would You Like to Know?" heading and description
- ✅ 8 category cards are rendered in a responsive grid (1/2/3 columns)
- ✅ Clicking any category card opens a player selection dialog
- ✅ Dialog displays selected category name in title
- ✅ Dialog contains PlayerSelect component with searchable player list
- ✅ Selecting a player in dialog redirects to `/players/{playerId}/{category}`
- ✅ Closing dialog without selection returns to `/players` page (no redirect)
- ✅ Category cards follow existing design system (KnowledgeCard component)
- ✅ Mobile-first responsive design with ≥44px touch targets
- ✅ Dark mode support with consistent theming
- ✅ Keyboard navigation works (Escape closes dialog, Enter selects player)
- ✅ Auto-focus on player search input when dialog opens
- ✅ No TypeScript or build errors
- ✅ No regressions in existing PlayerKnowledgeHub functionality
- ✅ Both player-first and category-first flows work seamlessly

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev` - Deploy Convex schema and functions (run in background, verify no schema changes needed)
- `npm run dev` - Start the Next.js dev server and manually test the feature end-to-end
- Manual testing checklist:
  1. Navigate to `http://localhost:3000/players`
  2. Verify CategoryExplorer section appears with 8 category cards
  3. Click "Personal Profile" card → verify dialog opens
  4. Cancel dialog → verify no redirect, dialog closes
  5. Click "Family" card → verify dialog opens with "Family" in title
  6. Search for "Scottie Scheffler" in player select
  7. Select Scottie → verify redirect to `/players/{id}/family`
  8. Verify family page loads correctly
  9. Navigate back to `/players`
  10. Click "Injuries" card → select different player → verify redirect
  11. Test responsive design: resize browser to mobile (320px), tablet (768px), desktop (1024px)
  12. Test dark mode: toggle theme and verify all components styled correctly
  13. Test keyboard navigation: Tab through cards, Escape closes dialog
  14. Verify existing PlayerKnowledgeHub still works when player is selected
- `npm test` - Run tests to validate the feature works with zero regressions (if tests exist in project)

## Notes

### Future Enhancements

- **Analytics tracking**: Track which categories are most popular entry points
- **Category descriptions expansion**: Add tooltips or hover cards with more detailed category descriptions
- **Recent categories**: Show "Recently viewed categories" section for quick access
- **Player suggestions**: Show "Popular players" or "Trending players" in dialog
- **Category-specific player filtering**: Allow filtering players by relevant criteria (e.g., only show injured players for Injuries category)
- **Breadcrumb integration**: Ensure breadcrumbs properly reflect category-first navigation path

### Design Considerations

- **Visual hierarchy**: CategoryExplorer should be prominent but not overshadow player selection
- **Consistent spacing**: Maintain consistent padding/margins with existing page sections
- **Mobile behavior**: Consider collapsible CategoryExplorer on mobile to save vertical space
- **Player context**: When a player is selected, consider auto-scrolling to PlayerKnowledgeHub section

### Technical Considerations

- **State management**: Currently using component-level state; consider context if complexity grows
- **URL state**: Consider adding `?category={id}` query param to preserve category selection in URL
- **Performance**: KnowledgeCard components are lightweight; no virtualization needed for 8 cards
- **Accessibility**: Ensure dialog follows ARIA dialog pattern with proper focus trapping

### Convex Considerations

- No new Convex queries or mutations needed
- Existing `players.getAll` query used in PlayerSelect component
- No database schema changes required
- Ensure `getAll` query uses `.collect()` safely (players table ~200 records, indexed)
