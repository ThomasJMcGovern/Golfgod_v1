#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 CONVEX DEPLOYMENT DIAGNOSTICS${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Environment
echo -e "${GREEN}📦 Environment:${NC}"
echo "  Bun: $(bun --version)"
echo "  Node: $(node --version)"
echo "  Convex CLI: $(npx convex --version)"
echo ""

# Package.json check
echo -e "${GREEN}📝 Scripts (package.json):${NC}"
grep -A 7 '"scripts"' package.json
echo ""

# Search for --bun references
echo -e "${GREEN}🔎 Searching for --bun flags:${NC}"
if grep -r "\-\-bun" package.json 2>/dev/null; then
    echo -e "${RED}  ❌ Found --bun references!${NC}"
else
    echo -e "${GREEN}  ✓ No --bun flags found${NC}"
fi
echo ""

# Convex state
echo -e "${GREEN}🗂️  Convex State:${NC}"
if [ -d ".convex" ]; then
  echo "  .convex/ exists:"
  ls -lh .convex/ | head -10
else
  echo -e "${YELLOW}  .convex/ NOT FOUND (will be created on first deploy)${NC}"
fi
echo ""

# Git status
echo -e "${GREEN}🔀 Git Status:${NC}"
git status --short
echo ""

# Check for uncommitted changes to package.json
if git diff package.json | grep -q "bun"; then
    echo -e "${YELLOW}⚠️  Uncommitted changes to package.json detected${NC}"
fi
echo ""

# Network check
echo -e "${GREEN}🌐 Network Check:${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://brainy-tiger-452.convex.cloud/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}  ❌ Cannot reach deployment${NC}"
elif [ "$HTTP_CODE" = "503" ]; then
    echo -e "${YELLOW}  ⚠️  503 Service Unavailable (AWS outage?)${NC}"
else
    echo -e "${GREEN}  ✓ Deployment reachable (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# DNS check
echo -e "${GREEN}🔍 DNS Resolution:${NC}"
nslookup brainy-tiger-452.convex.cloud 2>&1 | grep -A 2 "Name:" || echo -e "${RED}  DNS resolution failed${NC}"
echo ""

# TypeScript check
echo -e "${GREEN}📘 TypeScript (Convex):${NC}"
if npx tsc --noEmit --project convex/tsconfig.json 2>&1 | head -10; then
    echo -e "${GREEN}  ✓ TypeScript check passed${NC}"
else
    echo -e "${RED}  ❌ TypeScript errors found${NC}"
fi
echo ""

# Check build output
echo -e "${GREEN}🏗️  Build Artifacts:${NC}"
if [ -d ".next" ]; then
    NEXT_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo "  .next/ size: $NEXT_SIZE"

    # Check for large bundles
    LARGE_BUNDLES=$(find .next/static/chunks -type f -size +500k 2>/dev/null | wc -l | tr -d ' ')
    if [ "$LARGE_BUNDLES" -gt 0 ]; then
        echo -e "${YELLOW}  ⚠️  Found $LARGE_BUNDLES chunks >500KB${NC}"
    fi
else
    echo "  .next/ not found (no build yet)"
fi
echo ""

# Convex config files
echo -e "${GREEN}⚙️  Convex Configuration:${NC}"
if [ -f "convex.json" ]; then
    echo "  convex.json exists:"
    cat convex.json
else
    echo "  No convex.json (using defaults)"
fi
echo ""

if [ -f ".env.local" ]; then
    echo "  .env.local exists (contains NEXT_PUBLIC_CONVEX_URL)"
    grep "CONVEX" .env.local 2>/dev/null | sed 's/=.*/=***/' || echo "  No CONVEX vars"
else
    echo -e "${YELLOW}  ⚠️  No .env.local file${NC}"
fi
echo ""

# Check Convex schema
echo -e "${GREEN}📋 Convex Schema:${NC}"
if [ -f "convex/schema.ts" ]; then
    echo "  Schema file exists ($(wc -l < convex/schema.ts) lines)"
    echo "  Tables defined:"
    grep "defineTable" convex/schema.ts | sed 's/.*defineTable/  -/' | head -10
else
    echo -e "${RED}  ❌ convex/schema.ts not found${NC}"
fi
echo ""

# Attempt to list deployments
echo -e "${GREEN}🚀 Convex Deployments:${NC}"
npx convex deployments list 2>&1 | head -5 || echo -e "${RED}  Failed to list deployments${NC}"
echo ""

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}End of diagnostics${NC}"
echo ""
echo -e "${YELLOW}To attempt deployment with verbose logging:${NC}"
echo -e "  ${BLUE}CONVEX_VERBOSE=1 npx convex dev --once${NC}"
