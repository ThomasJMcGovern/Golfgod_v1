# Installation Guide

This guide will walk you through setting up GolfGod on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17 or higher)
- **npm** (v9 or higher) or **yarn**
- **Git** for version control
- A **Convex** account (free tier available at [convex.dev](https://convex.dev))

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/golfgod.git
cd golfgod_x_convex
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Convex

Initialize Convex in your project:

```bash
npx convex dev
```

This command will:
- Prompt you to log in to Convex (or create an account)
- Create a new Convex project or link to an existing one
- Generate the necessary configuration files
- Start the Convex development server

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add the following environment variables:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Authentication (if using external providers)
AUTH_SECRET=your-auth-secret

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### 5. Initialize the Database Schema

The Convex schema will be automatically deployed when you run the development server. Verify the schema is correctly set up:

```bash
npx convex dev
```

Check the Convex dashboard to ensure all tables are created:
- `players`
- `playerStats`
- `tournamentResults`
- `userFollows`
- Auth tables

### 6. Start the Development Server

Run both Next.js and Convex development servers:

```bash
npm run dev
```

This starts:
- Next.js development server on `http://localhost:3000`
- Convex development sync (watches for backend changes)

### 7. Verify Installation

Open your browser and navigate to:
- `http://localhost:3000` - Should show the landing page
- `http://localhost:3000/signin` - Authentication page
- Convex Dashboard - Check your project at `dashboard.convex.dev`

## Common Installation Issues

### Issue: Convex connection failed

**Solution**: Ensure your Convex project is properly initialized:
```bash
npx convex dev --once
```

### Issue: TypeScript errors

**Solution**: Regenerate Convex types:
```bash
npx convex dev
```

### Issue: Tailwind styles not loading

**Solution**: Ensure Tailwind is properly configured:
```bash
npm run build
```

### Issue: Authentication not working

**Solution**: Check that `SITE_URL` is set correctly in your Convex dashboard environment variables.

## Project Structure

After installation, your project structure should look like:

```
golfgod_x_convex/
├── app/                  # Next.js app directory
├── components/          # React components
├── convex/             # Convex backend
│   ├── _generated/     # Auto-generated files
│   ├── schema.ts       # Database schema
│   └── *.ts           # Backend functions
├── public/            # Static assets
├── .env.local         # Environment variables
├── package.json       # Dependencies
└── next.config.ts     # Next.js configuration
```

## Next Steps

- [Quick Start Guide](./quick-start.md) - Get familiar with the application
- [Configuration](./configuration.md) - Detailed configuration options
- [Development Setup](../development/setup.md) - Set up your development environment

## Updating Dependencies

To update project dependencies:

```bash
# Update all dependencies
npm update

# Update Convex CLI
npm install convex@latest

# Update Next.js
npm install next@latest react@latest react-dom@latest

# Update Shadcn/ui components
npx shadcn@latest add [component-name]
```

## Troubleshooting

For additional help:
- Check the [Convex documentation](https://docs.convex.dev)
- Review [Next.js documentation](https://nextjs.org/docs)
- Open an issue on GitHub
- Contact support at support@golfgod.com