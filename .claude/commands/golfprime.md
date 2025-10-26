# Prime

Run the commands under the `Execute` section to gather information about the project, and then review the files listed under `Read` to understand the project's purpose and functionality then `Report` your findings.

## Execute

- `git ls-files`
- `git log --oneline -10`

## Read

- README.md
- DATABASE_MAP.md
- CLAUDE.md
- .claude/CLAUDE.md
- convex/schema.ts

## Report

Provide a summary of your understanding of the project, including:

- **Project Purpose**: What GolfGod does (PGA Tour analytics platform)
- **Tech Stack**: Next.js 15, React 19, Convex, TypeScript, npm
- **Database Architecture**: 3-layer data model (raw/detailed/aggregated)
- **Key Features**: Inside the Ropes, player profiles, tournament data
- **Critical Rules**: Convex query patterns (indexes, .take(limit), bandwidth awareness)
- **Development Workflow**: npm commands, Convex setup
- **Recent Changes**: Summary from git log

## IMPORTANT

**DO NOT push to GitHub unless specifically prompted by the user.** Only commit changes locally when implementing features.
