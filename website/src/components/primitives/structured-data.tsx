import { toJsonLd } from '@/lib/seo/structured-data'

type StructuredDataProps = { readonly data: unknown }

/** Puts structured data on the page for search engines. Readers never see it. */
export const StructuredData = ({ data }: StructuredDataProps) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(data) }} />
)
