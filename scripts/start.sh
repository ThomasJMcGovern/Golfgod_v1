#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏌️  Starting GolfGod Development Environment...${NC}"

# Get the script's directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# Check if .env.local exists
if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
    echo -e "${YELLOW}Warning: No .env.local file found${NC}"
    echo "This is optional, but you may need it for authentication features."
    echo "Example .env.local:"
    echo "  NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud"
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down services...${NC}"

    # Kill all child processes
    jobs -p | xargs kill 2>/dev/null

    # Wait for processes to terminate
    wait

    echo -e "${GREEN}✓ Services stopped successfully.${NC}"
    exit 0
}

# Trap EXIT, INT, and TERM signals
trap cleanup EXIT INT TERM

# Start Convex backend
echo -e "${GREEN}Starting Convex backend...${NC}"
cd "$PROJECT_ROOT"
npx convex dev &
CONVEX_PID=$!

# Wait for Convex to initialize
echo "Waiting for Convex to initialize..."
sleep 5

# Check if Convex is running
if ! kill -0 $CONVEX_PID 2>/dev/null; then
    echo -e "${RED}Convex backend failed to start!${NC}"
    echo "Please check if you have run 'npx convex dev' at least once to set up."
    exit 1
fi

# Start Next.js frontend
echo -e "${GREEN}Starting Next.js frontend...${NC}"
bun --bun next dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Frontend failed to start!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Services started successfully!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Frontend:         ${NC}http://localhost:3000"
echo -e "${BLUE}Convex Dashboard: ${NC}https://dashboard.convex.dev"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services...${NC}"
echo ""

# Wait for user to press Ctrl+C
wait
