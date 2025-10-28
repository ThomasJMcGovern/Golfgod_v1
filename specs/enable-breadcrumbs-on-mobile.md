# Chore: Enable Breadcrumbs on Mobile (All Screen Sizes)

## Chore Description

Currently, breadcrumb navigation is hidden on mobile devices using the `hidden sm:block` CSS class, making breadcrumbs visible only on desktop (≥640px). The user wants breadcrumbs to be visible on **all screen sizes**, including mobile devices.

**Current Behavior**:
- Breadcrumbs hidden on mobile (`< 640px`) with `hidden sm:block`
- Breadcrumbs visible only on tablets and desktops (`≥ 640px`)

**Desired Behavior**:
- Breadcrumbs visible on **all screen sizes** (mobile, tablet, desktop)
- Remove `hidden sm:block` class from all breadcrumb containers
- Maintain responsive padding and spacing for mobile viewports

**Pages with Breadcrumbs** (need to be updated):
1. `/app/players/page.tsx` - Players hub page
2. `/app/players/[playerId]/layout.tsx` - Player category pages layout
3. `/app/inside-the-ropes/page.tsx` - Inside the Ropes hub
4. `/app/inside-the-ropes/player-course-stats/page.tsx` - Player course stats
5. `/app/tournaments/page.tsx` - Tournaments hub
6. `/app/tournaments/pga/[year]/page.tsx` - Tournament year page
7. `/app/tournaments/pga/[year]/course/[courseId]/info/page.tsx` - Course info page
8. `/app/tournaments/pga/[year]/course/[courseId]/scorecard/page.tsx` - Course scorecard page
9. `/app/tournaments/pga/[year]/course/[courseId]/conditions/page.tsx` - Course conditions page
10. `/app/tournaments/pga/[year]/course/[courseId]/winners/page.tsx` - Course winners page
11. `/app/tournaments/pga/[year]/course/[courseId]/top-finishers/page.tsx` - Course top finishers page
12. `/app/tournaments/pga/[year]/course/[courseId]/majors/page.tsx` - Course majors page

## Relevant Files

Use these files to resolve the chore:

- **`app/players/page.tsx`** - Players hub page with breadcrumbs
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/players/[playerId]/layout.tsx`** - Shared layout for player category pages
  - Contains breadcrumb navigation for all player detail pages
  - Needs to remove visibility restriction

- **`app/inside-the-ropes/page.tsx`** - Inside the Ropes hub page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/inside-the-ropes/player-course-stats/page.tsx`** - Player course stats page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/tournaments/page.tsx`** - Tournaments hub page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/tournaments/pga/[year]/page.tsx`** - Tournament year page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/tournaments/pga/[year]/course/[courseId]/info/page.tsx`** - Course info page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/tournaments/pga/[year]/course/[courseId]/scorecard/page.tsx`** - Course scorecard page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/tournaments/pga/[year]/course/[courseId]/conditions/page.tsx`** - Course conditions page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/tournaments/pga/[year]/course/[courseId]/winners/page.tsx`** - Course winners page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/tournaments/pga/[year]/course/[courseId]/top-finishers/page.tsx`** - Course top finishers page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`app/tournaments/pga/[year]/course/[courseId]/majors/page.tsx`** - Course majors page
  - Contains breadcrumb navigation with `hidden sm:block` class
  - Needs to remove visibility restriction

- **`CLAUDE.md`** - Project documentation
  - Contains breadcrumb navigation documentation
  - Needs to update to reflect mobile-visible breadcrumbs

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update Players Pages Breadcrumbs

- Open `app/players/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained (`px-4 sm:px-6 lg:px-8 py-2`)

- Open `app/players/[playerId]/layout.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

### Step 2: Update Inside the Ropes Pages Breadcrumbs

- Open `app/inside-the-ropes/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

- Open `app/inside-the-ropes/player-course-stats/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

### Step 3: Update Tournaments Pages Breadcrumbs

- Open `app/tournaments/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

- Open `app/tournaments/pga/[year]/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

### Step 4: Update Tournament Course Category Pages Breadcrumbs

- Open `app/tournaments/pga/[year]/course/[courseId]/info/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

- Open `app/tournaments/pga/[year]/course/[courseId]/scorecard/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

- Open `app/tournaments/pga/[year]/course/[courseId]/conditions/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

- Open `app/tournaments/pga/[year]/course/[courseId]/winners/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

- Open `app/tournaments/pga/[year]/course/[courseId]/top-finishers/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

- Open `app/tournaments/pga/[year]/course/[courseId]/majors/page.tsx`
- Find the breadcrumb container div with `hidden sm:block border-t` class
- Remove `hidden sm:block` classes, keep only `border-t`
- Verify responsive padding is maintained

### Step 5: Update Documentation

- Open `CLAUDE.md`
- Find the "Breadcrumb Navigation" section
- Update the description from "Desktop-only display (`hidden sm:block`)" to "Responsive display on all screen sizes"
- Update documentation to reflect breadcrumbs are now visible on mobile

### Step 6: Run Validation Commands

Execute all validation commands to ensure zero regressions.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually validate the chore is complete:
  - Navigate to `/players` on mobile viewport (375px)
  - Verify breadcrumbs are visible: "Home > Players"
  - Navigate to `/players/{playerId}/injuries` on mobile viewport
  - Verify breadcrumbs are visible: "Home > Players > Player Profile > Injury History"
  - Navigate to `/tournaments/pga/2025` on mobile viewport
  - Verify breadcrumbs are visible: "Home > Tournaments > 2025"
  - Navigate to `/inside-the-ropes` on mobile viewport
  - Verify breadcrumbs are visible: "Home > Inside the Ropes"
  - Navigate to `/tournaments/pga/2025/course/{courseId}/info` on mobile viewport
  - Verify breadcrumbs are visible with full navigation path
  - Test on tablet (768px) and desktop (1024px) viewports
  - Ensure breadcrumbs maintain responsive padding and don't overflow

## Notes

**Mobile Considerations**:
- Breadcrumbs on mobile may wrap to multiple lines on longer paths (e.g., tournament course category pages)
- The existing responsive padding (`px-4 sm:px-6 lg:px-8 py-2`) should handle mobile layouts well
- BreadcrumbSeparator component already handles responsive sizing
- No changes needed to breadcrumb component structure, only visibility classes

**Pattern Consistency**:
- All breadcrumb containers follow the same pattern:
  ```tsx
  <div className="hidden sm:block border-t">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <Breadcrumb>...</Breadcrumb>
    </div>
  </div>
  ```
- After changes, pattern will be:
  ```tsx
  <div className="border-t">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <Breadcrumb>...</Breadcrumb>
    </div>
  </div>
  ```

**No Component Changes**:
- The shadcn/ui Breadcrumb components (`components/ui/breadcrumb.tsx`) do not need modification
- Only removing visibility restrictions from container divs in page files

**Accessibility**:
- Breadcrumbs improve navigation clarity on mobile
- Touch targets remain accessible (breadcrumb links already meet 44px minimum)
- Screen readers will benefit from breadcrumb navigation context on all devices
