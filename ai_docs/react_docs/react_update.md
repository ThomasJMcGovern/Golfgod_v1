# React 19.2 Coding Rules for Claude Code

**Version:** React 19.2 (Released October 1, 2025)  
**Target Audience:** Claude Code AI Coding Agent  
**Last Updated:** October 2025

---

## Overview

React 19.2 is the third major release in 2025 (following 19.0 in December 2024 and 19.1 in June 2025). This release focuses on performance optimizations, improved developer experience, and modernized SSR workflows. This document provides comprehensive guidelines for generating React 19.2 code.

---

## What's New in React 19.2

### 1. `<Activity>` Component (NEW)

**Purpose:** Control UI visibility and state persistence without full unmounting.

**Modes:**

- `visible`: Children shown, effects mounted, updates processed normally
- `hidden`: Children hidden, effects unmounted, updates deferred until React is idle

**When to Use:**

- Pre-rendering likely navigation targets
- Maintaining state for back navigation (form inputs, scroll positions)
- Background data loading/warming
- Tab/panel systems with state persistence

**Example:**

```tsx
import { Activity } from "react";

function NavigationExample() {
  const [currentTab, setCurrentTab] = useState("home");

  return (
    <>
      <Activity mode={currentTab === "home" ? "visible" : "hidden"}>
        <HomePage />
      </Activity>

      <Activity mode={currentTab === "profile" ? "visible" : "hidden"}>
        <ProfilePage />
      </Activity>

      <Activity mode={currentTab === "settings" ? "visible" : "hidden"}>
        <SettingsPage />
      </Activity>
    </>
  );
}
```

**Benefits:**

- State preservation across navigations
- Improved navigation performance
- Pre-warmed components and data
- No effect cleanup/re-initialization overhead

**Rule:** Prefer `<Activity>` over conditional rendering when state persistence matters.

---

### 2. `useEffectEvent` Hook (NEW)

**Purpose:** Extract non-reactive logic from Effects to prevent unnecessary re-runs.

**Problem It Solves:**

```tsx
// ❌ BAD - Effect re-runs on every theme change
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on("connected", () => {
      showNotification("Connected!", theme); // Uses theme
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, theme]); // theme causes disconnect/reconnect!
}
```

**Solution:**

```tsx
// ✅ GOOD - Using useEffectEvent
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification("Connected!", theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on("connected", onConnected);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // Only roomId in deps
}
```

**Rules:**

- `useEffectEvent` functions always see latest props/state
- NOT tracked as dependencies
- Can ONLY be declared in the same component/hook as the Effect
- Use for conceptual "events" fired from Effects
- Don't use just to silence linter warnings

**When to Use:**

- Reading latest props in Effect callbacks
- Event handlers within Effects
- Non-reactive values that shouldn't trigger Effect re-runs

---

### 3. `cacheSignal` for RSC (NEW)

**Purpose:** Know when cache() lifetime ends in React Server Components.

**Use Case:** Abort or cleanup work when cached results expire.

```tsx
// Server Component
import { cache, cacheSignal } from "react";

const fetchUserData = cache(async (userId: string) => {
  const signal = cacheSignal();

  const data = await fetch(`/api/users/${userId}`, {
    signal,
  });

  return data.json();
});
```

**Benefits:**

- Clean up abortable fetches
- Cancel in-flight requests
- Better resource management in RSC

**Rule:** Use `cacheSignal` for all abortable operations in cached Server Components.

---

### 4. React Performance Tracks (NEW)

**What:** Chrome DevTools integration showing React-specific performance data.

**What You'll See:**

- Scheduler priorities (blocking vs transition work)
- Component render timing
- Suspense boundary timing
- Work prioritization visualization

**How to Use:**

1. Open Chrome DevTools → Performance tab
2. Record performance profile
3. Look for React tracks in timeline

**Rule:** Use Performance Tracks to validate blocking vs transition work allocation.

---

### 5. Partial Pre-rendering (NEW)

**Purpose:** Pre-render static shell to CDN, resume with dynamic content later.

**APIs:**

```tsx
// Step 1: Pre-render static shell
const controller = new AbortController();
const { prelude, postponed } = await prerender(<App />, {
  signal: controller.signal,
});

// Return prelude to client immediately

// Step 2: Resume rendering later
const postponedState = await getPostponedState(request);
const stream = await resume(<App />, postponedState);
```

**Use Cases:**

- Static site generation with dynamic sections
- CDN-optimized shells
- Progressive enhancement patterns

**Rule:** Use for apps with distinct static/dynamic content boundaries.

---

### 6. Web Streams for Node.js SSR (NEW)

**What:** `renderToReadableStream` now available for Node.js

**Important Note:**

- Node Streams still faster than Web Streams in Node.js
- Web Streams don't support compression by default
- Use Node Streams for production Node.js SSR
- Use Web Streams for framework compatibility or edge runtimes

```tsx
// Node.js SSR
import { renderToReadableStream } from "react-dom/server";

const stream = await renderToReadableStream(<App />);
```

**Rule:** Prefer Node Streams for Node.js environments unless framework requires Web Streams.

---

### 7. Other 19.2 Changes

**`useId` Prefix:**

- Changed from `:r:` (19.0) / `«r»` (19.1) to `_r_`
- Reason: Valid for CSS `view-transition-name` and XML 1.0 naming

**eslint-plugin-react-hooks v6:**

- Flat config now default
- Use `recommended-legacy` for old config format
- New React Compiler-powered rules (opt-in)

---

## React 19 Core Features (19.0+)

### Actions API

**What:** Async functions in transitions with automatic state management.

**Automatic Features:**

- Pending state tracking
- Error handling
- Optimistic updates
- Form resets

**Basic Pattern:**

```tsx
function UpdateProfile() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await updateProfile(formData);
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="username" />
      <button disabled={isPending}>{isPending ? "Saving..." : "Save"}</button>
    </form>
  );
}
```

---

### `useActionState` Hook

**Purpose:** Manage form actions with state, pending, and error handling.

**Signature:**

```tsx
const [state, formAction, isPending] = useActionState(
  actionFn,
  initialState,
  permalink? // Optional for deep linking
);
```

**Example:**

```tsx
async function addUser(prevState: State, formData: FormData): Promise<State> {
  const username = formData.get("username") as string;

  // Validation
  if (!username) {
    return { error: "Username required", users: prevState.users };
  }

  // Simulate API call
  await delay(1000);

  return {
    users: [...prevState.users, { username, id: Date.now() }],
    error: null,
  };
}

function UserForm() {
  const [state, formAction, isPending] = useActionState(addUser, {
    users: [],
    error: null,
  });

  return (
    <>
      <form action={formAction}>
        <input name="username" />
        <button disabled={isPending}>
          {isPending ? "Adding..." : "Add User"}
        </button>
      </form>

      {state.error && <div className="error">{state.error}</div>}

      {state.users.map((user) => (
        <div key={user.id}>{user.username}</div>
      ))}
    </>
  );
}
```

**Benefits:**

- No separate pending state needed
- Access to previous state in action
- Automatic form data handling
- Built-in error states

---

### `useOptimistic` Hook

**Purpose:** Show optimistic UI updates before async confirmation.

**Signature:**

```tsx
const [optimisticState, setOptimisticState] = useOptimistic(
  actualState,
  updateFn?
);
```

**Example:**

```tsx
function CommentSection({ comments }: { comments: Comment[] }) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: string) => [
      ...state,
      { text: newComment, id: Math.random(), pending: true },
    ]
  );

  const formAction = async (formData: FormData) => {
    const text = formData.get("comment") as string;

    // Optimistic update
    addOptimisticComment(text);

    // Actual update
    await addComment(text);
  };

  return (
    <>
      <form action={formAction}>
        <input name="comment" />
        <button>Post</button>
      </form>

      {optimisticComments.map((comment) => (
        <div key={comment.id} className={comment.pending ? "pending" : ""}>
          {comment.text}
          {comment.pending && <span> (Sending...)</span>}
        </div>
      ))}
    </>
  );
}
```

**Auto-Revert on Error:**
React automatically reverts optimistic updates if the action fails.

**Rule:** Use for any user action with async confirmation (comments, likes, todos).

---

### `useFormStatus` Hook

**Purpose:** Access form status in nested components without prop drilling.

**Important:** Must be called inside a component rendered within a `<form>`.

```tsx
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button disabled={pending}>{pending ? "Submitting..." : "Submit"}</button>
  );
}

function Form() {
  return (
    <form action={handleSubmit}>
      <input name="email" />
      {/* SubmitButton accesses form status via useFormStatus */}
      <SubmitButton />
    </form>
  );
}
```

**Use Cases:**

- Design system components
- Reusable form buttons
- Form-aware UI elements

---

### `use` Hook

**Purpose:** Read resources (Promises or Context) during render.

**With Promises:**

```tsx
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspends until resolved

  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userPromise={fetchUser()} />
    </Suspense>
  );
}
```

**With Context:**

```tsx
function Button() {
  const theme = use(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

**Key Differences from Hooks:**

- ✅ Can be called conditionally
- ✅ Can be called in loops
- ❌ Cannot be called in event handlers
- ❌ Must be in render phase

```tsx
// ✅ VALID - Conditional use
function Component({ shouldLoad }) {
  let data = null;
  if (shouldLoad) {
    data = use(dataPromise);
  }
  return <div>{data}</div>;
}

// ❌ INVALID - In event handler
function Component() {
  const handleClick = () => {
    const data = use(promise); // Error!
  };
}
```

---

### Ref as Prop

**No More `forwardRef`!**

```tsx
// ✅ React 19 - Direct ref prop
function Input({ ref }: { ref: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} />;
}

// ❌ Old way (still works but deprecated)
const Input = forwardRef((props, ref) => {
  return <input ref={ref} />;
});
```

**Rule:** Always use ref as a direct prop. Avoid `forwardRef` in new code.

---

### Form Actions

**Native Form Integration:**

```tsx
function ContactForm() {
  async function handleSubmit(formData: FormData) {
    "use server"; // If using Server Actions

    const email = formData.get("email");
    await sendEmail(email);
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" />
      <button>Subscribe</button>
    </form>
  );
}
```

**Auto Form Reset:**
React automatically resets uncontrolled forms on successful action.

**Manual Reset:**

```tsx
import { requestFormReset } from "react-dom";

function handleSubmit(formData: FormData) {
  // ... submit logic
  requestFormReset(formRef.current);
}
```

---

## React Compiler

### Overview

The React Compiler (still in beta, separate from React 19) automates memoization:

- Analyzes code at build time
- Automatically applies memoization where beneficial
- No manual `useMemo`, `useCallback`, or `React.memo` needed (mostly)

### Current Status (October 2025)

**Not Yet Released as Stable**

- Available as experimental feature
- Used in production at Instagram
- Expected timeline: 2026+ for wide adoption

### What It Does

```tsx
// You write:
function Component({ onSubmit }) {
  const handleClick = () => {
    onSubmit();
  };

  return <ChildComponent onClick={handleClick} />;
}

// Compiler automatically optimizes as if you wrote:
function Component({ onSubmit }) {
  const handleClick = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  return React.memo(ChildComponent)({ onClick: handleClick });
}
```

### When Compiler Is Available

**You Still Need Manual Memoization:**

- Cross-component caching
- Expensive computations the compiler misses
- Third-party libraries requiring stable references
- Explicit semantic control

**Rule for Claude Code:**

- **Currently:** Write memoization manually as needed
- **Future:** Trust compiler but understand memoization principles
- **Always:** Know when to use manual optimization

---

## TypeScript Integration

### Type Safety for Actions

```tsx
type State = {
  users: User[];
  error: string | null;
};

type ActionResult = Promise<State>;

async function addUser(prevState: State, formData: FormData): ActionResult {
  // Type-safe action
  return { users: [], error: null };
}
```

### Generic Components

```tsx
function List<T>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

### Ref Types

```tsx
// Correct ref typing
function Input({ ref }: { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} />;
}

// Or with ForwardedRef (for complex cases)
import type { ForwardedRef } from "react";

function Input({ ref }: { ref?: ForwardedRef<HTMLInputElement> }) {
  return <input ref={ref} />;
}
```

---

## Component Patterns

### Server Components (RSC)

```tsx
// app/page.tsx - Server Component
async function Page() {
  const data = await fetchData(); // Can use async/await directly

  return (
    <div>
      <h1>{data.title}</h1>
      <ClientCounter />
    </div>
  );
}
```

**Rules:**

- Server Components can't use hooks
- Server Components can't use browser APIs
- Server Components can async/await
- Mark Client Components with `'use client'`

### Client Components

```tsx
"use client";

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### Server Actions

```tsx
// app/actions.ts
"use server";

export async function updateUser(formData: FormData) {
  const username = formData.get("username");

  // Direct database access on server
  await db.users.update({ username });

  revalidatePath("/profile");
}
```

```tsx
// app/profile/page.tsx
"use client";

import { updateUser } from "./actions";

function ProfileForm() {
  return (
    <form action={updateUser}>
      <input name="username" />
      <button>Update</button>
    </form>
  );
}
```

---

## Performance Optimization

### When to Use `<Activity>`

```tsx
// ✅ GOOD - State preservation
function TabContainer() {
  const [tab, setTab] = useState("home");

  return (
    <>
      <Activity mode={tab === "home" ? "visible" : "hidden"}>
        <HomeTab /> {/* State preserved when hidden */}
      </Activity>
      <Activity mode={tab === "profile" ? "visible" : "hidden"}>
        <ProfileTab />
      </Activity>
    </>
  );
}

// ❌ AVOID - Simple conditional rendering
function SimpleToggle({ show }) {
  return show ? <Content /> : null; // No need for Activity
}
```

### Transition Priorities

```tsx
import { useTransition, useState } from "react";

function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Urgent: Update input immediately
    setQuery(e.target.value);

    // Non-urgent: Search can be interrupted
    startTransition(async () => {
      const data = await searchAPI(e.target.value);
      setResults(data);
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  );
}
```

### Suspense Boundaries

```tsx
function App() {
  return (
    <Suspense fallback={<NavSkeleton />}>
      <Navigation />

      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />

        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
      </Suspense>
    </Suspense>
  );
}
```

**Rule:** Granular Suspense boundaries for better UX.

---

## State Management Patterns

### Server State with `use`

```tsx
function UserProfile({ userId }: { userId: string }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);

  return (
    <Suspense fallback={<Skeleton />}>
      <UserData userPromise={userPromise} />
    </Suspense>
  );
}

function UserData({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

### Complex Form State

```tsx
type FormState = {
  data: FormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
};

function AdvancedForm() {
  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    data: {},
    errors: {},
    touched: {},
  });

  return (
    <form action={formAction}>
      <input name="email" />
      {state.errors.email && (
        <span className="error">{state.errors.email}</span>
      )}

      <button disabled={isPending}>Submit</button>
    </form>
  );
}
```

### Optimistic UI Pattern

```tsx
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: string) => [
      ...state,
      { id: `temp-${Date.now()}`, text: newTodo, completed: false },
    ]
  );

  async function addTodo(formData: FormData) {
    const text = formData.get("todo") as string;

    addOptimisticTodo(text);

    const newTodo = await saveTodo(text);
    setTodos([...todos, newTodo]);
  }

  return (
    <>
      <form action={addTodo}>
        <input name="todo" />
        <button>Add</button>
      </form>

      {optimisticTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </>
  );
}
```

---

## Testing Patterns

### Testing Components with Actions

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("form submission", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<MyForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
      })
    );
  });
});
```

### Testing with Suspense

```tsx
import { Suspense } from "react";
import { render, screen } from "@testing-library/react";

test("suspense fallback", () => {
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncComponent />
    </Suspense>
  );

  expect(screen.getByText("Loading...")).toBeInTheDocument();
});
```

---

## Common Patterns

### Loading States

```tsx
function DataDisplay() {
  const [data, loadData, isPending] = useActionState(fetchData, null);

  return (
    <div>
      <button onClick={loadData} disabled={isPending}>
        {isPending ? "Loading..." : "Load Data"}
      </button>

      {data && <DataView data={data} />}
    </div>
  );
}
```

### Error Boundaries

```tsx
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

### Compound Components

```tsx
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function Tabs({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("");

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ value, children }: { value: string; children: ReactNode }) {
  const context = use(TabsContext);
  if (!context) throw new Error("Tab must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const context = use(TabsContext);
  if (!context) throw new Error("TabPanel must be used within Tabs");

  if (context.activeTab !== value) return null;

  return <div role="tabpanel">{children}</div>;
}

// Usage
function Example() {
  return (
    <Tabs>
      <TabList>
        <Tab value="home">Home</Tab>
        <Tab value="profile">Profile</Tab>
      </TabList>
      <TabPanel value="home">Home Content</TabPanel>
      <TabPanel value="profile">Profile Content</TabPanel>
    </Tabs>
  );
}
```

---

## Anti-Patterns to Avoid

### ❌ Overusing Activity

```tsx
// ❌ BAD - Unnecessary complexity
function SimpleToggle({ show }) {
  return (
    <Activity mode={show ? "visible" : "hidden"}>
      <div>Simple content</div>
    </Activity>
  );
}

// ✅ GOOD - Simple conditional
function SimpleToggle({ show }) {
  return show ? <div>Simple content</div> : null;
}
```

### ❌ Misusing useEffectEvent

```tsx
// ❌ BAD - Using to silence linter
function Component({ value }) {
  const handleValue = useEffectEvent(() => {
    console.log(value);
  });

  useEffect(() => {
    handleValue();
  }, []); // Missing dependency
}

// ✅ GOOD - Value should be in deps
function Component({ value }) {
  useEffect(() => {
    console.log(value);
  }, [value]);
}
```

### ❌ Not Using Transitions

```tsx
// ❌ BAD - Blocking update
function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = async (e) => {
    setQuery(e.target.value);
    const data = await searchAPI(e.target.value); // Blocks input
    setResults(data);
  };

  return <input onChange={handleChange} />;
}

// ✅ GOOD - Non-blocking with transition
function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value);

    startTransition(async () => {
      const data = await searchAPI(e.target.value);
      setResults(data);
    });
  };

  return <input value={query} onChange={handleChange} />;
}
```

### ❌ Incorrect use Hook Usage

```tsx
// ❌ BAD - In event handler
function Component() {
  const handleClick = () => {
    const data = use(promise); // Error!
  };
}

// ✅ GOOD - In render
function Component() {
  const data = use(promise);
  return <div onClick={handleClick}>{data}</div>;
}
```

---

## Migration Guide

### From React 18 to React 19

**1. Replace forwardRef:**

```tsx
// Before
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// After
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

**2. Use Actions for Forms:**

```tsx
// Before
function Form() {
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    await submitForm();
    setPending(false);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// After
function Form() {
  const [state, formAction, isPending] = useActionState(
    submitForm,
    initialState
  );

  return <form action={formAction}>...</form>;
}
```

**3. Update Dependency Arrays with useEffectEvent:**

```tsx
// Before
useEffect(() => {
  doSomething(propA, propB);
}, [propA, propB]);

// After (if propB shouldn't trigger effect)
const onEvent = useEffectEvent(() => {
  doSomething(propA, propB);
});

useEffect(() => {
  onEvent();
}, [propA]);
```

---

## Project Structure

### Recommended Structure

```
src/
├── app/                    # Next.js App Router (if using)
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── features/           # Feature-specific components
│   │   ├── auth/
│   │   └── dashboard/
│   └── layouts/
│       └── main-layout.tsx
├── lib/
│   ├── actions/            # Server Actions
│   │   ├── auth.ts
│   │   └── users.ts
│   ├── hooks/              # Custom hooks
│   │   ├── use-user.ts
│   │   └── use-form.ts
│   └── utils/
│       └── helpers.ts
├── types/
│   ├── user.ts
│   └── form.ts
└── styles/
    └── globals.css
```

---

## Configuration Examples

### Next.js 14+ with React 19

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false, // Enable when stable
  },
};

module.exports = nextConfig;
```

### Vite with React 19

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Add React Compiler when ready
        ],
      },
    }),
  ],
});
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vite/client", "node"]
  },
  "include": ["src"]
}
```

### ESLint Configuration

```js
// .eslintrc.js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": "warn",
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    react: {
      version: "19.2",
    },
  },
};
```

---

## Claude Code-Specific Rules

### When Generating Code

1. **Use React 19.2 features appropriately:**
   - `<Activity>` for state-preserving navigation
   - `useEffectEvent` for non-reactive Effect logic
   - `useActionState` for forms
   - `useOptimistic` for instant feedback

2. **TypeScript by default:**
   - Type all props and state
   - Use proper ref types
   - Type action functions

3. **Server Components first:**
   - Default to Server Components
   - Add `'use client'` only when needed
   - Use Server Actions for mutations

4. **Avoid deprecated patterns:**
   - No `forwardRef` in new code
   - No manual pending states for forms
   - No excessive memoization (trust compiler when available)

5. **Performance-conscious:**
   - Use `useTransition` for heavy updates
   - Implement proper Suspense boundaries
   - Use `<Activity>` for navigation patterns

6. **Accessibility:**
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation

### When Refactoring

1. **Replace forwardRef → ref prop**
2. **Convert manual form state → useActionState**
3. **Add optimistic updates → useOptimistic**
4. **Extract Effect events → useEffectEvent**
5. **Add state preservation → `<Activity>`**

---

## Quick Reference

### New Hooks

```tsx
// Activity Component
<Activity mode="visible|hidden">
  <Component />
</Activity>

// Effect Events
const onEvent = useEffectEvent(() => { ... });

// Action State
const [state, action, isPending] = useActionState(fn, initial);

// Optimistic Updates
const [optimistic, setOptimistic] = useOptimistic(state, updateFn);

// Form Status
const { pending, data, method, action } = useFormStatus();

// Resource Reading
const value = use(promiseOrContext);
```

### Key Patterns

```tsx
// Form with Actions
<form action={serverAction}>
  <input name="field" />
  <button>Submit</button>
</form>;

// Optimistic UI
addOptimistic(newValue);
// Later: React auto-reverts on error

// Ref as Prop
function Input({ ref }) {
  return <input ref={ref} />;
}

// Server Component
async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

---

## Resources

- **React 19.2 Release:** https://react.dev/blog/2025/10/01/react-19-2
- **React 19 Docs:** https://react.dev/blog/2024/12/05/react-19
- **Official Docs:** https://react.dev/
- **React Compiler:** https://react.dev/learn/react-compiler

---

## Version History

- **19.2.0** (Oct 1, 2025): Activity, useEffectEvent, Performance Tracks, Partial Pre-rendering
- **19.1.0** (June 2025): Incremental improvements
- **19.0.0** (Dec 5, 2024): Actions, useActionState, useOptimistic, ref as prop, use hook

---

**End of Document**
