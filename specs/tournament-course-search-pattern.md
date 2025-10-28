# Chore: Tournament Course Search - Use Player Section Search Pattern

## Chore Description

The tournament section's "What Would You Like to Know?" course search interface currently uses a basic react-select dropdown (Image #1), while the player section uses a more sophisticated command palette-style dialog with country flags (Image #2). This chore standardizes the UI pattern by creating a `CategoryCourseDialog` component that mirrors the `CategoryPlayerDialog` design, providing a better UX with location display, keyboard navigation hints, and consistent styling.

**Current State (Tournament Section)**:
- Uses `CourseSelect` component with react-select dropdown
- Basic search functionality
- Shows course name and location as subtitle
- Missing keyboard navigation hints
- Different visual pattern from player section

**Desired State**:
- Create `CategoryCourseDialog` component mirroring `CategoryPlayerDialog`
- Command palette-style modal with shadcn/ui Command component
- Display course location alongside course name
- Keyboard navigation hints (Arrow keys, Enter, Esc)
- Consistent with player section UX
- Replace `CourseSelect` usage in `TournamentCourseExplorer`

## Relevant Files

Use these files to resolve the chore:

- **`components/player/CategoryPlayerDialog.tsx`** (READ) - Reference implementation for command palette-style search dialog with flags, keyboard navigation, and mobile-responsive design. Will be used as template for course dialog.

- **`components/tournament/CourseSelect.tsx`** (READ) - Current react-select dropdown implementation showing course name and location. Will be replaced by new dialog pattern.

- **`components/tournament/TournamentCourseExplorer.tsx`** (EDIT) - Tournament page explorer component that uses CourseSelect. Will be updated to use new dialog pattern with "Select a Course" button trigger.

- **`convex/courses.ts`** (READ) - Convex queries for fetching course data. Verify `getAllCourses` query returns necessary fields (name, location, _id).

- **`lib/utils.ts`** (READ) - Utility functions including `cn()` for class name merging.

### New Files

- **`components/tournament/CategoryCourseDialog.tsx`** (CREATE) - New command palette-style dialog for course selection, based on CategoryPlayerDialog pattern.

## Step by Step Tasks

### Step 1: Review Reference Implementation

- Read `components/player/CategoryPlayerDialog.tsx` to understand:
  - Dialog structure with shadcn/ui Dialog and Command components
  - Props interface (open, onOpenChange, categoryName, onCourseSelect)
  - Player fetching with `useQuery(api.players.getAll, {})`
  - Flag emoji display using `getFlagEmoji(countryCode)`
  - Keyboard navigation hints in footer
  - Mobile-responsive sizing with `max-w-[calc(100vw-2rem)] sm:max-w-[500px]`
  - CommandItem click handling and dialog close logic

### Step 2: Create CategoryCourseDialog Component

- Create `components/tournament/CategoryCourseDialog.tsx`
- Copy base structure from `CategoryPlayerDialog.tsx`
- Update interface props:
  ```typescript
  interface CategoryCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryName: string;
    onCourseSelect: (courseId: Id<"courses">) => void;
  }
  ```
- Fetch courses using `useQuery(api.courses.getAllCourses, {})`
- Display course name as primary text and location as secondary text (muted)
- Sort courses alphabetically by name
- Include keyboard navigation hints: "Tip: Use arrow keys to navigate, Enter to select, Esc to close"
- Maintain mobile-first responsive design (min 44px touch targets)
- Use dark golf theme styling consistent with existing components

### Step 3: Update TournamentCourseExplorer Component

- Open `components/tournament/TournamentCourseExplorer.tsx`
- Add state for dialog open/close: `const [dialogOpen, setDialogOpen] = useState(false)`
- Replace CourseSelect dropdown with button trigger:
  ```typescript
  <Button
    onClick={() => setDialogOpen(true)}
    variant="outline"
    className="w-full justify-start text-left font-normal"
  >
    {selectedCourseId ? selectedCourseName : "Select a course..."}
  </Button>
  ```
- Add CategoryCourseDialog component below button:
  ```typescript
  <CategoryCourseDialog
    open={dialogOpen}
    onOpenChange={setDialogOpen}
    categoryName="Course Information"
    onCourseSelect={handleCourseSelect}
  />
  ```
- Update `handleCourseSelect` to:
  1. Set selectedCourseId
  2. Fetch and store course name for button display
  3. Close dialog by calling `setDialogOpen(false)`
- Remove CourseSelect import
- Add CategoryCourseDialog import
- Add Button import from `@/components/ui/button`

### Step 4: Verify Convex Query Compatibility

- Read `convex/courses.ts` to confirm `getAllCourses` query exists
- Verify it returns necessary fields: `_id`, `name`, `location`
- Ensure query follows Convex rules (safe to `.collect()` - courses table has ~54 records)
- No changes needed if query is correct

### Step 5: Test Component Integration

- Manually test the new dialog pattern:
  - Click "Select a course..." button opens modal dialog
  - Course list displays with name and location
  - Search filter works correctly
  - Arrow keys navigate through courses
  - Enter key selects course and closes dialog
  - Escape key closes dialog without selection
  - Selected course name appears in button text
  - Mobile viewport maintains ≥44px touch targets

### Step 6: Remove Deprecated CourseSelect Component (Optional)

- After verifying CategoryCourseDialog works correctly
- Check if CourseSelect is used elsewhere in codebase:
  ```bash
  grep -r "CourseSelect" app/ components/
  ```
- If only used in TournamentCourseExplorer (now removed), optionally delete `components/tournament/CourseSelect.tsx`
- Document decision in commit message

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev` - Deploy Convex schema and functions (run in background, verify no schema changes)
- `npm run dev` - Start the Next.js dev server and manually validate:
  - Navigate to `/tournaments/pga/2025`
  - Click "Select a course..." button
  - Dialog opens with command palette interface
  - Search filter works correctly
  - Keyboard navigation (arrows, enter, esc) works
  - Course selection updates button text
  - Category cards navigate correctly when course selected
  - Mobile responsive design works (test at 375px viewport)

## Notes

### Design Consistency

This chore establishes a **consistent UI pattern** across the application:
- Player section: CategoryPlayerDialog for player selection
- Tournament section: CategoryCourseDialog for course selection
- Both use shadcn/ui Command component for keyboard-friendly search
- Both follow mobile-first design principles (≥44px touch targets)

### CourseSelect Component Fate

The `CourseSelect` component (using react-select) will be deprecated by this change. Consider:
1. **Keep it**: If used elsewhere or may be needed for simple dropdowns
2. **Delete it**: If only used in TournamentCourseExplorer (now replaced)
3. **Document**: Add note to CLAUDE.md about preferred search pattern

### Future Enhancement Opportunities

- Add course type icons (e.g., 🏖️ Links, 🌲 Parkland, 🏟️ Stadium)
- Display course par and yardage as secondary info
- Add "Recent selections" section for frequently accessed courses
- Implement fuzzy search for better course name matching

### Accessibility Notes

- Maintains WCAG 2.1 AA compliance from CategoryPlayerDialog
- Keyboard navigation fully functional (arrows, enter, esc)
- Screen reader friendly with proper ARIA attributes
- Touch targets ≥44px for mobile usability
