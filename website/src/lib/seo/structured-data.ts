// What the landing page tells search engines about itself, as JSON-LD. Only facts a
// reader can check: no ratings, downloads or claims the page doesn't make. Start at
// landingPageSchema.
import { links, metaContent, RECETA_VERSION, SITE_URL } from '@/content/home.content'

const HOME_URL = `${SITE_URL}/`

/** Describes the site and the library it's for. */
export const landingPageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${HOME_URL}#website`,
      url: HOME_URL,
      name: metaContent.siteName,
      description: metaContent.description,
      inLanguage: 'en',
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${HOME_URL}#library`,
      name: metaContent.siteName,
      alternateName: '@ontologyio/receta',
      description: metaContent.description,
      url: HOME_URL,
      codeRepository: links.github,
      sameAs: [links.npm],
      programmingLanguage: { '@type': 'ComputerLanguage', name: 'TypeScript' },
      runtimePlatform: ['Node.js', 'Bun', 'Deno'],
      version: RECETA_VERSION,
      license: 'https://opensource.org/licenses/MIT',
      isAccessibleForFree: true,
    },
  ],
} as const

/**
 * Serializes data for a script tag. Escaping `<` stops a value that contains
 * `</script>` from closing the tag early.
 */
export const toJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')
