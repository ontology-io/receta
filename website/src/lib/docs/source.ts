// The docs as Fumadocs sees them: every page under content/docs, addressed from /docs.
import { docs } from 'collections/server'
import { loader } from 'fumadocs-core/source'

export const source = loader({ baseUrl: '/docs', source: docs.toFumadocsSource() })
