#!/usr/bin/env bun

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

/**
 * Function Extraction Script
 *
 * Extracts specific functions from the Receta library along with all their dependencies,
 * maintaining the original file structure to preserve working imports.
 *
 * Usage:
 *   bun scripts/extract-functions.ts <function-name> [<function-name> ...]
 *
 * Example:
 *   bun scripts/extract-functions.ts retry sleep clamp
 */

interface FunctionLocation {
  modulePath: string // e.g., 'async/retry'
  filePath: string // e.g., 'src/async/retry/index.ts'
}

interface ImportInfo {
  importPath: string
  resolvedPath: string
  isExternal: boolean
}

const SRC_DIR = path.join(process.cwd(), 'src')
const OUTPUT_DIR = path.join(process.cwd(), 'output')

// Track visited files to avoid circular dependencies
const visitedFiles = new Set<string>()
const filesToCopy = new Set<string>()

/**
 * Find the file that exports a given function
 */
function findFunctionLocation(functionName: string): FunctionLocation | null {
  // Search through all module index files
  const modules = fs.readdirSync(SRC_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  for (const module of modules) {
    const indexPath = path.join(SRC_DIR, module, 'index.ts')
    if (!fs.existsSync(indexPath)) continue

    const content = fs.readFileSync(indexPath, 'utf-8')

    // Check for direct export
    if (content.includes(`export * from './${functionName}'`)) {
      const functionFilePath = path.join(SRC_DIR, module, functionName, 'index.ts')
      if (fs.existsSync(functionFilePath)) {
        return {
          modulePath: `${module}/${functionName}`,
          filePath: functionFilePath
        }
      }
    }

    // Check if function is exported from the module index itself
    const exportRegex = new RegExp(`export.*\\b${functionName}\\b`)
    if (exportRegex.test(content)) {
      return {
        modulePath: module,
        filePath: indexPath
      }
    }

    // Check in subdirectories
    const modulePath = path.join(SRC_DIR, module)
    const subdirs = fs.readdirSync(modulePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const subdir of subdirs) {
      const subIndexPath = path.join(SRC_DIR, module, subdir, 'index.ts')
      if (!fs.existsSync(subIndexPath)) continue

      const subContent = fs.readFileSync(subIndexPath, 'utf-8')
      const subExportRegex = new RegExp(`export.*\\b${functionName}\\b`)
      if (subExportRegex.test(subContent)) {
        return {
          modulePath: `${module}/${subdir}`,
          filePath: subIndexPath
        }
      }
    }
  }

  return null
}

/**
 * Extract all imports and exports from a TypeScript file
 */
function extractImports(filePath: string): ImportInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const imports: ImportInfo[] = []

  // Match both types and regular imports
  const importRegex = /import\s+(?:type\s+)?(?:{[^}]+}|[\w*\s,]+)\s+from\s+['"]([^'"]+)['"]/g

  // Also match export { x } from './path' patterns
  const exportFromRegex = /export\s+(?:type\s+)?(?:{[^}]+}|\*)\s+from\s+['"]([^'"]+)['"]/g

  let match: RegExpExecArray | null

  // Process imports
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1]
    imports.push(resolveImportPath(importPath, filePath))
  }

  // Process re-exports
  while ((match = exportFromRegex.exec(content)) !== null) {
    const importPath = match[1]
    imports.push(resolveImportPath(importPath, filePath))
  }

  return imports
}

/**
 * Resolve an import path to an absolute file path
 */
function resolveImportPath(importPath: string, fromFile: string): ImportInfo {
  // Skip external packages (except internal 'receta/*')
  if (!importPath.startsWith('.') && !importPath.startsWith('receta/')) {
    return {
      importPath,
      resolvedPath: '',
      isExternal: true
    }
  }

  // Resolve relative path
  let resolvedPath: string
  if (importPath.startsWith('.')) {
    const fileDir = path.dirname(fromFile)
    resolvedPath = path.resolve(fileDir, importPath)

    // Add .ts extension if not present and check if file exists
    if (!resolvedPath.endsWith('.ts')) {
      if (fs.existsSync(resolvedPath + '.ts')) {
        resolvedPath = resolvedPath + '.ts'
      } else if (fs.existsSync(path.join(resolvedPath, 'index.ts'))) {
        resolvedPath = path.join(resolvedPath, 'index.ts')
      }
    }
  } else {
    // Handle 'receta/*' style imports
    const modulePath = importPath.replace(/^receta\//, '')
    resolvedPath = path.join(SRC_DIR, modulePath, 'index.ts')
  }

  return {
    importPath,
    resolvedPath,
    isExternal: false
  }
}

/**
 * Recursively collect all dependencies of a file
 */
function collectDependencies(filePath: string): void {
  // Skip if already visited
  if (visitedFiles.has(filePath)) return
  visitedFiles.add(filePath)

  // Add file to copy list
  filesToCopy.add(filePath)

  // Extract and process imports
  const imports = extractImports(filePath)
  for (const imp of imports) {
    if (imp.isExternal) continue
    if (!imp.resolvedPath || !fs.existsSync(imp.resolvedPath)) {
      console.warn(`⚠️  Could not resolve import: ${imp.importPath} from ${filePath}`)
      continue
    }

    // Recursively collect dependencies
    collectDependencies(imp.resolvedPath)
  }
}

/**
 * Copy a file to the output directory, maintaining structure
 */
function copyFileToOutput(srcPath: string): void {
  const relativePath = path.relative(process.cwd(), srcPath)
  const destPath = path.join(OUTPUT_DIR, relativePath)
  const destDir = path.dirname(destPath)

  // Create directory structure
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  // Copy file
  fs.copyFileSync(srcPath, destPath)
}

/**
 * Create a minimal package.json for the output
 */
function createPackageJson(): void {
  const packageJson = {
    name: 'receta-extracted',
    version: '0.1.0',
    description: 'Extracted functions from Receta',
    type: 'module',
    scripts: {
      typecheck: 'tsc --noEmit',
      build: 'tsc'
    },
    dependencies: {
      remeda: '^2.19.1'
    },
    devDependencies: {
      typescript: '^5.7.3'
    }
  }

  const outputPackagePath = path.join(OUTPUT_DIR, 'package.json')
  fs.writeFileSync(outputPackagePath, JSON.stringify(packageJson, null, 2))
}

/**
 * Copy TypeScript config
 */
function copyTsConfig(): void {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json')
  const outputTsConfigPath = path.join(OUTPUT_DIR, 'tsconfig.json')

  if (fs.existsSync(tsConfigPath)) {
    fs.copyFileSync(tsConfigPath, outputTsConfigPath)
  }
}

/**
 * Main extraction function
 */
function extractFunctions(functionNames: string[]): void {
  console.log(`🔍 Searching for functions: ${functionNames.join(', ')}`)

  // Find each function
  const locations = new Map<string, FunctionLocation>()
  for (const fnName of functionNames) {
    const location = findFunctionLocation(fnName)
    if (!location) {
      console.error(`❌ Function not found: ${fnName}`)
      continue
    }
    locations.set(fnName, location)
    console.log(`✓ Found ${fnName} at ${location.filePath}`)
  }

  if (locations.size === 0) {
    console.error('❌ No functions found')
    process.exit(1)
  }

  // Collect all dependencies
  console.log('\n📦 Collecting dependencies...')
  for (const [fnName, location] of locations) {
    collectDependencies(location.filePath)
  }

  console.log(`\n✓ Found ${filesToCopy.size} files to extract`)

  // Clean output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true })
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Copy all files
  console.log('\n📝 Copying files...')
  for (const filePath of filesToCopy) {
    copyFileToOutput(filePath)
    const relativePath = path.relative(process.cwd(), filePath)
    console.log(`  ✓ ${relativePath}`)
  }

  // Create package.json and tsconfig.json
  createPackageJson()
  copyTsConfig()

  console.log(`\n✅ Extraction complete! Output directory: ${OUTPUT_DIR}`)
  console.log(`\nTo use the extracted code:`)
  console.log(`  cd ${OUTPUT_DIR}`)
  console.log(`  bun install`)
  console.log(`  bun run typecheck`)
}

// Main execution
const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('Usage: bun scripts/extract-functions.ts <function-name> [<function-name> ...]')
  console.error('\nExample:')
  console.error('  bun scripts/extract-functions.ts retry sleep clamp')
  process.exit(1)
}

extractFunctions(args)
