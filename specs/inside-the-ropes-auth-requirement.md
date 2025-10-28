# Chore: Add Authentication Requirement to Inside the Ropes Pages

## Chore Description

The "Inside the Ropes" section currently does NOT require authentication, unlike the Players and Tournaments pages which properly show a sign-in prompt when users are logged out. This creates an inconsistent user experience where:

- `/players` page: ✅ Shows "Please Sign In" message when unauthenticated
- `/tournaments` page: ✅ Shows "Sign In Required" message when unauthenticated
- `/inside-the-ropes` page: ❌ Shows full page content without requiring authentication
- `/inside-the-ropes/player-course-stats` page: ❌ Shows full page content without requiring authentication

We need to add authentication guards using Convex's `<Authenticated>` and `<Unauthenticated>` components to both Inside the Ropes pages to maintain consistency with the rest of the application and require users to sign in before accessing premium analytics features.

## Relevant Files

Use these files to resolve the chore:

- **`app/inside-the-ropes/page.tsx`** - Inside the Ropes hub page that needs authentication guard. Currently shows full content without requiring sign-in.

- **`app/inside-the-ropes/player-course-stats/page.tsx`** - Player Course Stats page that needs authentication guard. Currently shows full analytics without requiring sign-in.

- **`app/players/page.tsx`** - Reference implementation showing correct authentication pattern with `<Authenticated>` and `<Unauthenticated>` components wrapping the entire page content.

- **`app/tournaments/page.tsx`** - Reference implementation showing correct authentication pattern with centered sign-in prompt for unauthenticated users.

- **`components/ui/button.tsx`** - shadcn/ui Button component used in sign-in prompts.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Authentication Guard to Inside the Ropes Hub Page

Update `/app/inside-the-ropes/page.tsx` to require authentication:

- Import `Authenticated` and `Unauthenticated` components from `convex/react` at the top of the file
- Import `Button` component from `@/components/ui/button`
- Import `useRouter` hook from `next/navigation` (if not already imported)
- Wrap the entire page content (starting from the outer `<div className="min-h-screen bg-background">`) inside `<Authenticated>` component
- Add an `<Unauthenticated>` component BEFORE the `<Authenticated>` component with a centered sign-in prompt matching the pattern used in `/tournaments` page:
  - Use `min-h-screen bg-background flex items-center justify-center p-4` for the container
  - Show heading "Please Sign In"
  - Show message "You need to be signed in to access Inside the Ropes analytics."
  - Include a "Sign In" button that navigates to `/signin`
- Follow the exact component order pattern from `tournaments/page.tsx`: `<Unauthenticated>` first, then `<Authenticated>`

### Step 2: Add Authentication Guard to Player Course Stats Page

Update `/app/inside-the-ropes/player-course-stats/page.tsx` to require authentication:

- Import `Authenticated` and `Unauthenticated` components from `convex/react` at the top of the file
- Import `Button` component is already imported
- Import `useRouter` hook is already imported
- Wrap the entire page content (starting from the outer `<div className="min-h-screen bg-background">`) inside `<Authenticated>` component
- Add an `<Unauthenticated>` component BEFORE the `<Authenticated>` component with a centered sign-in prompt:
  - Use `min-h-screen bg-background flex items-center justify-center p-4` for the container
  - Show heading "Please Sign In"
  - Show message "You need to be signed in to view player course statistics."
  - Include a "Sign In" button that navigates to `/signin`
- Follow the exact component order pattern from `players/page.tsx` and `tournaments/page.tsx`

### Step 3: Validate Visual Consistency

Manually test the authentication flow:

- Log out of the application (if logged in)
- Navigate to `/inside-the-ropes` - should show "Please Sign In" centered message
- Navigate to `/inside-the-ropes/player-course-stats` - should show "Please Sign In" centered message
- Navigate to `/players` - verify it still shows "Please Sign In" message (regression check)
- Navigate to `/tournaments` - verify it still shows "Sign In Required" message (regression check)
- Click "Sign In" button on any page - should navigate to `/signin`
- Sign in with valid credentials
- Navigate to `/inside-the-ropes` - should show full hub page with feature cards
- Navigate to `/inside-the-ropes/player-course-stats` - should show full analytics page
- Verify mobile responsiveness (375px viewport) for sign-in prompts on all pages

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npm run dev` - Start the Next.js dev server and manually validate the chore is complete:
  - [ ] Log out and visit `/inside-the-ropes` → should show "Please Sign In" message
  - [ ] Log out and visit `/inside-the-ropes/player-course-stats` → should show "Please Sign In" message
  - [ ] Log out and visit `/players` → should show "Please Sign In" message (regression)
  - [ ] Log out and visit `/tournaments` → should show "Sign In Required" message (regression)
  - [ ] All sign-in buttons should navigate to `/signin`
  - [ ] After signing in, all pages should show full content
  - [ ] Test mobile viewport (375px width) for all sign-in prompts

## Notes

**Key Pattern to Follow:**

Both `players/page.tsx` and `tournaments/page.tsx` use the same structure:

```tsx
export default function PageName() {
  const router = useRouter();

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view...
            </p>
            <Button onClick={() => router.push("/signin")}>
              Sign In
            </Button>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {/* Full page content here */}
      </Authenticated>
    </>
  );
}
```

**Consistency Notes:**
- Use exact same class names for the sign-in prompt container across all pages
- Use "Please Sign In" as the heading for consistency (matches `/players`)
- Use specific messaging that describes what content requires authentication
- Always use `router.push("/signin")` for the button action
- Maintain mobile-first responsive design (p-4 padding, text sizing)
- Use `text-muted-foreground` for the description text
- Use `mb-4` spacing between elements

**No Schema Changes:**
This chore only modifies frontend authentication guards. No Convex database changes are required.

**Mobile Responsiveness:**
The sign-in prompts should work on all viewports. Use `p-4` padding on the outer container to ensure proper spacing on mobile devices.
