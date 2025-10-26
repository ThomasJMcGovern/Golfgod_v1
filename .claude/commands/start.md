# Start Development Servers

## Run
`npm run dev` - Starts both Next.js frontend (localhost:3000) and Convex backend concurrently via npm-run-all

## Alternative (Separate Terminals)
If you prefer to run servers in separate terminals for better log visibility:
- Terminal 1: `npm run dev:frontend` - Next.js on localhost:3000
- Terminal 2: `npx convex dev` - Convex backend with live sync

## Verify
- Next.js frontend accessible at http://localhost:3000
- Convex dashboard shows "Connected" status
- No TypeScript errors in terminal output
- Hot reload working for both frontend and backend changes

## Report
Confirm both servers are running successfully