# Next.js 16 - What's New & Breaking Changes

> Version-specific documentation for Next.js 16
> Released: October 21, 2025
> Status: Stable

## Table of Contents

1. [Quick Start](#quick-start)
2. [Major New Features](#major-new-features)
3. [Breaking Changes](#breaking-changes)
4. [Behavior Changes](#behavior-changes)
5. [Deprecations](#deprecations)
6. [Migration Guide](#migration-guide)
7. [Performance Improvements](#performance-improvements)

---

## Quick Start

### Upgrade Commands

```bash
# Automated upgrade (recommended)
npx @next/codemod@canary upgrade latest

# Manual upgrade
npm install next@latest react@latest react-dom@latest

# Start new project with Next.js 16
npx create-next-app@latest
```

### Minimum Requirements

| Requirement | Version       |
| ----------- | ------------- |
| Node.js     | 20.9.0+ (LTS) |
| TypeScript  | 5.1.0+        |
| React       | 19.2+         |
| Chrome      | 111+          |
| Edge        | 111+          |
| Firefox     | 111+          |
| Safari      | 16.4+         |

---

## Major New Features

### 1. Cache Components

**The biggest change in Next.js 16** - a complete rethinking of caching with opt-in explicit caching.

#### Philosophy Change

- **Old (Next.js 15)**: Everything cached by default (implicit)
- **New (Next.js 16)**: Nothing cached by default (explicit opt-in)

#### Enable Cache Components

```ts
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

#### "use cache" Directive

```tsx
// app/blog/page.tsx
"use cache";

export default async function BlogPage() {
  // This entire page is now cached
  const posts = await db.posts.findMany();

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### Cache Individual Components

```tsx
// components/expensive-component.tsx
"use cache";

export async function ExpensiveComponent({ userId }: { userId: string }) {
  const data = await expensiveDatabaseQuery(userId);

  return <div>{data.result}</div>;
}
```

#### Cache Functions

```tsx
"use cache";

async function getCachedUser(id: string) {
  // This function's result is cached
  return await db.users.findUnique({ where: { id } });
}

export default async function Page() {
  const user = await getCachedUser("123");
  return <div>{user.name}</div>;
}
```

#### Automatic Cache Key Generation

The compiler automatically generates cache keys based on:

- Function parameters
- Component props
- Closure variables

#### Partial Prerendering (PPR) Integration

Cache Components complete the PPR story:

```tsx
// app/product/[id]/page.tsx
import { Suspense } from "react";

("use cache"); // Page shell is cached

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1>Product {id}</h1>

      {/* Static cached content */}
      <ProductDetails id={id} />

      {/* Dynamic uncached content */}
      <Suspense fallback={<div>Loading reviews...</div>}>
        <ProductReviews id={id} />
      </Suspense>
    </div>
  );
}

("use cache");
async function ProductDetails({ id }: { id: string }) {
  // Cached
  const product = await db.products.findUnique({ where: { id } });
  return <div>{product.name}</div>;
}

async function ProductReviews({ id }: { id: string }) {
  // NOT cached - always fresh
  const reviews = await db.reviews.findMany({ where: { productId: id } });
  return <div>{reviews.length} reviews</div>;
}
```

---

### 2. New Caching APIs

#### `revalidateTag()` - Updated (Breaking Change)

Now requires a `cacheLife` profile for stale-while-revalidate behavior:

```tsx
import { revalidateTag } from "next/cache";

// ✅ NEW: Requires cacheLife profile
revalidateTag("blog-posts", "max"); // Recommended for most cases
revalidateTag("news-feed", "hours");
revalidateTag("analytics", "days");

// Or use custom revalidation time
revalidateTag("products", { revalidate: 3600 });

// ⚠️ DEPRECATED: Single argument (still works but deprecated)
revalidateTag("blog-posts");
```

**Built-in cacheLife profiles:**

- `'max'` - Long-lived content (recommended default)
- `'hours'` - Content that changes hourly
- `'days'` - Content that changes daily
- `'weeks'` - Content that changes weekly

**When to use:**

- Static content that can tolerate eventual consistency
- Blog posts, marketing pages, product catalogs
- When you want background revalidation (users see cached data immediately)

#### `updateTag()` - New (Server Actions Only)

Provides read-your-writes semantics:

```tsx
"use server";

import { updateTag } from "next/cache";

export async function updateUserProfile(userId: string, profile: Profile) {
  // Update database
  await db.users.update(userId, profile);

  // ✅ Expire cache AND immediately read fresh data
  updateTag(`user-${userId}`);

  // User sees their changes immediately
}
```

**When to use:**

- Interactive features where users expect immediate feedback
- Forms, user settings, shopping carts
- Any Server Action where consistency matters

**Differences from `revalidateTag()`:**

- `updateTag()`: Expires cache → reads fresh data → returns
- `revalidateTag()`: Marks for background revalidation → returns cached data

#### `refresh()` - New (Server Actions Only)

Refreshes uncached data only (doesn't touch cache):

```tsx
"use server";

import { refresh } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
  // Update notification
  await db.notifications.markAsRead(notificationId);

  // ✅ Refresh uncached dynamic data (like notification count in header)
  refresh();

  // Cached page shells remain fast
}
```

**When to use:**

- Refreshing dynamic data displayed elsewhere on page
- Notification counts, live metrics, status indicators
- When you want to refresh uncached data without touching cache

**Complementary to:**

- Client-side `router.refresh()`
- Use `refresh()` in Server Actions, `router.refresh()` in Client Components

---

### 3. proxy.ts (Replaces middleware.ts)

**Breaking Change**: `middleware.ts` is deprecated and replaced by `proxy.ts`

#### Why the Change?

- **Clearer naming**: "proxy" better describes network boundary behavior
- **Single runtime**: Always runs on Node.js runtime (not Edge)
- **More predictable**: Consistent execution model

#### Migration

```tsx
// OLD: middleware.ts
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/home", request.url));
}

// NEW: proxy.ts
export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/home", request.url));
}
```

**Key changes:**

1. Rename file: `middleware.ts` → `proxy.ts`
2. Rename export: `middleware` → `proxy` (default export)
3. Logic stays the same
4. Always runs on Node.js runtime

#### Example

```tsx
// app/proxy.ts
import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  // Authentication
  const token = request.cookies.get("token");

  if (!token && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Custom headers
  const response = NextResponse.next();
  response.headers.set("x-custom-header", "value");

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Note:** `middleware.ts` still works for Edge runtime use cases but is deprecated.

---

### 4. Next.js DevTools MCP

Model Context Protocol integration for AI-assisted debugging.

#### What It Provides

- **Next.js knowledge**: Routing, caching, rendering behavior
- **Unified logs**: Browser + server logs in one place
- **Automatic error access**: Stack traces without manual copying
- **Page awareness**: Contextual understanding of active route

#### Enable MCP

```bash
# Install MCP server
npm install @next/mcp

# Start with MCP enabled
next dev --mcp
```

#### Use with AI Agents

AI assistants can now:

- Diagnose build errors with full context
- Explain caching behavior
- Suggest fixes for routing issues
- Access logs without switching contexts

**Documentation**: `/docs/app/guides/mcp`

---

### 5. Enhanced Routing & Navigation

Major performance improvements with no code changes required.

#### Layout Deduplication

**Old behavior**: Page with 50 product links downloads shared layout 50 times
**New behavior**: Shared layout downloaded once

```tsx
// Automatically optimized - no changes needed
<div>
  {products.map((product) => (
    <Link key={product.id} href={`/product/${product.id}`}>
      {product.name}
    </Link>
  ))}
</div>
```

#### Incremental Prefetching

- Only prefetches parts not already in cache
- Cancels requests when link leaves viewport
- Prioritizes prefetch on hover
- Re-prefetches when data invalidated

**Trade-off**: More individual requests, but much lower total transfer size.

---

### 6. Turbopack (Stable)

Now the default bundler for all new projects.

#### Performance Gains

- **2-5× faster production builds**
- **Up to 10× faster Fast Refresh**
- **50%+ of dev sessions already using Turbopack**

#### Opt-out (if needed)

```bash
# Use webpack instead
next dev --webpack
next build --webpack
```

#### File System Caching (Beta)

Even faster startup for large apps:

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
```

---

### 7. React Compiler Support (Stable)

Automatic memoization without manual optimization.

#### Enable

```ts
// next.config.ts
const nextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

```bash
# Install plugin
npm install babel-plugin-react-compiler@latest
```

#### What It Does

- Automatically memoizes components
- Reduces unnecessary re-renders
- Zero manual code changes
- Based on React Compiler 1.0 (stable)

**Trade-off**: Longer compile times (uses Babel)

---

### 8. Logging Improvements

Better visibility into build and dev performance.

#### Development Logs

```
GET /dashboard 200 in 845ms
  ├─ Compile: 412ms (routing + compilation)
  └─ Render: 433ms (code execution + React rendering)
```

#### Build Logs

```
▲ Next.js 16 (Turbopack)
  ✓ Compiled successfully in 615ms
  ✓ Finished TypeScript in 1114ms
  ✓ Collecting page data in 208ms
  ✓ Generating static pages in 239ms
  ✓ Finalizing page optimization in 5ms
```

---

## Breaking Changes

### 1. Async Request APIs (CRITICAL)

All request APIs are now async and must be awaited.

#### `params` (Pages & Layouts)

```tsx
// ❌ OLD (Next.js 15)
export default function Page({ params }: { params: { slug: string } }) {
  return <div>{params.slug}</div>;
}

// ✅ NEW (Next.js 16)
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <div>{slug}</div>;
}
```

#### `searchParams` (Pages)

```tsx
// ❌ OLD
export default function Page({
  searchParams,
}: {
  searchParams: { query: string };
}) {
  return <div>{searchParams.query}</div>;
}

// ✅ NEW
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ query: string }>;
}) {
  const { query } = await searchParams;
  return <div>{query}</div>;
}
```

#### `cookies()`, `headers()`, `draftMode()`

```tsx
// ❌ OLD
import { cookies, headers, draftMode } from "next/headers";

export default function Page() {
  const cookieStore = cookies();
  const headersList = headers();
  const draft = draftMode();

  return <div>{cookieStore.get("session")}</div>;
}

// ✅ NEW
import { cookies, headers, draftMode } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const draft = await draftMode();

  return <div>{cookieStore.get("session")?.value}</div>;
}
```

#### Metadata `generateImageMetadata`

```tsx
// ❌ OLD
export function generateImageMetadata() {
  return [{ id: "1" }, { id: "2" }];
}

export default function Image({ id }: { id: string }) {
  return new ImageResponse(<div>{id}</div>);
}

// ✅ NEW
export function generateImageMetadata() {
  return [{ id: "1" }, { id: "2" }];
}

export default async function Image({ id }: { id: Promise<string> }) {
  const resolvedId = await id;
  return new ImageResponse(<div>{resolvedId}</div>);
}
```

---

### 2. Parallel Routes Require `default.js`

All parallel route slots now **require** explicit `default.js` files.

```
app/
├── @modal/
│   ├── login/page.tsx
│   └── default.tsx        # ✅ NOW REQUIRED
├── @sidebar/
│   ├── page.tsx
│   └── default.tsx        # ✅ NOW REQUIRED
└── layout.tsx
```

```tsx
// app/@modal/default.tsx
export default function Default() {
  return null; // or notFound()
}
```

**Build will fail** without these files.

---

### 3. `revalidateTag()` Signature Change

Now requires second argument:

```tsx
// ❌ DEPRECATED
revalidateTag("posts");

// ✅ NEW
revalidateTag("posts", "max");
revalidateTag("posts", { revalidate: 3600 });
```

---

### 4. Removed Features

#### AMP Support (Removed)

```tsx
// ❌ REMOVED - No longer supported
export const config = { amp: true };
```

All AMP APIs removed.

#### `next lint` Command (Removed)

```bash
# ❌ OLD
next lint

# ✅ NEW - Use ESLint directly
npx eslint .

# Codemod available
npx @next/codemod@canary next-lint-to-eslint-cli
```

#### Runtime Config (Removed)

```js
// ❌ REMOVED
module.exports = {
  serverRuntimeConfig: {
    mySecret: 'secret',
  },
  publicRuntimeConfig: {
    apiUrl: 'https://api.example.com',
  },
};

// ✅ NEW - Use environment variables
// .env.local
MY_SECRET=secret
NEXT_PUBLIC_API_URL=https://api.example.com
```

#### Experimental Flags (Removed/Renamed)

```js
// ❌ REMOVED
experimental: {
  ppr: true,
  dynamicIO: true,
  turbopack: {}, // Moved to top-level
}

// ✅ NEW
cacheComponents: true, // Replaces ppr + dynamicIO
turbopack: {}, // No longer experimental
```

#### Route-level PPR Export (Removed)

```tsx
// ❌ REMOVED
export const experimental_ppr = true;

// ✅ NEW - Use Cache Components
("use cache");
```

#### `unstable_rootParams()` (Removed)

```tsx
// ❌ REMOVED
import { unstable_rootParams } from "next/navigation";

// ✅ Alternative API coming in future minor version
```

---

## Behavior Changes

### 1. Turbopack is Default

```bash
# Default behavior
next dev    # Uses Turbopack
next build  # Uses Turbopack

# Opt-out if needed
next dev --webpack
next build --webpack
```

### 2. Image Optimization Defaults

```js
// NEW DEFAULTS
{
  images: {
    minimumCacheTTL: 14400, // 4 hours (was 60s)
    imageSizes: [/* 16 removed */], // 16px removed from defaults
    qualities: [75], // Only 75 (was 1-100)
    dangerouslyAllowLocalIP: false, // NEW security restriction
    maximumRedirects: 3, // Was unlimited
  }
}
```

#### Local Image Query Strings (Security)

```tsx
// ❌ ERROR - Requires configuration
<Image src="/image.jpg?v=1" alt="..." width={500} height={500} />;

// ✅ Configure allowed patterns
// next.config.js
module.exports = {
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
        search: "", // Allow query strings
      },
    ],
  },
};
```

### 3. Prefetch Cache Rewrite

Complete architectural change:

- Layout deduplication
- Incremental prefetching
- Automatic cancellation
- Re-prefetching on invalidation

**No code changes needed** - automatic optimization.

### 4. ESLint Flat Config Default

```js
// NEW DEFAULT (ESLint v9+)
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: nextPlugin.configs.recommended.rules,
  },
];

// Legacy format still works but is deprecated
```

### 5. Separate Dev/Build Directories

- `next dev` outputs to `.next/dev`
- `next build` outputs to `.next/build`
- Enables concurrent execution
- Lockfile prevents conflicts

### 6. Modern Sass API

```bash
# Upgraded to sass-loader v16
npm install sass-loader@16
```

Supports modern Sass syntax and features.

---

## Deprecations

Features deprecated (not removed yet, but will be in future):

### 1. `middleware.ts` Filename

```tsx
// ⚠️ DEPRECATED
// middleware.ts

// ✅ MIGRATE TO
// proxy.ts
export default function proxy(request: NextRequest) {
  // Same logic
}
```

### 2. `next/legacy/image`

```tsx
// ⚠️ DEPRECATED
import Image from "next/legacy/image";

// ✅ USE
import Image from "next/image";
```

### 3. `images.domains` Config

```js
// ⚠️ DEPRECATED
images: {
  domains: ['example.com'],
}

// ✅ USE
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'example.com',
    },
  ],
}
```

### 4. Single-argument `revalidateTag()`

```tsx
// ⚠️ DEPRECATED
revalidateTag("posts");

// ✅ USE
revalidateTag("posts", "max");
```

### 5. Automatic `scroll-behavior: smooth`

```html
<!-- ⚠️ REMOVED - No longer automatic -->

<!-- ✅ OPT BACK IN -->
<html data-scroll-behavior="smooth"></html>
```

---

## Migration Guide

### Step 1: Update Dependencies

```bash
npm install next@latest react@latest react-dom@latest
npm install typescript@latest @types/react@latest @types/node@latest
```

### Step 2: Run Codemod

```bash
npx @next/codemod@canary upgrade latest
```

This handles:

- Async params transformation
- Async searchParams transformation
- Async cookies/headers/draftMode transformation
- Parallel routes default.js creation
- Image configuration updates

### Step 3: Manual Updates

#### Update `revalidateTag()` Calls

```tsx
// Find all instances
// ❌ OLD
revalidateTag("posts");

// ✅ NEW
revalidateTag("posts", "max");
```

#### Rename `middleware.ts` → `proxy.ts`

```bash
mv middleware.ts proxy.ts
```

```tsx
// Update export
export default function proxy(request: NextRequest) {
  // Same logic
}
```

#### Add `default.js` to Parallel Routes

```tsx
// app/@modal/default.tsx
export default function Default() {
  return null;
}
```

### Step 4: Update Configuration

```ts
// next.config.ts
const nextConfig = {
  // Remove deprecated flags
  // experimental: {
  //   ppr: true,
  //   dynamicIO: true,
  // },

  // Add Cache Components (opt-in)
  cacheComponents: true,

  // Move turbopack to top-level
  turbopack: {
    // Options
  },

  // Update image config
  images: {
    // Replace domains with remotePatterns
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;
```

### Step 5: Enable Cache Components (Optional)

```ts
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};
```

Then add `'use cache'` directives:

```tsx
// app/blog/page.tsx
"use cache";

export default async function BlogPage() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

### Step 6: Test Thoroughly

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Check for deprecation warnings
```

---

## Performance Improvements

### Build Performance

- **2-5× faster builds** with Turbopack
- **Up to 10× faster Fast Refresh**
- File system caching for even faster subsequent builds

### Runtime Performance

- **Smaller bundles** with automatic layout deduplication
- **Faster navigation** with incremental prefetching
- **Better caching** with explicit Cache Components

### Developer Experience

- **Better logging** with time breakdowns
- **Clearer errors** with improved formatting
- **Faster TypeScript** with parallel processing
- **AI debugging** with MCP integration

---

## Testing Your Migration

### Checklist

- [ ] All `params` are awaited
- [ ] All `searchParams` are awaited
- [ ] All `cookies()`, `headers()`, `draftMode()` are awaited
- [ ] All parallel routes have `default.js`
- [ ] All `revalidateTag()` calls have second argument
- [ ] `middleware.ts` renamed to `proxy.ts`
- [ ] Image configuration updated
- [ ] Environment variables replace runtime config
- [ ] Build succeeds without errors
- [ ] Development server runs without warnings
- [ ] Production build tested

### Common Issues

#### 1. Type Errors on Params

```tsx
// ❌ Error: Property 'slug' does not exist
const { slug } = params;

// ✅ Fix: Await params
const { slug } = await params;
```

#### 2. Parallel Routes Build Failure

```
Error: Missing default.js for parallel route @modal
```

```tsx
// ✅ Fix: Add default.js
// app/@modal/default.tsx
export default function Default() {
  return null;
}
```

#### 3. RevalidateTag TypeScript Error

```tsx
// ❌ Error: Expected 2 arguments
revalidateTag("posts");

// ✅ Fix: Add cacheLife profile
revalidateTag("posts", "max");
```

---

## Resources

- **Release Blog**: https://nextjs.org/blog/next-16
- **Upgrade Guide**: https://nextjs.org/docs/guides/upgrading/version-16
- **Cache Components Docs**: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents
- **MCP Guide**: https://nextjs.org/docs/app/guides/mcp
- **Codemod Tool**: `npx @next/codemod@canary upgrade latest`
- **Community Discord**: https://discord.com/invite/bUG2bvbtHy
- **GitHub Discussions**: https://github.com/vercel/next.js/discussions

---

## Key Takeaways

### 🎯 Most Important Changes

1. **Cache Components** - Complete rethinking of caching (opt-in, explicit)
2. **Async APIs** - All request APIs now async (params, searchParams, cookies, headers)
3. **proxy.ts** - Replaces middleware.ts
4. **Turbopack Default** - Now default bundler (2-5× faster)
5. **Enhanced Navigation** - Automatic optimization with layout deduplication

### ⚠️ Breaking Changes to Fix

1. Await all `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()`
2. Add `default.js` to all parallel routes
3. Add second argument to `revalidateTag()`
4. Rename `middleware.ts` to `proxy.ts`
5. Update image configuration for security

### 🚀 Optional Enhancements

1. Enable Cache Components with `'use cache'`
2. Enable Turbopack file system caching
3. Enable React Compiler
4. Try Next.js DevTools MCP for AI debugging

---

## Example: Complete Migration

```tsx
// ❌ BEFORE (Next.js 15)
// middleware.ts
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// app/blog/[slug]/page.tsx
export default function BlogPost({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { ref: string };
}) {
  const cookieStore = cookies();
  return <div>{params.slug}</div>;
}

// Server Action
export async function updatePost(slug: string) {
  await db.posts.update(slug);
  revalidateTag("posts");
}
```

```tsx
// ✅ AFTER (Next.js 16)
// proxy.ts
export default function proxy(request: NextRequest) {
  return NextResponse.next();
}

// app/blog/[slug]/page.tsx
("use cache"); // NEW: Explicit caching

export default async function BlogPost({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref: string }>;
}) {
  const { slug } = await params;
  const { ref } = await searchParams;
  const cookieStore = await cookies();

  return <div>{slug}</div>;
}

// Server Action
export async function updatePost(slug: string) {
  await db.posts.update(slug);
  revalidateTag("posts", "max"); // NEW: Second argument required
}
```

---

## Summary

Next.js 16 represents a major evolution with **Cache Components** as the centerpiece. The move to explicit, opt-in caching gives developers more control while maintaining Next.js's performance benefits. The breaking changes around async APIs are significant but automated tools handle most of the migration. Enable Cache Components and start using `'use cache'` to take full advantage of the new caching model.
