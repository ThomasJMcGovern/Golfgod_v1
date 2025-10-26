# Install & Prime

## Read and Execute
.claude/commands/prime.md

## Run
- `npm install` - Install all dependencies for Next.js frontend and Convex backend
- `npx convex dev` - Initialize Convex (first time setup, creates .env.local with NEXT_PUBLIC_CONVEX_URL)
- Verify `.env.local` exists with `NEXT_PUBLIC_CONVEX_URL` set to your Convex deployment URL

## Verify
- Check that `node_modules/` directory was created
- Check that `.env.local` contains `NEXT_PUBLIC_CONVEX_URL`
- Check that Convex dashboard is accessible
- Verify Next.js and Convex configurations are valid

## Report
Output the work you've just done in a concise bullet point list, including:
- Dependencies installed
- Convex initialization status
- Environment variables configured
- Any issues encountered