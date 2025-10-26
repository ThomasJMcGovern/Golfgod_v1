# Next.js Fundamentals Guide

> Essential documentation for working with Next.js App Router
> Last Updated: October 2025

## Table of Contents

1. [Project Structure](#project-structure)
2. [Routing](#routing)
3. [Rendering Strategies](#rendering-strategies)
4. [Data Fetching](#data-fetching)
5. [Caching](#caching)
6. [Components](#components)
7. [Configuration](#configuration)
8. [API Routes](#api-routes)
9. [Image Optimization](#image-optimization)
10. [Deployment](#deployment)

---

## Project Structure

### Core Directories

```
app/                  # App Router (recommended)
├── layout.tsx       # Root layout (required)
├── page.tsx         # Home page
├── loading.tsx      # Loading UI
├── error.tsx        # Error UI
├── not-found.tsx    # 404 UI
└── [folder]/        # Route segments
    ├── page.tsx     # Route page
    └── layout.tsx   # Nested layout

public/              # Static assets
components/          # Shared React components
lib/                 # Utility functions
```

### File Conventions

- `page.tsx` - Creates a route
- `layout.tsx` - Shared UI for route segments
- `loading.tsx` - Loading UI (automatic Suspense boundary)
- `error.tsx` - Error UI (automatic Error boundary)
- `not-found.tsx` - 404 UI
- `route.ts` - API endpoint
- `template.tsx` - Re-rendered layout
- `default.tsx` - Parallel route fallback

---

## Routing

### File-based Routing

```
app/
├── page.tsx                    # /
├── about/page.tsx             # /about
├── blog/
│   ├── page.tsx               # /blog
│   └── [slug]/page.tsx        # /blog/:slug
└── dashboard/
    ├── layout.tsx
    ├── page.tsx               # /dashboard
    └── settings/page.tsx      # /dashboard/settings
```

### Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}

// Generate static params at build time
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

### Route Groups

```
app/
├── (marketing)/          # Route group (not in URL)
│   ├── about/page.tsx    # /about
│   └── contact/page.tsx  # /contact
└── (shop)/
    └── products/page.tsx # /products
```

### Parallel Routes

```
app/
├── @modal/              # Named slot
│   └── login/page.tsx
├── @sidebar/
│   └── page.tsx
├── layout.tsx           # Receives slots as props
└── default.tsx          # Required fallback
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  modal,
  sidebar,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <>
      {sidebar}
      {children}
      {modal}
    </>
  );
}
```

### Intercepting Routes

```
app/
├── feed/
│   └── (..)photo/[id]/page.tsx  # Intercepts /photo/[id]
└── photo/[id]/page.tsx           # Regular route
```

---

## Rendering Strategies

### Server Components (Default)

```tsx
// app/dashboard/page.tsx
// This is a Server Component by default
export default async function Dashboard() {
  const data = await fetch("https://api.example.com/data");
  const result = await data.json();

  return <div>{result.title}</div>;
}
```

**Benefits:**

- Direct database/API access
- Smaller bundle size
- SEO-friendly
- No client-side JavaScript

### Client Components

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

**Use when you need:**

- `useState`, `useEffect`, `useContext`
- Event listeners (`onClick`, etc.)
- Browser APIs
- Custom hooks

### Static Rendering (Default)

```tsx
// Rendered at build time
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    cache: "force-cache", // Default behavior
  });

  return <div>{data.title}</div>;
}
```

### Dynamic Rendering

```tsx
// Rendered at request time
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");

  return <div>Theme: {theme}</div>;
}
```

**Triggers:**

- Using `cookies()`, `headers()`, or `searchParams`
- Uncached data fetches
- Dynamic functions

### Incremental Static Regeneration (ISR)

```tsx
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  return <div>{data.title}</div>;
}
```

---

## Data Fetching

### Server Components (Recommended)

```tsx
// Direct async/await in components
async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`);
  return res.json();
}

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  return <article>{post.content}</article>;
}
```

### Parallel Data Fetching

```tsx
export default async function Page() {
  // Fetch in parallel
  const [posts, users] = await Promise.all([
    fetch("https://api.example.com/posts").then((r) => r.json()),
    fetch("https://api.example.com/users").then((r) => r.json()),
  ]);

  return <div>{/* Render data */}</div>;
}
```

### Sequential Data Fetching

```tsx
export default async function Page() {
  // Wait for user first
  const user = await getUser();

  // Then fetch user's posts
  const posts = await getUserPosts(user.id);

  return <div>{/* Render data */}</div>;
}
```

### Client-side Fetching

```tsx
"use client";

import { useEffect, useState } from "react";

export default function Profile() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return <div>{data.name}</div>;
}
```

---

## Caching

### Request Memoization

```tsx
// Automatic deduplication within a single request
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

// Both calls use the same cached result
export default async function Page() {
  const user1 = await getUser("1"); // Fetches
  const user2 = await getUser("1"); // Uses cache

  return <div>{user1.name}</div>;
}
```

### Data Cache

```tsx
// Force cache (default for fetch)
fetch("https://api.example.com/data", {
  cache: "force-cache",
});

// No cache
fetch("https://api.example.com/data", {
  cache: "no-store",
});

// Time-based revalidation
fetch("https://api.example.com/data", {
  next: { revalidate: 3600 }, // Seconds
});
```

### On-demand Revalidation

```tsx
import { revalidatePath, revalidateTag } from "next/cache";

// Revalidate specific path
revalidatePath("/blog");
revalidatePath("/blog/[slug]", "page");

// Revalidate by tag
revalidateTag("posts");

// In data fetch
fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});
```

### Route Segment Config

```tsx
// app/page.tsx
export const dynamic = "force-dynamic"; // 'auto' | 'force-static' | 'error'
export const revalidate = 3600; // false | 0 | number
export const fetchCache = "force-no-store"; // See docs for options
export const runtime = "nodejs"; // 'edge'
export const preferredRegion = "auto"; // 'auto' | 'all' | string[]
```

---

## Components

### Layouts

```tsx
// app/layout.tsx (Root Layout - Required)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Templates

```tsx
// app/template.tsx
// Re-renders on navigation (unlike layouts)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

### Loading UI

```tsx
// app/loading.tsx
// Automatic Suspense boundary
export default function Loading() {
  return <div>Loading...</div>;
}
```

### Error Handling

```tsx
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Not Found

```tsx
// app/not-found.tsx
export default function NotFound() {
  return <div>404 - Page not found</div>;
}

// Trigger manually
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <div>{post.title}</div>;
}
```

---

## Configuration

### next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/old-page",
        destination: "/new-page",
        permanent: true,
      },
    ];
  },

  // Rewrites
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.example.com/:path*",
      },
    ];
  },

  // Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Custom-Header",
            value: "my-value",
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: "my-value",
  },
};

module.exports = nextConfig;
```

### Environment Variables

```bash
# .env.local (not committed)
DATABASE_URL="postgres://..."
API_KEY="secret"

# .env (committed)
NEXT_PUBLIC_API_URL="https://api.example.com"
```

```tsx
// Server-side
const dbUrl = process.env.DATABASE_URL;

// Client-side (must prefix with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## API Routes

### Route Handlers

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET request
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  const users = await db.users.findMany();

  return NextResponse.json({ users });
}

// POST request
export async function POST(request: NextRequest) {
  const body = await request.json();

  const user = await db.users.create({
    data: body,
  });

  return NextResponse.json({ user }, { status: 201 });
}
```

### Dynamic Routes

```tsx
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.users.findUnique({ where: { id } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
```

### Server Actions

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  await db.posts.create({
    data: { title, content },
  });

  revalidatePath("/blog");
}
```

```tsx
// app/blog/new/page.tsx
import { createPost } from "@/app/actions";

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Image Optimization

### Next Image Component

```tsx
import Image from "next/image";

export default function Page() {
  return (
    <div>
      {/* Local image */}
      <Image
        src="/profile.jpg"
        alt="Profile"
        width={500}
        height={500}
        priority // Load immediately
      />

      {/* Remote image */}
      <Image
        src="https://example.com/photo.jpg"
        alt="Photo"
        width={800}
        height={600}
        quality={90} // 1-100
      />

      {/* Fill container */}
      <div style={{ position: "relative", width: "100%", height: "400px" }}>
        <Image
          src="/banner.jpg"
          alt="Banner"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
```

### Image Configuration

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.example.com",
      },
    ],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ["image/webp"],
  },
};
```

---

## Deployment

### Build

```bash
# Production build
npm run build

# Start production server
npm run start

# Export static site
npm run build
# Then deploy .next folder
```

### Environment Setup

```bash
# Vercel (automatic)
vercel

# Docker
FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Performance Optimization

1. Use Server Components by default
2. Implement `loading.tsx` for better UX
3. Use `generateStaticParams` for dynamic routes
4. Optimize images with `next/image`
5. Implement proper caching strategies
6. Use route segment config for fine-tuned control
7. Enable Turbopack for faster builds
8. Use parallel data fetching when possible

---

## Best Practices

### Component Organization

```
components/
├── ui/              # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── features/        # Feature-specific components
│   ├── auth/
│   └── dashboard/
└── layout/          # Layout components
    ├── header.tsx
    └── footer.tsx
```

### Data Fetching Patterns

1. **Server Components**: Default choice for data fetching
2. **Client Components**: Only when interactivity is needed
3. **Server Actions**: For mutations and form handling
4. **Route Handlers**: For API endpoints and webhooks

### Error Handling

```tsx
// Use error boundaries
// app/error.tsx for route-level errors
// app/global-error.tsx for root-level errors

// Use try-catch in Server Components
export default async function Page() {
  try {
    const data = await fetchData();
    return <div>{data}</div>;
  } catch (error) {
    console.error(error);
    return <div>Failed to load data</div>;
  }
}
```

### SEO

```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.image],
    },
  };
}
```

---

## Common Patterns

### Conditional Rendering

```tsx
export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <Dashboard user={user} />;
}
```

### Streaming with Suspense

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}

async function SlowComponent() {
  const data = await slowFetch();
  return <div>{data}</div>;
}
```

### Form Handling

```tsx
"use server";

export async function handleSubmit(formData: FormData) {
  const email = formData.get("email");

  // Validation
  if (!email) {
    return { error: "Email is required" };
  }

  // Process
  await saveEmail(email);

  // Revalidate
  revalidatePath("/newsletter");

  return { success: true };
}
```

---

## Resources

- **Official Docs**: https://nextjs.org/docs
- **Examples**: https://github.com/vercel/next.js/tree/canary/examples
- **Learn**: https://nextjs.org/learn
- **Discord**: https://discord.com/invite/bUG2bvbtHy
- **GitHub**: https://github.com/vercel/next.js
