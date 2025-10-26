# Chore: Fix Tournament Pages Mobile Responsive Layout

## Chore Description

The tournament pages (`/tournaments` and `/tournaments/pga/[year]`) have critical mobile responsiveness issues similar to the player profile page. These issues cause layout overflow and horizontal scrolling on mobile devices, creating a poor user experience.

**Issues Identified:**

1. **Tour Navigation Tabs** (`/tournaments/pga/[year]` - Line 342-372)
   - 6 tabs in fixed horizontal layout overflow on mobile screens (<375px width)
   - No horizontal scroll wrapper - tabs get compressed and unreadable
   - Missing touch-friendly behavior and minimum width constraints

2. **Tournament Tables** (`/tournaments/pga/[year]` - Lines 400-538)
   - Wide tables with 4 columns (DATES, TOURNAMENT, WINNER/PREVIOUS WINNER, PURSE/SCORE) overflow viewport
   - No horizontal scroll wrapper or responsive table pattern
   - Table headers and cells not constrained for mobile viewing
   - Three separate tables (Current, Scheduled, Completed) all need the same fix

3. **Global Overflow Prevention** (Both pages)
   - Missing `overflow-x-hidden` on page containers
   - No width constraints or `min-w-0` on flex children
   - Potential for child elements to break viewport on mobile

**Root Cause:**
The components use desktop-first layouts without proper mobile constraints. Specifically:
- Tour navigation tabs don't have horizontal scroll capability
- Wide tables don't have scroll containers with proper mobile edge-to-edge behavior
- Page-level overflow prevention is missing

**Mobile-First Best Practices to Apply:**
- Add horizontal scroll with `scrollbar-hide` for tab navigation overflow
- Wrap tables in scroll containers using negative margin technique
- Add page-level overflow prevention with `overflow-x-hidden`
- Ensure all touch targets ≥44px minimum
- Test with viewport constraint at 375px (iPhone SE)

## Relevant Files

Use these files to resolve the chore:

- **`app/tournaments/page.tsx`** (VALIDATION ONLY)
  - Hub page with grid of tour cards - already mobile-responsive
  - Grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` pattern
  - No issues identified - verify it still works after changes

- **`app/tournaments/pga/[year]/page.tsx`** (PRIMARY FIX)
  - Tour navigation tabs (6 tabs) need horizontal scroll wrapper
  - Three tournament tables (Current, Scheduled, Completed) need scroll containers
  - Page container needs overflow prevention
  - Lines 342-372: Tour navigation tabs overflow on mobile
  - Lines 400-538: Three separate tournament tables need horizontal scroll wrappers
  - Desktop table width requires 4 columns (DATES ~120px, TOURNAMENT ~40%, WINNER ~30%, PURSE ~20%)

- **`MOBILE_FIRST_GUIDE.md`** (DOCUMENTATION UPDATE)
  - Add tournament table pattern to Data Tables section
  - Document tour navigation tabs pattern
  - Update Files Modified section to include tournament pages

### New Files

None required - fixing existing components only.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Global Overflow Prevention to Tournament Year Page

**Problem:** Page container doesn't prevent horizontal overflow from child components.

**Solution:** Add defensive CSS to prevent any component from causing horizontal page scroll.

- **File:** `app/tournaments/pga/[year]/page.tsx`
- **Changes:**
  - Line 289: Add `overflow-x-hidden` to main container
    - Change `<div className="min-h-screen bg-background">` to:
      `<div className="min-h-screen bg-background overflow-x-hidden">`
  - Line 393: Add width constraint and overflow prevention to main content wrapper
    - Change `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">` to:
      `<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-x-hidden">`

**Expected Outcome:** Page-level overflow prevention ensures no component can break mobile viewport.

### Step 2: Fix Tour Navigation Tabs Horizontal Overflow

**Problem:** 6 tour navigation tabs in fixed horizontal layout overflow on mobile screens (<375px width).

**Solution:** Implement horizontal scroll wrapper with `scrollbar-hide` for clean mobile UX.

- **File:** `app/tournaments/pga/[year]/page.tsx`
- **Changes:**
  - Line 342-372: Refactor tour navigation tabs to support horizontal scroll
  - Wrap the flex container in a scroll wrapper:
    ```tsx
    <div className="border-b bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 py-2 min-w-max">
            {/* Existing buttons with flex-shrink-0 and min-w-[100px] */}
          </div>
        </div>
      </div>
    </div>
    ```
  - Add `flex-shrink-0` to each button to prevent compression
  - Add `min-w-[100px]` to each button to ensure ≥44px touch targets with padding
  - Add `min-w-max` to inner flex container to prevent wrapping
  - Maintain existing active state styling with red bottom border

**Expected Outcome:** Tour navigation tabs scroll horizontally on mobile with smooth touch behavior, no overflow.

### Step 3: Add Horizontal Scroll Wrapper for Current Tournaments Table

**Problem:** Current tournaments table is too wide for mobile viewports, needs scroll wrapper.

**Solution:** Wrap table in mobile-friendly scroll container using negative margin technique.

- **File:** `app/tournaments/pga/[year]/page.tsx`
- **Changes:**
  - Line 400-436: Wrap `<Table>` in scroll container
  - Add wrapper div before `<Table>`:
    ```tsx
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <Table className="min-w-[640px]">
        {/* Existing table content */}
      </Table>
    </div>
    ```
  - The negative margin technique (`-mx-4 px-4`) allows edge-to-edge scroll on mobile
  - `sm:mx-0 sm:px-0` restores normal padding on desktop (≥640px)
  - `min-w-[640px]` ensures table maintains readability with 4 columns

**Expected Outcome:** Current tournaments table scrolls horizontally on mobile without breaking layout.

### Step 4: Add Horizontal Scroll Wrapper for Scheduled Tournaments Table

**Problem:** Scheduled tournaments table has same width constraints as current tournaments table.

**Solution:** Apply identical scroll wrapper pattern to scheduled tournaments section.

- **File:** `app/tournaments/pga/[year]/page.tsx`
- **Changes:**
  - Line 446-482: Wrap `<Table>` in scroll container
  - Add wrapper div before `<Table>`:
    ```tsx
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <Table className="min-w-[640px]">
        {/* Existing table content */}
      </Table>
    </div>
    ```
  - Same technique as Current Tournaments table for consistency

**Expected Outcome:** Scheduled tournaments table scrolls horizontally on mobile without breaking layout.

### Step 5: Add Horizontal Scroll Wrapper for Completed Tournaments Table

**Problem:** Completed tournaments table has same width constraints as other tournament tables.

**Solution:** Apply identical scroll wrapper pattern to completed tournaments section.

- **File:** `app/tournaments/pga/[year]/page.tsx`
- **Changes:**
  - Line 492-535: Wrap `<Table>` in scroll container
  - Add wrapper div before `<Table>`:
    ```tsx
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <Table className="min-w-[640px]">
        {/* Existing table content */}
      </Table>
    </div>
    ```
  - Same technique as other tournament tables for consistency

**Expected Outcome:** Completed tournaments table scrolls horizontally on mobile without breaking layout.

### Step 6: Verify Tournament Hub Page Still Works

**Problem:** Ensure tournament hub page (`/tournaments`) doesn't have any mobile issues.

**Solution:** Review and validate existing mobile-responsive implementation.

- **File:** `app/tournaments/page.tsx`
- **Validation:**
  - Line 91: Verify page container has proper structure
  - Line 145: Verify main content wrapper has proper padding
  - Line 157: Verify tour cards grid uses mobile-first pattern: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - Line 179: Verify card padding is responsive: `p-4 sm:p-6`
  - No changes needed - already follows mobile-first patterns

**Expected Outcome:** Tournament hub page continues to work properly on all viewport sizes.

### Step 7: Update Mobile-First Documentation

**Problem:** Need to document tournament-specific responsive patterns for future reference.

**Solution:** Add tournament navigation and table patterns to MOBILE_FIRST_GUIDE.md.

- **File:** `MOBILE_FIRST_GUIDE.md`
- **Changes:**
  - Add new subsection under "Component Patterns" for Tour Navigation Tabs:
    ```markdown
    ### Tour Navigation Tabs (Horizontal Scroll)
    ```tsx
    // 6+ tabs with horizontal scroll on mobile
    <div className="border-b bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 py-2 min-w-max">
            <button className="flex-shrink-0 min-w-[100px] px-4 py-2">Tab 1</button>
            <button className="flex-shrink-0 min-w-[100px] px-4 py-2">Tab 2</button>
            {/* More tabs... */}
          </div>
        </div>
      </div>
    </div>
    ```

    **Features**:
    - Horizontal scroll on mobile for 6+ navigation tabs
    - `min-w-max` prevents tab wrapping
    - `flex-shrink-0` prevents individual tab compression
    - `min-w-[100px]` ensures ≥44px touch targets with padding
    - Clean scrolling with `scrollbar-hide` utility
    - Native CSS scroll behavior (no JavaScript)

    **Implemented in:**
    - `/tournaments/pga/[year]` - Tour navigation (PGA TOUR, LPGA, Champions, etc.)
    ```
  - Update "Data Tables" section with tournament table pattern:
    ```markdown
    **Implemented in:**
    - PlayerStats component: Tournament results table
    - Inside the Ropes: Tournament history table
    - `/tournaments/pga/[year]`: Current/Scheduled/Completed tournament tables
    ```
  - Update "Files Modified" section:
    ```markdown
    ### Tournament Pages
    - `app/tournaments/pga/[year]/page.tsx` - Tour navigation tabs + horizontal scrolling tables
    ```

**Expected Outcome:** Documentation updated with tournament-specific responsive patterns.

### Step 8: Run Validation Commands

Execute all validation commands to ensure zero regressions.

- Run TypeScript build to catch any type errors
- Start Next.js dev server and manually test tournament pages on mobile viewports
- Check browser console for any errors or warnings
- Verify no horizontal overflow on any page

**Expected Outcome:** All validation commands pass with zero errors, tournament pages work perfectly on mobile.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually validate the chore is complete
- **Manual Testing Checklist:**
  - [ ] Open Chrome DevTools (Cmd+Opt+I)
  - [ ] Toggle device toolbar (Cmd+Shift+M)
  - [ ] Test `/tournaments` page:
    - [ ] iPhone SE (375px width) - Cards stack properly, no overflow
    - [ ] iPad Air (820px width) - 2-column grid displays
  - [ ] Test `/tournaments/pga/2025` page:
    - [ ] iPhone SE (375px width) - Tour tabs scroll horizontally, tables scroll horizontally
    - [ ] Tour navigation tabs scroll smoothly with touch behavior
    - [ ] Current tournaments table scrolls horizontally within container
    - [ ] Scheduled tournaments table scrolls horizontally within container
    - [ ] Completed tournaments table scrolls horizontally within container
    - [ ] No horizontal page scroll at any width
    - [ ] All buttons/tabs have ≥44px touch targets
  - [ ] Test iPad Air (820px width) - Desktop layout kicks in properly
  - [ ] Verify no horizontal page scroll at any width

## Notes

**Key Mobile-First Principles Applied:**

1. **Horizontal Scroll for Navigation** - Tour tabs scroll horizontally on mobile when 6+ tabs
2. **Table Scroll Containers** - Wide tables scroll within containers using negative margin technique
3. **Overflow Prevention** - Page-level `overflow-x-hidden` prevents any component breakage
4. **Touch Targets** - All interactive elements maintain ≥44px minimum (`min-w-[100px]` with padding)
5. **Consistent Patterns** - All three tournament tables use identical scroll wrapper pattern

**Tailwind Breakpoints Used:**
- Mobile base: 0px+ (base styles)
- `sm:` = 640px - Desktop table padding, tour tab adjustments

**Testing Priority:**
1. iPhone SE (375px) - Most constrained mobile viewport
2. Tournament table horizontal scroll behavior
3. Tour navigation tabs scroll behavior
4. Touch interaction - Ensure scrolling feels native

**Performance Considerations:**
- Horizontal scroll uses CSS only (no JS) for native performance
- `scrollbar-hide` utility already exists in `tailwind.config.js` (added in player profile fix)
- No layout shifts (CLS) from responsive breakpoint changes
- Touch targets prevent mis-taps on mobile

**Accessibility Considerations:**
- Keyboard navigation still works for tab selection
- Screen readers announce tab count and position
- Table scroll containers have proper ARIA labels (native table semantics)

**Pattern Consistency:**
- Tour navigation tabs pattern matches PlayerStats tabs pattern (horizontal scroll with `scrollbar-hide`)
- Tournament table scroll pattern matches PlayerStats results table pattern (negative margin technique)
- Page overflow prevention matches players page pattern (`overflow-x-hidden` on container and content wrapper)

**Future Enhancements (Optional):**
- Sticky table headers for long tournament lists
- Scroll position indicators for tour navigation tabs
- Pull-to-refresh gesture for tournament data
- Swipe gestures for tab navigation
