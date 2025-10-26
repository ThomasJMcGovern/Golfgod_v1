# Mobile-First Next.js Development Guide

## Table of Contents

1. [Mobile-First Principles](#mobile-first-principles)
2. [Next.js Mobile Optimization](#nextjs-mobile-optimization)
3. [Performance Strategies](#performance-strategies)
4. [Debugging Mobile Issues](#debugging-mobile-issues)
5. [Refactoring Patterns](#refactoring-patterns)
6. [Common Pitfalls](#common-pitfalls)
7. [Testing Mobile Experiences](#testing-mobile-experiences)

---

## Mobile-First Principles

### Core Philosophy

- Design for mobile screens first, then progressively enhance for larger screens
- Touch targets minimum 44×44px (iOS) or 48×48px (Android)
- Prioritize content hierarchy for narrow viewports
- Optimize for one-handed use when possible

### CSS Strategy

```css
/* Mobile-first: Base styles are mobile */
.component {
  padding: 1rem;
  font-size: 1rem;
}

/* Progressive enhancement for larger screens */
@media (min-width: 768px) {
  .component {
    padding: 2rem;
    font-size: 1.125rem;
  }
}

@media (min-width: 1024px) {
  .component {
    padding: 3rem;
    font-size: 1.25rem;
  }
}
```

### Responsive Breakpoints (Tailwind-style)

- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (desktops)
- `xl`: 1280px (large desktops)
- `2xl`: 1536px (extra large)

---

## Next.js Mobile Optimization

### Image Optimization

```tsx
import Image from "next/image";

// Always use Next.js Image component
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
  quality={75} // 75-80 is optimal for most cases
/>;
```

### Font Loading

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevents invisible text during load
  preload: true,
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Metadata for Mobile

```tsx
// app/layout.tsx or page.tsx
export const metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5, // Allow zoom for accessibility
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "App Name",
  },
  manifest: "/manifest.json",
};
```

### Route Optimization

```tsx
// Use dynamic imports for heavy components
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  ssr: false, // Skip SSR for client-only components
  loading: () => <ChartSkeleton />,
});

// Route segments
// app/[locale]/(marketing)/page.tsx - Group routes without URL segment
// app/dashboard/@modal/(..)photo/[id]/page.tsx - Parallel + intercepting routes
```

### Data Fetching Patterns

```tsx
// Server Components (default in App Router)
async function MobileProducts() {
  const products = await fetchProducts();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Client Components with Suspense
("use client");
import { Suspense } from "react";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <MobileProducts />
    </Suspense>
  );
}
```

---

## Performance Strategies

### Critical Performance Metrics

- **FCP (First Contentful Paint)**: < 1.8s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms
- **INP (Interaction to Next Paint)**: < 200ms

### Bundle Optimization

```js
// next.config.js
module.exports = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Analyze bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // Enable experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui"],
  },
};
```

### Lazy Loading Strategies

```tsx
// Intersection Observer for lazy components
"use client";
import { useEffect, useRef, useState } from "react";

function LazySection({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible ? children : <div className="h-96" />}</div>;
}
```

### Service Worker (PWA)

```js
// public/sw.js
const CACHE_NAME = "v1";
const urlsToCache = ["/", "/styles/main.css", "/scripts/main.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

---

## Debugging Mobile Issues

### Chrome DevTools Mobile Emulation

```bash
# Open DevTools with mobile device toolbar
# Toggle device toolbar: Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)

# Test different devices:
- iPhone SE (375×667)
- iPhone 14 Pro (393×852)
- Samsung Galaxy S23 (360×800)
- iPad Air (820×1180)

# Enable throttling:
- Fast 3G (100ms RTT, 1.6Mbps down, 750kbps up)
- Slow 3G (400ms RTT, 400kbps down, 400kbps up)
```

### Remote Debugging

```bash
# iOS Safari (requires Mac + physical device)
1. Enable Web Inspector on iOS: Settings > Safari > Advanced > Web Inspector
2. Connect device via USB
3. Safari > Develop > [Your Device] > [Page]

# Android Chrome
1. Enable USB debugging on Android
2. chrome://inspect#devices
3. Click "inspect" on your device
```

### Debug Logging for Mobile

```tsx
// utils/debug.ts
const IS_MOBILE =
  typeof window !== "undefined" &&
  /iPhone|iPad|Android/i.test(navigator.userAgent);

export const mobileLog = (...args: any[]) => {
  if (IS_MOBILE && process.env.NODE_ENV === "development") {
    // Visual debug overlay
    const debugEl =
      document.getElementById("mobile-debug") || createDebugOverlay();
    const message = args.map((a) => JSON.stringify(a)).join(" ");
    debugEl.innerHTML += `<div>${new Date().toISOString()}: ${message}</div>`;
    console.log("[MOBILE]", ...args);
  }
};

function createDebugOverlay() {
  const el = document.createElement("div");
  el.id = "mobile-debug";
  el.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0,0,0,0.9);
    color: #0f0;
    font-family: monospace;
    font-size: 10px;
    padding: 8px;
    z-index: 999999;
  `;
  document.body.appendChild(el);
  return el;
}
```

### Touch Event Debugging

```tsx
"use client";
import { useEffect } from "react";

export function TouchDebugger() {
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      console.log("Touch:", {
        type: e.type,
        x: touch.clientX,
        y: touch.clientY,
        target: (e.target as HTMLElement).tagName,
      });
    };

    document.addEventListener("touchstart", handleTouch);
    document.addEventListener("touchmove", handleTouch);
    document.addEventListener("touchend", handleTouch);

    return () => {
      document.removeEventListener("touchstart", handleTouch);
      document.removeEventListener("touchmove", handleTouch);
      document.removeEventListener("touchend", handleTouch);
    };
  }, []);

  return null;
}
```

### Performance Monitoring

```tsx
// hooks/usePerformanceMonitor.ts
"use client";
import { useEffect } from "react";

export function usePerformanceMonitor(routeName: string) {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`[${routeName}] ${entry.name}:`, entry);

          // Send to analytics
          if (entry.entryType === "largest-contentful-paint") {
            // Track LCP
          } else if (entry.entryType === "first-input") {
            // Track FID
          } else if (entry.entryType === "layout-shift") {
            // Track CLS
          }
        }
      });

      observer.observe({
        entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"],
      });

      return () => observer.disconnect();
    }
  }, [routeName]);
}
```

---

## Refactoring Patterns

### Component Splitting

```tsx
// ❌ Bad: Large monolithic component
function ProductPage({ product }) {
  return (
    <div>
      <header>{/* Complex header */}</header>
      <div>{/* Gallery */}</div>
      <div>{/* Details */}</div>
      <div>{/* Reviews */}</div>
      <div>{/* Related products */}</div>
    </div>
  );
}

// ✅ Good: Split into focused components
function ProductPage({ product }) {
  return (
    <div>
      <ProductHeader product={product} />
      <ProductGallery images={product.images} />
      <ProductDetails details={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={product.id} />
      </Suspense>
      <LazySection>
        <RelatedProducts categoryId={product.categoryId} />
      </LazySection>
    </div>
  );
}
```

### Server vs Client Components

```tsx
// Identify what needs to be client-side
// ✅ Server Component (default)
async function ProductList() {
  const products = await db.products.findMany();
  return products.map((p) => <ProductCard key={p.id} product={p} />);
}

// ✅ Client Component (only when needed)
("use client");
function AddToCartButton({ productId }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    await addToCart(productId);
    setIsLoading(false);
  }

  return <button onClick={handleClick}>Add to Cart</button>;
}

// ✅ Combine: Server Component wraps Client Component
async function ProductCard({ product }) {
  return (
    <article>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <AddToCartButton productId={product.id} />
    </article>
  );
}
```

### State Management Refactoring

```tsx
// ❌ Bad: Prop drilling
function App() {
  const [user, setUser] = useState(null);
  return (
    <Layout user={user} setUser={setUser}>
      ...
    </Layout>
  );
}

// ✅ Good: Context for global state
("use client");
const UserContext = createContext(null);

export function UserProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// ✅ Better: Server-side user context
import { cookies } from "next/headers";

async function getUserFromSession() {
  const session = cookies().get("session");
  return await validateSession(session);
}

// In layout.tsx
export default async function Layout({ children }) {
  const user = await getUserFromSession();
  return <UserProvider initialUser={user}>{children}</UserProvider>;
}
```

### CSS Refactoring for Mobile

```tsx
// ❌ Bad: Desktop-first with overrides
<div className="grid grid-cols-4 gap-8 text-xl p-12 md:grid-cols-2 sm:grid-cols-1 sm:text-base sm:p-4">

// ✅ Good: Mobile-first with enhancements
<div className="grid grid-cols-1 gap-4 p-4 text-base sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8 lg:text-xl lg:p-12">

// ✅ Better: Semantic component with responsive variants
<ResponsiveGrid
  cols={{ base: 1, sm: 2, lg: 4 }}
  gap={{ base: 4, sm: 6, lg: 8 }}
  className="p-4 text-base lg:text-xl lg:p-12"
>
```

### Accessibility Refactoring

```tsx
// ❌ Bad: Poor mobile accessibility
<div onClick={handleClick}>
  <img src="/icon.png" />
</div>

// ✅ Good: Semantic, accessible, mobile-friendly
<button
  onClick={handleClick}
  className="min-h-[44px] min-w-[44px] flex items-center justify-center"
  aria-label="Submit form"
>
  <Image src="/icon.png" alt="" width={24} height={24} />
</button>
```

---

## Common Pitfalls

### 1. Viewport Units on Mobile

```css
/* ❌ Problem: vh doesn't account for mobile browser chrome */
.hero {
  height: 100vh; /* Includes/excludes address bar unpredictably */
}

/* ✅ Solution: Use dvh (dynamic viewport height) */
.hero {
  height: 100dvh; /* Adjusts as browser chrome appears/disappears */
  min-height: -webkit-fill-available; /* Fallback for older browsers */
}
```

### 2. Touch Event Conflicts

```tsx
// ❌ Problem: Both mouse and touch events fire
<div
  onMouseDown={handleStart}
  onTouchStart={handleStart}
  onClick={handleClick}
>

// ✅ Solution: Use pointer events or check event type
<div
  onPointerDown={handleStart} // Unified event
  onClick={handleClick}
>

// Or check event type
function handleStart(e: React.TouchEvent | React.MouseEvent) {
  e.preventDefault() // Prevent mouse events after touch
  // ...
}
```

### 3. Fixed Positioning Issues

```css
/* ❌ Problem: Fixed elements break with iOS keyboard */
.bottom-bar {
  position: fixed;
  bottom: 0;
}

/* ✅ Solution: Use sticky or detect keyboard */
.bottom-bar {
  position: sticky;
  bottom: 0;
}

/* Or detect virtual keyboard */
@media (max-height: 500px) {
  .bottom-bar {
    position: static;
  }
}
```

### 4. Font Size and Line Height

```css
/* ❌ Problem: Text too small on mobile */
body {
  font-size: 14px;
  line-height: 1.2;
}

/* ✅ Solution: Use readable sizes */
body {
  font-size: 16px; /* Minimum to prevent zoom on iOS */
  line-height: 1.5; /* Better readability */
}

input,
textarea,
select {
  font-size: 16px; /* Prevents zoom on focus in iOS */
}
```

### 5. Hover States on Touch

```css
/* ❌ Problem: Hover states stick on mobile */
.button:hover {
  background: blue;
}

/* ✅ Solution: Use hover media query */
@media (hover: hover) {
  .button:hover {
    background: blue;
  }
}

/* Active states for touch */
.button:active {
  background: darkblue;
}
```

### 6. Large Bundle Sizes

```tsx
// ❌ Problem: Importing entire library
import { format, parse, addDays } from "date-fns";

// ✅ Solution: Use specific imports
import format from "date-fns/format";
import parse from "date-fns/parse";
import addDays from "date-fns/addDays";

// ✅ Better: Use lighter alternatives
import { formatDate } from "@/utils/date"; // Custom utility
```

### 7. Unoptimized Images

```tsx
// ❌ Problem: Large images on mobile
<img src="/hero-4k.jpg" alt="Hero" />

// ✅ Solution: Responsive images with Next.js
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  quality={80}
/>
```

---

## Testing Mobile Experiences

### Manual Testing Checklist

- [ ] Test on real devices (iOS and Android)
- [ ] Test with slow network (Fast 3G)
- [ ] Test with touch interactions (no mouse)
- [ ] Test in portrait and landscape
- [ ] Test with system font size changes
- [ ] Test with reduced motion enabled
- [ ] Test with VoiceOver/TalkBack
- [ ] Test form inputs with virtual keyboard
- [ ] Test scrolling performance
- [ ] Test with browser chrome showing/hidden

### Automated Mobile Testing

```bash
# Install Playwright
npm install -D @playwright/test

# playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
})
```

### Lighthouse CI

```bash
# Install Lighthouse CI
npm install -D @lhci/cli

# lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance", "accessibility", "best-practices"]
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

### Visual Regression Testing

```tsx
// Use tools like Chromatic or Percy
// Or simple snapshot testing

import { render } from "@testing-library/react";
import ProductCard from "./ProductCard";

test("ProductCard renders correctly on mobile", () => {
  const { container } = render(<ProductCard product={mockProduct} />, {
    viewport: { width: 375, height: 667 },
  });
  expect(container).toMatchSnapshot();
});
```

---

## Quick Reference Commands

### Development

```bash
# Start Next.js dev server
npm run dev

# Check bundle size
npm run build && npx @next/bundle-analyzer

# Run Lighthouse
npx lighthouse http://localhost:3000 --view --preset=mobile

# Test on local network (access from phone)
next dev --hostname 0.0.0.0
# Then visit http://[your-ip]:3000 from mobile
```

### Debug Tools

```tsx
// Add to layout for quick mobile debugging
{
  process.env.NODE_ENV === "development" && (
    <div className="fixed bottom-0 right-0 bg-black text-white p-2 text-xs z-50">
      <div className="sm:hidden">XS</div>
      <div className="hidden sm:block md:hidden">SM</div>
      <div className="hidden md:block lg:hidden">MD</div>
      <div className="hidden lg:block xl:hidden">LG</div>
      <div className="hidden xl:block">XL</div>
    </div>
  );
}
```

---

## Best Practices Summary

1. **Always start with mobile styles** - use min-width media queries
2. **Optimize images** - use Next.js Image component with proper sizes
3. **Minimize JavaScript** - code split and lazy load
4. **Test on real devices** - emulators don't catch everything
5. **Use semantic HTML** - better accessibility and SEO
6. **Avoid fixed positioning** - it's problematic on mobile
7. **Make touch targets large** - minimum 44×44px
8. **Test with keyboard open** - viewport changes significantly
9. **Use system fonts when possible** - faster loading
10. **Monitor Core Web Vitals** - especially on mobile networks

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Web.dev Mobile Guide](https://web.dev/mobile/)
- [MDN Mobile Web Development](https://developer.mozilla.org/en-US/docs/Web/Guide/Mobile)
- [Core Web Vitals](https://web.dev/vitals/)
- [Can I Use](https://caniuse.com/) - Browser compatibility
