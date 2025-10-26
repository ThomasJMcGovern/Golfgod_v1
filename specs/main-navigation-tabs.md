# Feature: Main Navigation Tabs Below Header

## Feature Description

Add a secondary navigation bar below the main header that provides horizontal tabs for navigating between the three primary sections of the application: Players, Tournaments, and Inside the Ropes. This navigation will be visible on all authenticated pages, providing consistent, app-wide navigation that makes it easy for users to switch between major sections without returning to the home page.

The navigation tabs will:
- Be positioned directly below the existing header (between header and breadcrumbs)
- Display three tabs: Players, Tournaments, Inside the Ropes
- Highlight the active tab based on current route
- Be mobile-responsive (horizontal scroll on small screens if needed)
- Use the golf-themed color scheme (green accents)
- Include icons for visual clarity
- Provide smooth transitions and hover states

## User Story

As a golf analytics user
I want to quickly navigate between Players, Tournaments, and Inside the Ropes sections
So that I can easily access different types of golf data without returning to the home page

## Problem Statement

Currently, users must:
1. Return to the home page to navigate between major sections
2. Click on feature cards to access different areas
3. Use the back button or breadcrumb navigation extensively

This creates unnecessary navigation friction and increases the number of clicks required to switch contexts. Users analyzing multiple players, checking tournament schedules, and reviewing course statistics need seamless navigation between these three core features.

## Solution Statement

Implement a persistent secondary navigation bar below the main header that displays three tabs (Players, Tournaments, Inside the Ropes). This navigation will:

1. **Be Always Visible**: Present on all authenticated pages below the header
2. **Show Active State**: Highlight the current section based on route matching
3. **Enable Direct Navigation**: Allow one-click switching between sections
4. **Maintain Context**: Use `useRouter` for client-side navigation (no full page reloads)
5. **Mobile-First Design**: Responsive layout with proper touch targets (min 44px)
6. **Use Existing Patterns**: Leverage shadcn/ui Tabs component architecture

**Architecture Decision**: Create a reusable `<MainNavigation />` component that can be imported into page layouts or the root authenticated layout, positioned between the header and breadcrumbs.

## Relevant Files

**Existing Files to Modify:**

- `app/page.tsx` - Landing page, needs MainNavigation added to authenticated section
  - Currently has header with UserMenu and ModeToggle
  - Add MainNavigation below header, above hero section

- `app/players/page.tsx` - Players page with sidebar
  - Currently has header + breadcrumbs
  - Add MainNavigation between header and breadcrumbs
  - Ensure proper spacing with existing content

- `app/tournaments/page.tsx` - Tournament hub page
  - Currently has header + breadcrumbs
  - Add MainNavigation between header and breadcrumbs

- `app/tournaments/pga/[year]/page.tsx` - Tournament year page
  - Add MainNavigation for consistency
  - Active state: "Tournaments"

- `app/inside-the-ropes/page.tsx` - Inside the Ropes hub
  - Uses AppHeader component
  - Add MainNavigation after AppHeader, before breadcrumbs

- `app/inside-the-ropes/player-course-stats/page.tsx` - Specific analytics page
  - Add MainNavigation for consistency
  - Active state: "Inside the Ropes"

- `components/layout/AppHeader.tsx` - Shared header component used by Inside the Ropes
  - Currently provides header UI
  - Review for integration with MainNavigation

### New Files

- `components/layout/MainNavigation.tsx` - New main navigation component
  - Reusable component with active state detection
  - Props: `activeSection?: "players" | "tournaments" | "inside-the-ropes"`
  - Uses Next.js `usePathname()` for automatic active state detection
  - Leverages shadcn/ui Button and Link patterns

## shadcn/ui Components

### Existing Components to Use

- `components/ui/button.tsx` - For navigation tab buttons
- `components/ui/separator.tsx` - For visual separation if needed
- Lucide React icons (already installed): `User`, `Trophy`, `ClipboardList`

### New Components to Add

None required. We'll build on existing shadcn/ui components.

### Custom Components to Create

**`MainNavigation.tsx`** - Custom navigation component following shadcn/ui patterns:
- Uses `cn()` utility for class merging
- Implements active state styling with CSS variables
- Mobile-responsive with horizontal layout
- Touch-optimized (min 44px height)
- Follows golf theme color scheme (`hsl(142, 76%, 36%)`)

## Implementation Plan

### Phase 1: Foundation

Create the reusable `MainNavigation` component with:
- Next.js `usePathname()` hook for route detection
- Active state highlighting based on current path
- Mobile-first responsive design
- Accessibility (ARIA labels, keyboard navigation)
- Golf theme integration

### Phase 2: Core Implementation

Integrate `MainNavigation` into all authenticated pages:
- Position consistently below header, above breadcrumbs
- Test navigation flow between sections
- Ensure active state updates correctly
- Verify mobile responsiveness

### Phase 3: Integration

- Test navigation across all routes
- Verify no layout conflicts (z-index, spacing)
- Ensure breadcrumbs don't overlap
- Test on mobile, tablet, desktop viewports
- Validate accessibility (keyboard navigation, screen readers)

## Step by Step Tasks

### 1. Create MainNavigation Component

**File**: `components/layout/MainNavigation.tsx`

- Import dependencies: `usePathname` from Next.js, `useRouter`, Lucide icons, `cn` utility
- Define `MainNavigationProps` interface (optional `activeSection` prop for manual override)
- Implement navigation items array with:
  - `id`: "players" | "tournaments" | "inside-the-ropes"
  - `label`: Display text
  - `href`: Route path
  - `icon`: Lucide icon component
- Use `usePathname()` to detect current route
- Implement active state logic (match route prefix)
- Create responsive layout:
  - Desktop: Horizontal flex layout with gaps
  - Mobile: Horizontal scroll if needed, min 44px touch targets
- Style navigation items:
  - Base: `text-muted-foreground hover:text-foreground transition-colors`
  - Active: `text-primary border-b-2 border-primary`
  - Icon + text layout with proper spacing
- Add ARIA attributes (`role="navigation"`, `aria-label="Main navigation"`)
- Export component

### 2. Update Landing Page (app/page.tsx)

- Import `MainNavigation` component
- In `<Authenticated>` section:
  - Add `<MainNavigation />` directly below `<LandingPageHeader />`
  - Add border-bottom for visual separation
  - Adjust spacing/padding to maintain proper layout

### 3. Update Players Page (app/players/page.tsx)

- Import `MainNavigation` component
- Add `<MainNavigation />` between header and breadcrumbs
- Ensure proper spacing with existing sidebar layout
- Test mobile sheet menu interaction (should not conflict)

### 4. Update Tournaments Hub (app/tournaments/page.tsx)

- Import `MainNavigation` component
- Add `<MainNavigation />` between header and breadcrumbs
- Verify spacing with existing cards grid

### 5. Update Tournament Year Page (app/tournaments/pga/[year]/page.tsx)

- Read current file structure
- Import `MainNavigation` component
- Add navigation below header, above breadcrumbs
- Test with different year routes (2024, 2025, 2026)

### 6. Update Inside the Ropes Hub (app/inside-the-ropes/page.tsx)

- Import `MainNavigation` component
- Add `<MainNavigation />` after `<AppHeader />`, before breadcrumbs
- Verify spacing with analytics cards

### 7. Update Inside the Ropes Stats Page (app/inside-the-ropes/player-course-stats/page.tsx)

- Read current file structure
- Import `MainNavigation` component
- Add navigation in consistent position
- Test interaction with player/course selection dropdowns

### 8. Test Mobile Responsiveness

- Test navigation on mobile viewport (320px - 640px)
- Verify touch targets are min 44px
- Check horizontal scroll behavior if needed
- Test sheet menu interaction on mobile (players page)
- Ensure no layout overflow issues

### 9. Test Navigation Flow

- Navigate between all sections using tabs
- Verify active state updates correctly
- Test browser back/forward buttons
- Ensure client-side navigation (no full page reloads)
- Test deep links (e.g., `/players?playerId=xxx`)

### 10. Accessibility Testing

- Test keyboard navigation (Tab, Enter, Space)
- Verify ARIA labels are present and correct
- Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- Ensure focus indicators are visible
- Check color contrast ratios (WCAG AA compliance)

### 11. Visual Polish

- Verify golf theme colors are applied correctly
- Ensure smooth transitions on hover/active states
- Check alignment with header and breadcrumbs
- Test dark mode appearance
- Verify icon + text alignment

### 12. Run Validation Commands

Execute all validation commands to ensure zero regressions and proper functionality.

## Testing Strategy

### Unit Tests

Not applicable - this is primarily a UI/navigation component that would require E2E testing.

### Integration Tests

- **Route Matching**: Verify active state detection works for all routes
  - `/players` → "Players" active
  - `/tournaments` → "Tournaments" active
  - `/inside-the-ropes` → "Inside the Ropes" active
  - Nested routes maintain parent active state

- **Navigation Flow**: Test clicking each tab navigates to correct route
  - Click "Players" → navigates to `/players`
  - Click "Tournaments" → navigates to `/tournaments`
  - Click "Inside the Ropes" → navigates to `/inside-the-ropes`

### Edge Cases

1. **No Active State**: User on `/profile` or `/settings` (no tab should be active)
2. **Deep Nested Routes**: `/players/[playerId]/family` should still show "Players" as active
3. **Mobile Sheet Open**: Opening mobile menu shouldn't interfere with navigation tabs
4. **Rapid Navigation**: Clicking tabs quickly should handle state correctly
5. **Browser History**: Back/forward buttons should update active state
6. **Direct URL Access**: Typing URL directly should show correct active state

## Acceptance Criteria

- ✅ MainNavigation component is created and follows shadcn/ui patterns
- ✅ Navigation tabs appear on all authenticated pages below header
- ✅ Active state correctly highlights current section based on route
- ✅ Clicking a tab navigates to the correct section
- ✅ Navigation is mobile-responsive (min 44px touch targets)
- ✅ Golf theme colors are applied (green accents for active state)
- ✅ Icons and text are properly aligned
- ✅ Smooth transitions on hover and active states
- ✅ Keyboard navigation works (Tab, Enter, Space)
- ✅ ARIA labels are present for accessibility
- ✅ No layout conflicts with header, breadcrumbs, or page content
- ✅ Works correctly in dark mode
- ✅ Client-side navigation (no full page reloads)
- ✅ Browser back/forward buttons work correctly
- ✅ Zero TypeScript or build errors
- ✅ No console warnings or errors

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev --once` - Deploy Convex schema and validate backend (should have no changes)
- `npm run dev` - Start the Next.js dev server and manually test the feature end-to-end
  - Test navigation on `/players`, `/tournaments`, `/inside-the-ropes`
  - Test active state on all routes
  - Test mobile responsiveness (resize browser to 320px, 640px, 1024px)
  - Test keyboard navigation (Tab through tabs, Enter to navigate)
  - Test dark mode toggle (verify colors)
  - Test browser back/forward buttons

## Notes

### Design Decisions

**Active State Detection**: Use `usePathname()` from Next.js to automatically detect the active section based on route prefix matching. This eliminates the need to manually pass `activeSection` prop in most cases.

**Layout Position**: Position MainNavigation between header and breadcrumbs (not inside header) to:
- Keep header simple and focused
- Provide visual hierarchy (header → navigation → breadcrumbs → content)
- Allow navigation to span full width independently

**Mobile Strategy**: Use horizontal layout with flexbox for mobile. Icons + text should stack vertically on very small screens (optional enhancement) or remain horizontal with smaller text.

**Accessibility**: Follow WCAG 2.1 AA guidelines:
- Min 44px touch targets
- Color contrast ratio ≥4.5:1 for text
- Keyboard navigation support
- ARIA labels for screen readers

### Future Enhancements

- Add "Recently Viewed Players" dropdown in Players tab
- Add "Upcoming Tournaments" indicator badge
- Add keyboard shortcuts (e.g., `Alt+1` for Players, `Alt+2` for Tournaments)
- Add animation/transition when switching tabs
- Add sub-navigation for Inside the Ropes (if more analytics features are added)

### Performance Considerations

- Use Next.js `<Link>` component for client-side navigation (prefetching)
- Minimize re-renders by memoizing navigation items array
- Use CSS transitions (not JavaScript) for smooth hover/active states
- Keep component lightweight (no heavy dependencies)

### Golf Theme Integration

Primary green: `hsl(142, 76%, 36%)`
Active state: Use primary green for border-bottom and text color
Hover state: Lighten text from muted-foreground to foreground
Background: Inherit from card background for consistency
