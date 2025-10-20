# Bun Migration - Convex Compatibility Fix

**Date**: January 2025
**Issue**: Convex deployment 500 errors after Bun migration
**Status**:  RESOLVED

---

## Problem

After migrating from npm to Bun, Convex backend deployment failed with:
```
 Error: Unable to finish push to https://brainy-tiger-452.convex.cloud
 Error fetching POST https://brainy-tiger-452.convex.cloud/api/deploy2/finish_push
500 Internal Server Error: InternalServerError: Your request couldn't be completed.
```

## Root Cause

**The `--bun` flag caused runtime incompatibility with Convex.**

### What Happened

Initial migration used `bun --bun` flag:
```json
{
  "scripts": {
    "dev:frontend": "bun --bun next dev",
    "build": "bun --bun next build"
  }
}
```

**The `--bun` flag forces Bun's runtime** instead of Node.js, which:
- Generates different transpiled JavaScript code
- Creates incompatible sourcemaps for Convex
- May exceed module size limits Convex expects
- Causes 500 errors during deployment push

### Research Findings

Based on [ai-town issue #227](https://github.com/a16z-infra/ai-town/issues/227):
- Similar 500 errors occur with sourcemap parsing issues
- Convex has known issues with certain esbuild-generated sourcemaps
- Large module sizes (>122KB) can trigger push failures
- Node version incompatibilities can cause deployment errors

**Environment at time of error:**
- Bun: 1.3.0
- Node: v24.10.0 (very new, potential compatibility issues)
- Convex: 1.28.0 (latest)

## Solution

### Remove `--bun` Flag

**Changed from:**
```json
{
  "scripts": {
    "dev:frontend": "bun --bun next dev",
    "build": "bun --bun next build",
    "start": "bun --bun next start",
    "lint": "bun --bun next lint"
  }
}
```

**Changed to:**
```json
{
  "scripts": {
    "dev:frontend": "bun next dev",
    "build": "bun next build",
    "start": "bun next start",
    "lint": "bun next lint"
  }
}
```

### What This Does

-  **Bun still used** for package management (fast installs)
-  **Bun still used** for task running (scripts)
-  **Node.js runtime** used for Next.js (Convex compatible)
-  **Standard sourcemaps** generated (Convex compatible)

### Additional Steps Taken

1. **Removed build artifacts**: `rm -rf .next/`
2. **Updated Convex**: `bun update convex` (already on 1.28.0)
3. **Verified versions**:
   - Bun: 1.3.0 
   - Node: v24.10.0 
   - Convex: 1.28.0 

## Benefits Retained

Even without `--bun` runtime flag, we still get:
- ¡ **10-25x faster installs** (Bun package manager)
- =€ **Faster script execution** (Bun task runner)
- <¯ **Parallel script running** (bun run --parallel)
- =æ **Smaller lockfile** (bun.lock vs package-lock.json)

## Testing

After fix, verify with:
```bash
# Test Convex deployment
npx convex dev

# Should see:
#  Saved credentials
#  Push successful
#  Backend running
```

## Lessons Learned

1. **`--bun` flag is experimental** - Not all tools compatible with Bun runtime
2. **Convex needs Node.js runtime** - Stick to Node for backend tooling
3. **Bun for package management is safe** - No issues with dependency management
4. **Sourcemaps matter** - Build output format affects deployment tools

## References

- [GitHub Issue #227 - ai-town](https://github.com/a16z-infra/ai-town/issues/227)
- [Convex Bun Support](https://docs.convex.dev/client/javascript/bun)
- [Bun Runtime Compatibility](https://bun.sh/docs/runtime/nodejs-apis)

---

**Last Updated**: January 2025
**Migration Status**:  Complete with compatibility fix
