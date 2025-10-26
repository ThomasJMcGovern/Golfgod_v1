# Feature Planning

Create a new plan in specs/\*.md to implement the `Feature` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan use the `Relevant Files` to focus on the right files.

## Instructions

- You're writing a plan to implement a net new feature that will add value to the application.
- Create the plan in the `specs/*.md` file. Name it appropriately based on the `Feature`.
- Use the `Plan Format` below to create the plan.
- Research the codebase to understand existing patterns, architecture, and conventions before planning the feature.
- IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to implement the feature successfully.
- Use your reasoning model: THINK HARD about the feature requirements, design, and implementation approach.
- Follow existing patterns and conventions in the codebase. Don't reinvent the wheel.
- Design for extensibility and maintainability.
- If you need a new library, use `npm install` and be sure to report it in the `Notes` section of the `Plan Format`.
- **Use shadcn/ui components**: Always use existing shadcn/ui components from `components/ui/` before creating custom UI elements.
- **Follow shadcn/ui best practices**: Read `ai_docs/shadcn/shadcn_component_library_bp.md` for component creation, styling, customization, and maintenance patterns.
- **Add new shadcn/ui components**: Use `npx shadcn@latest add <component>` to add new components (they are copied to your codebase, not installed as dependencies).
- **Component architecture**: Use CVA for variants, React.forwardRef for DOM elements, CSS variables for theming, and the cn() utility for class merging.
- **Convex database rules**: ALWAYS use `.take(limit)` not unbounded `.collect()` on large tables. Use indexes (`.withIndex()`) not `.filter()`. See `.claude/CLAUDE.md` for critical database rules.
- **Database schema**: Consult `DATABASE_MAP.md` for schema, relationships, indexes, and query patterns before writing Convex queries.
- **Mobile-first design**: All features must work on mobile (responsive breakpoints: sm/md/lg, min 44px touch targets).
- **Dark mode golf theme**: Use existing color scheme with golf green accents (`hsl(142, 76%, 36%)`).
- **Reuse existing components**: Check `components/player/` and `components/ui/` for existing components before creating new ones (e.g., SearchableSelect, PlayerStats).
- Respect requested files in the `Relevant Files` section.
- Start your research by reading the `README.md`, `DATABASE_MAP.md`, and `CLAUDE.md` files.

## Relevant Files

Focus on the following files:

- `README.md` - Contains the project overview and setup instructions.
- `DATABASE_MAP.md` - Single source of truth for database schema, relationships, and query patterns.
- `CLAUDE.md` - Quick reference for AI-assisted development.
- `.claude/CLAUDE.md` - Critical Convex database rules and best practices.
- `app/**` - Next.js 15 App Router pages and layouts (React 19).
- `convex/**` - Convex backend (schema, queries, mutations, auth config).
- `convex/schema.ts` - Database schema definition (9 tables).
- `convex/auth.config.ts` - Convex Auth configuration.
- `components/**` - React components (UI components, player components, layout).
- `components/ui/**` - shadcn/ui component library (button, card, form, input, label, etc.).
- `components/player/**` - Player-specific components (PlayerSelect, PlayerStats, etc.).
- `lib/utils.ts` - Utility functions including cn() for class name merging.
- `ai_docs/shadcn/shadcn_component_library_bp.md` - shadcn/ui best practices and patterns.
- `package.json` - Dependencies and scripts.

Ignore all other files in the codebase.

## Plan Format

```md
# Feature: <feature name>

## Feature Description

<describe the feature in detail, including its purpose and value to users>

## User Story

As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Problem Statement

<clearly define the specific problem or opportunity this feature addresses>

## Solution Statement

<describe the proposed solution approach and how it solves the problem>

## Relevant Files

Use these files to implement the feature:

<find and list the files that are relevant to the feature describe why they are relevant in bullet points. If there are new files that need to be created to implement the feature, list them in an h3 'New Files' section.>

## shadcn/ui Components

### Existing Components to Use

<list which shadcn/ui components from `components/ui/` you will use (button, card, form, input, label, etc.)>

### New Components to Add

<list which shadcn/ui components need to be added via `npx shadcn@latest add <component>`. Include the exact command.>

### Custom Components to Create

<if you need custom components not available in shadcn/ui registry, list them here and note that they must follow shadcn/ui patterns from `ai_docs/shadcn/shadcn_component_library_bp.md` (CVA variants, forwardRef, CSS variables, cn() utility)>

## Implementation Plan

### Phase 1: Foundation

<describe the foundational work needed before implementing the main feature>

### Phase 2: Core Implementation

<describe the main implementation work for the feature>

### Phase 3: Integration

<describe how the feature will integrate with existing functionality>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to implement the feature. Order matters, start with the foundational shared changes required then move on to the specific implementation. Include creating tests throughout the implementation process. Your last step should be running the `Validation Commands` to validate the feature works correctly with zero regressions.>

## Testing Strategy

### Unit Tests

<describe unit tests needed for the feature>

### Integration Tests

<describe integration tests needed for the feature>

### Edge Cases

<list edge cases that need to be tested>

## Acceptance Criteria

<list specific, measurable criteria that must be met for the feature to be considered complete>

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

<list commands you'll use to validate with 100% confidence the feature is implemented correctly with zero regressions. every command must execute without errors so be specific about what you want to run to validate the feature works as expected. Include commands to test the feature end-to-end.>

- `npm run build` - Build the Next.js app to validate no TypeScript or build errors
- `npx convex dev` - Deploy Convex schema and functions (run in background)
- `npm run dev` - Start the Next.js dev server and manually test the feature end-to-end
- `npm test` - Run tests to validate the feature works with zero regressions (if tests exist)

## Notes

<optionally list any additional notes, future considerations, or context that are relevant to the feature that will be helpful to the developer>
```

## Feature

$ARGUMENTS
