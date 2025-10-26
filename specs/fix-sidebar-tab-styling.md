# Chore: Fix Sidebar Tab Styling in Mobile Sheet

## Chore Description

The mobile sidebar sheet's tab implementation has several UI issues visible in the screenshot:

1. **TabsList width problem**: Using `grid w-full grid-cols-2` causes janky stretching - TabsList should use `w-full` to properly fill the parent, not rely on grid
2. **Background color mismatch**: TabsList has a muted background that doesn't match the sheet's dark theme
3. **Redundant heading**: "Select Player" appears both as SheetTitle and as h3 in TabsContent, creating visual clutter
4. **Inconsistent spacing**: Tab content has `mt-4` but overall layout feels cramped
5. **Color inconsistency**: Rankings tab has hardcoded `bg-blue-50` hover which doesn't match the dark green theme

**Current Issues**:
- Line 95: `<TabsList className="grid w-full grid-cols-2">` - Grid causing layout issues
- Line 92: `<SheetTitle>Player Selection</SheetTitle>` + Line 101: `<h3 className="font-semibold mb-3">Select Player</h3>` - Redundant headings
- Line 90: `<SheetContent side="left" className="w-80">` - Fixed width could be responsive
- Line 35 in PlayerRankings: `hover:bg-blue-50` - Blue doesn't match green theme

**Target State**:
- Clean tab layout with proper width and styling
- Single clear heading per tab
- Consistent spacing throughout
- Theme-appropriate colors (dark green, not blue)
- Responsive sheet width

## Relevant Files

Use these files to resolve the chore:

- **`app/players/page.tsx`** (lines 79-121) - Mobile sheet implementation with Tabs component. Contains the janky TabsList styling and redundant headings that need fixing.

- **`components/ui/tabs.tsx`** (lines 21-34) - TabsList component definition. Default styles show `w-fit` not `w-full`, confirming the grid approach is wrong.

- **`components/ui/sheet.tsx`** (lines 84-91) - SheetHeader component with default `p-4` padding. Understanding padding structure helps fix spacing issues.

- **`components/player/PlayerRankings.tsx`** (line 35) - Contains hardcoded `hover:bg-blue-50` that should use theme colors instead.

### New Files

None required - all changes are to existing files.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix TabsList Layout and Styling

- Open `app/players/page.tsx`
- Locate line 95: `<TabsList className="grid w-full grid-cols-2">`
- Remove `grid` and `grid-cols-2` classes - TabsList handles its own internal layout
- Keep `w-full` to fill the parent container
- Change to: `<TabsList className="w-full">`
- Rationale: shadcn/ui TabsList uses `inline-flex` internally and doesn't need grid layout wrapper

### 2. Remove Redundant "Select Player" Heading

- In same file, locate lines 100-101 inside `<TabsContent value="players">`
- Remove the `<h3 className="font-semibold mb-3">Select Player</h3>` line entirely
- The SheetTitle "Player Selection" on line 92 is sufficient
- This eliminates visual clutter and redundancy

### 3. Improve Sheet Responsiveness

- Locate line 90: `<SheetContent side="left" className="w-80">`
- Change fixed width to responsive: `className="w-[85vw] sm:w-80 max-w-sm"`
- Rationale:
  - `w-[85vw]` - 85% of viewport width on mobile (better for small phones)
  - `sm:w-80` - Fixed 320px width on small screens and up
  - `max-w-sm` - Cap at 384px to prevent oversized sheet on tablets

### 4. Adjust Tab Content Spacing

- Locate line 94: `<Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">`
- Change spacing to: `className="mt-6"`
- Increase spacing between SheetTitle and tabs for better visual hierarchy
- Locate line 100: `<TabsContent value="players" className="mt-4">`
- Keep as is (mt-4 is appropriate below tabs)

### 5. Fix PlayerRankings Theme Colors

- Open `components/player/PlayerRankings.tsx`
- Locate line 35: `className="w-full grid grid-cols-[40px_1fr] gap-2 py-2 px-1 hover:bg-blue-50 rounded transition-colors text-left"`
- Replace `hover:bg-blue-50` with `hover:bg-accent`
- Change to: `className="w-full grid grid-cols-[40px_1fr] gap-2 py-2 px-1 hover:bg-accent rounded transition-colors text-left"`
- Rationale: `bg-accent` is a theme color that adapts to dark/light mode and matches the green theme

### 6. Improve PlayerRankings Text Colors

- In same file, line 44: `className="text-sm font-medium text-blue-600 hover:text-blue-800"`
- Replace blue colors with theme colors: `className="text-sm font-medium text-primary hover:text-primary/80"`
- Rationale: `text-primary` uses the golf green color from theme, `hover:text-primary/80` provides subtle darkening on hover

### 7. Test Mobile Sheet UI

- Open browser to `http://localhost:3000/players`
- Click hamburger menu to open sheet
- Verify TabsList renders cleanly without stretching
- Verify only "Player Selection" heading appears at top
- Verify tabs are properly sized and clickable
- Switch between "Players" and "Rankings" tabs
- Verify responsive width works on narrow viewport
- Check that hover states use green theme colors, not blue

### 8. Test Dark Mode

- Toggle dark mode using mode toggle button
- Verify tab styling looks correct in dark mode
- Verify PlayerRankings hover states work in dark mode
- Confirm `bg-accent` adapts to dark theme properly

### 9. Run Validation Commands

Execute all validation commands to ensure no regressions.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start dev server and manually validate:
  - Navigate to `/players` page
  - Click hamburger menu (mobile menu button)
  - Verify sheet opens smoothly
  - Check TabsList doesn't have layout issues
  - Verify only one heading ("Player Selection")
  - Switch between "Players" and "Rankings" tabs
  - Verify hover colors use green theme (not blue)
  - Test responsive width on narrow browser window (< 640px)
  - Toggle dark mode and verify styling works
  - Close sheet and reopen to ensure consistent behavior

## Notes

### shadcn/ui Tabs Component Architecture

**Default TabsList Styling** (from `components/ui/tabs.tsx` line 29):
```tsx
className={cn(
  "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
  className
)}
```

Key observations:
- Uses `inline-flex` not `grid` for internal layout
- Default is `w-fit` (size to content)
- Override with `w-full` in className prop to fill parent
- Don't wrap in `grid grid-cols-2` - this fights the component's internal flex layout

### Why `grid w-full grid-cols-2` Was Wrong

The original implementation tried to force a grid layout on TabsList:
```tsx
<TabsList className="grid w-full grid-cols-2">
```

**Problems**:
1. TabsList is `inline-flex` internally, creating a flex vs grid conflict
2. Grid columns forced equal sizing, causing stretching
3. Radix UI TabsList manages its own child layout via Radix primitives
4. This override breaks the component's intended behavior

**Correct Approach**:
```tsx
<TabsList className="w-full">
```
- Let TabsList use its native `inline-flex` layout
- Override only the width to fill parent
- TabsTrigger children distribute naturally via flex

### Theme Color Variables

Using semantic color variables instead of hardcoded values:

| Old (Hardcoded) | New (Theme) | Adapts to |
|----------------|-------------|-----------|
| `bg-blue-50` | `bg-accent` | Dark/light mode + theme |
| `text-blue-600` | `text-primary` | Golf green theme |
| `hover:text-blue-800` | `hover:text-primary/80` | Theme with opacity |

**Benefits**:
- Consistent with site-wide golf green theme
- Works in dark mode automatically
- Easy to change theme globally later
- Follows shadcn/ui semantic naming conventions

### SheetContent Responsive Width Strategy

**Progressive Enhancement**:
- Mobile (< 640px): `w-[85vw]` - 85% viewport width
- Small screens (≥ 640px): `sm:w-80` - Fixed 320px
- Cap: `max-w-sm` - Maximum 384px

**Why 85vw on Mobile**:
- Allows sheet to breathe on small phones (< 375px)
- Still shows underlying page content for context
- Better UX than fixed width that might overflow

**Why sm:w-80**:
- Consistent with original design on larger screens
- Fixed width provides stable layout
- 320px is comfortable for reading and interaction

### Redundant Heading Issue

**Before** (confusing):
```
┌─────────────────────┐
│ Player Selection    │  ← SheetTitle
├─────────────────────┤
│ [Players] [Rankings]│  ← Tabs
├─────────────────────┤
│ Select Player       │  ← Redundant h3
│ [Player dropdown]   │
└─────────────────────┘
```

**After** (clean):
```
┌─────────────────────┐
│ Player Selection    │  ← Single clear heading
├─────────────────────┤
│ [Players] [Rankings]│  ← Tabs
├─────────────────────┤
│ [Player dropdown]   │  ← Direct content
└─────────────────────┘
```

The SheetTitle provides context, the tab provides navigation, content speaks for itself.

### Mobile-First Best Practices Applied

1. **Touch Targets**: Tabs maintain minimum 44px height for accessibility
2. **Responsive Spacing**: Increased mt-6 for better visual hierarchy on small screens
3. **Flexible Width**: 85vw prevents cramping on narrow phones
4. **Theme Colors**: Ensure sufficient contrast in both light and dark modes
5. **Native Behavior**: Let shadcn/ui components use their intended layouts
