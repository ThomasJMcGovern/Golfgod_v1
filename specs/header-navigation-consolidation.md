# Chore: Header Navigation Consolidation

## Chore Description

Consolidate header navigation controls by moving the "PGA" button and theme toggle (ModeToggle) into the UserMenu dropdown for all pages. Remove all back buttons (ChevronLeft) from page headers as they create navigation confusion.

**Current Issues**:
1. PGA button appears in header on multiple pages - redundant and takes up valuable header space
2. ModeToggle (theme toggle) appears standalone in header - should be in user settings
3. Back buttons (ChevronLeft icons) appear inconsistently across pages - users can use browser back or breadcrumbs
4. Header controls are not universally consistent across all pages

**Desired State**:
1. Clean headers with only: Logo/Page Title + UserMenu
2. PGA button and theme toggle moved into UserMenu dropdown
3. Zero back buttons in any header
4. Universal header component for consistency

**Architecture Decision**:
- Create a shared `AppHeader` component in `components/layout/AppHeader.tsx`
- Enhance `UserMenu` component to include PGA navigation and theme toggle
- Update all pages to use the shared `AppHeader` component
- Remove all standalone ModeToggle and back button instances

## Relevant Files

Use these files to resolve the chore:

- **`components/layout/UserMenu.tsx`** (MODIFY)
  - Currently has: Profile, Settings, Help & Support, Documentation, Sign out
  - Will add: "PGA TOUR" navigation link, Theme toggle submenu (Light/Dark/System)
  - Import ModeToggle functionality directly into this component

- **`components/mode-toggle.tsx`** (REFERENCE ONLY)
  - Reference the theme toggle logic to integrate into UserMenu
  - Do NOT modify this file - it can remain as-is for any pages that need standalone toggle

- **`app/inside-the-ropes/page.tsx`** (MODIFY)
  - Remove: PGA button, ModeToggle component, ChevronLeft back button
  - Replace header with shared AppHeader component

- **`app/tournaments/page.tsx`** (MODIFY)
  - Remove: PGA button, ModeToggle component, ChevronLeft back button
  - Replace header with shared AppHeader component

- **`app/players/page.tsx`** (MODIFY)
  - Remove: PGA button, ModeToggle component, ChevronLeft back button (hidden lg:flex)
  - Replace header with shared AppHeader component

- **`app/inside-the-ropes/player-course-stats/page.tsx`** (MODIFY)
  - Remove: PGA button, ModeToggle component, ChevronLeft back button
  - Replace header with shared AppHeader component

- **`app/tournaments/pga/[year]/page.tsx`** (MODIFY)
  - Remove: PGA button, ModeToggle component, ChevronLeft back button
  - Replace header with shared AppHeader component

- **`app/players/[playerId]/layout.tsx`** (MODIFY)
  - Remove: PGA button, ModeToggle component, ChevronLeft back button
  - Replace header with shared AppHeader component

- **`app/admin/data-management/page.tsx`** (MODIFY)
  - Remove: ChevronLeft back button (if present)
  - Replace header with shared AppHeader component

- **`app/admin/database-schema/page.tsx`** (MODIFY)
  - Remove: ChevronLeft back button (if present)
  - Replace header with shared AppHeader component

- **`app/page.tsx`** (MODIFY)
  - Remove standalone ModeToggle from Authenticated section
  - UserMenu already present - will be enhanced via shared component updates

### New Files

- **`components/layout/AppHeader.tsx`** (CREATE)
  - Shared header component for all authenticated pages
  - Props: `title` (string), `subtitle` (optional string)
  - Contains: Logo/Title + enhanced UserMenu
  - Responsive design: mobile-friendly, touch-optimized

## Step by Step Tasks

### 1. Enhance UserMenu with PGA Navigation and Theme Toggle

- Read `components/layout/UserMenu.tsx` to understand current structure
- Read `components/mode-toggle.tsx` to understand theme toggle implementation
- Add new imports:
  - `useTheme` from `next-themes`
  - `Moon`, `Sun` icons from `lucide-react`
  - `DropdownMenuSubMenu`, `DropdownMenuSubMenuTrigger`, `DropdownMenuSubMenuContent` from `@/components/ui/dropdown-menu`
- After the user info section and before Settings, add:
  - **PGA TOUR navigation item**: Icon (Trophy), onClick redirects to `/tournaments/pga/2025`
  - **Theme submenu**: Icon (Sun/Moon based on theme), submenu with Light/Dark/System options
- Update component to use `useTheme()` hook for theme state
- Ensure all menu items follow existing shadcn/ui DropdownMenu patterns
- Maintain accessibility (keyboard navigation, ARIA labels)

### 2. Create Shared AppHeader Component

- Create `components/layout/AppHeader.tsx`
- Import necessary components: Button, UserMenu
- Define TypeScript interface:
  ```typescript
  interface AppHeaderProps {
    title: string;
    subtitle?: string;
  }
  ```
- Implement header structure:
  - Fixed positioning with `border-b` border
  - Max width container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
  - Height: `h-16` for consistency
  - Left side: Title + optional subtitle
  - Right side: UserMenu only
- Make component responsive:
  - Mobile: Show title only (hide subtitle on small screens)
  - Desktop: Show title + subtitle
- Export as default function

### 3. Update All Page Headers to Use AppHeader

#### Inside the Ropes Pages
- **`app/inside-the-ropes/page.tsx`**:
  - Import AppHeader
  - Remove existing header code (lines 39-71)
  - Remove imports: `Button`, `ChevronLeft`, `ModeToggle`
  - Remove UserMenu import (already in AppHeader)
  - Add: `<AppHeader title="Inside the Ropes" subtitle="Advanced Analytics & Insights" />`
  - Keep breadcrumbs section unchanged

- **`app/inside-the-ropes/player-course-stats/page.tsx`**:
  - Import AppHeader
  - Remove existing header code
  - Remove imports: `Button`, `ChevronLeft`, `ModeToggle`, `UserMenu`
  - Add: `<AppHeader title="Player Stats Per Course" subtitle="Course-specific performance analysis" />`
  - Keep breadcrumbs section unchanged

#### Tournament Pages
- **`app/tournaments/page.tsx`**:
  - Import AppHeader
  - Remove existing header code
  - Remove imports: `Button`, `ChevronLeft`, `ModeToggle`, `UserMenu`
  - Add: `<AppHeader title="Tournaments" subtitle="Professional golf tours" />`
  - Keep breadcrumbs section unchanged

- **`app/tournaments/pga/[year]/page.tsx`**:
  - Import AppHeader
  - Remove existing header code
  - Remove imports: `Button`, `ChevronLeft`, `ModeToggle`, `UserMenu`
  - Add: `<AppHeader title={`PGA TOUR ${year}`} subtitle="Tournament schedule and results" />`
  - Keep breadcrumbs section unchanged

#### Player Pages
- **`app/players/page.tsx`**:
  - Import AppHeader
  - Remove existing header code (lines 68-162, keeping only Sheet content)
  - Remove imports: `Button`, `ChevronLeft`, `ModeToggle`, `UserMenu`
  - Add: `<AppHeader title="Players" subtitle="Player profiles and analytics" />`
  - Keep breadcrumbs section unchanged
  - Keep mobile Sheet menu unchanged

- **`app/players/[playerId]/layout.tsx`**:
  - Import AppHeader
  - Remove existing header code
  - Remove imports: `Button`, `ChevronLeft`, `ModeToggle`, `UserMenu`
  - Add: `<AppHeader title={playerName || "Player Profile"} subtitle="Detailed player information" />`
  - Keep breadcrumbs section unchanged

#### Admin Pages
- **`app/admin/data-management/page.tsx`**:
  - Import AppHeader
  - Remove ChevronLeft back button if present
  - Add: `<AppHeader title="Data Management" subtitle="Admin tools" />`

- **`app/admin/database-schema/page.tsx`**:
  - Import AppHeader
  - Remove ChevronLeft back button if present
  - Add: `<AppHeader title="Database Schema" subtitle="Schema visualization" />`

#### Landing Page
- **`app/page.tsx`**:
  - Remove standalone `<ModeToggle />` from Authenticated section (line 69)
  - Keep existing `LandingPageHeader` component for unauthenticated state
  - Authenticated state: UserMenu already present (line 70), will be enhanced via component updates

### 4. Verify Import Cleanup

- Search all modified files for unused imports
- Remove: `ModeToggle` imports (except in `components/mode-toggle.tsx`)
- Remove: `ChevronLeft` imports from all page files
- Remove: Standalone `UserMenu` imports from pages using AppHeader
- Ensure `AppHeader` is imported in all modified pages

### 5. Test Responsive Behavior

- Verify header appears correctly on mobile (320px width)
- Verify header appears correctly on tablet (768px width)
- Verify header appears correctly on desktop (1024px+ width)
- Test UserMenu dropdown functionality on all screen sizes
- Test theme toggle within UserMenu
- Test PGA TOUR navigation from UserMenu

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev` - Deploy Convex schema and functions (run in background)
- `npm run dev` - Start the Next.js dev server and manually validate:
  - Navigate to `/inside-the-ropes` - verify header has only title + UserMenu
  - Navigate to `/tournaments` - verify header has only title + UserMenu
  - Navigate to `/players` - verify header has only title + UserMenu
  - Click UserMenu on each page - verify PGA TOUR link and Theme submenu appear
  - Test theme toggle from UserMenu - verify light/dark/system modes work
  - Test PGA TOUR link from UserMenu - verify navigation to `/tournaments/pga/2025`
  - Verify NO back buttons appear in any header
  - Verify NO standalone ModeToggle appears in any header
  - Test on mobile viewport (DevTools responsive mode 375px width)
  - Test breadcrumb navigation still works on all pages

## Notes

### Design Decisions

1. **Why consolidate into UserMenu?**
   - Cleaner header design with more space for page content
   - Follows common UX patterns (settings in user menu)
   - Reduces visual clutter on mobile devices
   - Makes navigation controls consistent across all pages

2. **Why remove back buttons?**
   - Browser back button already exists
   - Breadcrumbs provide contextual navigation
   - Back buttons are inconsistent (some pages have them, others don't)
   - Users expect browser controls, not custom back buttons

3. **Why create AppHeader component?**
   - DRY principle - define header once, use everywhere
   - Ensures consistency across all pages
   - Easy to maintain and update in the future
   - Reduces code duplication

### shadcn/ui Implementation Notes

- UserMenu uses `DropdownMenu` component from shadcn/ui
- Follow existing patterns for menu items (icon + text)
- Use `DropdownMenuSeparator` to group related items
- Theme toggle should use submenu pattern if available, otherwise inline menu items
- Maintain hover states, focus states, and keyboard navigation
- Use lucide-react icons consistently (Trophy for PGA, Sun/Moon for theme)

### Mobile Considerations

- UserMenu avatar should be min 44px for touch targets (already implemented)
- Dropdown menu should be easily tappable on mobile
- Theme submenu should work on touch devices (test on actual mobile if possible)
- Header should be fixed position for easy access while scrolling

### Future Enhancements

- Could add "Favorites" or "Recent Players" to UserMenu
- Could add "Quick Stats" toggle to UserMenu
- Could make AppHeader even more configurable (actions, search bar, etc.)
