# TypeScript 5.9.3 Coding Rules for Claude Code

**Version:** TypeScript 5.9.3 (Released October 2025)  
**Target Audience:** Claude Code AI Coding Agent  
**Last Updated:** October 2025

---

## Overview

TypeScript 5.9.3 is a stable patch release building on the 5.9 release from August 2025. This document outlines critical rules, best practices, and features to leverage when generating code with this version.

---

## Key Features in TypeScript 5.9

### 1. Import Defer (NEW - Stage 3 ECMAScript)

**What It Does:** Defers module execution until first property access, improving startup performance.

**Syntax Rules:**

```typescript
// ✅ CORRECT - Namespace import only
import defer * as expensiveLib from './expensive-library.js';

// ❌ INCORRECT - Named imports not allowed
import defer { feature } from './module.js';

// ❌ INCORRECT - Default imports not allowed
import defer defaultExport from './module.js';
```

**When to Use:**

- Conditionally loaded features
- Expensive initialization modules
- Platform-specific modules
- Performance-critical startup paths

**Important Constraints:**

- Only works with `--module preserve` or `--module esnext`
- Not transpiled/downleveled by TypeScript
- Requires native runtime support or bundler transformation
- Module loads but doesn't execute until property access

**Code Generation Rule:**

```typescript
// When generating lazy-loaded features:
import defer * as analytics from './analytics.js';

// Execution happens here, not at import
function trackEvent() {
  analytics.track('event'); // Module executes NOW
}
```

---

### 2. Module Resolution: `node20` Option (NEW - STABLE)

**Configuration:**

```json
{
  "compilerOptions": {
    "module": "node20",
    "moduleResolution": "node20"
  }
}
```

**Key Differences:**

- **`node20`**: Fixed, models Node.js v20 behavior, implies `--target es2023`
- **`nodenext`**: Floating target, tracks latest Node.js, implies `--target esnext`

**Rule for Claude Code:**

- Use `node20` for stable, production codebases
- Use `nodenext` for cutting-edge projects targeting latest Node.js
- Prefer `node20` unless explicitly instructed otherwise

---

### 3. Minimal `tsconfig.json` Generation

**New Default Structure:**

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": []
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**Rules:**

- Generate minimal configs by default
- Only add options when specifically needed
- Use editor autocomplete hints for additional options
- Set `types: []` to prevent auto-loading `@types/*`

---

### 4. Performance Optimizations

**Cached Type Instantiations:**

- TypeScript 5.9 caches intermediate type instantiations
- Reduces overhead in complex libraries (Zod, tRPC, etc.)
- No code changes required - automatic optimization

**Implications for Code Generation:**

- Can safely use complex generic types without excessive instantiation concerns
- Recursive type patterns are more performant
- Less worry about "Type instantiation is excessively deep" errors

---

## Breaking Changes & Migration Rules

### 1. ArrayBuffer Type Changes

**Issue:** `ArrayBuffer` is no longer automatically compatible with Node.js `Buffer`

```typescript
// ❌ May error in 5.9.3
function processBuffer(buffer: ArrayBuffer) {
  const nodeBuffer: Buffer = buffer; // Type error
}

// ✅ CORRECT - Explicit conversion
function processBuffer(buffer: ArrayBuffer) {
  const nodeBuffer = Buffer.from(buffer);
}

// ✅ CORRECT - Use union types
function processBuffer(buffer: ArrayBuffer | Buffer) {
  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}
```

**Rule:** Always use explicit `Buffer.from()` or union types when working with Node.js buffers.

---

### 2. Type Variable Inference Changes

**Issue:** More strict inference to prevent type variable "leaks"

```typescript
// May require explicit type arguments in 5.9
function combine<T>(a: T, b: T): T[] {
  return [a, b];
}

// ❌ May error if types don't align
const result = combine("hello", 42);

// ✅ CORRECT - Explicit type argument
const result = combine<string | number>("hello", 42);
```

**Rule:** When inference errors occur, add explicit type arguments to generic function calls.

---

### 3. DOM Library Updates

**Changes:**

- `AbortSignal.abort()` restored (fixed from RC)
- Various `lib.d.ts` updates
- Some interfaces have expanded/updated signatures

**Rule:** Regenerate type definitions if working with DOM APIs extensively.

---

## Code Generation Best Practices

### Strict Mode Configuration

**Always enable:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### Import Styles

**Modern ESM Syntax:**

```typescript
// ✅ PREFERRED - Named imports
import { useState, useEffect } from 'react';

// ✅ ACCEPTABLE - Namespace imports for many exports
import * as fs from 'node:fs/promises';

// ✅ NEW - Deferred imports for lazy loading
import defer * as analytics from './analytics.js';

// ⚠️ AVOID - Mixing import styles unnecessarily
import React, { useState } from 'react';
```

### Type Annotations

**Explicit Where It Matters:**

```typescript
// ✅ GOOD - Explicit parameter and return types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ GOOD - Explicit generic constraints
function findById<T extends { id: string }>(
  items: T[],
  id: string
): T | undefined {
  return items.find((item) => item.id === id);
}

// ✅ ACCEPTABLE - Inference for obvious cases
const count = items.length;
const doubled = numbers.map((n) => n * 2);
```

### Async/Await Patterns

**Error Handling:**

```typescript
// ✅ PREFERRED - Explicit error types
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Fetch failed:", error.message);
    }
    throw error;
  }
}

// ✅ GOOD - With type narrowing
async function processData(data: unknown): Promise<void> {
  if (typeof data !== "object" || data === null) {
    throw new TypeError("Expected object");
  }
  // Process data...
}
```

### Conditional Types

**Leveraging 5.9 Performance:**

```typescript
// ✅ GOOD - Complex conditional types (now more performant)
type Unwrap<T> =
  T extends Promise<infer U> ? U : T extends Array<infer U> ? U : T;

// ✅ GOOD - Recursive types (better performance in 5.9)
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

---

## Module Patterns

### ESM Structure

```typescript
// ✅ PREFERRED - Named exports
export function formatDate(date: Date): string {
  return date.toISOString();
}

export class UserService {
  // ...
}

// ✅ ACCEPTABLE - Default export for single main export
export default class Application {
  // ...
}

// ⚠️ AVOID - Mixed default and named exports
export default function main() {}
export const helper = () => {}; // Confusing
```

### Barrel Files

```typescript
// ✅ GOOD - Centralized exports
// index.ts
export { UserService } from './user-service.js';
export { AuthService } from './auth-service.js';
export type { User, AuthToken } from './types.js';

// ⚠️ CONSIDER - For large modules, use defer
// main.ts
import defer * as utils from './utils/index.js';

// Loads modules only when needed
export function processSomething() {
  return utils.formatters.format();
}
```

---

## Project Structure Recommendations

### Directory Layout

```
project/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.types.ts
│   │   │   └── index.ts
│   │   └── users/
│   ├── shared/
│   │   ├── utils/
│   │   └── types/
│   ├── config/
│   └── main.ts
├── tests/
├── tsconfig.json
└── package.json
```

### File Naming

- **Components:** `PascalCase.tsx` or `kebab-case.tsx`
- **Utilities:** `camelCase.ts` or `kebab-case.ts`
- **Types:** `types.ts` or `kebab-case.types.ts`
- **Tests:** `*.test.ts` or `*.spec.ts`

---

## Performance Guidelines

### Type Instantiation

**With 5.9 Improvements:**

```typescript
// ✅ NOW SAFE - Better caching reduces instantiation depth issues
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ✅ COMPLEX GENERICS - More performant in 5.9
type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;
```

### Startup Optimization

```typescript
// ✅ USE DEFER - For non-critical features
import defer * as telemetry from './telemetry.js';
import defer * as debugTools from './debug-tools.js';

// Core imports load immediately
import { App } from './app.js';
import { Router } from './router.js';

// Deferred modules only execute when accessed
if (config.enableTelemetry) {
  telemetry.init(); // Executes telemetry module NOW
}
```

---

## Common Patterns

### Discriminated Unions

```typescript
// ✅ EXCELLENT - Type-safe state handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function handleResult<T>(result: Result<T>): void {
  if (result.success) {
    console.log(result.data); // ✅ TypeScript knows this exists
  } else {
    console.error(result.error); // ✅ TypeScript knows this exists
  }
}
```

### Builder Pattern

```typescript
// ✅ GOOD - Fluent API with strong typing
class QueryBuilder<T> {
  private conditions: Array<(item: T) => boolean> = [];

  where(predicate: (item: T) => boolean): this {
    this.conditions.push(predicate);
    return this;
  }

  build(): (items: T[]) => T[] {
    return (items) =>
      items.filter((item) => this.conditions.every((cond) => cond(item)));
  }
}
```

### Async Initialization

```typescript
// ✅ GOOD - Lazy initialization with defer
import defer * as database from './database.js';

class Application {
  private initialized = false;

  async init(): Promise<void> {
    if (!this.initialized) {
      await database.connect(); // Database module executes here
      this.initialized = true;
    }
  }
}
```

---

## Anti-Patterns to Avoid

### ❌ Type Assertions Without Validation

```typescript
// ❌ BAD
const data = JSON.parse(input) as User;

// ✅ GOOD
function parseUser(input: string): User {
  const parsed = JSON.parse(input);
  if (!isValidUser(parsed)) {
    throw new Error("Invalid user data");
  }
  return parsed;
}
```

### ❌ Any Types

```typescript
// ❌ BAD
function process(data: any) {
  return data.value;
}

// ✅ GOOD
function process(data: unknown): string {
  if (typeof data === "object" && data !== null && "value" in data) {
    return String(data.value);
  }
  throw new Error("Invalid data shape");
}
```

### ❌ Overusing Enums

```typescript
// ❌ AVOID - Use union types instead
enum Status {
  Active,
  Inactive,
  Pending,
}

// ✅ PREFERRED
type Status = "active" | "inactive" | "pending";
```

---

## Testing Recommendations

### Test File Structure

```typescript
// user.service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { UserService } from "./user.service.js";

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it("should create user with valid data", async () => {
    const user = await service.create({
      name: "Test User",
      email: "test@example.com",
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe("Test User");
  });
});
```

---

## Configuration Examples

### For Node.js Projects

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "node20",
    "moduleResolution": "node20",
    "lib": ["es2023"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### For Frontend Projects (React/Vue)

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["esnext", "dom", "dom.iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": []
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### For Library Development

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["es2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "composite": true,
    "types": []
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## Claude Code-Specific Rules

### When Generating Code

1. **Always** use TypeScript 5.9.3 features when beneficial
2. **Prefer** `import defer` for performance-critical paths
3. **Use** `node20` module resolution for Node.js projects unless specified
4. **Enable** strict mode by default
5. **Avoid** `any` types - use `unknown` with type guards
6. **Prefer** named exports over default exports
7. **Use** explicit return types for public APIs
8. **Leverage** 5.9's improved type caching for complex generics
9. **Handle** ArrayBuffer/Buffer conversions explicitly
10. **Generate** minimal `tsconfig.json` files

### When Refactoring

1. **Identify** opportunities for `import defer`
2. **Replace** `any` with proper types
3. **Add** missing type annotations to function signatures
4. **Update** ArrayBuffer/Buffer handling for 5.9 compatibility
5. **Simplify** complex type instantiations (now more performant)
6. **Use** discriminated unions for state machines
7. **Consolidate** similar types with generics
8. **Add** explicit type arguments if inference fails

### Error Resolution Priority

1. **Type errors** → Add explicit type arguments
2. **Module resolution** → Check `node20` vs `nodenext` settings
3. **Buffer compatibility** → Use explicit conversions
4. **Import errors** → Verify file extensions in ESM mode
5. **Type instantiation depth** → Should be rarer in 5.9, but simplify if occurs

---

## Quick Reference

### Import Defer Syntax

```typescript
import defer * as module from './module.js';
```

### Node.js Module Config

```json
{ "module": "node20", "moduleResolution": "node20" }
```

### Minimal tsconfig

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "types": []
  }
}
```

### Type Guard Pattern

```typescript
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value;
}
```

---

## Resources

- **Official Docs:** https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html
- **Release Notes:** https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/
- **GitHub Release:** https://github.com/microsoft/TypeScript/releases/tag/v5.9.3
- **Playground:** https://www.typescriptlang.org/play

---

## Version History

- **5.9.3** (October 2025): Stable patch release
- **5.9.2** (October 2025): Stable release
- **5.9.1** (RC, July 2025): Release candidate
- **5.9.0** (Beta, July 2025): Beta release with new features

---

**End of Document**
