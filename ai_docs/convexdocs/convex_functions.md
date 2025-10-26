# Convex Functions Reference

## Function Types

| Feature            | Query           | Mutation         | Action                        |
| ------------------ | --------------- | ---------------- | ----------------------------- |
| Database Access    | Yes (read-only) | Yes (read/write) | No (via runQuery/runMutation) |
| Transactional      | Yes             | Yes              | No                            |
| Cached             | Yes             | No               | No                            |
| Real-time Updates  | Yes             | No               | No                            |
| External API Calls | No              | No               | Yes                           |
| Automatic Retries  | Yes             | Yes              | No                            |

## Queries

**Definition:**

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { a: v.number(), b: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.query("table").collect();
  },
});
```

**Context (`ctx`):**

- `db` - Read-only database access
- `auth` - User authentication
- `storage` - File storage (read-only)

**Properties:**

- Must be deterministic
- Read-only database access
- Automatically cached
- Real-time reactive subscriptions
- Returns any Convex type

**React Usage:**

```typescript
import { useQuery } from "convex/react";
const data = useQuery(api.myFunctions.myQuery, { a: 1, b: 2 });
// Returns undefined while loading
```

**One-off Call:**

```typescript
const convex = useConvex();
const result = await convex.query(api.myFunctions.myQuery, { a: 1, b: 2 });
```

## Mutations

**Definition:**

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutation = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text });
    // Can optionally return a value or undefined
  },
});
```

**Context (`ctx`):**

- `db` - Full database read/write access
- `auth` - User authentication
- `storage` - File storage access
- `scheduler` - Schedule future functions

**Properties:**

- Transactional (all or nothing)
- Can read and write to database
- Executed sequentially from single client
- Can return value or undefined (becomes null on client)
- Automatically retried on conflicts

**React Usage:**

```typescript
import { useMutation } from "convex/react";
const mutateSomething = useMutation(api.myFunctions.myMutation);

const handleClick = () => {
  mutateSomething({ text: "Hello" });
};
```

**With Optimistic Updates:**

```typescript
const mutate = useMutation(api.myFunctions.myMutation).withOptimisticUpdate(
  (localStore, args) => {
    // Update local state immediately
  }
);
```

## Actions

**Definition:**

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const myAction = action({
  args: { a: v.number() },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.example.com");
    await ctx.runMutation(api.myFunctions.saveSomething, {});
    return "success";
  },
});
```

**Context (`ctx`):**

- `runQuery(query, args)` - Call a query
- `runMutation(mutation, args)` - Call a mutation
- `runAction(action, args)` - Call another action
- `auth` - User authentication
- `storage` - File storage access
- `scheduler` - Schedule future functions
- `vectorSearch` - Vector search

**Properties:**

- Can make external API calls (fetch)
- Not transactional
- Not automatically retried
- Parallelized per client (unlike mutations)
- Must use runQuery/runMutation for database access

**React Usage:**

```typescript
import { useAction } from "convex/react";
const doAction = useAction(api.myFunctions.myAction);

const handleClick = async () => {
  await doAction({ a: 1 });
};
```

**Node.js Runtime:**

```typescript
"use node";
import { action } from "./_generated/server";
// Can use Node.js APIs and packages
```

## Internal Functions

**Definition:**

```typescript
import {
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";

export const myInternalMutation = internalMutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, { status: "active" });
  },
});
```

**Calling Internal Functions:**

```typescript
import { internal } from "./_generated/api";

// From action
await ctx.runMutation(internal.myFunctions.myInternalMutation, { planId });

// From scheduler
await ctx.scheduler.runAfter(0, internal.myFunctions.myInternalMutation, {
  planId,
});
```

**Properties:**

- Cannot be called directly from client
- Called via `internal` object (not `api`)
- Can be scheduled or called from other functions
- Useful for privileged operations

## HTTP Actions

**Definition:**

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

export const postMessage = httpAction(async (ctx, request) => {
  const { author, body } = await request.json();
  await ctx.runMutation(internal.messages.sendOne, { body, author });
  return new Response(null, { status: 200 });
});

const http = httpRouter();
http.route({
  path: "/postMessage",
  method: "POST",
  handler: postMessage,
});
export default http;
```

**File Location:** `convex/http.ts` (exact name required)

**URL:** `https://<deployment-name>.convex.site/path`

**Context:** Same as action context (no database access)

**Properties:**

- Handles webhooks and custom HTTP requests
- No argument validation (parse from Request)
- Returns Web API Response object
- Not automatically retried
- Requires CORS headers for browser requests

**CORS Example:**

```typescript
http.route({
  path: "/endpoint",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
      },
    });
  }),
});
```

## Scheduled Functions

**From Mutation:**

```typescript
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const sendMessage = mutation({
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("messages", { text: "Hi" });

    // Schedule deletion after 5 seconds
    await ctx.scheduler.runAfter(5000, internal.messages.delete, { id });

    // Schedule at specific time
    await ctx.scheduler.runAt(Date.now() + 60000, internal.messages.remind, {
      id,
    });
  },
});
```

**From Action:**

```typescript
export const myAction = action({
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, api.myFunctions.myMutation, {});
    // Scheduling happens even if action fails later
  },
});
```

**Properties:**

- `runAfter(delayMs, function, args)` - Schedule after delay
- `runAt(timestamp, function, args)` - Schedule at specific time
- `cancel(scheduledFunctionId)` - Cancel scheduled function
- Returns ID of scheduled function
- Mutations: atomic with transaction
- Actions: not atomic, scheduled even if action fails
- Max 1000 functions per call, 8MB total args
- Stored in `_scheduled_functions` system table

**Query Scheduled Functions:**

```typescript
export const listScheduled = query({
  handler: async (ctx) => {
    return await ctx.db.system.query("_scheduled_functions").collect();
  },
});
```

## Function Naming

**File paths map to function names:**

```typescript
// convex/myFunctions.ts
export const myQuery = query({...});
// → api.myFunctions.myQuery

// convex/foo/bar.ts
export const myMutation = mutation({...});
// → api.foo.bar.myMutation

// Default export
export default query({...});
// → api.myFunctions.default
```

## Argument Validation

```typescript
import { v } from "convex/values";

export const myFunction = query({
  args: {
    // Primitives
    str: v.string(),
    num: v.number(),
    bool: v.boolean(),
    bigInt: v.bigint(),

    // Complex types
    arr: v.array(v.string()),
    obj: v.object({ a: v.number(), b: v.string() }),
    id: v.id("tableName"),

    // Optional
    optional: v.optional(v.string()),

    // Union
    union: v.union(v.string(), v.number()),

    // Any
    any: v.any(),
  },
  handler: async (ctx, args) => {
    // args are type-safe
  },
});
```

## Helper Functions

```typescript
// convex/helpers.ts
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("token", identity.tokenIdentifier))
    .unique();
}

// convex/messages.ts
import { mutation } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const sendMessage = mutation({
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    // Mutations can call helpers that take QueryCtx
  },
});
```

## Best Practices

**DO:**

- Validate all public function arguments
- Use internal functions for privileged operations
- Keep actions small, minimize work outside queries/mutations
- Extract logic into helper functions
- Use TypeScript for type safety

**AVOID:**

- Calling `ctx.runQuery`/`ctx.runMutation` unnecessarily (use helpers)
- Sequential `ctx.runQuery`/`ctx.runMutation` in actions (batch instead)
- Calling actions directly from client (call mutation that schedules action)
- Dangling promises in actions (await all promises)

## Context Types

```typescript
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

// Query context - read-only
function helper(ctx: QueryCtx) {}

// Mutation context - includes QueryCtx + write access
function mutationHelper(ctx: MutationCtx) {}

// Action context
function actionHelper(ctx: ActionCtx) {}
```

## Return Values

- **Query:** Any Convex type
- **Mutation:** Any Convex type or undefined (becomes null on client)
- **Action:** Any Convex type or undefined
- **HTTP Action:** Web API Response object

## Execution Model

**Queries:**

- Deterministic (same args = same result)
- Math.random(), Date.now() handled by runtime
- Read limits apply

**Mutations:**

- Run as transaction
- Retried automatically on conflicts
- Executed sequentially from single client
- Write limits apply

**Actions:**

- Not transactional
- Not automatically retried
- Parallelized per client
- Can have side effects
- Caller must handle errors

---

**Source:** https://docs.convex.dev/functions
