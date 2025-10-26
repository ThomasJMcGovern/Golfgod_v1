# Chore: Fix Player Profile Mobile Responsive Layout

## Chore Description

The player profile section has critical mobile responsiveness issues that cause layout overflow and horizontal scrolling on mobile devices. Based on the screenshot provided, the PlayerKnowledgeHub cards are breaking the mobile viewport, creating a poor user experience.

**Issues Identified:**
1. **PlayerBio component** - Fixed desktop layout (flex with 132px avatar + gap-6) doesn't adapt to mobile, causing horizontal overflow
2. **PlayerKnowledgeHub** - Grid layout may not be properly constrained on mobile
3. **PlayerStats tabs** - 5 tabs in horizontal layout likely overflow on narrow screens
4. **Overall layout** - No proper mobile containment strategy preventing horizontal scroll

**Root Cause:**
The components use desktop-first layouts that don't properly reflow on mobile viewports (<640px). Specifically:
- PlayerBio uses fixed-width elements (132px avatar, gap-6) with flex layout that doesn't wrap
- Tab navigation doesn't scroll or collapse on mobile
- Grid layouts may not have proper `min-width: 0` constraints to prevent overflow

**Mobile-First Best Practices to Apply:**
- Stack elements vertically on mobile, side-by-side on desktop
- Use `min-width: 0` on flex/grid children to allow shrinking
- Implement horizontal scroll with proper indicators for tab overflow
- Ensure touch targets ≥44px
- Test with viewport constraint: `max-width: 100%; overflow-x: hidden`

## Relevant Files

Use these files to resolve the chore:

- **`components/player/PlayerBio.tsx`** (PRIMARY FIX)
  - Fixed desktop layout with 132px avatar and gap-6 causes horizontal overflow
  - Needs mobile stacking: avatar centered on mobile, side-by-side on desktop
  - Avatar size should scale: 96px mobile → 128px desktop
  - Follow button should be full-width mobile, auto-width desktop

- **`components/player/PlayerStats.tsx`** (SECONDARY FIX)
  - 5-tab horizontal navigation overflows on mobile (<375px width)
  - Needs horizontal scroll with scroll indicators OR dropdown selector on mobile
  - Results tab has wide tables that need horizontal scroll wrapper
  - Year tabs (12 tabs: All Years + 2015-2026) need mobile scroll solution

- **`components/player/PlayerKnowledgeHub.tsx`** (VALIDATION)
  - Already mobile-first with `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - Verify no overflow issues with proper testing

- **`app/players/page.tsx`** (VALIDATION)
  - Main layout container - verify proper mobile constraints
  - Check `max-w-7xl mx-auto px-4` doesn't cause issues

### New Files

None required - fixing existing components only.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Fix PlayerBio Mobile Layout (Primary Issue)

**Problem:** Fixed desktop layout with 132px avatar + gap-6 doesn't reflow on mobile, causing horizontal overflow.

**Solution:** Implement mobile-first responsive layout with vertical stacking.

- **File:** `components/player/PlayerBio.tsx`
- **Changes:**
  - Line 48-86: Refactor layout container from desktop-first to mobile-first
  - Replace `<div className="flex items-start">` with mobile-stacking approach
  - Avatar sizing: `h-24 w-24 sm:h-32 sm:w-32` (96px → 128px)
  - Layout strategy:
    - **Mobile (<640px):** Vertical stack - avatar centered, info below, button full-width
    - **Desktop (≥640px):** Horizontal flex - avatar left, info right with gap-6
  - Follow button: `w-full sm:w-auto` for mobile full-width
  - Player name: `text-2xl sm:text-3xl` for better mobile scaling
  - Wrap avatar + info in responsive container: `flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6`
  - Center text on mobile: `text-center sm:text-left`

**Expected Outcome:** PlayerBio component adapts gracefully to mobile viewports with no horizontal overflow.

### Step 2: Fix PlayerStats Tab Navigation Overflow

**Problem:** 5 tabs in horizontal layout overflow on mobile screens (<375px width).

**Solution:** Implement horizontal scroll with proper touch behavior for tab navigation.

- **File:** `components/player/PlayerStats.tsx`
- **Changes:**
  - Line 79-111: Add horizontal scroll wrapper to main tabs
  - Wrap TabsList content div in scroll container:
    ```tsx
    <div className="flex w-full overflow-x-auto scrollbar-hide">
      <TabsTrigger />... (flex-shrink-0 on each tab)
    </div>
    ```
  - Add `flex-shrink-0` to each TabsTrigger to prevent compression
  - Add `scrollbar-hide` utility class (requires Tailwind plugin or CSS)
  - Apply same fix to year selector tabs (lines 316-334)
  - Ensure minimum touch target: `min-w-[80px]` on each tab trigger
  - Add smooth scroll behavior: `scroll-smooth snap-x snap-mandatory`
  - Optional: Add scroll indicators (gradient overlays) for better UX

**Expected Outcome:** Tab navigation scrolls horizontally on mobile with smooth touch behavior, no overflow.

### Step 3: Add Horizontal Scroll Wrapper for Wide Tables

**Problem:** Results table in PlayerStats is too wide for mobile viewports, needs scroll wrapper.

**Solution:** Wrap results table in mobile-friendly scroll container with proper indicators.

- **File:** `components/player/PlayerStats.tsx`
- **Changes:**
  - Line 348-426: Wrap `<table>` in scroll container
  - Add wrapper div: `<div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">`
  - The negative margin technique allows edge-to-edge scroll on mobile
  - Add scroll shadow indicators (CSS gradient overlays) for better UX
  - Ensure table minimum width: `min-w-[640px]` to maintain readability
  - Add sticky first column for tournament names (optional enhancement)

**Expected Outcome:** Wide tables scroll horizontally on mobile without breaking layout, with visual scroll indicators.

### Step 4: Add Global Mobile Overflow Prevention

**Problem:** Ensure no components can cause horizontal page scroll on mobile.

**Solution:** Add defensive CSS to prevent any horizontal overflow at page level.

- **File:** `app/players/page.tsx`
- **Changes:**
  - Line 66: Add overflow constraint to main container
  - Change `<div className="min-h-screen bg-background">` to:
    `<div className="min-h-screen bg-background overflow-x-hidden">`
  - Line 163: Add width constraint to main content wrapper
  - Change `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">` to:
    `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full overflow-x-hidden">`
  - Add defensive CSS to flex/grid containers: `min-w-0` class

**Expected Outcome:** Page-level overflow prevention ensures no component can break mobile viewport.

### Step 5: Add Tailwind Scrollbar Hide Utility (if needed)

**Problem:** Browser default scrollbars may look inconsistent on mobile horizontal scroll.

**Solution:** Add Tailwind CSS utility for hiding scrollbars while maintaining scroll functionality.

- **File:** `tailwind.config.js`
- **Changes:**
  - Add to `theme.extend`:
    ```js
    {
      theme: {
        extend: {
          // ... existing config
        }
      },
      plugins: [
        // ... existing plugins
        function({ addUtilities }) {
          addUtilities({
            '.scrollbar-hide': {
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }
          })
        }
      ]
    }
    ```

**Expected Outcome:** Clean horizontal scroll behavior without visible scrollbars on mobile.

### Step 6: Test Mobile Viewport Constraints

**Problem:** Need to validate all fixes work across multiple mobile screen sizes.

**Solution:** Manual testing with Chrome DevTools device emulation.

- **Testing Matrix:**
  - iPhone SE (375×667) - smallest modern mobile
  - iPhone 14 Pro (393×852) - standard mobile
  - iPad Air (820×1180) - tablet breakpoint
  - Custom viewport at 320px width - stress test
- **Test Cases:**
  1. PlayerBio renders without horizontal scroll
  2. PlayerStats tabs scroll horizontally with smooth touch behavior
  3. Results table scrolls horizontally within container
  4. PlayerKnowledgeHub cards stack properly (1 column on mobile)
  5. No horizontal page scroll at any viewport width
  6. All touch targets ≥44px minimum
- **Expected Outcome:** All components render properly on all tested viewports with no horizontal overflow.

### Step 7: Run Validation Commands

Execute all validation commands to ensure zero regressions.

- Run TypeScript build to catch any type errors
- Start Convex backend to ensure database schema compatibility
- Start Next.js dev server and manually test all mobile viewports
- Check browser console for any errors or warnings

**Expected Outcome:** All validation commands pass with zero errors, mobile layout works perfectly.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev` - Deploy Convex schema and functions (run in background)
- `npm run dev` - Start the Next.js dev server and manually validate the chore is complete
- **Manual Testing Checklist:**
  - [ ] Open Chrome DevTools (Cmd+Opt+I)
  - [ ] Toggle device toolbar (Cmd+Shift+M)
  - [ ] Test iPhone SE (375px width) - PlayerBio stacks vertically, no overflow
  - [ ] Test iPhone 14 Pro (393px width) - Tabs scroll horizontally smoothly
  - [ ] Test iPad Air (820px width) - Desktop layout kicks in properly
  - [ ] Test custom 320px width - Stress test for minimum viewport
  - [ ] Verify no horizontal page scroll at any width
  - [ ] Verify all buttons/tabs have ≥44px touch targets
  - [ ] Test with Fast 3G throttling - ensure smooth performance

## Notes

**Key Mobile-First Principles Applied:**
1. **Vertical stacking on mobile** - PlayerBio avatar/info stack vertically, side-by-side on desktop
2. **Responsive sizing** - Avatar, text, spacing all scale with breakpoints
3. **Horizontal scroll containers** - Tabs and tables scroll horizontally when too wide
4. **Touch targets** - All interactive elements maintain ≥44px minimum
5. **Overflow prevention** - Defensive CSS prevents any horizontal page scroll
6. **Progressive enhancement** - Mobile base styles enhanced for larger screens

**Tailwind Breakpoints Used:**
- `sm:` = 640px (small tablets) - Switch to horizontal layout
- `md:` = 768px (tablets) - Table optimizations
- `lg:` = 1024px (desktops) - Full desktop experience

**Testing Priority:**
1. iPhone SE (375px) - Most constrained mobile viewport
2. Fast 3G network throttling - Performance under stress
3. Touch interaction - Ensure scrolling feels native

**Performance Considerations:**
- Horizontal scroll uses CSS only (no JS) for native performance
- No layout shifts (CLS) from responsive breakpoint changes
- Touch targets prevent mis-taps on mobile

**Accessibility Considerations:**
- Scroll containers have proper ARIA labels
- Keyboard navigation still works for tab selection
- Screen readers announce tab count and position

**Future Enhancements (Optional):**
- Sticky table headers for long result tables
- Scroll position indicators (dots) for tab navigation
- Pull-to-refresh gesture for tournament results
- Swipe gestures for tab navigation
