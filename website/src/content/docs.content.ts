// Words around the docs pages. The pages themselves live in content/docs.

export const docsContent = {
  title: 'Receta docs',
  titleTemplate: '%s · Receta docs',
  description: 'Guides and API reference for Receta, practical recipes on top of Remeda.',
  navTitle: 'receta',
  github: 'https://github.com/ontology-io/receta',
} as const

export const docsLinks = [
  { text: 'Home', url: '/', external: true },
  { text: 'npm', url: 'https://www.npmjs.com/package/@ontologyio/receta', external: true },
]
