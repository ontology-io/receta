// Turns what the TypeScript compiler knows about an export into reference markdown. Pure,
// so the page format has ordinary tests. scripts/generate-reference.ts feeds it. Start at
// exportSection.
import * as R from 'remeda'

export type ExportDoc = {
  readonly name: string
  readonly kind: 'function' | 'value' | 'type'
  readonly summary: string
  /** Signatures in source order, each already printed with its name. */
  readonly signatures: readonly string[]
  /** Whether each signature takes its data later, in the same order. */
  readonly returnsFunction: readonly boolean[]
  readonly returnTypes: readonly string[]
  readonly examples: readonly string[]
  readonly seeAlso: readonly string[]
}

const CODE_SPAN_OR_FENCE = /(```[\s\S]*?```|`[^`\n]*`)/
const GENERIC = /(?:\b[A-Za-z_][\w.]*)?<[A-Za-z_][^<>\n]*(?:<[^<>\n]*>[^<>\n]*)*>/g

/** Makes JSDoc prose safe for MDX: generics become code, and braces stop being expressions. */
export const proseToMdx = (prose: string): string =>
  R.pipe(
    prose.split(CODE_SPAN_OR_FENCE),
    R.map((part) => (part.startsWith('`') ? part : escapeProse(part))),
    R.join(''),
  ).trim()

const escapeProse = (part: string): string =>
  part
    .replace(/\{@link\s+([^}]+)\}/g, '`$1`')
    .replace(GENERIC, (generic) => `\`${generic}\``)
    .replace(/[{}]/g, (brace) => `\\${brace}`)
    .replace(/<(?=[^a-zA-Z/`])/g, '&lt;')

/** Splits a JSDoc @example into the code it holds, with or without a fence around it. */
export const exampleCode = (example: string): readonly string[] => {
  const fenced = [...example.matchAll(/```[a-z]*\n([\s\S]*?)```/g)]
  return fenced.length > 0 ? R.map(fenced, ([, code]) => (code ?? '').trimEnd()) : [example.trim()]
}

/** Pulls the error type out of a return type, or an empty string when it isn't a named one. */
export const failureType = (returnType: string): string => {
  const typeArguments = splitTypeArguments(resultArguments(returnType))
  const error = R.last(typeArguments) ?? ''
  return typeArguments.length === 2 && isNamedError(error) ? error : ''
}

/** The text between the brackets of the first Result in a type, arrows set aside. */
const resultArguments = (returnType: string): string => {
  const [, afterResult = ''] = returnType.replaceAll('=>', '->').split(/\bResult</, 2)
  const closing = closingBracketIndex(afterResult)
  return afterResult.slice(0, closing)
}

const closingBracketIndex = (text: string): number =>
  R.pipe(
    [...text],
    R.reduce(
      ({ depth, closing }, character, index) => {
        const next = depth + nesting(character)
        return { depth: next, closing: closing < 0 && next < 0 ? index : closing }
      },
      { depth: 0, closing: -1 },
    ),
    ({ closing }) => (closing < 0 ? text.length : closing),
  )

const isNamedError = (error: string): boolean => /^[A-Z]\w{2,}/.test(error)

const splitTypeArguments = (text: string): readonly string[] =>
  R.pipe(
    [...text],
    R.reduce(
      ({ depth, parts }, character) => {
        const next = depth + nesting(character)
        const isSplit = character === ',' && depth === 0
        return {
          depth: next,
          parts: isSplit ? R.concat(parts, ['']) : appendToLast(parts, character),
        }
      },
      { depth: 0, parts: [''] as readonly string[] },
    ),
    ({ parts }) => R.map(parts, (part) => part.trim()),
  )

const nesting = (character: string): number => {
  if ('<([{'.includes(character)) return 1
  return '>)]}'.includes(character) ? -1 : 0
}

const appendToLast = (parts: readonly string[], character: string): readonly string[] =>
  R.concat(R.dropLast(parts, 1), [`${R.last(parts) ?? ''}${character}`])

/** Names each signature for the reader: data-first and data-last when that is what they are. */
export const signatureTitles = (returnsFunction: readonly boolean[]): readonly string[] => {
  if (returnsFunction.length === 1) return ['Signature']
  const isDataFirstPair = returnsFunction.length === 2 && returnsFunction[0] !== returnsFunction[1]
  if (isDataFirstPair) return R.map(returnsFunction, (late) => (late ? 'Data-last' : 'Data-first'))
  return R.map(returnsFunction, (_, index) => `Overload ${index + 1}`)
}

const codeBlock = (code: string, title: string): string => `\`\`\`ts title="${title}"\n${code}\n\`\`\``

const failureLine = ({ returnTypes }: ExportDoc): string => {
  const failures = R.pipe(returnTypes, R.map(failureType), R.filter(Boolean), R.unique())
  return failures.length > 0
    ? `**Fails with** ${R.join(R.map(failures, (failure) => `\`${failure}\``), ', ')}.`
    : ''
}

const seeAlsoLine = ({ seeAlso }: ExportDoc): string =>
  seeAlso.length > 0 ? `**See also** ${R.join(seeAlso, ', ')}.` : ''

const signatureBlocks = ({ signatures, returnsFunction }: ExportDoc): readonly string[] =>
  R.map(R.zip(signatures, signatureTitles(returnsFunction)), ([code, title]) =>
    codeBlock(code, title),
  )

const exampleBlocks = ({ examples }: ExportDoc): readonly string[] =>
  R.pipe(
    examples,
    R.flatMap(exampleCode),
    R.map((code) => codeBlock(code, 'Example')),
  )

/** One export as a section of its module's page. */
export const exportSection = (doc: ExportDoc): string =>
  R.pipe(
    [
      `### ${doc.name}`,
      proseToMdx(doc.summary),
      ...signatureBlocks(doc),
      failureLine(doc),
      ...exampleBlocks(doc),
      seeAlsoLine(doc),
    ],
    R.filter(Boolean),
    R.join('\n\n'),
  )
