// The search index, written to one static file at build time. Search then runs in the
// reader's browser, so the docs need no server.
import { createFromSource } from 'fumadocs-core/search/server'
import { source } from '@/lib/docs/source'

export const revalidate = false

export const { staticGET: GET } = createFromSource(source, { language: 'english' })
