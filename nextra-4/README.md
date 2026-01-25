# Receta Documentation Site

Documentation website for [Receta](https://github.com/yourusername/receta) built with [Nextra 4](https://nextra.site), [Next.js](https://nextjs.org), [MDX](https://mdxjs.com), and [Tailwind CSS](https://tailwindcss.com).

## Getting Started

### Installation

```bash
# Clone the repository (if needed)
git clone https://github.com/yourusername/receta.git

# Navigate to docs directory
cd nextra-4

# Install dependencies (we use bun)
bun install
```

### Development

```bash
# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Build

```bash
# Build for production
bun run build

# Start production server
bun start
```

## Contributing Content (MDX)

This guide explains how to contribute documentation content using MDX files.

### MDX File Structure

MDX files combine Markdown with JSX components. Here's the typical structure:

#### 1. File Location

Content files live in organized directories:

```
nextra-4/
├── pages/
│   ├── docs/
│   │   ├── getting-started/
│   │   │   ├── installation.mdx
│   │   │   └── quick-start.mdx
│   │   ├── modules/
│   │   │   ├── result/
│   │   │   │   ├── overview.mdx
│   │   │   │   ├── constructors.mdx
│   │   │   │   └── transformers.mdx
│   │   │   ├── option.mdx
│   │   │   └── async.mdx
│   │   └── guides/
│   │       ├── error-handling.mdx
│   │       └── composing-functions.mdx
```

#### 2. MDX File Template

```mdx
---
title: Result Module Overview
description: Learn how to use Result for type-safe error handling
---

import { Callout } from 'nextra/components'
import { Tabs } from 'nextra/components'
import CodeExample from '@/components/CodeExample'

# Result Module Overview

Brief introduction to the module and its purpose.

<Callout type="info">
  Result provides type-safe error handling without exceptions.
</Callout>

## Installation

\`\`\`typescript
import { Result, ok, err } from 'receta/result'
\`\`\`

## Basic Usage

<Tabs items={['Data-first', 'Data-last']}>
  <Tabs.Tab>
    \`\`\`typescript
    Result.map(ok(5), x => x * 2) // => Ok(10)
    \`\`\`
  </Tabs.Tab>
  <Tabs.Tab>
    \`\`\`typescript
    pipe(
      ok(5),
      Result.map(x => x * 2)
    ) // => Ok(10)
    \`\`\`
  </Tabs.Tab>
</Tabs>

## Real-World Example

<CodeExample>
\`\`\`typescript
// Parsing JSON with error handling
const parseConfig = (json: string): Result<Config, ParseError> =>
  pipe(
    Result.tryCatch(() => JSON.parse(json)),
    Result.flatMap(validateConfig)
  )
\`\`\`
</CodeExample>

## Next Steps

- [Constructors →](./constructors)
- [Transformers →](./transformers)
```

#### 3. Frontmatter (Metadata)

Every MDX file should start with frontmatter:

```mdx
---
title: Page Title (for SEO and navigation)
description: Brief description for meta tags
tags: [result, error-handling, typescript]  # Optional
sidebar_position: 1  # Optional: Control order in sidebar
---
```

#### 4. Available Components

##### Callouts

```mdx
import { Callout } from 'nextra/components'

<Callout type="info">
  Informational message
</Callout>

<Callout type="warning">
  Warning message
</Callout>

<Callout type="error">
  Error or danger message
</Callout>

<Callout type="default">
  Default callout
</Callout>
```

##### Tabs

```mdx
import { Tabs } from 'nextra/components'

<Tabs items={['Tab 1', 'Tab 2', 'Tab 3']}>
  <Tabs.Tab>Content for tab 1</Tabs.Tab>
  <Tabs.Tab>Content for tab 2</Tabs.Tab>
  <Tabs.Tab>Content for tab 3</Tabs.Tab>
</Tabs>
```

##### Steps

```mdx
import { Steps } from 'nextra/components'

<Steps>
### Step 1: Install

Install the package...

### Step 2: Import

Import the module...

### Step 3: Use

Start using it...
</Steps>
```

##### File Tree

```mdx
import { FileTree } from 'nextra/components'

<FileTree>
  <FileTree.Folder name="src" defaultOpen>
    <FileTree.Folder name="result">
      <FileTree.File name="types.ts" />
      <FileTree.File name="constructors.ts" />
    </FileTree.Folder>
  </FileTree.Folder>
</FileTree>
```

#### 5. Code Blocks

##### Basic Code Block

````mdx
```typescript
const result = ok(42)
```
````

##### With Filename

````mdx
```typescript filename="user.ts"
interface User {
  id: string
  name: string
}
```
````

##### With Line Highlighting

````mdx
```typescript {2,4-6}
const result = pipe(
  ok(5),           // highlighted
  map(x => x * 2),
  flatMap(validatePositive), // highlighted
  mapErr(formatError)        // highlighted
)
```
````

##### With Line Numbers

````mdx
```typescript showLineNumbers
const parseJSON = <T>(str: string): Result<T, SyntaxError> =>
  tryCatch(
    () => JSON.parse(str) as T,
    (e) => e as SyntaxError
  )
```
````

#### 6. Navigation (_meta.json)

Each directory needs a `_meta.json` to configure navigation:

```json
{
  "index": "Overview",
  "installation": "Installation",
  "quick-start": "Quick Start",
  "modules": {
    "title": "Modules",
    "type": "menu"
  },
  "guides": {
    "title": "Guides",
    "type": "menu"
  }
}
```

For nested menus in `pages/docs/modules/result/_meta.json`:

```json
{
  "overview": "Overview",
  "constructors": "Constructors",
  "transformers": "Transformers",
  "extractors": "Extractors",
  "type-guards": "Type Guards",
  "combinators": "Combinators"
}
```

#### 7. Content Writing Guidelines

##### Use Clear Headings

```mdx
# Main Title (H1) - Only one per page

## Section (H2)

### Subsection (H3)

#### Detail (H4)
```

##### Show Both Signatures

Always demonstrate data-first and data-last:

````mdx
## map()

Transform the Ok value of a Result.

<Tabs items={['Data-first', 'Data-last']}>
  <Tabs.Tab>
    ```typescript
    Result.map(ok(5), x => x * 2) // => Ok(10)
    ```
  </Tabs.Tab>
  <Tabs.Tab>
    ```typescript
    pipe(
      ok(5),
      Result.map(x => x * 2)
    ) // => Ok(10)
    ```
  </Tabs.Tab>
</Tabs>
````

##### Include Real-World Examples

````mdx
## Real-World Example: API Error Handling

```typescript
// Fetch user with proper error handling
const fetchUser = async (id: string): Promise<Result<User, FetchError>> => {
  const response = await fetch(`/api/users/${id}`)

  if (!response.ok) {
    return err({
      type: 'http_error',
      status: response.status,
      message: response.statusText
    })
  }

  return tryCatch(
    async () => await response.json() as User,
    (e) => ({ type: 'parse_error', cause: e })
  )
}
```
````

##### Link Between Pages

```mdx
See [Result constructors](./constructors) for more details.

Learn more in the [Error Handling Guide](/docs/guides/error-handling).
```

#### 8. Adding a New Module Documentation

**Step 1: Create Directory**

```bash
mkdir -p pages/docs/modules/new-module
```

**Step 2: Create _meta.json**

```json
{
  "overview": "Overview",
  "api": "API Reference",
  "examples": "Examples",
  "guides": "Guides"
}
```

**Step 3: Create Overview Page**

Create `pages/docs/modules/new-module/overview.mdx`:

```mdx
---
title: New Module Overview
description: Brief description of the module
---

# New Module

What this module does and why it's useful.

## Installation

\`\`\`typescript
import { something } from 'receta/new-module'
\`\`\`

## Quick Example

\`\`\`typescript
// Show basic usage
\`\`\`
```

**Step 4: Update Parent _meta.json**

In `pages/docs/modules/_meta.json`:

```json
{
  "result": "Result",
  "option": "Option",
  "new-module": {
    "title": "New Module",
    "type": "menu"
  }
}
```

#### 9. Development Workflow

```bash
# Start dev server
bun dev

# View at http://localhost:3000

# Edit MDX files - hot reload works automatically

# Build for production
bun run build
```

#### 10. Content Checklist

Before submitting MDX content:

- [ ] Frontmatter includes title and description
- [ ] Code examples are tested and work
- [ ] Both data-first and data-last patterns shown
- [ ] Real-world examples included
- [ ] Links to related pages added
- [ ] _meta.json updated for navigation
- [ ] Callouts used for important notes
- [ ] Code blocks have proper syntax highlighting
- [ ] TypeScript types are accurate
- [ ] No broken links

#### 11. Example Reference

See `pages/docs/modules/result/` for a complete example of module documentation following these patterns.

## Tech Stack

* [Nextra 4](https://nextra.site) - Next.js-based documentation framework
* [Next.js](https://nextjs.org) - React framework
* [MDX](https://mdxjs.com) - Markdown + JSX
* [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
* [Lucide React](https://lucide.dev) - Icon library
* [Reshaped](https://reshaped.so) - UI components

## Project Structure

```
nextra-4/
├── pages/
│   ├── _app.tsx          # Next.js app
│   ├── index.mdx         # Homepage
│   └── docs/             # Documentation content
├── components/           # React components
├── public/              # Static assets
├── styles/              # Global styles
└── theme.config.tsx     # Nextra theme config
```

## License

See main Receta project for license information.
