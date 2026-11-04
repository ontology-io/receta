import { DocsPageContainer } from '@/containers/docs/docs-page.container'

type DocsScreenProps = { readonly slug: readonly string[] | undefined }

export const DocsScreen = ({ slug }: DocsScreenProps) => <DocsPageContainer slug={slug} />
