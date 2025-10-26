# Chore: Center All Page Headers Vertically

## Chore Description

Center all page headers (h1 titles and subtitles) vertically within the AppHeader component. Currently, the header text is aligned to the top of the header container using `flex flex-col` without vertical centering. The goal is to center the title and subtitle in the middle of the 64px (h-16) header height for better visual balance.

**Reference**: Screenshot shows "Players" header is top-aligned within the header container. The desired state is for the title to be vertically centered.

## Relevant Files

Use these files to resolve the chore:

- **`components/layout/AppHeader.tsx`** - Primary file containing the header layout. Currently uses `flex flex-col` for title section without vertical centering. Need to add `justify-center` to center content vertically within the h-16 (64px) container.

## Step by Step Tasks

### 1. Update AppHeader Component for Vertical Centering

**File**: `components/layout/AppHeader.tsx`

**Changes**:
- Add `justify-center` to the title section's flex container
- This will vertically center the title and subtitle within the 64px header height
- Current structure: `flex flex-col` → New structure: `flex flex-col justify-center`

**Why this works**:
- The parent container is `h-16` (64px height) with `items-center` for horizontal alignment
- The title section uses `flex flex-col` for stacking title and subtitle vertically
- Adding `justify-center` will distribute vertical space equally, centering the content

### 2. Validation

**Execute validation commands** to ensure the chore is complete with zero regressions.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually validate headers are vertically centered on these pages:
  - `/players` - "Players" header
  - `/tournaments` - "Tournaments" header
  - `/inside-the-ropes` - "Inside the Ropes" header
  - `/tournaments/pga/2025` - "2025 PGA TOUR" header (uses AppHeader)
  - All pages using AppHeader should show vertically centered titles

## Notes

- **Mobile-first validated**: The change affects all breakpoints (sm, md, lg) equally since `justify-center` is responsive by default
- **No shadcn/ui component changes needed**: AppHeader is a custom component, not a shadcn component
- **Minimal change**: One-word addition (`justify-center`) to existing flex container
- **Visual consistency**: All pages using AppHeader will have consistent vertical centering
- **No breaking changes**: Only affects visual alignment, no functional changes
