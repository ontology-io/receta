# Living Documentation Solution for Receta

## 🎯 THE SOLUTION: Docusaurus with CommonMark Mode

After extensive research and testing, here's the working solution for generating living API documentation from TypeScript/JSDoc without MDX parsing errors.

---

## The Problem

TypeDoc generates markdown with TypeScript generic syntax like:
- `Result<T, E>`
- `Option<T>`
- `Promise<Array<T>>`
- Operators: `===`, `<=`, `>=`

**MDX parsers** (used by Nextra, Docusaurus, VitePress, Starlight by default) interpret these as **JSX/HTML tags**, causing build failures:

```
❌ Unexpected character `,` in name
❌ Expected a closing tag for `<T>`
❌ Unexpected character `=` before name
```

---

## The Solution

### ✅ Use Docusaurus in **CommonMark mode** instead of MDX mode

**One-line fix:**

```typescript
// docs-site/docusaurus.config.ts
const config: Config = {
  title: 'Receta',

  // 🎯 THE KEY FIX!
  markdown: {
    format: 'md',  // Use CommonMark instead of MDX
  },

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src'],
        entryPointStrategy: 'expand',
        tsconfig: '../tsconfig.json',
        out: 'docs/api',
        // No special escaping needed!
      },
    ],
  ],
  // ...
};
```

---

## Why This Works

| Mode | Behavior | Result |
|------|----------|--------|
| **MDX** (default) | Parses `<T>` as JSX component | ❌ Build fails |
| **CommonMark** | Treats `<T>` as plain text | ✅ Works perfectly! |

---

## Implementation Steps

### 1. Create Docusaurus Site

```bash
cd /path/to/receta
npx create-docusaurus@latest docs-site classic --typescript
cd docs-site
```

### 2. Install TypeDoc Plugin

```bash
bun add -D typedoc typedoc-plugin-markdown docusaurus-plugin-typedoc
```

### 3. Configure Docusaurus

Edit `docs-site/docusaurus.config.ts`:

```typescript
import type {Config} from '@docusaurus/types';

const config: Config = {
  title: 'Receta',
  tagline: 'Practical FP recipes built on Remeda',
  url: 'https://receta.dev',
  baseUrl: '/',

  // 🎯 CRITICAL: Enable CommonMark mode
  markdown: {
    format: 'md',
  },

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src'],
        entryPointStrategy: 'expand',
        tsconfig: '../tsconfig.json',
        out: 'docs/api',

        sidebar: {
          categoryLabel: 'API Reference',
          position: 2,
        },

        excludePrivate: true,
        excludeProtected: true,
        excludeExternals: true,
        exclude: ['**/__tests__/**', '**/node_modules/**', '**/dist/**'],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Receta',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'doc',
          docId: 'api/index',
          label: 'API Reference',
          position: 'left',
        },
        {
          href: 'https://github.com/khaledmaher/receta',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  },
};

export default config;
```

### 4. Build and Verify

```bash
bun run build   # Should build successfully!
bun run start   # View at http://localhost:3000
```

---

## How It Works

### Workflow

```
┌─────────────────────────────────────────────────────────┐
│  1. Write JSDoc comments in src/result/map/index.ts    │
├─────────────────────────────────────────────────────────┤
│  2. Run Docusaurus build                                │
│     → TypeDoc extracts JSDoc                            │
│     → Generates Markdown files in docs/api/            │
├─────────────────────────────────────────────────────────┤
│  3. Docusaurus processes Markdown                       │
│     → CommonMark mode: treats <T> as text              │
│     → Renders to HTML                                   │
├─────────────────────────────────────────────────────────┤
│  4. Result: Perfect API docs with generic types! ✅     │
└─────────────────────────────────────────────────────────┘
```

### No Manual Escaping Needed!

With CommonMark mode, these all render perfectly:
- ✅ `Result<T, E>`
- ✅ `Option<Some<T>>`
- ✅ `Array<Promise<T>>`
- ✅ Operators: `===`, `<=`, `>=`, `<`, `>`
- ✅ All TypeScript syntax

---

## Comparison with Other Approaches

| Approach | MDX Issues? | Maintenance | Verdict |
|----------|-------------|-------------|---------|
| **Nextra** | ❌ Yes | High (custom escaping) | ❌ Not recommended |
| **Docusaurus (MDX mode)** | ❌ Yes | High (custom escaping) | ❌ Not recommended |
| **Docusaurus (CommonMark)** | ✅ No | Zero | ✅ **RECOMMENDED** |
| **docusaurus-plugin-typedoc-api** | ✅ No | Medium (config issues) | ⚠️ Alternative |
| **Starlight** | ❌ Likely yes | Unknown | ⚠️ Untested |
| **VitePress** | ❌ Likely yes | Unknown | ⚠️ Untested |
| **Mintlify** | ✅ No | Zero | 💰 Paid option |

---

## Benefits

### ✅ Zero Maintenance
- No custom escaping scripts
- No regex hacks
- No brittle workarounds
- Plugin handles everything automatically

### ✅ Always in Sync
- TypeDoc runs during build
- Documentation updates automatically
- Single source of truth (JSDoc comments)

### ✅ Full Feature Set
- Type signatures preserved
- Examples from `@example` tags
- Cross-references from `@see` tags
- Parameter descriptions
- Return type documentation

### ✅ Great Developer Experience
- Fast dev server with hot reload
- Search built-in
- Responsive UI
- Dark mode support

---

## npm Scripts

Add to root `package.json`:

```json
{
  "scripts": {
    "docs:dev": "cd docs-site && bun run start",
    "docs:build": "cd docs-site && bun run build",
    "docs:serve": "cd docs-site && bun run serve"
  }
}
```

Usage:
```bash
bun run docs:dev    # Start dev server
bun run docs:build  # Build static site
bun run docs:serve  # Preview build locally
```

---

## Deployment

### GitHub Pages

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: |
          cd docs-site
          bun install

      - name: Build
        run: cd docs-site && bun run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-site/build
```

### Vercel

```json
// docs-site/vercel.json
{
  "buildCommand": "bun run build",
  "outputDirectory": "build",
  "installCommand": "bun install"
}
```

Just connect your GitHub repo to Vercel and it will auto-deploy!

---

## Updating Documentation

### 1. Edit JSDoc in Source Files

```typescript
// src/result/map/index.ts
/**
 * Maps over the Ok value of a Result.
 *
 * Transforms `Result<T, E>` to `Result<U, E>` by applying a function to the Ok value.
 *
 * @param result - The Result to map over
 * @param fn - Function to transform the Ok value
 * @returns A new Result with the transformed value
 *
 * @example
 * ```typescript
 * map(ok(5), x => x * 2) // => Ok(10)
 * map(err('fail'), x => x * 2) // => Err('fail')
 * ```
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>
```

### 2. Rebuild Docs

```bash
cd docs-site
bun run build
```

That's it! The docs auto-update from your JSDoc comments.

---

## Troubleshooting

### Build fails with "Cannot find module"

**Solution:** Check that `tsconfig.json` path is correct:
```typescript
tsconfig: '../tsconfig.json',  // Relative to docs-site/
```

### Broken links warning

**Solution:** Temporarily set:
```typescript
onBrokenLinks: 'warn',
```

Then fix the actual broken links.

### Generic types still causing issues

**Solution:** Verify CommonMark mode is enabled:
```typescript
markdown: {
  format: 'md',  // NOT 'mdx'!
},
```

---

## Migration from Nextra

If you currently have Nextra:

1. **Keep Nextra running** during transition
2. **Set up Docusaurus** in parallel (`docs-site/`)
3. **Copy manual content** from `docs-website/src/content/` to `docs-site/docs/`
4. **Test thoroughly**
5. **Switch DNS/deployment** when ready
6. **Delete Nextra** after confirming Docusaurus works

Both can coexist safely!

---

## Key Takeaways

1. ✅ **CommonMark mode solves MDX parsing issues**
2. ✅ **One config line, zero maintenance**
3. ✅ **Generic types `<T, E>` render perfectly**
4. ✅ **Auto-updates from JSDoc comments**
5. ✅ **Production-ready, battle-tested stack**

---

## Credits

- **Docusaurus** by Meta (Facebook)
- **TypeDoc** by TypeStrong
- **typedoc-plugin-markdown** by tgreyuk
- **docusaurus-plugin-typedoc** by tgreyuk

---

**Last updated:** 2026-02-23

**Status:** ✅ Production-ready

**Recommended for:** Any TypeScript library with JSDoc comments
