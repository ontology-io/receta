#!/usr/bin/env bun

/**
 * Generate living documentation from TypeScript source files
 *
 * This script:
 * 1. Runs TypeDoc to extract JSDoc comments
 * 2. Parses the markdown output
 * 3. Generates Nextra-compatible MDX files
 * 4. Outputs to docs-website/src/content/api/
 */

import * as R from 'remeda'
import { $ } from 'bun'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

// Configuration
const TYPEDOC_OUTPUT = 'docs-temp'
const NEXTRA_OUTPUT = 'docs-website/src/content/api'
const MODULES = [
  'result',
  'option',
  'async',
  'predicate',
  'validation',
  'collection',
  'object',
  'string',
  'number',
  'memo',
  'lens',
  'compare',
  'function',
  'testing',
] as const

interface ModuleDoc {
  name: string
  functions: FunctionDoc[]
  types: TypeDoc[]
}

interface FunctionDoc {
  name: string
  signature: string
  description: string
  examples: string[]
  params: ParamDoc[]
  returns: string
  seeAlso: string[]
}

interface TypeDoc {
  name: string
  definition: string
  description: string
}

interface ParamDoc {
  name: string
  type: string
  description: string
}

/**
 * Main entry point
 */
async function main() {
  console.log('🚀 Generating living documentation...\n')

  // Step 1: Run TypeDoc
  console.log('📚 Running TypeDoc...')
  await runTypeDoc()

  // Step 2: Parse TypeDoc output
  console.log('📖 Parsing TypeDoc output...')
  const modules = await parseTypeDocOutput()

  // Step 3: Generate MDX files
  console.log('✍️  Generating MDX files...')
  await generateMDXFiles(modules)

  // Step 4: Clean up
  console.log('🧹 Cleaning up temporary files...')
  await fs.rm(TYPEDOC_OUTPUT, { recursive: true, force: true })

  console.log('\n✅ Documentation generated successfully!')
  console.log(`📁 Output: ${NEXTRA_OUTPUT}/`)
}

/**
 * Run TypeDoc to generate markdown
 */
async function runTypeDoc(): Promise<void> {
  try {
    await $`bunx typedoc`
  } catch (error) {
    console.error('❌ TypeDoc failed:', error)
    throw error
  }
}

/**
 * Parse TypeDoc markdown output into structured data
 */
async function parseTypeDocOutput(): Promise<ModuleDoc[]> {
  const moduleDocs: ModuleDoc[] = []

  for (const moduleName of MODULES) {
    // TypeDoc generates files like "result.md" at the root of docs-temp
    const modulePath = path.join(TYPEDOC_OUTPUT, `${moduleName}.md`)

    try {
      const content = await fs.readFile(modulePath, 'utf-8')
      const doc = parseModuleMarkdown(moduleName, content)
      moduleDocs.push(doc)
      console.log(`  ✓ Parsed ${moduleName} module`)
    } catch (error) {
      console.warn(`  ⚠ Skipping ${moduleName}: ${(error as Error).message}`)
    }
  }

  return moduleDocs
}

/**
 * Parse a single module's markdown file
 */
function parseModuleMarkdown(name: string, markdown: string): ModuleDoc {
  // Store the raw TypeDoc-generated markdown
  // We'll convert it to Nextra-compatible MDX
  return {
    name,
    functions: [], // Not parsing detailed structure yet
    types: [],
    rawMarkdown: markdown,
  } as ModuleDoc & { rawMarkdown: string }
}

/**
 * Generate MDX files for Nextra
 */
async function generateMDXFiles(modules: ModuleDoc[]): Promise<void> {
  // Ensure output directory exists
  await fs.mkdir(NEXTRA_OUTPUT, { recursive: true })

  // Generate _meta.js for Nextra navigation
  await generateMetaFile(modules)

  // Generate individual module MDX files
  for (const module of modules) {
    const mdxContent = convertTypeDocToNextra(module)
    const outputPath = path.join(NEXTRA_OUTPUT, `${module.name}.mdx`)
    await fs.writeFile(outputPath, mdxContent, 'utf-8')
    console.log(`  ✓ Generated ${module.name}.mdx`)
  }

  // Also copy individual function docs
  await copyFunctionDocs()
}

/**
 * Generate _meta.js for Nextra sidebar
 */
async function generateMetaFile(modules: ModuleDoc[]): Promise<void> {
  const metaContent = `export default {
${modules.map(m => `  "${m.name}": "${capitalize(m.name)}"`).join(',\n')}
}
`

  const metaPath = path.join(NEXTRA_OUTPUT, '_meta.js')
  await fs.writeFile(metaPath, metaContent, 'utf-8')
}

/**
 * Convert TypeDoc markdown to Nextra-compatible MDX
 */
function convertTypeDocToNextra(module: ModuleDoc & { rawMarkdown: string }): string {
  const { name, rawMarkdown } = module

  // Convert TypeDoc markdown to Nextra format
  let content = rawMarkdown

  // Remove TypeDoc breadcrumbs
  content = content.replace(/\[.*?\]\(.*?\) \/ .*/g, '')
  content = content.replace(/\*\*\*\n\n/g, '')

  // Fix relative links to work in Nextra
  content = content.replace(/\]\(result\//g, '](')
  content = content.replace(/\]\(option\//g, '](')
  content = content.replace(/\]\(async\//g, '](')

  // Escape generic types in prose to prevent MDX parse errors
  // MDX interprets <T, E> as HTML tags, so wrap in code blocks
  content = escapeGenericTypes(content)

  // Add frontmatter
  const frontmatter = `---
title: ${capitalize(name)}
---

{/* AUTO-GENERATED from source code - Last updated: ${new Date().toISOString().split('T')[0]} */}
{/* To update: modify JSDoc in src/${name}/ and run: bun run docs:generate */}

`

  return frontmatter + content
}

/**
 * Escape generic type syntax in prose text
 * MDX interprets <T, E> as HTML tags, causing parse errors
 * We wrap them in inline code to preserve readability
 */
function escapeGenericTypes(content: string): string {
  // Split content by code blocks to avoid modifying code
  const parts: string[] = []
  const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Process text before code block
    const textBefore = content.slice(lastIndex, match.index)
    parts.push(escapeGenericTypesInText(textBefore))

    // Keep code block as-is
    parts.push(match[0])

    lastIndex = match.index + match[0].length
  }

  // Process remaining text
  parts.push(escapeGenericTypesInText(content.slice(lastIndex)))

  return parts.join('')
}

/**
 * Escape generic types in plain text (not in code blocks)
 */
function escapeGenericTypesInText(text: string): string {
  let result = text

  // 1. Wrap ALL generic types (any word followed by <...>) in inline code
  // This catches Result<T>, Some<T>, Err<E>, Ok<T>, etc.
  result = result.replace(/\b([A-Z][a-zA-Z0-9]*)<([^>]+)>/g, '`$1<$2>`')

  // 2. Escape comparison operators in parentheses: (===), (>), (<=), etc.
  // Common in descriptions like "Uses strict equality (===)"
  result = result.replace(/\((===|!==|==|!=|<=|>=|<|>|=)\)/g, '(`$1`)')

  // 3. Escape multi-character comparison operators in prose
  result = result.replace(/(\s)(===|!==|==|!=|<=|>=)(\s)/g, '$1`$2`$3')

  // 4. Escape single comparison operators in specific contexts:
  // - "if value > threshold" type descriptions
  result = result.replace(/(\bvalue\s*)(>|<|=)(\s*\w+)/g, '$1`$2`$3')
  result = result.replace(/(\bmin\s*)<=(\s*value\s*)<=(\s*max)/g, '$1`<=`$2`<=`$3')

  return result
}

/**
 * Copy individual function documentation files
 */
async function copyFunctionDocs(): Promise<void> {
  // Copy all function-level docs from TypeDoc output to Nextra
  // This preserves the detailed per-function pages

  for (const moduleName of MODULES) {
    const modulePath = path.join(TYPEDOC_OUTPUT, moduleName)

    try {
      // Check if module directory exists
      await fs.access(modulePath)

      // Create output directory for module
      const outputDir = path.join(NEXTRA_OUTPUT, moduleName)
      await fs.mkdir(outputDir, { recursive: true })

      // Copy all .md files
      const files = await fs.readdir(modulePath)
      for (const file of files) {
        if (file.endsWith('.md')) {
          const inputPath = path.join(modulePath, file)
          const content = await fs.readFile(inputPath, 'utf-8')

          // Convert to MDX
          const mdxContent = convertFileToNextra(content)

          // Write as .mdx
          const outputPath = path.join(outputDir, file.replace('.md', '.mdx'))
          await fs.writeFile(outputPath, mdxContent, 'utf-8')
        }
      }
    } catch (error) {
      // Module directory doesn't exist, skip
    }
  }
}

/**
 * Convert individual function doc file to Nextra format
 */
function convertFileToNextra(markdown: string): string {
  let content = markdown

  // Remove breadcrumbs
  content = content.replace(/\[.*?\]\(.*?\) \/ .*/g, '')
  content = content.replace(/\*\*\*\n\n/g, '')

  // Fix relative paths
  content = content.replace(/\]\(\.\.\//g, '](../')

  // Escape generic types in prose
  content = escapeGenericTypes(content)

  return content
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
