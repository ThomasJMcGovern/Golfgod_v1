# Bun Fundamentals Guide

> Essential documentation for working with Bun - the all-in-one JavaScript runtime
> Last Updated: October 2025

## Table of Contents

1. [What is Bun?](#what-is-bun)
2. [Installation & Setup](#installation--setup)
3. [Runtime](#runtime)
4. [Package Manager](#package-manager)
5. [Bundler](#bundler)
6. [Test Runner](#test-runner)
7. [Web APIs](#web-apis)
8. [Node.js Compatibility](#nodejs-compatibility)
9. [Configuration](#configuration)
10. [Best Practices](#best-practices)

---

## What is Bun?

Bun is an all-in-one JavaScript runtime, bundler, test runner, and package manager built from scratch in Zig for performance.

### Key Features

- **Fast Runtime**: Built on JavaScriptCore (Safari's engine), not V8
- **Package Manager**: 10-30× faster than npm
- **Bundler**: Built-in, fast alternative to webpack/esbuild
- **Test Runner**: Jest-compatible with 10-30× faster execution
- **TypeScript**: Native TypeScript support (no `tsc` needed)
- **JSX**: Native JSX/TSX support

### Why Bun?

```bash
# Installation time
npm install            # 30s
bun install           # 1s

# Test execution
jest                  # 10s
bun test             # 0.3s

# Bundle time
webpack              # 5s
bun build            # 0.5s
```

---

## Installation & Setup

### Install Bun

```bash
# macOS, Linux, WSL
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1|iex"

# npm
npm install -g bun

# Homebrew
brew tap oven-sh/bun
brew install bun

# Docker
docker pull oven/bun
```

### Upgrade Bun

```bash
bun upgrade
```

### Verify Installation

```bash
bun --version  # e.g., 1.3.1
```

### Create New Project

```bash
# Blank project
bun init

# React project
bun init --react

# React with Tailwind
bun init --react=tailwind

# React with shadcn/ui
bun init --react=shadcn
```

---

## Runtime

### Run JavaScript/TypeScript

```bash
# Run a file
bun run index.ts
bun index.ts          # 'run' is optional

# Run with arguments
bun run script.ts arg1 arg2

# Run package.json script
bun run dev
bun dev               # 'run' is optional for scripts

# Watch mode (auto-restart on changes)
bun --watch index.ts

# Hot reload (faster than watch)
bun --hot index.ts
```

### TypeScript Support

```typescript
// No compilation needed!
import { serve } from "bun";

interface User {
  id: number;
  name: string;
}

const users: User[] = [{ id: 1, name: "Alice" }];

serve({
  port: 3000,
  fetch() {
    return Response.json(users);
  },
});
```

### JSX/TSX Support

```tsx
// Works out of the box!
const App = () => (
  <div>
    <h1>Hello from Bun!</h1>
  </div>
);
```

### Environment Variables

```bash
# .env file (automatically loaded)
DATABASE_URL=postgres://localhost/mydb
API_KEY=secret123
```

```typescript
// Access in code
console.log(process.env.DATABASE_URL);
console.log(Bun.env.DATABASE_URL); // Bun-specific
```

### Top-Level Await

```typescript
// Works everywhere!
const response = await fetch("https://api.example.com");
const data = await response.json();
console.log(data);
```

---

## Package Manager

### Install Dependencies

```bash
# Install from package.json
bun install

# Add a package
bun add react
bun add -d typescript           # Dev dependency
bun add -D @types/react         # Dev dependency (alias)
bun add --optional sharp        # Optional dependency

# Add exact version
bun add react@18.3.1

# Add from GitHub
bun add github:owner/repo

# Add from local directory
bun add ../my-package

# Global install
bun add -g typescript
```

### Remove Dependencies

```bash
bun remove react
bun rm react                    # Alias
```

### Update Dependencies

```bash
# Update all
bun update

# Update specific package
bun update react

# Interactive update (choose which to update)
bun update --interactive
bun update -i
```

### List Dependencies

```bash
# Show outdated packages
bun outdated

# Show dependency tree
bun pm ls

# Show why a package is installed
bun why react
```

### Workspaces (Monorepos)

```json
{
  "name": "my-monorepo",
  "workspaces": ["packages/*"],
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

```bash
# Install all workspace dependencies
bun install

# Run command in specific workspace
bun run --filter @company/ui build

# Run command in all workspaces
bun run --recursive build
```

### Lock Files

```bash
# Generate bun.lockb (binary lockfile)
bun install

# Frozen install (fail if lockfile changes)
bun install --frozen-lockfile

# Update lockfile only (no install)
bun install --lockfile-only
```

---

## Bundler

### Build for Production

```bash
# Bundle a file
bun build ./index.ts --outdir=dist

# With minification
bun build ./index.ts --outdir=dist --minify

# Target browser
bun build ./index.ts --outdir=dist --target=browser

# Target Node.js
bun build ./index.ts --outdir=dist --target=node

# Bundle for Bun runtime
bun build ./index.ts --outdir=dist --target=bun
```

### Programmatic API

```typescript
import { build } from "bun";

await build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  target: "browser",
  minify: true,
  sourcemap: "external",
  splitting: true,
});
```

### Code Splitting

```typescript
await build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  splitting: true, // Enable code splitting
  naming: {
    chunk: "[name]-[hash].[ext]",
  },
});
```

### External Dependencies

```typescript
await build({
  entrypoints: ["./index.ts"],
  external: ["react", "react-dom"], // Don't bundle these
});
```

### Plugins

```typescript
import { plugin } from "bun";

const myPlugin = {
  name: "my-plugin",
  setup(build) {
    build.onLoad({ filter: /\.txt$/ }, async (args) => {
      const text = await Bun.file(args.path).text();
      return {
        contents: `export default ${JSON.stringify(text)}`,
        loader: "js",
      };
    });
  },
};

await build({
  entrypoints: ["./index.ts"],
  plugins: [myPlugin],
});
```

### Single-File Executables

```bash
# Create standalone executable
bun build --compile ./index.ts --outfile myapp

# Run the executable
./myapp

# Cross-compile for other platforms
bun build --compile --target=linux-x64 ./app.ts --outfile myapp-linux
bun build --compile --target=darwin-arm64 ./app.ts --outfile myapp-macos
bun build --compile --target=windows-x64 ./app.ts --outfile myapp.exe
```

---

## Test Runner

### Basic Tests

```typescript
// math.test.ts
import { test, expect } from "bun:test";

test("addition", () => {
  expect(1 + 1).toBe(2);
});

test("subtraction", () => {
  expect(5 - 3).toBe(2);
});
```

### Run Tests

```bash
# Run all tests
bun test

# Run specific file
bun test math.test.ts

# Watch mode
bun test --watch

# Run tests matching pattern
bun test -t "addition"
```

### Describe Blocks

```typescript
import { describe, test, expect } from "bun:test";

describe("Math operations", () => {
  test("addition", () => {
    expect(1 + 1).toBe(2);
  });

  test("multiplication", () => {
    expect(2 * 3).toBe(6);
  });
});
```

### Lifecycle Hooks

```typescript
import { beforeAll, beforeEach, afterEach, afterAll, test } from "bun:test";

beforeAll(() => {
  console.log("Setup once before all tests");
});

beforeEach(() => {
  console.log("Setup before each test");
});

afterEach(() => {
  console.log("Cleanup after each test");
});

afterAll(() => {
  console.log("Cleanup once after all tests");
});

test("example", () => {
  expect(true).toBe(true);
});
```

### Async Tests

```typescript
import { test, expect } from "bun:test";

test("async operation", async () => {
  const response = await fetch("https://api.example.com");
  const data = await response.json();
  expect(data).toBeDefined();
});
```

### Mocking

```typescript
import { test, expect, mock } from "bun:test";

test("mock function", () => {
  const mockFn = mock(() => "mocked");

  const result = mockFn();

  expect(result).toBe("mocked");
  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

### Spying

```typescript
import { test, expect, spyOn } from "bun:test";

const obj = {
  method: () => "original",
};

test("spy on method", () => {
  const spy = spyOn(obj, "method");

  obj.method();

  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});
```

### Matchers

```typescript
import { test, expect } from "bun:test";

test("common matchers", () => {
  // Equality
  expect(1 + 1).toBe(2);
  expect({ a: 1 }).toEqual({ a: 1 });

  // Truthiness
  expect(true).toBeTruthy();
  expect(false).toBeFalsy();
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();

  // Numbers
  expect(10).toBeGreaterThan(5);
  expect(5).toBeLessThan(10);
  expect(2.5).toBeCloseTo(2.51, 1);

  // Strings
  expect("hello world").toContain("world");
  expect("email@example.com").toMatch(/\w+@\w+\.\w+/);

  // Arrays
  expect([1, 2, 3]).toContain(2);
  expect([1, 2, 3]).toHaveLength(3);

  // Objects
  expect({ a: 1, b: 2 }).toHaveProperty("a");
  expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });

  // Exceptions
  expect(() => {
    throw new Error("oops");
  }).toThrow("oops");
});
```

### Snapshots

```typescript
import { test, expect } from "bun:test";

test("snapshot", () => {
  const data = { id: 1, name: "Alice", age: 30 };
  expect(data).toMatchSnapshot();
});

// Update snapshots
// bun test --update-snapshots
```

### Code Coverage

```bash
# Run with coverage
bun test --coverage

# Generate HTML report
bun test --coverage --coverage-reporter=html
```

---

## Web APIs

### HTTP Server

```typescript
import { serve } from "bun";

serve({
  port: 3000,
  fetch(request) {
    return new Response("Hello World!");
  },
});

console.log("Server running on http://localhost:3000");
```

### Routing

```typescript
import { serve } from "bun";

serve({
  port: 3000,
  routes: {
    "/": () => new Response("Home"),
    "/about": () => new Response("About"),
    "/users/:id": (req) => {
      const { id } = req.params;
      return Response.json({ userId: id });
    },
  },
});
```

### WebSocket Server

```typescript
import { serve } from "bun";

serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return; // Connection upgraded to WebSocket
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    open(ws) {
      console.log("Client connected");
    },
    message(ws, message) {
      ws.send(`Echo: ${message}`);
    },
    close(ws) {
      console.log("Client disconnected");
    },
  },
});
```

### File I/O

```typescript
// Read file
const file = Bun.file("./package.json");
const text = await file.text();
const json = await file.json();
const buffer = await file.arrayBuffer();

// Write file
await Bun.write("output.txt", "Hello World!");
await Bun.write("data.json", JSON.stringify({ foo: "bar" }));

// Stream file
const stream = Bun.file("large-file.txt").stream();
for await (const chunk of stream) {
  console.log(chunk);
}

// Check if file exists
const exists = await Bun.file("test.txt").exists();

// Get file size
const size = Bun.file("test.txt").size;
```

### Fetch API

```typescript
// GET request
const response = await fetch("https://api.example.com/users");
const users = await response.json();

// POST request
const response = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "Alice" }),
});

// With timeout
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

const response = await fetch("https://api.example.com", {
  signal: controller.signal,
});
```

### Hashing & Crypto

```typescript
// Hash a string
const hash = Bun.hash("hello world");
console.log(hash); // 64-bit hash as bigint

// Hash with specific algorithm
import { hash } from "bun";

const crc32 = hash.crc32("hello");
const adler32 = hash.adler32("hello");
const cityHash64 = hash.cityHash64("hello");
const murmur64 = hash.murmur64("hello");
const wyhash = hash.wyhash("hello");

// Password hashing
const password = "super-secret";
const hashed = await Bun.password.hash(password);
const isMatch = await Bun.password.verify(password, hashed);
```

### Shell Scripts

```typescript
import { $ } from "bun";

// Run shell commands
await $`echo "Hello World"`;

// With variables
const name = "Alice";
await $`echo "Hello ${name}"`;

// Capture output
const output = await $`ls -la`.text();
console.log(output);

// Pipe commands
await $`cat file.txt | grep "pattern" | wc -l`;

// Change directory
await $`cd src && ls`;

// Environment variables
await $`VAR=value node script.js`;
```

---

## Node.js Compatibility

Bun aims for full Node.js compatibility.

### Built-in Modules

```typescript
// Most Node.js modules work in Bun
import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import crypto from "node:crypto";

// fs operations
const data = fs.readFileSync("file.txt", "utf-8");

// path operations
const fullPath = path.join(__dirname, "file.txt");

// HTTP server
createServer((req, res) => {
  res.end("Hello from Node.js API");
}).listen(3000);
```

### Supported Modules

- `node:fs` - File system
- `node:path` - Path utilities
- `node:http` / `node:https` - HTTP servers
- `node:crypto` - Cryptography
- `node:buffer` - Binary data
- `node:stream` - Streams
- `node:events` - Event emitter
- `node:util` - Utilities
- `node:os` - Operating system
- `node:child_process` - Process spawning
- `node:worker_threads` - Worker threads
- And many more...

### CommonJS & ESM

```javascript
// CommonJS (works in Bun)
const express = require("express");
module.exports = { foo: "bar" };

// ESM (recommended)
import express from "express";
export const foo = "bar";
```

---

## Configuration

### bunfig.toml

```toml
# Root config file
[install]
# Package manager settings
registry = "https://registry.npmjs.org"
cache = "~/.bun/install/cache"

# Prefer offline
prefer = "offline"

# Frozen lockfile in CI
frozen = false

[test]
# Test runner settings
coverage = true
coverageReporter = ["lcov", "text"]

# Test timeout
timeout = 5000

[run]
# Runtime settings
shell = "/bin/bash"

# Preload scripts
preload = ["./setup.ts"]
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "module": "esnext",
    "target": "esnext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "composite": true,
    "strict": true,
    "downlevelIteration": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": true,
    "types": ["bun-types"]
  }
}
```

---

## Best Practices

### Project Structure

```
my-project/
├── src/
│   ├── index.ts
│   ├── utils/
│   └── components/
├── tests/
│   ├── unit/
│   └── integration/
├── public/
│   └── assets/
├── package.json
├── bunfig.toml
├── tsconfig.json
├── .env
└── bun.lockb
```

### Performance Tips

1. **Use Bun APIs when possible**

   ```typescript
   // Faster
   await Bun.write("file.txt", data);

   // Slower
   import fs from "node:fs/promises";
   await fs.writeFile("file.txt", data);
   ```

2. **Use `bun build` for production**

   ```bash
   bun build ./index.ts --outdir=dist --minify --target=bun
   ```

3. **Use workspaces for monorepos**

   ```json
   {
     "workspaces": ["packages/*"]
   }
   ```

4. **Leverage native APIs**
   ```typescript
   // Use Bun.serve instead of Express for APIs
   serve({ fetch: () => Response.json({ ok: true }) });
   ```

### Error Handling

```typescript
// Use try-catch for async operations
try {
  const response = await fetch("https://api.example.com");
  const data = await response.json();
} catch (error) {
  console.error("Fetch failed:", error);
}

// Use error boundaries in servers
serve({
  fetch(req) {
    try {
      // Handle request
      return Response.json({ ok: true });
    } catch (error) {
      return new Response("Internal Error", { status: 500 });
    }
  },
});
```

### Testing Strategy

1. **Unit tests** - Test individual functions
2. **Integration tests** - Test components together
3. **E2E tests** - Test full workflows

```typescript
// Unit test
test("pure function", () => {
  expect(add(1, 2)).toBe(3);
});

// Integration test
test("API endpoint", async () => {
  const response = await fetch("http://localhost:3000/api/users");
  expect(response.status).toBe(200);
});
```

### CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun test
      - run: bun build
```

---

## Common Commands

```bash
# Package Management
bun install              # Install dependencies
bun add <package>        # Add package
bun remove <package>     # Remove package
bun update              # Update all packages

# Running Code
bun run <file>          # Run file
bun --watch <file>      # Watch mode
bun --hot <file>        # Hot reload

# Building
bun build <file>        # Bundle file
bun build --minify      # Minify output

# Testing
bun test                # Run tests
bun test --watch        # Watch mode
bun test --coverage     # With coverage

# Other
bun upgrade             # Upgrade Bun
bun --version           # Check version
bun init                # Initialize project
```

---

## Resources

- **Official Docs**: https://bun.sh/docs
- **GitHub**: https://github.com/oven-sh/bun
- **Discord**: https://bun.sh/discord
- **Examples**: https://github.com/oven-sh/bun/tree/main/examples
- **Blog**: https://bun.sh/blog

---

## Debugging

### Enable Logging

```bash
# Verbose output
BUN_DEBUG=1 bun run index.ts

# Network debugging
BUN_CONFIG_VERBOSE_FETCH=1 bun run index.ts

# Verbose install
bun install --verbose
```

### Inspector

```bash
# Start with debugger
bun --inspect index.ts

# Wait for debugger
bun --inspect-wait index.ts
```

### Common Issues

1. **Module not found**
   - Check import paths
   - Verify package is installed
   - Clear cache: `rm -rf node_modules bun.lockb && bun install`

2. **Build errors**
   - Check `bunfig.toml` configuration
   - Verify entry points exist
   - Check for circular dependencies

3. **Test failures**
   - Run with `--verbose` flag
   - Check test file naming (must include `.test.` or `.spec.`)
   - Verify imports

---

## Quick Start Example

```typescript
// server.ts
import { serve } from "bun";

const server = serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response("Hello World!");
    }

    if (url.pathname === "/json") {
      return Response.json({ message: "Hello JSON!" });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running on http://localhost:${server.port}`);
```

```bash
# Run it
bun run server.ts

# Test it
curl http://localhost:3000
curl http://localhost:3000/json
```

---

This guide covers the fundamentals of working with Bun. For version-specific features, see the Bun v1.3.1 guide.
