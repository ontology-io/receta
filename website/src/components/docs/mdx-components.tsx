import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'

/** Everything a docs page can use without importing it. */
export const docsMdxComponents = (overrides?: MDXComponents): MDXComponents => ({
  ...defaultMdxComponents,
  ...overrides,
})
