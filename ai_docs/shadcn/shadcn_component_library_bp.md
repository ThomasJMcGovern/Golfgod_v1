# shadcn/ui Component Library Best Practices

> A comprehensive guide for coding agents on creating, editing, and maintaining an effective shadcn/ui component library

## Table of Contents

1. [Philosophy & Core Principles](#philosophy--core-principles)
2. [Project Setup & Configuration](#project-setup--configuration)
3. [Component Creation Guidelines](#component-creation-guidelines)
4. [Styling & Customization](#styling--customization)
5. [Component Maintenance](#component-maintenance)
6. [Advanced Patterns](#advanced-patterns)
7. [Testing & Quality Assurance](#testing--quality-assurance)
8. [Publishing & Sharing](#publishing--sharing)
9. [Common Pitfalls](#common-pitfalls)

---

## Philosophy & Core Principles

### The shadcn/ui Paradigm Shift

shadcn/ui represents a fundamental departure from traditional component libraries. Instead of installing packages, **you own the component source code**.

#### Four Pillars of shadcn/ui

1. **Copy, Don't Install**

   - Components are copied into your codebase, not installed as dependencies
   - You have complete ownership and control over every line of code
   - No vendor lock-in or mysterious black-box behavior
   - Updates are explicit and controlled, not automatic

2. **Built on Primitives, Not Opinions**

   - Foundation: Radix UI primitives provide behavior (accessibility, keyboard navigation, focus management)
   - Middle Layer: shadcn/ui provides beautiful, opinionated styling
   - Top Layer: Your project owns the final implementation
   - Clear separation of concerns between behavior and appearance

3. **Design System as Code**

   - Design tokens implemented as CSS custom properties
   - Semantic naming convention (`--primary`, `--background`) over appearance-based (`--blue-500`)
   - Theme switching without React re-renders
   - Systematic approach to variants using `class-variance-authority`

4. **Community-Driven Registry**
   - Components can be shared without creating dependencies
   - Anyone can create and publish components
   - Vibrant ecosystem while maintaining code ownership

### Key Advantages

- ✅ **Complete Control**: Modify any aspect of any component
- ✅ **Zero Abstraction**: See exactly how components work
- ✅ **Design Flexibility**: No fighting against imposed design decisions
- ✅ **Learning by Doing**: Understanding components through direct access to source
- ✅ **Bundle Optimization**: Only include what you use, tree-shake everything else

### Trade-offs to Understand

- ⚠️ Manual update responsibility (no automatic package updates)
- ⚠️ Need to track upstream changes yourself
- ⚠️ More files in your codebase
- ⚠️ Requires understanding of component architecture

**The Trade-off Balance**: For projects with specific design requirements or long-term maintenance needs, code ownership is strongly favorable.

---

## Project Setup & Configuration

### Prerequisites

```bash
# Required
- Next.js with TypeScript support
- Tailwind CSS configured
- Node.js 18 or higher
```

### Initialize shadcn/ui

```bash
npx shadcn@latest init
```

**CLI Configuration Prompts:**

- Style: `default` or `new-york`
- Base color: Choose from slate, gray, zinc, neutral, stone
- CSS variables: Recommended `true` for theming flexibility
- React Server Components: `true` for Next.js App Router
- Import alias: Default `@/` recommended

### Understanding `components.json`

This is the **central nervous system** of your shadcn/ui setup.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

**Key Configuration Points:**

- **`style`**: Visual style preset (`default` or `new-york`)
- **`rsc`**: Enable React Server Components
- **`tsx`**: Use TypeScript (always recommended)
- **`tailwind.css`**: Path to global CSS file (CSS variables added here)
- **`baseColor`**: Determines neutral color palette
- **`cssVariables`**: Enable CSS custom property-based theming (highly recommended)
- **`aliases`**: Configure import paths

**Important**: Changes to `components.json` only affect **newly added** components. Existing components must be manually updated.

### Project Structure

```
your-project/
├── components/
│   └── ui/              # shadcn/ui components live here
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   └── utils.ts         # cn() utility and helpers
├── app/
│   └── globals.css      # CSS variables and base styles
└── components.json      # Configuration file
```

---

## Component Creation Guidelines

### Adding Components from Registry

```bash
# Add single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button card dialog

# Add from community registry
npx shadcn@latest add --registry https://example.com/registry/component.json
```

**What Happens Behind the Scenes:**

1. CLI downloads component source from registry
2. Installs required dependencies (e.g., Radix UI primitives)
3. Creates component file in configured location
4. Adds necessary imports and utilities

### Creating Custom Components

When building custom components that aren't available in the registry, follow these patterns to maintain consistency with the shadcn/ui ecosystem.

#### Component Structure Template

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1. Define variants using CVA
const componentVariants = cva(
  // Base classes (always applied)
  "base-class-1 base-class-2",
  {
    variants: {
      variant: {
        default: "variant-class-1",
        secondary: "variant-class-2",
      },
      size: {
        default: "size-class-1",
        sm: "size-class-2",
        lg: "size-class-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2. Define component interface
export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Additional custom props
  customProp?: string;
}

// 3. Implement component
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, customProp, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Component.displayName = "Component";

export { Component, componentVariants };
```

#### Best Practices for Custom Components

**1. Use Radix Primitives When Possible**

```typescript
// Good: Build on Radix primitive
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(({ className, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    className={cn("tooltip-styles", className)}
    {...props}
  />
));
```

**2. Maintain Design Token Consistency**

```typescript
// Use CSS custom properties from theme
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        destructive: "border-destructive",
      },
    },
  }
);
```

**3. Implement Proper Accessibility**

```typescript
// Always include ARIA attributes
<button
  ref={ref}
  type="button"
  role="button"
  aria-label={ariaLabel}
  aria-pressed={isPressed}
  aria-disabled={disabled}
  className={cn(buttonVariants({ variant, size, className }))}
  {...props}
/>
```

**4. Use Composition Over Configuration**

```typescript
// Good: Composable components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>

// Avoid: Monolithic prop-heavy components
<Card
  title="Title"
  description="Description"
  content="Content"
  showFooter={true}
  footerContent="Footer"
/>
```

**5. Forward Refs Consistently**

```typescript
// Always use React.forwardRef for DOM elements
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <button ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
```

#### Example: Custom MetricCard Component

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const metricCardVariants = cva(
  "rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-colors",
  {
    variants: {
      trend: {
        up: "border-l-4 border-l-emerald-500",
        down: "border-l-4 border-l-rose-500",
        neutral: "border-l-4 border-l-slate-500",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      trend: "neutral",
      size: "default",
    },
  }
);

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    { className, trend, size, title, value, change, description, ...props },
    ref
  ) => {
    const trendIcon =
      trend === "up" ? ArrowUpIcon : trend === "down" ? ArrowDownIcon : null;

    return (
      <div
        ref={ref}
        className={cn(metricCardVariants({ trend, size, className }))}
        role="article"
        aria-label={`Metric card for ${title}`}
        {...props}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{value}</p>
            {change !== undefined && trendIcon && (
              <span
                className={cn(
                  "flex items-center text-sm font-medium",
                  trend === "up" && "text-emerald-600",
                  trend === "down" && "text-rose-600"
                )}
              >
                {React.createElement(trendIcon, { className: "h-4 w-4" })}
                {Math.abs(change)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );
  }
);
MetricCard.displayName = "MetricCard";

export { MetricCard, metricCardVariants };
```

---

## Styling & Customization

### Three Levels of Customization

#### Level 1: Utility Class Additions (One-off Customization)

Add Tailwind classes directly to component instances.

```tsx
// Quick, specific changes
<Button className="w-full mt-4">
  Full Width Button
</Button>

<Card className="hover:shadow-lg transition-shadow">
  Interactive Card
</Card>
```

**When to Use:**

- One-off styling needs
- Page-specific adjustments
- Rapid prototyping

#### Level 2: Design Token Modifications (Systematic Theming)

Modify CSS custom properties in `globals.css`.

```css
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --radius: 0.5rem;
  }

  .dark {
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}
```

**When to Use:**

- Brand color changes
- Theme modifications
- Consistent system-wide updates

#### Level 3: Component Source Editing (Project-wide Changes)

Directly modify component files in `components/ui/`.

```typescript
// button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Add custom variant
        brand: "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
      },
    },
  }
);
```

**When to Use:**

- Adding new variants
- Changing default behavior
- Project-specific patterns

### The `cn()` Utility

Essential for conditional styling and merging class names.

```typescript
import { cn } from "@/lib/utils"

// Conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes",
  className
)} />

// Merging classes with precedence
<Button className={cn("default-styles", customClassName)} />
```

### CSS Variable Architecture

shadcn/ui uses a **layered, semantic approach** to CSS variables:

```css
/* Layer 1: Color Foundation (OKLCH for perceptual uniformity) */
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
}

/* Layer 2: Contextual Usage */
:root {
  --background: var(--primary);
  --foreground: var(--primary-foreground);
  --card: var(--secondary);
  --card-foreground: var(--secondary-foreground);
}

/* Layer 3: Component-Specific */
.button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

**Benefits:**

- **Maintainability**: Change theme by updating variable definitions
- **Consistency**: Related elements automatically share visual relationships
- **Flexibility**: Add themes without touching component code
- **Performance**: Theme switching via CSS cascade (no React re-renders)

---

## Component Maintenance

### Update Strategy

**Understanding the Ownership Model:**

- You own the component code → You control updates
- No automatic updates → Explicit, controlled changes
- Stability over convenience → No breaking changes surprise you

### Tracking Upstream Changes

```bash
# Check for component updates
npx shadcn@latest diff button

# View what changed in the registry
npx shadcn@latest diff
```

### Update Approaches

#### Approach 1: Full Component Replacement (Simple Components)

Use when: Component has minimal customization

```bash
# Backup current component
cp components/ui/button.tsx components/ui/button.backup.tsx

# Fetch updated version
npx shadcn@latest add button --overwrite

# Review changes and manually reapply customizations
```

#### Approach 2: Manual Merge (Customized Components)

Use when: Component has significant customizations

```bash
# Add updated component to temporary location
npx shadcn@latest add button --path components/temp

# Manual comparison and merge
# Use git diff or editor diff tool
code --diff components/ui/button.tsx components/temp/button.tsx
```

#### Approach 3: Proxy Pattern (Advanced)

Pre-compose or proxy components to make updates easier.

```typescript
// components/custom/button.tsx
import { Button as ShadcnButton, ButtonProps } from "@/components/ui/button";

export function Button({ children, ...props }: ButtonProps) {
  // Add your customizations
  return (
    <ShadcnButton className="custom-base-styles" {...props}>
      {children}
    </ShadcnButton>
  );
}
```

**Trade-off**: Doubles component size, makes ownership concept less direct.

### Version Control Best Practices

```bash
# Track component additions
git add components/ui/button.tsx
git commit -m "feat: add Button component from shadcn/ui"

# Track modifications
git commit -m "style(button): add brand variant for marketing pages"

# Track updates
git commit -m "chore(button): update to latest shadcn/ui version"
```

### When to Update vs. Fork

**Update When:**

- Bug fixes in registry
- Security patches
- Accessibility improvements
- New features you want

**Fork/Maintain Separately When:**

- Heavy customization makes merging impractical
- Component behavior significantly differs
- You've created derivative components

---

## Advanced Patterns

### Compound Components

Create flexible, maintainable APIs by distributing responsibility across multiple cooperating components.

```typescript
// Context for sharing state
const CardContext = React.createContext<CardContextValue | undefined>(undefined)

const useCardContext = () => {
  const context = React.useContext(CardContext)
  if (!context) {
    throw new Error("Card components must be used within Card.Root")
  }
  return context
}

// Root component provides context
const CardRoot = ({ collapsible, children }: CardRootProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <CardContext.Provider value={{ isCollapsed, setIsCollapsed, collapsible }}>
      <div className="card-root">{children}</div>
    </CardContext.Provider>
  )
}

// Child components consume context
const CardHeader = ({ children }: CardHeaderProps) => {
  const { isCollapsed, setIsCollapsed, collapsible } = useCardContext()

  return (
    <div className="card-header">
      {children}
      {collapsible && (
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          Toggle
        </button>
      )}
    </div>
  )
}

const CardContent = ({ children }: CardContentProps) => {
  const { isCollapsed } = useCardContext()

  if (isCollapsed) return null

  return <div className="card-content">{children}</div>
}

// Export as namespace for clean API
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
}

// Usage
<Card.Root collapsible>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Content that can be collapsed
  </Card.Content>
</Card.Root>
```

**Benefits:**

- ✅ Flexible, declarative API
- ✅ Clear component relationships
- ✅ Shared state without prop drilling
- ✅ Scalable architecture

### useControllableState Pattern

For components that can be both controlled and uncontrolled:

```typescript
import { useControllableState } from "@radix-ui/react-use-controllable-state"

interface ToggleProps {
  value?: boolean           // Controlled
  defaultValue?: boolean    // Uncontrolled initial value
  onValueChange?: (value: boolean) => void
}

function Toggle({ value, defaultValue, onValueChange }: ToggleProps) {
  const [isToggled, setIsToggled] = useControllableState({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
  })

  return (
    <button onClick={() => setIsToggled(!isToggled)}>
      {isToggled ? "On" : "Off"}
    </button>
  )
}

// Uncontrolled usage
<Toggle defaultValue={false} />

// Controlled usage
<Toggle value={isOpen} onValueChange={setIsOpen} />
```

### CSS Variables for Dynamic Functionality

Use CSS custom properties for runtime style changes:

```typescript
interface ProgressProps {
  value: number
  max?: number
}

function Progress({ value, max = 100 }: ProgressProps) {
  const percentage = (value / max) * 100

  return (
    <div
      className="progress-bar"
      style={{
        "--progress-value": `${percentage}%`
      } as React.CSSProperties}
    >
      <div className="progress-indicator" />
    </div>
  )
}

/* CSS */
.progress-bar {
  --progress-value: 0%;
  position: relative;
  background: hsl(var(--secondary));
}

.progress-indicator {
  width: var(--progress-value);
  background: hsl(var(--primary));
  transition: width 0.3s ease;
}
```

### Tailwind Arbitrary Groups for Synthetic Props

Create variant-like behavior without class-variance-authority:

```typescript
interface CardProps {
  highlight?: "purple" | "blue" | "green";
}

function Card({ highlight, children }: CardProps) {
  return (
    <div
      className={cn(
        "card-base",
        highlight && `group-[highlight-${highlight}]:border-l-4`
      )}
      data-highlight={highlight}
    >
      {children}
    </div>
  );
}
```

---

## Testing & Quality Assurance

### Component Testing Strategy

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive");
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards refs correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

### Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

describe("Dialog Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has proper ARIA attributes", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby");
  });
});
```

### Compound Component Testing

```typescript
describe("Card Compound Component", () => {
  it("shares context between components", () => {
    render(
      <Card.Root collapsible>
        <Card.Header>
          <Card.Title>Test</Card.Title>
        </Card.Header>
        <Card.Content data-testid="content">Content</Card.Content>
      </Card.Root>
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();

    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });
});
```

---

## Publishing & Sharing

### Creating a Component Registry File

Registry files allow others to install your components via the shadcn CLI.

```json
{
  "name": "metric-card",
  "type": "registry:ui",
  "description": "A card component for displaying metrics with trends",
  "dependencies": ["lucide-react"],
  "registryDependencies": ["card"],
  "files": [
    {
      "path": "ui/metric-card.tsx",
      "content": "... component code here ...",
      "type": "registry:ui",
      "target": "components/ui/metric-card.tsx"
    }
  ]
}
```

### Quick Publishing with Vercel

**Step 1: Create folder structure**

```
my-component/
├── public/
│   └── metric-card.json
└── vercel.json
```

**Step 2: Add `vercel.json`**

```json
{
  "headers": [
    {
      "source": "/(.*).json",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  ]
}
```

**Step 3: Deploy to Vercel**

```bash
vercel deploy
```

**Step 4: Install your component**

```bash
npx shadcn@latest add --registry https://your-deployment.vercel.app/metric-card.json
```

### Documentation Best Practices

Create comprehensive component documentation:

```markdown
# MetricCard Component

## Usage

\`\`\`tsx
import { MetricCard } from "@/components/ui/metric-card"

<MetricCard
  title="Total Revenue"
  value="$45,231"
  change={12}
  trend="up"
  description="Compared to last month"
/>
\`\`\`

## Props

| Prop        | Type                        | Default   | Description        |
| ----------- | --------------------------- | --------- | ------------------ |
| title       | string                      | required  | Metric label       |
| value       | string \| number            | required  | Main metric value  |
| change      | number                      | -         | Percentage change  |
| trend       | "up" \| "down" \| "neutral" | "neutral" | Trend direction    |
| description | string                      | -         | Additional context |

## Variants

- **size**: `default`, `sm`, `lg`
- **trend**: `up`, `down`, `neutral`

## Examples

[Include various usage examples]
```

---

## Common Pitfalls

### ❌ Don't: Import from Package Instead of Local

```typescript
// Wrong
import { Button } from "shadcn-ui";

// Correct
import { Button } from "@/components/ui/button";
```

### ❌ Don't: Modify Components Without Version Control

Always commit components when added and track changes:

```bash
# Good practice
git add components/ui/button.tsx
git commit -m "feat: add button component"
```

### ❌ Don't: Mix Styling Approaches

```typescript
// Inconsistent
<Button className="bg-blue-500"> // Direct Tailwind color
  Click me
</Button>

// Consistent with design system
<Button className="bg-primary">
  Click me
</Button>
```

### ❌ Don't: Ignore Accessibility

```typescript
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<button
  type="button"
  onClick={handleClick}
  aria-label="Descriptive label"
>
  Click me
</button>
```

### ❌ Don't: Create Monolithic Components

```typescript
// Bad - Too many props
<DataTable
  columns={columns}
  data={data}
  pagination={true}
  pageSize={10}
  sorting={true}
  filtering={true}
  rowSelection={true}
  // 20+ more props...
/>

// Good - Composable
<DataTable>
  <DataTableHeader>
    <DataTableColumn>Name</DataTableColumn>
  </DataTableHeader>
  <DataTableBody>
    {data.map(row => (
      <DataTableRow key={row.id}>
        <DataTableCell>{row.name}</DataTableCell>
      </DataTableRow>
    ))}
  </DataTableBody>
</DataTable>
```

### ❌ Don't: Skip TypeScript Types

```typescript
// Bad
export function Card({ children, className }) {
  // ...
}

// Good
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  // ...
}
```

---

## Quick Reference Checklist

### Adding a New Component

- [ ] Run `npx shadcn@latest add <component-name>`
- [ ] Commit the added component
- [ ] Review component structure and dependencies
- [ ] Test component in isolation
- [ ] Document component usage

### Creating a Custom Component

- [ ] Use CVA for variants
- [ ] Implement `React.forwardRef`
- [ ] Set `displayName`
- [ ] Use design system tokens (CSS variables)
- [ ] Include TypeScript types
- [ ] Add ARIA attributes
- [ ] Write tests
- [ ] Document API

### Updating a Component

- [ ] Check for upstream changes
- [ ] Back up current version
- [ ] Review changes carefully
- [ ] Test thoroughly
- [ ] Commit with descriptive message

### Styling Best Practices

- [ ] Use `cn()` utility for class merging
- [ ] Prefer CSS variables over hard-coded values
- [ ] Use semantic token names
- [ ] Maintain consistent variant structure
- [ ] Follow Tailwind utility-first approach

### Before Publishing

- [ ] Create registry JSON file
- [ ] Test installation process
- [ ] Write comprehensive documentation
- [ ] Include usage examples
- [ ] Add TypeScript types
- [ ] Verify accessibility
- [ ] Check responsive behavior

---

## Resources

- **Official Documentation**: https://ui.shadcn.com
- **Radix UI Primitives**: https://www.radix-ui.com
- **Component Registry Spec**: https://components.build
- **Tailwind CSS**: https://tailwindcss.com
- **class-variance-authority**: https://cva.style

---

## Summary

shadcn/ui represents a paradigm shift in component library architecture. By embracing **code ownership over package dependencies**, it provides:

1. **Complete Control**: You own every line of component code
2. **Zero Abstraction**: Transparent, inspectable implementations
3. **Design Flexibility**: Customize without fighting framework limitations
4. **Production Ready**: Built on battle-tested Radix primitives
5. **Community Driven**: Share components without creating dependencies

**For coding agents**, the key principles are:

- Maintain design system consistency through CSS variables
- Follow established patterns (CVA, forwardRef, composition)
- Prioritize accessibility with proper ARIA attributes
- Use TypeScript for type safety
- Test components thoroughly
- Document comprehensively

This approach creates maintainable, scalable, and flexible component libraries that grow with your application's needs.
