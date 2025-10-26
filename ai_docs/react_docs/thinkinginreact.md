# React Component Development Guide for AI Agents

## Overview

This guide outlines the systematic approach to building React components and experiences. Follow these principles to create maintainable, scalable React applications.

---

## The 5-Step Process for Building React UIs

### Step 1: Break the UI into a Component Hierarchy

**Goal:** Decompose the design into logical, reusable components.

**Process:**

1. **Draw boxes** around every component and subcomponent in the mockup
2. **Name each component** descriptively (use PascalCase)
3. **Apply the Single Responsibility Principle**: Each component should ideally do one thing
4. **Map to data structure**: Components should naturally align with your data model

**Decision Framework:**

- **Programming perspective**: Would this be a separate function? Create a component.
- **CSS perspective**: Would this have its own class selector? Consider a component.
- **Design perspective**: Is this a distinct layer or group? Make it a component.

**Example Hierarchy:**

```
FilterableProductTable (root)
├── SearchBar
└── ProductTable
    ├── ProductCategoryRow
    └── ProductRow
```

**When to decompose further:**

- Component has multiple responsibilities
- Component exceeds ~200 lines of code
- Logic becomes hard to follow
- You need to reuse part of it elsewhere

---

### Step 2: Build a Static Version First

**Goal:** Create a working UI without interactivity to establish structure.

**Why static first:**

- Requires typing, not thinking (good for building structure)
- Easier to spot architectural issues
- Adding interactivity later is cleaner

**Implementation:**

1. **Build components** that render UI from props only
2. **No state** at this stage - only props
3. **Choose approach:**
   - **Top-down** (root → leaves): Better for simple apps
   - **Bottom-up** (leaves → root): Better for larger projects

**Key principles:**

```jsx
// ✅ Good: Static component with props
function ProductRow({ product }) {
  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.price}</td>
    </tr>
  );
}

// ❌ Avoid: Using state in static version
function ProductRow({ product }) {
  const [name, setName] = useState(product.name); // Unnecessary!
  return (
    <tr>
      <td>{name}</td>
    </tr>
  );
}
```

**Data flow:**

- One-way data flow: parent → child via props
- Top-level component receives data as props
- Children receive data from parent

---

### Step 3: Find Minimal but Complete UI State

**Goal:** Identify the absolute minimum state needed. Everything else should be computed.

**The DRY Principle (Don't Repeat Yourself):**

- Store minimal state
- Compute derived values on-demand
- Avoid redundant state

**State Identification Test:**
Ask these questions for each piece of data:

1. **Does it remain unchanged over time?** → NOT state (use props or constants)
2. **Is it passed from a parent via props?** → NOT state
3. **Can you compute it from existing state/props?** → NOT state (derive it)

**What's left IS state.**

**Example Analysis:**

```jsx
// Data pieces to consider:
const originalProducts = [...];        // Props (passed in) → NOT state
const searchText = "apple";            // Changes over time → STATE ✓
const isChecked = true;                // Changes over time → STATE ✓
const filteredProducts = [...];        // Computed from above → NOT state

// Minimal state:
const [searchText, setSearchText] = useState('');
const [inStockOnly, setInStockOnly] = useState(false);

// Derived values (computed):
const filteredProducts = products.filter(p =>
  p.name.toLowerCase().includes(searchText.toLowerCase()) &&
  (!inStockOnly || p.stocked)
);
```

---

### Step 4: Identify Where State Should Live

**Goal:** Determine which component owns each piece of state.

**The Algorithm:**
For each piece of state:

1. **Identify** every component that renders something based on that state
2. **Find** their closest common parent component
3. **Decide** where state lives:
   - Often in the common parent
   - Sometimes in a component above the common parent
   - Create a new component if no good place exists

**State Ownership Principles:**

- State lives as low as possible in the tree (but no lower)
- State should be accessible to all components that need it
- State flows down through props

**Example:**

```jsx
// ✅ Good: State in common parent
function FilterableProductTable({ products }) {
  const [filterText, setFilterText] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  return (
    <div>
      <SearchBar filterText={filterText} inStockOnly={inStockOnly} />
      <ProductTable
        products={products}
        filterText={filterText}
        inStockOnly={inStockOnly}
      />
    </div>
  );
}

// ❌ Bad: Duplicated state in siblings
function SearchBar() {
  const [filterText, setFilterText] = useState(""); // ❌
  // ...
}
function ProductTable() {
  const [filterText, setFilterText] = useState(""); // ❌ Duplicate!
  // ...
}
```

---

### Step 5: Add Inverse Data Flow

**Goal:** Allow child components to update parent state (controlled components).

**Pattern: Pass setter functions down**

```jsx
function Parent() {
  const [value, setValue] = useState("");

  return (
    <Child
      value={value}
      onValueChange={setValue} // Pass setter down
    />
  );
}

function Child({ value, onValueChange }) {
  return (
    <input value={value} onChange={(e) => onValueChange(e.target.value)} />
  );
}
```

**Key Concepts:**

- React uses **one-way data flow** by default
- To update parent state from child, pass **handler functions** as props
- Child components call these handlers to trigger state updates
- This makes data flow explicit and traceable

**Naming Convention:**

- State variable: `filterText`
- Setter function: `setFilterText`
- Prop passed to child: `onFilterTextChange={setFilterText}`
- Or simply pass setter: `setFilterText={setFilterText}`

---

## Component Design Principles

### 1. Props vs State

**Props (like function arguments):**

- Passed from parent to child
- Immutable within the receiving component
- Used to configure components
- Can be any type (strings, numbers, objects, functions, components)

```jsx
// Props example
function Button({ color, onClick, children }) {
  return (
    <button style={{ color }} onClick={onClick}>
      {children}
    </button>
  );
}
```

**State (like component memory):**

- Owned by the component
- Can be updated with setter function
- Triggers re-render when changed
- Use for interactive, changing data

```jsx
// State example
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Working Together:**
Parent keeps state, passes to children as props:

```jsx
function Parent() {
  const [color, setColor] = useState("blue");
  return <Button color={color} />; // State → Props
}
```

---

### 2. Component Sizing Guidelines

**Too Small:**

- Just renders a single HTML element with no logic
- Creates unnecessary abstraction
- Harder to trace data flow

**Too Large:**

- Multiple responsibilities (violates SRP)
- Difficult to understand
- Hard to test
- Not reusable

**Just Right:**

- Single, clear responsibility
- 50-200 lines (rough guideline)
- Self-contained logic
- Reusable or organizationally meaningful

---

### 3. Naming Conventions

**Components:** PascalCase

```jsx
function ProductTable() {}
function SearchBar() {}
```

**Props:** camelCase

```jsx
<SearchBar filterText={text} inStockOnly={checked} />
```

**Event handlers:**

- Prop names: `on[Event]` → `onClick`, `onFilterChange`
- Function names: `handle[Event]` → `handleClick`, `handleFilterChange`

```jsx
function Parent() {
  const handleClick = () => {
    /* ... */
  };
  return <Child onClick={handleClick} />;
}

function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>;
}
```

---

## Common Patterns for AI Agents

### Pattern 1: Controlled Components

Always use controlled components for form inputs:

```jsx
function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      value={value} // Controlled by parent
      onChange={(e) => onChange(e.target.value)} // Updates parent
      placeholder="Search..."
    />
  );
}
```

### Pattern 2: Derived State (Compute, Don't Store)

```jsx
// ❌ Bad: Storing derived data
const [products, setProducts] = useState(allProducts);
const [filteredProducts, setFilteredProducts] = useState(allProducts);

// ✅ Good: Computing derived data
const [products, setProducts] = useState(allProducts);
const [filterText, setFilterText] = useState("");
const filteredProducts = products.filter((p) => p.name.includes(filterText));
```

### Pattern 3: Lifting State Up

When siblings need shared state, move it to their common parent:

```jsx
// ✅ Good: State in parent
function Parent() {
  const [value, setValue] = useState("");
  return (
    <>
      <ChildA value={value} onChange={setValue} />
      <ChildB value={value} />
    </>
  );
}
```

### Pattern 4: Component Composition

Use `children` prop for flexible components:

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// Usage:
<Card title="Products">
  <ProductList />
</Card>;
```

### Pattern 5: Conditional Rendering

```jsx
// Early return for loading/error states
function UserProfile({ userId }) {
  if (!userId) return <div>Please log in</div>;

  const user = fetchUser(userId);
  if (!user) return <div>Loading...</div>;

  return <div>{user.name}</div>;
}

// Ternary for inline conditions
{
  isLoggedIn ? <LogoutButton /> : <LoginButton />;
}

// Logical AND for conditional display
{
  hasError && <ErrorMessage />;
}
```

---

## Checklist for Creating New Components

### Before Writing Code:

- [ ] Understand the UI mockup/requirements
- [ ] Identify component boundaries
- [ ] Map components to data structure
- [ ] Plan the component hierarchy
- [ ] Identify what data each component needs

### While Building:

- [ ] Build static version first (props only)
- [ ] Verify UI renders correctly with sample data
- [ ] Identify minimal state needed
- [ ] Determine where state should live
- [ ] Add interactivity (event handlers)
- [ ] Test data flow (parent → child → parent)

### Code Quality:

- [ ] Each component has single responsibility
- [ ] Props are properly typed (if using TypeScript)
- [ ] No redundant state (compute derived values)
- [ ] Meaningful component and prop names
- [ ] Event handlers follow naming convention
- [ ] Keys added to list items

### Before Finishing:

- [ ] No console errors or warnings
- [ ] Components are reusable (not overly specific)
- [ ] Data flow is clear and traceable
- [ ] No prop drilling beyond 2-3 levels (consider context)

---

## Anti-Patterns to Avoid

### 1. Prop Drilling

**Problem:** Passing props through many levels

```jsx
// ❌ Bad
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data}>
      <GrandChild data={data} />
```

**Solution:** Context API or state management library for deeply nested data

### 2. Duplicated State

```jsx
// ❌ Bad
const [products, setProducts] = useState(data);
const [productCount, setProductCount] = useState(data.length);

// ✅ Good
const [products, setProducts] = useState(data);
const productCount = products.length; // Derived!
```

### 3. Mutating State Directly

```jsx
// ❌ Bad
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Direct mutation!
setItems(items);

// ✅ Good
setItems([...items, 4]); // New array
```

### 4. Using Index as Key

```jsx
// ❌ Bad (when list can reorder)
{
  items.map((item, index) => <Item key={index} />);
}

// ✅ Good (use stable identifier)
{
  items.map((item) => <Item key={item.id} />);
}
```

### 5. Too Many Props

```jsx
// ❌ Bad (too many individual props)
<UserCard name={name} email={email} age={age} avatar={avatar} bio={bio} />

// ✅ Good (pass object)
<UserCard user={user} />
```

---

## State Management Decision Tree

```
Is the data needed by multiple components?
├─ No → Keep state local in the component
└─ Yes → Is it needed by siblings?
    ├─ Yes → Lift to common parent
    └─ No → Is it needed globally?
        ├─ Yes → Use Context API or state management library
        └─ No → Keep in parent, pass down
```

---

## Quick Reference

### useState Hook

```jsx
const [state, setState] = useState(initialValue);

// Update state
setState(newValue); // Direct value
setState((prev) => prev + 1); // Function form (use for updates based on previous state)
```

### Common Event Handlers

```jsx
onChange={(e) => setValue(e.target.value)}     // Input/textarea
onChange={(e) => setChecked(e.target.checked)} // Checkbox
onClick={() => handleClick()}                   // Button
onSubmit={(e) => { e.preventDefault(); ... }}  // Form
```

### Conditional Rendering

```jsx
{
  condition && <Component />;
} // Show if true
{
  condition ? <CompA /> : <CompB />;
} // Either/or
{
  condition ? <Comp /> : null;
} // Show if true (explicit)
```

---

## Best Practices Summary

1. **Think in components** - Break UI into hierarchy before coding
2. **Build static first** - Structure before interactivity
3. **Minimize state** - Compute derived values, don't store them
4. **One-way data flow** - Parent → child via props, child → parent via callbacks
5. **Single responsibility** - Each component does one thing well
6. **Controlled components** - Always control form inputs with state
7. **Meaningful names** - Clear, descriptive names for components and props
8. **DRY principle** - Don't repeat yourself, especially with state
9. **Composition over complexity** - Use `children` and composition patterns
10. **Test data flow** - Ensure state updates flow correctly through the tree

---

## Example: Complete Component Creation Process

Let's build a `FilterableList` component from scratch:

### 1. Define the hierarchy

```
FilterableList (root)
├── SearchInput
└── ItemList
    └── ListItem
```

### 2. Static version

```jsx
function ListItem({ item }) {
  return <li>{item.name}</li>;
}

function ItemList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <ListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

function SearchInput() {
  return <input type="text" placeholder="Search..." />;
}

function FilterableList({ items }) {
  return (
    <div>
      <SearchInput />
      <ItemList items={items} />
    </div>
  );
}
```

### 3. Identify state

- Search text → STATE (changes, can't compute)
- Filtered items → NOT state (computed from items + search text)

### 4. Add state to parent

```jsx
function FilterableList({ items }) {
  const [searchText, setSearchText] = useState("");

  return (
    <div>
      <SearchInput searchText={searchText} />
      <ItemList items={items} searchText={searchText} />
    </div>
  );
}
```

### 5. Add interactivity (inverse data flow)

```jsx
function SearchInput({ searchText, onSearchChange }) {
  return (
    <input
      type="text"
      value={searchText}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search..."
    />
  );
}

function ItemList({ items, searchText }) {
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ul>
      {filteredItems.map((item) => (
        <ListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

function FilterableList({ items }) {
  const [searchText, setSearchText] = useState("");

  return (
    <div>
      <SearchInput searchText={searchText} onSearchChange={setSearchText} />
      <ItemList items={items} searchText={searchText} />
    </div>
  );
}
```

**Done!** Clear hierarchy, minimal state, explicit data flow.

---

## Resources

- [React Official Docs - Thinking in React](https://react.dev/learn/thinking-in-react)
- [React Hooks Reference](https://react.dev/reference/react)
- [Component Composition Patterns](https://react.dev/learn/passing-props-to-a-component)

---

_Last updated: October 2025_
