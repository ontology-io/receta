// Syntax colours for the docs, taken from the site's code tokens. Keywords step back and
// types stand out, because in Receta the type is what the reader came to read.

type Palette = {
  readonly name: string
  readonly type: 'light' | 'dark'
  readonly background: string
  readonly text: string
  readonly quiet: string
  readonly string: string
  readonly kind: string
}

const scopes = ({ quiet, string, kind, text }: Palette) => [
  { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: quiet, fontStyle: 'italic' } },
  { scope: ['keyword', 'storage', 'storage.type', 'keyword.operator.new'], settings: { foreground: quiet } },
  { scope: ['string', 'punctuation.definition.string'], settings: { foreground: string } },
  { scope: ['entity.name.type', 'support.type', 'support.class', 'entity.name.class'], settings: { foreground: kind } },
  { scope: ['entity.name.function', 'support.function'], settings: { foreground: text } },
  { scope: ['constant.numeric', 'constant.language'], settings: { foreground: string } },
]

const toTheme = (palette: Palette) => ({
  name: palette.name,
  type: palette.type,
  colors: { 'editor.background': palette.background, 'editor.foreground': palette.text },
  tokenColors: scopes(palette),
})

export const paperCodeTheme = toTheme({
  name: 'receta-paper',
  type: 'light',
  background: '#e8e0d1',
  text: '#16130f',
  quiet: '#665c51',
  string: '#8a5a00',
  kind: '#17694a',
})

export const inkCodeTheme = toTheme({
  name: 'receta-ink',
  type: 'dark',
  background: '#1f1a16',
  text: '#f3ede2',
  quiet: '#a2978a',
  string: '#e9be5c',
  kind: '#7fcfa6',
})
