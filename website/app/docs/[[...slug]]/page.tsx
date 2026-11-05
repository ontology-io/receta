import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { source } from '@/lib/docs/source'
import { DocsScreen } from '@/screens/docs.screen'
import { metaContent } from '@/content/home.content'

type DocsRouteProps = { readonly params: Promise<{ readonly slug?: string[] }> }

const DocsRoute = async ({ params }: DocsRouteProps) => <DocsScreen slug={(await params).slug} />

export const generateStaticParams = () => source.generateParams()

export const generateMetadata = async ({ params }: DocsRouteProps): Promise<Metadata> => {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  const { title, description } = page.data
  return {
    title,
    description,
    alternates: { canonical: page.url },
    openGraph: {
      title,
      description,
      type: 'article',
      url: page.url,
      siteName: metaContent.siteName,
      images: [metaContent.image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [metaContent.image.url] },
  }
}

export default DocsRoute
