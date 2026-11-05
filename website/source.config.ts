import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins/rehype-code'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import { inkCodeTheme, paperCodeTheme } from './src/lib/docs/code-themes'

export const docs = defineDocs({ dir: 'content/docs' })

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      themes: { light: paperCodeTheme, dark: inkCodeTheme },
    },
  },
})
