# Feature: Player Knowledge Hub ("What Would You Like to Know?")

## Feature Description

Add a comprehensive "What Would You Like to Know?" section to the authenticated player profile page (`app/players/page.tsx`) that provides quick navigation to 8 distinct categories of player information. This feature creates a mobile-first, card-based interface that links to dedicated pages for each information category:

1. Personal profile, physical stats, and background information
2. Personal family (married, kids, spouse history)
3. Family history as it relates to college or professional golf
4. Professional history and current status
5. Tour courses within 180 miles of their hometown
6. Tour courses within 180 miles of their university
7. History of injuries and recovery (if applicable)
8. Intangibles that might affect results at certain locations

Each card will be a clickable link navigating to `app/players/[playerId]/[category]/page.tsx` where the category information will be displayed. The interface will follow GolfGod's dark mode golf theme with green accents and be optimized for mobile-first interaction with touch targets ≥44px.

**Note**: This is a frontend-only implementation using placeholder/mock data. Convex backend integration will be added in a future phase.

## User Story

As a **golf analytics user**
I want to **quickly access comprehensive player information across multiple categories**
So that **I can make informed betting decisions based on personal background, family history, geographic advantages, injury history, and intangible factors**

## Problem Statement

Currently, the player profile page (`app/players/page.tsx`) only displays basic bio information (PlayerBio) and statistics (PlayerStats). Users cannot access deeper insights about:
- Player family background and personal life that may affect performance
- Geographic advantages (courses near hometown/university)
- Injury history and recovery timelines
- Intangible factors (weather preferences, pressure situations, course-specific tendencies)

This limits the platform's ability to provide comprehensive player intelligence for betting and fantasy golf decisions. While we don't have backend data yet, we need the frontend UI structure in place to demonstrate the concept and gather user feedback.

## Solution Statement

Create a visually prominent "What Would You Like to Know?" section that appears below the player bio and before the statistics. This section will feature 8 interactive cards in a responsive grid (1 column mobile, 2 columns tablet, 3 columns desktop) that link to dedicated pages for each information category. The cards will use shadcn/ui components with:
- Hover/active states optimized for both mouse and touch
- Icons from lucide-react for visual recognition
- Skeleton loading states
- Mobile-first responsive design with proper touch targets
- Golf theme colors (green accents on dark background)

## Relevant Files

### Existing Files to Modify

- **`app/players/page.tsx`** - Add PlayerKnowledgeHub component below PlayerBio
  - Currently shows PlayerBio and PlayerStats when player selected
  - Will insert <PlayerKnowledgeHub playerId={selectedPlayerId} /> between them

- **`components/player/PlayerBio.tsx`** - Reference for existing player component patterns
  - Shows how to handle playerId prop
  - Demonstrates card-based layout with golf theme
  - Pattern for component structure (will use placeholder data instead of useQuery)

### New Files

#### Components

- **`components/player/PlayerKnowledgeHub.tsx`** - Main knowledge hub component with 8 category cards
- **`components/player/KnowledgeCard.tsx`** - Reusable card component for each category

#### Pages (Dynamic Routes)

- **`app/players/[playerId]/profile/page.tsx`** - Personal profile, physical stats, background
- **`app/players/[playerId]/family/page.tsx`** - Personal family information
- **`app/players/[playerId]/family-history/page.tsx`** - Family golf history
- **`app/players/[playerId]/professional/page.tsx`** - Professional history and status
- **`app/players/[playerId]/hometown-courses/page.tsx`** - Courses within 180 miles of hometown
- **`app/players/[playerId]/university-courses/page.tsx`** - Courses within 180 miles of university
- **`app/players/[playerId]/injuries/page.tsx`** - Injury history and recovery
- **`app/players/[playerId]/intangibles/page.tsx`** - Intangible factors affecting performance

#### Layouts

- **`app/players/[playerId]/layout.tsx`** - Shared layout for player detail pages with breadcrumbs and player context

## shadcn/ui Components

### Existing Components to Use

- **`components/ui/card.tsx`** - Card, CardHeader, CardTitle, CardDescription, CardContent
- **`components/ui/button.tsx`** - Button with variants (default, ghost, outline)
- **`components/ui/skeleton.tsx`** - Skeleton loading states
- **`components/ui/breadcrumb.tsx`** - Navigation breadcrumbs in player detail pages
- **`components/ui/badge.tsx`** - Status indicators (Active, Injured, etc.)
- **`components/ui/separator.tsx`** - Visual separators between sections
- **`components/ui/scroll-area.tsx`** - Scrollable content areas

### New Components to Add

```bash
npx shadcn@latest add hover-card
```
- **hover-card** - For desktop hover previews of category content

### Custom Components to Create

- **`KnowledgeCard`** - Custom card component following shadcn/ui patterns
  - Uses CVA for variants (default, active, disabled)
  - Implements React.forwardRef for proper DOM ref handling
  - Uses CSS variables for theming (golf green accents)
  - Uses cn() utility for class merging
  - Follows mobile-first responsive patterns from `ai_docs/mobilefirst.md`

## Implementation Plan

### Phase 1: Foundation

**Goal**: Set up component structure, routing, and basic UI shell

1. Create `PlayerKnowledgeHub.tsx` component with 8 category cards
2. Create `KnowledgeCard.tsx` reusable component with mobile-first design
3. Add hover-card shadcn/ui component for desktop previews
4. Create dynamic route structure `app/players/[playerId]/[category]/page.tsx`
5. Create shared layout `app/players/[playerId]/layout.tsx` with breadcrumbs

### Phase 2: Core Implementation

**Goal**: Wire up navigation, add placeholder data, implement each category page

1. Integrate PlayerKnowledgeHub into `app/players/page.tsx`
2. Implement routing and navigation between category pages
3. Create mock/placeholder data utilities for each data category
4. Build out each of the 8 category pages with placeholder content
5. Add breadcrumb navigation and back-to-player functionality

### Phase 3: Integration

**Goal**: Polish UX, add loading states, ensure mobile responsiveness

1. Add skeleton loading states to all components
2. Implement error boundaries and empty states
3. Test mobile responsiveness (touch targets ≥44px, responsive breakpoints)
4. Add transitions and animations for smooth UX
5. Ensure dark mode golf theme consistency

## Step by Step Tasks

### 1. Create KnowledgeCard Component

- Create `components/player/KnowledgeCard.tsx` with CVA variants
- Implement mobile-first responsive design (min 44px touch targets)
- Add hover/active states using `@media (hover: hover)` for desktop
- Use lucide-react icons for visual recognition
- Use CSS variables for golf theme colors (`hsl(var(--primary))`)
- Implement React.forwardRef and set displayName
- Add TypeScript interface extending React.AnchorHTMLAttributes
- Test card responsiveness on mobile (375px), tablet (768px), desktop (1024px+)

### 2. Create PlayerKnowledgeHub Component

- Create `components/player/PlayerKnowledgeHub.tsx` with grid layout
- Define 8 knowledge categories with icons, titles, descriptions
- Use responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Map categories to KnowledgeCard components with Next.js Link
- Add section heading "What Would You Like to Know?"
- Implement loading state with Skeleton components
- Add empty state for when playerId is null/undefined

### 3. Add PlayerKnowledgeHub to Players Page

- Import PlayerKnowledgeHub in `app/players/page.tsx`
- Insert component between PlayerBio and PlayerStats
- Pass selectedPlayerId as prop
- Test integration with existing layout
- Verify mobile menu, sidebar, and responsive behavior unchanged

### 4. Create Dynamic Route Layout

- Create `app/players/[playerId]/layout.tsx`
- Use placeholder player data (mock player name based on playerId)
- Add breadcrumb navigation: Home > Players > [Player Name] > [Category]
- Include back button to return to main player page
- Add player context (placeholder avatar, name, country flag)
- Implement mobile header with hamburger menu
- Use consistent header/footer with main players page

### 5. Create Profile Page

- Create `app/players/[playerId]/profile/page.tsx`
- Use placeholder data for player profile
- Display personal profile (birthDate, birthPlace, college, height, weight)
- Show physical stats in structured card layout
- Add background information section
- Implement mobile-first responsive grid
- Add "Data coming soon" message with styled placeholder content

### 6. Create Family Page

- Create `app/players/[playerId]/family/page.tsx`
- Use placeholder family data structure
- Display family information (marital status, children, spouse)
- Show spouse history section with placeholder content
- Use Card components for organization
- Show "Data coming soon" message with example layout

### 7. Create Family History Page

- Create `app/players/[playerId]/family-history/page.tsx`
- Use placeholder family golf history data
- Display family members who played college/professional golf
- Show timeline of family golf achievements
- Use Badge components for status indicators
- Show "Data coming soon" with example family member cards

### 8. Create Professional Page

- Create `app/players/[playerId]/professional/page.tsx`
- Use placeholder professional history data
- Display professional status (PGA Tour member, Korn Ferry, etc.)
- Show career timeline and achievements with placeholder years
- Include current tour status section
- Use tabs for different career phases
- Add statistics cards with placeholder numbers

### 9. Create Hometown Courses Page

- Create `app/players/[playerId]/hometown-courses/page.tsx`
- Use placeholder course data (3-5 example courses)
- Display course list with placeholder distances and locations
- Show placeholder tournament history
- Show placeholder performance stats
- Use Table component for course list
- Add "Map coming soon" placeholder for visualization

### 10. Create University Courses Page

- Create `app/players/[playerId]/university-courses/page.tsx`
- Use placeholder course data (3-5 example courses)
- Display course list with placeholder distances
- Show placeholder tournament history
- Show placeholder college performance section
- Use Table component for course list

### 11. Create Injuries Page

- Create `app/players/[playerId]/injuries/page.tsx`
- Use placeholder injury data (1-2 example injuries)
- Display injury timeline with placeholder dates
- Show injury type, affected area, recovery timeline
- Use Badge for status (Active, Recovering, Recovered)
- Show "Data coming soon" with example injury cards

### 12. Create Intangibles Page

- Create `app/players/[playerId]/intangibles/page.tsx`
- Use placeholder intangibles data
- Display intangible factors (weather preferences, course types, pressure)
- Show performance patterns with placeholder stats
- Use placeholder data visualization
- Show "Data coming soon" with example factor cards

### 13. Add Hover Card Component

- Run `npx shadcn@latest add hover-card`
- Wrap KnowledgeCard components with HoverCard on desktop
- Show preview of category content on hover (desktop only)
- Use `@media (hover: hover)` to disable on touch devices
- Add brief category description in hover content

### 14. Create Placeholder Data Utilities

- Create `lib/placeholder-data.ts` with mock data generators
- Add placeholder data for all 8 categories
- Create type definitions for placeholder data structures
- Add helper functions to generate consistent placeholder data

### 15. Add Loading and Error States

- Implement Skeleton loading for all pages
- Add error boundaries for data fetching failures
- Create consistent empty states across all category pages
- Add retry logic for failed queries
- Use Alert component for error messages

### 16. Mobile Responsiveness Testing

- Test all pages on mobile viewport (375px - iPhone SE)
- Verify touch targets are ≥44px on all interactive elements
- Test responsive grid breakpoints (sm: 640px, md: 768px, lg: 1024px)
- Verify horizontal scroll behavior on tables
- Test with virtual keyboard open (viewport height changes)
- Test in portrait and landscape orientations

### 17. Dark Mode Theme Consistency

- Verify golf green accent color usage (`hsl(142, 76%, 36%)`)
- Test all pages in dark mode
- Ensure proper contrast ratios for accessibility
- Use CSS variables for consistent theming
- Test card backgrounds and borders in dark mode

### 18. Run Validation Commands

- Execute all validation commands to ensure zero regressions
- Fix any TypeScript errors
- Fix any build errors
- Test end-to-end user flows
- Verify mobile and desktop experiences

## Testing Strategy

### Unit Tests

- Test KnowledgeCard component renders correctly
- Test KnowledgeCard variants (default, active, disabled)
- Test KnowledgeCard click handlers and navigation
- Test PlayerKnowledgeHub grid layout
- Test category data mapping logic

### Integration Tests

- Test navigation from player page to category pages
- Test breadcrumb navigation back to player page
- Test data fetching with Convex queries
- Test loading states and error boundaries
- Test responsive breakpoints

### Edge Cases

- Player with no data in specific categories (empty states)
- Player with incomplete profile (missing birthPlace, college)
- Geographic calculation errors (invalid coordinates)
- Network timeout during data fetching
- Very long player names or descriptions
- Players with no hometown or university data
- Touch vs. mouse event handling

## Acceptance Criteria

1. ✅ PlayerKnowledgeHub component displays 8 category cards in responsive grid
2. ✅ Cards are ≥44px touch targets on mobile devices
3. ✅ Clicking a card navigates to the correct player detail page
4. ✅ All 8 category pages render with proper layout and breadcrumbs
5. ✅ Breadcrumbs allow navigation back to main player page
6. ✅ Loading states display skeleton UI before data loads
7. ✅ Empty states display when no data is available for a category
8. ✅ Error boundaries catch and display data fetching errors
9. ✅ Mobile responsive design works on 375px viewport
10. ✅ Tablet responsive design works on 768px viewport
11. ✅ Desktop responsive design works on 1024px+ viewport
12. ✅ Dark mode golf theme is consistent across all pages
13. ✅ Green accent colors (`hsl(142, 76%, 36%)`) used appropriately
14. ✅ Hover states work on desktop (`:hover` media query)
15. ✅ Active states work on mobile (`:active` for touch)
16. ✅ TypeScript builds without errors
17. ✅ Convex schema deploys successfully
18. ✅ All pages load without console errors
19. ✅ Navigation flows work end-to-end
20. ✅ Component structure follows shadcn/ui patterns (CVA, forwardRef, CSS variables)

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually test the feature end-to-end
- Navigate to `/players` page while authenticated
- Select a player from dropdown
- Verify "What Would You Like to Know?" section appears
- Click each of the 8 category cards and verify correct page loads
- Test breadcrumb navigation back to player page
- Test mobile viewport (375px) - verify responsive grid and touch targets
- Test tablet viewport (768px) - verify 2-column grid
- Test desktop viewport (1024px+) - verify 3-column grid
- Test dark mode - verify golf theme colors and contrast
- Verify placeholder content displays correctly on all pages
- Verify no TypeScript errors in browser console
- Verify no React warnings in browser console

## Notes

### Backend Integration (Future Phase)

All pages currently use placeholder/mock data. Backend integration will include:

1. **Convex Schema**: Add `playerFamily`, `playerInjuries`, `playerIntangibles` tables
2. **Queries**: Create queries for each data category with proper indexes
3. **Geographic Calculations**: Implement course proximity calculations (180-mile radius)
4. **Data Population**: Manual entry → Web scraping → API integrations

### Future Enhancements

- **Geographic Visualization**: Add interactive maps showing course locations relative to hometown/university
- **Injury Analytics**: Add charts showing injury frequency, recovery times, performance impact
- **Intangibles Scoring**: Add algorithmic scoring for intangible factors (weather, pressure, course fit)
- **Data Collection**: Integrate with external APIs (ESPN, PGA Tour) for automated data collection
- **AI Insights**: Add AI-generated insights based on player data (e.g., "Performs best on links courses")
- **Comparison Tool**: Allow users to compare multiple players across categories side-by-side

### Mobile-First Considerations

- Touch targets: All interactive elements ≥44px (iOS) or ≥48px (Android)
- Responsive images: Use Next.js Image component with proper `sizes` attribute
- Font sizes: Base 16px to prevent iOS zoom on focus
- Viewport units: Use `dvh` (dynamic viewport height) instead of `vh` for mobile browsers
- Fixed positioning: Avoid on mobile (breaks with keyboard open)
- Hover states: Use `@media (hover: hover)` to disable on touch devices

### Performance Optimization

- **Code Splitting**: Use dynamic imports for heavy components
- **Image Optimization**: Use Next.js Image component with AVIF/WebP formats
- **Bundle Size**: Minimize dependencies, tree-shake unused code
- **Lazy Loading**: Implement intersection observer for below-fold content
- **Convex Optimization**: Use indexed queries, `.take(limit)` for pagination
- **Caching**: Leverage Convex's built-in caching for reactive queries

### Accessibility

- **ARIA Labels**: Add descriptive labels to all interactive elements
- **Keyboard Navigation**: Ensure all functionality accessible via keyboard
- **Focus Management**: Proper focus indicators and logical tab order
- **Screen Readers**: Test with VoiceOver (iOS) and TalkBack (Android)
- **Color Contrast**: Ensure WCAG 2.1 AA compliance (4.5:1 for text)
- **Semantic HTML**: Use proper heading hierarchy, landmarks, lists

### shadcn/ui Best Practices Applied

- **CVA Variants**: Use class-variance-authority for systematic variants
- **forwardRef**: Implement React.forwardRef for all DOM elements
- **CSS Variables**: Use HSL custom properties for theming
- **cn() Utility**: Use for conditional class merging
- **Composition**: Prefer composable components over prop-heavy monoliths
- **Type Safety**: Full TypeScript with explicit interfaces
- **Radix Primitives**: Use Radix UI for complex interactions (hover-card)
