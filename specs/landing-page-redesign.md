# Chore: Redesign Landing Page - Remove Specified Sections

## Chore Description
Simplify the landing page by removing multiple wordy sections that are cluttering the user experience. This will create a cleaner, more focused landing page that highlights the core features without overwhelming visitors with text.

**Sections to Remove:**
1. **Hero tagline** - "Join 1,000+ golf enthusiasts making smarter picks" (line 115-117)
2. **"What can GolfGod do for you?" section** - Entire section including:
   - Section title and subtitle
   - 5 benefit bullet points with checkmarks
   - "Inside the Ropes Example" card with stats
   - (lines 161-220)
3. **"How It Works" section** - Three-step process section (lines 222-225)
4. **"Who is GolfGod For?" section** - User persona cards (lines 227-261)
5. **Comparison Section** - "Old Way vs GolfGod Way" (line 264)
6. **Final CTA section** - Bottom call-to-action (lines 266-285)

**What Remains:**
- Header with Sign In button
- Hero section (title, description, CTA buttons)
- Stats Bar (200+ players, 20,745+ results, etc.)
- Three Feature Cards (Players, Tournaments, Inside the Ropes)
- Footer

## Relevant Files
Use these files to resolve the chore:

- **`app/page.tsx`** (PRIMARY)
  - Contains all landing page sections to be removed
  - Lines 115-117: Hero tagline to remove
  - Lines 161-220: "What can GolfGod do for you?" section
  - Lines 222-225: "How It Works" section
  - Lines 227-261: "Who is GolfGod For?" section
  - Line 264: ComparisonSection component
  - Lines 266-285: Final CTA section

- **`components/landing/HowItWorks.tsx`**
  - Component for "How It Works" section
  - Will no longer be imported or used after removal

- **`components/landing/UseCaseCard.tsx`**
  - Component for user persona cards
  - Will no longer be imported or used after removal

- **`components/landing/ComparisonSection.tsx`**
  - Component for "Old Way vs GolfGod Way" comparison
  - Will no longer be imported or used after removal

### New Files
None required - only removing existing code.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Remove Unused Imports
- Open `app/page.tsx`
- Remove unused component imports that will no longer be needed:
  - `HowItWorks` (line 23)
  - `ComparisonSection` (line 24)
  - `UseCaseCard` (line 25)
- Remove unused icon imports:
  - `Check` (from lucide-react)
  - `Users` (from lucide-react)
  - `TrendingUp` (from lucide-react)
  - `Heart` (from lucide-react)
- Keep imports still in use:
  - `User`, `Trophy`, `ClipboardList`, `ChevronRight` (for feature cards and CTA)
  - `StatsBar`, `FeatureCard` (still displayed)

### Step 2: Remove Hero Tagline
- Locate lines 115-117 in `app/page.tsx`
- Delete the paragraph containing "Join 1,000+ golf enthusiasts making smarter picks"
- This is the `<p>` tag after the CTA buttons in the hero section

### Step 3: Remove "See How It Works" Button
- Locate lines 105-112 in `app/page.tsx`
- Remove the "See How It Works" button (outline variant button)
- Remove the `scrollToHowItWorks` function (lines 53-55) as it's no longer needed

### Step 4: Remove "What can GolfGod do for you?" Section
- Locate lines 161-220 in `app/page.tsx`
- Delete the entire section including:
  - Section wrapper `<section className="w-full bg-secondary/30 py-16 sm:py-24">`
  - Title "What can GolfGod do for you?"
  - Subtitle about "Professional golf is unique..."
  - Grid with benefits list (5 checkmark items)
  - "Inside the Ropes Example" stats card

### Step 5: Remove "How It Works" Section
- Locate lines 222-225 in `app/page.tsx`
- Delete the entire div containing `<HowItWorks />` component
- Remove the `id="how-it-works"` anchor as well

### Step 6: Remove "Who is GolfGod For?" Section
- Locate lines 227-261 in `app/page.tsx`
- Delete the entire section including:
  - Section wrapper
  - Title "Who is GolfGod For?"
  - Subtitle "Whether you're competing or just having fun"
  - Grid of 3 `UseCaseCard` components (Fantasy League, Bettors, Enthusiasts)

### Step 7: Remove Comparison Section
- Locate line 264 in `app/page.tsx`
- Delete the `<ComparisonSection />` component

### Step 8: Remove Final CTA Section
- Locate lines 266-285 in `app/page.tsx`
- Delete the entire final CTA section including:
  - Section wrapper
  - Heading "Whether you're serious about making money..."
  - "Start Making Smarter Picks" button
  - "No credit card required" text

### Step 9: Verify Clean Code Structure
- Ensure proper JSX structure after deletions (no broken tags)
- Verify remaining sections flow correctly:
  - Header → Hero → StatsBar → Feature Cards → Footer
- Check indentation and formatting is consistent

### Step 10: Run Validation Commands
Execute all validation commands to ensure zero regressions.

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Ensure Next.js builds successfully with no TypeScript errors
- `npm run lint` - Verify no ESLint errors introduced
- **Manual Validation:**
  - [ ] Start dev server (`npm run dev`) and visit `http://localhost:3000`
  - [ ] Verify landing page displays: Header, Hero, StatsBar, 3 Feature Cards, Footer
  - [ ] Verify removed sections are gone: tagline, benefits, how it works, use cases, comparison, final CTA
  - [ ] Click "Get Started Free" button - dialog opens correctly
  - [ ] Click "Sign In" button - dialog opens correctly
  - [ ] Verify no console errors in browser
  - [ ] Test responsive design on mobile (375px), tablet (768px), desktop (1920px)

## Notes
- **Keep these sections**: Header, Hero (title + description + Get Started button), StatsBar, 3 Feature Cards, Footer
- **Remove all others**: Makes landing page cleaner and more focused
- **Unused components remain**: HowItWorks.tsx, UseCaseCard.tsx, ComparisonSection.tsx files stay in repo but aren't imported/used
- **No breaking changes**: All removed sections are self-contained, no dependencies on other pages
- **Responsive design preserved**: Remaining sections already have proper responsive classes
