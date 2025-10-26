# GolfGod Mobile-First Design Guide

## Overview
This guide documents the mobile-first responsive design patterns implemented in GolfGod using shadcn/ui and Tailwind CSS.

---

## 🎯 Core Principles

### 1. Mobile-First Approach
- **Start with mobile** - Write base styles for mobile devices first
- **Progressive enhancement** - Add breakpoint-specific styles for larger screens
- **Touch-friendly** - Minimum 44x44px tap targets (iOS guideline)
- **Performance** - Optimize for slower mobile connections

### 2. Responsive Breakpoints (Tailwind)
```
Default (mobile): 0px+      - Base styles for smallest devices
sm: 640px                   - Large phones (landscape)
md: 768px                   - Tablets
lg: 1024px                  - Desktop
xl: 1280px                  - Large desktop
2xl: 1400px                 - Extra large screens
```

---

## 📐 Layout Patterns

### Grid Layouts
```tsx
// ✅ Mobile-first grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// ❌ Avoid desktop-first
<div className="grid grid-cols-3 md:grid-cols-1">
```

**Implemented in:**
- Dashboard: Main options grid
- Inside the Ropes: Stats cards, scoring grids
- Home page: Features section

### Global Overflow Prevention
```tsx
// Page container - Prevent horizontal scroll
<div className="min-h-screen bg-background overflow-x-hidden">
  {/* Page content */}
</div>

// Main content wrapper - Add width constraint
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
  {/* Content sections */}
</div>

// Flex container children - Allow shrinking
<div className="flex-1 w-full min-w-0">
  {/* Prevents flex children from causing overflow */}
</div>
```

**Key Techniques:**
- `overflow-x-hidden` on page container prevents any child from causing horizontal scroll
- `w-full` ensures containers don't exceed viewport width
- `min-w-0` on flex children allows them to shrink below content size (prevents overflow in flex containers)
- `max-w-7xl mx-auto` centers content with maximum width constraint

**Implemented in:**
- `app/players/page.tsx` - Page-level overflow prevention on all containers

### Responsive Sidebar Pattern
```tsx
{/* Mobile: Hidden, accessible via Sheet drawer */}
<div className="hidden lg:block w-80">
  <Sidebar />
</div>

{/* Mobile: Hamburger menu with Sheet */}
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger className="lg:hidden">
    <Menu />
  </SheetTrigger>
  <SheetContent side="left">
    <Sidebar />
  </SheetContent>
</Sheet>
```

**Implemented in:**
- Players page: Left sidebar navigation

---

## 📝 Typography Scaling

### Headings
```tsx
// H1 - Main page titles
className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"

// H2 - Section titles
className="text-xl sm:text-2xl md:text-3xl font-bold"

// H3 - Card titles
className="text-base sm:text-lg md:text-xl font-semibold"
```

### Body Text
```tsx
// Regular text
className="text-sm sm:text-base"

// Small text / descriptions
className="text-xs sm:text-sm"

// Muted text
className="text-xs sm:text-sm text-muted-foreground"
```

**Implemented in:**
- All page headers and titles
- Card descriptions
- Button labels
- Table content

---

## 🎨 Spacing System

### Padding & Margins
```tsx
// Container padding
className="px-4 sm:px-6 lg:px-8"

// Section spacing
className="py-8 md:py-12 lg:py-16"

// Card padding
className="p-4 sm:p-6"

// Gap in grids
className="gap-4 md:gap-6 lg:gap-8"
```

### Component Sizing
```tsx
// Icons
className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"

// Avatars / Circles
className="w-12 h-12 sm:w-16 sm:h-16"

// Buttons
size="sm" className="sm:size-default md:size-lg"
```

---

## 📊 Data Tables

### Horizontal Scroll Pattern (Wide Tables)
```tsx
// Edge-to-edge scroll on mobile, normal on desktop
<div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
  <table className="w-full text-sm min-w-[640px]">
    {/* Table content */}
  </table>
</div>
```

**Features:**
- Horizontal scroll on mobile for wide tables
- Edge-to-edge scroll on mobile (negative margin technique)
- `min-w-[640px]` ensures table maintains readability
- Normal padding on desktop (≥640px)
- Native CSS scroll behavior (smooth on touch devices)

**Implemented in:**
- PlayerStats component: Tournament results table
- Inside the Ropes: Tournament history table
- `/tournaments/pga/[year]`: Current/Scheduled/Completed tournament tables

### Alternative: ScrollArea Pattern
```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

<Card>
  <CardContent className="p-0 sm:p-6">
    <ScrollArea className="w-full">
      <div className="min-w-[800px] p-4 sm:p-0">
        <table className="w-full">
          {/* Table content */}
        </table>
      </div>
    </ScrollArea>
  </CardContent>
</Card>
```

**When to use each:**
- Use negative margin technique for content within cards (better visual flow)
- Use ScrollArea for standalone tables or when you need custom scrollbar styling

### Responsive Table Typography
```tsx
// Table headers
<th className="text-xs sm:text-sm">Column</th>

// Table cells
<td className="text-xs sm:text-sm">Data</td>

// Badges in tables
<Badge className="text-xs">MC</Badge>
```

---

## 🎯 Touch Optimization

### Minimum Touch Targets (44x44px)
```tsx
// SearchableSelect component
control: {
  minHeight: "44px",  // Mobile
  "@media (min-width: 640px)": {
    minHeight: "40px" // Desktop
  }
}

// Option padding
option: {
  padding: "12px 16px",  // Mobile - larger
  "@media (min-width: 640px)": {
    padding: "8px 12px"  // Desktop
  }
}
```

### Interactive Elements
```tsx
// Buttons - Always min 44px height on mobile
<Button size="sm" className="h-11 sm:h-10">

// Links - Adequate spacing
<a className="py-3 px-4">

// Form inputs - Prevent iOS zoom (16px min)
input: {
  fontSize: "16px",  // Mobile - prevents zoom
  "@media (min-width: 640px)": {
    fontSize: "14px"
  }
}
```

**Implemented in:**
- SearchableSelect: Optimized dropdown with 44px touch targets
- All buttons: Minimum size enforcement
- Form inputs: Zoom prevention

---

## 🗂️ Component Patterns

### Cards
```tsx
<Card className="cursor-pointer hover:shadow-lg active:scale-98">
  <CardHeader className="p-4 sm:p-6">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <CardTitle className="text-base sm:text-lg">Title</CardTitle>
    <CardDescription className="text-xs sm:text-sm">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent className="p-4 sm:p-6 pt-0">
    {/* Content */}
  </CardContent>
</Card>
```

### Buttons
```tsx
// Responsive button with text variations
<Button className="text-xs sm:text-sm px-2 sm:px-4">
  <span className="hidden sm:inline">Full Text</span>
  <span className="sm:hidden">Short</span>
</Button>
```

### Headers
```tsx
<header className="border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-14 sm:h-16">
      {/* Header content */}
    </div>
  </div>
</header>
```

### Responsive Flex Layout (Avatar + Info)
```tsx
// Mobile: Vertical stack (centered)
// Desktop: Horizontal flex (left-aligned)
<div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
  {/* Avatar - Smaller on mobile */}
  <div className="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0">
    {/* Avatar content */}
  </div>

  {/* Info - Center on mobile, left on desktop */}
  <div className="text-center sm:text-left flex-1 min-w-0">
    <h2 className="text-2xl sm:text-3xl font-bold">Player Name</h2>
    <div className="flex items-center justify-center sm:justify-start gap-2">
      {/* Country flag and name */}
    </div>

    {/* Full-width button on mobile */}
    <Button className="w-full sm:w-auto">Follow</Button>
  </div>
</div>
```

**Features**:
- Mobile (< 640px): Vertical stack with centered avatar and info
- Desktop (≥ 640px): Horizontal layout with left-aligned content
- Avatar scales: 96px mobile → 128px desktop
- Button adapts: Full-width mobile → auto-width desktop
- `min-w-0` on flex child prevents overflow in flex containers

**Implemented in:**
- PlayerBio component: Player profile header with avatar and follow button

### Horizontal Scrollable Tabs
```tsx
// Mobile: Horizontal scroll
<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="w-full h-auto p-0 bg-transparent rounded-none border-b">
    <div className="flex w-full overflow-x-auto scrollbar-hide">
      <TabsTrigger value="tab1" className="flex-shrink-0 min-w-[80px]">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2" className="flex-shrink-0 min-w-[80px]">Tab 2</TabsTrigger>
      <TabsTrigger value="tab3" className="flex-shrink-0 min-w-[80px]">Tab 3</TabsTrigger>
      <TabsTrigger value="tab4" className="flex-shrink-0 min-w-[80px]">Tab 4</TabsTrigger>
      <TabsTrigger value="tab5" className="flex-shrink-0 min-w-[80px]">Tab 5</TabsTrigger>
    </div>
  </TabsList>
  {/* Tab content */}
</Tabs>

// Add to tailwind.config.js for clean scrolling:
plugins: [
  require("tailwindcss-animate"),
  function({ addUtilities }) {
    addUtilities({
      '.scrollbar-hide': {
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }
    })
  }
]
```

**Features**:
- Mobile: Single row with horizontal swipe scrolling
- No visible scrollbar on mobile (clean UX)
- `flex-shrink-0` prevents tab text wrapping
- `min-w-[80px]` ensures ≥44px touch targets with padding
- Native CSS scroll behavior (no JS required)

**Implemented in:**
- PlayerStats component: Main tabs (Overview, News, Bio, Results, Scorecards)
- PlayerStats component: Year selector tabs (All Years, 2015-2026)

### Tour Navigation Tabs (Horizontal Scroll)
```tsx
// 6+ tabs with horizontal scroll on mobile
<div className="border-b bg-secondary">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 py-2 min-w-max">
        <button className="flex-shrink-0 min-w-[100px] px-4 py-2">Tab 1</button>
        <button className="flex-shrink-0 min-w-[100px] px-4 py-2">Tab 2</button>
        {/* More tabs... */}
      </div>
    </div>
  </div>
</div>
```

**Features**:
- Horizontal scroll on mobile for 6+ navigation tabs
- `min-w-max` prevents tab wrapping
- `flex-shrink-0` prevents individual tab compression
- `min-w-[100px]` ensures ≥44px touch targets with padding
- Clean scrolling with `scrollbar-hide` utility
- Native CSS scroll behavior (no JavaScript)

**Implemented in:**
- `/tournaments/pga/[year]` - Tour navigation (PGA TOUR, LPGA, Champions, etc.)

---

## 📱 shadcn/ui Mobile Components

### Sheet (Mobile Drawer)
```tsx
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button variant="outline" size="icon" className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-80">
    <SheetHeader>
      <SheetTitle>Navigation</SheetTitle>
    </SheetHeader>
    {/* Drawer content */}
  </SheetContent>
</Sheet>
```

**Use cases:**
- Mobile navigation menus
- Filter panels
- Sidebars on mobile

### ScrollArea
```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

<ScrollArea className="w-full h-[400px]">
  <div className="min-w-[800px]">
    {/* Wide content */}
  </div>
</ScrollArea>
```

**Use cases:**
- Data tables with many columns
- Long lists with fixed height
- Horizontal scrolling content

---

## ✅ Mobile Testing Checklist

### Visual Testing
- [ ] Test on 375px viewport (iPhone SE - smallest modern phone)
- [ ] Test on 768px viewport (iPad)
- [ ] Test on 1440px viewport (Desktop)
- [ ] Check all breakpoints: sm, md, lg, xl
- [ ] Verify no horizontal overflow at any size

### Interaction Testing
- [ ] All touch targets are ≥44x44px
- [ ] Forms don't trigger zoom on iOS (16px min font size)
- [ ] Dropdowns position correctly on mobile
- [ ] Navigation works smoothly
- [ ] Tables scroll horizontally without issues
- [ ] Modals/sheets don't break layout

### Typography Testing
- [ ] Text is readable at all sizes (minimum 14px)
- [ ] No text truncation without proper ellipsis
- [ ] Line height allows comfortable reading
- [ ] Font scaling looks natural across breakpoints

### Performance Testing
- [ ] Images load quickly on mobile
- [ ] No layout shift during loading
- [ ] Smooth animations and transitions
- [ ] Fast initial page load (<3s on 3G)

---

## 🎨 Design Tokens

### Common Mobile-First Classes
```tsx
// Visibility
hidden sm:block          // Hidden on mobile, visible on desktop
block lg:hidden          // Visible on mobile, hidden on desktop

// Flexbox
flex-col md:flex-row     // Stack on mobile, row on desktop
items-start sm:items-center

// Grid
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Spacing
space-y-4 md:space-y-6   // Vertical spacing
gap-4 md:gap-6 lg:gap-8  // Grid gap

// Typography
text-sm sm:text-base md:text-lg
text-2xl sm:text-3xl md:text-4xl

// Padding
p-4 sm:p-6 md:p-8
px-4 sm:px-6 lg:px-8

// Width/Height
w-full sm:w-auto
h-11 sm:h-10            // Mobile 44px, desktop 40px
```

---

## 📚 Files Modified

### Core Layout Components
- `components/layout/Dashboard.tsx` - Mobile-first grid and cards
- `app/players/page.tsx` - Responsive sidebar with Sheet + overflow prevention

### Feature Pages
- `app/inside-the-ropes/page.tsx` - ScrollArea tables
- `app/page.tsx` - Home page responsive typography

### Tournament Pages
- `app/tournaments/pga/[year]/page.tsx` - Tour navigation tabs + horizontal scrolling tables

### Player Profile Components
- `components/player/PlayerBio.tsx` - Responsive flex layout (vertical mobile → horizontal desktop)
- `components/player/PlayerStats.tsx` - Horizontal scrolling tabs + wide table wrapper

### UI Components
- `components/ui/searchable-select.tsx` - Touch-optimized dropdown

### Configuration
- `tailwind.config.js` - Added `.scrollbar-hide` utility class for clean mobile scrolling

---

## 🚀 Best Practices Summary

1. **Always start with mobile** - Base styles apply to smallest screens
2. **Use Tailwind breakpoints** - sm:, md:, lg:, xl:, 2xl:
3. **Touch targets ≥44px** - iOS accessibility guideline
4. **Prevent iOS zoom** - 16px min font size on inputs
5. **Test on real devices** - Simulators don't show all issues
6. **Progressive enhancement** - Core functionality works everywhere
7. **Performance matters** - Mobile users often on slower connections
8. **Use shadcn components** - Sheet, ScrollArea built for mobile
9. **Semantic HTML** - Better accessibility and SEO
10. **Consistent spacing** - Use spacing system (4, 6, 8, 12, 16)

---

## 📖 Additional Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://m2.material.io/design/usability/accessibility.html#layout-and-typography)

---

**Last Updated:** January 2025
**Maintained by:** GolfGod Development Team
