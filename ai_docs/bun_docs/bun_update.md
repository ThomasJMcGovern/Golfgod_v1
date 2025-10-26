# Bun v1.3.1 - What's New & Features

> Version-specific documentation for Bun v1.3.1
> Released: October 22, 2025
> Status: Stable

## Table of Contents

1. [Quick Start](#quick-start)
2. [Major Features from v1.3](#major-features-from-v13)
3. [v1.3.1 Updates](#v131-updates)
4. [Full-Stack Development](#full-stack-development)
5. [Database Support](#database-support)
6. [Package Manager](#package-manager-enhancements)
7. [Testing](#testing-improvements)
8. [Performance](#performance-improvements)
9. [Migration Guide](#migration-guide)

---

## Quick Start

### Install/Upgrade

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Upgrade to v1.3.1
bun upgrade

# Verify version
bun --version  # Should show 1.3.1
```

---

## Major Features from v1.3

### 1. Full-Stack JavaScript Runtime

Bun v1.3 transforms Bun into a batteries-included full-stack runtime.

#### Zero-Config Frontend Development

```bash
# Create React app with hot reload
bun init --react

# Start dev server with HMR
bun run index.html
```

#### Run HTML Directly

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="./style.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./app.tsx"></script>
  </body>
</html>
```

```bash
# Just run it! Bun bundles everything
bun run index.html
```

#### Hot Module Reloading

```typescript
import { serve } from "bun";
import homepage from "./index.html";

serve({
  port: 3000,
  development: {
    hmr: true,              // Hot Module Replacement
    console: true,          // Browser → terminal logs
  },
  routes: {
    "/": homepage,
  },
});
```

#### Production Builds

```bash
# Bundle for production
bun build ./index.html --production --outdir=dist

# Creates optimized bundle with:
# - Minified JS/CSS
# - Tree shaking
# - Code splitting
```

---

### 2. Built-in Routing

```typescript
import { serve, sql } from "bun";
import App from "./index.html";

serve({
  port: 3000,
  routes: {
    // Serve frontend
    "/*": App,
    
    // API routes
    "/api/users": {
      GET: async () => {
        const users = await sql`SELECT * FROM users LIMIT 10`;
        return Response.json(users);
      },
      POST: async (req) => {
        const { name, email } = await req.json();
        const [user] = await sql`
          INSERT INTO users ${sql({ name, email })}
          RETURNING *
        `;
        return Response.json(user);
      },
    },
    
    // Dynamic routes
    "/api/users/:id": async (req) => {
      const { id } = req.params;
      const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
      
      if (!user) {
        return new Response("Not found", { status: 404 });
      }
      
      return Response.json(user);
    },
    
    // Static responses
    "/health": Response.json({ status: "ok" }),
  },
});
```

---

### 3. Unified SQL API (Bun.SQL)

One API for PostgreSQL, MySQL, and SQLite!

```typescript
import { sql, SQL } from "bun";

// Connect to any database with same API
const postgres = new SQL("postgres://localhost/mydb");
const mysql = new SQL("mysql://localhost/mydb");
const sqlite = new SQL("sqlite://data.db");

// Uses DATABASE_URL by default
const users = await sql`
  SELECT name, email FROM users
  WHERE age >= ${21}
`;
```

#### PostgreSQL

```typescript
import { sql } from "bun";

// Insert
await sql`
  INSERT INTO users (name, email)
  VALUES (${"Alice"}, ${"alice@example.com"})
`;

// Update specific fields
const updates = { name: "Alice Smith", email: "alice.smith@example.com" };
await sql`
  UPDATE users 
  SET ${sql(updates, "name", "email")}
  WHERE id = ${userId}
`;

// WHERE IN with arrays
await sql`SELECT * FROM users WHERE id IN ${sql([1, 2, 3])}`;

// Array types
await sql`
  INSERT INTO users (name, roles)
  VALUES (${"Alice"}, ${sql.array(["admin", "user"], "TEXT")})
`;

// Multi-statement queries (simple protocol)
await sql`
  CREATE TABLE users (id SERIAL, name TEXT);
  CREATE INDEX idx_users_name ON users(name);
  INSERT INTO users (name) VALUES ('Alice');
`.simple();

// Unix domain sockets
const db = new SQL({
  path: "/tmp/.s.PGSQL.5432",
  user: "postgres",
  password: "postgres",
  database: "mydb"
});

// Disable prepared statements (for PGBouncer)
const db = new SQL({ prepare: false });
```

#### MySQL

```typescript
import { SQL } from "bun";

const mysql = new SQL("mysql://root:password@localhost:3306/mydb");

const users = await mysql`SELECT * FROM users WHERE status = ${"active"}`;
```

#### SQLite

```typescript
import { Database } from "bun:sqlite";

const db = new Database("data.db");

// Insert
db.run("INSERT INTO users (name) VALUES (?)", ["Alice"]);

// Query
const users = db.query("SELECT * FROM users").all();

// Prepared statements
const stmt = db.query("SELECT * FROM users WHERE id = ?");
const user = stmt.get(1);

// Type introspection
console.log(stmt.declaredTypes); // ["INTEGER", "TEXT", "INTEGER"]
console.log(stmt.columnTypes);   // ["integer", "text", "integer"]

// Deserialize with options
const serialized = db.serialize();
const newDb = Database.deserialize(serialized, {
  readonly: true,
  strict: true,
  safeIntegers: true,
});
```

---

### 4. Built-in Redis Client

```typescript
import { redis, RedisClient } from "bun";

// Auto-connects to process.env.REDIS_URL or localhost:6379
await redis.set("greeting", "Hello from Bun!");
const value = await redis.get("greeting");
console.log(value); // "Hello from Bun!"

// Hash operations
await redis.hset("user:1", "name", "Alice");
await redis.hset("user:1", "email", "alice@example.com");
const user = await redis.hgetall("user:1");

// Lists
await redis.lpush("tasks", "task1", "task2", "task3");
const tasks = await redis.lrange("tasks", 0, -1);

// Sets
await redis.sadd("tags", "javascript", "typescript", "bun");
const tags = await redis.smembers("tags");

// Pub/Sub
const subscriber = new RedisClient("redis://localhost:6379");
const publisher = await subscriber.duplicate();

await subscriber.subscribe("notifications", (message, channel) => {
  console.log("Received:", message);
});

await publisher.publish("notifications", "Hello!");
```

**Performance**: Significantly faster than ioredis, especially for batch operations.

---

### 5. Built-in Cookies API

```typescript
import { serve } from "bun";

serve({
  routes: {
    "/login": (req) => {
      // Set cookie
      req.cookies.set("sessionId", "abc123", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return new Response("Logged in");
    },
    
    "/profile": (req) => {
      // Read cookie
      const sessionId = req.cookies.get("sessionId");
      if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
      }
      return Response.json({ sessionId });
    },
    
    "/logout": (req) => {
      // Delete cookie
      req.cookies.delete("sessionId");
      return new Response("Logged out");
    },
  },
});
```

**Zero performance overhead** - cookies not parsed until accessed!

---

### 6. Security Enhancements

#### Encrypted Credential Storage

```typescript
import { secrets } from "bun";

// Store secrets securely
await secrets.set("api-key", "secret-value");

// Retrieve secrets
const apiKey = await secrets.get("api-key");

// Stored in:
// - macOS: Keychain
// - Linux: libsecret
// - Windows: Credential Manager
```

#### CSRF Protection

```typescript
import { CSRF } from "bun";

const secret = "your-secret-key";

// Generate token
const token = CSRF.generate({
  secret,
  encoding: "hex",
  expiresIn: 60 * 1000, // 1 minute
});

// Verify token
const isValid = CSRF.verify(token, { secret });
```

---

### 7. Package Catalogs

Centralize dependency versions across monorepo packages!

```json
{
  "name": "monorepo",
  "workspaces": ["packages/*"],
  "catalogs": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

```json
{
  "name": "@company/ui",
  "dependencies": {
    "react": "catalog:react"
  }
}
```

Now all packages use the same React version. Update once, update everywhere!

---

### 8. Isolated Installs (Default for Workspaces)

Prevents phantom dependencies by ensuring each package only accesses declared dependencies.

```bash
# Now the default for workspaces
bun install

# Opt out if needed
bun install --linker=hoisted
```

```toml
# bunfig.toml
[install]
linker = "hoisted"  # Opt out globally
```

---

### 9. Cross-Platform Executables

```bash
# Build for multiple platforms
bun build --compile --target=linux-x64 ./app.ts --outfile myapp-linux
bun build --compile --target=darwin-arm64 ./app.ts --outfile myapp-macos
bun build --compile --target=windows-x64 ./app.ts --outfile myapp.exe

# With metadata (Windows)
bun build --compile --target=windows-x64 \
  --title="My App" \
  --publisher="My Company" \
  --version="1.0.0" \
  ./app.ts
```

---

### 10. Async Stack Traces

Better debugging for async code!

```typescript
async function foo() {
  return await bar();
}

async function bar() {
  return await baz();
}

async function baz() {
  throw new Error("oops");
}

try {
  await foo();
} catch (e) {
  console.log(e);
}
```

**Output:**
```
error: oops
  at baz (script.js:11:9)
  at async bar (script.js:6:16)
  at async foo (script.js:2:16)
```

Full async call stack preserved!

---

## v1.3.1 Updates

### Faster bun build (2× on macOS)

For symlink-heavy projects (pnpm, isolated linker):

```bash
# Before: ~2s
# After: ~1s
bun build ./index.html --production --outdir=dist
```

### Source Maps Preserve Legal Comments

```javascript
// License comments now preserved in source maps
/*! 
 * My Library v1.0.0
 * (c) 2025 My Company
 * MIT License
 */
```

### import.meta in CommonJS

```typescript
// Now works with bun build --format=cjs
import.meta.url      // → (not inlined)
import.meta.path     // → __filename
import.meta.dirname  // → __dirname
import.meta.file     // → path.basename(module.filename)
```

### bun test Enhancements

#### Global `vi` (Vitest Compatibility)

```typescript
import { test, expect } from "bun:test";

// No import needed!
test("mock", () => {
  const fn = vi.fn();
  expect(fn).not.toHaveBeenCalled();
  
  fn();
  expect(fn).toHaveBeenCalled();
});
```

#### `--pass-with-no-tests`

```bash
# Exit 0 even when no tests found
bun test --pass-with-no-tests
```

Useful in monorepos where some packages have no tests.

#### `--only-failures`

```bash
# Show only failing tests (hide passing)
bun test --only-failures
```

Perfect for large test suites and CI logs!

### Faster Installs (No Peer Deps)

Removed unnecessary `sleep()` when no peer dependencies present.

```bash
# Noticeably faster when no peerDependencies
bun install
```

### `.npmrc` Email Support

```bash
# .npmrc
//registry.example.com/:email=user@example.com
//registry.example.com/:_authToken=xxxxxx
```

For registries like Sonatype Nexus that require email.

### Selective Hoisting

```toml
# bunfig.toml
[install]
publicHoistPattern = ["@types*", "*eslint*"]
hoistPattern = ["@types*"]
```

Hoist specific packages to root for TypeScript, ESLint plugins, etc.

### FileHandle.readLines()

```typescript
import { open } from "node:fs/promises";

const file = await open("file.txt");
try {
  for await (const line of file.readLines({ encoding: "utf8" })) {
    console.log(line);
  }
} finally {
  await file.close();
}
```

Efficient, backpressure-aware line reading.

---

## Full-Stack Development

### Complete Example

```typescript
// app.ts
import { serve, sql } from "bun";
import homepage from "./index.html";

// Database
await sql`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false
  )
`;

serve({
  port: 3000,
  development: {
    hmr: true,
    console: true,
  },
  routes: {
    "/": homepage,
    
    "/api/todos": {
      GET: async () => {
        const todos = await sql`SELECT * FROM todos ORDER BY id`;
        return Response.json(todos);
      },
      POST: async (req) => {
        const { text } = await req.json();
        const [todo] = await sql`
          INSERT INTO todos (text) 
          VALUES (${text}) 
          RETURNING *
        `;
        return Response.json(todo);
      },
    },
    
    "/api/todos/:id": {
      PATCH: async (req) => {
        const { id } = req.params;
        const { completed } = await req.json();
        await sql`
          UPDATE todos 
          SET completed = ${completed} 
          WHERE id = ${id}
        `;
        return Response.json({ ok: true });
      },
      DELETE: async (req) => {
        const { id } = req.params;
        await sql`DELETE FROM todos WHERE id = ${id}`;
        return Response.json({ ok: true });
      },
    },
  },
});
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.tsx"></script>
  </body>
</html>
```

```tsx
// app.tsx
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  
  useEffect(() => {
    fetch("/api/todos")
      .then(r => r.json())
      .then(setTodos);
  }, []);
  
  const addTodo = async () => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const todo = await res.json();
    setTodos([...todos, todo]);
    setText("");
  };
  
  return (
    <div>
      <h1>Todos</h1>
      <input 
        value={text} 
        onChange={e => setText(e.target.value)}
        placeholder="New todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}

createRoot(document.getElementById("app")).render(<App />);
```

```bash
# Run everything!
bun run app.ts
```

One command. Full-stack app. Hot reload. Database. Done.

---

## Database Support

### PostgreSQL Features

```typescript
import { sql } from "bun";

// Array support
await sql`
  INSERT INTO posts (title, tags)
  VALUES (${"Hello"}, ${sql.array(["tech", "bun"], "TEXT")})
`;

// Simple protocol (multi-statement)
await sql`
  BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  COMMIT;
`.simple();

// Unix sockets
const db = new SQL({
  path: "/var/run/postgresql/.s.PGSQL.5432",
  database: "mydb",
});

// Runtime config
const db = new SQL("postgres://localhost/mydb", {
  connection: {
    search_path: "information_schema",
    statement_timeout: "30s",
    application_name: "my_app",
  },
});

// Dynamic columns
const columns = ["name", "email"];
await sql`SELECT ${sql(columns)} FROM users`;

// Proper null handling
const result = await sql`SELECT ARRAY[1, 2, NULL]::integer[]`;
console.log(result[0].array); // [1, 2, null]
```

### MySQL Features

```typescript
import { SQL } from "bun";

const mysql = new SQL("mysql://localhost/mydb");

// All standard operations
const users = await mysql`SELECT * FROM users WHERE active = ${true}`;

// Transactions
await mysql`START TRANSACTION`;
await mysql`UPDATE accounts SET balance = balance - 100 WHERE id = 1`;
await mysql`UPDATE accounts SET balance = balance + 100 WHERE id = 2`;
await mysql`COMMIT`;
```

### SQLite Features

```typescript
import { Database } from "bun:sqlite";

const db = new Database(":memory:");

// Transactions
const insert = db.transaction((users) => {
  for (const user of users) {
    db.run("INSERT INTO users (name) VALUES (?)", [user.name]);
  }
});

insert([{ name: "Alice" }, { name: "Bob" }]);

// Type introspection
const stmt = db.query("SELECT * FROM users");
console.log(stmt.declaredTypes); // Column types from schema
console.log(stmt.columnTypes);   // Actual value types
```

---

## Package Manager Enhancements

### Dependency Catalogs

```json
{
  "name": "monorepo",
  "catalogs": {
    "react": "^18.3.1",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

```json
{
  "name": "@company/app",
  "dependencies": {
    "react": "catalog:react"
  },
  "devDependencies": {
    "typescript": "catalog:typescript",
    "eslint": "catalog:eslint"
  }
}
```

Update catalog → updates everywhere!

### New Commands

```bash
# Why is this installed?
bun why react
# Shows dependency chain

# Interactive update
bun update --interactive
bun update -i

# Filter by workspace
bun update -i --filter @company/frontend

# Recursive commands
bun outdated --recursive
bun test --recursive

# View package info
bun info react

# Analyze imports
bun install --analyze

# Audit vulnerabilities
bun audit
bun audit --severity=high
```

### Security Scanner

```toml
# bunfig.toml
[install.security]
scanner = "@socketsecurity/bun-security-scanner"
```

Scans for vulnerabilities during install!

### Minimum Release Age

```toml
# bunfig.toml
[install]
minimumReleaseAge = 604800  # 7 days
```

Protect against supply chain attacks by requiring packages to be published for 7+ days.

---

## Testing Improvements

### Concurrent Tests

```typescript
import { test, expect } from "bun:test";

// Run tests concurrently
test.concurrent("fetch user 1", async () => {
  const res = await fetch("https://api.example.com/users/1");
  expect(res.status).toBe(200);
});

test.concurrent("fetch user 2", async () => {
  const res = await fetch("https://api.example.com/users/2");
  expect(res.status).toBe(200);
});

// Concurrent describe blocks
describe.concurrent("API tests", () => {
  test("endpoint 1", async () => {
    // Runs concurrently with other tests in this describe
  });
  
  test("endpoint 2", async () => {
    // Runs concurrently
  });
});

// Force sequential
test.serial("must run in order", () => {
  // Runs sequentially even in concurrent context
});
```

**Max concurrency**: 20 tests by default, configurable with `--max-concurrency`.

### Test Randomization

```bash
# Random order
bun test --randomize

# The seed is printed
# --seed=12345
# 10 pass, 0 fail

# Reproduce exact order
bun test --seed 12345
```

### Expected Failures

```typescript
import { test, expect } from "bun:test";

// Mark test as expected to fail
test.failing("known bug", () => {
  expect(divide(10, 0)).toBe(Infinity);
  // Remove .failing when bug is fixed
});

// Useful for TDD
test.failing("feature not implemented", () => {
  expect(newFeature()).toBe("working");
  // Remove .failing once implemented
});
```

### Type Testing

```typescript
import { expectTypeOf, test } from "bun:test";

test("types", () => {
  expectTypeOf<string>().toEqualTypeOf<string>();
  expectTypeOf({ foo: 1 }).toHaveProperty("foo");
  expectTypeOf<Promise<number>>().resolves.toBeNumber();
});
```

Verify with: `bunx tsc --noEmit`

### VS Code Integration

Install [Bun for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=oven.bun-vscode):

- Run/debug tests from sidebar
- Inline error messages
- Coverage visualization

---

## Performance Improvements

### Build Performance

- **2-5× faster production builds** with Turbopack-style approach
- **2× faster on macOS** for symlink-heavy projects (v1.3.1)
- **60% faster `Bun.build`** on macOS (threadpool optimization)

### Runtime Performance

- **Idle CPU reduced**: Fixed GC over-scheduling
- **JavaScript memory down 10-30%**: Next.js (-28%), Elysia (-11%)
- **Express 9% faster**, Fastify 5.4% faster
- **AbortSignal.timeout 40× faster**
- **Headers.get() 2× faster**
- **setTimeout 8-15% less memory**

### Install Performance

- **2.5× faster** for node-gyp packages
- **~20ms faster** in large monorepos
- **50% faster on Windows** (v1.3.1)
- **Faster workspace installs**: Bug fix for re-evaluation

### Crypto Performance

- **DiffieHellman ~400× faster**
- **Cipheriv/Decipheriv ~400× faster**
- **scrypt ~6× faster**

### Other Improvements

- **Array operations**: `includes()`, `indexOf()` faster
- **Number operations**: `isFinite()`, `isSafeInteger()` faster
- **String operations**: Concatenation optimized
- **postMessage 500× faster** (for strings)

---

## Migration Guide

### From Bun v1.2 to v1.3.1

#### No Breaking Changes!

Bun v1.3 has minimal breaking changes. Most code works as-is.

#### Opt-In New Features

```typescript
// Before: Node.js style
import express from "express";
const app = express();
app.listen(3000);

// After: Bun.serve with routes
import { serve } from "bun";
serve({
  routes: {
    "/": () => new Response("Hello"),
  },
});
```

#### Update Dependencies

```bash
# Update Bun
bun upgrade

# Update packages
bun update

# Audit for issues
bun audit
```

#### Enable Isolated Installs

```bash
# Now default for workspaces
bun install

# Or explicitly
bun install --linker=isolated
```

#### Use Catalogs

```json
{
  "catalogs": {
    "react": "^18.3.1"
  }
}
```

```json
{
  "dependencies": {
    "react": "catalog:react"
  }
}
```

---

## Common Patterns

### Full-Stack API

```typescript
import { serve, sql } from "bun";

serve({
  port: 3000,
  routes: {
    "/api/users": {
      GET: async () => {
        const users = await sql`SELECT * FROM users`;
        return Response.json(users);
      },
      POST: async (req) => {
        const data = await req.json();
        const [user] = await sql`
          INSERT INTO users ${sql(data)}
          RETURNING *
        `;
        return Response.json(user);
      },
    },
  },
});
```

### Authenticated Routes

```typescript
serve({
  routes: {
    "/api/protected": async (req) => {
      const sessionId = req.cookies.get("sessionId");
      
      if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
      }
      
      const session = await redis.get(`session:${sessionId}`);
      if (!session) {
        return new Response("Unauthorized", { status: 401 });
      }
      
      return Response.json({ data: "secret" });
    },
  },
});
```

### Database Transactions

```typescript
import { sql } from "bun";

async function transferMoney(fromId: number, toId: number, amount: number) {
  await sql`BEGIN`.simple();
  
  try {
    await sql`
      UPDATE accounts 
      SET balance = balance - ${amount} 
      WHERE id = ${fromId}
    `;
    
    await sql`
      UPDATE accounts 
      SET balance = balance + ${amount} 
      WHERE id = ${toId}
    `;
    
    await sql`COMMIT`.simple();
  } catch (error) {
    await sql`ROLLBACK`.simple();
    throw error;
  }
}
```

### Redis Caching

```typescript
import { redis } from "bun";

async function getCachedUser(id: number) {
  // Try cache first
  const cached = await redis.get(`user:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
  
  // Cache for 1 hour
  await redis.set(`user:${id}`, JSON.stringify(user), { ex: 3600 });
  
  return user;
}
```

---

## Resources

- **Release Blog**: https://bun.sh/blog/bun-v1.3.1
- **v1.3 Blog**: https://bun.sh/blog/bun-v1.3
- **Docs**: https://bun.sh/docs
- **GitHub**: https://github.com/oven-sh/bun
- **Discord**: https://bun.sh/discord

---

## Key Takeaways

### 🎯 Biggest Changes

1. **Full-Stack Runtime** - Frontend + backend in one tool
2. **Unified SQL** - One API for Postgres, MySQL, SQLite
3. **Built-in Redis** - No external dependencies
4. **Routing** - Built into `Bun.serve()`
5. **Cookies** - Native cookie management
6. **Catalogs** - Centralized version management
7. **Isolated Installs** - No phantom dependencies
8. **Security** - Encrypted secrets, CSRF protection

### ⚡ Performance Wins

- 2-5× faster builds
- 500× faster `postMessage`
- 400× faster crypto operations
- 2× faster on macOS (symlinks)
- 10-30% less JavaScript memory

### 🚀 Best Practices

1. Use `Bun.serve()` with routes for APIs
2. Use `Bun.SQL` for database access
3. Use catalogs in monorepos
4. Enable isolated installs
5. Use `bun build --compile` for deployment
6. Use concurrent tests for I/O-bound tests

---

## Example: Complete App

```typescript
// server.ts
import { serve, sql, redis } from "bun";
import app from "./index.html";

// Initialize database
await sql`
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )
`;

serve({
  port: 3000,
  development: {
    hmr: true,
    console: true,
  },
  routes: {
    "/": app,
    
    "/api/posts": {
      GET: async () => {
        // Try cache
        const cached = await redis.get("posts");
        if (cached) {
          return new Response(cached, {
            headers: { "Content-Type": "application/json" },
          });
        }
        
        // Query database
        const posts = await sql`
          SELECT * FROM posts 
          ORDER BY created_at DESC
        `;
        
        // Cache for 5 minutes
        const json = JSON.stringify(posts);
        await redis.set("posts", json, { ex: 300 });
        
        return new Response(json, {
          headers: { "Content-Type": "application/json" },
        });
      },
      
      POST: async (req) => {
        const { title, content } = await req.json();
        
        const [post] = await sql`
          INSERT INTO posts (title, content)
          VALUES (${title}, ${content})
          RETURNING *
        `;
        
        // Invalidate cache
        await redis.del("posts");
        
        return Response.json(post);
      },
    },
  },
});
```

```bash
# Run it
bun run server.ts

# Build for production
bun build --compile server.ts --outfile app
./app
```

---

## Summary

Bun v1.3.1 is the **biggest release yet**, transforming Bun into a complete full-stack JavaScript runtime. With built-in database support, Redis, routing, cookies, and incredible performance improvements, you can now build entire applications with just Bun - no external tools required.

**Start building with Bun today:**

```bash
bun upgrade
bun init --react
bun run index.html
```