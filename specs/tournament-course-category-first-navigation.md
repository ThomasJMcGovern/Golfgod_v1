# Chore: Refactor Tournament Course Selection to Category-First Navigation

## Chore Description

Refactor the `TournamentCourseExplorer` component to mirror the Player Knowledge Hub's category-first navigation pattern. Currently, users must select a course from a dropdown button before clicking category cards. The desired behavior is:

**Current Flow (to be removed)**:
1. User clicks "Select a course..." button
2. Dialog opens for course selection
3. User selects a course
4. User clicks category card (e.g., "Course Information")
5. Navigates to `/tournaments/pga/{year}/course/{courseId}/{category}`

**New Flow (desired)**:
1. User clicks category card directly (e.g., "Course Information")
2. Dialog opens prompting course selection
3. User selects a course
4. Auto-redirects to `/tournaments/pga/{year}/course/{courseId}/{category}`

This matches the CategoryExplorer pattern used in the Player Knowledge Hub where clicking a category card (e.g., "Injuries") opens a player selection dialog, then auto-redirects to the player's category page.

**Visual Changes**:
- Remove the "Select a Course" label and button above the category cards
- Display only the "What Would You Like to Know?" header and 6 category cards
- Category cards open course selection dialog on click

## Relevant Files

Use these files to resolve the chore:

- **`components/tournament/TournamentCourseExplorer.tsx`** - Main component to refactor
  - Currently displays course selection button above category cards
  - Need to remove course selection UI and update category card click handlers
  - Need to manage dialog state for each category click

- **`components/tournament/CategoryCourseDialog.tsx`** - Course selection dialog
  - Already exists and works correctly
  - Dialog title will need to be dynamic based on clicked category
  - No changes required to the dialog component itself

- **`components/player/CategoryExplorer.tsx`** - Reference pattern to follow
  - Shows the desired category-first navigation pattern
  - Opens CategoryPlayerDialog on category card click
  - Auto-redirects after player selection

- **`lib/course-categories.ts`** - Course category constants
  - Contains the 6 course categories with metadata
  - No changes required

- **`components/player/KnowledgeCard.tsx`** - Reusable card component
  - Used by both TournamentCourseExplorer and CategoryExplorer
  - No changes required

- **`app/tournaments/pga/[year]/page.tsx`** - Tournament page using TournamentCourseExplorer
  - No changes required (component usage remains the same)

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Refactor TournamentCourseExplorer Component

- Open `components/tournament/TournamentCourseExplorer.tsx`
- Remove the state variable `selectedCourseId` (no longer needed for pre-selection)
- Remove the state variable `dialogOpen` and replace with `selectedCategory` state
- Remove the course selection button UI (lines 88-106: label, Button, CategoryCourseDialog)
- Remove the helper text at the bottom (lines 127-131)
- Update `handleCategoryClick` to set `selectedCategory` and open dialog instead of checking for selected course:
  ```typescript
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setDialogOpen(true);
  };
  ```
- Add `handleCourseSelect` callback that:
  - Closes the dialog
  - Navigates to `/tournaments/pga/{year}/course/{courseId}/{selectedCategory}`
  - Resets `selectedCategory` state
- Add `handleDialogClose` callback to reset state when dialog closes without selection
- Update CategoryCourseDialog rendering:
  - Move it outside the course selection block
  - Conditionally render based on `selectedCategory` existence
  - Pass dynamic `categoryName` based on selected category from `courseCategories`
- Remove the `courses` query and `selectedCourse`/`selectedCourseName` variables (no longer needed)

### Step 2: Validate Component Structure

- Ensure TournamentCourseExplorer matches CategoryExplorer pattern:
  - Same "What Would You Like to Know?" header
  - Same grid layout for category cards
  - Same dialog management pattern
  - Same navigation behavior after selection
- Verify all imports are correct and no unused imports remain
- Verify TypeScript types are correct for all state variables and callbacks
- Ensure mobile-first responsive design is maintained (≥44px touch targets)

### Step 3: Run Validation Commands

Execute all validation commands to ensure zero regressions.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev --once` - Deploy Convex schema and validate backend (if needed)
- `npm run dev` - Start the Next.js dev server and manually validate the chore is complete:
  - Navigate to `/tournaments/pga/2025`
  - Verify "Select a Course" button is removed
  - Verify only "What Would You Like to Know?" header and 6 category cards are visible
  - Click "Course Information" card
  - Verify CategoryCourseDialog opens with correct title
  - Select a course (e.g., "TPC Sawgrass")
  - Verify auto-redirect to `/tournaments/pga/2025/course/{courseId}/info`
  - Test all 6 category cards to ensure each opens dialog and redirects correctly
  - Test mobile viewport (≥44px touch targets maintained)
  - Test keyboard navigation (Tab, Enter, Escape)

## Notes

**Pattern Consistency**: This refactor makes the Tournament Course Explorer consistent with the Player Knowledge Hub's CategoryExplorer pattern, creating a unified UX across both features.

**Visual Consistency**: The TournamentCourseExplorer will look identical to CategoryExplorer:
- "What Would You Like to Know?" header
- Category cards grid (1/2/3 columns responsive)
- No pre-selection UI
- Dialog opens on category card click

**No Breaking Changes**: The tournament category pages (info, scorecard, conditions, winners, top-finishers, majors) require no changes. They already accept `courseId` in the URL and function correctly.

**CategoryCourseDialog Reusability**: The existing CategoryCourseDialog component is already designed for this pattern. It accepts a `categoryName` prop for dynamic dialog titles and `onCourseSelect` callback, making it perfect for category-first navigation.
