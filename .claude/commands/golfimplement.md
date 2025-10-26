# Implement the following plan

Follow the `Instructions` to implement the `Plan` then `Report` the completed work.

## Instructions

- Read the plan, think hard about the plan and implement the plan.
- **Before writing Convex queries**: Check DATABASE_MAP.md for correct table and index to use.
- **Follow Convex rules**: Always use .take(limit) on large tables, use .withIndex() not .filter(), avoid unbounded .collect().
- **Document**: always update readme and other relevand docs to reflect the current changes within the project
- **TypeScript strict mode**: Frontend useQuery() must have {} arg when backend function has args.
- **Mobile-first**: Design for 375px first, use 44px minimum touch targets, test responsive breakpoints.
- **Use existing patterns**: Check similar components/queries in codebase before implementing.
- **Package manager**: Use npm (not bun) for installing packages.

## GolfGod Critical Reminders

- 🚨 **Bandwidth awareness**: Never .collect() on tournamentResults (20K+ records) - always use .take(limit)
- 🚨 **Use indexes**: Always use .withIndex() for filtering, NOT .filter() - see DATABASE_MAP.md for available indexes
- 🚨 **Validate scores**: Golf scores must be 50-100 range (filter out invalid data like "21")
- ✅ **Safe to .collect()**: Only on players (200), courses (54), or by_player queries
- ✅ **Mobile-first**: Test at 375px, 768px, 1024px breakpoints

## Plan

$ARGUMENTS

## Report

- Summarize the work you've just done in a concise bullet point list.
- Note any Convex queries added and confirm they use indexes and limits.
- Report the files and total lines changed with `git diff --stat`
- List any npm packages installed.
