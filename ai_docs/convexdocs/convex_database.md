# Convex Database - Comprehensive Guide

## Overview

The Convex database provides a **relational data model**, stores **JSON-like documents**, and can be used with or without a schema. It "just works," giving you predictable query performance in an easy-to-use interface.

### Key Features

- No SQL required - uses JavaScript/TypeScript for all database operations
- Reactive queries that automatically update when data changes
- End-to-end type safety with TypeScript
- No setup or configuration needed
- Transactional guarantees for mutations
- Built-in caching and real-time updates

## Core Concepts

### Tables

Your Convex deployment contains tables that hold your app's data. Initially, your deployment contains no tables or documents.

**Tables spring into existence automatically** as soon as you add the first document to them:

```javascript
// `friends` table doesn't exist yet
await ctx.db.insert("friends", { name: "Jamie" });
// Now it does, and it has one document
```

- No need to specify a schema upfront
- No need to create tables explicitly
- Table names may contain alphanumeric characters and underscores
- Cannot start with an underscore

### Documents

Tables contain documents that are very similar to JavaScript objects. They have fields and values, and you can nest arrays or objects within them.

**Valid Convex documents:**

```javascript
{}
{"name": "Jamie"}
{"name": {"first": "Ari", "second": "Cole"}, "age": 60}
```

**Document Constraints:**

- Documents must be less than 1MB in total size
- Can have nested values (objects or arrays)
- Maximum 16 levels of nesting
- Can contain references to other documents via Document IDs

**Reserved Fields:**

- `_id`: Globally unique document identifier
- `_creationTime`: Automatically added timestamp (milliseconds since epoch)

### Schemas

While optional, schemas ensure that your data looks exactly how you want. They provide type safety and validation.

**Basic Schema Example:**

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.id("users"),
    body: v.string(),
  }),
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
```

**Schema Philosophy:**

- Start without a schema for rapid prototyping
- Add a schema once you've solidified your plan
- Convex tracks all types implicitly even without a schema
- View the inferred schema of any table in the dashboard
- Handles field type changes gracefully with unions

**Validator Types:**

- `v.string()`, `v.number()`, `v.boolean()`, `v.bigint()`
- `v.id("tableName")` for document references
- `v.array()`, `v.object()`
- `v.optional()` for optional fields
- `v.union()` for multiple types
- `v.any()` for flexible fields

## Reading Data

### Reading a Single Document

Use `db.get()` with a document ID:

```javascript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    return task;
  },
});
```

### Querying Documents

Document queries always begin by choosing the table with `db.query()`:

```javascript
export const listTasks = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks;
  },
});
```

### Filtering with Indexes

**The best way to filter in Convex is to use indexes.**

#### 1. Define the index in your schema:

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
    body: v.string(),
    user: v.id("users"),
  }).index("by_channel", ["channel"]),
});
```

#### 2. Query with the index:

```javascript
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channel", channel))
  .collect();
```

**Important:** You must explicitly use the `withIndex()` syntax to ensure your database uses the index. This differs from traditional SQL databases where the database implicitly chooses an index.

### Index Range Queries

```javascript
// Messages in channel created 1-2 minutes ago
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) =>
    q
      .eq("channel", channel)
      .gt("_creationTime", Date.now() - 2 * 60000)
      .lt("_creationTime", Date.now() - 60000)
  )
  .collect();
```

### Filtering Without Indexes

For small tables (low thousands of rows) or prototyping, you can use `.filter()`:

```javascript
const tasks = await ctx.db
  .query("tasks")
  .filter((q) => q.eq(q.field("status"), "completed"))
  .collect();
```

**Warning:** `.filter()` doesn't affect which documents are scanned. For large tables, use indexes instead.

### Ordering

By default, documents are ordered by `_creationTime` in ascending order:

```javascript
// Oldest to newest (default)
const messages = await ctx.db.query("messages").order("asc").collect();

// Newest to oldest
const messages = await ctx.db.query("messages").order("desc").collect();
```

**Sorting in JavaScript** (for small result sets):

```javascript
const messages = await ctx.db.query("messages").collect();
const topTen = messages.sort((a, b) => b.likes - a.likes).slice(0, 10);
```

**Sorting with indexes** (for large result sets):

```javascript
const messages = await ctx.db
  .query("messages")
  .withIndex("by_likes")
  .order("desc")
  .take(20);
```

### Retrieving Results

**Methods:**

- `.collect()` - Returns all matching documents
- `.take(n)` - Returns first n documents
- `.first()` - Returns first document or null
- `.unique()` - Returns single document or null (throws if multiple)
- `.paginate(opts)` - Returns a page of results with cursor

### Complex Queries

Convex prefers simple document traversal. For complex logic like joins, aggregations, or group by operations, **write the logic in JavaScript**:

**Join Example:**

```javascript
export const eventAttendees = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    return Promise.all(
      (event?.attendeeIds ?? []).map((userId) => ctx.db.get(userId))
    );
  },
});
```

**Aggregation Example:**

```javascript
export const averagePurchasePrice = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_buyer", (q) => q.eq("buyer", args.email))
      .collect();
    const sum = purchases.reduce((a, { value: b }) => a + b, 0);
    return sum / purchases.length;
  },
});
```

**Group By Example:**

```javascript
export const numPurchasesPerBuyer = query({
  handler: async (ctx) => {
    const purchases = await ctx.db.query("purchases").collect();
    return purchases.reduce(
      (counts, { buyer }) => ({
        ...counts,
        [buyer]: (counts[buyer] ?? 0) + 1,
      }),
      {} as Record<string, number>
    );
  },
});
```

## Writing Data

Mutations can insert, update, and delete data from database tables.

### Inserting Documents

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", { text: args.text });
    return taskId; // Returns globally unique ID
  },
});
```

**Supported data types:** See Data Types section below.

### Updating Documents

**Patch (shallow merge):**

```javascript
export const updateTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    // Add `tag` and overwrite `status`
    await ctx.db.patch(args.id, {
      tag: "bar",
      status: { archived: true },
    });

    // Remove field by setting to undefined
    await ctx.db.patch(args.id, { tag: undefined });
  },
});
```

**Replace (complete replacement):**

```javascript
export const replaceTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.replace(args.id, { invalid: true });
    // Old fields are removed
  },
});
```

### Deleting Documents

```javascript
export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

### Bulk Operations

The entire mutation function is automatically a single transaction. Just loop through operations:

```javascript
export const bulkInsertProducts = mutation({
  args: {
    products: v.array(
      v.object({
        product_name: v.string(),
        category: v.string(),
        price: v.number(),
        in_stock: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // All inserts happen in a single transaction
    for (const product of args.products) {
      await ctx.db.insert("products", product);
    }
  },
});
```

## Indexes

Indexes speed up document queries by organizing your documents. They also allow you to change the order of query results.

### Index Definition

```javascript
export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
    body: v.string(),
    user: v.id("users"),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_user", ["channel", "user"]),
});
```

### Index Properties

- **Name:** Must be unique per table (cannot use `by_id`)
- **Fields:** Ordered list of fields to index (up to 16 fields)
- **Nested fields:** Use dot notation like `properties.name`
- **Auto-added:** `_creationTime` is automatically added to every index
- **Limits:** Maximum 32 indexes per table

### Using Indexes in Queries

```javascript
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channel", channel))
  .collect();
```

### Index Range Expressions

Available operators:

- `q.eq(field, value)` - Equality
- `q.gt(field, value)` - Greater than
- `q.gte(field, value)` - Greater than or equal
- `q.lt(field, value)` - Less than
- `q.lte(field, value)` - Less than or equal

### Staged Indexes

For large tables, use staged indexes to avoid blocking deployments:

```javascript
export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
  }).index("by_channel", {
    fields: ["channel"],
    staged: true,
  }),
});
```

**Process:**

1. Deploy with `staged: true`
2. Monitor backfill progress in dashboard
3. Once complete, remove `staged` option and redeploy

### Performance Considerations

**Full table scans are slow!** Use one of these to avoid scanning:

- `.take(n)` - Limit results
- `.first()` - Get first match
- `.unique()` - Get single match
- `.paginate(opts)` - Paginate results
- Index with range expression

**Warning:** `.filter()` doesn't affect which documents are scanned. For 1000+ documents, use indexes with range expressions.

## Document IDs

Every document has a globally unique string ID automatically generated by the system.

### Working with IDs

```javascript
// Creating a document returns its ID
const userId = await ctx.db.insert("users", { name: "Michael Jordan" });

// Reading with ID
const user = await ctx.db.get(userId);

// TypeScript type
import { Id } from "./_generated/dataModel";
const userId: Id<"users"> = user._id;
```

### Document References

Embed IDs in documents to create relationships:

```javascript
await ctx.db.insert("books", {
  title: "The Great Gatsby",
  ownerId: user._id, // Reference to user
});

// Query books by owner
const myBooks = await ctx.db
  .query("books")
  .filter((q) => q.eq(q.field("ownerId"), user._id))
  .collect();
```

### External IDs

IDs are strings, so they can be easily:

- Inserted into URLs
- Stored in localStorage
- Passed from external sources

**Validating external IDs:**

```javascript
export const getTask = query({
  args: { taskId: v.id("tasks") }, // Validates table
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    return task;
  },
});
```

**TypeScript casting:**

```javascript
const id = localStorage.getItem("myIDStorage");
const task = useQuery(api.tasks.getTask, {
  taskId: id as Id<"tasks">
});
```

### Best Practice

Use separate tables and document references rather than deeply nested documents. This provides better maintainability and performance.

## Data Types

Convex supports the following data types:

### Primitive Types

- **Number** (`v.number()`) - 64-bit floating point
- **BigInt** (`v.bigint()`) - 64-bit signed integer
- **Boolean** (`v.boolean()`)
- **String** (`v.string()`)
- **Null** (`v.null()`)
- **Bytes** (`ArrayBuffer`)

### Complex Types

- **Array** (`v.array()`) - Can contain any Convex types
- **Object** (`v.object()`) - JavaScript objects with string keys
- **ID** (`v.id("tableName")`) - Reference to document in table

### Special Considerations

**Undefined:**

- Not a valid Convex value
- Objects with undefined values transform to missing fields
- `{a: undefined}` becomes `{}`
- Can be used in filters to match missing fields

**Dates:**

- No special date type
- Store UTC timestamps as numbers (milliseconds since epoch)
- Use `Date.now()` for current timestamp
- Create Date object: `new Date(timestamp)`
- For calendar dates/times, store as strings with timezone

**Value Ordering:**

```
undefined < null < bigint < number < boolean < string <
ArrayBuffer < Array < Object
```

### Constraints

- Documents must be less than 1MB total size
- Maximum 16 levels of nesting
- No reserved fields (starting with \_) allowed in user data

## Pagination

Paginated queries return results in incremental pages, perfect for "Load More" buttons or infinite scroll UIs.

### Writing a Paginated Query

```javascript
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### Using in React

```javascript
import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function App() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.list,
    {},
    { initialNumItems: 5 }
  );

  return (
    <div>
      {results?.map(({ _id, body }) => (
        <div key={_id}>{body}</div>
      ))}
      <button onClick={() => loadMore(5)} disabled={status !== "CanLoadMore"}>
        Load More
      </button>
    </div>
  );
}
```

### With Additional Arguments

```javascript
export const listWithExtraArg = query({
  args: {
    author: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### Pagination Features

**Cursor-based pagination:**

- Returns a `Cursor` representing the end point of current page
- Pass cursor to load next page
- More reliable than offset-based pagination

**Reactive updates:**

- Pages automatically update when data changes
- Page sizes may grow or shrink based on mutations
- All subscriptions stay consistent

**PaginationResult structure:**

```javascript
{
  page: [], // Array of documents
  continueCursor: "...", // Cursor for next page
  isDone: false, // Whether more results exist
}
```

### Status Values

- `"CanLoadMore"` - More results available
- `"LoadingMore"` - Currently loading
- `"LoadingFirstPage"` - Loading initial page
- `"Exhausted"` - No more results

## Best Practices

### Query Performance

**❌ Avoid:**

```javascript
// Potentially unbounded - scans entire table
const allMovies = await ctx.db.query("movies").collect();
const spielberg = allMovies.filter((m) => m.director === "Steven Spielberg");
```

**✅ Use indexes:**

```javascript
const spielberg = await ctx.db
  .query("movies")
  .withIndex("by_director", (q) => q.eq("director", "Steven Spielberg"))
  .collect();
```

**✅ Or use pagination:**

```javascript
const watched = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", "Tom"))
  .order("desc")
  .paginate(paginationOpts);
```

### Index Optimization

**Avoid redundant indexes:**

- `by_foo_and_bar` can be used for queries on just `foo`
- Don't create both `by_foo` and `by_foo_and_bar`

```javascript
// ✅ Single index serves both purposes
.index("by_team_and_user", ["team", "user"])

// Query just by team
.withIndex("by_team_and_user", (q) => q.eq("team", teamId))

// Query by team and user
.withIndex("by_team_and_user", (q) =>
  q.eq("team", teamId).eq("user", userId)
)
```

### Argument Validation

**Always validate arguments:**

```javascript
// ❌ Insecure - could update any document
export const updateMessage = mutation({
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id, update);
  },
});

// ✅ Secure - validated and type-safe
export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    update: v.object({
      body: v.optional(v.string()),
      author: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id, update);
  },
});
```

### Data Modeling

**Use tables to separate logical types:**

- Better than deeply nested documents
- More flexible for querying
- Better performance
- Easier to maintain

**For large datasets (1000+ documents):**

- Use indexes or pagination
- Avoid `.collect()` on unbounded queries
- Consider denormalization for frequently accessed data

### Loading States

Check for `undefined` to determine if a query is loading:

```javascript
const tasks = useQuery(api.tasks.list);

if (tasks === undefined) {
  return <LoadingSpinner />;
}

return <TaskList tasks={tasks} />;
```

**Note:** Once a query loads, it never returns `undefined` again (even as data updates reactively).

### Helper Functions

Extract common logic into helper functions:

```javascript
// helpers.ts
export async function getCurrentUser(ctx: QueryCtx) {
  // Load user using ctx.auth and ctx.db
  return user;
}

// mutation.ts
export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const user = await getCurrentUser(ctx);
    await ensureTeamAdmin(ctx, user, teamId);
    await ctx.db.delete(teamId);
  },
});
```

## Convex vs. Relational Databases

### Advantages of Convex

**No SQL Required:**

- Write queries in JavaScript/TypeScript
- No context switching between languages
- Better for AI code generation

**No Upfront Schema:**

- Start building immediately
- Add schema when ready
- No time-consuming migrations

**No Infrastructure Management:**

- No database admins needed
- No provisioning or configuring
- Automatic scaling and replication

**Built-in Reactivity:**

- No need for separate Pub/Sub servers
- Automatic cache invalidation
- Real-time updates out of the box

**No Cache Layer Needed:**

- Built-in caching
- No cache invalidation problems
- Consistent data guaranteed

**Transactional Guarantees:**

- All mutations run in transactions
- Can't corrupt data or create inconsistent state
- Safer for AI-generated code

### Traditional Database Architecture Issues

**Relational databases require:**

- Database servers
- Backend application servers
- Caching layers (Redis/Memcached)
- Pub/Sub servers for real-time updates
- Database administrators
- Site reliability engineers

**Common problems:**

- Complex cache invalidation
- Race conditions in caching code
- Security risks from direct client access
- Need for separate backend layer
- Difficult performance optimization
- Schema migration complexity

### When Convex Shines

- Rapid prototyping
- Real-time applications
- TypeScript/JavaScript projects
- AI-generated code
- Small to medium teams
- Need for quick iteration
- Want to avoid infrastructure complexity

## Additional Resources

### Dashboard Features

- **Data View:** Browse and edit documents
- **Custom Queries:** Write and test queries directly
- **Generate Schema:** Auto-generate schemas from existing data
- **Filter Documents:** Filter by any field and type
- **Indexes Pane:** View and monitor index backfill progress

### Development Workflow

1. Start without a schema for rapid prototyping
2. Use the dashboard to explore your data
3. Add indexes when queries slow down
4. Define schemas for type safety
5. Use migrations component for schema evolution

### Performance Monitoring

- Monitor index usage in dashboard
- Check backfill progress for staged indexes
- Use custom queries to test performance
- Profile query execution times
- Track database bandwidth usage

## Key Takeaways

1. **Start simple:** No schema, no setup, just start inserting documents
2. **Use indexes:** Essential for querying large datasets efficiently
3. **Write JavaScript:** No SQL needed, complex logic in familiar language
4. **Validate arguments:** Security and type safety are critical
5. **Reactive by default:** Queries automatically update when data changes
6. **Transactional:** All mutations are atomic and consistent
7. **Type-safe:** End-to-end TypeScript support with schemas
8. **Scalable:** Built-in pagination, indexing, and optimization

---

**Generated from:** https://docs.convex.dev/database and related documentation
**Date:** October 21, 2025
