/**
 * Real-world examples for String module enhancements
 *
 * Demonstrates practical usage of:
 * - pluralize: Count-aware pluralization
 * - truncateWords: Word-based truncation
 * - escapeRegex: Safe regex patterns
 * - normalizeWhitespace: Text cleanup
 * - initials: Extract initials for avatars
 * - highlight: Search result highlighting
 */

import * as R from 'remeda'
import {
  pluralize,
  truncateWords,
  escapeRegex,
  normalizeWhitespace,
  initials,
  highlight,
} from '../src/string'

console.log('=== String Module Enhancements Examples ===\n')

// ============================================================================
// Example 1: UI Labels with Pluralization
// ============================================================================
console.log('1. UI Labels with Pluralization')
console.log('--------------------------------')

interface CartSummary {
  items: number
  users: number
  notifications: number
}

function renderCartSummary(cart: CartSummary): string {
  return `
    ${pluralize('item', cart.items)} in cart
    ${pluralize('user', cart.users)} online
    ${pluralize('notification', cart.notifications)} pending
  `.trim()
}

console.log(renderCartSummary({ items: 1, users: 5, notifications: 0 }))
// Output:
// 1 item in cart
// 5 users online
// 0 notifications pending

console.log()

// Batch processing with pluralize
const processingResults = [
  { task: 'file', count: 42 },
  { task: 'image', count: 1 },
  { task: 'video', count: 0 },
]

const summaries = R.pipe(
  processingResults,
  R.map((r) => pluralize(r.task, r.count))
)

console.log('Processing:', summaries.join(', '))
// Output: Processing: 42 files, 1 image, 0 videos

console.log('\n')

// ============================================================================
// Example 2: Article Previews with Word Truncation
// ============================================================================
console.log('2. Article Previews with Word Truncation')
console.log('----------------------------------------')

interface Article {
  title: string
  content: string
  author: string
}

const articles: Article[] = [
  {
    title: 'Introduction to Functional Programming in TypeScript',
    content:
      'Functional programming is a programming paradigm that treats computation as the evaluation of mathematical functions and avoids changing state and mutable data. In this comprehensive guide, we will explore the fundamentals of functional programming and how to apply them in TypeScript applications.',
    author: 'Jane Smith',
  },
  {
    title: 'Short Guide',
    content: 'This is brief.',
    author: 'John Doe',
  },
]

function renderArticlePreview(article: Article): string {
  const preview = truncateWords(article.content, 15)
  const titlePreview = truncateWords(article.title, 5)

  return `
Title: ${titlePreview}
Preview: ${preview}
By: ${article.author}
  `.trim()
}

articles.forEach((article) => {
  console.log(renderArticlePreview(article))
  console.log()
})

console.log('\n')

// ============================================================================
// Example 3: Safe Search with Regex Escaping
// ============================================================================
console.log('3. Safe Search with Regex Escaping')
console.log('----------------------------------')

const products = [
  'example.com domain registration',
  'Email at user@example.com',
  'Special offer: $100 discount',
  'Price range: $100-$200',
  'Regular coffee (8oz)',
]

function searchProducts(query: string): string[] {
  // User input might contain regex special characters
  const safePattern = escapeRegex(query)
  const regex = new RegExp(safePattern, 'i')

  return products.filter((product) => regex.test(product))
}

console.log('Search for "example.com":', searchProducts('example.com'))
// Finds exact matches, not treating . as wildcard

console.log('Search for "$100":', searchProducts('$100'))
// Finds products with $100, not treating $ as regex anchor

console.log('Search for "(8oz)":', searchProducts('(8oz)'))
// Finds products with (8oz), not treating () as capture group

console.log('\n')

// ============================================================================
// Example 4: Data Cleanup with Whitespace Normalization
// ============================================================================
console.log('4. Data Cleanup with Whitespace Normalization')
console.log('---------------------------------------------')

// Simulating messy user input or external data
const messyData = [
  '  John    Doe  ',
  'jane\t\tdoe@example.com',
  'Address:\n123   Main\nStreet\n\n',
  'Phone:   555-1234    ',
]

const cleanedData = R.pipe(messyData, R.map(normalizeWhitespace))

console.log('Original data:')
messyData.forEach((d, i) => console.log(`  ${i + 1}. "${d}"`))

console.log('\nCleaned data:')
cleanedData.forEach((d, i) => console.log(`  ${i + 1}. "${d}"`))

// Use case: Search query normalization
function normalizeSearchQuery(query: string): string {
  return R.pipe(query, normalizeWhitespace, (s) => s.toLowerCase())
}

console.log('\nSearch normalization:')
console.log('  Input: "  JavaScript    Tutorial  "')
console.log(`  Output: "${normalizeSearchQuery('  JavaScript    Tutorial  ')}"`)

console.log('\n')

// ============================================================================
// Example 5: User Avatars with Initials
// ============================================================================
console.log('5. User Avatars with Initials')
console.log('-----------------------------')

interface User {
  id: string
  name: string
  avatarUrl?: string
}

const users: User[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Mary Jane Watson' },
  { id: '3', name: 'Robert Downey Jr.' },
  { id: '4', name: 'single' },
]

function renderUserAvatar(user: User): string {
  if (user.avatarUrl) {
    return `<img src="${user.avatarUrl}" alt="${user.name}" />`
  }

  // Fallback to initials
  const userInitials = initials(user.name, { maxInitials: 2 })
  return `<div class="avatar">${userInitials}</div>`
}

console.log('User avatars:')
users.forEach((user) => {
  console.log(`  ${user.name}: ${renderUserAvatar(user)}`)
})

// Batch processing for user list
const avatarLabels = R.pipe(
  users,
  R.map((u) => ({ name: u.name, initials: initials(u.name, { maxInitials: 2 }) }))
)

console.log('\nInitials for badges:')
avatarLabels.forEach((u) => console.log(`  ${u.name} → ${u.initials}`))

console.log('\n')

// ============================================================================
// Example 6: Search Results Highlighting
// ============================================================================
console.log('6. Search Results Highlighting')
console.log('------------------------------')

interface SearchResult {
  title: string
  description: string
  url: string
}

const searchResults: SearchResult[] = [
  {
    title: 'Learn JavaScript Programming',
    description:
      'Comprehensive guide to JavaScript programming for beginners. Learn JavaScript from scratch with practical examples.',
    url: 'https://example.com/javascript',
  },
  {
    title: 'TypeScript Tutorial',
    description:
      'Master TypeScript with this tutorial. Build type-safe JavaScript applications.',
    url: 'https://example.com/typescript',
  },
  {
    title: 'Python Basics',
    description: 'Introduction to Python programming language for developers.',
    url: 'https://example.com/python',
  },
]

function highlightSearchResults(results: SearchResult[], query: string): void {
  const highlighted = R.pipe(
    results,
    R.map((result) => ({
      title: highlight(result.title, query, { className: 'highlight' }),
      description: highlight(result.description, query, { className: 'highlight' }),
      url: result.url,
    }))
  )

  highlighted.forEach((result) => {
    console.log(`Title: ${result.title}`)
    console.log(`Description: ${result.description}`)
    console.log(`URL: ${result.url}`)
    console.log()
  })
}

console.log('Search query: "script"')
console.log()
highlightSearchResults(searchResults, 'script')

console.log('\n')

// ============================================================================
// Example 7: Combined Workflow - Blog Post Manager
// ============================================================================
console.log('7. Combined Workflow - Blog Post Manager')
console.log('----------------------------------------')

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  tags: string[]
  comments: Comment[]
}

interface Comment {
  author: string
  text: string
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with Functional Programming in JavaScript and TypeScript',
    content:
      'Functional programming has become increasingly popular in the JavaScript ecosystem. This guide explores how to apply functional programming principles in your JavaScript and TypeScript projects, covering topics like immutability, pure functions, and composition.',
    author: 'Alice Johnson',
    tags: ['javascript', 'typescript', 'functional-programming'],
    comments: [
      { author: 'Bob Smith', text: 'Great article!' },
      { author: 'Carol White', text: 'Very helpful, thanks!' },
    ],
  },
]

function renderBlogPostCard(post: BlogPost, searchQuery?: string): string {
  // Truncate title and content
  const titleDisplay = truncateWords(post.title, 8)
  const contentPreview = truncateWords(post.content, 20)

  // Get author initials
  const authorInitials = initials(post.author)

  // Pluralize comments
  const commentCount = pluralize('comment', post.comments.length)

  // Highlight search query if provided
  const highlightedTitle = searchQuery
    ? highlight(titleDisplay, searchQuery, { tag: 'strong' })
    : titleDisplay

  const highlightedContent = searchQuery
    ? highlight(contentPreview, searchQuery, { tag: 'strong' })
    : contentPreview

  return `
┌─ Blog Post Card ─────────────────────────────────────────┐
│ Title: ${highlightedTitle}
│ Preview: ${highlightedContent}
│ Author: ${post.author} (${authorInitials})
│ Tags: ${post.tags.join(', ')}
│ ${commentCount}
└──────────────────────────────────────────────────────────┘
  `.trim()
}

console.log('Blog post without search:')
console.log(renderBlogPostCard(blogPosts[0]!))

console.log('\n\nBlog post with search highlighting (query: "typescript"):')
console.log(renderBlogPostCard(blogPosts[0]!, 'typescript'))

console.log('\n')

// ============================================================================
// Example 8: Form Validation Messages
// ============================================================================
console.log('8. Form Validation Messages')
console.log('---------------------------')

interface ValidationResult {
  field: string
  errors: string[]
}

function formatValidationMessage(result: ValidationResult): string {
  const errorWord = pluralize('error', result.errors.length, { wordOnly: true })
  const count = result.errors.length

  return `Field "${result.field}" has ${count} ${errorWord}:\n${result.errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')}`
}

const validationResults: ValidationResult[] = [
  {
    field: 'email',
    errors: ['Invalid email format'],
  },
  {
    field: 'password',
    errors: ['Password too short', 'Missing special character', 'Missing number'],
  },
]

validationResults.forEach((result) => {
  console.log(formatValidationMessage(result))
  console.log()
})

console.log('=== Examples Complete ===')
