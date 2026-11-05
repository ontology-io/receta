import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { source } from '@/lib/docs/source'
import { DocsScreen } from '@/screens/docs.screen'

type DocsRouteProps = { readonly params: Promise<{ readonly slug?: string[] }> }

const DocsRoute = async ({ params }: DocsRouteProps) => <DocsScreen slug={(await params).slug} />

export const generateStaticParams = () => source.generateParams()

export const generateMetadata = async ({ params }: DocsRouteProps): Promise<Metadata> => {
  const page = source.getPage((await params).slug)
  if (!page) notFound()
  return { title: page.data.title, description: page.data.description }
}

export default DocsRoute
