import { createRelativeLink } from 'fumadocs-ui/mdx'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { notFound } from 'next/navigation'
import { docsMdxComponents } from '@/components/docs/mdx-components'
import { source } from '@/lib/docs/source'

type DocsPageContainerProps = { readonly slug: readonly string[] | undefined }

/** Reads one page from the docs source and renders it, or 404s when there is no such page. */
export const DocsPageContainer = ({ slug }: DocsPageContainerProps) => {
  const page = source.getPage(slug ? [...slug] : undefined)
  if (!page) notFound()
  const Body = page.data.body
  return (
    <DocsPage toc={page.data.toc}>
      {/* page heading */}
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      {/* the page itself: relative links resolve to other docs pages */}
      <DocsBody>
        <Body components={docsMdxComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  )
}
