# Chore: Make Header and Navigation Sticky

## Chore Description

Make the AppHeader and MainNavigation components sticky so they remain visible at the top of the viewport when scrolling. Currently, when users scroll down the page, the header and navigation scroll out of view. The goal is to keep both the header (with centered title and UserMenu) and the navigation tabs visible at all times for better UX and easier navigation.

**Reference**: Screenshot shows the header with "GolfGod" title and navigation tabs (Players, Tournaments, Inside the Ropes) that should remain visible when scrolling.

## Relevant Files

Use these files to resolve the chore:

- **`components/layout/AppHeader.tsx`** - Main header component containing the page title and UserMenu. Need to add `sticky top-0 z-50 bg-background` classes to make it stick to the top of viewport with proper stacking context and background.

- **`components/layout/MainNavigation.tsx`** - Navigation tabs component. Need to ensure it also sticks below the header. May need to add `sticky` positioning or adjust z-index to work with sticky header.

- **`app/page.tsx`** - Homepage which uses a different header structure (LandingPageHeader) that is already `fixed`. May need to ensure consistency or leave as-is since it's already sticky.

- **`app/players/page.tsx`**, **`app/tournaments/page.tsx`**, **`app/inside-the-ropes/page.tsx`** - Example pages that use AppHeader + MainNavigation. These will demonstrate the sticky behavior working correctly.

## Step by Step Tasks

### 1. Make AppHeader Sticky

**File**: `components/layout/AppHeader.tsx`

**Changes**:
- Add `sticky top-0 z-50` to the outer container (the `<div className="border-b">`)
- Add `bg-background` to ensure the header has a solid background color when content scrolls underneath
- This creates a sticky header that stays at `top: 0` with z-index 50 for proper layering

**Current**:
```tsx
<div className="border-b">
  <div className="relative flex h-16 items-center justify-center...">
```

**Updated**:
```tsx
<div className="sticky top-0 z-50 bg-background border-b">
  <div className="relative flex h-16 items-center justify-center...">
```

**Why this works**:
- `sticky top-0`: Makes element stick when scrolling reaches top of viewport
- `z-50`: High z-index ensures header stays above page content
- `bg-background`: Solid background prevents content showing through

### 2. Ensure MainNavigation Works with Sticky Header

**File**: `components/layout/MainNavigation.tsx`

**Changes**:
- Add `sticky z-40 bg-card` classes to ensure navigation also sticks
- Set `top-16` (64px, height of AppHeader) so navigation sticks below the header
- Keep existing `border-b bg-card` classes for styling

**Current**:
```tsx
<nav className="border-b bg-card">
```

**Updated**:
```tsx
<nav className="sticky top-16 z-40 border-b bg-card">
```

**Why this works**:
- `sticky top-16`: Sticks 64px from top (below AppHeader)
- `z-40`: Lower than header (z-50) but above content
- `bg-card`: Solid background for navigation tabs

### 3. Validation

**Execute validation commands** to ensure the chore is complete with zero regressions.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually validate sticky behavior:
  - Navigate to `/players` - Scroll down, verify header + nav stick at top
  - Navigate to `/tournaments` - Scroll down, verify header + nav stick at top
  - Navigate to `/inside-the-ropes` - Scroll down, verify header + nav stick at top
  - Navigate to `/` (authenticated) - Verify landing page header behavior (already fixed, should work)
  - Test on mobile viewport - Ensure sticky works on small screens
  - Verify no overlapping content or z-index issues

## Notes

- **Mobile-first validated**: `sticky` positioning works across all breakpoints
- **Z-index strategy**:
  - AppHeader: `z-50` (highest)
  - MainNavigation: `z-40` (below header, above content)
  - Page content: default stacking (below navigation)
- **Background colors essential**: Without `bg-background` and `bg-card`, content would show through when scrolling
- **Homepage already sticky**: `app/page.tsx` uses `fixed top-0` for LandingPageHeader, which already provides sticky behavior
- **No JavaScript needed**: Pure CSS solution using `position: sticky`
- **Accessibility**: Sticky headers don't affect screen readers or keyboard navigation
- **Performance**: Minimal performance impact - CSS sticky is hardware-accelerated
