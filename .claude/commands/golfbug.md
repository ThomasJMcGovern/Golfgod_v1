# Bug Planning

Create a new plan in specs/\*.md to resolve the `Bug` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan use the `Relevant Files` to focus on the right files.

## Instructions

- You're writing a plan to resolve a bug, it should be thorough and precise so we fix the root cause and prevent regressions.
- Create the plan in the `specs/*.md` file. Name it appropriately based on the `Bug`.
- Use the plan format below to create the plan.
- Research the codebase to understand the bug, reproduce it, and put together a plan to fix it.
- IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to fix the bug.
- Use your reasoning model: THINK HARD about the bug, its root cause, and the steps to fix it properly.
- IMPORTANT: Be surgical with your bug fix, solve the bug at hand and don't fall off track.
- IMPORTANT: We want the minimal number of changes that will fix and address the bug.
- Don't use decorators. Keep it simple.
- If you need a new library, use `npm install` and be sure to report it in the `Notes` section of the `Plan Format`.
- **Use shadcn/ui components**: If UI bug fixes are needed, understand shadcn/ui component architecture and patterns.
- **Follow shadcn/ui debugging**: Read `ai_docs/shadcn/shadcn_component_library_bp.md` for component debugging, common pitfalls, and proper fix patterns.
- **Maintain component integrity**: When fixing bugs in shadcn/ui components, preserve CVA variants, forwardRef patterns, CSS variables, and accessibility.
- **Check common issues**: Consult `CLAUDE.md` for documented common issues and solutions before implementing fixes.
- **Convex database bugs**: If bug involves Convex queries, verify `.take(limit)` usage, index usage, and bandwidth limits per `.claude/CLAUDE.md`.
- **Database schema bugs**: Consult `DATABASE_MAP.md` to verify table relationships, indexes, and query patterns.
- **Mobile bugs**: Test fixes on mobile viewport (responsive breakpoints, 44px touch targets).
- Respect requested files in the `Relevant Files` section.
- Start your research by reading the `README.md`, `CLAUDE.md` (common issues section), and relevant documentation.

## Relevant Files

Focus on the following files:

- `README.md` - Contains the project overview and setup instructions.
- `DATABASE_MAP.md` - Single source of truth for database schema, relationships, and query patterns.
- `CLAUDE.md` - Quick reference for AI-assisted development and common issues.
- `.claude/CLAUDE.md` - Critical Convex database rules and best practices.
- `app/**` - Next.js 15 App Router pages and layouts (React 19).
- `convex/**` - Convex backend (schema, queries, mutations, auth config).
- `convex/schema.ts` - Database schema definition (9 tables).
- `convex/auth.config.ts` - Convex Auth configuration.
- `components/**` - React components (UI components, player components, layout).
- `components/ui/**` - shadcn/ui component library (button, card, form, input, label, etc.).
- `components/player/**` - Player-specific components (PlayerSelect, PlayerStats, etc.).
- `lib/utils.ts` - Utility functions including cn() for class name merging.
- `ai_docs/shadcn/shadcn_component_library_bp.md` - shadcn/ui debugging patterns and common pitfalls.
- `package.json` - Dependencies and scripts.

Ignore all other files in the codebase.

## Plan Format

```md
# Bug: <bug name>

## Bug Description

<describe the bug in detail, including symptoms and expected vs actual behavior>

## Problem Statement

<clearly define the specific problem that needs to be solved>

## Solution Statement

<describe the proposed solution approach to fix the bug>

## Steps to Reproduce

<list exact steps to reproduce the bug>

## Root Cause Analysis

<analyze and explain the root cause of the bug>

## Relevant Files

Use these files to fix the bug:

<find and list the files that are relevant to the bug describe why they are relevant in bullet points. If there are new files that need to be created to fix the bug, list them in an h3 'New Files' section.>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to fix the bug. Order matters, start with the foundational shared changes required to fix the bug then move on to the specific changes required to fix the bug. Include tests that will validate the bug is fixed with zero regressions. Your last step should be running the `Validation Commands` to validate the bug is fixed with zero regressions.>

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

<list commands you'll use to validate with 100% confidence the bug is fixed with zero regressions. every command must execute without errors so be specific about what you want to run to validate the bug is fixed with zero regressions. Include commands to reproduce the bug before and after the fix.>

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev` - Deploy Convex schema and functions (run in background)
- `npm run dev` - Start the Next.js dev server and reproduce the bug to verify it's fixed
- `npm test` - Run tests to validate the bug is fixed with zero regressions (if tests exist)

## Notes

<optionally list any additional notes or context that are relevant to the bug that will be helpful to the developer>
```

## Bug

$ARGUMENTS
