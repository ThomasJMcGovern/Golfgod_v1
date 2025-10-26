# Chore: Landing Page Authentication Flow Redesign

## Chore Description

Redesign the authentication flow so that when users sign in on the landing page, they remain on the landing page instead of being redirected to a separate dashboard. The landing page should have two states:

1. **Unauthenticated State**: Current public landing page with "Sign In" button and marketing content
2. **Authenticated State**: Same landing page design but with three interactive feature cards that redirect users to specific sections of the app

**Current Behavior**:
- `app/page.tsx` uses `<Unauthenticated>` component to show landing page
- `app/page.tsx` uses `<Authenticated>` component to show `<Dashboard />` component
- Users sign in → immediately redirected to dashboard at `/`

**Desired Behavior**:
- Users sign in → stay on landing page (`/`)
- Landing page header shows user menu instead of "Sign In" button
- Three feature cards (THE PLAYERS, TOURNAMENTS/TOURS, INSIDE THE ROPES) become clickable navigation cards
- Users click a feature card → redirect to respective page (`/players`, `/tournaments`, `/inside-the-ropes`)

**Key Design Decisions**:
1. **Eliminate separate Dashboard component** - Dashboard functionality is replaced by authenticated landing page state
2. **Preserve marketing content** - All landing page sections remain visible to authenticated users (shows value, builds engagement)
3. **Transform feature cards** - Change from informational cards to interactive navigation cards when authenticated
4. **Unified navigation** - Header shows UserMenu, ModeToggle, and optional "Back" button when on child pages
5. **Middleware unchanged** - No protected routes on landing page, existing auth middleware works as-is

## Relevant Files

Use these files to resolve the chore:

### Primary Files to Modify

- **`app/page.tsx`** (Lines 1-395)
  - Contains both `<Unauthenticated>` and `<Authenticated>` components
  - Currently shows full landing page when unauthenticated, `<Dashboard />` when authenticated
  - **Changes needed**: Replace `<Authenticated><Dashboard /></Authenticated>` with authenticated landing page version
  - Remove import of `Dashboard` component
  - Add conditional rendering for header (Sign In button vs UserMenu)
  - Modify FeatureCard behavior when authenticated (make clickable/interactive)

- **`components/landing/FeatureCard.tsx`** (Lines 1-56)
  - Already accepts `ctaLink` prop and uses Next.js `<Link>` component
  - **Changes needed**: Add optional `isAuthenticated` prop to change card behavior
  - When authenticated: Make entire card clickable, add hover states, show "Get Started" or "Explore" CTA
  - When unauthenticated: Keep current behavior (informational with CTA link)

- **`components/layout/UserMenu.tsx`** (Lines 1-111)
  - User dropdown menu with sign out functionality
  - **Changes needed**: None required - component already works correctly
  - **Note**: Will be used in authenticated landing page header

- **`middleware.ts`** (Lines 1-24)
  - Handles authentication routing
  - Currently redirects authenticated users from `/signin` to `/`
  - **Changes needed**: None required - middleware already supports our desired flow

### Files to Keep As-Is

- **`app/layout.tsx`** - No changes needed, handles auth provider correctly
- **`app/signin/page.tsx`** - Dedicated sign-in page, no changes needed
- **`app/players/page.tsx`** - Already has auth guards, works correctly
- **`app/tournaments/page.tsx`** - Auto-redirects to year, no changes needed
- **`app/inside-the-ropes/page.tsx`** - Destination page, no changes needed

### Files to Delete

- **`components/layout/Dashboard.tsx`** - No longer needed, functionality replaced by authenticated landing page state

### New Files

None required - all functionality can be achieved by modifying existing components.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update FeatureCard Component to Support Authenticated State

- **File**: `components/landing/FeatureCard.tsx`
- Add `isAuthenticated?: boolean` prop to `FeatureCardProps` interface
- Add `isClickable?: boolean` prop to control entire card clickability (default: `false`)
- When `isClickable={true}`:
  - Wrap entire card in `<Link>` component with `href={ctaLink}`
  - Add enhanced hover effects (`hover:scale-[1.02] transition-transform duration-200`)
  - Add cursor-pointer class
  - Remove bottom CTA link (entire card is clickable)
  - Add "→" or "Get Started" text overlay on hover
- When `isClickable={false}`:
  - Keep current behavior (card with bottom CTA link)
- Ensure mobile responsiveness maintained

### Step 2: Create Authenticated Landing Page Header Component

- **File**: `app/page.tsx`
- Extract header logic from both `<Unauthenticated>` and `<Authenticated>` sections
- Create unified header that conditionally renders:
  - **When unauthenticated**: "Sign In" button (current behavior)
  - **When authenticated**: `<UserMenu />` component
- Header structure:
  ```tsx
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-14 sm:h-16">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-primary">GolfGod</h1>
          <span className="hidden sm:inline ml-2 text-xs sm:text-sm text-muted-foreground">
            PGA Tour Analytics
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Conditional rendering based on auth state */}
          <Unauthenticated>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              Sign In
            </Button>
          </Unauthenticated>
          <Authenticated>
            <ModeToggle />
            <UserMenu />
          </Authenticated>
        </div>
      </div>
    </div>
  </header>
  ```
- Add necessary imports: `ModeToggle`, `UserMenu`

### Step 3: Redesign Authenticated Landing Page Content

- **File**: `app/page.tsx`
- Replace `<Authenticated><Dashboard /></Authenticated>` block with authenticated landing page version
- Structure:
  ```tsx
  <Authenticated>
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Shared header created in Step 2 */}

      <main className="pt-14 sm:pt-16">
        {/* Hero Section - Modified for authenticated users */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Welcome to GolfGod
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-foreground mb-6 sm:mb-8 leading-relaxed">
              What would you like to explore today?
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <StatsBar />

        {/* Three Feature Cards - NOW CLICKABLE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={User}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBgColor="bg-blue-100 dark:bg-blue-900/20"
              title="THE PLAYERS"
              description="GolfGod provides the most comprehensive overview of player history, statistics and insight providing you with an unparalleled edge, versus your colleagues and competitors, worldwide!"
              details="200+ PGA Tour players tracked"
              ctaText="Browse Players"
              ctaLink="/players"
              isClickable={true}
            />
            <FeatureCard
              icon={Trophy}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBgColor="bg-purple-100 dark:bg-purple-900/20"
              title="TOURNAMENTS / TOURS"
              description="GolfGod's tournament information history, statistics and analytics, for multiple tours, gives you the ability to uniquely assess your player picks in the most effective and intelligent way known to golf!"
              details="20,745+ tournament results from 2015-2026"
              ctaText="View Tournaments"
              ctaLink="/tournaments"
              isClickable={true}
            />
            <FeatureCard
              icon={ClipboardList}
              iconColor="text-orange-600 dark:text-orange-400"
              iconBgColor="bg-orange-100 dark:bg-orange-900/20"
              title="INSIDE THE ROPES"
              description="GolfGod provides the most comprehensive overview of player history, statistics and insight providing you with an unparalleled edge, versus your colleagues and competitors, worldwide!"
              details="54 courses analyzed with career-specific stats"
              ctaText="Try Inside the Ropes"
              ctaLink="/inside-the-ropes"
              badge="NEW"
              isClickable={true}
            />
          </div>
        </section>

        {/* Optional: Keep marketing sections visible OR show Quick Stats */}
        {/* All other landing page sections remain unchanged */}

        {/* Footer */}
        <footer className="bg-secondary/40 border-t border-border py-12">
          {/* Same footer as unauthenticated version */}
        </footer>
      </main>
    </div>
  </Authenticated>
  ```

### Step 4: Extract Shared Header Component (DRY Principle)

- **File**: `app/page.tsx`
- Since header is now used in both `<Unauthenticated>` and `<Authenticated>` sections, extract to avoid duplication
- Create inline component or move to separate file if preferred:
  ```tsx
  const LandingPageHeader = ({ dialogOpen, setDialogOpen }: {
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
  }) => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">GolfGod</h1>
            <span className="hidden sm:inline ml-2 text-xs sm:text-sm text-muted-foreground">
              PGA Tour Analytics
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Unauthenticated>
              <Button onClick={() => setDialogOpen(true)} size="sm" className="sm:size-default">
                Sign In
              </Button>
            </Unauthenticated>
            <Authenticated>
              <ModeToggle />
              <UserMenu />
            </Authenticated>
          </div>
        </div>
      </div>
    </header>
  );
  ```
- Use `<LandingPageHeader />` in both unauthenticated and authenticated sections
- Ensure state (`dialogOpen`, `setDialogOpen`) is accessible to header component

### Step 5: Remove Dashboard Import and Component

- **File**: `app/page.tsx`
- Remove line 6: `import Dashboard from "@/components/layout/Dashboard";`
- Ensure no references to `<Dashboard />` component remain
- Delete file: `components/layout/Dashboard.tsx`
- Verify no other files import Dashboard component:
  ```bash
  grep -r "Dashboard" app/ components/ --include="*.tsx" --include="*.ts"
  ```

### Step 6: Update Authenticated Landing Page Messaging

- **File**: `app/page.tsx`
- Modify hero section for authenticated users to be more action-oriented:
  - Change headline from "GolfGod" to "Welcome to GolfGod" or "Ready to explore?"
  - Change subtitle to encourage exploration: "What would you like to explore today?"
  - Remove "Get Started Free" CTA (user is already signed in)
  - Optionally add personalized greeting if user data available
- Keep all marketing sections visible (benefits, how it works, use cases, comparison)
  - **Rationale**: Reinforces value, helps users understand features, improves engagement

### Step 7: Test Mobile Responsiveness

- Verify header responsive behavior:
  - Mobile: Ensure UserMenu avatar and ModeToggle are properly sized
  - Mobile: Verify "Sign In" button doesn't overflow
  - Tablet: Check spacing between elements
- Verify FeatureCard clickable behavior on mobile:
  - Cards should be easily tappable (min 44px touch target)
  - Hover states should work with touch events
  - No layout shift when hovering/clicking
- Test on multiple screen sizes:
  - Mobile (375px, 414px)
  - Tablet (768px, 1024px)
  - Desktop (1440px, 1920px)

### Step 8: Validate Auth Flow Edge Cases

- Test unauthenticated → authenticated flow:
  - Click "Sign In" → fills form → successful auth → stays on landing page ✓
  - Verify header changes from "Sign In" button to UserMenu ✓
  - Verify feature cards become clickable ✓
- Test authenticated → unauthenticated flow:
  - Click UserMenu → "Sign Out" → user signed out → landing page shows unauthenticated state ✓
  - Verify header changes from UserMenu to "Sign In" button ✓
  - Verify feature cards revert to informational (not clickable) ✓
- Test feature card navigation:
  - Click "THE PLAYERS" card → redirects to `/players` ✓
  - Click "TOURNAMENTS/TOURS" card → redirects to `/tournaments` (auto-redirects to year) ✓
  - Click "INSIDE THE ROPES" card → redirects to `/inside-the-ropes` ✓

### Step 9: Run Validation Commands

- Execute validation commands to ensure chore is complete with zero regressions
- Verify TypeScript compilation succeeds
- Verify Next.js build succeeds
- Verify Convex functions are accessible
- Manual testing in browser on localhost:3000

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Verify Next.js build succeeds without TypeScript errors
- `npx tsc --noEmit` - Verify TypeScript type checking passes
- `npm run lint` - Verify ESLint passes with no errors
- Manual browser testing on `http://localhost:3000`:
  - Test unauthenticated landing page renders correctly
  - Test sign in flow (dialog → form → auth → stay on landing page)
  - Test authenticated landing page renders with UserMenu in header
  - Test all three feature cards are clickable and navigate correctly
  - Test sign out flow returns to unauthenticated landing page state
  - Test responsive behavior on mobile (375px), tablet (768px), desktop (1440px)

## Notes

### Key Design Principles

1. **Single Source of Truth**: Landing page (`app/page.tsx`) handles both auth states
2. **Progressive Enhancement**: Unauthenticated users see marketing, authenticated users see navigation
3. **Consistent UX**: Same visual design, different interaction patterns based on auth state
4. **Mobile-First**: All components maintain mobile responsiveness
5. **DRY Code**: Shared header component, reusable FeatureCard with conditional behavior

### Auth State Management

- Convex handles auth state via `<Authenticated>` and `<Unauthenticated>` components
- No manual state management needed - Convex provides reactive auth status
- Middleware ensures proper redirects (authenticated users can't access `/signin`)

### UX Considerations

**Why keep marketing content for authenticated users?**
- Reinforces product value and features
- Helps users discover features they haven't used
- Provides context for new features (e.g., "NEW" badge on Inside the Ropes)
- Maintains consistent brand experience
- Users who signed up but haven't explored will benefit from "How It Works" section

**Why make entire cards clickable vs just CTA link?**
- Larger touch targets (better mobile UX)
- More obvious affordance (users understand cards are interactive)
- Faster navigation (don't need to find small CTA link)
- Modern web app pattern (card-based navigation)

### Alternative Approaches Considered

**Option A: Minimal Authenticated Landing Page**
- Show only header + 3 feature cards
- Remove all marketing content
- **Rejected**: Loses opportunity to reinforce value, educate users

**Option B: Dedicated Dashboard Page**
- Keep current Dashboard component at `/dashboard`
- Landing page redirects authenticated users to `/dashboard`
- **Rejected**: Extra redirect, more complex routing, duplicate content

**Option C: Hybrid Approach**
- Landing page shows quick stats instead of marketing content when authenticated
- **Rejected**: More complex logic, loses marketing content value

### Future Enhancements

- Add user personalization (e.g., "Welcome back, John!")
- Show recently viewed players or tournaments on authenticated landing page
- Add "Quick Actions" section for authenticated users (e.g., "Continue where you left off")
- Track feature usage and highlight unused features for authenticated users
- A/B test different authenticated landing page variations

### Testing Checklist

- [ ] Unauthenticated landing page renders correctly
- [ ] Sign in dialog opens and closes properly
- [ ] Sign in/sign up flow works correctly
- [ ] After successful auth, user stays on landing page (not redirected)
- [ ] Header changes from "Sign In" button to UserMenu after auth
- [ ] All three feature cards are clickable when authenticated
- [ ] Feature cards navigate to correct pages (`/players`, `/tournaments`, `/inside-the-ropes`)
- [ ] Sign out flow works and returns to unauthenticated state
- [ ] Header changes from UserMenu back to "Sign In" button after sign out
- [ ] Feature cards revert to non-clickable informational cards after sign out
- [ ] Mobile responsiveness maintained across all breakpoints
- [ ] No TypeScript errors in build
- [ ] No ESLint warnings or errors
- [ ] Dashboard.tsx file deleted successfully
- [ ] No imports or references to Dashboard component remain

### Troubleshooting

**Issue**: Feature cards not clickable after auth
- **Solution**: Verify `isClickable` prop is set to `true` in authenticated `<FeatureCard>` components
- **Solution**: Check that `<Link>` wrapper is correctly applied in FeatureCard component

**Issue**: Header not showing UserMenu after auth
- **Solution**: Verify `<Authenticated>` component wraps UserMenu in header
- **Solution**: Check Convex auth provider is correctly set up in layout.tsx

**Issue**: Sign out doesn't return to unauthenticated state
- **Solution**: Verify `useAuthActions().signOut()` is called correctly in UserMenu
- **Solution**: Check that Convex reactive auth state updates properly

**Issue**: Mobile layout breaks
- **Solution**: Verify responsive classes maintained in header and feature cards
- **Solution**: Check that UserMenu avatar size is appropriate for mobile (h-10 w-10)
- **Solution**: Ensure ModeToggle doesn't cause header overflow on small screens
