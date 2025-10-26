# Clerk Authentication + Convex Database Integration Guide

## Complete Setup for Next.js 16 App Router + Clerk + Convex

This guide provides **production-ready** code for integrating Clerk authentication with Convex database in a Next.js App Router application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Setup](#environment-setup)
5. [Clerk Configuration](#clerk-configuration)
6. [Convex Configuration](#convex-configuration)
7. [Connecting Clerk + Convex](#connecting-clerk--convex)
8. [Complete File Examples](#complete-file-examples)
9. [Protected Routes](#protected-routes)
10. [Accessing User Data](#accessing-user-data)
11. [User Sync to Convex](#user-sync-to-convex)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [Production Checklist](#production-checklist)

---

## 📖 Overview

### What You'll Build

- ✅ **Clerk** for authentication (sign-in, sign-up, user management)
- ✅ **Convex** for database (real-time, type-safe backend)
- ✅ **Next.js 16** App Router for frontend
- ✅ **Automatic user sync** from Clerk to Convex
- ✅ **Protected routes** and authenticated database operations
- ✅ **Type-safe** throughout

### Architecture Flow

```
User → Clerk Auth → Next.js App → Convex Database
              ↓                         ↓
         JWT Token  →  Authenticated Queries/Mutations
```

---

## 🔧 Prerequisites

- Node.js 20.9.0 or higher
- A Clerk account (sign up at https://clerk.com)
- A Convex account (sign up at https://convex.dev)
- Next.js 16 project (or create new one)

---

## 📦 Installation

### 1. Create Next.js App (if needed)

```bash
npx create-next-app@latest my-app
cd my-app
```

Choose these options:

- ✅ TypeScript
- ✅ App Router
- ✅ Tailwind CSS (optional)

### 2. Install Dependencies

```bash
# Install Clerk
npm install @clerk/nextjs

# Install Convex
npm install convex

# Install Convex-Clerk integration
npm install convex-helpers
```

---

## 🔐 Environment Setup

### 1. Get Clerk Keys

1. Go to https://dashboard.clerk.com
2. Create a new application (or select existing)
3. Navigate to **API Keys** page
4. Copy your **Publishable Key** and **Secret Key**

### 2. Get Convex URL

```bash
# Initialize Convex (if not done yet)
npx convex dev
```

This will:

- Prompt you to create a Convex account
- Create a new project
- Generate your deployment URL

### 3. Create `.env.local`

```bash
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Convex URL
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional: Clerk Domain (for Convex auth config)
CLERK_DOMAIN=https://your-app.clerk.accounts.dev
```

⚠️ **IMPORTANT:** Replace placeholder values with your actual keys. Never commit `.env.local` to version control.

### 4. Verify `.gitignore`

Ensure your `.gitignore` includes:

```
.env*
!.env.example
```

---

## 🎨 Clerk Configuration

### 1. Create Middleware (`middleware.ts`)

Place this file in the root of your project (or inside `src/` if using that structure):

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)", // For Clerk webhooks
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

### 2. Update Root Layout (`app/layout.tsx`)

```typescript
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 3. Create Header Component (`components/Header.tsx`)

```typescript
// components/Header.tsx
"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">My App</h1>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
```

---

## 🗄️ Convex Configuration

### 1. Configure Convex for Clerk Auth (`convex/auth.config.ts`)

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_DOMAIN || "https://your-app.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

⚠️ **Replace** `https://your-app.clerk.accounts.dev` with your actual Clerk domain from the Clerk Dashboard.

### 2. Create Convex Schema (`convex/schema.ts`)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (synced from Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Example: Tasks table with user reference
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]),

  // Example: Contact form submissions
  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    userId: v.optional(v.id("users")), // Optional: link to user if authenticated
    createdAt: v.number(),
    status: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_created_at", ["createdAt"]),
});
```

---

## 🔗 Connecting Clerk + Convex

### 1. Create Convex Client Provider (`app/ConvexClientProvider.tsx`)

```typescript
// app/ConvexClientProvider.tsx
"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

### 2. Update Layout to Use Provider

Your `app/layout.tsx` should already include this from earlier:

```typescript
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 📁 Complete File Examples

### Home Page (`app/page.tsx`)

```typescript
// app/page.tsx
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { TaskList } from "@/components/TaskList";

export default function Home() {
  return (
    <>
      <Header />
      <main className="container mx-auto p-8">
        <SignedOut>
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">Welcome to My App</h1>
            <p className="text-gray-600">
              Please sign in to access your dashboard
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <h1 className="mb-8 text-3xl font-bold">Your Dashboard</h1>
          <TaskList />
        </SignedIn>
      </main>
    </>
  );
}
```

### Task List Component (`components/TaskList.tsx`)

```typescript
// components/TaskList.tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function TaskList() {
  const tasks = useQuery(api.tasks.getUserTasks);
  const createTask = useMutation(api.tasks.create);
  const toggleTask = useMutation(api.tasks.toggle);
  const deleteTask = useMutation(api.tasks.remove);

  const [newTaskText, setNewTaskText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    setIsCreating(true);
    try {
      await createTask({ text: newTaskText.trim() });
      setNewTaskText("");
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (tasks === undefined) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 rounded-lg border px-4 py-2"
          disabled={isCreating}
        />
        <button
          type="submit"
          disabled={isCreating || !newTaskText.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? "Adding..." : "Add Task"}
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks yet. Create one above!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center gap-3 rounded-lg border p-4"
            >
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => toggleTask({ id: task._id })}
                className="h-5 w-5"
              />
              <span
                className={`flex-1 ${
                  task.isCompleted ? "text-gray-400 line-through" : ""
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask({ id: task._id })}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### Convex Functions (`convex/tasks.ts`)

```typescript
// convex/tasks.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

// Get all tasks for the current user
export const getUserTasks = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Create a new task
export const create = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const taskId = await ctx.db.insert("tasks", {
      text: args.text,
      isCompleted: false,
      userId: user._id,
      createdAt: Date.now(),
    });

    return taskId;
  },
});

// Toggle task completion
export const toggle = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const task = await ctx.db.get(args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      isCompleted: !task.isCompleted,
    });
  },
});

// Delete a task
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const task = await ctx.db.get(args.id);

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
```

### User Helper Functions (`convex/users.ts`)

```typescript
// convex/users.ts
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper: Get current user or throw error
export async function getCurrentUserOrThrow(
  ctx: QueryCtx | MutationCtx
): Promise<{ _id: Id<"users">; clerkId: string; email: string }> {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}

// Helper: Get current user or return null
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Find user by Clerk ID
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}

// Get or create user (called from webhook or first auth)
export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update user data if needed
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Get user profile
export const getCurrentUserProfile = query({
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});
```

---

## 🔒 Protected Routes

### Server-Side Protection (Server Components)

```typescript
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Protected Dashboard</h1>
      <p>User ID: {userId}</p>
    </div>
  );
}
```

### Client-Side Protection (Client Components)

```typescript
// components/ProtectedContent.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return null;
  }

  return <>{children}</>;
}
```

### Middleware Protection (Recommended)

Already configured in `middleware.ts` using `createRouteMatcher`:

```typescript
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

---

## 👤 Accessing User Data

### In Client Components

```typescript
"use client";

import { useUser } from "@clerk/nextjs";

export function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.firstName}!</h2>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
      <img src={user.imageUrl} alt="Profile" className="h-20 w-20 rounded-full" />
    </div>
  );
}
```

### In Server Components

```typescript
import { currentUser } from "@clerk/nextjs/server";

export default async function ServerProfile() {
  const user = await currentUser();

  if (!user) {
    return <div>Not signed in</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.firstName}!</h2>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

### In Convex Functions

```typescript
// convex/profile.ts
import { query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const getMyProfile = query({
  handler: async (ctx) => {
    // This automatically uses Clerk's JWT token
    const user = await getCurrentUserOrThrow(ctx);

    return {
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
    };
  },
});
```

---

## 🔄 User Sync to Convex

### Option 1: Automatic Sync via Clerk Webhooks (Recommended)

#### 1. Create Webhook Handler (`app/api/webhook/clerk/route.ts`)

```typescript
// app/api/webhook/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  // Get the webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await fetchMutation(api.users.getOrCreateUser, {
      clerkId: id,
      email: email_addresses[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim() || undefined,
      imageUrl: image_url || undefined,
    });
  }

  return new Response("Webhook processed", { status: 200 });
}
```

#### 2. Install Svix (for webhook verification)

```bash
npm install svix
```

#### 3. Configure Webhook in Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Navigate to **Webhooks** in the sidebar
3. Click **Add Endpoint**
4. Enter your webhook URL: `https://your-domain.com/api/webhook/clerk`
5. Subscribe to these events:
   - `user.created`
   - `user.updated`
6. Copy the **Signing Secret**
7. Add to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### Option 2: Manual Sync on First Login

Create a client-side effect that syncs user on mount:

```typescript
// components/UserSync.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (isLoaded && user) {
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || undefined,
        imageUrl: user.imageUrl || undefined,
      }).catch(console.error);
    }
  }, [isLoaded, user, syncUser]);

  return null;
}
```

Add to your layout:

```typescript
// app/layout.tsx
import { UserSync } from "@/components/UserSync";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ConvexClientProvider>
            <UserSync />
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 🧪 Testing

### 1. Start Development Servers

```bash
# Terminal 1: Start Convex
npx convex dev

# Terminal 2: Start Next.js
npm run dev
```

### 2. Test Authentication Flow

1. **Navigate to:** `http://localhost:3000`
2. **Click "Sign Up"**
3. **Create an account** with email/password
4. **Verify** you're redirected to the homepage
5. **Check** that UserButton appears in header

### 3. Verify User in Convex

1. **Open** Convex Dashboard: https://dashboard.convex.dev
2. **Navigate** to your project
3. **Open** the "users" table
4. **Verify** your user was created with correct data

### 4. Test Protected Operations

1. **Create a task** using the task form
2. **Check** Convex Dashboard → "tasks" table
3. **Verify** task has correct `userId`
4. **Toggle** task completion
5. **Delete** a task
6. **All operations** should work seamlessly

### 5. Test Sign Out

1. **Click** UserButton
2. **Select** "Sign Out"
3. **Verify** you're signed out
4. **Try** to access protected routes → should redirect

---

## 🐛 Troubleshooting

### Issue: "Missing Publishable Key"

**Error:**

```
Clerk: Missing publishable key
```

**Solution:**

1. Check `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. Restart dev server after adding env vars
3. Verify key starts with `pk_test_` or `pk_live_`

---

### Issue: "Convex auth is not configured"

**Error:**

```
Uncaught Error: Convex auth is not configured
```

**Solution:**

1. Verify `convex/auth.config.ts` exists
2. Check `CLERK_DOMAIN` in `.env.local`
3. Run `npx convex dev` to deploy changes
4. Restart Next.js dev server

---

### Issue: "User not authenticated" in Convex

**Error:**

```
Error: User not authenticated
```

**Solution:**

1. Verify user is signed in (check UserButton appears)
2. Check `ConvexProviderWithClerk` is in layout
3. Verify `useAuth` is passed correctly
4. Clear browser cookies and sign in again
5. Check Clerk Dashboard → JWT Templates → "Convex" template exists

---

### Issue: Webhook not receiving events

**Symptoms:**

- User created in Clerk but not in Convex

**Solution:**

1. Verify webhook endpoint is accessible (not localhost)
2. Use tools like `ngrok` for local testing:
   ```bash
   ngrok http 3000
   ```
3. Update Clerk webhook URL to ngrok URL
4. Check webhook logs in Clerk Dashboard
5. Verify `CLERK_WEBHOOK_SECRET` is correct

---

### Issue: "Cannot read properties of undefined (reading 'useAuth')"

**Error:**

```
TypeError: Cannot read properties of undefined (reading 'useAuth')
```

**Solution:**

1. Verify import: `import { useAuth } from "@clerk/nextjs"`
2. Check `ConvexClientProvider.tsx` uses correct import
3. Ensure ClerkProvider wraps ConvexClientProvider
4. Clear `.next` cache and restart

---

### Issue: Environment variables not loading

**Solution:**

1. Verify `.env.local` is in project root
2. Restart dev server after changes
3. Check variable names match exactly (case-sensitive)
4. Ensure `NEXT_PUBLIC_` prefix for client-side vars
5. Never use `.env` for Next.js (use `.env.local`)

---

## ✅ Production Checklist

### Before Deploying

- [ ] Switch to production Clerk keys (`pk_live_`, `sk_live_`)
- [ ] Update `CLERK_DOMAIN` to production domain
- [ ] Deploy Convex to production: `npx convex deploy`
- [ ] Update `NEXT_PUBLIC_CONVEX_URL` to production URL
- [ ] Set up Clerk webhooks with production URL
- [ ] Add `CLERK_WEBHOOK_SECRET` to production env
- [ ] Test authentication flow in production
- [ ] Verify protected routes work
- [ ] Test database operations
- [ ] Monitor Clerk Dashboard for errors
- [ ] Monitor Convex Dashboard for errors

### Environment Variables (Production)

```bash
# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PROD_KEY
CLERK_SECRET_KEY=sk_live_YOUR_PROD_KEY
CLERK_DOMAIN=https://your-app.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_YOUR_PROD_WEBHOOK_SECRET

# Convex (Production)
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
```

### Security Best Practices

1. **Never commit** `.env.local` to git
2. **Use environment variables** for all secrets
3. **Rotate keys** regularly
4. **Enable** Clerk's bot protection
5. **Set up** Convex Row-Level Security (RLS) if needed
6. **Monitor** authentication logs
7. **Implement** rate limiting for API routes
8. **Use HTTPS** in production
9. **Enable** Clerk's attack protection features
10. **Regularly update** dependencies

---

## 📚 Additional Resources

### Official Documentation

- **Clerk Docs:** https://clerk.com/docs
- **Convex Docs:** https://docs.convex.dev
- **Next.js Docs:** https://nextjs.org/docs
- **Clerk + Convex Guide:** https://docs.convex.dev/auth/clerk

### Example Repositories

- **Clerk Next.js Examples:** https://github.com/clerk/clerk-nextjs-examples
- **Convex Examples:** https://github.com/get-convex/convex-demos

### Community & Support

- **Clerk Discord:** https://clerk.com/discord
- **Convex Discord:** https://convex.dev/community
- **Stack Overflow:** Use tags `clerk`, `convex`, `next.js`

---

## 🎯 Summary

You now have a complete, production-ready setup with:

✅ **Clerk** authentication with sign-in/sign-up  
✅ **Convex** real-time database  
✅ **Automatic user sync** from Clerk to Convex  
✅ **Protected routes** via middleware  
✅ **Type-safe** database operations  
✅ **Authenticated queries/mutations**  
✅ **User profile management**  
✅ **Ready for production** deployment

### Quick Start Commands

```bash
# 1. Install dependencies
npm install @clerk/nextjs convex convex-helpers svix

# 2. Set up environment variables in .env.local
# (Copy from Environment Setup section)

# 3. Start Convex
npx convex dev

# 4. Start Next.js
npm run dev

# 5. Visit http://localhost:3000 and sign up!
```

---

**Last Updated:** October 23, 2025  
**Tested with:**

- Next.js 16.0.0
- @clerk/nextjs (latest)
- Convex (latest)
- Node.js 20.9.0+
