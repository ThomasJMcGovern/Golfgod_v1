# Bug: Page Headers Not Centered Horizontally

## Bug Description

Page headers (h1 titles like "Players", "Tournaments", "GolfGod") are left-aligned instead of centered horizontally across the page. The current AppHeader component uses `justify-between` which places the title on the left and UserMenu on the right, but the user wants the title centered in the middle of the header with the UserMenu remaining on the right.

**Expected behavior**: Title text should be horizontally centered in the header
**Actual behavior**: Title text is left-aligned in the header

## Problem Statement

The AppHeader component uses flexbox with `justify-between` which creates a left-aligned title and right-aligned UserMenu. The title needs to be centered horizontally while keeping the UserMenu on the right side.

## Solution Statement

Change the header layout from `justify-between` (which pushes items to edges) to `justify-center` for horizontal centering of the title. Use absolute positioning for the UserMenu to keep it on the right side without affecting the centered title positioning.

## Steps to Reproduce

1. Navigate to `/players` page
2. Observe header shows "Players" on the left side
3. Navigate to `/tournaments` page
4. Observe header shows "Tournaments" on the left side
5. Navigate to home page (authenticated)
6. Observe header shows "GolfGod" on the left side

## Root Cause Analysis

The root cause is the flex layout using `justify-between`:

```tsx
<div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  <div className="flex flex-col justify-center">
    <h1>{title}</h1>
  </div>
  <div className="flex items-center">
    <UserMenu />
  </div>
</div>
```

`justify-between` distributes space **between** items, pushing the first item (title) to the left and the last item (UserMenu) to the right. To center the title, we need:
1. Change container to `justify-center` for horizontal centering
2. Use absolute positioning for UserMenu to keep it on the right without affecting title centering

## Relevant Files

Use these files to fix the bug:

- **`components/layout/AppHeader.tsx`** - Primary file containing the header layout bug. Need to change from `justify-between` to `justify-center` and use absolute positioning for UserMenu.

## Step by Step Tasks

### 1. Update AppHeader Layout to Center Title

**File**: `components/layout/AppHeader.tsx`

**Changes**:
- Change parent container from `justify-between` to `justify-center` (centers title horizontally)
- Make parent container `relative` for absolute positioning context
- Make UserMenu container `absolute right-4 sm:right-6 lg:right-8` to position on right side
- Remove UserMenu from flex flow so it doesn't affect title centering

**Before**:
```tsx
<div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  <div className="flex flex-col justify-center">
    <h1>{title}</h1>
  </div>
  <div className="flex items-center">
    <UserMenu />
  </div>
</div>
```

**After**:
```tsx
<div className="relative flex h-16 items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  <div className="flex flex-col justify-center">
    <h1>{title}</h1>
  </div>
  <div className="absolute right-4 sm:right-6 lg:right-8 flex items-center">
    <UserMenu />
  </div>
</div>
```

### 2. Validation

**Execute validation commands** to ensure the bug is fixed with zero regressions.

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually validate headers are horizontally centered on these pages:
  - `/players` - "Players" header should be centered
  - `/tournaments` - "Tournaments" header should be centered
  - `/inside-the-ropes` - "Inside the Ropes" header should be centered
  - `/` (authenticated) - "GolfGod" header should be centered on homepage
  - All pages using AppHeader should show horizontally centered titles with UserMenu on right

## Notes

- **Mobile-first validated**: Absolute positioning uses responsive padding (`right-4 sm:right-6 lg:right-8`) matching the horizontal padding of the container
- **No layout shift**: UserMenu position remains visually identical on the right side
- **No shadcn/ui component changes**: AppHeader is custom, not shadcn
- **Minimal change**: 3 class modifications to fix centering
- **Visual consistency**: All pages using AppHeader will have centered titles
- **No breaking changes**: Only affects horizontal alignment, no functional changes
- **Alternative considered**: Using `justify-between` with empty spacer div, but absolute positioning is cleaner and avoids extra DOM node
