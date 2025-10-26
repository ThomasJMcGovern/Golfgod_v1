# Feature: Breadcrumb Navigation for All Pages

## Feature Description

Add consistent breadcrumb navigation (like the one shown in the Player Knowledge Hub pages) to all authenticated pages across the application. The breadcrumbs will appear below the main header in a border-separated section, providing users with clear visual hierarchy and easy navigation back to parent pages. This feature will be added to:

1. **Players Page** (`/players`) - Home > Players
2. **Tournaments Pages** (`/tournaments/pga/[year]`) - Home > Tournaments > [Year]
3. **Inside the Ropes Hub** (`/inside-the-ropes`) - Home > Inside the Ropes
4. **Inside the Ropes Player Course Stats** (`/inside-the-ropes/player-course-stats`) - Home > Inside the Ropes > Player Course Stats

The breadcrumbs will use the existing shadcn/ui Breadcrumb component (already installed) and follow the same design pattern currently implemented in `/players/[playerId]/layout.tsx` (desktop-only, hidden on mobile to save screen real estate).

## User Story

As a **golf analytics user navigating through different sections of the application**
I want to **see breadcrumb navigation showing my current location and path**
So that **I can easily understand where I am in the app hierarchy and quickly navigate back to parent pages without using the browser back button**

## Problem Statement

Currently, only the Player Knowledge Hub category pages (profile, family, injuries, etc.) have breadcrumb navigation. The main authenticated pages (Players, Tournaments, Inside the Ropes) lack this navigation aid, making it harder for users to:

1. Understand the hierarchical structure of the application
2. Navigate back to parent pages without using the back button
3. See their current location context within the app
4. Maintain orientation when deep-linking into specific pages

This creates an inconsistent user experience where some pages have breadcrumbs while others don't.

## Solution Statement

Implement breadcrumb navigation on all authenticated pages (excluding the landing page) using the existing shadcn/ui Breadcrumb component. The breadcrumbs will:

- Appear in a consistent location below the header with a top border separator
- Be hidden on mobile (sm breakpoint) to preserve screen space
- Follow the visual style already established in the Player Knowledge Hub pages
- Dynamically update based on the current route and page context
- Use the max-w-7xl container for consistent alignment with page content
- Match the existing golf theme (dark mode with green accents)

The implementation will add breadcrumbs to the header section of each page without creating a shared layout (to maintain page independence and avoid layout nesting issues).

## Relevant Files

### Existing Files to Modify

- **`app/players/page.tsx`** - Add breadcrumbs below header
  - Currently: Has header with back button, user menu, mode toggle
  - Change: Add breadcrumb section after header with "Home > Players"
  - Pattern: Copy breadcrumb structure from player knowledge hub layout

- **`app/tournaments/pga/[year]/page.tsx`** - Add breadcrumbs with dynamic year
  - Currently: Has header with back button, year selector
  - Change: Add breadcrumb section with "Home > Tournaments > [Year]"
  - Pattern: Extract year from params, display in breadcrumb

- **`app/inside-the-ropes/page.tsx`** - Add breadcrumbs for hub page
  - Currently: Has header with back button
  - Change: Add breadcrumb section with "Home > Inside the Ropes"
  - Pattern: Simple two-level breadcrumb

- **`app/inside-the-ropes/player-course-stats/page.tsx`** - Add breadcrumbs for stats page
  - Currently: Has header with back button
  - Change: Add breadcrumb section with "Home > Inside the Ropes > Player Course Stats"
  - Pattern: Three-level breadcrumb showing full path

### Reference File

- **`app/players/[playerId]/layout.tsx`** (lines 93-117) - Breadcrumb implementation reference
  - Contains the exact pattern to follow for breadcrumb styling and structure
  - Shows proper use of Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage
  - Demonstrates desktop-only display with `hidden sm:block` and `border-t` separator

## shadcn/ui Components

### Existing Components to Use

- **`components/ui/breadcrumb.tsx`** - Already installed and in use
  - Components: Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage
  - Pattern: Wrap in container with `hidden sm:block border-t` for desktop-only display

- **`components/ui/button.tsx`** - Already in use for back buttons
- **`components/ui/card.tsx`** - Already in use for page content
- **`components/ui/select.tsx`** - Already in use for year/player selection

### New Components to Add

None - all required components already exist

### Custom Components to Create

None - will use existing shadcn/ui breadcrumb components as-is

## Implementation Plan

### Phase 1: Foundation

Review the existing breadcrumb implementation in `app/players/[playerId]/layout.tsx` to understand:
- CSS classes for container styling (`hidden sm:block border-t`)
- Layout structure (max-w-7xl container with padding)
- Component composition (Breadcrumb → BreadcrumbList → BreadcrumbItem hierarchy)
- Link patterns (BreadcrumbLink for clickable, BreadcrumbPage for current)
- Separator usage between breadcrumb items

### Phase 2: Core Implementation

Add breadcrumb navigation to each of the 4 target pages:
1. Players page - simple two-level breadcrumb
2. Tournaments year page - three-level with dynamic year
3. Inside the Ropes hub - simple two-level breadcrumb
4. Inside the Ropes stats page - three-level breadcrumb

Each page will have breadcrumbs added immediately after the header, before the main content area.

### Phase 3: Integration

Test breadcrumb navigation across all pages:
- Verify links work correctly and navigate to expected pages
- Test responsive behavior (hidden on mobile, visible on desktop)
- Ensure consistent styling with existing breadcrumbs in knowledge hub
- Validate dark mode appearance with golf theme colors
- Check accessibility (proper semantic HTML, keyboard navigation)

## Step by Step Tasks

### 1. Add Breadcrumbs to Players Page

- Open `app/players/page.tsx`
- Import breadcrumb components from `@/components/ui/breadcrumb`
- Locate the closing `</header>` tag around line 132
- Add breadcrumb section immediately after header, before main content
- Structure: Home > Players
- Use `hidden sm:block border-t` for desktop-only display
- Wrap in `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2` container
- Test navigation from breadcrumb to home page

### 2. Add Breadcrumbs to Tournaments Year Page

- Open `app/tournaments/pga/[year]/page.tsx`
- Import breadcrumb components from `@/components/ui/breadcrumb`
- Extract year from `params` (already available in component)
- Locate the closing `</header>` tag
- Add breadcrumb section after header
- Structure: Home > Tournaments > [Year] (e.g., "2025")
- Make "Home" and "Tournaments" clickable links
- Display year as current page (BreadcrumbPage)
- Use same styling as players page
- Test navigation from breadcrumbs

### 3. Add Breadcrumbs to Inside the Ropes Hub

- Open `app/inside-the-ropes/page.tsx`
- Import breadcrumb components
- Locate the closing `</header>` tag around line 100
- Add breadcrumb section after header
- Structure: Home > Inside the Ropes
- Make "Home" clickable, "Inside the Ropes" as current page
- Use consistent styling
- Test navigation

### 4. Add Breadcrumbs to Inside the Ropes Player Course Stats

- Open `app/inside-the-ropes/player-course-stats/page.tsx`
- Import breadcrumb components
- Locate header section (around line 80-120)
- Add breadcrumb section after header
- Structure: Home > Inside the Ropes > Player Course Stats
- Make "Home" and "Inside the Ropes" clickable
- Display "Player Course Stats" as current page
- Use consistent styling
- Test all breadcrumb links

### 5. Test Responsive Behavior

- Test each page at mobile viewport (375px) - breadcrumbs should be hidden
- Test at tablet viewport (768px) - breadcrumbs should be visible
- Test at desktop viewport (1024px+) - breadcrumbs should be visible
- Verify consistent spacing and alignment across all pages
- Check that breadcrumbs don't interfere with existing mobile headers

### 6. Test Dark Mode Consistency

- Toggle dark mode on each page
- Verify breadcrumb text color matches existing golf theme
- Check border-t separator is visible but subtle in dark mode
- Ensure hover states work on breadcrumb links
- Verify all pages have consistent breadcrumb appearance

### 7. Validate Accessibility

- Tab through breadcrumbs with keyboard on each page
- Verify focus indicators are visible
- Check that screen readers announce breadcrumb navigation correctly
- Ensure semantic HTML structure (nav > ol > li pattern)
- Test with VoiceOver or similar screen reader

### 8. Run Validation Commands

Execute all validation commands to ensure zero regressions:
- Run `npm run build` to check for TypeScript errors
- Run `npm run dev` and manually test each page
- Click through all breadcrumb links on all pages
- Test responsive breakpoints (mobile, tablet, desktop)
- Verify dark mode on all pages
- Check console for any errors or warnings

## Testing Strategy

### Unit Tests

- Breadcrumb links render with correct href attributes
- Breadcrumb current page (BreadcrumbPage) displays correct text
- Breadcrumb separators appear between items
- Responsive classes apply correctly (hidden on mobile)
- Dynamic values (year) display correctly in breadcrumbs

### Integration Tests

- Clicking "Home" breadcrumb navigates to landing page
- Clicking "Players" breadcrumb navigates to players page
- Clicking "Tournaments" breadcrumb navigates to tournaments page
- Clicking "Inside the Ropes" breadcrumb navigates to hub page
- Year selector changes update breadcrumb year display

### Edge Cases

- Very long breadcrumb text (truncation or wrapping)
- Breadcrumbs with special characters in page names
- Navigation from breadcrumbs while data is loading
- Breadcrumb behavior when user is unauthenticated (should not see pages)
- Breadcrumb display on very narrow desktop viewports (768px-800px)

## Acceptance Criteria

1. ✅ Breadcrumbs appear on all 4 target pages (Players, Tournaments, Inside the Ropes hub, Inside the Ropes stats)
2. ✅ Breadcrumbs are hidden on mobile (<640px) and visible on desktop (≥640px)
3. ✅ All breadcrumb links navigate to correct pages
4. ✅ Current page shown as BreadcrumbPage (not clickable)
5. ✅ Parent pages shown as BreadcrumbLink (clickable)
6. ✅ Breadcrumb separators appear between all items
7. ✅ Breadcrumbs styled consistently with Player Knowledge Hub breadcrumbs
8. ✅ Dark mode displays breadcrumbs with proper contrast and colors
9. ✅ Breadcrumb container uses max-w-7xl for alignment with page content
10. ✅ Border-t separator appears above breadcrumbs
11. ✅ Year dynamically displays in tournaments breadcrumb
12. ✅ Keyboard navigation works through breadcrumb links
13. ✅ Screen readers announce breadcrumb navigation
14. ✅ No TypeScript errors in build
15. ✅ No console errors or warnings
16. ✅ Breadcrumbs don't break existing page layouts
17. ✅ Hover states work on breadcrumb links
18. ✅ Spacing matches existing breadcrumb implementation
19. ✅ All breadcrumb links tested and working
20. ✅ Mobile header remains unaffected (breadcrumbs hidden, not broken)

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# 1. Build validation
npm run build
# Expected: Build succeeds with no TypeScript errors

# 2. Start development server
npm run dev
# Expected: Server starts without errors

# 3. Manual testing checklist
# Navigate to http://localhost:3000 and sign in, then test:

# Players Page
# - Navigate to /players
# - Verify breadcrumb shows: Home > Players
# - Click "Home" breadcrumb - should navigate to landing page
# - Verify breadcrumb hidden on mobile (<640px)
# - Verify breadcrumb visible on desktop (≥640px)

# Tournaments Page
# - Navigate to /tournaments/pga/2025
# - Verify breadcrumb shows: Home > Tournaments > 2025
# - Click "Home" - should navigate to landing page
# - Click "Tournaments" - should navigate to /tournaments
# - Change year to 2024 - breadcrumb should update to show 2024
# - Verify responsive behavior

# Inside the Ropes Hub
# - Navigate to /inside-the-ropes
# - Verify breadcrumb shows: Home > Inside the Ropes
# - Click "Home" - should navigate to landing page
# - Verify responsive behavior

# Inside the Ropes Stats
# - Navigate to /inside-the-ropes/player-course-stats
# - Verify breadcrumb shows: Home > Inside the Ropes > Player Course Stats
# - Click "Home" - should navigate to landing page
# - Click "Inside the Ropes" - should navigate to /inside-the-ropes
# - Verify responsive behavior

# 4. Dark mode testing
# - Toggle dark mode on each page
# - Verify breadcrumb text color and border visibility
# - Check hover states on links in dark mode

# 5. Accessibility testing
# - Use keyboard to tab through breadcrumbs on each page
# - Verify focus indicators visible
# - Test with screen reader (VoiceOver, NVDA, or JAWS)

# 6. Browser console check
# - Open DevTools console on each page
# - Verify no errors or warnings
```

## Notes

### Design Decisions

- **Desktop-only breadcrumbs**: Following the existing pattern in Player Knowledge Hub pages, breadcrumbs will be hidden on mobile to preserve valuable screen space. Mobile users can use the back button in the header.

- **No shared layout**: Instead of creating a shared layout component, breadcrumbs will be added directly to each page. This maintains page independence and avoids potential layout nesting issues in Next.js 15 App Router.

- **Consistent styling**: All breadcrumbs will use the exact same styling as the existing implementation (`hidden sm:block border-t` with `max-w-7xl` container and `py-2` padding).

### Future Enhancements

- **Mobile breadcrumbs**: Consider showing condensed breadcrumbs on mobile (e.g., just "< Back to [Parent]")
- **Breadcrumb animations**: Add subtle fade-in animations when breadcrumbs appear
- **Structured data**: Add JSON-LD breadcrumb structured data for SEO
- **Breadcrumb customization**: Allow users to customize breadcrumb display preferences
- **Breadcrumb history**: Show recent navigation history in dropdown

### Reference Implementation

The breadcrumb implementation in `app/players/[playerId]/layout.tsx` (lines 93-117) serves as the reference for this feature:

```tsx
{/* Breadcrumbs - Desktop Only */}
<div className="hidden sm:block border-t">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/players">Players</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</div>
```

This pattern should be replicated exactly on each target page with appropriate page names and links.

### No Convex Changes Needed

This feature is frontend-only and requires no Convex schema changes, queries, or mutations. All navigation paths are hardcoded based on the application's route structure.
