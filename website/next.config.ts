import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const config: NextConfig = {
  // The whole site is static: every page renders at build time and hosts anywhere.
  output: 'export',
  // Memoizes components automatically, so no hand-written useMemo or useCallback.
  reactCompiler: true,
  images: { unoptimized: true },
  // The site and the docs have separate root layouts, so 404s can't belong to either.
  experimental: { globalNotFound: true },
}

export default createMDX()(config)
