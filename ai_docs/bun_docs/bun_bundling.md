# Bundling Embeddable Widgets with Bun 1.3.1

**Last Updated:** October 2025  
**Bun Version:** 1.3.1 (Latest Stable)

## Overview

This guide covers how to bundle embeddable JavaScript widgets using Bun's native bundler. Bun's bundler is **1.75x faster than esbuild** and provides a simple, powerful API for creating production-ready, self-contained widget bundles.

---

## Why Bun for Widget Bundling?

### Advantages

- **Blazing Fast**: Native bundler written in Zig, optimized for speed
- **Zero Dependencies**: No need for Webpack, Rollup, or Vite
- **Built-in Everything**: TypeScript, JSX, CSS bundling without extra tools
- **Single File Output**: Perfect for embeddable widgets
- **Native Minification**: Fast, built-in minifier (no Terser needed)
- **IIFE Support**: Self-contained bundles for `<script>` tag inclusion

### What Gets Bundled

- React/Preact and all dependencies
- TypeScript/JSX → transpiled JavaScript
- CSS → inlined or external
- Images/Assets → base64 or copied
- All npm packages → single bundle (no external deps)

---

## Quick Start

### Installation

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Verify version
bun --version  # Should show 1.3.1 or higher
```

### Basic Widget Bundle

```typescript
// build.ts
await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  outdir: "./dist",
  format: "iife", // Self-contained bundle
  target: "browser", // Browser environment
  minify: true, // Enable minification
  splitting: false, // Single file output
  naming: "widget.js", // Custom filename
});
```

```bash
# Run the build
bun run build.ts
```

---

## Complete Widget Build Configuration

### Full-Featured build.ts Example

```typescript
// build.ts - Production widget bundler
await Bun.build({
  // Entry point
  entrypoints: ["./src/widget.tsx"],

  // Output configuration
  outdir: "./dist",
  format: "iife", // IIFE for <script> tag usage
  target: "browser", // Optimize for browsers

  // File naming (single file)
  naming: {
    entry: "[name].js", // No hash for predictable URL
    // chunk: '[name]-[hash].js',    // Not used (splitting: false)
    // asset: '[name]-[hash].[ext]', // Not used if CSS inlined
  },

  // Code splitting (disable for single file)
  splitting: false, // Must be false for IIFE

  // Minification
  minify: {
    whitespace: true, // Remove whitespace
    identifiers: true, // Shorten variable names
    syntax: true, // Optimize syntax
  },

  // Source maps (optional)
  sourcemap: "none", // 'linked', 'inline', 'external', 'none'

  // External dependencies (none for embeddable widget)
  external: [], // Bundle everything
  packages: "bundle", // Bundle all node_modules

  // Environment variables
  env: "PUBLIC_*", // Inline only PUBLIC_* env vars

  // Bundle metadata
  banner: '"use strict";', // Optional: Add to top of bundle
  footer: "// Built with Bun v1.3.1", // Optional: Add to bottom

  // Plugins (for CSS inlining, etc.)
  plugins: [
    // Custom plugins go here
  ],
});

console.log("✅ Widget bundled successfully!");
```

---

## Widget Structure Best Practices

### Project Structure

```
my-widget/
├── src/
│   ├── widget.tsx          # Main entry point
│   ├── components/         # React components
│   │   ├── Widget.tsx
│   │   └── Button.tsx
│   ├── styles/
│   │   └── widget.css      # CSS to inline
│   └── types/
│       └── index.ts
├── dist/
│   └── widget.js           # Generated bundle
├── deploy/
│   ├── widget.js           # Production copy
│   └── assets/             # Static assets
├── build.ts                # Build script
├── package.json
├── tsconfig.json
└── bunfig.toml             # Optional Bun config
```

### Entry Point Pattern (widget.tsx)

```typescript
// src/widget.tsx - Widget entry point with global API
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WidgetComponent } from './components/Widget';
import './styles/widget.css';  // Will be bundled

// Widget Configuration Interface
interface WidgetConfig {
  containerId?: string;
  apiKey?: string;
  theme?: 'light' | 'dark';
  onLoad?: () => void;
  [key: string]: any;
}

// Global Widget API
class Widget {
  private root: ReactDOM.Root | null = null;
  private config: WidgetConfig = {};

  init(config: WidgetConfig = {}) {
    this.config = config;
    const containerId = config.containerId || 'my-widget-root';
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`Widget: Container #${containerId} not found`);
      return;
    }

    // Mount React app
    this.root = ReactDOM.createRoot(container);
    this.root.render(
      <React.StrictMode>
        <WidgetComponent {...this.config} />
      </React.StrictMode>
    );

    // Callback after mount
    if (config.onLoad) {
      config.onLoad();
    }
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  // Add other widget methods
  update(newConfig: Partial<WidgetConfig>) {
    this.config = { ...this.config, ...newConfig };
    // Re-render with new config
    this.init(this.config);
  }
}

// Expose to global scope (for IIFE)
declare global {
  interface Window {
    MyWidget: typeof Widget;
  }
}

// Create global instance
window.MyWidget = Widget;

// Auto-initialize if config is present
if ((window as any).MyWidgetConfig) {
  const widget = new Widget();
  widget.init((window as any).MyWidgetConfig);
}
```

---

## CSS Handling

### Option 1: Inline CSS (Recommended for Widgets)

Bun's bundler has native CSS support. By default, CSS imports are processed and can be included in the JS bundle.

```typescript
// In your widget.tsx
import "./styles/widget.css"; // Bun processes this automatically
```

**CSS Processing (built into Bun 1.3+):**

- **Native CSS Parser**: LightningCSS port (Rust → Zig)
- **Autoprefixing**: Automatic vendor prefixes
- **Minification**: CSS minified automatically
- **Modern CSS**: Nesting, custom properties, etc.

### Option 2: CSS Inlining Plugin

For complete CSS inlining into JS bundle:

```typescript
// css-inline-plugin.ts
import type { BunPlugin } from "bun";

export const cssInlinePlugin: BunPlugin = {
  name: "css-inline",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await Bun.file(args.path).text();

      // Minify CSS (basic)
      const minified = css
        .replace(/\s+/g, " ")
        .replace(/\s*([{}:;,])\s*/g, "$1")
        .trim();

      // Return as JS that injects style tag
      return {
        contents: `
          const style = document.createElement('style');
          style.textContent = ${JSON.stringify(minified)};
          document.head.appendChild(style);
          export default ${JSON.stringify(minified)};
        `,
        loader: "js",
      };
    });
  },
};

// Use in build.ts
await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  outdir: "./dist",
  plugins: [cssInlinePlugin],
  // ... other options
});
```

### Option 3: External CSS File

```typescript
await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  outdir: "./dist",
  // CSS will be extracted to separate file
  // User must include both files:
  // <link rel="stylesheet" href="widget.css">
  // <script src="widget.js"></script>
});
```

---

## Advanced Build Script

### Complete build.ts with Deployment

```typescript
// build.ts - Full production build + deploy
import { $ } from "bun";
import path from "path";

interface BuildOptions {
  mode: "development" | "production";
  deploy?: boolean;
}

async function buildWidget(options: BuildOptions) {
  console.log(`🔨 Building widget (${options.mode})...`);

  const isProduction = options.mode === "production";

  // Build configuration
  const result = await Bun.build({
    entrypoints: ["./src/widget.tsx"],
    outdir: "./dist",
    target: "browser",
    format: "iife",
    splitting: false,

    // Naming without hash for predictable URL
    naming: "widget.js",

    // Minification (only in production)
    minify: isProduction
      ? {
          whitespace: true,
          identifiers: true,
          syntax: true,
        }
      : false,

    // Source maps (inline in dev, external in prod)
    sourcemap: isProduction ? "external" : "inline",

    // Environment variables (inline PUBLIC_* only)
    env: "PUBLIC_*",

    // Bundle all dependencies
    external: [],
    packages: "bundle",

    // Add metadata
    banner: '"use strict";',
    footer: `// Built with Bun v1.3.1 - ${new Date().toISOString()}`,
  });

  // Check build success
  if (!result.success) {
    console.error("❌ Build failed:");
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  // Log build info
  const output = result.outputs[0];
  const sizeMB = (output.size / 1024 / 1024).toFixed(2);
  console.log(`✅ Built: ${output.path} (${sizeMB}MB)`);

  // Deploy if requested
  if (options.deploy) {
    await deployWidget();
  }
}

async function deployWidget() {
  console.log("🚀 Deploying widget...");

  // 1. Copy build to deploy directory
  await $`mkdir -p deploy`;
  await $`cp dist/widget.js deploy/widget.js`;

  // 2. Copy source maps if they exist
  if (await Bun.file("dist/widget.js.map").exists()) {
    await $`cp dist/widget.js.map deploy/widget.js.map`;
  }

  // 3. Copy static assets
  await $`mkdir -p deploy/assets`;
  await $`cp -r src/assets/* deploy/assets/ 2>/dev/null || true`;

  // 4. Deploy to CDN (example: Vercel)
  console.log("📦 Deploying to Vercel...");
  await $`cd deploy && vercel --prod`;

  console.log("✅ Deployment complete!");
}

// CLI Interface
const args = process.argv.slice(2);
const mode = args.includes("--production") ? "production" : "development";
const deploy = args.includes("--deploy");

await buildWidget({ mode, deploy });
```

### Package.json Scripts

```json
{
  "name": "my-widget",
  "version": "1.0.0",
  "scripts": {
    "build": "bun run build.ts",
    "build:prod": "bun run build.ts --production",
    "deploy": "bun run build.ts --production --deploy",
    "dev": "bun run build.ts && bun run dev-server.ts"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "bun-types": "latest"
  }
}
```

---

## Widget Usage (Client-Side)

### Basic Integration

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Widget Demo</title>
  </head>
  <body>
    <!-- Widget container -->
    <div id="my-widget-root"></div>

    <!-- Include widget bundle -->
    <script src="https://cdn.example.com/widget.js"></script>

    <!-- Initialize widget -->
    <script>
      // Method 1: Direct initialization
      const widget = new window.MyWidget();
      widget.init({
        containerId: "my-widget-root",
        apiKey: "your-api-key",
        theme: "light",
      });
    </script>
  </body>
</html>
```

### Auto-Initialize Pattern

```html
<!-- Define config before script loads -->
<script>
  window.MyWidgetConfig = {
    containerId: "my-widget-root",
    apiKey: "your-api-key",
    theme: "dark",
    onLoad: () => console.log("Widget loaded!"),
  };
</script>
<div id="my-widget-root"></div>
<script src="https://cdn.example.com/widget.js"></script>
```

---

## IIFE Format Details

### What is IIFE?

**IIFE** (Immediately Invoked Function Expression) creates a self-contained bundle that:

- Wraps code in a function scope (no global pollution)
- Executes immediately on load
- Exposes only chosen APIs to `window`
- Perfect for `<script>` tag inclusion

### IIFE Output Example

```javascript
// Bundled widget.js (simplified)
(function () {
  "use strict";

  // React and all dependencies bundled here
  var React = {
    /* ... */
  };
  var ReactDOM = {
    /* ... */
  };

  // Your widget code
  var Widget = (function () {
    function Widget() {
      /* ... */
    }
    Widget.prototype.init = function () {
      /* ... */
    };
    return Widget;
  })();

  // Expose to global
  window.MyWidget = Widget;
})();
```

### Important IIFE Limitations

⚠️ **As of Bun 1.3.1:**

- IIFE format is **experimental**
- `globalName` option not yet supported (TODO in docs)
- Use `window.YourName = ...` pattern for global exposure
- Cannot use code splitting with IIFE (`splitting: false` required)
- Top-level `await` not supported in IIFE (only ESM)

---

## Minification Options

### Granular Minification Control

```typescript
await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  outdir: "./dist",

  minify: {
    // Remove all whitespace (newlines, spaces, tabs)
    whitespace: true,

    // Shorten variable/function names (a, b, c, etc.)
    identifiers: true,

    // Optimize syntax (convert if statements, etc.)
    // WARNING: May break code in rare edge cases
    syntax: false, // Disable if issues occur
  },
});
```

### Minification Trade-offs

| Option        | Bundle Size Reduction | Risk       | Recommendation     |
| ------------- | --------------------- | ---------- | ------------------ |
| `whitespace`  | ~15-20%               | None       | ✅ Always enable   |
| `identifiers` | ~10-15%               | Very Low   | ✅ Always enable   |
| `syntax`      | ~5-10%                | Low-Medium | ⚠️ Test thoroughly |

**Best Practice:**

```typescript
// Start with conservative minification
minify: {
  whitespace: true,
  identifiers: true,
  syntax: false,  // Enable only after testing
}
```

---

## Plugin System

### Plugin API Basics

Bun's plugin API is **esbuild-compatible**, meaning many esbuild plugins work out of the box.

```typescript
import type { BunPlugin } from "bun";

const myPlugin: BunPlugin = {
  name: "my-plugin",
  setup(build) {
    // Called once when build starts
    build.onStart(() => {
      console.log("Build starting...");
    });

    // Intercept module resolution
    build.onResolve({ filter: /^custom:/ }, (args) => {
      return {
        path: args.path.replace("custom:", ""),
        namespace: "custom",
      };
    });

    // Custom file loading
    build.onLoad({ filter: /\.custom$/ }, async (args) => {
      const contents = await Bun.file(args.path).text();
      return {
        contents: `export default ${JSON.stringify(contents)}`,
        loader: "js",
      };
    });
  },
};
```

### Common Plugin Use Cases

**1. Custom File Loaders:**

```typescript
// Load .svg as React components
const svgPlugin: BunPlugin = {
  name: "svg-react",
  setup(build) {
    build.onLoad({ filter: /\.svg$/ }, async (args) => {
      const svg = await Bun.file(args.path).text();
      return {
        contents: `
          import React from 'react';
          export default () => <div dangerouslySetInnerHTML={{__html: ${JSON.stringify(svg)}}} />;
        `,
        loader: "tsx",
      };
    });
  },
};
```

**2. Environment Variable Replacement:**

```typescript
const envPlugin: BunPlugin = {
  name: "env-replace",
  setup(build) {
    build.onLoad({ filter: /\.(tsx?|jsx?)$/ }, async (args) => {
      let contents = await Bun.file(args.path).text();

      // Replace process.env.VAR with actual values
      contents = contents.replace(/process\.env\.(\w+)/g, (_, key) =>
        JSON.stringify(process.env[key] || "")
      );

      return { contents, loader: "tsx" };
    });
  },
};
```

**3. Asset Optimization:**

```typescript
import { optimize } from "svgo";

const svgoPlugin: BunPlugin = {
  name: "svgo",
  setup(build) {
    build.onLoad({ filter: /\.svg$/ }, async (args) => {
      const svg = await Bun.file(args.path).text();
      const optimized = optimize(svg).data;
      return {
        contents: `export default ${JSON.stringify(optimized)}`,
        loader: "js",
      };
    });
  },
};
```

---

## Performance Optimization

### Bundle Size Optimization

**1. Tree Shaking (Automatic)**

```typescript
// Bun automatically tree-shakes unused exports
import { specificFunction } from "large-library";
// Only specificFunction is bundled, not entire library
```

**2. External Dependencies (for hosted scenarios)**

```typescript
await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  outdir: "./dist",

  // Externalize React if host page provides it
  external: ["react", "react-dom"],
});
```

```html
<!-- Host page provides React -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="your-widget.js"></script>
```

**3. Code Splitting (for ESM only)**

```typescript
// Not compatible with IIFE!
await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  format: "esm", // Required for splitting
  splitting: true,
});
```

### Build Performance Tips

1. **Use `--watch` for development:**

```bash
bun build ./src/widget.tsx --outdir ./dist --watch
```

2. **Disable source maps in production:**

```typescript
sourcemap: process.env.NODE_ENV === "production" ? "none" : "inline";
```

3. **Minimize plugin usage:**

- Only use necessary plugins
- Plugins add overhead to build time

---

## Deployment

### CDN Deployment (Vercel Example)

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
cd deploy
vercel --prod
```

### vercel.json Configuration

```json
{
  "version": 2,
  "public": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, OPTIONS"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/widget.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    }
  ]
}
```

### CDN Best Practices

1. **CORS Headers**: Enable for cross-origin widget loading
2. **Cache Headers**: Set appropriate cache TTLs
3. **Compression**: Enable gzip/brotli (most CDNs do this automatically)
4. **Versioning**: Use query params or paths for versions
   ```html
   <script src="https://cdn.example.com/widget.js?v=1.2.3"></script>
   <!-- OR -->
   <script src="https://cdn.example.com/v1/widget.js"></script>
   ```

---

## Debugging & Testing

### Source Maps

```typescript
await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  outdir: "./dist",

  // Development: inline source maps
  sourcemap: "inline",

  // Production: external source maps (optional)
  sourcemap: "external", // Creates widget.js.map
});
```

### Error Handling

```typescript
const result = await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  outdir: "./dist",
});

if (!result.success) {
  console.error("Build failed with errors:");
  for (const message of result.logs) {
    if (message.level === "error") {
      console.error(`${message.message} at ${message.position}`);
    }
  }
  process.exit(1);
}
```

### Local Testing Server

```typescript
// dev-server.ts
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve widget bundle
    if (url.pathname === "/widget.js") {
      const file = Bun.file("./dist/widget.js");
      return new Response(file, {
        headers: {
          "Content-Type": "application/javascript",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Serve demo page
    if (url.pathname === "/" || url.pathname === "/demo.html") {
      const html = await Bun.file("./demo.html").text();
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("🚀 Dev server running at http://localhost:3000");
```

---

## Troubleshooting

### Common Issues

**1. "Cannot use import statement outside a module"**

- **Cause**: IIFE not properly configured or using ESM syntax
- **Fix**: Ensure `format: 'iife'` and `splitting: false`

**2. "React is not defined"**

- **Cause**: React not bundled or externalized
- **Fix**: Remove `'react'` from `external` array

**3. Bundle is too large (>500KB)**

- **Solutions**:
  - Enable all minification options
  - Check for accidentally bundled dev dependencies
  - Use `bun build --analyze` (when available)
  - Consider external React if host provides it

**4. CSS not included in bundle**

- **Cause**: CSS not imported or plugin not configured
- **Fix**:
  ```typescript
  // Import CSS in your entry point
  import "./styles/widget.css";
  ```

**5. Top-level await breaks IIFE**

- **Cause**: IIFE doesn't support top-level await
- **Fix**: Wrap in async function:
  ```typescript
  (async () => {
    await someAsyncInit();
    window.MyWidget = Widget;
  })();
  ```

---

## Quick Reference

### Essential build.ts Template

```typescript
#!/usr/bin/env bun
// build.ts - Minimal widget bundler

await Bun.build({
  entrypoints: ["./src/widget.tsx"],
  outdir: "./dist",
  format: "iife",
  target: "browser",
  minify: true,
  splitting: false,
  naming: "widget.js",
  external: [],
  sourcemap: "none",
});

console.log("✅ Widget built!");
```

### Common Commands

```bash
# Build widget
bun run build.ts

# Build with custom config
bun run build.ts --production

# Watch mode (dev)
bun build ./src/widget.tsx --outdir ./dist --watch

# Check Bun version
bun --version

# Clean and rebuild
rm -rf dist && bun run build.ts
```

### Key Configuration Options

| Option        | Type                           | Default     | Description               |
| ------------- | ------------------------------ | ----------- | ------------------------- |
| `entrypoints` | `string[]`                     | Required    | Entry files to bundle     |
| `outdir`      | `string`                       | `undefined` | Output directory          |
| `format`      | `'esm' \| 'cjs' \| 'iife'`     | `'esm'`     | Module format             |
| `target`      | `'browser' \| 'bun' \| 'node'` | `'browser'` | Target environment        |
| `minify`      | `boolean \| object`            | `false`     | Minification settings     |
| `splitting`   | `boolean`                      | `false`     | Code splitting (ESM only) |
| `external`    | `string[]`                     | `[]`        | External dependencies     |
| `sourcemap`   | `string`                       | `'none'`    | Source map generation     |
| `plugins`     | `BunPlugin[]`                  | `[]`        | Build plugins             |

---

## Next Steps

1. **Copy the template**: Use the minimal `build.ts` template above
2. **Configure your widget**: Add your entry point and settings
3. **Test locally**: Use the dev server to test your widget
4. **Deploy**: Push to your CDN of choice
5. **Integrate**: Add the widget to your customer sites

## Resources

- **Bun Documentation**: https://bun.sh/docs
- **Bundler API**: https://bun.sh/docs/bundler
- **Plugin API**: https://bun.sh/docs/bundler/plugins
- **Bun Discord**: https://bun.sh/discord

---

## Version History

- **Bun 1.3.1** (October 2025): Current stable release
- **Bun 1.3.0** (October 2025): Added frontend dev server, build improvements
- **Bun 1.2.0** (February 2025): IIFE format support (experimental)

---

**Note**: This guide is based on Bun 1.3.1. Features marked as "experimental" (like IIFE with `globalName`) may change in future versions. Always check the latest docs at https://bun.sh/docs for updates.
