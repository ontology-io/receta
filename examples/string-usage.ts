/**
 * String Module Usage Examples
 *
 * Run with: bun run examples/string-usage.ts
 */

import * as R from 'remeda'
import {
  // Template utilities
  template,
  parseTemplate,
  // Transformers
  slugify,
  kebabCase,
  snakeCase,
  camelCase,
  pascalCase,
  capitalize,
  titleCase,
  truncate,
  // Validators
  isEmpty,
  isEmail,
  isUrl,
  isAlphanumeric,
  isNumeric,
  isHexColor,
  // Sanitizers
  stripHtml,
  escapeHtml,
  unescapeHtml,
  trim,
  // Extractors
  words,
  lines,
  between,
  extract,
} from '@ontologyio/receta/string'
import { isSome, unwrapOr } from '@ontologyio/receta/option'
import { isOk } from '@ontologyio/receta/result'

console.log('=== Example 1: Blog Post URL Slugs ===\n')

// Real-world: Converting blog post titles to URL-safe slugs
const blogTitles = [
  '10 Tips for Better TypeScript Code',
  'Understanding React Hooks in 2024',
  'Café & Restaurant Guide',
  'How to Build a REST API',
]

const slugs = blogTitles.map(slugify)
console.log('Blog post slugs:')
slugs.forEach((slug, i) => {
  console.log(`  "${blogTitles[i]}" → "${slug}"`)
})

console.log('\n=== Example 2: Email Validation for Signup Forms ===\n')

// Real-world: Validating user emails during registration
const userEmails = [
  'user@example.com',
  'invalid.email',
  'admin+notifications@company.co.uk',
  '',
  'test@localhost',
]

console.log('Email validation results:')
userEmails.forEach((email) => {
  const result = isEmail(email)
  console.log(`  "${email}" → ${isSome(result) ? '✓ Valid' : '✗ Invalid'}`)
})

console.log('\n=== Example 3: Template-Based Notifications ===\n')

// Real-world: Email notification system
const notificationTemplates = {
  welcome: 'Welcome {{name}}! Your account has been created.',
  orderConfirm: 'Order {{orderId}} confirmed. Total: ${{amount}}',
  reminder: 'Hi {{name}}, you have {{count}} pending tasks.',
}

const users = [
  { name: 'Alice', orderId: 'ORD-12345', amount: 99.99 },
  { name: 'Bob', count: 3 },
]

console.log('Generated notifications:')
const welcomeMsg = template(notificationTemplates.welcome, { name: 'Alice' })
if (isOk(welcomeMsg)) {
  console.log(`  Welcome: ${welcomeMsg.value}`)
}

const orderMsg = template(notificationTemplates.orderConfirm, users[0]!)
if (isOk(orderMsg)) {
  console.log(`  Order: ${orderMsg.value}`)
}

const reminderMsg = template(notificationTemplates.reminder, users[1]!)
if (isOk(reminderMsg)) {
  console.log(`  Reminder: ${reminderMsg.value}`)
}

console.log('\n=== Example 4: Sanitizing User-Generated Content ===\n')

// Real-world: Protecting against XSS in comment system
const userComments = [
  '<script>alert("XSS")</script>Nice post!',
  'Great article! <a href="spam.com">Click here</a>',
  'I love <strong>TypeScript</strong>!',
]

console.log('Sanitized comments (HTML stripped):')
userComments.forEach((comment) => {
  const sanitized = stripHtml(comment)
  console.log(`  Original: ${comment}`)
  console.log(`  Safe:     ${sanitized}\n`)
})

console.log('Escaped comments (safe to display):')
userComments.forEach((comment) => {
  const escaped = escapeHtml(comment)
  console.log(`  ${escaped}`)
})

console.log('\n=== Example 5: Case Conversions for API Fields ===\n')

// Real-world: Converting between API naming conventions
const apiResponse = {
  user_id: '12345',
  first_name: 'Jane',
  last_name: 'Doe',
  email_address: 'jane@example.com',
}

console.log('Snake_case (from database) → camelCase (for frontend):')
Object.entries(apiResponse).forEach(([key, value]) => {
  const camelKey = camelCase(key)
  console.log(`  ${key} → ${camelKey}: ${value}`)
})

console.log('\n=== Example 6: Text Truncation for Previews ===\n')

// Real-world: Blog post excerpts
const blogPost = {
  title: 'Understanding TypeScript Advanced Types',
  content:
    'TypeScript provides powerful type system features that enable developers to write safer and more maintainable code. In this comprehensive guide, we will explore advanced type patterns including conditional types, mapped types, and template literal types.',
}

const excerpt = truncate(blogPost.content, { length: 100, words: true })
console.log(`Title: ${blogPost.title}`)
console.log(`Excerpt: ${excerpt}`)

console.log('\n=== Example 7: URL Validation for Link Checker ===\n')

// Real-world: Validating links in markdown content
const links = [
  'https://example.com/api/users',
  'http://localhost:3000',
  'not a valid url',
  'https://docs.typescript.com/handbook',
  'ftp://files.example.com',
]

console.log('URL validation:')
links.forEach((link) => {
  const result = isUrl(link)
  console.log(`  ${link} → ${isSome(result) ? '✓ Valid' : '✗ Invalid'}`)
})

console.log('\n=== Example 8: Parsing Log Files ===\n')

// Real-world: Extracting information from log entries
const logEntry = `
[2024-01-15 10:30:45] INFO - User user@example.com logged in from 192.168.1.100
[2024-01-15 10:31:12] ERROR - Failed to process order ORD-12345
[2024-01-15 10:32:01] WARN - High memory usage detected
`

const timestamps = extract(logEntry, /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/g)
const emails = extract(logEntry, /\S+@\S+\.\S+/g)
const orderIds = extract(logEntry, /ORD-\d+/g)

console.log('Extracted from logs:')
console.log(`  Timestamps: ${timestamps.join(', ')}`)
console.log(`  Emails: ${emails.join(', ')}`)
console.log(`  Order IDs: ${orderIds.join(', ')}`)

console.log('\n=== Example 9: Processing CSV Data ===\n')

// Real-world: Parsing CSV rows
const csvData = `name,email,status
Alice Johnson,alice@example.com,active
Bob Smith,bob@test.org,inactive
Charlie Brown,charlie@demo.com,active`

const rows = lines(csvData)
const headers = R.pipe(rows[0]!, words({ pattern: /,/ }))
const dataRows = rows.slice(1).map((row) => words(row, { pattern: /,/ }))

console.log('CSV parsed:')
console.log(`Headers: ${headers.join(' | ')}`)
dataRows.forEach((row) => {
  console.log(`  ${row.join(' | ')}`)
})

console.log('\n=== Example 10: Extracting Metadata from Text ===\n')

// Real-world: Parsing frontmatter from markdown files
const markdownContent = `---
title: My Blog Post
author: John Doe
date: 2024-01-15
tags: typescript, programming, tutorial
---

# Introduction

This is the content of the blog post...`

const frontmatterBlock = between(markdownContent, '---\n', '\n---')
if (isSome(frontmatterBlock)) {
  console.log('Frontmatter metadata:')
  const metadataLines = lines(frontmatterBlock.value)
  metadataLines.forEach((line) => {
    if (!isEmpty(line)) {
      const [key, value] = line.split(': ')
      console.log(`  ${key}: ${value}`)
    }
  })
}

console.log('\n=== Example 11: Color Validation for UI ===\n')

// Real-world: Validating hex colors in theme configuration
const themeColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: 'ff0000',
  background: '#ffffff',
  invalid: 'not-a-color',
  shorthand: '#fff',
}

console.log('Theme color validation:')
Object.entries(themeColors).forEach(([name, color]) => {
  const result = isHexColor(color)
  console.log(`  ${name}: ${color} → ${isSome(result) ? '✓ Valid' : '✗ Invalid'}`)
})

console.log('\n=== Example 12: Chaining String Operations ===\n')

// Real-world: Processing user input for database storage
const userInput = '  Hello World! This is a TEST.  '

const processed = R.pipe(
  userInput,
  trim,
  (s) => s.toLowerCase(),
  (s) => words(s),
  (w) => w.join('-'),
  slugify
)

console.log(`Original: "${userInput}"`)
console.log(`Processed: "${processed}"`)

console.log('\n=== Example 13: Building API Request Parameters ===\n')

// Real-world: Converting frontend state to API format
const frontendFilters = {
  searchQuery: 'TypeScript Tutorial',
  orderBy: 'createdAt',
  filterType: 'blogPost',
}

console.log('Frontend → API format:')
Object.entries(frontendFilters).forEach(([key, value]) => {
  const apiKey = snakeCase(key)
  console.log(`  ${key} → ${apiKey} = "${value}"`)
})

console.log('\n=== Example 14: Password Strength Validation ===\n')

// Real-world: Basic password validation
const passwords = ['password123', 'P@ssw0rd!', 'abc', 'Test1234']

console.log('Password validation (numeric check):')
passwords.forEach((pwd) => {
  const hasNumbers = !isEmpty(extract(pwd, /\d+/g).join(''))
  const hasLetters = !isEmpty(extract(pwd, /[a-zA-Z]+/g).join(''))
  const isLongEnough = pwd.length >= 8

  console.log(
    `  ${pwd}: ${hasNumbers && hasLetters && isLongEnough ? '✓ Valid' : '✗ Weak'}`
  )
})

console.log('\n✨ All examples completed!')
