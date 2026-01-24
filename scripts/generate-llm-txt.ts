#!/usr/bin/env bun

/**
 * Generate llm.txt from decision tree documentation
 *
 * This script creates an optimized llm.txt file that includes:
 * 1. Root decision tree (module selection guide)
 * 2. All module DECISION-TREE.md files
 * 3. References to individual function docs (not full content)
 *
 * Run: bun run scripts/generate-llm-txt.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative, basename, dirname } from 'path'

// Project root directory
const ROOT_DIR = join(import.meta.dir, '..')
const SRC_DIR = join(ROOT_DIR, 'src')
const DOCS_DIR = join(ROOT_DIR, 'docs/decision-trees')
const OUTPUT_FILE = join(ROOT_DIR, 'llm.txt')

interface ModuleInfo {
  name: string
  decisionTreePath: string
  functionDocs: string[]
}

/**
 * Find all DECISION-TREE.md files in src/ directory
 */
function findModuleDecisionTrees(): ModuleInfo[] {
  const modules: ModuleInfo[] = []

  // Get all module directories in src/
  const entries = readdirSync(SRC_DIR, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const moduleName = entry.name
    const modulePath = join(SRC_DIR, moduleName)
    const decisionTreePath = join(modulePath, 'DECISION-TREE.md')

    // Check if DECISION-TREE.md exists
    try {
      statSync(decisionTreePath)

      // Find all function doc files for this module
      const functionDocs = findMarkdownFiles(modulePath)
        .filter(path => !path.endsWith('DECISION-TREE.md'))
        .map(path => relative(ROOT_DIR, path))
        .sort()

      modules.push({
        name: moduleName,
        decisionTreePath,
        functionDocs
      })
    } catch {
      // No DECISION-TREE.md in this module
      continue
    }
  }

  return modules.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Recursively find all .md files in a directory
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = []

  try {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        files.push(...findMarkdownFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  } catch {
    // Directory doesn't exist or not accessible
  }

  return files
}

/**
 * Generate the llm.txt content
 */
function generateLlmTxt(): string {
  const now = new Date().toISOString().split('T')[0]
  const modules = findModuleDecisionTrees()

  const lines: string[] = []

  // Header
  lines.push('# Receta LLM Guide - Module Selection & Navigation')
  lines.push('')
  lines.push(`**Generated**: ${now}`)
  lines.push('**Purpose**: Help AI agents efficiently discover and use Receta functions')
  lines.push('')

  // Usage instructions
  lines.push('## What\'s in This File')
  lines.push('')
  lines.push('This file contains:')
  lines.push('1. **Root Decision Tree** - Select which module to use')
  lines.push('2. **Module Decision Trees** - Function selection within each module')
  lines.push('3. **Function File Map** - Paths to individual function documentation')
  lines.push('')
  lines.push('This file does NOT contain individual function documentation to save tokens.')
  lines.push('')

  // How to use
  lines.push('## How AI Agents Should Use This System')
  lines.push('')
  lines.push('### Step 1: Module Selection (Use Root Tree Below)')
  lines.push('Read the Root Decision Tree to determine which module(s) solve your problem.')
  lines.push('')
  lines.push('### Step 2: Function Selection (Use Module Tree Below)')
  lines.push('Read the module\'s DECISION-TREE section to select the right function.')
  lines.push('')
  lines.push('### Step 3: Implementation Details (Read Function File)')
  lines.push('For detailed examples and type signatures, read the specific function file:')
  lines.push('- **Path**: `src/{module}/{category}/{function}.md`')
  lines.push('- **Contains**: Examples, patterns, type signatures, related functions')
  lines.push('- **Example**: `src/result/constructors/ok.md`')
  lines.push('')

  // File structure
  lines.push('## File Structure Reference')
  lines.push('')
  lines.push('```')
  lines.push('src/')
  for (const module of modules.slice(0, 3)) {
    lines.push(`├── ${module.name}/`)
    lines.push(`│   ├── DECISION-TREE.md           # Module overview (included below)`)
    lines.push(`│   ├── {category}/`)
    lines.push(`│   │   ├── {function}.md          # Function details (read when needed)`)
    lines.push(`│   │   └── ...`)
  }
  lines.push('└── ...')
  lines.push('```')
  lines.push('')

  // Token efficiency
  lines.push('## Token Efficiency Strategy')
  lines.push('')
  lines.push('✅ **This file is lightweight** - Only module decision trees')
  lines.push('✅ **Lazy load details** - Read function docs only when needed')
  lines.push('✅ **Two-step discovery** - Module → Function (not all functions upfront)')
  lines.push('✅ **Full information available** - Nothing is hidden, just referenced')
  lines.push('')

  // Module list
  lines.push('## Modules Included')
  lines.push('')
  for (const module of modules) {
    const functionCount = module.functionDocs.length
    lines.push(`- **${module.name}** - ${functionCount} function doc${functionCount !== 1 ? 's' : ''}`)
  }
  lines.push('')

  lines.push('================================================================================')
  lines.push('')

  // Root decision tree
  lines.push('# ROOT DECISION TREE: Which Module Do I Need?')
  lines.push('')
  try {
    const rootTreePath = join(DOCS_DIR, '00-root.md')
    const rootContent = readFileSync(rootTreePath, 'utf-8')
    lines.push(rootContent.trim())
  } catch (error) {
    lines.push('⚠️ Root decision tree not found at docs/decision-trees/00-root.md')
  }
  lines.push('')
  lines.push('================================================================================')
  lines.push('')

  // Module decision trees
  for (const module of modules) {
    lines.push('#'.repeat(80))
    lines.push(`# MODULE: ${module.name.toUpperCase()}`)
    lines.push('#'.repeat(80))
    lines.push('')

    // Module decision tree content
    try {
      const content = readFileSync(module.decisionTreePath, 'utf-8')
      lines.push(content.trim())
    } catch (error) {
      lines.push(`⚠️ Could not read ${module.decisionTreePath}`)
    }

    lines.push('')

    // Function documentation references
    if (module.functionDocs.length > 0) {
      lines.push('## Available Function Documentation')
      lines.push('')
      lines.push('For detailed implementation help, read these files:')
      lines.push('')

      // Group by category (directory)
      const byCategory = new Map<string, string[]>()
      for (const docPath of module.functionDocs) {
        const parts = docPath.split('/')
        const category = parts.length > 3 ? parts[2] : 'root'
        const files = byCategory.get(category) || []
        files.push(docPath)
        byCategory.set(category, files)
      }

      // Output grouped
      for (const [category, files] of Array.from(byCategory.entries()).sort()) {
        if (category !== 'root') {
          lines.push(`### ${category}`)
        }
        for (const file of files) {
          const functionName = basename(file, '.md')
          lines.push(`- \`${functionName}\` - ${file}`)
        }
        lines.push('')
      }
    }

    lines.push('================================================================================')
    lines.push('')
  }

  // Footer
  lines.push('')
  lines.push('## End of Module Decision Trees')
  lines.push('')
  lines.push('**Next Steps for AI Agents:**')
  lines.push('')
  lines.push('1. You\'ve selected a module from the root tree above')
  lines.push('2. You\'ve selected a function from the module tree')
  lines.push('3. Now read the function file for implementation details')
  lines.push('')
  lines.push(`Total modules: ${modules.length}`)
  lines.push(`Total function docs: ${modules.reduce((sum, m) => sum + m.functionDocs.length, 0)}`)
  lines.push('')

  return lines.join('\n')
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Generating llm.txt from decision tree documentation...')
  console.log('')

  const content = generateLlmTxt()

  writeFileSync(OUTPUT_FILE, content, 'utf-8')

  const lineCount = content.split('\n').length
  const charCount = content.length

  console.log('✅ Successfully generated llm.txt')
  console.log('')
  console.log(`   File: ${relative(ROOT_DIR, OUTPUT_FILE)}`)
  console.log(`   Lines: ${lineCount}`)
  console.log(`   Characters: ${charCount.toLocaleString()}`)
  console.log('')
}

main()
