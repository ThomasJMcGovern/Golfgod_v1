# Chore: Remove Stats Bar from Landing Page

## Chore Description
Remove the statistics bar section displaying "200+ PGA Tour Players, 20,745+ Tournament Results, 54 Courses Analyzed, 2015-2026 Historical Data" from the landing page. This component appears between the hero section and the three feature cards on both the unauthenticated and authenticated views of the home page.

## Relevant Files
Use these files to resolve the chore:

- `app/page.tsx` (lines 113, 273) - Main landing page that imports and renders the StatsBar component
  - Line 113: `<StatsBar />` in unauthenticated view
  - Line 273: `<StatsBar />` in authenticated view
  - Remove both component usages and the import statement

- `components/landing/StatsBar.tsx` - The StatsBar component file that should be deleted
  - Contains the stats bar component with 4 stat items (Players, Results, Courses, Historical Data)
  - This entire file can be deleted as it will no longer be used

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Remove StatsBar component usage from app/page.tsx
- Open `app/page.tsx`
- Remove the import statement on line 17: `import StatsBar from "@/components/landing/StatsBar";`
- Remove the `<StatsBar />` component from the unauthenticated view (line 113)
- Remove the `<StatsBar />` component from the authenticated view (line 273)

### Step 2: Delete the StatsBar component file
- Delete the file `components/landing/StatsBar.tsx` as it's no longer being used anywhere in the application

### Step 3: Run validation commands
- Execute the validation commands listed below to ensure the chore is complete with zero regressions

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build Next.js to catch TypeScript errors and validate no regressions
- `npm run lint` - Run ESLint to validate code quality
- Manual: Visit http://localhost:3000 and verify the stats bar is no longer visible on the landing page (both signed in and signed out states)
- Manual: Verify the page layout looks correct without the stats bar (proper spacing between hero section and feature cards)
- Manual: Check that no TypeScript errors appear in the browser console

## Notes
- The StatsBar component is only used on the landing page (app/page.tsx) in two places, so removing it is safe
- After removal, there will be a direct flow from the hero section to the three feature cards
- The stats information is still present in the feature cards themselves (e.g., "200+ PGA Tour players tracked"), so users still see this data
- The component uses lucide-react icons (BarChart3, Trophy, MapPin, Calendar) but these are imported elsewhere, so no cleanup needed for icon dependencies
