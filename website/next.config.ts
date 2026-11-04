import type { NextConfig } from 'next'

const config: NextConfig = {
  // The whole site is static: every page renders at build time and hosts anywhere.
  output: 'export',
  // Memoizes components automatically, so no hand-written useMemo or useCallback.
  reactCompiler: true,
  images: { unoptimized: true },
}

export default config
